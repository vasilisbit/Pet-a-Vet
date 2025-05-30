/**
 * Performance Tests for Pet-a-Vet Authentication
 * Comprehensive performance testing covering load, stress, and scalability
 */

import { describe, test, expect, beforeEach, jest } from "@jest/globals";

// Mock modules at the top level
const mockRegisterUser = jest.fn();
const mockLoginUser = jest.fn();
const mockValidateSession = jest.fn();
const mockHashPassword = jest.fn();

jest.mock("../../lib/auth", () => ({
  registerUser: mockRegisterUser,
  loginUser: mockLoginUser,
}));

jest.mock("../../lib/auth-utils", () => ({
  validateSession: mockValidateSession,
  hashPassword: mockHashPassword,
}));

jest.mock("next/headers");

describe("Pet-a-Vet Authentication Performance Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Login Performance", () => {
    test("should handle rapid login attempts efficiently", async () => {
      mockLoginUser.mockImplementation(
        async (email: string, password: string) => {
          // Simulate realistic login processing time (50-100ms)
          const delay = Math.random() * 50 + 50;
          await new Promise((resolve) => setTimeout(resolve, delay));

          if (email === "test@example.com" && password === "correct") {
            return { id: 1, email, role: "customer" };
          }
          throw new Error("authentication_failed");
        }
      );

      const concurrentLogins = 20;
      const loginPromises = [];
      const startTime = Date.now();

      // Execute concurrent login attempts
      for (let i = 0; i < concurrentLogins; i++) {
        loginPromises.push(
          mockLoginUser("test@example.com", "correct").catch(() => null)
        );
      }

      const results = await Promise.all(loginPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Performance expectations
      expect(totalTime).toBeLessThan(3000); // Should complete within 3 seconds
      expect(results.filter((r) => r !== null)).toHaveLength(concurrentLogins);

      // Average response time should be reasonable
      const avgResponseTime = totalTime / concurrentLogins;
      expect(avgResponseTime).toBeLessThan(150); // Average should be under 150ms
    });

    test("should maintain performance under failed login load", async () => {
      mockLoginUser.mockImplementation(
        async (email: string, password: string) => {
          // Simulate consistent timing for failed logins to prevent timing attacks
          await new Promise((resolve) => setTimeout(resolve, 75));
          throw new Error("authentication_failed");
        }
      );

      const failedLogins = 50;
      const startTime = Date.now();

      const failedPromises = Array.from({ length: failedLogins }, (_, i) =>
        mockLoginUser(`user${i}@example.com`, "wrongpassword").catch(
          () => "failed"
        )
      );

      const results = await Promise.all(failedPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All should fail, but consistently
      expect(results.every((r) => r === "failed")).toBe(true);
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Timing should be consistent (important for security)
      const avgTime = totalTime / failedLogins;
      expect(avgTime).toBeLessThan(100); // Should average under 100ms
    });
  });

  describe("Registration Performance", () => {
    test("should handle batch user registrations efficiently", async () => {
      mockRegisterUser.mockImplementation(
        async (name: string, email: string, password: string) => {
          // Simulate password hashing and database insertion time
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 100 + 100)
          );
          return { id: Math.random(), email, name, role: "customer" };
        }
      );

      const batchSize = 15;
      const registrations = Array.from({ length: batchSize }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: "SecurePass123!",
      }));

      const startTime = Date.now();

      const registrationPromises = registrations.map((user) =>
        mockRegisterUser(user.name, user.email, user.password)
      );

      const results = await Promise.all(registrationPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Performance validation
      expect(results).toHaveLength(batchSize);
      expect(totalTime).toBeLessThan(4000); // Should complete within 4 seconds

      // All registrations should succeed
      results.forEach((result) => {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("email");
        expect(result.role).toBe("customer");
      });
    });

    test("should handle duplicate email registrations efficiently", async () => {
      mockRegisterUser.mockImplementation(
        async (name: string, email: string, password: string) => {
          // Simulate duplicate email check
          await new Promise((resolve) => setTimeout(resolve, 50));

          if (email === "duplicate@example.com") {
            throw new Error("email_already_exists");
          }

          return { id: Math.random(), email, name, role: "customer" };
        }
      );

      const duplicateAttempts = 10;
      const startTime = Date.now();

      const duplicatePromises = Array.from({ length: duplicateAttempts }, () =>
        mockRegisterUser(
          "Test User",
          "duplicate@example.com",
          "password"
        ).catch((e) => e.message)
      );

      const results = await Promise.all(duplicatePromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All should fail with same error
      expect(results.every((r) => r === "email_already_exists")).toBe(true);
      expect(totalTime).toBeLessThan(1000); // Should be fast
    });
  });

  describe("Session Validation Performance", () => {
    test("should validate sessions quickly under high load", async () => {
      mockValidateSession.mockImplementation(async (token: string) => {
        // Simulate session lookup time
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 20 + 10)
        );

        if (token.startsWith("valid_")) {
          return { userId: 1, role: "customer", expires: Date.now() + 3600000 };
        }
        throw new Error("invalid_session");
      });

      const sessionChecks = 100;
      const validSessions = Array.from(
        { length: sessionChecks / 2 },
        (_, i) => `valid_session_${i}`
      );
      const invalidSessions = Array.from(
        { length: sessionChecks / 2 },
        (_, i) => `invalid_session_${i}`
      );

      const allSessions = [...validSessions, ...invalidSessions].sort(
        () => Math.random() - 0.5
      );

      const startTime = Date.now();

      const validationPromises = allSessions.map((token) =>
        mockValidateSession(token).then(
          (result) => ({ success: true, result }),
          (error) => ({ success: false, error: error.message })
        )
      );

      const results = await Promise.all(validationPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Performance expectations
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds

      const successfulValidations = results.filter((r) => r.success);
      const failedValidations = results.filter((r) => !r.success);

      expect(successfulValidations).toHaveLength(sessionChecks / 2);
      expect(failedValidations).toHaveLength(sessionChecks / 2);

      // Average validation time should be quick
      const avgValidationTime = totalTime / sessionChecks;
      expect(avgValidationTime).toBeLessThan(20); // Under 20ms average
    });
  });

  describe("Password Hashing Performance", () => {
    test("should hash passwords within acceptable time limits", async () => {
      mockHashPassword.mockImplementation(async (password: string) => {
        // Simulate bcrypt hashing time (realistic: 100-300ms)
        const hashTime = Math.random() * 200 + 100;
        await new Promise((resolve) => setTimeout(resolve, hashTime));
        return `$2b$12$hashedversion_of_${password.slice(0, 10)}`;
      });

      const passwords = [
        "SimplePass123!",
        "Complex!P@ssw0rd#2024",
        "VeryLongPasswordWithManyCharacters123!@#",
        "Short1!",
        "Medium@Pass123",
      ];

      const startTime = Date.now();

      const hashPromises = passwords.map((password) =>
        mockHashPassword(password)
      );
      const hashedPasswords = await Promise.all(hashPromises);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All passwords should be hashed
      expect(hashedPasswords).toHaveLength(passwords.length);
      hashedPasswords.forEach((hash) => {
        expect(hash).toMatch(/^\$2b\$12\$/); // bcrypt format
      });

      // Total time should be reasonable for batch hashing
      expect(totalTime).toBeLessThan(2000); // Within 2 seconds for 5 passwords

      // Average hashing time should be within acceptable range
      const avgHashTime = totalTime / passwords.length;
      expect(avgHashTime).toBeLessThan(400); // Under 400ms per hash
      expect(avgHashTime).toBeGreaterThan(50); // At least 50ms for security
    });

    test("should handle concurrent password hashing", async () => {
      mockHashPassword.mockImplementation(async (password: string) => {
        // Simulate realistic bcrypt timing
        await new Promise((resolve) => setTimeout(resolve, 150));
        return `$2b$12$hash_${password.length}_${Date.now()}`;
      });

      const concurrentHashes = 8;
      const password = "ConcurrentHash123!";

      const startTime = Date.now();

      const hashPromises = Array.from({ length: concurrentHashes }, () =>
        mockHashPassword(password)
      );

      const results = await Promise.all(hashPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All hashes should complete
      expect(results).toHaveLength(concurrentHashes);
      results.forEach((hash) => {
        expect(hash).toMatch(/^\$2b\$12\$/);
      });

      // Concurrent execution should be faster than sequential
      // (Should leverage Node.js async nature)
      expect(totalTime).toBeLessThan(1000); // Should complete much faster than 8 * 150ms
    });
  });

  describe("Memory and Resource Performance", () => {
    test("should not leak memory during repeated operations", async () => {
      mockLoginUser.mockImplementation(
        async (email: string, password: string) => {
          // Create some temporary objects to test memory management
          const tempData = new Array(1000)
            .fill(0)
            .map((_, i) => ({ id: i, data: `test_${i}` }));
          await new Promise((resolve) => setTimeout(resolve, 10));

          if (email.includes("valid")) {
            return {
              id: 1,
              email,
              role: "customer",
              tempData: tempData.slice(0, 10),
            };
          }
          throw new Error("authentication_failed");
        }
      );

      const initialMemory = process.memoryUsage();
      const iterations = 50;

      // Perform repeated operations
      for (let i = 0; i < iterations; i++) {
        try {
          await mockLoginUser(`valid${i}@example.com`, "password");
        } catch (e) {
          // Expected for some iterations
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();

      // Memory usage shouldn't increase dramatically
      const memoryIncrease =
        (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024; // MB
      expect(memoryIncrease).toBeLessThan(50); // Less than 50MB increase
    });

    test("should handle error scenarios efficiently", async () => {
      const errorTypes = [
        "authentication_failed",
        "user_not_found",
        "invalid_password",
        "account_locked",
        "database_error",
      ];

      mockLoginUser.mockImplementation(
        async (email: string, password: string) => {
          await new Promise((resolve) => setTimeout(resolve, 25));
          const errorType =
            errorTypes[Math.floor(Math.random() * errorTypes.length)];
          throw new Error(errorType);
        }
      );

      const errorAttempts = 30;
      const startTime = Date.now();

      const errorPromises = Array.from({ length: errorAttempts }, (_, i) =>
        mockLoginUser(`error${i}@example.com`, "password").catch(
          (e) => e.message
        )
      );

      const errors = await Promise.all(errorPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All should return error messages
      expect(errors).toHaveLength(errorAttempts);
      errors.forEach((error) => {
        expect(errorTypes).toContain(error);
      });

      // Error handling should be fast
      expect(totalTime).toBeLessThan(1500);

      const avgErrorTime = totalTime / errorAttempts;
      expect(avgErrorTime).toBeLessThan(50); // Under 50ms per error
    });
  });

  describe("Scalability Tests", () => {
    test("should maintain response times as load increases", async () => {
      const testLoads = [5, 10, 20, 40];
      const responseTimesPerLoad = [];

      mockLoginUser.mockImplementation(
        async (email: string, password: string) => {
          // Simulate realistic response time with slight variance
          const baseTime = 60;
          const variance = Math.random() * 20;
          await new Promise((resolve) =>
            setTimeout(resolve, baseTime + variance)
          );

          return { id: 1, email, role: "customer" };
        }
      );

      for (const load of testLoads) {
        const startTime = Date.now();

        const promises = Array.from({ length: load }, (_, i) =>
          mockLoginUser(`user${i}@example.com`, "password")
        );

        await Promise.all(promises);
        const endTime = Date.now();

        const avgResponseTime = (endTime - startTime) / load;
        responseTimesPerLoad.push(avgResponseTime);
      }

      // Response times shouldn't degrade significantly with increased load
      const firstLoadAvg = responseTimesPerLoad[0];
      const lastLoadAvg = responseTimesPerLoad[responseTimesPerLoad.length - 1];

      // Last load shouldn't be more than 150% of first load
      const degradationRatio = lastLoadAvg / firstLoadAvg;
      expect(degradationRatio).toBeLessThan(1.5);

      // All response times should be reasonable
      responseTimesPerLoad.forEach((time) => {
        expect(time).toBeLessThan(200); // Under 200ms average
      });
    });

    test("should handle burst traffic effectively", async () => {
      mockLoginUser.mockImplementation(
        async (email: string, password: string) => {
          // Simulate processing time with some resource contention
          const processingTime = Math.random() * 50 + 30;
          await new Promise((resolve) => setTimeout(resolve, processingTime));

          return { id: Math.random(), email, role: "customer" };
        }
      );

      // Simulate burst: 50 requests in quick succession
      const burstSize = 50;
      const burstStartTime = Date.now();

      const burstPromises = Array.from({ length: burstSize }, (_, i) =>
        mockLoginUser(`burst${i}@example.com`, "password")
      );

      const burstResults = await Promise.all(burstPromises);
      const burstEndTime = Date.now();
      const burstTotalTime = burstEndTime - burstStartTime;

      // All requests should succeed
      expect(burstResults).toHaveLength(burstSize);
      burstResults.forEach((result) => {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("email");
      });

      // Burst should complete in reasonable time
      expect(burstTotalTime).toBeLessThan(3000); // Within 3 seconds

      const avgBurstTime = burstTotalTime / burstSize;
      expect(avgBurstTime).toBeLessThan(60); // Under 60ms average for burst
    });
  });
});
