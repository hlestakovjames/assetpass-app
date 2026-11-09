"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { registerAccount } from "@/features/authentication/auth-client";
import styles from "../login/login.module.css";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 12) {
      setError("Use a password containing at least 12 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await registerAccount({ fullName: fullName.trim(), email: email.trim().toLowerCase(), password });
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {success ? (
        <div className={styles.form} role="status" aria-live="polite">
          <div className={styles.securityNote} style={{ marginTop: 0, padding: "14px", border: "1px solid #b9e5d8", borderRadius: 8, background: "#effaf6", color: "#176b58" }}>
            <span className={styles.securityIcon}>✓</span>
            <span>{success}</span>
          </div>
          <p className={styles.formNote}>Your account is active immediately. You can now sign in with the email address and password you just registered.</p>
          <Link href="/login" style={{ color: "#0f8f84", textAlign: "center", fontSize: 12, fontWeight: 700 }}>Return to sign in</Link>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="fullName">Full name</label>
            <div className={styles.inputWrap}>
              <input id="fullName" name="fullName" type="text" autoComplete="name" placeholder="Your full name" value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} maxLength={200} required disabled={submitting} />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email address</label>
            <div className={styles.inputWrap}>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={320} required disabled={submitting} />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrap}>
              <input id="password" name="password" type="password" autoComplete="new-password" placeholder="At least 12 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} maxLength={1024} required disabled={submitting} />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className={styles.inputWrap}>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Enter your password again" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={12} maxLength={1024} required disabled={submitting} />
            </div>
          </div>
          {error && <div className={styles.error} role="alert"><span aria-hidden="true">!</span>{error}</div>}
          <button className={styles.submit} type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? "Creating account..." : <>Create AssetPass account <span aria-hidden="true">→</span></>}
          </button>
          <p className={styles.formNote}>Your account is activated immediately after registration. By creating an account, you agree to use accurate identity and contact information.</p>
        </form>
      )}
    </div>
  );
}
