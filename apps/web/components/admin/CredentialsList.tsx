"use client";

import { useEffect, useState } from "react";

interface Credential {
  id: string;
  studentName: string;
  degree: string;
  university: string;
  graduationDate: string;
  studentId: string | null;
  vcCID: string;
  attestationUID: string;
  issuedAt: string;
  revokedAt: string | null;
  revocationReason: string | null;
}

interface TemporalStatus {
  total: number;
  revealed: number;
  pending: number;
  expired: number;
  nextDeadline: string | null;
}

interface Props {
  onViewTemporal?: (credentialId: string) => void;
}

export function CredentialsList({ onViewTemporal }: Props = {}) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [temporalStatuses, setTemporalStatuses] = useState<Record<string, TemporalStatus>>({});
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [universityFilter, setUniversityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked">("all");
  const [sortBy, setSortBy] = useState<"issuedAt" | "studentName">("issuedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Pagination
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  
  // Revocation
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);

  useEffect(() => {
    fetchCredentials();
  }, [universityFilter, statusFilter, sortBy, sortOrder, page]);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
        sortBy,
        sortOrder,
      });

      if (universityFilter) {
        params.append("university", universityFilter);
      }

      if (statusFilter !== "all") {
        params.append("revoked", statusFilter === "revoked" ? "true" : "false");
      }

      const response = await fetch(
        `http://localhost:8000/api/credentials/list?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch credentials: ${response.statusText}`);
      }

      const data = await response.json();
      setCredentials(data);
      setHasMore(data.length === limit);
      
      // Fetch temporal status for each credential
      const statusPromises = data.map(async (cred: Credential) => {
        try {
          const statusRes = await fetch(`http://localhost:8000/api/temporal/status/${cred.id}`);
          if (statusRes.ok) {
            const status = await statusRes.json();
            return { id: cred.id, status };
          }
        } catch (err) {
          // Ignore temporal status errors
        }
        return null;
      });
      
      const statuses = await Promise.all(statusPromises);
      const statusMap: Record<string, TemporalStatus> = {};
      statuses.forEach((s) => {
        if (s) statusMap[s.id] = s.status;
      });
      setTemporalStatuses(statusMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!selectedCredential || !revokeReason.trim()) return;

    try {
      setRevokingId(selectedCredential.id);
      const response = await fetch("http://localhost:8000/api/credentials/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attestationUID: selectedCredential.attestationUID,
          reason: revokeReason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke credential");
      }

      // Refresh list
      await fetchCredentials();
      setShowRevokeModal(false);
      setRevokeReason("");
      setSelectedCredential(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke credential");
    } finally {
      setRevokingId(null);
    }
  };

  const openRevokeModal = (credential: Credential) => {
    setSelectedCredential(credential);
    setShowRevokeModal(true);
  };

  const filteredCredentials = credentials.filter((cred) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      cred.studentName.toLowerCase().includes(term) ||
      cred.degree.toLowerCase().includes(term) ||
      cred.university.toLowerCase().includes(term) ||
      cred.attestationUID.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Manage Credentials
      </h2>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Search */}
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search by name, degree, university, or UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "all" | "active" | "revoked");
              setPage(0);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="revoked">Revoked Only</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split("-") as [
                "issuedAt" | "studentName",
                "asc" | "desc"
              ];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              setPage(0);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="issuedAt-desc">Newest First</option>
            <option value="issuedAt-asc">Oldest First</option>
            <option value="studentName-asc">Name A-Z</option>
            <option value="studentName-desc">Name Z-A</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-2 h-3 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      ) : filteredCredentials.length === 0 ? (
        <div className="py-12 text-center">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No credentials found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your filters or issue a new credential.
          </p>
        </div>
      ) : (
        <>
          {/* Credentials List */}
          <div className="space-y-4">
            {filteredCredentials.map((cred) => (
              <div
                key={cred.id}
                className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {cred.studentName}
                      </h3>
                      {cred.revokedAt ? (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Revoked
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {cred.degree}
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {cred.university}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Graduated: {formatDate(cred.graduationDate)}</span>
                      <span>Issued: {formatDate(cred.issuedAt)}</span>
                      {cred.studentId && <span>ID: {cred.studentId}</span>}
                    </div>
                    <div className="mt-2 text-xs">
                      <span className="text-gray-500 dark:text-gray-400">UID: </span>
                      <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {cred.attestationUID}
                      </code>
                    </div>
                    {cred.revokedAt && (
                      <div className="mt-2 rounded-md bg-red-50 p-2 dark:bg-red-900/10">
                        <p className="text-xs text-red-600 dark:text-red-400">
                          <strong>Revoked:</strong> {formatDate(cred.revokedAt)}
                        </p>
                        {cred.revocationReason && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            <strong>Reason:</strong> {cred.revocationReason}
                          </p>
                        )}
                      </div>
                    )}
                    {/* Temporal Status */}
                    {temporalStatuses[cred.id] && (
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {temporalStatuses[cred.id].revealed}/{temporalStatuses[cred.id].total} Revealed
                          </span>
                        </span>
                        {temporalStatuses[cred.id].pending > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {temporalStatuses[cred.id].pending} Pending
                            </span>
                          </span>
                        )}
                        {temporalStatuses[cred.id].expired > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            <span className="text-red-600 dark:text-red-400">
                              {temporalStatuses[cred.id].expired} Expired
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    {onViewTemporal && temporalStatuses[cred.id] && temporalStatuses[cred.id].total > 0 && (
                      <button
                        onClick={() => onViewTemporal(cred.id)}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        ⚡ Timeline
                      </button>
                    )}
                    {!cred.revokedAt && (
                      <button
                        onClick={() => openRevokeModal(cred)}
                        disabled={revokingId === cred.id}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page + 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Revoke Modal */}
      {showRevokeModal && selectedCredential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revoke Credential
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to revoke the credential for{" "}
              <strong>{selectedCredential.studentName}</strong>?
            </p>
            <div className="mt-4">
              <label
                htmlFor="revokeReason"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Reason for revocation <span className="text-red-500">*</span>
              </label>
              <textarea
                id="revokeReason"
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter the reason for revoking this credential..."
              />
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowRevokeModal(false);
                  setRevokeReason("");
                  setSelectedCredential(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                disabled={revokingId !== null}
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={!revokeReason.trim() || revokingId !== null}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {revokingId ? "Revoking..." : "Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
