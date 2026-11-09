"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPanel, ErrorNotice, PlatformAdminFrame } from "./platform-admin-frame";
import { platformApi, type PlatformPermission, type PlatformUser } from "@/features/platform/platform-api";

export function RolesPermissionsManagement() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [permissions, setPermissions] = useState<PlatformPermission[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignmentReason, setAssignmentReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const administrators = useMemo(() => users.filter((user) => user.platformRoles.includes("Platform Administrator")), [users]);
  const eligibleUsers = useMemo(() => users.filter((user) => user.status === "active" && !user.platformRoles.includes("Platform Administrator") && !user.platformRoles.includes("Platform Owner")), [users]);
  const platformPermissions = useMemo(() => permissions.filter((permission) => permission.scope === "platform"), [permissions]);

  async function reloadUsers() {
    const nextUsers = await platformApi.users();
    setUsers(nextUsers);
    return nextUsers;
  }

  useEffect(() => {
    Promise.all([platformApi.users(), platformApi.permissions()])
      .then(([userList, permissionList]) => {
        setUsers(userList);
        setPermissions(permissionList);
        const firstAdmin = userList.find((user) => user.platformRoles.includes("Platform Administrator"));
        if (firstAdmin) setSelectedUserId(firstAdmin.id);
        const firstEligible = userList.find((user) => user.status === "active" && user.platformRoles.length === 0);
        if (firstEligible) setAssignUserId(firstEligible.id);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unable to load role and permission data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    platformApi.administratorPermissions(selectedUserId)
      .then((grants) => setSelectedKeys(grants.map((grant) => grant.key)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unable to load administrator permissions."));
  }, [selectedUserId]);

  function togglePermission(key: string, checked: boolean) {
    setSelectedKeys((current) => checked ? [...new Set([...current, key])] : current.filter((item) => item !== key));
  }

  async function assignAdministrator() {
    if (!assignUserId || !assignmentReason.trim()) {
      setError("Choose an active user and provide a reason for delegated platform access.");
      return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      await platformApi.assignAdministrator(assignUserId, assignmentReason.trim());
      const nextUsers = await reloadUsers();
      setSelectedUserId(assignUserId);
      setAssignmentReason("");
      const nextEligible = nextUsers.find((user) => user.status === "active" && user.platformRoles.length === 0);
      setAssignUserId(nextEligible?.id ?? "");
      setNotice("Platform Administrator assignment created. Grant only the permissions required for the role.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to assign Platform Administrator.");
    } finally {
      setSaving(false);
    }
  }

  async function revokeAdministrator(user: PlatformUser) {
    if (!window.confirm(`Revoke Platform Administrator access for ${user.fullName}?`)) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await platformApi.revokeAdministrator(user.id);
      const nextUsers = await reloadUsers();
      const nextAdmin = nextUsers.find((item) => item.platformRoles.includes("Platform Administrator"));
      setSelectedUserId(nextAdmin?.id ?? "");
      setNotice("Platform Administrator access revoked.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to revoke Platform Administrator.");
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    if (!selectedUserId) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await platformApi.replaceAdministratorPermissions(selectedUserId, selectedKeys);
      setNotice("Delegated permissions saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save permissions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PlatformAdminFrame title="Roles & permissions" description="Manage delegated Platform Administrator assignments and their explicit platform permissions. The Platform Owner retains global authority; organization roles cannot grant platform access.">
      {error && <div className="mb-5"><ErrorNotice message={error} /></div>}
      {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <DataPanel>
          <h2 className="text-lg font-semibold">Platform Administrator assignments</h2>
          <p className="mt-1 text-sm text-slate-500">Only the Platform Owner can create or revoke these global assignments.</p>
          <div className="mt-5 space-y-3">
            {administrators.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                <button onClick={() => setSelectedUserId(admin.id)} className="min-w-0 text-left">
                  <span className="block truncate text-sm font-semibold">{admin.fullName}</span>
                  <span className="mt-1 block truncate text-xs text-slate-500">{admin.email}</span>
                </button>
                <button disabled={saving} onClick={() => void revokeAdministrator(admin)} className="shrink-0 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Revoke</button>
              </div>
            ))}
            {administrators.length === 0 && !loading && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No Platform Administrators are currently assigned.</p>}
          </div>
          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="text-sm font-semibold">Assign a Platform Administrator</h3>
            <label className="mt-3 block"><span className="text-xs font-medium text-slate-600">Active user account</span><select value={assignUserId} onChange={(event) => setAssignUserId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="">Select a user</option>{eligibleUsers.map((user) => <option key={user.id} value={user.id}>{user.fullName} · {user.email}</option>)}</select></label>
            <label className="mt-3 block"><span className="text-xs font-medium text-slate-600">Reason for assignment</span><textarea value={assignmentReason} onChange={(event) => setAssignmentReason(event.target.value)} maxLength={500} rows={3} placeholder="Describe the delegated responsibility…" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" /></label>
            <button disabled={saving || !assignUserId || !assignmentReason.trim()} onClick={() => void assignAdministrator()} className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Please wait…" : "Assign administrator"}</button>
          </div>
        </DataPanel>
        <DataPanel>
          {loading ? <p className="py-10 text-sm text-slate-500">Loading permission catalogue…</p> : administrators.length === 0 ? <div className="py-10"><h2 className="font-semibold">Permission assignment is not yet available</h2><p className="mt-2 text-sm text-slate-500">Assign a Platform Administrator first. The Platform Owner is not managed through this screen.</p></div> : (
            <>
              <label className="block"><span className="text-sm font-semibold">Administrator permissions</span><select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">{administrators.map((admin) => <option key={admin.id} value={admin.id}>{admin.fullName} · {admin.email}</option>)}</select></label>
              <div className="mt-6"><h2 className="text-lg font-semibold">Platform permissions</h2><p className="mt-1 text-sm text-slate-500">Only selected permissions are granted to this administrator assignment.</p></div>
              <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">{platformPermissions.map((permission) => <label key={permission.key} className="flex cursor-pointer items-start gap-3 p-4 hover:bg-slate-50"><input type="checkbox" checked={selectedKeys.includes(permission.key)} onChange={(event) => togglePermission(permission.key, event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 accent-teal-700" /><span><span className="block text-sm font-semibold">{permission.name}</span><span className="mt-1 block text-xs text-slate-500">{permission.description}</span><code className="mt-2 block text-xs text-slate-400">{permission.key}</code></span></label>)}</div>
              <div className="mt-5 flex items-center justify-between gap-4"><p className="text-xs text-slate-500">{selectedKeys.length} permission(s) selected</p><button disabled={saving || !selectedUserId} onClick={() => void save()} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save permissions"}</button></div>
            </>
          )}
        </DataPanel>
      </div>
    </PlatformAdminFrame>
  );
}
