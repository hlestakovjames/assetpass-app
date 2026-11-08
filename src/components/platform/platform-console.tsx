"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOrganizationDemo } from "@/features/organizations/organization-demo-provider";
import { ActivityList, type Activity } from "@/components/platform/activity-list";
import { OrganizationTable } from "@/components/platform/organization-table";
import type { Organization, OrgStatus, ReviewAction } from "@/features/organizations/demo-data";
import type { FormEvent } from "react";
import { EmptyState } from "@/components/empty-state";
import { FormField } from "@/components/form-field";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformSidebar } from "@/components/platform/platform-sidebar";
import { PlatformHeader } from "@/components/platform/platform-header";

type ModuleDefinition = {
  icon: string;
  heading: string;
  description: string;
  areas: string[];
};



const initialActivities: Activity[] = [
  {
    icon: "＋",
    title: "Organization registration received",
    detail: "Nairobi Business College · ORG-0001",
    time: "Today",
    type: "registered",
  },
  {
    icon: "◷",
    title: "Registration submitted for review",
    detail: "Summit Medical Centre · ORG-0002",
    time: "Yesterday",
    type: "inspection",
  },
  {
    icon: "✓",
    title: "Platform workspace initialized",
    detail: "Illustrative system activity",
    time: "2 days ago",
    type: "transfer",
  },
  {
    icon: "⚙",
    title: "Platform governance review",
    detail: "Review role assignments and permissions",
    time: "3 days ago",
    type: "maintenance",
  },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "Global Overview": { title: "Global Overview", subtitle: "Monitor platform governance, organizations and service health." },
  "Global Asset Analytics": { title: "Global Asset Analytics", subtitle: "Understand asset inventory, lifecycle and trends across the platform using authorized aggregate data." },
  "Organization Management": { title: "Organization Management", subtitle: "Manage organizations registered on AssetPass." },
  "Registration & Approvals": { title: "Registration & Approvals", subtitle: "Review organization applications before activation." },
  "Organization Lifecycle": { title: "Organization Lifecycle", subtitle: "Oversee organization activation, suspension and closure." },
  "Ownership, Succession & Recovery": { title: "Ownership, Succession & Recovery", subtitle: "Manage protected platform ownership and governance continuity." },
  "Global User Management": { title: "Global User Management", subtitle: "Oversee platform accounts and access boundaries." },
  "Platform Administrator Management": { title: "Platform Administrator Management", subtitle: "Manage delegated platform administrators." },
  "Roles & Permissions": { title: "Roles & Permissions", subtitle: "Review platform roles and permission policies." },
  "Authentication & Sessions": { title: "Authentication & Sessions", subtitle: "Manage authentication policies and session oversight." },
  "Site Settings": { title: "Site Settings", subtitle: "Configure public-facing AssetPass identity and site preferences." },
  "Platform Configuration": { title: "Platform Configuration", subtitle: "Manage global platform defaults and configuration." },
  "Communications & Notifications": { title: "Communications & Notifications", subtitle: "Manage system communications and notification settings." },
  "Localization & Regional Settings": { title: "Localization & Regional Settings", subtitle: "Configure language, timezone and regional defaults." },
  "Subscription & Plans Management": { title: "Subscription & Plans Management", subtitle: "Manage commercial plans and subscription policies." },
  "Module & Feature Management": { title: "Module & Feature Management", subtitle: "Govern platform capabilities and feature availability." },
  "Marketplace Administration": { title: "Marketplace Administration", subtitle: "Manage marketplace policies and platform-level operations." },
  "Security Monitoring & Incidents": { title: "Security Monitoring & Incidents", subtitle: "Review security events and incident response." },
  "Audit Logs & Activity Review": { title: "Audit Logs & Activity Review", subtitle: "Review platform administrative actions and audit history." },
  "Compliance & Data Governance": { title: "Compliance & Data Governance", subtitle: "Oversee platform compliance, privacy and data governance." },
  "System Health & Monitoring": { title: "System Health & Monitoring", subtitle: "Monitor platform availability and service health." },
  "Integrations & API Management": { title: "Integrations & API Management", subtitle: "Manage integrations and API governance." },
  "Background Jobs & Scheduled Tasks": { title: "Background Jobs & Scheduled Tasks", subtitle: "Monitor automated and scheduled platform processes." },
  "Backup & Recovery Operations": { title: "Backup & Recovery Operations", subtitle: "Oversee backup integrity and recovery readiness." },
  "Support Management": { title: "Support Management", subtitle: "Manage support requests and service assistance." },
  "Dispute & Escalation Management": { title: "Dispute & Escalation Management", subtitle: "Handle escalated platform-level cases." },
  "Help Centre & Knowledge Base": { title: "Help Centre & Knowledge Base", subtitle: "Manage help content and knowledge resources." },
};

