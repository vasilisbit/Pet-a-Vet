import { query } from "../connection"
import type { User } from "./interfaces"
import bcrypt from "bcryptjs"

export async function findUserById(userId: number): Promise<User | null> {
  try {
    const users = await query<User[]>("SELECT * FROM User WHERE user_id = ?", [userId])
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Error finding user by ID:", error)
    throw error
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await query<User[]>("SELECT * FROM User WHERE email = ?", [email])
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Error finding user by email:", error)
    throw error
  }
}

export async function findUserByUsername(username: string): Promise<User | null> {
  try {
    const users = await query<User[]>("SELECT * FROM User WHERE username = ?", [username])
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Error finding user by username:", error)
    throw error
  }
}

export async function findUsersByRole(role: string): Promise<User[]> {
  try {
    const users = await query<User[]>("SELECT * FROM User WHERE role = ?", [role])
    return users
  } catch (error) {
    console.error("Error finding users by role:", error)
    throw error
  }
}

export async function createUser(userData: Omit<User, "user_id" | "created_at" | "status">): Promise<number> {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const result = await query<any>(
      `INSERT INTO User (username, password, email, full_name, phone, address, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.username,
        hashedPassword,
        userData.email,
        userData.full_name,
        userData.phone,
        userData.address,
        userData.role,
      ],
    )

    return result.insertId
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUser(userId: number, userData: Partial<User>): Promise<boolean> {
  try {
    // Don't allow updating the password through this function
    const { password, ...updateData } = userData

    // Build the SET part of the query dynamically
    const fields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(", ")
    const values = Object.values(updateData)

    if (fields.length === 0) {
      return false // Nothing to update
    }

    const result = await query<any>(`UPDATE User SET ${fields} WHERE user_id = ?`, [...values, userId])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

export async function updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const result = await query<any>("UPDATE User SET password = ? WHERE user_id = ?", [hashedPassword, userId])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating user password:", error)
    throw error
  }
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, user.password)
  } catch (error) {
    console.error("Error verifying password:", error)
    throw error
  }
}

export async function updateLastLogin(userId: number): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE User SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?", [userId])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating last login:", error)
    throw error
  }
}

export async function deactivateUser(userId: number): Promise<boolean> {
  try {
    const result = await query<any>('UPDATE User SET status = "INACTIVE" WHERE user_id = ?', [userId])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error deactivating user:", error)
    throw error
  }
}
