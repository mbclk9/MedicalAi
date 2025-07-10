import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Client } from 'pg';
import * as schema from './schema';

// Veritabanı bağlantı URL'si ortam değişkeninden alınmalıdır.
// Bu paketi kullanan uygulama (örn. backend) .env dosyasını yüklemekten sorumludur.
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ Veritabanı bağlantısı için DATABASE_URL ayarlanmalıdır.");
  // Uygulama başlangıcında bu hatayı yakalamak için bir hata fırlatmak daha iyidir.
  throw new Error("DATABASE_URL çevre değişkeni ayarlanmadı.");
}

// `pg` istemcisini oluştur
// SSL ayarı, localhost olmayan bağlantılar için genellikle gereklidir.
export const client = new Client({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Drizzle instance'ını oluştur ve dışa aktar
// Gerçek bağlantı ilk sorgu sırasında kurulur.
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