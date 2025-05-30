import { describe, it, expect } from "@jest/globals";
import {
  hasPageAccess,
  getAccessibleRoutes,
  isAdminRole,
} from "@/lib/role-access";
import { hasPermission, normalizeRole, isAdmin } from "@/lib/auth-utils";

describe("Admin Access Control", () => {
  describe("Role Access", () => {
    it("should grant ADMINISTRATOR role access to all pages", () => {
      const adminPages = [
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
        "/dashboard/any-future-page",
      ];

      adminPages.forEach((page) => {
        expect(hasPageAccess("ADMINISTRATOR", page)).toBe(true);
        expect(hasPageAccess("administrator", page)).toBe(true); // Case insensitive
        expect(hasPageAccess("ADMIN", page)).toBe(true); // Alternative admin role
      });
    });

    it("should restrict non-admin roles appropriately", () => {
      expect(hasPageAccess("CUSTOMER", "/dashboard/admin")).toBe(false);
      expect(hasPageAccess("PETGROOMER", "/dashboard/reports")).toBe(false);
      expect(hasPageAccess("SECRETARY", "/dashboard/admin")).toBe(false);
    });

    it("should identify admin roles correctly", () => {
      expect(isAdminRole("ADMINISTRATOR")).toBe(true);
      expect(isAdminRole("administrator")).toBe(true);
      expect(isAdminRole("ADMIN")).toBe(true);
      expect(isAdminRole("admin")).toBe(true);
      expect(isAdminRole("CUSTOMER")).toBe(false);
    });
  });

  describe("Permission System", () => {
    it("should grant all permissions to ADMINISTRATOR", () => {
      const permissions = [
        "read:pets",
        "write:pets",
        "read:appointments",
        "write:appointments",
        "read:customers",
        "write:customers",
        "read:inventory",
        "write:inventory",
        "read:reports",
        "write:reports",
        "admin:access",
      ];

      permissions.forEach((permission) => {
        expect(hasPermission("ADMINISTRATOR", permission as any)).toBe(true);
      });
    });

    it("should normalize role names correctly", () => {
      expect(normalizeRole("admin")).toBe("ADMINISTRATOR");
      expect(normalizeRole("ADMIN")).toBe("ADMINISTRATOR");
      expect(normalizeRole("administrator")).toBe("ADMINISTRATOR");
      expect(normalizeRole("ADMINISTRATOR")).toBe("ADMINISTRATOR");
    });

    it("should identify admin users correctly", () => {
      expect(isAdmin("ADMINISTRATOR")).toBe(true);
      expect(isAdmin("administrator")).toBe(true);
      expect(isAdmin("ADMIN")).toBe(true);
      expect(isAdmin("admin")).toBe(true);
      expect(isAdmin("CUSTOMER")).toBe(false);
    });
  });

  describe("Route Access", () => {
    it("should return all routes for admin users", () => {
      const adminRoutes = getAccessibleRoutes("ADMINISTRATOR");
      const customerRoutes = getAccessibleRoutes("CUSTOMER");

      expect(adminRoutes.length).toBeGreaterThan(customerRoutes.length);
      expect(adminRoutes).toContain("/dashboard/admin");
      expect(adminRoutes).toContain("/dashboard/reports");
      expect(adminRoutes).toContain("/dashboard/settings");
    });
  });
});
