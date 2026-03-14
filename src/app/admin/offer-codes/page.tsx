"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag, Copy, Check } from "lucide-react";

interface OfferCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
}

export default function AdminOfferCodesPage() {
  const [codes, setCodes] = useState<OfferCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OfferCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [form, setForm] = useState({
    code: "", discount_type: "percentage", discount_value: 0,
    max_uses: "", is_active: true, valid_until: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const d = dark;

  const fetchCodes = async () => {
    const res = await fetch("/api/admin/offer-codes");
    if (res.ok) setCodes(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const openNewForm = () => {
    setEditing(null);
    setForm({ code: "", discount_type: "percentage", discount_value: 0, max_uses: "", is_active: true, valid_until: "" });
    setSaveError(null);
    setShowForm(true);
  };

  const openEditForm = (code: OfferCode) => {
    setEditing(code);
    setForm({
      code: code.code, discount_type: code.discount_type, discount_value: code.discount_value,
      max_uses: code.max_uses?.toString() || "", is_active: code.is_active,
      valid_until: code.valid_until ? code.valid_until.slice(0, 16) : "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const payload = {
      code: form.code.toUpperCase(), discount_type: form.discount_type,
      discount_value: Number(form.discount_value), max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: form.is_active, valid_until: form.valid_until || null,
    };

    try {
      let res;
      if (editing) {
        res = await fetch("/api/admin/offer-codes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...payload }) });
      } else {
        res = await fetch("/api/admin/offer-codes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || `Error ${res.status}`);
        setSaving(false);
        return;
      }
    } catch {
      setSaveError("Network error. Please try again.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    await fetchCodes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this offer code?")) return;
    await fetch(`/api/admin/offer-codes?id=${id}`, { method: "DELETE" });
    fetchCodes();
  };

  const toggleActive = async (code: OfferCode) => {
    await fetch("/api/admin/offer-codes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: code.id, code: code.code, discount_type: code.discount_type, discount_value: code.discount_value, max_uses: code.max_uses, is_active: !code.is_active, valid_until: code.valid_until }) });
    fetchCodes();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const inputCls = `w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors ${d ? "bg-gray-800 border border-gray-700 text-white placeholder:text-gray-600" : "border border-gray-200 text-gray-900 placeholder:text-gray-400"}`;
  const labelCls = `text-xs font-medium mb-1 block ${d ? "text-gray-400" : "text-gray-500"}`;

  if (loading) return <div className={d ? "text-gray-400" : "text-gray-500"}>Loading offer codes...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${d ? "text-white" : "text-gray-900"}`}>Offer Codes</h1>
          <p className={`text-sm mt-1 ${d ? "text-gray-400" : "text-gray-500"}`}>Manage discount codes</p>
        </div>
        <button onClick={openNewForm} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-violet-500/25">
          <Plus size={16} /> Create Code
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className={`relative rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 ${d ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
            <h2 className={`text-lg font-bold mb-4 ${d ? "text-white" : "text-gray-900"}`}>{editing ? "Edit Offer Code" : "New Offer Code"}</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Code</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g., LAUNCH50" className={`${inputCls} uppercase`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Discount Type</label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className={inputCls}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Discount Value</label>
                  <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Max Uses (leave empty for unlimited)</label>
                <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Unlimited" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Valid Until (optional)</label>
                <input type="datetime-local" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className={inputCls} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="code_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <label htmlFor="code_active" className={`text-sm ${d ? "text-gray-300" : "text-gray-700"}`}>Active</label>
              </div>
            </div>
            {saveError && (
              <p className="mt-4 text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{saveError}</p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className={`px-4 py-2 text-sm ${d ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.code} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-violet-500/25">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Codes Table */}
      <div className={`rounded-xl overflow-hidden border ${d ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
        <table className="w-full text-sm">
          <thead className={`border-b ${d ? "bg-gray-900/80 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <tr>
              <th className={`text-left px-6 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Code</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Discount</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Usage</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Status</th>
              <th className={`text-right px-6 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${d ? "divide-gray-800" : "divide-gray-100"}`}>
            {codes.map((code) => (
              <tr key={code.id} className={`transition-colors ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${d ? "text-white" : "text-gray-900"}`}>{code.code}</span>
                    <button onClick={() => copyCode(code.code)} className={`transition-colors ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
                      {copied === code.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${d ? "text-white" : "text-gray-900"}`}>
                    {code.discount_type === "percentage" ? `${code.discount_value}%` : `₹${code.discount_value}`}
                  </span>
                </td>
                <td className={`px-4 py-3 ${d ? "text-gray-400" : "text-gray-600"}`}>
                  {code.used_count}{code.max_uses ? ` / ${code.max_uses}` : " / ∞"}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(code)} className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer ${code.is_active ? (d ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600") : (d ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-500")}`}>
                    {code.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => openEditForm(code)} className={`p-1 transition-colors ${d ? "text-gray-500 hover:text-blue-400" : "text-gray-400 hover:text-blue-600"}`}><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(code.id)} className={`p-1 ml-2 transition-colors ${d ? "text-gray-500 hover:text-red-400" : "text-gray-400 hover:text-red-600"}`}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {codes.length === 0 && (
          <div className={`text-center py-12 ${d ? "text-gray-600" : "text-gray-400"}`}>
            <Tag size={32} className="mx-auto mb-2" />
            <p>No offer codes yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
