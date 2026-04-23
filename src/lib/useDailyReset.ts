/**
 * useDailyReset — hook that runs the daily reset sequence when the app
 * comes to the foreground on a new day.
 *
 * Call this once from app/_layout.tsx. It handles:
 *   1. Detecting a date change via AppState + stored lastOpenedDate
 *   2. Archiving the previous day's jar to history
 *   3. Carrying over any incomplete tasks to today
 *   4. Updating the lastOpenedDate so it only runs once per day
 */

import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { storage, STORAGE_KEYS } from "./storage";
import { todayKey, needsDailyReset } from "./dateUtils";
import { useTaskStore } from "../stores/taskStore";
import { useJarStore } from "../stores/jarStore";

export function useDailyReset() {
  const carryOverIncompleteTasks = useTaskStore(
    (s) => s.carryOverIncompleteTasks
  );
  const archiveTodayToHistory = useJarStore((s) => s.archiveTodayToHistory);

  const appState = useRef(AppState.currentState);

  function runResetIfNeeded() {
    const stored = storage.getString(STORAGE_KEYS.LAST_OPENED_DATE) ?? null;

    if (needsDailyReset(stored)) {
      archiveTodayToHistory();
      carryOverIncompleteTasks();
    }

    // Always update — even on first launch or same-day opens
    storage.set(STORAGE_KEYS.LAST_OPENED_DATE, todayKey());
  }

  useEffect(() => {
    // Run on initial mount
    runResetIfNeeded();

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        // Trigger when coming back to foreground from background
        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          runResetIfNeeded();
        }
        appState.current = nextState;
      }
    );

    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
