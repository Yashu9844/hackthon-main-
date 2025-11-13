"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready) {
      if (authenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [ready, authenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
