import { OrganizationMembersManagement } from "@/components/organization/organization-members-management";

export default async function OrganizationMembersPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <OrganizationMembersManagement organizationId={organizationId} />;
}
