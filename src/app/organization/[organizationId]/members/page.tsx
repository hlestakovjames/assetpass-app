import { Suspense } from "react";
import { OrganizationMembersManagement } from "@/components/organization/organization-members-management";

async function MembersPageContent({ params }: { params: Promise<{ organizationId: string }> }) {
  const { organizationId } = await params;
  return <OrganizationMembersManagement organizationId={organizationId} />;
}

export default function OrganizationMembersPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  return <Suspense fallback={<main className="min-h-screen bg-slate-50 p-8 text-sm text-slate-500">Loading organization members…</main>}><MembersPageContent params={params} /></Suspense>;
}
