import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Search, Shield, UserCheck } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Add new credentials to your vault
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/wallet/upload">
            <Button className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload Now
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
            <Search className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Verify Credential</CardTitle>
          <CardDescription>
            Check authenticity of documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/user-verify">
            <Button variant="outline" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Start Verification
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle>Admin Portal</CardTitle>
          <CardDescription>
            Issue & manage credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin">
            <Button variant="outline" className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              Open Admin
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
            <UserCheck className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>View Wallet</CardTitle>
          <CardDescription>
            Manage all your documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/wallet">
            <Button variant="outline" className="w-full">
              <UserCheck className="mr-2 h-4 w-4" />
              Go to Wallet
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
