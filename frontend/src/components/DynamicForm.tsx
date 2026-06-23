"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormField, RequestFieldValue, RequestValueInput } from "@/lib/types";
import { AlertCircle, Send } from "lucide-react";

interface DynamicFormProps {
  fields: FormField[];
  initialValues?: RequestFieldValue[];
  onSubmit?: (values: RequestValueInput[]) => Promise<void>;
  submitLabel?: string;
  readOnly?: boolean;
  showNumbers?: boolean;
}

const EMPTY_INITIAL: RequestFieldValue[] = [];

export default function DynamicForm({
  fields,
  initialValues,
  onSubmit,
  submitLabel = "Submit",
  readOnly = false,
  showNumbers = true,
}: DynamicFormProps) {
  const safeInitial = initialValues ?? EMPTY_INITIAL;
  const [values, setValues] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const initializedRef = useRef(false);

  const fieldIds = useMemo(() => fields.map((f) => f.id).join(","), [fields]);

  useEffect(() => {
    if (initializedRef.current && safeInitial.length === 0) return;
    const map: Record<number, string> = {};
    for (const field of fields) {
      const existing = safeInitial.find((v) => v.field_id === field.id);
      map[field.id] = existing?.value ?? "";
    }
    setValues(map);
    initializedRef.current = true;
  }, [fieldIds, safeInitial]);

  const handleChange = (fieldId: number, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    setError("");
    setSubmitting(true);
    try {
      const payload: RequestValueInput[] = fields.map((f) => ({
        field_id: f.id,
        value: values[f.id] ?? "",
      }));
      await onSubmit!(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField, index: number) => {
    const value = values[field.id] ?? "";

    const label = (
      <label htmlFor={`field-${field.id}`} className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-800">
        {showNumbers && (
          <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-100 text-[10px] font-bold text-brand-700">
            {index + 1}
          </span>
        )}
        <span>{field.label}</span>
        {field.is_required && <span className="text-red-500">*</span>}
      </label>
    );

    if (readOnly) {
      return (
        <div key={field.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          {label}
          <p className="text-sm text-gray-800">{value || <span className="text-gray-400">—</span>}</p>
        </div>
      );
    }

    switch (field.field_type) {
      case "textarea":
        return (
          <div key={field.id} className="space-y-0">
            {label}
            <textarea
              id={`field-${field.id}`}
              className="field-input min-h-[100px] resize-y"
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
          <fieldset key={field.id} className="space-y-0">
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
          <div key={field.id} className="space-y-0">
            {label}
            <select
              id={`field-${field.id}`}
              className="field-input"
              value={value}
              required={field.is_required}
              onChange={(e) => handleChange(field.id, e.target.value)}
            >
              <option value="">Select an option...</option>
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-0">
            {label}
            <input
              id={`field-${field.id}`}
              type="date"
              className="field-input"
              value={value}
              required={field.is_required}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-0">
            {label}
            <input
              id={`field-${field.id}`}
              type={field.field_type === "email" ? "email" : field.field_type === "url" ? "url" : "text"}
              className="field-input"
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {sortedFields.map((field, i) => renderField(field, i))}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!readOnly && (
        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button type="submit" className="btn-primary min-w-[140px]" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                {submitLabel}
              </span>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
