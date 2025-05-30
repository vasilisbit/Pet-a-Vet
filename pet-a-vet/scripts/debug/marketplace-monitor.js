/**
 * Marketplace Performance Test Suite
 *
 * This script verifies that the infinite API loop fixes are working correctly.
 *
 * Usage:
 * 1. Open browser developer tools (F12)
 * 2. Navigate to the Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter to run
 * 5. Navigate through the marketplace and monitor the output
 */

console.log("🚀 Initializing Marketplace Performance Monitor...");

// Performance monitoring state
const performanceState = {
  apiCalls: {},
  startTime: Date.now(),
  alertThreshold: 10, // Alert if same API called more than 10 times
  timeWindow: 30000, // 30 seconds
  isMonitoring: false,
};

// Store original fetch for restoration
const originalFetch = window.fetch;

/**
 * Enhanced fetch wrapper with performance monitoring
 */
function monitoredFetch(...args) {
  const url = args[0];

  if (typeof url === "string" && url.includes("/api/")) {
    const endpoint = url.replace(window.location.origin, "").split("?")[0];
    const timestamp = Date.now();

    // Initialize endpoint tracking
    if (!performanceState.apiCalls[endpoint]) {
      performanceState.apiCalls[endpoint] = [];
    }

    // Add this call to the tracking
    performanceState.apiCalls[endpoint].push(timestamp);

    // Clean up old calls outside time window
    const cutoff = timestamp - performanceState.timeWindow;
    performanceState.apiCalls[endpoint] = performanceState.apiCalls[
      endpoint
    ].filter((time) => time > cutoff);

    const callCount = performanceState.apiCalls[endpoint].length;

    // Log the API call
    console.log(`🌐 API Call #${callCount} to: ${endpoint}`);

    // Check for potential infinite loops
    if (callCount > performanceState.alertThreshold) {
      console.error(`🚨 POTENTIAL INFINITE LOOP DETECTED!`);
      console.error(`   Endpoint: ${endpoint}`);
      console.error(`   Calls in last 30s: ${callCount}`);
      console.error(
        `   Times:`,
        performanceState.apiCalls[endpoint].map((t) =>
          new Date(t).toLocaleTimeString()
        )
      );

      // Show stack trace to help identify source
      console.trace("API call stack trace:");
    }
  }

  return originalFetch.apply(this, args);
}

/**
 * Start monitoring API calls
 */
function startMonitoring() {
  if (performanceState.isMonitoring) {
    console.log("⚠️  Monitoring already active");
    return;
  }

  window.fetch = monitoredFetch;
  performanceState.isMonitoring = true;
  performanceState.startTime = Date.now();
  performanceState.apiCalls = {};

  console.log("✅ API monitoring started");
  console.log("📊 Use showStats() to view current statistics");
  console.log("🛑 Use stopMonitoring() to stop monitoring");
}

/**
 * Stop monitoring API calls
 */
function stopMonitoring() {
  if (!performanceState.isMonitoring) {
    console.log("⚠️  Monitoring not active");
    return;
  }

  window.fetch = originalFetch;
  performanceState.isMonitoring = false;

  console.log("🛑 API monitoring stopped");
  showStats();
}

/**
 * Show current API call statistics
 */
function showStats() {
  const elapsed = (Date.now() - performanceState.startTime) / 1000;

  console.log("\n📊 === API CALL STATISTICS ===");
  console.log(`⏱️  Monitoring duration: ${elapsed.toFixed(1)}s`);
  console.log("🔗 API calls by endpoint:");

  if (Object.keys(performanceState.apiCalls).length === 0) {
    console.log("   No API calls detected");
    return;
  }

  Object.entries(performanceState.apiCalls).forEach(([endpoint, calls]) => {
    const count = calls.length;
    let status = "✅ NORMAL";

    if (count > performanceState.alertThreshold) {
      status = "🚨 EXCESSIVE";
    } else if (count > 5) {
      status = "⚠️  HIGH";
    }

    console.log(`   ${status} ${endpoint}: ${count} calls`);

    if (count > 3) {
      const intervals = [];
      for (let i = 1; i < calls.length; i++) {
        intervals.push(calls[i] - calls[i - 1]);
      }
      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
      console.log(`      ⏱️ Avg interval: ${avgInterval.toFixed(0)}ms`);
    }
  });

  console.log("=".repeat(30));
}

/**
 * Reset all statistics
 */
function resetStats() {
  performanceState.apiCalls = {};
  performanceState.startTime = Date.now();
  console.log("🔄 Statistics reset");
}

/**
 * Test specific marketplace pages
 */
function testMarketplacePages() {
  console.log("🧪 Starting marketplace page test...");

  const pages = [
    "/dashboard/marketplace",
    "/dashboard/marketplace/category/medications",
    "/dashboard/marketplace/category/food",
    "/dashboard/marketplace/category/accessories",
    "/dashboard/marketplace/cart",
  ];

  let currentPage = 0;

  function testNextPage() {
    if (currentPage >= pages.length) {
      console.log("✅ Page test completed");
      showStats();
      return;
    }

    const page = pages[currentPage];
    console.log(`🔄 Testing page: ${page}`);

    // Navigate to page
    window.history.pushState({}, "", page);
    window.dispatchEvent(new PopStateEvent("popstate"));

    currentPage++;

    // Wait 3 seconds before testing next page
    setTimeout(testNextPage, 3000);
  }

  testNextPage();
}

// Auto-start monitoring
startMonitoring();

// Set up periodic stats display
const statsInterval = setInterval(() => {
  if (performanceState.isMonitoring) {
    showStats();
  }
}, 30000);

// Make functions globally accessible
window.marketplaceMonitor = {
  startMonitoring,
  stopMonitoring,
  showStats,
  resetStats,
  testMarketplacePages,
  getState: () => performanceState,
};

console.log("✨ Marketplace Performance Monitor ready!");
console.log("🎮 Available commands:");
console.log("   marketplaceMonitor.showStats() - Show current statistics");
console.log("   marketplaceMonitor.resetStats() - Reset all counters");
console.log(
  "   marketplaceMonitor.testMarketplacePages() - Auto-test all pages"
);
console.log("   marketplaceMonitor.stopMonitoring() - Stop monitoring");
console.log("");
console.log("🏁 Now navigate to the marketplace and watch for infinite loops!");
