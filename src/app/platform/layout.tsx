import { Suspense, type ReactNode } from "react";
import { OrganizationDemoProvider } from "@/features/organizations/organization-demo-provider";
import { AuthGuard } from "@/features/authentication/auth-guard";

function PlatformLoadingState() {
  return (
    <main
      className="flex min-h-screen items-center justify-center"
      aria-busy="true"
      aria-live="polite"
    >
      <p>Loading AssetPass platform...</p>
    </main>
  );
}

export default function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <OrganizationDemoProvider>
        <Suspense fallback={<PlatformLoadingState />}>
          {children}
        </Suspense>
      </OrganizationDemoProvider>
    </AuthGuard>
  );
}
