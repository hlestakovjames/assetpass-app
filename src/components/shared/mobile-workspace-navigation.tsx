"use client";

import Link from "next/link";
import { useState } from "react";

export type WorkspaceNavLink = { href: string; label: string };

export function MobileWorkspaceNavigation({
  links,
  workspaceLabel,
}: {
  links: WorkspaceNavLink[];
  workspaceLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" aria-label={`Open ${workspaceLabel} navigation`} aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-xl text-slate-700 hover:bg-slate-50 sm:hidden">☰</button>
      {open && (
        <div className="fixed inset-0 z-[70] sm:hidden">
          <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-950/50" />
          <aside className="absolute inset-y-0 left-0 flex w-[min(84vw,320px)] flex-col bg-white shadow-2xl" aria-label={`${workspaceLabel} navigation`}>
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
              <span className="font-semibold text-slate-900">{workspaceLabel}</span>
              <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-lg text-2xl text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800">{link.label}</Link>)}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
