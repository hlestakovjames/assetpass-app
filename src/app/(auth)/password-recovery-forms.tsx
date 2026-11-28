"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  requestPasswordReset,
  resetPassword,
} from "@/features/authentication/auth-client";
import styles from "./login/login.module.css";

function AuthPageShell({ title, description, children }: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="AssetPass home">
          <Image src="/brand/Assetpass%20Logo.png" alt="" width={48} height={48} className={styles.brandMark}/>
          <span className={styles.brandName}>Asset<span>Pass</span></span>
        </Link>
        <span className={styles.headerLabel}>ASSET INTELLIGENCE PLATFORM</span>
      </header>
      <section className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeading}>
            <span className={styles.eyebrow}>ACCOUNT SECURITY</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
          <div className={styles.securityNote}>
            <span className={styles.securityIcon}>✓</span>
            <span>Secure, single-use account recovery</span>
          </div>
        </div>
        <div className={styles.marketplace}>
          <span>Remembered your password?</span>
          <Link href="/login">Return to sign in</Link>
        </div>
      </section>
      <footer className={styles.footer}>
        <span>© 2026 AssetPass</span>
        <span>Asset identity. Accountability. Intelligence.</span>
      </footer>
    </main>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const result = await requestPasswordReset(email.trim().toLowerCase());
      setMessage(result.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to request a password reset.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell title="Reset your password" description="Enter your AssetPass account email. If an account exists, we will send a one-time password reset link.">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="email">Email address</label>
          <div className={styles.inputWrap}>
            <input id="email" name="email" type="email" autoComplete="email" maxLength={320} required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"/>
          </div>
        </div>
        {error && <div className={styles.error} role="alert"><span>!</span>{error}</div>}
        {message && <div className={styles.securityNote} role="status">{message}</div>}
        <button className={styles.submit} type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send password reset link"} <span aria-hidden="true">→</span></button>
      </form>
    </AuthPageShell>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const tokenRef = useRef<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fragment = window.location.hash.slice(1);
    if (fragment) {
      tokenRef.current = fragment;
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const token = tokenRef.current;
    if (!token) {
      setError("This reset link is missing its one-time token. Request a new link.");
      return;
    }
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
      await resetPassword(token, newPassword);
      tokenRef.current = null;
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to reset your password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell title="Choose a new password" description="Reset links expire after 15 minutes and can only be used once. Choose a password containing at least 12 characters.">
      {success ? (
        <div className={styles.form}>
          <div className={styles.securityNote} role="status">Your password has been reset. All existing sessions have been revoked. Sign in again using your new password.</div>
          <button type="button" className={styles.submit} onClick={() => router.replace("/login")}>Continue to sign in <span aria-hidden="true">→</span></button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="newPassword">New password</label>
            <div className={styles.inputWrap}><input id="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={1024} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)}/></div>
          </div>
          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirm new password</label>
            <div className={styles.inputWrap}><input id="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={1024} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}/></div>
          </div>
          {error && <div className={styles.error} role="alert"><span>!</span>{error}</div>}
          <button className={styles.submit} type="submit" disabled={submitting}>{submitting ? "Updating…" : "Reset password"} <span aria-hidden="true">→</span></button>
        </form>
      )}
    </AuthPageShell>
  );
}
