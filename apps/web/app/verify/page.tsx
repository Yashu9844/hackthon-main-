"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search,
  Upload,
  Link as LinkIcon,
  QrCode,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

type VerificationMethod = "link" | "cid" | "qr";

export default function VerifyPage() {
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>("link");
  const [inputValue, setInputValue] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: "valid" | "invalid" | "revoked" | null;
    document?: {
      name: string;
      type: string;
      issuer: string;
      issueDate: string;
      holder: string;
      ipfsCid: string;
    };
  }>({ status: null });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      alert("Please enter a value to verify");
      return;
    }

    setVerifying(true);
    setVerificationResult({ status: null });

    // Simulate verification (will be replaced with actual blockchain verification)
    setTimeout(() => {
      // Mock verification result - in real app, this would call backend API
      const mockResult = {
        status: "valid" as const,
        document: {
          name: "Bachelor of Technology Degree",
          type: "Academic Credential",
          issuer: "MIT University",
          issueDate: "2023-05-15",
          holder: "did:privy:cmhxbybma00v2l50dthbhc152",
          ipfsCid: "QmX7K8F3b9sT2pQ1yH5vN6wR4mJ8eD3cA9gL2xW5uV7nB4",
        },
      };

      setVerificationResult(mockResult);
      setVerifying(false);
    }, 2000);
  };

  const resetVerification = () => {
    setVerificationResult({ status: null });
    setInputValue("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <nav className="border-b bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/">
                <h1 className="text-xl font-bold cursor-pointer">PixelGenesis</h1>
              </Link>
              <div className="hidden md:flex gap-4">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Button variant="ghost">Verify</Button>
              </div>
            </div>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {verificationResult.status === null ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Verify Credentials</h1>
              <p className="text-xl text-muted-foreground">
                Check the authenticity of any document or credential
              </p>
            </div>

            {/* Verification Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card
                className={`cursor-pointer transition-all ${
                  verificationMethod === "link"
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-muted-foreground/50"
                }`}
                onClick={() => setVerificationMethod("link")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <LinkIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Share Link</CardTitle>
                  <CardDescription className="text-sm">
                    Paste the shareable link
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  verificationMethod === "cid"
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-muted-foreground/50"
                }`}
                onClick={() => setVerificationMethod("cid")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">IPFS CID</CardTitle>
                  <CardDescription className="text-sm">
                    Enter the content identifier
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  verificationMethod === "qr"
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-muted-foreground/50"
                }`}
                onClick={() => setVerificationMethod("qr")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">QR Code</CardTitle>
                  <CardDescription className="text-sm">
                    Scan or upload QR code
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Verification Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {verificationMethod === "link" && "Enter Share Link"}
                  {verificationMethod === "cid" && "Enter IPFS CID"}
                  {verificationMethod === "qr" && "Upload QR Code"}
                </CardTitle>
                <CardDescription>
                  {verificationMethod === "link" &&
                    "Paste the verification link you received from the credential holder"}
                  {verificationMethod === "cid" &&
                    "Enter the IPFS Content Identifier (CID) of the document"}
                  {verificationMethod === "qr" &&
                    "Upload the QR code image or use your camera to scan"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerify} className="space-y-6">
                  {verificationMethod === "qr" ? (
                    <div>
                      <Label>QR Code Image</Label>
                      <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                        <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">
                          Upload QR Code Image
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          or use camera to scan
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="qr-upload"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setInputValue("QR_CODE_" + e.target.files[0].name);
                            }
                          }}
                        />
                        <Label htmlFor="qr-upload">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              Choose File
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="verifyInput">
                        {verificationMethod === "link" ? "Share Link" : "IPFS CID"}
                      </Label>
                      <Input
                        id="verifyInput"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={
                          verificationMethod === "link"
                            ? "https://pixelgenesis.app/verify/..."
                            : "QmX7K8F3b9sT2pQ1yH5vN6wR4mJ8eD3cA..."
                        }
                        className="mt-2"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={verifying || !inputValue}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Verify Credential
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Blockchain Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    All credentials are anchored on blockchain for immutable verification
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Instant Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Get verification results in seconds through decentralized networks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                    <AlertCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Privacy Protected</h3>
                  <p className="text-sm text-muted-foreground">
                    Only authorized information is revealed based on selective disclosure
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Verification Result */}
            <div className="text-center mb-8">
              <div
                className={`inline-flex items-center justify-center h-20 w-20 rounded-full mb-4 ${
                  verificationResult.status === "valid"
                    ? "bg-green-100 dark:bg-green-950"
                    : verificationResult.status === "revoked"
                    ? "bg-orange-100 dark:bg-orange-950"
                    : "bg-red-100 dark:bg-red-950"
                }`}
              >
                {verificationResult.status === "valid" ? (
                  <CheckCircle className="h-10 w-10 text-green-600" />
                ) : verificationResult.status === "revoked" ? (
                  <AlertCircle className="h-10 w-10 text-orange-600" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {verificationResult.status === "valid" && "Credential Verified ✓"}
                {verificationResult.status === "revoked" && "Credential Revoked"}
                {verificationResult.status === "invalid" && "Verification Failed"}
              </h2>
              <p className="text-muted-foreground">
                {verificationResult.status === "valid" &&
                  "This credential is authentic and has been verified on the blockchain"}
                {verificationResult.status === "revoked" &&
                  "This credential has been revoked by the issuer"}
                {verificationResult.status === "invalid" &&
                  "This credential could not be verified or does not exist"}
              </p>
            </div>

            {verificationResult.document && verificationResult.status === "valid" && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Credential Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Document Name</Label>
                      <p className="font-medium mt-1">
                        {verificationResult.document.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Type</Label>
                      <p className="font-medium mt-1">
                        {verificationResult.document.type}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Issued By</Label>
                      <p className="font-medium mt-1">
                        {verificationResult.document.issuer}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Issue Date</Label>
                      <p className="font-medium mt-1">
                        {new Date(verificationResult.document.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Credential Holder</Label>
                      <p className="font-mono text-sm mt-1 bg-muted p-2 rounded">
                        {verificationResult.document.holder}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">IPFS CID</Label>
                      <p className="font-mono text-sm mt-1 bg-muted p-2 rounded break-all">
                        {verificationResult.document.ipfsCid}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Blockchain verified on Base Sepolia</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Cryptographic signature validated</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Document integrity confirmed via IPFS</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button onClick={resetVerification} variant="outline" className="flex-1">
                Verify Another
              </Button>
              <Link href="/login" className="flex-1">
                <Button className="w-full">
                  Create Your Wallet
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
