import { RolesPermissionsManagement } from "@/components/platform/roles-permissions-management";

// This management screen relies on client-side authenticated data loading.
// Keep it out of Next.js instant-navigation validation until it supports
// a fully validated instant-navigation render.
export const instant = false;

export default function RolesPermissionsPage() {
  return <RolesPermissionsManagement />;
}
