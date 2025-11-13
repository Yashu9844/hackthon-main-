import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/activities
 * 
 * Fetch user's recent activities
 * - Document uploads
 * - Document shares
 * - Document views
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching user activities...');

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

    // Fetch user's credentials (for uploads)
    const credentials = await prisma.credential.findMany({
      where: {
        createdBy: userId,
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });

    // Fetch all shares of user's credentials
    const shares = await prisma.sharedCredential.findMany({
      where: {
        credential: {
          createdBy: userId,
        },
      },
      include: {
        credential: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch activities from Activity table
    const dbActivities = await prisma.activity.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Transform to frontend format
    const activities = dbActivities.map(activity => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      timestamp: activity.createdAt,
      documentName: activity.documentName || 'Unknown',
      details: activity.metadata ? JSON.parse(activity.metadata) : {},
    }));

    // Take top 6 activities for dashboard
    const recentActivities = activities.slice(0, 6);

    // Calculate stats
    let totalViews = 0;
    let activeShares = 0;
    
    try {
      const shares = await prisma.sharedCredential.findMany({
        where: {
          sharedBy: userId,
        },
      });
      totalViews = shares.reduce((sum, share) => sum + share.viewCount, 0);
      activeShares = shares.filter(s => !s.expiresAt || new Date(s.expiresAt) > new Date()).length;
    } catch (error) {
      console.warn('⚠️ Could not calculate share stats:', error);
    }

    const stats = {
      totalDocuments: credentials.length,
      totalViews,
      activeShares,
      blockchainTransactions: credentials.length, // Each upload = one attestation
    };

    console.log(`✅ Fetched ${recentActivities.length} activities for user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        activities: recentActivities,
        stats,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Fetch activities failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch activities',
      },
      { status: 500 }
    );
  }
}
