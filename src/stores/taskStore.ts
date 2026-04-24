import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid/non-secure";

import type { Task, TaskWeight, TaskSchedule } from "../types";
import { storage, STORAGE_KEYS } from "../lib/storage";
import { todayKey, tomorrowKey } from "../lib/dateUtils";

const zustandStorage = createJSONStorage(() => ({
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
}));

export type CreateTaskInput = Pick<Task, "title"> &
  Partial<Pick<Task, "note" | "category" | "dueTime" | "weight" | "schedule">>;

interface TaskStore {
  tasks: Task[];

  todayTasks: () => Task[];
  todayActive: () => Task[];
  todayDone: () => Task[];
  upcomingTasks: () => Task[];
  completedTodayCount: () => number;

  addTask: (input: CreateTaskInput) => Task;
  updateTask: (
    id: string,
    patch: Partial<
      Pick<
        Task,
        "title" | "note" | "category" | "dueTime" | "weight" | "schedule"
      >
    >
  ) => void;
  completeTask: (id: string) => Task | null;
  postponeTask: (id: string) => void;
  reactivateTask: (id: string) => void;
  deleteTask: (id: string) => void;
  carryOverIncompleteTasks: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    immer((set, get) => ({
      tasks: [],

      todayTasks: () => {
        const today = todayKey();
        return get().tasks.filter((t) => t.date === today);
      },

      todayActive: () => {
        const today = todayKey();
        return get().tasks.filter(
          (t) => t.date === today && t.status === "active"
        );
      },

      todayDone: () => {
        const today = todayKey();
        return get().tasks.filter(
          (t) => t.date === today && t.status === "completed"
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
        return get().tasks.filter(
          (t) => t.status === "completed" && t.completedAt?.startsWith(today)
        ).length;
      },

      addTask: (input) => {
        const schedule = input.schedule ?? "today";
        const date =
          schedule === "tomorrow"
            ? tomorrowKey()
            : schedule === "someday"
            ? "9999-12-31"
            : todayKey();

        const task: Task = {
          id: nanoid(),
          title: input.title.trim(),
          note: input.note,
          category: input.category,
          dueTime: input.dueTime,
          weight: input.weight ?? "medium",
          schedule,
          status: "active",
          createdAt: new Date().toISOString(),
          date,
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
          if (patch.weight !== undefined) task.weight = patch.weight;
          if (patch.schedule !== undefined) task.schedule = patch.schedule;
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
          task.date = todayKey();
        });
      },

      deleteTask: (id) => {
        set((state) => {
          state.tasks = state.tasks.filter((t) => t.id !== id);
        });
      },

      carryOverIncompleteTasks: () => {
        const today = todayKey();
        set((state) => {
          state.tasks.forEach((task) => {
            if (task.date < today && task.status !== "completed") {
              task.date = today;
              if (task.status === "postponed") task.status = "active";
            }
          });
        });
      },
    })),
    { name: STORAGE_KEYS.TASKS, storage: zustandStorage }
  )
);
