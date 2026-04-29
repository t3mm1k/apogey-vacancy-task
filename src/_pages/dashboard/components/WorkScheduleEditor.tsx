"use client";

import { useEffect, useMemo, useState } from "react";

import type { ScheduleInput } from "@db/user-schemas";

import Button from "@shared/ui/Button";
import DropdownSelect, {
  type DropdownOption,
} from "@shared/ui/DropdownSelect";
import Icon from "@shared/ui/Icon";
import { ModalChromeFooter, ModalChromeHeader } from "@shared/ui/ModalChrome";

import { secondsToTimeLabel } from "../lib/schedule";

const CALL_POLICY_OPTIONS = [
  { value: "false", label: "Не беспокоить" },
  { value: "true", label: "Можно звонить" },
];

const TIME_STEP_SEC = 15 * 60;

const TIME_SLOT_OPTIONS: DropdownOption[] = (() => {
  const o: DropdownOption[] = [];
  for (let s = 0; s < 86400; s += TIME_STEP_SEC) {
    o.push({ value: String(s), label: secondsToTimeLabel(s) });
  }
  return o;
})();

const TIME_EMPTY: DropdownOption = { value: "", label: "—" };

function timeOptionsForValue(
  value: number | null,
  allowEmpty: boolean,
): DropdownOption[] {
  const slots = allowEmpty
    ? ([TIME_EMPTY, ...TIME_SLOT_OPTIONS] as DropdownOption[])
    : TIME_SLOT_OPTIONS.slice();
  if (value === null) return slots;
  const v = String(value);
  if (slots.some((o) => o.value === v)) return slots;
  return [...slots, { value: v, label: secondsToTimeLabel(value) }].sort(
    (a, b) => {
      if (a.value === "") return -1;
      if (b.value === "") return 1;
      return Number(a.value) - Number(b.value);
    },
  );
}

type ScheduleEditorState = {
  weekdaysStart: number | null;
  weekdaysEnd: number | null;
  allowOffdayCallsWeekdays: boolean;
  lunchStart?: number;
  lunchEnd?: number;
  allowLunchCalls?: boolean;
};

function fromInitial(initial: ScheduleInput | null): ScheduleEditorState {
  if (!initial) {
    return {
      weekdaysStart: null,
      weekdaysEnd: null,
      allowOffdayCallsWeekdays: false,
    };
  }
  return {
    weekdaysStart: initial.weekdaysStart,
    weekdaysEnd: initial.weekdaysEnd,
    allowOffdayCallsWeekdays: initial.allowOffdayCallsWeekdays,
    lunchStart: initial.lunchStart,
    lunchEnd: initial.lunchEnd,
    allowLunchCalls: initial.allowLunchCalls,
  };
}

function stripLunch(s: ScheduleEditorState): ScheduleEditorState {
  return {
    weekdaysStart: s.weekdaysStart,
    weekdaysEnd: s.weekdaysEnd,
    allowOffdayCallsWeekdays: s.allowOffdayCallsWeekdays,
  };
}

function toSchedulePayload(s: ScheduleEditorState): ScheduleInput {
  const base = {
    weekdaysStart: s.weekdaysStart!,
    weekdaysEnd: s.weekdaysEnd!,
    allowOffdayCallsWeekdays: s.allowOffdayCallsWeekdays,
  };
  const hasLunch =
    s.lunchStart !== undefined &&
    s.lunchEnd !== undefined &&
    s.allowLunchCalls !== undefined;
  if (hasLunch) {
    return {
      ...base,
      lunchStart: s.lunchStart,
      lunchEnd: s.lunchEnd,
      allowLunchCalls: s.allowLunchCalls,
    };
  }
  return base;
}

function TimeCell({
  value,
  onChange,
  id,
  ariaLabel,
  allowEmpty = true,
}: {
  value: number | null;
  onChange: (sec: number | null) => void;
  id?: string;
  ariaLabel: string;
  allowEmpty?: boolean;
}) {
  const options = useMemo(
    () => timeOptionsForValue(value, allowEmpty),
    [value, allowEmpty],
  );

  return (
    <DropdownSelect
      id={id}
      layout="time"
      aria-label={ariaLabel}
      className="w-[72px] shrink-0"
      value={value === null ? "" : String(value)}
      placeholder="—"
      onChange={(v) => onChange(v === "" ? null : Number(v))}
      options={options}
    />
  );
}

