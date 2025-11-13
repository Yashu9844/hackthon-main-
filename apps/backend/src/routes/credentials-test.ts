import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { temporalChain } from '../lib/temporal-chain';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const router = Router();

// Mock storage
const mockIPFSStorage = new Map<string, any>();

// Simple VC creator (inline for testing)
function createSimpleVC(data: any) {
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential', 'DegreeCredential'],
    id: `urn:uuid:${Math.random().toString(36).substr(2, 9)}`,
    issuer: {
      id: process.env.ISSUER_DID || 'did:key:zTest',
      name: process.env.ISSUER_NAME || 'Test University',
    },
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      studentName: data.studentName,
      degree: data.degree,
      university: data.university,
      graduationDate: data.graduationDate,
      studentId: data.studentId,
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      proofPurpose: 'assertionMethod',
      verificationMethod: `${process.env.ISSUER_DID}#key-1`,
      proofValue: 'mock-signature-for-testing',
    },
  };
}

// POST /api/credentials/issue
router.post('/issue', async (req, res) => {
  try {
    const { studentName, degree, university, graduationDate, studentId, temporalPeriods = 5 } = req.body;

    // Validate
    if (!studentName || !degree || !university || !graduationDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create VC
    const vc = createSimpleVC({ studentName, degree, university, graduationDate, studentId });

    // Mock IPFS CID
    const mockCID = `bafy${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    mockIPFSStorage.set(mockCID, vc);

    // Mock attestation
    const mockUID = `0x${Date.now().toString(16)}${Math.random().toString(36).substr(2, 16)}`;
    const mockTxHash = `0x${Math.random().toString(36).substr(2, 64)}`;

    // 🆕 GENERATE TEMPORAL CHAIN
    const issueDate = new Date();
    const chain = temporalChain.generateChain(temporalPeriods);

    // Save to DB with temporal commitments
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

    // 🆕 STORE SECRETS SECURELY
    const secretsFile = `credential-secrets-${record.id}.json`;
    const secretsDir = path.join(process.cwd(), 'secrets');
    await fs.writeFile(
      path.join(secretsDir, secretsFile),
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

// POST /api/credentials/verify
router.post('/verify', async (req, res) => {
  try {
    const { cid, attestationUID } = req.body;

    if (!cid && !attestationUID) {
      return res.status(400).json({ error: 'cid or attestationUID required' });
    }

    let targetCID = cid;

    // Lookup by attestation UID
    if (attestationUID) {
      const credential = await prisma.credential.findUnique({
        where: { attestationUID },
      });

      if (!credential) {
        return res.json({ isValid: false, error: 'Attestation not found' });
      }

      if (credential.revokedAt) {
        return res.json({
          isValid: false,
          error: `Credential revoked on ${credential.revokedAt}: ${credential.revocationReason}`,
        });
      }

      targetCID = credential.vcCID;
    }

    // Fetch from mock storage or DB
    const vcData = mockIPFSStorage.get(targetCID);
    
    if (vcData) {
      return res.json({
        isValid: true,
        vc: vcData,
        attestation: attestationUID ? {
          uid: attestationUID,
          attester: process.env.ISSUER_DID || 'did:key:zTest',
          timestamp: Date.now(),
          revoked: false,
        } : undefined,
      });
    }

    // Fallback to DB
    const credential = await prisma.credential.findUnique({
      where: { vcCID: targetCID },
    });

    if (!credential) {
      return res.json({ isValid: false, error: 'Credential not found' });
    }

    res.json({
      isValid: !credential.revokedAt,
      vc: {
        id: credential.id,
        studentName: credential.studentName,
        degree: credential.degree,
        university: credential.university,
        graduationDate: credential.graduationDate,
      },
      attestation: {
        uid: credential.attestationUID,
        attester: credential.issuerDID,
        timestamp: credential.issuedAt.getTime(),
        revoked: !!credential.revokedAt,
      },
    });
  } catch (error: any) {
    console.error('Verify error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/credentials/list with filters
router.get('/list', async (req, res) => {
  try {
    const { 
      university, 
      revoked, 
      limit = '100', 
      offset = '0',
      sortBy = 'issuedAt',
      sortOrder = 'desc',
    } = req.query;

    // Build where clause
    const where: any = {};
    
    if (university) {
      where.university = {
        contains: university as string,
        mode: 'insensitive',
      };
    }
    
    if (revoked === 'true') {
      where.revokedAt = { not: null };
    } else if (revoked === 'false') {
      where.revokedAt = null;
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [credentials, total] = await Promise.all([
      prisma.credential.findMany({
        where,
        orderBy,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.credential.count({ where }),
    ]);

    // Return just the credentials array for simpler frontend handling
    res.json(credentials);
  } catch (error: any) {
    console.error('List error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/credentials/revoke
router.post('/revoke', async (req, res) => {
  try {
    const { attestationUID, reason } = req.body;

    if (!attestationUID) {
      return res.status(400).json({ error: 'attestationUID required' });
    }

    // Check if credential exists
    const existing = await prisma.credential.findUnique({
      where: { attestationUID },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    if (existing.revokedAt) {
      return res.status(400).json({ 
        error: 'Credential already revoked',
        revokedAt: existing.revokedAt,
        reason: existing.revocationReason,
      });
    }

    // Revoke the credential
    const updated = await prisma.credential.update({
      where: { attestationUID },
      data: {
        revokedAt: new Date(),
        revocationReason: reason || 'No reason provided',
      },
    });

    res.json({
      message: `Credential revoked successfully for ${updated.studentName}`,
      success: true,
      txHash: `0x${Math.random().toString(36).substr(2, 64)}`,
      timestamp: Date.now(),
      credential: {
        id: updated.id,
        studentName: updated.studentName,
        revokedAt: updated.revokedAt,
        reason: updated.revocationReason,
      },
    });
  } catch (error: any) {
    console.error('Revoke error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/credentials/stats - Get statistics (MUST come before /:id)
router.get('/stats', async (req, res) => {
  try {
    const [total, revoked, active, byUniversity] = await Promise.all([
      prisma.credential.count(),
      prisma.credential.count({ where: { revokedAt: { not: null } } }),
      prisma.credential.count({ where: { revokedAt: null } }),
      prisma.credential.groupBy({
        by: ['university'],
        _count: true,
        orderBy: { _count: { university: 'desc' } },
        take: 10,
      }),
    ]);

    res.json({
      total,
      active,
      revoked,
      revocationRate: total > 0 ? (revoked / total) * 100 : 0,
      topUniversities: byUniversity.map(u => ({
        university: u.university,
        count: u._count,
      })),
    });
  } catch (error: any) {
    console.log('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/credentials/student/:studentName - Get credentials by student name
router.get('/student/:studentName', async (req, res) => {
  try {
    const { studentName } = req.params;

    const credentials = await prisma.credential.findMany({
      where: {
        studentName: {
          contains: studentName,
          mode: 'insensitive',
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    // Return just the credentials array
    res.json(credentials);
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/credentials/:id - Get single credential by ID (MUST come last)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const credential = await prisma.credential.findUnique({
      where: { id },
    });

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    res.json(credential);
  } catch (error: any) {
    console.error('Get credential error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
