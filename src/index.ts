// Stores
export { useTaskStore } from "./stores/taskStore";
export { useJarStore } from "./stores/jarStore";
export { useThemeStore, THEMES, DEFAULT_THEME_ID } from "./stores/themeStore";
export { useSettingsStore } from "./stores/settingsStore";

// Lib
export {
  storage,
  storageGet,
  storageSet,
  storageDelete,
  STORAGE_KEYS,
} from "./lib/storage";
export {
  todayKey,
  formatDateKey,
  parseDateKey,
  needsDailyReset,
  friendlyDateLabel,
  formatTime,
  isToday,
  sortedDateKeys,
} from "./lib/dateUtils";
export { useDailyReset } from "./lib/useDailyReset";
export { getEncouragement, getJarEncouragement } from "./lib/encouragement";

// Types
export type {
  Task,
  TaskStatus,
  Priority,
  JarEntry,
  DailyRecord,
  Theme,
  ThemeColors,
  ParticleShape,
  JarDesign,
  AppSettings,
} from "./types";
