"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  CheckCircle,
  Share2,
  Eye,
  Copy,
  QrCode,
  LogOut,
} from "lucide-react";
import { Document, Activity } from "@repo/types";

// Dummy data for development
const dummyDocuments: Document[] = [
  {
    id: "1",
    name: "Bachelor of Technology Degree",
    type: "academic",
    status: "verified",
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    ipfsCid: "QmX7K8F3b9sT2pQ1yH5vN6wR4mJ8eD3cA9gL2xW5uV7nB4",
    issuer: "MIT University",
  },
  {
    id: "2",
    name: "Aadhaar Card",
    type: "government",
    status: "pending",
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    ipfsCid: "QmP9R8S1aT5xC2bD4mE7fN3gH6iJ9kL8wV5uQ1yX7zB3cA",
  },
  {
    id: "3",
    name: "Experience Letter - Tech Corp",
    type: "professional",
    status: "verified",
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    ipfsCid: "QmT2W8X1aY5bC3mD6nE9fP4gQ7iR8jS9kL1uV2xZ3yB4cA",
    issuer: "Tech Corp Inc",
  },
  {
    id: "4",
    name: "PAN Card",
    type: "government",
    status: "verified",
    uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    ipfsCid: "QmV3Y9Z2bA6cD7mE1nF8gP9hQ4iR5jS8kL2uW3xX4yC5dB",
  },
  {
    id: "5",
    name: "Master's Degree Certificate",
    type: "academic",
    status: "verified",
    uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    ipfsCid: "QmW4Z1X3cB7dE8mF2nG9hQ1iS6jT9kL3uV4xY5zC6eD7fA",
    issuer: "Stanford University",
  },
  {
    id: "6",
    name: "Driving License",
    type: "government",
    status: "unverified",
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    ipfsCid: "QmX5A2Y4dC8eF9mG3nH1iQ7jS8kT1lU5vX6yZ7aC8fE9gB",
  },
];

const dummyActivities: Activity[] = [
  {
    id: "1",
    type: "share",
    description:
      'You shared "Bachelor of Technology Degree" with XYZ Corporation',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    documentName: "Bachelor of Technology Degree",
  },
  {
    id: "2",
    type: "view",
    description: '"Aadhaar Card" was viewed by a verifier',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    documentName: "Aadhaar Card",
  },
  {
    id: "3",
    type: "verify",
    description: '"Experience Letter - Tech Corp" was verified successfully',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    documentName: "Experience Letter - Tech Corp",
  },
  {
    id: "4",
    type: "upload",
    description: 'You uploaded "PAN Card"',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    documentName: "PAN Card",
  },
  {
    id: "5",
    type: "share",
    description: 'You shared "Master\'s Degree Certificate" with ABC Ltd',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    documentName: "Master's Degree Certificate",
  },
];

export default function DashboardPage() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyDID = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!authenticated) router.push("/login");

  const stats = {
    totalDocuments: dummyDocuments.length,
    verifiedCredentials: dummyDocuments.filter((d) => d.status === "verified")
      .length,
    activeShares: 5,
    totalViews: 47,
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
                <Button variant="ghost">Dashboard</Button>
                <Button variant="ghost" onClick={() => router.push("/wallet")}>
                  Wallet
                </Button>
                <Button variant="ghost" onClick={() => router.push("/verify")}>
                  Verify
                </Button>
                <Button variant="ghost" onClick={() => router.push("/admin")}>
                  Admin
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back,{" "}
            {user?.email?.address || user?.wallet?.address || "User"}
          </h2>
          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your Decentralized Identity
                  </p>
                  <code className="text-lg font-mono bg-muted px-3 py-2 rounded">
                    {user?.id}
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyDID}>
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <RecentDocuments documents={dummyDocuments} />
        </div>
      </main>
    </div>
  );
}
