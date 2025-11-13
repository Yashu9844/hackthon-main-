import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/documents
 * 
 * Fetch all documents for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📥 Fetching documents...');

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

    // Fetch user's credentials from database
    const credentials = await prisma.credential.findMany({
      where: {
        createdBy: userId,
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });

    console.log(`✅ Found ${credentials.length} documents for user ${userId}`);

    // Transform to frontend Document format
    const documents = credentials.map((cred) => ({
      id: cred.id,
      name: cred.studentName,
      type: cred.degree,
      status: cred.attestationUID && !cred.attestationUID.startsWith('0x') ? 'verified' : 'pending',
      uploadedAt: cred.issuedAt,
      ipfsCid: cred.vcCID,
      issuer: cred.university,
      // Additional details
      pdfCid: cred.pdfCID || '',
      attestationUID: cred.attestationUID,
      attestationTxHash: cred.attestationTxHash,
      graduationDate: cred.graduationDate,
      issuerDID: cred.issuerDID,
    }));

    return NextResponse.json(
      {
        success: true,
        documents,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Fetch documents failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch documents',
      },
      { status: 500 }
    );
  }
}
