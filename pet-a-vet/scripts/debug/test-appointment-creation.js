// Direct test for appointment creation
// No external dependencies needed

async function testAppointmentAPI() {
  const baseUrl = "http://localhost:3000";

  try {
    // Uncomment this section to actually make the API call
    /*
    // Test appointment data
    const appointmentData = {
      petId: '1',
      date: '2025-05-29',
      time: '10:00 AM',
      type: 'CHECK_UP',
      notes: 'Timezone test appointment'
    };
    
    console.log('Creating appointment:', appointmentData);
    
    const response = await fetch(`${baseUrl}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });
    
    const result = await response.json();
    console.log('API Response:', result);
    */

    // Manual date testing
    console.log("\nDATE TRANSFORMATION TEST");

    // Input values (what the user selects in the UI)
    const inputDate = "2025-05-29";
    const inputTime = "10:00 AM";

    // Convert time to 24-hour format
    const convertTo24Hour = (time12h) => {
      if (!time12h) return "09:00";
      if (!time12h.includes("AM") && !time12h.includes("PM")) return time12h;

      const [time, modifier] = time12h.split(" ");
      let [hours, minutes] = time.split(":");

      if (hours === "12") hours = "00";
      if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString();

      return `${hours.padStart(2, "0")}:${minutes}`;
    };

    const time24h = convertTo24Hour(inputTime);
    console.log(`Converted time: ${inputTime} → ${time24h}`);

    // Create Date using component method (current approach)
    const [year, month, day] = inputDate.split("-").map(Number);
    const [hours, minutes] = time24h.split(":").map(Number);

    const appointmentDateTime = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      0
    );
    console.log(`\nDate object created: ${appointmentDateTime}`);
    console.log(`ISO string: ${appointmentDateTime.toISOString()}`);

    // This shows the problem: the date is stored as UTC but displayed as local
    console.log(`\nData seen by server/database:`);
    console.log(`ISO for storage: ${appointmentDateTime.toISOString()}`);
    console.log(
      `Date part (what's used for filtering): ${
        appointmentDateTime.toISOString().split("T")[0]
      }`
    );

    console.log(`\nData extracted for display:`);

    // Using consistent local-time extraction
    const extractLocalDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const extractLocalTime = (date) => {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    console.log(`Local date: ${extractLocalDate(appointmentDateTime)}`);
    console.log(`Local time: ${extractLocalTime(appointmentDateTime)}`);

    // This is how our code should be extracting dates for both storage and display
    console.log(`\nSOLUTION: Consistent date handling using local components:`);
    console.log(
      `Create date: new Date(${year}, ${
        month - 1
      }, ${day}, ${hours}, ${minutes}, 0)`
    );
    console.log(`Extract date: ${extractLocalDate(appointmentDateTime)}`);
    console.log(`Extract time: ${extractLocalTime(appointmentDateTime)}`);
    console.log(
      `Filter by: ${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`
    );
  } catch (error) {
    console.error("Test error:", error);
  }
}

testAppointmentAPI();
