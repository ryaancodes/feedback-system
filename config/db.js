const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root123',   // same you set
  database: 'feedback',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = {
  execute: async (query, params = []) => {
    const [rows] = await pool.execute(query, params);
    return rows;
  }
};