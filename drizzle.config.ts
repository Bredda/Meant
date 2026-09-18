import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: "./.data/dev.db",
  },
  dialect: "sqlite",
  out: "./src/server/db/migrations",
  schema: "./src/server/db/schema.ts",
});
