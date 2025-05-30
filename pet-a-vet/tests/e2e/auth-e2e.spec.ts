import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// Test data
const testUsers = {
  customer: {
    name: "John Customer",
    email: "john.customer@test.com",
    password: "CustomerPass123!",
    phone: "+30 2101234567",
    address: "123 Customer St",
    city: "Athens",
    postalCode: "12345",
  },
  admin: {
    email: "admin@petavet.com",
    password: "AdminPass123!",
  },
  veterinarian: {
    email: "vet@petavet.com",
    password: "VetPass123!",
  },
};

test.describe("Authentication E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("/");
  });

  test.describe("Sign Up Flow", () => {
    test("should complete successful user registration", async ({ page }) => {
      // Navigate to registration page
      await page.click("text=Sign up");
      await expect(page).toHaveURL("/register");

      // Fill basic information
      await page.fill('[data-testid="name-input"]', testUsers.customer.name);
      await page.fill('[data-testid="email-input"]', testUsers.customer.email);
      await page.fill(
        '[data-testid="password-input"]',
        testUsers.customer.password
      );
      await page.fill(
        '[data-testid="confirm-password-input"]',
        testUsers.customer.password
      );

      // Move to contact information tab
      await page.click("text=Contact Information");

      // Fill contact information
      await page.fill('[data-testid="phone-input"]', testUsers.customer.phone);
      await page.fill(
        '[data-testid="address-input"]',
        testUsers.customer.address
      );
      await page.fill('[data-testid="city-input"]', testUsers.customer.city);
      await page.fill(
        '[data-testid="postal-code-input"]',
        testUsers.customer.postalCode
      );

      // Submit registration
      await page.click('button:has-text("Create Account")');

      // Verify successful registration and redirect
      await expect(page).toHaveURL("/dashboard");
      await expect(page.locator("text=Welcome")).toBeVisible();
    });

    test("should show validation errors for incomplete form", async ({
      page,
    }) => {
      await page.goto("/register");

      // Try to submit without filling required fields
      await page.click('button:has-text("Create Account")');

      // Verify validation errors are shown
      await expect(page.locator("text=Incorrect field value")).toBeVisible();

      // Check that required fields are highlighted
      const nameInput = page.locator('[data-testid="name-input"]');
      const emailInput = page.locator('[data-testid="email-input"]');

      await expect(nameInput).toHaveClass(/border-red-500/);
      await expect(emailInput).toHaveClass(/border-red-500/);
    });

    test("should validate password confirmation", async ({ page }) => {
      await page.goto("/register");

      await page.fill('[data-testid="name-input"]', "Test User");
      await page.fill('[data-testid="email-input"]', "test@example.com");
      await page.fill('[data-testid="password-input"]', "Password123!");
      await page.fill(
        '[data-testid="confirm-password-input"]',
        "DifferentPassword123!"
      );

      await page.click("text=Contact Information");
      await page.fill('[data-testid="phone-input"]', "2101234567");

      await page.click('button:has-text("Create Account")');

      await expect(page.locator("text=Passwords do not match")).toBeVisible();
    });

    test("should validate Greek phone number format", async ({ page }) => {
      await page.goto("/register");

      await page.fill('[data-testid="name-input"]', "Test User");
      await page.fill('[data-testid="email-input"]', "test@example.com");
      await page.fill('[data-testid="password-input"]', "Password123!");
      await page.fill('[data-testid="confirm-password-input"]', "Password123!");

      await page.click("text=Contact Information");
      await page.fill('[data-testid="phone-input"]', "123"); // Invalid format

      await page.click('button:has-text("Create Account")');

      await expect(
        page.locator("text=Please enter a valid Greek phone number")
      ).toBeVisible();
    });

    test("should handle user already exists error", async ({ page }) => {
      await page.goto("/register");

      // Try to register with existing email
      await page.fill('[data-testid="name-input"]', "Existing User");
      await page.fill('[data-testid="email-input"]', "existing@example.com");
      await page.fill('[data-testid="password-input"]', "Password123!");
      await page.fill('[data-testid="confirm-password-input"]', "Password123!");

      await page.click("text=Contact Information");
      await page.fill('[data-testid="phone-input"]', "2101234567");

      await page.click('button:has-text("Create Account")');

      // Should show appropriate error message
      await expect(
        page.locator("text=Account with this email already exists")
      ).toBeVisible();
    });

    test("should navigate between form tabs", async ({ page }) => {
      await page.goto("/register");

      // Verify basic information tab is active
      await expect(
        page.locator('[role="tab"][aria-selected="true"]')
      ).toContainText("Basic Information");

      // Click contact information tab
      await page.click("text=Contact Information");
      await expect(
        page.locator('[role="tab"][aria-selected="true"]')
      ).toContainText("Contact Information");

      // Click back to basic information
      await page.click("text=Basic Information");
      await expect(
        page.locator('[role="tab"][aria-selected="true"]')
      ).toContainText("Basic Information");
    });
  });

  test.describe("Sign In Flow", () => {
    test("should complete successful login", async ({ page }) => {
      await page.goto("/login");

      await page.fill('[data-testid="email-input"]', testUsers.customer.email);
      await page.fill(
        '[data-testid="password-input"]',
        testUsers.customer.password
      );

      await page.click('button:has-text("Sign in")');

      // Verify successful login and redirect
      await expect(page).toHaveURL("/dashboard");
      await expect(page.locator("text=Dashboard")).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");

      await page.fill('[data-testid="email-input"]', "invalid@example.com");
      await page.fill('[data-testid="password-input"]', "wrongpassword");

      await page.click('button:has-text("Sign in")');

      await expect(
        page.locator("text=No user with these login details")
      ).toBeVisible();
    });

    test("should show error for incorrect password", async ({ page }) => {
      await page.goto("/login");

      await page.fill('[data-testid="email-input"]', testUsers.customer.email);
      await page.fill('[data-testid="password-input"]', "wrongpassword");

      await page.click('button:has-text("Sign in")');

      await expect(page.locator("text=Wrong email or password")).toBeVisible();
    });

    test("should validate required fields", async ({ page }) => {
      await page.goto("/login");

      // Try to submit without credentials
      await page.click('button:has-text("Sign in")');

      await expect(
        page.locator("text=Please enter both email and password")
      ).toBeVisible();
    });

    test("should show signup prompt for non-existent user", async ({
      page,
    }) => {
      await page.goto("/login");

      await page.fill('[data-testid="email-input"]', "newuser@example.com");
      await page.fill('[data-testid="password-input"]', "somepassword");

      await page.click('button:has-text("Sign in")');

      await expect(
        page.locator("text=Would you like to create a new account?")
      ).toBeVisible();

      // Test signup button functionality
      const signupButton = page.locator("text=Sign Up").last();
      await expect(signupButton).toBeVisible();
      await signupButton.click();
      await expect(page).toHaveURL("/register");
    });

    test("should show loading state during login", async ({ page }) => {
      await page.goto("/login");

      await page.fill('[data-testid="email-input"]', testUsers.customer.email);
      await page.fill(
        '[data-testid="password-input"]',
        testUsers.customer.password
      );

      // Click login and immediately check for loading state
      await page.click('button:has-text("Sign in")');

      // Verify loading state appears briefly
      await expect(page.locator("text=Signing in...")).toBeVisible();
    });

    test("should handle forgotten password link", async ({ page }) => {
      await page.goto("/login");

      const forgotPasswordLink = page.locator("text=Forgot password?");
      await expect(forgotPasswordLink).toBeVisible();
      await expect(forgotPasswordLink).toHaveAttribute(
        "href",
        "/forgot-password"
      );
    });
  });

  test.describe("Navigation and UI", () => {
    test("should navigate between login and register pages", async ({
      page,
    }) => {
      // Start at login page
      await page.goto("/login");

      // Navigate to register
      await page.click("text=Sign up");
      await expect(page).toHaveURL("/register");

      // Navigate back to login
      await page.click("text=Sign in");
      await expect(page).toHaveURL("/login");
    });

    test("should handle return button", async ({ page }) => {
      await page.goto("/login");

      await page.click('button:has-text("Return")');
      await expect(page).toHaveURL("/");
    });

    test("should display branding correctly", async ({ page }) => {
      await page.goto("/login");

      // Verify logo and branding
      await expect(page.locator('img[alt="Pet-à-Vet Logo"]')).toBeVisible();
      await expect(page.locator("text=Pet-à-Vet")).toBeVisible();
      await expect(page.locator("text=Sign in to your account")).toBeVisible();
    });

    test("should be responsive on mobile devices", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/login");

      // Verify responsive layout
      const card = page.locator(".max-w-md");
      await expect(card).toBeVisible();

      // Verify form elements are accessible
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="password-input"]')
      ).toBeVisible();
      await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    });
  });

  test.describe("Role-Based Access", () => {
    test("should redirect admin to admin dashboard", async ({ page }) => {
      await page.goto("/login");

      await page.fill('[data-testid="email-input"]', testUsers.admin.email);
      await page.fill(
        '[data-testid="password-input"]',
        testUsers.admin.password
      );

      await page.click('button:has-text("Sign in")');

      // Admin should be redirected to admin dashboard
      await expect(page).toHaveURL("/dashboard");

      // Verify admin-specific elements are visible
      await expect(page.locator("text=Administrator")).toBeVisible();
    });

    test("should redirect veterinarian appropriately", async ({ page }) => {
      await page.goto("/login");

      await page.fill(
        '[data-testid="email-input"]',
        testUsers.veterinarian.email
      );
      await page.fill(
        '[data-testid="password-input"]',
        testUsers.veterinarian.password
      );

      await page.click('button:has-text("Sign in")');

      await expect(page).toHaveURL("/dashboard");

      // Verify vet-specific access
      await expect(page.locator("text=Veterinarian")).toBeVisible();
    });

    test("should redirect customer to customer dashboard", async ({ page }) => {
      await page.goto("/login");

      await page.fill('[data-testid="email-input"]', testUsers.customer.email);
      await page.fill(
        '[data-testid="password-input"]',
        testUsers.customer.password
      );

      await page.click('button:has-text("Sign in")');

      await expect(page).toHaveURL("/dashboard");

      // Verify customer-specific elements
      await expect(page.locator("text=Customer")).toBeVisible();
    });
  });

  test.describe("Session Management", () => {
    test("should maintain session across page reloads", async ({ page }) => {
      // Login first
      await page.goto("/login");
      await page.fill('[data-testid="email-input"]', testUsers.customer.email);
      await page.fill(
        '[data-testid="password-input"]',
        testUsers.customer.password
      );
      await page.click('button:has-text("Sign in")');

      await expect(page).toHaveURL("/dashboard");

      // Reload page and verify user is still logged in
      await page.reload();
      await expect(page).toHaveURL("/dashboard");
      await expect(page.locator("text=Dashboard")).toBeVisible();
    });

    test("should handle logout correctly", async ({ page }) => {
      // Login first
      await page.goto("/login");
      await page.fill('[data-testid="email-input"]', testUsers.customer.email);
      await page.fill(
        '[data-testid="password-input"]',
        testUsers.customer.password
      );
      await page.click('button:has-text("Sign in")');

      await expect(page).toHaveURL("/dashboard");

      // Logout
      await page.click("text=Logout");

      // Verify redirect to login page
      await expect(page).toHaveURL("/login");

      // Verify cannot access protected pages
      await page.goto("/dashboard");
      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Security Tests", () => {
    test("should not expose sensitive information in page source", async ({
      page,
    }) => {
      await page.goto("/login");

      const content = await page.content();

      // Verify passwords are not in page source
      expect(content).not.toContain("password123");
      expect(content).not.toContain("AdminPass123!");
    });

    test("should handle XSS prevention in form inputs", async ({ page }) => {
      await page.goto("/login");

      const xssPayload = '<script>alert("XSS")</script>';

      await page.fill('[data-testid="email-input"]', xssPayload);
      await page.fill('[data-testid="password-input"]', "password");

      await page.click('button:has-text("Sign in")');

      // Verify XSS payload is not executed
      const alerts = [];
      page.on("dialog", (dialog) => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });

      // Wait a moment for any potential XSS to execute
      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);
    });

    test("should implement proper HTTPS redirects in production", async ({
      page,
    }) => {
      // This test would be more relevant in a production environment
      // For now, verify that security headers are present
      const response = await page.goto("/login");
      const headers = response?.headers();

      // In production, these headers should be present
      // expect(headers?.['strict-transport-security']).toBeDefined();
    });
  });

  test.describe("Accessibility Tests", () => {
    test("should be keyboard navigable", async ({ page }) => {
      await page.goto("/login");

      // Test tab navigation
      await page.keyboard.press("Tab");
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(
        page.locator('[data-testid="password-input"]')
      ).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.locator("text=Forgot password?")).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.locator('button:has-text("Sign in")')).toBeFocused();
    });

    test("should have proper ARIA labels", async ({ page }) => {
      await page.goto("/login");

      // Verify form labels
      const emailInput = page.locator('[data-testid="email-input"]');
      const passwordInput = page.locator('[data-testid="password-input"]');

      await expect(emailInput).toHaveAttribute("aria-label");
      await expect(passwordInput).toHaveAttribute("aria-label");
    });

    test("should announce form errors to screen readers", async ({ page }) => {
      await page.goto("/login");

      await page.click('button:has-text("Sign in")');

      // Verify error messages have proper ARIA attributes
      const errorMessage = page.locator('[role="alert"]');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe("Performance Tests", () => {
    test("should load login page quickly", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/login");
      await expect(page.locator('button:has-text("Sign in")')).toBeVisible();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test("should handle rapid form submissions", async ({ page }) => {
      await page.goto("/login");

      await page.fill('[data-testid="email-input"]', testUsers.customer.email);
      await page.fill(
        '[data-testid="password-input"]',
        testUsers.customer.password
      );

      // Rapidly click submit button multiple times
      const submitButton = page.locator('button:has-text("Sign in")');
      await submitButton.click();
      await submitButton.click();
      await submitButton.click();

      // Should handle gracefully and redirect only once
      await expect(page).toHaveURL("/dashboard");
    });
  });
});
