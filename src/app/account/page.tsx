"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/features/authentication/auth-guard";
import { useAuth } from "@/features/authentication/auth-provider";
import {
  activateIndividualWorkspace,
  claimOrganizationWithToken,
  deactivateIndividualWorkspace,
  selectWorkspaceContext,
  optInMarketplace,
  revokeMarketplace,
} from "@/features/authentication/auth-client";

function AccountContextPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [switchingWorkspace, setSwitchingWorkspace] = useState<string | null>(null);
  const [claimingOrganization, setClaimingOrganization] = useState(false);
  const [organizationClaimToken, setOrganizationClaimToken] = useState("");
  const [marketplaceBusy, setMarketplaceBusy] = useState(false);
  const [marketplaceAcknowledgement, setMarketplaceAcknowledgement] = useState(false);

  const workspaces = user?.availableWorkspaces ?? [];
  const hasIndividualWorkspace = workspaces.some(
    (workspace) => workspace.type === "individual",
  );
  const marketplaceActive = user?.applicationEntitlements?.marketplace?.active ?? false;
  const marketplaceRepresentations = user?.marketplaceOrganizationRepresentations ?? [];
  const pendingOrganizations = (user?.organizations ?? []).filter(
    (organization) =>
      organization.status !== "active" ||
      organization.membership.status !== "active",
  );

  async function handleClaimOrganization() {
    if (!organizationClaimToken.trim()) {
      setError("Enter the one-time claim code sent to the representative email address after organisation approval.");
      return;
    }
    setClaimingOrganization(true);
    setError("");
    try {
      const refreshedUser = await claimOrganizationWithToken(organizationClaimToken.trim());
      setOrganizationClaimToken("");
      const organizationWorkspace = refreshedUser.availableWorkspaces.find(
        (workspace) => workspace.type === "organization",
      );
      if (organizationWorkspace) {
        await selectWorkspaceContext(organizationWorkspace);
        router.push(organizationWorkspace.href);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to claim an approved organisation.");
    } finally {
      setClaimingOrganization(false);
    }
  }

  async function handleSelectWorkspace(workspace: (typeof workspaces)[number]) {
    const key = `${workspace.type}-${workspace.id ?? "platform"}`;
    setSwitchingWorkspace(key);
    setError("");
    try {
      await selectWorkspaceContext(workspace);
      router.push(workspace.href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to switch workspace context.");
    } finally {
      setSwitchingWorkspace(null);
    }
  }

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

  async function handleMarketplaceOptIn() {
    if (!marketplaceAcknowledgement) {
      setError("Confirm the Marketplace participation acknowledgement before continuing.");
      return;
    }
    setMarketplaceBusy(true);
    setError("");
    try {
      await optInMarketplace();
      setMarketplaceAcknowledgement(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to activate Marketplace participation.");
    } finally {
      setMarketplaceBusy(false);
    }
  }

  async function handleMarketplaceRevoke() {
    const confirmed = window.confirm(
      "Turn off your individual Marketplace participation? Your AssetPass identity, App access and organisation relationships will remain unchanged.",
    );
    if (!confirmed) return;
    setMarketplaceBusy(true);
    setError("");
    try {
      await revokeMarketplace("Individual opted out from Account Settings.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to turn off Marketplace participation.");
    } finally {
      setMarketplaceBusy(false);
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
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/account/security"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Account security
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
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
                <button
                  type="button"
                  onClick={() => handleSelectWorkspace(workspace)}
                  disabled={switchingWorkspace !== null}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {switchingWorkspace === `${workspace.type}-${workspace.id ?? "platform"}`
                    ? "Switching…"
                    : user?.selectedWorkspace?.type === workspace.type &&
                        user.selectedWorkspace?.id === workspace.id
                      ? "Current workspace"
                      : "Open workspace"}
                </button>
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

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold">AssetPass Marketplace participation</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Marketplace access is separate from your AssetPass App account. Opting in lets you use eligible individual participant features; it does not grant authority to represent an organisation or list or sell a particular asset.
              </p>
            </div>
            <span className={marketplaceActive
              ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"}>
              {marketplaceActive ? "Active" : "Not enabled"}
            </span>
          </div>
          {marketplaceActive ? (
            <button
              type="button"
              onClick={handleMarketplaceRevoke}
              disabled={marketplaceBusy}
              className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {marketplaceBusy ? "Please wait…" : "Turn off individual Marketplace access"}
            </button>
          ) : (
            <div className="mt-5">
              <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                <input
                  type="checkbox"
                  checked={marketplaceAcknowledgement}
                  onChange={(event) => setMarketplaceAcknowledgement(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span>
                  I understand that Marketplace participation is a separate application entitlement and does not by itself authorize me to act for an organisation or to list, sell, own or take custody of an asset.
                </span>
              </label>
              <button
                type="button"
                onClick={handleMarketplaceOptIn}
                disabled={marketplaceBusy || !marketplaceAcknowledgement}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {marketplaceBusy ? "Activating…" : "Opt in to Marketplace"}
              </button>
            </div>
          )}
          {marketplaceRepresentations.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold">Organisation Marketplace representation</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                These are separate organisation grants. They do not make you the legal owner or automatically authorize asset listings.
              </p>
              <ul className="mt-3 space-y-2">
                {marketplaceRepresentations.map((representation) => (
                  <li key={representation.grantId} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <span className="font-medium">{representation.displayName}</span>
                    <span className="ml-2 text-xs text-slate-500">Authorised representative</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Claim an approved organisation</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            After platform approval, AssetPass sends a one-time claim code to the representative email. Sign in with an AssetPass account using that same email address, then enter the code here. The code proves control of the representative inbox; it is not your password.
          </p>
          <input
            type="text"
            value={organizationClaimToken}
            onChange={(event) => setOrganizationClaimToken(event.target.value)}
            placeholder="One-time organisation claim code"
            autoComplete="one-time-code"
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="button"
            onClick={handleClaimOrganization}
            disabled={claimingOrganization}
            className="mt-3 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {claimingOrganization ? "Claiming organisation…" : "Check and claim organisation"}
          </button>
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
