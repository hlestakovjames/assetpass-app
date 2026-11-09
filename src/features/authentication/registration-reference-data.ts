const GEO_API_BASE = "https://countriesnow.space/api/v0.1";

type ApiEnvelope<T> = {
  error?: boolean;
  msg?: string;
  data?: T;
};

export type RegistrationCountry = {
  name: string;
  iso2: string;
};

async function readApi<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Location service returned ${response.status}.`);
  }
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (payload.error || payload.data == null) {
    throw new Error(payload.msg || "Location data is temporarily unavailable.");
  }
  return payload.data;
}

export async function getRegistrationCountries(
  signal?: AbortSignal,
): Promise<RegistrationCountry[]> {
  const response = await fetch(`${GEO_API_BASE}/countries/iso`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "force-cache",
  });
  const data = await readApi<Array<{ name?: string; Iso2?: string; iso2?: string }>>(response);
  return data
    .filter((country) => country.name && /^[A-Za-z]{2}$/.test(country.Iso2 ?? country.iso2 ?? ""))
    .map((country) => ({
      name: country.name!.trim(),
      iso2: (country.Iso2 ?? country.iso2)!.toUpperCase(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRegistrationRegions(
  countryName: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const response = await fetch(
    `${GEO_API_BASE}/countries/states/q?country=${encodeURIComponent(countryName)}`,
    { signal, headers: { Accept: "application/json" }, cache: "force-cache" },
  );
  const data = await readApi<{ states?: Array<string | { name?: string }> }>(response);
  return (data.states ?? [])
    .map((region) => (typeof region === "string" ? region : region.name ?? ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export async function getRegistrationCities(
  countryName: string,
  regionName: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const response = await fetch(`${GEO_API_BASE}/countries/state/cities`, {
    method: "POST",
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ country: countryName, state: regionName }),
    cache: "force-cache",
  });
  const data = await readApi<string[]>(response);
  return data.filter(Boolean).sort((a, b) => a.localeCompare(b));
}

export const ORGANIZATION_TYPE_OPTIONS = [
  "Company",
  "Non-governmental organization (NGO)",
  "Non-profit organization",
  "Government institution",
  "Educational institution",
  "Healthcare institution",
  "Religious institution",
  "Cooperative",
  "Partnership",
  "Sole proprietorship",
  "Community-based organization",
  "Trust or foundation",
  "Other",
];

export const INDUSTRY_SECTOR_OPTIONS = [
  "Agriculture, forestry and fishing",
  "Mining and quarrying",
  "Manufacturing",
  "Construction and real estate",
  "Wholesale and retail trade",
  "Transport and logistics",
  "Accommodation and food services",
  "Information and communication technology",
  "Finance and insurance",
  "Professional and technical services",
  "Education",
  "Healthcare and social services",
  "Public administration",
  "Energy and utilities",
  "Water and sanitation",
  "Arts, entertainment and recreation",
  "Security and facilities management",
  "Non-profit and community services",
  "Other",
];

export const LEGAL_STRUCTURE_OPTIONS = [
  "Private limited company",
  "Public limited company",
  "Sole proprietorship",
  "General partnership",
  "Limited liability partnership",
  "Cooperative society",
  "Registered society",
  "Non-governmental organization",
  "Trust",
  "Foundation",
  "Government entity",
  "Public institution",
  "Other",
];

export const CONTACT_POSITION_OPTIONS = [
  "Owner",
  "Founder",
  "Director",
  "Managing Director / Chief Executive Officer",
  "Chairperson",
  "Secretary",
  "Treasurer",
  "Trustee",
  "Operations Manager",
  "Finance Manager",
  "ICT / IT Manager",
  "Procurement Officer",
  "Asset / Fleet Manager",
  "Administrator",
  "Authorized Representative",
  "Other",
];

export const ORGANIZATION_RELATIONSHIP_OPTIONS = [
  "Owner",
  "Founder",
  "Director or board member",
  "Partner",
  "Employee",
  "Trustee",
  "Authorized agent or representative",
  "Other",
];

export const REGISTRATION_AUTHORITY_OPTIONS: Record<string, string[]> = {
  KE: [
    "Business Registration Service (BRS)",
    "Registrar of Societies",
    "NGO Coordination Board",
    "Commissioner for Co-operative Development",
    "Sacco Societies Regulatory Authority (SASRA)",
    "Relevant government ministry or public registrar",
    "Other",
  ],
};
