import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

/**
 * POST /api/documents/[id]/share
 * 
 * Create a shareable token with selective field disclosure
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🔗 Creating share token for document ${id}...`);

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

    // Parse request body
    const body = await request.json();
    const { selectedFields, expiryTime } = body;

    if (!selectedFields || typeof selectedFields !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid selectedFields',
        },
        { status: 400 }
      );
    }

    // Verify user owns this document
    const credential = await prisma.credential.findUnique({
      where: { id },
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

    if (credential.createdBy !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - You do not own this document',
        },
        { status: 403 }
      );
    }

    // Calculate expiry date
    let expiresAt: Date | null = null;
    if (expiryTime && expiryTime !== 'never') {
      const now = new Date();
      switch (expiryTime) {
        case '1h':
          expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case '24h':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '7d':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Generate unique token
    const shareToken = randomBytes(32).toString('hex');

    // Create share record
    const sharedCredential = await prisma.sharedCredential.create({
      data: {
        token: shareToken,
        credentialId: id,
        sharedBy: userId,
        selectedFields: JSON.stringify(selectedFields),
        expiresAt,
      },
    });

    console.log(`✅ Share token created: ${shareToken}`);
    
    // Log activity
    try {
      await prisma.activity.create({
        data: {
          userId,
          type: 'share',
          description: `You shared "${credential.studentName}"`,
          documentId: id,
          documentName: credential.studentName,
          metadata: JSON.stringify({ expiresAt, selectedFieldsCount: Object.keys(selectedFields).length }),
        },
      });
    } catch (activityError) {
      console.warn('⚠️ Failed to log activity:', activityError);
    }

    // Generate share link
    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user-verify/${shareToken}`;

    return NextResponse.json(
      {
        success: true,
        token: shareToken,
        shareLink,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Create share token failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create share token',
      },
      { status: 500 }
    );
  }
}
