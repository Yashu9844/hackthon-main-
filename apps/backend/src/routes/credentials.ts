import { Router } from 'express';
import type { IssueCredentialRequest, IssueCredentialResponse, VerifyCredentialRequest, VerifyCredentialResponse, RevokeCredentialRequest, RevokeCredentialResponse } from '@repo/shared';
import { createIPFSClient } from '@repo/lib-ipfs';
import { createEASClient } from '@repo/lib-eas';
import { createDegreeCredential, signCredential } from '@repo/lib-vc';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Initialize clients
const ipfs = createIPFSClient();

// Initialize EAS with private key from env
const easPrivateKey = process.env.EAS_PRIVATE_KEY;
if (!easPrivateKey) {
  throw new Error('Missing EAS_PRIVATE_KEY in environment');
}
const eas = createEASClient({ 
  network: 'baseSepolia',
  privateKey: easPrivateKey,
  schemaUID: process.env.EAS_SCHEMA_UID,
});

// POST /api/credentials/issue
router.post('/issue', async (req, res) => {
  try {
    const body: IssueCredentialRequest = req.body;

    // TODO: handle PDF file upload (multipart) in later step

    // Build VC (unsigned)
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

    // Sign VC (using a demo private key for now, will store securely later)
    const issuerPrivateKeyHex = process.env.ISSUER_PRIVATE_KEY_HEX;
    if (!issuerPrivateKeyHex) {
      return res.status(500).json({ error: 'Missing ISSUER_PRIVATE_KEY_HEX' });
    }

    const issuerPrivateKey = new Uint8Array(Buffer.from(issuerPrivateKeyHex, 'hex'));
    const signedVC = await signCredential(vc, {
      privateKey: issuerPrivateKey,
      issuerDID: process.env.ISSUER_DID || 'did:key:zTest',
    });

    // Upload VC JSON to IPFS
    const vcUpload = await ipfs.upload(signedVC, { name: `${vc.id}.json` });

    // Create EAS attestation for VC CID
    const attestation = await eas.createAttestation(
      {
        studentName: body.studentName,
        degree: body.degree,
        university: body.university,
        issueDate: new Date().toISOString(),
        ipfsCID: vcUpload.cid,
      },
      '0x0000000000000000000000000000000000000000'
    );

    // Save to DB
    const record = await prisma.credential.create({
      data: {
        studentName: body.studentName,
        degree: body.degree,
        university: body.university,
        graduationDate: body.graduationDate,
        studentId: body.studentId || null,
        vcCID: vcUpload.cid,
        pdfCID: null,
        attestationUID: attestation.uid,
        attestationTxHash: attestation.txHash,
        issuerDID: process.env.ISSUER_DID || 'did:key:zTest',
        createdBy: null,
      },
    });

    const response: IssueCredentialResponse = {
      success: true,
      credentialId: record.id,
      vcCID: vcUpload.cid,
      pdfCID: undefined,
      attestationUID: attestation.uid,
      attestationTxHash: attestation.txHash,
      vc: signedVC,
    };

    res.json(response);
  } catch (error) {
    console.error('Issue error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/credentials/verify
router.post('/verify', async (req, res) => {
  try {
    const body: VerifyCredentialRequest = req.body;

    if (!body.cid && !body.attestationUID) {
      return res.status(400).json({ error: 'cid or attestationUID required' });
    }

    let cid = body.cid;

    if (body.attestationUID) {
      const att = await eas.verifyAttestation(body.attestationUID);
      if (!att.isValid) {
        return res.json({ isValid: false, error: att.error } as VerifyCredentialResponse);
      }
      cid = att.attestation!.data.ipfsCID;
    }

    // Fetch VC from IPFS
    const vcData = await ipfs.fetch<any>(cid!);

    // Verify VC signature (optional here — we’ll enhance later)
    // For now, just return data and attestation if available

    const response: VerifyCredentialResponse = {
      isValid: true,
      vc: vcData.data,
      attestation: body.attestationUID
        ? {
            uid: body.attestationUID,
            attester: '',
            timestamp: Date.now(),
            revoked: false,
          }
        : undefined,
    };

    res.json(response);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/credentials/revoke (stub)
router.post('/revoke', async (req, res) => {
  try {
    const body: RevokeCredentialRequest = req.body;

    // Placeholder: we’ll implement real revocation in steps 7-8
    const response: RevokeCredentialResponse = {
      success: true,
      txHash: '0x0',
      timestamp: Date.now(),
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
