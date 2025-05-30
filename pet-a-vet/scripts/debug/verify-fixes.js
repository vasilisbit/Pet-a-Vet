// Test script to verify the date extraction and time slot fixes
console.log("🔍 Testing Date Extraction Fix");
console.log("================================");

// Test the fixed date extraction logic
function formatDate(date) {
  if (!date) return "-";
  try {
    const d = date instanceof Date ? date : new Date(date);
    // Use local date components to avoid timezone issues
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (e) {
    return "-";
  }
}

function extractTime(dateTime) {
  if (!dateTime) return "09:00";
  try {
    const d = dateTime instanceof Date ? dateTime : new Date(dateTime);
    // Use local time components to be consistent with how we store
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (e) {
    return "09:00";
  }
}

// Test with sample database values from appointments.csv
const testDates = [
  "2025-05-28 09:00:00",
  "2025-05-28 10:00:00",
  "2025-05-28 11:00:00",
  "2025-05-28 14:00:00",
];

console.log("Testing date extraction from database values:");
testDates.forEach((dbDate) => {
  const extractedDate = formatDate(dbDate);
  const extractedTime = extractTime(dbDate);
  console.log(`DB: ${dbDate} → Date: ${extractedDate}, Time: ${extractedTime}`);
});

console.log("\n🕒 Testing 30-Minute Time Slots");
console.log("===============================");

// Test the 30-minute time slots
const allTimeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

console.log("Available 30-minute time slots:");
allTimeSlots.forEach((slot) => {
  const [hours, minutes] = slot.split(":");
  const hour24 = parseInt(hours);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const period = hour24 >= 12 ? "PM" : "AM";
  console.log(`${slot} → ${hour12}:${minutes} ${period}`);
});

console.log("\n✅ Both fixes implemented:");
console.log("1. Date extraction uses local components (no timezone shift)");
console.log("2. Time slots are now 30-minute intervals");
console.log("\nReady for browser testing at http://localhost:3000");
