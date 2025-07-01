# 🏥 TıpScribe - TAMAMEN DETAYLI KURULUM REHBERİ

## ⚠️ ÖNEMLI: Eksik Kütüphaneler ve Tam Gereksinimler

### 🚨 SİSTEM GEREKSİNİMLERİ (ZORUNLU)

**İşletim Sistemi Gereksinimleri:**
- **Windows:** Windows 10/11 (64-bit)
- **macOS:** macOS 10.15+ (Intel/Apple Silicon)
- **Linux:** Ubuntu 20.04+, Debian 11+, CentOS 8+

**Bellek ve Disk:**
- **RAM:** Minimum 8GB (Önerilen 16GB)
- **Disk:** 5GB boş alan (Node modules + PostgreSQL)
- **İnternet:** Kararlı bağlantı (API çağrıları için)

## 📦 1. ZORUNLU YAZILIM KURULUMLARİ

### Node.js 20.x (ZORUNLU)
```bash
# Version kontrolü ZORUNLU
node --version  # v20.11.0 veya üstü OLMALI

# Windows Kurulum (PowerShell Admin):
winget install OpenJS.NodeJS --version 20.11.0

# macOS Kurulum:
curl -o- https://nodejs.org/dist/v20.11.0/node-v20.11.0.pkg | sudo installer -pkg /dev/stdin -target /

# Linux Kurulum:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### PostgreSQL 16.x (ZORUNLU)
```bash
# Windows:
winget install PostgreSQL.PostgreSQL --version 16.1

# macOS:
brew install postgresql@16
brew services start postgresql@16

# Linux (Ubuntu/Debian):
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/KEYS | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql-16 postgresql-client-16
```

### Git (Önerilen)
```bash
# Windows:
winget install Git.Git

# macOS:
xcode-select --install

# Linux:
sudo apt install git
```

## 📁 2. PROJE DİZİN YAPISI OLUŞTURMA

```bash
# Proje ana dizini oluştur
# Windows:
mkdir C:\TipScribe-Project
cd C:\TipScribe-Project

# macOS/Linux:
mkdir -p ~/TipScribe-Project
cd ~/TipScribe-Project
```

## 🔗 3. PROJE DOSYALARINI İNDİRME

### Method 1: Replit Export (Önerilen)
1. **Replit'te Files paneli aç**
2. **Shell'de export komutu çalıştır:**
```bash
tar -czf tipscribe-export.tar.gz \
  --exclude="node_modules" \
  --exclude=".git" \
  --exclude="*.log" \
  backend client frontend server shared packages \
  *.json *.ts *.js *.md *.config.*
```
3. **Files panelinden .tar.gz dosyasını indir**
4. **Yerel proje dizinine çıkar**

### Method 2: Manuel Copy-Paste
**Aşağıdaki dosya/klasörleri Replit'ten kopyala:**
```
📁 backend/          (Tam klasör)
📁 client/           (Tam klasör)  
📁 frontend/         (Tam klasör)
📁 server/           (Tam klasör)
📁 shared/           (Tam klasör)
📁 packages/         (Tam klasör)
📄 package.json      (ZORUNLU)
📄 tsconfig.json     (ZORUNLU)
📄 vite.config.ts    (ZORUNLU)
📄 drizzle.config.ts (ZORUNLU)
📄 tailwind.config.ts
📄 postcss.config.js
📄 .env.example      (ZORUNLU)
```

## 🛠️ 4. KÜTÜPHANE KURULUMLARİ (DEĞİŞTİRİLMEMİŞ)

### Ana Bağımlılıklar (package.json'dan):
```bash
npm install

