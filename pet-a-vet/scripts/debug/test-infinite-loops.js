/**
 * Test script to monitor API calls and verify infinite loops are fixed
 */

// Counter to track API calls
let apiCallCounts = {};
let startTime = Date.now();

// Function to log API calls
function logApiCall(url) {
  const endpoint = url.split("/api/")[1] || url;
  if (!apiCallCounts[endpoint]) {
    apiCallCounts[endpoint] = 0;
  }
  apiCallCounts[endpoint]++;

  console.log(
    `[${new Date().toISOString()}] API Call #${
      apiCallCounts[endpoint]
    } to: ${endpoint}`
  );

  // Alert if any endpoint is called more than 10 times in 30 seconds
  if (apiCallCounts[endpoint] > 10) {
    const timeElapsed = (Date.now() - startTime) / 1000;
    console.warn(`🚨 POTENTIAL INFINITE LOOP DETECTED! 
      Endpoint: ${endpoint}
      Call count: ${apiCallCounts[endpoint]}
      Time elapsed: ${timeElapsed}s`);
  }
}

// Function to reset counters
function resetCounters() {
  apiCallCounts = {};
  startTime = Date.now();
  console.log("✅ API call counters reset");
}

// Function to show summary
function showSummary() {
  const timeElapsed = (Date.now() - startTime) / 1000;
  console.log(`\n📊 API Call Summary (${timeElapsed}s elapsed):`);
  Object.entries(apiCallCounts).forEach(([endpoint, count]) => {
    const status =
      count > 10 ? "🚨 EXCESSIVE" : count > 5 ? "⚠️  HIGH" : "✅ NORMAL";
    console.log(`  ${status} ${endpoint}: ${count} calls`);
  });
}

// Intercept fetch calls (for client-side monitoring)
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];
    if (typeof url === "string" && url.includes("/api/")) {
      logApiCall(url);
    }
    return originalFetch.apply(this, args);
  };

  // Set up automatic summary every 30 seconds
  setInterval(showSummary, 30000);

  console.log(
    "🔍 API monitoring started. Use resetCounters() to reset, showSummary() to view stats."
  );
}

// Export for Node.js environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { logApiCall, resetCounters, showSummary, apiCallCounts };
}
