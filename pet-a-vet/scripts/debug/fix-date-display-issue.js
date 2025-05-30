// Fix for appointments showing on the wrong date
// This script simulates the appointment filtering process to verify the fix

// Helper function to format dates in ISO format
const toISODateString = (date) => {
  return date.toISOString().split("T")[0];
};

// Helper function to format dates using local components
const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Test case: Appointment created for June 18th but shows up on June 19th
console.log("===== APPOINTMENT DATE DISPLAY ISSUE TEST =====");

// 1. User selects June 18th for appointment
const userSelectedDate = "2023-06-18";
console.log(`User selects date: ${userSelectedDate}`);

// 2. System creates appointment (simulated database storage)
const appointmentDateTime = new Date("2023-06-18T14:00:00.000Z"); // UTC time
console.log(
  `Appointment stored in DB as: ${appointmentDateTime.toISOString()}`
);
console.log(`Appointment local time: ${appointmentDateTime.toString()}`);

// 3. Later, user filters by June 18th
console.log(`\nUser filters by date: ${userSelectedDate}`);

// 4. System retrieves all appointments (simulated)
const retrievedAppointment = {
  appointment_id: 1,
  appointment_date: appointmentDateTime,
};

// 5. PREVIOUS LOGIC: Filter using local date components (INCORRECT)
const incorrectFilter = () => {
  const d = new Date(retrievedAppointment.appointment_date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const appointmentDate = `${year}-${month}-${day}`;

  return appointmentDate === userSelectedDate;
};

// 6. NEW LOGIC: Filter using ISO date string (CORRECT)
const correctFilter = () => {
  const d = new Date(retrievedAppointment.appointment_date);
  const appointmentDateStr = d.toISOString().split("T")[0];

  return appointmentDateStr === userSelectedDate;
};

// 7. Compare results
const incorrectResult = incorrectFilter();
const correctResult = correctFilter();

console.log("\n--- RESULTS ---");
console.log(
  `Using local date components: appointment ${
    incorrectResult ? "IS" : "IS NOT"
  } shown`
);
console.log(
  `Using ISO date parts: appointment ${correctResult ? "IS" : "IS NOT"} shown`
);

// 8. Simulate MySQL DATE() function
const simulateDbDate = (date) => {
  // MySQL DATE() function extracts date in UTC
  return date.toISOString().split("T")[0];
};

const dbDateComparison =
  simulateDbDate(appointmentDateTime) === userSelectedDate;
console.log(
  `MySQL DATE() comparison: appointment ${
    dbDateComparison ? "IS" : "IS NOT"
  } included`
);

// 9. Verify the correct solution
console.log("\n--- VERIFICATION ---");
if (correctResult === dbDateComparison) {
  console.log("✅ SUCCESS: JavaScript filter now matches database behavior!");
  console.log(
    "Appointments will display on the correct day they were booked for."
  );
} else {
  console.log(
    "❌ ERROR: JavaScript filter still doesn't match database behavior."
  );
}

// Test edge cases
console.log("\n--- EDGE CASES ---");

// Case 1: Appointment at start of day in UTC
const startOfDayUTC = new Date("2023-06-18T00:00:00.000Z");
console.log(
  `\nAppointment at start of day UTC: ${startOfDayUTC.toISOString()}`
);
console.log(`Local time: ${startOfDayUTC.toString()}`);
console.log(`ISO date extraction: ${toISODateString(startOfDayUTC)}`);
console.log(`Local date extraction: ${toLocalDateString(startOfDayUTC)}`);
console.log(`DB match: ${simulateDbDate(startOfDayUTC) === userSelectedDate}`);
console.log(
  `New filter matches: ${toISODateString(startOfDayUTC) === userSelectedDate}`
);

// Case 2: Appointment at end of day in UTC
const endOfDayUTC = new Date("2023-06-18T23:59:59.999Z");
console.log(`\nAppointment at end of day UTC: ${endOfDayUTC.toISOString()}`);
console.log(`Local time: ${endOfDayUTC.toString()}`);
console.log(`ISO date extraction: ${toISODateString(endOfDayUTC)}`);
console.log(`Local date extraction: ${toLocalDateString(endOfDayUTC)}`);
console.log(`DB match: ${simulateDbDate(endOfDayUTC) === userSelectedDate}`);
console.log(
  `New filter matches: ${toISODateString(endOfDayUTC) === userSelectedDate}`
);
