import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Theme } from "../types";
import { storage, STORAGE_KEYS } from "../lib/storage";

export const THEMES: Record<string, Theme> = {
  dreamyDusk: {
    id: "dreamyDusk",
    name: "Dreamy Dusk",
    dark: false,
    jarDesign: "star-jar",
    particleShape: "star",
    colors: {
      background: "#f5eeff",
      backgroundGradientStart: "#ede0ff",
      backgroundGradientEnd: "#ffd6e8",
      surface: "#ffffff",
      surfaceAlt: "#f0e6ff",
      primary: "#7c5cbf",
      primaryMuted: "#b39ddb",
      accent: "#f9a8d4",
      text: "#2d1b5e",
      textMuted: "#7b6899",
      textSubtle: "#b3a6c9",
      taskCard: "#ffffff",
      taskCardBorder: "#e8d8f8",
      jarBackground: "#f7eeff",
      tabBar: "#ffffff",
      tabBarBorder: "#eeddf8",
      done: "#c8b8e8",
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
      backgroundGradientStart: "#fff0f3",
      backgroundGradientEnd: "#fde8ed",
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
      done: "#fbc8d4",
    },
  },

  cloudyMeadow: {
    id: "cloudyMeadow",
    name: "Cloudy Meadow",
    dark: false,
    jarDesign: "moon-basket",
    particleShape: "cloud",
    colors: {
      background: "#f0f4ff",
      backgroundGradientStart: "#e8f0ff",
      backgroundGradientEnd: "#e8f8f0",
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
      done: "#c8d4f8",
    },
  },

  cozyBedroom: {
    id: "cozyBedroom",
    name: "Cozy Bedroom",
    dark: false,
    jarDesign: "moon-basket",
    particleShape: "moon",
    colors: {
      background: "#fff8f0",
      backgroundGradientStart: "#fff3e8",
      backgroundGradientEnd: "#ffecd8",
      surface: "#ffffff",
      surfaceAlt: "#fff0e0",
      primary: "#e07b39",
      primaryMuted: "#f0a875",
      accent: "#f9c74f",
      text: "#3d1f0a",
      textMuted: "#8a5030",
      textSubtle: "#c4906a",
      taskCard: "#ffffff",
      taskCardBorder: "#fcd8b8",
      jarBackground: "#fff0e0",
      tabBar: "#ffffff",
      tabBarBorder: "#fcd8b8",
      done: "#f8d8b8",
    },
  },

  deepNight: {
    id: "deepNight",
    name: "Deep Night",
    dark: true,
    jarDesign: "dream-bottle",
    particleShape: "star",
    colors: {
      background: "#0f0e1a",
      backgroundGradientStart: "#0f0e1a",
      backgroundGradientEnd: "#1a1030",
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
      done: "#2e2a4a",
    },
  },
};

export const DEFAULT_THEME_ID = "dreamyDusk";

interface ThemeStore {
  activeThemeId: string;
  theme: Theme;
  setTheme: (id: string) => void;
  allThemes: () => Theme[];
}

const zustandStorage = createJSONStorage(() => ({
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
}));

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
      partialize: (state) => ({ activeThemeId: state.activeThemeId }),
      onRehydrateStorage: () => (state) => {
        if (state?.activeThemeId) {
          state.theme = THEMES[state.activeThemeId] ?? THEMES[DEFAULT_THEME_ID];
        }
      },
    }
  )
);
