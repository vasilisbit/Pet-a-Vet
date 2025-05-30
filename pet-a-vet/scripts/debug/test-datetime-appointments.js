// Test script for DATETIME appointment functionality
const testAPIEndpoints = async () => {
  const baseURL = "http://localhost:3000";

  console.log("Testing DATETIME appointment functionality...\n");

  try {
    // Test 1: Create an appointment with specific date and time
    console.log("1. Testing appointment creation with DATETIME...");

    const appointmentData = {
      petId: "1",
      date: "2025-05-28",
      time: "10:30 AM",
      type: "MEDICAL",
      notes: "Test appointment with DATETIME",
      veterinarianId: "2",
    };

    const createResponse = await fetch(`${baseURL}/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    });

    if (createResponse.ok) {
      const createdAppointment = await createResponse.json();
      console.log("✅ Appointment created successfully");
      console.log("   Date:", createdAppointment.date);
      console.log("   Time:", createdAppointment.time);
      console.log("   ID:", createdAppointment.id);

      // Test 2: Fetch available time slots for the same date/vet
      console.log("\n2. Testing available time slots API...");

      const availableTimesResponse = await fetch(
        `${baseURL}/api/appointments/available-times?date=2025-05-28&veterinarianId=2`
      );

      if (availableTimesResponse.ok) {
        const timeSlotsData = await availableTimesResponse.json();
        console.log("✅ Available time slots fetched successfully");
        console.log("   Total slots:", timeSlotsData.totalSlots);
        console.log("   Booked slots:", timeSlotsData.bookedSlots);
        console.log("   Available count:", timeSlotsData.availableCount);
        console.log(
          "   Available slots:",
          timeSlotsData.availableSlots.map((slot) => slot.label).join(", ")
        );
      } else {
        console.log("❌ Available time slots API failed");
        console.log("Status:", availableTimesResponse.status);
        const errorText = await availableTimesResponse.text();
        console.log("Error:", errorText);
      }

      // Test 3: Try to create conflicting appointment
      console.log("\n3. Testing time conflict detection...");

      const conflictingData = {
        petId: "2", // Different pet
        date: "2025-05-28",
        time: "10:30 AM", // Same time slot
        type: "MEDICAL",
        notes: "This should conflict",
        veterinarianId: "2", // Same vet
      };

      const conflictResponse = await fetch(`${baseURL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conflictingData),
      });

      if (conflictResponse.status === 409) {
        const conflictError = await conflictResponse.json();
        console.log("✅ Time conflict detected correctly");
        console.log("   Error message:", conflictError.error);
      } else {
        console.log("❌ Time conflict detection failed");
        console.log("Status:", conflictResponse.status);
      }

      // Test 4: Create appointment at different time
      console.log("\n4. Testing different time slot...");

      const differentTimeData = {
        petId: "2",
        date: "2025-05-28",
        time: "11:30 AM", // Different time
        type: "MEDICAL",
        notes: "This should work",
        veterinarianId: "2",
      };

      const differentTimeResponse = await fetch(`${baseURL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(differentTimeData),
      });

      if (differentTimeResponse.ok) {
        const newAppointment = await differentTimeResponse.json();
        console.log("✅ Different time slot appointment created successfully");
        console.log("   Date:", newAppointment.date);
        console.log("   Time:", newAppointment.time);
      } else {
        console.log("❌ Different time slot appointment failed");
        console.log("Status:", differentTimeResponse.status);
        const errorText = await differentTimeResponse.text();
        console.log("Error:", errorText);
      }
    } else {
      console.log("❌ Initial appointment creation failed");
      console.log("Status:", createResponse.status);
      const errorText = await createResponse.text();
      console.log("Error:", errorText);
    }
  } catch (error) {
    console.error("Test error:", error);
  }
};

// Run the test
testAPIEndpoints();
