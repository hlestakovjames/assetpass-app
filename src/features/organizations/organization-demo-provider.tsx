"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { initialOrganizations } from "./demo-data";
import type { Organization } from "./demo-data";

type OrganizationDemoContextValue = {
  organizations: Organization[];
  setOrganizations: Dispatch<SetStateAction<Organization[]>>;
};

const OrganizationDemoContext = createContext<OrganizationDemoContextValue | null>(null);

export function OrganizationDemoProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const value = useMemo(
    () => ({ organizations, setOrganizations }),
    [organizations],
  );

  return (
    <OrganizationDemoContext.Provider value={value}>
      {children}
    </OrganizationDemoContext.Provider>
  );
}

export function useOrganizationDemo() {
  const context = useContext(OrganizationDemoContext);
  if (!context) {
    throw new Error("useOrganizationDemo must be used inside OrganizationDemoProvider.");
  }
  return context;
}
