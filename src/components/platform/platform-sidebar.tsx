"use client";

import Image from "next/image";
import { Icon } from "@/components/platform/platform-icon";

type NavItem = { label: string; icon: string; count?: string };

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

type PlatformSidebarProps = { activePage: string; pendingCount: number; mobileMenuOpen: boolean; onNavigate: (label: string) => void; onHelp: (message: string) => void };

export function PlatformSidebar({ activePage, pendingCount, mobileMenuOpen, onNavigate, onHelp }: PlatformSidebarProps) {
  return (
    <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
      <button className="brand" onClick={() => onNavigate("Global Overview")} aria-label="AssetPass platform overview">
        <span className="brand-mark"><Image src="/brand/Assetpass%20Logo.png" alt="" width={42} height={42} /></span>
        <span className="brand-copy"><strong>Asset<span>Pass</span></strong><small>ASSET LIFECYCLE PLATFORM</small></span>
      </button>
      <div className="workspace-selector"><div className="workspace-avatar">P</div><div className="workspace-copy"><span>PLATFORM WORKSPACE</span><strong>Platform Administration</strong></div><span className="workspace-chevron">⌄</span></div>
      <div className="sidebar-scroll">
        {navGroups.map((group) => <div className="nav-group" key={group.title}><div className="nav-heading">{group.title}</div>{group.items.map((item) => <button key={item.label} onClick={() => onNavigate(item.label)} className={`nav-item ${activePage === item.label || (activePage === "Registration & Approvals" && item.label === "Organization Management") ? "nav-item-active" : ""}`} aria-current={activePage === item.label ? "page" : undefined}><Icon>{item.icon}</Icon><span className="nav-label">{item.label}</span>{item.label === "Organization Management" && pendingCount > 0 && <span className="nav-count">{pendingCount}</span>}</button>)}</div>)}
      </div>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">?</div><strong>Need a hand?</strong><p>Platform governance and organization oversight.</p><button onClick={() => onHelp("Help resources and support workflows will be connected in a later implementation phase.")}>Explore help <span>↗</span></button></div><div className="sidebar-version"><span className="version-dot"/>Demo environment <span>v0.2</span></div></div>
    </aside>
  );
}
