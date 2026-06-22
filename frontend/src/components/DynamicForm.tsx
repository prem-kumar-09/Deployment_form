"use client";

import { useEffect, useState } from "react";
import type { FormField, RequestFieldValue, RequestValueInput } from "@/lib/types";

interface DynamicFormProps {
  fields: FormField[];
  initialValues?: RequestFieldValue[];
  onSubmit: (values: RequestValueInput[]) => Promise<void>;
  submitLabel?: string;
  readOnly?: boolean;
  showNumbers?: boolean;
}

export default function DynamicForm({
  fields,
  initialValues = [],
  onSubmit,
  submitLabel = "Submit",
  readOnly = false,
  showNumbers = true,
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const map: Record<number, string> = {};
    for (const field of fields) {
      const existing = initialValues.find((v) => v.field_id === field.id);
      map[field.id] = existing?.value ?? "";
    }
    setValues(map);
  }, [fields, initialValues]);

  const handleChange = (fieldId: number, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload: RequestValueInput[] = fields.map((f) => ({
        field_id: f.id,
        value: values[f.id] ?? "",
      }));
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField, index: number) => {
    const value = values[field.id] ?? "";

    const label = (
      <label htmlFor={`field-${field.id}`} className="field-label">
        {showNumbers && (
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-orange-100 text-xs font-bold text-orange-700">
            {index + 1}
          </span>
        )}
        {field.label}
        {field.is_required && <span className="ml-1 text-rose-500">*</span>}
      </label>
    );

    if (readOnly) {
      return (
        <div key={field.id} className="form-field-row">
          {label}
          <p className="mt-1 rounded-lg bg-white px-4 py-2.5 text-sm text-slate-800 ring-1 ring-slate-100">
            {value || "—"}
          </p>
        </div>
      );
    }

    const inputClass = "field-input";

    switch (field.field_type) {
      case "textarea":
        return (
          <div key={field.id} className="form-field-row">
            {label}
            <textarea
              id={`field-${field.id}`}
              className={`${inputClass} min-h-[120px] resize-y`}
              rows={4}
              value={value}
              placeholder={field.placeholder ?? undefined}
              required={field.is_required}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
          </div>
        );

      case "radio":
        return (
          <fieldset key={field.id} className="form-field-row">
            {label}
            <div className="mt-1 flex flex-wrap gap-2">
              {(field.options ?? []).map((opt) => (
                <label
                  key={opt}
                  className={`radio-pill ${value === opt ? "radio-pill-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`field-${field.id}`}
                    value={opt}
                    checked={value === opt}
                    required={field.is_required}
                    onChange={() => handleChange(field.id, opt)}
                    className="sr-only"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
        );

      case "select":
        return (
          <div key={field.id} className="form-field-row">
            {label}
            <select
              id={`field-${field.id}`}
              className={inputClass}
              value={value}
              required={field.is_required}
              onChange={(e) => handleChange(field.id, e.target.value)}
            >
              <option value="">Select an option...</option>
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="form-field-row">
            {label}
            <input
              id={`field-${field.id}`}
              type="date"
              className={inputClass}
              value={value}
              required={field.is_required}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
          </div>
        );

      default:
        return (
          <div key={field.id} className="form-field-row">
            {label}
            <input
              id={`field-${field.id}`}
              type={field.field_type === "email" ? "email" : field.field_type === "url" ? "url" : "text"}
              className={inputClass}
              value={value}
              placeholder={field.placeholder ?? undefined}
              required={field.is_required}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
          </div>
        );
    }
  };

  const sortedFields = [...fields].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {sortedFields.map((field, i) => renderField(field, i))}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!readOnly && (
        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-primary min-w-[140px] px-8" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      )}
    </form>
  );
}
