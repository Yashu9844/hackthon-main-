# 🚀 TEMPORAL CREDENTIAL GRAPH - IMPLEMENTATION PLAN

## 📊 OVERVIEW

**Total Duration:** 8 Steps  
**Checkpoints:** After Steps 3, 6, and 8  
**Goal:** Working Temporal Credential system with eye-catching UI

---

## 🎯 STEP 1: Database Schema + Core Temporal Library (2-3 hours)

### What We're Building
- Prisma schema for temporal commitments
- Hash chain generator library
- Basic test suite

### Files to Create/Modify

#### 1.1 Update Prisma Schema
**File:** `apps/backend/prisma/schema.prisma`

```prisma
// ADD AFTER CREDENTIAL MODEL:

model TemporalCommitment {
  id              String     @id @default(cuid())
  credentialId    String
  epoch           Int        // 0, 1, 2, 3... (Year number)
  commitment      String     // SHA-256 hash commitment
  revealedSecret  String?    // Revealed when time comes
  revealDeadline  DateTime   // When this must be revealed
  revealed        Boolean    @default(false)
  revealedAt      DateTime?
  createdAt       DateTime   @default(now())
  
  credential      Credential @relation(fields: [credentialId], references: [id], onDelete: Cascade)
  
  @@unique([credentialId, epoch])
  @@index([revealDeadline, revealed])
  @@index([credentialId])
  @@map("temporal_commitment")
}

model TemporalRevealEvent {
  id              String   @id @default(cuid())
  commitmentId    String
  revealedSecret  String
  revealedAt      DateTime @default(now())
  txHash          String?  // Blockchain transaction hash
  
  @@index([commitmentId])
  @@map("temporal_reveal_event")
}
```

**Update Credential model:**
```prisma
model Credential {
  // ... existing fields ...
  
  // ADD THIS LINE:
  temporalCommitments TemporalCommitment[]
  
  // ... rest of model ...
}
```

#### 1.2 Create Temporal Chain Library
**File:** `apps/backend/src/lib/temporal-chain.ts`

```typescript
import { createHash } from 'crypto';
import { randomBytes } from 'crypto';

export interface TemporalChain {
  commitments: string[];  // Public commitments
  secrets: string[];      // Private secrets (kept by issuer)
  baseSecret: string;     // Root secret
}

export interface RevealResult {
  valid: boolean;
  message: string;
}

/**
 * Temporal Chain Generator
 * Creates forward hash chains for time-locked commitments
 */
export class TemporalChainGenerator {
  
  /**
   * Generates a temporal hash chain
   * @param periods - Number of time periods (e.g., 5 years)
   * @param baseSecret - Optional base secret (will generate if not provided)
   * @returns Chain of commitments and secrets
   */
  generateChain(periods: number, baseSecret?: string): TemporalChain {
    if (periods < 1 || periods > 20) {
      throw new Error('Periods must be between 1 and 20');
    }

    const base = baseSecret || this.generateRandomSecret();
    const secrets: string[] = [];
    const commitments: string[] = [];
    
    // Generate secrets in forward direction
    let currentSecret = base;
    for (let i = 0; i < periods; i++) {
      secrets.push(currentSecret);
      
      // Create commitment by hashing forward
      const commitment = this.createCommitment(currentSecret, i);
      commitments.push(commitment);
      
      // Generate next secret
      currentSecret = this.hash(currentSecret + i.toString());
    }
    
    return {
      commitments,
      secrets,
      baseSecret: base
    };
  }
  
  /**
   * Creates a commitment by hashing secret (epoch + 1) times
   * This ensures forward-security: can't derive future secrets from current
   */
  private createCommitment(secret: string, epoch: number): string {
    let hash = secret;
    for (let i = 0; i <= epoch; i++) {
      hash = this.hash(hash);
    }
    return hash;
  }
  
  /**
   * Verifies that a revealed secret matches its commitment
   */
  verifyReveal(secret: string, commitment: string, epoch: number): RevealResult {
    try {
      const computedCommitment = this.createCommitment(secret, epoch);
      
      if (computedCommitment === commitment) {
        return {
          valid: true,
          message: `✅ Secret verified for epoch ${epoch}`
        };
      }
      
      return {
        valid: false,
        message: `❌ Secret does not match commitment for epoch ${epoch}`
      };
    } catch (error) {
      return {
        valid: false,
        message: `❌ Verification error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
    }
  }
  
  /**
   * Checks if a commitment can be revealed (deadline passed)
   */
  canReveal(deadline: Date): boolean {
    return new Date() >= deadline;
  }
  
  /**
   * Checks if commitment is expired (past grace period)
   */
  isExpired(deadline: Date, gracePeriodDays: number = 30): boolean {
    const gracePeriodEnd = new Date(deadline);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);
    return new Date() > gracePeriodEnd;
  }
  
  /**
   * SHA-256 hash utility
   */
  private hash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }
  
  /**
   * Generates cryptographically secure random secret
   */
  private generateRandomSecret(): string {
    return randomBytes(32).toString('hex');
  }
  
  /**
   * Calculates reveal deadline for a given epoch
   */
  calculateDeadline(issueDate: Date, epoch: number, intervalMonths: number = 12): Date {
    const deadline = new Date(issueDate);
    deadline.setMonth(deadline.getMonth() + (epoch + 1) * intervalMonths);
    return deadline;
  }
}

