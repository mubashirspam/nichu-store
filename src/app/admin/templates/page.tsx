"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FileSpreadsheet } from "lucide-react";

interface Template {
  id: string;
  productId: string;
  provider: string;
  fileId: string;
  fileUrl: string | null;
  trackerType: string;
  version: string | null;
  createdAt: string;
  product: { id: string; name: string };
}

interface Product {
  id: string;
  name: string;
}

const TRACKER_TYPES = ["habit", "workout", "financial", "nutrition"];

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    productId: "", provider: "google", fileId: "", fileUrl: "", trackerType: "habit", version: "1.0",
  });

  const fetchAll = () => {
    Promise.all([
      fetch("/api/admin/templates").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
    ])
      .then(([t, p]) => { setTemplates(t); setProducts(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ productId: "", provider: "google", fileId: "", fileUrl: "", trackerType: "habit", version: "1.0" });
    setShowForm(true);
  };

  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({ productId: t.productId, provider: t.provider, fileId: t.fileId, fileUrl: t.fileUrl || "", trackerType: t.trackerType, version: t.version || "1.0" });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      await fetch("/api/admin/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
    } else {
      await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    setShowForm(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/admin/templates?id=${id}`, { method: "DELETE" });
    fetchAll();
  };

  const inputCls = "w-full rounded-lg px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500";
  const labelCls = "text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block";

  if (loading) return <div className="text-gray-500">Loading templates...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Master Templates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure Google Sheets / Excel templates per product
          </p>
        </div>
        <button onClick={openNew}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700 transition-colors">
          <Plus size={16} /> Add Template
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editing ? "Edit Template" : "New Template"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Product</label>
                <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className={inputCls}>
                  <option value="">Select product...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Provider</label>
                  <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className={inputCls}>
                    <option value="google">Google Sheets</option>
                    <option value="microsoft">Excel / OneDrive</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tracker Type</label>
                  <select value={form.trackerType} onChange={(e) => setForm({ ...form, trackerType: e.target.value })} className={inputCls}>
                    {TRACKER_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>File ID (Google Drive ID or OneDrive Item ID)</label>
                <input type="text" value={form.fileId} onChange={(e) => setForm({ ...form, fileId: e.target.value })} placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>File URL (optional)</label>
                <input type="text" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Version</label>
                <input type="text" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.productId || !form.fileId}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Provider</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Version</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{t.product.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.provider === "google" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"}`}>
                    {t.provider === "google" ? "Google" : "Microsoft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">{t.trackerType}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{t.version}</td>
                <td className="px-6 py-3 text-right flex items-center justify-end gap-2">
                  {t.fileUrl && (
                    <a href={t.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                      <FileSpreadsheet size={16} />
                    </a>
                  )}
                  <button onClick={() => openEdit(t)} className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {templates.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileSpreadsheet size={32} className="mx-auto mb-2" />
            <p>No templates yet. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
