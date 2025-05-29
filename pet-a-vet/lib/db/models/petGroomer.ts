import { query } from "../connection"
import type { PetGroomer } from "./interfaces"

export async function findGroomerById(groomerId: number): Promise<PetGroomer | null> {
  try {
    const groomers = await query<PetGroomer[]>(
      `SELECT u.*, g.* 
       FROM PetGroomer g 
       JOIN User u ON g.groomer_id = u.user_id 
       WHERE g.groomer_id = ?`,
      [groomerId],
    )
    return groomers.length > 0 ? groomers[0] : null
  } catch (error) {
    console.error("Error finding groomer by ID:", error)
    throw error
  }
}

export async function findAllGroomers(): Promise<PetGroomer[]> {
  try {
    return await query<PetGroomer[]>(
      `SELECT u.*, g.* 
       FROM PetGroomer g 
       JOIN User u ON g.groomer_id = u.user_id 
       WHERE u.status = 'ACTIVE'
       ORDER BY u.full_name`,
    )
  } catch (error) {
    console.error("Error finding all groomers:", error)
    throw error
  }
}

export async function createPetGroomer(userId: number): Promise<boolean> {
  try {
    const result = await query<any>("INSERT INTO PetGroomer (groomer_id, specialization) VALUES (?, ?)", [
      userId,
      "General",
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error creating pet groomer:", error)
    throw error
  }
}

export async function updateGroomerSpecialization(groomerId: number, specialization: string): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE PetGroomer SET specialization = ? WHERE groomer_id = ?", [
      specialization,
      groomerId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating groomer specialization:", error)
    throw error
  }
}

export async function updateGroomerAvailability(groomerId: number, availability: any): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE PetGroomer SET availability = ? WHERE groomer_id = ?", [
      JSON.stringify(availability),
      groomerId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating groomer availability:", error)
    throw error
  }
}

export async function updateGroomerServices(groomerId: number, services: any): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE PetGroomer SET services_offered = ? WHERE groomer_id = ?", [
      JSON.stringify(services),
      groomerId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating groomer services:", error)
    throw error
  }
}
