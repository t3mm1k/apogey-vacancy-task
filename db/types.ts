import type { Position } from "./position";

export type UserEntity = {
  id: string;
  name: string;
  surname: string;
  middlename: string;
  phoneVerified: boolean;
};

export type ScheduleEntity = {
  weekdaysStart: number;
  weekdaysEnd: number;
  allowOffdayCallsWeekdays: boolean;
  lunchStart?: number;
  lunchEnd?: number;
  allowLunchCalls?: boolean;
};

export type UserProfileEntity = {
  id: string;
  name: string;
  surname: string;
  middlename: string;
  position: Position;
  phone: string;
  phoneVerified: boolean;
  schedule: ScheduleEntity;
};
