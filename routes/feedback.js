const express = require('express');
const router = express.Router();
const db = require('../config/db');


// ── POST ──
router.post('/', async (req, res) => {
  const { name, email, rating, comments } = req.body;

  try {
    const result = await db.execute(
      `INSERT INTO feedback (name, email, rating, comments)
       VALUES (?, ?, ?, ?)`,
      [name, email, rating, comments]
    );

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ── GET ──
router.get('/', async (req, res) => {
  try {
    const { search, rating, sort } = req.query;

    let query = `SELECT * FROM feedback`;
    let conditions = [];
    let values = [];

    if (search) {
      conditions.push(`(LOWER(name) LIKE ? OR LOWER(email) LIKE ?)`);
      values.push(`%${search}%`, `%${search}%`);
    }

    if (rating) {
      conditions.push(`rating = ?`);
      values.push(rating);
    }

    if (conditions.length) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    switch (sort) {
      case 'oldest':
        query += ` ORDER BY submitted_at ASC`;
        break;
      case 'highest':
        query += ` ORDER BY rating DESC`;
        break;
      case 'lowest':
        query += ` ORDER BY rating ASC`;
        break;
      default:
        query += ` ORDER BY submitted_at DESC`;
    }

    const rows = await db.execute(query, values);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ── ANALYTICS ──
router.get('/analytics', async (req, res) => {
  try {
    const stats = await db.execute(`
      SELECT
        COUNT(*) AS total_feedback,
        ROUND(AVG(rating), 2) AS average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star
      FROM feedback
    `);

    res.json({
      success: true,
      data: { stats: stats[0] }
    });

  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ── DELETE ──
router.delete('/:id', async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM feedback WHERE id = ?',
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;