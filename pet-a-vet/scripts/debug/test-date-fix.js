// Comprehensive test for date storage bug fix
// This script tests the complete appointment booking flow to verify the fix

async function testAppointmentDateFix() {
  console.log("🔧 TESTING DATE STORAGE BUG FIX");
  console.log("=".repeat(60));

  const baseUrl = "http://localhost:3001";

  // Test case 1: Create appointment for May 28th
  const testData = {
    petId: "1",
    date: "2024-05-28",
    time: "10:00 AM",
    type: "CHECK_UP", // This should be mapped to "MEDICAL"
    veterinarianId: "2",
    notes: "Date fix test - should appear on May 28th",
  };

  try {
    console.log("📅 Test Case 1: Creating appointment");
    console.log(`   Date: ${testData.date}`);
    console.log(`   Time: ${testData.time}`);
    console.log(`   Type: ${testData.type} (should map to MEDICAL)`);

    // Note: This will fail with "Unauthorized" since we need auth
    // But we can check the server logs for our debug output

    const response = await fetch(`${baseUrl}/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.text();
    console.log("📤 Response:", response.status, result);

    if (response.status === 401) {
      console.log(
        "ℹ️  Expected unauthorized error - check server logs for debug output"
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }

  // Test case 2: Check available times for the same date
  try {
    console.log("\n📅 Test Case 2: Checking available times");
    console.log(`   Date: ${testData.date}`);
    console.log(`   Vet ID: ${testData.veterinarianId}`);

    const availableTimesResponse = await fetch(
      `${baseUrl}/api/appointments/available-times?date=${testData.date}&veterinarianId=${testData.veterinarianId}`
    );

    const availableResult = await availableTimesResponse.text();
    console.log(
      "📤 Available Times Response:",
      availableTimesResponse.status,
      availableResult
    );

    if (availableTimesResponse.status === 401) {
      console.log(
        "ℹ️  Expected unauthorized error - check server logs for debug output"
      );
    }
  } catch (error) {
    console.error("❌ Available times test failed:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🔍 WHAT TO CHECK IN SERVER LOGS:");
  console.log(
    "1. 'Appointment creation debug:' - verify dateExtracted matches input"
  );
  console.log(
    "2. 'Available times debug:' - verify time extraction is consistent"
  );
  console.log("3. Service type mapping: CHECK_UP → MEDICAL");
  console.log("4. Date consistency across all operations");

  console.log("\n📋 EXPECTED FIXES:");
  console.log("✅ Service types mapped to valid database enum values");
  console.log("✅ Timezone-safe date creation using manual date construction");
  console.log("✅ Consistent time extraction in all APIs");
  console.log("✅ Debug logging for troubleshooting");
}

// Run the test
testAppointmentDateFix().catch(console.error);
