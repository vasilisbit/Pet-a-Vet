import { query } from "../connection"
import type { Administrator } from "./interfaces"

export async function findAdminById(adminId: number): Promise<Administrator | null> {
  try {
    const admins = await query<Administrator[]>(
      `SELECT u.*, a.* 
       FROM Administrator a 
       JOIN User u ON a.admin_id = u.user_id 
       WHERE a.admin_id = ?`,
      [adminId],
    )
    return admins.length > 0 ? admins[0] : null
  } catch (error) {
    console.error("Error finding admin by ID:", error)
    throw error
  }
}

export async function createAdministrator(userId: number): Promise<boolean> {
  try {
    const result = await query<any>("INSERT INTO Administrator (admin_id, admin_level) VALUES (?, ?)", [userId, 1])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error creating administrator:", error)
    throw error
  }
}

export async function updateAdminLevel(adminId: number, level: number): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE Administrator SET admin_level = ? WHERE admin_id = ?", [level, adminId])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating admin level:", error)
    throw error
  }
}

export async function updateAdminRights(adminId: number, rights: any): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE Administrator SET access_rights = ? WHERE admin_id = ?", [
      JSON.stringify(rights),
      adminId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating admin rights:", error)
    throw error
  }
}
