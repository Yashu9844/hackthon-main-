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
    const secretsPath = path.join(process.cwd(), 'secrets', `credential-secrets-${credentialId}.json`);
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

// GET /api/temporal/simulate/:credentialId - Simulate time for demo
router.get('/simulate/:credentialId', async (req, res) => {
  try {
    const { credentialId } = req.params;

    // Update all commitments to be ready for reveal (for demo purposes)
    const commitments = await prisma.temporalCommitment.findMany({
      where: { credentialId, revealed: false }
    });

    const updated = [];
    for (const commitment of commitments) {
      const newDeadline = new Date();
      newDeadline.setMinutes(newDeadline.getMinutes() - 1); // 1 minute ago

      await prisma.temporalCommitment.update({
        where: { id: commitment.id },
        data: { revealDeadline: newDeadline }
      });

      updated.push({
        epoch: commitment.epoch,
        oldDeadline: commitment.revealDeadline,
        newDeadline
      });
    }

    res.json({
      success: true,
      message: '⚡ Time simulation complete - all commitments ready to reveal',
      credentialId,
      updated: updated.length,
      commitments: updated
    });

  } catch (error: any) {
    console.error('Simulate error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
