import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Sign in | AssetPass",
  description: "Sign in securely to your AssetPass workspace.",
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="AssetPass home">
          <span className={styles.brandMark}>AP</span>
          <span className={styles.brandName}>
            Asset<span>Pass</span>
          </span>
        </Link>
        <span className={styles.headerLabel}>ASSET INTELLIGENCE PLATFORM</span>
      </header>

      <section className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeading}>
            <span className={styles.eyebrow}>WELCOME BACK</span>
            <h1>Sign in</h1>
            <p>
              Access your AssetPass account to manage your assets,
              workspaces and activities.
            </p>
          </div>

          <LoginForm />

          <div className={styles.securityNote}>
            <span className={styles.securityIcon}>✓</span>
            <span>Secure, session-based account protection</span>
          </div>
        </div>

        <div className={styles.marketplace}>
          <span>New to AssetPass?</span>
          <Link href="/register">Create an account <span aria-hidden="true">→</span></Link>
          <span aria-hidden="true">·</span>
          <Link href="/marketplace">Explore marketplace</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>© 2026 AssetPass</span>
        <span>Asset identity. Accountability. Intelligence.</span>
      </footer>
    </main>
  );
}