const moduleDefinitions: Record<string, ModuleDefinition> = {
  "Global Asset Analytics": {
    icon: "◇",
    heading: "Platform-wide asset intelligence",
    description:
      "A consolidated view of asset inventory and lifecycle indicators across participating organizations. This workspace is planned for aggregate analytics; it does not grant unrestricted access to organization asset records.",
    areas: [
      "Total registered assets across participating organizations",
      "Asset lifecycle totals: active, under maintenance, retired and disposed",
      "Asset distribution by category and organization",
      "Asset registration and inventory growth trends",
      "Custody and transfer indicators, including pending acknowledgements",
      "Inventory data-quality indicators and cross-organization exceptions",
      "Permission-controlled, audited drill-downs where explicitly authorized",
    ],
  },
  "Global Assets": {
    icon: "◇",
    heading: "Cross-organization asset oversight",
    description:
      "This workspace is intended for authorized platform-wide asset oversight. Individual organizations retain their own operational asset-management workflows.",
    areas: [
      "Global asset inventory and organization association",
      "Asset categories and classification summaries",
      "Asset status and lifecycle summaries",
      "Cross-organization inventory exceptions",
    ],
  },
  "Custody & Movements": {
    icon: "⇄",
    heading: "Custody and movement oversight",
    description:
      "This workspace will provide platform-level visibility into custody and movement records without replacing the operational workflows of each organization.",
    areas: [
      "Custody and assignment summaries",
      "Asset transfers between locations or custodians",
      "Movement history and outstanding confirmations",
      "Unresolved custody exceptions",
    ],
  },
  "Platform Users & Access": {
    icon: "♙",
    heading: "Platform user administration",
    description:
      "Manage platform-level accounts and explicitly delegated administrative permissions. This is separate from organization users and roles.",
    areas: [
      "Global Administrator and delegated administrators",
      "Platform account status and access reviews",
      "Permission assignments and access boundaries",
      "Administrative account activity",
    ],
  },
  "Growth & Analytics": {
    icon: "▥",
    heading: "Platform growth and performance",
    description:
      "This workspace will consolidate adoption and performance indicators from connected platform data. No live analytics are available in this demo.",
    areas: [
      "Organization registrations and growth trends",
      "Asset inventory and lifecycle statistics",
      "User adoption and platform usage",
      "Targets, forecasts and business performance",
    ],
  },
  "Platform Governance": {
    icon: "◈",
    heading: "Platform ownership and governance",
    description:
      "The Global Administrator (Platform Owner) holds the highest administrative and governance authority across AssetPass. Platform Administrators exercise only explicitly delegated permissions and cannot appoint themselves Global Administrator or Platform Owner.",
    areas: [
      "Platform ownership and delegated responsibilities",
      "Administrative roles and permission boundaries",
      "Governance policies and approval controls",
      "Governance reviews and accountability",
    ],
  },
  "Security & Audit": {
    icon: "◷",
    heading: "Security and audit oversight",
    description:
      "The production module will record relevant platform actions, access changes and security events. The entries shown elsewhere in this demo are illustrative, not a live security log.",
    areas: [
      "Platform audit trail and administrative actions",
      "Authentication and access-event monitoring",
      "Permission and role-change history",
      "Security exceptions and incident investigation",
    ],
  },
  "Maintenance Oversight": {
    icon: "⚙",
    heading: "Maintenance oversight",
    description:
      "This workspace will summarize maintenance activity across participating organizations. Actual maintenance records will remain linked to their originating organization.",
    areas: [
      "Maintenance workload and completion summaries",
      "Overdue maintenance and service exceptions",
      "Maintenance-related asset downtime",
      "Recurring maintenance risk indicators",
    ],
  },
  "Compliance Oversight": {
    icon: "✓",
    heading: "Compliance oversight",
    description:
      "This workspace will support platform-level monitoring of compliance indicators without replacing organization-level inspection and compliance workflows.",
    areas: [
      "Compliance obligations and inspection schedules",
      "Overdue inspections and unresolved exceptions",
      "Compliance evidence and documentation status",
      "Organization compliance summaries",
    ],
  },
  "Reports & Exports": {
    icon: "▤",
    heading: "Platform reporting and exports",
    description:
      "Reporting will use authorized platform data and role-based access controls. Report generation and file exports are not connected in this demo.",
    areas: [
      "Organization registration and status reports",
      "Asset and custody summary reports",
      "Maintenance and compliance reports",
      "Audit and governance reports",
    ],
  },
  "Integrations & Data Operations": {
    icon: "⇄",
    heading: "Integrations and data operations",
    description:
      "This workspace is reserved for controlled data exchange and integrations. No external service, import job or synchronization process is connected yet.",
    areas: [
      "Integration connections and service status",
      "Controlled data import and validation",
      "Data exports and transfer history",
      "Data-quality checks and processing exceptions",
    ],
  },
  "Support & Platform Operations": {
    icon: "◉",
    heading: "Support and platform operations",
    description:
      "This workspace will support operational oversight and issue handling. Support tickets and service monitoring are not live in this demo.",
    areas: [
      "Support requests and issue triage",
      "Platform incidents and service disruptions",
      "Operational task tracking",
      "Service follow-up and resolution summaries",
    ],
  },
  "Platform Settings": {
    icon: "⚙",
    heading: "Platform configuration",
    description:
      "This area is reserved for platform-wide configuration, registration policies and administrative controls. Changes require authenticated permissions and backend enforcement.",
    areas: [
      "Platform-wide configuration",
      "Organization registration requirements",
      "Security and access policies",
      "System defaults and notification policies",
    ],
  },
};

