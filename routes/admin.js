const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// ── LOGIN ──
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const rows = await db.execute(
      'SELECT * FROM admins WHERE username = $1',
      [username]
    );

    if (!rows.length) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }

    const admin = rows[0];

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }

    req.session.user = {
      id: admin.id,
      username: admin.username
    };

    res.json({ success: true });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ success: false });
  }
});

// ── CHECK ──
router.get('/check', (req, res) => {
  if (req.session.user) {
    return res.json({
      success: true,
      username: req.session.user.username
    });
  }

  res.json({ success: false });
});

// ── LOGOUT ──
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

module.exports = router;