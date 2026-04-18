const { Pool } = require('pg');

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = {
  execute: async (query, params = []) => {
    const res = await pool.query(query, params);
    return res.rows;
  }
};

module.exports = {
  execute: async (query, params = []) => {
    const res = await pool.query(query, params);
    return res.rows;
  }
};  