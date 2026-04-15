require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

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

// 🔥 INIT DB (tables + admin fix)
(async () => {
  try {
    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        rating INTEGER,
        comments TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT
      );
    `);

    console.log('✅ Tables ready');

    // 🔥 FORCE FIX ADMIN PASSWORD (your actual password)
    const hashed = await bcrypt.hash('feedback6969', 10);

    await db.execute(
      `INSERT INTO admins (username, password)
       VALUES ($1, $2)
       ON CONFLICT (username)
       DO UPDATE SET password = EXCLUDED.password`,
      ['admin', hashed]
    );

    console.log('✅ Admin ready: admin / feedback6969');

  } catch (err) {
    console.error('❌ INIT ERROR:', err);
  }
})();

// 🔥 TEST ROUTE
app.get('/test-db', async (req, res) => {
  try {
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
  console.log('🚀 Server running');
  console.log('🌐 Live on Render');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});