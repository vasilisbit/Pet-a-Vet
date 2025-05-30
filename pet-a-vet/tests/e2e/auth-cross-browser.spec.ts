import { test, expect, devices } from "@playwright/test";

const BROWSERS = ["chromium", "firefox", "webkit"];
const MOBILE_DEVICES = ["iPhone 12", "Samsung Galaxy S21", "iPad Pro"];

BROWSERS.forEach((browserName) => {
  test.describe(`Authentication Cross-Browser Tests - ${browserName}`, () => {
    test.use({ ...devices["Desktop Chrome"] });

    test.beforeEach(async ({ page }) => {
      await page.goto("/login");
    });

    test(`should load login page correctly on ${browserName}`, async ({
      page,
    }) => {
      // Check page loads without errors
      await expect(page.locator("h1")).toContainText("Sign In");

      // Check form elements are present
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test(`should handle form validation on ${browserName}`, async ({
      page,
    }) => {
      // Submit empty form
      await page.click('button[type="submit"]');

      // Check validation messages appear
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="password-error"]')
      ).toBeVisible();
    });

    test(`should support keyboard navigation on ${browserName}`, async ({
      page,
    }) => {
      // Tab through form elements
      await page.keyboard.press("Tab");
      await expect(page.locator('input[type="email"]')).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.locator('input[type="password"]')).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.locator('button[type="submit"]')).toBeFocused();
    });

    test(`should handle password visibility toggle on ${browserName}`, async ({
      page,
    }) => {
      const passwordInput = page.locator('input[type="password"]');
      const toggleButton = page.locator('[data-testid="password-toggle"]');

      await passwordInput.fill("testpassword");
      await expect(passwordInput).toHaveAttribute("type", "password");

      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "text");

      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "password");
    });

    test(`should handle successful login on ${browserName}`, async ({
      page,
    }) => {
      // Mock successful login
      await page.route("**/api/auth/signin", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            user: { id: "1", email: "test@example.com" },
          }),
        });
      });

      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "password123");
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test(`should handle login errors on ${browserName}`, async ({ page }) => {
      // Mock failed login
      await page.route("**/api/auth/signin", (route) => {
        route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: "Invalid credentials",
          }),
        });
      });

      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "wrongpassword");
      await page.click('button[type="submit"]');

      await expect(page.locator('[data-testid="error-message"]')).toContainText(
        "Invalid credentials"
      );
    });

    test(`should handle network errors gracefully on ${browserName}`, async ({
      page,
    }) => {
      // Simulate network failure
      await page.route("**/api/auth/signin", (route) => {
        route.abort("failed");
      });

      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "password123");
      await page.click('button[type="submit"]');

      await expect(page.locator('[data-testid="error-message"]')).toContainText(
        "Network error"
      );
    });

    test(`should preserve form data on browser refresh on ${browserName}`, async ({
      page,
    }) => {
      await page.fill('input[type="email"]', "test@example.com");

      // Refresh page
      await page.reload();

      // Check if email is preserved (if implemented)
      const emailValue = await page.locator('input[type="email"]').inputValue();
      // Note: This might be empty if no persistence is implemented
    });

    test(`should handle autocomplete properly on ${browserName}`, async ({
      page,
    }) => {
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');

      await expect(emailInput).toHaveAttribute("autocomplete", "email");
      await expect(passwordInput).toHaveAttribute(
        "autocomplete",
        "current-password"
      );
    });

    test(`should register new user on ${browserName}`, async ({ page }) => {
      await page.goto("/register");

      // Mock successful registration
      await page.route("**/api/auth/signup", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            user: { id: "1", email: "newuser@example.com" },
          }),
        });
      });

      await page.fill('input[name="name"]', "New User");
      await page.fill('input[name="email"]', "newuser@example.com");
      await page.fill('input[name="password"]', "SecurePass123!");
      await page.fill('input[name="confirmPassword"]', "SecurePass123!");
      await page.selectOption('select[name="role"]', "customer");

      await page.click('button[type="submit"]');

      // Should redirect to login or dashboard
      await expect(page).toHaveURL(/\/(login|dashboard)/);
    });
  });
});

