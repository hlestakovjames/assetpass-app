import { apiFetch } from "@/features/authentication/auth-client";

export type OrganizationMembershipStatus = "pending" | "active" | "suspended" | "rejected" | "removed";
export type OrganizationStatus = "pending_review" | "active" | "suspended" | "rejected";

export type OrganizationContext = {
  membership_id: string;
  membership_status: OrganizationMembershipStatus;
  membership_created_at: string;
  id: string;
  display_name: string;
  category: string;
  status: OrganizationStatus;
};

export type OrganizationWorkspace = {
  organization: {
    id: string;
    displayName: string;
    legalName: string | null;
    category: string;
    registrationNumber: string | null;
    contactEmail: string;
    contactPhone: string | null;
    city: string | null;
    county: string | null;
    status: OrganizationStatus;
  };
  membership: { id: string; status: OrganizationMembershipStatus; joinedAt: string | null };
  roles: Array<{ key: string; name: string }>;
  permissions: string[];
};

export type OrganizationMember = {
  id: string;
  status: OrganizationMembershipStatus;
  joinedAt: string | null;
  createdAt: string;
  user: { id: string; fullName: string; email: string; status: "active" | "inactive" | "suspended" } | null;
  roles: Array<{ key: string; name: string }>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
  const response = await apiFetch(path, { ...init, headers });
  const payload = await response.json().catch(() => null) as (T & { message?: string | string[] }) | null;
  if (!response.ok) {
    const message = payload && "message" in payload ? payload.message : "The request could not be completed.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message || "The request could not be completed.");
  }
  return payload as T;
}

export const organizationApi = {
  mine: () => request<OrganizationContext[]>("/organizations/mine"),
  workspace: (organizationId: string) => request<OrganizationWorkspace>(`/organizations/${organizationId}`),
  members: (organizationId: string) => request<OrganizationMember[]>(`/organizations/${organizationId}/members`),
  invite: (organizationId: string, email: string, roleKey: string) =>
    request<{ id: string; status: OrganizationMembershipStatus; email: string; fullName: string; role: string }>(`/organizations/${organizationId}/invitations`, {
      method: "POST", body: JSON.stringify({ email, roleKey }),
    }),
  acceptInvitation: (organizationId: string, membershipId: string) =>
    request<{ membershipId: string; organizationId: string; status: OrganizationMembershipStatus }>(`/organizations/${organizationId}/members/${membershipId}/accept`, { method: "POST" }),
  changeMemberStatus: (organizationId: string, membershipId: string, status: OrganizationMembershipStatus) =>
    request<{ membershipId: string; status: OrganizationMembershipStatus }>(`/organizations/${organizationId}/members/${membershipId}/status`, {
      method: "PATCH", body: JSON.stringify({ status }),
    }),
  changeMemberRole: (organizationId: string, membershipId: string, roleKey: string) =>
    request<{ membershipId: string; role: { key: string; name: string } }>(`/organizations/${organizationId}/members/${membershipId}/role`, {
      method: "PUT", body: JSON.stringify({ roleKey }),
    }),
};
