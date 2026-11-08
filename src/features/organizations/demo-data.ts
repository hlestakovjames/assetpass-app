export type OrgStatus = "Pending review" | "Active" | "Suspended" | "Rejected";
export type ReviewAction = "approve" | "reject";

export type Organization = {
  id: string;
  name: string;
  category: string;
  applicant: string;
  email: string;
  submitted: string;
  status: OrgStatus;
  users: number;
};

export const initialOrganizations: Organization[] = [
  {
    id: "ORG-0001",
    name: "Nairobi Business College",
    category: "Education",
    applicant: "Mary Wanjiku",
    email: "mary@example.com",
    submitted: "23 Oct 2026",
    status: "Pending review",
    users: 0,
  },
  {
    id: "ORG-0002",
    name: "Summit Medical Centre",
    category: "Healthcare",
    applicant: "Peter Otieno",
    email: "peter@example.com",
    submitted: "22 Oct 2026",
    status: "Pending review",
    users: 0,
  },
  {
    id: "ORG-0003",
    name: "Greenfield Enterprises",
    category: "Business",
    applicant: "Grace Akinyi",
    email: "grace@example.com",
    submitted: "21 Oct 2026",
    status: "Active",
    users: 24,
  },
  {
    id: "ORG-0004",
    name: "Westlands Community Trust",
    category: "Non-profit",
    applicant: "David Kamau",
    email: "david@example.com",
    submitted: "20 Oct 2026",
    status: "Active",
    users: 12,
  },
  {
    id: "ORG-0005",
    name: "Lakeview Logistics",
    category: "Logistics",
    applicant: "Anne Achieng",
    email: "anne@example.com",
    submitted: "19 Oct 2026",
    status: "Suspended",
    users: 8,
  },
];
