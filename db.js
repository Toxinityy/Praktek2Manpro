// db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tugasmanpro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  Promise: require('bluebird') 
});
module.exports = pool.promise();
