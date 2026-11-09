"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

function GuardLoadingState() {
  return (
    <main
      className="flex min-h-screen items-center justify-center"
      aria-busy="true"
      aria-live="polite"
    >
      <p>Verifying your AssetPass session...</p>
    </main>
  );
}

function GuardErrorState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="max-w-md text-center">
        <h1 className="text-xl font-semibold">
          Unable to verify your session
        </h1>

        <p className="mt-2 text-sm">
          AssetPass could not reach the authentication service.
          Check your connection and try again.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white"
        >
          Retry
        </button>
      </section>
    </main>
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status, retrySessionRestore } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <>
      <div hidden={status !== "authenticated"}>
        {children}
      </div>

      {(status === "loading" || status === "unauthenticated") && (
        <GuardLoadingState />
      )}

      {status === "error" && (
        <GuardErrorState onRetry={retrySessionRestore} />
      )}
    </>
  );
}
