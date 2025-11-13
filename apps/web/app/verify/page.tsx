"use client";

import { useState } from "react";
import { VerificationForm } from "@/components/verifier/VerificationForm";
import { VerificationResult } from "@/components/verifier/VerificationResult";
import { VerificationHistory } from "@/components/verifier/VerificationHistory";

export default function VerifierDashboard() {
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);

  const handleVerificationComplete = (result: any) => {
    setVerificationResult(result);
    
    // Add to history
    const historyItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      identifier: result.identifier,
      type: result.type,
      isValid: result.isValid,
      studentName: result.credential?.studentName || "Unknown",
    };
    
    setVerificationHistory((prev) => [historyItem, ...prev.slice(0, 9)]);
  };

  const handleVerifyFromHistory = (identifier: string, type: "uid" | "cid") => {
    // Trigger verification from history
    setVerificationResult({ identifier, type, loading: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Credential Verifier
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Verify the authenticity of university degree credentials on the blockchain
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Verification Form */}
          <div className="lg:col-span-1">
            <VerificationForm onVerificationComplete={handleVerificationComplete} />
          </div>

          {/* Right Column - Results and History */}
          <div className="lg:col-span-2">
            {/* Verification Result */}
            {verificationResult && (
              <div className="mb-6">
                <VerificationResult result={verificationResult} />
              </div>
            )}

            {/* Verification History */}
            {verificationHistory.length > 0 && (
              <VerificationHistory
                history={verificationHistory}
                onVerifyAgain={handleVerifyFromHistory}
              />
            )}

            {/* Empty State */}
            {!verificationResult && verificationHistory.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No verifications yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter an Attestation UID or CID to verify a credential
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
