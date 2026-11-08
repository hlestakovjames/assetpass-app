"use client";

import { ThemeSelector } from "@/components/theme-selector";

type PlatformHeaderProps = {
  activePage: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSearchFocus: () => void;
  onOpenMobileMenu: () => void;
  pendingCount: number;
  notificationsOpen: boolean;
  onToggleNotifications: () => void;
  onNavigate: (label: string) => void;
  onProfileClick: (message: string) => void;
};

export function PlatformHeader({
  activePage,
  query,
  onQueryChange,
  onSearchFocus,
  onOpenMobileMenu,
  pendingCount,
  notificationsOpen,
  onToggleNotifications,
  onNavigate,
  onProfileClick,
}: PlatformHeaderProps) {
  return (
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => onOpenMobileMenu()}
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
                  onQueryChange(event.target.value);
                }}
                onFocus={() => {
                  if (
                    activePage !== "Organization Management" &&
                    activePage !== "Registration & Approvals"
                  ) {
                    onSearchFocus();
                  }
                }}
              />
              <kbd>/</kbd>
            </label>

            <ThemeSelector />

            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => onToggleNotifications()}
              >
                ♧
                {pendingCount > 0 && (
                  <span className="notification-dot" />
                )}
              </button>

              {notificationsOpen && (
                <div className="notification-popover">
                  <strong>Platform notifications</strong>
                  <p>
                    <span className="notice-dot amber-dot" />
                    {pendingCount} organization registration(s) await review.
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
                    onClick={() => onNavigate("Registration & Approvals")}
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
                onProfileClick(
                  "Global Administrator profile and secure session management will be connected during authentication implementation.",
                )
              }
            >
              <span className="profile-avatar">PO</span>
              <span className="profile-copy">
                <strong>Global Administrator</strong>
                <small>Platform Owner · Highest platform authority</small>
              </span>
              <span className="profile-chevron">⌄</span>
            </button>
          </div>
        </header>
  );
}
