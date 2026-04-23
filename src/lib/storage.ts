/**
 * Platform-safe storage abstraction.
 *
 * - Native (iOS/Android): react-native-mmkv — synchronous, fastest available
 * - Web: localStorage — synchronous on web, same API surface
 *
 * All consumers import from this file only. Never import MMKV directly.
 */

import { Platform } from "react-native";

interface Storage {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
  getAllKeys(): string[];
}

// ─── Native (MMKV) ──────────────────────────────────────────────────────────

function createNativeStorage(): Storage {
  // Lazy import so web bundler never tries to resolve react-native-mmkv
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require("react-native-mmkv");
  const mmkv = new MMKV({ id: "sleepy-todo" });

  return {
    getString: (key) => mmkv.getString(key),
    set: (key, value) => mmkv.set(key, value),
    delete: (key) => mmkv.delete(key),
    getAllKeys: () => mmkv.getAllKeys(),
  };
}

// ─── Web (localStorage) ──────────────────────────────────────────────────────

function createWebStorage(): Storage {
  const PREFIX = "sleepy-todo:";

  return {
    getString: (key) => localStorage.getItem(PREFIX + key) ?? undefined,
    set: (key, value) => localStorage.setItem(PREFIX + key, value),
    delete: (key) => localStorage.removeItem(PREFIX + key),
    getAllKeys: () =>
      Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
        .filter((k): k is string => k !== null && k.startsWith(PREFIX))
        .map((k) => k.slice(PREFIX.length)),
  };
}

// ─── Singleton ───────────────────────────────────────────────────────────────

export const storage: Storage =
  Platform.OS === "web" ? createWebStorage() : createNativeStorage();

// ─── Typed helpers ───────────────────────────────────────────────────────────

export function storageGet<T>(key: string): T | null {
  const raw = storage.getString(key);
  if (raw === undefined) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storageSet<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function storageDelete(key: string): void {
  storage.delete(key);
}

// ─── Storage keys ─────────────────────────────────────────────────────────────
// Centralised here to avoid key typos across the codebase.

export const STORAGE_KEYS = {
  TASKS: "tasks",
  JAR_TODAY: "jar:today",
  JAR_HISTORY: "jar:history",
  LAST_OPENED_DATE: "lastOpenedDate",
  ACTIVE_THEME_ID: "activeThemeId",
  SETTINGS: "settings",
} as const;
