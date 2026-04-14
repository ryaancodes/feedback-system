require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────
app.use(cors({
  origin: true,              // 🔥 allow same origin
  credentials: true          // 🔥 allow cookies/session
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session (MOVE ABOVE ROUTES) ────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,           // true only for HTTPS
    httpOnly: true,
  }
}));

// ── Static Files ───────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ─────────────────────────────
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// ── Page Routes ────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'admin-login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'dashboard.html'));
});

// ── 404 ────────────────────────────────────
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ── Start Server ───────────────────────────
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Home      → http://localhost:${PORT}/`);
  console.log(`🔐 Admin     → http://localhost:${PORT}/admin`);
  console.log(`📊 Dashboard → http://localhost:${PORT}/dashboard`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});