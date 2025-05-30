// Analysis of the Date Storage Bug
// This script analyzes the timezone/date issue in appointment storage

function analyzeTimezoneIssue() {
  console.log("APPOINTMENT DATE STORAGE BUG ANALYSIS");
  console.log("=".repeat(60));

  // Simulate the current implementation
  const inputDate = "2024-05-28";
  const inputTime = "10:00 AM";

  console.log("INPUT DATA:");
  console.log(`  Date: ${inputDate}`);
  console.log(`  Time: ${inputTime}`);

  // Step 1: Convert time to 24-hour format (current convertTo24Hour function)
  function convertTo24Hour(time12h) {
    if (!time12h) return "09:00";

    // Handle already 24-hour format
    if (!time12h.includes("AM") && !time12h.includes("PM")) {
      return time12h;
    }

    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = (parseInt(hours, 10) + 12).toString();
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  const appointmentTime = convertTo24Hour(inputTime);
  console.log(`\nCONVERTED TIME: ${appointmentTime}`);

  // Step 2: Create appointment DATETIME (current implementation)
  const appointmentDateTime = new Date(`${inputDate}T${appointmentTime}:00`);
  console.log(`\nAPPOINTMENT DATETIME CREATION:`);
  console.log(`  Input string: ${inputDate}T${appointmentTime}:00`);
  console.log(`  Created Date: ${appointmentDateTime}`);
  console.log(`  ISO String: ${appointmentDateTime.toISOString()}`);
  console.log(`  UTC Hours: ${appointmentDateTime.getUTCHours()}`);
  console.log(`  Local Hours: ${appointmentDateTime.getHours()}`);
  console.log(
    `  Timezone Offset: ${appointmentDateTime.getTimezoneOffset()} minutes`
  );

  // Step 3: Extract date part for filtering (current implementation)
  const extractedDate = appointmentDateTime.toISOString().split("T")[0];
  console.log(`\nDATE EXTRACTION FOR FILTERING:`);
  console.log(`  Extracted Date: ${extractedDate}`);
  console.log(`  Matches Input?: ${extractedDate === inputDate}`);

  // Step 4: Database DATE() function behavior simulation
  console.log(`\nDATABASE DATE() FUNCTION:`);
  console.log(`  MySQL DATE() extracts: ${extractedDate}`);
  console.log(
    `  Will match query for: ${inputDate}? ${
      extractedDate === inputDate ? "YES" : "NO"
    }`
  );

  // Step 5: Time extraction for display (current extractTime function)
  function extractTime(dateTime) {
    if (!dateTime) return "09:00";
    try {
      const d = dateTime instanceof Date ? dateTime : new Date(dateTime);
      return d.toTimeString().slice(0, 5); // Returns HH:MM format
    } catch (e) {
      return "09:00";
    }
  }

  const extractedTime = extractTime(appointmentDateTime);
  console.log(`\nTIME EXTRACTION FOR DISPLAY:`);
  console.log(`  Extracted Time: ${extractedTime}`);
  console.log(`  Expected Time: ${appointmentTime}`);
  console.log(`  Matches?: ${extractedTime === appointmentTime}`);

  // Step 6: Identify the issue
  console.log(`\n${"=".repeat(60)}`);
  console.log("ISSUE ANALYSIS:");

  if (extractedDate !== inputDate) {
    console.log("❌ PROBLEM: Date extraction changes the date!");
    console.log(`   Expected: ${inputDate}`);
    console.log(`   Got: ${extractedDate}`);
    console.log("   This will cause appointments to appear on wrong dates.");
  } else {
    console.log("✅ Date extraction is working correctly");
    console.log("   The issue might be elsewhere in the flow");
  }

  if (extractedTime !== appointmentTime) {
    console.log("❌ PROBLEM: Time extraction doesn't match stored time!");
    console.log(`   Expected: ${appointmentTime}`);
    console.log(`   Got: ${extractedTime}`);
    console.log("   This affects time display and conflict detection.");
  } else {
    console.log("✅ Time extraction is working correctly");
  }

  // Step 7: Proposed solutions
  console.log(`\n${"=".repeat(60)}`);
  console.log("PROPOSED SOLUTIONS:");

  console.log("\n1. TIMEZONE-AWARE DATE CREATION:");
  const utcDateTime = new Date(`${inputDate}T${appointmentTime}:00.000Z`);
  console.log(`   UTC Input: ${inputDate}T${appointmentTime}:00.000Z`);
  console.log(`   Created: ${utcDateTime}`);
  console.log(`   ISO: ${utcDateTime.toISOString()}`);
  console.log(`   Date part: ${utcDateTime.toISOString().split("T")[0]}`);

  console.log("\n2. MANUAL DATE CONSTRUCTION:");
  const [year, month, day] = inputDate.split("-").map(Number);
  const [hours, minutes] = appointmentTime.split(":").map(Number);
  const manualDateTime = new Date(year, month - 1, day, hours, minutes, 0);
  console.log(
    `   Manual: new Date(${year}, ${
      month - 1
    }, ${day}, ${hours}, ${minutes}, 0)`
  );
  console.log(`   Created: ${manualDateTime}`);
  console.log(`   ISO: ${manualDateTime.toISOString()}`);
  console.log(`   Date part: ${manualDateTime.toISOString().split("T")[0]}`);

  console.log("\n3. DATABASE TIMEZONE CONFIGURATION:");
  console.log("   Ensure MySQL timezone matches application timezone");
  console.log("   Or always use UTC for storage and convert on display");
}

analyzeTimezoneIssue();
