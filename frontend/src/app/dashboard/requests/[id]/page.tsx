"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DynamicForm from "@/components/DynamicForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api";
import type { DeploymentRequest, FormField } from "@/lib/types";
import {
  ArrowLeft,
  User,
  Calendar,
  Hash,
  Clock,
  FileText,
} from "lucide-react";

export default function UserRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [request, setRequest] = useState<DeploymentRequest | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getRequest(id), api.getFormSchema()])
      .then(([req, schema]) => {
        setRequest(req);
        setFields(schema.fields.filter((f) => f.is_active || req.values.some((v) => v.field_id === f.id)));
      })
      .catch((err) => {
        console.error("Error loading request:", err);
        router.push("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !request) {
    return (
      <ProtectedRoute>
        <LoadingSpinner label="Loading request details..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="animate-fade-in">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request #{request.id}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {request.submitter_name}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(request.created_at).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
              <FileText className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Deployment Request Form</h2>
            </div>
            <div className="p-6">
              <DynamicForm
                fields={fields}
                initialValues={request.values}
                readOnly={true}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="surface-card overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-gray-900">Details</h2>
              </div>
              <div className="p-5">
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <Hash className="h-3.5 w-3.5" />
                      Request ID
                    </dt>
                    <dd className="font-medium text-gray-900">#{request.id}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <User className="h-3.5 w-3.5" />
                      Submitter
                    </dt>
                    <dd className="font-medium text-gray-900">{request.submitter_name}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      Last updated
                    </dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(request.updated_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <FileText className="h-3.5 w-3.5" />
                      Fields
                    </dt>
                    <dd className="font-medium text-gray-900">{request.values.length}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
