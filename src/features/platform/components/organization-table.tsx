import { OrganizationStatus } from "@/features/platform/components/organization-status";
import type { Organization, ReviewAction } from "@/features/organizations/demo-data";

export function OrganizationTable({
  organizations,
  onReview,
}: {
  organizations: Organization[];
  onReview: (org: Organization, action: ReviewAction) => void;
}) {
  return (
    <div className="table-scroll">
      <table className="asset-table">
        <thead>
          <tr>
            <th>ORGANIZATION</th>
            <th>REGISTRATION ID</th>
            <th>APPLICANT</th>
            <th>SUBMITTED</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <tr key={org.id}>
              <td>
                <div className="asset-name-cell">
                  <span className="asset-thumbnail thumb-other">◇</span>
                  <span className="asset-name-copy">
                    <strong>{org.name}</strong>
                    <small>{org.category}</small>
                  </span>
                </div>
              </td>
              <td>
                <span className="asset-id">{org.id}</span>
              </td>
              <td>
                <span className="custodian-name">{org.applicant}</span>
                <br />
                <span className="department-name">{org.email}</span>
              </td>
              <td>
                <span className="department-name">{org.submitted}</span>
              </td>
              <td>
                <OrganizationStatus status={org.status} />
              </td>
              <td>
                {org.status === "Pending review" ? (
                  <div className="organization-actions">
                    <button
                      className="text-link"
                      onClick={() => onReview(org, "approve")}
                      aria-label={`Approve ${org.name} in demo`}
                    >
                      Review
                    </button>
                    <button
                      className="text-link"
                      onClick={() => onReview(org, "reject")}
                      aria-label={`Reject ${org.name} in demo`}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="department-name">
                    {org.status === "Active"
                      ? `${org.users} users`
                      : org.status === "Suspended"
                        ? "Suspended"
                        : "Rejected"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
