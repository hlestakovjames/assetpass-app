import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { VerifyEmail } from "./verify-email";
import styles from "../login/login.module.css";

export const metadata: Metadata = {
  title: "Verify email | AssetPass",
  description: "Verify your email address to activate your AssetPass account.",
};

export default function VerifyEmailPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="AssetPass home">
          <span className={styles.brandMark}>AP</span>
          <span className={styles.brandName}>Asset<span>Pass</span></span>
        </Link>
        <span className={styles.headerLabel}>ASSET INTELLIGENCE PLATFORM</span>
      </header>
      <section className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeading}>
            <span className={styles.eyebrow}>ACCOUNT ACTIVATION</span>
            <h1>Verify your email</h1>
            <p>We are confirming the email address associated with your AssetPass account.</p>
          </div>
          <Suspense fallback={<p className={styles.formNote}>Checking your verification link...</p>}>
            <VerifyEmail />
          </Suspense>
        </div>
      </section>
      <footer className={styles.footer}>
        <span>© 2026 AssetPass</span>
        <span>Asset identity. Accountability. Intelligence.</span>
      </footer>
    </main>
  );
}
