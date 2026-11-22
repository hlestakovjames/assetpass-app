"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  submitOrganizationOnboardingApplication,
  type OrganizationOnboardingInput,
} from "@/features/authentication/auth-client";
import {
  CONTACT_POSITION_OPTIONS,
  INDUSTRY_SECTOR_OPTIONS,
  LEGAL_STRUCTURE_OPTIONS,
  ORGANIZATION_RELATIONSHIP_OPTIONS,
  ORGANIZATION_TYPE_OPTIONS,
  REGISTRATION_AUTHORITY_OPTIONS,
  getRegistrationCities,
  getRegistrationCountries,
  getRegistrationRegions,
  type RegistrationCountry,
} from "@/features/authentication/registration-reference-data";
import styles from "../login/login.module.css";

type Values = Record<string, string>;

const fields: Array<{
  key: keyof OrganizationOnboardingInput;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
  hint?: string;
}> = [
  { key: "representativeFirstName", label: "Representative first name", required: true },
  { key: "representativeLastName", label: "Representative last name", required: true },
  { key: "representativeEmail", label: "Representative email (verification link goes here)", type: "email", required: true },
  { key: "representativePosition", label: "Position / designation", required: true, options: CONTACT_POSITION_OPTIONS },
  { key: "registrationRelationship", label: "Relationship to the organisation", required: true, options: ORGANIZATION_RELATIONSHIP_OPTIONS },
  { key: "organizationDisplayName", label: "Organisation display name", required: true },
  { key: "legalName", label: "Full legal name" },
  { key: "organizationType", label: "Organisation type", required: true, options: ORGANIZATION_TYPE_OPTIONS },
  { key: "industrySector", label: "Industry / sector", options: INDUSTRY_SECTOR_OPTIONS },
  { key: "legalStructure", label: "Legal structure", options: LEGAL_STRUCTURE_OPTIONS },
  { key: "registrationNumber", label: "Registration number" },
  { key: "registrationDate", label: "Date of registration", type: "date" },
  { key: "contactEmail", label: "Official organisation email", type: "email", required: true },
  { key: "contactPhone", label: "Official organisation phone", type: "tel", required: true },
  { key: "alternativeEmail", label: "Alternative organisation email", type: "email" },
  { key: "website", label: "Website", type: "url" },
  { key: "physicalAddress", label: "Physical operating address", required: true },
  { key: "postalAddress", label: "Postal address" },
  { key: "postalCode", label: "Postal code" },
  { key: "taxIdentifier", label: "Tax identifier" },
  { key: "description", label: "Organisation description" },
];

