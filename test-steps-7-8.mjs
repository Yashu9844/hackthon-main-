#!/usr/bin/env node
/**
 * Comprehensive Test Suite for Steps 7-8
 * Tests: Enhanced endpoints, filtering, stats, error handling
 */

const API_URL = 'http://localhost:8000';

console.log('🧪 COMPREHENSIVE TEST SUITE - STEPS 7-8\n');
console.log('='.repeat(70));

let testsPassed = 0;
let testsFailed = 0;
let issuedCredentials = [];

// Test helper
async function test(name, fn) {
  try {
    console.log(`\n📝 TEST: ${name}`);
    await fn();
    console.log(`   ✅ PASSED`);
    testsPassed++;
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    testsFailed++;
  }
}

// Setup: Create test data
console.log('\n🔧 SETUP: Creating test data...\n');

// Issue 10 credentials across different universities
const testData = [
  { studentName: 'Alice Smith', degree: 'BSc Computer Science', university: 'MIT', graduationDate: '2024-06-01' },
  { studentName: 'Bob Johnson', degree: 'MSc Data Science', university: 'Stanford', graduationDate: '2024-05-15' },
  { studentName: 'Carol White', degree: 'BA Economics', university: 'Harvard', graduationDate: '2024-07-20' },
  { studentName: 'David Brown', degree: 'BSc Physics', university: 'MIT', graduationDate: '2024-06-01' },
  { studentName: 'Eve Davis', degree: 'MSc AI', university: 'Stanford', graduationDate: '2024-08-10' },
  { studentName: 'Frank Miller', degree: 'PhD Mathematics', university: 'Oxford', graduationDate: '2024-09-01' },
  { studentName: 'Grace Lee', degree: 'BSc Biology', university: 'Harvard', graduationDate: '2024-06-15' },
  { studentName: 'Henry Wilson', degree: 'MSc Engineering', university: 'MIT', graduationDate: '2024-07-01' },
  { studentName: 'Ivy Chen', degree: 'BA Psychology', university: 'Yale', graduationDate: '2024-05-30' },
  { studentName: 'Jack Taylor', degree: 'BSc Chemistry', university: 'Oxford', graduationDate: '2024-06-20' },
];

for (const data of testData) {
  const response = await fetch(`${API_URL}/api/credentials/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  issuedCredentials.push(result);
}

console.log(`✅ Created ${issuedCredentials.length} test credentials\n`);
console.log('='.repeat(70));

// ============================================================================
// TEST 1-5: Enhanced Revocation
// ============================================================================

await test('1. Revoke a credential', async () => {
  const credential = issuedCredentials[0];
  
  const response = await fetch(`${API_URL}/api/credentials/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attestationUID: credential.attestationUID,
      reason: 'Fraudulent degree',
    }),
  });

  const data = await response.json();
  
  if (!data.success) throw new Error('Revocation failed');
  if (!data.credential) throw new Error('No credential info returned');
  if (!data.credential.revokedAt) throw new Error('RevokedAt not set');
  
  console.log(`   → Revoked: ${data.credential.studentName}`);
  console.log(`   → Reason: ${data.credential.reason}`);
});

await test('2. Reject duplicate revocation', async () => {
  const credential = issuedCredentials[0];
  
  const response = await fetch(`${API_URL}/api/credentials/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attestationUID: credential.attestationUID,
      reason: 'Try again',
    }),
  });

  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.error.includes('already revoked')) {
    throw new Error('Error should mention already revoked');
  }
});

await test('3. Reject revoke non-existent credential', async () => {
  const response = await fetch(`${API_URL}/api/credentials/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attestationUID: '0xnonexistent',
      reason: 'Test',
    }),
  });

  if (response.status !== 404) {
    throw new Error(`Expected 404, got ${response.status}`);
  }
});

