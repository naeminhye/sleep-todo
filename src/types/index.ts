export type TaskWeight = "tiny" | "medium" | "big";
export type TaskSchedule = "today" | "tomorrow" | "someday";
export type TaskStatus = "active" | "completed" | "postponed";
export type ParticleShape = "star" | "heart" | "cloud" | "moon";
export type JarDesign = "star-jar" | "moon-basket" | "dream-bottle";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  note?: string;
  category?: string;
  dueTime?: string;
  weight: TaskWeight;
  schedule: TaskSchedule;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  date: string; // YYYY-MM-DD
}

export interface JarEntry {
  taskId: string;
  title: string;
  completedAt: string;
  shape: ParticleShape;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  entries: JarEntry[];
  totalCompleted: number;
}

export interface ThemeColors {
  background: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primaryMuted: string;
  accent: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  taskCard: string;
  taskCardBorder: string;
  jarBackground: string;
  tabBar: string;
  tabBarBorder: string;
  done: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  jarDesign: JarDesign;
  particleShape: ParticleShape;
  dark: boolean;
}

export interface AppSettings {
  userName: string;
  notificationsEnabled: boolean;
  reminderTime: string;
  dailyEncouragementEnabled: boolean;
  collectibleShape: ParticleShape;
  darkMode: boolean;
  hapticFeedback: boolean;
  showStreaks: boolean;
  onboardingComplete: boolean;
}
