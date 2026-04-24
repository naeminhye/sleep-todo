// Stores
export { useTaskStore } from "./stores/taskStore";
export { useJarStore } from "./stores/jarStore";
export { useThemeStore, THEMES, DEFAULT_THEME_ID } from "./stores/themeStore";
export { useSettingsStore } from "./stores/settingsStore";

// Theme
export { ThemeProvider, useTheme } from "./theme/ThemeContext";
export { useThemedStyles } from "./theme/useThemedStyles";
export { spacing, radius, typography, cardShadow, fonts } from "./theme/tokens";

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
  tomorrowKey,
  formatDateKey,
  parseDateKey,
  needsDailyReset,
  friendlyDateLabel,
  friendlyDayOfWeek,
  friendlyMonthDay,
  formatTime,
  isToday,
  sortedDateKeys,
  getMonthKey,
  getDaysInMonth,
  getFirstDayOfMonth,
} from "./lib/dateUtils";
export { useDailyReset } from "./lib/useDailyReset";
export { getEncouragement, getJarEncouragement } from "./lib/encouragement";
export { applyGlobalTextStyle } from "./lib/globalTextStyle";

// Types
export type {
  Task,
  TaskStatus,
  TaskWeight,
  TaskSchedule,
  JarEntry,
  DailyRecord,
  Theme,
  ThemeColors,
  ParticleShape,
  JarDesign,
  AppSettings,
} from "./types";
