"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { organizationApi, type OrganizationContext } from "@/features/organizations/organization-api";
import { MobileWorkspaceNavigation } from "@/components/shared/mobile-workspace-navigation";

export function OrganizationWorkspaceHome() {
  const [organizations, setOrganizations] = useState<OrganizationContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    organizationApi.mine()
      .then(setOrganizations)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load organization memberships."))
      .finally(() => setLoading(false));
  }, []);

  const active = organizations.filter((item) => item.status === "active" && item.membership_status === "active");
  const pending = organizations.filter((item) => item.status === "pending_review" || item.membership_status === "pending");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-5"><div className="flex items-center gap-3"><MobileWorkspaceNavigation workspaceLabel="Organization workspace" links={[{ href: "/organization/overview", label: "Your organizations" }, { href: "/individual/overview", label: "Individual workspace" }]} /><Link href="/organization/overview" className="text-lg font-bold">Asset<span className="text-teal-600">Pass</span></Link></div><Link href="/individual/overview" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline">Individual workspace</Link></div></header>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Organization workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your organizations</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Choose an organization to manage its members and, as the asset modules become available, its assets and lifecycle operations. Your personal account remains separate from each organization membership.</p>
        {error && <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
        {loading ? <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading your organization memberships…</div> : (
          <>
            <section className="mt-8"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Active workspaces</h2><span className="text-sm text-slate-500">{active.length} available</span></div>
              {active.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{active.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.display_name}</h3><p className="mt-1 text-sm text-slate-500">{item.category}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span></div><div className="mt-5 flex flex-wrap gap-2"><Link href={`/organization/${item.id}`} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Open workspace</Link><Link href={`/organization/${item.id}/members`} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Manage members</Link></div></article>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">You do not currently have an active organization workspace.</div>}
            </section>
            <section className="mt-10"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Pending registrations or invitations</h2><span className="text-sm text-slate-500">{pending.length} pending</span></div>
              {pending.length ? <div className="mt-4 space-y-3">{pending.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"><div><p className="font-medium">{item.display_name}</p><p className="mt-1 text-xs text-slate-500">{item.category}</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-800">{item.membership_status === "pending" ? (item.status === "pending_review" ? "Awaiting platform review" : "Invitation pending") : item.status.replaceAll("_", " ")}</span></div>)}</div> : <p className="mt-4 text-sm text-slate-500">There are no pending organization records.</p>}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
