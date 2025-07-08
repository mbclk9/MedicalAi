// Dosya: server/database/db.ts
// Lütfen bu kodu server/database/db.ts dosyanızın tamamıyla değiştirin.

// İthalatları güncelledik:
// @neondatabase/serverless ve ws yerine doğrudan 'pg' kullanıyoruz
import { Client } from 'pg'; // PostgreSQL bağlantısı için
import { drizzle } from 'drizzle-orm/node-postgres'; // Node.js için Drizzle adaptörü
import * as schema from "@shared/schema";
import { doctors } from "@shared/schema"; // testConnection ve seedData için Doctors şemasını import ettik
import dotenv from "dotenv";

// ===============================================
// Ortam Değişkenlerini Yükleme
// ===============================================
console.log("🔗 (db.ts) Attempting to load .env variables...");
// dotenv.config() çağrısını doğrudan bu dosyanın başında yapıyoruz.
// Ayrıca, uygulamanın ana giriş noktası olan server/index.ts dosyasında da olması gerektiğini unutmayın.
dotenv.config({ path: './.env' }); // Projenin kök dizinindeki .env dosyasını hedefle

// Eğer DATABASE_URL hala bulunamazsa, farklı yolları dene (fallback)
if (!process.env.DATABASE_URL) {
    console.warn("⚠️ (db.ts) DATABASE_URL not found in current process.env. Trying alternative paths...");
    const envPaths = ['../.env', '../../.env', './.env']; // Daha güvenli bir arama
    for (const envPath of envPaths) {
        try {
            // override: true, mevcut değişkenleri ezer, bu önemli olabilir.
            dotenv.config({ path: envPath, override: true });
            if (process.env.DATABASE_URL) {
                console.log(`✅ (db.ts) DATABASE_URL loaded from ${envPath}`);
                break;
            }
        } catch (e) {
            // Hata durumunda devam et
        }
    }
}

let DATABASE_URL_FINAL = process.env.DATABASE_URL;

// ===============================================
// Drizzle Veritabanı Bağlantısı (pg ile)
// ===============================================
let clientInstance: Client | null = null; // Doğrudan pg Client instance'ı
let db: any; // DrizzleClient<typeof schema> daha doğru tip olur

if (!DATABASE_URL_FINAL) {
  console.warn("⚠️ (db.ts) Final DATABASE_URL not found. Using mock database for development.");
  // Mock DB yapısı aynı kalır
  db = {
    select: () => ({
      from: () => ({
        where: () => ({ execute: () => [] }),
        limit: () => ({ execute: () => [] }),
        orderBy: () => ({ execute: () => [] }),
        execute: () => []
      })
    }),
    insert: () => ({
      values: () => ({
        returning: () => [{ id: 1 }],
        execute: () => ({ rowCount: 1 })
      })
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => [{ id: 1 }],
          execute: () => ({ rowCount: 1 })
        })
      })
    }),
    delete: () => ({
      where: () => ({ execute: () => ({ rowCount: 1 }) })
    })
  };
} else {
  console.log("🔗 (db.ts) Database connection details for Drizzle:");
  console.log(`   - URL configured: ${DATABASE_URL_FINAL ? 'Yes' : 'No'}`);
  console.log(`   - Host: ${DATABASE_URL_FINAL.includes('localhost') ? 'localhost' : 'external'}`);
  console.log(`   - Database: ${DATABASE_URL_FINAL.split('/').pop()?.split('?')[0] || 'unknown'}`);

  try {
    // pg Client instance'ını oluştur
    clientInstance = new Client({
      connectionString: DATABASE_URL_FINAL,
      // ssl: { rejectUnauthorized: false } // Lokal için genellikle gerekmez, problem olursa açılabilir
    });

    // Client'ı Drizzle ile kullanmadan önce manuel olarak bağlan
    // Bu, Drizzle'ın ilk sorgusunda otomatik bağlanmasını beklemek yerine
    // bağlantının gerçekten kurulup kurulmadığını garanti altına alır.
    clientInstance.connect().then(() => {
      console.log("✅ (db.ts) PostgreSQL client connected successfully.");
    }).catch((error) => {
      console.error("❌ (db.ts) PostgreSQL client connection failed:", error);
      throw error;
    });

    // Drizzle'ı pg Client instance'ı ile başlat
    db = drizzle(clientInstance, { schema });

    console.log("✅ (db.ts) Drizzle database client initialized with pg.");
  } catch (error) {
    console.error("❌ (db.ts) Drizzle database initialization failed:", error);
    // clientInstance bağlıysa, hata durumunda kapatmayı unutmayın
    if (clientInstance) {
        clientInstance.end();
    }
    throw error;
  }
}

// Export the database instances
export { db, clientInstance }; // clientInstance'ı da dışa aktarabiliriz

// ===============================================
// Drizzle ORM Bağlantı Test Fonksiyonu (Final Hali)
// ===============================================
export async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  let testPgClient: Client | undefined;

  try {
    if (!connectionString) {
      console.log("📝 (testConnection) DATABASE_URL environment variable not found. Cannot perform direct pg test.");
      return false;
    }

    console.log("🔗 (testConnection) Attempting direct PostgreSQL connection test with new Client instance...");
    testPgClient = new Client({
      connectionString: connectionString,
    });

    await testPgClient.connect(); // Bağlan
    const result = await testPgClient.query('SELECT 1 as test_column'); // Sorgula
    console.log("✅ (testConnection) Direct PostgreSQL connection test passed! Result:", result.rows);
    return true;
  } catch (error) {
    console.error("❌ (testConnection) Direct PostgreSQL connection test failed:");
    console.error("Details:", (error as Error).message);
    return false;
  } finally {
    if (testPgClient) {
      await testPgClient.end(); // Bağlantıyı kapat
    }
  }
}