# @repo/lib-eas

EAS (Ethereum Attestation Service) utilities for creating and verifying on-chain attestations.

## Features

- ✅ Create attestations for degree credentials
- ✅ Verify attestations by UID
- ✅ Revoke attestations
- ✅ Register custom schemas
- ✅ Multi-network support (Base Sepolia, Sepolia, Base Mainnet)

## Usage

### Initialize Client

```typescript
import { createEASClient } from '@repo/lib-eas';

// Read-only (verification)
const eas = createEASClient({
  network: 'baseSepolia',
});

// With signer (for attestation creation)
const easWithSigner = createEASClient({
  network: 'baseSepolia',
  privateKey: process.env.PRIVATE_KEY,
  schemaUID: '0x...', // Your registered schema UID
});
```

### Register Schema (One-time)

```typescript
const result = await easWithSigner.registerSchema();
console.log('Schema UID:', result.uid);
// Save this UID for future attestations
```

### Create Attestation

```typescript
const attestation = await easWithSigner.createAttestation({
  studentName: 'John Doe',
  degree: 'Bachelor of Science',
  university: 'MIT',
  issueDate: '2024-06-01',
  ipfsCID: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
});

console.log('Attestation UID:', attestation.uid);
console.log('Transaction:', attestation.txHash);
```

### Verify Attestation

```typescript
const verification = await eas.verifyAttestation(attestationUID);

if (verification.isValid) {
  console.log('Valid credential!');
  console.log('Student:', verification.attestation.data.studentName);
  console.log('IPFS CID:', verification.attestation.data.ipfsCID);
} else {
  console.log('Invalid:', verification.error);
}
```

### Revoke Attestation

```typescript
const revocation = await easWithSigner.revokeAttestation(attestationUID);
console.log('Revoked:', revocation.txHash);
```

## Schema

Degree Credential Schema:
```
string studentName, string degree, string university, string issueDate, string ipfsCID
```

## Networks

- **Base Sepolia** (testnet) - Default
- **Sepolia** (Ethereum testnet)
- **Base Mainnet** (production)
