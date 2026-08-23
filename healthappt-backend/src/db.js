// ---------------------------------------------------------------------------
// db.js — opens ONE shared connection pool to Azure SQL and reuses it.
// ---------------------------------------------------------------------------
require('dotenv').config();
const sql = require('mssql');

const base = {
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: { encrypt: true, trustServerCertificate: false },
  // Serverless DB can take ~30-60s to wake from auto-pause, so allow more time.
  connectionTimeout: 60000,
  requestTimeout: 60000,
  pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
};

// If a SQL username/password is set (local development), use that.
// Otherwise connect with the Azure managed identity (used in production) —
// "passwordless": no secrets in code. The same file works in both places.
const config = process.env.SQL_USER
  ? { ...base, user: process.env.SQL_USER, password: process.env.SQL_PASSWORD }
  : { ...base, authentication: { type: 'azure-active-directory-default' } };

let poolPromise;

function getPool() {
  if (!poolPromise) {
    // If the connection fails (e.g. DB still waking), clear the cache so the
    // next request tries again instead of reusing the failed attempt.
    poolPromise = new sql.ConnectionPool(config).connect()
      .catch((err) => { poolPromise = undefined; throw err; });
  }
  return poolPromise;
}

module.exports = { sql, getPool };
