// Test script for dynamic time slots functionality
const testDynamicTimeSlots = async () => {
  const baseURL = "http://localhost:3000";

  console.log("Testing Dynamic Time Slots functionality...\n");

  try {
    // Test 1: Create a test appointment to block a time slot
    console.log("1. Creating test appointment to block a time slot...");

    const appointmentData = {
      petId: "1",
      date: "2025-05-30",
      time: "10:00 AM",
      type: "MEDICAL",
      notes: "Test appointment to block time slot",
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
      console.log("✅ Test appointment created successfully");
      console.log("   Date:", createdAppointment.date);
      console.log("   Time:", createdAppointment.time);
      console.log("   ID:", createdAppointment.id);

      // Test 2: Fetch available time slots for the same date/vet
      console.log(
        "\n2. Testing available time slots API (should exclude blocked time)..."
      );

      const availableTimesResponse = await fetch(
        `${baseURL}/api/appointments/available-times?date=2025-05-30&veterinarianId=2`
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

        // Check if 10:00 AM is correctly excluded
        const blockedTime = timeSlotsData.availableSlots.find(
          (slot) => slot.label === "10:00 AM"
        );
        if (!blockedTime) {
          console.log("✅ 10:00 AM correctly excluded from available slots");
        } else {
          console.log("❌ 10:00 AM should be excluded but is still available");
        }
      } else {
        console.log("❌ Available time slots API failed");
        console.log("Status:", availableTimesResponse.status);
        const errorText = await availableTimesResponse.text();
        console.log("Error:", errorText);
      }

      // Test 3: Try different date (should show all slots available)
      console.log("\n3. Testing available time slots for different date...");

      const differentDateResponse = await fetch(
        `${baseURL}/api/appointments/available-times?date=2025-05-31&veterinarianId=2`
      );

      if (differentDateResponse.ok) {
        const differentDateData = await differentDateResponse.json();
        console.log("✅ Available time slots for different date fetched");
        console.log("   Available count:", differentDateData.availableCount);
        console.log(
          "   Should have all 9 slots available:",
          differentDateData.availableCount === 9 ? "✅" : "❌"
        );
      } else {
        console.log("❌ Different date API call failed");
      }

      // Test 4: Try different veterinarian (should show all slots available)
      console.log(
        "\n4. Testing available time slots for different veterinarian..."
      );

      const differentVetResponse = await fetch(
        `${baseURL}/api/appointments/available-times?date=2025-05-30&veterinarianId=3`
      );

      if (differentVetResponse.ok) {
        const differentVetData = await differentVetResponse.json();
        console.log("✅ Available time slots for different vet fetched");
        console.log("   Available count:", differentVetData.availableCount);
        console.log(
          "   Should have all 9 slots available:",
          differentVetData.availableCount === 9 ? "✅" : "❌"
        );
      } else {
        console.log("❌ Different vet API call failed");
      }
    } else {
      console.log("❌ Failed to create test appointment");
      console.log("Status:", createResponse.status);
      const errorText = await createResponse.text();
      console.log("Error:", errorText);
    }
  } catch (error) {
    console.error("Test error:", error);
  }

  console.log("\n=== Dynamic Time Slots Test Complete ===");
};

// Run the test
testDynamicTimeSlots();
