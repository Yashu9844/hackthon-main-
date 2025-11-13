"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { ready, login, authenticated, logout } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
    }
  }, [ready, authenticated, router]);

  if (!ready) return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">PixelGenesis</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Decentralized Identity & Credential Vault
          </p>
        </div>
        <div className="bg-card p-8 rounded-lg shadow-lg border">
          <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to access your decentralized identity wallet and manage your credentials securely.
          </p>
          <Button onClick={login} size="lg" className="w-full">
            Connect Wallet & Login
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Powered by Privy • Secured by Blockchain</p>
        </div>
      </div>
    </div>
  );
}
