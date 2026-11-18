import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";
import styles from "../login/login.module.css";

export const metadata: Metadata = {
  title: "Create account | AssetPass",
  description: "Create your AssetPass account and activate the workspaces you need.",
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
            <h1>Get started with AssetPass</h1>
            <p>Create a personal AssetPass account or submit an organisation application. Organisation applications do not require a personal account and are reviewed separately.</p>
          </div>
          <RegisterForm />
          <div className={styles.securityNote}>
            <span className={styles.securityIcon}>✓</span>
            <span>Personal accounts activate immediately; organisation applications follow a separate review process</span>
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
