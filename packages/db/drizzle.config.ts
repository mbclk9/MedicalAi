// Dosya: drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import path from "path";
import fs from "fs"; // fs modülünü import ettik

// Load environment variables from the root .env file
config({ path: "../../.env" });

const DATABASE_URL = process.env.DATABASE_URL;

console.log("🔍 Drizzle Config Debug:");
console.log("- Working Directory:", process.cwd());
console.log("- .env file exists (from fs):", fs.existsSync(path.resolve(process.cwd(), '.env'))); // fs ile kontrol
console.log("- DATABASE_URL loaded (from process.env):", !!process.env.DATABASE_URL);
console.log("- Using DATABASE_URL:", DATABASE_URL?.replace(/:[^@]*@/, ':***@') || 'Not set'); // Hide password

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the .env file");
}

export default defineConfig({
  out: "./migrations",
  schema: "./schema.ts",
  dialect: "postgresql", // PostgreSQL dialect
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
});