"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/authentication/auth-provider";
import { changePassword } from "@/features/authentication/auth-client";

export function AccountSecurityForm() {
  const router = useRouter();
  const { status } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && !success) router.replace("/login");
  }, [status, success, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }
    if (newPassword.length < 12) {
      setError("Use a password containing at least 12 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to change your password.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return <main className="grid min-h-screen place-items-center bg-slate-50"><p className="text-sm text-slate-600">Checking your session…</p></main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8">
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/account" className="text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to account</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Account settings · Security</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Change password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Confirm your current password and choose a new password containing at least 12 characters. Changing your password revokes all active sessions, including this one, so you will need to sign in again.</p>
        {success ? (
          <div className="mt-7 space-y-4">
            <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">Your password has been changed and all existing sessions have been revoked. Sign in again with your new password.</p>
            <Link href="/login" className="inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white">Continue to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="space-y-2"><label htmlFor="currentPassword" className="block text-sm font-medium">Current password</label><input id="currentPassword" type="password" autoComplete="current-password" maxLength={1024} required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"/></div>
            <div className="space-y-2"><label htmlFor="newPassword" className="block text-sm font-medium">New password</label><input id="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={1024} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"/></div>
            <div className="space-y-2"><label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm new password</label><input id="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={1024} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"/></div>
            {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
            <button type="submit" disabled={submitting} className="min-h-11 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">{submitting ? "Updating…" : "Change password"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
