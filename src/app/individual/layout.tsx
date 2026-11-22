import type { ReactNode } from "react";
import { AuthGuard } from "@/features/authentication/auth-guard";
import { IndividualWorkspaceGuard } from "@/features/authentication/individual-workspace-guard";

export default function IndividualLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <IndividualWorkspaceGuard>{children}</IndividualWorkspaceGuard>
    </AuthGuard>
  );
}
