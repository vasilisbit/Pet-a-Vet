// Performance Testing Script for Marketplace
// Run this with: npx ts-node performance-test.ts

import puppeteer from "puppeteer";

// Configure the base URL
const BASE_URL = "http://localhost:3000";

// Performance thresholds (milliseconds)
const THRESHOLDS = {
  FCP: 1000, // First Contentful Paint
  LCP: 2500, // Largest Contentful Paint
  TTI: 3500, // Time to Interactive
  CLS: 0.1, // Cumulative Layout Shift (unitless)
  LOAD: 3000, // Page Load
};

async function runPerformanceTest() {
  console.log("Starting performance test...");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const pages = [
      { name: "Marketplace Home", url: `${BASE_URL}/dashboard/marketplace` },
      {
        name: "Category Page",
        url: `${BASE_URL}/dashboard/marketplace/category/medications`,
      },
      { name: "Cart Page", url: `${BASE_URL}/dashboard/marketplace/cart` },
      {
        name: "Checkout Page",
        url: `${BASE_URL}/dashboard/marketplace/checkout`,
      },
    ];

    for (const page of pages) {
      console.log(`\nTesting: ${page.name}`);

      const tab = await browser.newPage();

      // Enable performance metrics collection
      await tab.setCacheEnabled(false);
      await tab.coverage.startJSCoverage();

      // Capture metrics
      const metrics = {};
      tab.on("metrics", (data) => {
        Object.assign(metrics, data.metrics);
      });

      // Create performance observer in page
      await tab.evaluateOnNewDocument(() => {
        window.performanceMetrics = {
          FCP: 0,
          LCP: 0,
          CLS: 0,
        };

        // Observe FCP
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === "first-contentful-paint") {
              window.performanceMetrics.FCP = entry.startTime;
            }
          }
        }).observe({ type: "paint", buffered: true });

        // Observe LCP
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          window.performanceMetrics.LCP = lastEntry.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });

        // Observe CLS
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              window.performanceMetrics.CLS = clsValue;
            }
          }
        }).observe({ type: "layout-shift", buffered: true });
      });

      // Start timing and navigate to the page
      const navigationStart = Date.now();
      const response = await tab.goto(page.url, { waitUntil: "networkidle0" });
      const loadTime = Date.now() - navigationStart;

      // Collect performance metrics
      const performanceMetrics = await tab.evaluate(() => {
        return window.performanceMetrics;
      });

      // Collect JavaScript coverage
      const jsCoverage = await tab.coverage.stopJSCoverage();

      // Calculate JS coverage
      let totalBytes = 0;
      let usedBytes = 0;

      for (const entry of jsCoverage) {
        totalBytes += entry.text.length;
        for (const range of entry.ranges) {
          usedBytes += range.end - range.start;
        }
      }

      const unusedJsPercentage = totalBytes
        ? ((totalBytes - usedBytes) / totalBytes) * 100
        : 0;

      // Log results
      console.log(`Status code: ${response.status()}`);
      console.log(
        `Load time: ${loadTime}ms ${loadTime <= THRESHOLDS.LOAD ? "✅" : "❌"}`
      );
      console.log(
        `First Contentful Paint: ${performanceMetrics.FCP.toFixed(1)}ms ${
          performanceMetrics.FCP <= THRESHOLDS.FCP ? "✅" : "❌"
        }`
      );
      console.log(
        `Largest Contentful Paint: ${performanceMetrics.LCP.toFixed(1)}ms ${
          performanceMetrics.LCP <= THRESHOLDS.LCP ? "✅" : "❌"
        }`
      );
      console.log(
        `Cumulative Layout Shift: ${performanceMetrics.CLS.toFixed(4)} ${
          performanceMetrics.CLS <= THRESHOLDS.CLS ? "✅" : "❌"
        }`
      );
      console.log(`Unused JavaScript: ${unusedJsPercentage.toFixed(1)}%`);

      // Clean up
      await tab.close();
    }
  } catch (error) {
    console.error("Error during performance testing:", error);
  } finally {
    await browser.close();
    console.log("\nPerformance testing completed.");
  }
}

// Run the test
runPerformanceTest();
