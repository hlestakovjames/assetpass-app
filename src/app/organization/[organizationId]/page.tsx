import { Suspense } from "react";
import { OrganizationWorkspaceDashboard } from "@/components/organization/organization-workspace-dashboard";

async function WorkspacePageContent({ params }: { params: Promise<{ organizationId: string }> }) {
  const { organizationId } = await params;
  return <OrganizationWorkspaceDashboard organizationId={organizationId} />;
}

export default function OrganizationWorkspacePage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  return <Suspense fallback={<main className="min-h-screen bg-slate-50 p-8 text-sm text-slate-500">Opening organization workspace…</main>}><WorkspacePageContent params={params} /></Suspense>;
}
