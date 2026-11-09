"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { organizationApi, type OrganizationWorkspace } from "@/features/organizations/organization-api";
import { MobileWorkspaceNavigation } from "@/components/shared/mobile-workspace-navigation";

export function OrganizationWorkspaceDashboard({ organizationId }: { organizationId: string }) {
  const [workspace, setWorkspace] = useState<OrganizationWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    organizationApi.workspace(organizationId)
      .then(setWorkspace)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to open this organization workspace."))
      .finally(() => setLoading(false));
  }, [organizationId]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-5"><div className="flex items-center gap-3"><MobileWorkspaceNavigation workspaceLabel="Organization workspace" links={[{ href: "/organization/overview", label: "All organizations" }]} /><Link href="/organization/overview" className="text-lg font-bold">Asset<span className="text-teal-600">Pass</span></Link></div><Link href="/organization/overview" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline">All organizations</Link></div></header>
      <div className="mx-auto max-w-6xl px-5 py-10">
        {loading ? <p className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Verifying organization workspace access…</p> : error ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6"><h1 className="font-semibold text-rose-900">Workspace unavailable</h1><p className="mt-2 text-sm text-rose-800">{error}</p><Link href="/organization/overview" className="mt-4 inline-block text-sm font-semibold underline">Return to your organizations</Link></div> : workspace && (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Organization workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{workspace.organization.displayName}</h1>
            <p className="mt-2 text-sm text-slate-600">{workspace.organization.category}{workspace.organization.city ? ` · ${workspace.organization.city}` : ""}{workspace.organization.county ? `, ${workspace.organization.county}` : ""}</p>
            <div className="mt-6 flex flex-wrap gap-2">{workspace.roles.map((role) => <span key={role.key} className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">{role.name}</span>)}</div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Link href={`/organization/${organizationId}/members`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-teal-300"><p className="text-sm font-semibold">Members & access</p><p className="mt-2 text-sm leading-6 text-slate-500">Invite existing AssetPass users, review pending invitations and manage organization roles.</p><span className="mt-5 inline-block text-sm font-semibold text-teal-700">Manage members →</span></Link>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6"><p className="text-sm font-semibold">Asset register</p><p className="mt-2 text-sm leading-6 text-slate-500">Organization asset registration and QR identity workflows will be connected in the asset module phase.</p><span className="mt-5 inline-block text-xs font-semibold text-slate-400">Not yet connected</span></div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6"><p className="text-sm font-semibold">Lifecycle operations</p><p className="mt-2 text-sm leading-6 text-slate-500">Maintenance, custody, transfers and disposal will use the organization context and permission model.</p><span className="mt-5 inline-block text-xs font-semibold text-slate-400">Not yet connected</span></div>
            </div>
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Workspace access</h2><p className="mt-2 text-sm text-slate-500">Your access is based on your active membership and the roles assigned within this organization. Platform-wide privileges are not inherited from organization roles.</p><div className="mt-4 flex flex-wrap gap-2">{workspace.permissions.map((permission) => <code key={permission} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600">{permission}</code>)}</div></section>
          </>
        )}
      </div>
    </main>
  );
}
