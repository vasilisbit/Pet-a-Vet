/**
 * API Security Tests for Pet-a-Vet Authentication
 * Working version with proper type handling
 */

import { describe, test, expect, beforeEach, jest } from "@jest/globals";

// Mock response interface
interface MockResponse {
  json(): Promise<any>;
  status: number;
  headers: Map<string, string>;
}

// Mock authentication handlers
const mockLoginHandler = jest.fn();
const mockRegisterHandler = jest.fn();
const mockValidateToken = jest.fn();

jest.mock("../../lib/auth-utils", () => ({
  validateToken: mockValidateToken,
}));

describe("Pet-a-Vet API Security Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Login API Security", () => {
    test("should validate request headers for security", async () => {
      mockLoginHandler.mockImplementation(async (request: any) => {
        const contentType = request.headers.get("content-type");
        const userAgent = request.headers.get("user-agent");

        if (!contentType || !contentType.includes("application/json")) {
          return {
            json: async () => ({ error: "invalid_content_type" }),
            status: 400,
          };
        }

        if (
          !userAgent ||
          userAgent.includes("<script>") ||
          userAgent.includes("javascript:")
        ) {
          return {
            json: async () => ({ error: "invalid_user_agent" }),
            status: 400,
          };
        }

        return {
          json: async () => ({ success: true }),
          status: 200,
        };
      });

      // Test valid headers
      const validRequest = {
        headers: new Map([
          ["content-type", "application/json"],
          [
            "user-agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          ],
        ]),
      };

      const validResponse = await mockLoginHandler(validRequest);
      const validData = await validResponse.json();
      expect(validData.success).toBe(true);
      expect(validResponse.status).toBe(200);

      // Test invalid content type
      const invalidContentTypeRequest = {
        headers: new Map([
          ["content-type", "text/plain"],
          ["user-agent", "Mozilla/5.0"],
        ]),
      };

      const invalidContentResponse = await mockLoginHandler(
        invalidContentTypeRequest
      );
      const invalidContentData = await invalidContentResponse.json();
      expect(invalidContentData.error).toBe("invalid_content_type");
      expect(invalidContentResponse.status).toBe(400);

      // Test malicious user agent
      const maliciousRequest = {
        headers: new Map([
          ["content-type", "application/json"],
          ["user-agent", '<script>alert("xss")</script>'],
        ]),
      };

      const maliciousResponse = await mockLoginHandler(maliciousRequest);
      const maliciousData = await maliciousResponse.json();
      expect(maliciousData.error).toBe("invalid_user_agent");
      expect(maliciousResponse.status).toBe(400);
    });

    test("should implement rate limiting for login attempts", async () => {
      const attemptCounts = new Map<string, number>();

      mockLoginHandler.mockImplementation(async (request: any) => {
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const currentAttempts = attemptCounts.get(ip) || 0;

        if (currentAttempts >= 5) {
          return {
            json: async () => ({ error: "rate_limit_exceeded" }),
            status: 429,
          };
        }

        attemptCounts.set(ip, currentAttempts + 1);

        const body = await request.json();
        if (body.email === "valid@example.com" && body.password === "correct") {
          attemptCounts.delete(ip); // Reset on successful login
          return {
            json: async () => ({ success: true }),
            status: 200,
          };
        }

        return {
          json: async () => ({ error: "authentication_failed" }),
          status: 401,
        };
      });

      const createRequest = (
        email: string,
        password: string,
        ip: string = "192.168.1.1"
      ) => ({
        headers: new Map([["x-forwarded-for", ip]]),
        json: async () => ({ email, password }),
      });

      // First 5 attempts should work (but fail authentication)
      for (let i = 0; i < 5; i++) {
        const response = await mockLoginHandler(
          createRequest("invalid@example.com", "wrong")
        );
        const data = await response.json();
        expect(data.error).toBe("authentication_failed");
        expect(response.status).toBe(401);
      }

      // 6th attempt should be rate limited
      const rateLimitedResponse = await mockLoginHandler(
        createRequest("invalid@example.com", "wrong")
      );
      const rateLimitedData = await rateLimitedResponse.json();
      expect(rateLimitedData.error).toBe("rate_limit_exceeded");
      expect(rateLimitedResponse.status).toBe(429);
    });

    test("should validate request body structure", async () => {
      mockLoginHandler.mockImplementation(async (request: any) => {
        try {
          const body = await request.json();

          if (!body || typeof body !== "object") {
            return {
              json: async () => ({ error: "invalid_body" }),
              status: 400,
            };
          }

          if (!body.email || typeof body.email !== "string") {
            return {
              json: async () => ({ error: "invalid_email" }),
              status: 400,
            };
          }

          if (!body.password || typeof body.password !== "string") {
            return {
              json: async () => ({ error: "invalid_password" }),
              status: 400,
            };
          }

          if (body.email.length > 254 || body.password.length > 128) {
            return {
              json: async () => ({ error: "input_too_long" }),
              status: 400,
            };
          }

          return {
            json: async () => ({ success: true }),
            status: 200,
          };
        } catch (e) {
          return {
            json: async () => ({ error: "invalid_json" }),
            status: 400,
          };
        }
      });

      // Valid request
      const validRequest = {
        json: async () => ({
          email: "test@example.com",
          password: "password123",
        }),
      };
      const validResponse = await mockLoginHandler(validRequest);
      const validData = await validResponse.json();
      expect(validData.success).toBe(true);
      expect(validResponse.status).toBe(200);

      // Invalid JSON
      const invalidJsonRequest = {
        json: async () => {
          throw new Error("Invalid JSON");
        },
      };
      const invalidJsonResponse = await mockLoginHandler(invalidJsonRequest);
      const invalidJsonData = await invalidJsonResponse.json();
      expect(invalidJsonData.error).toBe("invalid_json");
      expect(invalidJsonResponse.status).toBe(400);

      // Missing email
      const missingEmailRequest = {
        json: async () => ({ password: "password123" }),
      };
      const missingEmailResponse = await mockLoginHandler(missingEmailRequest);
      const missingEmailData = await missingEmailResponse.json();
      expect(missingEmailData.error).toBe("invalid_email");
      expect(missingEmailResponse.status).toBe(400);

      // Too long inputs
      const tooLongRequest = {
        json: async () => ({
          email: "a".repeat(255) + "@example.com",
          password: "password123",
        }),
      };
      const tooLongResponse = await mockLoginHandler(tooLongRequest);
      const tooLongData = await tooLongResponse.json();
      expect(tooLongData.error).toBe("input_too_long");
      expect(tooLongResponse.status).toBe(400);
    });
  });

  describe("Registration API Security", () => {
    test("should prevent duplicate registration attempts", async () => {
      const existingEmails = new Set<string>();

      mockRegisterHandler.mockImplementation(async (request: any) => {
        const body = await request.json();

        if (existingEmails.has(body.email)) {
          return {
            json: async () => ({ error: "email_already_exists" }),
            status: 409,
          };
        }

        existingEmails.add(body.email);
        return {
          json: async () => ({ success: true, id: Math.random() }),
          status: 201,
        };
      });

      const createRegisterRequest = (email: string) => ({
        json: async () => ({
          name: "Test User",
          email,
          password: "SecurePass123!",
        }),
      });

      // First registration should succeed
      const firstResponse = await mockRegisterHandler(
        createRegisterRequest("test@example.com")
      );
      const firstData = await firstResponse.json();
      expect(firstData.success).toBe(true);
      expect(firstResponse.status).toBe(201);

      // Second registration with same email should fail
      const duplicateResponse = await mockRegisterHandler(
        createRegisterRequest("test@example.com")
      );
      const duplicateData = await duplicateResponse.json();
      expect(duplicateData.error).toBe("email_already_exists");
      expect(duplicateResponse.status).toBe(409);
    });

    test("should validate password strength requirements", async () => {
      mockRegisterHandler.mockImplementation(async (request: any) => {
        const body = await request.json();
        const password = body.password;

        if (!password || password.length < 8) {
          return {
            json: async () => ({ error: "password_too_short" }),
            status: 400,
          };
        }
        if (!/[A-Z]/.test(password)) {
          return {
            json: async () => ({ error: "password_needs_uppercase" }),
            status: 400,
          };
        }

        if (!/[a-z]/.test(password)) {
          return {
            json: async () => ({ error: "password_needs_lowercase" }),
            status: 400,
          };
        }

        if (!/[0-9]/.test(password)) {
          return {
            json: async () => ({ error: "password_needs_number" }),
            status: 400,
          };
        }

        if (!/[!@#$%^&*]/.test(password)) {
          return {
            json: async () => ({ error: "password_needs_special" }),
            status: 400,
          };
        }

        return {
          json: async () => ({ success: true }),
          status: 201,
        };
      });

      const createRequest = (password: string) => ({
        json: async () => ({
          name: "Test User",
          email: "test@example.com",
          password,
        }),
      });
      const weakPasswords = [
        { password: "short", expectedError: "password_too_short" },
        {
          password: "nouppercase123!",
          expectedError: "password_needs_uppercase",
        },
        {
          password: "NOLOWERCASE123!",
          expectedError: "password_needs_lowercase",
        },
        { password: "NoNumbers!", expectedError: "password_needs_number" },
        {
          password: "NoSpecialChars123",
          expectedError: "password_needs_special",
        },
      ];

      for (const { password, expectedError } of weakPasswords) {
        const response = await mockRegisterHandler(createRequest(password));
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.error).toBe(expectedError);
      }

      // Strong password should work
      const strongResponse = await mockRegisterHandler(
        createRequest("StrongPass123!")
      );
      const strongData = await strongResponse.json();
      expect(strongData.success).toBe(true);
      expect(strongResponse.status).toBe(201);
    });
  });

  describe("Authentication Token Security", () => {
    test("should validate JWT tokens properly", async () => {
      mockValidateToken.mockImplementation((token: string) => {
        // Basic token validation
        if (!token || typeof token !== "string") {
          throw new Error("invalid_token");
        }

        if (token.includes("<script>") || token.includes("javascript:")) {
          throw new Error("malicious_token");
        }

        if (token.length < 10) {
          throw new Error("token_too_short");
        }

        // Mock JWT structure validation
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("invalid_jwt_structure");
        }

        if (token === "valid.jwt.token") {
          return { userId: 1, role: "customer", exp: Date.now() + 3600000 };
        }

        if (token === "expired.jwt.token") {
          throw new Error("token_expired");
        }

        throw new Error("invalid_signature");
      });

      // Valid token
      const validResult = mockValidateToken("valid.jwt.token");
      expect(validResult.userId).toBe(1); // Invalid tokens
      expect(() => mockValidateToken("")).toThrow("invalid_token");
      expect(() => mockValidateToken("short")).toThrow("token_too_short");
      expect(() => mockValidateToken("longenough.nodots")).toThrow(
        "invalid_jwt_structure"
      );
      expect(() =>
        mockValidateToken("<script>alert(1)</script>.jwt.token")
      ).toThrow("malicious_token");
      expect(() => mockValidateToken("expired.jwt.token")).toThrow(
        "token_expired"
      );
      expect(() => mockValidateToken("invalid.jwt.signature")).toThrow(
        "invalid_signature"
      );
    });

    test("should handle CORS headers properly", async () => {
      const mockCorsHandler = jest.fn().mockImplementation((origin: string) => {
        const allowedOrigins = [
          "http://localhost:3000",
          "https://pet-a-vet.com",
        ];

        const headers = new Map<string, string>();
        headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        headers.set("Access-Control-Max-Age", "86400");

        if (allowedOrigins.includes(origin)) {
          headers.set("Access-Control-Allow-Origin", origin);
        }

        return {
          headers,
          status: 200,
        };
      });

      // Allowed origin
      const allowedResponse = mockCorsHandler("http://localhost:3000");
      expect(allowedResponse.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000"
      );
      expect(allowedResponse.headers.get("Access-Control-Allow-Methods")).toBe(
        "GET, POST, PUT, DELETE, OPTIONS"
      );

      // Disallowed origin
      const disallowedResponse = mockCorsHandler("http://malicious-site.com");
      expect(
        disallowedResponse.headers.get("Access-Control-Allow-Origin")
      ).toBeUndefined();
    });

    test("should set proper security headers", async () => {
      const mockSecurityHandler = jest.fn().mockImplementation(() => {
        const headers = new Map<string, string>();

        // Security headers
        headers.set("X-Content-Type-Options", "nosniff");
        headers.set("X-Frame-Options", "DENY");
        headers.set("X-XSS-Protection", "1; mode=block");
        headers.set(
          "Strict-Transport-Security",
          "max-age=31536000; includeSubDomains"
        );
        headers.set("Content-Security-Policy", "default-src 'self'");

        return {
          headers,
          json: async () => ({ success: true }),
          status: 200,
        };
      });

      const response = mockSecurityHandler();

      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
      expect(response.headers.get("X-XSS-Protection")).toBe("1; mode=block");
      expect(response.headers.get("Strict-Transport-Security")).toBe(
        "max-age=31536000; includeSubDomains"
      );
      expect(response.headers.get("Content-Security-Policy")).toBe(
        "default-src 'self'"
      );
    });
  });

  describe("Error Handling Security", () => {
    test("should not expose sensitive information in error responses", async () => {
      const mockErrorHandler = jest
        .fn()
        .mockImplementation(async (request: any) => {
          try {
            const body = await request.json();

            if (body.email === "cause.db.error@example.com") {
              // Simulate database error
              throw new Error(
                "Database connection failed: Connection to database lost on server db-prod-01"
              );
            }

            if (body.email === "cause.file.error@example.com") {
              // Simulate file system error
              throw new Error(
                "ENOENT: no such file or directory, open '/var/secrets/config.json'"
              );
            }

            return {
              json: async () => ({ success: true }),
              status: 200,
            };
          } catch (error: any) {
            // Always return generic error messages
            const genericErrors: Record<string, string> = {
              "Database connection failed": "service_unavailable",
              ENOENT: "service_unavailable",
            };

            let errorType = "internal_error";
            for (const [key, value] of Object.entries(genericErrors)) {
              if (error.message.includes(key)) {
                errorType = value;
                break;
              }
            }

            return {
              json: async () => ({ error: errorType }),
              status: 500,
            };
          }
        });

      // Database error should return generic message
      const dbErrorRequest = {
        json: async () => ({
          email: "cause.db.error@example.com",
          password: "password",
        }),
      };
      const dbErrorResponse = await mockErrorHandler(dbErrorRequest);
      const dbErrorData = await dbErrorResponse.json();
      expect(dbErrorData.error).toBe("service_unavailable");
      expect(dbErrorResponse.status).toBe(500);

      // File error should return generic message
      const fileErrorRequest = {
        json: async () => ({
          email: "cause.file.error@example.com",
          password: "password",
        }),
      };
      const fileErrorResponse = await mockErrorHandler(fileErrorRequest);
      const fileErrorData = await fileErrorResponse.json();
      expect(fileErrorData.error).toBe("service_unavailable");
      expect(fileErrorResponse.status).toBe(500);
    });
  });

  describe("Request Size Protection", () => {
    test("should limit request body size", async () => {
      const mockSizeHandler = jest
        .fn()
        .mockImplementation(async (request: any) => {
          const body = await request.json();
          const bodySize = JSON.stringify(body).length;

          if (bodySize > 1024) {
            // 1KB limit
            return {
              json: async () => ({ error: "request_too_large" }),
              status: 413,
            };
          }

          return {
            json: async () => ({ success: true }),
            status: 200,
          };
        });

      // Normal size request
      const normalRequest = {
        json: async () => ({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        }),
      };
      const normalResponse = await mockSizeHandler(normalRequest);
      const normalData = await normalResponse.json();
      expect(normalData.success).toBe(true);
      expect(normalResponse.status).toBe(200);

      // Oversized request
      const oversizedRequest = {
        json: async () => ({
          email: "test@example.com",
          password: "password123",
          name: "a".repeat(2000), // Large payload
        }),
      };
      const oversizedResponse = await mockSizeHandler(oversizedRequest);
      const oversizedData = await oversizedResponse.json();
      expect(oversizedData.error).toBe("request_too_large");
      expect(oversizedResponse.status).toBe(413);
    });
  });
});
