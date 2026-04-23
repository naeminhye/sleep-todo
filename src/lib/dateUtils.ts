/**
 * Date utilities used across stores and screens.
 * All functions deal in YYYY-MM-DD strings for date keys
 * and ISO datetime strings for timestamps.
 */

/**
 * Returns today's date as a YYYY-MM-DD string in local time.
 */
export function todayKey(): string {
  const d = new Date();
  return formatDateKey(d);
}

/**
 * Formats a Date object to YYYY-MM-DD in local time.
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parses a YYYY-MM-DD string to a Date object at midnight local time.
 */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns true if the stored date key is before today — meaning a daily
 * reset is required.
 */
export function needsDailyReset(lastOpenedDate: string | null): boolean {
  if (!lastOpenedDate) return false; // first ever launch — no reset needed
  return lastOpenedDate < todayKey();
}

/**
 * Returns a human-readable label for a date key:
 * "Today", "Yesterday", or a formatted date string.
 */
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

/**
 * Formats an ISO datetime string to a short time label, e.g. "3:45 PM".
 */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Returns true if the given ISO datetime string is from today.
 */
export function isToday(iso: string): boolean {
  return formatDateKey(new Date(iso)) === todayKey();
}

/**
 * Returns sorted date keys (descending — most recent first)
 * from a record object keyed by YYYY-MM-DD.
 */
export function sortedDateKeys(record: Record<string, unknown>): string[] {
  return Object.keys(record).sort((a, b) => (a > b ? -1 : 1));
}
