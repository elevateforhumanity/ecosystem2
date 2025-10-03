/* simple-server.cjs : CJS export for tests and supertest */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const xss = require('xss-clean');
const useragent = require('express-useragent');
const fs = require('fs');
const path = require('path');

const {
  state, counters, tasks, content, classify,
} = require('./src/autopilot-core.js');

const { validate, schemas } = require('./middleware/validation.cjs');
const duplicationScanner = require('./services/duplication-scanner.cjs');
const contentProtection = require('./services/content-protection.cjs');
const autopilotOrchestrator = require('./services/autopilot-orchestrator.cjs');
const intelligentScheduler = require('./services/intelligent-scheduler.cjs');

// Security audit logger
const AUDIT_PATH = path.join(__dirname, '.data/security/audit.json');
function ensureAuditDir() {
  const dir = path.dirname(AUDIT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
function logSecurityEvent(event, meta = {}) {
  ensureAuditDir();
  const entry = { ts: Date.now(), event, meta };
  fs.appendFileSync(AUDIT_PATH, JSON.stringify(entry) + '\n', 'utf8');
}

const app = express();
app.set('trust proxy', 1);

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// XSS protection
app.use(xss());

// User agent parsing
app.use(useragent.express());

// CORS with whitelist
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'https://elevateforhumanity.org'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Slow down aggressive clients
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per window at full speed
  delayMs: () => 500, // add 500ms delay per request after delayAfter
  validate: { delayMs: false }
});

app.use('/api/', speedLimiter);

// Bot/Scraper detection and blocking
app.use((req, res, next) => {
  // Skip health checks
  if (req.path === '/api/healthz' || req.path === '/api/readiness') {
    return next();
  }

  // Block known bots and scrapers
  if (req.useragent.isBot) {
    logSecurityEvent('SCRAPER_BLOCK', {
      ua: req.headers['user-agent'],
      ip: req.ip,
      path: req.path
    });
    return res.status(403).json({ error: 'Bot/Scraper access denied' });
  }

  // Block requests with no user agent
  if (!req.headers['user-agent']) {
    logSecurityEvent('NO_UA_BLOCK', {
      ip: req.ip,
      path: req.path
    });
    return res.status(403).json({ error: 'User agent required' });
  }

  next();
});

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

