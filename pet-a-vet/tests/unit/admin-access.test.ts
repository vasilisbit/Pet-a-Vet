import { isAdmin, normalizeRole, hasPermission } from "@/lib/auth-utils";

describe("Admin Access Control", () => {
  // Test role normalization
  test("normalizeRole correctly handles different admin role formats", () => {
    expect(normalizeRole("ADMINISTRATOR")).toBe("ADMINISTRATOR");
    expect(normalizeRole("administrator")).toBe("ADMINISTRATOR");
    expect(normalizeRole("Admin")).toBe("ADMINISTRATOR");
    expect(normalizeRole("ADMIN")).toBe("ADMINISTRATOR");
  });

  // Test admin detection
  test("isAdmin correctly identifies admin users", () => {
    expect(isAdmin("ADMINISTRATOR")).toBe(true);
    expect(isAdmin("administrator")).toBe(true);
    expect(isAdmin("Admin")).toBe(true);
    expect(isAdmin("ADMIN")).toBe(true);
    expect(isAdmin("CUSTOMER")).toBe(false);
    expect(isAdmin("VETERINARIAN")).toBe(false);
  });

  // Test permissions
  test("Admin users have all permissions", () => {
    const permissions = [
      "read:pets",
      "write:pets",
      "read:customers",
      "write:customers",
      "read:appointments",
      "write:appointments",
      "read:inventory",
      "write:inventory",
      "read:reports",
      "write:reports",
      "admin:access",
    ];

    permissions.forEach((permission) => {
      expect(hasPermission("ADMINISTRATOR", permission as any)).toBe(true);
      expect(hasPermission("admin", permission as any)).toBe(true);
    });
  });
});
