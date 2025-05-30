// Direct database test to check timezone storage
const mysql = require("mysql2/promise");

async function testDatabaseStorage() {
  console.log("Testing Database Storage Directly:");
  console.log("=".repeat(50));
  const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "petavet",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to database");

    // Test date creation
    const testDate = "2024-05-28";
    const testTime = "10:00";

    // Create the same DATETIME as in the API
    const appointmentDateTime = new Date(`${testDate}T${testTime}:00`);
    console.log("\n1. JavaScript Date Object:");
    console.log("   Input:", `${testDate}T${testTime}:00`);
    console.log("   Created:", appointmentDateTime);
    console.log("   ISO String:", appointmentDateTime.toISOString());
    console.log(
      "   Date part:",
      appointmentDateTime.toISOString().split("T")[0]
    );

    // Insert a test record
    const insertQuery = `
            INSERT INTO Appointment (pet_id, service_provider_id, creator_id, service_type, appointment_date, duration, reason, notes, status) 
            VALUES (1, 2, 1, 'TEST', ?, 60, 'timezone test', 'Direct DB test', 'SCHEDULED')
        `;

    console.log("\n2. Inserting into database...");
    const [insertResult] = await connection.execute(insertQuery, [
      appointmentDateTime,
    ]);
    const appointmentId = insertResult.insertId;
    console.log("   Inserted appointment ID:", appointmentId);

    // Query back the data
    const selectQuery = `SELECT appointment_id, appointment_date, DATE(appointment_date) as date_part, TIME(appointment_date) as time_part FROM Appointment WHERE appointment_id = ?`;
    const [rows] = await connection.execute(selectQuery, [appointmentId]);

    console.log("\n3. Retrieved from database:");
    if (rows.length > 0) {
      const row = rows[0];
      console.log("   appointment_date:", row.appointment_date);
      console.log("   date_part:", row.date_part);
      console.log("   time_part:", row.time_part);

      // Convert back to JavaScript Date
      const retrievedDate = new Date(row.appointment_date);
      console.log("   As JS Date:", retrievedDate);
      console.log("   ISO String:", retrievedDate.toISOString());
      console.log(
        "   Date part from ISO:",
        retrievedDate.toISOString().split("T")[0]
      );
    }

    // Test the DATE() function query used by findAppointmentsByDate
    console.log("\n4. Testing DATE() filter:");
    const filterQuery = `SELECT appointment_id, appointment_date FROM Appointment WHERE DATE(appointment_date) = ? AND appointment_id = ?`;
    const [filterRows] = await connection.execute(filterQuery, [
      testDate,
      appointmentId,
    ]);
    console.log("   Filtering by DATE() =", testDate);
    console.log("   Found rows:", filterRows.length);

    // Test the next day
    const nextDay = "2024-05-29";
    const [nextDayRows] = await connection.execute(filterQuery, [
      nextDay,
      appointmentId,
    ]);
    console.log("   Filtering by DATE() =", nextDay);
    console.log("   Found rows:", nextDayRows.length);

    // Clean up
    await connection.execute(
      "DELETE FROM Appointment WHERE appointment_id = ?",
      [appointmentId]
    );
    console.log("\n5. Cleaned up test record");
  } catch (error) {
    console.error("Database test failed:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDatabaseStorage().catch(console.error);
