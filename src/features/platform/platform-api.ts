import { apiFetch } from "@/features/authentication/auth-client";

export type OrganizationStatus = "pending_review" | "active" | "suspended" | "rejected";
export type PlatformOrganization = {
  id: string;
  displayName: string;
  legalName: string | null;
  category: string;
  registrationNumber: string | null;
  contactEmail: string;
  contactPhone: string | null;
  countryCode: string;
  county: string | null;
  city: string | null;
  status: OrganizationStatus;
  createdAt: string;
  reviewedAt: string | null;
  decisionNote: string | null;
};

export type PlatformUser = {
  id: string;
  fullName: string;
  email: string;
  status: "active" | "inactive" | "suspended";
  lastLoginAt: string | null;
  createdAt: string;
  deactivatedAt: string | null;
  platformRoles: string[];
};

export type PlatformPermission = {
  id: string;
  key: string;
  name: string;
  description: string;
  scope: "platform" | "organization" | "personal";
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
  const response = await apiFetch(path, { ...init, headers });
  const payload = await response.json().catch(() => null) as (T & { message?: string | string[] }) | null;
  if (!response.ok) {
    const message = payload && "message" in payload
      ? payload.message
      : "The request could not be completed.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message || "The request could not be completed.");
  }
  return payload as T;
}

export const platformApi = {
  organizations: () => request<PlatformOrganization[]>("/platform/organizations"),
  reviewOrganization: (id: string, status: OrganizationStatus, note?: string) =>
    request<PlatformOrganization>(`/platform/organizations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    }),
  users: () => request<PlatformUser[]>("/platform/users"),
  administrators: () => request<Array<{ roleId: string; user: Pick<PlatformUser, "id" | "fullName" | "email" | "status">; permissionKeys: string[] }>>("/platform/administrators"),
  assignAdministrator: (userId: string, reason: string) =>
    request<{ roleId: string; userId: string; role: string }>("/platform/administrators", {
      method: "POST",
      body: JSON.stringify({ userId, reason }),
    }),
  revokeAdministrator: (userId: string) =>
    request<{ userId: string; revoked: boolean }>(`/platform/administrators/${userId}`, { method: "DELETE" }),
  permissions: () => request<PlatformPermission[]>("/platform/permissions"),
  administratorPermissions: (userId: string) =>
    request<Array<Pick<PlatformPermission, "key" | "name">>>(`/platform/administrators/${userId}/permissions`),
  replaceAdministratorPermissions: (userId: string, permissionKeys: string[]) =>
    request<{ userId: string; permissionKeys: string[] }>(`/platform/administrators/${userId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissionKeys }),
    }),
};
