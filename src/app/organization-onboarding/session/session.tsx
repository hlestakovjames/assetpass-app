"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  closeOrganizationOnboardingSession,
  getOrganizationOnboardingSession,
  type OrganizationOnboardingSessionData,
} from "@/features/authentication/auth-client";

const TOKEN_KEY = "assetpass.organizationOnboarding.token";
const EXPIRY_KEY = "assetpass.organizationOnboarding.expiresAt";

export function OrganizationOnboardingSession() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<OrganizationOnboardingSessionData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      const storedToken = window.sessionStorage.getItem(TOKEN_KEY) ?? "";
      const expiresAt = window.sessionStorage.getItem(EXPIRY_KEY) ?? "";
      if (!storedToken || !expiresAt || Date.parse(expiresAt) <= Date.now()) {
        window.sessionStorage.removeItem(TOKEN_KEY);
        window.sessionStorage.removeItem(EXPIRY_KEY);
        if (active) {
          setError("This temporary onboarding session is missing or has expired. Use the latest representative email verification link or contact AssetPass support.");
          setBusy(false);
        }
        return;
      }
      if (active) setToken(storedToken);
      return getOrganizationOnboardingSession(storedToken)
        .then((result) => { if (active) setData(result); })
        .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load this application."); })
        .finally(() => { if (active) setBusy(false); });
    });
    return () => { active = false; };
  }, []);

  async function closeSession() {
    if (!token) return;
    setClosing(true);
    try {
      await closeOrganizationOnboardingSession(token);
      window.sessionStorage.removeItem(TOKEN_KEY);
      window.sessionStorage.removeItem(EXPIRY_KEY);
      setToken("");
      setData(null);
      setError("Your restricted onboarding session has been closed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to close the session.");
    } finally {
      setClosing(false);
    }
  }

  if (busy) return <p role="status" style={{ color: "#617486" }}>Loading your application…</p>;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {error && <p role="alert" style={{ color: "#8a3b24", background: "#fff5ef", padding: 12, borderRadius: 8 }}>{error}</p>}
      {data && (
        <>
          <div style={{ padding: 16, border: "1px solid #dce6eb", borderRadius: 10, display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "#617486", fontSize: 12 }}>APPLICATION STATUS</p>
            <strong style={{ color: "#123047", fontSize: 18 }}>{data.status.replaceAll("_", " ")}</strong>
            <p style={{ margin: 0, color: "#617486", fontSize: 13 }}>{data.organization?.displayName ?? "Organisation details"} · {data.representative.email}</p>
            {data.organization?.decisionNote && <p style={{ margin: 0, color: "#8a3b24", fontSize: 13 }}>Platform decision note: {data.organization.decisionNote}</p>}
          </div>
          <p style={{ color: "#617486", fontSize: 13, lineHeight: 1.6, margin: 0 }}>This session expires after two hours and closes after 30 minutes without activity. Its current permission is read-only. Evidence upload and response workflows will be enabled only after the private document-storage integration is in place.</p>
          <button type="button" onClick={closeSession} disabled={closing} style={{ border: "1px solid #cbd7de", borderRadius: 8, padding: 12, background: "#fff", color: "#123047", fontWeight: 700, cursor: closing ? "wait" : "pointer" }}>
            {closing ? "Closing…" : "Close onboarding session"}
          </button>
        </>
      )}
      {!data && <Link href="/organization-onboarding/verify" style={{ color: "#0f8f84", fontWeight: 700 }}>Return to verification information</Link>}
    </div>
  );
}
