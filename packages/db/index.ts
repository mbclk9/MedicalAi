import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Client } from 'pg';
import * as schema from './schema';

// Vercel için optimize edilmiş veritabanı bağlantısı
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log("🔗 Initializing database connection for Vercel...");

// Neon veritabanı için optimize edilmiş client
export const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Drizzle instance
export const db = drizzle(client, { schema });

// Kolay erişim için tüm şemaları dışa aktar
export * from './schema';

// Export all schema items individually
export const {
  doctors,
  patients,
  visits,
  medicalNotes,
  recordings,
  medicalTemplates,
  insertDoctorSchema,
  insertPatientSchema,
  insertVisitSchema,
  insertMedicalNoteSchema,
  insertRecordingSchema,
  insertTemplateSchema
} = schema;

export { sql }; 