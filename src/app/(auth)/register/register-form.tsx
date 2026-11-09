"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { registerAccount, type RegistrationInput } from "@/features/authentication/auth-client";
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

type AccountType = "individual" | "organization";
type FormValues = Record<string, string>;
type RegistrationField = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  hint?: string;
  auto?: string;
  options?: string[];
  allowOther?: boolean;
};

const individualSteps = [
  { title: "Personal identity", description: "Tell us who will own and manage assets in AssetPass." },
  { title: "Contact information", description: "Provide a mobile number and your preferred contact details." },
  { title: "Location and address", description: "Tell us where you are based. A physical address is optional." },
  { title: "Personal profile", description: "These details help tailor your AssetPass experience." },
  { title: "Account security", description: "Create the credentials you will use to sign in." },
  { title: "Review and create", description: "Check your information before creating your active account." },
];

const organizationSteps = [
  { title: "Primary contact", description: "Who is registering and will initially manage this organization?" },
  { title: "Organization identity", description: "Provide the organization's official and public identity." },
  { title: "Legal registration", description: "Add legal registration details where they apply." },
  { title: "Official contacts", description: "Provide contact channels that represent the organization." },
  { title: "Organization location", description: "A physical operating address is required for organization registration." },
  { title: "Registration authority", description: "Confirm your relationship with the organization." },
  { title: "Account security", description: "Create the primary contact's AssetPass login credentials." },
  { title: "Review and submit", description: "Review the primary contact and organization information." },
];

const individualFields: Record<number, RegistrationField[]> = {
  1: [
    { key: "firstName", label: "First name", required: true, auto: "given-name" },
    { key: "middleName", label: "Middle name", auto: "additional-name" },
    { key: "lastName", label: "Last name", required: true, auto: "family-name" },
  ],
  2: [
    { key: "email", label: "Email address", type: "email", required: true, auto: "email" },
    { key: "phoneNumber", label: "Mobile phone number", type: "tel", required: true, hint: "Include your country code where possible, e.g. +254712345678.", auto: "tel" },
    { key: "alternativePhone", label: "Alternative phone number", type: "tel" },
  ],
  3: [
    { key: "countryCode", label: "Country", required: true },
    { key: "county", label: "County / region" },
    { key: "city", label: "City / town" },
    { key: "physicalAddress", label: "Physical / residential address", hint: "Optional for individual accounts." },
    { key: "postalAddress", label: "Postal address" },
  ],
  4: [{ key: "occupation", label: "Occupation / profession" }],
};

const organizationFields: Record<number, RegistrationField[]> = {
  1: [
    { key: "firstName", label: "Your first name", required: true, auto: "given-name" },
    { key: "middleName", label: "Your middle name" },
    { key: "lastName", label: "Your last name", required: true, auto: "family-name" },
    { key: "position", label: "Your position / designation", required: true, options: CONTACT_POSITION_OPTIONS, allowOther: true },
    { key: "email", label: "Your login email", type: "email", required: true, auto: "email" },
    { key: "phoneNumber", label: "Your mobile phone number", type: "tel", required: true, auto: "tel" },
  ],
  2: [
    { key: "organizationDisplayName", label: "Organization display name", required: true },
    { key: "legalName", label: "Full legal name" },
    { key: "organizationType", label: "Organization type", required: true, options: ORGANIZATION_TYPE_OPTIONS, allowOther: true },
    { key: "industrySector", label: "Industry / sector", required: true, options: INDUSTRY_SECTOR_OPTIONS, allowOther: true },
    { key: "description", label: "Organization description" },
  ],
  3: [
    { key: "legalStructure", label: "Legal structure", options: LEGAL_STRUCTURE_OPTIONS, allowOther: true },
    { key: "registrationNumber", label: "Registration number", hint: "Optional for organization types without formal registration." },
    { key: "registrationAuthority", label: "Registration authority", allowOther: true },
    { key: "registrationDate", label: "Date of registration", type: "date" },
    { key: "taxIdentifier", label: "Tax identifier (optional)" },
  ],
  4: [
    { key: "contactEmail", label: "Official organization email", type: "email", required: true },
    { key: "contactPhone", label: "Official organization phone", type: "tel", required: true },
    { key: "alternativeEmail", label: "Alternative organization email", type: "email" },
    { key: "website", label: "Organization website", type: "url", hint: "Include https:// where available." },
  ],
  5: [
    { key: "countryCode", label: "Country", required: true },
    { key: "county", label: "County / region" },
    { key: "city", label: "City / town" },
    { key: "physicalAddress", label: "Physical operating address", required: true },
    { key: "postalAddress", label: "Postal address" },
    { key: "postalCode", label: "Postal code" },
  ],
  6: [
    { key: "registrationRelationship", label: "Your relationship to the organization", required: true, options: ORGANIZATION_RELATIONSHIP_OPTIONS, allowOther: true },
  ],
};

