const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');

const agent = new https.Agent({ keepAlive: true });

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.static(path.join(__dirname, '../client/dist')));

/* ───────────── DB ───────────── */

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.warn('[DB] No MONGODB_URI — auth disabled'); return; }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 });
    console.log('[DB] Connected:', mongoose.connection.host);
  } catch (e) {
    console.warn('[DB] Connection failed — auth features disabled:', e.message);
  }
}

/* ───────────── MODELS ───────────── */

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'] },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  bookmarks: [{ type: mongoose.Schema.ObjectId, ref: 'PublicRoadmap' }],
  createdAt: { type: Date, default: Date.now }
});
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.matchPassword = function (pw) { return bcrypt.compare(pw, this.password); };
const User = mongoose.model('User', userSchema);

const ResourceSchema = new mongoose.Schema({
  type: { type: String, enum: ['Article', 'Video', 'Watch', 'Read', 'Official'] },
  title: { type: String },
  url: { type: String }
}, { _id: false });

const StepSchema = new mongoose.Schema({
  stepId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  resources: [ResourceSchema],
  order: { type: Number }
}, { _id: false });

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  nodeType: { type: String, enum: ['topic', 'step', 'resource', 'decision', 'start', 'end'], required: true },
  label: { type: String, required: true },
  stepId: { type: String, default: null },
  position: { x: Number, y: Number },
  width: Number,
  height: Number
}, { _id: false });

const EdgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  style: { type: String, default: 'bezier' }
}, { _id: false });

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  goal: { type: String, enum: ['web-development', 'data-science-ai', 'automation-scripting', 'software-engineering', 'game-development'], required: true },
  visibility: { type: String, enum: ['public', 'private'], default: 'private' },
  category: { type: String, enum: ['role', 'skill', ''], default: '' },
  title: String,
  steps: [StepSchema],
  graph: { nodes: [NodeSchema], edges: [EdgeSchema], default: { nodes: [], edges: [] } },
  createdAt: { type: Date, default: Date.now }
});
const Roadmap = mongoose.model('Roadmap', roadmapSchema);

const publicRoadmapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  category: { type: String, enum: ['role', 'skill'], required: true },
  description: { type: String, default: '' },
  steps: [StepSchema],
  graph: { nodes: [NodeSchema], edges: [EdgeSchema], default: { nodes: [], edges: [] } },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const PublicRoadmap = mongoose.model('PublicRoadmap', publicRoadmapSchema);

/* ───────────── MIDDLEWARE ───────────── */

function protect(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, error: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    User.findById(decoded.id).then(user => {
      if (!user) return res.status(401).json({ success: false, error: 'User not found' });
      req.user = user;
      next();
    });
  } catch { return res.status(401).json({ success: false, error: 'Not authorized' }); }
}

function sendToken(user, statusCode, res) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRE || '30d' });
  res.status(statusCode).json({ success: true, token });
}

/* ───────────── AUTH ROUTES ───────────── */

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    if (!(await user.matchPassword(password))) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    sendToken(user, 200, res);
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

app.get('/api/auth/me', protect, async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

/* ───────────── GEMINI SERVICE ───────────── */

const GOAL_LABELS = {
  'web-development': 'Web Development',
  'data-science-ai': 'Data Science & AI',
  'automation-scripting': 'Automation & Scripting',
  'software-engineering': 'Software Engineering',
  'game-development': 'Game Development'
};

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash'];

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY missing in .env');

  let lastErr;
  for (const model of GEMINI_MODELS) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 60000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        { method: 'POST', signal: ctrl.signal, agent,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      );
      clearTimeout(to);
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        let detail = '';
        try { const j = JSON.parse(body); detail = j.error?.message || ''; } catch {}
        lastErr = `Gemini ${model} failed (${res.status}): ${detail || res.statusText}`;
        continue;
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) { lastErr = 'Empty response'; continue; }
      return JSON.parse(text.replace(/```json?/gi, '').replace(/```/g, '').trim());
    } catch (e) { lastErr = e.message; }
  }
  throw new Error(lastErr || 'Gemini request failed');
}

