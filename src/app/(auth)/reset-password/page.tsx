import type { Metadata } from "next";
import { ResetPasswordForm } from "../password-recovery-forms";

export const metadata: Metadata = {
  title: "Reset password | AssetPass",
  description: "Set a new password for your AssetPass account.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
