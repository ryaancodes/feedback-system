const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://feedback_db_avd4_user:6DsXQ9Y3eBtab0sgn9WcBDpd7YAweHee@dpg-d7f7qahkh4rs739ibbtg-a.virginia-postgres.render.com/feedback_db_avd4',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  execute: async (query, params = []) => {
    const res = await pool.query(query, params);
    return res.rows;
  }
};  