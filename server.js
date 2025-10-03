const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const users = new Map();
const sessions = new Map();

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      role: role || 'student',
      createdAt: new Date()
    };

    users.set(email, user);
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.get(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = users.get(req.user.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

// Email API
app.get('/api/email/inbox', authenticate, (req, res) => {
  res.json({ emails: [], total: 0 });
});

app.post('/api/email/send', authenticate, (req, res) => {
  const { to, subject, body } = req.body;
  res.json({ success: true, messageId: `msg_${Date.now()}` });
});

// Calendar API
app.get('/api/calendar/events', authenticate, (req, res) => {
  res.json({ events: [] });
});

app.post('/api/calendar/events', authenticate, (req, res) => {
  const event = { id: `event_${Date.now()}`, ...req.body };
  res.json(event);
});

// File Storage API
app.get('/api/files', authenticate, (req, res) => {
  res.json({ files: [], folders: [] });
});

app.post('/api/files/upload', authenticate, (req, res) => {
  res.json({ success: true, fileId: `file_${Date.now()}` });
});

// LMS API
app.get('/api/lms/courses', authenticate, (req, res) => {
  res.json({ courses: [] });
});

app.post('/api/lms/courses', authenticate, (req, res) => {
  const course = { id: `course_${Date.now()}`, ...req.body };
  res.json(course);
});

// AI Tutor API
app.post('/api/ai-tutor/chat', authenticate, async (req, res) => {
  const { message, conversationId } = req.body;
  
  setTimeout(() => {
    res.json({
      response: `AI response to: ${message}`,
      conversationId: conversationId || `conv_${Date.now()}`
    });
  }, 1000);
});

app.post('/api/ai-tutor/grade-essay', authenticate, async (req, res) => {
  const { essay, rubric } = req.body;
  
  setTimeout(() => {
    res.json({
      grade: 'A',
      score: 95,
      feedback: 'Excellent work! Strong thesis and well-supported arguments.',
      suggestions: ['Consider adding more examples', 'Check citation format']
    });
  }, 1500);
});

// NotebookLM API
app.post('/api/notebook-lm/notebooks', authenticate, (req, res) => {
  const notebook = { id: `nb_${Date.now()}`, ...req.body };
  res.json(notebook);
});

app.post('/api/notebook-lm/sources', authenticate, (req, res) => {
  const source = { id: `src_${Date.now()}`, ...req.body };
  res.json(source);
});

app.post('/api/notebook-lm/ask', authenticate, (req, res) => {
  const { notebookId, question } = req.body;
  res.json({
    answer: `Answer to: ${question}`,
    sources: []
  });
});

// Admin API
app.get('/api/admin/stats', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  res.json({
    totalUsers: users.size,
    activeUsers: users.size,
    storage: 2.4,
    revenue: 15420
  });
});

app.get('/api/admin/users', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const userList = Array.from(users.values()).map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt
  }));
  
  res.json({ users: userList });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
