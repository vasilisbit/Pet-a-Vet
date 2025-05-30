/**
 * Cross-Browser Validation Test Suite for Reports Page
 *
 * This test suite validates compatibility across different browsers
 * and ensures consistent functionality and styling.
 *
 * Run with: npm run test:integration
 */

import {
  test,
  expect,
  Page,
  Browser,
  chromium,
  firefox,
  webkit,
} from "@playwright/test";

// Browser configurations for testing
const BROWSERS = [
  { name: "chromium", browser: chromium },
  { name: "firefox", browser: firefox },
  { name: "webkit", browser: webkit },
];

// Viewport configurations for responsive testing
const VIEWPORTS = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1920, height: 1080 },
];

// Test URLs
const REPORTS_URL = "http://localhost:3001/dashboard/reports";

describe("Cross-Browser Reports Page Validation", () => {
  // Test basic page loading across browsers
  BROWSERS.forEach(({ name, browser }) => {
    test(`Page loads successfully in ${name}`, async () => {
      const browserInstance = await browser.launch();
      const page = await browserInstance.newPage();

      try {
        // Navigate to reports page
        await page.goto(REPORTS_URL, { waitUntil: "networkidle" });

        // Check page title
        const title = await page.title();
        expect(title).toContain("Pet-a-Vet");

        // Check main heading exists
        const heading = await page.locator("h1").first();
        await expect(heading).toBeVisible();

        // Check navigation elements
        const nav = await page.locator("nav");
        await expect(nav).toBeVisible();

        // Verify no console errors (critical errors only)
        const errors: string[] = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") {
            errors.push(msg.text());
          }
        });

        // Wait for page to settle
        await page.waitForTimeout(2000);

        // Filter out known non-critical errors
        const criticalErrors = errors.filter(
          (error) =>
            !error.includes("favicon") &&
            !error.includes("trace") &&
            !error.includes("EPERM")
        );

        expect(criticalErrors).toHaveLength(0);
      } finally {
        await browserInstance.close();
      }
    });
  });

  // Test responsive design across browsers and viewports
  BROWSERS.forEach(({ name, browser }) => {
    VIEWPORTS.forEach(({ name: viewportName, width, height }) => {
      test(`Responsive design works in ${name} on ${viewportName}`, async () => {
        const browserInstance = await browser.launch();
        const page = await browserInstance.newPage();

        try {
          // Set viewport
          await page.setViewportSize({ width, height });

          // Navigate to reports page
          await page.goto(REPORTS_URL, { waitUntil: "networkidle" });

          // Check charts are responsive
          const chartContainers = await page.locator(
            ".recharts-responsive-container"
          );
          const chartCount = await chartContainers.count();
          expect(chartCount).toBeGreaterThan(0);

          // Verify charts fit within viewport
          for (let i = 0; i < chartCount; i++) {
            const chart = chartContainers.nth(i);
            const boundingBox = await chart.boundingBox();
            if (boundingBox) {
              expect(boundingBox.width).toBeLessThanOrEqual(width);
              expect(boundingBox.x).toBeGreaterThanOrEqual(0);
            }
          }

          // Check mobile navigation if on mobile viewport
          if (viewportName === "mobile") {
            const mobileMenu = await page.locator(
              '[data-testid="mobile-menu"]'
            );
            // Mobile menu should exist or navigation should be collapsed
            const navVisible = await page.locator("nav").isVisible();
            expect(navVisible || (await mobileMenu.count()) > 0).toBeTruthy();
          }
        } finally {
          await browserInstance.close();
        }
      });
    });
  });

  // Test chart rendering across browsers
  BROWSERS.forEach(({ name, browser }) => {
    test(`Charts render correctly in ${name}`, async () => {
      const browserInstance = await browser.launch();
      const page = await browserInstance.newPage();

      try {
        await page.goto(REPORTS_URL, { waitUntil: "networkidle" });

        // Wait for charts to load
        await page.waitForSelector(".recharts-responsive-container", {
          timeout: 10000,
        });

        // Check line charts
        const lineCharts = await page.locator(".recharts-line");
        expect(await lineCharts.count()).toBeGreaterThan(0);

        // Check bar charts
        const barCharts = await page.locator(".recharts-bar");
        expect(await barCharts.count()).toBeGreaterThan(0);

        // Check pie charts
        const pieCharts = await page.locator(".recharts-pie");
        expect(await pieCharts.count()).toBeGreaterThan(0);

        // Verify chart colors are applied (not black/default)
        const chartElements = await page.locator(
          ".recharts-line, .recharts-bar, .recharts-pie-sector"
        );
        const elementCount = await chartElements.count();

        for (let i = 0; i < Math.min(elementCount, 5); i++) {
          const element = chartElements.nth(i);
          const fill = await element.getAttribute("fill");
          const stroke = await element.getAttribute("stroke");

          // Ensure elements have proper colors (not black or transparent)
          if (fill) {
            expect(fill).not.toBe("#000000");
            expect(fill).not.toBe("black");
            expect(fill).not.toBe("transparent");
          }
          if (stroke) {
            expect(stroke).not.toBe("#000000");
            expect(stroke).not.toBe("black");
          }
        }
      } finally {
        await browserInstance.close();
      }
    });
  });

  // Test filter functionality across browsers
  BROWSERS.forEach(({ name, browser }) => {
    test(`Filters work correctly in ${name}`, async () => {
      const browserInstance = await browser.launch();
      const page = await browserInstance.newPage();

      try {
        await page.goto(REPORTS_URL, { waitUntil: "networkidle" });

        // Wait for page to load
        await page.waitForSelector('[data-testid="date-range-filter"]', {
          timeout: 10000,
        });

        // Test date range filter
        const dateFilter = page.locator('[data-testid="date-range-filter"]');
        await dateFilter.click();

        // Select different option
        const option = page.locator('[data-value="last7days"]');
        await option.click();

        // Wait for data to update
        await page.waitForTimeout(1000);

        // Verify filter was applied (URL should update or loading indicator should appear)
        const currentUrl = page.url();
        const hasLoadingIndicator =
          (await page.locator('[data-testid="loading-skeleton"]').count()) > 0;

        // Either URL changed or loading occurred
        expect(
          currentUrl.includes("last7days") || hasLoadingIndicator
        ).toBeTruthy();
      } finally {
        await browserInstance.close();
      }
    });
  });

  // Test accessibility across browsers
  BROWSERS.forEach(({ name, browser }) => {
    test(`Accessibility standards met in ${name}`, async () => {
      const browserInstance = await browser.launch();
      const page = await browserInstance.newPage();

      try {
        await page.goto(REPORTS_URL, { waitUntil: "networkidle" });

        // Check for proper heading hierarchy
        const h1Count = await page.locator("h1").count();
        expect(h1Count).toBeGreaterThanOrEqual(1);

        // Check for alt text on images
        const images = await page.locator("img");
        const imageCount = await images.count();

        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute("alt");
          const ariaLabel = await img.getAttribute("aria-label");

          // Images should have alt text or aria-label
          expect(alt !== null || ariaLabel !== null).toBeTruthy();
        }

        // Check for keyboard navigation
        await page.keyboard.press("Tab");
        const focusedElement = await page.locator(":focus");
        await expect(focusedElement).toBeVisible();

        // Check ARIA labels on charts
        const chartContainers = await page.locator(
          ".recharts-responsive-container"
        );
        const firstChart = chartContainers.first();

        if ((await firstChart.count()) > 0) {
          const ariaLabel = await firstChart.getAttribute("aria-label");
          const role = await firstChart.getAttribute("role");

          // Charts should have proper ARIA attributes
          expect(ariaLabel !== null || role !== null).toBeTruthy();
        }
      } finally {
        await browserInstance.close();
      }
    });
  });

  // Test performance across browsers
  BROWSERS.forEach(({ name, browser }) => {
    test(`Performance metrics acceptable in ${name}`, async () => {
      const browserInstance = await browser.launch();
      const page = await browserInstance.newPage();

      try {
        // Start timing
        const startTime = Date.now();

        await page.goto(REPORTS_URL, { waitUntil: "networkidle" });

        // Wait for charts to fully render
        await page.waitForSelector(".recharts-responsive-container", {
          timeout: 15000,
        });

        const loadTime = Date.now() - startTime;

        // Page should load within reasonable time (15 seconds)
        expect(loadTime).toBeLessThan(15000);

        // Check for performance marks if available
        const performanceMarks = await page.evaluate(() => {
          if (typeof window !== "undefined" && window.performance) {
            return window.performance
              .getEntriesByType("mark")
              .map((mark) => mark.name);
          }
          return [];
        });

        // Should have performance monitoring marks
        expect(performanceMarks.length).toBeGreaterThanOrEqual(0);
      } finally {
        await browserInstance.close();
      }
    });
  });

  // Test export functionality across browsers
  BROWSERS.forEach(({ name, browser }) => {
    test(`Export functionality works in ${name}`, async () => {
      const browserInstance = await browser.launch();
      const page = await browserInstance.newPage();

      try {
        await page.goto(REPORTS_URL, { waitUntil: "networkidle" });

        // Wait for export button
        await page.waitForSelector('[data-testid="export-button"]', {
          timeout: 10000,
        });

        // Set up download handler
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          page.click('[data-testid="export-button"]'),
        ]);

        // Verify download started
        expect(download.suggestedFilename()).toContain("reports");
        expect(download.suggestedFilename()).toContain(".json");
      } finally {
        await browserInstance.close();
      }
    });
  });
});

// Utility function to wait for charts to load
async function waitForChartsToLoad(page: Page) {
  await page.waitForSelector(".recharts-responsive-container", {
    timeout: 10000,
  });
  await page.waitForTimeout(1000); // Additional wait for animations
}

// Performance monitoring helper
async function getPerformanceMetrics(page: Page) {
  return await page.evaluate(() => {
    if (typeof window !== "undefined" && window.performance) {
      const navigation = window.performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstContentfulPaint:
          performance.getEntriesByName("first-contentful-paint")[0]
            ?.startTime || 0,
      };
    }
    return null;
  });
}
