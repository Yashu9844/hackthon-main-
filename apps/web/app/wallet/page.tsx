"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  FileText, 
  Briefcase, 
  File, 
  Upload,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { Document } from "@repo/types";
import { formatDistanceToNow } from "date-fns";

// Dummy data - same as dashboard
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
  {
    id: "7",
    name: "10th Grade Marksheet",
    type: "academic",
    status: "verified",
    uploadedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    ipfsCid: "QmY6B3Z5cC9fG1mH4nI2jQ8kT3lU6vX7yZ8aC9fG2hI3jB",
  },
  {
    id: "8",
    name: "Passport",
    type: "government",
    status: "verified",
    uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    ipfsCid: "QmZ7C4A6dD1gH2mI5nJ3kQ9lU4mV7wY8zB9aD1gH3iJ4kC",
  },
];

const documentIcons = {
  academic: GraduationCap,
  government: FileText,
  professional: Briefcase,
  other: File,
};

type FilterType = "all" | "academic" | "government" | "professional" | "other";

export default function WalletPage() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/login");
    }
  }, [ready, authenticated, router]);

  // Fetch documents from API
  useEffect(() => {
    if (ready && authenticated) {
      fetchDocuments();
    }
  }, [ready, authenticated]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('privy:token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/documents', {
        headers,
      });

      const result = await response.json();

      if (result.success) {
        setDocuments(result.documents);
      } else {
        console.error('Failed to fetch documents:', result.error);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
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

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const typeMatch = filterType === "all" || doc.type === filterType;
    return typeMatch;
  });

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
                <Button variant="ghost">Wallet</Button>
                <Button variant="ghost" onClick={() => router.push("/user-verify")}>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Document Vault</h2>
            <p className="text-muted-foreground mt-1">
              Manage your credentials securely
            </p>
          </div>
          <Link href="/wallet/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All ({documents.length})
            </Button>
            <Button
              variant={filterType === "academic" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("academic")}
            >
              <GraduationCap className="h-4 w-4 mr-1" />
              Academic ({documents.filter((d) => d.type === "academic").length})
            </Button>
            <Button
              variant={filterType === "government" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("government")}
            >
              <FileText className="h-4 w-4 mr-1" />
              Government ({documents.filter((d) => d.type === "government").length})
            </Button>
            <Button
              variant={filterType === "professional" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("professional")}
            >
              <Briefcase className="h-4 w-4 mr-1" />
              Professional ({documents.filter((d) => d.type === "professional").length})
            </Button>
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((doc) => {
            const Icon = documentIcons[doc.type];

            return (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="mt-4 line-clamp-2">{doc.name}</CardTitle>
                  <CardDescription>
                    {formatDistanceToNow(new Date(doc.uploadedAt), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                  {doc.issuer && (
                    <p className="text-xs text-muted-foreground">
                      Issued by: {doc.issuer}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={`/wallet/${doc.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View
                      </Button>
                    </Link>
                    <Link href={`/wallet/share/${doc.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        Share
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}

        {!loading && filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or upload a new document
            </p>
            <Link href="/wallet/upload">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
