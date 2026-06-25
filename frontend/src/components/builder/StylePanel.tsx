"use client";

import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import type { ThemeConfig } from "@/lib/types";
import { api } from "@/lib/api";
import { DEFAULT_THEME, THEME_PRESETS } from "@/lib/theme";
import { Upload, X, Save, Check } from "lucide-react";

const FONT_OPTIONS = ["Segoe UI", "Inter", "Arial", "Georgia", "Verdana", "Helvetica"];

const LAYOUTS = [
  { id: "default", label: "Default" },
  { id: "wide", label: "Wide" },
  { id: "split", label: "Split" },
];

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-medium text-[#323130]">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className="h-7 w-7 shrink-0 rounded border border-[#c8c6c4]"
          style={{ backgroundColor: value }}
        />
        <input
          className="field-input py-1 text-xs font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-[#edebe9] bg-white p-3 shadow-xl">
          <HexColorPicker color={value} onChange={onChange} />
          <button
            onClick={() => setOpen(false)}
            className="mt-2 w-full rounded bg-[#f3f2f1] py-1 text-xs text-[#323130] hover:bg-[#edebe9]"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

interface StylePanelProps {
  theme?: ThemeConfig | null;
  onSave: (theme: ThemeConfig) => Promise<void>;
  onLiveChange?: (theme: ThemeConfig) => void;
  onClose?: () => void;
}

export default function StylePanel({ theme, onSave, onLiveChange, onClose }: StylePanelProps) {
  const [local, setLocal] = useState<ThemeConfig>({ ...DEFAULT_THEME, ...theme });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [themeTab, setThemeTab] = useState<"suggested" | "customized">("suggested");
  const [selectedLayout, setSelectedLayout] = useState("default");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocal({ ...DEFAULT_THEME, ...theme });
  }, [theme]);

  const update = (next: ThemeConfig) => {
    setLocal(next);
    onLiveChange?.(next);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(local);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      update({ ...local, bg_image_url: url });
      setThemeTab("customized");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-l border-[#edebe9] bg-white">
      <div className="flex items-center justify-between border-b border-[#edebe9] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#323130]">Styles</h2>
        {onClose && (
          <button onClick={onClose} className="rounded p-1 text-[#605e5c] hover:bg-[#f3f2f1]">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Layouts — visual like MS Forms */}
        <div>
          <p className="mb-2 text-xs font-semibold text-[#323130]">Layouts</p>
          <div className="grid grid-cols-3 gap-2">
            {LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setSelectedLayout(layout.id)}
                className={`flex flex-col items-center gap-1 rounded border-2 p-2 transition ${
                  selectedLayout === layout.id
                    ? "border-[#0078d4] border-dashed bg-[#f3f9fd]"
                    : "border-[#edebe9] hover:border-[#c8c6c4]"
                }`}
              >
                <div className="flex h-10 w-full items-center justify-center rounded bg-[#f3f2f1]">
                  <div className="h-6 w-8 rounded-sm bg-white shadow-sm" />
                </div>
                <span className="text-[9px] text-[#605e5c]">{layout.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme tabs */}
        <div>
          <div className="mb-2 flex border-b border-[#edebe9]">
            {(["suggested", "customized"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setThemeTab(tab)}
                className={`px-3 pb-2 text-xs font-medium capitalize transition ${
                  themeTab === tab
                    ? "border-b-2 border-[#6264a7] text-[#323130]"
                    : "text-[#605e5c] hover:text-[#323130]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {themeTab === "suggested" ? (
            <div className="grid grid-cols-2 gap-2">
              {THEME_PRESETS.map((preset) => {
                const selected =
                  local.primary_color === preset.theme.primary_color &&
                  local.bg_color === preset.theme.bg_color;
                return (
                  <button
                    key={preset.name}
                    onClick={() => update(preset.theme)}
                    className={`overflow-hidden rounded-md border-2 transition ${
                      selected ? "border-[#0078d4]" : "border-transparent hover:opacity-90"
                    }`}
                  >
                    <div className="h-16" style={{ background: preset.preview }} />
                    <div
                      className="px-2 py-1 text-left text-[10px] font-medium text-[#605e5c]"
                      style={{ backgroundColor: preset.theme.bg_color }}
                    >
                      {preset.name}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <ColorField
                label="Background color"
                value={local.bg_color}
                onChange={(v) => update({ ...local, bg_color: v })}
              />
              <ColorField
                label="Accent color"
                value={local.primary_color}
                onChange={(v) => update({ ...local, primary_color: v })}
              />
              <ColorField
                label="Text color"
                value={local.text_color}
                onChange={(v) => update({ ...local, text_color: v })}
              />

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#323130]">Background image</label>
                {local.bg_image_url ? (
                  <div className="relative overflow-hidden rounded-md border border-[#edebe9]">
                    <img src={local.bg_image_url} alt="" className="h-20 w-full object-cover" />
                    <button
                      onClick={() => update({ ...local, bg_image_url: null })}
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-1 shadow"
                    >
                      <X className="h-3 w-3 text-[#605e5c]" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#c8c6c4] py-3 text-xs text-[#605e5c] hover:border-[#6264a7]"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? "Uploading..." : "Upload image"}
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#323130]">Font</label>
                <select
                  className="field-input text-xs"
                  value={local.font_family}
                  onChange={(e) => update({ ...local, font_family: e.target.value })}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#edebe9] p-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded bg-[#6264a7] py-2 text-sm font-semibold text-white hover:bg-[#464775] disabled:opacity-50"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save theme"}
        </button>
      </div>
    </aside>
  );
}
