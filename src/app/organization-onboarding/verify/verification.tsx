"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { verifyOrganizationOnboardingEmail } from "@/features/authentication/auth-client";

export function OrganizationOnboardingVerification({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  async function verify() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await verifyOrganizationOnboardingEmail(token);
      window.sessionStorage.setItem("assetpass.organizationOnboarding.token", result.onboardingSessionToken);
      window.sessionStorage.setItem("assetpass.organizationOnboarding.expiresAt", result.onboardingSessionExpiresAt);
      setMessage(result.message);
      setVerified(true);
      router.push("/organization-onboarding/session");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to verify this organisation application.");
    } finally {
      setBusy(false);
    }
  }

  if (!token) return <p role="alert" style={{ color: "#a33" }}>This verification link is missing its token. Open the complete link from your email.</p>;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {message && <p role="status" style={{ color: "#176b58", background: "#effaf6", padding: 12, borderRadius: 8 }}>{message}</p>}
      {error && <p role="alert" style={{ color: "#a33", background: "#fff3f2", padding: 12, borderRadius: 8 }}>{error}</p>}
      {!verified ? (
        <button type="button" onClick={verify} disabled={busy} style={{ border: 0, borderRadius: 8, padding: 14, background: "#123047", color: "#fff", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>
          {busy ? "Verifying…" : "Verify representative email"}
        </button>
      ) : (
        <Link href="/organization-onboarding/session" style={{ color: "#0f8f84", fontWeight: 700 }}>Continue to your restricted application session →</Link>
      )}
    </div>
  );
}
