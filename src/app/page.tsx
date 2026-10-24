"use client";

import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type OrgStatus = "Pending review" | "Active" | "Suspended" | "Rejected";
type ReviewAction = "approve" | "reject";

type Organization = {
  id: string;
  name: string;
  category: string;
  applicant: string;
  email: string;
  submitted: string;
  status: OrgStatus;
  users: number;
};

type Activity = {
  icon: string;
  title: string;
  detail: string;
  time: string;
  type: string;
};

type NavItem = {
  label: string;
  icon: string;
  count?: string;
};

type ModuleDefinition = {
  icon: string;
  heading: string;
  description: string;
  areas: string[];
};

const initialOrganizations: Organization[] = [
  {
    id: "ORG-0001",
    name: "Nairobi Business College",
    category: "Education",
    applicant: "Mary Wanjiku",
    email: "mary@example.com",
    submitted: "23 Oct 2026",
    status: "Pending review",
    users: 0,
  },
  {
    id: "ORG-0002",
    name: "Summit Medical Centre",
    category: "Healthcare",
    applicant: "Peter Otieno",
    email: "peter@example.com",
    submitted: "22 Oct 2026",
    status: "Pending review",
    users: 0,
  },
  {
    id: "ORG-0003",
    name: "Greenfield Enterprises",
    category: "Business",
    applicant: "Grace Akinyi",
    email: "grace@example.com",
    submitted: "21 Oct 2026",
    status: "Active",
    users: 24,
  },
  {
    id: "ORG-0004",
    name: "Westlands Community Trust",
    category: "Non-profit",
    applicant: "David Kamau",
    email: "david@example.com",
    submitted: "20 Oct 2026",
    status: "Active",
    users: 12,
  },
  {
    id: "ORG-0005",
    name: "Lakeview Logistics",
    category: "Logistics",
    applicant: "Anne Achieng",
    email: "anne@example.com",
    submitted: "19 Oct 2026",
    status: "Suspended",
    users: 8,
  },
];

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

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "PLATFORM",
    items: [
      { label: "Platform Overview", icon: "▦" },
      { label: "Organizations", icon: "▤", count: "2" },
      { label: "Global Assets", icon: "◇" },
      { label: "Custody & Movements", icon: "⇄" },
      { label: "Platform Users & Access", icon: "♙" },
      { label: "Growth & Analytics", icon: "▥" },
    ],
  },
  {
    title: "GOVERNANCE",
    items: [
      { label: "Platform Governance", icon: "◈" },
      { label: "Security & Audit", icon: "◷" },
      { label: "Maintenance Oversight", icon: "⚙" },
      { label: "Compliance Oversight", icon: "✓" },
    ],
  },
  {
    title: "REPORTING",
    items: [{ label: "Reports & Exports", icon: "▤" }],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Integrations & Data Operations", icon: "⇄" },
      { label: "Support & Platform Operations", icon: "◉" },
    ],
  },
  {
    title: "SYSTEM",
    items: [{ label: "Platform Settings", icon: "⚙" }],
  },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "Platform Overview": {
    title: "Platform Overview",
    subtitle: "Monitor organizations, registrations and platform-wide operations.",
  },
  Organizations: {
    title: "Organizations",
    subtitle: "Review organizations registered on the AssetPass platform.",
  },
  "Registration Reviews": {
    title: "Registration Reviews",
    subtitle: "Review organization applications before granting platform access.",
  },
  "Global Assets": {
    title: "Global Assets",
    subtitle: "Oversee asset records across the organizations using AssetPass.",
  },
  "Custody & Movements": {
    title: "Custody & Movements",
    subtitle: "Monitor asset custody, assignments and movement activity across organizations.",
  },
  "Platform Users & Access": {
    title: "Platform Users & Access",
    subtitle: "Oversee platform accounts, delegated administration and access permissions.",
  },
  "Growth & Analytics": {
    title: "Growth & Analytics",
    subtitle: "Monitor organization growth, adoption, asset activity and platform performance.",
  },
  "Platform Governance": {
    title: "Platform Governance",
    subtitle: "Manage platform ownership, delegated responsibilities and governance controls.",
  },
  "Security & Audit": {
    title: "Security & Audit",
    subtitle: "Oversee security events, audit trails and platform access activity.",
  },
  "Maintenance Oversight": {
    title: "Maintenance Oversight",
    subtitle: "Monitor maintenance indicators and maintenance-related activity across the platform.",
  },
  "Compliance Oversight": {
    title: "Compliance Oversight",
    subtitle: "Monitor compliance obligations, inspections and organizational exceptions.",
  },
  "Reports & Exports": {
    title: "Reports & Exports",
    subtitle: "Review reporting capabilities, operational summaries and authorized exports.",
  },
  "Integrations & Data Operations": {
    title: "Integrations & Data Operations",
    subtitle: "Oversee planned integrations, data imports, exports and data quality.",
  },
  "Support & Platform Operations": {
    title: "Support & Platform Operations",
    subtitle: "Oversee support workflows, service operations and platform incidents.",
  },
  "Platform Settings": {
    title: "Platform Settings",
    subtitle: "Review platform configuration and administrative controls.",
  },
};

