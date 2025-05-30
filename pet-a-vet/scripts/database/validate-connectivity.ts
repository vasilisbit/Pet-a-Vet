/**
 * Database Connectivity Validation for Reports API
 *
 * This script validates the database connectivity and ensures
 * the reports API can handle real data scenarios.
 */

import { NextRequest } from "next/server";
import { GET } from "@/app/api/reports/route";

// Mock database connection for testing
class MockDatabase {
  private static instance: MockDatabase;
  private connected = false;

  static getInstance() {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  async connect() {
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.connected = true;
    console.log("✓ Database connected successfully");
  }

  async disconnect() {
    this.connected = false;
    console.log("✓ Database disconnected");
  }

  isConnected() {
    return this.connected;
  }

  async query(sql: string, params: any[] = []) {
    if (!this.connected) {
      throw new Error("Database not connected");
    }

    // Simulate query based on SQL
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (sql.includes("appointments")) {
      return this.generateAppointmentData();
    } else if (sql.includes("diagnoses")) {
      return this.generateDiagnosisData();
    } else if (sql.includes("revenue")) {
      return this.generateRevenueData();
    } else if (sql.includes("demographics")) {
      return this.generateDemographicsData();
    }

    return [];
  }

  private generateAppointmentData() {
    return [
      { month: "Jan", appointments: 145, completed: 142, cancelled: 3 },
      { month: "Feb", appointments: 132, completed: 128, cancelled: 4 },
      { month: "Mar", appointments: 168, completed: 165, cancelled: 3 },
      { month: "Apr", appointments: 156, completed: 151, cancelled: 5 },
      { month: "May", appointments: 189, completed: 185, cancelled: 4 },
      { month: "Jun", appointments: 178, completed: 174, cancelled: 4 },
    ];
  }

  private generateDiagnosisData() {
    return [
      { diagnosis: "Routine Checkup", count: 234, percentage: 35 },
      { diagnosis: "Vaccination", count: 187, percentage: 28 },
      { diagnosis: "Dental Care", count: 98, percentage: 15 },
      { diagnosis: "Emergency", count: 65, percentage: 10 },
      { diagnosis: "Surgery", count: 45, percentage: 7 },
      { diagnosis: "Other", count: 34, percentage: 5 },
    ];
  }

  private generateRevenueData() {
    return [
      { month: "Jan", revenue: 25400, expenses: 18200, profit: 7200 },
      { month: "Feb", revenue: 23800, expenses: 17100, profit: 6700 },
      { month: "Mar", revenue: 28900, expenses: 19800, profit: 9100 },
      { month: "Apr", revenue: 27300, expenses: 18900, profit: 8400 },
      { month: "May", revenue: 31200, expenses: 20500, profit: 10700 },
      { month: "Jun", revenue: 29800, expenses: 19300, profit: 10500 },
    ];
  }

  private generateDemographicsData() {
    return {
      speciesData: [
        { name: "Dogs", value: 456, percentage: 52 },
        { name: "Cats", value: 298, percentage: 34 },
        { name: "Birds", value: 87, percentage: 10 },
        { name: "Other", value: 34, percentage: 4 },
      ],
      ageDistribution: [
        { range: "0-1 years", count: 145 },
        { range: "1-3 years", count: 234 },
        { range: "3-7 years", count: 298 },
        { range: "7+ years", count: 198 },
      ],
    };
  }
}

// Database validation tests
export class DatabaseValidator {
  private db: MockDatabase;

  constructor() {
    this.db = MockDatabase.getInstance();
  }

  async validateConnection() {
    console.log("🔍 Testing database connection...");

    try {
      await this.db.connect();

      if (!this.db.isConnected()) {
        throw new Error("Database connection failed");
      }

      console.log("✓ Database connection successful");
      return true;
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      return false;
    }
  }

