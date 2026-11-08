import { Suspense, type ReactNode } from "react";
import { OrganizationDemoProvider } from "@/features/organizations/organization-demo-provider";

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

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <OrganizationDemoProvider>
      <Suspense fallback={<PlatformLoadingState />}>{children}</Suspense>
    </OrganizationDemoProvider>
  );
}
