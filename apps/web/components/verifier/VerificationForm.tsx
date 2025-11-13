"use client";

import { useState, FormEvent } from "react";

interface VerificationFormProps {
  onVerificationComplete: (result: any) => void;
}

export function VerificationForm({ onVerificationComplete }: VerificationFormProps) {
  const [verificationType, setVerificationType] = useState<"uid" | "cid">("uid");
  const [identifier, setIdentifier] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim()) {
      setError("Please enter an Attestation UID or CID");
      return;
    }

    // Validate format
    if (verificationType === "uid" && !identifier.startsWith("0x")) {
      setError("Attestation UID must start with 0x");
      return;
    }

    if (verificationType === "cid" && !identifier.startsWith("bafy")) {
      setError("IPFS CID must start with 'bafy'");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/credentials/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [verificationType === "uid" ? "attestationUID" : "cid"]: identifier.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Parse the result
      const result = {
        identifier: identifier.trim(),
        type: verificationType,
        isValid: data.isValid,
        credential: data.vc || null,
        attestation: data.attestation || null,
        error: data.error || null,
        timestamp: new Date().toISOString(),
      };

      onVerificationComplete(result);
      
      // Reset form on success
      if (data.isValid) {
        setIdentifier("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      
      // Still send error result to parent
      onVerificationComplete({
        identifier: identifier.trim(),
        type: verificationType,
        isValid: false,
        error: err instanceof Error ? err.message : "Verification failed",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Verify Credential
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Verification Type Toggle */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Verification Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setVerificationType("uid");
                setError(null);
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                verificationType === "uid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Attestation UID
            </button>
            <button
              type="button"
              onClick={() => {
                setVerificationType("cid");
                setError(null);
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                verificationType === "cid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              IPFS CID
            </button>
          </div>
        </div>

        {/* Input Field */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {verificationType === "uid" ? "Attestation UID" : "IPFS CID"}
          </label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setError(null);
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder={
              verificationType === "uid"
                ? "0x19a7d004..."
                : "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
            }
            disabled={isVerifying}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {verificationType === "uid"
              ? "Enter the unique attestation identifier (starts with 0x)"
              : "Enter the IPFS content identifier (starts with bafy)"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="ml-3 text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isVerifying || !identifier.trim()}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isVerifying ? (
            <span className="flex items-center justify-center">
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Verifying...
            </span>
          ) : (
            "Verify Credential"
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex">
          <svg
            className="h-5 w-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
              How to verify
            </h3>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              Enter either the Attestation UID or IPFS CID from the credential you want to
              verify. The system will check its authenticity and revocation status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