app.post('/api/autopilot/tasks', validate(schemas.createTask), (req, res) => {
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

app.get('/api/autopilot/content/search', validate(schemas.search), (req, res) => {
  const q = req.query.q || '';
  res.json({ matches: content.search(q) });
});

// ---------- Ask: FAQ / autopilot triggers ----------
app.post('/api/ask', validate(schemas.ask), (req, res) => {
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
app.post('/api/marketing/lead', validate(schemas.lead), (req, res) => { 
  logSecurityEvent('LEAD_SUBMISSION', { email: req.body.email, source: req.body.source });
  counters.inc('leads',1); 
  res.json({ stored: true }); 
});
app.get('/api/pricing', (_req, res) => res.json({ plans: ['Starter','Growth','Impact'] }));
app.get('/api/legal', (_req, res) => res.json({ documents: [] }));
app.get('/api/workbooks', (_req, res) => res.json({ workbooks: [] }));

// Protected (API key) example
function apiKeyGuard(req, res, next) {
  const key = req.header('x-api-key');
  if (!key || key !== (process.env.ADMIN_SECRET || 'test-admin')) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: req.ip,
      path: req.path
    });
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

// ---------- Security Endpoints ----------
app.get('/api/security/status', (_req, res) => {
  res.json({
    ok: true,
    protections: [
      'helmet',
      'cors-whitelist',
      'rate-limit',
      'slow-down',
      'xss-clean',
      'bot-detection',
      'input-validation'
    ],
    timestamp: Date.now()
  });
});

app.get('/api/security/audit', apiKeyGuard, (_req, res) => {
  try {
    ensureAuditDir();
    if (!fs.existsSync(AUDIT_PATH)) {
      return res.json({ entries: [] });
    }
    const lines = fs.readFileSync(AUDIT_PATH, 'utf8').trim().split('\n').filter(l => l);
    const entries = lines.slice(-100).map(l => JSON.parse(l));
    res.json({ entries, total: lines.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read audit log', message: err.message });
  }
});

app.get('/api/security/compliance', (_req, res) => {
  res.json({
    copyright: '© Elevate for Humanity / Selfish Inc. DBA Rise Forward Foundation',
    compliance: ['WIOA', 'WRG', 'DOE', 'DOL', 'FERPA', 'COPPA', 'GDPR', 'CCPA'],
    disclaimer: 'Unauthorized duplication, scraping, or redistribution is prohibited under federal and state law. Violators subject to prosecution.',
    license: 'Commercial License - See COMMERCIAL_LICENSE.md',
    contact: 'legal@elevateforhumanity.org'
  });
});

// Kill switch endpoint (emergency shutdown)
app.post('/api/security/shutdown', apiKeyGuard, (req, res) => {
  logSecurityEvent('SYSTEM_SHUTDOWN', {
    ip: req.ip,
    reason: req.body.reason || 'manual'
  });
  res.json({ ok: true, message: 'Kill switch activated - shutting down' });
  setTimeout(() => process.exit(0), 1000);
});

// ---------- Content Protection & Duplication Scanner ----------

// Scan content for duplicates
app.post('/api/security/scan/content', apiKeyGuard, async (req, res) => {
  try {
    const { content, searchEngines = ['duckduckgo'], maxPhrases = 3 } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length < 100) {
      return res.status(400).json({ error: 'Content must be at least 100 characters' });
    }

    logSecurityEvent('DUPLICATION_SCAN', {
      ip: req.ip,
      contentLength: content.length,
      searchEngines
    });

    const result = await duplicationScanner.scanContent(content, {
      searchEngines,
      maxPhrases,
      saveHistory: true
    });

    res.json({
      ok: true,
      scan: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Scan failed',
      message: error.message
    });
  }
});

// Get scan history
app.get('/api/security/scan/history', apiKeyGuard, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = duplicationScanner.getScanHistory(limit);
    
    res.json({
      ok: true,
      history,
      total: history.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get scan history',
      message: error.message
    });
  }
});

// Compare two content pieces
app.post('/api/security/scan/compare', apiKeyGuard, (req, res) => {
  try {
    const { content1, content2 } = req.body;

    if (!content1 || !content2) {
      return res.status(400).json({ error: 'Both content1 and content2 are required' });
    }

    const comparison = duplicationScanner.compareContent(content1, content2);

    logSecurityEvent('CONTENT_COMPARISON', {
      ip: req.ip,
      similarity: comparison.similarity,
      verdict: comparison.verdict
    });

    res.json({
      ok: true,
      comparison
    });
  } catch (error) {
    res.status(500).json({
      error: 'Comparison failed',
      message: error.message
    });
  }
});

// Scan local directory for duplicates
app.post('/api/security/scan/directory', apiKeyGuard, (req, res) => {
  try {
    const { path: dirPath } = req.body;

    if (!dirPath) {
      return res.status(400).json({ error: 'Directory path is required' });
    }

    const duplicates = duplicationScanner.scanLocalDirectory(dirPath);

    logSecurityEvent('DIRECTORY_SCAN', {
      ip: req.ip,
      path: dirPath,
      duplicatesFound: duplicates.length
    });

    res.json({
      ok: true,
      duplicates,
      count: duplicates.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Directory scan failed',
      message: error.message
    });
  }
});

// Watermark content
app.post('/api/security/protect/watermark', apiKeyGuard, (req, res) => {
  try {
    const { content, metadata = {} } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = contentProtection.watermarkContent(content, metadata);

    logSecurityEvent('CONTENT_WATERMARKED', {
      ip: req.ip,
      contentId: result.contentId,
      owner: metadata.owner
    });

    res.json({
      ok: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Watermarking failed',
      message: error.message
    });
  }
});

// Verify watermark
app.post('/api/security/protect/verify', apiKeyGuard, (req, res) => {
  try {
    const { content, signature } = req.body;

    if (!content || !signature) {
      return res.status(400).json({ error: 'Content and signature are required' });
    }

    const verification = contentProtection.verifyWatermark(content, signature);

    logSecurityEvent('WATERMARK_VERIFICATION', {
      ip: req.ip,
      valid: verification.valid,
      contentId: verification.contentId
    });

    res.json({
      ok: true,
      verification
    });
  } catch (error) {
    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

// Check content protection status
app.post('/api/security/protect/check', apiKeyGuard, (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const check = contentProtection.checkContent(content);

    res.json({
      ok: true,
      check
    });
  } catch (error) {
    res.status(500).json({
      error: 'Check failed',
      message: error.message
    });
  }
});

// Get content protection registry
app.get('/api/security/protect/registry', apiKeyGuard, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const registry = contentProtection.getAllRegisteredContent(limit);
    
    res.json({
      ok: true,
      registry,
      total: registry.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get registry',
      message: error.message
    });
  }
});

// Get content protection report
app.get('/api/security/protect/report', apiKeyGuard, (req, res) => {
  try {
    const report = contentProtection.generateReport();
    
    res.json({
      ok: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate report',
      message: error.message
    });
  }
});

// ---------- Advanced Autopilot Endpoints ----------

// Get autopilot status
app.get('/api/autopilot/advanced/status', apiKeyGuard, (req, res) => {
  try {
    const status = autopilotOrchestrator.getStatus();
    res.json({
      ok: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get status',
      message: error.message
    });
  }
});

// Start autopilot
app.post('/api/autopilot/advanced/start', apiKeyGuard, async (req, res) => {
  try {
    const { interval = 60000 } = req.body;
    
    await autopilotOrchestrator.start({ interval });
    
    logSecurityEvent('AUTOPILOT_STARTED', {
      ip: req.ip,
      interval
    });
    
    res.json({
      ok: true,
      message: 'Autopilot started',
      status: autopilotOrchestrator.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to start autopilot',
      message: error.message
    });
  }
});

// Stop autopilot
app.post('/api/autopilot/advanced/stop', apiKeyGuard, (req, res) => {
  try {
    autopilotOrchestrator.stop();
    
    logSecurityEvent('AUTOPILOT_STOPPED', {
      ip: req.ip
    });
    
    res.json({
      ok: true,
      message: 'Autopilot stopped',
      status: autopilotOrchestrator.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to stop autopilot',
      message: error.message
    });
  }
});

// Schedule task
app.post('/api/autopilot/advanced/schedule', apiKeyGuard, (req, res) => {
  try {
    const { type, payload = {}, options = {} } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Task type is required' });
    }
    
    const task = autopilotOrchestrator.scheduleTask(type, payload, options);
    
    logSecurityEvent('TASK_SCHEDULED', {
      ip: req.ip,
      taskType: type,
      taskId: task.id
    });
    
    res.json({
      ok: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to schedule task',
      message: error.message
    });
  }
});

// Get tasks
app.get('/api/autopilot/advanced/tasks', apiKeyGuard, (req, res) => {
  try {
    const { status, type, limit } = req.query;
    
    const tasks = autopilotOrchestrator.getTasks({
      status,
      type,
      limit: limit ? parseInt(limit) : undefined
    });
    
    res.json({
      ok: true,
      tasks,
      total: tasks.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get tasks',
      message: error.message
    });
  }
});

// Get task by ID
app.get('/api/autopilot/advanced/tasks/:taskId', apiKeyGuard, (req, res) => {
  try {
    const task = autopilotOrchestrator.getTask(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({
      ok: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get task',
      message: error.message
    });
  }
});

// Cancel task
app.delete('/api/autopilot/advanced/tasks/:taskId', apiKeyGuard, (req, res) => {
  try {
    const cancelled = autopilotOrchestrator.cancelTask(req.params.taskId);
    
    if (!cancelled) {
      return res.status(400).json({ error: 'Cannot cancel task' });
    }
    
    logSecurityEvent('TASK_CANCELLED', {
      ip: req.ip,
      taskId: req.params.taskId
    });
    
    res.json({
      ok: true,
      message: 'Task cancelled'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to cancel task',
      message: error.message
    });
  }
});

// Get scheduler statistics
app.get('/api/autopilot/advanced/scheduler/stats', apiKeyGuard, (req, res) => {
  try {
    const stats = intelligentScheduler.getStatistics();
    
    res.json({
      ok: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get scheduler stats',
      message: error.message
    });
  }
});

// Analyze patterns
app.get('/api/autopilot/advanced/scheduler/analysis', apiKeyGuard, (req, res) => {
  try {
    const analysis = intelligentScheduler.analyzePatterns();
    
    res.json({
      ok: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to analyze patterns',
      message: error.message
    });
  }
});

// Get suggested schedule
app.post('/api/autopilot/advanced/scheduler/suggest', apiKeyGuard, (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }
    
    const schedule = intelligentScheduler.suggestSchedule(tasks);
    
    res.json({
      ok: true,
      schedule
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to suggest schedule',
      message: error.message
    });
  }
});

module.exports = app;
