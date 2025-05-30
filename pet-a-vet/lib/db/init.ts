import { testConnection } from "./connection"
import * as fs from "fs"
import * as path from "path"
import mysql from "mysql2/promise"
import dbConfig from "./config"

export async function initializeDatabase() {
  console.log("Initializing database...")

  // Test connection
  const isConnected = await testConnection()

  if (!isConnected) {
    console.error("Failed to connect to the database. Please check your configuration.")
    return false
  }

  try {
    // Check if tables exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    })

    // Check if database exists
    const [rows] = await connection.execute("SHOW DATABASES LIKE ?", [dbConfig.database])

    if (Array.isArray(rows) && rows.length === 0) {
      // Create database if it doesn't exist
      console.log(`Database '${dbConfig.database}' not found. Creating...`)
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`)
    }

    // Use the database
    await connection.execute(`USE ${dbConfig.database}`)

    // Check if tables exist
    const [tables] = await connection.execute("SHOW TABLES")

    if (Array.isArray(tables) && tables.length === 0) {
      // If no tables exist, run the schema script
      console.log("No tables found. Creating schema...")

      // Read the schema file
      const schemaPath = path.join(process.cwd(), "schema.sql")

      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, "utf8")

        // Split the schema into individual statements
        const statements = schema
          .split(";")
          .filter((statement) => statement.trim() !== "")
          .map((statement) => statement.trim() + ";")

        // Execute each statement
        for (const statement of statements) {
          await connection.execute(statement)
        }

        console.log("Schema created successfully.")
      } else {
        console.error("Schema file not found at:", schemaPath)
        return false
      }
    }

    await connection.end()
    console.log("Database initialization completed successfully.")
    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}
