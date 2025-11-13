import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/documents/[id]
 * 
 * Fetch a single document by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📥 Fetching document ${id}...`);

    // Get user ID (with auth fallback)
    let userId = 'cmhxbybma00v2l50dthbhc152'; // Default user for testing

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const privy = new PrivyClient(
        process.env.PRIVY_APP_ID || '',
        process.env.PRIVY_APP_SECRET || ''
      );

      try {
        const userClaims = await privy.verifyAuthToken(token);
        userId = userClaims.userId;
        console.log('✅ User authenticated:', userId);
      } catch (error) {
        console.warn('⚠️ Auth verification failed, using default user');
      }
    }

    // Fetch document from database
    const credential = await prisma.credential.findUnique({
      where: {
        id,
      },
    });

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          error: 'Document not found',
        },
        { status: 404 }
      );
    }

    // Check if user owns this document
    if (credential.createdBy !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - You do not own this document',
        },
        { status: 403 }
      );
    }

    console.log(`✅ Found document ${id}`);

    // Transform to frontend Document format with full details
    const document = {
      id: credential.id,
      name: credential.studentName,
      type: credential.degree,
      status: credential.attestationUID && !credential.attestationUID.startsWith('0x') ? 'verified' : 'pending',
      uploadedAt: credential.issuedAt,
      ipfsCid: credential.vcCID,
      issuer: credential.university,
      // Additional details
      pdfCid: credential.pdfCID || '',
      attestationUID: credential.attestationUID,
      attestationTxHash: credential.attestationTxHash,
      graduationDate: credential.graduationDate,
      issuerDID: credential.issuerDID,
      studentId: credential.studentId,
      isRevoked: !!credential.revokedAt,
      revokedAt: credential.revokedAt,
      revocationReason: credential.revocationReason,
    };

    return NextResponse.json(
      {
        success: true,
        document,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Fetch document failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch document',
      },
      { status: 500 }
    );
  }
}
