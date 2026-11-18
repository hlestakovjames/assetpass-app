"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { submitOrganizationOnboardingApplication, type OrganizationOnboardingInput } from "@/features/authentication/auth-client";
import {
  CONTACT_POSITION_OPTIONS,
  INDUSTRY_SECTOR_OPTIONS,
  LEGAL_STRUCTURE_OPTIONS,
  ORGANIZATION_RELATIONSHIP_OPTIONS,
  ORGANIZATION_TYPE_OPTIONS,
  REGISTRATION_AUTHORITY_OPTIONS,
} from "@/features/authentication/registration-reference-data";
import styles from "../login/login.module.css";

type Values = Record<string, string>;

const fields: Array<{ key: keyof OrganizationOnboardingInput; label: string; type?: string; required?: boolean; options?: string[]; hint?: string }> = [
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
  { key: "registrationAuthority", label: "Registration authority", options: REGISTRATION_AUTHORITY_OPTIONS.KE },
  { key: "registrationDate", label: "Date of registration", type: "date" },
  { key: "contactEmail", label: "Official organisation email", type: "email", required: true },
  { key: "contactPhone", label: "Official organisation phone", type: "tel", required: true },
  { key: "alternativeEmail", label: "Alternative organisation email", type: "email" },
  { key: "website", label: "Website", type: "url" },
  { key: "countryCode", label: "Country code (ISO 3166-1 alpha-2)", required: true, hint: "For example, KE for Kenya." },
  { key: "county", label: "County / region" },
  { key: "city", label: "City / town" },
  { key: "physicalAddress", label: "Physical operating address", required: true },
  { key: "postalAddress", label: "Postal address" },
  { key: "postalCode", label: "Postal code" },
  { key: "taxIdentifier", label: "Tax identifier" },
  { key: "description", label: "Organisation description" },
];

export function OrganizationOnboardingForm({ onBack }: { onBack: () => void }) {
  const [values, setValues] = useState<Values>({ countryCode: "KE" });
  const [authority, setAuthority] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!authority || !privacy) {
      setError("Confirm your authority to submit and acknowledge the privacy notice.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        authorityConfirmation: "yes" as const,
        privacyNoticeAcknowledged: true as const,
      } as OrganizationOnboardingInput;
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
