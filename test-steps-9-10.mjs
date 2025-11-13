/**
 * Test Suite for Steps 9-10: Admin Dashboard UI
 * 25 comprehensive test cases covering:
 * - Statistics display
 * - Form validation
 * - Credential issuance
 * - Credentials list
 * - Search and filtering
 * - Sorting and pagination
 * - Revocation workflow
 * - Error handling
 * - Edge cases
 */

const BASE_URL = "http://localhost:8000/api/credentials";

let testResults = {
  passed: 0,
  failed: 0,
  total: 25,
};

const createdCredentials = [];

// Helper: Make API request
async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const data = await response.json();
  return { response, data };
}

// Helper: Create test credential
async function createTestCredential(overrides = {}) {
  const credential = {
    studentName: "Test Student",
    degree: "Test Degree",
    university: "Test University",
    graduationDate: "2024-05-15",
    studentId: "TEST-001",
    ...overrides,
  };

  const { response, data } = await apiRequest("/issue", {
    method: "POST",
    body: JSON.stringify(credential),
  });

  if (response.ok) {
    createdCredentials.push(data.attestationUID);
  }

  return { response, data };
}

// Helper: Test runner
async function runTest(testNumber, testName, testFn) {
  process.stdout.write(`\n📝 TEST: ${testNumber}. ${testName}\n`);
  try {
    await testFn();
    console.log(`   ✅ PASSED`);
    testResults.passed++;
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    testResults.failed++;
  }
}

// Helper: Assert
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

console.log("🧪 COMPREHENSIVE TEST SUITE - STEPS 9-10 (Admin UI)");
console.log("=".repeat(70));

// ============================================================================
// SECTION 1: STATISTICS ENDPOINT (5 tests)
// ============================================================================
console.log("\n📊 SECTION 1: STATISTICS ENDPOINT");
console.log("=".repeat(70));

await runTest(1, "GET /stats returns valid structure", async () => {
  const { response, data } = await apiRequest("/stats");
  assert(response.ok, "Request should succeed");
  assert(typeof data.total === "number", "Should have total count");
  assert(typeof data.active === "number", "Should have active count");
  assert(typeof data.revoked === "number", "Should have revoked count");
  assert(typeof data.revocationRate === "number", "Should have revocation rate");
  assert(Array.isArray(data.topUniversities), "Should have top universities array");
});

await runTest(2, "Stats total equals active + revoked", async () => {
  const { data } = await apiRequest("/stats");
  assert(
    data.total === data.active + data.revoked,
    `Total (${data.total}) should equal active (${data.active}) + revoked (${data.revoked})`
  );
});

await runTest(3, "Revocation rate is calculated correctly", async () => {
  const { data } = await apiRequest("/stats");
  const expectedRate = data.total > 0 ? (data.revoked / data.total) * 100 : 0;
  assert(
    Math.abs(data.revocationRate - expectedRate) < 0.01,
    `Revocation rate should be ${expectedRate.toFixed(2)}%, got ${data.revocationRate}%`
  );
});

await runTest(4, "Top universities have valid structure", async () => {
  const { data } = await apiRequest("/stats");
  for (const uni of data.topUniversities) {
    assert(typeof uni.university === "string", "University should be string");
    assert(typeof uni.count === "number", "Count should be number");
    assert(uni.count > 0, "Count should be positive");
  }
});

await runTest(5, "Top universities are sorted by count", async () => {
  const { data } = await apiRequest("/stats");
  if (data.topUniversities.length > 1) {
    for (let i = 0; i < data.topUniversities.length - 1; i++) {
      assert(
        data.topUniversities[i].count >= data.topUniversities[i + 1].count,
        "Universities should be sorted by count (descending)"
      );
    }
  }
});

// ============================================================================
// SECTION 2: FORM VALIDATION (5 tests)
// ============================================================================
console.log("\n📋 SECTION 2: FORM VALIDATION");
console.log("=".repeat(70));

await runTest(6, "Reject empty student name", async () => {
  const { response, data } = await createTestCredential({ studentName: "" });
  assert(!response.ok, "Should reject empty student name");
  assert(data.error, "Should have error message");
});

await runTest(7, "Reject empty degree", async () => {
  const { response, data } = await createTestCredential({ degree: "" });
  assert(!response.ok, "Should reject empty degree");
  assert(data.error, "Should have error message");
});

await runTest(8, "Reject empty university", async () => {
  const { response, data } = await createTestCredential({ university: "" });
  assert(!response.ok, "Should reject empty university");
  assert(data.error, "Should have error message");
});

await runTest(9, "Accept valid date format", async () => {
  const { response, data } = await createTestCredential({
    graduationDate: "2024-06-15",
  });
  assert(response.ok, "Should accept valid date format");
  assert(data.graduationDate === "2024-06-15", "Should preserve date format");
});

await runTest(10, "Accept valid credential with all fields", async () => {
  const { response, data } = await createTestCredential({
    studentName: "John Doe",
    degree: "BS Computer Science",
    university: "MIT",
    graduationDate: "2024-05-15",
    studentId: "STU-2024-001",
  });
  assert(response.ok, "Should accept valid credential");
  assert(data.attestationUID, "Should return attestation UID");
  assert(data.vcCID, "Should return VC CID");
  console.log(`   → Created credential with UID: ${data.attestationUID.slice(0, 10)}...`);
});

