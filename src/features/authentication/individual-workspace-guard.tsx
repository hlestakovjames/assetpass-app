"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export function IndividualWorkspaceGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, status } = useAuth();
  const hasIndividualWorkspace = Boolean(
    user?.availableWorkspaces?.some((workspace) => workspace.type === "individual"),
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && !hasIndividualWorkspace) {
      router.replace("/account");
    }
  }, [status, hasIndividualWorkspace, router]);

  if (status !== "authenticated" || !hasIndividualWorkspace) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-slate-500" role="status">
          Verifying your Individual Workspace access…
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
