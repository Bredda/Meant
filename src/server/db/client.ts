import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/node-sqlite";
import { migrate } from "drizzle-orm/node-sqlite/migrator";
import { app } from "electron";

function getMigrationsFolder() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "migrations")
    : path.join(process.cwd(), "src/server/db/migrations");
}

const sqlite = new DatabaseSync(path.join(app.getPath("userData"), "app.db"));

export const db = drizzle({ client: sqlite });

migrate(db, { migrationsFolder: getMigrationsFolder() });
