import type { ThemeConfig } from "./types";

export const DEFAULT_THEME: ThemeConfig = {
  bg_color: "#f5f0eb",
  bg_image_url: null,
  font_family: "Segoe UI",
  primary_color: "#03787c",
  text_color: "#323130",
  border_radius: 4,
};

export const THEME_PRESETS: { name: string; theme: ThemeConfig; preview: string }[] = [
  {
    name: "Teal",
    preview: "linear-gradient(135deg, #03787c 0%, #026d71 100%)",
    theme: {
      bg_color: "#e8f4f4",
      bg_image_url: null,
      font_family: "Segoe UI",
      primary_color: "#03787c",
      text_color: "#323130",
      border_radius: 4,
    },
  },
  {
    name: "Purple",
    preview: "linear-gradient(135deg, #6264a7 0%, #464775 100%)",
    theme: {
      bg_color: "#f3f2f9",
      bg_image_url: null,
      font_family: "Segoe UI",
      primary_color: "#6264a7",
      text_color: "#323130",
      border_radius: 4,
    },
  },
  {
    name: "Blue",
    preview: "linear-gradient(135deg, #0078d4 0%, #106ebe 100%)",
    theme: {
      bg_color: "#eff6fc",
      bg_image_url: null,
      font_family: "Segoe UI",
      primary_color: "#0078d4",
      text_color: "#323130",
      border_radius: 4,
    },
  },
  {
    name: "Green",
    preview: "linear-gradient(135deg, #107c10 0%, #0b6a0b 100%)",
    theme: {
      bg_color: "#ecf5ec",
      bg_image_url: null,
      font_family: "Segoe UI",
      primary_color: "#107c10",
      text_color: "#323130",
      border_radius: 4,
    },
  },
  {
    name: "Red",
    preview: "linear-gradient(135deg, #d13438 0%, #a4262c 100%)",
    theme: {
      bg_color: "#fdf3f4",
      bg_image_url: null,
      font_family: "Segoe UI",
      primary_color: "#d13438",
      text_color: "#323130",
      border_radius: 4,
    },
  },
  {
    name: "Orange",
    preview: "linear-gradient(135deg, #ca5010 0%, #a74100 100%)",
    theme: {
      bg_color: "#fdf6f0",
      bg_image_url: null,
      font_family: "Segoe UI",
      primary_color: "#ca5010",
      text_color: "#323130",
      border_radius: 4,
    },
  },
  {
    name: "Navy",
    preview: "linear-gradient(135deg, #1e3a5f 0%, #152a45 100%)",
    theme: {
      bg_color: "#eef2f7",
      bg_image_url: null,
      font_family: "Segoe UI",
      primary_color: "#1e3a5f",
      text_color: "#1a202c",
      border_radius: 4,
    },
  },
  {
    name: "Charcoal",
    preview: "linear-gradient(135deg, #484644 0%, #323130 100%)",
    theme: {
      bg_color: "#f3f2f1",
      bg_image_url: null,
      font_family: "Segoe UI",
      primary_color: "#484644",
      text_color: "#323130",
      border_radius: 4,
    },
  },
];

export function resolveTheme(theme?: ThemeConfig | null): ThemeConfig {
  return { ...DEFAULT_THEME, ...theme };
}

export function getThemedFormStyles(theme: ThemeConfig): string {
  return `
    .themed-form .field-input {
      border: 1px solid #e1dfdd;
      border-radius: ${theme.border_radius}px;
      font-family: ${theme.font_family}, sans-serif;
      background-color: #ffffff;
      padding: 8px 12px;
      font-size: 14px;
      color: #323130;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .themed-form .field-input::placeholder { color: #a19f9d; }
    .themed-form .field-input:focus {
      outline: none;
      border-color: ${theme.primary_color};
      box-shadow: 0 0 0 1px ${theme.primary_color};
    }
    .themed-form .field-input:hover { border-color: #c8c6c4; }
    .themed-form .btn-primary {
      background-color: ${theme.primary_color};
      border-radius: 2px;
      padding: 8px 20px;
      font-weight: 600;
      font-size: 14px;
    }
    .themed-form .btn-primary:hover { filter: brightness(1.08); }
    .themed-form label { color: ${theme.text_color}; }
    .themed-form .radio-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 0;
      cursor: default;
      font-size: 14px;
      color: ${theme.text_color};
    }
    .themed-form .radio-option input[type="radio"] {
      appearance: none;
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border: 2px solid #605e5c;
      border-radius: 50%;
      outline: none;
      flex-shrink: 0;
      background: white;
      pointer-events: none;
    }
    .themed-form .radio-option input[type="radio"]:checked {
      border-color: ${theme.primary_color};
    }
    .themed-form .radio-option input[type="radio"]:checked::after {
      content: '';
      display: block;
      width: 10px;
      height: 10px;
      margin: 2px auto;
      border-radius: 50%;
      background-color: ${theme.primary_color};
    }
  `;
}
