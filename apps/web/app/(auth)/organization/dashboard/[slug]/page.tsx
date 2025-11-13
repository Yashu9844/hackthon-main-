import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { format } from "date-fns";

// Mock data for organization
const organization = {
  id: "1",
  name: "Acme Inc.",
  members: [
    {
      role: "ADMIN",
    },
  ],
};

// Mock data for pending members
const pendingMembers = [
  {
    id: "mem1",
    user: {
      name: "John Doe",
      email: "john@example.com",
      image: null,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "mem2",
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
      image: null,
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock data for pending invitations
const pendingInvitations = [
  {
    id: "inv1",
    email: "newuser@example.com",
    role: "MEMBER",
    status: "PENDING",
    createdAt: new Date().toISOString(),
  },
];

export default function OrganizationDashboardPage({
  params,
}: {
  params: { slug: string };
}) {
  const isAdmin = true; // For demo purposes, assuming user is admin

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {organization.name}
        </h1>
        <p className="text-muted-foreground">Organization dashboard</p>
      </div>

      {isAdmin && (
        <div className="space-y-8">
          {/* Pending Member Requests */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Member Requests</h2>
              <Badge variant="outline" className="px-3 py-1">
                {pendingMembers.length} pending
              </Badge>
            </div>

            {pendingMembers.length > 0 ? (
              <div className="space-y-4">
                {pendingMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="space-y-1">
                            <p className="font-medium">{member.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.user.email}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>
                                Requested on{" "}
                                {format(
                                  new Date(member.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <form
                            action={`/api/organizations/${organization.id}/members/${member.id}/approve`}
                            method="POST"
                          >
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="h-8"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </form>
                          <form
                            action={`/api/organizations/${organization.id}/members/${member.id}/reject`}
                            method="POST"
                          >
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="h-8"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No pending member requests
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Pending Invitations */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Pending Invitations</h2>
              <Badge variant="outline" className="px-3 py-1">
                {pendingInvitations.length} pending
              </Badge>
            </div>

            {pendingInvitations.length > 0 ? (
              <div className="space-y-4">
                {pendingInvitations.map((invitation) => (
                  <Card key={invitation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Invited on{" "}
                            {format(
                              new Date(invitation.createdAt),
                              "MMM d, yyyy"
                            )}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <form
                            action={`/api/invitations/${invitation.id}/resend`}
                            method="POST"
                          >
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="h-8"
                            >
                              Resend
                            </Button>
                          </form>
                          <form
                            action={`/api/invitations/${invitation.id}/revoke`}
                            method="POST"
                          >
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="h-8"
                            >
                              Revoke
                            </Button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No pending invitations
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      )}

      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to {organization.name}</CardTitle>
            <CardDescription>
              You don&apos;t have permission to view organization settings.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
