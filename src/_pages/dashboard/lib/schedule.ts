import type { ScheduleInput } from "@db/user-schemas";

export function secondsToTimeLabel(seconds: number): string {
  const s = Math.max(0, Math.min(86400, seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeLabelToSeconds(label: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(label.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 3600 + min * 60;
}

export function defaultWeekdaySchedule(): ScheduleInput {
  return {
    weekdaysStart: 8 * 3600,
    weekdaysEnd: 17 * 3600,
    allowOffdayCallsWeekdays: false,
  };
}
