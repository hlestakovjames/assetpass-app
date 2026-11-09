"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/features/authentication/auth-provider";

const navigation = [
  { href: "/platform/overview", label: "Overview" },
  { href: "/platform/organizations", label: "Organizations" },
  { href: "/platform/registrations", label: "Registration reviews" },
  { href: "/platform/users", label: "Users" },
  { href: "/platform/roles-permissions", label: "Roles & permissions" },
];

export function PlatformAdminFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
    } catch {
      // The auth client clears the local session even if the request fails.
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/platform/overview" className="text-sm font-bold tracking-wide text-slate-900">
              Asset<span className="text-teal-600">Pass</span>
              <span className="ml-2 font-normal text-slate-400">/ Platform Administration</span>
            </Link>
            <nav aria-label="Platform administration" className="mt-4 flex flex-wrap gap-2">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 text-right">
              <p className="max-w-[220px] truncate text-xs font-semibold text-slate-700">{user?.fullName ?? "Authenticated user"}</p>
              <p className="max-w-[220px] truncate text-xs text-slate-500">{user?.email ?? "AssetPass account"}</p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              disabled={signingOut}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
            >
              <span aria-hidden="true">↪</span>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Platform workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {children}
      </div>

      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="platform-logout-title" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="platform-logout-title" className="text-lg font-semibold text-slate-950">Sign out of AssetPass?</h2>
            <p className="mt-2 text-sm text-slate-600">Your current session will be ended on this device.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={signingOut} onClick={() => setConfirmLogout(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" disabled={signingOut} onClick={handleLogout} className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-50">{signingOut ? "Signing out…" : "Sign out"}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export function DataPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>;
}

export function ErrorNotice({ message }: { message: string }) {
  return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{message}</div>;
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    approved: "bg-emerald-50 text-emerald-700",
    verified: "bg-emerald-50 text-emerald-700",
    pending_review: "bg-amber-50 text-amber-800",
    unverified: "bg-amber-50 text-amber-800",
    suspended: "bg-rose-50 text-rose-700",
    rejected: "bg-slate-100 text-slate-600",
    inactive: "bg-slate-100 text-slate-600",
  };
  const label = status.replaceAll("_", " ");
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>{label}</span>;
}
