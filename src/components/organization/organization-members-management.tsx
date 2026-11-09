"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { organizationApi, type OrganizationMember, type OrganizationWorkspace } from "@/features/organizations/organization-api";

const roleOptions = [
  { key: "organization_admin", label: "Organization Administrator" },
  { key: "asset_manager", label: "Asset Manager" },
  { key: "organization_member", label: "Organization Member" },
];

export function OrganizationMembersManagement() {
  const params = useParams<{ organizationId: string }>();
  const organizationId = params.organizationId;
  const [workspace, setWorkspace] = useState<OrganizationWorkspace | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [email, setEmail] = useState("");
  const [roleKey, setRoleKey] = useState("organization_member");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const reload = useCallback(async () => {
    const [nextWorkspace, nextMembers] = await Promise.all([
      organizationApi.workspace(organizationId),
      organizationApi.members(organizationId),
    ]);
    setWorkspace(nextWorkspace);
    setMembers(nextMembers);
  }, [organizationId]);

  useEffect(() => {
    reload()
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load organization members."))
      .finally(() => setLoading(false));
  }, [reload]);

  async function invite() {
    if (!email.trim()) { setError("Enter the email address of an existing AssetPass user."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      const invitation = await organizationApi.invite(organizationId, email.trim(), roleKey);
      setEmail("");
      await reload();
      setNotice(`Invitation created for ${invitation.fullName} (${invitation.email}). They must sign in and accept it before organization access becomes active.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create the invitation.");
    } finally { setSaving(false); }
  }

  async function changeRole(member: OrganizationMember, nextRole: string) {
    setSaving(true); setError(""); setNotice("");
    try {
      await organizationApi.changeMemberRole(organizationId, member.id, nextRole);
      await reload();
      setNotice("Organization role updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update this member's role.");
    } finally { setSaving(false); }
  }

  async function changeStatus(member: OrganizationMember, status: "suspended" | "removed") {
    const label = status === "suspended" ? "suspend" : "remove";
    if (!window.confirm(`Are you sure you want to ${label} ${member.user?.fullName ?? "this member"}?`)) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await organizationApi.changeMemberStatus(organizationId, member.id, status);
      await reload();
      setNotice(status === "suspended" ? "Membership suspended." : "Membership removed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update membership status.");
    } finally { setSaving(false); }
  }

  const canManage = Boolean(workspace?.permissions.includes("organization.members.manage"));
  const canManageRoles = Boolean(workspace?.permissions.includes("organization.roles.manage"));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><Link href="/organization/overview" className="text-lg font-bold">Asset<span className="text-teal-600">Pass</span></Link><Link href={`/organization/${organizationId}`} className="text-sm font-medium text-slate-600 hover:text-slate-950">Back to workspace</Link></div></header>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Organization administration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Members & access</h1>
        <p className="mt-2 text-sm text-slate-600">{workspace?.organization.displayName ?? "Organization workspace"} · Manage membership and organization-scoped roles.</p>
        {error && <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
        {notice && <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
        {loading ? <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading members and access rules…</p> : workspace && (
          <>
            {!canManage && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">You can view this workspace, but your role does not permit member administration.</div>}
            <div className="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
              <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Invite a member</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Invitations are currently limited to people who already have an active AssetPass account. The invited person must accept before membership becomes active.</p>
                <label className="mt-5 block"><span className="text-xs font-semibold text-slate-600">Account email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="person@example.com" disabled={!canManage || saving} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 disabled:bg-slate-100" /></label>
                <label className="mt-4 block"><span className="text-xs font-semibold text-slate-600">Organization role</span><select value={roleKey} onChange={(event) => setRoleKey(event.target.value)} disabled={!canManage || saving} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100">{roleOptions.map((role) => <option key={role.key} value={role.key}>{role.label}</option>)}</select></label>
                <button onClick={() => void invite()} disabled={!canManage || saving || !email.trim()} className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Please wait…" : "Create invitation"}</button>
                <p className="mt-3 text-xs leading-5 text-slate-400">Email delivery is not connected yet. The invitation is recorded in AssetPass and appears as pending for the invited user.</p>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Organization members</h2><p className="mt-1 text-sm text-slate-500">Membership status and assigned organization role.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{members.length} records</span></div>
                <div className="mt-5 space-y-3">
                  {members.map((member) => <article key={member.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold">{member.user?.fullName ?? "Unknown account"}</p><p className="mt-1 break-all text-xs text-slate-500">{member.user?.email ?? "Account unavailable"}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${member.status === "active" ? "bg-emerald-50 text-emerald-700" : member.status === "pending" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"}`}>{member.status}</span></div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-1.5">{member.roles.map((role) => <span key={role.key} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">{role.name}</span>)}</div>
                      {canManageRoles && member.status === "active" && <select aria-label={`Role for ${member.user?.fullName ?? "member"}`} disabled={saving} value={member.roles[0]?.key ?? "organization_member"} onChange={(event) => void changeRole(member, event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs">{roleOptions.map((role) => <option key={role.key} value={role.key}>{role.label}</option>)}</select>}
                    </div>
                    {canManage && member.status === "active" && <div className="mt-3 flex justify-end"><button disabled={saving} onClick={() => void changeStatus(member, "suspended")} className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50">Suspend member</button><button disabled={saving} onClick={() => void changeStatus(member, "removed")} className="ml-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Remove</button></div>}
                  </article>)}
                  {members.length === 0 && <p className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500">No membership records were found.</p>}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
