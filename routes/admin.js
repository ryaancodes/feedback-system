const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// ── LOGIN ──
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const rows = await db.execute(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: 'User not found' });
    }

    const admin = rows[0];

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.json({ success: false, message: 'Wrong password' });
    }

    req.session.admin = {
      id: admin.id,
      username: admin.username
    };

    res.json({ success: true });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── CHECK SESSION ──
router.get('/check', (req, res) => {
  if (req.session.admin) {
    return res.json({ success: true, user: req.session.admin });
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