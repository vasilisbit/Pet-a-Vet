/**
 * Simple Database Connectivity Test for Reports API
 *
 * This script tests the reports API endpoint functionality
 * using native Node.js modules.
 */

const http = require("http");
const https = require("https");

class SimpleValidator {
  constructor() {
    this.baseUrl = "http://localhost:3001";
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const request = http.get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            const result = {
              statusCode: response.statusCode,
              headers: response.headers,
              data: JSON.parse(data),
            };
            resolve(result);
          } catch (error) {
            resolve({
              statusCode: response.statusCode,
              headers: response.headers,
              data: data,
              error: error.message,
            });
          }
        });
      });

      request.on("error", (error) => {
        reject(error);
      });

      request.setTimeout(5000, () => {
        request.destroy();
        reject(new Error("Request timeout"));
      });
    });
  }

  async testReportsAPI() {
    console.log("🔍 Testing Reports API endpoint...");

    const testCases = [
      {
        name: "All Reports",
        url: `${this.baseUrl}/api/reports?type=all&dateRange=last30days&species=all`,
      },
      {
        name: "Appointments Only",
        url: `${this.baseUrl}/api/reports?type=appointments&dateRange=last7days`,
      },
      {
        name: "Revenue Data",
        url: `${this.baseUrl}/api/reports?type=revenue&dateRange=last30days`,
      },
    ];

    const results = [];

    for (const testCase of testCases) {
      try {
        console.log(`  Testing: ${testCase.name}`);
        const startTime = Date.now();
        const response = await this.makeRequest(testCase.url);
        const responseTime = Date.now() - startTime;

        const success =
          response.statusCode === 200 &&
          response.data &&
          typeof response.data === "object";

        results.push({
          name: testCase.name,
          success,
          statusCode: response.statusCode,
          responseTime,
          hasData: !!response.data,
          dataStructure: success ? Object.keys(response.data) : null,
        });

        if (success) {
          console.log(`    ✓ PASS (${responseTime}ms, ${response.statusCode})`);
        } else {
          console.log(
            `    ❌ FAIL (${responseTime}ms, ${response.statusCode})`
          );
        }
      } catch (error) {
        console.log(`    ❌ ERROR: ${error.message}`);
        results.push({
          name: testCase.name,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  async testServerHealth() {
    console.log("🔍 Testing server health...");

    try {
      const response = await this.makeRequest(
        `${this.baseUrl}/dashboard/reports`
      );

      if (response.statusCode === 200) {
        console.log("  ✓ Server is responsive");
        return true;
      } else {
        console.log(`  ❌ Server returned ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`  ❌ Server health check failed: ${error.message}`);
      return false;
    }
  }

  async runValidation() {
    console.log("🚀 Starting simple database validation...\n");

    const serverHealthy = await this.testServerHealth();
    const apiResults = await this.testReportsAPI();

    const totalTests = apiResults.length;
    const passedTests = apiResults.filter((r) => r.success).length;
    const avgResponseTime =
      apiResults
        .filter((r) => r.responseTime)
        .reduce((sum, r) => sum + r.responseTime, 0) /
      apiResults.filter((r) => r.responseTime).length;

    console.log("\n📊 Validation Summary:");
    console.log("=".repeat(40));
    console.log(
      `Server Health: ${serverHealthy ? "✓ HEALTHY" : "❌ UNHEALTHY"}`
    );
    console.log(`API Tests: ${passedTests}/${totalTests} passed`);
    console.log(
      `Average Response Time: ${
        avgResponseTime ? avgResponseTime.toFixed(2) + "ms" : "N/A"
      }`
    );

    const overallSuccess = serverHealthy && passedTests === totalTests;
    console.log(
      `\n🎯 Overall Status: ${
        overallSuccess ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"
      }`
    );

    if (!overallSuccess) {
      console.log("\n💡 Next Steps:");
      if (!serverHealthy) {
        console.log(
          "  - Ensure the development server is running on port 3001"
        );
        console.log("  - Check for any server startup errors");
      }
      if (passedTests < totalTests) {
        console.log("  - Check API route implementation");
        console.log("  - Verify database connectivity");
        console.log("  - Review server logs for errors");
      }
    }

    return {
      serverHealthy,
      apiResults,
      overallSuccess,
      summary: {
        totalTests,
        passedTests,
        avgResponseTime,
      },
    };
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SimpleValidator();
  validator
    .runValidation()
    .then((results) => {
      process.exit(results.overallSuccess ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Validation failed:", error.message);
      process.exit(1);
    });
}

module.exports = SimpleValidator;
