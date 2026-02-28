"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  const [copied, setCopied] = useState<string | null>(null);
  const supabase = createClient();

  const [form, setForm] = useState({
    code: "", discount_type: "percentage", discount_value: 0,
    max_uses: "", is_active: true, valid_until: "",
  });

  const fetchCodes = async () => {
    const { data } = await supabase.from("offer_codes").select("*").order("created_at", { ascending: false });
    setCodes((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const openNewForm = () => {
    setEditing(null);
    setForm({ code: "", discount_type: "percentage", discount_value: 0, max_uses: "", is_active: true, valid_until: "" });
    setShowForm(true);
  };

  const openEditForm = (code: OfferCode) => {
    setEditing(code);
    setForm({
      code: code.code,
      discount_type: code.discount_type,
      discount_value: code.discount_value,
      max_uses: code.max_uses?.toString() || "",
      is_active: code.is_active,
      valid_until: code.valid_until ? code.valid_until.slice(0, 16) : "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: form.is_active,
      valid_until: form.valid_until || null,
    };

    if (editing) {
      await supabase.from("offer_codes").update(payload as any).eq("id", editing.id);
    } else {
      await supabase.from("offer_codes").insert(payload as any);
    }

    setSaving(false);
    setShowForm(false);
    fetchCodes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this offer code?")) return;
    await supabase.from("offer_codes").delete().eq("id", id);
    fetchCodes();
  };

  const toggleActive = async (code: OfferCode) => {
    await supabase.from("offer_codes").update({ is_active: !code.is_active } as any).eq("id", code.id);
    fetchCodes();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  if (loading) return <div className="text-gray-500">Loading offer codes...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offer Codes</h1>
          <p className="text-gray-500 text-sm mt-1">Manage discount codes</p>
        </div>
        <button onClick={openNewForm} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} />
          Create Code
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? "Edit Offer Code" : "New Offer Code"}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Code</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g., LAUNCH50" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Discount Type</label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Discount Value</label>
                  <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Max Uses (leave empty for unlimited)</label>
                <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Unlimited" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Valid Until (optional)</label>
                <input type="datetime-local" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="code_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <label htmlFor="code_active" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.code} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Codes Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Discount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Usage</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {codes.map((code) => (
              <tr key={code.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">{code.code}</span>
                    <button onClick={() => copyCode(code.code)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      {copied === code.code ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">
                    {code.discount_type === "percentage" ? `${code.discount_value}%` : `₹${code.discount_value}`}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {code.used_count}{code.max_uses ? ` / ${code.max_uses}` : " / ∞"}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(code)} className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer ${code.is_active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                    {code.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => openEditForm(code)} className="text-gray-400 hover:text-blue-600 transition-colors p-1"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(code.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 ml-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {codes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Tag size={32} className="mx-auto mb-2" />
            <p>No offer codes yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
