import type { Position } from "@db/position";
import type { UserProfileEntity } from "@db/types";

import { normalizePhoneDigits } from "./phone";

export type ProfileForm = {
  surname: string;
  name: string;
  middlename: string;
  position: Position;
  weekdaysStart: number;
  weekdaysEnd: number;
  allowOffdayCallsWeekdays: boolean;
  lunchStart?: number;
  lunchEnd?: number;
  allowLunchCalls?: boolean;
  phoneDigits: string;
};

export function profileToForm(p: UserProfileEntity): ProfileForm {
  const d = normalizePhoneDigits(p.phone.replace(/\D/g, ""));
  return {
    surname: p.surname,
    name: p.name,
    middlename: p.middlename,
    position: p.position,
    weekdaysStart: p.schedule.weekdaysStart,
    weekdaysEnd: p.schedule.weekdaysEnd,
    allowOffdayCallsWeekdays: p.schedule.allowOffdayCallsWeekdays,
    lunchStart: p.schedule.lunchStart,
    lunchEnd: p.schedule.lunchEnd,
    allowLunchCalls: p.schedule.allowLunchCalls,
    phoneDigits: d,
  };
}

export function formToSchedulePayload(f: ProfileForm) {
  const base = {
    weekdaysStart: f.weekdaysStart,
    weekdaysEnd: f.weekdaysEnd,
    allowOffdayCallsWeekdays: f.allowOffdayCallsWeekdays,
  };
  if (
    f.lunchStart !== undefined &&
    f.lunchEnd !== undefined &&
    f.allowLunchCalls !== undefined
  ) {
    return {
      ...base,
      lunchStart: f.lunchStart,
      lunchEnd: f.lunchEnd,
      allowLunchCalls: f.allowLunchCalls,
    };
  }
  return base;
}
