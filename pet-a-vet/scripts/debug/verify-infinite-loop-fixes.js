/**
 * Final Verification Script for Marketplace Infinite Loop Fixes
 *
 * This script tests the key scenarios that were causing infinite loops
 * and verifies that our fixes are working correctly.
 */

console.log("🚀 Starting Marketplace Infinite Loop Fix Verification...");

// Test configuration
const TEST_CONFIG = {
  maxApiCallsPerEndpoint: 5, // Maximum acceptable calls per endpoint in test period
  testDuration: 15000, // 15 seconds per test
  endpoints: [
    "/api/store/products?featured=true",
    "/api/store/products?category=accessories",
    "/api/store/products?category=medications",
    "/api/store/cart",
  ],
};

// Test state
const testState = {
  apiCalls: {},
  startTime: null,
  currentTest: null,
  testResults: [],
  originalFetch: null,
};

/**
 * Initialize test monitoring
 */
function initializeTestMonitoring() {
  testState.originalFetch = window.fetch;
  testState.apiCalls = {};
  testState.startTime = Date.now();

  // Override fetch to monitor API calls
  window.fetch = function (...args) {
    const url = args[0];
    if (typeof url === "string" && url.includes("/api/")) {
      const endpoint = url.replace(window.location.origin, "").split("?")[0];
      const query = url.includes("?") ? url.split("?")[1] : "";
      const fullEndpoint = query ? `${endpoint}?${query}` : endpoint;

      if (!testState.apiCalls[fullEndpoint]) {
        testState.apiCalls[fullEndpoint] = [];
      }

      testState.apiCalls[fullEndpoint].push({
        timestamp: Date.now(),
        url: url,
      });

      console.log(
        `📡 API Call: ${fullEndpoint} (${testState.apiCalls[fullEndpoint].length} total)`
      );
    }

    return testState.originalFetch.apply(this, args);
  };
}

/**
 * Cleanup test monitoring
 */
function cleanupTestMonitoring() {
  if (testState.originalFetch) {
    window.fetch = testState.originalFetch;
  }
}

/**
 * Analyze API call patterns
 */
function analyzeApiCalls() {
  const results = {
    totalCalls: 0,
    endpointResults: {},
    hasInfiniteLoops: false,
    worstOffender: null,
    maxCalls: 0,
  };

  Object.entries(testState.apiCalls).forEach(([endpoint, calls]) => {
    const count = calls.length;
    results.totalCalls += count;

    const status =
      count <= TEST_CONFIG.maxApiCallsPerEndpoint ? "PASS" : "FAIL";
    results.endpointResults[endpoint] = {
      calls: count,
      status: status,
      timestamps: calls.map((c) => c.timestamp),
    };

    if (count > results.maxCalls) {
      results.maxCalls = count;
      results.worstOffender = endpoint;
    }

    if (count > TEST_CONFIG.maxApiCallsPerEndpoint) {
      results.hasInfiniteLoops = true;
    }
  });

  return results;
}

/**
 * Test category page navigation
 */
