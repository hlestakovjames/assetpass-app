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
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

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

  function closeMobileNavigation() {
    setMobileNavigationOpen(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-8 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavigationOpen(true)}
                aria-label="Open dashboard navigation"
                aria-controls="platform-mobile-navigation"
                aria-expanded={mobileNavigationOpen}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xl text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 md:hidden"
              >
                <span aria-hidden="true">☰</span>
              </button>
              <Link href="/platform/overview" className="truncate text-sm font-bold tracking-wide text-slate-900">
                Asset<span className="text-teal-600">Pass</span>
                <span className="ml-2 hidden font-normal text-slate-400 sm:inline">/ Platform Administration</span>
              </Link>
            </div>
            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setConfirmLogout(true)}
                disabled={signingOut}
                className="inline-flex min-h-9 items-center rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
              >
                Sign out
              </button>
            </div>
          </div>

          <nav aria-label="Platform administration" className="hidden flex-wrap gap-2 md:flex">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden flex-wrap items-center justify-between gap-3 lg:flex">
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

      {mobileNavigationOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close dashboard navigation"
            onClick={closeMobileNavigation}
            className="absolute inset-0 h-full w-full bg-slate-950/50"
          />
          <aside
            id="platform-mobile-navigation"
            aria-label="Platform dashboard navigation"
            className="absolute inset-y-0 left-0 flex w-[min(84vw,320px)] flex-col border-r border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex min-h-16 items-center justify-between border-b border-slate-200 px-5">
              <Link href="/platform/overview" onClick={closeMobileNavigation} className="text-base font-bold tracking-wide text-slate-900">
                Asset<span className="text-teal-600">Pass</span>
              </Link>
              <button
                type="button"
                onClick={closeMobileNavigation}
                aria-label="Close dashboard navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.fullName ?? "Authenticated user"}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{user?.email ?? "AssetPass account"}</p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">Platform administration</p>
            </div>
            <nav aria-label="Platform administration" className="flex-1 space-y-1 overflow-y-auto p-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileNavigation}
                  className="flex min-h-12 items-center rounded-lg px-4 text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={() => {
                  closeMobileNavigation();
                  setConfirmLogout(true);
                }}
                disabled={signingOut}
                className="flex min-h-11 w-full items-center rounded-lg border border-rose-200 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Platform workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
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
