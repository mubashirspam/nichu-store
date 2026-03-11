"use client";

import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";

interface UserTracker {
  id: string;
  fileUrl: string | null;
  trackerType: string;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  user: { id: string; email: string; fullName: string | null };
  product: { id: string; name: string };
  cloudAccount: { provider: string; email: string | null };
}

export default function AdminTrackersPage() {
  const [trackers, setTrackers] = useState<UserTracker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/trackers")
      .then((r) => r.json())
      .then(setTrackers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <RefreshCw size={16} className="animate-spin" /> Loading trackers...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Trackers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          All user tracker instances — {trackers.length} total
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Provider</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Last Sync</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {trackers.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-900 dark:text-white">{t.user.fullName || t.user.email}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">{t.user.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{t.product.name}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">{t.trackerType}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.cloudAccount.provider === "google" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"}`}>
                    {t.cloudAccount.provider}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.isActive ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                    {t.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {t.lastSyncedAt ? new Date(t.lastSyncedAt).toLocaleDateString("en-IN") : "Never"}
                </td>
                <td className="px-6 py-3">
                  {t.fileUrl && (
                    <a href={t.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="text-gray-400 hover:text-violet-600 transition-colors">
                      <ExternalLink size={15} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trackers.length === 0 && (
          <div className="text-center py-12 text-gray-400">No user trackers yet.</div>
        )}
      </div>
    </div>
  );
}
