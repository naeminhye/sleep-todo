import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid/non-secure";

import type { Task, Priority } from "../types";
import { storage, STORAGE_KEYS } from "../lib/storage";
import { todayKey } from "../lib/dateUtils";

// ─── Zustand storage adapter for MMKV/localStorage ───────────────────────────

const zustandStorage = createJSONStorage(() => ({
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateTaskInput = Pick<Task, "title"> &
  Partial<Pick<Task, "note" | "category" | "dueTime" | "priority">>;

interface TaskStore {
  tasks: Task[];

  // ── Selectors ──
  todayTasks: () => Task[];
  upcomingTasks: () => Task[]; // active tasks dated after today
  completedTodayCount: () => number;

  // ── Mutations ──
  addTask: (input: CreateTaskInput) => Task;
  updateTask: (
    id: string,
    patch: Partial<
      Pick<Task, "title" | "note" | "category" | "dueTime" | "priority">
    >
  ) => void;
  completeTask: (id: string) => Task | null; // returns completed task for jar store
  postponeTask: (id: string) => void;
  reactivateTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // ── Daily reset ──
  // Moves all non-completed tasks from previous days to today.
  // Called from root layout on app foreground.
  carryOverIncompleteTasks: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTaskStore = create<TaskStore>()(
  persist(
    immer((set, get) => ({
      tasks: [],

      // ── Selectors ────────────────────────────────────────────────────────

      todayTasks: () => {
        const today = todayKey();
        return get().tasks.filter(
          (t) => t.date === today && t.status !== "completed"
        );
      },

      upcomingTasks: () => {
        const today = todayKey();
        return get().tasks.filter(
          (t) => t.date > today && t.status === "active"
        );
      },

      completedTodayCount: () => {
        const today = todayKey();
        return get().tasks.filter((t) =>
          t.status === "completed" && t.completedAt
            ? t.completedAt.startsWith(today)
            : false
        ).length;
      },

      // ── Mutations ────────────────────────────────────────────────────────

      addTask: (input) => {
        const task: Task = {
          id: nanoid(),
          title: input.title.trim(),
          note: input.note,
          category: input.category,
          dueTime: input.dueTime,
          priority: input.priority ?? "medium",
          status: "active",
          createdAt: new Date().toISOString(),
          date: todayKey(),
        };

        set((state) => {
          state.tasks.push(task);
        });

        return task;
      },

      updateTask: (id, patch) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return;
          if (patch.title !== undefined) task.title = patch.title.trim();
          if (patch.note !== undefined) task.note = patch.note;
          if (patch.category !== undefined) task.category = patch.category;
          if (patch.dueTime !== undefined) task.dueTime = patch.dueTime;
          if (patch.priority !== undefined) task.priority = patch.priority;
        });
      },

      completeTask: (id) => {
        let completed: Task | null = null;

        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task || task.status === "completed") return;
          task.status = "completed";
          task.completedAt = new Date().toISOString();
          completed = { ...task };
        });

        return completed;
      },

      postponeTask: (id) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return;
          task.status = "postponed";
        });
      },

      reactivateTask: (id) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return;
          task.status = "active";
          task.date = todayKey(); // bring back to today
        });
      },

      deleteTask: (id) => {
        set((state) => {
          state.tasks = state.tasks.filter((t) => t.id !== id);
        });
      },

      // ── Daily reset ──────────────────────────────────────────────────────

      carryOverIncompleteTasks: () => {
        const today = todayKey();

        set((state) => {
          state.tasks.forEach((task) => {
            if (task.date < today && task.status !== "completed") {
              // Move to today rather than losing them
              task.date = today;
              // Postponed tasks come back as active so user sees them
              if (task.status === "postponed") {
                task.status = "active";
              }
            }
          });
        });
      },
    })),
    {
      name: STORAGE_KEYS.TASKS,
      storage: zustandStorage,
    }
  )
);
