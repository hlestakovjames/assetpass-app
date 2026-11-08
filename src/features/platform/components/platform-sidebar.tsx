"use client";

import { Icon } from "@/features/platform/components/platform-icon";

type NavItem = {
  label: string;
  icon: string;
  count?: string;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  { title: "EXECUTIVE & INTELLIGENCE", items: [{ label: "Global Overview", icon: "▦" }, { label: "Global Asset Analytics", icon: "◇" }, { label: "Platform Analytics & Reports", icon: "▥" }] },
  { title: "ORGANIZATION GOVERNANCE", items: [{ label: "Organization Management", icon: "▤", count: "2" }, { label: "Registration & Approvals", icon: "✓" }, { label: "Organization Lifecycle", icon: "↻" }, { label: "Ownership, Succession & Recovery", icon: "◈" }] },
  { title: "IDENTITY & ACCESS", items: [{ label: "Global User Management", icon: "♙" }, { label: "Platform Administrator Management", icon: "♟" }, { label: "Roles & Permissions", icon: "⚿" }, { label: "Authentication & Sessions", icon: "▣" }] },
  { title: "PLATFORM & SITE", items: [{ label: "Site Settings", icon: "⌂" }, { label: "Platform Configuration", icon: "⚙" }, { label: "Communications & Notifications", icon: "✉" }, { label: "Localization & Regional Settings", icon: "◎" }] },
  { title: "PRODUCT & COMMERCIAL", items: [{ label: "Subscription & Plans Management", icon: "▣" }, { label: "Module & Feature Management", icon: "◫" }, { label: "Marketplace Administration", icon: "◇" }] },
  { title: "SECURITY, RISK & COMPLIANCE", items: [{ label: "Security Monitoring & Incidents", icon: "◷" }, { label: "Audit Logs & Activity Review", icon: "≡" }, { label: "Compliance & Data Governance", icon: "✓" }] },
  { title: "OPERATIONS & INTEGRATIONS", items: [{ label: "System Health & Monitoring", icon: "◉" }, { label: "Integrations & API Management", icon: "⇄" }, { label: "Background Jobs & Scheduled Tasks", icon: "◷" }, { label: "Backup & Recovery Operations", icon: "↶" }] },
  { title: "SUPPORT & RESOLUTION", items: [{ label: "Support Management", icon: "?" }, { label: "Dispute & Escalation Management", icon: "⚑" }, { label: "Help Centre & Knowledge Base", icon: "☰" }] },
];

type PlatformSidebarProps = {
  activePage: string;
  pendingCount: number;
  mobileMenuOpen: boolean;
  onNavigate: (label: string) => void;
  onHelp: () => void;
};

export function PlatformSidebar({
  activePage,
  pendingCount,
  mobileMenuOpen,
  onNavigate,
  onHelp,
}: PlatformSidebarProps) {
  return (
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <button
          className="brand"
          onClick={() => onNavigate("Global Overview")}
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
                  onClick={() => onNavigate(item.label)}
                  className={`nav-item ${
                    activePage === item.label ||
                    (activePage === "Registration & Approvals" &&
                      item.label === "Organization Management")
                      ? "nav-item-active"
                      : ""
                  }`}
                  aria-current={
                    activePage === item.label ? "page" : undefined
                  }
                >
                  <Icon>{item.icon}</Icon>
                  <span className="nav-label">{item.label}</span>
                  {item.label === "Organization Management" && pendingCount > 0 && (
                    <span className="nav-count">{pendingCount}</span>
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
                onHelp(
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
  );
}
