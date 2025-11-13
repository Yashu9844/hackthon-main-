import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document } from "@repo/types";
import { GraduationCap, FileText, Briefcase, File } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface RecentDocumentsProps {
  documents: Document[];
}

const documentIcons = {
  academic: GraduationCap,
  government: FileText,
  professional: Briefcase,
  other: File,
};

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Recent Documents</h2>
        <Link href="/wallet">
          <Button variant="ghost">View All →</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.slice(0, 6).map((doc) => {
          const Icon = documentIcons[doc.type];

          return (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="mt-4 line-clamp-1">{doc.name}</CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                </CardDescription>
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
    </div>
  );
}
