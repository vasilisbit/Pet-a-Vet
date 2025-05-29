import { query } from "../connection"
import type { Secretary } from "./interfaces"

export async function findSecretaryById(secretaryId: number): Promise<Secretary | null> {
  try {
    const secretaries = await query<Secretary[]>(
      `SELECT u.*, s.* 
       FROM Secretary s 
       JOIN User u ON s.secretary_id = u.user_id 
       WHERE s.secretary_id = ?`,
      [secretaryId],
    )
    return secretaries.length > 0 ? secretaries[0] : null
  } catch (error) {
    console.error("Error finding secretary by ID:", error)
    throw error
  }
}

export async function createSecretary(userId: number): Promise<boolean> {
  try {
    const result = await query<any>("INSERT INTO Secretary (secretary_id, department) VALUES (?, ?)", [
      userId,
      "General",
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error creating secretary:", error)
    throw error
  }
}

export async function updateSecretaryDepartment(secretaryId: number, department: string): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE Secretary SET department = ? WHERE secretary_id = ?", [
      department,
      secretaryId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating secretary department:", error)
    throw error
  }
}

export async function updateSecretaryPermissions(secretaryId: number, permissions: any): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE Secretary SET permissions = ? WHERE secretary_id = ?", [
      JSON.stringify(permissions),
      secretaryId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating secretary permissions:", error)
    throw error
  }
}
