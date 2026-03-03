"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Package, Upload } from "lucide-react";

interface Product {
  id: string;
  name: string;
  short_name: string;
  price: number;
  original_price: number;
  is_active: boolean;
  badge: string | null;
  icon_name: string;
  color: string;
  file_url: string | null;
  features: string[];
  description: string;
  currency: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dark, setDark] = useState(false);
  const [form, setForm] = useState({
    name: "", short_name: "", description: "", price: 0, original_price: 0,
    currency: "INR", features: "", icon_name: "Dumbbell", color: "emerald",
    badge: "", file_url: "", is_active: true,
  });

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const d = dark;

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openNewForm = () => {
    setEditing(null);
    setForm({ name: "", short_name: "", description: "", price: 0, original_price: 0, currency: "INR", features: "", icon_name: "Dumbbell", color: "emerald", badge: "", file_url: "", is_active: true });
    setSelectedFile(null);
    setUploadProgress("");
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name, short_name: product.short_name, description: product.description,
      price: product.price, original_price: product.original_price, currency: product.currency,
      features: Array.isArray(product.features) ? product.features.join("\n") : "",
      icon_name: product.icon_name, color: product.color, badge: product.badge || "",
      file_url: product.file_url || "", is_active: product.is_active,
    });
    setSelectedFile(null);
    setUploadProgress("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setUploadProgress("Preparing to save...");
    let finalFilePath = form.file_url;

    if (selectedFile) {
      setUploadProgress("Uploading file to secure storage...");
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok || !uploadResult.success) {
          alert(`Upload failed: ${uploadResult.error || "Unknown error"}`);
          setSaving(false); setUploadProgress(""); return;
        }
        finalFilePath = uploadResult.filePath;
        setUploadProgress("File uploaded successfully!");
      } catch (err) {
        console.error("Upload error:", err);
        alert("Failed to upload file. Please try again.");
        setSaving(false); setUploadProgress(""); return;
      }
    }

    setUploadProgress("Saving product to database...");
    const featuresArray = form.features.split("\n").map((f) => f.trim()).filter(Boolean);
    const payload = {
      name: form.name, short_name: form.short_name, description: form.description,
      price: Number(form.price), original_price: Number(form.original_price), currency: form.currency,
      features: featuresArray, icon_name: form.icon_name, color: form.color,
      badge: form.badge || null, file_url: finalFilePath || null, is_active: form.is_active,
    };

    if (editing) {
      await fetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...payload }) });
    } else {
      await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }

    setSaving(false); setUploadProgress(""); setShowForm(false); fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    fetchProducts();
  };

  // Shared input class
  const inputCls = `w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors ${d ? "bg-gray-800 border border-gray-700 text-white placeholder:text-gray-600" : "border border-gray-200 text-gray-900 placeholder:text-gray-400"}`;
  const labelCls = `text-xs font-medium mb-1 block ${d ? "text-gray-400" : "text-gray-500"}`;

  if (loading) return <div className={d ? "text-gray-400" : "text-gray-500"}>Loading products...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${d ? "text-white" : "text-gray-900"}`}>Products</h1>
          <p className={`text-sm mt-1 ${d ? "text-gray-400" : "text-gray-500"}`}>Manage your store products</p>
        </div>
        <button onClick={openNewForm} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-violet-500/25">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className={`relative rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto ${d ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
            <h2 className={`text-lg font-bold mb-4 ${d ? "text-white" : "text-gray-900"}`}>{editing ? "Edit Product" : "New Product"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Product Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Short Name</label>
                <input type="text" value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Badge (optional)</label>
                <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g., Best Seller" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Price (₹)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Original Price (₹)</label>
                <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Icon</label>
                <select value={form.icon_name} onChange={(e) => setForm({ ...form, icon_name: e.target.value })} className={inputCls}>
                  <option value="Dumbbell">Dumbbell</option>
                  <option value="TrendingUp">TrendingUp</option>
                  <option value="Apple">Apple</option>
                  <option value="Ruler">Ruler</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Color</label>
                <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputCls}>
                  <option value="emerald">Emerald</option>
                  <option value="blue">Blue</option>
                  <option value="orange">Orange</option>
                  <option value="pink">Pink</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Features (one per line)</label>
                <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} placeholder={"Feature 1\nFeature 2\nFeature 3"} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Product File</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${d ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                      <Upload size={16} /> Choose File
                      <input type="file" className="hidden" onChange={(e) => { if (e.target.files && e.target.files.length > 0) setSelectedFile(e.target.files[0]); }} />
                    </label>
                    <span className={`text-sm truncate max-w-xs ${d ? "text-gray-400" : "text-gray-600"}`}>
                      {selectedFile ? selectedFile.name : (form.file_url ? form.file_url.split('/').pop() : "No new file selected")}
                    </span>
                  </div>
                  {uploadProgress && <p className="text-xs text-violet-500 font-medium">{uploadProgress}</p>}
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <label htmlFor="is_active" className={`text-sm ${d ? "text-gray-300" : "text-gray-700"}`}>Active (visible in store)</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className={`px-4 py-2 text-sm transition-colors ${d ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-violet-500/25">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className={`rounded-xl overflow-hidden border ${d ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
        <table className="w-full text-sm">
          <thead className={`border-b ${d ? "bg-gray-900/80 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <tr>
              <th className={`text-left px-6 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Product</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Price</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Status</th>
              <th className={`text-right px-6 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${d ? "divide-gray-800" : "divide-gray-100"}`}>
            {products.map((product) => (
              <tr key={product.id} className={`transition-colors ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <td className="px-6 py-3">
                  <div className={`font-medium ${d ? "text-white" : "text-gray-900"}`}>{product.name}</div>
                  <div className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>{product.short_name}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${d ? "text-white" : "text-gray-900"}`}>₹{product.price}</span>
                  <span className={`text-xs line-through ml-2 ${d ? "text-gray-600" : "text-gray-400"}`}>₹{product.original_price}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.is_active ? (d ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600") : (d ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-500")}`}>
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => openEditForm(product)} className={`p-1 transition-colors ${d ? "text-gray-500 hover:text-blue-400" : "text-gray-400 hover:text-blue-600"}`}><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(product.id)} className={`p-1 ml-2 transition-colors ${d ? "text-gray-500 hover:text-red-400" : "text-gray-400 hover:text-red-600"}`}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className={`text-center py-12 ${d ? "text-gray-600" : "text-gray-400"}`}>
            <Package size={32} className="mx-auto mb-2" />
            <p>No products yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
