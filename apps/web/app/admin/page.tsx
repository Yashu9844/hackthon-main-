"use client";

import { useState } from "react";
import { IssueCredentialForm } from "@/components/admin/IssueCredentialForm";
import { CredentialsList } from "@/components/admin/CredentialsList";
import { AdminStats } from "@/components/admin/AdminStats";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"issue" | "manage">("issue");
  const [refreshKey, setRefreshKey] = useState(0);

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
          </nav>
        </div>

        {/* Content */}
        {activeTab === "issue" ? (
          <IssueCredentialForm onSuccess={handleCredentialIssued} />
        ) : (
          <CredentialsList key={refreshKey} />
        )}
      </div>
    </div>
  );
}
