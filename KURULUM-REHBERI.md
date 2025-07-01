# TıpScribe Yerel Kurulum Rehberi

## 🚀 Hızlı Kurulum Komutları

### 1. Proje Dizini Oluşturma
```bash
# Windows (PowerShell)
mkdir C:\Users\$env:USERNAME\Projects\tipscribe
cd C:\Users\$env:USERNAME\Projects\tipscribe

# macOS/Linux
mkdir -p ~/Projects/tipscribe
cd ~/Projects/tipscribe
```

### 2. Proje Dosyalarını İndirme
Replit'ten projeyi export edin:
1. Replit Shell'de: `zip -r tipscribe-export.zip . -x "node_modules/*"`
2. Files panelinden zip dosyasını indirin
3. Yerel proje dizininize çıkarın

### 3. Bağımlılık Kurulumu
```bash
# Node modules kurulumu (yaklaşık 2-3 dakika)
npm install

# Kurulum dizinleri:
# Windows: C:\Users\[KullanıcıAdı]\Projects\tipscribe\node_modules\
# macOS/Linux: ~/Projects/tipscribe/node_modules/
```

### 4. PostgreSQL Veritabanı Kurulumu
```bash
# PostgreSQL'e bağlan
psql -U postgres

# Veritabanı oluştur
CREATE DATABASE tipscribe_dev;
CREATE USER tipscribe_user WITH PASSWORD 'tipscribe_pass';
GRANT ALL PRIVILEGES ON DATABASE tipscribe_dev TO tipscribe_user;
ALTER USER tipscribe_user CREATEDB;
\q
```

### 5. Environment Variables (.env)
```bash
# .env dosyası oluştur
cp .env.example .env
```

**.env dosyası içeriği:**
```env
# Database - Yerel PostgreSQL
DATABASE_URL="postgresql://tipscribe_user:tipscribe_pass@localhost:5432/tipscribe_dev"
PGHOST=localhost
PGPORT=5432
PGUSER=tipscribe_user
PGPASSWORD=tipscribe_pass
PGDATABASE=tipscribe_dev

# API Keys (Buraya gerçek key'lerinizi girin)
DEEPGRAM_API_KEY=your_deepgram_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here

# Development Config
NODE_ENV=development
PORT=5000
```

### 6. Veritabanı Schema Kurulumu
```bash
# Schema'yı veritabanına push et
npm run db:push

# Test verileri ekle (opsiyonel)
npm run seed
```

### 7. Projeyi Başlatma
```bash
# Development sunucu başlat
npm run dev

# Başarılı çıktı:
# [express] serving on port 5000
# [vite] dev server running at http://localhost:5000
```

### 8. Cursor IDE'de Açma
1. Cursor IDE'yi başlat
2. File → Open Folder
3. tipscribe proje dizinini seç
4. Terminal açıp `npm run dev` çalıştır

## 📋 API Key'leri Alma

### Deepgram (Ses-Metin Dönüştürme)
1. https://deepgram.com → Sign Up
2. Console → API Keys → Create New Key
3. Key'i kopyala → .env dosyasına yapıştır

### Anthropic Claude (AI Tıbbi Not)
1. https://console.anthropic.com → Sign Up  
2. API Keys → Create Key
3. Key'i kopyala → .env dosyasına yapıştır

### OpenAI (Backup AI)
1. https://platform.openai.com → Sign Up
2. API Keys → Create New Secret Key
3. Key'i kopyala → .env dosyasına yapıştır

## 🧪 Test ve Doğrulama

### Browser Test:
- http://localhost:5000 → TıpScribe UI açılmalı
- Hasta ekleme testi yapın
- Ses kaydı testi yapın

### API Test:
```bash
curl http://localhost:5000/api/doctor
curl http://localhost:5000/api/templates
curl http://localhost:5000/api/health
```

## 📁 Proje Yapısı
```
tipscribe/
├── backend/src/          # Express API server
├── frontend/src/         # React frontend
├── server/              # Server utilities
├── shared/              # Ortak TypeScript types
├── node_modules/        # npm bağımlılıkları
├── .env                 # Environment variables
├── package.json         # Proje bağımlılıkları
└── README.md           # Proje dokumentasyonu
```

## 🔧 Sorun Giderme

### Port zaten kullanımda:
```bash
# Port 5000'i öldür
# Windows:
netstat -ano | findstr :5000
taskkill /PID [PID_NUMARASI] /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### PostgreSQL bağlantı sorunu:
```bash
# Windows: Services.msc → PostgreSQL başlat
# macOS: brew services restart postgresql@16
# Linux: sudo systemctl restart postgresql
```

### Node modules sorunu:
```bash
rm -rf node_modules package-lock.json
npm install
```

## ✅ Başarılı Kurulum Kontrol Listesi
- [ ] Node.js 20+ kurulu
- [ ] PostgreSQL 16 kurulu ve çalışıyor
- [ ] Cursor IDE kurulu
- [ ] Proje dosyları indirildi
- [ ] npm install başarılı
- [ ] .env dosyası oluşturuldu
- [ ] API key'leri eklendi
- [ ] Veritabanı oluşturuldu
- [ ] npm run dev çalışıyor
- [ ] http://localhost:5000 açılıyor
- [ ] Ses kaydı testi başarılı

Bu adımları takip ederek projeniz tam olarak çalışır durumda olacak!