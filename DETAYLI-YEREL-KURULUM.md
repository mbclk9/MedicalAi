# 🏥 TıpScribe - Detaylı Yerel Kurulum Rehberi

## 📍 Kurulum Dizinleri ve Tam Yol Adresleri

### Windows Kurulum Yolları:
```
Node.js: C:\Program Files\nodejs\
npm global: C:\Users\[KullanıcıAdı]\AppData\Roaming\npm\
PostgreSQL: C:\Program Files\PostgreSQL\16\
Cursor IDE: C:\Users\[KullanıcıAdı]\AppData\Local\Programs\Cursor\
Proje Dizini: C:\Users\[KullanıcıAdı]\Projects\tipscribe\
```

### macOS Kurulum Yolları:
```
Node.js: /usr/local/bin/node (Intel) veya /opt/homebrew/bin/node (M1/M2)
npm global: /usr/local/lib/node_modules/ veya /opt/homebrew/lib/node_modules/
PostgreSQL: /opt/homebrew/var/postgresql@16/ (Homebrew)
Cursor IDE: /Applications/Cursor.app
Proje Dizini: /Users/[kullanıcıadı]/Projects/tipscribe/
```

### Linux Kurulum Yolları:
```
Node.js: /usr/bin/node
npm global: /usr/lib/node_modules/
PostgreSQL: /var/lib/postgresql/16/main/
Cursor IDE: ~/.local/share/cursor/
Proje Dizini: /home/[kullanıcıadı]/Projects/tipscribe/
```

## 🔥 ADIM ADIM KURULUM (Copy-Paste Komutları)

### ADIM 1: Sistem Gereksinimlerini Kontrol Et
```bash
# Sistem bilgisi al
# Windows PowerShell:
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"

# macOS Terminal:
sw_vers

# Linux Terminal:
lsb_release -a
```

### ADIM 2: Node.js 20 Kurulumu

**Windows (PowerShell - Yönetici olarak çalıştır):**
```powershell
# Chocolatey package manager kur
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Node.js kur
choco install nodejs --version=20.11.0 -y

# PATH'i yenile
refreshenv

# Doğrulama
node --version
npm --version
```

**macOS Terminal:**
```bash
# Homebrew kur (yoksa)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 20 kur
brew install node@20
brew link --overwrite node@20

# Doğrulama
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js kur
sudo apt-get install -y nodejs

# Doğrulama
node --version
npm --version
```

### ADIM 3: PostgreSQL 16 Kurulumu

**Windows:**
```powershell
# PostgreSQL 16 indir ve kur
# Manuel: https://www.postgresql.org/download/windows/
# Veya Chocolatey ile:
choco install postgresql16 --params '/Password:postgres123' -y

# Servis başlat
Start-Service postgresql-x64-16
```

**macOS:**
```bash
# PostgreSQL 16 kur
brew install postgresql@16

# Servis başlat
brew services start postgresql@16

# Kullanıcı oluştur
createuser -s postgres
```

**Linux:**
```bash
# PostgreSQL repository ekle
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/KEYS | sudo apt-key add -
sudo apt-get update

# PostgreSQL 16 kur
sudo apt-get install postgresql-16 postgresql-client-16 -y

# Servis başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### ADIM 4: Proje Dizini Oluşturma

**Windows PowerShell:**
```powershell
# Proje dizini oluştur
New-Item -ItemType Directory -Path "C:\Users\$env:USERNAME\Projects\tipscribe" -Force
Set-Location "C:\Users\$env:USERNAME\Projects\tipscribe"
```

**macOS/Linux:**
```bash
# Proje dizini oluştur
mkdir -p ~/Projects/tipscribe
cd ~/Projects/tipscribe
```

### ADIM 5: TıpScribe Projesini İndirme

**Replit'ten Export:**
1. Replit Shell'de çalıştır:
```bash
# Proje zip'le (node_modules hariç)
zip -r tipscribe-export-$(date +%Y%m%d).zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "*.log" \
  -x ".env"
```

2. Files panelinden zip dosyasını indir
3. Yerel proje dizinine çıkar:

**Windows:**
```powershell
# Zip dosyasını çıkar (Windows Explorer veya)
Expand-Archive -Path "tipscribe-export-*.zip" -DestinationPath . -Force
```

**macOS/Linux:**
```bash
# Zip dosyasını çıkar
unzip tipscribe-export-*.zip
```

### ADIM 6: Node Modules Kurulumu

```bash
# Proje dizininde çalıştır
cd ~/Projects/tipscribe  # veya Windows'ta cd C:\Users\%USERNAME%\Projects\tipscribe

# Package.json kontrol et
cat package.json

# Tüm bağımlılıkları kur (2-3 dakika sürer)
npm install

# Kurulum başarılıysa:
ls -la node_modules/  # macOS/Linux
dir node_modules\     # Windows
```

### ADIM 7: PostgreSQL Veritabanı Kurulumu

```bash
# PostgreSQL'e bağlan
psql -U postgres

# Aşağıdaki SQL komutlarını çalıştır:
```

```sql
-- TıpScribe veritabanı oluştur
CREATE DATABASE tipscribe_dev;

-- Kullanıcı oluştur
CREATE USER tipscribe_user WITH PASSWORD 'tipscribe_strong_pass_2025';

