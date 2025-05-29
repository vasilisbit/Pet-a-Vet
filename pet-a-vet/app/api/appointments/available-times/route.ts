import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import * as appointmentModel from "@/lib/db/models/appointment";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const veterinarianId = searchParams.get("veterinarianId");

    if (!date || !veterinarianId) {
      return NextResponse.json(
        { error: "Date and veterinarianId are required" },
        { status: 400 }
      );
    } // Define all possible time slots (9 AM to 5 PM, every 30 minutes)
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

    // Get existing appointments for the date and veterinarian
    const existingAppointments = await appointmentModel.findAppointmentsByDate(
      date
    );

    // Filter appointments for this specific veterinarian and active statuses
    const vetAppointments = existingAppointments.filter(
      (apt) =>
        apt.service_provider_id === parseInt(veterinarianId) &&
        apt.status !== "CANCELLED" &&
        apt.status !== "NO_SHOW"
    ); // Extract booked time slots from existing appointments
    const bookedTimes = vetAppointments.map((apt) => {
      const appointmentDateTime = new Date(apt.appointment_date);

      // Use local time consistently (same as how we store appointments)
      const hours = appointmentDateTime.getHours().toString().padStart(2, "0");
      const minutes = appointmentDateTime
        .getMinutes()
        .toString()
        .padStart(2, "0");
      console.log("Available times debug:", {
        appointmentId: apt.appointment_id,
        storedDate: apt.appointment_date,
        parsedDate: appointmentDateTime,
        extractedTime: `${hours}:${minutes}`,
        // Use local date components for consistent date extraction
        dateComponents: {
          year: appointmentDateTime.getFullYear(),
          month: appointmentDateTime.getMonth() + 1,
          day: appointmentDateTime.getDate(),
        },
      });

      return `${hours}:${minutes}`;
    }); // Filter available time slots (remove booked times and handle overlaps)
    const availableTimeSlots = allTimeSlots.filter((timeSlot) => {
      // Check if this exact time is booked
      if (bookedTimes.includes(timeSlot)) {
        return false;
      }

      // Check for overlaps with existing appointments
      const [hours, minutes] = timeSlot.split(":").map(Number);
      const slotTimeInMinutes = hours * 60 + minutes;

      // Default slot duration to 30 minutes (time between slots)
      const slotDuration = 30;
      const slotEndTime = slotTimeInMinutes + slotDuration;

      return !vetAppointments.some((appointment) => {
        const appointmentDateTime = new Date(appointment.appointment_date);
        const appointmentHours = appointmentDateTime.getHours();
        const appointmentMinutes = appointmentDateTime.getMinutes();
        const appointmentTimeInMinutes =
          appointmentHours * 60 + appointmentMinutes;

        // Get the duration from the appointment (default to 30 if not specified)
        // This matches the database schema default
        const appointmentDuration = appointment.duration || 30;

        // Check if the slot would overlap with this appointment
        // Slot starts before appointment ends AND slot ends after appointment starts
        const appointmentEndTime =
          appointmentTimeInMinutes + appointmentDuration;

        const hasOverlap =
          slotTimeInMinutes < appointmentEndTime &&
          slotEndTime > appointmentTimeInMinutes;

        console.log("Overlap check:", {
          timeSlot,
          slotTime: slotTimeInMinutes,
          slotEnd: slotEndTime,
          appointmentTime: appointmentTimeInMinutes,
          appointmentEnd: appointmentEndTime,
          duration: appointmentDuration,
          hasOverlap,
        });

        return hasOverlap;
      });
    });

    // Convert back to 12-hour format for display
    const convertTo12Hour = (time24: string) => {
      const [hours, minutes] = time24.split(":");
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? "PM" : "AM";
      return `${hour12}:${minutes} ${period}`;
    };

    const formattedAvailableSlots = availableTimeSlots.map((slot) => ({
      value: slot,
      label: convertTo12Hour(slot),
    }));

    return NextResponse.json({
      success: true,
      availableSlots: formattedAvailableSlots,
      totalSlots: allTimeSlots.length,
      bookedSlots: bookedTimes.length,
      availableCount: availableTimeSlots.length,
    });
  } catch (error) {
    console.error("Error fetching available time slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available time slots" },
      { status: 500 }
    );
  }
}
