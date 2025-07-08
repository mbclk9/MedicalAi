// Dosya: drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import path from "path";
import fs from "fs"; // fs modülünü import ettik

// .env dosyasını açıkça yükle
config({ path: path.resolve(process.cwd(), '.env') });

// DATABASE_URL'i kontrol et ve fallback sağla
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:Muhammet55.@localhost:5432/tipscribe_db";

console.log("🔍 Drizzle Config Debug:");
console.log("- Working Directory:", process.cwd());
console.log("- .env file exists (from fs):", fs.existsSync(path.resolve(process.cwd(), '.env'))); // fs ile kontrol
console.log("- DATABASE_URL loaded (from process.env):", !!process.env.DATABASE_URL);
console.log("- Using DATABASE_URL:", DATABASE_URL.replace(/:[^@]*@/, ':***@')); // Hide password

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Please ensure the database is provisioned and .env file exists.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql", // PostgreSQL dialect
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
});