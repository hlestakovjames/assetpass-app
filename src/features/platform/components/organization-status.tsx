import { StatusBadge } from "@/components/status-badge";
import type { OrgStatus } from "@/features/organizations/demo-data";

function OrganizationStatus({ status }: { status: OrgStatus }) {
  const tone =
    status === "Active"
      ? "success"
      : status === "Pending review"
        ? "warning"
        : status === "Suspended"
          ? "danger"
          : "neutral";

  return <StatusBadge label={status} tone={tone} />;
}
