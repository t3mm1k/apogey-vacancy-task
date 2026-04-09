import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";
import type { Position } from "./position";

type GlobalWithDb = typeof globalThis & { __sqliteDb?: Database.Database };

function getGlobalDb(): Database.Database | undefined {
  return (globalThis as GlobalWithDb).__sqliteDb;
}

function setGlobalDb(db: Database.Database | undefined): void {
  (globalThis as GlobalWithDb).__sqliteDb = db;
}

export function closeDatabase(): void {
  const db = getGlobalDb();
  if (!db) {
    return;
  }
  try {
    db.close();
  } catch {
  } finally {
    setGlobalDb(undefined);
  }
}

export function getDb(): Database.Database {
  const db = getGlobalDb();
  if (!db) {
    throw new Error("Database not initialized (instrumentation register)");
  }
  return db;
}

type SeedUser = {
  id: string;
  name: string;
  surname: string;
  middlename: string;
  position: Position;
  phone: string;
  phoneVerified: boolean;
  schedule: {
    weekdaysStart: number;
    weekdaysEnd: number;
    allowOffdayCallsWeekdays: boolean;
    lunchStart?: number;
    lunchEnd?: number;
    allowLunchCalls?: boolean;
  };
};

type SeedFile = { users: SeedUser[] };

const DDL = `
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  middlename TEXT NOT NULL,
  position TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_verified INTEGER NOT NULL
);

CREATE TABLE schedules (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  weekdays_start INTEGER NOT NULL,
  weekdays_end INTEGER NOT NULL,
  allow_offday_calls_weekdays INTEGER NOT NULL,
  lunch_start INTEGER,
  lunch_end INTEGER,
  allow_lunch_calls INTEGER
);
`;

function createAndSeedDatabase(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  db.exec(DDL);

  const seedPath = join(process.cwd(), "db", "users-seed.json");
  const seed = JSON.parse(readFileSync(seedPath, "utf-8")) as SeedFile;

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, surname, middlename, position, phone, phone_verified)
    VALUES (@id, @name, @surname, @middlename, @position, @phone, @phone_verified)
  `);

  const insertSchedule = db.prepare(`
    INSERT INTO schedules (
      user_id, weekdays_start, weekdays_end, allow_offday_calls_weekdays,
      lunch_start, lunch_end, allow_lunch_calls
    ) VALUES (
      @user_id, @weekdays_start, @weekdays_end, @allow_offday_calls_weekdays,
      @lunch_start, @lunch_end, @allow_lunch_calls
    )
  `);

  const runSeed = db.transaction(() => {
    for (const u of seed.users) {
      const hasFullLunch =
        u.schedule.lunchStart !== undefined &&
        u.schedule.lunchEnd !== undefined &&
        u.schedule.allowLunchCalls !== undefined;

      insertUser.run({
        id: u.id,
        name: u.name,
        surname: u.surname,
        middlename: u.middlename,
        position: u.position,
        phone: u.phone,
        phone_verified: u.phoneVerified ? 1 : 0,
      });

      insertSchedule.run({
        user_id: u.id,
        weekdays_start: u.schedule.weekdaysStart,
        weekdays_end: u.schedule.weekdaysEnd,
        allow_offday_calls_weekdays: u.schedule.allowOffdayCallsWeekdays ? 1 : 0,
        lunch_start: hasFullLunch ? u.schedule.lunchStart! : null,
        lunch_end: hasFullLunch ? u.schedule.lunchEnd! : null,
        allow_lunch_calls: hasFullLunch ? (u.schedule.allowLunchCalls! ? 1 : 0) : null,
      });
    }
  });

  runSeed();
  return db;
}

export function initializeDatabase(): void {
  if (getGlobalDb()) return;
  setGlobalDb(createAndSeedDatabase());
}

export function reinitializeDatabase(): void {
  closeDatabase();
  setGlobalDb(createAndSeedDatabase());
}
