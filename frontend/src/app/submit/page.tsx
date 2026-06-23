"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DynamicForm from "@/components/DynamicForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api";
import type { FormSchema, RequestValueInput } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { FileText, Info } from "lucide-react";

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
        <div className="surface-card overflow-hidden">
          <div className="bg-brand-600 px-6 py-6 sm:px-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{schema.title}</h1>
                <p className="mt-1 text-sm text-brand-200">{schema.description}</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-100 bg-blue-50 px-6 py-3 sm:px-8">
            <p className="flex items-center gap-2 text-xs text-blue-700">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Submitting as <span className="font-semibold">{user?.name}</span> ({user?.email}).
              Fields marked with <span className="font-bold text-red-500">*</span> are required.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <DynamicForm
              fields={schema.fields}
              onSubmit={handleSubmit}
              submitLabel="Submit request"
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
