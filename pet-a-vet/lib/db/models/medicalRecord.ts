import { query } from "../connection";
import type { MedicalRecord } from "./interfaces";

export async function findMedicalRecordById(
  recordId: number
): Promise<MedicalRecord | null> {
  try {
    const records = await query<MedicalRecord[]>(
      "SELECT * FROM MedicalRecord WHERE record_id = ?",
      [recordId]
    );
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error("Error finding medical record by ID:", error);
    throw error;
  }
}

// Alias for compatibility with existing code
export const getMedicalRecordById = findMedicalRecordById;

export async function findMedicalRecordsByPetId(
  petId: number
): Promise<MedicalRecord[]> {
  try {
    return await query<MedicalRecord[]>(
      "SELECT * FROM MedicalRecord WHERE pet_id = ? ORDER BY record_date DESC",
      [petId]
    );
  } catch (error) {
    console.error("Error finding medical records by pet ID:", error);
    throw error;
  }
}

// Alias for compatibility with existing code
export const getMedicalRecordsByPetId = findMedicalRecordsByPetId;

export async function findMedicalRecordsByVeterinarianId(
  veterinarianId: number
): Promise<MedicalRecord[]> {
  try {
    return await query<MedicalRecord[]>(
      "SELECT * FROM MedicalRecord WHERE veterinarian_id = ? ORDER BY record_date DESC",
      [veterinarianId]
    );
  } catch (error) {
    console.error("Error finding medical records by veterinarian ID:", error);
    throw error;
  }
}

// Add the missing functions required by the application
export async function findMedicalRecordsByAppointmentId(
  appointmentId: number
): Promise<MedicalRecord[]> {
  try {
    return await query<MedicalRecord[]>(
      "SELECT * FROM MedicalRecord WHERE appointment_id = ? ORDER BY record_date DESC",
      [appointmentId]
    );
  } catch (error) {
    console.error("Error finding medical records by appointment ID:", error);
    throw error;
  }
}

// Alias for compatibility with existing code
export const getMedicalRecordsByAppointmentId =
  findMedicalRecordsByAppointmentId;

export async function findAllMedicalRecords(): Promise<MedicalRecord[]> {
  try {
    return await query<MedicalRecord[]>(
      "SELECT * FROM MedicalRecord ORDER BY record_date DESC"
    );
  } catch (error) {
    console.error("Error finding all medical records:", error);
    throw error;
  }
}

// Alias for compatibility with existing code
export const getAllMedicalRecords = findAllMedicalRecords;

export async function createMedicalRecord(
  recordData: Omit<MedicalRecord, "record_id" | "record_date">
): Promise<number> {
  try {
    const result = await query<any>(
      `INSERT INTO MedicalRecord (pet_id, veterinarian_id, appointment_id, diagnosis, treatment, prescription, follow_up_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recordData.pet_id,
        recordData.veterinarian_id,
        recordData.appointment_id || null,
        recordData.diagnosis || null,
        recordData.treatment || null,
        recordData.prescription || null,
        recordData.follow_up_date || null,
        recordData.status,
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error("Error creating medical record:", error);
    throw error;
  }
}

export async function updateMedicalRecord(
  recordId: number,
  recordData: Partial<MedicalRecord>
): Promise<boolean> {
  try {
    // Build the SET part of the query dynamically
    const fields = Object.keys(recordData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(recordData);

    if (fields.length === 0) {
      return false; // Nothing to update
    }

    const result = await query<any>(
      `UPDATE MedicalRecord SET ${fields} WHERE record_id = ?`,
      [...values, recordId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating medical record:", error);
    throw error;
  }
}

export async function deleteMedicalRecord(recordId: number): Promise<boolean> {
  try {
    // In a real application, you might want to implement soft delete instead
    const result = await query<any>(
      "DELETE FROM MedicalRecord WHERE record_id = ?",
      [recordId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting medical record:", error);
    throw error;
  }
}
