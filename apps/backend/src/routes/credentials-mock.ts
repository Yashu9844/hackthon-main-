import { Router } from 'express';
import type { IssueCredentialRequest, IssueCredentialResponse, VerifyCredentialRequest, VerifyCredentialResponse } from '../../../../packages/shared/src/types.ts';
import { createDegreeCredential, signCredential, verifyCredential } from '../../../../packages/lib-vc/src/builder.ts';
import { publicKeyFromDID } from '../../../../packages/lib-vc/src/did.ts';
import { PrismaClient } from '../generated/prisma/client.ts';

const prisma = new PrismaClient();
const router = Router();

// Mock storage for testing (replaces IPFS)
const mockIPFSStorage = new Map<string, any>();

// POST /api/credentials/issue (Mock version - no real IPFS/EAS)
router.post('/issue', async (req, res) => {
  try {
    const body: IssueCredentialRequest = req.body;

    // Validate input
    if (!body.studentName || !body.degree || !body.university || !body.graduationDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build VC
    const vc = createDegreeCredential(
      {
        studentName: body.studentName,
        degree: body.degree,
        university: body.university,
        graduationDate: body.graduationDate,
        studentId: body.studentId,
      },
      {
        issuerDID: process.env.ISSUER_DID || 'did:key:zTest',
        issuerName: process.env.ISSUER_NAME || 'Test University Registrar',
      }
    );

    // Sign VC
    const issuerPrivateKeyHex = process.env.ISSUER_PRIVATE_KEY_HEX;
    if (!issuerPrivateKeyHex) {
      return res.status(500).json({ error: 'Missing ISSUER_PRIVATE_KEY_HEX' });
    }

    const issuerPrivateKey = new Uint8Array(Buffer.from(issuerPrivateKeyHex, 'hex'));
    const signedVC = await signCredential(vc, {
      privateKey: issuerPrivateKey,
      issuerDID: process.env.ISSUER_DID || 'did:key:zTest',
    });

    // Verify signature works
    const publicKey = publicKeyFromDID(process.env.ISSUER_DID || 'did:key:zTest');
    const isValidSig = await verifyCredential(signedVC, publicKey);
    
    if (!isValidSig) {
      return res.status(500).json({ error: 'VC signature verification failed' });
    }

    // Mock IPFS upload - generate fake CID
    const mockCID = `bafy${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    mockIPFSStorage.set(mockCID, signedVC);

    // Mock EAS attestation - generate fake UID
    const mockAttestationUID = `0x${Date.now().toString(16)}${Math.random().toString(36).substr(2, 16)}`;
    const mockTxHash = `0x${Math.random().toString(36).substr(2, 64)}`;

    // Save to DB
    const record = await prisma.credential.create({
      data: {
        studentName: body.studentName,
        degree: body.degree,
        university: body.university,
        graduationDate: body.graduationDate,
        studentId: body.studentId || null,
        vcCID: mockCID,
        pdfCID: null,
        attestationUID: mockAttestationUID,
        attestationTxHash: mockTxHash,
        issuerDID: process.env.ISSUER_DID || 'did:key:zTest',
        createdBy: null,
      },
    });

    const response: IssueCredentialResponse = {
      success: true,
      credentialId: record.id,
      vcCID: mockCID,
      pdfCID: undefined,
      attestationUID: mockAttestationUID,
      attestationTxHash: mockTxHash,
      vc: signedVC,
    };

    res.json(response);
  } catch (error) {
    console.error('Issue error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/credentials/verify (Mock version)
router.post('/verify', async (req, res) => {
  try {
    const body: VerifyCredentialRequest = req.body;

    if (!body.cid && !body.attestationUID) {
      return res.status(400).json({ error: 'cid or attestationUID required' });
    }

    let cid = body.cid;
    let attestationUID = body.attestationUID;

    // If attestation UID provided, look up the credential
    if (attestationUID) {
      const credential = await prisma.credential.findUnique({
        where: { attestationUID },
      });

      if (!credential) {
        return res.json({ 
          isValid: false, 
          error: 'Attestation not found' 
        } as VerifyCredentialResponse);
      }

      cid = credential.vcCID;

      // Check if revoked
      if (credential.revokedAt) {
        return res.json({
          isValid: false,
          error: `Credential revoked on ${credential.revokedAt}: ${credential.revocationReason}`,
        } as VerifyCredentialResponse);
      }
    }

    // Fetch from mock storage
    const vcData = mockIPFSStorage.get(cid!);
    
    if (!vcData) {
      // Try to fetch from DB
      const credential = await prisma.credential.findUnique({
        where: { vcCID: cid! },
      });

      if (!credential) {
        return res.json({ 
          isValid: false, 
          error: 'Credential not found' 
        } as VerifyCredentialResponse);
      }

      return res.json({
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
      } as VerifyCredentialResponse);
    }

    // Verify VC signature
    const publicKey = publicKeyFromDID(process.env.ISSUER_DID || 'did:key:zTest');
    const isValid = await verifyCredential(vcData, publicKey);

    const response: VerifyCredentialResponse = {
      isValid,
      vc: vcData,
      attestation: attestationUID
        ? {
            uid: attestationUID,
            attester: process.env.ISSUER_DID || 'did:key:zTest',
            timestamp: Date.now(),
            revoked: false,
          }
        : undefined,
      error: isValid ? undefined : 'Invalid signature',
    };

    res.json(response);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/credentials/list
router.get('/list', async (req, res) => {
  try {
    const credentials = await prisma.credential.findMany({
      orderBy: { issuedAt: 'desc' },
      take: 100,
    });

    res.json({ credentials });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/credentials/revoke
router.post('/revoke', async (req, res) => {
  try {
    const { attestationUID, reason } = req.body;

    if (!attestationUID) {
      return res.status(400).json({ error: 'attestationUID required' });
    }

    const credential = await prisma.credential.update({
      where: { attestationUID },
      data: {
        revokedAt: new Date(),
        revocationReason: reason || 'No reason provided',
      },
    });

    res.json({
      success: true,
      txHash: `0x${Math.random().toString(36).substr(2, 64)}`,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Revoke error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
