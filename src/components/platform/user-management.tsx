"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  DataPanel,
  ErrorNotice,
  PlatformAdminFrame,
  StatusPill,
} from "./platform-admin-frame";
import { platformApi, type PlatformUser } from "@/features/platform/platform-api";

type ReviewDecision = "approve" | "reject";

export function UserManagement() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [reviewTarget, setReviewTarget] = useState<PlatformUser | null>(null);
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [note, setNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    platformApi.users()
      .then(setUsers)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unable to load users."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => users.filter((user) =>
    [user.fullName, user.email, user.status, user.approvalStatus, ...user.platformRoles]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  ), [users, query]);

  const pendingCount = users.filter((user) => user.approvalStatus === "pending_review").length;
  const unverifiedCount = users.filter((user) => !user.emailVerifiedAt).length;

  function openReview(user: PlatformUser, nextDecision: ReviewDecision) {
    setReviewTarget(user);
    setDecision(nextDecision);
    setNote("");
    setError("");
  }

  function closeReview() {
    if (reviewing) return;
    setReviewTarget(null);
    setDecision(null);
    setNote("");
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewTarget || !decision || reviewing) return;
    if (decision === "reject" && !note.trim()) {
      setError("A reason is required when rejecting an account.");
      return;
    }

    setReviewing(true);
    setError("");
    try {
      const updated = await platformApi.reviewUser(reviewTarget.id, decision, note.trim() || undefined);
      setUsers((current) => current.map((user) =>
        user.id === updated.id ? { ...user, ...updated } : user,
      ));
      setReviewTarget(null);
      setDecision(null);
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to record the account decision.");
    } finally {
      setReviewing(false);
    }
  }

  return (
    <PlatformAdminFrame
      title="User management"
      description="Review new individual and organization-user registrations before granting AssetPass account access. Internal approval is required for account access. Email verification is encouraged but does not block sign-in at this stage; organization membership and organization approval remain separate."
    >
      {error && <div className="mb-5"><ErrorNotice message={error} /></div>}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DataPanel>
          <p className="text-sm text-slate-500">Accounts returned</p>
          <p className="mt-2 text-3xl font-semibold">{users.length}</p>
        </DataPanel>
        <DataPanel>
          <p className="text-sm text-slate-500">Awaiting internal approval</p>
          <p className="mt-2 text-3xl font-semibold">{pendingCount}</p>
        </DataPanel>
        <DataPanel>
          <p className="text-sm text-slate-500">Email verification pending</p>
          <p className="mt-2 text-3xl font-semibold">{unverifiedCount}</p>
        </DataPanel>
        <DataPanel>
          <p className="text-sm text-slate-500">Active accounts</p>
          <p className="mt-2 text-3xl font-semibold">{users.filter((user) => user.status === "active").length}</p>
        </DataPanel>
      </div>

      <DataPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Global user directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              Existing accounts remain approved. Password hashes and authentication secrets are never returned.
            </p>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, status or role"
            aria-label="Search platform users"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
          />
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">Loading users…</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">No matching accounts.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Account</th>
                  <th className="px-3 py-3">Platform role</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Internal approval</th>
                  <th className="px-3 py-3">Account access</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Review actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td className="px-3 py-4">
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-3 py-4">
                      {user.platformRoles.length
                        ? user.platformRoles.join(", ")
                        : <span className="text-slate-400">Standard user</span>}
                    </td>
                    <td className="px-3 py-4">
                      <StatusPill status={user.emailVerifiedAt ? "verified" : "unverified"} />
                    </td>
                    <td className="px-3 py-4">
                      <StatusPill status={user.approvalStatus} />
                      {user.approvalReviewedAt && (
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(user.approvalReviewedAt).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-4"><StatusPill status={user.status} /></td>
                    <td className="px-3 py-4 text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-4">
                      {user.approvalStatus === "pending_review" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openReview(user, "approve")}
                            className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openReview(user, "reject")}
                            className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No action required</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Approving an account grants sign-in access even when email verification is still pending. Email verification remains available as an account-security step.
        </p>
      </DataPanel>

      {reviewTarget && decision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-review-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Account registration review</p>
                <h2 id="user-review-title" className="mt-2 text-xl font-semibold text-slate-950">
                  {decision === "approve" ? "Approve this account?" : "Reject this account?"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{reviewTarget.fullName} · {reviewTarget.email}</p>
              </div>
              <button type="button" onClick={closeReview} disabled={reviewing} aria-label="Close review" className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
            </div>

            <form onSubmit={submitReview} className="mt-5">
              <label htmlFor="user-approval-note" className="block text-sm font-medium text-slate-700">
                {decision === "approve" ? "Review note (optional)" : "Reason for rejection"}
              </label>
              <textarea
                id="user-approval-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                required={decision === "reject"}
                maxLength={500}
                rows={4}
                placeholder={decision === "approve" ? "Add an internal review note…" : "Explain why this registration is being rejected…"}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
              <p className="mt-2 text-xs text-slate-500">
                {reviewTarget.emailVerifiedAt
                  ? "Approval will activate this account. Email verification is not required for sign-in at this stage."
                  : "Email not yet verified. Approval will activate this account; email verification can be completed later."}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={closeReview} disabled={reviewing} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing || (decision === "reject" && !note.trim())}
                  className={decision === "approve"
                    ? "rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                    : "rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-50"}
                >
                  {reviewing ? "Saving decision…" : decision === "approve" ? "Confirm approval" : "Confirm rejection"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </PlatformAdminFrame>
  );
}