export function OrganizationOnboardingForm({ onBack }: { onBack: () => void }) {
  const [values, setValues] = useState<Values>({
    countryCode: "KE",
    countryName: "Kenya",
  });
  const [countries, setCountries] = useState<RegistrationCountry[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [authority, setAuthority] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getRegistrationCountries(controller.signal)
      .then((items) => {
        setCountries(items);
        const kenya = items.find((country) => country.iso2 === "KE");
        if (kenya) {
          setValues((previous) => ({
            ...previous,
            countryCode: previous.countryCode || kenya.iso2,
            countryName: previous.countryName || kenya.name,
          }));
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setLocationError(
            cause instanceof Error
              ? cause.message
              : "Country list unavailable. You can enter an ISO country code manually.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCountriesLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!values.countryName) return;
    const controller = new AbortController();
    getRegistrationRegions(values.countryName, controller.signal)
      .then((items) => {
        setRegions(items);
        setLocationError("");
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setLocationError(
            cause instanceof Error
              ? cause.message
              : "County or region data is unavailable. You can enter it manually.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRegionsLoading(false);
      });
    return () => controller.abort();
  }, [values.countryName]);

  useEffect(() => {
    if (!values.countryName || !values.county || values.county === "__other__") return;
    const controller = new AbortController();
    getRegistrationCities(values.countryName, values.county, controller.signal)
      .then((items) => {
        setCities(items);
        setLocationError("");
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setLocationError(
            cause instanceof Error
              ? cause.message
              : "City and town data is unavailable. You can enter it manually.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCitiesLoading(false);
      });
    return () => controller.abort();
  }, [values.countryName, values.county]);

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function selectCountry(code: string) {
    const country = countries.find((item) => item.iso2 === code);
    setValues((previous) => ({
      ...previous,
      countryCode: code,
      countryName: country?.name ?? "",
      county: "",
      countyOther: "",
      city: "",
      cityOther: "",
      registrationAuthority: "",
      registrationAuthorityOther: "",
    }));
    setRegions([]);
    setCities([]);
    setRegionsLoading(Boolean(country));
    setCitiesLoading(false);
    setLocationError("");
  }

  function setManualCountryCode(code: string) {
    setValues((previous) => ({
      ...previous,
      countryCode: code.toUpperCase(),
      countryName: "",
      county: "",
      countyOther: "",
      city: "",
      cityOther: "",
      registrationAuthority: "",
      registrationAuthorityOther: "",
    }));
    setRegions([]);
    setCities([]);
    setRegionsLoading(false);
    setCitiesLoading(false);
    setLocationError("");
  }

  function selectRegion(region: string) {
    setValues((previous) => ({
      ...previous,
      county: region,
      countyOther: "",
      city: "",
      cityOther: "",
    }));
    setCities([]);
    setCitiesLoading(Boolean(region && region !== "__other__"));
    setLocationError("");
  }

  function resolvedValue(key: string): string {
    const value = values[key] ?? "";
    return value === "Other" || value === "__other__"
      ? (values[key + "Other"] ?? "").trim()
      : value.trim();
  }

  const authorityOptions = REGISTRATION_AUTHORITY_OPTIONS[values.countryCode ?? "KE"] ?? ["Other"];
  const manualCounty =
    values.county === "__other__" ||
    !values.countryName ||
    (!regionsLoading && regions.length === 0);
  const manualCity =
    values.city === "__other__" ||
    values.county === "__other__" ||
    !values.countryName ||
    (Boolean(values.county) && values.county !== "__other__" && !citiesLoading && cities.length === 0);
  const manualAuthority =
    values.registrationAuthority === "Other" || authorityOptions.length === 1;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!authority || !privacy) {
      setError("Confirm your authority to submit and acknowledge the privacy notice.");
      return;
    }
    if (!/^[A-Za-z]{2}$/.test(values.countryCode ?? "")) {
      setError("Select a country or enter a valid two-letter ISO country code.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: OrganizationOnboardingInput = {
        representativeFirstName: values.representativeFirstName?.trim() ?? "",
        representativeLastName: values.representativeLastName?.trim() ?? "",
        representativeEmail: values.representativeEmail?.trim().toLowerCase() ?? "",
        representativePosition: values.representativePosition ?? "",
        registrationRelationship: values.registrationRelationship ?? "",
        authorityConfirmation: "yes",
        privacyNoticeAcknowledged: true,
        organizationDisplayName: values.organizationDisplayName?.trim() ?? "",
        organizationType: values.organizationType ?? "",
        legalName: values.legalName?.trim() || undefined,
        industrySector: values.industrySector || undefined,
        legalStructure: values.legalStructure || undefined,
        registrationNumber: values.registrationNumber?.trim() || undefined,
        registrationAuthority: resolvedValue("registrationAuthority") || undefined,
        registrationDate: values.registrationDate || undefined,
        contactEmail: values.contactEmail?.trim().toLowerCase() ?? "",
        contactPhone: values.contactPhone?.trim() ?? "",
        alternativeEmail: values.alternativeEmail?.trim().toLowerCase() || undefined,
        website: values.website?.trim() || undefined,
        description: values.description?.trim() || undefined,
        countryCode: values.countryCode.toUpperCase(),
        county: resolvedValue("county") || undefined,
        city: resolvedValue("city") || undefined,
        physicalAddress: values.physicalAddress?.trim() ?? "",
        postalAddress: values.postalAddress?.trim() || undefined,
        postalCode: values.postalCode?.trim() || undefined,
        taxIdentifier: values.taxIdentifier?.trim() || undefined,
      };
      const result = await submitOrganizationOnboardingApplication(payload);
      setSuccess(result.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit the organisation application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.form} role="status" aria-live="polite">
        <div style={{ padding: 14, border: "1px solid #b9e5d8", borderRadius: 8, background: "#effaf6", color: "#176b58" }}>
          <strong>Application received</strong>
          <p>{success}</p>
        </div>
        <p className={styles.formNote}>No personal AssetPass account has been created. The organisation will enter platform review after the representative email is verified. The representative can link an existing or newly created verified AssetPass account after approval.</p>
        <Link href="/" style={{ color: "#0f8f84", textAlign: "center", fontSize: 12, fontWeight: 700 }}>Return to AssetPass home</Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.formNote}>Submit an organisation application without creating a personal account. We will verify the representative email before sending the application for platform review.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
        {fields.map((field) => (
          <div className={styles.field} key={field.key}>
            <label htmlFor={field.key}>{field.label}{field.required ? " *" : ""}</label>
            <div className={styles.inputWrap}>
              {field.options ? (
                <select
                  id={field.key}
                  value={values[field.key] ?? ""}
                  required={field.required}
                  disabled={submitting}
                  onChange={(event) => setValue(field.key, event.target.value)}
                  style={{ width: "100%", border: 0, background: "transparent", color: "#123047", minHeight: 48 }}
                >
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input
                  id={field.key}
                  type={field.type ?? "text"}
                  value={values[field.key] ?? ""}
                  required={field.required}
                  disabled={submitting}
                  maxLength={field.key === "description" ? 10000 : 2000}
                  onChange={(event) => setValue(field.key, event.target.value)}
                />
              )}
            </div>
            {field.hint && <p className={styles.formNote}>{field.hint}</p>}
          </div>
        ))}
        <div className={styles.field}>
          <label htmlFor="countryCode">Country *</label>
          <div className={styles.inputWrap}>
            {countriesLoading ? (
              <select id="countryCode" disabled value="" style={{ width: "100%", border: 0, background: "transparent", color: "#718293", minHeight: 48 }}>
                <option value="">Loading countries…</option>
              </select>
            ) : countries.length > 0 ? (
              <select id="countryCode" value={values.countryCode ?? "KE"} onChange={(event) => selectCountry(event.target.value)} disabled={submitting} style={{ width: "100%", border: 0, background: "transparent", color: "#123047", minHeight: 48 }}>
                <option value="">Select country</option>
                {countries.map((country) => <option key={country.iso2} value={country.iso2}>{country.name}</option>)}
              </select>
            ) : (
              <input id="countryCode" value={values.countryCode ?? ""} onChange={(event) => setManualCountryCode(event.target.value)} disabled={submitting} placeholder="ISO country code (e.g. KE)" minLength={2} maxLength={2} pattern="[A-Za-z]{2}" />
            )}
          </div>
          {countriesLoading && <p className={styles.formNote}>Loading country list…</p>}
          {locationError && <p className={styles.formNote} role="status">{locationError}</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="county">County / region</label>
          {manualCounty ? (
            <div className={styles.inputWrap}>
              <input id="county" value={values.countyOther ?? (values.county === "__other__" ? "" : values.county ?? "")} onChange={(event) => setValue("countyOther", event.target.value)} disabled={submitting} maxLength={160} placeholder="Enter county / region" />
            </div>
          ) : (
            <div className={styles.inputWrap}>
              <select id="county" value={values.county ?? ""} onChange={(event) => selectRegion(event.target.value)} disabled={submitting || regionsLoading || !values.countryName} style={{ width: "100%", border: 0, background: "transparent", color: "#123047", minHeight: 48 }}>
                <option value="">Select county / region</option>
                {regions.map((region) => <option key={region} value={region}>{region}</option>)}
                <option value="__other__">Other / enter manually</option>
              </select>
            </div>
          )}
          {regionsLoading && <p className={styles.formNote}>Loading counties / regions…</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="city">City / town</label>
          {manualCity ? (
            <div className={styles.inputWrap}>
              <input id="city" value={values.cityOther ?? (values.city === "__other__" ? "" : values.city ?? "")} onChange={(event) => setValue("cityOther", event.target.value)} disabled={submitting} maxLength={160} placeholder="Enter city / town" />
            </div>
          ) : (
            <div className={styles.inputWrap}>
              <select id="city" value={values.city ?? ""} onChange={(event) => setValue("city", event.target.value)} disabled={submitting || citiesLoading || !values.county || values.county === "__other__"} style={{ width: "100%", border: 0, background: "transparent", color: "#123047", minHeight: 48 }}>
                <option value="">Select city / town</option>
                {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                <option value="__other__">Other / enter manually</option>
              </select>
            </div>
          )}
          {citiesLoading && <p className={styles.formNote}>Loading cities / towns…</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="registrationAuthority">Registration authority</label>
          {manualAuthority ? (
            <div className={styles.inputWrap}>
              <input id="registrationAuthority" value={values.registrationAuthorityOther ?? (values.registrationAuthority === "Other" ? "" : values.registrationAuthority ?? "")} onChange={(event) => setValue("registrationAuthorityOther", event.target.value)} disabled={submitting} maxLength={160} placeholder="Enter registration authority" />
            </div>
          ) : (
            <div className={styles.inputWrap}>
              <select id="registrationAuthority" value={values.registrationAuthority ?? ""} onChange={(event) => setValue("registrationAuthority", event.target.value)} disabled={submitting} style={{ width: "100%", border: 0, background: "transparent", color: "#123047", minHeight: 48 }}>
                <option value="">Select registration authority</option>
                {authorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              {values.registrationAuthority === "Other" && (
                <input aria-label="Enter registration authority" value={values.registrationAuthorityOther ?? ""} onChange={(event) => setValue("registrationAuthorityOther", event.target.value)} disabled={submitting} maxLength={160} placeholder="Enter registration authority" />
              )}
            </div>
          )}
        </div>
      </div>
      <label style={{ display: "flex", gap: 9, alignItems: "flex-start", color: "#526779", fontSize: 12, lineHeight: 1.6 }}>
        <input type="checkbox" checked={authority} onChange={(event) => setAuthority(event.target.checked)} />
        <span>I confirm that I am authorised to submit this application on behalf of the organisation and that the information is accurate. *</span>
      </label>
      <label style={{ display: "flex", gap: 9, alignItems: "flex-start", color: "#526779", fontSize: 12, lineHeight: 1.6 }}>
        <input type="checkbox" checked={privacy} onChange={(event) => setPrivacy(event.target.checked)} />
        <span>I acknowledge the AssetPass privacy notice and consent to processing the representative and organisation details for this application. *</span>
      </label>
      {error && <div className={styles.error} role="alert">{error}</div>}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" className={styles.submit} style={{ background: "#fff", color: "#123047", borderColor: "#d5dfe7" }} onClick={onBack} disabled={submitting}>Back</button>
        <button type="submit" className={styles.submit} disabled={submitting} aria-busy={submitting}>{submitting ? "Submitting…" : "Submit organisation application"}</button>
      </div>
    </form>
  );
}
