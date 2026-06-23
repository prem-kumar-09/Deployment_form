"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ThemeEditor from "@/components/ThemeEditor";
import { api } from "@/lib/api";
import type { FieldType, Form, FormField, ThemeConfig } from "@/lib/types";
import {
  GripVertical,
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
  Save,
  ArrowLeft,
  Copy,
  ExternalLink,
  RefreshCw,
  Settings2,
  Plus,
} from "lucide-react";

const FIELD_TYPES: { value: FieldType; label: string; icon: typeof Type; description: string }[] = [
  { value: "text", label: "Text", icon: Type, description: "Single line" },
  { value: "textarea", label: "Long Text", icon: AlignLeft, description: "Multi-line" },
  { value: "date", label: "Date", icon: Calendar, description: "Date picker" },
  { value: "radio", label: "Choice", icon: CircleDot, description: "Radio buttons" },
  { value: "select", label: "Dropdown", icon: List, description: "Select menu" },
  { value: "email", label: "Email", icon: AtSign, description: "Email input" },
  { value: "url", label: "URL", icon: Link2, description: "Web address" },
];

function getFieldIcon(type: FieldType) {
  return FIELD_TYPES.find((t) => t.value === type)?.icon ?? Type;
}

// ── Sortable Field Card ──

function SortableFieldCard({
  field,
  formId,
  onUpdate,
  onDelete,
}: {
  field: FormField;
  formId: number;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    label: field.label,
    field_type: field.field_type,
    placeholder: field.placeholder ?? "",
    options: (field.options ?? []).join(", "),
    is_required: field.is_required,
  });
  const [saving, setSaving] = useState(false);

  const Icon = getFieldIcon(field.field_type);
  const needsOptions = ["radio", "select"].includes(editData.field_type);

  const handleSave = async () => {
    setSaving(true);
    try {
      const options = editData.options
        ? editData.options.split(",").map((o) => o.trim()).filter(Boolean)
        : undefined;
      await api.updateFormField(formId, field.id, {
        label: editData.label,
        field_type: editData.field_type,
        placeholder: editData.placeholder || undefined,
        options: needsOptions ? options : undefined,
        is_required: editData.is_required,
      });
      setEditing(false);
      onUpdate();
    } catch {
      // handled by parent
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    await api.updateFormField(formId, field.id, { is_active: !field.is_active });
    onUpdate();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border-2 bg-white p-4 transition-all ${
        editing ? "border-brand-500 shadow-card ring-2 ring-brand-100" : "border-gray-200 hover:border-gray-300"
      } ${!field.is_active ? "opacity-50" : ""}`}
    >
      {!editing ? (
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
            <Icon className="h-4 w-4 text-brand-600" />
          </div>

          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setEditing(true)}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{field.label}</span>
              {field.is_required && <span className="text-xs text-red-500">*</span>}
              {!field.is_active && (
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500">
                  Hidden
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span className="font-mono">{field.name}</span>
              <span className="capitalize">
                {FIELD_TYPES.find((t) => t.value === field.field_type)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={handleToggleActive}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title={field.is_active ? "Hide field" : "Show field"}
            >
              {field.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Edit: {field.name}</h4>
            <div className="flex gap-1">
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg px-3 py-1 text-xs text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Label</label>
              <input
                className="field-input text-sm"
                value={editData.label}
                onChange={(e) => setEditData({ ...editData, label: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
              <select
                className="field-input text-sm"
                value={editData.field_type}
                onChange={(e) => setEditData({ ...editData, field_type: e.target.value as FieldType })}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Placeholder</label>
              <input
                className="field-input text-sm"
                value={editData.placeholder}
                onChange={(e) => setEditData({ ...editData, placeholder: e.target.value })}
                placeholder="Optional"
              />
            </div>
            {needsOptions && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Options (comma-separated)</label>
                <input
                  className="field-input text-sm"
                  value={editData.options}
                  onChange={(e) => setEditData({ ...editData, options: e.target.value })}
                  placeholder="Opt 1, Opt 2"
                />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={editData.is_required}
              onChange={(e) => setEditData({ ...editData, is_required: e.target.checked })}
              className="rounded border-gray-300"
            />
            Required
          </label>
        </div>
      )}
    </div>
  );
}

// ── Field Drag Overlay ──

function FieldOverlay({ field }: { field: FormField }) {
  const Icon = getFieldIcon(field.field_type);
  return (
    <div className="rounded-xl border-2 border-brand-500 bg-white p-4 shadow-elevated">
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-brand-400" />
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-4 w-4 text-brand-600" />
        </div>
        <span className="text-sm font-semibold text-gray-900">{field.label}</span>
      </div>
    </div>
  );
}

// ── Add Field Panel ──

function AddFieldPanel({
  formId,
  nextSortOrder,
  onAdd,
}: {
  formId: number;
  nextSortOrder: number;
  onAdd: () => void;
}) {
  const [adding, setAdding] = useState<FieldType | null>(null);
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [options, setOptions] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const needsOptions = adding && ["radio", "select"].includes(adding);

  const reset = () => {
    setAdding(null);
    setName("");
    setLabel("");
    setPlaceholder("");
    setOptions("");
    setIsRequired(true);
    setError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adding) return;
    setSaving(true);
    setError("");
    try {
      const opts = options ? options.split(",").map((o) => o.trim()).filter(Boolean) : undefined;
      await api.createFormField(formId, {
        name,
        label,
        field_type: adding,
        placeholder: placeholder || undefined,
        options: opts,
        is_required: isRequired,
        sort_order: nextSortOrder,
      });
      reset();
      onAdd();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add field");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Add Field</p>

      {!adding ? (
        <div className="grid grid-cols-2 gap-1.5">
          {FIELD_TYPES.map((t) => {
            const TypeIcon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => setAdding(t.value)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50"
              >
                <TypeIcon className="h-4 w-4 shrink-0 text-brand-600" />
                <div>
                  <p className="text-xs font-medium text-gray-700">{t.label}</p>
                  <p className="text-[10px] text-gray-400">{t.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-3 animate-fade-in">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Field Name</label>
            <input
              className="field-input text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              pattern="^[a-z][a-z0-9_]*$"
              placeholder="e.g. company_name"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Display Label</label>
            <input
              className="field-input text-sm"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Company Name"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Placeholder</label>
            <input
              className="field-input text-sm"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="Optional"
            />
          </div>
          {needsOptions && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Options</label>
              <input
                className="field-input text-sm"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Opt 1, Opt 2, Opt 3"
                required
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="rounded border-gray-300"
            />
            Required
          </label>
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs py-1.5 px-3" disabled={saving}>
              {saving ? "Adding..." : "Add"}
            </button>
            <button type="button" onClick={reset} className="btn-secondary text-xs py-1.5 px-3">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Main Builder Page ──

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = Number(params.formId);

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [savingTitle, setSavingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadForm = useCallback(() => {
    api.getForm(formId).then((f) => {
      setForm(f);
      setEditTitle(f.title);
      setEditDesc(f.description ?? "");
    }).finally(() => setLoading(false));
  }, [formId]);

  useEffect(loadForm, [loadForm]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    if (!form) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = form.fields.findIndex((f) => f.id === active.id);
    const newIndex = form.fields.findIndex((f) => f.id === over.id);
    const newFields = arrayMove(form.fields, oldIndex, newIndex);

    const reordered = newFields.map((f, i) => ({ ...f, sort_order: (i + 1) * 10 }));
    setForm({ ...form, fields: reordered });

    try {
      await api.reorderFields(
        formId,
        reordered.map((f) => ({ id: f.id, sort_order: f.sort_order }))
      );
    } catch {
      loadForm();
    }
  };

  const handleSaveDetails = async () => {
    setSavingTitle(true);
    try {
      await api.updateForm(formId, { title: editTitle, description: editDesc || null });
      loadForm();
      showToast("Form details saved");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSavingTitle(false);
    }
  };

  const handleSaveTheme = async (theme: ThemeConfig) => {
    try {
      await api.updateForm(formId, { theme });
      loadForm();
      showToast("Theme saved");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    }
  };

  const handleDeleteField = async (fieldId: number) => {
    try {
      await api.deleteFormField(formId, fieldId);
      loadForm();
      showToast("Field deleted");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  const handleCopyLink = () => {
    if (!form) return;
    const url = `${window.location.origin}/f/${form.share_token}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleRegenerateLink = async () => {
    if (!confirm("Regenerate link? The old link will stop working.")) return;
    try {
      await api.regenerateLink(formId);
      loadForm();
      showToast("New link generated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <LoadingSpinner label="Loading form builder..." />
      </ProtectedRoute>
    );
  }

  if (!form) {
    return (
      <ProtectedRoute>
        <div className="text-center py-12">
          <p className="text-gray-500">Form not found.</p>
          <button onClick={() => router.push("/admin")} className="btn-primary mt-4">
            Back to Forms
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  const activeField = form.fields.find((f) => f.id === activeId) ?? null;
  const nextSortOrder = form.fields.length > 0
    ? Math.max(...form.fields.map((f) => f.sort_order)) + 10
    : 10;

  return (
    <ProtectedRoute>
      <div className="animate-fade-in">
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

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Form Builder</p>
            <h1 className="mt-0.5 truncate text-xl font-bold text-gray-900">{form.title}</h1>
          </div>
          <a
            href={`/f/${form.share_token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Preview
          </a>
        </div>

        {/* Share Link Bar */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <span className="text-xs font-semibold text-gray-500 uppercase">Share Link</span>
          <code className="flex-1 truncate rounded bg-gray-50 px-3 py-1.5 text-xs text-gray-700 font-mono">
            {typeof window !== "undefined"
              ? `${window.location.origin}/f/${form.share_token}`
              : `/f/${form.share_token}`}
          </code>
          <button
            onClick={handleCopyLink}
            className={`btn text-xs py-1.5 px-3 ${
              linkCopied
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {linkCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {linkCopied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleRegenerateLink}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Regenerate link"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 3-Panel Layout */}
        <div className="grid gap-6 lg:grid-cols-[240px_1fr_280px]">
          {/* Left: Add Field Palette */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <AddFieldPanel formId={formId} nextSortOrder={nextSortOrder} onAdd={loadForm} />
            </div>
          </div>

          {/* Center: Sortable Field Canvas */}
          <div>
            {/* Form details */}
            <div className="mb-4 surface-card p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Form Title</label>
                  <input
                    className="field-input text-sm"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                  <input
                    className="field-input text-sm"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              {(editTitle !== form.title || editDesc !== (form.description ?? "")) && (
                <div className="mt-3 flex justify-end">
                  <button onClick={handleSaveDetails} disabled={savingTitle} className="btn-primary text-xs py-1.5 px-3">
                    <Save className="h-3.5 w-3.5" />
                    {savingTitle ? "Saving..." : "Save Details"}
                  </button>
                </div>
              )}
            </div>

            {/* Drag-and-drop fields */}
            {form.fields.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
                <Plus className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No fields yet. Add fields from the left panel.</p>
                <div className="mt-4 lg:hidden">
                  <AddFieldPanel formId={formId} nextSortOrder={10} onAdd={loadForm} />
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={form.fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {form.fields.map((field) => (
                      <SortableFieldCard
                        key={field.id}
                        field={field}
                        formId={formId}
                        onUpdate={loadForm}
                        onDelete={() => handleDeleteField(field.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeField ? <FieldOverlay field={activeField} /> : null}
                </DragOverlay>
              </DndContext>
            )}

            {/* Mobile add field */}
            {form.fields.length > 0 && (
              <div className="mt-4 lg:hidden">
                <AddFieldPanel formId={formId} nextSortOrder={nextSortOrder} onAdd={loadForm} />
              </div>
            )}
          </div>

          {/* Right: Theme Editor */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <ThemeEditor
                theme={form.theme ?? undefined}
                onSave={handleSaveTheme}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