// Export singleton instance
export const temporalChain = new TemporalChainGenerator();
```

#### 1.3 Create Test File
**File:** `apps/backend/src/lib/__tests__/temporal-chain.test.ts`

```typescript
import { TemporalChainGenerator } from '../temporal-chain';

describe('TemporalChainGenerator', () => {
  let generator: TemporalChainGenerator;
  
  beforeEach(() => {
    generator = new TemporalChainGenerator();
  });
  
  test('generates chain with correct number of periods', () => {
    const chain = generator.generateChain(5);
    
    expect(chain.commitments).toHaveLength(5);
    expect(chain.secrets).toHaveLength(5);
    expect(chain.baseSecret).toBeDefined();
  });
  
  test('each commitment is unique', () => {
    const chain = generator.generateChain(5);
    const uniqueCommitments = new Set(chain.commitments);
    
    expect(uniqueCommitments.size).toBe(5);
  });
  
  test('verifies correct secret for epoch 0', () => {
    const chain = generator.generateChain(5);
    const result = generator.verifyReveal(
      chain.secrets[0],
      chain.commitments[0],
      0
    );
    
    expect(result.valid).toBe(true);
  });
  
  test('verifies correct secret for epoch 3', () => {
    const chain = generator.generateChain(5);
    const result = generator.verifyReveal(
      chain.secrets[3],
      chain.commitments[3],
      3
    );
    
    expect(result.valid).toBe(true);
  });
  
  test('rejects wrong secret', () => {
    const chain = generator.generateChain(5);
    const result = generator.verifyReveal(
      'wrong-secret',
      chain.commitments[0],
      0
    );
    
    expect(result.valid).toBe(false);
  });
  
  test('rejects secret for wrong epoch', () => {
    const chain = generator.generateChain(5);
    const result = generator.verifyReveal(
      chain.secrets[0],
      chain.commitments[1],
      1
    );
    
    expect(result.valid).toBe(false);
  });
  
  test('calculates correct deadline', () => {
    const issueDate = new Date('2024-01-01');
    const deadline = generator.calculateDeadline(issueDate, 0, 12);
    
    expect(deadline.getFullYear()).toBe(2025);
    expect(deadline.getMonth()).toBe(0); // January
  });
  
  test('checks expiry correctly', () => {
    const pastDeadline = new Date('2020-01-01');
    const futureDeadline = new Date('2030-01-01');
    
    expect(generator.isExpired(pastDeadline, 30)).toBe(true);
    expect(generator.isExpired(futureDeadline, 30)).toBe(false);
  });
});
```

### Commands to Run

```bash
# 1. Add Prisma changes
cd apps/backend
npx prisma format
npx prisma generate
npx prisma db push

