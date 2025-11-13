#!/usr/bin/env node

/**
 * Test Verification Functionality
 * Tests the /verify page and API endpoint
 */

const BASE_URL = 'http://localhost:8000';

async function testVerification() {
  console.log('🧪 Testing Verification Functionality\n');
  console.log('='.repeat(60));
  
  let passCount = 0;
  let failCount = 0;

  // Test 1: Get list of credentials
  console.log('\n1️⃣  Test: Get credentials list');
  try {
    const response = await fetch(`${BASE_URL}/api/credentials/list`);
    const credentials = await response.json();
    
    if (credentials.length > 0) {
      console.log('✅ PASS: Found', credentials.length, 'credentials');
      
      // Find a non-revoked credential for testing
      const activeCredential = credentials.find(c => !c.revokedAt) || credentials[0];
      
      console.log('Test credential:', {
        student: activeCredential.studentName,
        uid: activeCredential.attestationUID,
        cid: activeCredential.vcCID,
        revoked: !!activeCredential.revokedAt
      });
      passCount++;
      
      // Test 2: Verify by UID
      console.log('\n2️⃣  Test: Verify by Attestation UID');
      const uid = activeCredential.attestationUID;
      const verifyResponse = await fetch(`${BASE_URL}/api/credentials/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attestationUID: uid })
      });
      
      const verifyData = await verifyResponse.json();
      console.log('Response:', verifyData);
      
      if (verifyData.isValid) {
        console.log('✅ PASS: Verification successful');
        console.log('Credential data:', verifyData.vc);
        passCount++;
      } else {
        console.log('❌ FAIL: Verification failed', verifyData.error);
        failCount++;
      }
      
      // Test 3: Verify by CID
      console.log('\n3️⃣  Test: Verify by IPFS CID');
      const cid = activeCredential.vcCID;
      const cidVerifyResponse = await fetch(`${BASE_URL}/api/credentials/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid: cid })
      });
      
      const cidVerifyData = await cidVerifyResponse.json();
      
      if (cidVerifyData.isValid !== undefined) {
        console.log('✅ PASS: CID verification endpoint working');
        console.log('Result:', cidVerifyData);
        passCount++;
      } else {
        console.log('❌ FAIL: CID verification failed');
        failCount++;
      }
      
      // Test 4: Verify invalid UID
      console.log('\n4️⃣  Test: Verify with invalid UID');
      const invalidResponse = await fetch(`${BASE_URL}/api/credentials/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attestationUID: '0xinvaliduid123' })
      });
      
      const invalidData = await invalidResponse.json();
      
      if (invalidData.isValid === false) {
        console.log('✅ PASS: Correctly returns invalid for bad UID');
        console.log('Error message:', invalidData.error);
        passCount++;
      } else {
        console.log('❌ FAIL: Should return invalid');
        failCount++;
      }
      
    } else {
      console.log('❌ FAIL: No credentials in database');
      console.log('Please issue a credential first using /admin');
      failCount++;
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    failCount++;
  }

  // Test 5: Check API response structure
  console.log('\n5️⃣  Test: Check API response structure');
  try {
    const response = await fetch(`${BASE_URL}/api/credentials/list`);
    const credentials = await response.json();
    
    if (credentials.length > 0) {
      const activeCredential = credentials.find(c => !c.revokedAt) || credentials[0];
      const uid = activeCredential.attestationUID;
      const verifyResponse = await fetch(`${BASE_URL}/api/credentials/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attestationUID: uid })
      });
      
      const data = await verifyResponse.json();
      
      console.log('Response structure:');
      console.log('- isValid:', data.isValid !== undefined ? '✓' : '✗');
      console.log('- vc:', data.vc ? '✓' : '✗');
      console.log('- attestation:', data.attestation ? '✓' : '✗');
      
      // Check VC structure
      if (data.vc) {
        console.log('\nVC structure:');
        console.log('- id:', data.vc.id);
        console.log('- studentName:', data.vc.studentName || data.vc.credentialSubject?.studentName);
        console.log('- degree:', data.vc.degree || data.vc.credentialSubject?.degree);
        console.log('- university:', data.vc.university || data.vc.credentialSubject?.university);
      }
      
      if (data.isValid && data.vc) {
        console.log('\n✅ PASS: Response structure is correct');
        passCount++;
      } else {
        console.log('\n❌ FAIL: Response structure incomplete');
        failCount++;
      }
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    failCount++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:');
  console.log('✅ Passed:', passCount);
  console.log('❌ Failed:', failCount);
  console.log('📈 Success Rate:', Math.round((passCount / (passCount + failCount)) * 100) + '%');
  
  if (failCount === 0) {
    console.log('\n🎉 All tests passed! Verification is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the issues above.');
  }
  
  console.log('\n💡 Tips:');
  console.log('- Make sure backend is running on port 8000');
  console.log('- Issue at least one credential using /admin first');
  console.log('- Check browser console for frontend errors');
  console.log('- Try http://localhost:3000/verify in your browser');
}

// Run tests
testVerification().catch(console.error);