const routeSlugs: Record<string, string> = {
  "Global Overview": "overview",
  "Global Asset Analytics": "asset-analytics",
  "Platform Analytics & Reports": "reports",
  "Organization Management": "organizations",
  "Registration & Approvals": "registrations",
  "Organization Lifecycle": "organization-lifecycle",
  "Ownership, Succession & Recovery": "ownership-governance",
  "Global User Management": "users",
  "Platform Administrator Management": "administrators",
  "Roles & Permissions": "roles-permissions",
  "Authentication & Sessions": "authentication",
  "Site Settings": "site-settings",
  "Platform Configuration": "configuration",
  "Communications & Notifications": "communications",
  "Localization & Regional Settings": "localization",
  "Subscription & Plans Management": "subscriptions",
  "Module & Feature Management": "features",
  "Marketplace Administration": "marketplace",
  "Security Monitoring & Incidents": "security",
  "Audit Logs & Activity Review": "audit-logs",
  "Compliance & Data Governance": "compliance",
  "System Health & Monitoring": "system-health",
  "Integrations & API Management": "integrations",
  "Background Jobs & Scheduled Tasks": "jobs",
  "Backup & Recovery Operations": "backups",
  "Support Management": "support",
  "Dispute & Escalation Management": "disputes",
  "Help Centre & Knowledge Base": "help-centre"
};

const routeLabels = Object.fromEntries(
  Object.entries(routeSlugs).map(([label, slug]) => [slug, label]),
) as Record<string, string>;

function pageFromPath(pathname: string) {
  const slug = pathname.split("/").filter(Boolean).pop() ?? "overview";
  return routeLabels[slug] ?? "Global Overview";
}

