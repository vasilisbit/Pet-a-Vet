// Test script to debug timezone issues in appointment date storage

// Test the current date creation logic
function testDateCreation() {
  console.log("Testing Date Creation Logic:");
  console.log("=".repeat(50));

  const testDate = "2024-05-28";
  const testTime = "10:00";

  // Current implementation
  const appointmentDateTime1 = new Date(`${testDate}T${testTime}:00`);
  console.log(`Input: ${testDate}T${testTime}:00`);
  console.log(`Created Date: ${appointmentDateTime1}`);
  console.log(`ISO String: ${appointmentDateTime1.toISOString()}`);
  console.log(`Date part: ${appointmentDateTime1.toISOString().split("T")[0]}`);
  console.log(`Local Date: ${appointmentDateTime1.toLocaleDateString()}`);
  console.log(
    `Timezone offset: ${appointmentDateTime1.getTimezoneOffset()} minutes`
  );

  console.log("\n" + "-".repeat(50));

  // Alternative: Explicit UTC creation
  const appointmentDateTime2 = new Date(`${testDate}T${testTime}:00.000Z`);
  console.log(`UTC Input: ${testDate}T${testTime}:00.000Z`);
  console.log(`Created Date: ${appointmentDateTime2}`);
  console.log(`ISO String: ${appointmentDateTime2.toISOString()}`);
  console.log(`Date part: ${appointmentDateTime2.toISOString().split("T")[0]}`);

  console.log("\n" + "-".repeat(50));

  // Alternative: Manual construction without timezone issues
  const [year, month, day] = testDate.split("-").map(Number);
  const [hours, minutes] = testTime.split(":").map(Number);
  const appointmentDateTime3 = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0
  );
  console.log(
    `Manual construction: Year=${year}, Month=${
      month - 1
    }, Day=${day}, Hours=${hours}, Minutes=${minutes}`
  );
  console.log(`Created Date: ${appointmentDateTime3}`);
  console.log(`ISO String: ${appointmentDateTime3.toISOString()}`);
  console.log(`Date part: ${appointmentDateTime3.toISOString().split("T")[0]}`);

  console.log("\n" + "=".repeat(50));
}

testDateCreation();
