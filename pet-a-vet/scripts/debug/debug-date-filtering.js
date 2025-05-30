// Debug script to verify date filtering in the pet-a-vet application
// This script simulates the server-side date filtering and database query

// Sample appointment date (as it would be stored in the database)
const sampleAppointmentDate = new Date("2023-06-19T10:00:00.000Z");

// User-selected date for filtering (e.g., from URL query parameter)
const userSelectedDate = "2023-06-19";

console.log("====== DATE FILTERING DEBUG ======");
console.log(
  "This script verifies the date filtering logic to ensure appointments appear on the correct day"
);

console.log("\nSCENARIO 1: Database DATE() function comparison");
console.log(`Appointment stored in database as: ${sampleAppointmentDate}`);
console.log(`User filters by date: ${userSelectedDate}`);

// Simulate SQL DATE() function by extracting just the date part
const dbDatePart = sampleAppointmentDate.toISOString().split("T")[0];
console.log(`Database DATE() extraction: ${dbDatePart}`);
console.log(
  `Dates match in database query: ${dbDatePart === userSelectedDate}`
);

console.log("\nSCENARIO 2: JavaScript date filtering (non-admin users)");
// Simulate the JS filter in the GET method
const d = new Date(sampleAppointmentDate);
const year = d.getFullYear();
const month = String(d.getMonth() + 1).padStart(2, "0");
const day = String(d.getDate()).padStart(2, "0");
const extractedDate = `${year}-${month}-${day}`;

console.log(`JavaScript date extraction: ${extractedDate}`);
console.log(`JavaScript filter matches: ${extractedDate === userSelectedDate}`);

// Check for potential timezone issues
console.log("\nTIMEZONE ANALYSIS:");
console.log(`Appointment UTC date: ${sampleAppointmentDate.toISOString()}`);
console.log(`Appointment local date: ${sampleAppointmentDate.toString()}`);
console.log(
  `Local timezone offset: ${
    sampleAppointmentDate.getTimezoneOffset() / -60
  } hours`
);
console.log(`Date component from UTC: ${sampleAppointmentDate.getUTCDate()}`);
console.log(`Date component from local: ${sampleAppointmentDate.getDate()}`);

// Verify MySQL DATE() function simulation
console.log("\nVERIFY MYSQL DATE() BEHAVIOR:");

// Function to simulate MySQL DATE() function
const simulateMySQLDate = (dateStr) => {
  // MySQL DATE() extracts just the date part, ignoring time and timezone
  const date = new Date(dateStr);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getUTCDate()).padStart(2, "0")}`;
};

const date1 = simulateMySQLDate("2023-06-19T10:00:00Z");
const date2 = simulateMySQLDate("2023-06-19");
console.log(`MySQL DATE('2023-06-19T10:00:00Z'): ${date1}`);
console.log(`MySQL DATE('2023-06-19'): ${date2}`);
console.log(`MySQL DATE comparison would match: ${date1 === date2}`);

// Test different dates
console.log("\nEDGE CASE TESTS:");
const testCases = [
  { stored: "2023-06-19T23:59:59.999Z", filter: "2023-06-19" },
  { stored: "2023-06-19T00:00:00.000Z", filter: "2023-06-19" },
  { stored: "2023-06-18T23:59:59.999Z", filter: "2023-06-19" }, // This should NOT match
  { stored: "2023-06-20T00:00:00.000Z", filter: "2023-06-19" }, // This should NOT match
];

testCases.forEach((test, index) => {
  console.log(`\nTest ${index + 1}:`);
  console.log(`Stored date: ${test.stored}`);
  console.log(`Filter date: ${test.filter}`);

  // Database level filtering (MySQL DATE())
  const dbDate = simulateMySQLDate(test.stored);
  const dbMatch = dbDate === simulateMySQLDate(test.filter);
  console.log(`DB match: ${dbMatch}`);

  // JavaScript filtering
  const jsDate = new Date(test.stored);
  const jsExtracted = `${jsDate.getFullYear()}-${String(
    jsDate.getMonth() + 1
  ).padStart(2, "0")}-${String(jsDate.getDate()).padStart(2, "0")}`;
  const jsMatch = jsExtracted === test.filter;
  console.log(`JS match: ${jsMatch}`);

  // Potential issue
  if (dbMatch !== jsMatch) {
    console.log(
      `❌ INCONSISTENCY DETECTED: DB match (${dbMatch}) != JS match (${jsMatch})`
    );
  }
});

// Summary
console.log("\n====== DEBUG SUMMARY ======");
console.log("When fixing appointment date filtering issues:");
console.log(
  "1. Ensure MySQL DATE() function is used on both sides of the comparison"
);
console.log(
  "2. Ensure JavaScript date extraction uses local components (getFullYear, getMonth, getDate)"
);
console.log(
  "3. Make all date formatting consistent throughout the application"
);
console.log("4. Avoid mixing UTC and local timezone methods");
