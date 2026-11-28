import type { Metadata } from "next";
import { AccountSecurityForm } from "./account-security-form";

export const metadata: Metadata = {
  title: "Account security | AssetPass",
  description: "Manage your AssetPass account security.",
  robots: { index: false, follow: false },
};

export default function AccountSecurityPage() {
  return <AccountSecurityForm />;
}
