import { Page, expect, BrowserContext } from "@playwright/test";
import { validUsers, generateRandomUser } from "./test-data";

/**
 * Helper functions for authentication testing
 */

export class AuthTestHelper {
  constructor(private page: Page, private context?: BrowserContext) {}

  /**
   * Navigate to login page and wait for it to load
   */
  async goToLogin() {
    await this.page.goto("/login");
    await this.page.waitForLoadState("networkidle");
    await expect(this.page.locator("h1")).toContainText("Sign In");
  }

  /**
   * Navigate to register page and wait for it to load
   */
  async goToRegister() {
    await this.page.goto("/register");
    await this.page.waitForLoadState("networkidle");
    await expect(this.page.locator("h1")).toContainText("Sign Up");
  }

  /**
   * Fill login form with provided credentials
   */
  async fillLoginForm(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
  }

  /**
   * Fill registration form with provided user data
   */
  async fillRegisterForm(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    role: string;
    phone?: string;
  }) {
    await this.page.fill('input[name="name"]', userData.name);
    await this.page.fill('input[name="email"]', userData.email);
    await this.page.fill('input[name="password"]', userData.password);

    if (userData.confirmPassword) {
      await this.page.fill(
        'input[name="confirmPassword"]',
        userData.confirmPassword
      );
    }

    await this.page.selectOption('select[name="role"]', userData.role);

    if (userData.phone) {
      await this.page.fill('input[name="phone"]', userData.phone);
    }
  }

  /**
   * Submit the current form (login or register)
   */
  async submitForm() {
    await this.page.click('button[type="submit"]');
  }

  /**
   * Perform complete login flow
   */
  async login(
    email: string = validUsers.customer.email,
    password: string = validUsers.customer.password
  ) {
    await this.goToLogin();
    await this.fillLoginForm(email, password);
    await this.submitForm();
  }

  /**
   * Perform complete registration flow
   */
  async register(userData?: any) {
    const user = userData || {
      ...generateRandomUser(),
      confirmPassword: generateRandomUser().password,
    };

    await this.goToRegister();
    await this.fillRegisterForm(user);
    await this.submitForm();

    return user;
  }

  /**
   * Check if user is logged in (redirected to dashboard)
   */
  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Check if user is on login page (not logged in)
   */
  async expectNotLoggedIn() {
    await expect(this.page).toHaveURL(/\/login/);
  }

  /**
   * Check for error message display
   */
  async expectErrorMessage(message?: string) {
    const errorElement = this.page.locator('[data-testid="error-message"]');
    await expect(errorElement).toBeVisible();

    if (message) {
      await expect(errorElement).toContainText(message);
    }
  }

  /**
   * Check for success message display
   */
  async expectSuccessMessage(message?: string) {
    const successElement = this.page.locator('[data-testid="success-message"]');
    await expect(successElement).toBeVisible();

    if (message) {
      await expect(successElement).toContainText(message);
    }
  }

  /**
   * Mock API responses for testing
   */
  async mockApiResponse(endpoint: string, response: any, status: number = 200) {
    await this.page.route(`**/api/${endpoint}`, (route) => {
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Mock successful login response
   */
  async mockSuccessfulLogin(user: any = validUsers.customer) {
    await this.mockApiResponse("auth/signin", {
      success: true,
      user: { id: "1", email: user.email, role: user.role },
    });
  }

  /**
   * Mock failed login response
   */
  async mockFailedLogin(error: string = "Invalid credentials") {
    await this.mockApiResponse(
      "auth/signin",
      {
        success: false,
        error,
      },
      401
    );
  }

  /**
   * Mock successful registration response
   */
  async mockSuccessfulRegistration(user: any) {
    await this.mockApiResponse("auth/signup", {
      success: true,
      user: { id: "1", email: user.email, role: user.role },
    });
  }

  /**
   * Mock failed registration response
   */
  async mockFailedRegistration(error: string = "Email already exists") {
    await this.mockApiResponse(
      "auth/signup",
      {
        success: false,
        error,
      },
      400
    );
  }

  /**
   * Mock network error
   */
  async mockNetworkError(endpoint: string) {
    await this.page.route(`**/api/${endpoint}`, (route) => {
      route.abort("failed");
    });
  }

  /**
   * Clear all cookies and local storage
   */
  async clearSession() {
    if (this.context) {
      await this.context.clearCookies();
    }
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Set authentication cookie
   */
  async setAuthCookie(token: string) {
    if (this.context) {
      await this.context.addCookies([
        {
          name: "auth-token",
          value: token,
          domain: "localhost",
          path: "/",
          httpOnly: true,
          secure: false, // Set to true in production
        },
      ]);
    }
  }

  /**
   * Check if element has focus
   */
  async expectFocused(selector: string) {
    await expect(this.page.locator(selector)).toBeFocused();
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(expectedOrder: string[]) {
    for (let i = 0; i < expectedOrder.length; i++) {
      await this.page.keyboard.press("Tab");
      await this.expectFocused(expectedOrder[i]);
    }
  }

  /**
   * Test form validation
   */
  async testFormValidation(
    field: string,
    value: string,
    expectedError: string
  ) {
    await this.page.fill(field, value);
    await this.page.blur(field);

    const errorElement = this.page.locator(`[data-testid="${field}-error"]`);
    await expect(errorElement).toContainText(expectedError);
  }

  /**
   * Measure page load time
   */
  async measurePageLoadTime(): Promise<number> {
    const start = Date.now();
    await this.page.waitForLoadState("networkidle");
    return Date.now() - start;
  }

  /**
   * Check accessibility attributes
   */
  async checkAccessibility() {
    // Check for proper ARIA labels
    const emailInput = this.page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute("aria-label");

    const passwordInput = this.page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute("aria-label");

    const submitButton = this.page.locator('button[type="submit"]');
    await expect(submitButton).toHaveAttribute("aria-label");

    // Check for proper form labeling
    await expect(emailInput).toHaveAttribute("id");
    await expect(passwordInput).toHaveAttribute("id");
  }

  /**
   * Test responsive design
   */
  async testResponsiveDesign() {
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await expect(this.page.locator("form")).toBeVisible();

    // Test tablet viewport
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await expect(this.page.locator("form")).toBeVisible();

    // Test desktop viewport
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await expect(this.page.locator("form")).toBeVisible();
  }

  /**
   * Take screenshot for visual testing
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for API call to complete
   */
  async waitForApiCall(endpoint: string) {
    return this.page.waitForResponse(
      (response) =>
        response.url().includes(endpoint) && response.status() !== 404
    );
  }

  /**
   * Simulate slow network conditions
   */
  async simulateSlowNetwork() {
    if (this.context) {
      await this.context.route("**/*", (route) => {
        setTimeout(() => route.continue(), 2000); // 2 second delay
      });
    }
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];

    this.page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Test password strength indicator
   */
  async testPasswordStrengthIndicator(
    password: string,
    expectedStrength: string
  ) {
    await this.page.fill('input[type="password"]', password);

    const strengthIndicator = this.page.locator(
      '[data-testid="password-strength"]'
    );
    await expect(strengthIndicator).toContainText(expectedStrength);
  }

  /**
   * Test password visibility toggle
   */
  async testPasswordVisibilityToggle() {
    const passwordInput = this.page.locator('input[type="password"]');
    const toggleButton = this.page.locator('[data-testid="password-toggle"]');

    // Initially password type
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click toggle to hide password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  }

  /**
   * Test form persistence (remember form data)
   */
  async testFormPersistence() {
    const email = "test@example.com";

    await this.page.fill('input[type="email"]', email);
    await this.page.reload();

    // Check if email is persisted (depends on implementation)
    const emailValue = await this.page
      .locator('input[type="email"]')
      .inputValue();
    return emailValue === email;
  }

  /**
   * Simulate user interactions with delays
   */
  async simulateHumanInteraction() {
    await this.page.waitForTimeout(500); // Wait before starting

    // Slowly type email
    await this.page.type('input[type="email"]', "user@example.com", {
      delay: 100,
    });
    await this.page.waitForTimeout(300);

    // Move to password field
    await this.page.click('input[type="password"]');
    await this.page.waitForTimeout(200);

    // Slowly type password
    await this.page.type('input[type="password"]', "password123", {
      delay: 80,
    });
    await this.page.waitForTimeout(500);

    // Submit form
    await this.page.click('button[type="submit"]');
  }
}

/**
 * Utility functions for test setup and teardown
 */
export class TestUtils {
  /**
   * Generate unique test user email
   */
  static generateTestEmail(): string {
    return `test.${Date.now()}.${Math.random()
      .toString(36)
      .substring(7)}@petavet.test`;
  }

  /**
   * Generate secure test password
   */
  static generateSecurePassword(): string {
    return `TestPass${Date.now()}!`;
  }

  /**
   * Wait for condition with timeout
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 10000,
    interval: number = 100
  ): Promise<boolean> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    return false;
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;

        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error("Max retries exceeded");
  }

  /**
   * Create test database state
   */
  static async setupTestData() {
    // Implementation would depend on your database setup
    console.log("Setting up test data...");
  }

  /**
   * Clean up test database state
   */
  static async cleanupTestData() {
    // Implementation would depend on your database setup
    console.log("Cleaning up test data...");
  }
}
