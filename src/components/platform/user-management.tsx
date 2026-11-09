"use client";

import { useEffect, useState } from "react";
import { DataPanel, ErrorNotice, PlatformAdminFrame, StatusPill } from "./platform-admin-frame";
import { platformApi, type PlatformUser } from "@/features/platform/platform-api";

export function UserManagement() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    platformApi.users().then(setUsers).catch((e: unknown) => setError(e instanceof Error ? e.message : "Unable to load users.")).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((user) => [user.fullName, user.email, ...user.platformRoles].join(" ").toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <PlatformAdminFrame title="User management" description="Review the global AssetPass account directory and distinguish ordinary accounts from delegated platform administrators. Organization-specific roles remain scoped to their organization.">
      {error && <div className="mb-5"><ErrorNotice message={error} /></div>}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <DataPanel><p className="text-sm text-slate-500">Accounts returned</p><p className="mt-2 text-3xl font-semibold">{users.length}</p></DataPanel>
        <DataPanel><p className="text-sm text-slate-500">Active accounts</p><p className="mt-2 text-3xl font-semibold">{users.filter((user) => user.status === "active").length}</p></DataPanel>
        <DataPanel><p className="text-sm text-slate-500">Platform administrators</p><p className="mt-2 text-3xl font-semibold">{users.filter((user) => user.platformRoles.includes("Platform Administrator")).length}</p></DataPanel>
      </div>
      <DataPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold">Global user directory</h2><p className="mt-1 text-sm text-slate-500">Password hashes and authentication secrets are never returned.</p></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email or role" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" /></div>
        {loading ? <p className="py-12 text-center text-sm text-slate-500">Loading users…</p> : filtered.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">No matching accounts.</p> : (
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Account</th><th className="px-3 py-3">Platform role</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Last login</th><th className="px-3 py-3">Created</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{filtered.map((user) => <tr key={user.id}><td className="px-3 py-4"><p className="font-semibold">{user.fullName}</p><p className="mt-1 text-xs text-slate-500">{user.email}</p></td><td className="px-3 py-4">{user.platformRoles.length ? user.platformRoles.join(", ") : <span className="text-slate-400">Standard user</span>}</td><td className="px-3 py-4"><StatusPill status={user.status} /></td><td className="px-3 py-4 text-slate-600">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</td><td className="px-3 py-4 text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}</tbody>
          </table></div>
        )}
      </DataPanel>
    </PlatformAdminFrame>
  );
}