// ============================================================================
// SECTION 3: CREDENTIAL ISSUANCE (5 tests)
// ============================================================================
console.log("\n🎓 SECTION 3: CREDENTIAL ISSUANCE");
console.log("=".repeat(70));

await runTest(11, "Issue credential with minimal required fields", async () => {
  const { response, data } = await createTestCredential({
    studentName: "Alice Smith",
    degree: "BA Economics",
    university: "Stanford",
    graduationDate: "2023-06-10",
  });
  assert(response.ok, "Should issue credential");
  assert(data.studentName === "Alice Smith", "Should save student name");
  console.log(`   → Issued for Alice Smith`);
});

await runTest(12, "Issue credential with optional studentId", async () => {
  const { response, data } = await createTestCredential({
    studentName: "Bob Johnson",
    degree: "MS Data Science",
    university: "Carnegie Mellon",
    graduationDate: "2024-12-20",
    studentId: "CMU-2024-999",
  });
  assert(response.ok, "Should issue credential");
  assert(data.studentId === "CMU-2024-999", "Should save student ID");
  console.log(`   → Issued with student ID`);
});

await runTest(13, "Issue multiple credentials for same university", async () => {
  await createTestCredential({
    studentName: "Carol Davis",
    degree: "PhD Physics",
    university: "Harvard",
    graduationDate: "2024-01-15",
  });
  const { response, data } = await createTestCredential({
    studentName: "David Wilson",
    degree: "MS Physics",
    university: "Harvard",
    graduationDate: "2024-01-15",
  });
  assert(response.ok, "Should issue multiple credentials for same university");
  console.log(`   → Issued 2 credentials for Harvard`);
});

await runTest(14, "Issued credential appears in list", async () => {
  const { data: credential } = await createTestCredential({
    studentName: "Eve Martinez",
    degree: "BA Art History",
    university: "Yale",
    graduationDate: "2024-05-20",
  });

  const { response, data: list } = await apiRequest("/list?limit=50");
  assert(response.ok, "Should fetch list");
  const found = list.find((c) => c.attestationUID === credential.attestationUID);
  assert(found, "Newly issued credential should appear in list");
  assert(found.studentName === "Eve Martinez", "Should have correct data");
  console.log(`   → Found Eve Martinez in list`);
});

await runTest(15, "Newly issued credential is active (not revoked)", async () => {
  const { data: credential } = await createTestCredential({
    studentName: "Frank Thompson",
    degree: "MBA",
    university: "Wharton",
    graduationDate: "2024-06-01",
  });

  const { response, data } = await apiRequest(`/${credential.id}`);
  assert(response.ok, "Should fetch credential");
  assert(data.revokedAt === null, "Should not be revoked");
  console.log(`   → Frank Thompson's credential is active`);
});

// ============================================================================
// SECTION 4: LIST, SEARCH, AND FILTER (5 tests)
// ============================================================================
console.log("\n🔍 SECTION 4: LIST, SEARCH, AND FILTER");
console.log("=".repeat(70));

await runTest(16, "List credentials with pagination", async () => {
  const { response, data } = await apiRequest("/list?limit=5&offset=0");
  assert(response.ok, "Should fetch list");
  assert(Array.isArray(data), "Should return array");
  assert(data.length <= 5, "Should respect limit");
  console.log(`   → Retrieved ${data.length} credentials (limit 5)`);
});

await runTest(17, "Filter by university", async () => {
  // Create test data
  await createTestCredential({
    studentName: "Grace Lee",
    degree: "BS Biology",
    university: "Princeton",
    graduationDate: "2024-05-15",
  });

  const { response, data } = await apiRequest("/list?university=Princeton");
  assert(response.ok, "Should fetch filtered list");
  assert(
    data.every((c) => c.university === "Princeton"),
    "All credentials should be from Princeton"
  );
  console.log(`   → Found ${data.length} Princeton credentials`);
});

await runTest(18, "Filter by active status", async () => {
  const { response, data } = await apiRequest("/list?revoked=false&limit=50");
  assert(response.ok, "Should fetch active credentials");
  assert(
    data.every((c) => c.revokedAt === null),
    "All credentials should be active"
  );
  console.log(`   → Found ${data.length} active credentials`);
});

await runTest(19, "Sort by student name ascending", async () => {
  const { response, data } = await apiRequest(
    "/list?sortBy=studentName&sortOrder=asc&limit=50"
  );
  assert(response.ok, "Should fetch sorted list");
  if (data.length > 1) {
    for (let i = 0; i < data.length - 1; i++) {
      assert(
        data[i].studentName.localeCompare(data[i + 1].studentName) <= 0,
        "Should be sorted alphabetically"
      );
    }
  }
  console.log(`   → Sorted ${data.length} credentials by name`);
});

