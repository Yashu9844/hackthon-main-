"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import env from "@/utils/env";
import { toast } from "sonner";

type Step = "signin" | "organization";

export default function OrganizationPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("signin");
  const { data: session, isPending } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  useEffect(() => {
    if (session?.user.email) {
      setTimeout(() => {
        setStep("organization" as Step);
      });
    }
  }, [isPending]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google sign-in
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${env.FRONTEND_URL}/organization`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authClient.organization.create({
      name: formData.name,
      slug: formData.slug,
    });
    toast.success("Organization created successfully");

    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {step === "signin" ? "Sign in to continue" : "Create Organization"}
          </CardTitle>
          <CardDescription>
            {step === "signin"
              ? "Sign in with Google to create your organization"
              : "Enter your organization details to get started"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "signin" ? (
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                )}
                Continue with Google
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Organization"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    https://example.com/
                  </span>
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="my-org"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This will be your organization&apos;s URL
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Organization
              </Button>
            </form>
          )}
        </CardContent>

        {step === "organization" && (
          <CardFooter className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => setStep("signin")}
              className="text-muted-foreground"
            >
              Back to sign in
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
