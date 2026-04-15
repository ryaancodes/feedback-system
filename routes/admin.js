const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const rows = await db.execute(
      'SELECT * FROM admins WHERE username = $1',
      [username]
    );

    const user = rows[0]; // ✅ IMPORTANT

    if (!user) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.id,
      username: user.username
    };

    res.json({ success: true });

  } catch (err) {
    console.error('LOGIN ERROR:', err); // 🔥 WILL SHOW IN LOGS
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CHECK LOGIN
router.get('/check', (req, res) => {
  if (req.session.user) {
    return res.json({
      success: true,
      username: req.session.user.username
    });
  }
  res.json({ success: false });
});

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

module.exports = router;