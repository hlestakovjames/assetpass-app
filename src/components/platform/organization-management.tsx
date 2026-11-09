"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DataPanel, ErrorNotice, PlatformAdminFrame, StatusPill } from "./platform-admin-frame";
import { platformApi, type OrganizationStatus, type PlatformOrganization } from "@/features/platform/platform-api";

export function OrganizationManagement({ pendingOnly = false }: { pendingOnly?: boolean }) {
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | OrganizationStatus>(pendingOnly ? "pending_review" : "all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrganizations(await platformApi.organizations());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load organizations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => organizations.filter((organization) => {
    const matchesStatus = statusFilter === "all" || organization.status === statusFilter;
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || [organization.displayName, organization.legalName, organization.contactEmail, organization.registrationNumber, organization.category].some((value) => value?.toLowerCase().includes(term));
    return matchesStatus && matchesQuery;
  }), [organizations, query, statusFilter]);

  async function changeStatus(organization: PlatformOrganization, status: OrganizationStatus) {
    let note: string | undefined;
    if (status === "rejected") {
      note = window.prompt("Enter the reason for rejecting this registration:")?.trim();
      if (!note) return;
    } else if (status === "suspended" && !window.confirm(`Suspend ${organization.displayName}?`)) {
      return;
    }
    setBusyId(organization.id);
    setError("");
    try {
      const updated = await platformApi.reviewOrganization(organization.id, status, note);
      setOrganizations((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update organization.");
    } finally {
      setBusyId("");
    }
  }

  const counts = useMemo(() => ({
    total: organizations.length,
    pending: organizations.filter((item) => item.status === "pending_review").length,
    active: organizations.filter((item) => item.status === "active").length,
    suspended: organizations.filter((item) => item.status === "suspended").length,
  }), [organizations]);

  return (
    <PlatformAdminFrame
      title={pendingOnly ? "Registration reviews" : "Organization management"}
      description={pendingOnly
        ? "Review organization registrations before enabling their organization workspace."
        : "View and manage organization records, approval state and lifecycle status."}
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[["Total organizations", counts.total], ["Pending review", counts.pending], ["Active", counts.active], ["Suspended", counts.suspended]].map(([label, value]) => (
          <DataPanel key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p></DataPanel>
        ))}
      </div>
      {error && <div className="mb-5"><ErrorNotice message={error} /></div>}
      <DataPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-semibold">{pendingOnly ? "Applications awaiting review" : "Registered organizations"}</h2><p className="mt-1 text-sm text-slate-500">{filtered.length} record(s)</p></div>
          <button onClick={() => void load()} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Refresh</button>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search organization, email or registration number" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
          {!pendingOnly && <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | OrganizationStatus)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="all">All statuses</option><option value="pending_review">Pending review</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="rejected">Rejected</option></select>}
        </div>
        {loading ? <p className="py-12 text-center text-sm text-slate-500">Loading organizations…</p> : filtered.length === 0 ? <div className="py-12 text-center"><p className="font-medium">No organizations found</p><p className="mt-1 text-sm text-slate-500">Try another filter or refresh the directory.</p></div> : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Organization</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Contact</th><th className="px-3 py-3">Submitted</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((organization) => (
                  <tr key={organization.id} className="align-top">
                    <td className="px-3 py-4"><p className="font-semibold text-slate-900">{organization.displayName}</p><p className="mt-1 text-xs text-slate-500">{organization.legalName || organization.registrationNumber || organization.id}</p></td>
                    <td className="px-3 py-4 text-slate-600">{organization.category}</td>
                    <td className="px-3 py-4"><p>{organization.contactEmail}</p><p className="mt-1 text-xs text-slate-500">{organization.contactPhone || "No phone supplied"}</p></td>
                    <td className="px-3 py-4 text-slate-600">{new Date(organization.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-4"><StatusPill status={organization.status} /></td>
                    <td className="px-3 py-4"><div className="flex flex-wrap gap-2">
                      {organization.status === "pending_review" && <><button disabled={busyId === organization.id} onClick={() => void changeStatus(organization, "active")} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve</button><button disabled={busyId === organization.id} onClick={() => void changeStatus(organization, "rejected")} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50">Reject</button></>}
                      {organization.status === "active" && <button disabled={busyId === organization.id} onClick={() => void changeStatus(organization, "suspended")} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50">Suspend</button>}
                      {organization.status === "suspended" && <button disabled={busyId === organization.id} onClick={() => void changeStatus(organization, "active")} className="rounded-lg border border-teal-300 px-3 py-2 text-xs font-semibold text-teal-700 disabled:opacity-50">Reactivate</button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataPanel>
    </PlatformAdminFrame>
  );
}