# Eğer hata alırsanız, tek tek kurun:
npm install express@^4.21.2
npm install @anthropic-ai/sdk@^0.37.0
npm install @deepgram/sdk@^4.7.0
npm install @neondatabase/serverless@^0.10.4
npm install drizzle-orm@^0.39.1
npm install drizzle-zod@^0.7.0
npm install openai@^5.8.1
npm install react@^18.3.1
npm install react-dom@^18.3.1
npm install @tanstack/react-query@^5.60.5
npm install wouter@^3.3.5
npm install zod@^3.24.2
npm install lucide-react@^0.453.0
npm install tailwindcss@^3.4.17
npm install typescript@5.6.3
npm install vite@^5.4.19
```

### TypeScript Type Definitions:
```bash
npm install --save-dev @types/express@4.17.21
npm install --save-dev @types/node@20.16.11
npm install --save-dev @types/react@^18.3.11
npm install --save-dev @types/react-dom@^18.3.1
npm install --save-dev @types/multer@^1.4.13
npm install --save-dev @types/express-session@^1.18.0
npm install --save-dev @types/passport@^1.0.16
npm install --save-dev @types/passport-local@^1.0.38
npm install --save-dev @types/connect-pg-simple@^7.0.3
npm install --save-dev @types/ws@^8.5.13
```

### Build Tools:
```bash
npm install --save-dev tsx@^4.19.1
npm install --save-dev esbuild@^0.25.0
npm install --save-dev drizzle-kit@^0.30.4
npm install --save-dev @vitejs/plugin-react@^4.3.2
npm install --save-dev autoprefixer@^10.4.20
npm install --save-dev postcss@^8.4.47
```

### Radix UI Components (Tam Liste):
```bash
npm install @radix-ui/react-accordion@^1.2.4
npm install @radix-ui/react-alert-dialog@^1.1.7
npm install @radix-ui/react-aspect-ratio@^1.1.3
npm install @radix-ui/react-avatar@^1.1.4
npm install @radix-ui/react-checkbox@^1.1.5
npm install @radix-ui/react-collapsible@^1.1.4
npm install @radix-ui/react-context-menu@^2.2.7
npm install @radix-ui/react-dialog@^1.1.7
npm install @radix-ui/react-dropdown-menu@^2.1.7
npm install @radix-ui/react-hover-card@^1.1.7
npm install @radix-ui/react-label@^2.1.3
npm install @radix-ui/react-menubar@^1.1.7
npm install @radix-ui/react-navigation-menu@^1.2.6
npm install @radix-ui/react-popover@^1.1.7
npm install @radix-ui/react-progress@^1.1.3
npm install @radix-ui/react-radio-group@^1.2.4
npm install @radix-ui/react-scroll-area@^1.2.4
npm install @radix-ui/react-select@^2.1.7
npm install @radix-ui/react-separator@^1.1.3
npm install @radix-ui/react-slider@^1.2.4
npm install @radix-ui/react-slot@^1.2.0
npm install @radix-ui/react-switch@^1.1.4
npm install @radix-ui/react-tabs@^1.1.4
npm install @radix-ui/react-toast@^1.2.7
npm install @radix-ui/react-toggle@^1.1.3
npm install @radix-ui/react-toggle-group@^1.1.3
npm install @radix-ui/react-tooltip@^1.2.0
```

### Utility Libraries:
```bash
npm install @hookform/resolvers@^3.10.0
npm install class-variance-authority@^0.7.1
npm install clsx@^2.1.1
npm install cmdk@^1.1.1
npm install date-fns@^3.6.0
npm install framer-motion@^11.13.1
npm install input-otp@^1.4.2
npm install next-themes@^0.4.6
npm install react-hook-form@^7.55.0
npm install react-icons@^5.4.0
npm install react-resizable-panels@^2.1.7
npm install recharts@^2.15.2
npm install tailwind-merge@^2.6.0
npm install tailwindcss-animate@^1.0.7
npm install vaul@^1.1.2
npm install zod-validation-error@^3.4.0
```

### Backend Specific:
```bash
npm install connect-pg-simple@^10.0.0
npm install express-session@^1.18.1
npm install memorystore@^1.6.7
npm install multer@^2.0.1
npm install passport@^0.7.0
npm install passport-local@^1.0.0
npm install ws@^8.18.0
npm install bufferutil@^4.0.8
```

### Additional UI Libraries:
```bash
npm install embla-carousel-react@^8.6.0
npm install react-day-picker@^8.10.1
npm install tw-animate-css@^1.2.5
npm install @tailwindcss/typography@^0.5.15
npm install @tailwindcss/vite@^4.1.3
```

## 🗄️ 5. POSTGRESQL VERİTABANI KURULUMU

### Veritabanı Oluşturma:
```bash
# PostgreSQL servisini başlat
# Windows:
net start postgresql-x64-16

# macOS:
brew services start postgresql@16

# Linux:
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL'e bağlan
psql -U postgres
```

### SQL Komutları:
```sql
-- Veritabanı ve kullanıcı oluştur
CREATE DATABASE tipscribe_dev;
CREATE USER tipscribe_user WITH PASSWORD 'tipscribe_secure_2025';

-- İzinleri ver
GRANT ALL PRIVILEGES ON DATABASE tipscribe_dev TO tipscribe_user;
ALTER USER tipscribe_user CREATEDB;
ALTER USER tipscribe_user SUPERUSER;

-- Bağlantıyı test et
\c tipscribe_dev;
\dt

-- Çık
\q
```

## ⚙️ 6. ENVIRONMENT VARIABLES (.env)

### .env dosyası oluştur:
```bash
cp .env.example .env
```

### .env içeriğini düzenle:
```env
# ==============================================
# TıpScribe Yerel Geliştirme Ortamı
# ==============================================

