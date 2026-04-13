import type { CSSProperties } from "react";
import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { resolveTenantForCurrentRequest } from "@/lib/tenant";

const TENANT_THEME_SETTING_KEY = "tenant_theme";

export type ThemePreset = "emerald-sky" | "ocean-blue" | "sunset-orange" | "slate-indigo";

export type TenantThemeConfig = {
  preset: ThemePreset;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundFrom: string;
  backgroundTo: string;
  headingFont: string;
  bodyFont: string;
};

const DEFAULT_FONT_STACK = "\"Segoe UI\", Roboto, sans-serif";

const THEME_PRESETS: Record<ThemePreset, Omit<TenantThemeConfig, "preset">> = {
  "emerald-sky": {
    primaryColor: "#0f766e",
    secondaryColor: "#0284c7",
    accentColor: "#16a34a",
    backgroundFrom: "#ecfdf5",
    backgroundTo: "#eff6ff",
    headingFont: DEFAULT_FONT_STACK,
    bodyFont: DEFAULT_FONT_STACK
  },
  "ocean-blue": {
    primaryColor: "#0f4c81",
    secondaryColor: "#0369a1",
    accentColor: "#0891b2",
    backgroundFrom: "#e0f2fe",
    backgroundTo: "#ecfeff",
    headingFont: DEFAULT_FONT_STACK,
    bodyFont: DEFAULT_FONT_STACK
  },
  "sunset-orange": {
    primaryColor: "#b45309",
    secondaryColor: "#ea580c",
    accentColor: "#dc2626",
    backgroundFrom: "#fff7ed",
    backgroundTo: "#fef2f2",
    headingFont: DEFAULT_FONT_STACK,
    bodyFont: DEFAULT_FONT_STACK
  },
  "slate-indigo": {
    primaryColor: "#334155",
    secondaryColor: "#4338ca",
    accentColor: "#2563eb",
    backgroundFrom: "#f8fafc",
    backgroundTo: "#eef2ff",
    headingFont: DEFAULT_FONT_STACK,
    bodyFont: DEFAULT_FONT_STACK
  }
};

const DEFAULT_THEME: TenantThemeConfig = {
  preset: "emerald-sky",
  ...THEME_PRESETS["emerald-sky"]
};

