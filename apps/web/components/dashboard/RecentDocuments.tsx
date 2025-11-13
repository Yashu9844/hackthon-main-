import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document } from "@repo/types";
import {
  GraduationCap,
  FileText,
  Briefcase,
  File,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
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

const statusConfig = {
  verified: {
    icon: CheckCircle,
    className: "text-green-600 bg-green-50 dark:bg-green-950",
    label: "Verified",
  },
  pending: {
    icon: Clock,
    className: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
    label: "Pending",
  },
  unverified: {
    icon: XCircle,
    className: "text-gray-600 bg-gray-50 dark:bg-gray-950",
    label: "Unverified",
  },
};

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">All Documents</h2>
        <Link href="/wallet">
          <Button variant="ghost">View All →</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.slice(0, 6).map((doc) => {
          const Icon = documentIcons[doc.type];
          const status = statusConfig[doc.status];
          const StatusIcon = status.icon;

          return (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </div>
                </div>
                <CardTitle className="mt-4 line-clamp-1">{doc.name}</CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(doc.uploadedAt), {
                    addSuffix: true,
                  })}
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
