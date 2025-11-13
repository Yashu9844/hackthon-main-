"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut,
  ArrowLeft,
  Share2,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Calendar,
  User,
  Building,
  Hash
} from "lucide-react";
import Link from "next/link";
import { Document } from "@repo/types";
import { formatDistanceToNow } from "date-fns";

// Dummy data - same documents from wallet
const dummyDocuments: Document[] = [
  {
    id: "1",
    name: "Bachelor of Technology Degree",
    type: "academic",
    status: "verified",
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    ipfsCid: "QmX7K8F3b9sT2pQ1yH5vN6wR4mJ8eD3cA9gL2xW5uV7nB4",
    issuer: "MIT University",
  },
  {
    id: "2",
    name: "Aadhaar Card",
    type: "government",
    status: "pending",
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ipfsCid: "QmP9R8S1aT5xC2bD4mE7fN3gH6iJ9kL8wV5uQ1yX7zB3cA",
  },
  {
    id: "3",
    name: "Experience Letter - Tech Corp",
    type: "professional",
    status: "verified",
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    ipfsCid: "QmT2W8X1aY5bC3mD6nE9fP4gQ7iR8jS9kL1uV2xZ3yB4cA",
    issuer: "Tech Corp Inc",
  },
];

const statusConfig = {
  verified: {
    icon: CheckCircle,
    className: "text-green-600 bg-green-50 dark:bg-green-950",
    label: "Verified",
  },
  pending: {
    icon: Clock,
    className: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
    label: "Pending Verification",
  },
  unverified: {
    icon: XCircle,
    className: "text-gray-600 bg-gray-50 dark:bg-gray-950",
    label: "Unverified",
  },
};

export default function DocumentDetailPage() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const params = useParams();
  const documentId = params.documentId as string;
  
  const [copied, setCopied] = useState(false);
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/login");
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (ready && authenticated && documentId) {
      fetchDocument();
    }
  }, [ready, authenticated, documentId]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('privy:token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/documents/${documentId}`, {
        headers,
      });

      const result = await response.json();

      if (result.success) {
        setDocument(result.document);
      } else {
        console.error('Failed to fetch document:', result.error);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!ready || !authenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Document Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The document you're looking for doesn't exist.
            </p>
            <Link href="/wallet">
              <Button>Back to Wallet</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[document.status];
  const StatusIcon = status.icon;

  const copyCID = () => {
    if (document.ipfsCid) {
      navigator.clipboard.writeText(document.ipfsCid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      // TODO: Implement actual delete
      router.push("/wallet");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">PixelGenesis</h1>
              <div className="hidden md:flex gap-4">
                <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => router.push("/wallet")}>
                  Wallet
                </Button>
                <Button variant="ghost" onClick={() => router.push("/user-verify")}>
                  Verify
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/profile")}>
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/wallet">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wallet
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${status.className}`}>
                      <StatusIcon className="h-4 w-4" />
                      {status.label}
                    </div>
                    <CardTitle className="text-3xl mb-2">{document.name}</CardTitle>
                    <CardDescription className="text-base">
                      Uploaded {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Document Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
                <CardDescription>
                  Stored on IPFS: {(document as any).pdfCid || document.ipfsCid}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(document as any).pdfCid ? (
                  <div className="bg-muted rounded-lg overflow-hidden border">
                    <img 
                      src={`https://gateway.pinata.cloud/ipfs/${(document as any).pdfCid}`}
                      alt={document.name}
                      className="w-full h-auto"
                      onError={(e) => {
                        // If image fails to load, show fallback
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'aspect-[3/4] flex items-center justify-center';
                        fallback.innerHTML = `
                          <div class="text-center p-4">
                            <svg class="h-16 w-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-muted-foreground">Unable to preview this document</p>
                            <a href="https://gateway.pinata.cloud/ipfs/${(document as any).pdfCid}" target="_blank" class="text-sm text-primary hover:underline mt-2 inline-block">View on IPFS →</a>
                          </div>
                        `;
                        (e.target as HTMLImageElement).parentElement?.appendChild(fallback);
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No document file attached
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Only VC metadata is available
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Details */}
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <FileText className="h-4 w-4" />
                      <span>Document Type</span>
                    </div>
                    <p className="font-medium capitalize">{document.type}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Upload Date</span>
                    </div>
                    <p className="font-medium">
                      {new Date(document.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {document.issuer && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Building className="h-4 w-4" />
                        <span>Issued By</span>
                      </div>
                      <p className="font-medium">{document.issuer}</p>
                    </div>
                  )}

                  {(document as any).graduationDate && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>Issue/Graduation Date</span>
                      </div>
                      <p className="font-medium">
                        {new Date((document as any).graduationDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {(document as any).attestationUID && (
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Hash className="h-4 w-4" />
                        <span>Attestation UID</span>
                      </div>
                      <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                        {(document as any).attestationUID}
                      </p>
                    </div>
                  )}

                  {(document as any).attestationTxHash && (
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Hash className="h-4 w-4" />
                        <span>Transaction Hash</span>
                      </div>
                      <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                        {(document as any).attestationTxHash}
                      </p>
                    </div>
                  )}

                  <div className="col-span-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <User className="h-4 w-4" />
                      <span>Owner (DID)</span>
                    </div>
                    <p className="font-mono text-sm bg-muted p-2 rounded break-all">
                      {user.id}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Hash className="h-4 w-4" />
                      <span>IPFS CID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm bg-muted p-2 rounded flex-1 break-all">
                        {document.ipfsCid}
                      </p>
                      <Button variant="outline" size="sm" onClick={copyCID}>
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {document.status === "verified" && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Blockchain Verified</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This document has been verified on Base Sepolia testnet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/wallet/share/${document.id}`} className="block">
                  <Button className="w-full justify-start" size="lg">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Document
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                  onClick={() => window.open(`https://ipfs.io/ipfs/${document.ipfsCid}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on IPFS
                </Button>

                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  size="lg"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Document
                </Button>
              </CardContent>
            </Card>

            {/* Verifiable Credential */}
            <Card>
              <CardHeader>
                <CardTitle>Verifiable Credential</CardTitle>
                <CardDescription>JSON-LD Format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-auto max-h-64">
                  <pre>{JSON.stringify({
                    "@context": [
                      "https://www.w3.org/2018/credentials/v1"
                    ],
                    "id": `vc:${document.id}`,
                    "type": ["VerifiableCredential"],
                    "issuer": document.issuer || "Self-Issued",
                    "issuanceDate": new Date(document.uploadedAt).toISOString(),
                    "credentialSubject": {
                      "id": user.id,
                      "documentName": document.name,
                      "documentType": document.type,
                      "ipfsCid": document.ipfsCid
                    },
                    "proof": {
                      "type": "EcdsaSecp256k1Signature2019",
                      "created": new Date(document.uploadedAt).toISOString(),
                      "proofPurpose": "assertionMethod",
                      "verificationMethod": "did:example:issuer#key-1"
                    }
                  }, null, 2)}</pre>
                </div>
                <Button variant="outline" className="w-full mt-3" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy VC JSON
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Times Shared</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Times Viewed</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Accessed</span>
                  <span className="font-semibold text-sm">2 days ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
