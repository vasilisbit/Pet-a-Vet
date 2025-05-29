import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import {
  getCurrentUser,
  isAuthenticated,
  hasAdminAccess,
  requireAuth,
  requireRole,
  requirePermission,
  logoutUser,
} from "../../lib/auth";
import {
  hasPermission,
  isAdmin,
  getDefaultRedirectPath,
  ROLE_PERMISSIONS,
  type UserRole,
  type Permission,
} from "../../lib/auth-utils";

// Mock dependencies
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe("Authentication Utils - Unit Tests", () => {
  let mockCookies: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const { cookies } = require("next/headers");
    mockCookies = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should return user when valid auth cookie exists", async () => {
      // Arrange
      const userData = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "customer",
        permissions: {},
      };
      mockCookies.get.mockReturnValue({ value: JSON.stringify(userData) });

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result).toEqual(userData);
      expect(mockCookies.get).toHaveBeenCalledWith("auth-token");
    });

    it("should return null when no auth cookie exists", async () => {
      // Arrange
      mockCookies.get.mockReturnValue(undefined);

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    it("should return null when auth cookie is invalid JSON", async () => {
      // Arrange
      mockCookies.get.mockReturnValue({ value: "invalid-json" });

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    it("should return null when auth cookie is empty", async () => {
      // Arrange
      mockCookies.get.mockReturnValue({ value: "" });

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when user is authenticated", async () => {
      // Arrange
      const userData = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "customer",
      };
      mockCookies.get.mockReturnValue({ value: JSON.stringify(userData) });

      // Act
      const result = await isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it("should return false when user is not authenticated", async () => {
      // Arrange
      mockCookies.get.mockReturnValue(undefined);

      // Act
      const result = await isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("hasAdminAccess", () => {
    it("should return true for administrator role", async () => {
      // Arrange
      const adminUser = {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
        role: "administrator",
      };
      mockCookies.get.mockReturnValue({ value: JSON.stringify(adminUser) });

      // Act
      const result = await hasAdminAccess();

      // Assert
      expect(result).toBe(true);
    });

    it("should return false for non-admin roles", async () => {
      // Arrange
      const customerUser = {
        id: 1,
        name: "Customer",
        email: "customer@example.com",
        role: "customer",
      };
      mockCookies.get.mockReturnValue({ value: JSON.stringify(customerUser) });

      // Act
      const result = await hasAdminAccess();

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when user is not authenticated", async () => {
      // Arrange
      mockCookies.get.mockReturnValue(undefined);

      // Act
      const result = await hasAdminAccess();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("requireAuth", () => {
    it("should return user when authenticated", async () => {
      // Arrange
      const userData = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "customer",
      };
      mockCookies.get.mockReturnValue({ value: JSON.stringify(userData) });

      // Act
      const result = await requireAuth();

      // Assert
      expect(result).toEqual(userData);
    });

    it("should throw error when not authenticated", async () => {
      // Arrange
      mockCookies.get.mockReturnValue(undefined);

      // Act & Assert
      await expect(requireAuth()).rejects.toThrow("authentication_required");
    });
  });

  describe("requireRole", () => {
    it("should return user when role matches", async () => {
      // Arrange
      const userData = {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
        role: "administrator",
      };
      mockCookies.get.mockReturnValue({ value: JSON.stringify(userData) });

      // Act
      const result = await requireRole("ADMINISTRATOR");

      // Assert
      expect(result).toEqual(userData);
    });

    it("should throw error when role does not match", async () => {
      // Arrange
      const userData = {
        id: 1,
        name: "Customer",
        email: "customer@example.com",
        role: "customer",
      };
      mockCookies.get.mockReturnValue({ value: JSON.stringify(userData) });

      // Act & Assert
      await expect(requireRole("ADMINISTRATOR")).rejects.toThrow(
        "insufficient_permissions"
      );
    });

    it("should throw error when not authenticated", async () => {
      // Arrange
      mockCookies.get.mockReturnValue(undefined);

      // Act & Assert
      await expect(requireRole("CUSTOMER")).rejects.toThrow(
        "authentication_required"
      );
    });
  });

  describe("requirePermission", () => {
    it("should return user when permission is granted", async () => {
      // Arrange
      const userData = {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
        role: "ADMINISTRATOR",
        permissions: ROLE_PERMISSIONS.ADMINISTRATOR,
      };
      mockCookies.get.mockReturnValue({ value: JSON.stringify(userData) });

      // Act
      const result = await requirePermission("read:users");

      // Assert
      expect(result).toEqual(userData);
    });
    it("should throw error when permission is not granted", async () => {
      // Arrange
      const userData = {
        id: 1,
        name: "Customer",
        email: "customer@example.com",
        role: "CUSTOMER",
        permissions: ROLE_PERMISSIONS.CUSTOMER,
      };
      mockCookies.get.mockReturnValue({ value: JSON.stringify(userData) });

      // Act & Assert
      await expect(requirePermission("write:users")).rejects.toThrow(
        "insufficient_permissions"
      );
    });
  });

  describe("logoutUser", () => {
    it("should delete auth cookie", async () => {
      // Act
      await logoutUser();

      // Assert
      expect(mockCookies.delete).toHaveBeenCalledWith("auth-token");
    });
  });

  describe("Auth Utils Functions", () => {
    describe("hasPermission", () => {
      it("should return true for administrator with any permission", () => {
        expect(hasPermission("ADMINISTRATOR", "read:users")).toBe(true);
        expect(hasPermission("ADMINISTRATOR", "write:pets")).toBe(true);
        expect(hasPermission("ADMINISTRATOR", "delete:customers")).toBe(true);
      });

      it("should return correct permissions for veterinarian", () => {
        expect(hasPermission("VETERINARIAN", "read:pets")).toBe(true);
        expect(hasPermission("VETERINARIAN", "write:pets")).toBe(true);
        expect(hasPermission("VETERINARIAN", "read:medical-records")).toBe(
          true
        );
        expect(hasPermission("VETERINARIAN", "write:medical-records")).toBe(
          true
        );
        expect(hasPermission("VETERINARIAN", "delete:users")).toBe(false);
      });

      it("should return correct permissions for customer", () => {
        expect(hasPermission("CUSTOMER", "read:pets")).toBe(true);
        expect(hasPermission("CUSTOMER", "write:pets")).toBe(true);
        expect(hasPermission("CUSTOMER", "read:medical-records")).toBe(true);
        expect(hasPermission("CUSTOMER", "write:users")).toBe(false);
        expect(hasPermission("CUSTOMER", "delete:pets")).toBe(false);
      });

      it("should return false for invalid role", () => {
        expect(hasPermission("INVALID_ROLE" as UserRole, "read:users")).toBe(
          false
        );
      });

      it("should handle case sensitivity", () => {
        expect(hasPermission("administrator" as UserRole, "read:users")).toBe(
          false
        );
        expect(hasPermission("ADMINISTRATOR", "read:users")).toBe(true);
      });
    });

    describe("isAdmin", () => {
      it("should return true for administrator role", () => {
        expect(isAdmin("ADMINISTRATOR")).toBe(true);
        expect(isAdmin("administrator")).toBe(true);
      });

      it("should return false for non-admin roles", () => {
        expect(isAdmin("CUSTOMER")).toBe(false);
        expect(isAdmin("VETERINARIAN")).toBe(false);
        expect(isAdmin("SECRETARY")).toBe(false);
        expect(isAdmin("PET_GROOMER")).toBe(false);
      });

      it("should return false for invalid roles", () => {
        expect(isAdmin("INVALID_ROLE")).toBe(false);
        expect(isAdmin("")).toBe(false);
      });
    });

    describe("getDefaultRedirectPath", () => {
      it("should return correct paths for different roles", () => {
        expect(getDefaultRedirectPath("ADMINISTRATOR")).toBe("/dashboard");
        expect(getDefaultRedirectPath("VETERINARIAN")).toBe("/dashboard");
        expect(getDefaultRedirectPath("SECRETARY")).toBe("/dashboard");
        expect(getDefaultRedirectPath("PET_GROOMER")).toBe("/dashboard");
        expect(getDefaultRedirectPath("CUSTOMER")).toBe("/dashboard");
      });

      it("should handle case insensitive roles", () => {
        expect(getDefaultRedirectPath("administrator")).toBe("/dashboard");
        expect(getDefaultRedirectPath("customer")).toBe("/dashboard");
      });

      it("should return default path for invalid roles", () => {
        expect(getDefaultRedirectPath("INVALID_ROLE")).toBe("/dashboard");
      });
    });
  });

  describe("ROLE_PERMISSIONS Constants", () => {
    it("should have permissions defined for all roles", () => {
      expect(ROLE_PERMISSIONS.ADMINISTRATOR).toBeDefined();
      expect(ROLE_PERMISSIONS.VETERINARIAN).toBeDefined();
      expect(ROLE_PERMISSIONS.SECRETARY).toBeDefined();
      expect(ROLE_PERMISSIONS.PET_GROOMER).toBeDefined();
      expect(ROLE_PERMISSIONS.CUSTOMER).toBeDefined();
    });

    it("should have administrator with comprehensive permissions", () => {
      const adminPerms = ROLE_PERMISSIONS.ADMINISTRATOR;
      expect(adminPerms["read:users"]).toBe(true);
      expect(adminPerms["write:users"]).toBe(true);
      expect(adminPerms["delete:users"]).toBe(true);
      expect(adminPerms["read:pets"]).toBe(true);
      expect(adminPerms["write:pets"]).toBe(true);
    });

    it("should have customer with limited permissions", () => {
      const customerPerms = ROLE_PERMISSIONS.CUSTOMER;
      expect(customerPerms["read:pets"]).toBe(true);
      expect(customerPerms["write:pets"]).toBe(true);
      expect(customerPerms["delete:users"]).toBe(false);
      expect(customerPerms["write:users"]).toBe(false);
    });
  });

  describe("Security Edge Cases", () => {
    it("should handle corrupted cookie data gracefully", async () => {
      // Arrange
      mockCookies.get.mockReturnValue({ value: "corrupted-base64-!@#$%" });

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    it("should handle missing cookie properties", async () => {
      // Arrange
      mockCookies.get.mockReturnValue({ value: "{}" });

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result).toEqual({});
    });

    it("should handle null cookie value", async () => {
      // Arrange
      mockCookies.get.mockReturnValue({ value: null });

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });
  });
});
