"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/features/authentication/auth-guard";
import { useAuth } from "@/features/authentication/auth-provider";
import {
  activateIndividualWorkspace,
  deactivateIndividualWorkspace,
} from "@/features/authentication/auth-client";

function AccountContextPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const workspaces = user?.availableWorkspaces ?? [];
  const hasIndividualWorkspace = workspaces.some(
    (workspace) => workspace.type === "individual",
  );
  const pendingOrganizations = (user?.organizations ?? []).filter(
    (organization) =>
      organization.status !== "active" ||
      organization.membership.status !== "active",
  );

  async function handleActivate() {
    setBusy(true);
    setError("");
    try {
      await activateIndividualWorkspace();
      router.push("/individual/overview");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to activate your Individual Workspace. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDeactivate() {
    const confirmed = window.confirm(
      "Deactivate your Individual Workspace? Your account and stored records will not be deleted. You can activate the workspace again later.",
    );
    if (!confirmed) return;

    setBusy(true);
    setError("");
    try {
      await deactivateIndividualWorkspace();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to deactivate your Individual Workspace. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              AssetPass account
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Your account and workspaces
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {user?.fullName ?? "Your account"} · {user?.email ?? ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sign out
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Available workspaces</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Your AssetPass account is separate from the workspaces you choose
                to activate or join. You can use one account across different
                authorised contexts.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {workspaces.length} available
            </span>
          </div>

          <div className="mt-6 grid gap-3">
            {workspaces.map((workspace) => (
              <div
                key={`${workspace.type}-${workspace.id ?? "default"}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-medium">{workspace.label}</p>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {workspace.type} workspace
                  </p>
                </div>
                <Link
                  href={workspace.href}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Open workspace
                </Link>
              </div>
            ))}

            {workspaces.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="font-medium">No workspace is currently active</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Your account remains active. You can activate an Individual
                  Workspace or continue an organisation onboarding process.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold">Individual Workspace</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                An optional personal environment for managing your assets,
                documents, plans and personal records. You do not need one just
                to keep an AssetPass account or participate in permitted public
                services.
              </p>
            </div>
            {hasIndividualWorkspace ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Active
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Not activated
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {hasIndividualWorkspace ? (
              <>
                <Link
                  href="/individual/overview"
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Open Individual Workspace
                </Link>
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={busy}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {busy ? "Please wait…" : "Deactivate workspace"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleActivate}
                disabled={busy}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                {busy ? "Activating…" : "Activate Individual Workspace"}
              </button>
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Deactivation does not delete your account or workspace history.
            Access to the Individual Workspace is paused until it is activated
            again.
          </p>
        </section>

        {pendingOrganizations.length > 0 && (
          <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-semibold text-amber-950">
              Organisation onboarding
            </h2>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              These organisation relationships are not yet active workspaces.
              Their current status is shown here without granting organisation
              access prematurely.
            </p>
            <ul className="mt-4 space-y-3">
              {pendingOrganizations.map((organization) => (
                <li key={organization.id} className="rounded-lg bg-white/80 p-4">
                  <p className="font-medium text-slate-900">
                    {organization.displayName}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Organisation: {organization.status.replace(/_/g, " ")} ·
                    Membership: {organization.membership.status.replace(/_/g, " ")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          AssetPass account access is governed by your verified identity,
          relationships and permissions.
        </p>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContextPage />
    </AuthGuard>
  );
}
