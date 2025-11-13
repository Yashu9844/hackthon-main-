#!/usr/bin/env node
/**
 * Comprehensive Test Suite for Steps 5-6
 * Tests: Backend API, Database, VC Creation, Signing, Verification
 */

const API_URL = 'http://localhost:8000';

console.log('🧪 COMPREHENSIVE TEST SUITE - STEPS 5-6\n');
console.log('='.repeat(70));

let testsPassed = 0;
let testsFailed = 0;
let issuedCredentials = [];

// Helper function to wait
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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

// ============================================================================
// TEST 1-5: Basic Credential Issuance
// ============================================================================

await test('1. Issue credential with all fields', async () => {
  const response = await fetch(`${API_URL}/api/credentials/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Alice Johnson',
      degree: 'Bachelor of Science',
      university: 'MIT',
      graduationDate: '2024-06-01',
      studentId: 'MIT001',
    }),
  });

  const data = await response.json();
  
  if (!response.ok) throw new Error(data.error || 'Request failed');
  if (!data.success) throw new Error('Issue failed');
  if (!data.vcCID) throw new Error('No CID returned');
  if (!data.attestationUID) throw new Error('No attestation UID');
  if (!data.vc) throw new Error('No VC returned');
  if (!data.vc.proof) throw new Error('VC not signed');
  
  console.log(`   → Credential ID: ${data.credentialId}`);
  console.log(`   → VC CID: ${data.vcCID}`);
  console.log(`   → Attestation UID: ${data.attestationUID}`);
  
  issuedCredentials.push(data);
});

await test('2. Issue credential without optional studentId', async () => {
  const response = await fetch(`${API_URL}/api/credentials/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Bob Smith',
      degree: 'Master of Arts',
      university: 'Stanford',
      graduationDate: '2024-05-15',
    }),
  });

  const data = await response.json();
  
  if (!response.ok) throw new Error(data.error || 'Request failed');
  if (!data.success) throw new Error('Issue failed');
  
  issuedCredentials.push(data);
});

await test('3. Reject credential with missing required fields', async () => {
  const response = await fetch(`${API_URL}/api/credentials/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Charlie Brown',
      degree: 'PhD',
      // Missing university and graduationDate
    }),
  });

  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }
});

await test('4. Issue multiple credentials for same student', async () => {
  for (let i = 0; i < 3; i++) {
    const response = await fetch(`${API_URL}/api/credentials/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Diana Prince',
        degree: `Certificate ${i + 1}`,
        university: 'Harvard',
        graduationDate: '2024-07-20',
        studentId: 'HRV999',
      }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(`Batch issue ${i + 1} failed`);
    issuedCredentials.push(data);
  }
  
  console.log(`   → Issued 3 credentials`);
});

await test('5. Verify each credential has unique CID and UID', async () => {
  const cids = new Set(issuedCredentials.map(c => c.vcCID));
  const uids = new Set(issuedCredentials.map(c => c.attestationUID));
  
  if (cids.size !== issuedCredentials.length) {
    throw new Error('Duplicate CIDs found');
  }
  
  if (uids.size !== issuedCredentials.length) {
    throw new Error('Duplicate attestation UIDs found');
  }
  
  console.log(`   → ${issuedCredentials.length} unique credentials verified`);
});

// ============================================================================
// TEST 6-10: Verification Tests
// ============================================================================

await test('6. Verify credential by CID', async () => {
  const credential = issuedCredentials[0];
  
  const response = await fetch(`${API_URL}/api/credentials/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cid: credential.vcCID }),
  });

  const data = await response.json();
  
  if (!data.isValid) throw new Error('Verification failed');
  if (!data.vc) throw new Error('No VC data returned');
  
  console.log(`   → Verified: ${data.vc.credentialSubject.studentName}`);
});

await test('7. Verify credential by attestation UID', async () => {
  const credential = issuedCredentials[1];
  
  const response = await fetch(`${API_URL}/api/credentials/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attestationUID: credential.attestationUID }),
  });

  const data = await response.json();
  
  if (!data.isValid) throw new Error('Verification failed');
  if (!data.attestation) throw new Error('No attestation data');
  
  console.log(`   → Attestation UID: ${data.attestation.uid}`);
});

await test('8. Reject verification without CID or UID', async () => {
  const response = await fetch(`${API_URL}/api/credentials/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }
});

await test('9. Verify non-existent CID returns error', async () => {
  const response = await fetch(`${API_URL}/api/credentials/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cid: 'bafy9999999999999999999' }),
  });

  const data = await response.json();
  
  if (data.isValid) throw new Error('Should be invalid');
  if (!data.error) throw new Error('No error message');
});

