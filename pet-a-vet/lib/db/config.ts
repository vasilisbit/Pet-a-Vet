import type { PoolOptions } from "mysql2/promise"

// Database configuration
const dbConfig: PoolOptions = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "petavet",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

export default dbConfig
