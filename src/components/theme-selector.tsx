"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  // The saved theme is only available in the browser. Keep the server and
  // first client render identical, then show the interactive selector.
  if (!mounted) {
    return (
      <span
        className="theme-selector-placeholder"
        role="status"
        aria-label="Loading appearance preference"
      >
        <span aria-hidden="true">◐</span>
      </span>
    );
  }

  const currentTheme = theme ?? "system";

  return (
    <label className="theme-selector" title="Choose appearance">
      <span className="theme-selector-symbol" aria-hidden="true">
        {currentTheme === "dark"
          ? "☾"
          : currentTheme === "light"
            ? "☀"
            : "◐"}
      </span>

      <select
        aria-label="Appearance"
        value={currentTheme}
        onChange={(event) => setTheme(event.target.value)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
