import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";
import styles from "../login/login.module.css";

export const metadata: Metadata = {
  title: "Create account | AssetPass",
  description: "Create your AssetPass identity and verify your email address.",
};

export default function RegisterPage() {
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
            <span className={styles.eyebrow}>GET STARTED</span>
            <h1>Create your account</h1>
            <p>Set up your personal AssetPass identity. You can join or register an organization after verifying your email.</p>
          </div>
          <RegisterForm />
          <div className={styles.securityNote}>
            <span className={styles.securityIcon}>✓</span>
            <span>Email verification is required before sign-in</span>
          </div>
        </div>
        <div className={styles.marketplace}>
          <span>Already registered?</span>
          <Link href="/login">Sign in <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <footer className={styles.footer}>
        <span>© 2026 AssetPass</span>
        <span>Asset identity. Accountability. Intelligence.</span>
      </footer>
    </main>
  );
}
