// Define page access permissions for different roles
export const PAGE_ACCESS = {
  CUSTOMER: [
    "/dashboard",
    "/dashboard/appointments",
    "/dashboard/marketplace",
    "/dashboard/profile",
    "/dashboard/pets",
  ],
  PETGROOMER: [
    "/dashboard",
    "/dashboard/appointments",
    "/dashboard/warehouse",
    "/dashboard/profile",
  ],
  VETERINARIAN: [
    "/dashboard",
    "/dashboard/customers",
    "/dashboard/appointments",
    "/dashboard/warehouse",
    "/dashboard/marketplace",
    "/dashboard/reports",
    "/dashboard/profile",
    "/dashboard/settings",
    "/dashboard/pets",
  ],
  SECRETARY: [
    "/dashboard",
    "/dashboard/customers",
    "/dashboard/appointments",
    "/dashboard/warehouse",
    "/dashboard/marketplace",
    "/dashboard/reports",
    "/dashboard/profile",
    "/dashboard/settings",
  ],
  ADMINISTRATOR: [
    "/dashboard",
    "/dashboard/customers",
    "/dashboard/appointments",
    "/dashboard/warehouse",
    "/dashboard/marketplace",
    "/dashboard/reports",
    "/dashboard/profile",
    "/dashboard/settings",
    "/dashboard/admin",
    "/dashboard/pets",
  ],
};

// Admin users have access to everything
const ADMIN_ROLES = ["ADMINISTRATOR", "ADMIN"];

export function hasPageAccess(role: string, path: string): boolean {
  const normalizedRole = role.toUpperCase();

  // Admins have access to everything
  if (ADMIN_ROLES.includes(normalizedRole)) {
    return true;
  }

  const accessiblePaths =
    PAGE_ACCESS[normalizedRole as keyof typeof PAGE_ACCESS] || [];

  // Check for exact match or if the path is a sub-path of an accessible path
  // but ensure we don't allow broader access than intended
  return accessiblePaths.some((accessiblePath) => {
    if (path === accessiblePath) {
      return true;
    }
    // Only allow sub-paths if the accessible path doesn't end with a more specific segment
    // and the next character is a slash (to prevent partial matches)
    if (
      accessiblePath !== "/dashboard" &&
      path.startsWith(accessiblePath + "/")
    ) {
      return true;
    }
    // Special case for /dashboard - only allow if no more specific path exists
    if (accessiblePath === "/dashboard" && path === "/dashboard") {
      return true;
    }
    return false;
  });
}

// Get all accessible routes for a role
export function getAccessibleRoutes(role: string): string[] {
  const normalizedRole = role.toUpperCase();

  // Admins have access to everything - return all unique paths
  if (ADMIN_ROLES.includes(normalizedRole)) {
    return Object.values(PAGE_ACCESS)
      .flat()
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
  }

  return PAGE_ACCESS[normalizedRole as keyof typeof PAGE_ACCESS] || [];
}

// Check if user is an admin
export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role.toUpperCase());
}
