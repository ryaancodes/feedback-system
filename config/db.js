const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = {
  execute: async (query, params) => {
    try {
      const [rows] = await pool.execute(query, params);
      return [rows];
    } catch (err) {
      console.error('DB ERROR:', err);
      throw err; // 🔥 important for debugging
    }
  }
};