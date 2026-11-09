import type { ReactNode } from "react";
import { AuthGuard } from "@/features/authentication/auth-guard";

export default function IndividualLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
