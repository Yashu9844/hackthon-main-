# @repo/lib-vc

W3C Verifiable Credentials builder with DID:key support and Ed25519 signatures.

## Features

- ✅ DID:key generation (Ed25519)
- ✅ W3C Verifiable Credential creation
- ✅ Ed25519 signature creation
- ✅ Signature verification
- ✅ Key import/export

## Usage

### Generate DID Key

```typescript
import { generateDIDKey, exportKeyPair } from '@repo/lib-vc';

const keyPair = await generateDIDKey();
console.log('DID:', keyPair.did);

// Export for storage
const exported = exportKeyPair(keyPair);
console.log('Private Key:', exported.privateKeyHex);
```

### Create and Sign Credential

```typescript
import { createDegreeCredential, signCredential } from '@repo/lib-vc';

// Create credential
const credential = createDegreeCredential(
  {
    studentName: 'John Doe',
    degree: 'Bachelor of Science',
    university: 'MIT',
    graduationDate: '2024-06-01',
  },
  {
    issuerDID: keyPair.did,
    issuerName: 'MIT Registrar',
  }
);

// Sign it
const signedVC = await signCredential(credential, {
  privateKey: keyPair.privateKey,
  issuerDID: keyPair.did,
});

console.log('Signed VC:', signedVC);
```

### Verify Credential

```typescript
import { verifyCredential, publicKeyFromDID } from '@repo/lib-vc';

const publicKey = publicKeyFromDID(signedVC.issuer.id);
const isValid = await verifyCredential(signedVC, publicKey);

console.log('Valid:', isValid);
```
