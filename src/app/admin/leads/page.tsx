"use client";

import React, { useEffect, useState } from "react";
import { Users, Mail, Phone, CheckCircle, Clock } from "lucide-react";

interface Lead {
  id: string;
  landing_page_id: string;
  product_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  converted: boolean;
  created_at: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const d = dark;

  useEffect(() => {
    const fetchLeads = async () => {
      const res = await fetch("/api/admin/leads");
      if (res.ok) setLeads(await res.json());
      setLoading(false);
    };
    fetchLeads();
  }, []);

  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.converted).length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  if (loading) return <div className={d ? "text-gray-400" : "text-gray-500"}>Loading leads...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${d ? "text-white" : "text-gray-900"}`}>Leads</h1>
        <p className={`text-sm mt-1 ${d ? "text-gray-400" : "text-gray-500"}`}>Track leads from landing pages</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`rounded-xl p-4 border ${d ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
          <div className={`text-xs font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Total Leads</div>
          <div className={`text-2xl font-bold mt-1 ${d ? "text-white" : "text-gray-900"}`}>{totalLeads}</div>
        </div>
        <div className={`rounded-xl p-4 border ${d ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
          <div className={`text-xs font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Converted</div>
          <div className="text-2xl font-bold mt-1 text-emerald-500">{convertedLeads}</div>
        </div>
        <div className={`rounded-xl p-4 border ${d ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
          <div className={`text-xs font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Conversion Rate</div>
          <div className="text-2xl font-bold mt-1 text-violet-500">{conversionRate}%</div>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl overflow-hidden border ${d ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
        <table className="w-full text-sm">
          <thead className={`border-b ${d ? "bg-gray-900/80 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <tr>
              <th className={`text-left px-6 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Contact</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Source</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Status</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Date</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${d ? "divide-gray-800" : "divide-gray-100"}`}>
            {leads.map((lead) => (
              <tr key={lead.id} className={`transition-colors ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <td className="px-6 py-3">
                  <div className={`font-medium ${d ? "text-white" : "text-gray-900"}`}>{lead.name || "—"}</div>
                  <div className="flex items-center gap-3 mt-1">
                    {lead.email && (
                      <span className={`text-xs flex items-center gap-1 ${d ? "text-gray-500" : "text-gray-400"}`}>
                        <Mail size={12} /> {lead.email}
                      </span>
                    )}
                    {lead.phone && (
                      <span className={`text-xs flex items-center gap-1 ${d ? "text-gray-500" : "text-gray-400"}`}>
                        <Phone size={12} /> {lead.phone}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {lead.utm_source ? (
                    <span className={`text-xs ${d ? "text-gray-400" : "text-gray-500"}`}>
                      {lead.utm_source}{lead.utm_medium ? ` / ${lead.utm_medium}` : ""}
                    </span>
                  ) : (
                    <span className={`text-xs ${d ? "text-gray-600" : "text-gray-400"}`}>Direct</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {lead.converted ? (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${d ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                      <CheckCircle size={12} /> Purchased
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${d ? "bg-yellow-500/10 text-yellow-400" : "bg-yellow-50 text-yellow-600"}`}>
                      <Clock size={12} /> Lead
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>
                    {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className={`text-center py-12 ${d ? "text-gray-600" : "text-gray-400"}`}>
            <Users size={32} className="mx-auto mb-2" />
            <p>No leads yet</p>
            <p className="text-xs mt-1">Leads will appear here when visitors submit forms on landing pages</p>
          </div>
        )}
      </div>
    </div>
  );
}
