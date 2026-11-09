"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPanel, ErrorNotice, PlatformAdminFrame } from "./platform-admin-frame";
import { platformApi, type PlatformPermission, type PlatformUser } from "@/features/platform/platform-api";

export function RolesPermissionsManagement() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [permissions, setPermissions] = useState<PlatformPermission[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const administrators = useMemo(() => users.filter((user) => user.platformRoles.includes("Platform Administrator")), [users]);
  const platformPermissions = useMemo(() => permissions.filter((permission) => permission.scope === "platform"), [permissions]);

  useEffect(() => {
    Promise.all([platformApi.users(), platformApi.permissions()])
      .then(([userList, permissionList]) => {
        setUsers(userList);
        setPermissions(permissionList);
        const firstAdmin = userList.find((user) => user.platformRoles.includes("Platform Administrator"));
        if (firstAdmin) setSelectedUserId(firstAdmin.id);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unable to load role and permission data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedUserId) { setSelectedKeys([]); return; }
    platformApi.administratorPermissions(selectedUserId)
      .then((grants) => setSelectedKeys(grants.map((grant) => grant.key)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unable to load administrator permissions."));
  }, [selectedUserId]);

  function togglePermission(key: string, checked: boolean) {
    setSelectedKeys((current) => checked ? [...new Set([...current, key])] : current.filter((item) => item !== key));
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
    <PlatformAdminFrame title="Roles & permissions" description="Grant specific platform permissions to individual Platform Administrator assignments. The Platform Owner retains global authority; organization roles cannot grant platform access.">
      {error && <div className="mb-5"><ErrorNotice message={error} /></div>}
      {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
      <DataPanel>
        {loading ? <p className="py-10 text-sm text-slate-500">Loading permission catalogue…</p> : administrators.length === 0 ? <div className="py-10"><h2 className="font-semibold">No Platform Administrators found</h2><p className="mt-2 text-sm text-slate-500">Create a delegated Platform Administrator assignment before granting permissions. The Platform Owner is not managed through this screen.</p></div> : (
          <>
            <label className="block max-w-xl"><span className="text-sm font-semibold">Platform Administrator</span><select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">{administrators.map((admin) => <option key={admin.id} value={admin.id}>{admin.fullName} · {admin.email}</option>)}</select></label>
            <div className="mt-7"><h2 className="text-lg font-semibold">Platform permissions</h2><p className="mt-1 text-sm text-slate-500">Only explicitly selected permissions are granted to this administrator assignment.</p></div>
            <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">{platformPermissions.map((permission) => <label key={permission.key} className="flex cursor-pointer items-start gap-3 p-4 hover:bg-slate-50"><input type="checkbox" checked={selectedKeys.includes(permission.key)} onChange={(event) => togglePermission(permission.key, event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 accent-teal-700" /><span><span className="block text-sm font-semibold">{permission.name}</span><span className="mt-1 block text-xs text-slate-500">{permission.description}</span><code className="mt-2 block text-xs text-slate-400">{permission.key}</code></span></label>)}</div>
            <div className="mt-5 flex items-center justify-between gap-4"><p className="text-xs text-slate-500">{selectedKeys.length} permission(s) selected</p><button disabled={saving || !selectedUserId} onClick={() => void save()} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save permissions"}</button></div>
          </>
        )}
      </DataPanel>
    </PlatformAdminFrame>
  );
}
