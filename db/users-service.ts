import type { CreateUserBody, ScheduleInput, UpdateUserBody } from "./user-schemas";
import { getDb } from "./sqlite";
import type { Position } from "./position";
import type { ScheduleEntity, UserEntity, UserProfileEntity } from "./types";

type UserRow = {
  id: string;
  name: string;
  surname: string;
  middlename: string;
  position: string;
  phone: string;
  phone_verified: number;
};

type ScheduleRow = {
  user_id: string;
  weekdays_start: number;
  weekdays_end: number;
  allow_offday_calls_weekdays: number;
  lunch_start: number | null;
  lunch_end: number | null;
  allow_lunch_calls: number | null;
};

function rowToUserEntity(row: UserRow): UserEntity {
  return {
    id: row.id,
    name: row.name,
    surname: row.surname,
    middlename: row.middlename,
    phoneVerified: Boolean(row.phone_verified),
  };
}

function scheduleRowToEntity(row: ScheduleRow): ScheduleEntity {
  const base: ScheduleEntity = {
    weekdaysStart: row.weekdays_start,
    weekdaysEnd: row.weekdays_end,
    allowOffdayCallsWeekdays: Boolean(row.allow_offday_calls_weekdays),
  };
  if (
    row.lunch_start != null &&
    row.lunch_end != null &&
    row.allow_lunch_calls != null
  ) {
    base.lunchStart = row.lunch_start;
    base.lunchEnd = row.lunch_end;
    base.allowLunchCalls = Boolean(row.allow_lunch_calls);
  }
  return base;
}

function scheduleInputToDb(s: ScheduleInput) {
  const hasFullLunch =
    s.lunchStart !== undefined &&
    s.lunchEnd !== undefined &&
    s.allowLunchCalls !== undefined;
  return {
    weekdays_start: s.weekdaysStart,
    weekdays_end: s.weekdaysEnd,
    allow_offday_calls_weekdays: s.allowOffdayCallsWeekdays ? 1 : 0,
    lunch_start: hasFullLunch ? s.lunchStart! : null,
    lunch_end: hasFullLunch ? s.lunchEnd! : null,
    allow_lunch_calls: hasFullLunch ? (s.allowLunchCalls! ? 1 : 0) : null,
  };
}

const profileSelect = `
  SELECT
    u.id, u.name, u.surname, u.middlename, u.position, u.phone, u.phone_verified,
    s.weekdays_start, s.weekdays_end, s.allow_offday_calls_weekdays,
    s.lunch_start, s.lunch_end, s.allow_lunch_calls
  FROM users u
  INNER JOIN schedules s ON s.user_id = u.id
`;

function mapProfileRow(row: UserRow & ScheduleRow): UserProfileEntity {
  return {
    id: row.id,
    name: row.name,
    surname: row.surname,
    middlename: row.middlename,
    position: row.position as Position,
    phone: row.phone,
    phoneVerified: Boolean(row.phone_verified),
    schedule: scheduleRowToEntity({
      user_id: row.id,
      weekdays_start: row.weekdays_start,
      weekdays_end: row.weekdays_end,
      allow_offday_calls_weekdays: row.allow_offday_calls_weekdays,
      lunch_start: row.lunch_start,
      lunch_end: row.lunch_end,
      allow_lunch_calls: row.allow_lunch_calls,
    }),
  };
}

export function listUsers(): UserEntity[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, name, surname, middlename, phone_verified FROM users ORDER BY name`,
    )
    .all() as UserRow[];
  return rows.map(rowToUserEntity);
}

export function getUserById(id: string): UserProfileEntity | null {
  const db = getDb();
  const row = db.prepare(`${profileSelect} WHERE u.id = ?`).get(id) as
    | (UserRow & ScheduleRow)
    | undefined;
  if (!row) return null;
  return mapProfileRow(row);
}

export function createUser(body: CreateUserBody): UserProfileEntity {
  const db = getDb();
  const id = crypto.randomUUID();
  const phone = body.phone ?? "";
  const sched = scheduleInputToDb(body.schedule);

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO users (id, name, surname, middlename, position, phone, phone_verified)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
    ).run(
      id,
      body.name,
      body.surname,
      body.middlename,
      body.position,
      phone,
    );
    db.prepare(
      `INSERT INTO schedules (
        user_id, weekdays_start, weekdays_end, allow_offday_calls_weekdays,
        lunch_start, lunch_end, allow_lunch_calls
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      sched.weekdays_start,
      sched.weekdays_end,
      sched.allow_offday_calls_weekdays,
      sched.lunch_start,
      sched.lunch_end,
      sched.allow_lunch_calls,
    );
  });

  tx();
  return getUserById(id)!;
}

export function updateUser(
  id: string,
  body: UpdateUserBody,
): UserProfileEntity | null {
  const db = getDb();
  const exists = db.prepare(`SELECT 1 FROM users WHERE id = ?`).get(id);
  if (!exists) return null;

  const tx = db.transaction(() => {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (body.name !== undefined) {
      fields.push("name = ?");
      values.push(body.name);
    }
    if (body.surname !== undefined) {
      fields.push("surname = ?");
      values.push(body.surname);
    }
    if (body.middlename !== undefined) {
      fields.push("middlename = ?");
      values.push(body.middlename);
    }
    if (body.position !== undefined) {
      fields.push("position = ?");
      values.push(body.position);
    }

    if (fields.length > 0) {
      values.push(id);
      db.prepare(
        `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      ).run(...values);
    }

    if (body.schedule !== undefined) {
      const sched = scheduleInputToDb(body.schedule);
      db.prepare(
        `UPDATE schedules SET
          weekdays_start = ?,
          weekdays_end = ?,
          allow_offday_calls_weekdays = ?,
          lunch_start = ?,
          lunch_end = ?,
          allow_lunch_calls = ?
        WHERE user_id = ?`,
      ).run(
        sched.weekdays_start,
        sched.weekdays_end,
        sched.allow_offday_calls_weekdays,
        sched.lunch_start,
        sched.lunch_end,
        sched.allow_lunch_calls,
        id,
      );
    }
  });

  tx();
  return getUserById(id);
}

export function deleteUser(id: string): boolean {
  const db = getDb();
  const info = db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
  return info.changes > 0;
}

export function userExists(id: string): boolean {
  const db = getDb();
  return Boolean(db.prepare(`SELECT 1 FROM users WHERE id = ?`).get(id));
}

export function confirmPhoneChange(
  userId: string,
  phone: string,
  code: string,
):
  | { ok: true; profile: UserProfileEntity }
  | { ok: false; reason: "bad_code" | "not_found" } {
  const db = getDb();
  if (!userExists(userId)) {
    return { ok: false, reason: "not_found" };
  }
  if (code !== "1111") {
    return { ok: false, reason: "bad_code" };
  }
  db.prepare(
    `UPDATE users SET phone = ?, phone_verified = 1 WHERE id = ?`,
  ).run(phone, userId);
  return { ok: true, profile: getUserById(userId)! };
}
