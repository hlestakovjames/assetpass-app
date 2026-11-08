import type { ReactNode } from "react";

type PlatformShellProps = {
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  children: ReactNode;
};

export function PlatformShell({ mobileMenuOpen, onCloseMobileMenu, children }: PlatformShellProps) {
  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button className="mobile-backdrop" aria-label="Close navigation" onClick={onCloseMobileMenu} />
      )}
      {children}
    </div>
  );
}
