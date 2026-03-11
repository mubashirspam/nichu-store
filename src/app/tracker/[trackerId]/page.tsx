"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Calendar, RefreshCw } from "lucide-react";

interface TrackerDetail {
  id: string;
  fileUrl: string | null;
  trackerType: string;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  product: { id: string; name: string };
  cloudAccount: { id: string; provider: string; email: string | null };
}

export default function TrackerDetailPage() {
  const { trackerId } = useParams<{ trackerId: string }>();
  const [tracker, setTracker] = useState<TrackerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tracker/${trackerId}`)
      .then((r) => r.json())
      .then(setTracker)
      .finally(() => setLoading(false));
  }, [trackerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <RefreshCw size={20} className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (!tracker) {
    return <p className="text-center py-20 text-gray-500">Tracker not found.</p>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {tracker.product.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-0.5">
            {tracker.trackerType} tracker •{" "}
            {tracker.cloudAccount.provider === "google" ? "Google Sheets" : "Excel Online"}
          </p>
        </div>
        {tracker.fileUrl && (
          <a
            href={tracker.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700"
          >
            <ExternalLink size={15} /> Open Sheet
          </a>
        )}
      </div>

      {tracker.lastSyncedAt && (
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-6">
          <Calendar size={12} />
          Last synced {new Date(tracker.lastSyncedAt).toLocaleString("en-IN")}
        </p>
      )}

      <div className="flex gap-3">
        <Link
          href={`/tracker/${trackerId}/log`}
          className="flex-1 text-center bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          Log Today
        </Link>
        <Link
          href={`/tracker/${trackerId}/summary`}
          className="flex-1 text-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold transition-colors"
        >
          View Summary
        </Link>
      </div>
    </div>
  );
}
