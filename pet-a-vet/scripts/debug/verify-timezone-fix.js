// Timezone fix test script

// Define the fixed formatDate and extractTime functions
const formatDate = (date) => {
  if (!date) return "-";
  try {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (e) {
    return "-";
  }
};

const extractTime = (dateTime) => {
  if (!dateTime) return "09:00";
  try {
    const d = dateTime instanceof Date ? dateTime : new Date(dateTime);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (e) {
    return "09:00";
  }
};

// Test with a specific appointment date
console.log("TIMEZONE FIX VERIFICATION\n");

// Create a test date using the method from our code
const createAppointmentDate = () => {
  const year = 2025;
  const month = 5; // June (0-based)
  const day = 18;
  const hours = 10;
  const minutes = 30;

  return new Date(year, month, day, hours, minutes, 0);
};

const appointmentDate = createAppointmentDate();
console.log("Created appointment date:", appointmentDate.toString());
console.log("ISO string (for storage):", appointmentDate.toISOString());

// Test our fixed extraction methods
console.log("\nEXTRACTION TESTS:");
console.log("Fixed formatDate():", formatDate(appointmentDate));
console.log("Fixed extractTime():", extractTime(appointmentDate));

// Problem test: ISO string manipulation
console.log("\nTHE PROBLEM:");
console.log("ISO string split:", appointmentDate.toISOString().split("T")[0]);
console.log(
  "This may be a different day than local date if created near midnight"
);

// Test date filtering logic
console.log("\nDATE FILTERING TEST:");
const testDateFilter = (appointment, filterDate) => {
  // Old problematic method
  const oldMethodDate = new Date(appointment).toISOString().split("T")[0];

  // New fixed method
  const d = new Date(appointment);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const newMethodDate = `${year}-${month}-${day}`;

  console.log(`Target filter date: ${filterDate}`);
  console.log(
    `Old method extracted: ${oldMethodDate} (match: ${
      oldMethodDate === filterDate
    })`
  );
  console.log(
    `New method extracted: ${newMethodDate} (match: ${
      newMethodDate === filterDate
    })`
  );
};

// Test with the appointment's correct date
testDateFilter(appointmentDate, "2025-06-18");

// Test with next day (simulating timezone shift)
testDateFilter(appointmentDate, "2025-06-19");

console.log("\nVERIFICATION COMPLETE!");