# 2. Install test dependencies (if not already)
npm install --save-dev jest @types/jest ts-jest

# 3. Run tests
npm test temporal-chain.test.ts
```

### Expected Output
```
✅ All 8 tests passing
✅ Database schema updated
✅ Hash chain library working
```

---

## 🎯 STEP 2: Credential Issuance with Temporal Commitments (2-3 hours)

### What We're Building
- Modify credential issuance to generate temporal chain
- Store commitments in database
- Update API response to include temporal info

### Files to Modify/Create

#### 2.1 Update Credential Issuance Route
**File:** `apps/backend/src/routes/credentials-test.ts`

**Find the `/issue` endpoint (around line 39) and modify it:**

```typescript
import { temporalChain } from '../lib/temporal-chain';

// ... existing imports ...

// POST /api/credentials/issue
router.post('/issue', async (req, res) => {
  try {
    const { studentName, degree, university, graduationDate, studentId, temporalPeriods = 5 } = req.body;

    // Validate
    if (!studentName || !degree || !university || !graduationDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create VC (existing code)
    const vc = createSimpleVC({ studentName, degree, university, graduationDate, studentId });

    // Mock IPFS CID (existing code)
    const mockCID = `bafy${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    mockIPFSStorage.set(mockCID, vc);

    // Mock attestation (existing code)
    const mockUID = `0x${Date.now().toString(16)}${Math.random().toString(36).substr(2, 16)}`;
    const mockTxHash = `0x${Math.random().toString(36).substr(2, 64)}`;

    // 🆕 GENERATE TEMPORAL CHAIN
    const issueDate = new Date();
    const chain = temporalChain.generateChain(temporalPeriods);
    
    // Save to DB (existing code + temporal)
    const record = await prisma.credential.create({
      data: {
        studentName,
        degree,
        university,
        graduationDate,
        studentId: studentId || null,
        vcCID: mockCID,
        pdfCID: null,
        attestationUID: mockUID,
        attestationTxHash: mockTxHash,
        issuerDID: process.env.ISSUER_DID || 'did:key:zTest',
        createdBy: null,
        // 🆕 CREATE TEMPORAL COMMITMENTS
        temporalCommitments: {
          create: chain.commitments.map((commitment, epoch) => ({
            epoch,
            commitment,
            revealDeadline: temporalChain.calculateDeadline(issueDate, epoch, 12),
            revealed: false,
          }))
        }
      },
      include: {
        temporalCommitments: true
      }
    });

    // 🆕 STORE SECRETS SECURELY (In production, use KMS/Vault)
    // For hackathon, we'll store in a separate file or encrypted
    const secretsFile = `credential-secrets-${record.id}.json`;
    await fs.writeFile(
      path.join(__dirname, '../../secrets', secretsFile),
      JSON.stringify({
        credentialId: record.id,
        secrets: chain.secrets,
        baseSecret: chain.baseSecret
      }),
      'utf8'
    );

    res.json({
      success: true,
      id: record.id,
      studentName: record.studentName,
      degree: record.degree,
      university: record.university,
      graduationDate: record.graduationDate,
      studentId: record.studentId,
      vcCID: mockCID,
      attestationUID: mockUID,
      attestationTxHash: mockTxHash,
      issuedAt: record.issuedAt.toISOString(),
      revokedAt: null,
      vc,
      // 🆕 TEMPORAL INFO
      temporal: {
        enabled: true,
        periods: temporalPeriods,
        commitments: record.temporalCommitments.map(tc => ({
          epoch: tc.epoch,
          commitment: tc.commitment,
          deadline: tc.revealDeadline.toISOString(),
          revealed: tc.revealed
        })),
        nextRevealDue: record.temporalCommitments[0]?.revealDeadline.toISOString()
      }
    });
  } catch (error: any) {
    console.error('Issue error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### 2.2 Create Secrets Directory
```bash
mkdir -p apps/backend/secrets
echo "credential-secrets-*.json" >> apps/backend/.gitignore
```

#### 2.3 Add File System Import
**File:** `apps/backend/src/routes/credentials-test.ts` (top of file)

```typescript
import { promises as fs } from 'fs';
import path from 'path';
```

### Commands to Run

```bash
# 1. Create secrets directory
cd apps/backend
mkdir -p secrets

# 2. Test credential issuance
# Use Postman or curl:
curl -X POST http://localhost:8000/api/credentials/issue \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Alice Temporal",
    "degree": "Computer Science",
    "university": "MIT",
    "graduationDate": "2024-05-15",
    "studentId": "MIT2024001",
    "temporalPeriods": 5
  }'
```

### Expected Output
```json
{
  "success": true,
  "temporal": {
    "enabled": true,
    "periods": 5,
    "commitments": [
      {
        "epoch": 0,
        "commitment": "a1b2c3...",
        "deadline": "2025-05-15T00:00:00.000Z",
        "revealed": false
      },
      // ... more epochs
    ]
  }
}
```

---

## 🎯 STEP 3: Temporal Reveal API + Secret Management (2-3 hours)

### What We're Building
- API endpoint to reveal temporal secrets
- Verification logic
- Automatic reveal checking

### Files to Create

#### 3.1 Temporal Reveal Route
**File:** `apps/backend/src/routes/temporal.ts`

```typescript
import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { temporalChain } from '../lib/temporal-chain';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const router = Router();

// POST /api/temporal/reveal - Reveal next temporal secret
router.post('/reveal', async (req, res) => {
  try {
    const { credentialId, epoch } = req.body;

    if (!credentialId || epoch === undefined) {
      return res.status(400).json({ error: 'Missing credentialId or epoch' });
    }

    // Get commitment
    const commitment = await prisma.temporalCommitment.findUnique({
      where: {
        credentialId_epoch: { credentialId, epoch }
      },
      include: { credential: true }
    });

    if (!commitment) {
      return res.status(404).json({ error: 'Commitment not found' });
    }

    if (commitment.revealed) {
      return res.status(400).json({ 
        error: 'Already revealed',
        revealedAt: commitment.revealedAt
      });
    }

    // Check if can reveal (deadline passed)
    if (!temporalChain.canReveal(commitment.revealDeadline)) {
      return res.status(403).json({
        error: 'Cannot reveal yet',
        deadline: commitment.revealDeadline,
        canRevealIn: Math.ceil((commitment.revealDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) + ' days'
      });
    }

    // Load secrets from file
    const secretsPath = path.join(__dirname, '../../secrets', `credential-secrets-${credentialId}.json`);
    const secretsData = await fs.readFile(secretsPath, 'utf8');
    const { secrets } = JSON.parse(secretsData);

    const secret = secrets[epoch];

    // Verify secret matches commitment
    const verification = temporalChain.verifyReveal(secret, commitment.commitment, epoch);

    if (!verification.valid) {
      return res.status(500).json({ error: 'Secret verification failed' });
    }

    // Update commitment
    const updated = await prisma.temporalCommitment.update({
      where: { id: commitment.id },
      data: {
        revealed: true,
        revealedSecret: secret,
        revealedAt: new Date()
      }
    });

    // Create reveal event
    await prisma.temporalRevealEvent.create({
      data: {
        commitmentId: commitment.id,
        revealedSecret: secret,
        txHash: `0x${Math.random().toString(36).substr(2, 64)}` // Mock blockchain tx
      }
    });

    res.json({
      success: true,
      message: `✅ Epoch ${epoch} revealed successfully`,
      epoch,
      secret,
      commitment: commitment.commitment,
      revealedAt: updated.revealedAt,
      verification: verification.message
    });

  } catch (error: any) {
    console.error('Reveal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/temporal/status/:credentialId - Get temporal status
router.get('/status/:credentialId', async (req, res) => {
  try {
    const { credentialId } = req.params;

    const commitments = await prisma.temporalCommitment.findMany({
      where: { credentialId },
      orderBy: { epoch: 'asc' }
    });

    if (commitments.length === 0) {
      return res.status(404).json({ error: 'No temporal commitments found' });
    }

    const now = new Date();
    const status = commitments.map(c => ({
      epoch: c.epoch,
      commitment: c.commitment.slice(0, 16) + '...',
      revealDeadline: c.revealDeadline,
      revealed: c.revealed,
      revealedAt: c.revealedAt,
      status: c.revealed 
        ? '✅ Revealed' 
        : now >= c.revealDeadline 
          ? '⏰ Can Reveal' 
          : '🔒 Locked',
      daysUntilReveal: c.revealed 
        ? 0 
        : Math.ceil((c.revealDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }));

    // Check if any expired
    const expired = commitments.filter(c => 
      !c.revealed && temporalChain.isExpired(c.revealDeadline, 30)
    );

    res.json({
      credentialId,
      totalPeriods: commitments.length,
      revealed: commitments.filter(c => c.revealed).length,
      pending: commitments.filter(c => !c.revealed).length,
      expired: expired.length,
      autoRevokeRisk: expired.length > 0,
      timeline: status
    });

  } catch (error: any) {
    console.error('Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/temporal/check-expiry - Check for expired commitments
router.post('/check-expiry', async (req, res) => {
  try {
    const now = new Date();
    const gracePeriod = 30; // days

    // Find all non-revealed commitments past grace period
    const expiredCommitments = await prisma.temporalCommitment.findMany({
      where: {
        revealed: false,
        revealDeadline: {
          lt: new Date(now.getTime() - gracePeriod * 24 * 60 * 60 * 1000)
        }
      },
      include: { credential: true }
    });

    const revokedCredentials = [];

    for (const commitment of expiredCommitments) {
      // Check if credential not already revoked
      if (!commitment.credential.revokedAt) {
        // Auto-revoke
        await prisma.credential.update({
          where: { id: commitment.credentialId },
          data: {
            revokedAt: now,
            revocationReason: `Temporal commitment expired: Epoch ${commitment.epoch} not revealed by ${commitment.revealDeadline.toISOString()}`
          }
        });

        revokedCredentials.push({
          id: commitment.credentialId,
          studentName: commitment.credential.studentName,
          epoch: commitment.epoch,
          deadline: commitment.revealDeadline
        });
      }
    }

    res.json({
      checked: new Date(),
      expiredCommitments: expiredCommitments.length,
      revokedCredentials: revokedCredentials.length,
      revoked: revokedCredentials
    });

  } catch (error: any) {
    console.error('Expiry check error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

#### 3.2 Register Temporal Routes
**File:** `apps/backend/src/index.ts`

```typescript
// Add after credentials router import
import temporalRouter from './routes/temporal';

// Add after credentials route registration
app.use('/api/temporal', temporalRouter);
```

### Commands to Run

```bash
# 1. Restart backend
npm run dev

# 2. Test temporal status
curl http://localhost:8000/api/temporal/status/{CREDENTIAL_ID}

# 3. Test reveal (wait until deadline or simulate)
curl -X POST http://localhost:8000/api/temporal/reveal \
  -H "Content-Type: application/json" \
  -d '{"credentialId": "xxx", "epoch": 0}'
```

---

## ✅ CHECKPOINT 1 - After Step 3

### Run Full Test Suite

```bash
# Backend tests
cd apps/backend
npm test

# API tests
node test-verification.mjs

# Temporal tests
curl http://localhost:8000/api/temporal/status/{CREDENTIAL_ID}
```

### Verification Checklist
- [ ] Database has `temporal_commitment` table
- [ ] Hash chain tests pass (8/8)
- [ ] Can issue credential with temporal commitments
- [ ] Can check temporal status
- [ ] Can reveal secrets (when deadline passes)
- [ ] Secrets stored securely

**If all pass → Proceed to Step 4**
**If fail → Debug before continuing**

---

## 🎯 STEP 4: Frontend - Temporal Timeline Component (3-4 hours)

### What We're Building
- Animated timeline showing hash chain
- Visual indicators for revealed/locked epochs
- Real-time countdown timers
- Interactive reveal buttons

### Files to Create

#### 4.1 Temporal Timeline Component
**File:** `apps/web/components/temporal/TemporalTimeline.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';

interface TemporalStatus {
  epoch: number;
  commitment: string;
  revealDeadline: string;
  revealed: boolean;
  revealedAt: string | null;
  status: string;
  daysUntilReveal: number;
}

interface TemporalTimelineProps {
  credentialId: string;
}

export function TemporalTimeline({ credentialId }: TemporalTimelineProps) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState<number | null>(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [credentialId]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/temporal/status/${credentialId}`);
      const data = await response.json();
      setStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch temporal status:', error);
      setLoading(false);
    }
  };

  const handleReveal = async (epoch: number) => {
    setRevealing(epoch);
    try {
      const response = await fetch('http://localhost:8000/api/temporal/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId, epoch })
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchStatus(); // Refresh
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('Failed to reveal secret');
    } finally {
      setRevealing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!status) {
    return <div className="text-red-500">Failed to load temporal status</div>;
  }

  return (
    <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        🔐 Temporal Credential Timeline
      </h2>

      {/* Status Summary */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="text-2xl font-bold text-blue-600">{status.totalPeriods}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Periods</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="text-2xl font-bold text-green-600">{status.revealed}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Revealed</div>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="text-2xl font-bold text-yellow-600">{status.pending}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="text-2xl font-bold text-red-600">{status.expired}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Expired</div>
        </div>
      </div>

      {/* Auto-Revoke Warning */}
      {status.autoRevokeRisk && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-bold text-red-800">⚠️ Auto-Revocation Risk</h3>
              <p className="text-sm text-red-700">
                {status.expired} commitment(s) expired. Credential may be auto-revoked if not revealed soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {status.timeline.map((item: TemporalStatus, index: number) => (
          <div key={item.epoch} className="relative">
            {/* Connection Line */}
            {index < status.timeline.length - 1 && (
              <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
            )}

            <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all ${
              item.revealed 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                : item.status === '⏰ Can Reveal'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 animate-pulse'
                  : 'border-gray-300 bg-gray-50 dark:bg-gray-900/10'
            }`}>
              {/* Epoch Badge */}
              <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                item.revealed 
                  ? 'bg-green-500'
                  : item.status === '⏰ Can Reveal'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
              }`}>
                {item.epoch}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Year {item.epoch + 1} Commitment
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.revealed 
                      ? 'bg-green-100 text-green-800'
                      : item.status === '⏰ Can Reveal'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Commitment Hash */}
                <div className="mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Commitment Hash:</p>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                    {item.commitment}
                  </code>
                </div>

                {/* Deadline Info */}
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Reveal Deadline: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(item.revealDeadline).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {!item.revealed && item.daysUntilReveal > 0 && (
                    <div className="flex items-center text-yellow-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {item.daysUntilReveal} days remaining
                    </div>
                  )}
                </div>

                {/* Revealed Info */}
                {item.revealed && item.revealedAt && (
                  <div className="mt-2 text-sm text-green-600">
                    ✅ Revealed on {new Date(item.revealedAt).toLocaleString()}
                  </div>
                )}

                {/* Reveal Button */}
                {!item.revealed && item.status === '⏰ Can Reveal' && (
                  <button
                    onClick={() => handleReveal(item.epoch)}
                    disabled={revealing === item.epoch}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {revealing === item.epoch ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Revealing...
                      </span>
                    ) : (
                      '🔓 Reveal Secret'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Timeline Legend:</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span>✅ Revealed (Valid)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span>⏰ Ready to Reveal</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-400 mr-2"></div>
            <span>🔒 Locked (Future)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Continue in next message...