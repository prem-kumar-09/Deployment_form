"use client";

import { useEffect, useRef, useState } from "react";
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
import type { FieldType, FormField, ThemeConfig } from "@/lib/types";
import { getThemedFormStyles, resolveTheme } from "@/lib/theme";
import { FIELD_TYPES, AddQuestionButton } from "./QuestionPalette";
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Asterisk,
} from "lucide-react";

interface QuestionCanvasProps {
  title: string;
  description: string;
  fields: FormField[];
  theme: ThemeConfig;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (desc: string) => void;
  onReorder: (fields: FormField[]) => void;
  onUpdateField: (fieldId: number, data: Partial<FormField>) => Promise<void>;
  onDeleteField: (fieldId: number) => void;
  onDuplicateField: (field: FormField) => void;
  onAddQuestion: () => void;
  addingField?: boolean;
}

function FieldPreview({ field, index, theme }: { field: FormField; index: number; theme: ThemeConfig }) {
  return (
    <div>
      <p className="mb-3 text-[15px] leading-snug" style={{ color: theme.text_color }}>
        <span className="font-normal">{index + 1}. </span>
        {field.label}
        {field.is_required && <span className="ml-0.5 text-[#d13438]">*</span>}
      </p>
      {field.field_type === "radio" || field.field_type === "select" ? (
        <div className="space-y-1 pl-0.5">
          {(field.options ?? ["Option 1", "Option 2"]).map((opt) => (
            <label key={opt} className="radio-option">
              <input type="radio" disabled tabIndex={-1} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ) : field.field_type === "textarea" ? (
        <div className="h-20 rounded border border-[#edebe9] bg-[#faf9f8]" />
      ) : (
        <div className="h-9 rounded border border-[#edebe9] bg-[#faf9f8]" />
      )}
    </div>
  );
}

function SortableQuestionBlock({
  field,
  index,
  theme,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  field: FormField;
  index: number;
  theme: ThemeConfig;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (data: Partial<FormField>) => Promise<void>;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const [editLabel, setEditLabel] = useState(field.label);
  const [editOptions, setEditOptions] = useState((field.options ?? []).join("\n"));
  const [editPlaceholder, setEditPlaceholder] = useState(field.placeholder ?? "");
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditLabel(field.label);
    setEditOptions((field.options ?? []).join("\n"));
    setEditPlaceholder(field.placeholder ?? "");
  }, [field]);

  useEffect(() => {
    if (selected && labelRef.current) {
      labelRef.current.focus();
      labelRef.current.select();
    }
  }, [selected]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : field.is_active ? 1 : 0.4,
  };

  const needsOptions = ["radio", "select"].includes(field.field_type);

  const saveLabel = async (label: string) => {
    if (label.trim() && label !== field.label) await onUpdate({ label: label.trim() });
  };

  const saveOptions = async (raw: string) => {
    const opts = raw.split("\n").map((o) => o.trim()).filter(Boolean);
    if (opts.length > 0 && JSON.stringify(opts) !== JSON.stringify(field.options ?? [])) {
      await onUpdate({ options: opts });
    }
  };

  const savePlaceholder = async (ph: string) => {
    if (ph !== (field.placeholder ?? "")) await onUpdate({ placeholder: ph || undefined });
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      {selected && (
        <div className="absolute -top-9 right-2 z-10 flex items-center rounded border border-[#edebe9] bg-white shadow-md">
          <button {...attributes} {...listeners} className="cursor-grab p-2 text-[#605e5c] hover:bg-[#f3f2f1] active:cursor-grabbing">
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <button onClick={onMoveUp} disabled={isFirst} className="p-2 text-[#605e5c] hover:bg-[#f3f2f1] disabled:opacity-30">
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="p-2 text-[#605e5c] hover:bg-[#f3f2f1] disabled:opacity-30">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <div className="h-5 w-px bg-[#edebe9]" />
          <button
            onClick={() => onUpdate({ is_required: !field.is_required })}
            className={`p-2 ${field.is_required ? "bg-[#deecf9] text-[#0078d4]" : "text-[#605e5c] hover:bg-[#f3f2f1]"}`}
          >
            <Asterisk className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onUpdate({ is_active: !field.is_active })} className="p-2 text-[#605e5c] hover:bg-[#f3f2f1]">
            {field.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <button onClick={onDuplicate} className="p-2 text-[#605e5c] hover:bg-[#f3f2f1]">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="p-2 text-[#d13438] hover:bg-[#fdf3f4]">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div
        onClick={onSelect}
        className={`relative cursor-pointer py-6 transition-all ${
          selected
            ? "bg-[#f3f9fd] pl-4 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#0078d4]"
            : "border-b border-[#f3f2f1] hover:bg-[#faf9f8]"
        }`}
      >
        {selected ? (
          <div className="space-y-4 pr-4">
            <div className="flex items-start gap-1">
              <span className="mt-0.5 text-[15px] text-[#605e5c]">{index + 1}.</span>
              <input
                ref={labelRef}
                className="flex-1 border-b border-[#0078d4] bg-transparent pb-1 text-[15px] outline-none"
                style={{ color: theme.text_color }}
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={() => saveLabel(editLabel)}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              />
            </div>

            {needsOptions ? (
              <div className="ml-5">
                <p className="mb-1 text-[11px] font-medium text-[#a19f9d]">Options (one per line)</p>
                <textarea
                  className="field-input min-h-[72px] text-sm"
                  value={editOptions}
                  onChange={(e) => setEditOptions(e.target.value)}
                  onBlur={() => saveOptions(editOptions)}
                  rows={3}
                />
              </div>
            ) : (
              <div className="ml-5">
                <input
                  className="field-input text-sm"
                  value={editPlaceholder}
                  onChange={(e) => setEditPlaceholder(e.target.value)}
                  onBlur={() => savePlaceholder(editPlaceholder)}
                  placeholder="Placeholder text"
                />
              </div>
            )}

            <div className="ml-5">
              <select
                className="field-input w-auto text-xs"
                value={field.field_type}
                onChange={(e) => onUpdate({ field_type: e.target.value as FieldType })}
                onClick={(e) => e.stopPropagation()}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="themed-form pointer-events-none pr-4">
            <FieldPreview field={field} index={index} theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuestionCanvas({
  title,
  description,
  fields,
  theme,
  selectedId,
  onSelect,
  onTitleChange,
  onDescriptionChange,
  onReorder,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onAddQuestion,
  addingField,
}: QuestionCanvasProps) {
  const resolved = resolveTheme(theme);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description);

  useEffect(() => {
    setEditTitle(title);
    setEditDesc(description);
  }, [title, description]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedFields = [...fields].sort((a, b) => a.sort_order - b.sort_order);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedFields.findIndex((f) => f.id === active.id);
    const newIndex = sortedFields.findIndex((f) => f.id === over.id);
    onReorder(
      arrayMove(sortedFields, oldIndex, newIndex).map((f, i) => ({
        ...f,
        sort_order: (i + 1) * 10,
      }))
    );
  };

  const moveField = (fieldId: number, direction: "up" | "down") => {
    const idx = sortedFields.findIndex((f) => f.id === fieldId);
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sortedFields.length) return;
    onReorder(
      arrayMove(sortedFields, idx, newIdx).map((f, i) => ({
        ...f,
        sort_order: (i + 1) * 10,
      }))
    );
  };

  const activeField = sortedFields.find((f) => f.id === activeId);

  return (
    <div
      className="min-h-full"
      style={{
        fontFamily: `${resolved.font_family}, "Segoe UI", sans-serif`,
        backgroundColor: resolved.bg_color,
        backgroundImage: resolved.bg_image_url ? `url(${resolved.bg_image_url})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={() => onSelect(null)}
    >
      <div className="mx-auto max-w-[640px] px-6 py-10">
        <style>{getThemedFormStyles(resolved)}</style>

        {/* White form document — MS Forms style */}
        <div className="bg-white shadow-[0_1.6px_3.6px_rgba(0,0,0,0.13),0_0.3px_0.9px_rgba(0,0,0,0.11)]">
          {/* Title section */}
          <div className="border-b border-[#f3f2f1] px-10 pb-6 pt-10" onClick={(e) => e.stopPropagation()}>
            <input
              className="w-full bg-transparent text-[28px] font-normal leading-tight outline-none placeholder:text-[#a19f9d]"
              style={{ color: resolved.text_color }}
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value);
                onTitleChange(e.target.value);
              }}
              placeholder="Untitled form"
            />
            <input
              className="mt-3 w-full bg-transparent text-sm outline-none placeholder:text-[#a19f9d]"
              style={{ color: resolved.text_color, opacity: 0.75 }}
              value={editDesc}
              onChange={(e) => {
                setEditDesc(e.target.value);
                onDescriptionChange(e.target.value);
              }}
              placeholder="Enter a description (optional)"
            />
          </div>

          {/* Questions */}
          <div className="px-10" onClick={(e) => e.stopPropagation()}>
            {sortedFields.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-[#605e5c]">Start by adding a question</p>
                <p className="mt-1 text-xs text-[#a19f9d]">Use the Add tab on the left</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(e) => setActiveId(e.active.id as number)}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sortedFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  {sortedFields.map((field, i) => (
                    <SortableQuestionBlock
                      key={field.id}
                      field={field}
                      index={i}
                      theme={resolved}
                      selected={selectedId === field.id}
                      onSelect={() => onSelect(field.id)}
                      onUpdate={(data) => onUpdateField(field.id, data)}
                      onDelete={() => onDeleteField(field.id)}
                      onDuplicate={() => onDuplicateField(field)}
                      onMoveUp={() => moveField(field.id, "up")}
                      onMoveDown={() => moveField(field.id, "down")}
                      isFirst={i === 0}
                      isLast={i === sortedFields.length - 1}
                    />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeField && (
                    <div className="bg-white p-6 shadow-xl">
                      <FieldPreview field={activeField} index={sortedFields.indexOf(activeField)} theme={resolved} />
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            )}

            <div className="py-6">
              <AddQuestionButton onClick={onAddQuestion} disabled={addingField} />
            </div>
          </div>

          {/* Submit preview */}
          <div className="border-t border-[#f3f2f1] px-10 py-8">
            <div
              className="inline-flex items-center rounded px-5 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: resolved.primary_color }}
            >
              Submit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
