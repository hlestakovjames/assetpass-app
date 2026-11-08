import type { ReactNode } from "react";

function Icon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`icon ${className}`}>{children}</span>;
}
