export type TaskStatus = "active" | "completed" | "postponed";
export type Priority = "low" | "medium" | "high";
export type ParticleShape = "star" | "heart" | "cloud" | "sparkle";
export type JarDesign = "star-jar" | "moon-basket" | "dream-bottle";

export interface Task {
  id: string;
  title: string;
  note?: string;
  category?: string;
  dueTime?: string; // ISO time string, time-only (HH:mm)
  priority: Priority;
  status: TaskStatus;
  createdAt: string; // ISO datetime
  completedAt?: string; // ISO datetime — set when status → completed
  date: string; // YYYY-MM-DD — which day this task belongs to
}

export interface JarEntry {
  taskId: string;
  title: string;
  completedAt: string; // ISO datetime
  shape: ParticleShape;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  entries: JarEntry[];
  totalCompleted: number;
}

export interface ThemeColors {
  background: string;
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
  notificationsEnabled: boolean;
  reminderTime?: string; // HH:mm
  dailyEncouragementEnabled: boolean;
}
