// Test script to check what dates are actually being stored in the database
// Using Node.js built-in fetch (Node 18+)

async function testAppointmentCreation() {
  console.log("Testing Appointment Creation and Storage:");
  console.log("=".repeat(50));

  const baseUrl = "http://localhost:3000";

  // Test data - booking for May 28th
  const testAppointment = {
    petId: "1",
    date: "2024-05-28",
    time: "10:00 AM",
    type: "CHECK_UP",
    veterinarianId: "2",
    notes: "Timezone test appointment",
  };

  try {
    console.log(
      "1. Creating appointment for:",
      testAppointment.date,
      "at",
      testAppointment.time
    );

    // Create appointment
    const createResponse = await fetch(`${baseUrl}/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testAppointment),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error("Failed to create appointment:", error);
      return;
    }

    const createdAppointment = await createResponse.json();
    console.log("2. Created appointment:", {
      id: createdAppointment.id,
      date: createdAppointment.date,
      time: createdAppointment.time,
    });

    // Fetch appointments for the intended date
    console.log("\n3. Fetching appointments for", testAppointment.date);
    const fetchResponse = await fetch(
      `${baseUrl}/api/appointments?date=${testAppointment.date}`
    );

    if (!fetchResponse.ok) {
      console.error("Failed to fetch appointments");
      return;
    }

    const appointments = await fetchResponse.json();
    const targetAppointment = appointments.find(
      (apt) => apt.notes === "Timezone test appointment"
    );

    if (targetAppointment) {
      console.log("4. Found appointment on", testAppointment.date, ":", {
        id: targetAppointment.id,
        date: targetAppointment.date,
        time: targetAppointment.time,
      });
    } else {
      console.log("4. No appointment found on", testAppointment.date);

      // Check the next day
      const nextDay = "2024-05-29";
      console.log("5. Checking", nextDay, "instead...");

      const nextDayResponse = await fetch(
        `${baseUrl}/api/appointments?date=${nextDay}`
      );
      if (nextDayResponse.ok) {
        const nextDayAppointments = await nextDayResponse.json();
        const nextDayTarget = nextDayAppointments.find(
          (apt) => apt.notes === "Timezone test appointment"
        );

        if (nextDayTarget) {
          console.log("6. FOUND APPOINTMENT ON WRONG DATE!", {
            expected: testAppointment.date,
            actual: nextDayTarget.date,
            time: nextDayTarget.time,
          });
        } else {
          console.log("6. Appointment not found on", nextDay, "either");
        }
      }
    }

    // Clean up - delete the test appointment
    if (createdAppointment.id) {
      await fetch(`${baseUrl}/api/appointments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: createdAppointment.id }),
      });
      console.log("\n7. Cleaned up test appointment");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Only run if the server is running
testAppointmentCreation().catch(console.error);
