"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

export default function LoginPage() {
  const { ready, login, authenticated, logout } = usePrivy();

  if (!ready) return <p>Loading...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {authenticated ? (
        <Button onClick={logout}>Logout</Button>
      ) : (
        <Button onClick={login}>Login</Button>
      )}
    </div>
  );
}
