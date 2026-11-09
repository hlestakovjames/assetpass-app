import { PlatformOverview } from "@/components/platform/platform-overview";

// This page loads its dashboard data client-side, so Next.js cannot validate
// the segment for instant navigation. Keep the route rendered normally.
export const instant = false;

export default function PlatformOverviewPage() {
  return <PlatformOverview />;
}
