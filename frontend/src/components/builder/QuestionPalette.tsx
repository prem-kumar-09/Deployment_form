"use client";

import type { FieldType } from "@/lib/types";
import {
  Type,
  AlignLeft,
  Calendar,
  CircleDot,
  List,
  AtSign,
  Link2,
  Plus,
  X,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";

export const FIELD_TYPES: {
  value: FieldType;
  label: string;
  icon: typeof Type;
  defaultLabel: string;
}[] = [
  { value: "text", label: "Text", icon: Type, defaultLabel: "Short answer" },
  { value: "textarea", label: "Paragraph", icon: AlignLeft, defaultLabel: "Long answer" },
  { value: "date", label: "Date", icon: Calendar, defaultLabel: "Date" },
  { value: "radio", label: "Choice", icon: CircleDot, defaultLabel: "Choice question" },
  { value: "select", label: "Dropdown", icon: List, defaultLabel: "Dropdown question" },
  { value: "email", label: "Email", icon: AtSign, defaultLabel: "Email" },
  { value: "url", label: "URL", icon: Link2, defaultLabel: "Website" },
];

interface QuestionPaletteProps {
  onAdd: (type: FieldType) => void;
  adding?: boolean;
}

export default function QuestionPalette({ onAdd, adding }: QuestionPaletteProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={adding}
        className="absolute left-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center rounded-r-md border border-l-0 border-[#edebe9] bg-white/95 px-1.5 py-3 shadow-sm backdrop-blur-sm transition hover:bg-white disabled:opacity-50"
        title="Add question"
      >
        <LayoutGrid className="h-4 w-4 text-[#6264a7]" />
        <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-wide text-[#605e5c] [writing-mode:vertical-lr]">
          Add
        </span>
      </button>

      {open && (
        <>
          <div className="absolute inset-0 z-30 bg-black/10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-[#edebe9] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#edebe9] px-4 py-3">
              <h3 className="text-sm font-semibold text-[#323130]">Add question</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-[#605e5c] hover:bg-[#f3f2f1]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {FIELD_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => {
                      onAdd(t.value);
                      setOpen(false);
                    }}
                    disabled={adding}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition hover:bg-[#f3f2f1] disabled:opacity-50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#f3f2f1]">
                      <Icon className="h-4 w-4 text-[#6264a7]" />
                    </div>
                    <span className="text-sm text-[#323130]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function generateFieldDefaults(
  type: FieldType,
  existingCount: number
): {
  name: string;
  label: string;
  placeholder?: string;
  options?: string[];
  is_required: boolean;
} {
  const meta = FIELD_TYPES.find((t) => t.value === type)!;
  const base = `q${existingCount + 1}`;
  const needsOptions = ["radio", "select"].includes(type);

  return {
    name: base,
    label: meta.defaultLabel,
    placeholder: type === "text" ? "Enter your answer" : undefined,
    options: needsOptions ? ["Option 1", "Option 2", "Option 3"] : undefined,
    is_required: true,
  };
}

export function AddQuestionButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-dashed border-[#c8c6c4] py-3 text-sm text-[#605e5c] transition hover:border-[#6264a7] hover:bg-[#faf9f8] hover:text-[#323130] disabled:opacity-50"
    >
      <Plus className="h-4 w-4" />
      Add new
    </button>
  );
}
