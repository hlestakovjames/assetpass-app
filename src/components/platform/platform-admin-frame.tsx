import Link from "next/link";
import type { ReactNode } from "react";

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
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Platform-wide actions are permission checked by the backend.
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
    pending_review: "bg-amber-50 text-amber-800",
    suspended: "bg-rose-50 text-rose-700",
    rejected: "bg-slate-100 text-slate-600",
    inactive: "bg-slate-100 text-slate-600",
  };
  const label = status.replaceAll("_", " ");
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>{label}</span>;
}
