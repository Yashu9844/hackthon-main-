'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const testLibVC = async () => {
    setLoading(true);
    try {
      // Dynamic import to handle client-side only code
      const { generateDIDKey, createDegreeCredential, signCredential, verifyCredential, publicKeyFromDID, exportKeyPair } =
        await import('@repo/lib-vc');

      // Step 1: Generate DID Key
      const keyPair = await generateDIDKey();
      const exported = exportKeyPair(keyPair);

      // Step 2: Create credential
      const credential = createDegreeCredential(
        {
          studentName: 'John Doe',
          degree: 'Bachelor of Science',
          university: 'Test University',
          graduationDate: '2024-06-01',
        },
        {
          issuerDID: keyPair.did,
          issuerName: 'Test University Registrar',
        }
      );

      // Step 3: Sign credential
      const signedVC = await signCredential(credential, {
        privateKey: keyPair.privateKey,
        issuerDID: keyPair.did,
      });

      // Step 4: Verify credential
      const publicKey = publicKeyFromDID(keyPair.did);
      const isValid = await verifyCredential(signedVC, publicKey);

      setResults({
        ...results,
        libVC: {
          status: 'SUCCESS ✅',
          did: keyPair.did,
          privateKeyHex: exported.privateKeyHex.slice(0, 20) + '...',
          credentialId: signedVC.id,
          proofType: signedVC.proof?.type,
          isValid,
        },
      });
    } catch (error) {
      setResults({
        ...results,
        libVC: {
          status: 'FAILED ❌',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const testLibIPFS = async () => {
    setLoading(true);
    try {
      const { createIPFSClient, IPFSClient } = await import('@repo/lib-ipfs');

      const ipfs = createIPFSClient();

      // Test CID validation
      const testCID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
      const isValidCID = IPFSClient.isValidCID(testCID);

      // Note: actual upload requires authentication
      setResults({
        ...results,
        libIPFS: {
          status: 'SUCCESS ✅',
          clientInitialized: !!ipfs,
          cidValidation: isValidCID,
          note: 'Full upload requires Web3.Storage auth',
        },
      });
    } catch (error) {
      setResults({
        ...results,
        libIPFS: {
          status: 'FAILED ❌',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const testLibEAS = async () => {
    setLoading(true);
    try {
      const { createEASClient, getContractAddresses, DEGREE_SCHEMA } = await import('@repo/lib-eas');

      const eas = createEASClient({
        network: 'baseSepolia',
      });

      const addresses = getContractAddresses('baseSepolia');
      const network = eas.getNetwork();

      setResults({
        ...results,
        libEAS: {
          status: 'SUCCESS ✅',
          network,
          easContract: addresses.eas,
          schemaRegistry: addresses.schemaRegistry,
          degreeSchema: DEGREE_SCHEMA.schema,
          note: 'Attestation creation requires private key',
        },
      });
    } catch (error) {
      setResults({
        ...results,
        libEAS: {
          status: 'FAILED ❌',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const testShared = async () => {
    setLoading(true);
    try {
      const { DEGREE_TYPES, formatDate, shortenHash, isValidCID, APP_NAME } = await import('@repo/shared');

      const testDate = formatDate(new Date('2024-06-01'));
      const testHash = shortenHash('0x1234567890abcdef1234567890abcdef1234567890abcdef');
      const testCID = isValidCID('bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi');

      setResults({
        ...results,
        libShared: {
          status: 'SUCCESS ✅',
          appName: APP_NAME,
          degreeTypesCount: DEGREE_TYPES.length,
          formatDateTest: testDate,
          shortenHashTest: testHash,
          cidValidationTest: testCID,
        },
      });
    } catch (error) {
      setResults({
        ...results,
        libShared: {
          status: 'FAILED ❌',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults({});
    await testLibVC();
    await new Promise((r) => setTimeout(r, 500));
    await testLibIPFS();
    await new Promise((r) => setTimeout(r, 500));
    await testLibEAS();
    await new Promise((r) => setTimeout(r, 500));
    await testShared();
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Phase 2: Package Tests</h1>
        <p className="text-gray-600 mb-8">Testing lib-vc, lib-ipfs, lib-eas, and shared packages</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button onClick={testLibVC} disabled={loading} className="w-full">
            Test lib-vc
          </Button>
          <Button onClick={testLibIPFS} disabled={loading} className="w-full">
            Test lib-ipfs
          </Button>
          <Button onClick={testLibEAS} disabled={loading} className="w-full">
            Test lib-eas
          </Button>
          <Button onClick={testShared} disabled={loading} className="w-full">
            Test shared
          </Button>
        </div>

        <Button onClick={runAllTests} disabled={loading} className="w-full mb-8" variant="default">
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </Button>

        <div className="space-y-4">
          {Object.keys(results).length === 0 && (
            <Card className="p-6 text-center text-gray-500">
              Click a button above to run tests
            </Card>
          )}

          {Object.entries(results).map(([pkg, data]) => (
            <Card key={pkg} className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {pkg} - {data.status}
              </h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
