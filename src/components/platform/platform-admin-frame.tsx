"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/features/authentication/auth-provider";

const navigation = [
  { href: "/platform/overview", label: "Overview", icon: "▦" },
  { href: "/platform/organizations", label: "Organizations", icon: "▤" },
  { href: "/platform/registrations", label: "Registration reviews", icon: "✓" },
  { href: "/platform/users", label: "Users", icon: "♙" },
  { href: "/platform/roles-permissions", label: "Roles & permissions", icon: "⚿" },
];

function NavigationLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Platform administration" className="space-y-1">
      {navigation.map((item) => {
        const active = pathname === item.href || (item.href !== "/platform/overview" && pathname.startsWith(item.href + "/"));
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
            <span aria-hidden="true" className="w-5 text-center text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

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
  const pathname = usePathname();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <Link href="/platform/overview" className="flex h-20 items-center border-b border-slate-100 px-6 text-lg font-bold tracking-tight text-slate-900">
          Asset<span className="text-teal-600">Pass</span>
        </Link>
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Platform Administration</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavigationLinks pathname={pathname} />
        </div>
        <div className="border-t border-slate-100 p-4">
          <p className="truncate text-xs font-semibold text-slate-700">{user?.fullName ?? "Authenticated user"}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{user?.email ?? "AssetPass account"}</p>
          <button type="button" onClick={() => setConfirmLogout(true)} disabled={signingOut}
            className="mt-3 min-h-10 w-full rounded-lg border border-rose-200 px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
            ↪ <span className="ml-2">Sign out</span>
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-950/50" />
          <aside id="platform-mobile-navigation" aria-label="Platform navigation" className="absolute inset-y-0 left-0 flex w-[min( min(84vw, 320px), 320px)] flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
              <Link href="/platform/overview" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold">Asset<span className="text-teal-600">Pass</span></Link>
              <button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="grid size-10 place-items-center rounded-lg text-2xl text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
              <p className="mt-1 text-sm font-semibold">Platform Administration</p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-5">
              <NavigationLinks pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
            </div>
            <div className="border-t border-slate-100 p-4">
              <p className="truncate text-xs font-semibold text-slate-700">{user?.fullName ?? "Authenticated user"}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{user?.email ?? "AssetPass account"}</p>
              <button type="button" onClick={() => { setMobileMenuOpen(false); setConfirmLogout(true); }} disabled={signingOut}
                className="mt-3 min-h-11 w-full rounded-lg border border-rose-200 px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">↪ <span className="ml-2">Sign out</span></button>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" aria-label="Open navigation" aria-expanded={mobileMenuOpen} aria-controls="platform-mobile-navigation"
                onClick={() => setMobileMenuOpen(true)} className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-xl text-slate-700 hover:bg-slate-50 lg:hidden">☰</button>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Platform workspace</p>
                <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
              </div>
            </div>
            <div className="hidden min-w-0 text-right sm:block">
              <p className="max-w-[220px] truncate text-xs font-semibold text-slate-700">{user?.fullName ?? "Authenticated user"}</p>
              <p className="max-w-[220px] truncate text-xs text-slate-500">{user?.email ?? "AssetPass account"}</p>
            </div>
            <button type="button" onClick={() => setConfirmLogout(true)} disabled={signingOut}
              className="hidden min-h-10 shrink-0 items-center rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50 sm:inline-flex">↪ <span className="ml-2">Sign out</span></button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
          {children}
        </div>
      </div>

      {confirmLogout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="platform-logout-title" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="platform-logout-title" className="text-lg font-semibold text-slate-950">Sign out of AssetPass?</h2>
            <p className="mt-2 text-sm text-slate-600">Your current session will be ended on this device.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={signingOut} onClick={() => setConfirmLogout(false)} className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" disabled={signingOut} onClick={handleLogout} className="min-h-10 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-50">{signingOut ? "Signing out…" : "Sign out"}</button>
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
