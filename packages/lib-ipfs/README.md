# @repo/lib-ipfs

IPFS utilities for uploading and fetching files using Web3.Storage.

## Usage

```typescript
import { createIPFSClient } from '@repo/lib-ipfs';

// Create client
const ipfs = createIPFSClient();

// Upload a file
const result = await ipfs.upload(file);
console.log(result.cid, result.url);

// Upload JSON
const vcResult = await ipfs.upload({ 
  type: 'VerifiableCredential',
  data: {...}
});

// Fetch from IPFS
const fetched = await ipfs.fetch(cid);
console.log(fetched.data);
```

## Setup

Requires Web3.Storage authentication. Run locally:

```bash
npx w3 login your@email.com
```