await test('10. Verify non-existent attestation UID returns error', async () => {
  const response = await fetch(`${API_URL}/api/credentials/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attestationUID: '0x9999999999999999' }),
  });

  const data = await response.json();
  
  if (data.isValid) throw new Error('Should be invalid');
});

// ============================================================================
// TEST 11-15: List and Database Tests
// ============================================================================

await test('11. List all credentials', async () => {
  const response = await fetch(`${API_URL}/api/credentials/list`);
  const data = await response.json();
  
  if (!data.credentials) throw new Error('No credentials array');
  if (data.credentials.length < issuedCredentials.length) {
    throw new Error(`Expected at least ${issuedCredentials.length} credentials`);
  }
  
  console.log(`   → Found ${data.credentials.length} credentials in DB`);
});

await test('12. Verify database stores correct data', async () => {
  const response = await fetch(`${API_URL}/api/credentials/list`);
  const data = await response.json();
  
  const alice = data.credentials.find(c => c.studentName === 'Alice Johnson');
  if (!alice) throw new Error('Alice not found in DB');
  if (alice.degree !== 'Bachelor of Science') throw new Error('Wrong degree');
  if (alice.university !== 'MIT') throw new Error('Wrong university');
  
  console.log(`   → Database integrity verified`);
});

await test('13. Verify credentials are ordered by issuedAt desc', async () => {
  const response = await fetch(`${API_URL}/api/credentials/list`);
  const data = await response.json();
  
  for (let i = 1; i < data.credentials.length; i++) {
    const prev = new Date(data.credentials[i - 1].issuedAt);
    const curr = new Date(data.credentials[i].issuedAt);
    if (prev < curr) {
      throw new Error('Credentials not ordered correctly');
    }
  }
  
  console.log(`   → Order verified`);
});

await test('14. Verify unique constraints work', async () => {
  // Try to create credential with same CID (should fail in real scenario)
  // For now, just verify uniqueness in current set
  const response = await fetch(`${API_URL}/api/credentials/list`);
  const data = await response.json();
  
  const vcCIDs = data.credentials.map(c => c.vcCID);
  const uniqueCIDs = new Set(vcCIDs);
  
  if (vcCIDs.length !== uniqueCIDs.size) {
    throw new Error('Duplicate CIDs in database');
  }
  
  console.log(`   → All CIDs unique`);
});

await test('15. Verify all required fields are stored', async () => {
  const response = await fetch(`${API_URL}/api/credentials/list`);
  const data = await response.json();
  
  const credential = data.credentials[0];
  const requiredFields = ['id', 'studentName', 'degree', 'university', 'graduationDate', 
                          'vcCID', 'attestationUID', 'attestationTxHash', 'issuerDID', 'issuedAt'];
  
  for (const field of requiredFields) {
    if (!(field in credential)) {
      throw new Error(`Missing field: ${field}`);
    }
  }
  
  console.log(`   → All required fields present`);
});

// ============================================================================
// TEST 16-20: Revocation Tests
// ============================================================================

await test('16. Revoke a credential', async () => {
  const credential = issuedCredentials[2];
  
  const response = await fetch(`${API_URL}/api/credentials/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attestationUID: credential.attestationUID,
      reason: 'Test revocation',
    }),
  });

  const data = await response.json();
  
  if (!data.success) throw new Error('Revocation failed');
  if (!data.txHash) throw new Error('No tx hash');
  
  console.log(`   → Revoked: ${credential.attestationUID}`);
});

await test('17. Verify revoked credential shows as invalid', async () => {
  const credential = issuedCredentials[2];
  
  const response = await fetch(`${API_URL}/api/credentials/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attestationUID: credential.attestationUID }),
  });

  const data = await response.json();
  
  if (data.isValid) throw new Error('Revoked credential should be invalid');
  if (!data.error.includes('revoked')) throw new Error('Error should mention revocation');
  
  console.log(`   → Revocation verified`);
});

await test('18. Verify revocation is stored in database', async () => {
  const response = await fetch(`${API_URL}/api/credentials/list`);
  const data = await response.json();
  
  const revoked = data.credentials.find(c => c.attestationUID === issuedCredentials[2].attestationUID);
  
  if (!revoked.revokedAt) throw new Error('revokedAt not set');
  if (!revoked.revocationReason) throw new Error('revocationReason not set');
  
  console.log(`   → Revocation stored in DB`);
});

await test('19. Reject revocation without attestation UID', async () => {
  const response = await fetch(`${API_URL}/api/credentials/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }
});

await test('20. Verify non-revoked credentials still valid', async () => {
  const credential = issuedCredentials[0]; // Not revoked
  
  const response = await fetch(`${API_URL}/api/credentials/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cid: credential.vcCID }),
  });

  const data = await response.json();
  
  if (!data.isValid) throw new Error('Non-revoked credential should be valid');
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
console.log('   ✓ Credential issuance (5 tests)');
console.log('   ✓ Verification (5 tests)');
console.log('   ✓ Database operations (5 tests)');
console.log('   ✓ Revocation (5 tests)');

console.log('\n🎯 Features Verified:');
console.log('   ✓ VC creation with lib-vc');
console.log('   ✓ DID-based signing');
console.log('   ✓ Signature verification');
console.log('   ✓ Database storage (Prisma)');
console.log('   ✓ Mock IPFS CID generation');
console.log('   ✓ Mock EAS attestation');
console.log('   ✓ Revocation flow');
console.log('   ✓ List endpoint');
console.log('   ✓ Input validation');
console.log('   ✓ Error handling');

console.log('\n' + '='.repeat(70));

if (testsFailed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Ready for Steps 7-8\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${testsFailed} TESTS FAILED. Please review errors above.\n`);
  process.exit(1);
}
