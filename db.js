const mysql = require('mysql2');
const util = require('util');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tugasmanpro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Promisify the query function
pool.query = util.promisify(pool.query).bind(pool);

module.exports = pool;
