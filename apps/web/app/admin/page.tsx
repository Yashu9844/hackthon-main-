"use client";

import { useState } from "react";
import { IssueCredentialForm } from "@/components/admin/IssueCredentialForm";
import { CredentialsList } from "@/components/admin/CredentialsList";
import { AdminStats } from "@/components/admin/AdminStats";
import { TemporalTimeline } from "@/components/temporal/TemporalTimeline";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"issue" | "manage" | "temporal">("issue");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);

  const handleCredentialIssued = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab("manage");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">PixelGenesis</h1>
              <div className="hidden md:flex gap-4">
                <a href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Dashboard
                </a>
                <a href="/wallet" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Wallet
                </a>
                <a href="/verify" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Verify
                </a>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Admin
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Login
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Issue and manage university degree credentials
          </p>
        </div>

        {/* Statistics */}
        <AdminStats key={refreshKey} />

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("issue")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "issue"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              Issue Credential
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "manage"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              Manage Credentials
            </button>
            <button
              onClick={() => setActiveTab("temporal")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "temporal"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              ⚡ Temporal Timeline
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === "issue" ? (
          <IssueCredentialForm onSuccess={handleCredentialIssued} />
        ) : activeTab === "manage" ? (
          <CredentialsList key={refreshKey} onViewTemporal={(id) => {
            setSelectedCredentialId(id);
            setActiveTab("temporal");
          }} />
        ) : (
          <div>
            {!selectedCredentialId ? (
              <div className="rounded-lg bg-white p-8 shadow dark:bg-gray-800 text-center">
                <h3 className="text-lg font-semibold mb-2">No Credential Selected</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a credential from the Manage tab to view its temporal timeline
                </p>
                <button
                  onClick={() => setActiveTab("manage")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Manage
                </button>
              </div>
            ) : (
              <TemporalTimeline credentialId={selectedCredentialId} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
