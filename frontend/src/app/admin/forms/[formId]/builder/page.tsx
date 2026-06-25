"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import BuilderTopBar from "@/components/builder/BuilderTopBar";
import QuestionCanvas from "@/components/builder/QuestionCanvas";
import QuestionPalette, { generateFieldDefaults } from "@/components/builder/QuestionPalette";
import StylePanel from "@/components/builder/StylePanel";
import { api } from "@/lib/api";
import { resolveTheme } from "@/lib/theme";
import type { FieldType, Form, FormField, ThemeConfig } from "@/lib/types";
import { Check, X } from "lucide-react";

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = Number(params.formId);

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [styleOpen, setStyleOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [liveTheme, setLiveTheme] = useState<ThemeConfig | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [addingField, setAddingField] = useState(false);
  const [savedLabel, setSavedLabel] = useState("Saved");

  const titleRef = useRef("");
  const descRef = useRef("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const loadForm = useCallback(() => {
    return api.getForm(formId).then((f) => {
      setForm(f);
      setLiveTheme(resolveTheme(f.theme));
      titleRef.current = f.title;
      descRef.current = f.description ?? "";
      return f;
    });
  }, [formId]);

  useEffect(() => {
    loadForm().finally(() => setLoading(false));
  }, [loadForm]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const scheduleSaveDetails = (title: string, description: string) => {
    titleRef.current = title;
    descRef.current = description;
    setSavedLabel("Saving...");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.updateForm(formId, { title, description: description || null });
        setSavedLabel("Saved");
      } catch {
        setSavedLabel("Save failed");
        showToast("Failed to save form details", "error");
      }
    }, 800);
  };

  const handleReorder = async (reordered: FormField[]) => {
    if (!form) return;
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

  const handleUpdateField = async (fieldId: number, data: Partial<FormField>) => {
    await api.updateFormField(formId, fieldId, data);
    await loadForm();
  };

  const handleDeleteField = async (fieldId: number) => {
    try {
      await api.deleteFormField(formId, fieldId);
      if (selectedFieldId === fieldId) setSelectedFieldId(null);
      await loadForm();
      showToast("Question deleted");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  const handleDuplicateField = async (field: FormField) => {
    try {
      await api.createFormField(formId, {
        name: `${field.name}_copy`,
        label: `${field.label} (copy)`,
        field_type: field.field_type,
        placeholder: field.placeholder ?? undefined,
        options: field.options ?? undefined,
        is_required: field.is_required,
        sort_order: Math.max(...(form?.fields.map((f) => f.sort_order) ?? [0])) + 10,
      });
      await loadForm();
      showToast("Question duplicated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Duplicate failed", "error");
    }
  };

  const handleAddField = async (type: FieldType) => {
    if (!form) return;
    setAddingField(true);
    try {
      const defaults = generateFieldDefaults(type, form.fields.length);
      const created = await api.createFormField(formId, {
        ...defaults,
        field_type: type,
        sort_order: form.fields.length > 0
          ? Math.max(...form.fields.map((f) => f.sort_order)) + 10
          : 10,
      });
      const updated = await loadForm();
      const newField = updated.fields.find((f) => f.id === created.id) ?? updated.fields.at(-1);
      if (newField) setSelectedFieldId(newField.id);
      showToast("Question added");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add question", "error");
    } finally {
      setAddingField(false);
    }
  };

  const handleSaveTheme = async (theme: ThemeConfig) => {
    await api.updateForm(formId, { theme });
    await loadForm();
    showToast("Theme saved");
  };

  const handleCopyLink = () => {
    if (!form) return;
    navigator.clipboard.writeText(`${window.location.origin}/f/${form.share_token}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
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
        <div className="py-12 text-center">
          <p className="text-gray-500">Form not found.</p>
          <button onClick={() => router.push("/admin")} className="btn-primary mt-4">
            Back to Forms
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  const theme = liveTheme ?? resolveTheme(form.theme);

  return (
    <ProtectedRoute>
      <div className="flex h-full flex-col bg-[#faf9f8]">
        {toast && (
          <div
            className={`fixed top-16 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg animate-slide-up ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {toast.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {toast.message}
          </div>
        )}

        <BuilderTopBar
          form={form}
          styleOpen={styleOpen}
          onToggleStyle={() => setStyleOpen((v) => !v)}
          linkCopied={linkCopied}
          onCopyLink={handleCopyLink}
          savedLabel={savedLabel}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="relative flex-1 overflow-y-auto">
            <QuestionPalette onAdd={handleAddField} adding={addingField} />
            <QuestionCanvas
              title={form.title}
              description={form.description ?? ""}
              fields={form.fields}
              theme={theme}
              selectedId={selectedFieldId}
              onSelect={setSelectedFieldId}
              onTitleChange={(t) => {
                setForm({ ...form, title: t });
                scheduleSaveDetails(t, descRef.current);
              }}
              onDescriptionChange={(d) => {
                setForm({ ...form, description: d });
                scheduleSaveDetails(titleRef.current, d);
              }}
              onReorder={handleReorder}
              onUpdateField={handleUpdateField}
              onDeleteField={handleDeleteField}
              onDuplicateField={handleDuplicateField}
              onAddQuestion={() => handleAddField("text")}
              addingField={addingField}
            />
          </div>

          {styleOpen && (
            <StylePanel
              theme={form.theme}
              onSave={handleSaveTheme}
              onLiveChange={setLiveTheme}
              onClose={() => setStyleOpen(false)}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
