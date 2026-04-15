const express = require('express');
const router = express.Router();
const db = require('../config/db');


// ── POST ──
router.post('/', async (req, res) => {
  const { name, email, rating, comments } = req.body;

  try {
    const rows = await db.execute(
      `INSERT INTO feedback (name, email, rating, comments)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [name, email, rating, comments]
    );

    res.json({ success: true, id: rows[0].id });

  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ── GET ──
router.get('/', async (req, res) => {
  try {
    const rows = await db.execute(
      'SELECT * FROM feedback ORDER BY id DESC'
    );

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

    const trend = await db.execute(`
      SELECT DATE(submitted_at) AS day, COUNT(*) AS count
      FROM feedback
      GROUP BY day
      ORDER BY day ASC
      LIMIT 7
    `);

    res.json({
      success: true,
      data: {
        stats: stats[0],
        trend
      }
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
      'DELETE FROM feedback WHERE id = $1',
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;