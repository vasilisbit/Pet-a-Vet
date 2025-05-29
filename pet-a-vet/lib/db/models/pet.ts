import { query } from "../connection"
import type { Pet } from "./interfaces"

export async function findPetById(petId: number): Promise<Pet | null> {
  try {
    const pets = await query<Pet[]>("SELECT * FROM Pet WHERE pet_id = ?", [petId])
    return pets.length > 0 ? pets[0] : null
  } catch (error) {
    console.error("Error finding pet by ID:", error)
    throw error
  }
}

export async function findPetsByOwnerId(ownerId: number, includeInactive = false): Promise<Pet[]> {
  try {
    let sql = "SELECT * FROM Pet WHERE owner_id = ?"

    // Only include active pets by default
    if (!includeInactive) {
      sql += " AND status = 'ACTIVE'"
    }

    sql += " ORDER BY name"

    return await query<Pet[]>(sql, [ownerId])
  } catch (error) {
    console.error("Error finding pets by owner ID:", error)
    throw error
  }
}

export async function createPet(petData: Omit<Pet, "pet_id">): Promise<number> {
  try {
    const result = await query<any>(
      `INSERT INTO Pet (owner_id, name, species, breed, birth_date, gender, weight, microchip_id, profile_image, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        petData.owner_id,
        petData.name,
        petData.species,
        petData.breed || null,
        petData.birth_date || null,
        petData.gender,
        petData.weight || null,
        petData.microchip_id || null,
        petData.profile_image || null,
        petData.notes || null,
        petData.status,
      ],
    )

    return result.insertId
  } catch (error) {
    console.error("Error creating pet:", error)
    throw error
  }
}

export async function updatePet(petId: number, petData: Partial<Pet>): Promise<boolean> {
  try {
    // First, get the current pet data to preserve fields not being updated
    const currentPet = await findPetById(petId)
    if (!currentPet) {
      return false
    }

    // Build the SET part of the query dynamically, only for fields that are provided
    const updateFields: string[] = []
    const updateValues: any[] = []

    // Only add fields that are explicitly provided in petData
    Object.keys(petData).forEach((key) => {
      if (petData[key as keyof Pet] !== undefined) {
        updateFields.push(`${key} = ?`)
        updateValues.push(petData[key as keyof Pet])
      }
    })

    if (updateFields.length === 0) {
      return true // Nothing to update, consider it successful
    }

    // Add the petId to the values array for the WHERE clause
    updateValues.push(petId)

    const result = await query<any>(`UPDATE Pet SET ${updateFields.join(", ")} WHERE pet_id = ?`, updateValues)

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating pet:", error)
    throw error
  }
}

export async function deletePet(petId: number): Promise<boolean> {
  try {
    // Soft delete - update status to 'INACTIVE'
    const result = await query<any>('UPDATE Pet SET status = "INACTIVE" WHERE pet_id = ?', [petId])
    return result.affectedRows > 0
  } catch (error) {
    console.error("Error deleting pet:", error)
    throw error
  }
}

export async function hardDeletePet(petId: number): Promise<boolean> {
  try {
    // Hard delete - completely remove from database
    // First check if there are any related records
    const medicalRecords = await query<any[]>("SELECT COUNT(*) as count FROM MedicalRecord WHERE pet_id = ?", [petId])
    const appointments = await query<any[]>("SELECT COUNT(*) as count FROM Appointment WHERE pet_id = ?", [petId])

    const hasMedicalRecords = medicalRecords[0].count > 0
    const hasAppointments = appointments[0].count > 0

    // If there are related records, we should not delete the pet
    if (hasMedicalRecords || hasAppointments) {
      console.warn(`Cannot hard delete pet ${petId} - has related records. Using soft delete instead.`)
      return deletePet(petId)
    }

    // If no related records, proceed with hard delete
    const result = await query<any>("DELETE FROM Pet WHERE pet_id = ?", [petId])
    return result.affectedRows > 0
  } catch (error) {
    console.error("Error hard deleting pet:", error)
    throw error
  }
}

export async function searchPets(searchTerm: string, ownerId?: number, includeInactive = false): Promise<Pet[]> {
  try {
    let sql = "SELECT * FROM Pet WHERE (name LIKE ? OR species LIKE ? OR breed LIKE ?)"
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]

    // Only include active pets by default
    if (!includeInactive) {
      sql += " AND status = 'ACTIVE'"
    }

    if (ownerId) {
      sql += " AND owner_id = ?"
      params.push(ownerId.toString())
    }

    sql += " ORDER BY name"

    return await query<Pet[]>(sql, params)
  } catch (error) {
    console.error("Error searching pets:", error)
    throw error
  }
}

// Add the missing functions
export async function getPetById(petId: number): Promise<Pet | null> {
  return findPetById(petId)
}

export async function getPetsByOwnerId(ownerId: number, includeInactive = false): Promise<Pet[]> {
  return findPetsByOwnerId(ownerId, includeInactive)
}

export async function getAllPets(includeInactive = false): Promise<Pet[]> {
  try {
    let sql = "SELECT * FROM Pet"

    // Only include active pets by default
    if (!includeInactive) {
      sql += " WHERE status = 'ACTIVE'"
    }

    sql += " ORDER BY name"

    return await query<Pet[]>(sql)
  } catch (error) {
    console.error("Error getting all pets:", error)
    throw error
  }
}
