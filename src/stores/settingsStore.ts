import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { AppSettings } from "../types";
import { storage, STORAGE_KEYS } from "../lib/storage";

// ─── Zustand storage adapter ─────────────────────────────────────────────────

const zustandStorage = createJSONStorage(() => ({
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: false,
  reminderTime: "09:00",
  dailyEncouragementEnabled: true,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (patch) => {
        set({ settings: { ...get().settings, ...patch } });
      },
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: zustandStorage,
    }
  )
);