const moduleDefinitions: Record<string, ModuleDefinition> = {
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
      "Platform Owner and delegated administrators",
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
      "The Platform Owner holds the platform's highest governance authority. Delegated Platform Administrators receive only explicitly authorized permissions and cannot appoint themselves as Platform Owner.",
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

function Icon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`icon ${className}`}>{children}</span>;
}

function OrganizationStatus({ status }: { status: OrgStatus }) {
  const className =
    status === "Active"
      ? "status-assigned"
      : status === "Pending review"
        ? "status-maintenance"
        : status === "Suspended"
          ? "status-retired"
          : "status-available";

  return (
    <span className={`status-badge ${className}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

export default function Home() {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [activePage, setActivePage] = useState("Platform Overview");
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
        activePage !== "Registration Reviews" ||
        org.status === "Pending review";

      return matchesQuery && matchesStatus && matchesReviewPage;
    });
  }, [organizations, query, organizationFilter, activePage]);

  function navigate(label: string) {
    setActivePage(label);
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

  const pageInfo = pageTitles[activePage] ?? pageTitles["Platform Overview"];
  const moduleDefinition = moduleDefinitions[activePage];

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <button
          className="brand"
          onClick={() => navigate("Platform Overview")}
          aria-label="AssetPass platform overview"
        >
          <span className="brand-mark">
            <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path
                d="M20 3.5 34 9v10.2c0 8.4-5.8 14.2-14 17.3C11.8 33.4 6 27.6 6 19.2V9L20 3.5Z"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="m20 11 8 4.3v9.2L20 29l-8-4.5v-9.2L20 11Z"
                stroke="#2DD4BF"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="m12 15.3 8 4.6 8-4.6M20 19.9V29"
                stroke="#2DD4BF"
                strokeWidth="1.8"
              />
            </svg>
          </span>
          <span className="brand-copy">
            <strong>
              Asset<span>Pass</span>
            </strong>
            <small>ASSET LIFECYCLE PLATFORM</small>
          </span>
        </button>

        <div className="workspace-selector">
          <div className="workspace-avatar">P</div>
          <div className="workspace-copy">
            <span>PLATFORM WORKSPACE</span>
            <strong>Platform Administration</strong>
          </div>
          <span className="workspace-chevron">⌄</span>
        </div>

        <div className="sidebar-scroll">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-heading">{group.title}</div>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.label)}
                  className={`nav-item ${
                    activePage === item.label ||
                    (activePage === "Registration Reviews" &&
                      item.label === "Organizations")
                      ? "nav-item-active"
                      : ""
                  }`}
                  aria-current={
                    activePage === item.label ? "page" : undefined
                  }
                >
                  <Icon>{item.icon}</Icon>
                  <span className="nav-label">{item.label}</span>
                  {item.label === "Organizations" && counts.pending > 0 && (
                    <span className="nav-count">{counts.pending}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <strong>Need a hand?</strong>
            <p>Platform governance and organization oversight.</p>
            <button
              onClick={() =>
                setNotice(
                  "Help resources and support workflows will be connected in a later implementation phase.",
                )
              }
            >
              Explore help <span>↗</span>
            </button>
          </div>
          <div className="sidebar-version">
            <span className="version-dot" />
            Demo environment <span>v0.2</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(true)}
            >
              ☰
            </button>
            <div className="breadcrumb">
              <span>Platform</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="global-search">
              <span className="search-symbol">⌕</span>
              <input
                aria-label="Search organizations"
                placeholder="Search organizations..."
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActivePage("Organizations");
                }}
                onFocus={() => {
                  if (
                    activePage !== "Organizations" &&
                    activePage !== "Registration Reviews"
                  ) {
                    setActivePage("Organizations");
                  }
                }}
              />
              <kbd>/</kbd>
            </label>

            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label="Notifications"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((value) => !value)}
              >
                ♧
                {counts.pending > 0 && (
                  <span className="notification-dot" />
                )}
              </button>

              {showNotifications && (
                <div className="notification-popover">
                  <strong>Platform notifications</strong>
                  <p>
                    <span className="notice-dot amber-dot" />
                    {counts.pending} organization registration(s) await review.
                  </p>
                  <p>
                    <span className="notice-dot blue-dot" />
                    Governance and security checks need monitoring.
                  </p>
                  <p className="muted-small">
                    Demo notifications · Not live alerts
                  </p>
                  <button
                    className="text-link"
                    onClick={() => navigate("Registration Reviews")}
                  >
                    Review registrations →
                  </button>
                </div>
              )}
            </div>

            <div className="topbar-divider" />

            <button
              className="profile-button"
              onClick={() =>
                setNotice(
                  "Platform Owner profile and secure session management will be connected during authentication implementation.",
                )
              }
            >
              <span className="profile-avatar">PO</span>
              <span className="profile-copy">
                <strong>Platform Owner</strong>
                <small>Platform Governance</small>
              </span>
              <span className="profile-chevron">⌄</span>
            </button>
          </div>
        </header>

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
                onClick={() => navigate("Registration Reviews")}
              >
                Review registrations
              </button>
            </div>
          </section>

          {activePage === "Platform Overview" && (
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
                    onClick={() => navigate("Registration Reviews")}
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
                    onClick={() => navigate("Platform Users & Access")}
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
                    onClick={() => navigate("Security & Audit")}
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
                      onClick={() => navigate("Platform Governance")}
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
                          navigate("Organizations");
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
                    onClick={() => navigate("Organizations")}
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
                    onClick={() => navigate("Security & Audit")}
                  >
                    View security & audit <span>→</span>
                  </button>
                </div>
                <ActivityList activities={initialActivities} />
              </section>
            </>
          )}

          {(activePage === "Organizations" ||
            activePage === "Registration Reviews") && (
            <section className="panel register-panel full-register">
              <div className="panel-heading register-heading">
                <div>
                  <div className="panel-title">
                    {activePage === "Registration Reviews"
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

                {activePage === "Organizations" && (
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
                <div className="empty-state">
                  <span>⌕</span>
                  <strong>No matching organizations</strong>
                  <p>
                    Try another search term or change the organization status
                    filter.
                  </p>
                  <button
                    className="text-link"
                    onClick={() => {
                      setQuery("");
                      setOrganizationFilter("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
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
                {activePage === "Platform Governance" && (
                  <p>
                    Organization Founding Owners and Asset Managers have
                    separate organization-level responsibilities. Neither role
                    replaces the unique Platform Owner authority.
                  </p>
                )}
                <button
                  className="button button-secondary"
                  onClick={() => navigate("Platform Overview")}
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
              <label className="form-field">
                <span>
                  {decisionAction === "approve"
                    ? "Review note (optional)"
                    : "Reason for rejection"}
                  {decisionAction === "reject" && <b> *</b>}
                </span>
                <textarea
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
              </label>

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
    </div>
  );
}

function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <div className="activity-list">
      {activities.map((activity) => (
        <div className="activity-row" key={activity.title}>
          <span className={`activity-icon activity-${activity.type}`}>
            {activity.icon}
          </span>
          <div className="activity-copy">
            <strong>{activity.title}</strong>
            <span>{activity.detail}</span>
          </div>
          <time>{activity.time}</time>
        </div>
      ))}
    </div>
  );
}

function OrganizationTable({
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
