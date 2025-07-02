# 🪟 TıpScribe Windows Kurulum - TAM ÇÖZÜM

## ❌ Aldığınız Hata ve Çözümü

**Görüntüdeki Hata:**
```
'NODE_ENV' is not recognized as an internal or external command,
operable program or batch file.
```

**Sebep:** Windows Command Prompt'ta Linux/macOS environment variable syntax'ı çalışmıyor.

## ✅ ÇÖZÜM: 4 Farklı Yöntem

### 🎯 Yöntem 1: Windows Batch Script (EN KOLAY)

**Kullanım:**
```cmd
# Sadece çift tıkla
Windows-Baslat.bat
```

**Bu script:**
- Otomatik Node.js kontrolü yapar
- Dependencies kurar
- .env dosyası oluşturur  
- Windows uyumlu başlatma yapar

### 🎯 Yöntem 2: Cross-env ile

**Kurulum:**
```cmd
npm install cross-env
```

**Kullanım:**
```cmd
npx cross-env NODE_ENV=development tsx server/index.ts
```

### 🎯 Yöntem 3: PowerShell

**Kullanım:**
```powershell
$env:NODE_ENV = "development"
$env:PORT = "5000"
npx tsx server/index.ts
```

### 🎯 Yöntem 4: Node.js Starter Script

**Kullanım:**
```cmd
node start-development.js
```

## 📋 ADIM ADIM KURULUM (Windows)

### 1. Gerekli Yazılımları Kur

**Node.js 20+ (ZORUNLU):**
```cmd
# İndir: https://nodejs.org/en/download/
# Kurulumu doğrula:
node --version
# Çıktı: v20.x.x olmalı
```

**PostgreSQL 16 (ZORUNLU):**
```cmd
# İndir: https://www.postgresql.org/download/windows/
# Kurulumu doğrula:
psql --version
# Çıktı: PostgreSQL 16.x olmalı
```

### 2. Proje Dizini Hazırla

```cmd
# Proje klasörü oluştur
mkdir C:\TipScribe
cd C:\TipScribe

# Replit'ten dosyaları kopyala:
# - backend/ klasörü
# - client/ klasörü
# - frontend/ klasörü  
# - server/ klasörü
# - shared/ klasörü
# - package.json
# - tsconfig.json
# - vite.config.ts
# - drizzle.config.ts
# - .env.example
# - Windows-Baslat.bat
```

### 3. Dependencies Kur

```cmd
cd C:\TipScribe

# Bağımlılıkları kur
npm install

# Cross-env kur (Windows uyumluluk)
npm install cross-env

# Eğer hata alırsan:
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install
```

### 4. PostgreSQL Veritabanı Kur

```cmd
# PostgreSQL servisini başlat
net start postgresql-x64-16

# PostgreSQL'e bağlan
psql -U postgres

# Veritabanı oluştur:
CREATE DATABASE tipscribe_dev;
CREATE USER tipscribe_user WITH PASSWORD 'tipscribe_pass';
GRANT ALL PRIVILEGES ON DATABASE tipscribe_dev TO tipscribe_user;
ALTER USER tipscribe_user CREATEDB;
\q
```

### 5. Environment Variables (.env)

```cmd
# .env dosyası oluştur
copy .env.example .env

# Notepad ile düzenle
notepad .env
```

**.env içeriği:**
```env
DATABASE_URL=postgresql://tipscribe_user:tipscribe_pass@localhost:5432/tipscribe_dev
DEEPGRAM_API_KEY=your_deepgram_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
NODE_ENV=development
PORT=5000
```

### 6. Veritabanı Schema

```cmd
# Schema oluştur
npx drizzle-kit push

# Test verileri ekle
npx tsx server/scripts/seed.ts
```

### 7. Projeyi Başlat

**EN KOLAY: Batch Script**
```cmd
# Çift tıkla
Windows-Baslat.bat
```

**Manuel Başlatma:**
```cmd
npx cross-env NODE_ENV=development tsx server/index.ts
```

**PowerShell ile:**
```powershell
$env:NODE_ENV = "development"; npx tsx server/index.ts
```

## ✅ BAŞARILI ÇIKTI

Şunları görmeli:
```
============================================
 TipScribe - Turkiye Tibbi Sekreter Platform
============================================

[INFO] Node.js version: v20.x.x
[INFO] npm version: 10.x.x
[INFO] Starting TipScribe development server...
[INFO] Server will be available at: http://localhost:5000

[express] serving on port 5000
[vite] dev server running at http://localhost:5000
```

## 🌐 Test Adımları

1. **Browser'da aç:** http://localhost:5000
2. **API test:** http://localhost:5000/api/health
3. **Hasta ekleme testi yap**
4. **Ses kaydı testi yap**
5. **AI tıbbi not oluşturma testi yap**

## 🔧 Sorun Giderme

### Port Çakışması:
```cmd
# Port 5000'i kim kullanıyor?
netstat -ano | findstr :5000

# Process'i öldür
taskkill /PID [PID_NUMARASI] /F
```

### Node Modules Hatası:
```cmd
# Temiz kurulum
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install cross-env
npm install
```

### PostgreSQL Bağlantı Sorunu:
```cmd
# Servis kontrolü
sc query postgresql-x64-16

# Manuel başlatma
net start postgresql-x64-16
```

### TSX Bulunamıyor Hatası:
```cmd
# Global tsx kur
npm install -g tsx

# Proje içinde kur
npm install tsx --save-dev

# npx ile çalıştır
npx tsx server/index.ts
```

### API Key Hatası:
```cmd
# .env dosyasını kontrol et
type .env

# Gerçek API key'leri ekle:
# - Deepgram: https://deepgram.com/
# - Anthropic: https://console.anthropic.com/
# - OpenAI: https://platform.openai.com/
```

## 📞 Final Kontrol

Bu komutlar başarılı olmalı:
```cmd
node --version          # v20.x.x
npm --version           # 10.x.x
psql --version          # PostgreSQL 16.x
curl http://localhost:5000/api/health
```

**Browser'da çalışmalı:**
- http://localhost:5000 → TıpScribe arayüzü
- Hasta ekleme formu
- Ses kaydı butonu  
- AI not oluşturma

Bu rehberle Windows'ta %100 çalışacak!