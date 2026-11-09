"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataPanel, ErrorNotice, PlatformAdminFrame } from "./platform-admin-frame";
import { platformApi, type PlatformOrganization, type PlatformUser } from "@/features/platform/platform-api";

export function PlatformOverview() {
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([platformApi.organizations(), platformApi.users()])
      .then(([organizationList, userList]) => {
        setOrganizations(organizationList);
        setUsers(userList);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unable to load platform data."))
      .finally(() => setLoading(false));
  }, []);

  const metrics = [
    { label: "Organizations", value: organizations.length, href: "/platform/organizations", detail: "Registered organization records" },
    { label: "Awaiting review", value: organizations.filter((item) => item.status === "pending_review").length, href: "/platform/registrations", detail: "Applications requiring a decision" },
    { label: "Active organizations", value: organizations.filter((item) => item.status === "active").length, href: "/platform/organizations", detail: "Approved organization workspaces" },
    { label: "User accounts", value: users.length, href: "/platform/users", detail: "Accounts returned by the directory" },
  ];

  return (
    <PlatformAdminFrame title="Platform overview" description="A live summary of organization registrations and platform identities. Data is loaded from the AssetPass backend, not browser demo records.">
      {error && <div className="mb-5"><ErrorNotice message={error} /></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <Link key={metric.label} href={metric.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300"><p className="text-sm font-medium text-slate-500">{metric.label}</p><p className="mt-3 text-4xl font-semibold tracking-tight">{loading ? "—" : metric.value}</p><p className="mt-2 text-xs text-slate-500">{metric.detail}</p></Link>)}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <DataPanel>
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Recent organization registrations</h2><p className="mt-1 text-sm text-slate-500">Latest records submitted to the platform</p></div><Link href="/platform/organizations" className="text-sm font-semibold text-teal-700 hover:underline">View all</Link></div>
          {loading ? <p className="py-8 text-sm text-slate-500">Loading…</p> : organizations.length === 0 ? <p className="py-8 text-sm text-slate-500">No organization registrations yet.</p> : <div className="mt-4 divide-y divide-slate-100">{organizations.slice(0, 5).map((organization) => <div key={organization.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{organization.displayName}</p><p className="mt-1 text-xs text-slate-500">{organization.category} · {new Date(organization.createdAt).toLocaleDateString()}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">{organization.status.replaceAll("_", " ")}</span></div>)}</div>}
        </DataPanel>
        <DataPanel>
          <div><h2 className="text-lg font-semibold">Administration workspaces</h2><p className="mt-1 text-sm text-slate-500">Manage identity and organization access from one place.</p></div>
          <div className="mt-4 grid gap-3">
            <Link href="/platform/users" className="rounded-xl border border-slate-200 p-4 hover:border-teal-300"><p className="font-semibold">User management</p><p className="mt-1 text-sm text-slate-500">Review global accounts and platform roles.</p></Link>
            <Link href="/platform/roles-permissions" className="rounded-xl border border-slate-200 p-4 hover:border-teal-300"><p className="font-semibold">Roles & permissions</p><p className="mt-1 text-sm text-slate-500">Assign delegated administrators and limit their permissions.</p></Link>
            <Link href="/platform/registrations" className="rounded-xl border border-slate-200 p-4 hover:border-teal-300"><p className="font-semibold">Registration reviews</p><p className="mt-1 text-sm text-slate-500">Approve or reject organization registration requests.</p></Link>
          </div>
        </DataPanel>
      </div>
    </PlatformAdminFrame>
  );
}
