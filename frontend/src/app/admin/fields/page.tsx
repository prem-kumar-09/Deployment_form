"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import type { FieldType, FormField } from "@/lib/types";
import {
  Plus,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
  Type,
  AlignLeft,
  Calendar,
  CircleDot,
  List,
  AtSign,
  Link2,
  Check,
  X,
  Settings2,
  Save,
  ToggleLeft,
} from "lucide-react";

const FIELD_TYPES: { value: FieldType; label: string; icon: typeof Type; description: string }[] = [
  { value: "text", label: "Text", icon: Type, description: "Single line text input" },
  { value: "textarea", label: "Long Text", icon: AlignLeft, description: "Multi-line text area" },
  { value: "date", label: "Date", icon: Calendar, description: "Date picker" },
  { value: "radio", label: "Choice", icon: CircleDot, description: "Radio button options" },
  { value: "select", label: "Dropdown", icon: List, description: "Dropdown select menu" },
  { value: "email", label: "Email", icon: AtSign, description: "Email address input" },
  { value: "url", label: "URL", icon: Link2, description: "Web address input" },
];

function getFieldIcon(type: FieldType) {
  const found = FIELD_TYPES.find((t) => t.value === type);
  return found?.icon ?? Type;
}

interface FieldEditorState {
  label: string;
  field_type: FieldType;
  placeholder: string;
  options: string;
  is_required: boolean;
  sort_order: number;
}

