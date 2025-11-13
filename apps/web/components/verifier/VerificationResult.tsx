"use client";

interface VerificationResultProps {
  result: any;
}

export function VerificationResult({ result }: VerificationResultProps) {
  if (!result) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Invalid/Error State
  if (!result.isValid || result.error) {
    return (
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 shadow dark:border-red-900/50 dark:bg-red-900/20">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
              Verification Failed
            </h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {result.error || "The credential could not be verified or has been revoked."}
            </p>
            <div className="mt-4">
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>Identifier:</strong> {result.identifier}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>Type:</strong> {result.type === "uid" ? "Attestation UID" : "IPFS CID"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Valid State
  return (
    <div className="rounded-lg border-2 border-green-200 bg-white shadow dark:border-green-900/50 dark:bg-gray-800">
      {/* Success Header */}
      <div className="border-b border-green-200 bg-green-50 px-6 py-4 dark:border-green-900/50 dark:bg-green-900/20">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
              ✓ Credential Verified
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              This credential is authentic and has not been revoked
            </p>
          </div>
        </div>
      </div>

      {/* Credential Details */}
      {result.credential && (
        <div className="p-6">
          <h4 className="mb-4 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
            Credential Information
          </h4>
          
          <div className="space-y-4">
            {/* Student Name */}
            <div className="flex items-start">
              <div className="w-1/3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Student Name
                </p>
              </div>
              <div className="w-2/3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {result.credential.credentialSubject?.studentName || 
                   result.credential.studentName || 
                   "N/A"}
                </p>
              </div>
            </div>

            {/* Degree */}
            <div className="flex items-start">
              <div className="w-1/3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Degree</p>
              </div>
              <div className="w-2/3">
                <p className="text-sm text-gray-900 dark:text-white">
                  {result.credential.credentialSubject?.degree || 
                   result.credential.degree || 
                   "N/A"}
                </p>
              </div>
            </div>

            {/* University */}
            <div className="flex items-start">
              <div className="w-1/3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  University
                </p>
              </div>
              <div className="w-2/3">
                <p className="text-sm text-gray-900 dark:text-white">
                  {result.credential.credentialSubject?.university || 
                   result.credential.university || 
                   "N/A"}
                </p>
              </div>
            </div>

            {/* Graduation Date */}
            <div className="flex items-start">
              <div className="w-1/3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Graduation Date
                </p>
              </div>
              <div className="w-2/3">
                <p className="text-sm text-gray-900 dark:text-white">
                  {result.credential.credentialSubject?.graduationDate || 
                   result.credential.graduationDate || 
                   "N/A"}
                </p>
              </div>
            </div>

            {/* Student ID */}
            {(result.credential.credentialSubject?.studentId || result.credential.studentId) && (
              <div className="flex items-start">
                <div className="w-1/3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Student ID
                  </p>
                </div>
                <div className="w-2/3">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {result.credential.credentialSubject?.studentId || result.credential.studentId}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blockchain Attestation */}
      {result.attestation && (
        <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
          <h4 className="mb-4 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
            Blockchain Attestation
          </h4>
          
          <div className="space-y-3">
            {/* Attestation UID */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Attestation UID
              </p>
              <p className="mt-1 font-mono text-xs text-gray-900 dark:text-white">
                {result.attestation.uid}
              </p>
            </div>

            {/* Attester */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Attester</p>
              <p className="mt-1 font-mono text-xs text-gray-900 dark:text-white">
                {result.attestation.attester}
              </p>
            </div>

            {/* Timestamp */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Attestation Time
              </p>
              <p className="mt-1 text-xs text-gray-900 dark:text-white">
                {formatDate(new Date(result.attestation.timestamp).toISOString())}
              </p>
            </div>

            {/* Revocation Status */}
            <div className="flex items-center">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Status:</p>
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <svg
                  className="mr-1 h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 8 8"
                >
                  <circle cx="4" cy="4" r="3" />
                </svg>
                {result.attestation.revoked ? "Revoked" : "Active"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const json = JSON.stringify(result.credential, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `credential-${result.identifier.slice(0, 10)}.json`;
              a.click();
            }}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download VC JSON
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
