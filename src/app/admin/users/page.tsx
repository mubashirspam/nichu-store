"use client";

import React, { useEffect, useState } from "react";
import { Users, Shield } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const d = dark;

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  if (loading) return <div className={d ? "text-gray-400" : "text-gray-500"}>Loading users...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${d ? "text-white" : "text-gray-900"}`}>Users</h1>
        <p className={`text-sm mt-1 ${d ? "text-gray-400" : "text-gray-500"}`}>{users.length} registered users</p>
      </div>

      <div className={`rounded-xl overflow-hidden border ${d ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
        <table className="w-full text-sm">
          <thead className={`border-b ${d ? "bg-gray-900/80 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <tr>
              <th className={`text-left px-6 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>User</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Role</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Joined</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${d ? "divide-gray-800" : "divide-gray-100"}`}>
            {users.map((user) => (
              <tr key={user.id} className={`transition-colors ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <td className="px-6 py-3">
                  <p className={`font-medium ${d ? "text-white" : "text-gray-900"}`}>{user.full_name || "—"}</p>
                  <p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? d ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"
                      : d ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                  }`}>
                    {user.role === "admin" && <Shield size={12} />}
                    {user.role}
                  </span>
                </td>
                <td className={`px-4 py-3 text-xs ${d ? "text-gray-400" : "text-gray-500"}`}>
                  {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className={`text-center py-12 ${d ? "text-gray-600" : "text-gray-400"}`}>
            <Users size={32} className="mx-auto mb-2" />
            <p>No users yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
