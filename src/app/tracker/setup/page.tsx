"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  shortName: string;
}

interface CloudAccount {
  id: string;
  provider: string;
  email: string | null;
}

function SetupContent() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected");
  const error = searchParams.get("error");

  const [products, setProducts] = useState<Product[]>([]);
  const [cloudAccounts, setCloudAccounts] = useState<CloudAccount[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [cloning, setCloning] = useState(false);
  const [cloneResult, setCloneResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/tracker").then((r) => r.json()); // preload
    fetch("/api/admin/products").then((r) => r.json()).then(setProducts).catch(() => {});
    // Fetch user's cloud accounts
    fetch("/api/tracker")
      .then((r) => r.json())
      .then((trackers) => {
        // Extract unique cloud accounts from existing trackers
        const accounts = new Map<string, CloudAccount>();
        trackers.forEach((t: { cloudAccount: CloudAccount }) =>
          accounts.set(t.cloudAccount.id, t.cloudAccount)
        );
        setCloudAccounts(Array.from(accounts.values()));
      })
      .catch(() => {});
  }, []);

  const handleClone = async () => {
    if (!selectedProduct || !selectedAccount) return;
    setCloning(true);
    setCloneResult(null);
    try {
      const res = await fetch("/api/tracker/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct, cloudAccountId: selectedAccount }),
      });
      const data = await res.json();
      if (res.ok) {
        setCloneResult({ success: true, message: "Tracker created successfully!" });
      } else {
        setCloneResult({ success: false, message: data.error || "Failed to create tracker" });
      }
    } catch {
      setCloneResult({ success: false, message: "Network error" });
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Set Up Tracker</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Connect your cloud storage to start tracking habits, workouts, finances, or nutrition.
      </p>

      {/* Connection status banners */}
      {connected && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-3 mb-6 text-sm">
          <CheckCircle size={16} />
          {connected === "google" ? "Google Drive" : "OneDrive"} connected successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-6 text-sm">
          <AlertCircle size={16} />
          {error === "oauth_failed" ? "OAuth connection failed. Please try again." : "Something went wrong."}
        </div>
      )}

      {/* Step 1: Connect cloud account */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
          Step 1 — Connect Cloud Storage
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Your tracker data will be saved to your own cloud account.
        </p>
        <div className="flex gap-3">
          <a
            href="/api/cloud/google/auth"
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google Drive
          </a>
          <a
            href="/api/cloud/microsoft/auth"
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
              <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
              <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
              <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
            </svg>
            OneDrive
          </a>
        </div>
      </div>

      {/* Step 2: Clone a template */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
          Step 2 — Create Tracker from Template
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          This clones the master template to your cloud account.
        </p>

        <div className="space-y-3">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select a product/tracker type...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select cloud account...</option>
            {cloudAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.provider === "google" ? "Google" : "Microsoft"} — {a.email}
              </option>
            ))}
          </select>

          <button
            onClick={handleClone}
            disabled={!selectedProduct || !selectedAccount || cloning}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {cloning && <Loader2 size={16} className="animate-spin" />}
            {cloning ? "Creating..." : "Create Tracker"}
          </button>

          {cloneResult && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                cloneResult.success
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
              }`}
            >
              {cloneResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {cloneResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense>
      <SetupContent />
    </Suspense>
  );
}
