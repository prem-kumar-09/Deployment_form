"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DynamicForm from "@/components/DynamicForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api";
import type { FormSchema, RequestValueInput } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";

export default function SubmitPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFormSchema().then(setSchema).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (values: RequestValueInput[]) => {
    const nameField = schema?.fields.find((f) => f.name === "name");
    if (nameField && !values.find((v) => v.field_id === nameField.id)?.value && user) {
      const idx = values.findIndex((v) => v.field_id === nameField.id);
      if (idx >= 0) values[idx].value = user.name;
      else values.push({ field_id: nameField.id, value: user.name });
    }
    await api.submitRequest(values);
    router.push("/dashboard");
  };

  if (loading || !schema) {
    return (
      <ProtectedRoute>
        <LoadingSpinner label="Loading deployment form..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl animate-slide-up">
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white shadow-glow sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-100">New submission</p>
          <h1 className="mt-2 text-3xl font-bold">{schema.title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-orange-50">
            Hi {user?.name}, when you submit this form the admin team will see your name and email address.
            Fields marked with <span className="font-bold">*</span> are required.
          </p>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <DynamicForm
            fields={schema.fields}
            onSubmit={handleSubmit}
            submitLabel="Submit request"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