export default function WorkScheduleEditor({
  initial,
  onSave,
  onBack,
}: {
  initial: ScheduleInput | null;
  onSave: (s: ScheduleInput) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<ScheduleEditorState>(() =>
    fromInitial(initial),
  );

  useEffect(() => {
    setDraft(fromInitial(initial));
  }, [initial]);

  const hasLunch =
    draft.lunchStart !== undefined &&
    draft.lunchEnd !== undefined &&
    draft.allowLunchCalls !== undefined;

  const validateAndSave = () => {
    if (draft.weekdaysStart === null || draft.weekdaysEnd === null) {
      window.alert("Укажите время начала и окончания рабочего дня");
      return;
    }
    if (draft.weekdaysStart >= draft.weekdaysEnd) {
      window.alert("Время окончания рабочего дня должно быть позже начала");
      return;
    }
    if (hasLunch) {
      const ls = draft.lunchStart!;
      const le = draft.lunchEnd!;
      if (ls >= le) {
        window.alert("Время окончания обеда должно быть позже начала");
        return;
      }
      if (ls < draft.weekdaysStart! || le > draft.weekdaysEnd!) {
        window.alert("Обед должен укладываться в рабочий день");
        return;
      }
    }
    onSave(toSchedulePayload(hasLunch ? draft : stripLunch(draft)));
  };

  const addLunch = () => {
    setDraft((s) => ({
      ...s,
      lunchStart: 12 * 3600,
      lunchEnd: 13 * 3600,
      allowLunchCalls: false,
    }));
  };

  const removeLunch = () => {
    setDraft((s) => stripLunch(s));
  };

  return (
    <>
      <ModalChromeHeader title="График работы" onBack={onBack} />

      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-8 pb-24 pt-4">
        <p className="text-l text-symb-primary">
          Укажите время, в которое специалист застанет вас на работе (по вашему
          местному времени)
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex w-[156px] shrink-0 flex-col justify-center">
              <span className="text-l text-symb-primary">Пн–Пт</span>
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <TimeCell
                id="schedule-day-start"
                ariaLabel="Начало рабочего дня, Пн–Пт"
                value={draft.weekdaysStart}
                onChange={(weekdaysStart) =>
                  setDraft((s) => ({ ...s, weekdaysStart }))
                }
              />
              <span className="text-l text-symb-primary">-</span>
              <TimeCell
                id="schedule-day-end"
                ariaLabel="Конец рабочего дня, Пн–Пт"
                value={draft.weekdaysEnd}
                onChange={(weekdaysEnd) =>
                  setDraft((s) => ({ ...s, weekdaysEnd }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[156px] shrink-0 text-l text-symb-secondary">
              В нерабочее
              <br />
              время
            </div>
            <div className="min-w-0 flex-1">
              <DropdownSelect
                id="schedule-offhours-policy"
                aria-label="Звонки в нерабочее время"
                tone="filled"
                value={String(draft.allowOffdayCallsWeekdays)}
                onChange={(v) =>
                  setDraft((s) => ({
                    ...s,
                    allowOffdayCallsWeekdays: v === "true",
                  }))
                }
                options={CALL_POLICY_OPTIONS}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!hasLunch ? (
            <div className="flex items-center gap-3">
              <span className="w-[156px] shrink-0 text-l text-symb-primary">
                Обед
              </span>
              <Button
                variant="tertiary"
                size="M"
                type="button"
                className="size-10 shrink-0 p-0 [&_span.icon]:text-xl"
                aria-label="Добавить обед"
                onClick={addLunch}
              >
                <Icon name="add" size={20} />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="flex w-[156px] shrink-0 items-center py-2">
                  <span className="text-l text-symb-primary">Обед</span>
                </div>
                <div className="flex items-center gap-2">
                  <TimeCell
                    allowEmpty={false}
                    id="schedule-lunch-start"
                    ariaLabel="Начало обеда"
                    value={draft.lunchStart ?? null}
                    onChange={(lunchStart) =>
                      setDraft((s) => ({
                        ...s,
                        lunchStart: lunchStart ?? s.lunchStart!,
                      }))
                    }
                  />
                  <span className="text-l text-symb-primary">-</span>
                  <TimeCell
                    allowEmpty={false}
                    id="schedule-lunch-end"
                    ariaLabel="Конец обеда"
                    value={draft.lunchEnd ?? null}
                    onChange={(lunchEnd) =>
                      setDraft((s) => ({
                        ...s,
                        lunchEnd: lunchEnd ?? s.lunchEnd!,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-[156px] shrink-0 text-l text-symb-secondary">
                  В обеденное
                  <br />
                  время
                </div>
                <div className="min-w-0 flex-1">
                  <DropdownSelect
                    id="schedule-lunch-policy"
                    aria-label="Звонки в обеденное время"
                    tone="filled"
                    value={String(draft.allowLunchCalls!)}
                    onChange={(v) =>
                      setDraft((s) => ({
                        ...s,
                        allowLunchCalls: v === "true",
                      }))
                    }
                    options={CALL_POLICY_OPTIONS}
                  />
                </div>
              </div>

              <div className="flex pl-[168px]">
                <Button
                  variant="tertiary"
                  size="M"
                  type="button"
                  className="px-4 py-2.5"
                  aria-label="Удалить обед"
                  onClick={removeLunch}
                >
                  <Icon name="delete" size={20} />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <ModalChromeFooter>
        <Button variant="primary" size="M" type="button" onClick={validateAndSave}>
          Сохранить
        </Button>
      </ModalChromeFooter>
    </>
  );
}
