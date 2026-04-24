export function todayKey(): string {
  return formatDateKey(new Date());
}

export function tomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateKey(d);
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function needsDailyReset(lastOpenedDate: string | null): boolean {
  if (!lastOpenedDate) return false;
  return lastOpenedDate < todayKey();
}

export function friendlyDateLabel(dateKey: string): string {
  const today = todayKey();
  const yesterday = formatDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  if (dateKey === today) return "Today";
  if (dateKey === yesterday) return "Yesterday";
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function friendlyDayOfWeek(): string {
  return new Date()
    .toLocaleDateString(undefined, { weekday: "long" })
    .toLowerCase();
}

export function friendlyMonthDay(): string {
  return new Date()
    .toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
    .toLowerCase();
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isToday(iso: string): boolean {
  return formatDateKey(new Date(iso)) === todayKey();
}

export function sortedDateKeys(record: Record<string, unknown>): string[] {
  return Object.keys(record).sort((a, b) => (a > b ? -1 : 1));
}

export function getMonthKey(dateKey: string): string {
  return dateKey.slice(0, 7); // YYYY-MM
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}