function Field({ field, value, onChange, otherValue, onOtherChange, disabled }: {
  field: RegistrationField;
  value: string;
  onChange: (value: string) => void;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  disabled: boolean;
}) {
  const isOther = field.allowOther && value === "Other";
  const options = field.options;

  return (
    <div className={styles.field}>
      <label htmlFor={field.key}>{field.label}{field.required ? " *" : " (optional)"}</label>
      <div className={styles.inputWrap}>
        {options ? (
          <select
            id={field.key}
            name={field.key}
            data-step-field="true"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required={field.required}
            disabled={disabled}
            style={{ width: "100%", border: 0, background: "transparent", color: "#123047", minHeight: 48 }}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {options.map((option) => <option key={option} value={option}>{option === "Other" ? "Other / enter manually" : option}</option>)}
          </select>
        ) : (
          <input
            id={field.key}
            name={field.key}
            data-step-field="true"
            type={field.type ?? "text"}
            autoComplete={field.auto}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required={field.required}
            disabled={disabled}
            maxLength={field.key === "email" || field.key === "contactEmail" ? 320 : 500}
          />
        )}
      </div>
      {isOther && (
        <div className={styles.inputWrap}>
          <input
            aria-label={`Enter ${field.label.toLowerCase()}`}
            data-step-field="true"
            value={otherValue ?? ""}
            onChange={(event) => onOtherChange?.(event.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
            disabled={disabled}
            maxLength={500}
          />
        </div>
      )}
      {field.hint && <p className={styles.formNote} style={{ textAlign: "left", marginTop: 0 }}>{field.hint}</p>}
    </div>
  );
}

export function RegisterForm() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormValues>({
    countryCode: "KE",
    countryName: "Kenya",
    preferredContactMethod: "email",
  });
  const [countries, setCountries] = useState<RegistrationCountry[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const steps = accountType === "organization" ? organizationSteps : individualSteps;
  const current = steps[step];
  const fields = useMemo(() => {
    if (!accountType) return [];
    return accountType === "organization"
      ? organizationFields[step + 1] ?? []
      : individualFields[step + 1] ?? [];
  }, [accountType, step]);

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
          setLocationError(cause instanceof Error ? cause.message : "Country list unavailable. You can enter an ISO country code manually.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCountriesLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!values.countryName) {
      setRegions([]);
      setCities([]);
      return;
    }
    const controller = new AbortController();
    setRegionsLoading(true);
    setRegions([]);
    setCities([]);
    getRegistrationRegions(values.countryName, controller.signal)
      .then(setRegions)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setLocationError(cause instanceof Error ? cause.message : "County or region data is unavailable. You can enter it manually.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRegionsLoading(false);
      });
    return () => controller.abort();
  }, [values.countryName]);

  useEffect(() => {
    if (!values.countryName || !values.county || values.county === "__other__") {
      setCities([]);
      return;
    }
    const controller = new AbortController();
    setCitiesLoading(true);
    setCities([]);
    getRegistrationCities(values.countryName, values.county, controller.signal)
      .then(setCities)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setLocationError(cause instanceof Error ? cause.message : "City and town data is unavailable. You can enter it manually.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCitiesLoading(false);
      });
    return () => controller.abort();
  }, [values.countryName, values.county]);

  function setValue(key: string, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  function resolvedValue(key: string): string {
    const value = values[key] ?? "";
    return value === "Other" ? (values[`${key}Other`] ?? "").trim() : value === "__other__" ? (values[`${key}Other`] ?? "").trim() : value;
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
    setLocationError("");
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
    setLocationError("");
  }

  function selectRegion(region: string) {
    setValues((previous) => ({
      ...previous,
      county: region,
      countyOther: "",
      city: region === "__other__" ? "__other__" : "",
      cityOther: "",
    }));
    setLocationError("");
  }

  function validateCurrentStep() {
    const controls = Array.from(formRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-step-field]") ?? []);
    for (const control of controls) {
      if (!control.checkValidity()) {
        control.reportValidity();
        control.focus();
        return false;
      }
    }
    if (accountType === "organization" && step === 5 && values.authorityConfirmation !== "yes") {
      setError("Please confirm that you are authorized to submit this registration on the organization's behalf.");
      return false;
    }
    if (step === (accountType === "organization" ? 6 : 4)) {
      if (!values.password || values.password.length < 12) {
        setError("Use a password containing at least 12 characters.");
        return false;
      }
      if (values.password !== values.confirmPassword) {
        setError("The passwords do not match.");
        return false;
      }
      if (!values.acceptTerms || !values.privacyNoticeAcknowledged) {
        setError("Please accept the terms of service and acknowledge the privacy notice to continue.");
        return false;
      }
    }
    setError("");
    return true;
  }

  function nextStep() {
    setError("");
    if (!validateCurrentStep()) return;
    setStep((previous) => Math.min(previous + 1, steps.length - 1));
  }

  function buildPayload(): RegistrationInput {
    const payload: RegistrationInput = {
      accountType: accountType!,
      firstName: values.firstName?.trim() ?? "",
      middleName: values.middleName?.trim() || undefined,
      lastName: values.lastName?.trim() ?? "",
      email: values.email?.trim().toLowerCase() ?? "",
      password: values.password ?? "",
      phoneNumber: values.phoneNumber?.trim() ?? "",
      alternativePhone: values.alternativePhone?.trim() || undefined,
      countryCode: values.countryCode?.trim().toUpperCase() || "KE",
      county: resolvedValue("county") || undefined,
      city: resolvedValue("city") || undefined,
      physicalAddress: values.physicalAddress?.trim() || undefined,
      postalAddress: values.postalAddress?.trim() || undefined,
      occupation: values.occupation?.trim() || undefined,
      preferredContactMethod: values.preferredContactMethod === "phone" ? "phone" : "email",
      termsAccepted: values.acceptTerms === "yes",
      privacyNoticeAcknowledged: values.privacyNoticeAcknowledged === "yes",
    };
    if (accountType === "organization") {
      Object.assign(payload, {
        organizationDisplayName: values.organizationDisplayName?.trim(),
        legalName: values.legalName?.trim() || undefined,
        organizationType: resolvedValue("organizationType"),
        industrySector: resolvedValue("industrySector"),
        legalStructure: resolvedValue("legalStructure") || undefined,
        registrationNumber: values.registrationNumber?.trim() || undefined,
        registrationAuthority: resolvedValue("registrationAuthority") || undefined,
        registrationDate: values.registrationDate || undefined,
        contactEmail: values.contactEmail?.trim().toLowerCase(),
        contactPhone: values.contactPhone?.trim(),
        alternativeEmail: values.alternativeEmail?.trim() || undefined,
        website: values.website?.trim() || undefined,
        description: values.description?.trim() || undefined,
        postalCode: values.postalCode?.trim() || undefined,
        position: resolvedValue("position"),
        registrationRelationship: resolvedValue("registrationRelationship"),
        authorityConfirmation: values.authorityConfirmation === "yes" ? "YES" : undefined,
      });
    }
    return payload;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!accountType) return;
    if (step !== reviewStep) { nextStep(); return; }
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    try {
      const result = await registerAccount(buildPayload());
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.form} role="status" aria-live="polite">
        <div className={styles.securityNote} style={{ marginTop: 0, padding: 14, border: "1px solid #b9e5d8", borderRadius: 8, background: "#effaf6", color: "#176b58" }}>
          <span className={styles.securityIcon}>✓</span><span>{success}</span>
        </div>
        <p className={styles.formNote}>Your user account is active immediately. Organization workspaces become available after the organization is reviewed and approved.</p>
        <Link href="/login" style={{ color: "#0f8f84", textAlign: "center", fontSize: 12, fontWeight: 700 }}>Continue to sign in</Link>
      </div>
    );
  }

  if (!accountType) {
    return (
      <div className={styles.form}>
        <p style={{ color: "#526779", fontSize: 13, margin: 0 }}>Choose the type of account you want to create.</p>
        <button type="button" className={styles.submit} onClick={() => { setAccountType("individual"); setStep(0); }}>Individual account <span aria-hidden="true">→</span></button>
        <button type="button" className={styles.submit} onClick={() => { setAccountType("organization"); setStep(0); }}>Organization account <span aria-hidden="true">→</span></button>
        <p className={styles.formNote}>You can create or join an organization later using the same individual account.</p>
      </div>
    );
  }

  const securityStep = accountType === "organization" ? 6 : 4;
  const reviewStep = steps.length - 1;
  const registrationAuthorityOptions = REGISTRATION_AUTHORITY_OPTIONS[values.countryCode ?? "KE"] ?? ["Other"];

  return (
    <div className={styles.form}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <span style={{ color: "#0f9488", fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>STEP {step + 1} OF {steps.length}</span>
        <button type="button" onClick={() => { setAccountType(null); setStep(0); setError(""); }} disabled={submitting} style={{ border: 0, background: "transparent", color: "#0f8f84", fontSize: 11, fontWeight: 700 }}>Change account type</button>
      </div>
      <div aria-label="Registration progress" style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`, gap: 5 }}>
        {steps.map((item, index) => <span key={item.title} style={{ height: 5, borderRadius: 8, background: index <= step ? "#0f9f91" : "#e2e9ee" }} />)}
      </div>
      <div>
        <h2 style={{ margin: "0 0 6px", color: "#123047", fontSize: 19 }}>{current.title}</h2>
        <p style={{ margin: 0, color: "#718293", fontSize: 12, lineHeight: 1.6 }}>{current.description}</p>
      </div>
      <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
        {step < securityStep && fields.map((field) => {
          if (field.key === "countryCode") {
            return (
              <div className={styles.field} key={field.key}>
                <label htmlFor="countryCode">Country *</label>
                <div className={styles.inputWrap}>
                  {countriesLoading ? (
                    <select id="countryCode" disabled value="" style={{ width: "100%", border: 0, background: "transparent", color: "#718293", minHeight: 48 }}>
                      <option value="">Loading countries…</option>
                    </select>
                  ) : countries.length > 0 ? (
                    <select id="countryCode" name="countryCode" data-step-field="true" required value={values.countryCode ?? "KE"} onChange={(event) => selectCountry(event.target.value)} disabled={submitting} style={{ width: "100%", border: 0, background: "transparent", color: "#123047", minHeight: 48 }}>
                      <option value="">Select country</option>
                      {countries.map((country) => <option key={country.iso2} value={country.iso2}>{country.name}</option>)}
                    </select>
                  ) : (
                    <input id="countryCode" name="countryCode" data-step-field="true" required maxLength={2} minLength={2} pattern="[A-Za-z]{2}" value={values.countryCode ?? "KE"} onChange={(event) => setManualCountryCode(event.target.value)} disabled={submitting} placeholder="ISO country code (e.g. KE)" />
                  )}
                </div>
                {countriesLoading && <p className={styles.formNote}>Loading country list…</p>}
                {locationError && <p className={styles.formNote} role="status">{locationError}</p>}
              </div>
            );
          }
          if (field.key === "county") {
            const manualCounty = values.county === "__other__";
            return (
              <div className={styles.field} key={field.key}>
                <label htmlFor="county">County / region (optional)</label>
                <div className={styles.inputWrap}>
                  <select id="county" name="county" value={manualCounty ? "__other__" : values.county ?? ""} onChange={(event) => selectRegion(event.target.value)} disabled={submitting || regionsLoading || !values.countryName} style={{ width: "100%", border: 0, background: "transparent", color: "#123047", minHeight: 48 }}>
                    <option value="">Select county / region</option>
                    {regions.map((region) => <option key={region} value={region}>{region}</option>)}
                    <option value="__other__">Other / enter manually</option>
                  </select>
                </div>
                {manualCounty && <div className={styles.inputWrap}><input aria-label="Enter county or region" placeholder="Enter county / region" value={values.countyOther ?? ""} onChange={(event) => setValue("countyOther", event.target.value)} disabled={submitting} maxLength={160} /></div>}
                {regionsLoading && <p className={styles.formNote}>Loading counties / regions…</p>}
              </div>
            );
          }
          if (field.key === "city") {
            const manualCity = values.city === "__other__" || values.county === "__other__" || (Boolean(values.county) && regions.length === 0);
            return (
              <div className={styles.field} key={field.key}>
                <label htmlFor="city">City / town (optional)</label>
                {manualCity ? (
                  <div className={styles.inputWrap}><input id="city" name="city" placeholder="Enter city / town" value={values.cityOther ?? (values.city === "__other__" ? "" : values.city ?? "")} onChange={(event) => setValue("cityOther", event.target.value)} disabled={submitting} maxLength={160} /></div>
                ) : (
                  <>
                    <div className={styles.inputWrap}>
                      <select id="city" name="city" value={values.city ?? ""} onChange={(event) => setValue("city", event.target.value === "__other__" ? "__other__" : event.target.value)} disabled={submitting || citiesLoading || !values.county} style={{ width: "100%", border: 0, background: "transparent", color: "#123047", minHeight: 48 }}>
                        <option value="">Select city / town</option>
                        {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                        <option value="__other__">Other / enter manually</option>
                      </select>
                    </div>
                    {values.city === "__other__" && <div className={styles.inputWrap}><input aria-label="Enter city or town" placeholder="Enter city / town" value={values.cityOther ?? ""} onChange={(event) => setValue("cityOther", event.target.value)} disabled={submitting} maxLength={160} /></div>}
                  </>
                )}
                {citiesLoading && <p className={styles.formNote}>Loading cities / towns…</p>}
              </div>
            );
          }
          if (field.key === "registrationAuthority") {
            return (
              <Field
                key={field.key}
                field={{ ...field, options: registrationAuthorityOptions }}
                value={values.registrationAuthority ?? ""}
                onChange={(value) => setValue("registrationAuthority", value)}
                otherValue={values.registrationAuthorityOther}
                onOtherChange={(value) => setValue("registrationAuthorityOther", value)}
                disabled={submitting}
              />
            );
          }
          return (
            <Field
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              onChange={(value) => setValue(field.key, value)}
              otherValue={values[`${field.key}Other`]}
              onOtherChange={(value) => setValue(`${field.key}Other`, value)}
              disabled={submitting}
            />
          );
        })}

        {(step === 2 && accountType === "individual" || step === 4 && accountType === "organization") && (
          <p className={styles.formNote}>Location lists are provided by <a href="https://countriesnow.space/" target="_blank" rel="noreferrer">CountriesNow</a>. If a county, region, city or town is missing, choose “Other / enter manually”.</p>
        )}

        {step === 1 && accountType === "individual" && (
          <div className={styles.field}>
            <label htmlFor="preferredContactMethod">Preferred contact method</label>
            <div className={styles.inputWrap}>
              <select id="preferredContactMethod" value={values.preferredContactMethod ?? "email"} onChange={(event) => setValue("preferredContactMethod", event.target.value)} style={{ width: "100%", border: 0, background: "transparent", color: "#123047", minHeight: 48 }}>
                <option value="email">Email</option><option value="phone">Phone</option>
              </select>
            </div>
          </div>
        )}

        {accountType === "organization" && step === 5 && (
          <label style={{ display: "flex", gap: 9, alignItems: "flex-start", color: "#526779", fontSize: 12, lineHeight: 1.6 }}>
            <input type="checkbox" checked={values.authorityConfirmation === "yes"} onChange={(event) => setValue("authorityConfirmation", event.target.checked ? "yes" : "")} />
            <span>I confirm that I am authorized to submit this organization registration and that the information provided is accurate. *</span>
          </label>
        )}

        {step === securityStep && (
          <>
            <Field field={{ key: "password", label: "Password", type: showPassword ? "text" : "password", required: true, hint: "Use at least 12 characters." }} value={values.password ?? ""} onChange={(value) => setValue("password", value)} disabled={submitting} />
            <Field field={{ key: "confirmPassword", label: "Confirm password", type: showPassword ? "text" : "password", required: true }} value={values.confirmPassword ?? ""} onChange={(value) => setValue("confirmPassword", value)} disabled={submitting} />
            <label style={{ display: "flex", gap: 9, alignItems: "center", color: "#526779", fontSize: 12 }}>
              <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} /> Show password
            </label>
            <label style={{ display: "flex", gap: 9, alignItems: "flex-start", color: "#526779", fontSize: 12, lineHeight: 1.6 }}>
              <input type="checkbox" checked={values.acceptTerms === "yes"} onChange={(event) => setValue("acceptTerms", event.target.checked ? "yes" : "")} />
              <span>I agree to the AssetPass terms of service. *</span>
            </label>
            <label style={{ display: "flex", gap: 9, alignItems: "flex-start", color: "#526779", fontSize: 12, lineHeight: 1.6 }}>
              <input type="checkbox" checked={values.privacyNoticeAcknowledged === "yes"} onChange={(event) => setValue("privacyNoticeAcknowledged", event.target.checked ? "yes" : "")} />
              <span>I acknowledge that I have read the AssetPass privacy notice. *</span>
            </label>
          </>
        )}

        {step === reviewStep && (
          <div style={{ display: "grid", gap: 12, color: "#526779", fontSize: 12 }}>
            <div><strong>Account type:</strong> {accountType === "individual" ? "Individual" : "Organization"}</div>
            <div><strong>Primary contact:</strong> {[values.firstName, values.middleName, values.lastName].filter(Boolean).join(" ")}</div>
            <div><strong>Login email:</strong> {values.email}</div>
            <div><strong>Mobile:</strong> {values.phoneNumber}</div>
            {accountType === "individual" ? (
              <>
                <div><strong>Location:</strong> {[resolvedValue("city"), resolvedValue("county"), values.countryName || values.countryCode].filter(Boolean).join(", ")}</div>
                <div><strong>Occupation:</strong> {values.occupation || "Not provided"}</div>
              </>
            ) : (
              <>
                <div><strong>Organization:</strong> {values.organizationDisplayName}</div>
                <div><strong>Organization type:</strong> {resolvedValue("organizationType")}</div>
                <div><strong>Industry:</strong> {resolvedValue("industrySector")}</div>
                <div><strong>Official email:</strong> {values.contactEmail}</div>
                <div><strong>Official phone:</strong> {values.contactPhone}</div>
                <div><strong>Location:</strong> {[resolvedValue("city"), resolvedValue("county"), values.countryName || values.countryCode].filter(Boolean).join(", ")}</div>
                <div><strong>Physical address:</strong> {values.physicalAddress}</div>
                <p style={{ margin: 0, padding: 12, borderRadius: 7, background: "#f1f6f8" }}>Your user account will be active immediately. The organization and its initial membership remain pending until platform review is complete.</p>
              </>
            )}
            <button type="button" onClick={() => setStep(securityStep)} style={{ border: 0, background: "transparent", color: "#0f8f84", textAlign: "left", fontWeight: 700 }}>Back to account security</button>
          </div>
        )}

        {error && <div className={styles.error} role="alert"><span aria-hidden="true">!</span>{error}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && <button type="button" className={styles.submit} style={{ background: "#fff", color: "#123047", borderColor: "#d5dfe7" }} disabled={submitting} onClick={() => { setError(""); setStep((previous) => previous - 1); }}>Back</button>}
          {step < reviewStep ? (
            <button type="button" className={styles.submit} disabled={submitting} onClick={nextStep}>Continue <span aria-hidden="true">→</span></button>
          ) : (
            <button type="submit" className={styles.submit} disabled={submitting} aria-busy={submitting}>{submitting ? "Submitting..." : "Create AssetPass account"}</button>
          )}
        </div>
      </form>
    </div>
  );
}
