import { closeDatabase, initializeDatabase } from "./db/sqlite";

export function registerInMemoryDatabase(): void {
  initializeDatabase();

  const shutdownDb = async () => {
    try {
      closeDatabase();
    } catch {
    }
  };

  process.on("SIGTERM", () => {
    void shutdownDb();
  });
  process.on("SIGINT", () => {
    void shutdownDb();
  });
}
