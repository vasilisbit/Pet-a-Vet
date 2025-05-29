import { query } from "../connection";
import type { Appointment } from "./interfaces";

export async function findAppointmentById(
  appointmentId: number
): Promise<Appointment | null> {
  try {
    const appointments = await query<Appointment[]>(
      "SELECT * FROM Appointment WHERE appointment_id = ?",
      [appointmentId]
    );
    return appointments.length > 0 ? appointments[0] : null;
  } catch (error) {
    console.error("Error finding appointment by ID:", error);
    throw error;
  }
}

export async function findAppointmentsByPetId(
  petId: number
): Promise<Appointment[]> {
  try {
    return await query<Appointment[]>(
      "SELECT * FROM Appointment WHERE pet_id = ? ORDER BY appointment_date",
      [petId]
    );
  } catch (error) {
    console.error("Error finding appointments by pet ID:", error);
    throw error;
  }
}

export async function findAppointmentsByProviderId(
  providerId: number
): Promise<Appointment[]> {
  try {
    return await query<Appointment[]>(
      "SELECT * FROM Appointment WHERE service_provider_id = ? ORDER BY appointment_date",
      [providerId]
    );
  } catch (error) {
    console.error("Error finding appointments by provider ID:", error);
    throw error;
  }
}

export async function findAppointmentsByDate(
  date: string
): Promise<Appointment[]> {
  try {
    // Create the start and end date for a single day (inclusive)
    // This ensures all appointments on this day are captured
    return await query<Appointment[]>(
      "SELECT * FROM Appointment WHERE DATE(appointment_date) = DATE(?) ORDER BY appointment_date",
      [date]
    );
  } catch (error) {
    console.error("Error finding appointments by date:", error);
    throw error;
  }
}

export async function createAppointment(
  appointmentData: Omit<
    Appointment,
    "appointment_id" | "created_at" | "updated_at"
  >
): Promise<number> {
  try {
    // Ensure service_type is valid (uppercase and max 20 chars)
    const serviceType = appointmentData.service_type
      .substring(0, 20)
      .toUpperCase();

    const result = await query<any>(
      `INSERT INTO Appointment (pet_id, service_provider_id, creator_id, service_type, appointment_date, duration, reason, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentData.pet_id,
        appointmentData.service_provider_id,
        appointmentData.creator_id,
        serviceType,
        appointmentData.appointment_date,
        appointmentData.duration,
        appointmentData.reason || null,
        appointmentData.notes || null,
        appointmentData.status,
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

export async function updateAppointment(
  appointmentId: number,
  appointmentData: Partial<Appointment>
): Promise<boolean> {
  try {
    // Get current appointment to preserve fields not being updated
    const currentAppointment = await findAppointmentById(appointmentId);
    if (!currentAppointment) {
      return false;
    }

    // Build the SET part of the query dynamically for fields that are provided
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Process each field that might be updated
    if (appointmentData.pet_id !== undefined) {
      updateFields.push("pet_id = ?");
      updateValues.push(appointmentData.pet_id);
    }

    if (appointmentData.service_provider_id !== undefined) {
      updateFields.push("service_provider_id = ?");
      updateValues.push(appointmentData.service_provider_id);
    }

    if (appointmentData.service_type !== undefined) {
      // Ensure service_type is valid (uppercase and max 20 chars)
      const serviceType = appointmentData.service_type
        .substring(0, 20)
        .toUpperCase();
      updateFields.push("service_type = ?");
      updateValues.push(serviceType);
    }

    if (appointmentData.appointment_date !== undefined) {
      updateFields.push("appointment_date = ?");
      updateValues.push(appointmentData.appointment_date);
    }

    if (appointmentData.duration !== undefined) {
      updateFields.push("duration = ?");
      updateValues.push(appointmentData.duration);
    }

    if (appointmentData.reason !== undefined) {
      updateFields.push("reason = ?");
      updateValues.push(appointmentData.reason);
    }

    if (appointmentData.notes !== undefined) {
      updateFields.push("notes = ?");
      updateValues.push(appointmentData.notes);
    }

    if (appointmentData.status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(appointmentData.status);
    }

    // If no fields to update, return true (no-op)
    if (updateFields.length === 0) {
      return true;
    }

    // Add appointmentId to values for WHERE clause
    updateValues.push(appointmentId);

    const result = await query<any>(
      `UPDATE Appointment SET ${updateFields.join(
        ", "
      )} WHERE appointment_id = ?`,
      updateValues
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
}

export async function cancelAppointment(
  appointmentId: number
): Promise<boolean> {
  try {
    const result = await query<any>(
      'UPDATE Appointment SET status = "CANCELLED" WHERE appointment_id = ?',
      [appointmentId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
}

export async function completeAppointment(
  appointmentId: number
): Promise<boolean> {
  try {
    const result = await query<any>(
      'UPDATE Appointment SET status = "COMPLETED" WHERE appointment_id = ?',
      [appointmentId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error completing appointment:", error);
    throw error;
  }
}

export async function checkAvailability(
  providerId: number,
  date: string,
  duration: number
): Promise<boolean> {
  try {
    // Find appointments that overlap with the requested date
    const overlappingAppointments = await query<Appointment[]>(
      `SELECT * FROM Appointment 
       WHERE service_provider_id = ? 
       AND appointment_date = ? 
       AND status NOT IN ('CANCELLED', 'NO_SHOW')`,
      [providerId, date]
    );

    return overlappingAppointments.length === 0;
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error;
  }
}

export async function findAppointmentsByDateRange(
  startDate: string,
  endDate: string
): Promise<Appointment[]> {
  try {
    // Use DATE() function to ensure consistent date comparison
    return await query<Appointment[]>(
      `SELECT * FROM Appointment 
       WHERE DATE(appointment_date) >= DATE(?) AND DATE(appointment_date) <= DATE(?) 
       ORDER BY appointment_date`,
      [startDate, endDate]
    );
  } catch (error) {
    console.error("Error finding appointments by date range:", error);
    throw error;
  }
}

export async function deleteAppointment(
  appointmentId: number
): Promise<boolean> {
  try {
    const result = await query<any>(
      "DELETE FROM Appointment WHERE appointment_id = ?",
      [appointmentId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
}