export function PlatformConsole() {
  const { organizations, setOrganizations } = useOrganizationDemo();
  const pathname = usePathname();
  const router = useRouter();
  const activePage = pageFromPath(pathname);
  const [query, setQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("All");
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [decisionAction, setDecisionAction] = useState<ReviewAction | null>(
    null,
  );

  const counts = useMemo(
    () => ({
      total: organizations.filter((org) => org.status !== "Rejected").length,
      active: organizations.filter((org) => org.status === "Active").length,
      pending: organizations.filter((org) => org.status === "Pending review")
        .length,
      suspended: organizations.filter((org) => org.status === "Suspended")
        .length,
      rejected: organizations.filter((org) => org.status === "Rejected")
        .length,
      users: organizations.reduce((total, org) => total + org.users, 0),
    }),
    [organizations],
  );

  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return organizations.filter((org) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          org.id,
          org.name,
          org.category,
          org.applicant,
          org.email,
          org.status,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

      const matchesStatus =
        organizationFilter === "All" || org.status === organizationFilter;

      const matchesReviewPage =
        activePage !== "Registration & Approvals" ||
        org.status === "Pending review";

      return matchesQuery && matchesStatus && matchesReviewPage;
    });
  }, [organizations, query, organizationFilter, activePage]);

  function navigate(label: string) {
    const slug = routeSlugs[label];
    if (slug) router.push(`/platform/${slug}`);
    setMobileMenu(false);
    setNotice("");
    setQuery("");
    setOrganizationFilter("All");
    setShowNotifications(false);
  }

  function openReview(org: Organization, action: ReviewAction) {
    setSelectedOrganization(org);
    setDecisionAction(action);
    setDecisionReason("");
  }

  function closeReview() {
    setSelectedOrganization(null);
    setDecisionAction(null);
    setDecisionReason("");
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedOrganization || !decisionAction) return;

    const nextStatus: OrgStatus =
      decisionAction === "approve" ? "Active" : "Rejected";

    setOrganizations((current) =>
      current.map((org) =>
        org.id === selectedOrganization.id
          ? {
              ...org,
              status: nextStatus,
              users: decisionAction === "approve" ? 1 : org.users,
            }
          : org,
      ),
    );

    setNotice(
      `Demo only: ${selectedOrganization.name} was marked "${nextStatus}" in local browser state. No real approval or rejection was submitted.${decisionReason.trim() ? ` Review note: ${decisionReason.trim()}` : ""}`,
    );

    closeReview();
  }

  const pageInfo = pageTitles[activePage] ?? pageTitles["Global Overview"];
  const moduleDefinition = moduleDefinitions[activePage] ?? (activePage !== "Global Overview" && activePage !== "Organization Management" && activePage !== "Registration & Approvals" ? { icon: "◈", heading: activePage, description: pageInfo.subtitle, areas: ["Module workspace structure", "Authorized administrative actions", "Review history and accountability", "Backend integration pending"] } : undefined);

  return (
    <PlatformShell mobileMenuOpen={mobileMenu} onCloseMobileMenu={() => setMobileMenu(false)}>
      <PlatformSidebar
        activePage={activePage}
        pendingCount={counts.pending}
        mobileMenuOpen={mobileMenu}
        onNavigate={navigate}
        onHelp={(message) => setNotice(message)}
      />

      <main className="main-area">
        <PlatformHeader
          activePage={activePage}
          query={query}
          onQueryChange={(value) => {
            setQuery(value);
            router.push("/platform/organizations");
          }}
          onSearchFocus={() => {
            if (
              activePage !== "Organization Management" &&
              activePage !== "Registration & Approvals"
            ) {
              router.push("/platform/organizations");
            }
          }}
          onOpenMobileMenu={() => setMobileMenu(true)}
          pendingCount={counts.pending}
          notificationsOpen={showNotifications}
          onToggleNotifications={() => setShowNotifications((value) => !value)}
          onNavigate={navigate}
          onProfileClick={(message) => setNotice(message)}
        />

        <div className="page-content">
          <div className="demo-banner">
            <span className="demo-banner-icon">i</span>
            <span>
              <strong>Demo environment</strong> — All figures and organization
              records are sample data. No backend is connected.
            </span>
            <button
              onClick={() =>
                setNotice(
                  "Organization changes and registration decisions only affect temporary browser state. Nothing is saved to a server.",
                )
              }
              aria-label="Demo information"
            >
              Learn more ↗
            </button>
          </div>

          {notice && (
            <div className="inline-notice" role="status">
              <span>{notice}</span>
              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss notice"
              >
                ×
              </button>
            </div>
          )}

          <section className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> PLATFORM ADMINISTRATION
              </div>
              <h1>{pageInfo.title}</h1>
              <p>{pageInfo.subtitle}</p>
            </div>
            <div className="heading-actions">
              <button
                className="button button-secondary"
                onClick={() =>
                  setNotice(
                    "Platform export will be implemented with authorized reporting and backend integration.",
                  )
                }
              >
                <span>↓</span> Export
              </button>
              <button
                className="button button-primary"
                onClick={() => navigate("Registration & Approvals")}
              >
                Review registrations
              </button>
            </div>
          </section>

          {activePage === "Global Overview" && (
            <>
              <section className="metrics-grid" aria-label="Platform overview">
                <article className="metric-card metric-total">
                  <div className="metric-top">
                    <span className="metric-label">Organizations</span>
                    <span className="metric-icon navy-icon">▦</span>
                  </div>
                  <div className="metric-number">{counts.total}</div>
                  <div className="metric-footer">
                    <span className="metric-neutral">Registered</span>
                    <span>in demo data</span>
                  </div>
                  <div className="metric-accent accent-navy" />
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Active organizations</span>
                    <span className="metric-icon teal-icon">✓</span>
                  </div>
                  <div className="metric-number">{counts.active}</div>
                  <div className="metric-footer">
                    <span className="mini-dot dot-teal" />
                    Approved in demo state
                  </div>
                  <div className="metric-accent accent-teal" />
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Pending reviews</span>
                    <span className="metric-icon amber-icon">◷</span>
                  </div>
                  <div className="metric-number">{counts.pending}</div>
                  <div className="metric-footer">
                    <span className="mini-dot dot-amber" />
                    Awaiting a decision
                  </div>
                  <div className="metric-accent accent-amber" />
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Organization users</span>
                    <span className="metric-icon blue-icon">♙</span>
                  </div>
                  <div className="metric-number">{counts.users}</div>
                  <div className="metric-footer">
                    <span className="mini-dot dot-blue" />
                    Across demo records
                  </div>
                  <div className="metric-accent accent-blue" />
                </article>
              </section>

              <section className="operations-grid">
                <article className="panel actions-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-title">Platform actions</div>
                      <div className="panel-subtitle">
                        Areas that may require your attention
                      </div>
                    </div>
                    <span className="action-count">{counts.pending}</span>
                  </div>

                  <button
                    className="action-row"
                    onClick={() => navigate("Registration & Approvals")}
                  >
                    <span className="action-icon action-amber">◷</span>
                    <span className="action-copy">
                      <strong>Registration reviews</strong>
                      <small>
                        Review applications before granting organization access
                      </small>
                    </span>
                    <span className="action-number">{counts.pending}</span>
                    <span className="row-arrow">›</span>
                  </button>

                  <button
                    className="action-row"
                    onClick={() => navigate("Global User Management")}
                  >
                    <span className="action-icon action-blue">♙</span>
                    <span className="action-copy">
                      <strong>Platform user access</strong>
                      <small>
                        Review delegated platform access and responsibilities
                      </small>
                    </span>
                    <span className="row-arrow">›</span>
                  </button>

                  <button
                    className="action-row"
                    onClick={() => navigate("Audit Logs & Activity Review")}
                  >
                    <span className="action-icon action-red">◈</span>
                    <span className="action-copy">
                      <strong>Security and audit oversight</strong>
                      <small>
                        Review audit, access and governance controls
                      </small>
                    </span>
                    <span className="row-arrow">›</span>
                  </button>

                  <div className="panel-footer">
                    <button
                      className="text-link"
                      onClick={() => navigate("Ownership, Succession & Recovery")}
                    >
                      View governance <span>→</span>
                    </button>
                  </div>
                </article>

                <article className="panel distribution-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-title">Organization status</div>
                      <div className="panel-subtitle">
                        Distribution across the demo platform
                      </div>
                    </div>
                    <span className="small-label">OVERVIEW</span>
                  </div>

                  <div className="distribution-total">
                    <strong>{counts.total}</strong>
                    <span>organizations</span>
                  </div>

                  <div
                    className="distribution-bar"
                    aria-label="Organization status distribution"
                  >
                    <span
                      className="bar-assigned"
                      style={{
                        width: `${counts.total ? (counts.active / counts.total) * 100 : 0}%`,
                      }}
                    />
                    <span
                      className="bar-available"
                      style={{
                        width: `${counts.total ? (counts.pending / counts.total) * 100 : 0}%`,
                      }}
                    />
                    <span
                      className="bar-maintenance"
                      style={{
                        width: `${counts.total ? (counts.suspended / counts.total) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <div className="legend-list">
                    {[
                      {
                        label: "Active",
                        value: counts.active,
                        className: "legend-assigned",
                        status: "Active",
                      },
                      {
                        label: "Pending review",
                        value: counts.pending,
                        className: "legend-available",
                        status: "Pending review",
                      },
                      {
                        label: "Suspended",
                        value: counts.suspended,
                        className: "legend-maintenance",
                        status: "Suspended",
                      },
                    ].map((item) => (
                      <button
                        className="legend-row"
                        key={item.label}
                        onClick={() => {
                          navigate("Organization Management");
                          setOrganizationFilter(item.status);
                        }}
                      >
                        <span
                          className={`legend-marker ${item.className}`}
                        />
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <span className="legend-percent">
                          {counts.total
                            ? Math.round((item.value / counts.total) * 100)
                            : 0}
                          %
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="distribution-note">
                    Select a status to review matching organizations.
                  </div>
                </article>
              </section>

              <section className="panel register-panel">
                <div className="panel-heading register-heading">
                  <div>
                    <div className="panel-title">Recent organizations</div>
                    <div className="panel-subtitle">
                      Organization registrations and current status
                    </div>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => navigate("Organization Management")}
                  >
                    View organizations <span>→</span>
                  </button>
                </div>
                <OrganizationTable
                  organizations={organizations.slice(0, 4)}
                  onReview={openReview}
                />
              </section>

              <section className="panel activity-panel">
                <div className="panel-heading">
                  <div>
                    <div className="panel-title">Recent platform activity</div>
                    <div className="panel-subtitle">
                      Illustrative events from the demo environment
                    </div>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => navigate("Audit Logs & Activity Review")}
                  >
                    View security & audit <span>→</span>
                  </button>
                </div>
                <ActivityList activities={initialActivities} />
              </section>
            </>
          )}

          {(activePage === "Organization Management" ||
            activePage === "Registration & Approvals") && (
            <section className="panel register-panel full-register">
              <div className="panel-heading register-heading">
                <div>
                  <div className="panel-title">
                    {activePage === "Registration & Approvals"
                      ? "Applications awaiting review"
                      : "Registered organizations"}
                  </div>
                  <div className="panel-subtitle">
                    {filteredOrganizations.length} matching demo record(s)
                  </div>
                </div>
              </div>

              <div className="register-toolbar">
                <label className="table-search">
                  <span>⌕</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search name, ID, applicant or category..."
                    aria-label="Search organizations"
                  />
                </label>

                {activePage === "Organization Management" && (
                  <select
                    className="status-select"
                    value={organizationFilter}
                    onChange={(event) =>
                      setOrganizationFilter(event.target.value)
                    }
                    aria-label="Filter organizations by status"
                  >
                    <option value="All">All statuses</option>
                    <option value="Pending review">Pending review</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                )}
              </div>

              <OrganizationTable
                organizations={filteredOrganizations}
                onReview={openReview}
              />

              {filteredOrganizations.length === 0 && (
                <EmptyState
                  icon="⌕"
                  title="No matching organizations"
                  description="Try another search term or change the organization status filter."
                  actionLabel="Clear filters"
                  onAction={() => {
                    setQuery("");
                    setOrganizationFilter("All");
                  }}
                />
              )}
            </section>
          )}

          {moduleDefinition && (
            <section className="panel register-panel full-register">
              <div className="panel-heading register-heading">
                <div>
                  <div className="panel-title">{pageInfo.title}</div>
                  <div className="panel-subtitle">
                    Platform administration workspace
                  </div>
                </div>
              </div>

              <div className="module-placeholder">
                <span className="placeholder-symbol">
                  {moduleDefinition.icon}
                </span>
                <h2>{moduleDefinition.heading}</h2>
                <p>{moduleDefinition.description}</p>
              </div>

              <div className="panel-heading">
                <div>
                  <div className="panel-title">Module scope</div>
                  <div className="panel-subtitle">
                    Planned responsibilities for this workspace
                  </div>
                </div>
                <span className="small-label">PLANNED</span>
              </div>

              <div className="activity-list">
                {moduleDefinition.areas.map((area, index) => (
                  <div className="activity-row" key={area}>
                    <span className="activity-icon activity-transfer">
                      {index + 1}
                    </span>
                    <div className="activity-copy">
                      <strong>{area}</strong>
                      <span>Planned module capability</span>
                    </div>
                    <span className="department-name">Not connected</span>
                  </div>
                ))}
              </div>

              <div className="module-placeholder">
                <p>
                  <strong>Implementation status:</strong> Frontend demo only.
                  These items describe the planned scope; they do not represent
                  live records, completed integrations or active backend
                  operations.
                </p>
                {activePage === "Ownership, Succession & Recovery" && (
                  <p>
                    Organization Founding Owners and Asset Managers have
                    separate organization-level responsibilities. Neither role
                    replaces the unique Platform Owner authority.
                  </p>
                )}
                <button
                  className="button button-secondary"
                  onClick={() => navigate("Global Overview")}
                >
                  Return to overview
                </button>
              </div>
            </section>
          )}

          <footer className="page-footer">
            <span>
              AssetPass <span className="footer-separator">·</span> Asset
              Lifecycle & Custody Management
            </span>
            <span>
              <span className="footer-status-dot" /> Demo mode
              <span className="footer-separator">·</span> Backend not connected
            </span>
          </footer>
        </div>
      </main>

      {selectedOrganization && decisionAction && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeReview();
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">REGISTRATION REVIEW</span>
                <h2 id="review-title">
                  {decisionAction === "approve"
                    ? "Approve organization"
                    : "Reject registration"}
                </h2>
                <p>{selectedOrganization.name}</p>
              </div>
              <button
                className="modal-close"
                onClick={closeReview}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            <div className="module-placeholder">
              <p>
                <strong>Registration ID:</strong> {selectedOrganization.id}
              </p>
              <p>
                <strong>Applicant:</strong> {selectedOrganization.applicant}
              </p>
              <p>
                <strong>Email:</strong> {selectedOrganization.email}
              </p>
              <p>
                <strong>Category:</strong> {selectedOrganization.category}
              </p>
            </div>

            <form onSubmit={submitReview}>
              <FormField
                label={
                  decisionAction === "approve"
                    ? "Review note (optional)"
                    : "Reason for rejection"
                }
                required={decisionAction === "reject"}
                htmlFor="organization-review-note"
                hint="Maximum 500 characters. This note remains in this demo session only."
              >
                <textarea
                  id="organization-review-note"
                  required={decisionAction === "reject"}
                  maxLength={500}
                  value={decisionReason}
                  onChange={(event) => setDecisionReason(event.target.value)}
                  placeholder={
                    decisionAction === "approve"
                      ? "Add a review note..."
                      : "Explain the reason for rejection..."
                  }
                />
              </FormField>

              <div className="modal-demo-note">
                <span>i</span>
                Demo only. This changes local browser state, not a real
                registration or access permission.
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={closeReview}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  {decisionAction === "approve"
                    ? "Confirm demo approval"
                    : "Confirm demo rejection"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </PlatformShell>
  );
}