await test('4. Revoke multiple credentials', async () => {
  const toRevoke = [issuedCredentials[1], issuedCredentials[2]];
  
  for (const cred of toRevoke) {
    const response = await fetch(`${API_URL}/api/credentials/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attestationUID: cred.attestationUID,
        reason: 'Batch revocation test',
      }),
    });
    
    const data = await response.json();
    if (!data.success) throw new Error('Revocation failed');
  }
  
  console.log(`   → Revoked ${toRevoke.length} credentials`);
});

await test('5. Verify revoked count updated', async () => {
  const response = await fetch(`${API_URL}/api/credentials/list?revoked=true`);
  const data = await response.json();
  
  if (data.credentials.length < 3) {
    throw new Error(`Expected at least 3 revoked, got ${data.credentials.length}`);
  }
  
  console.log(`   → Found ${data.credentials.length} revoked credentials`);
});

// ============================================================================
// TEST 6-10: List Filtering
// ============================================================================

await test('6. List with university filter', async () => {
  const response = await fetch(`${API_URL}/api/credentials/list?university=MIT`);
  const data = await response.json();
  
  if (!data.credentials) throw new Error('No credentials returned');
  if (!data.total) throw new Error('No total count');
  
  // All should be from MIT
  const allMIT = data.credentials.every(c => c.university.includes('MIT'));
  if (!allMIT) throw new Error('Filter not working');
  
  console.log(`   → Found ${data.credentials.length} MIT credentials`);
});

await test('7. List only active credentials', async () => {
  const response = await fetch(`${API_URL}/api/credentials/list?revoked=false`);
  const data = await response.json();
  
  const hasRevoked = data.credentials.some(c => c.revokedAt !== null);
  if (hasRevoked) throw new Error('Revoked credentials in active list');
  
  console.log(`   → ${data.credentials.length} active credentials`);
});

await test('8. List only revoked credentials', async () => {
  const response = await fetch(`${API_URL}/api/credentials/list?revoked=true`);
  const data = await response.json();
  
  const hasActive = data.credentials.some(c => c.revokedAt === null);
  if (hasActive) throw new Error('Active credentials in revoked list');
  
  console.log(`   → ${data.credentials.length} revoked credentials`);
});

await test('9. List with pagination', async () => {
  const response = await fetch(`${API_URL}/api/credentials/list?limit=5&offset=0`);
  const data = await response.json();
  
  if (data.credentials.length > 5) {
    throw new Error(`Expected max 5, got ${data.credentials.length}`);
  }
  
  if (data.limit !== 5) throw new Error('Limit not applied');
  if (data.offset !== 0) throw new Error('Offset not applied');
  
  console.log(`   → Page 1: ${data.credentials.length} items`);
});

await test('10. List with sorting', async () => {
  const response = await fetch(`${API_URL}/api/credentials/list?sortBy=studentName&sortOrder=asc&limit=5`);
  const data = await response.json();
  
  // Check if sorted
  for (let i = 1; i < data.credentials.length; i++) {
    if (data.credentials[i].studentName < data.credentials[i-1].studentName) {
      throw new Error('Not sorted correctly');
    }
  }
  
  console.log(`   → Sorted by student name (asc)`);
});

// ============================================================================
// TEST 11-15: Get Credential Endpoints
// ============================================================================

await test('11. Get credential by ID', async () => {
  const credId = issuedCredentials[3].credentialId;
  
  const response = await fetch(`${API_URL}/api/credentials/${credId}`);
  const data = await response.json();
  
  if (!data.credential) throw new Error('No credential returned');
  if (data.credential.id !== credId) throw new Error('Wrong credential');
  
  console.log(`   → Got: ${data.credential.studentName}`);
});

await test('12. Get non-existent credential returns 404', async () => {
  const response = await fetch(`${API_URL}/api/credentials/nonexistent-id`);
  
  if (response.status !== 404) {
    throw new Error(`Expected 404, got ${response.status}`);
  }
});

await test('13. Search by student name', async () => {
  const response = await fetch(`${API_URL}/api/credentials/student/Alice`);
  const data = await response.json();
  
  if (!data.credentials) throw new Error('No credentials returned');
  if (data.count === 0) throw new Error('No results');
  
  // All should contain "Alice"
  const allMatch = data.credentials.every(c => c.studentName.includes('Alice'));
  if (!allMatch) throw new Error('Search not working');
  
  console.log(`   → Found ${data.count} credentials for Alice`);
});

await test('14. Search is case insensitive', async () => {
  const response = await fetch(`${API_URL}/api/credentials/student/alice`);
  const data = await response.json();
  
  if (data.count === 0) throw new Error('Case insensitive search not working');
  
  console.log(`   → Case insensitive search works`);
});

await test('15. Search returns partial matches', async () => {
  const response = await fetch(`${API_URL}/api/credentials/student/Smith`);
  const data = await response.json();
  
  if (data.count === 0) throw new Error('Partial match not working');
  
  const hasSmith = data.credentials.some(c => c.studentName.includes('Smith'));
  if (!hasSmith) throw new Error('Wrong results');
  
  console.log(`   → Partial match works`);
});

// ============================================================================
// TEST 16-20: Statistics Endpoint
// ============================================================================

await test('16. Get statistics', async () => {
  const response = await fetch(`${API_URL}/api/credentials/stats`);
  const data = await response.json();
  
  if (typeof data.total !== 'number') throw new Error('No total');
  if (typeof data.active !== 'number') throw new Error('No active count');
  if (typeof data.revoked !== 'number') throw new Error('No revoked count');
  
  console.log(`   → Total: ${data.total}`);
  console.log(`   → Active: ${data.active}`);
  console.log(`   → Revoked: ${data.revoked}`);
});

await test('17. Stats show revocation rate', async () => {
  const response = await fetch(`${API_URL}/api/credentials/stats`);
  const data = await response.json();
  
  if (!data.revocationRate) throw new Error('No revocation rate');
  
  const rate = parseFloat(data.revocationRate);
  if (isNaN(rate)) throw new Error('Invalid rate format');
  
  console.log(`   → Revocation rate: ${data.revocationRate}%`);
});

await test('18. Stats show top universities', async () => {
  const response = await fetch(`${API_URL}/api/credentials/stats`);
  const data = await response.json();
  
  if (!Array.isArray(data.topUniversities)) {
    throw new Error('No top universities array');
  }
  
  if (data.topUniversities.length === 0) {
    throw new Error('Empty universities list');
  }
  
  // Check format
  const first = data.topUniversities[0];
  if (!first.university || typeof first.count !== 'number') {
    throw new Error('Invalid format');
  }
  
  console.log(`   → Top: ${first.university} (${first.count})`);
});

await test('19. Stats total equals active + revoked', async () => {
  const response = await fetch(`${API_URL}/api/credentials/stats`);
  const data = await response.json();
  
  if (data.total !== data.active + data.revoked) {
    throw new Error(`Math error: ${data.total} !== ${data.active} + ${data.revoked}`);
  }
  
  console.log(`   → Math checks out`);
});

await test('20. Combined filters work together', async () => {
  const response = await fetch(
    `${API_URL}/api/credentials/list?university=MIT&revoked=false&limit=3`
  );
  const data = await response.json();
  
  // Should be MIT, not revoked, max 3
  if (data.credentials.length > 3) throw new Error('Limit not applied');
  
  const allMIT = data.credentials.every(c => c.university.includes('MIT'));
  const noneRevoked = data.credentials.every(c => c.revokedAt === null);
  
  if (!allMIT) throw new Error('University filter not working');
  if (!noneRevoked) throw new Error('Revoked filter not working');
  
  console.log(`   → Multiple filters working together`);
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('\n📊 TEST SUMMARY:\n');
console.log(`   ✅ Passed: ${testsPassed}/20`);
console.log(`   ❌ Failed: ${testsFailed}/20`);
console.log(`   📈 Success Rate: ${((testsPassed / 20) * 100).toFixed(1)}%`);

console.log('\n📋 Test Coverage:');
console.log('   ✓ Enhanced revocation (5 tests)');
console.log('   ✓ List filtering (5 tests)');
console.log('   ✓ Get endpoints (5 tests)');
console.log('   ✓ Statistics (5 tests)');

console.log('\n🎯 New Features Verified:');
console.log('   ✓ Duplicate revocation prevention');
console.log('   ✓ Enhanced revocation response');
console.log('   ✓ List filtering by university');
console.log('   ✓ List filtering by revocation status');
console.log('   ✓ Pagination support');
console.log('   ✓ Custom sorting');
console.log('   ✓ Get by ID endpoint');
console.log('   ✓ Search by student name');
console.log('   ✓ Statistics endpoint');
console.log('   ✓ Combined filters');

console.log('\n' + '='.repeat(70));

if (testsFailed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Steps 7-8 COMPLETE\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${testsFailed} TESTS FAILED. Please review errors above.\n`);
  process.exit(1);
}
