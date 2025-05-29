"use server";

import { cookies } from "next/headers";
import * as userModel from "./db/models/user";
import * as customerModel from "./db/models/customer";
import type { User } from "./db/models/interfaces";
import {
  ROLE_PERMISSIONS,
  getDefaultRedirectPath,
  type UserRole,
  type Permission,
  isAdmin,
} from "./auth-utils";

export async function loginUser(email: string, password: string) {
  if (!email || !password) {
    throw new Error("empty_fields");
  }

  try {
    // Find user by email
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      throw new Error("user_not_found");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("account_inactive");
    }

    // Verify password
    const isPasswordValid = await userModel.verifyPassword(user, password);

    if (!isPasswordValid) {
      throw new Error("incorrect_password");
    }

    // Update last login timestamp
    await userModel.updateLastLogin(user.user_id);

    // Set authentication cookie
    const cookieStore = await cookies();
    const userData = {
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      role: user.role.toLowerCase(),
      permissions: ROLE_PERMISSIONS[user.role as UserRole] || {},
    };

    cookieStore.set("auth-token", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return {
      ...userData,
      redirectPath: getDefaultRedirectPath(user.role),
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  phone?: string,
  address?: string,
  city?: string,
  postalCode?: string
) {
  // Validate required fields
  if (!name || !email || !password) {
    throw new Error("missing_required_fields");
  }

  // Validate email format
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email) || email.includes("..")) {
    throw new Error("invalid_email");
  }

  try {
    // Check if user already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      throw new Error("user_already_exists");
    }

    // Create username from email
    const username = email.split("@")[0];

    // Format address
    const fullAddress = [address, city, postalCode].filter(Boolean).join(", ");

    // Only customers can register through the public registration form
    const role = "CUSTOMER";

    // Create user
    const userId = await userModel.createUser({
      username,
      password,
      email,
      full_name: name,
      phone: phone || "",
      address: fullAddress,
      role: role as User["role"],
    });

    // Create customer record
    await customerModel.createCustomer(userId);

    // Set authentication cookie
    const cookieStore = await cookies();
    const userData = {
      id: userId,
      name,
      email,
      role: role.toLowerCase(),
      permissions: ROLE_PERMISSIONS.CUSTOMER,
    };

    cookieStore.set("auth-token", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return {
      ...userData,
      redirectPath: getDefaultRedirectPath(role),
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth-token");

  if (!authCookie) {
    return null;
  }

  try {
    return JSON.parse(authCookie.value);
  } catch (error) {
    console.error("Error parsing auth cookie:", error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function hasAdminAccess() {
  const user = await getCurrentUser();
  if (!user) return false;

  return isAdmin(user.role);
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("authentication_required");
  }
  return user;
}

export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth();
  if (user.role.toUpperCase() !== requiredRole) {
    throw new Error("insufficient_permissions");
  }
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuth();
  const { hasPermission } = await import("./auth-utils");
  if (!hasPermission(user.role, permission)) {
    throw new Error("insufficient_permissions");
  }
  return user;
}
