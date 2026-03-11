"use client";

import { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface SyncLog {
  id: string;
  action: string;
  data: unknown;
  errorMessage: string | null;
  createdAt: string;
  tracker: { id: string; trackerType: string };
  user: { email: string };
}

const ACTION_COLORS: Record<string, string> = {
  write: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  read: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  clone: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  error: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
};

export default function AdminSyncLogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    fetch("/api/admin/sync-logs")
      .then((r) => r.json())
      .then(setLogs)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  const errors = logs.filter((l) => l.action === "error");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sync Logs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last 200 sync events
            {errors.length > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-red-500">
                <AlertTriangle size={12} /> {errors.length} error{errors.length > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <button onClick={fetchLogs}
          className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Action</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs">{log.user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize text-xs">{log.tracker.trackerType}</td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                  {log.errorMessage || (log.data ? JSON.stringify(log.data) : "—")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">No sync logs yet.</div>
        )}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
            <RefreshCw size={16} className="animate-spin" /> Loading logs...
          </div>
        )}
      </div>
    </div>
  );
}
