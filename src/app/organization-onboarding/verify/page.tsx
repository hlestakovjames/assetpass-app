import type { Metadata } from "next";
import Link from "next/link";
import { OrganizationOnboardingVerification } from "./verification";

export const metadata: Metadata = {
  title: "Verify organisation application | AssetPass",
  description: "Verify the representative email for an AssetPass organisation application.",
};

export default async function OrganizationOnboardingVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f4f7f9" }}>
      <section style={{ width: "min(100%, 520px)", padding: 28, borderRadius: 14, background: "#fff", boxShadow: "0 12px 40px rgba(18,48,71,.08)", display: "grid", gap: 16 }}>
        <Link href="/" style={{ color: "#0f8f84", fontWeight: 800, textDecoration: "none" }}>AssetPass</Link>
        <div>
          <p style={{ color: "#0f9488", fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>ORGANISATION ONBOARDING</p>
          <h1 style={{ color: "#123047", fontSize: 26, margin: "0 0 8px" }}>Verify representative email</h1>
          <p style={{ color: "#617486", fontSize: 14, lineHeight: 1.6, margin: 0 }}>Verification confirms control of the representative email address. It does not create a personal AssetPass account or approve the organisation.</p>
        </div>
        <OrganizationOnboardingVerification token={params.token ?? ""} />
      </section>
    </main>
  );
}
