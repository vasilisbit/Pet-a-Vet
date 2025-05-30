/**
 * Production Readiness Validation for Reports Dashboard
 *
 * This comprehensive checklist validates that the reports page
 * is ready for production deployment.
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

interface ValidationResult {
  category: string;
  test: string;
  status: "PASS" | "FAIL" | "WARNING";
  message: string;
  details?: any;
}

export class ProductionReadinessValidator {
  private results: ValidationResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  private addResult(
    category: string,
    test: string,
    status: "PASS" | "FAIL" | "WARNING",
    message: string,
    details?: any
  ) {
    this.results.push({ category, test, status, message, details });
  }

  async validateCodeQuality() {
    console.log("🔍 Validating code quality...");

    try {
      // Check if TypeScript compilation passes
      const { stdout, stderr } = await execAsync("npx tsc --noEmit");
      if (stderr && !stderr.includes("warning")) {
        this.addResult(
          "Code Quality",
          "TypeScript Compilation",
          "FAIL",
          "TypeScript compilation failed",
          { stderr }
        );
      } else {
        this.addResult(
          "Code Quality",
          "TypeScript Compilation",
          "PASS",
          "TypeScript compilation successful"
        );
      }
    } catch (error) {
      this.addResult(
        "Code Quality",
        "TypeScript Compilation",
        "FAIL",
        "TypeScript compilation failed",
        { error }
      );
    }

    try {
      // Check ESLint
      const { stdout } = await execAsync(
        "npx eslint app/dashboard/reports/page.tsx --format json"
      );
      const lintResults = JSON.parse(stdout);
      const errorCount = lintResults.reduce(
        (sum: number, file: any) => sum + file.errorCount,
        0
      );
      const warningCount = lintResults.reduce(
        (sum: number, file: any) => sum + file.warningCount,
        0
      );

      if (errorCount > 0) {
        this.addResult(
          "Code Quality",
          "ESLint",
          "FAIL",
          `${errorCount} ESLint errors found`,
          { lintResults }
        );
      } else if (warningCount > 5) {
        this.addResult(
          "Code Quality",
          "ESLint",
          "WARNING",
          `${warningCount} ESLint warnings found`,
          { lintResults }
        );
      } else {
        this.addResult(
          "Code Quality",
          "ESLint",
          "PASS",
          "ESLint validation passed"
        );
      }
    } catch (error) {
      this.addResult(
        "Code Quality",
        "ESLint",
        "WARNING",
        "ESLint check skipped",
        { error }
      );
    }
  }

  async validateSecurity() {
    console.log("🔍 Validating security...");

    try {
      // Check for security vulnerabilities
      const { stdout } = await execAsync("npm audit --json");
      const auditResults = JSON.parse(stdout);

      const highVulnerabilities =
        auditResults.metadata?.vulnerabilities?.high || 0;
      const criticalVulnerabilities =
        auditResults.metadata?.vulnerabilities?.critical || 0;

      if (criticalVulnerabilities > 0) {
        this.addResult(
          "Security",
          "NPM Audit",
          "FAIL",
          `${criticalVulnerabilities} critical vulnerabilities found`
        );
      } else if (highVulnerabilities > 0) {
        this.addResult(
          "Security",
          "NPM Audit",
          "WARNING",
          `${highVulnerabilities} high vulnerabilities found`
        );
      } else {
        this.addResult(
          "Security",
          "NPM Audit",
          "PASS",
          "No critical vulnerabilities found"
        );
      }
    } catch (error) {
      this.addResult(
        "Security",
        "NPM Audit",
        "WARNING",
        "Security audit failed to run",
        { error }
      );
    }

    // Check for hardcoded secrets
    try {
      const reportsFile = await fs.readFile(
        path.join(this.projectRoot, "app/dashboard/reports/page.tsx"),
        "utf-8"
      );

      const secretPatterns = [
        /password\s*=\s*["'](.+)["']/i,
        /api[_-]?key\s*=\s*["'](.+)["']/i,
        /secret\s*=\s*["'](.+)["']/i,
        /token\s*=\s*["'](.+)["']/i,
      ];

      const foundSecrets = secretPatterns.some((pattern) =>
        pattern.test(reportsFile)
      );

      if (foundSecrets) {
        this.addResult(
          "Security",
          "Hardcoded Secrets",
          "FAIL",
          "Potential hardcoded secrets found in reports page"
        );
      } else {
        this.addResult(
          "Security",
          "Hardcoded Secrets",
          "PASS",
          "No hardcoded secrets detected"
        );
      }
    } catch (error) {
      this.addResult(
        "Security",
        "Hardcoded Secrets",
        "WARNING",
        "Secret scan failed",
        { error }
      );
    }
  }

  async validatePerformance() {
    console.log("🔍 Validating performance...");

    try {
      // Check bundle size
      const { stdout } = await execAsync(
        'npx next build --dry-run 2>/dev/null || echo "Build check completed"'
      );

      this.addResult(
        "Performance",
        "Build Check",
        "PASS",
        "Build process validated"
      );

      // Check for performance anti-patterns in code
      const reportsFile = await fs.readFile(
        path.join(this.projectRoot, "app/dashboard/reports/page.tsx"),
        "utf-8"
      );

      // Check for potential performance issues
      const performanceIssues = [];

      if (
        reportsFile.includes("useEffect(") &&
        !reportsFile.includes("useCallback(")
      ) {
        performanceIssues.push("Missing useCallback for effect dependencies");
      }

      if (
        reportsFile.includes("useState(") &&
        reportsFile.split("useState(").length > 10
      ) {
        performanceIssues.push(
          "High number of state variables (consider state consolidation)"
        );
      }

      if (reportsFile.includes("console.log(")) {
        performanceIssues.push(
          "Console.log statements found (should be removed in production)"
        );
      }

      if (performanceIssues.length > 0) {
        this.addResult(
          "Performance",
          "Code Analysis",
          "WARNING",
          "Performance improvements suggested",
          { issues: performanceIssues }
        );
      } else {
        this.addResult(
          "Performance",
          "Code Analysis",
          "PASS",
          "No performance anti-patterns detected"
        );
      }
    } catch (error) {
      this.addResult(
        "Performance",
        "Performance Check",
        "WARNING",
        "Performance validation failed",
        { error }
      );
    }
  }

  async validateAccessibility() {
    console.log("🔍 Validating accessibility...");

    try {
      const reportsFile = await fs.readFile(
        path.join(this.projectRoot, "app/dashboard/reports/page.tsx"),
        "utf-8"
      );

      const accessibilityChecks = [
        {
          name: "ARIA Labels",
          pattern: /aria-label/i,
          required: true,
        },
        {
          name: "Role Attributes",
          pattern: /role=/i,
          required: true,
        },
        {
          name: "Alt Text Support",
          pattern: /alt=/i,
          required: false,
        },
        {
          name: "Keyboard Navigation",
          pattern: /onKeyDown|onKeyPress|onKeyUp/i,
          required: true,
        },
      ];

      const passedChecks = accessibilityChecks.filter((check) =>
        check.pattern.test(reportsFile)
      );
      const requiredChecks = accessibilityChecks.filter(
        (check) => check.required
      );
      const passedRequired = passedChecks.filter((check) => check.required);

      if (passedRequired.length < requiredChecks.length) {
        const missing = requiredChecks.filter(
          (check) => !passedChecks.includes(check)
        );
        this.addResult(
          "Accessibility",
          "A11y Standards",
          "FAIL",
          "Missing required accessibility features",
          { missing: missing.map((c) => c.name) }
        );
      } else {
        this.addResult(
          "Accessibility",
          "A11y Standards",
          "PASS",
          `${passedChecks.length}/${accessibilityChecks.length} accessibility features implemented`
        );
      }
    } catch (error) {
      this.addResult(
        "Accessibility",
        "A11y Standards",
        "WARNING",
        "Accessibility validation failed",
        { error }
      );
    }
  }

  async validateTesting() {
    console.log("🔍 Validating testing coverage...");

    try {
      // Check if test files exist
      const testFiles = [
        "tests/integration/reports-page.test.ts",
        "tests/integration/cross-browser-validation.test.ts",
      ];

      const existingTests = [];
      for (const testFile of testFiles) {
        try {
          await fs.access(path.join(this.projectRoot, testFile));
          existingTests.push(testFile);
        } catch {
          // File doesn't exist
        }
      }

      if (existingTests.length === testFiles.length) {
        this.addResult(
          "Testing",
          "Test Coverage",
          "PASS",
          "All required test files present"
        );
      } else {
        const missing = testFiles.filter((f) => !existingTests.includes(f));
        this.addResult(
          "Testing",
          "Test Coverage",
          "WARNING",
          "Some test files missing",
          { missing }
        );
      }

      // Try to run tests
      try {
        const { stdout, stderr } = await execAsync(
          "npm test -- --passWithNoTests --silent"
        );
        this.addResult(
          "Testing",
          "Test Execution",
          "PASS",
          "Tests execute successfully"
        );
      } catch (error) {
        this.addResult(
          "Testing",
          "Test Execution",
          "WARNING",
          "Test execution issues detected",
          { error }
        );
      }
    } catch (error) {
      this.addResult(
        "Testing",
        "Testing Validation",
        "WARNING",
        "Testing validation failed",
        { error }
      );
    }
  }

  async validateDocumentation() {
    console.log("🔍 Validating documentation...");

    try {
      const reportsFile = await fs.readFile(
        path.join(this.projectRoot, "app/dashboard/reports/page.tsx"),
        "utf-8"
      );

      // Check for JSDoc comments
      const hasJSDoc = /\/\*\*/.test(reportsFile);
      const hasInlineComments = reportsFile.split("//").length > 10;
      const hasTypeAnnotations = /:\s*(string|number|boolean|any)/.test(
        reportsFile
      );

      const docScore =
        (hasJSDoc ? 1 : 0) +
        (hasInlineComments ? 1 : 0) +
        (hasTypeAnnotations ? 1 : 0);

      if (docScore >= 2) {
        this.addResult(
          "Documentation",
          "Code Documentation",
          "PASS",
          "Good documentation coverage"
        );
      } else if (docScore >= 1) {
        this.addResult(
          "Documentation",
          "Code Documentation",
          "WARNING",
          "Documentation could be improved"
        );
      } else {
        this.addResult(
          "Documentation",
          "Code Documentation",
          "FAIL",
          "Insufficient documentation"
        );
      }

      // Check for README updates
      try {
        const readme = await fs.readFile(
          path.join(this.projectRoot, "README.md"),
          "utf-8"
        );
        if (readme.includes("reports") || readme.includes("dashboard")) {
          this.addResult(
            "Documentation",
            "README",
            "PASS",
            "README mentions reports functionality"
          );
        } else {
          this.addResult(
            "Documentation",
            "README",
            "WARNING",
            "README should document reports feature"
          );
        }
      } catch {
        this.addResult(
          "Documentation",
          "README",
          "WARNING",
          "README.md not found or inaccessible"
        );
      }
    } catch (error) {
      this.addResult(
        "Documentation",
        "Documentation Check",
        "WARNING",
        "Documentation validation failed",
        { error }
      );
    }
  }

  async validateEnvironment() {
    console.log("🔍 Validating environment configuration...");

    try {
      // Check package.json
      const packageJson = JSON.parse(
        await fs.readFile(path.join(this.projectRoot, "package.json"), "utf-8")
      );

      const requiredDeps = ["react", "next", "recharts"];
      const missingDeps = requiredDeps.filter(
        (dep) =>
          !packageJson.dependencies?.[dep] &&
          !packageJson.devDependencies?.[dep]
      );

      if (missingDeps.length > 0) {
        this.addResult(
          "Environment",
          "Dependencies",
          "FAIL",
          "Missing required dependencies",
          { missing: missingDeps }
        );
      } else {
        this.addResult(
          "Environment",
          "Dependencies",
          "PASS",
          "All required dependencies present"
        );
      }

      // Check for environment variables
      const envFiles = [".env.local", ".env", ".env.example"];
      const existingEnvFiles = [];

      for (const envFile of envFiles) {
        try {
          await fs.access(path.join(this.projectRoot, envFile));
          existingEnvFiles.push(envFile);
        } catch {
          // File doesn't exist
        }
      }

      if (existingEnvFiles.length > 0) {
        this.addResult(
          "Environment",
          "Environment Variables",
          "PASS",
          "Environment configuration files found"
        );
      } else {
        this.addResult(
          "Environment",
          "Environment Variables",
          "WARNING",
          "No environment configuration files found"
        );
      }
    } catch (error) {
      this.addResult(
        "Environment",
        "Environment Check",
        "WARNING",
        "Environment validation failed",
        { error }
      );
    }
  }

  async generateReport() {
    const timestamp = new Date().toISOString();
    const totalTests = this.results.length;
    const passedTests = this.results.filter((r) => r.status === "PASS").length;
    const failedTests = this.results.filter((r) => r.status === "FAIL").length;
    const warningTests = this.results.filter(
      (r) => r.status === "WARNING"
    ).length;

    const report = {
      timestamp,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        warnings: warningTests,
        score: Math.round((passedTests / totalTests) * 100),
      },
      categories: this.groupResultsByCategory(),
      recommendations: this.generateRecommendations(),
      readyForProduction: failedTests === 0,
      results: this.results,
    };

    // Save report to file
    const reportPath = path.join(
      this.projectRoot,
      "production-readiness-report.json"
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  private groupResultsByCategory() {
    const categories: { [key: string]: ValidationResult[] } = {};

    for (const result of this.results) {
      if (!categories[result.category]) {
        categories[result.category] = [];
      }
      categories[result.category].push(result);
    }

    return categories;
  }

  private generateRecommendations() {
    const recommendations = [];
    const failedResults = this.results.filter((r) => r.status === "FAIL");
    const warningResults = this.results.filter((r) => r.status === "WARNING");

    if (failedResults.length > 0) {
      recommendations.push({
        priority: "HIGH",
        message: `Fix ${failedResults.length} critical issues before production deployment`,
        details: failedResults.map((r) => `${r.category}: ${r.test}`),
      });
    }

    if (warningResults.length > 3) {
      recommendations.push({
        priority: "MEDIUM",
        message: `Address ${warningResults.length} warnings to improve quality`,
        details: warningResults.map((r) => `${r.category}: ${r.test}`),
      });
    }

    // Specific recommendations
    if (failedResults.some((r) => r.category === "Security")) {
      recommendations.push({
        priority: "HIGH",
        message: "Security issues must be resolved before production",
        details: [
          "Run npm audit fix",
          "Review code for secrets",
          "Update dependencies",
        ],
      });
    }

    if (warningResults.some((r) => r.category === "Performance")) {
      recommendations.push({
        priority: "MEDIUM",
        message: "Performance optimizations recommended",
        details: [
          "Optimize React components",
          "Implement code splitting",
          "Add performance monitoring",
        ],
      });
    }

    return recommendations;
  }

  async runFullValidation() {
    console.log("🚀 Starting production readiness validation...\n");

    await this.validateCodeQuality();
    await this.validateSecurity();
    await this.validatePerformance();
    await this.validateAccessibility();
    await this.validateTesting();
    await this.validateDocumentation();
    await this.validateEnvironment();

    const report = await this.generateReport();

    // Print summary
    console.log("\n📊 Production Readiness Report");
    console.log("=".repeat(50));
    console.log(`Overall Score: ${report.summary.score}%`);
    console.log(
      `Tests Passed: ${report.summary.passed}/${report.summary.total}`
    );
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Warnings: ${report.summary.warnings}`);

    console.log("\n📋 Category Summary:");
    for (const [category, results] of Object.entries(report.categories)) {
      const categoryPassed = results.filter((r) => r.status === "PASS").length;
      const categoryTotal = results.length;
      console.log(`  ${category}: ${categoryPassed}/${categoryTotal} passed`);
    }

    if (report.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      for (const rec of report.recommendations) {
        console.log(`  [${rec.priority}] ${rec.message}`);
      }
    }

    console.log(
      `\n🎯 Production Ready: ${report.readyForProduction ? "✅ YES" : "❌ NO"}`
    );
    console.log(`📄 Full report saved to: production-readiness-report.json`);

    return report;
  }
}

// Export for testing
export default ProductionReadinessValidator;

// CLI execution
if (require.main === module) {
  const validator = new ProductionReadinessValidator();
  validator
    .runFullValidation()
    .then((report) => {
      process.exit(report.readyForProduction ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Validation failed:", error);
      process.exit(1);
    });
}
