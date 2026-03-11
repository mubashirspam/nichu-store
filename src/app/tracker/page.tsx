"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, RefreshCw, Clock } from "lucide-react";

interface Tracker {
  id: string;
  fileUrl: string | null;
  trackerType: string;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  product: { id: string; name: string; shortName: string };
  cloudAccount: { id: string; provider: string; email: string | null };
}

const TRACKER_ICONS: Record<string, string> = {
  habit: "🎯",
  workout: "💪",
  financial: "💰",
  nutrition: "🥗",
};

export default function TrackerDashboard() {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tracker")
      .then((r) => r.json())
      .then(setTrackers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <RefreshCw size={20} className="animate-spin mr-2" /> Loading trackers...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Trackers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your synced Google Sheets & Excel trackers
          </p>
        </div>
        <Link
          href="/tracker/setup"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Connect Tracker
        </Link>
      </div>

      {trackers.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-4xl mb-3">📊</p>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No trackers yet
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Connect your Google Drive or OneDrive to start tracking
          </p>
          <Link
            href="/tracker/setup"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> Set Up Tracker
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trackers.map((tracker) => (
            <div
              key={tracker.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {TRACKER_ICONS[tracker.trackerType] || "📋"}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {tracker.product.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {tracker.trackerType} •{" "}
                      {tracker.cloudAccount.provider === "google" ? "Google Sheets" : "Excel Online"}
                    </p>
                  </div>
                </div>
                {tracker.fileUrl && (
                  <a
                    href={tracker.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-violet-600 transition-colors"
                    title="Open in browser"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>

              {tracker.lastSyncedAt && (
                <p className="text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1 mb-4">
                  <Clock size={12} />
                  Last synced {new Date(tracker.lastSyncedAt).toLocaleString("en-IN")}
                </p>
              )}

              <div className="flex gap-2">
                <Link
                  href={`/tracker/${tracker.id}/log`}
                  className="flex-1 text-center bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Log Today
                </Link>
                <Link
                  href={`/tracker/${tracker.id}/summary`}
                  className="flex-1 text-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Summary
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
