"use client";

import { useState, useEffect } from 'react';

interface TemporalStatus {
  epoch: number;
  commitment: string;
  revealDeadline: string;
  revealed: boolean;
  revealedAt: string | null;
  status: string;
  daysUntilReveal: number;
}

interface TemporalTimelineProps {
  credentialId: string;
}

export function TemporalTimeline({ credentialId }: TemporalTimelineProps) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState<number | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [credentialId]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/temporal/status/${credentialId}`);
      const data = await response.json();
      setStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch temporal status:', error);
      setLoading(false);
    }
  };

  const handleReveal = async (epoch: number) => {
    setRevealing(epoch);
    try {
      const response = await fetch('http://localhost:8000/api/temporal/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId, epoch })
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchStatus(); // Refresh
        setToast({ type: 'success', message: data.message });
        setTimeout(() => setToast(null), 4000);
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to reveal secret' });
        setTimeout(() => setToast(null), 4000);
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to reveal secret' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setRevealing(null);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const response = await fetch(`http://localhost:8000/api/temporal/simulate/${credentialId}`);
      const data = await response.json();
      
      if (data.success) {
        await fetchStatus(); // Refresh
        setToast({ type: 'success', message: data.message });
        setTimeout(() => setToast(null), 4000);
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to simulate time' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading temporal timeline...</p>
      </div>
    );
  }

  if (!status) {
    return <div className="text-red-500">Failed to load temporal status</div>;
  }

  return (
    <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg animate-in slide-in-from-top-5 fade-in duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-50 border-l-4 border-green-500 dark:bg-green-900/20' 
            : 'bg-red-50 border-l-4 border-red-500 dark:bg-red-900/20'
        }`}>
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className={`text-sm font-medium ${
              toast.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
            }`}>
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔐 Temporal Credential Timeline
        </h2>
        <button
          onClick={handleSimulate}
          disabled={simulating || status.pending === 0}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {simulating ? '⏳ Simulating...' : '⚡ Simulate Time (Demo)'}
        </button>
      </div>

      {/* Status Summary with animations */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 transition-all hover:scale-105 hover:shadow-lg">
          <div className="text-2xl font-bold text-blue-600">{status.totalPeriods}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Periods</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20 transition-all hover:scale-105 hover:shadow-lg">
          <div className="text-2xl font-bold text-green-600">{status.revealed}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Revealed</div>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20 transition-all hover:scale-105 hover:shadow-lg">
          <div className="text-2xl font-bold text-yellow-600 animate-pulse">{status.pending}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20 transition-all hover:scale-105 hover:shadow-lg">
          <div className="text-2xl font-bold text-red-600">{status.expired}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Expired</div>
        </div>
      </div>

      {/* Auto-Revoke Warning */}
      {status.autoRevokeRisk && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-bold text-red-800">⚠️ Auto-Revocation Risk</h3>
              <p className="text-sm text-red-700">
                {status.expired} commitment(s) expired. Credential may be auto-revoked if not revealed soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {status.timeline.map((item: TemporalStatus, index: number) => (
          <div key={item.epoch} className="relative">
            {/* Connection Line */}
            {index < status.timeline.length - 1 && (
              <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
            )}

            <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md ${
              item.revealed 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                : item.status === '⏰ Can Reveal'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 animate-pulse'
                  : 'border-gray-300 bg-gray-50 dark:bg-gray-900/10'
            }`}>
              {/* Epoch Badge */}
              <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg transform transition-transform hover:scale-110 ${
                item.revealed 
                  ? 'bg-gradient-to-br from-green-400 to-green-600'
                  : item.status === '⏰ Can Reveal'
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 animate-pulse'
                    : 'bg-gradient-to-br from-gray-400 to-gray-600'
              }`}>
                {item.epoch}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Year {item.epoch + 1} Commitment
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.revealed 
                      ? 'bg-green-100 text-green-800'
                      : item.status === '⏰ Can Reveal'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Commitment Hash */}
                <div className="mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Commitment Hash:</p>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                    {item.commitment}
                  </code>
                </div>

                {/* Deadline Info */}
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Reveal Deadline: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(item.revealDeadline).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {!item.revealed && item.daysUntilReveal > 0 && (
                    <div className="flex items-center text-yellow-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {item.daysUntilReveal} days remaining
                    </div>
                  )}
                </div>

                {/* Revealed Info */}
                {item.revealed && item.revealedAt && (
                  <div className="mt-2 text-sm text-green-600">
                    ✅ Revealed on {new Date(item.revealedAt).toLocaleString()}
                  </div>
                )}

                {/* Reveal Button */}
                {!item.revealed && item.status === '⏰ Can Reveal' && (
                  <button
                    onClick={() => handleReveal(item.epoch)}
                    disabled={revealing === item.epoch}
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-md"
                  >
                    {revealing === item.epoch ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Revealing...
                      </span>
                    ) : (
                      '🔓 Reveal Secret'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Timeline Legend:</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span>✅ Revealed (Valid)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span>⏰ Ready to Reveal</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-400 mr-2"></div>
            <span>🔒 Locked (Future)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
