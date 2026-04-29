"use client";

import type { ScheduleInput } from "@db/user-schemas";

import Icon from "@shared/ui/Icon";

import { secondsToTimeLabel } from "../lib/schedule";

export type WeekdayScheduleDisplay = {
  weekdaysStart: number;
  weekdaysEnd: number;
  lunchStart?: number;
  lunchEnd?: number;
};

function buildScheduleRows(s: WeekdayScheduleDisplay) {
  const dayStart = secondsToTimeLabel(s.weekdaysStart);
  const dayEnd = secondsToTimeLabel(s.weekdaysEnd);
  const range = `${dayStart} до ${dayEnd}`;
  const rows: { key: string; left: string; right: string }[] = [
    { key: "mon-thu", left: "Пн–Чт", right: range },
    { key: "fri", left: "Пт", right: range },
  ];
  if (s.lunchStart !== undefined && s.lunchEnd !== undefined) {
    rows.push({
      key: "lunch",
      left: "Обед",
      right: `${secondsToTimeLabel(s.lunchStart)} до ${secondsToTimeLabel(s.lunchEnd)}`,
    });
  }
  return rows;
}

function ScheduleRows({
  rows,
}: {
  rows: { key: string; left: string; right: string }[];
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 text-l leading-[1.4]">
      {rows.map((row) => (
        <div key={row.key} className="flex w-full items-center gap-5">
          <span className="w-20 shrink-0 text-symb-secondary">{row.left}</span>
          <span className="whitespace-nowrap text-symb-primary">{row.right}</span>
        </div>
      ))}
    </div>
  );
}

export function WorkScheduleReadonlyCard({
  weekdaysStart,
  weekdaysEnd,
  lunchStart,
  lunchEnd,
}: WeekdayScheduleDisplay) {
  const rows = buildScheduleRows({
    weekdaysStart,
    weekdaysEnd,
    lunchStart,
    lunchEnd,
  });
  return (
    <div className="rounded-s bg-background-med py-3 pl-4 pr-3 text-left">
      <ScheduleRows rows={rows} />
    </div>
  );
}

type Props = {
  schedule: ScheduleInput;
  onEdit: () => void;
};

export default function WorkScheduleSummary({ schedule, onEdit }: Props) {
  const rows = buildScheduleRows({
    weekdaysStart: schedule.weekdaysStart,
    weekdaysEnd: schedule.weekdaysEnd,
    lunchStart: schedule.lunchStart,
    lunchEnd: schedule.lunchEnd,
  });

  return (
    <button
      type="button"
      aria-label="Изменить график работы"
      onClick={onEdit}
      className="group flex w-full items-start justify-between gap-3 rounded-s bg-background-med py-3 pl-4 pr-3 text-left transition-colors hover:brightness-[0.99]"
    >
      <ScheduleRows rows={rows} />
      <span className="inline-flex shrink-0 rounded-s bg-background-none p-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
        <Icon name="chevron_forward" size={20} className="text-symb-secondary" />
      </span>
    </button>
  );
}
