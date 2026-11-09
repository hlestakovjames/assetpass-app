"use client";

import Link from "next/link";
import { useAuth } from "@/features/authentication/auth-provider";

export function IndividualWorkspaceHome() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5"><Link href="/individual/overview" className="text-lg font-bold">Asset<span className="text-teal-600">Pass</span></Link><nav className="flex items-center gap-3"><Link href="/organization/overview" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Organization workspace</Link><button onClick={() => void logout()} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Sign out</button></nav></div></header>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Individual workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your personal AssetPass</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Manage assets that belong to you personally. Your individual identity is separate from the roles and memberships you hold in organizations.</p>
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Account profile</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Full name</p><p className="mt-1 font-medium">{user?.fullName ?? "—"}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Account email</p><p className="mt-1 break-all font-medium">{user?.email ?? "—"}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Account status</p><p className="mt-1 font-medium capitalize">{user?.status ?? "—"}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Identity</p><p className="mt-1 font-medium">One AssetPass user account</p></div></div>
        </section>
        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6"><h2 className="font-semibold">My personal assets</h2><p className="mt-2 text-sm leading-6 text-slate-500">Personal asset registration, QR identity, ownership history and lifecycle records will connect here. These records are not yet available through the current backend API.</p><span className="mt-5 inline-block rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">Asset API phase pending</span></div>
          <Link href="/organization/overview" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300"><h2 className="font-semibold">My organization workspaces</h2><p className="mt-2 text-sm leading-6 text-slate-500">Open organizations where you have an active membership. Each organization has its own roles and permissions.</p><span className="mt-5 inline-block text-sm font-semibold text-teal-700">View organizations →</span></Link>
        </section>
      </div>
    </main>
  );
}
