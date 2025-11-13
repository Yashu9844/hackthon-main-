"use client";

import { useState } from 'react';
import { TemporalTimeline } from '@/components/temporal/TemporalTimeline';

export default function TemporalDemo() {
  const [credentialId, setCredentialId] = useState('cmhxpi90n0001v96kco1nseiu'); // Default from test
  const [showTimeline, setShowTimeline] = useState(false);

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
                <a href="/admin" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Admin
                </a>
                <a href="/verify" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Verify
                </a>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Temporal Demo
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ⚡ Temporal Credential Demo
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Experience time-locked commitments with cryptographic aging
          </p>
        </div>

        {/* Input Section */}
        {!showTimeline && (
          <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800 max-w-2xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Enter Credential ID
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter a credential ID that has temporal commitments to view its timeline.
            </p>
            <input
              type="text"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mb-4"
              placeholder="Enter credential ID"
            />
            <button
              onClick={() => setShowTimeline(true)}
              disabled={!credentialId}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              View Temporal Timeline
            </button>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Quick Start:</h3>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Use the default credential ID or create a new one via Admin</li>
                <li>Click "⚡ Simulate Time" to make commitments ready for reveal</li>
                <li>Click "🔓 Reveal Secret" to cryptographically prove validity</li>
                <li>Watch the timeline update in real-time!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        {showTimeline && (
          <div>
            <button
              onClick={() => setShowTimeline(false)}
              className="mb-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Input
            </button>
            <TemporalTimeline credentialId={credentialId} />
          </div>
        )}
      </div>
    </div>
  );
}
