"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export function PlatformWorkspaceGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, status } = useAuth();
  const hasPlatformRole = Boolean(user?.platformRoles?.length);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && !hasPlatformRole) {
      router.replace(user?.defaultWorkspace?.href ?? "/individual/overview");
    }
  }, [status, hasPlatformRole, user?.defaultWorkspace?.href, router]);

  if (status !== "authenticated" || !hasPlatformRole) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-slate-500" role="status">
          Verifying your platform administration access…
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
