import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

// Mock data for organizations
const organizations = [
  {
    id: "1",
    name: "Acme Inc.",
    role: "Admin",
    slug: "acme-inc",
  },
  {
    id: "2",
    name: "Tech Corp",
    role: "Member",
    slug: "tech-corp",
  },
];

// Mock data for pending invitations
const pendingInvitations = [
  {
    id: "inv1",
    organization: {
      name: "Startup XYZ",
      id: "3",
    },
  },
];

export default function OrganizationDashboard() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  if (!ready) return <p>Loading...</p>;
  if (!authenticated) router.push("/organization");
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your organizations and view pending requests
          </p>
        </div>
        <Button asChild>
          <Link href="/organization/new">Create Organization</Link>
        </Button>
      </div>

      {pendingInvitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingInvitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardHeader>
                  <CardTitle>{invitation.organization.name}</CardTitle>
                  <CardDescription>
                    You&apos;ve been invited to join this organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/api/invitations/${invitation.id}/accept`}>
                        Accept
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/api/invitations/${invitation.id}/reject`}>
                        Reject
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Organizations</h2>
        {organizations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                You&apos;re not a member of any organizations yet.
              </p>
              <Button asChild>
                <Link href="/organization/new">Create Organization</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <Link href={`/organization/dashboard/${org.slug}`} key={org.id}>
                <Card className="hover:bg-accent transition-colors h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{org.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {org.role.toLowerCase()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {org.role.toLowerCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        View details →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
