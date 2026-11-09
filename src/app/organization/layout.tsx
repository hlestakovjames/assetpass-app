import type { ReactNode } from "react";
import { AuthGuard } from "@/features/authentication/auth-guard";

export default function OrganizationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
