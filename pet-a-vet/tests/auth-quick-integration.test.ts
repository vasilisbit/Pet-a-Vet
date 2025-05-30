/**
 * Quick Authentication Integration Tests
 * Simple tests to verify core authentication functionality
 */

import { jest } from "@jest/globals";

// Mock the external dependencies
jest.mock("../lib/db/models/user");
jest.mock("../lib/db/models/customer");
jest.mock("next/headers");

describe("Authentication Quick Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Login Functionality", () => {
    it("should successfully login with valid credentials", async () => {
      // Mock user model
      const mockUserModel = await import("../lib/db/models/user");
      (mockUserModel as any).findUserByEmail = jest.fn().mockResolvedValue({
        id: 1,
        user_id: 1,
        username: "testuser",
        email: "test@example.com",
        full_name: "Test User",
        role: "CUSTOMER",
        status: "ACTIVE",
        created_at: new Date(),
        phone: "",
        address: "",
        password: "hashedpassword",
      });
      (mockUserModel as any).verifyPassword = jest.fn().mockResolvedValue(true);
      (mockUserModel as any).updateLastLogin = jest
        .fn()
        .mockResolvedValue(undefined);

      // Mock cookies
      const mockCookies = {
        set: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
      };
      const { cookies } = await import("next/headers");
      (cookies as jest.Mock).mockResolvedValue(mockCookies);

      // Test login
      const { loginUser } = await import("../lib/auth");
      const result = await loginUser("test@example.com", "password123");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email", "test@example.com");
      expect(result).toHaveProperty("role", "customer");
      expect(result).toHaveProperty("redirectPath");
      expect(mockCookies.set).toHaveBeenCalled();
    });

    it("should reject login with invalid credentials", async () => {
      const mockUserModel = await import("../lib/db/models/user");
      (mockUserModel as any).findUserByEmail = jest
        .fn()
        .mockResolvedValue(null);

      const { loginUser } = await import("../lib/auth");

      await expect(
        loginUser("invalid@example.com", "wrongpassword")
      ).rejects.toThrow("user_not_found");
    });

    it("should reject login for inactive users", async () => {
      const mockUserModel = await import("../lib/db/models/user");
      (mockUserModel as any).findUserByEmail = jest.fn().mockResolvedValue({
        id: 1,
        user_id: 1,
        username: "testuser",
        email: "test@example.com",
        full_name: "Test User",
        role: "CUSTOMER",
        status: "INACTIVE",
        created_at: new Date(),
        phone: "",
        address: "",
        password: "hashedpassword",
      });

      const { loginUser } = await import("../lib/auth");

      await expect(
        loginUser("test@example.com", "password123")
      ).rejects.toThrow("account_inactive");
    });
  });

  describe("Registration Functionality", () => {
    it("should successfully register new user", async () => {
      const mockUserModel = await import("../lib/db/models/user");
      const mockCustomerModel = await import("../lib/db/models/customer");

      (mockUserModel as any).findUserByEmail = jest
        .fn()
        .mockResolvedValue(null);
      (mockUserModel as any).createUser = jest.fn().mockResolvedValue(1);
      (mockCustomerModel as any).createCustomer = jest
        .fn()
        .mockResolvedValue(undefined);

      const mockCookies = {
        set: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
      };
      const { cookies } = await import("next/headers");
      (cookies as jest.Mock).mockResolvedValue(mockCookies);

      const { registerUser } = await import("../lib/auth");
      const result = await registerUser(
        "John Doe",
        "john@example.com",
        "password123"
      );

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", "John Doe");
      expect(result).toHaveProperty("email", "john@example.com");
      expect(result).toHaveProperty("role", "customer");
      expect(result).toHaveProperty("redirectPath", "/dashboard");
      expect(mockCookies.set).toHaveBeenCalled();
    });

    it("should reject registration with existing email", async () => {
      const mockUserModel = await import("../lib/db/models/user");
      (mockUserModel as any).findUserByEmail = jest.fn().mockResolvedValue({
        id: 1,
        user_id: 1,
        email: "existing@example.com",
      });

      const { registerUser } = await import("../lib/auth");

      await expect(
        registerUser("John Doe", "existing@example.com", "password123")
      ).rejects.toThrow("user_already_exists");
    });

    it("should reject registration with invalid email", async () => {
      const { registerUser } = await import("../lib/auth");

      await expect(
        registerUser("John Doe", "invalid-email", "password123")
      ).rejects.toThrow("invalid_email");
    });

    it("should reject registration with missing fields", async () => {
      const { registerUser } = await import("../lib/auth");

      await expect(
        registerUser("", "john@example.com", "password123")
      ).rejects.toThrow("missing_required_fields");

      await expect(registerUser("John Doe", "", "password123")).rejects.toThrow(
        "missing_required_fields"
      );

      await expect(
        registerUser("John Doe", "john@example.com", "")
      ).rejects.toThrow("missing_required_fields");
    });
  });

  describe("Auth Utils Functionality", () => {
    it("should check permissions correctly", async () => {
      const { hasPermission } = await import("../lib/auth-utils");

      expect(hasPermission("ADMINISTRATOR", "read:pets")).toBe(true);
      expect(hasPermission("ADMINISTRATOR", "admin:access")).toBe(true);
      expect(hasPermission("CUSTOMER", "admin:access")).toBe(false);
      expect(hasPermission("CUSTOMER", "read:pets")).toBe(true);
    });

    it("should get correct redirect paths", async () => {
      const { getDefaultRedirectPath } = await import("../lib/auth-utils");

      expect(getDefaultRedirectPath("ADMINISTRATOR")).toBe("/dashboard/admin");
      expect(getDefaultRedirectPath("VETERINARIAN")).toBe(
        "/dashboard/appointments"
      );
      expect(getDefaultRedirectPath("CUSTOMER")).toBe("/dashboard");
    });

    it("should normalize roles correctly", async () => {
      const { normalizeRole } = await import("../lib/auth-utils");

      expect(normalizeRole("admin")).toBe("ADMINISTRATOR");
      expect(normalizeRole("ADMIN")).toBe("ADMINISTRATOR");
      expect(normalizeRole("customer")).toBe("CUSTOMER");
      expect(normalizeRole("unknown")).toBe("CUSTOMER"); // defaults to customer
    });

    it("should identify admin roles correctly", async () => {
      const { isAdmin } = await import("../lib/auth-utils");

      expect(isAdmin("ADMINISTRATOR")).toBe(true);
      expect(isAdmin("ADMIN")).toBe(true);
      expect(isAdmin("CUSTOMER")).toBe(false);
      expect(isAdmin("VETERINARIAN")).toBe(false);
    });
  });

  describe("Session Management", () => {
    it("should get current user from cookie", async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({
          value: JSON.stringify({
            id: 1,
            name: "Test User",
            email: "test@example.com",
            role: "customer",
          }),
        }),
      };
      const { cookies } = await import("next/headers");
      (cookies as jest.Mock).mockResolvedValue(mockCookies);

      const { getCurrentUser } = await import("../lib/auth");
      const user = await getCurrentUser();

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("email", "test@example.com");
    });

    it("should return null when no auth cookie exists", async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue(undefined),
      };
      const { cookies } = await import("next/headers");
      (cookies as jest.Mock).mockResolvedValue(mockCookies);

      const { getCurrentUser } = await import("../lib/auth");
      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    it("should check authentication status", async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({
          value: JSON.stringify({ id: 1, email: "test@example.com" }),
        }),
      };
      const { cookies } = await import("next/headers");
      (cookies as jest.Mock).mockResolvedValue(mockCookies);

      const { isAuthenticated } = await import("../lib/auth");
      const authenticated = await isAuthenticated();

      expect(authenticated).toBe(true);
    });

    it("should logout user correctly", async () => {
      const mockCookies = {
        delete: jest.fn(),
      };
      const { cookies } = await import("next/headers");
      (cookies as jest.Mock).mockResolvedValue(mockCookies);

      const { logoutUser } = await import("../lib/auth");
      await logoutUser();

      expect(mockCookies.delete).toHaveBeenCalledWith("auth-token");
    });
  });
});