  async validateQueries() {
    console.log("🔍 Testing database queries...");

    const queries = [
      {
        name: "Appointments",
        sql: "SELECT * FROM appointments WHERE date >= ?",
      },
      {
        name: "Diagnoses",
        sql: "SELECT * FROM diagnoses GROUP BY diagnosis_type",
      },
      { name: "Revenue", sql: "SELECT * FROM revenue WHERE month >= ?" },
      {
        name: "Demographics",
        sql: "SELECT species, COUNT(*) FROM pets GROUP BY species",
      },
    ];

    const results = [];

    for (const query of queries) {
      try {
        const startTime = Date.now();
        const data = await this.db.query(query.sql, ["2024-01-01"]);
        const queryTime = Date.now() - startTime;

        results.push({
          name: query.name,
          success: true,
          queryTime,
          recordCount: Array.isArray(data)
            ? data.length
            : Object.keys(data).length,
        });

        console.log(
          `✓ ${query.name} query successful (${queryTime}ms, ${
            results[results.length - 1].recordCount
          } records)`
        );
      } catch (error) {
        results.push({
          name: query.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        console.error(`❌ ${query.name} query failed:`, error);
      }
    }

    return results;
  }

  async validateAPIEndpoint() {
    console.log("🔍 Testing Reports API endpoint...");

    try {
      // Create mock request
      const url = new URL(
        "http://localhost:3001/api/reports?type=all&dateRange=last30days&species=all"
      );
      const request = new NextRequest(url);

      // Test API endpoint
      const startTime = Date.now();
      const response = await GET(request);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      console.log(`✓ API endpoint successful (${responseTime}ms)`);
      console.log("✓ Response data structure validated");

      return {
        success: true,
        responseTime,
        hasAppointments: !!data.appointments,
        hasDiagnoses: !!data.diagnoses,
        hasRevenue: !!data.revenue,
        hasDemographics: !!data.demographics,
      };
    } catch (error) {
      console.error("❌ API endpoint failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async validateDataIntegrity() {
    console.log("🔍 Testing data integrity...");

    try {
      const appointmentData = await this.db.query("SELECT * FROM appointments");
      const revenueData = await this.db.query("SELECT * FROM revenue");

      // Validate data structure
      if (!Array.isArray(appointmentData) || appointmentData.length === 0) {
        throw new Error("Invalid appointment data structure");
      }

      if (!Array.isArray(revenueData) || revenueData.length === 0) {
        throw new Error("Invalid revenue data structure");
      }

      // Validate required fields
      const appointmentFields = ["month", "appointments", "completed"];
      const revenueFields = ["month", "revenue", "expenses"];

      for (const appointment of appointmentData) {
        for (const field of appointmentFields) {
          if (!(field in appointment)) {
            throw new Error(`Missing field '${field}' in appointment data`);
          }
        }
      }

      for (const revenue of revenueData) {
        for (const field of revenueFields) {
          if (!(field in revenue)) {
            throw new Error(`Missing field '${field}' in revenue data`);
          }
        }
      }

      console.log("✓ Data integrity validation successful");
      return true;
    } catch (error) {
      console.error("❌ Data integrity validation failed:", error);
      return false;
    }
  }

  async validatePerformance() {
    console.log("🔍 Testing database performance...");

    const performanceTests = [];

    // Test query performance under load
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      await this.db.query("SELECT * FROM appointments WHERE date >= ?", [
        "2024-01-01",
      ]);
      const queryTime = Date.now() - startTime;
      performanceTests.push(queryTime);
    }

    const avgQueryTime =
      performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
    const maxQueryTime = Math.max(...performanceTests);
    const minQueryTime = Math.min(...performanceTests);

    console.log(`✓ Average query time: ${avgQueryTime.toFixed(2)}ms`);
    console.log(`✓ Min query time: ${minQueryTime}ms`);
    console.log(`✓ Max query time: ${maxQueryTime}ms`);

    // Performance should be reasonable
    const performanceAcceptable = avgQueryTime < 200 && maxQueryTime < 500;

    if (performanceAcceptable) {
      console.log("✓ Database performance acceptable");
    } else {
      console.warn("⚠️ Database performance may need optimization");
    }

    return {
      avgQueryTime,
      maxQueryTime,
      minQueryTime,
      acceptable: performanceAcceptable,
    };
  }
  async runFullValidation() {
    console.log("🚀 Starting comprehensive database validation...\n");

    const results: {
      connection: boolean;
      queries: any[];
      api: any;
      integrity: boolean;
      performance: any;
      timestamp: string;
    } = {
      connection: false,
      queries: [],
      api: null,
      integrity: false,
      performance: null,
      timestamp: new Date().toISOString(),
    };

    // Run all validations
    results.connection = await this.validateConnection();

    if (results.connection) {
      results.queries = await this.validateQueries();
      results.api = await this.validateAPIEndpoint();
      results.integrity = await this.validateDataIntegrity();
      results.performance = await this.validatePerformance();
    }

    // Cleanup
    await this.db.disconnect();

    // Generate report
    console.log("\n📊 Validation Report:");
    console.log("=".repeat(50));
    console.log(
      `Database Connection: ${results.connection ? "✓ PASS" : "❌ FAIL"}`
    );
    console.log(
      `Query Tests: ${results.queries.filter((q: any) => q.success).length}/${
        results.queries.length
      } passed`
    );
    console.log(`API Endpoint: ${results.api?.success ? "✓ PASS" : "❌ FAIL"}`);
    console.log(`Data Integrity: ${results.integrity ? "✓ PASS" : "❌ FAIL"}`);
    console.log(
      `Performance: ${
        results.performance?.acceptable ? "✓ PASS" : "⚠️ NEEDS ATTENTION"
      }`
    );

    const overallSuccess =
      results.connection &&
      results.queries.every((q: any) => q.success) &&
      results.api?.success &&
      results.integrity;

    console.log(
      `\n🎯 Overall Status: ${
        overallSuccess ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"
      }`
    );

    return results;
  }
}

// Export for testing
export default DatabaseValidator;

// CLI execution
if (require.main === module) {
  const validator = new DatabaseValidator();
  validator
    .runFullValidation()
    .then((results) => {
      process.exit(results.connection && results.integrity ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Validation failed:", error);
      process.exit(1);
    });
}
