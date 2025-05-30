/**
 * Integration tests for the Reports Page
 * Tests for comprehensive debugging and enhancement
 */

import { test, expect } from "@playwright/test";

test.describe("Reports Page - Comprehensive Testing", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to reports page
    await page.goto("/dashboard/reports");
  });

  test("should load reports page with proper layout", async ({ page }) => {
    // Check page title and description
    await expect(page.locator("h1")).toContainText("Reports & Analytics");
    await expect(page.locator("p")).toContainText(
      "Real-time insights and analytics"
    );

    // Check filter panel is visible
    await expect(page.locator('[data-testid="filters-panel"]')).toBeVisible();

    // Check tabs are present
    await expect(page.locator('role=tab[name="Appointments"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Diagnoses"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Revenue"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Demographics"]')).toBeVisible();
  });

  test("should display summary statistics", async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="summary-stats"]', {
      timeout: 10000,
    });

    // Check summary cards
    await expect(
      page.locator('[data-testid="total-appointments"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="active-pets"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-revenue"]')).toBeVisible();
  });

  test("should render charts without visual issues", async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector(".recharts-wrapper", { timeout: 15000 });

    // Check appointment charts
    await expect(page.locator(".recharts-line-chart")).toBeVisible();
    await expect(page.locator(".recharts-pie")).toBeVisible();

    // Verify charts have colors (not black lines)
    const lineElement = page.locator(".recharts-line");
    await expect(lineElement).not.toHaveCSS("stroke", "rgb(0, 0, 0)");

    // Check pie chart has colors
    const pieElements = page.locator(".recharts-pie-sector");
    const count = await pieElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should handle filter functionality", async ({ page }) => {
    // Test date range filter
    await page.locator('[data-testid="date-range-select"]').click();
    await page.locator("text=Last 7 days").click();

    // Test species filter
    await page.locator('[data-testid="species-select"]').click();
    await page.locator("text=Dogs").click();

    // Apply filters
    await page.locator('button:has-text("Apply Filters")').click();

    // Verify loading state
    await expect(page.locator("text=Applying...")).toBeVisible();

    // Wait for completion
    await page.waitForSelector("text=Apply Filters", { timeout: 10000 });
  });

  test("should handle tab navigation", async ({ page }) => {
    // Test each tab
    const tabs = ["Diagnoses", "Revenue", "Demographics"];

    for (const tab of tabs) {
      await page.locator(`role=tab[name="${tab}"]`).click();

      // Wait for tab content to load
      await page.waitForSelector(`role=tabpanel >> visible=true`, {
        timeout: 5000,
      });

      // Verify charts are rendered
      await expect(page.locator(".recharts-wrapper")).toBeVisible();
    }
  });

  test("should handle responsive design", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check layout adapts
    await expect(page.locator('[data-testid="filters-panel"]')).toBeVisible();

    // Charts should still be visible and not overflow
    const chartContainer = page.locator(".chart-container").first();
    await expect(chartContainer).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(chartContainer).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(chartContainer).toBeVisible();
  });

  test("should handle export functionality", async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector(".recharts-wrapper", { timeout: 15000 });

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click export button
    await page.locator('button:has-text("Export")').click();

    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/veterinary-reports-.*\.json/);
  });

  test("should handle error states gracefully", async ({ page }) => {
    // Mock API failure
    await page.route("/api/reports*", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    // Reload page
    await page.reload();

    // Check error message is displayed
    await expect(page.locator('[role="alert"]')).toContainText(
      "Failed to fetch reports"
    );

    // Check retry button is present
    await expect(
      page.locator('button:has-text("Retry Loading Data")')
    ).toBeVisible();
  });

  test("should support keyboard navigation", async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector(".recharts-wrapper", { timeout: 15000 });

    // Test Ctrl+R for refresh
    await page.keyboard.press("Control+r");
    await expect(page.locator("text=Applying...")).toBeVisible();

    // Wait for refresh to complete
    await page.waitForSelector("text=Apply Filters", { timeout: 10000 });

    // Test Ctrl+E for export
    const downloadPromise = page.waitForEvent("download");
    await page.keyboard.press("Control+e");

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/veterinary-reports-.*\.json/);
  });

  test("should display accessibility features", async ({ page }) => {
    // Check ARIA labels on charts
    await expect(
      page.locator('[role="img"][aria-label*="chart"]')
    ).toBeVisible();

    // Check button accessibility
    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toHaveAttribute("title");

    const exportButton = page.locator('button:has-text("Export")');
    await expect(exportButton).toHaveAttribute("title");
  });

  test("should handle loading states properly", async ({ page }) => {
    // Intercept API to add delay
    await page.route("/api/reports*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      route.continue();
    });

    // Reload page
    await page.reload();

    // Check skeleton loaders are visible
    await expect(page.locator('[data-testid="chart-skeleton"]')).toBeVisible();

    // Wait for actual content
    await page.waitForSelector(".recharts-wrapper", { timeout: 15000 });

    // Verify skeletons are gone
    await expect(
      page.locator('[data-testid="chart-skeleton"]')
    ).not.toBeVisible();
  });
});
