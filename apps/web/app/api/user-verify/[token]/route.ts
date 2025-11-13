import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/verify/[token]
 * 
 * Verify and retrieve shared credential with selective field disclosure
 * Public endpoint - no authentication required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    console.log(`🔍 Verifying share token: ${token}...`);

    // Find share token
    const sharedCredential = await prisma.sharedCredential.findUnique({
      where: { token },
      include: {
        credential: true,
      },
    });

    if (!sharedCredential) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired share link',
        },
        { status: 404 }
      );
    }

    // Check if expired
    if (sharedCredential.expiresAt && new Date() > sharedCredential.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Share link has expired',
        },
        { status: 410 }
      );
    }

    // Parse selected fields and get credential first
    const selectedFields = JSON.parse(sharedCredential.selectedFields);
    const credential = sharedCredential.credential;

    // Update view count
    await prisma.sharedCredential.update({
      where: { id: sharedCredential.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    // Log activity for the document owner
    try {
      await prisma.activity.create({
        data: {
          userId: credential.createdBy || sharedCredential.sharedBy,
          type: 'view',
          description: `"${credential.studentName}" was viewed by a verifier`,
          documentId: credential.id,
          documentName: credential.studentName,
          metadata: JSON.stringify({ viewCount: sharedCredential.viewCount + 1 }),
        },
      });
    } catch (activityError) {
      console.warn('⚠️ Failed to log activity:', activityError);
    }

    // Build filtered document data based on selected fields
    const filteredData: any = {
      id: credential.id,
      status: credential.attestationUID && !credential.attestationUID.startsWith('0x') ? 'verified' : 'pending',
    };

    // Map frontend field names to database fields
    if (selectedFields.documentName) {
      filteredData.name = credential.studentName;
    }
    if (selectedFields.documentType) {
      filteredData.type = credential.degree;
    }
    if (selectedFields.issuer) {
      filteredData.issuer = credential.university;
    }
    if (selectedFields.uploadDate) {
      filteredData.uploadedAt = credential.issuedAt;
      filteredData.graduationDate = credential.graduationDate;
    }
    if (selectedFields.holderDID) {
      filteredData.holderDID = `did:privy:${credential.createdBy}`;
    }
    if (selectedFields.ipfsCID) {
      filteredData.vcCID = credential.vcCID;
      filteredData.attestationUID = credential.attestationUID;
      filteredData.attestationTxHash = credential.attestationTxHash;
    }
    if (selectedFields.fullDocument) {
      filteredData.pdfCID = credential.pdfCID;
      filteredData.fullDocumentAccess = true;
    }

    // Fetch VC from IPFS if vcCID is shared
    let verifiableCredential = null;
    if (selectedFields.ipfsCID || selectedFields.fullDocument) {
      try {
        const vcResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${credential.vcCID}`);
        if (vcResponse.ok) {
          verifiableCredential = await vcResponse.json();
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch VC from IPFS:', error);
      }
    }

    console.log(`✅ Share verified, ${Object.keys(filteredData).length} fields disclosed`);

    return NextResponse.json(
      {
        success: true,
        document: filteredData,
        verifiableCredential,
        sharedBy: `did:privy:${sharedCredential.sharedBy}`,
        sharedAt: sharedCredential.createdAt,
        expiresAt: sharedCredential.expiresAt,
        viewCount: sharedCredential.viewCount + 1,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Verify share token failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Verification failed',
      },
      { status: 500 }
    );
  }
}
