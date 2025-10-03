/* simple-server.cjs : CJS export for tests and supertest */
const express = require('express');
const cors = require('cors');

const {
  state, counters, tasks, content, classify,
} = require('./src/autopilot-core.js');

const app = express();
app.set('trust proxy', 1);

const allowOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowOrigin, credentials: true }));

app.use(express.json({ limit: '1mb' }));

// ---------- Health & Readiness ----------
app.get('/api/healthz', (_req, res) => {
  res.json({
    status: 'ok',
    services: {
      api: true,
      db: true,
      storage: true,
    }
  });
});

app.get('/api/readiness', (_req, res) => {
  const checks = [
    { name: 'api', ok: true },
    { name: 'storage', ok: true },
    { name: 'affiliate_conversions', ok: true },
  ];
  const overall = checks.reduce((acc, c) => acc + (c.ok ? 1 : 0), 0) / checks.length * 100;
  res.json({ overall, checks });
});

// ---------- Metrics (includes KPI + Autopilot) ----------
const serverStart = Date.now();
app.get('/api/metrics', (_req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStart) / 1000);
  const counts = {
    affiliates: state.counters.affiliates || 0,
    directoryApproved: state.counters.directoryApproved || 0,
    directoryPending: state.counters.directoryPending || 0,
    socialPosts: state.counters.socialPosts || 0,
    payments: state.counters.payments || 0,
  };
  const apStats = tasks.stats();
  res.json({
    status: 'ok',
    uptimeSeconds,
    counts,
    autopilot: { total: apStats.total, byStatus: apStats.byStatus }
  });
});

// ---------- Autopilot: config/status/tasks/content ----------
app.get('/api/autopilot/config', (_req, res) => {
  res.json({
    enabledTaskTypes: ['metrics_snapshot','content_index','readiness_check','lead_sweep'],
    queue: 'local',
    fast: String(process.env.FAST_MODE || 'false'),
  });
});

app.get('/api/autopilot/status', (_req, res) => {
  res.json({
    tasks: tasks.list(),
    counters: counters.getAll(),
    createdAt: state.createdAt,
    updatedAt: state.updatedAt
  });
});

app.get('/api/autopilot/tasks', (_req, res) => {
  res.json({ tasks: tasks.list() });
});

app.post('/api/autopilot/tasks', (req, res) => {
  const { type = 'metrics_snapshot', reason = 'manual enqueue', payload = {} } = req.body || {};
  const task = tasks.enqueue({ type, reason, ...payload });
  res.status(201).json({ task });
});

app.delete('/api/autopilot/tasks/:id', (req, res) => {
  const ok = tasks.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'not_found' });
  res.json({ removed: true });
});

app.get('/api/autopilot/content/index', (_req, res) => {
  res.json({ files: content.list() });
});

app.get('/api/autopilot/content/search', (req, res) => {
  const q = req.query.q || '';
  res.json({ matches: content.search(q) });
});

// ---------- Ask: FAQ / autopilot triggers ----------
app.post('/api/ask', (req, res) => {
  const question = (req.body && req.body.question) || '';
  const topic = classify(question);

  if (topic === 'autopilot') {
    tasks.enqueue({ type: 'metrics_snapshot', reason: 'user ask triggered autopilot' });
  }

  let answer = '';
  switch (topic) {
    case 'pricing':
      answer = 'We offer Starter, Growth, and Impact plans; workforce paths include WIOA/WRG/VR coverage.';
      break;
    case 'introspection':
      answer = 'Key routes: /api/metrics, /api/readiness, /api/autopilot/*, /api/ask, /api/catalog, /api/marketing/*';
      break;
    case 'metrics':
      answer = 'Metrics include uptimeSeconds, counts{affiliates,directory,posts,payments}, and autopilot totals.';
      break;
    case 'workforce':
      answer = 'We support WIOA, WRG, DOL apprenticeship, and Indiana VR vendor flows.';
      break;
    case 'autopilot':
      answer = 'Autopilot can enqueue metrics snapshots and content indexing; see /api/autopilot/tasks.';
      break;
    default:
      answer = 'I did not find a specific match; try asking about pricing, metrics, routes, or autopilot.';
  }

  res.json({ topic, answer });
});

// ---------- Minimal stubs for other suites ----------
app.get('/api/branding', (_req, res) => {
  res.json({
    logo: { light: '/assets/logo-light.svg', dark: '/assets/logo-dark.svg' },
    palette: { primary: '#4f46e5' },
  });
});

app.get('/api/integration-guide', (_req, res) => {
  res.json({
    title: 'Elevate for Humanity Brain Integration',
    integration: {
      step1: { title: 'Include Brain Widget', code: '<script src="/api/widgets/integration.js"></script>' },
      step2: { title: 'Add Containers', examples: ['#efh-brain','[data-efh]','#efh-chat','#efh-faq','#efh-search'] },
    }
  });
});

app.get('/api/widgets/integration.js', (_req, res) => {
  res.type('application/javascript');
  res.send(`window.ElevateForHumanityBrain = { mount: (sel)=>console.log('mounting EFH Brain to', sel) };`);
});

app.get('/api/catalog', (_req, res) => res.json({ items: [{ id:'barbering', title:'Barbering 101'}] }));
app.get('/api/marketing/banners', (_req, res) => res.json({ banners: [] }));
app.post('/api/marketing/lead', (_req, res) => { counters.inc('leads',1); res.json({ stored: true }); });
app.get('/api/pricing', (_req, res) => res.json({ plans: ['Starter','Growth','Impact'] }));
app.get('/api/legal', (_req, res) => res.json({ documents: [] }));
app.get('/api/workbooks', (_req, res) => res.json({ workbooks: [] }));

// Protected (API key) example
function apiKeyGuard(req, res, next) {
  const key = req.header('x-api-key');
  if (!key || key !== (process.env.ADMIN_SECRET || 'test-admin')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}
app.get('/api/protected/financial/revenue', apiKeyGuard, (_req, res) => {
  const revenue = (state.counters.payments || 0) * 100;
  res.json({ revenue, currency: 'USD' });
});
app.get('/api/protected/audit/logs', apiKeyGuard, (_req, res) => {
  res.json({ events: tasks.list().slice(-10) });
});

module.exports = app;
