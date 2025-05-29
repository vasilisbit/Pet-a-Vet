import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import * as appointmentModel from "@/lib/db/models/appointment";
import * as petModel from "@/lib/db/models/pet";
import * as userModel from "@/lib/db/models/user";
import { isAdmin } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const petId = searchParams.get("petId");
    const status = searchParams.get("status");
    const ownerId = searchParams.get("ownerId");
    const veterinarianId = searchParams.get("veterinarianId");
    const isEmergency = searchParams.get("isEmergency");

    let appointments = [];

    if (petId) {
      // Get appointments for a specific pet
      appointments = await appointmentModel.findAppointmentsByPetId(
        Number.parseInt(petId)
      );
    } else if (isAdmin(user.role)) {
      // Admins can see all appointments
      if (date) {
        // Ensure date is properly formatted for database query
        const formattedDate = date.trim();
        appointments = await appointmentModel.findAppointmentsByDate(
          formattedDate
        );
      } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Format dates using local components for consistency
        const formatDateString = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        appointments = await appointmentModel.findAppointmentsByDateRange(
          formatDateString(thirtyDaysAgo),
          formatDateString(thirtyDaysFromNow)
        );
      }
    } else if (user.role === "VETERINARIAN") {
      // Veterinarians see their own appointments
      appointments = await appointmentModel.findAppointmentsByProviderId(
        user.id
      );
    } else {
      // Customers see appointments for their pets
      const pets = await petModel.findPetsByOwnerId(user.id);
      for (const pet of pets) {
        const petAppointments = await appointmentModel.findAppointmentsByPetId(
          pet.pet_id
        );
        appointments.push(...petAppointments);
      }
    }

    // Apply date filter if specified (and not already filtered above)
    if (date && !isAdmin(user.role)) {
      // For non-admin users, ensure precise date filtering that matches database behavior
      appointments = appointments.filter((appointment) => {
        if (!appointment.appointment_date) return false;

        // Create a date object from the stored appointment date
        const d = new Date(appointment.appointment_date);

        // Use database-consistent date extraction
        // This ensures consistency with the MySQL DATE() function
        const appointmentDateStr = d.toISOString().split("T")[0];

        return appointmentDateStr === date;
      });
    }

    // Apply status filter
    if (status) {
      appointments = appointments.filter(
        (appointment) =>
          appointment.status.toUpperCase() === status.toUpperCase()
      );
    }

    // Transform data for frontend
    const transformedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        // Get pet and owner information
        const pet = await petModel.findPetById(appointment.pet_id);
        const owner = pet ? await userModel.findUserById(pet.owner_id) : null;
        const veterinarian = await userModel.findUserById(
          appointment.service_provider_id
        );

        // Format date safely using ISO date extraction to match database behavior
        const formatDate = (date: string | Date | null) => {
          if (!date) return "-";
          try {
            const d = date instanceof Date ? date : new Date(date);
            // Use ISO string date part to match MySQL DATE() function behavior
            return d.toISOString().split("T")[0];
          } catch (e) {
            return "-";
          }
        };

        // Extract time from DATETIME field - use local time consistently
        const extractTime = (dateTime: string | Date | null) => {
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
        };

        return {
          id: appointment.appointment_id.toString(),
          petId: appointment.pet_id.toString(),
          petName: pet?.name || "Unknown Pet",
          ownerId: owner?.user_id.toString() || "",
          ownerName: owner?.full_name || "Unknown Owner",
          veterinarianId: appointment.service_provider_id.toString(),
          veterinarianName: veterinarian?.full_name || "Unknown Veterinarian",
          date: formatDate(appointment.appointment_date),
          time: extractTime(appointment.appointment_date),
          type: appointment.service_type,
          notes: appointment.notes || "",
          status: appointment.status.toLowerCase(),
          isEmergency:
            appointment.reason?.toLowerCase().includes("emergency") || false,
          rejectionReason: appointment.notes,
          notificationSent: false,
          createdAt: formatDate(appointment.created_at),
        };
      })
    );

    return NextResponse.json(transformedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.petId || !data.date || !data.type) {
      return NextResponse.json(
        { error: "Pet, date, and type are required" },
        { status: 400 }
      );
    }

    // Get pet to verify ownership
    const pet = await petModel.findPetById(Number.parseInt(data.petId));
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Check if user can book appointment for this pet
    const canBook =
      pet.owner_id === user.id ||
      isAdmin(user.role) ||
      user.role === "VETERINARIAN" ||
      user.role === "SECRETARY";

    if (!canBook) {
      return NextResponse.json(
        { error: "Not authorized to book appointment for this pet" },
        { status: 403 }
      );
    }

    // Get veterinarian ID (default to first available if not specified)
    let veterinarianId = data.veterinarianId
      ? Number.parseInt(data.veterinarianId)
      : null;
    if (!veterinarianId) {
      // Get first available veterinarian
      const vets = await userModel.findUsersByRole("VETERINARIAN");
      veterinarianId = vets.length > 0 ? vets[0].user_id : user.id;
    }

    // Ensure we have a valid veterinarian ID
    if (!veterinarianId) {
      return NextResponse.json(
        { error: "No veterinarian available for appointment" },
        { status: 400 }
      );
    }

    // Map service types to database enum values
    const mapServiceType = (type: string) => {
      const upperType = type.toUpperCase();
      // Map various service types to database enum values
      if (upperType.includes("GROOMING") || upperType.includes("GROOM")) {
        return "GROOMING";
      }
      // Default all medical-related services to MEDICAL
      return "MEDICAL";
    };

    const serviceType = mapServiceType(data.type);

    // Convert time to 24-hour format for comparison
    const convertTo24Hour = (time12h: string) => {
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
    };

    // Create appointment DATETIME by combining date and time
    // Use explicit timezone handling to prevent date shift issues
    const appointmentTime = convertTo24Hour(data.time || "09:00");

    // Parse the date and time components separately to avoid timezone conversion
    const [year, month, day] = data.date.split("-").map(Number);
    const [hours, minutes] = appointmentTime.split(":").map(Number);

    // Create date using local timezone components (this avoids UTC conversion issues)
    const appointmentDateTime = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      0
    );

    console.log("Appointment creation debug:", {
      inputDate: data.date,
      inputTime: data.time,
      convertedTime: appointmentTime,
      createdDateTime: appointmentDateTime,
      isoString: appointmentDateTime.toISOString(),
      dateExtracted: appointmentDateTime.toISOString().split("T")[0],
    });

    // Check for time conflicts with existing appointments
    const existingAppointments = await appointmentModel.findAppointmentsByDate(
      data.date
    );

    const hasTimeConflict = existingAppointments.some((apt) => {
      if (
        apt.service_provider_id !== veterinarianId ||
        apt.status === "CANCELLED" ||
        apt.status === "NO_SHOW"
      ) {
        return false;
      }

      // Extract time from existing appointment
      const existingDateTime = new Date(apt.appointment_date);
      const existingHours = existingDateTime.getHours();
      const existingMinutes = existingDateTime.getMinutes();
      const existingTimeInMinutes = existingHours * 60 + existingMinutes;

      // Convert new appointment time to minutes
      const newHours = appointmentDateTime.getHours();
      const newMinutes = appointmentDateTime.getMinutes();
      const newTimeInMinutes = newHours * 60 + newMinutes;

      // Check for overlap (assuming 30-minute appointments as per schema default)
      const duration = 30; // minutes
      const timeDifference = Math.abs(existingTimeInMinutes - newTimeInMinutes);

      return timeDifference < duration;
    });

    if (hasTimeConflict) {
      return NextResponse.json(
        {
          error:
            "This veterinarian already has an appointment at this time. Please select a different time slot.",
        },
        { status: 409 }
      );
    }

    // Create appointment with combined DATETIME
    const appointmentId = await appointmentModel.createAppointment({
      id: 0, // Will be auto-generated by database
      pet_id: Number.parseInt(data.petId),
      service_provider_id: veterinarianId,
      creator_id: user.id,
      service_type: serviceType,
      appointment_date: appointmentDateTime,
      appointment_time: appointmentTime, // This might not be used depending on the model
      duration: 30, // Use 30-minute duration to match schema default
      reason: data.notes || null,
      notes: data.notes || null,
      status: "SCHEDULED",
    });

    // Get the created appointment
    const newAppointment = await appointmentModel.findAppointmentById(
      appointmentId
    );
    if (!newAppointment) {
      throw new Error("Failed to create appointment");
    }

    // Get related data
    const owner = pet.owner_id
      ? await userModel.findUserById(pet.owner_id)
      : null;
    const veterinarian = await userModel.findUserById(
      newAppointment.service_provider_id
    );

    // Format date safely using ISO date extraction to match database behavior
    const formatDate = (date: string | Date | null) => {
      if (!date) return "-";
      try {
        const d = date instanceof Date ? date : new Date(date);
        // Use ISO string date part to match MySQL DATE() function behavior
        return d.toISOString().split("T")[0];
      } catch (e) {
        return "-";
      }
    };

    // Extract time from DATETIME field - use local time consistently
    const extractTime = (dateTime: string | Date | null) => {
      if (!dateTime) return "09:00";
      try {
        const d = dateTime instanceof Date ? dateTime : new Date(dateTime);
        // Use local time components to be consistent
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      } catch (e) {
        return "09:00";
      }
    };

    // Transform data for frontend
    const transformedAppointment = {
      id: newAppointment.appointment_id.toString(),
      petId: newAppointment.pet_id.toString(),
      petName: pet.name,
      ownerId: owner?.user_id.toString() || "",
      ownerName: owner?.full_name || "Unknown Owner",
      veterinarianId: newAppointment.service_provider_id.toString(),
      veterinarianName: veterinarian?.full_name || "Unknown Veterinarian",
      date: formatDate(newAppointment.appointment_date),
      time: extractTime(newAppointment.appointment_date), // Use consistent extraction
      type: newAppointment.service_type,
      notes: newAppointment.notes || "",
      status: newAppointment.status.toLowerCase(),
      isEmergency: data.isEmergency || false,
      rejectionReason: null,
      notificationSent: false,
      createdAt: formatDate(newAppointment.created_at),
    };

    return NextResponse.json(transformedAppointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Find the appointment
    const appointment = await appointmentModel.findAppointmentById(
      Number.parseInt(data.id)
    );
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Get pet to check ownership
    const pet = await petModel.findPetById(appointment.pet_id);
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Check permissions
    const isOwner = user.id === pet.owner_id;
    const isVet = user.id === appointment.service_provider_id;
    const hasAccess = isAdmin(user.role) || ["SECRETARY"].includes(user.role);

    if (!isOwner && !isVet && !hasAccess) {
      return NextResponse.json(
        { error: "Not authorized to update this appointment" },
        { status: 403 }
      );
    }

    // Map service types to database enum values
    const mapServiceType = (type: string) => {
      const upperType = type.toUpperCase();
      // Map various service types to database enum values
      if (upperType.includes("GROOMING") || upperType.includes("GROOM")) {
        return "GROOMING";
      }
      // Default all medical-related services to MEDICAL
      return "MEDICAL";
    };

    // Convert time to 24-hour format for comparison
    const convertTo24Hour = (time12h: string) => {
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
    };

    // Prepare update data
    const updateData: Partial<typeof appointment> = {};

    // Handle date and time updates with timezone-safe creation
    if (data.date || data.time) {
      // Get current date components using local time if not provided
      let appointmentDate = data.date;
      if (!appointmentDate && appointment.appointment_date) {
        const currentDate = new Date(appointment.appointment_date);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        appointmentDate = `${year}-${month}-${day}`;
      }

      const appointmentTime = convertTo24Hour(data.time || "09:00");

      // Use explicit timezone handling to prevent date shift issues
      const [year, month, day] = appointmentDate.split("-").map(Number);
      const [hours, minutes] = appointmentTime.split(":").map(Number);
      const appointmentDateTime = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes,
        0
      );

      console.log("Appointment update debug:", {
        inputDate: appointmentDate,
        inputTime: data.time,
        convertedTime: appointmentTime,
        createdDateTime: appointmentDateTime,
        isoString: appointmentDateTime.toISOString(),
        dateExtracted: appointmentDateTime.toISOString().split("T")[0],
      });

      updateData.appointment_date = appointmentDateTime;
    }

    // Handle other updates
    if (data.type) updateData.service_type = mapServiceType(data.type);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status) updateData.status = data.status.toUpperCase();

    // Update appointment
    await appointmentModel.updateAppointment(
      Number.parseInt(data.id),
      updateData
    );

    // Get updated appointment
    const updatedAppointment = await appointmentModel.findAppointmentById(
      Number.parseInt(data.id)
    );
    if (!updatedAppointment) {
      throw new Error("Failed to get updated appointment");
    }

    // Get related data
    const owner = await userModel.findUserById(pet.owner_id);
    const veterinarian = await userModel.findUserById(
      updatedAppointment.service_provider_id
    );

    // Format date safely using ISO date extraction to match database behavior
    const formatDate = (date: string | Date | null) => {
      if (!date) return "-";
      try {
        const d = date instanceof Date ? date : new Date(date);
        // Use ISO string date part to match MySQL DATE() function behavior
        return d.toISOString().split("T")[0];
      } catch (e) {
        return "-";
      }
    };

    // Extract time from DATETIME field using local time components
    const extractTime = (dateTime: string | Date | null) => {
      if (!dateTime) return "09:00";
      try {
        const d = dateTime instanceof Date ? dateTime : new Date(dateTime);
        // Use local time components to be consistent
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      } catch (e) {
        return "09:00";
      }
    };

    // Transform data for frontend
    const transformedAppointment = {
      id: updatedAppointment.appointment_id.toString(),
      petId: updatedAppointment.pet_id.toString(),
      petName: pet.name,
      ownerId: owner?.user_id.toString() || "",
      ownerName: owner?.full_name || "Unknown Owner",
      veterinarianId: updatedAppointment.service_provider_id.toString(),
      veterinarianName: veterinarian?.full_name || "Unknown Veterinarian",
      date: formatDate(updatedAppointment.appointment_date),
      time: extractTime(updatedAppointment.appointment_date),
      type: updatedAppointment.service_type,
      notes: updatedAppointment.notes || "",
      status: updatedAppointment.status.toLowerCase(),
      isEmergency: data.isEmergency || false,
      rejectionReason: null,
      notificationSent: false,
      createdAt: formatDate(updatedAppointment.created_at),
    };

    return NextResponse.json(transformedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Appointment ID is required" },
      { status: 400 }
    );
  }

  try {
    // Find the appointment
    const appointment = await appointmentModel.findAppointmentById(
      Number.parseInt(id)
    );
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Get pet to check ownership
    const pet = await petModel.findPetById(appointment.pet_id);
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Check permissions
    const isOwner = user.id === pet.owner_id;
    const isVet = user.id === appointment.service_provider_id;
    const hasAccess = isAdmin(user.role) || ["SECRETARY"].includes(user.role);

    if (!isOwner && !isVet && !hasAccess) {
      return NextResponse.json(
        { error: "Not authorized to delete this appointment" },
        { status: 403 }
      );
    }

    // Delete appointment
    await appointmentModel.cancelAppointment(Number.parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
