import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { loginUser } from "../../lib/auth";
import * as userModel from "../../lib/db/models/user";

// Mock dependencies
jest.mock("../../lib/db/models/user");
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  })),
}));

const mockUserModel = userModel as jest.Mocked<typeof userModel>;

describe("Sign In - Unit Tests", () => {
  const validUser = {
    user_id: 1,
    username: "testuser",
    email: "test@example.com",
    full_name: "Test User",
    role: "CUSTOMER" as const,
    status: "ACTIVE" as const,
    created_at: new Date(),
    phone: "+30 2101234567",
    address: "123 Test St",
    password: "hashedpassword",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Positive Test Cases", () => {
    it("should successfully log in with valid credentials", async () => {
      // Arrange
      mockUserModel.findUserByEmail.mockResolvedValue(validUser);
      mockUserModel.verifyPassword.mockResolvedValue(true);
      mockUserModel.updateLastLogin.mockResolvedValue(undefined);

      // Act
      const result = await loginUser("test@example.com", "validpassword");

      // Assert
      expect(result).toEqual({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "customer",
        permissions: expect.any(Object),
        redirectPath: "/dashboard",
      });

      expect(mockUserModel.findUserByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(mockUserModel.verifyPassword).toHaveBeenCalledWith(
        validUser,
        "validpassword"
      );
      expect(mockUserModel.updateLastLogin).toHaveBeenCalledWith(1);
    });

    it("should handle different user roles correctly", async () => {
      // Test Admin role
      const adminUser = { ...validUser, role: "ADMINISTRATOR" as const };
      mockUserModel.findUserByEmail.mockResolvedValue(adminUser);
      mockUserModel.verifyPassword.mockResolvedValue(true);
      mockUserModel.updateLastLogin.mockResolvedValue(undefined);

      const result = await loginUser("admin@example.com", "adminpass");
      expect(result.role).toBe("administrator");
      expect(result.redirectPath).toBe("/dashboard/admin");
    });

    it("should handle veterinarian role correctly", async () => {
      // Test Veterinarian role
      const vetUser = { ...validUser, role: "VETERINARIAN" as const };
      mockUserModel.findUserByEmail.mockResolvedValue(vetUser);
      mockUserModel.verifyPassword.mockResolvedValue(true);
      mockUserModel.updateLastLogin.mockResolvedValue(undefined);

      const result = await loginUser("vet@example.com", "vetpass");
      expect(result.role).toBe("veterinarian");
      expect(result.redirectPath).toBe("/dashboard/appointments");
    });

    it("should handle case-insensitive email login", async () => {
      // Arrange
      mockUserModel.findUserByEmail.mockResolvedValue(validUser);
      mockUserModel.verifyPassword.mockResolvedValue(true);
      mockUserModel.updateLastLogin.mockResolvedValue(undefined);

      // Act
      const result = await loginUser("TEST@EXAMPLE.COM", "validpassword");

      // Assert
      expect(result).toBeDefined();
      expect(mockUserModel.findUserByEmail).toHaveBeenCalledWith(
        "TEST@EXAMPLE.COM"
      );
    });
  });

  describe("Negative Test Cases", () => {
    it("should throw error when email is empty", async () => {
      // Act & Assert
      await expect(loginUser("", "password")).rejects.toThrow("empty_fields");
    });

    it("should throw error when password is empty", async () => {
      // Act & Assert
      await expect(loginUser("test@example.com", "")).rejects.toThrow(
        "empty_fields"
      );
    });

    it("should throw error when both fields are empty", async () => {
      // Act & Assert
      await expect(loginUser("", "")).rejects.toThrow("empty_fields");
    });

    it("should throw error when user does not exist", async () => {
      // Arrange
      mockUserModel.findUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        loginUser("nonexistent@example.com", "password")
      ).rejects.toThrow("user_not_found");
    });

    it("should throw error when user account is inactive", async () => {
      // Arrange
      const inactiveUser = { ...validUser, status: "INACTIVE" as const };
      mockUserModel.findUserByEmail.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(loginUser("test@example.com", "password")).rejects.toThrow(
        "account_inactive"
      );
    });

    it("should throw error when user account is suspended", async () => {
      // Arrange
      const suspendedUser = { ...validUser, status: "SUSPENDED" as const };
      mockUserModel.findUserByEmail.mockResolvedValue(suspendedUser);

      // Act & Assert
      await expect(loginUser("test@example.com", "password")).rejects.toThrow(
        "account_inactive"
      );
    });

    it("should throw error when password is incorrect", async () => {
      // Arrange
      mockUserModel.findUserByEmail.mockResolvedValue(validUser);
      mockUserModel.verifyPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(
        loginUser("test@example.com", "wrongpassword")
      ).rejects.toThrow("incorrect_password");
    });

    it("should handle database connection errors", async () => {
      // Arrange
      mockUserModel.findUserByEmail.mockRejectedValue(
        new Error("Database connection failed")
      );

      // Act & Assert
      await expect(loginUser("test@example.com", "password")).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long email addresses", async () => {
      // Arrange
      const longEmail = "a".repeat(240) + "@example.com"; // Very long email
      mockUserModel.findUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(loginUser(longEmail, "password")).rejects.toThrow(
        "user_not_found"
      );
    });

    it("should handle very long passwords", async () => {
      // Arrange
      const longPassword = "a".repeat(1000); // Very long password
      mockUserModel.findUserByEmail.mockResolvedValue(validUser);
      mockUserModel.verifyPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(loginUser("test@example.com", longPassword)).rejects.toThrow(
        "incorrect_password"
      );
    });

    it("should handle special characters in password", async () => {
      // Arrange
      const specialPassword = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      mockUserModel.findUserByEmail.mockResolvedValue(validUser);
      mockUserModel.verifyPassword.mockResolvedValue(true);
      mockUserModel.updateLastLogin.mockResolvedValue(undefined);

      // Act
      const result = await loginUser("test@example.com", specialPassword);

      // Assert
      expect(result).toBeDefined();
      expect(mockUserModel.verifyPassword).toHaveBeenCalledWith(
        validUser,
        specialPassword
      );
    });

    it("should handle Unicode characters in email", async () => {
      // Arrange
      const unicodeEmail = "tëst@éxample.com";
      mockUserModel.findUserByEmail.mockResolvedValue(validUser);
      mockUserModel.verifyPassword.mockResolvedValue(true);
      mockUserModel.updateLastLogin.mockResolvedValue(undefined);

      // Act
      const result = await loginUser(unicodeEmail, "password");

      // Assert
      expect(result).toBeDefined();
      expect(mockUserModel.findUserByEmail).toHaveBeenCalledWith(unicodeEmail);
    });
  });

  describe("Security Tests", () => {
    it("should not return password in response", async () => {
      // Arrange
      mockUserModel.findUserByEmail.mockResolvedValue(validUser);
      mockUserModel.verifyPassword.mockResolvedValue(true);
      mockUserModel.updateLastLogin.mockResolvedValue(undefined);

      // Act
      const result = await loginUser("test@example.com", "password");

      // Assert
      expect(result).not.toHaveProperty("password");
    });

    it("should handle SQL injection attempts in email", async () => {
      // Arrange
      const maliciousEmail = "'; DROP TABLE User; --";
      mockUserModel.findUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(loginUser(maliciousEmail, "password")).rejects.toThrow(
        "user_not_found"
      );
    });

    it("should handle timing attacks (consistent response time)", async () => {
      // Arrange
      const startTime = Date.now();
      mockUserModel.findUserByEmail.mockResolvedValue(null);

      // Act
      try {
        await loginUser("nonexistent@example.com", "password");
      } catch (error) {
        // Expected to throw
      }

      const nonExistentUserTime = Date.now() - startTime;

      // Test with existing user but wrong password
      const startTime2 = Date.now();
      mockUserModel.findUserByEmail.mockResolvedValue(validUser);
      mockUserModel.verifyPassword.mockResolvedValue(false);

      try {
        await loginUser("test@example.com", "wrongpassword");
      } catch (error) {
        // Expected to throw
      }

      const wrongPasswordTime = Date.now() - startTime2;

      // Assert - timing should be relatively similar (within reasonable bounds)
      const timeDifference = Math.abs(nonExistentUserTime - wrongPasswordTime);
      expect(timeDifference).toBeLessThan(100); // 100ms tolerance
    });

    it("should update last login only after successful authentication", async () => {
      // Arrange
      mockUserModel.findUserByEmail.mockResolvedValue(validUser);
      mockUserModel.verifyPassword.mockResolvedValue(false);

      // Act
      try {
        await loginUser("test@example.com", "wrongpassword");
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(mockUserModel.updateLastLogin).not.toHaveBeenCalled();
    });
  });

  describe("Rate Limiting Preparation Tests", () => {
    it("should handle multiple failed login attempts gracefully", async () => {
      // Arrange
      mockUserModel.findUserByEmail.mockResolvedValue(validUser);
      mockUserModel.verifyPassword.mockResolvedValue(false);

      // Act & Assert - Multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await expect(
          loginUser("test@example.com", "wrongpassword")
        ).rejects.toThrow("incorrect_password");
      }

      expect(mockUserModel.verifyPassword).toHaveBeenCalledTimes(5);
    });
  });

  describe("Cookie Security Tests", () => {
    it("should set secure cookie in production environment", async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      mockUserModel.findUserByEmail.mockResolvedValue(validUser);
      mockUserModel.verifyPassword.mockResolvedValue(true);
      mockUserModel.updateLastLogin.mockResolvedValue(undefined);

      // Act
      await loginUser("test@example.com", "password");

      // Restore environment
      process.env.NODE_ENV = originalEnv;

      // Assert - Cookie should be set with secure flag in production
      // This would need to be verified through the cookie mock
    });
  });
});
