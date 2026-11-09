import { UserManagement } from "@/components/platform/user-management";

// This management page opts out of Next.js instant-navigation validation.
export const instant = false;

export default function UsersPage() {
  return <UserManagement />;
}
