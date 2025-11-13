import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "@repo/types";
import { Upload, Share2, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons = {
  upload: Upload,
  share: Share2,
  view: Eye,
  verify: CheckCircle,
  revoke: XCircle,
  expire: Clock,
};

const activityColors = {
  upload: "text-blue-600",
  share: "text-purple-600",
  view: "text-gray-600",
  verify: "text-green-600",
  revoke: "text-red-600",
  expire: "text-orange-600",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {activities.slice(0, 10).map((activity, index) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <div
                  key={activity.id}
                  className={`flex items-start gap-4 ${
                    index !== activities.length - 1 ? "pb-4 border-b" : ""
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