function FieldCard({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  index,
}: {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (data: Partial<FormField>) => Promise<void>;
  onDelete: () => Promise<void>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  index: number;
}) {
  const [editing, setEditing] = useState<FieldEditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const Icon = getFieldIcon(field.field_type);

  const startEditing = () => {
    setEditing({
      label: field.label,
      field_type: field.field_type,
      placeholder: field.placeholder ?? "",
      options: (field.options ?? []).join(", "),
      is_required: field.is_required,
      sort_order: field.sort_order,
    });
    onSelect();
  };

  const cancelEditing = () => setEditing(null);

  const saveEditing = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const options = editing.options
        ? editing.options.split(",").map((o) => o.trim()).filter(Boolean)
        : undefined;
      await onUpdate({
        label: editing.label,
        field_type: editing.field_type,
        placeholder: editing.placeholder || undefined,
        options: ["radio", "select"].includes(editing.field_type) ? options : undefined,
        is_required: editing.is_required,
        sort_order: editing.sort_order,
      });
      setEditing(null);
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    await onUpdate({ is_active: !field.is_active });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const needsOptions = editing && ["radio", "select"].includes(editing.field_type);

  return (
    <div
      className={`form-field-card group ${isSelected ? "form-field-card-active" : ""} ${
        !field.is_active ? "opacity-60" : ""
      }`}
    >
      <div className={`absolute -left-px top-0 bottom-0 w-1 rounded-l-xl transition-colors ${isSelected ? "bg-brand-500" : "bg-transparent group-hover:bg-gray-300"}`} />

      {!editing ? (
        <>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <GripVertical className="h-4 w-4 text-gray-300" />
              <span className="text-[10px] font-semibold text-gray-400">{index + 1}</span>
            </div>

            <div className="min-w-0 flex-1" onClick={startEditing} role="button" tabIndex={0}>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50">
                  <Icon className="h-3.5 w-3.5 text-brand-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{field.label}</h3>
                {field.is_required && (
                  <span className="text-xs font-medium text-red-500">*</span>
                )}
                {!field.is_active && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                    Inactive
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span className="font-mono">{field.name}</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="capitalize">{FIELD_TYPES.find((t) => t.value === field.field_type)?.label ?? field.field_type}</span>
                {field.placeholder && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span className="truncate text-gray-400">&ldquo;{field.placeholder}&rdquo;</span>
                  </>
                )}
              </div>
              {field.options && field.options.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {field.options.map((opt) => (
                    <span key={opt} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={onMoveUp}
                disabled={isFirst}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={isLast}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={toggleActive}
                className={`rounded-md p-1 ${field.is_active ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600" : "text-emerald-500 hover:bg-emerald-50"}`}
                title={field.is_active ? "Deactivate" : "Activate"}
              >
                {field.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={startEditing}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Edit"
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-brand-600" />
              <h3 className="text-sm font-semibold text-gray-900">Editing: {field.name}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={cancelEditing}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                <X className="mr-1 inline h-3 w-3" />
                Cancel
              </button>
              <button
                onClick={saveEditing}
                disabled={saving}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Save className="mr-1 inline h-3 w-3" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Display Label</label>
              <input
                className="field-input"
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Field Type</label>
              <select
                className="field-input"
                value={editing.field_type}
                onChange={(e) => setEditing({ ...editing, field_type: e.target.value as FieldType })}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} &mdash; {t.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Placeholder</label>
              <input
                className="field-input"
                value={editing.placeholder}
                onChange={(e) => setEditing({ ...editing, placeholder: e.target.value })}
                placeholder="Optional placeholder text"
              />
            </div>
            <div>
              <label className="field-label">Sort Order</label>
              <input
                className="field-input"
                type="number"
                value={editing.sort_order}
                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
              />
            </div>
            {needsOptions && (
              <div className="sm:col-span-2">
                <label className="field-label">Options (comma-separated)</label>
                <input
                  className="field-input"
                  value={editing.options}
                  onChange={(e) => setEditing({ ...editing, options: e.target.value })}
                  placeholder="Option 1, Option 2, Option 3"
                />
                <p className="mt-1 text-xs text-gray-400">Separate each option with a comma</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing({ ...editing, is_required: !editing.is_required })}
              className="toggle-switch"
              data-checked={editing.is_required}
              role="switch"
              aria-checked={editing.is_required}
            />
            <span className="text-sm font-medium text-gray-700">Required field</span>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="mt-4 animate-fade-in rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-800">Delete &ldquo;{field.label}&rdquo;?</h4>
              <p className="mt-1 text-xs text-red-600">
                This action cannot be undone. If this field has submitted values, it cannot be deleted — deactivate it instead.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-red-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddFieldForm({
  onAdd,
  nextSortOrder,
}: {
  onAdd: () => void;
  nextSortOrder: number;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"type" | "details">("type");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    label: "",
    field_type: "text" as FieldType,
    placeholder: "",
    options: "",
    is_required: true,
    sort_order: nextSortOrder,
  });

  const reset = () => {
    setForm({
      name: "",
      label: "",
      field_type: "text",
      placeholder: "",
      options: "",
      is_required: true,
      sort_order: nextSortOrder,
    });
    setStep("type");
    setError("");
  };

  const handleTypeSelect = (type: FieldType) => {
    setForm({ ...form, field_type: type });
    setStep("details");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
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
      reset();
      setOpen(false);
      onAdd();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create field");
    } finally {
      setSaving(false);
    }
  };

  const needsOptions = ["radio", "select"].includes(form.field_type);

  if (!open) {
    return (
      <button
        onClick={() => { reset(); setOpen(true); }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-4 text-sm font-medium text-gray-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600"
      >
        <Plus className="h-5 w-5" />
        Add new question
      </button>
    );
  }

  return (
    <div className="form-field-card form-field-card-active animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {step === "type" ? "Choose a field type" : "Configure field"}
        </h3>
        <button
          onClick={() => { setOpen(false); reset(); }}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {step === "type" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {FIELD_TYPES.map((t) => {
            const TypeIcon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => handleTypeSelect(t.value)}
                className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <TypeIcon className="h-5 w-5 text-brand-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700">{t.label}</span>
                <span className="text-[10px] text-gray-400">{t.description}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Field Name (snake_case)</label>
              <input
                className="field-input font-mono text-xs"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                pattern="^[a-z][a-z0-9_]*$"
                placeholder="e.g. deployment_date"
                required
              />
              <p className="mt-1 text-xs text-gray-400">Unique identifier, lowercase with underscores</p>
            </div>
            <div>
              <label className="field-label">Display Label</label>
              <input
                className="field-input"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Deployment Date"
                required
              />
            </div>
            <div>
              <label className="field-label">Placeholder</label>
              <input
                className="field-input"
                value={form.placeholder}
                onChange={(e) => setForm({ ...form, placeholder: e.target.value })}
                placeholder="Optional hint text"
              />
            </div>
            <div>
              <label className="field-label">Sort Order</label>
              <input
                className="field-input"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              />
            </div>
            {needsOptions && (
              <div className="sm:col-span-2">
                <label className="field-label">Options (comma-separated)</label>
                <input
                  className="field-input"
                  value={form.options}
                  onChange={(e) => setForm({ ...form, options: e.target.value })}
                  placeholder="Option 1, Option 2, Option 3"
                  required
                />
                <p className="mt-1 text-xs text-gray-400">At least 2 options required</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, is_required: !form.is_required })}
              className="toggle-switch"
              data-checked={form.is_required}
              role="switch"
              aria-checked={form.is_required}
            />
            <span className="text-sm font-medium text-gray-700">Required field</span>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep("type")}
              className="btn-secondary text-sm"
            >
              Back
            </button>
            <button type="submit" className="btn-primary text-sm" disabled={saving}>
              {saving ? "Creating..." : "Create Field"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AdminFieldsPage() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadFields = useCallback(() => {
    setLoading(true);
    api.getFormFields().then(setFields).finally(() => setLoading(false));
  }, []);

  useEffect(loadFields, [loadFields]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = async (fieldId: number, data: Partial<FormField>) => {
    try {
      await api.updateFormField(fieldId, data);
      loadFields();
      showToast("Field updated successfully");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
      throw err;
    }
  };

  const handleDelete = async (fieldId: number) => {
    try {
      await api.deleteFormField(fieldId);
      loadFields();
      showToast("Field deleted successfully");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
      throw err;
    }
  };

  const handleMoveUp = async (field: FormField, index: number) => {
    if (index === 0) return;
    const prev = sortedFields[index - 1];
    await api.updateFormField(field.id, { sort_order: prev.sort_order });
    await api.updateFormField(prev.id, { sort_order: field.sort_order });
    loadFields();
  };

  const handleMoveDown = async (field: FormField, index: number) => {
    if (index === sortedFields.length - 1) return;
    const next = sortedFields[index + 1];
    await api.updateFormField(field.id, { sort_order: next.sort_order });
    await api.updateFormField(next.id, { sort_order: field.sort_order });
    loadFields();
  };

  const sortedFields = [...fields].sort((a, b) => a.sort_order - b.sort_order);
  const activeCount = fields.filter((f) => f.is_active).length;
  const nextSortOrder = fields.length > 0 ? Math.max(...fields.map((f) => f.sort_order)) + 10 : 10;

  return (
    <ProtectedRoute adminOnly>
      <div className="animate-fade-in">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Form Builder</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Configure Form Fields</h1>
            <p className="mt-1 text-sm text-gray-500">
              Design your deployment request form. Click any field to edit its properties.
            </p>
          </div>
          {fields.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {activeCount} active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                {fields.length - activeCount} inactive
              </span>
            </div>
          )}
        </div>

        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-elevated animate-slide-up ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {toast.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {toast.message}
          </div>
        )}

        {loading ? (
          <LoadingSpinner label="Loading form schema..." />
        ) : fields.length === 0 ? (
          <div className="space-y-6">
            <EmptyState
              title="No fields configured yet"
              description="Start building your form by adding the first question below."
            />
            <AddFieldForm onAdd={loadFields} nextSortOrder={10} />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-3">
              {sortedFields.map((field, i) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  index={i}
                  isSelected={selectedId === field.id}
                  onSelect={() => setSelectedId(field.id)}
                  onUpdate={(data) => handleUpdate(field.id, data)}
                  onDelete={() => handleDelete(field.id)}
                  onMoveUp={() => handleMoveUp(field, i)}
                  onMoveDown={() => handleMoveDown(field, i)}
                  isFirst={i === 0}
                  isLast={i === sortedFields.length - 1}
                />
              ))}
              <AddFieldForm onAdd={loadFields} nextSortOrder={nextSortOrder} />
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-6">
                <div className="surface-card overflow-hidden">
                  <div className="bg-brand-600 px-5 py-4">
                    <h2 className="text-sm font-semibold text-white">Live Preview</h2>
                    <p className="text-xs text-brand-200">How users see this form</p>
                  </div>
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-5">
                    <div className="space-y-4">
                      {sortedFields
                        .filter((f) => f.is_active)
                        .map((field, i) => (
                          <PreviewField key={field.id} field={field} index={i} />
                        ))}
                      {sortedFields.filter((f) => f.is_active).length === 0 && (
                        <p className="py-8 text-center text-sm text-gray-400">
                          No active fields to preview
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function PreviewField({ field, index }: { field: FormField; index: number }) {
  const Icon = getFieldIcon(field.field_type);

  return (
    <div className="group">
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-100 text-[10px] font-bold text-brand-700">
          {index + 1}
        </span>
        {field.label}
        {field.is_required && <span className="text-red-500">*</span>}
      </label>

      {field.field_type === "textarea" ? (
        <div className="h-16 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400">
          {field.placeholder || "Enter text..."}
        </div>
      ) : field.field_type === "radio" ? (
        <div className="flex flex-wrap gap-1.5">
          {(field.options ?? []).map((opt) => (
            <span key={opt} className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600">
              {opt}
            </span>
          ))}
        </div>
      ) : field.field_type === "select" ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400">
          Select an option...
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400">
          {field.placeholder || `Enter ${field.field_type}...`}
        </div>
      )}
    </div>
  );
}