-- İzinleri ver
GRANT ALL PRIVILEGES ON DATABASE tipscribe_dev TO tipscribe_user;
ALTER USER tipscribe_user CREATEDB;

-- Bağlantıyı kapat
\q
```

### ADIM 8: Environment Variables (.env) Kurulumu

```bash
# .env.example'dan kopyala
cp .env.example .env

# .env dosyasını düzenle
```

**.env dosyası içeriği (TAM):**
```env
# ===========================================
# TıpScribe Yerel Geliştirme Environment
# ===========================================

# Database Configuration
DATABASE_URL="postgresql://tipscribe_user:tipscribe_strong_pass_2025@localhost:5432/tipscribe_dev"
PGHOST=localhost
PGPORT=5432
PGUSER=tipscribe_user
PGPASSWORD=tipscribe_strong_pass_2025
PGDATABASE=tipscribe_dev

# API Keys - BURAYA GERÇEKLERİNİ YAZIN
DEEPGRAM_API_KEY=your_deepgram_api_key_here
ANTHROPIC_API_KEY=your_anthropic_claude_key_here  
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NODE_ENV=development
PORT=5000

# Security (değiştirin)
SESSION_SECRET=tipscribe_session_secret_2025_change_this

# File Upload Limits
MAX_FILE_SIZE=50000000

# Rate Limiting
RATE_LIMIT_GENERAL=100
RATE_LIMIT_TRANSCRIPTION=10
RATE_LIMIT_AI=20

# CORS Settings
CORS_ORIGIN=http://localhost:5000
```

### ADIM 9: Veritabanı Schema Kurulumu

```bash
# Schema'yı veritabanına push et
npm run db:push

# Başarılı çıktı:
# ✓ Schema pushed to database

# Test verileri ekle
npm run seed

# Başarılı çıktı:
# ✓ Database seeded successfully
```

### ADIM 10: API Key'lerini Alma (ZORUNLU)

**Deepgram API Key (Ses Tanıma):**
1. https://deepgram.com → "Get API Key" → Sign Up
2. Email doğrulama yap
3. Console → API Keys → "Create a New API Key"
4. Key'i kopyala → .env dosyasına yapıştır

**Anthropic Claude API Key (AI Tıbbi Not):**
1. https://console.anthropic.com → Sign Up
2. Phone number doğrulama
3. API Keys → "Create Key" → Name: "TipScribe"
4. Key'i kopyala → .env dosyasına yapıştır

**OpenAI API Key (Backup AI):**
1. https://platform.openai.com → Sign Up
2. Billing → Payment method ekle ($5 minimum)
3. API Keys → "Create new secret key"
4. Key'i kopyala → .env dosyasına yapıştır

### ADIM 11: Cursor IDE Kurulumu

**İndirme ve Kurulum:**
```bash
# Cursor IDE indir: https://cursor.sh/

# Windows: cursor-setup.exe çalıştır
# macOS: .dmg dosyasını Applications'a sürükle
# Linux: .deb veya .AppImage dosyasını kur
```

**Cursor'da Projeyi Açma:**
1. Cursor IDE başlat
2. File → Open Folder
3. tipscribe proje dizinini seç
4. Terminal aç (Ctrl+` veya Cmd+`)

### ADIM 12: Projeyi Başlatma

**Cursor Terminal'de:**
```bash
# Development sunucuyu başlat
npm run dev

# Başarılı çıktı görmeli:
# [express] serving on port 5000
# [vite] dev server running at http://localhost:5000
```

**Browser'da Test:**
```
http://localhost:5000 → TıpScribe arayüzü açılmalı
```

## 🧪 Son Test ve Doğrulama

### API Endpoint Testleri:
```bash
# Terminal'de test et:
curl http://localhost:5000/api/doctor
curl http://localhost:5000/api/templates
curl http://localhost:5000/api/health
curl http://localhost:5000/api/patients
```

### Frontend Fonksiyon Testleri:
1. Browser'da http://localhost:5000 aç
2. "Yeni Hasta" ekle
3. "Muayene Başlat" → Ses kaydı yap
4. AI tıbbi not oluşturulmasını bekle

## ⚠️ Olası Sorunlar ve Çözümleri

### Port Çakışması:
```bash
# Port 5000 meşgulse
# Windows:
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### PostgreSQL Bağlantı Sorunu:
```bash
# Servis durumunu kontrol et
# Windows:
sc query postgresql-x64-16

# macOS:
brew services list | grep postgresql

# Linux:
sudo systemctl status postgresql
```

### NPM Install Sorunları:
```bash
# Temiz kurulum
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## ✅ Kurulum Tamamlandı Kontrolü

**Aşağıdaki komutlar başarılı sonuç vermeli:**
```bash
node --version          # v20.x.x
npm --version           # 10.x.x
psql --version          # 16.x
curl http://localhost:5000/api/health  # {"status":"healthy"}
```

**Browser'da çalışmalı:**
- http://localhost:5000 → TıpScribe UI
- Hasta ekleme formu
- Ses kaydı butonu
- AI not oluşturma

Bu rehberi takip ederek TıpScribe projeniz Cursor IDE'de tamamen çalışır durumda olacak!