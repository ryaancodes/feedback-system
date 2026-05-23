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
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session ──
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true
  }
}));

// ── Static Files ──
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// ── AUTH MIDDLEWARE ──
const requireAuth = (req, res, next) => {
  if (!req.session.admin) {
    return res.redirect('/admin');
  }
  next();
};

// ── INIT DB ──
(async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        rating INT,
        comments TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password TEXT
      )
    `);

    console.log('✅ Tables ready');

    const hashed = await bcrypt.hash('feedback6969', 10);

    await db.execute(
      `INSERT INTO admins (username, password)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      ['admin', hashed]
    );

    console.log('✅ Admin ready: admin / feedback6969');

  } catch (err) {
    console.error('❌ INIT ERROR:', err);
  }
})();

// ── TEST ROUTE ──
app.get('/test-db', async (req, res) => {
  try {
    const rows = await db.execute('SELECT 1');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Page Routes ──
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'admin-login.html'));
});

// 🔥 PROTECTED ROUTE
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'dashboard.html'));
});

// ── 404 ──
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});