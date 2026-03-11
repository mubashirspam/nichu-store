"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RefreshCw, ExternalLink } from "lucide-react";

interface TrackerInfo {
  fileUrl: string | null;
  trackerType: string;
  product: { name: string };
  cloudAccount: { provider: string };
}

export default function SummaryPage() {
  const { trackerId } = useParams<{ trackerId: string }>();
  const [tracker, setTracker] = useState<TrackerInfo | null>(null);
  const [rows, setRows] = useState<unknown[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/tracker/${trackerId}`).then((r) => r.json()),
      fetch(`/api/tracker/${trackerId}/data?range=Daily Log!A:Z`).then((r) => r.json()),
    ])
      .then(([t, d]) => {
        setTracker(t);
        setRows(d.values || []);
      })
      .finally(() => setLoading(false));
  }, [trackerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <RefreshCw size={20} className="animate-spin mr-2" /> Loading data...
      </div>
    );
  }

  if (!tracker) return <p className="text-center py-20 text-gray-500">Tracker not found.</p>;

  const headers = rows[0] as string[] | undefined;
  const dataRows = rows.slice(1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Summary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
            {tracker.product.name} — {dataRows.length} entries
          </p>
        </div>
        {tracker.fileUrl && (
          <a href={tracker.fileUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700">
            <ExternalLink size={15} />
            Open in {tracker.cloudAccount.provider === "google" ? "Google Sheets" : "Excel"}
          </a>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p>No data yet. Start logging!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-auto">
          <table className="w-full text-sm">
            {headers && (
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {dataRows.slice(-50).reverse().map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  {(row as unknown[]).map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
