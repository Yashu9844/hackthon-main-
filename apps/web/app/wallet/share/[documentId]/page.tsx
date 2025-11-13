"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  LogOut,
  ArrowLeft,
  Share2,
  Copy,
  QrCode,
  CheckCircle,
  Clock as ClockIcon,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Calendar,
  User,
  Building,
  FileText,
  Hash,
  Download
} from "lucide-react";
import Link from "next/link";
import { Document } from "@repo/types";
import QRCode from "qrcode";

// Dummy data
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

type SelectiveFields = {
  documentName: boolean;
  documentType: boolean;
  issuer: boolean;
  uploadDate: boolean;
  holderDID: boolean;
  ipfsCID: boolean;
  fullDocument: boolean;
};

export default function ShareDocumentPage() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const params = useParams();
  const documentId = params.documentId as string;
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiryTime, setExpiryTime] = useState<string>("24h");
  const [shareLink, setShareLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  
  // Selective disclosure fields
  const [selectedFields, setSelectedFields] = useState<SelectiveFields>({
    documentName: true,
    documentType: true,
    issuer: true,
    uploadDate: false,
    holderDID: false,
    ipfsCID: false,
    fullDocument: false,
  });

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

  if (!ready || !authenticated || !user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
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
              The document you're trying to share doesn't exist.
            </p>
            <Link href="/wallet">
              <Button>Back to Wallet</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleField = (field: keyof SelectiveFields) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const selectAll = () => {
    setSelectedFields({
      documentName: true,
      documentType: true,
      issuer: true,
      uploadDate: true,
      holderDID: true,
      ipfsCID: true,
      fullDocument: true,
    });
  };

  const selectNone = () => {
    setSelectedFields({
      documentName: false,
      documentType: false,
      issuer: false,
      uploadDate: false,
      holderDID: false,
      ipfsCID: false,
      fullDocument: false,
    });
  };

  const generateShareLink = async () => {
    try {
      const token = localStorage.getItem('privy:token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          selectedFields,
          expiryTime,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShareLink(result.shareLink);
        
        // Generate QR code
        try {
          const qrDataUrl = await QRCode.toDataURL(result.shareLink, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          setQrCodeUrl(qrDataUrl);
          setShowQR(true);
        } catch (qrError) {
          console.error('Failed to generate QR code:', qrError);
          setShowQR(true); // Still show the link even if QR fails
        }
      } else {
        alert(`Failed to generate share link: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error generating share link:', error);
      alert(`Failed to generate share link: ${error.message}`);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedCount = Object.values(selectedFields).filter(Boolean).length;

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
          <Link href={`/wallet/${document.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Document
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-6 w-6" />
                  Share Document
                </CardTitle>
                <CardDescription>
                  Choose which information to share using selective disclosure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium mb-1">{document.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{document.type} • {document.issuer || 'Self-issued'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Selective Disclosure */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Select Information to Share</CardTitle>
                    <CardDescription>
                      {selectedCount} field{selectedCount !== 1 ? 's' : ''} selected
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={selectNone}>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document Name */}
                <div 
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedFields.documentName 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => toggleField('documentName')}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={selectedFields.documentName}
                      onChange={() => toggleField('documentName')}
                      className="h-4 w-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-semibold cursor-pointer">Document Name</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">{document.name}</p>
                  </div>
                </div>

                {/* Document Type */}
                <div 
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedFields.documentType 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => toggleField('documentType')}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={selectedFields.documentType}
                      onChange={() => toggleField('documentType')}
                      className="h-4 w-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-semibold cursor-pointer">Document Type</Label>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{document.type}</p>
                  </div>
                </div>

                {/* Issuer */}
                {document.issuer && (
                  <div 
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedFields.issuer 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                    onClick={() => toggleField('issuer')}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={selectedFields.issuer}
                        onChange={() => toggleField('issuer')}
                        className="h-4 w-4 rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <Label className="font-semibold cursor-pointer">Issuer</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">{document.issuer}</p>
                    </div>
                  </div>
                )}

                {/* Upload Date */}
                <div 
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedFields.uploadDate 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => toggleField('uploadDate')}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={selectedFields.uploadDate}
                      onChange={() => toggleField('uploadDate')}
                      className="h-4 w-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-semibold cursor-pointer">Upload Date</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(document.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Holder DID */}
                <div 
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedFields.holderDID 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => toggleField('holderDID')}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={selectedFields.holderDID}
                      onChange={() => toggleField('holderDID')}
                      className="h-4 w-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-semibold cursor-pointer">Holder DID</Label>
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                        Sensitive
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono truncate">{user.id}</p>
                  </div>
                </div>

                {/* IPFS CID */}
                <div 
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedFields.ipfsCID 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => toggleField('ipfsCID')}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={selectedFields.ipfsCID}
                      onChange={() => toggleField('ipfsCID')}
                      className="h-4 w-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-semibold cursor-pointer">IPFS CID</Label>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono truncate">{document.ipfsCid}</p>
                  </div>
                </div>

                {/* Full Document */}
                <div 
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedFields.fullDocument 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => toggleField('fullDocument')}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={selectedFields.fullDocument}
                      onChange={() => toggleField('fullDocument')}
                      className="h-4 w-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-semibold cursor-pointer">Full Document Access</Label>
                      <span className="text-xs bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 px-2 py-0.5 rounded">
                        High Risk
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Allow recipient to download the complete document
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Share Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="expiry">Link Expires In</Label>
                  <select
                    id="expiry"
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="1h">1 Hour</option>
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <Button 
                  onClick={generateShareLink} 
                  className="w-full" 
                  size="lg"
                  disabled={selectedCount === 0}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Generate Share Link
                </Button>
              </CardContent>
            </Card>

            {/* Generated Link */}
            {shareLink && (
              <Card>
                <CardHeader>
                  <CardTitle>Share Link Generated</CardTitle>
                  <CardDescription>
                    {selectedCount} field{selectedCount !== 1 ? 's' : ''} will be shared
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Shareable Link</Label>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm"
                      />
                      <Button variant="outline" size="sm" onClick={copyLink}>
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {showQR && qrCodeUrl && (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg inline-block border-2">
                        <img 
                          src={qrCodeUrl} 
                          alt="QR Code" 
                          className="h-64 w-64"
                        />
                      </div>
                      <a 
                        href={qrCodeUrl} 
                        download="share-qr-code.png"
                      >
                        <Button variant="outline" className="w-full mt-3" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download QR Code
                        </Button>
                      </a>
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Expires: {expiryTime === 'never' ? 'Never' : expiryTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedFields.fullDocument ? (
                        <Eye className="h-4 w-4 text-red-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-green-600" />
                      )}
                      <span>
                        {selectedFields.fullDocument 
                          ? 'Full document access granted' 
                          : 'Only metadata shared'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Privacy Notice</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>🔒 Share links are encrypted and can be revoked anytime</p>
                <p>👁️ You'll be notified when someone views your document</p>
                <p>⏰ Links automatically expire based on your settings</p>
                <p>🔐 Recipients cannot reshare without your permission</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
