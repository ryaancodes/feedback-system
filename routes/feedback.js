const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ── POST: Add feedback ─────────────────────────
router.post('/', async (req, res) => {
  const { name, email, rating, comments } = req.body;

  try {
    const [rows] = await db.execute(
      `INSERT INTO feedback (name, email, rating, comments)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        name || null,
        email || null,
        rating || null,
        comments || null
      ]
    );

    res.json({
      success: true,
      id: rows[0].id
    });

  } catch (err) {
    console.error('❌ POST ERROR:', err); // 🔥 logs
    res.status(500).json({
      success: false,
      message: err.message // 🔥 shows real error
    });
  }
});


// ── GET: Feedback ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, rating, sort } = req.query;

    let sql = 'SELECT * FROM feedback WHERE 1=1';
    const params = [];
    let index = 1;

    if (search) {
      sql += ` AND (name ILIKE $${index} OR email ILIKE $${index + 1})`;
      params.push(`%${search}%`, `%${search}%`);
      index += 2;
    }

    if (rating) {
      sql += ` AND rating = $${index}`;
      params.push(Number(rating));
      index++;
    }

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

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ── GET: Analytics ─────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const [statsRows] = await db.execute(`
      SELECT
        COUNT(*) AS total_feedback,
        ROUND(AVG(rating), 2) AS average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star
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

    res.json({
      success: true,
      data: { stats, trend }
    });

  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ── DELETE ─────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM feedback WHERE id = $1',
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;