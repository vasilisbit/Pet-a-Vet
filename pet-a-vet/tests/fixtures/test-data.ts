/**
 * Test data fixtures for authentication tests
 */

export const validUsers = {
  customer: {
    name: "John Customer",
    email: "customer@petavet.test",
    password: "CustomerPass123!",
    role: "customer",
    phone: "+1234567890",
    address: "123 Pet Street, Pet City, PC 12345",
  },
  vet: {
    name: "Dr. Sarah Veterinarian",
    email: "vet@petavet.test",
    password: "VetPass123!",
    role: "vet",
    phone: "+1234567891",
    license: "VET123456",
    specialization: "Small Animals",
  },
  admin: {
    name: "Admin User",
    email: "admin@petavet.test",
    password: "AdminPass123!",
    role: "admin",
    phone: "+1234567892",
    permissions: ["all"],
  },
};

export const invalidUsers = {
  emptyFields: {
    name: "",
    email: "",
    password: "",
    role: "",
  },
  invalidEmail: {
    name: "Test User",
    email: "invalid-email",
    password: "ValidPass123!",
    role: "customer",
  },
  weakPassword: {
    name: "Test User",
    email: "test@petavet.test",
    password: "123",
    role: "customer",
  },
  invalidRole: {
    name: "Test User",
    email: "test@petavet.test",
    password: "ValidPass123!",
    role: "superuser",
  },
};

export const maliciousInputs = {
  xssAttempts: [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src="x" onerror="alert(1)">',
    '<svg onload="alert(1)">',
    '"><script>alert("xss")</script>',
    'jaVasCript:alert("xss")',
    '<iframe src="javascript:alert(1)"></iframe>',
  ],
  sqlInjection: [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "admin'--",
    "' UNION SELECT * FROM users--",
    "'; INSERT INTO users VALUES('hacker', 'pass'); --",
    "1' OR 1=1#",
    "' OR 'x'='x",
  ],
  noSqlInjection: [
    '{"$ne": null}',
    '{"$regex": ".*"}',
    '{"$where": "this.password"}',
    '{"$gt": ""}',
    '{"$or": [{"password": {"$regex": ".*"}}]}',
  ],
};

export const passwordTestCases = {
  weak: [
    "123",
    "password",
    "12345678",
    "qwerty",
    "abc123",
    "111111",
    "letmein",
    "admin",
    "pass",
  ],
  medium: ["Password123", "MyPass123", "user1234", "Welcome123", "Test1234"],
  strong: [
    "MyStr0ngP@ssw0rd!",
    "C0mpl3x!P@ssw0rd",
    "Secur3#P@ss2024!",
    "V3ry$tr0ng!P@ss",
    "Ultra#Secur3!123",
  ],
  invalid: [
    "password 123", // contains space
    "пароль123", // non-ASCII
    "pass\ttab", // contains tab
    "pass\nline", // contains newline
    "password123<script>", // contains HTML
    "password123'DROP", // contains SQL
  ],
};

export const emailTestCases = {
  valid: [
    "user@example.com",
    "test.email@domain.co.uk",
    "user+tag@example.org",
    "firstname.lastname@company.com",
    "user123@test-domain.com",
  ],
  invalid: [
    "plainaddress",
    "@missinglocalpart.com",
    "missing@.com",
    "missing.domain@",
    "spaces in@email.com",
    "email@domain",
    "email@domain..com",
    "email@.domain.com",
    "email@domain.com.",
    "email..double.dot@domain.com",
  ],
};

export const browserTestData = {
  userAgents: {
    chrome:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    firefox:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    safari:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
  },
  mobileDevices: {
    iPhone:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    android:
      "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
    iPad: "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  },
};

export const performanceTestData = {
  loadTestScenarios: [
    { name: "light_load", users: 10, duration: "30s" },
    { name: "normal_load", users: 50, duration: "2m" },
    { name: "heavy_load", users: 100, duration: "5m" },
    { name: "stress_test", users: 200, duration: "3m" },
    { name: "spike_test", users: 500, duration: "1m" },
  ],
  thresholds: {
    responseTime: {
      p95: 2000, // 95% of requests should be under 2s
      p99: 5000, // 99% of requests should be under 5s
    },
    errorRate: 0.01, // Less than 1% error rate
    throughput: 100, // Minimum 100 requests per second
  },
};

export const securityTestData = {
  rateLimitTests: {
    login: {
      maxAttempts: 5,
      timeWindow: 300000, // 5 minutes
      lockoutDuration: 900000, // 15 minutes
    },
    signup: {
      maxAttempts: 3,
      timeWindow: 3600000, // 1 hour
      lockoutDuration: 3600000, // 1 hour
    },
  },
  sessionTests: {
    validDuration: 3600000, // 1 hour
    maxInactiveDuration: 1800000, // 30 minutes
    cookieSettings: {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    },
  },
};

export const accessibilityTestData = {
  keyboardNavigation: [
    "Tab",
    "Shift+Tab",
    "Enter",
    "Space",
    "ArrowUp",
    "ArrowDown",
    "Escape",
  ],
  ariaLabels: {
    emailField: "Email address",
    passwordField: "Password",
    submitButton: "Sign in",
    errorMessage: "Error message",
    successMessage: "Success message",
  },
  colorContrast: {
    normal: 4.5,
    large: 3.0,
  },
};

// Helper functions for test data generation
export const generateRandomUser = (role: string = "customer") => ({
  name: `Test User ${Math.random().toString(36).substring(7)}`,
  email: `test${Math.random().toString(36).substring(7)}@petavet.test`,
  password: "TestPass123!",
  role,
  phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
});

export const generateTestEmails = (count: number) => {
  return Array.from({ length: count }, (_, i) => `testuser${i}@petavet.test`);
};

export const generateWeakPasswords = () => {
  return [
    "123456",
    "password",
    "12345678",
    "qwerty123",
    "abc123456",
    "password123",
    "admin123",
    "123456789",
    "letmein123",
    "welcome123",
  ];
};

export const generateStrongPasswords = () => {
  return [
    "MyStr0ng!P@ssw0rd",
    "C0mpl3x#P@ss2024",
    "Ultra$ecur3!Pass",
    "V3ry&Str0ng!123",
    "Sup3r#S@fe!P@ss",
  ];
};
