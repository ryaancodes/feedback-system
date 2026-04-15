require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 DEBUG (check env loading)
console.log("DB HOST:", process.env.DB_HOST);
console.log("DB NAME:", process.env.DB_NAME);

// ── Middleware ─────────────────────────────
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session ────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true
  }
}));

// ── Static Files ───────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ─────────────────────────────
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// 🔥 TEST ROUTE (check DB connection manually)
app.get('/test-db', async (req, res) => {
  try {
    const db = require('./config/db');
    const [rows] = await db.execute('SELECT 1');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

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
  console.log(`🧪 Test DB   → http://localhost:${PORT}/test-db`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});