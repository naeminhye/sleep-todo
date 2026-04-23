/**
 * Daily encouragement messages shown at end of day or on the jar screen.
 * Split into pools by context so the tone fits the moment.
 */

const END_OF_DAY: string[] = [
  "You did enough today.",
  "Look how many stars you collected.",
  "Even small steps count.",
  "Rest now — you earned it.",
  "Every task you finished was a gift to yourself.",
  "Today's done. That's enough.",
  "You showed up. That matters.",
];

const TASK_WAITING: string[] = [
  "Your tiny tasks are waiting ✨",
  "Let's do one small thing together.",
  "A little progress is still progress.",
  "One star at a time.",
  "No rush — just one small step.",
];

const JAR_EMPTY: string[] = [
  "The jar is ready for today's stars.",
  "Each completed task becomes a little light.",
  "Let's fill it up, slowly.",
  "Start small — every star counts.",
];

const JAR_FILLING: string[] = [
  "Look at all you've done.",
  "The jar is getting full of good things.",
  "You're collecting moments of done.",
  "Each one of those was real effort.",
];

const JAR_FULL: string[] = [
  "The jar is overflowing with your effort.",
  "What a day.",
  "You didn't just do tasks — you filled the jar.",
  "Tomorrow starts fresh.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export type EncouragementContext =
  | "endOfDay"
  | "taskWaiting"
  | "jarEmpty"
  | "jarFilling"
  | "jarFull";

export function getEncouragement(context: EncouragementContext): string {
  switch (context) {
    case "endOfDay":
      return pickRandom(END_OF_DAY);
    case "taskWaiting":
      return pickRandom(TASK_WAITING);
    case "jarEmpty":
      return pickRandom(JAR_EMPTY);
    case "jarFilling":
      return pickRandom(JAR_FILLING);
    case "jarFull":
      return pickRandom(JAR_FULL);
  }
}

/**
 * Returns a contextual message based on how many tasks were completed today.
 */
export function getJarEncouragement(completedCount: number): string {
  if (completedCount === 0) return getEncouragement("jarEmpty");
  if (completedCount < 3) return getEncouragement("jarFilling");
  return getEncouragement("jarFull");
}
