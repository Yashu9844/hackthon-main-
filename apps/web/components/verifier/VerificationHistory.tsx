"use client";

interface VerificationHistoryProps {
  history: any[];
  onVerifyAgain: (identifier: string, type: "uid" | "cid") => void;
}

export function VerificationHistory({ history, onVerifyAgain }: VerificationHistoryProps) {
  if (history.length === 0) return null;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Recent Verifications
      </h2>

      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700"
          >
            <div className="flex items-center space-x-4">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {item.isValid ? (
                  <svg
                    className="h-6 w-6 text-green-500"
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
                ) : (
                  <svg
                    className="h-6 w-6 text-red-500"
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
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.studentName}
                </p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.isValid
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}>
                    {item.isValid ? "Valid" : "Invalid"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                  {item.identifier}
                </p>
              </div>
            </div>

            {/* Verify Again Button */}
            <button
              onClick={() => onVerifyAgain(item.identifier, item.type)}
              className="ml-4 flex-shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Verify Again
            </button>
          </div>
        ))}
      </div>

      {history.length >= 10 && (
        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Showing last 10 verifications
        </p>
      )}
    </div>
  );
}