# Database (PostgreSQL Yerel)
DATABASE_URL="postgresql://tipscribe_user:tipscribe_secure_2025@localhost:5432/tipscribe_dev"
PGHOST=localhost
PGPORT=5432
PGUSER=tipscribe_user
PGPASSWORD=tipscribe_secure_2025
PGDATABASE=tipscribe_dev

# Server Configuration
NODE_ENV=development
PORT=5000

# ZORUNLU API KEYS (Gerçek key'lerinizi girin)
DEEPGRAM_API_KEY=your_deepgram_api_key_here
ANTHROPIC_API_KEY=your_anthropic_claude_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Session Security
SESSION_SECRET=tipscribe_session_secret_change_this_2025

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

# CORS
CORS_ORIGIN=http://localhost:5000
```

## 🔑 7. API KEY'LERİNİ ALMA (ZORUNLU)

### Deepgram API Key:
1. **https://deepgram.com/** → Sign Up
2. **Phone/Email verification**
3. **Console → API Keys → Create New Key**
4. **Model: "nova-2" Türkçe destekli**
5. **$200 ücretsiz krediniz var**

### Anthropic Claude API Key:
1. **https://console.anthropic.com/** → Sign Up
2. **Phone verification gerekli**
3. **API Keys → Create Key**
4. **Claude Sonnet 4.0 modeli seçin**
5. **$5 minimum ödeme gerekli**

### OpenAI API Key:
1. **https://platform.openai.com/** → Sign Up
2. **Billing → Payment method ekle**
3. **API Keys → Create Secret Key**
4. **GPT-4o modeli için yeterli krediniz olsun**

## 🏗️ 8. VERİTABANI SCHEMA KURULUMU

```bash
# Schema'yı veritabanına push et
npm run db:push

# Başarılı çıktı:
# ✓ Your schema is in sync with your database

# Test verileri ekle (opsiyonel)
npm run seed
```

## 🚀 9. PROJEYİ BAŞLATMA

```bash
# Development mode başlat
npm run dev

# Başarılı çıktı görmeli:
# [express] serving on port 5000
# [vite] dev server running at http://localhost:5000
```

## 🧪 10. TEST VE DOĞRULAMA

### Browser Test:
```
http://localhost:5000 → TıpScribe UI açılmalı
```

### API Endpoint Test:
```bash
curl http://localhost:5000/api/doctor
curl http://localhost:5000/api/templates
curl http://localhost:5000/api/health
curl http://localhost:5000/api/patients
```

### Fonksiyon Testleri:
1. **Yeni hasta ekle**
2. **Muayene başlat**
3. **Ses kaydı yap**
4. **AI tıbbi not oluşturma**

## ⚠️ 11. SORUN GİDERME

### Port Çakışması:
```bash
# Port 5000 kontrolü
# Windows:
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Node Modules Sorunu:
```bash
# Temiz kurulum
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### PostgreSQL Bağlantı Sorunu:
```bash
# Service durumu
# Windows:
sc query postgresql-x64-16

# macOS:
brew services list | grep postgresql

# Linux:
sudo systemctl status postgresql

# Manuel başlatma
# Windows:
net start postgresql-x64-16

# macOS:
brew services restart postgresql@16

# Linux:
sudo systemctl restart postgresql
```

### TypeScript Hataları:
```bash
# Type check
npm run check

# Manuel type install
npm install --save-dev @types/node @types/express @types/react
```

## ✅ 12. KURULUM BAŞARI KONTROLÜ

**Aşağıdaki komutlar başarılı sonuç vermeli:**
```bash
# Version kontrolleri
node --version          # v20.x.x
npm --version           # 10.x.x
psql --version          # PostgreSQL 16.x
tsc --version           # Version 5.x.x

# API kontrolleri
curl http://localhost:5000/api/health
# Sonuç: {"status":"healthy","services":{"database":true,...}}

# Frontend kontrolü
curl http://localhost:5000
# Sonuç: HTML sayfası dönmeli
```

## 🎯 13. FİNAL KONTROL LİSTESİ

- [ ] **Node.js 20.x kurulu ve çalışıyor**
- [ ] **PostgreSQL 16.x kurulu ve çalışıyor**
- [ ] **Proje dosyaları tamamen kopyalandı**
- [ ] **npm install başarılı (0 vulnerabilities)**
- [ ] **.env dosyası oluşturuldu ve düzenlendi**
- [ ] **API key'leri .env'e eklendi**
- [ ] **PostgreSQL veritabanı oluşturuldu**
- [ ] **npm run db:push başarılı**
- [ ] **npm run dev başarılı**
- [ ] **http://localhost:5000 açılıyor**
- [ ] **API endpoint'leri çalışıyor**
- [ ] **Hasta ekleme testi başarılı**
- [ ] **Ses kaydı testi başarılı**
- [ ] **AI not oluşturma testi başarılı**

Bu rehberi takip ederek TıpScribe projeniz %100 çalışır durumda olacak!