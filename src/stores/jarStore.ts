import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { JarEntry, DailyRecord, ParticleShape } from "../types";
import { storage, STORAGE_KEYS } from "../lib/storage";
import { todayKey, sortedDateKeys } from "../lib/dateUtils";

// ─── Zustand storage adapter ─────────────────────────────────────────────────

const zustandStorage = createJSONStorage(() => ({
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
}));

// ─── Shape rotation — each task completion cycles the particle shape ──────────

const SHAPES: ParticleShape[] = ["star", "heart", "cloud", "sparkle"];

function nextShape(entries: JarEntry[]): ParticleShape {
  return SHAPES[entries.length % SHAPES.length];
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface JarStore {
  todayEntries: JarEntry[];
  history: Record<string, DailyRecord>; // keyed by YYYY-MM-DD

  // ── Selectors ──
  todayCount: () => number;
  getRecord: (date: string) => DailyRecord | null;
  historyDates: () => string[]; // sorted descending

  // ── Mutations ──
  addEntry: (taskId: string, title: string) => JarEntry;

  // Called from root layout during daily reset — archives today → history
  archiveTodayToHistory: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useJarStore = create<JarStore>()(
  persist(
    immer((set, get) => ({
      todayEntries: [],
      history: {},

      // ── Selectors ────────────────────────────────────────────────────────

      todayCount: () => get().todayEntries.length,

      getRecord: (date) => get().history[date] ?? null,

      historyDates: () => sortedDateKeys(get().history),

      // ── Mutations ────────────────────────────────────────────────────────

      addEntry: (taskId, title) => {
        const entry: JarEntry = {
          taskId,
          title,
          completedAt: new Date().toISOString(),
          shape: nextShape(get().todayEntries),
        };

        set((state) => {
          state.todayEntries.push(entry);
        });

        return entry;
      },

      archiveTodayToHistory: () => {
        const yesterday = (() => {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          return d.toISOString().slice(0, 10);
        })();

        set((state) => {
          const entries = state.todayEntries;

          if (entries.length > 0) {
            // Archive under yesterday's date key — that's the day they were earned
            state.history[yesterday] = {
              date: yesterday,
              entries: [...entries],
              totalCompleted: entries.length,
            };
          }

          state.todayEntries = [];
        });
      },
    })),
    {
      name: STORAGE_KEYS.JAR_TODAY,
      storage: zustandStorage,
      // Persist history separately to avoid bloating the main key
      partialize: (state) => ({
        todayEntries: state.todayEntries,
        history: state.history,
      }),
    }
  )
);
