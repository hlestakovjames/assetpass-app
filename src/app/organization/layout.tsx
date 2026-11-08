import type { ReactNode } from "react";

/** Organization workspace layout. Authentication and organization-scoped authorization will be integrated in the security phase. */
export default function OrganizationLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
