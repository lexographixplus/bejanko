import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 no longer auto-loads .env for CLI commands, so do it explicitly.
// `override: false` keeps real environment variables (CI, Vercel) authoritative.
loadDotenv({ path: path.resolve(__dirname, ".env"), override: false });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
