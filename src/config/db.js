const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "github_analyzer",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00",
});

async function testConnection() {
  try {
    console.log("🔍 Attempting MySQL connection...");
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_PORT:", process.env.DB_PORT);
    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_NAME:", process.env.DB_NAME);

    const conn = await pool.getConnection();

    console.log("✅ MySQL connected successfully");

    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection failed");
    console.error("Error code:", err.code);
    console.error("Error number:", err.errno);
    console.error("SQL state:", err.sqlState);
    console.error("Error message:", err.message);
    console.error("Full error:", err);

    process.exit(1);
  }
}

module.exports = { pool, testConnection };