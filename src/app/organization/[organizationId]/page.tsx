import { OrganizationWorkspaceDashboard } from "@/components/organization/organization-workspace-dashboard";

export default async function OrganizationWorkspacePage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <OrganizationWorkspaceDashboard organizationId={organizationId} />;
}
