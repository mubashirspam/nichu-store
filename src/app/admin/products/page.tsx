"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Package, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

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
  const supabase = createClient();

  // Form state
  const [form, setForm] = useState({
    name: "", short_name: "", description: "", price: 0, original_price: 0,
    currency: "INR", features: "", icon_name: "Dumbbell", color: "emerald",
    badge: "", file_url: "", is_active: true,
  });

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at");
    setProducts((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openNewForm = () => {
    setEditing(null);
    setForm({
      name: "", short_name: "", description: "", price: 0, original_price: 0,
      currency: "INR", features: "", icon_name: "Dumbbell", color: "emerald",
      badge: "", file_url: "", is_active: true,
    });
    setSelectedFile(null);
    setUploadProgress("");
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      short_name: product.short_name,
      description: product.description,
      price: product.price,
      original_price: product.original_price,
      currency: product.currency,
      features: Array.isArray(product.features) ? product.features.join("\n") : "",
      icon_name: product.icon_name,
      color: product.color,
      badge: product.badge || "",
      file_url: product.file_url || "",
      is_active: product.is_active,
    });
    setSelectedFile(null);
    setUploadProgress("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setUploadProgress("Preparing to save...");

    let finalFileUrl = form.file_url;

    if (selectedFile) {
      setUploadProgress("Uploading file...");
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("File upload error:", uploadError);
        alert("Failed to upload file. Please check if the 'products' bucket exists and is publicly accessible.");
        setSaving(false);
        setUploadProgress("");
        return;
      }

      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(filePath);
        finalFileUrl = publicUrl;
      }
    }

    setUploadProgress("Saving product to database...");

    const featuresArray = form.features.split("\n").map((f) => f.trim()).filter(Boolean);
    const payload = {
      name: form.name,
      short_name: form.short_name,
      description: form.description,
      price: Number(form.price),
      original_price: Number(form.original_price),
      currency: form.currency,
      features: featuresArray,
      icon_name: form.icon_name,
      color: form.color,
      badge: form.badge || null,
      file_url: finalFileUrl || null,
      is_active: form.is_active,
    };

    if (editing) {
      await supabase.from("products").update(payload as any).eq("id", editing.id);
    } else {
      await supabase.from("products").insert(payload as any);
    }

    setSaving(false);
    setUploadProgress("");
    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  if (loading) return <div className="text-gray-500">Loading products...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your store products</p>
        </div>
        <button onClick={openNewForm} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? "Edit Product" : "New Product"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Product Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Short Name</label>
                <input type="text" value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Badge (optional)</label>
                <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g., Best Seller" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Price (₹)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Original Price (₹)</label>
                <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Icon</label>
                <select value={form.icon_name} onChange={(e) => setForm({ ...form, icon_name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="Dumbbell">Dumbbell</option>
                  <option value="TrendingUp">TrendingUp</option>
                  <option value="Apple">Apple</option>
                  <option value="Ruler">Ruler</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Color</label>
                <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="emerald">Emerald</option>
                  <option value="blue">Blue</option>
                  <option value="orange">Orange</option>
                  <option value="pink">Pink</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Features (one per line)</label>
                <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Product File</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      <Upload size={16} />
                      Choose File
                      <input 
                        type="file" className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }} 
                      />
                    </label>
                    <span className="text-sm text-gray-600 truncate max-w-xs">
                      {selectedFile ? selectedFile.name : (form.file_url ? form.file_url.split('/').pop() : "No new file selected")}
                    </span>
                  </div>
                  {uploadProgress && (
                    <p className="text-xs text-emerald-600 font-medium">{uploadProgress}</p>
                  )}
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible in store)</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-400">{product.short_name}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-gray-900">₹{product.price}</span>
                  <span className="text-xs text-gray-400 line-through ml-2">₹{product.original_price}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.is_active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => openEditForm(product)} className="text-gray-400 hover:text-blue-600 transition-colors p-1"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 ml-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package size={32} className="mx-auto mb-2" />
            <p>No products yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
