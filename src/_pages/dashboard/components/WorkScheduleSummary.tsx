"use client";

import type { ScheduleInput } from "@db/user-schemas";

import Icon from "@shared/ui/Icon";

import { secondsToTimeLabel } from "../lib/schedule";

type Props = {
  schedule: ScheduleInput;
  onEdit: () => void;
};

export default function WorkScheduleSummary({ schedule, onEdit }: Props) {
  const dayStart = secondsToTimeLabel(schedule.weekdaysStart);
  const dayEnd = secondsToTimeLabel(schedule.weekdaysEnd);
  const rows: { key: string; left: string; right: string }[] = [
    {
      key: "weekdays",
      left: "Пн–Пт",
      right: `${dayStart} до ${dayEnd}`,
    },
  ];

  if (
    schedule.lunchStart !== undefined &&
    schedule.lunchEnd !== undefined
  ) {
    rows.push({
      key: "lunch",
      left: "Обед",
      right: `${secondsToTimeLabel(schedule.lunchStart)} до ${secondsToTimeLabel(schedule.lunchEnd)}`,
    });
  }

  return (
    <button
      type="button"
      aria-label="Изменить график работы"
      onClick={onEdit}
      className="group flex w-full items-start justify-between gap-3 rounded-s bg-background-med py-3 pl-4 pr-3 text-left transition-colors hover:brightness-[0.99]"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 text-l leading-[1.4]">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex w-full items-center gap-5"
          >
            <span className="w-20 shrink-0 text-symb-secondary">{row.left}</span>
            <span className="whitespace-nowrap text-symb-primary">{row.right}</span>
          </div>
        ))}
      </div>
      <span className="inline-flex shrink-0 rounded-s bg-background-none p-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
        <Icon name="chevron_forward" size={20} className="text-symb-secondary" />
      </span>
    </button>
  );
}
