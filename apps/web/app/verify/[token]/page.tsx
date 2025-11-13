"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Calendar,
  User,
  Building,
  Hash,
  Eye,
  Download,
  Shield
} from "lucide-react";
import Link from "next/link";

export default function VerifyTokenPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/verify/${token}`);
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify credential');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verifying Credential...</h2>
            <p className="text-muted-foreground">
              Please wait while we verify the shared document
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/user-verify">
              <Button>Try Again</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { document, verifiableCredential, sharedBy, sharedAt, expiresAt, viewCount } = result;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <nav className="border-b bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-xl font-bold cursor-pointer">PixelGenesis</h1>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Banner */}
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                Credential Verified ✓
              </h2>
              <p className="text-green-700 dark:text-green-300">
                This credential has been cryptographically verified and is authentic.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Viewed {viewCount} times</span>
                </div>
                {expiresAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Expires {new Date(expiresAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shared Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Shared Credential Information</CardTitle>
            <CardDescription>
              Only selected fields are visible as per the owner's disclosure settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {document.name && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  <span>Document Name</span>
                </div>
                <p className="font-medium">{document.name}</p>
              </div>
            )}

            {document.type && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  <span>Document Type</span>
                </div>
                <p className="font-medium capitalize">{document.type}</p>
              </div>
            )}

            {document.issuer && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Building className="h-4 w-4" />
                  <span>Issued By</span>
                </div>
                <p className="font-medium">{document.issuer}</p>
              </div>
            )}

            {document.graduationDate && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Issue Date</span>
                </div>
                <p className="font-medium">{new Date(document.graduationDate).toLocaleDateString()}</p>
              </div>
            )}

            {document.holderDID && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span>Holder DID</span>
                </div>
                <p className="font-mono text-sm bg-muted p-2 rounded break-all">{document.holderDID}</p>
              </div>
            )}

            {document.vcCID && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Hash className="h-4 w-4" />
                  <span>IPFS CID</span>
                </div>
                <p className="font-mono text-sm bg-muted p-2 rounded break-all">{document.vcCID}</p>
              </div>
            )}

            {document.attestationUID && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Shield className="h-4 w-4" />
                  <span>Blockchain Attestation</span>
                </div>
                <p className="font-mono text-xs bg-muted p-2 rounded break-all">{document.attestationUID}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full Document Access */}
        {document.pdfCID && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <CardDescription>Full document access granted by owner</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg overflow-hidden border">
                <img 
                  src={`https://gateway.pinata.cloud/ipfs/${document.pdfCID}`}
                  alt="Document"
                  className="w-full h-auto"
                />
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${document.pdfCID}`, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                View Full Document
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Verifiable Credential */}
        {verifiableCredential && (
          <Card>
            <CardHeader>
              <CardTitle>Verifiable Credential (VC)</CardTitle>
              <CardDescription>W3C Standard JSON-LD Format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-auto max-h-96">
                <pre>{JSON.stringify(verifiableCredential, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Shared by: <span className="font-mono">{sharedBy}</span></p>
          <p className="mt-1">Shared on: {new Date(sharedAt).toLocaleString()}</p>
        </div>
      </main>
    </div>
  );
}
