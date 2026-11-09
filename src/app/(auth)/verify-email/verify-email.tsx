"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmailAddress } from "@/features/authentication/auth-client";
import styles from "../login/login.module.css";

export function VerifyEmail() {
  const params = useSearchParams();
  const token = params.get("token");
  const [message, setMessage] = useState("Checking your verification link...");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token) {
      setMessage("This verification link is missing its token. Request another email from the registration page.");
      setError(true);
      return () => { active = false; };
    }
    verifyEmailAddress(token).then((result) => {
      if (active) setMessage(result.message);
    }).catch((reason: unknown) => {
      if (active) {
        setMessage(reason instanceof Error ? reason.message : "This verification link is invalid or has expired.");
        setError(true);
      }
    });
    return () => { active = false; };
  }, [token]);

  return (
    <div className={styles.form}>
      <div className={error ? styles.error : styles.securityNote} role="status" aria-live="polite">
        {!error && <span className={styles.securityIcon}>✓</span>}
        <span>{message}</span>
      </div>
      {!error && <Link href="/login" className={styles.submit} style={{ textDecoration: "none" }}>Continue to sign in <span aria-hidden="true">→</span></Link>}
      {error && <Link href="/register" className={styles.submit} style={{ textDecoration: "none" }}>Return to registration</Link>}
    </div>
  );
}