type TenantThemeInput = {
  preset?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundFrom?: string;
  backgroundTo?: string;
  headingFont?: string;
  bodyFont?: string;
};

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeHexColor(input: string | undefined, fallback: string) {
  if (!input) {
    return fallback;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return fallback;
}

function normalizeFont(input: string | undefined, fallback: string) {
  if (!input) {
    return fallback;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.slice(0, 120);
}

function toRgbTuple(hexColor: string) {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
}

function toRgba(hexColor: string, alpha: number) {
  const { r, g, b } = toRgbTuple(hexColor);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isPreset(value: string): value is ThemePreset {
  return value in THEME_PRESETS;
}

export function normalizeTenantThemeInput(input: TenantThemeInput): TenantThemeConfig {
  const preset = isPreset(input.preset ?? "") ? (input.preset as ThemePreset) : DEFAULT_THEME.preset;
  const presetBase = THEME_PRESETS[preset];

  return {
    preset,
    primaryColor: normalizeHexColor(input.primaryColor, presetBase.primaryColor),
    secondaryColor: normalizeHexColor(input.secondaryColor, presetBase.secondaryColor),
    accentColor: normalizeHexColor(input.accentColor, presetBase.accentColor),
    backgroundFrom: normalizeHexColor(input.backgroundFrom, presetBase.backgroundFrom),
    backgroundTo: normalizeHexColor(input.backgroundTo, presetBase.backgroundTo),
    headingFont: normalizeFont(input.headingFont, presetBase.headingFont),
    bodyFont: normalizeFont(input.bodyFont, presetBase.bodyFont)
  };
}

export function parseTenantThemeValue(value: Prisma.JsonValue | null | undefined): TenantThemeConfig {
  const record = asRecord(value);
  if (!record) {
    return DEFAULT_THEME;
  }

  return normalizeTenantThemeInput({
    preset: typeof record.preset === "string" ? record.preset : undefined,
    primaryColor: typeof record.primaryColor === "string" ? record.primaryColor : undefined,
    secondaryColor: typeof record.secondaryColor === "string" ? record.secondaryColor : undefined,
    accentColor: typeof record.accentColor === "string" ? record.accentColor : undefined,
    backgroundFrom: typeof record.backgroundFrom === "string" ? record.backgroundFrom : undefined,
    backgroundTo: typeof record.backgroundTo === "string" ? record.backgroundTo : undefined,
    headingFont: typeof record.headingFont === "string" ? record.headingFont : undefined,
    bodyFont: typeof record.bodyFont === "string" ? record.bodyFont : undefined
  });
}

export function toTenantThemeJson(theme: TenantThemeConfig): Prisma.JsonObject {
  return {
    preset: theme.preset,
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: theme.accentColor,
    backgroundFrom: theme.backgroundFrom,
    backgroundTo: theme.backgroundTo,
    headingFont: theme.headingFont,
    bodyFont: theme.bodyFont
  };
}

export async function getTenantThemeByTenantId(tenantId?: string | null) {
  if (!tenantId || !process.env.DATABASE_URL) {
    return DEFAULT_THEME;
  }

  try {
    const row = await prisma.siteSetting.findFirst({
      where: {
        tenantId,
        key: TENANT_THEME_SETTING_KEY
      },
      select: {
        value: true
      }
    });

    if (!row) {
      return DEFAULT_THEME;
    }

    return parseTenantThemeValue(row.value);
  } catch {
    return DEFAULT_THEME;
  }
}

export async function upsertTenantThemeByTenantId(tenantId: string, theme: TenantThemeConfig) {
  await prisma.siteSetting.upsert({
    where: {
      tenantId_key: {
        tenantId,
        key: TENANT_THEME_SETTING_KEY
      }
    },
    update: {
      value: toTenantThemeJson(theme),
      groupKey: "tenant",
      isPublic: true,
      description: "Theme theo tenant"
    },
    create: {
      tenantId,
      key: TENANT_THEME_SETTING_KEY,
      value: toTenantThemeJson(theme),
      groupKey: "tenant",
      isPublic: true,
      description: "Theme theo tenant"
    }
  });
}

export async function getCurrentTenantTheme() {
  if (!process.env.DATABASE_URL) {
    return DEFAULT_THEME;
  }

  try {
    const tenant = await resolveTenantForCurrentRequest();
    if (!tenant?.id) {
      return DEFAULT_THEME;
    }

    return getTenantThemeByTenantId(tenant.id);
  } catch {
    return DEFAULT_THEME;
  }
}

export function toTenantThemeCssVariables(theme: TenantThemeConfig): CSSProperties {
  return {
    "--theme-primary": theme.primaryColor,
    "--theme-secondary": theme.secondaryColor,
    "--theme-accent": theme.accentColor,
    "--theme-bg-from": theme.backgroundFrom,
    "--theme-bg-to": theme.backgroundTo,
    "--theme-primary-soft": toRgba(theme.primaryColor, 0.08),
    "--theme-primary-border": toRgba(theme.primaryColor, 0.25),
    "--theme-secondary-soft": toRgba(theme.secondaryColor, 0.08),
    "--theme-secondary-border": toRgba(theme.secondaryColor, 0.25),
    "--theme-heading-font": theme.headingFont,
    "--theme-body-font": theme.bodyFont
  } as CSSProperties;
}

export const tenantThemeSettingKey = TENANT_THEME_SETTING_KEY;
export const tenantThemePresets = THEME_PRESETS;
export const defaultTenantTheme = DEFAULT_THEME;
