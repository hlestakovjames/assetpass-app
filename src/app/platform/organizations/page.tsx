import { OrganizationManagement } from "@/components/platform/organization-management";

// This management page opts out of Next.js instant-navigation validation.
export const instant = false;

export default function OrganizationsPage() {
  return <OrganizationManagement />;
}
