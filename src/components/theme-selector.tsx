"use client";

import { useTheme } from "next-themes";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
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
