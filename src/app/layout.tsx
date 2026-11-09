import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/features/authentication/auth-provider";

export const metadata: Metadata = {
  title: {
    default: "AssetPass | Asset Lifecycle Management",
    template: "%s | AssetPass",
  },
  description:
    "AssetPass is an asset lifecycle and custody management platform for tracking organizational assets, assignments, inspections, maintenance and disposal.",
  applicationName: "AssetPass",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          storageKey="assetpass-dashboard-theme"
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
