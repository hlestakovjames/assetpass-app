import type { Metadata } from "next";
import Link from "next/link";
import { OrganizationOnboardingSession } from "./session";
import { AssetPassBrand } from "@/components/shared/assetpass-brand";

export const metadata: Metadata = {
  title: "Organisation application | AssetPass",
  description: "View the status of your AssetPass organisation application.",
};

export default function OrganizationOnboardingSessionPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f4f7f9" }}>
      <section style={{ width: "min(100%, 620px)", padding: 28, borderRadius: 14, background: "#fff", boxShadow: "0 12px 40px rgba(18,48,71,.08)", display: "grid", gap: 16 }}>
        <AssetPassBrand />
        <div>
          <p style={{ color: "#0f9488", fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>RESTRICTED ONBOARDING SESSION</p>
          <h1 style={{ color: "#123047", fontSize: 26, margin: "0 0 8px" }}>Your organisation application</h1>
          <p style={{ color: "#617486", fontSize: 14, lineHeight: 1.6, margin: 0 }}>This temporary session can only view the application associated with the verified representative email. It is separate from an AssetPass account.</p>
        </div>
        <OrganizationOnboardingSession />
      </section>
    </main>
  );
}
