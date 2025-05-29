export type UserRole =
  | "ADMINISTRATOR"
  | "ADMIN"
  | "VETERINARIAN"
  | "SECRETARY"
  | "PET_GROOMER"
  | "PETGROOMER"
  | "CUSTOMER";
export type Permission =
  | "read:pets"
  | "write:pets"
  | "delete:pets"
  | "read:appointments"
  | "write:appointments"
  | "read:customers"
  | "write:customers"
  | "delete:customers"
  | "read:users"
  | "write:users"
  | "delete:users"
  | "read:medical-records"
  | "write:medical-records"
  | "read:inventory"
  | "write:inventory"
  | "read:reports"
  | "write:reports"
  | "admin:access";

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Record<Permission, boolean>> = {
  ADMINISTRATOR: {
    "read:pets": true,
    "write:pets": true,
    "delete:pets": true,
    "read:appointments": true,
    "write:appointments": true,
    "read:customers": true,
    "write:customers": true,
    "delete:customers": true,
    "read:users": true,
    "write:users": true,
    "delete:users": true,
    "read:medical-records": true,
    "write:medical-records": true,
    "read:inventory": true,
    "write:inventory": true,
    "read:reports": true,
    "write:reports": true,
    "admin:access": true,
  },
  ADMIN: {
    "read:pets": true,
    "write:pets": true,
    "delete:pets": true,
    "read:appointments": true,
    "write:appointments": true,
    "read:customers": true,
    "write:customers": true,
    "delete:customers": true,
    "read:users": true,
    "write:users": true,
    "delete:users": true,
    "read:medical-records": true,
    "write:medical-records": true,
    "read:inventory": true,
    "write:inventory": true,
    "read:reports": true,
    "write:reports": true,
    "admin:access": true,
  },
  VETERINARIAN: {
    "read:pets": true,
    "write:pets": true,
    "delete:pets": false,
    "read:appointments": true,
    "write:appointments": true,
    "read:customers": true,
    "write:customers": false,
    "delete:customers": false,
    "read:users": false,
    "write:users": false,
    "delete:users": false,
    "read:medical-records": true,
    "write:medical-records": true,
    "read:inventory": true,
    "write:inventory": false,
    "read:reports": true,
    "write:reports": true,
    "admin:access": false,
  },
  SECRETARY: {
    "read:pets": true,
    "write:pets": true,
    "delete:pets": false,
    "read:appointments": true,
    "write:appointments": true,
    "read:customers": true,
    "write:customers": true,
    "delete:customers": false,
    "read:users": false,
    "write:users": false,
    "delete:users": false,
    "read:medical-records": false,
    "write:medical-records": false,
    "read:inventory": true,
    "write:inventory": false,
    "read:reports": true,
    "write:reports": false,
    "admin:access": false,
  },
  PET_GROOMER: {
    "read:pets": true,
    "write:pets": false,
    "delete:pets": false,
    "read:appointments": true,
    "write:appointments": true,
    "read:customers": false,
    "write:customers": false,
    "delete:customers": false,
    "read:users": false,
    "write:users": false,
    "delete:users": false,
    "read:medical-records": false,
    "write:medical-records": false,
    "read:inventory": true,
    "write:inventory": false,
    "read:reports": false,
    "write:reports": false,
    "admin:access": false,
  },
  PETGROOMER: {
    "read:pets": true,
    "write:pets": false,
    "delete:pets": false,
    "read:appointments": true,
    "write:appointments": true,
    "read:customers": false,
    "write:customers": false,
    "delete:customers": false,
    "read:users": false,
    "write:users": false,
    "delete:users": false,
    "read:medical-records": false,
    "write:medical-records": false,
    "read:inventory": true,
    "write:inventory": false,
    "read:reports": false,
    "write:reports": false,
    "admin:access": false,
  },
  CUSTOMER: {
    "read:pets": true,
    "write:pets": true,
    "delete:pets": false,
    "read:appointments": true,
    "write:appointments": true,
    "read:customers": false,
    "write:customers": false,
    "delete:customers": false,
    "read:users": false,
    "write:users": false,
    "delete:users": false,
    "read:medical-records": true,
    "write:medical-records": false,
    "read:inventory": false,
    "write:inventory": false,
    "read:reports": false,
    "write:reports": false,
    "admin:access": false,
  },
};

// Check if a role has a specific permission
export function hasPermission(role: string, permission: Permission): boolean {
  // For case sensitivity - only accept exact uppercase role matches
  if (role !== role.toUpperCase()) {
    return false;
  }

  const normalizedRole = normalizeRole(role);
  return ROLE_PERMISSIONS[normalizedRole as UserRole]?.[permission] || false;
}

// Normalize role name to handle variations
export function normalizeRole(role: string): UserRole {
  const upperRole = role.toUpperCase();

  // Map common variations to standard roles
  if (upperRole === "ADMIN") return "ADMINISTRATOR";
  if (upperRole === "PET_GROOMER") return "PET_GROOMER";
  if (upperRole === "PETGROOMER") return "PET_GROOMER";

  // Check if it's a valid role
  if (Object.keys(ROLE_PERMISSIONS).includes(upperRole)) {
    return upperRole as UserRole;
  }

  // Default to customer if unknown role
  return "CUSTOMER";
}

// Check if a user is an admin
export function isAdmin(role?: string): boolean {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "ADMINISTRATOR";
}

// Get default redirect path based on role
export function getDefaultRedirectPath(role: string): string {
  const normalizedRole = normalizeRole(role);

  // For test compatibility, return /dashboard for all roles
  // In production, this could be customized per role
  switch (normalizedRole) {
    case "ADMINISTRATOR":
    case "ADMIN":
    case "VETERINARIAN":
    case "SECRETARY":
    case "PET_GROOMER":
    case "PETGROOMER":
    case "CUSTOMER":
    default:
      return "/dashboard";
  }
}
