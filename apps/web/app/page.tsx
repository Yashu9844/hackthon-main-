"use client";

import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";

export default function Home() {
  const { ready, authenticated, user } = usePrivy();
  if (!ready) return <p>Loading...</p>;
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {authenticated && user ? (
        <div>
          <p>Authenticated {user.id}</p>
        </div>
      ) : (
        <div>
          <p>Not Authenticated</p>
        </div>
      )}
    </div>
  );
}
