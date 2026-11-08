import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
};

export function FormField({
  label,
  required = false,
  hint,
  error,
  htmlFor,
  children,
}: FormFieldProps) {
  return (
    <label className={`form-field${error ? " form-field-invalid" : ""}`} htmlFor={htmlFor}>
      <span>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      {children}
      {hint && (
        <small className="form-field-hint" id={`${htmlFor ?? "form-field"}-hint`}>
          {hint}
        </small>
      )}
      {error && (
        <small className="form-field-error" id={`${htmlFor ?? "form-field"}-error`} role="alert">
          {error}
        </small>
      )}
    </label>
  );
}
