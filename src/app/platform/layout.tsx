import type { ReactNode } from "react";
import { OrganizationDemoProvider } from "@/features/organizations/organization-demo-provider";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return <OrganizationDemoProvider>{children}</OrganizationDemoProvider>;
}
