"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { registerAccount, type RegistrationInput } from "@/features/authentication/auth-client";
import styles from "../login/login.module.css";

type AccountType = "individual" | "organization";
type FormValues = Record<string, string>;

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

const individualFields: Record<number, Array<{ key: string; label: string; type?: string; required?: boolean; hint?: string; auto?: string }>> = {
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
    { key: "countryCode", label: "Country code", required: true, hint: "Use the two-letter ISO code, e.g. KE for Kenya." },
    { key: "county", label: "County / region" },
    { key: "city", label: "City / town" },
    { key: "physicalAddress", label: "Physical / residential address", hint: "Optional for individual accounts." },
    { key: "postalAddress", label: "Postal address" },
  ],
  4: [
    { key: "occupation", label: "Occupation / profession" },
  ],
};

const organizationFields: Record<number, Array<{ key: string; label: string; type?: string; required?: boolean; hint?: string; auto?: string }>> = {
  1: [
    { key: "firstName", label: "Your first name", required: true, auto: "given-name" },
    { key: "middleName", label: "Your middle name" },
    { key: "lastName", label: "Your last name", required: true, auto: "family-name" },
    { key: "position", label: "Your position / designation", required: true, hint: "For example: Director, Operations Manager, ICT Officer." },
    { key: "email", label: "Your login email", type: "email", required: true, auto: "email" },
    { key: "phoneNumber", label: "Your mobile phone number", type: "tel", required: true, auto: "tel" },
  ],
  2: [
    { key: "organizationDisplayName", label: "Organization display name", required: true },
    { key: "legalName", label: "Full legal name" },
    { key: "organizationType", label: "Organization type", required: true, hint: "Examples: Company, NGO, Government institution, School, Partnership, Sole proprietorship." },
    { key: "industrySector", label: "Industry / sector", required: true },
    { key: "description", label: "Organization description" },
  ],
  3: [
    { key: "legalStructure", label: "Legal structure", hint: "For example: Limited company, registered society, public institution." },
    { key: "registrationNumber", label: "Registration number", hint: "Optional for organization types without formal registration." },
    { key: "registrationAuthority", label: "Registration authority" },
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
    { key: "countryCode", label: "Country code", required: true, hint: "Use the two-letter ISO code, e.g. KE." },
    { key: "county", label: "County / region" },
    { key: "city", label: "City / town" },
    { key: "physicalAddress", label: "Physical operating address", required: true },
    { key: "postalAddress", label: "Postal address" },
    { key: "postalCode", label: "Postal code" },
  ],
  6: [
    { key: "registrationRelationship", label: "Your relationship to the organization", required: true, hint: "For example: Owner, Director, Authorized representative, Employee." },
    { key: "authorityConfirmation", label: "Authority confirmation", required: true, hint: "Enter YES to confirm that you are authorized to submit this registration on the organization's behalf." },
  ],
};

function Field({ field, value, onChange, disabled }: {
  field: { key: string; label: string; type?: string; required?: boolean; hint?: string; auto?: string };
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={field.key}>{field.label}{field.required ? " *" : " (optional)"}</label>
      <div className={styles.inputWrap}>
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
      </div>
      {field.hint && <p className={styles.formNote} style={{ textAlign: "left", marginTop: 0 }}>{field.hint}</p>}
    </div>
  );
}

export function RegisterForm() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormValues>({ countryCode: "KE", preferredContactMethod: "email" });
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

  function setValue(key: string, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  function validateCurrentStep() {
    const controls = Array.from(formRef.current?.querySelectorAll<HTMLInputElement>("[data-step-field]") ?? []);
    for (const control of controls) {
      if (!control.checkValidity()) {
        control.reportValidity();
        control.focus();
        return false;
      }
    }
    if (accountType === "organization" && step === 5 && values.authorityConfirmation?.trim().toLowerCase() !== "yes") {
      setError("Please enter YES to confirm that you are authorized to register this organization.");
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
      if (!values.acceptTerms) {
        setError("Please accept the terms and privacy policy to continue.");
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
      county: values.county?.trim() || undefined,
      city: values.city?.trim() || undefined,
      physicalAddress: values.physicalAddress?.trim() || undefined,
      postalAddress: values.postalAddress?.trim() || undefined,
      occupation: values.occupation?.trim() || undefined,
      preferredContactMethod: values.preferredContactMethod === "phone" ? "phone" : "email",
    };
    if (accountType === "organization") {
      Object.assign(payload, {
        organizationDisplayName: values.organizationDisplayName?.trim(),
        legalName: values.legalName?.trim() || undefined,
        organizationType: values.organizationType?.trim(),
        industrySector: values.industrySector?.trim(),
        legalStructure: values.legalStructure?.trim() || undefined,
        registrationNumber: values.registrationNumber?.trim() || undefined,
        registrationAuthority: values.registrationAuthority?.trim() || undefined,
        registrationDate: values.registrationDate || undefined,
        contactEmail: values.contactEmail?.trim().toLowerCase(),
        contactPhone: values.contactPhone?.trim(),
        alternativeEmail: values.alternativeEmail?.trim() || undefined,
        website: values.website?.trim() || undefined,
        description: values.description?.trim() || undefined,
        postalCode: values.postalCode?.trim() || undefined,
        position: values.position?.trim(),
        registrationRelationship: values.registrationRelationship?.trim(),
        authorityConfirmation: values.authorityConfirmation?.trim(),
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
        {step < securityStep && fields.map((field) => (
          <Field key={field.key} field={field} value={values[field.key] ?? ""} onChange={(value) => setValue(field.key, value)} disabled={submitting} />
        ))}

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

        {step === securityStep && (
          <>
            <Field field={{ key: "password", label: "Password", type: showPassword ? "text" : "password", required: true, hint: "Use at least 12 characters." }} value={values.password ?? ""} onChange={(value) => setValue("password", value)} disabled={submitting} />
            <Field field={{ key: "confirmPassword", label: "Confirm password", type: showPassword ? "text" : "password", required: true }} value={values.confirmPassword ?? ""} onChange={(value) => setValue("confirmPassword", value)} disabled={submitting} />
            <label style={{ display: "flex", gap: 9, alignItems: "center", color: "#526779", fontSize: 12 }}>
              <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} /> Show password
            </label>
            <label style={{ display: "flex", gap: 9, alignItems: "flex-start", color: "#526779", fontSize: 12, lineHeight: 1.6 }}>
              <input type="checkbox" checked={values.acceptTerms === "yes"} onChange={(event) => setValue("acceptTerms", event.target.checked ? "yes" : "")} />
              <span>I agree to the AssetPass terms of service and privacy policy. *</span>
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
                <div><strong>Location:</strong> {[values.city, values.county, values.countryCode].filter(Boolean).join(", ")}</div>
                <div><strong>Occupation:</strong> {values.occupation || "Not provided"}</div>
              </>
            ) : (
              <>
                <div><strong>Organization:</strong> {values.organizationDisplayName}</div>
                <div><strong>Organization type:</strong> {values.organizationType}</div>
                <div><strong>Industry:</strong> {values.industrySector}</div>
                <div><strong>Official email:</strong> {values.contactEmail}</div>
                <div><strong>Official phone:</strong> {values.contactPhone}</div>
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