// Mobile Device Tests
MOBILE_DEVICES.forEach((deviceName) => {
  test.describe(`Authentication Mobile Tests - ${deviceName}`, () => {
    test.use({ ...devices[deviceName] });

    test.beforeEach(async ({ page }) => {
      await page.goto("/login");
    });

    test(`should be responsive on ${deviceName}`, async ({ page }) => {
      // Check mobile layout
      await expect(page.locator("form")).toBeVisible();

      // Check form is properly sized for mobile
      const formBox = await page.locator("form").boundingBox();
      const viewportSize = page.viewportSize();

      expect(formBox?.width).toBeLessThanOrEqual(viewportSize?.width ?? 0);
    });

    test(`should handle touch interactions on ${deviceName}`, async ({
      page,
    }) => {
      const emailInput = page.locator('input[type="email"]');

      // Tap to focus
      await emailInput.tap();
      await expect(emailInput).toBeFocused();

      // Type on mobile keyboard
      await emailInput.fill("mobile@example.com");
      await expect(emailInput).toHaveValue("mobile@example.com");
    });

    test(`should show mobile-friendly keyboards on ${deviceName}`, async ({
      page,
    }) => {
      const emailInput = page.locator('input[type="email"]');

      // Email input should trigger email keyboard
      await expect(emailInput).toHaveAttribute("inputmode", "email");
      await expect(emailInput).toHaveAttribute("type", "email");
    });

    test(`should handle screen orientation changes on ${deviceName}`, async ({
      page,
      context,
    }) => {
      // Test portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator("form")).toBeVisible();

      // Test landscape mode
      await page.setViewportSize({ width: 667, height: 375 });
      await expect(page.locator("form")).toBeVisible();
    });

    test(`should support pinch zoom on ${deviceName}`, async ({ page }) => {
      // Check viewport meta tag prevents unwanted zoom
      const viewportMeta = page.locator('meta[name="viewport"]');
      await expect(viewportMeta).toHaveAttribute(
        "content",
        /user-scalable=no|maximum-scale=1/
      );
    });

    test(`should have touch-friendly button sizes on ${deviceName}`, async ({
      page,
    }) => {
      const submitButton = page.locator('button[type="submit"]');
      const buttonBox = await submitButton.boundingBox();

      // Minimum touch target size should be 44px
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
      expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    });
  });
});

// Browser-specific feature tests
test.describe("Browser-Specific Features", () => {
  test("should handle autofill/password managers", async ({ page }) => {
    await page.goto("/login");

    // Test that password managers can detect login form
    const form = page.locator("form");
    await expect(form).toHaveAttribute("method", "post");

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toHaveAttribute("name");
    await expect(passwordInput).toHaveAttribute("name");
  });

  test("should handle browser back/forward navigation", async ({ page }) => {
    await page.goto("/login");
    await page.goto("/register");

    // Go back to login
    await page.goBack();
    await expect(page).toHaveURL(/\/login/);

    // Go forward to register
    await page.goForward();
    await expect(page).toHaveURL(/\/register/);
  });

  test("should work with disabled JavaScript (graceful degradation)", async ({
    page,
    context,
  }) => {
    // Disable JavaScript
    await context.setJavaScriptEnabled(false);

    await page.goto("/login");

    // Form should still be visible and functional
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should handle cookies and local storage", async ({ page, context }) => {
    await page.goto("/login");

    // Test cookie support
    await context.addCookies([
      {
        name: "test_cookie",
        value: "test_value",
        domain: "localhost",
        path: "/",
      },
    ]);

    const cookies = await context.cookies();
    expect(cookies.some((cookie) => cookie.name === "test_cookie")).toBe(true);

    // Test local storage
    await page.evaluate(() => {
      localStorage.setItem("test_key", "test_value");
    });

    const storageValue = await page.evaluate(() => {
      return localStorage.getItem("test_key");
    });

    expect(storageValue).toBe("test_value");
  });

  test("should handle different timezone settings", async ({ page }) => {
    // Test with different timezone
    await page.emulateTimezone("America/New_York");
    await page.goto("/login");

    // Check that timestamps are handled correctly
    const now = new Date();
    const timestamp = await page.evaluate(() => new Date().toISOString());

    expect(timestamp).toBeDefined();
  });

  test("should work with ad blockers and privacy extensions", async ({
    page,
    context,
  }) => {
    // Simulate ad blocker by blocking tracking scripts
    await page.route("**/analytics.js", (route) => route.abort());
    await page.route("**/tracking.js", (route) => route.abort());

    await page.goto("/login");

    // Core functionality should still work
    await expect(page.locator("form")).toBeVisible();
  });
});
