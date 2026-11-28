import type { Metadata } from "next";
import { ForgotPasswordForm } from "../password-recovery-forms";

export const metadata: Metadata = {
  title: "Forgot password | AssetPass",
  description: "Request a secure AssetPass password reset link.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
