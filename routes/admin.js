const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const bcrypt  = require('bcrypt');

// ── LOGIN ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Both fields are required.'
    });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, username, password FROM admins WHERE username = $1',
      [username.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const admin = rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    req.session.admin = {
      id: admin.id,
      username: admin.username
    };

    return res.json({
      success: true,
      username: admin.username
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
});


// ── LOGOUT ────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed.'
      });
    }

    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});


// ── SESSION CHECK ─────────────────────────────────
router.get('/check', (req, res) => {
  if (req.session && req.session.admin) {
    return res.json({
      success: true,
      username: req.session.admin.username
    });
  }

  return res.status(401).json({ success: false });
});

module.exports = router;