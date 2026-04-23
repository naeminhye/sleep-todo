import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Theme } from "../types";
import { storage, STORAGE_KEYS } from "../lib/storage";

// ─── Theme definitions ────────────────────────────────────────────────────────

export const THEMES: Record<string, Theme> = {
  nightSky: {
    id: "nightSky",
    name: "Night Sky",
    dark: true,
    jarDesign: "dream-bottle",
    particleShape: "star",
    colors: {
      background: "#0f0e1a",
      surface: "#1a1830",
      surfaceAlt: "#231f3a",
      primary: "#a78bfa",
      primaryMuted: "#6d5fa6",
      accent: "#f9a8d4",
      text: "#ede9fe",
      textMuted: "#a094c7",
      textSubtle: "#6b5f99",
      taskCard: "#1e1b35",
      taskCardBorder: "#2e2a4a",
      jarBackground: "#12102a",
      tabBar: "#1a1830",
      tabBarBorder: "#2e2a4a",
    },
  },

  strawberryDream: {
    id: "strawberryDream",
    name: "Strawberry Dream",
    dark: false,
    jarDesign: "star-jar",
    particleShape: "heart",
    colors: {
      background: "#fff5f7",
      surface: "#ffffff",
      surfaceAlt: "#fde8ed",
      primary: "#f43f6b",
      primaryMuted: "#fb7a9c",
      accent: "#fbbf24",
      text: "#3b1320",
      textMuted: "#9a4060",
      textSubtle: "#c87a90",
      taskCard: "#ffffff",
      taskCardBorder: "#fcd0db",
      jarBackground: "#fde8ed",
      tabBar: "#ffffff",
      tabBarBorder: "#fcd0db",
    },
  },

  cloudyDesk: {
    id: "cloudyDesk",
    name: "Cloudy Desk",
    dark: false,
    jarDesign: "moon-basket",
    particleShape: "cloud",
    colors: {
      background: "#f0f4ff",
      surface: "#ffffff",
      surfaceAlt: "#e8eeff",
      primary: "#6b8ef6",
      primaryMuted: "#9bb3fa",
      accent: "#a78bfa",
      text: "#1e2a5e",
      textMuted: "#5568a6",
      textSubtle: "#8a9dd4",
      taskCard: "#ffffff",
      taskCardBorder: "#d6e0ff",
      jarBackground: "#e8eeff",
      tabBar: "#ffffff",
      tabBarBorder: "#d6e0ff",
    },
  },

  moonBunny: {
    id: "moonBunny",
    name: "Moon Bunny",
    dark: true,
    jarDesign: "moon-basket",
    particleShape: "sparkle",
    colors: {
      background: "#13111c",
      surface: "#1e1b2e",
      surfaceAlt: "#252238",
      primary: "#c4b5fd",
      primaryMuted: "#7c6fb5",
      accent: "#fbcfe8",
      text: "#f5f0ff",
      textMuted: "#9d8ec4",
      textSubtle: "#6a5f99",
      taskCard: "#221f33",
      taskCardBorder: "#332f50",
      jarBackground: "#16132a",
      tabBar: "#1e1b2e",
      tabBarBorder: "#332f50",
    },
  },
};

export const DEFAULT_THEME_ID = "nightSky";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ThemeStore {
  activeThemeId: string;
  theme: Theme;
  setTheme: (id: string) => void;
  allThemes: () => Theme[];
}

// ─── Zustand storage adapter ─────────────────────────────────────────────────

const zustandStorage = createJSONStorage(() => ({
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
}));

// ─── Store ────────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      activeThemeId: DEFAULT_THEME_ID,
      theme: THEMES[DEFAULT_THEME_ID],

      setTheme: (id) => {
        const theme = THEMES[id];
        if (!theme) return;
        set({ activeThemeId: id, theme });
      },

      allThemes: () => Object.values(THEMES),
    }),
    {
      name: STORAGE_KEYS.ACTIVE_THEME_ID,
      storage: zustandStorage,
      // Only persist the ID — resolve the full Theme object at runtime
      partialize: (state) => ({ activeThemeId: state.activeThemeId }),
      // On rehydration, resolve the theme object from the stored ID
      onRehydrateStorage: () => (state) => {
        if (state && state.activeThemeId) {
          const theme = THEMES[state.activeThemeId] ?? THEMES[DEFAULT_THEME_ID];
          state.theme = theme;
        }
      },
    }
  )
);
