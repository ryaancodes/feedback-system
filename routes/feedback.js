const express = require('express');
const router = express.Router();
const db = require('../config/db');


// ── POST: Add feedback ─────────────────────────
router.post('/', async (req, res) => {
  const { name, email, rating, comments } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO feedback (name, email, rating, comments) VALUES (?, ?, ?, ?)',
      [name, email, rating, comments]
    );

    res.json({
      success: true,
      id: result.insertId   // ✅ MySQL way
    });

  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({
      success: false,
      message: 'Insert failed'
    });
  }
});


// ── GET: Feedback with FILTER + SORT + SEARCH ─────────────────
router.get('/', async (req, res) => {
  try {
    const { search, rating, sort } = req.query;

    let sql = 'SELECT * FROM feedback WHERE 1=1';
    const params = [];

    // 🔍 SEARCH (MySQL uses LIKE)
    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // ⭐ FILTER
    if (rating) {
      sql += ' AND rating = ?';
      params.push(Number(rating));
    }

    // ⬇️ SORT
    if (sort === 'latest') {
      sql += ' ORDER BY submitted_at DESC';
    } else if (sort === 'oldest') {
      sql += ' ORDER BY submitted_at ASC';
    } else if (sort === 'highest') {
      sql += ' ORDER BY rating DESC';
    } else if (sort === 'lowest') {
      sql += ' ORDER BY rating ASC';
    } else {
      sql += ' ORDER BY id DESC';
    }

    const [rows] = await db.execute(sql, params);

    return res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error('GET error:', err);
    return res.status(500).json({
      success: false,
      message: 'Fetch failed'
    });
  }
});


// ── GET: Analytics ─────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const [statsRows] = await db.execute(`
      SELECT
        COUNT(*) AS total_feedback,
        ROUND(AVG(rating), 2) AS average_rating,
        SUM(rating = 5) AS five_star,
        SUM(rating = 4) AS four_star,
        SUM(rating = 3) AS three_star,
        SUM(rating = 2) AS two_star,
        SUM(rating = 1) AS one_star
      FROM feedback
    `);

    const stats = statsRows[0];

    const [trend] = await db.execute(`
      SELECT
        DATE(submitted_at) AS day,
        COUNT(*) AS count
      FROM feedback
      GROUP BY DATE(submitted_at)
      ORDER BY day ASC
      LIMIT 7
    `);

    return res.json({
      success: true,
      data: { stats, trend }
    });

  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({
      success: false,
      message: 'Analytics failed'
    });
  }
});


// ── DELETE ─────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM feedback WHERE id = ?',
      [req.params.id]
    );

    return res.json({ success: true });

  } catch (err) {
    console.error('DELETE error:', err);
    return res.status(500).json({
      success: false,
      message: 'Delete failed'
    });
  }
});

module.exports = router;