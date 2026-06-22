"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/ui/PageHeader";
import { api } from "@/lib/api";
import type { FieldType, FormField } from "@/lib/types";

const FIELD_TYPES: FieldType[] = ["text", "textarea", "date", "radio", "select", "email", "url"];

export default function AdminFieldsPage() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    label: "",
    field_type: "text" as FieldType,
    placeholder: "",
    options: "",
    is_required: true,
    sort_order: 0,
  });

  const loadFields = () => {
    setLoading(true);
    api.getFormFields().then(setFields).finally(() => setLoading(false));
  };

  useEffect(loadFields, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const options = form.options
        ? form.options.split(",").map((o) => o.trim()).filter(Boolean)
        : undefined;
      await api.createFormField({
        name: form.name,
        label: form.label,
        field_type: form.field_type,
        placeholder: form.placeholder || undefined,
        options,
        is_required: form.is_required,
        sort_order: form.sort_order,
      });
      setShowForm(false);
      setForm({ name: "", label: "", field_type: "text", placeholder: "", options: "", is_required: true, sort_order: 0 });
      loadFields();
      setMessage("Field created successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create field");
    }
  };

  const toggleActive = async (field: FormField) => {
    await api.updateFormField(field.id, { is_active: !field.is_active });
    loadFields();
  };

  return (
    <ProtectedRoute adminOnly>
      <PageHeader
        eyebrow="Form Builder"
        title="Dynamic Form Fields"
        description="Configure the deployment request form without touching code. Add, reorder, or deactivate fields anytime."
        action={
          <button onClick={() => setShowForm(!showForm)} className={showForm ? "btn-secondary" : "btn-primary"}>
            {showForm ? "Cancel" : "Add field"}
          </button>
        }
      />

      {message && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 animate-fade-in">
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="surface-card mb-8 grid gap-5 p-6 sm:grid-cols-2 animate-slide-up">
          <div>
            <label className="field-label">Field name (snake_case)</label>
            <input
              className="field-input font-mono text-xs"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              pattern="^[a-z][a-z0-9_]*$"
              placeholder="e.g. git_repository"
              required
            />
          </div>
          <div>
            <label className="field-label">Display label</label>
            <input className="field-input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
          </div>
          <div>
            <label className="field-label">Field type</label>
            <select className="field-input" value={form.field_type} onChange={(e) => setForm({ ...form, field_type: e.target.value as FieldType })}>
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Sort order</label>
            <input className="field-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <div>
            <label className="field-label">Placeholder</label>
            <input className="field-input" value={form.placeholder} onChange={(e) => setForm({ ...form, placeholder: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Options (comma-separated)</label>
            <input className="field-input" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder="Option A, Option B" />
          </div>
          <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_required}
              onChange={(e) => setForm({ ...form, is_required: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-slate-700">Required field</span>
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">Create field</button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner label="Loading form schema..." />
      ) : fields.length === 0 ? (
        <EmptyState title="No fields configured" description="Add your first form field to get started." />
      ) : (
        <div className="surface-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Label</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.id} className={!field.is_active ? "opacity-50" : ""}>
                    <td className="font-mono text-xs text-slate-500">{field.sort_order}</td>
                    <td className="font-medium text-slate-900">{field.label}</td>
                    <td className="font-mono text-xs text-slate-600">{field.name}</td>
                    <td>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700">
                        {field.field_type}
                      </span>
                    </td>
                    <td>{field.is_required ? "Yes" : "No"}</td>
                    <td>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        field.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {field.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => toggleActive(field)} className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                        {field.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
