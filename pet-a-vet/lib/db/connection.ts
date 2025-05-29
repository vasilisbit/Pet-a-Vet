import mysql from "mysql2/promise"
import dbConfig from "./config"

// Create a connection pool
const pool = mysql.createPool(dbConfig)

// Test the database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("Database connection established successfully")
    connection.release()
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Execute a query with parameters
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params)
    return results as T
  } catch (error) {
    console.error("Query error:", error)
    throw error
  }
}

// Get a direct connection from the pool
export async function getConnection() {
  return await pool.getConnection()
}

export default { query, testConnection, getConnection }
