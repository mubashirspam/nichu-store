"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Copy, ExternalLink, FileText, Users } from "lucide-react";
import Link from "next/link";

interface LandingPage {
  id: string;
  productId: string;
  slug: string;
  isActive: boolean;
  heroHeadline: string;
  metaTitle: string | null;
  createdAt: string;
  updatedAt: string;
  leadsCount: number;
}

interface Product {
  id: string;
  name: string;
  short_name: string;
  price: number;
}

export default function AdminLandingPagesPage() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  // Full form state
  const [form, setForm] = useState({
    product_id: "", slug: "", is_active: true,
    meta_title: "", meta_description: "", meta_pixel_id: "",
    hero_headline: "", hero_subheadline: "", hero_video_url: "",
    hero_image_urls: "", hero_cta_text: "Buy Now",
    lead_form_enabled: true, lead_form_headline: "",
    lead_form_fields: "name,email,phone", lead_form_cta_text: "Get Access Now",
    lead_form_video_url: "",
    offer_headline: "", offer_expires_at: "",
    offer_slots_total: 100, offer_slots_used: 0, offer_urgency_text: "",
    testimonials: "", stats: "", faqs: "",
  });

  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const d = dark;

  const fetchPages = async () => {
    const res = await fetch("/api/admin/landing-pages");
    if (res.ok) setPages(await res.json());
    setLoading(false);
  };

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) setProducts(await res.json());
  };

  useEffect(() => { fetchPages(); fetchProducts(); }, []);

  const openNewForm = () => {
    setEditing(null);
    setForm({
      product_id: products[0]?.id || "", slug: "", is_active: true,
      meta_title: "", meta_description: "", meta_pixel_id: "",
      hero_headline: "", hero_subheadline: "", hero_video_url: "",
      hero_image_urls: "", hero_cta_text: "Buy Now",
      lead_form_enabled: true, lead_form_headline: "",
      lead_form_fields: "name,email,phone", lead_form_cta_text: "Get Access Now",
      lead_form_video_url: "",
      offer_headline: "", offer_expires_at: "",
      offer_slots_total: 100, offer_slots_used: 0, offer_urgency_text: "",
      testimonials: "", stats: "", faqs: "",
    });
    setActiveTab("basic");
    setShowForm(true);
  };

  const openEditForm = async (page: LandingPage) => {
    // Fetch full details with all fields
    const res = await fetch(`/api/admin/landing-pages?id=${page.id}`);
    if (!res.ok) { alert("Failed to load landing page details"); return; }
    const full = await res.json();
    setEditing(page);
    setForm({
      product_id: full.productId || page.productId,
      slug: full.slug || page.slug,
      is_active: full.isActive ?? page.isActive,
      meta_title: full.metaTitle || "",
      meta_description: full.metaDescription || "",
      meta_pixel_id: full.metaPixelId || "",
      hero_headline: full.heroHeadline || page.heroHeadline,
      hero_subheadline: full.heroSubheadline || "",
      hero_video_url: full.heroVideoUrl || "",
      hero_image_urls: Array.isArray(full.heroImageUrls) ? full.heroImageUrls.join("\n") : "",
      hero_cta_text: full.heroCtaText || "Buy Now",
      lead_form_enabled: full.leadFormEnabled ?? true,
      lead_form_headline: full.leadFormHeadline || "",
      lead_form_fields: Array.isArray(full.leadFormFields) ? full.leadFormFields.join(",") : "name,email,phone",
      lead_form_cta_text: full.leadFormCtaText || "Get Access Now",
      lead_form_video_url: full.leadFormVideoUrl || "",
      offer_headline: full.offerHeadline || "",
      offer_expires_at: full.offerExpiresAt ? new Date(full.offerExpiresAt).toISOString().slice(0, 16) : "",
      offer_slots_total: full.offerSlotsTotal || 100,
      offer_slots_used: full.offerSlotsUsed || 0,
      offer_urgency_text: full.offerUrgencyText || "",
      testimonials: full.testimonials?.length ? JSON.stringify(full.testimonials, null, 2) : "",
      stats: full.stats?.length ? JSON.stringify(full.stats, null, 2) : "",
      faqs: full.faqs?.length ? JSON.stringify(full.faqs, null, 2) : "",
    });
    setActiveTab("basic");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        product_id: form.product_id,
        slug: form.slug,
        is_active: form.is_active,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        meta_pixel_id: form.meta_pixel_id || null,
        hero_headline: form.hero_headline,
        hero_subheadline: form.hero_subheadline || null,
        hero_video_url: form.hero_video_url || null,
        hero_image_urls: form.hero_image_urls ? form.hero_image_urls.split("\n").map(s => s.trim()).filter(Boolean) : [],
        hero_cta_text: form.hero_cta_text || "Buy Now",
        lead_form_enabled: form.lead_form_enabled,
        lead_form_headline: form.lead_form_headline || null,
        lead_form_fields: form.lead_form_fields ? form.lead_form_fields.split(",").map(s => s.trim()).filter(Boolean) : ["name", "email", "phone"],
        lead_form_cta_text: form.lead_form_cta_text || "Get Access Now",
        lead_form_video_url: form.lead_form_video_url || null,
        offer_headline: form.offer_headline || null,
        offer_expires_at: form.offer_expires_at || null,
        offer_slots_total: Number(form.offer_slots_total) || 100,
        offer_slots_used: Number(form.offer_slots_used) || 0,
        offer_urgency_text: form.offer_urgency_text || null,
      };

      // Parse JSONB fields
      try { payload.testimonials = form.testimonials ? JSON.parse(form.testimonials) : []; } catch { payload.testimonials = []; }
      try { payload.stats = form.stats ? JSON.parse(form.stats) : []; } catch { payload.stats = []; }
      try { payload.faqs = form.faqs ? JSON.parse(form.faqs) : []; } catch { payload.faqs = []; }

      let res;
      if (editing) {
        payload.id = editing.id;
        res = await fetch("/api/admin/landing-pages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        res = await fetch("/api/admin/landing-pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save");
      }

      setShowForm(false);
      fetchPages();
    } catch (err: any) {
      alert(err.message || "Failed to save landing page");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this landing page?")) return;
    await fetch(`/api/admin/landing-pages?id=${id}`, { method: "DELETE" });
    fetchPages();
  };

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/lp/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(""), 2000);
  };

  const inputCls = `w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors ${d ? "bg-gray-800 border border-gray-700 text-white placeholder:text-gray-600" : "border border-gray-200 text-gray-900 placeholder:text-gray-400"}`;
  const labelCls = `text-xs font-medium mb-1 block ${d ? "text-gray-400" : "text-gray-500"}`;
  const tabCls = (active: boolean) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? (d ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-700") : (d ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700")}`;

  if (loading) return <div className={d ? "text-gray-400" : "text-gray-500"}>Loading landing pages...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${d ? "text-white" : "text-gray-900"}`}>Landing Pages</h1>
          <p className={`text-sm mt-1 ${d ? "text-gray-400" : "text-gray-500"}`}>Create and manage product landing pages for ads</p>
        </div>
        <button onClick={openNewForm} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-violet-500/25">
          <Plus size={16} /> New Landing Page
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className={`relative rounded-2xl shadow-2xl w-full max-w-3xl mx-4 p-6 max-h-[90vh] overflow-y-auto ${d ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
            <h2 className={`text-lg font-bold mb-4 ${d ? "text-white" : "text-gray-900"}`}>
              {editing ? "Edit Landing Page" : "New Landing Page"}
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {["basic", "hero", "offer", "content"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={tabCls(activeTab === tab)}>
                  {tab === "basic" ? "Basic" : tab === "hero" ? "Hero" : tab === "offer" ? "Offer" : "Content"}
                </button>
              ))}
            </div>

            {/* Basic Tab */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Product</label>
                  <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className={inputCls}>
                    <option value="">Select product...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Slug (URL path)</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="fat-loss-guide" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Meta Title (SEO)</label>
                  <input type="text" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Meta Pixel ID</label>
                  <input type="text" value={form.meta_pixel_id} onChange={(e) => setForm({ ...form, meta_pixel_id: e.target.value })} placeholder="Facebook Pixel ID" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Meta Description (SEO)</label>
                  <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} rows={2} className={inputCls} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="lp_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                  <label htmlFor="lp_active" className={`text-sm ${d ? "text-gray-300" : "text-gray-700"}`}>Active (publicly visible)</label>
                </div>
              </div>
            )}

            {/* Hero Tab */}
            {activeTab === "hero" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Headline</label>
                  <input type="text" value={form.hero_headline} onChange={(e) => setForm({ ...form, hero_headline: e.target.value })} placeholder="Transform Your Body in 90 Days" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Subheadline</label>
                  <textarea value={form.hero_subheadline} onChange={(e) => setForm({ ...form, hero_subheadline: e.target.value })} rows={2} placeholder="The ultimate fitness tracking system..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Video URL (YouTube or MP4)</label>
                  <input type="text" value={form.hero_video_url} onChange={(e) => setForm({ ...form, hero_video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>CTA Button Text</label>
                  <input type="text" value={form.hero_cta_text} onChange={(e) => setForm({ ...form, hero_cta_text: e.target.value })} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Image URLs (one per line)</label>
                  <textarea value={form.hero_image_urls} onChange={(e) => setForm({ ...form, hero_image_urls: e.target.value })} rows={3} placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"} className={inputCls} />
                </div>
              </div>
            )}

            {/* Offer Tab */}
            {activeTab === "offer" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Offer Headline</label>
                  <input type="text" value={form.offer_headline} onChange={(e) => setForm({ ...form, offer_headline: e.target.value })} placeholder="🔥 Limited Time Offer" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Expires At</label>
                  <input type="datetime-local" value={form.offer_expires_at} onChange={(e) => setForm({ ...form, offer_expires_at: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Urgency Text</label>
                  <input type="text" value={form.offer_urgency_text} onChange={(e) => setForm({ ...form, offer_urgency_text: e.target.value })} placeholder="Only 12 spots remaining!" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Total Slots</label>
                  <input type="number" value={form.offer_slots_total} onChange={(e) => setForm({ ...form, offer_slots_total: Number(e.target.value) })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Slots Used</label>
                  <input type="number" value={form.offer_slots_used} onChange={(e) => setForm({ ...form, offer_slots_used: Number(e.target.value) })} className={inputCls} />
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Testimonials (JSON array)</label>
                  <textarea value={form.testimonials} onChange={(e) => setForm({ ...form, testimonials: e.target.value })} rows={5} placeholder={'[\n  {"name": "John", "text": "Amazing product!", "rating": 5},\n  {"name": "Jane", "text": "Changed my life!", "rating": 5}\n]'} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Stats (JSON array)</label>
                  <textarea value={form.stats} onChange={(e) => setForm({ ...form, stats: e.target.value })} rows={3} placeholder={'[\n  {"label": "Happy Customers", "value": "5000+"},\n  {"label": "Results Tracked", "value": "1M+"}\n]'} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>FAQs (JSON array)</label>
                  <textarea value={form.faqs} onChange={(e) => setForm({ ...form, faqs: e.target.value })} rows={5} placeholder={'[\n  {"question": "How does it work?", "answer": "Simply download and start tracking..."},\n  {"question": "Is there a refund?", "answer": "Yes, 7-day money back guarantee"}\n]'} className={inputCls} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className={`px-4 py-2 text-sm transition-colors ${d ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.hero_headline || !form.slug || !form.product_id} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-violet-500/25">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages Table */}
      <div className={`rounded-xl overflow-hidden border ${d ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
        <table className="w-full text-sm">
          <thead className={`border-b ${d ? "bg-gray-900/80 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <tr>
              <th className={`text-left px-6 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Page</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Slug</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Leads</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Status</th>
              <th className={`text-right px-6 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${d ? "divide-gray-800" : "divide-gray-100"}`}>
            {pages.map((page) => (
              <tr key={page.id} className={`transition-colors ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <td className="px-6 py-3">
                  <div className={`font-medium ${d ? "text-white" : "text-gray-900"}`}>{page.heroHeadline}</div>
                  <div className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>
                    {products.find(p => p.id === page.productId)?.name || "Unknown Product"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className={`text-xs px-2 py-1 rounded ${d ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                      /lp/{page.slug}
                    </code>
                    <button onClick={() => copyUrl(page.slug)} className={`p-1 transition-colors ${d ? "text-gray-500 hover:text-violet-400" : "text-gray-400 hover:text-violet-600"}`}>
                      {copied === page.slug ? <span className="text-emerald-400 text-xs">✓</span> : <Copy size={14} />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-sm font-medium ${d ? "text-violet-400" : "text-violet-600"}`}>
                    <Users size={14} /> {page.leadsCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${page.isActive ? (d ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600") : (d ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-500")}`}>
                    {page.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <a href={`/lp/${page.slug}`} target="_blank" className={`p-1 inline-block transition-colors ${d ? "text-gray-500 hover:text-emerald-400" : "text-gray-400 hover:text-emerald-600"}`}>
                    <ExternalLink size={16} />
                  </a>
                  <button onClick={() => openEditForm(page)} className={`p-1 ml-1 transition-colors ${d ? "text-gray-500 hover:text-blue-400" : "text-gray-400 hover:text-blue-600"}`}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(page.id)} className={`p-1 ml-1 transition-colors ${d ? "text-gray-500 hover:text-red-400" : "text-gray-400 hover:text-red-600"}`}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && (
          <div className={`text-center py-12 ${d ? "text-gray-600" : "text-gray-400"}`}>
            <FileText size={32} className="mx-auto mb-2" />
            <p>No landing pages yet</p>
            <p className="text-xs mt-1">Create your first landing page to start capturing leads</p>
          </div>
        )}
      </div>
    </div>
  );
}
