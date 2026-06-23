"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { FormPublicResponse, SubmissionValueInput, ThemeConfig } from "@/lib/types";
import DynamicForm from "@/components/DynamicForm";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const DEFAULT_THEME: ThemeConfig = {
  bg_color: "#f5f0eb",
  bg_image_url: null,
  font_family: "Inter",
  primary_color: "#8b2332",
  text_color: "#1f2937",
  border_radius: 8,
};

export default function PublicFormPage() {
  const params = useParams();
  const token = params.token as string;

  const [form, setForm] = useState<FormPublicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api
      .getPublicForm(token)
      .then(setForm)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Form not found");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const theme = form?.theme ?? DEFAULT_THEME;

  const handleSubmit = async (values: SubmissionValueInput[]) => {
    await api.submitPublicForm(token, values);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Form Unavailable</h1>
          <p className="mt-2 text-sm text-gray-500">
            {error || "This form is not available or has been deactivated."}
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        className="relative min-h-screen"
        style={{ fontFamily: theme.font_family }}
      >
        {/* Background */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundColor: theme.bg_color,
            backgroundImage: theme.bg_image_url ? `url(${theme.bg_image_url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-lg bg-white/60 backdrop-blur-lg p-10 text-center shadow-xl">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${theme.primary_color}15` }}
            >
              <CheckCircle2 className="h-8 w-8" style={{ color: theme.primary_color }} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Thank You!</h2>
            <p className="mt-2 text-sm text-gray-500">
              Your response has been submitted successfully.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: theme.primary_color }}
            >
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasRequiredFields = form.fields.some((f) => f.is_required);

  return (
    <div
      className="relative min-h-screen"
      style={{ fontFamily: theme.font_family }}
    >
      {/* Full-bleed background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: theme.bg_color,
          backgroundImage: theme.bg_image_url ? `url(${theme.bg_image_url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Form Card */}
        <div className="form-scroll-card rounded-xl bg-white/60 backdrop-blur-lg shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Form Header */}
          <div className="border-b border-white/40 px-8 pt-8 pb-6">
            <h1 className="text-2xl font-bold" style={{ color: theme.text_color }}>
              {form.title}
            </h1>
            {form.description && (
              <p className="mt-2 text-sm text-gray-600">
                {form.description}
              </p>
            )}
            {hasRequiredFields && (
              <p className="mt-3 text-xs text-gray-500">
                <span className="text-red-500 font-medium">*</span> Required
              </p>
            )}
          </div>

          {/* Form Body */}
          <div className="px-8 py-8">
            <style>{`
              .form-scroll-card::-webkit-scrollbar {
                width: 6px;
              }
              .form-scroll-card::-webkit-scrollbar-track {
                background: transparent;
                margin: 12px 0;
              }
              .form-scroll-card::-webkit-scrollbar-thumb {
                background-color: rgba(0,0,0,0.15);
                border-radius: 3px;
              }
              .form-scroll-card::-webkit-scrollbar-thumb:hover {
                background-color: rgba(0,0,0,0.25);
              }
              .themed-form .field-input {
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                font-family: ${theme.font_family}, sans-serif;
                background-color: #ffffff;
                padding: 12px 16px;
                font-size: 14px;
                color: #374151;
                transition: border-color 0.15s ease, box-shadow 0.15s ease;
              }
              .themed-form .field-input::placeholder {
                color: #9ca3af;
              }
              .themed-form .field-input:focus {
                background-color: #ffffff;
                outline: none;
                border-color: ${theme.primary_color};
                box-shadow: 0 0 0 2px ${theme.primary_color}20;
              }
              .themed-form .field-input:hover {
                border-color: #d1d5db;
              }
              .themed-form .btn-primary {
                background-color: ${theme.primary_color};
                border-radius: 20px;
                padding: 10px 28px;
                font-weight: 500;
                font-size: 14px;
              }
              .themed-form .btn-primary:hover {
                filter: brightness(1.1);
              }
              .themed-form label {
                color: ${theme.text_color};
              }
              .themed-form .radio-option {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 6px 0;
                cursor: pointer;
                font-size: 14px;
                color: ${theme.text_color};
              }
              .themed-form .radio-option input[type="radio"] {
                appearance: none;
                -webkit-appearance: none;
                width: 20px;
                height: 20px;
                border: 2px solid #9ca3af;
                border-radius: 50%;
                outline: none;
                cursor: pointer;
                transition: all 0.15s ease;
                position: relative;
                flex-shrink: 0;
                background: white;
              }
              .themed-form .radio-option input[type="radio"]:checked {
                border-color: ${theme.primary_color};
              }
              .themed-form .radio-option input[type="radio"]:checked::after {
                content: '';
                position: absolute;
                top: 3px;
                left: 3px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: ${theme.primary_color};
              }
              .themed-form .radio-option input[type="radio"]:hover {
                border-color: ${theme.primary_color};
              }
            `}</style>
            <div className="themed-form">
              <DynamicForm
                fields={form.fields}
                onSubmit={handleSubmit}
                submitLabel="Submit"
                showNumbers={true}
                useClassicRadio={true}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
