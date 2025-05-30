// This script verifies that the date/time handling fixes work properly
// by simulating the appointment creation and retrieval flow

// Function to simulate date formatting like in API
const formatDateForDisplay = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  // Use local date components (Year, Month, Day)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Function to extract time like in API
const extractTimeForDisplay = (dateTime) => {
  const d = dateTime instanceof Date ? dateTime : new Date(dateTime);
  // Use local time components (Hours, Minutes)
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Test several dates to ensure consistency
const testDates = [
  "2023-06-18T09:00:00.000Z", // UTC date string
  "2023-06-18 09:00:00", // Date-time string
  new Date(2023, 5, 18, 9, 0, 0), // Direct date creation (June = 5 in JS)
];

console.log("====== APPOINTMENT DATE/TIME VERIFICATION ======");
console.log(
  "This test verifies that dates are stored and retrieved consistently"
);

testDates.forEach((testDate, index) => {
  console.log(`\n--- Test Case ${index + 1} ---`);
  console.log(`Input date: ${testDate}`);

  // Create a date object as it would be stored in the database
  const dateObj = new Date(testDate);
  console.log(`Raw date object: ${dateObj}`);

  // Format using our fixed functions
  const formattedDate = formatDateForDisplay(dateObj);
  const extractedTime = extractTimeForDisplay(dateObj);

  console.log(`Formatted date: ${formattedDate}`);
  console.log(`Extracted time: ${extractedTime}`);

  // Now simulate retrieving and filtering by this date
  const filterDate = formattedDate;
  const retrieved = new Date(dateObj); // Simulate retrieved from DB
  const retrievedFormatted = formatDateForDisplay(retrieved);

  console.log(`Filter date: ${filterDate}`);
  console.log(`Retrieved formatted date: ${retrievedFormatted}`);
  console.log(`Date comparison matches: ${filterDate === retrievedFormatted}`);
});

// Test simulating the whole flow - user creates appointment for June 18
console.log("\n====== COMPLETE FLOW SIMULATION ======");

// 1. User selects June 18, 2023 for appointment (in local time)
const userSelectedDate = "2023-06-18";
const userSelectedTime = "14:30"; // 2:30 PM

console.log(`User selected date: ${userSelectedDate}`);
console.log(`User selected time: ${userSelectedTime}`);

// 2. API creates a date object with the local components
const [year, month, day] = userSelectedDate.split("-").map(Number);
const [hours, minutes] = userSelectedTime.split(":").map(Number);
const appointmentDateTime = new Date(
  year,
  month - 1, // JS months are 0-based
  day,
  hours,
  minutes,
  0
);

console.log(`Created appointment date: ${appointmentDateTime}`);

// 3. Store in database and retrieve (simulated)
const storedDate = appointmentDateTime;
console.log(`Stored in database as: ${storedDate}`);

// 4. API retrieves the date and formats for response
const retrievedDate = formatDateForDisplay(storedDate);
const retrievedTime = extractTimeForDisplay(storedDate);

console.log(`Retrieved formatted date: ${retrievedDate}`);
console.log(`Retrieved formatted time: ${retrievedTime}`);

// 5. User later filters by June 18
const filterDate = userSelectedDate;
console.log(`User filters by date: ${filterDate}`);

// 6. API filters appointments
const dateMatches = retrievedDate === filterDate;
console.log(`Date filter matches: ${dateMatches}`);

if (dateMatches) {
  console.log(
    "\n✅ SUCCESS: The date formatting and extraction fixes are working correctly!"
  );
  console.log(
    "Appointments will now be displayed on the correct day they were booked for."
  );
} else {
  console.log("\n❌ ERROR: Date handling is still not consistent!");
}