async function generateRoadmap(topic, goalName) {
  const prompt = [
    'Create a beginner-friendly learning roadmap for: ' + topic,
    'Learner goal: ' + goalName,
    'Return ONLY valid JSON (no markdown):',
    '{"title":"string","steps":[{"title":"string","description":"string","resources":["string"]}]}',
    'Use 6-8 steps. Keep descriptions short and practical.'
  ].join('\n');
  return callGemini(prompt);
}

/* ───────────── ROADMAP ROUTES ───────────── */

app.post('/api/roadmap/generate', protect, async (req, res) => {
  try {
    const { topic, goal, visibility, category } = req.body;
    if (!topic || !goal) return res.status(400).json({ success: false, error: 'Topic and goal required' });
    const goalName = GOAL_LABELS[goal] || goal;
    const roadmapData = await generateRoadmap(topic, goalName);
    const saved = await Roadmap.create({
      user: req.user.id, topic, goal, visibility: visibility || 'private',
      category: category || '', title: roadmapData.title, steps: roadmapData.steps
    });
    res.status(201).json({ success: true, data: { ...roadmapData, _id: saved._id, visibility: saved.visibility } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/roadmap/my', protect, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.user.id }).select('topic goal visibility category title createdAt').sort('-createdAt');
    res.json({ success: true, data: roadmaps });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/roadmap/share/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id).populate('user', 'name');
    if (!roadmap) return res.status(404).json({ success: false, error: 'Not found' });
    if (roadmap.visibility === 'private' && (!req.headers.authorization || roadmap.user._id.toString() !== '')) {
      return res.status(403).json({ success: false, error: 'Private roadmap' });
    }
    res.json({ success: true, data: roadmap });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/roadmap/public', async (req, res) => {
  try {
    const all = await PublicRoadmap.find().sort('-createdAt');
    res.json({ success: true, data: { role: all.filter(r => r.category === 'role'), skill: all.filter(r => r.category === 'skill') } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/roadmap/view/:id', async (req, res) => {
  try {
    let r = await PublicRoadmap.findById(req.params.id);
    if (!r) r = await Roadmap.findById(req.params.id).populate('user', 'name');
    if (!r) return res.status(404).json({ success: false, error: 'Not found' });
    const type = r.constructor.modelName === 'PublicRoadmap' ? 'public' : 'personal';
    res.json({ success: true, data: { ...r.toObject(), _type: type } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/roadmap/save/:id', protect, async (req, res) => {
  try {
    const pr = await PublicRoadmap.findById(req.params.id);
    if (!pr) return res.status(404).json({ success: false, error: 'Not found' });
    const exists = await Roadmap.findOne({ user: req.user.id, title: pr.title, topic: pr.topic });
    if (exists) return res.status(400).json({ success: false, error: 'Already saved' });
    const graph = pr.graph || { nodes: [], edges: [] };
    const saved = await Roadmap.create({
      user: req.user.id, topic: pr.topic, goal: 'software-engineering',
      visibility: 'private', category: pr.category || '', title: pr.title, steps: pr.steps, graph
    });
    res.status(201).json({ success: true, data: saved });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/roadmap/bookmark/:id', protect, async (req, res) => {
  try {
    const pr = await PublicRoadmap.findById(req.params.id);
    if (!pr) return res.status(404).json({ success: false, error: 'Not found' });
    const user = await User.findById(req.user.id);
    const idx = user.bookmarks.indexOf(pr._id);
    if (idx > -1) { user.bookmarks.splice(idx, 1); await user.save(); return res.json({ success: true, bookmarked: false }); }
    else { user.bookmarks.push(pr._id); await user.save(); return res.json({ success: true, bookmarked: true }); }
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/roadmap/bookmarked', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarks');
    res.json({ success: true, data: user.bookmarks || [] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

/* ───────────── HEALTH ───────────── */

app.get('/api/health', (req, res) => res.json({ success: true, message: 'OK' }));

/* ───────────── START ───────────── */

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));
}
start();
