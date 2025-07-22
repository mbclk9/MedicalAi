import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from './schema';

// Vercel için optimize edilmiş veritabanı bağlantısı
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log("🔗 Initializing database connection for Vercel...");

// Neon veritabanı için optimize edilmiş pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Drizzle instance
export const db = drizzle(pool, { schema });

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