async function testCategoryPageNavigation() {
  console.log("\n🧪 Testing Category Page Navigation...");

  testState.apiCalls = {};
  testState.currentTest = "category-navigation";

  const categories = ["medications", "food", "accessories", "grooming"];

  for (const category of categories) {
    console.log(`🔄 Navigating to category: ${category}`);

    // Simulate navigation
    window.history.pushState(
      {},
      "",
      `/dashboard/marketplace/category/${category}`
    );
    window.dispatchEvent(new PopStateEvent("popstate"));

    // Wait for potential API calls
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const results = analyzeApiCalls();
  testState.testResults.push({
    test: "Category Navigation",
    ...results,
  });

  console.log(
    `✅ Category navigation test completed. Max calls: ${results.maxCalls}`
  );
  return results;
}

/**
 * Test search functionality
 */
async function testSearchFunctionality() {
  console.log("\n🔍 Testing Search Functionality...");

  testState.apiCalls = {};
  testState.currentTest = "search-functionality";

  // Navigate to a category page first
  window.history.pushState(
    {},
    "",
    "/dashboard/marketplace/category/medications"
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate rapid search typing (this used to cause infinite loops)
  const searchQueries = [
    "med",
    "medi",
    "medic",
    "medica",
    "medicat",
    "medicati",
    "medication",
  ];

  for (const query of searchQueries) {
    // Simulate typing in search
    const searchEvent = new CustomEvent("search", { detail: { query } });
    window.dispatchEvent(searchEvent);

    // Short delay between keystrokes
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Wait for debounced search to complete
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const results = analyzeApiCalls();
  testState.testResults.push({
    test: "Search Functionality",
    ...results,
  });

  console.log(`✅ Search test completed. Max calls: ${results.maxCalls}`);
  return results;
}

/**
 * Test cart polling
 */
async function testCartPolling() {
  console.log("\n🛒 Testing Cart Polling...");

  testState.apiCalls = {};
  testState.currentTest = "cart-polling";

  // Navigate to marketplace to trigger cart polling
  window.history.pushState({}, "", "/dashboard/marketplace");
  window.dispatchEvent(new PopStateEvent("popstate"));

  // Wait for cart polling cycles
  await new Promise((resolve) => setTimeout(resolve, 12000)); // 12 seconds to see 2+ polls

  const results = analyzeApiCalls();
  testState.testResults.push({
    test: "Cart Polling",
    ...results,
  });

  console.log(`✅ Cart polling test completed. Max calls: ${results.maxCalls}`);
  return results;
}

/**
 * Generate final test report
 */
function generateTestReport() {
  console.log("\n📊 === MARKETPLACE INFINITE LOOP FIX VERIFICATION REPORT ===");
  console.log(
    `⏱️  Test Duration: ${((Date.now() - testState.startTime) / 1000).toFixed(
      1
    )}s`
  );
  console.log(
    `🎯 Pass Threshold: ≤${TEST_CONFIG.maxApiCallsPerEndpoint} calls per endpoint`
  );

  let allTestsPassed = true;

  testState.testResults.forEach((result) => {
    const status = result.hasInfiniteLoops ? "❌ FAIL" : "✅ PASS";
    console.log(`\n${status} ${result.test}`);
    console.log(`   Total API calls: ${result.totalCalls}`);
    console.log(`   Max calls to single endpoint: ${result.maxCalls}`);

    if (result.worstOffender) {
      console.log(`   Worst offender: ${result.worstOffender}`);
    }

    Object.entries(result.endpointResults).forEach(([endpoint, data]) => {
      const statusIcon = data.status === "PASS" ? "✅" : "❌";
      console.log(`   ${statusIcon} ${endpoint}: ${data.calls} calls`);
    });

    if (result.hasInfiniteLoops) {
      allTestsPassed = false;
    }
  });

  console.log("\n" + "=".repeat(60));

  if (allTestsPassed) {
    console.log(
      "🎉 ALL TESTS PASSED! Infinite loops have been successfully fixed."
    );
    console.log("✅ The marketplace is now performing efficiently.");
  } else {
    console.log("⚠️  SOME TESTS FAILED! Infinite loops may still be present.");
    console.log("❌ Further investigation and fixes may be needed.");
  }

  console.log("\n📋 Summary:");
  console.log(`   Tests run: ${testState.testResults.length}`);
  console.log(
    `   Tests passed: ${
      testState.testResults.filter((r) => !r.hasInfiniteLoops).length
    }`
  );
  console.log(
    `   Tests failed: ${
      testState.testResults.filter((r) => r.hasInfiniteLoops).length
    }`
  );

  return {
    allPassed: allTestsPassed,
    results: testState.testResults,
  };
}

/**
 * Run complete verification suite
 */
async function runCompleteVerification() {
  console.log("🚀 Starting complete marketplace verification...");

  initializeTestMonitoring();

  try {
    // Run all tests
    await testCategoryPageNavigation();
    await testSearchFunctionality();
    await testCartPolling();

    // Generate report
    const report = generateTestReport();

    return report;
  } catch (error) {
    console.error("❌ Error during verification:", error);
    return { allPassed: false, error: error.message };
  } finally {
    cleanupTestMonitoring();
  }
}

// Make functions available globally
window.marketplaceVerification = {
  runCompleteVerification,
  testCategoryPageNavigation,
  testSearchFunctionality,
  testCartPolling,
  generateTestReport,
  getTestState: () => testState,
};

console.log("✨ Marketplace Verification Suite ready!");
console.log("🏁 Run: marketplaceVerification.runCompleteVerification()");
console.log("");

// Auto-run if not in development mode
if (window.location.hostname !== "localhost") {
  setTimeout(() => {
    console.log("🤖 Auto-starting verification suite...");
    runCompleteVerification();
  }, 2000);
}
