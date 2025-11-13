"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PrivyProvider } from "@privy-io/react-auth";

import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { queryClient } from "@/utils/trpc";
import { baseSepolia } from "viem/chains";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PrivyProvider
          appId="cmhx7ul0601bpjs0cplcpxyr6"
          clientId="client-WY6SXRcUUam8wK1NvSoKeDKWPREsvHAoKPzjdw1DEafRg"
          config={{
            // Create embedded wallets for users who don't have a wallet
            embeddedWallets: {
              ethereum: {
                createOnLogin: "users-without-wallets",
              },
            },
            defaultChain: baseSepolia,
            supportedChains: [baseSepolia],
          }}
        >
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
