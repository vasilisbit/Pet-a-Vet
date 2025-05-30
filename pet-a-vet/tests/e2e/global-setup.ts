import { chromium, FullConfig } from "@playwright/test";
import { TestUtils } from "../helpers/auth-helpers";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global test setup...");

  // Start browser for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Setup test database
    await TestUtils.setupTestData();

    // Verify application is accessible
    console.log("📡 Checking application availability...");
    await page.goto(config.webServer?.url || "http://localhost:3000");
    await page.waitForLoadState("networkidle", { timeout: 30000 });

    // Verify critical pages load
    const criticalPages = ["/login", "/register"];
    for (const pagePath of criticalPages) {
      console.log(`📄 Checking ${pagePath}...`);
      await page.goto(`${config.webServer?.url}${pagePath}`);
      await page.waitForLoadState("networkidle");
    }

    // Create test users for authentication tests
    console.log("👥 Creating test users...");
    await createTestUsers(page);

    // Setup mock data
    console.log("🎭 Setting up mock data...");
    await setupMockData();

    console.log("✅ Global setup completed successfully");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function createTestUsers(page: any) {
  // Create test users in the database or mock them
  const testUsers = [
    {
      name: "Test Customer",
      email: "testcustomer@petavet.test",
      password: "TestCustomer123!",
      role: "customer",
    },
    {
      name: "Test Vet",
      email: "testvet@petavet.test",
      password: "TestVet123!",
      role: "vet",
    },
    {
      name: "Test Admin",
      email: "testadmin@petavet.test",
      password: "TestAdmin123!",
      role: "admin",
    },
  ];

  // Mock user creation API calls
  for (const user of testUsers) {
    await page.route("**/api/auth/signup", (route) => {
      if (route.request().postDataJSON()?.email === user.email) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            user: { id: Math.random().toString(), ...user },
          }),
        });
      } else {
        route.continue();
      }
    });
  }
}

async function setupMockData() {
  // Setup any additional mock data needed for tests
  process.env.TEST_MODE = "true";
  process.env.MOCK_AUTH = "true";

  // Mock external services if needed
  // e.g., email service, payment service, etc.
}

export default globalSetup;