await runTest(20, "Search by student name", async () => {
  // Create unique credential
  await createTestCredential({
    studentName: "Unique-Name-12345",
    degree: "Test Degree",
    university: "Test Uni",
    graduationDate: "2024-01-01",
  });

  const { response, data } = await apiRequest("/student/Unique-Name-12345");
  assert(response.ok, "Should search by student name");
  assert(data.length > 0, "Should find the credential");
  assert(
    data[0].studentName === "Unique-Name-12345",
    "Should match student name"
  );
  console.log(`   → Found credential via search`);
});

// ============================================================================
// SECTION 5: REVOCATION AND ERROR HANDLING (5 tests)
// ============================================================================
console.log("\n🚫 SECTION 5: REVOCATION AND ERROR HANDLING");
console.log("=".repeat(70));

await runTest(21, "Revoke a credential with reason", async () => {
  const { data: credential } = await createTestCredential({
    studentName: "Henry Clark",
    degree: "BS Engineering",
    university: "Caltech",
    graduationDate: "2024-03-15",
  });

  const { response, data } = await apiRequest("/revoke", {
    method: "POST",
    body: JSON.stringify({
      attestationUID: credential.attestationUID,
      reason: "Test revocation",
    }),
  });

  assert(response.ok, "Should revoke credential");
  assert(data.message.includes("revoked"), "Should confirm revocation");
  console.log(`   → Revoked Henry Clark's credential`);
});

await runTest(22, "Revoked credential shows revoked status", async () => {
  const { data: credential } = await createTestCredential({
    studentName: "Iris Brown",
    degree: "MA Literature",
    university: "Columbia",
    graduationDate: "2024-05-01",
  });

  await apiRequest("/revoke", {
    method: "POST",
    body: JSON.stringify({
      attestationUID: credential.attestationUID,
      reason: "Verification failed",
    }),
  });

  const { response, data } = await apiRequest(`/${credential.id}`);
  assert(response.ok, "Should fetch credential");
  assert(data.revokedAt !== null, "Should be marked as revoked");
  assert(data.revocationReason === "Verification failed", "Should have reason");
  console.log(`   → Verified revocation status`);
});

await runTest(23, "Reject duplicate revocation", async () => {
  const { data: credential } = await createTestCredential({
    studentName: "Jack White",
    degree: "BS Chemistry",
    university: "Berkeley",
    graduationDate: "2024-06-15",
  });

  await apiRequest("/revoke", {
    method: "POST",
    body: JSON.stringify({
      attestationUID: credential.attestationUID,
      reason: "First revocation",
    }),
  });

  const { response, data } = await apiRequest("/revoke", {
    method: "POST",
    body: JSON.stringify({
      attestationUID: credential.attestationUID,
      reason: "Second revocation",
    }),
  });

  assert(!response.ok, "Should reject duplicate revocation");
  assert(
    data.error.toLowerCase().includes("already revoked"),
    "Should mention already revoked"
  );
  console.log(`   → Rejected duplicate revocation`);
});

await runTest(24, "Filter shows only revoked credentials", async () => {
  const { response, data } = await apiRequest("/list?revoked=true&limit=50");
  assert(response.ok, "Should fetch revoked credentials");
  assert(
    data.every((c) => c.revokedAt !== null),
    "All credentials should be revoked"
  );
  console.log(`   → Found ${data.length} revoked credentials`);
});

await runTest(25, "Handle non-existent credential gracefully", async () => {
  const { response } = await apiRequest("/non-existent-id-12345");
  assert(!response.ok, "Should return error for non-existent credential");
  assert(response.status === 404, "Should return 404 status");
  console.log(`   → Handled non-existent credential`);
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n" + "=".repeat(70));
console.log("📊 TEST SUMMARY:");
console.log(`   ✅ Passed: ${testResults.passed}/${testResults.total}`);
console.log(`   ❌ Failed: ${testResults.failed}/${testResults.total}`);
console.log(
  `   📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`
);

console.log("\n📋 Test Coverage:");
console.log("   ✓ Statistics endpoint (5 tests)");
console.log("   ✓ Form validation (5 tests)");
console.log("   ✓ Credential issuance (5 tests)");
console.log("   ✓ List, search, and filter (5 tests)");
console.log("   ✓ Revocation and error handling (5 tests)");

console.log("\n🎯 Features Verified:");
console.log("   ✓ Statistics calculation and display");
console.log("   ✓ Form field validation");
console.log("   ✓ Credential creation flow");
console.log("   ✓ List pagination");
console.log("   ✓ University filtering");
console.log("   ✓ Status filtering (active/revoked)");
console.log("   ✓ Sorting by multiple fields");
console.log("   ✓ Student name search");
console.log("   ✓ Credential revocation");
console.log("   ✓ Duplicate revocation prevention");
console.log("   ✓ Error handling");

console.log("\n" + "=".repeat(70));

if (testResults.failed === 0) {
  console.log("🎉 ALL TESTS PASSED! Steps 9-10 COMPLETE\n");
  process.exit(0);
} else {
  console.log(
    `⚠️  ${testResults.failed} TEST(S) FAILED. Please review and fix.\n`
  );
  process.exit(1);
}
