"use client";

import { useState, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import type { ThemeConfig } from "@/lib/types";
import { api } from "@/lib/api";
import { Save, Upload, X, Palette } from "lucide-react";

const DEFAULT_THEME: ThemeConfig = {
  bg_color: "#f5f0eb",
  bg_image_url: null,
  font_family: "Inter",
  primary_color: "#8b2332",
  text_color: "#1f2937",
  border_radius: 8,
};

const THEME_PRESETS: { name: string; theme: ThemeConfig }[] = [
  {
    name: "Classic Red",
    theme: {
      bg_color: "#f5f0eb",
      bg_image_url: null,
      font_family: "Inter",
      primary_color: "#8b2332",
      text_color: "#1f2937",
      border_radius: 8,
    },
  },
  {
    name: "Teal",
    theme: {
      bg_color: "#e8f0f2",
      bg_image_url: null,
      font_family: "Inter",
      primary_color: "#2d6b77",
      text_color: "#1f2937",
      border_radius: 8,
    },
  },
  {
    name: "Navy",
    theme: {
      bg_color: "#eef2f7",
      bg_image_url: null,
      font_family: "Inter",
      primary_color: "#1e3a5f",
      text_color: "#1a202c",
      border_radius: 8,
    },
  },
  {
    name: "Forest",
    theme: {
      bg_color: "#ecf5ec",
      bg_image_url: null,
      font_family: "Inter",
      primary_color: "#2d5a3f",
      text_color: "#1a2e1a",
      border_radius: 8,
    },
  },
  {
    name: "Purple",
    theme: {
      bg_color: "#f3f0ff",
      bg_image_url: null,
      font_family: "Inter",
      primary_color: "#6d28d9",
      text_color: "#111827",
      border_radius: 8,
    },
  },
  {
    name: "Charcoal",
    theme: {
      bg_color: "#f0f0f0",
      bg_image_url: null,
      font_family: "Inter",
      primary_color: "#333333",
      text_color: "#1a1a1a",
      border_radius: 6,
    },
  },
];

const FONT_OPTIONS = [
  "Inter",
  "Arial",
  "Georgia",
  "Verdana",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Trebuchet MS",
  "Palatino",
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
      <label className="mb-1 block text-[11px] font-medium text-gray-600">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className="h-8 w-8 shrink-0 rounded-lg border-2 border-gray-200 transition hover:border-gray-400"
          style={{ backgroundColor: value }}
          title="Pick color"
        />
        <input
          className="field-input text-xs py-1.5 font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-elevated">
          <HexColorPicker color={value} onChange={onChange} />
          <button
            onClick={() => setOpen(false)}
            className="mt-2 w-full rounded-lg bg-gray-100 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export default function ThemeEditor({
  theme,
  onSave,
}: {
  theme?: ThemeConfig;
  onSave: (theme: ThemeConfig) => void;
}) {
  const [local, setLocal] = useState<ThemeConfig>({ ...DEFAULT_THEME, ...theme });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const changed =
    JSON.stringify(local) !== JSON.stringify({ ...DEFAULT_THEME, ...theme });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(local);
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
      setLocal({ ...local, bg_image_url: url });
    } catch {
      // silently fail
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-brand-600" />
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Theme</p>
      </div>

      <div className="surface-card p-4 space-y-4">
        {/* Theme Presets */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-gray-600">Quick Presets</label>
          <div className="grid grid-cols-2 gap-1.5">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setLocal(preset.theme)}
                className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1.5 text-left transition hover:border-gray-400 hover:bg-gray-50"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: preset.theme.primary_color }}
                />
                <span className="text-[10px] font-medium text-gray-600 truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <ColorField
          label="Background Color"
          value={local.bg_color}
          onChange={(v) => setLocal({ ...local, bg_color: v })}
        />

        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-600">Background Image</label>
          {local.bg_image_url ? (
            <div className="relative rounded-lg border border-gray-200 overflow-hidden">
              <img
                src={local.bg_image_url}
                alt="Background"
                className="h-20 w-full object-cover"
              />
              <button
                onClick={() => setLocal({ ...local, bg_image_url: null })}
                className="absolute top-1 right-1 rounded-full bg-white/80 p-1 text-gray-600 hover:bg-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-xs text-gray-500 transition hover:border-brand-400 hover:text-brand-600"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? "Uploading..." : "Upload image"}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        <ColorField
          label="Primary / Button Color"
          value={local.primary_color}
          onChange={(v) => setLocal({ ...local, primary_color: v })}
        />

        <ColorField
          label="Text Color"
          value={local.text_color}
          onChange={(v) => setLocal({ ...local, text_color: v })}
        />

        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-600">Font Family</label>
          <select
            className="field-input text-xs"
            value={local.font_family}
            onChange={(e) => setLocal({ ...local, font_family: e.target.value })}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-600">
            Border Radius: {local.border_radius}px
          </label>
          <input
            type="range"
            min={0}
            max={24}
            value={local.border_radius}
            onChange={(e) => setLocal({ ...local, border_radius: Number(e.target.value) })}
            className="w-full accent-brand-600"
          />
        </div>

        {/* Preview swatch */}
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-600">Preview</label>
          <div
            className="rounded-lg border border-gray-200 p-4 transition-all"
            style={{
              backgroundColor: local.bg_color,
              backgroundImage: local.bg_image_url ? `url(${local.bg_image_url})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              fontFamily: local.font_family,
              color: local.text_color,
              borderRadius: `${local.border_radius}px`,
            }}
          >
            <p className="text-xs font-semibold">Form Title</p>
            <div
              className="mt-2 rounded px-2 py-1 text-[10px]"
              style={{
                border: `1px solid ${local.primary_color}40`,
                borderRadius: `${Math.max(4, local.border_radius - 4)}px`,
              }}
            >
              Sample input field
            </div>
            <div
              className="mt-2 inline-block rounded px-3 py-1 text-[10px] font-medium text-white"
              style={{
                backgroundColor: local.primary_color,
                borderRadius: `${Math.max(4, local.border_radius - 4)}px`,
              }}
            >
              Submit
            </div>
          </div>
        </div>

        {changed && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full text-xs py-2"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save Theme"}
          </button>
        )}
      </div>
    </div>
  );
}
