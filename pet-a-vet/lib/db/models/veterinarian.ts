import { query } from "../connection"
import type { Veterinarian } from "./interfaces"

export async function findVeterinarianById(veterinarianId: number): Promise<Veterinarian | null> {
  try {
    const veterinarians = await query<Veterinarian[]>(
      `SELECT u.*, v.* 
       FROM Veterinarian v 
       JOIN User u ON v.veterinarian_id = u.user_id 
       WHERE v.veterinarian_id = ?`,
      [veterinarianId],
    )
    return veterinarians.length > 0 ? veterinarians[0] : null
  } catch (error) {
    console.error("Error finding veterinarian by ID:", error)
    throw error
  }
}

export async function findAllVeterinarians(): Promise<Veterinarian[]> {
  try {
    return await query<Veterinarian[]>(
      `SELECT u.*, v.* 
       FROM Veterinarian v 
       JOIN User u ON v.veterinarian_id = u.user_id 
       WHERE u.status = 'ACTIVE'
       ORDER BY u.full_name`,
    )
  } catch (error) {
    console.error("Error finding all veterinarians:", error)
    throw error
  }
}

export async function createVeterinarian(userId: number, specialization: string): Promise<boolean> {
  try {
    const result = await query<any>(
      "INSERT INTO Veterinarian (veterinarian_id, specialization, license_number) VALUES (?, ?, ?)",
      [userId, specialization, `LIC-${Date.now()}`], // Generate a temporary license number
    )

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error creating veterinarian:", error)
    throw error
  }
}

export async function updateVeterinarianSpecialization(
  veterinarianId: number,
  specialization: string,
): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE Veterinarian SET specialization = ? WHERE veterinarian_id = ?", [
      specialization,
      veterinarianId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating veterinarian specialization:", error)
    throw error
  }
}

export async function updateVeterinarianLicense(veterinarianId: number, licenseNumber: string): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE Veterinarian SET license_number = ? WHERE veterinarian_id = ?", [
      licenseNumber,
      veterinarianId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating veterinarian license:", error)
    throw error
  }
}

export async function updateVeterinarianBio(veterinarianId: number, bio: string): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE Veterinarian SET bio = ? WHERE veterinarian_id = ?", [bio, veterinarianId])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating veterinarian bio:", error)
    throw error
  }
}

export async function updateVeterinarianAvailability(veterinarianId: number, availability: any): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE Veterinarian SET availability = ? WHERE veterinarian_id = ?", [
      JSON.stringify(availability),
      veterinarianId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating veterinarian availability:", error)
    throw error
  }
}
