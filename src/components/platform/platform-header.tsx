"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ThemeSelector } from "@/components/theme-selector";
import { useAuth } from "@/features/authentication/auth-provider";

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
};

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

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
}: PlatformHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !accountMenuRef.current?.contains(event.target)
      ) {
        setAccountMenuOpen(false);
        setConfirmLogout(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
        setConfirmLogout(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  async function handleLogout() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await logout();
    } catch {
      // The auth client clears the local session even if the request fails.
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  function requestLogout() {
    setAccountMenuOpen(true);
    setConfirmLogout(true);
  }

  const displayName = user?.fullName || "Authenticated user";
  const initials = getInitials(displayName);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-button"
          aria-label="Open navigation"
          onClick={onOpenMobileMenu}
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
            onChange={(event) => onQueryChange(event.target.value)}
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
            onClick={onToggleNotifications}
          >
            ♧
            {pendingCount > 0 && <span className="notification-dot" />}
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
          className="topbar-signout"
          type="button"
          aria-label="Sign out of AssetPass"
          disabled={signingOut}
          onClick={requestLogout}
        >
          <span aria-hidden="true">↪</span>
          <span>Sign out</span>
        </button>

        <div className="profile-menu-wrap" ref={accountMenuRef}>
          <button
            className="profile-button"
            type="button"
            aria-label="Open account menu"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            onClick={() => {
              setAccountMenuOpen((open) => !open);
              setConfirmLogout(false);
            }}
          >
            <span className="profile-avatar">{initials}</span>

            <span className="profile-copy">
              <strong>{displayName}</strong>
              <small>{user?.email || "Account"}</small>
            </span>

            <span className="profile-chevron">
              {accountMenuOpen ? "⌃" : "⌄"}
            </span>
          </button>

          {accountMenuOpen && (
            <div className="profile-menu" role="menu">
              <div className="profile-menu-user">
                <strong>{displayName}</strong>
                <span className="profile-menu-email">
                  {user?.email || "No email available"}
                </span>
                <span className="profile-menu-status">
                  <span className="profile-status-dot" />
                  Account status: {user?.status || "Unknown"}
                </span>
              </div>

              <div className="profile-menu-divider" />

              {!confirmLogout ? (
                <button
                  className="profile-menu-signout"
                  type="button"
                  role="menuitem"
                  onClick={() => setConfirmLogout(true)}
                >
                  <span aria-hidden="true">↪</span>
                  Sign out
                </button>
              ) : (
                <div className="profile-menu-confirm">
                  <strong>Sign out of AssetPass?</strong>
                  <p>
                    Your current session will be ended on this device.
                  </p>

                  <div className="profile-menu-actions">
                    <button
                      className="profile-menu-cancel"
                      type="button"
                      disabled={signingOut}
                      onClick={() => setConfirmLogout(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="profile-menu-confirm-button"
                      type="button"
                      disabled={signingOut}
                      onClick={handleLogout}
                    >
                      {signingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
