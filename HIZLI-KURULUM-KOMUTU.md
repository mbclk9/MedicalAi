# 🚀 TıpScribe Tek Komut Kurulum

## 📦 Proje Dosyalarını İndirme (Replit'ten)

### Method 1: Files Panel (Önerilen)
1. Replit'te Files panelini aç
2. Tüm dosyaları seç (Ctrl+A)
3. Sağ tık → Download as ZIP
4. Yerel bilgisayara kaydet

### Method 2: Shell ile Export
```bash
# Replit Shell'de çalıştır:
tar -czf tipscribe-export.tar.gz \
  --exclude="node_modules" \
  --exclude=".git" \
  backend client frontend server shared packages \
  *.json *.ts *.js *.md *.config.* .env.example
```

## 💻 Tek Komut Kurulum Scripti

### Windows PowerShell Script (Admin olarak çalıştır):
```powershell
# TıpScribe Otomatik Kurulum
Write-Host "TıpScribe Kurulum Başlıyor..." -ForegroundColor Green

# 1. Chocolatey kur
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

# 2. Node.js ve PostgreSQL kur
choco install nodejs --version=20.11.0 -y
choco install postgresql16 --params '/Password:postgres123' -y

# 3. Proje dizini oluştur
$ProjectPath = "C:\Users\$env:USERNAME\Projects\tipscribe"
New-Item -ItemType Directory -Path $ProjectPath -Force
Set-Location $ProjectPath

Write-Host "Kurulum tamamlandı! Şimdi projeyi $ProjectPath dizinine çıkarın ve 'npm install' çalıştırın." -ForegroundColor Yellow
```

### macOS Tek Komut Script:
```bash
#!/bin/bash
# TıpScribe macOS Kurulum

echo "🏥 TıpScribe Kurulum Başlıyor..."

# Homebrew kur (yoksa)
if ! command -v brew &> /dev/null; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Node.js ve PostgreSQL kur
brew install node@20 postgresql@16

# PostgreSQL başlat
brew services start postgresql@16

# Proje dizini oluştur
mkdir -p ~/Projects/tipscribe
cd ~/Projects/tipscribe

echo "✅ Kurulum tamamlandı! Proje dosyalarını ~/Projects/tipscribe/ dizinine çıkarın."
```

### Linux (Ubuntu) Tek Komut Script:
```bash
#!/bin/bash
# TıpScribe Linux Kurulum

echo "🏥 TıpScribe Kurulum Başlıyor..."

# Node.js 20 kur
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 16 kur
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/KEYS | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql-16 -y

# PostgreSQL başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Proje dizini oluştur
mkdir -p ~/Projects/tipscribe
cd ~/Projects/tipscribe

echo "✅ Kurulum tamamlandı! Proje dosyalarını ~/Projects/tipscribe/ dizinine çıkarın."
```

## 🔧 Proje Çalıştırma (5 Dakika)

### 1. Proje dosyalarını yerleştirdikten sonra:
```bash
cd ~/Projects/tipscribe  # veya Windows'ta: cd C:\Users\%USERNAME%\Projects\tipscribe

# Bağımlılıkları kur
npm install

# .env dosyası oluştur
cp .env.example .env
```

### 2. PostgreSQL veritabanı kur:
```bash
# PostgreSQL'e bağlan
psql -U postgres

# Veritabanı oluştur (SQL komutları):
CREATE DATABASE tipscribe_dev;
CREATE USER tipscribe_user WITH PASSWORD 'tipscribe_pass';
GRANT ALL PRIVILEGES ON DATABASE tipscribe_dev TO tipscribe_user;
ALTER USER tipscribe_user CREATEDB;
\q
```

### 3. .env dosyasını düzenle:
```env
DATABASE_URL="postgresql://tipscribe_user:tipscribe_pass@localhost:5432/tipscribe_dev"
DEEPGRAM_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
NODE_ENV=development
PORT=5000
```

### 4. Schema oluştur ve projeyi başlat:
```bash
# Veritabanı schema'sını oluştur
npm run db:push

# Test verileri ekle
npm run seed

# Projeyi başlat
npm run dev
```

### 5. Test et:
- Browser: http://localhost:5000
- API: http://localhost:5000/api/health

## 🎯 API Key'leri Alma (2 Dakika)

### Deepgram (Ücretsiz):
- https://deepgram.com → Sign Up → API Keys → Create New Key

### Anthropic Claude (Ödeme gerekli):
- https://console.anthropic.com → Sign Up → API Keys → Create Key

### OpenAI (Ödeme gerekli):
- https://platform.openai.com → Sign Up → API Keys → Create Secret Key

## ✅ Kurulum Kontrolü

Aşağıdaki komutlar çalışmalı:
```bash
node --version     # v20.x.x
npm --version      # 10.x.x
psql --version     # PostgreSQL 16.x
curl http://localhost:5000/api/health  # {"status":"healthy"}
```

## 📞 Destek

Kurulumda sorun yaşarsanız:
1. Terminal çıktılarını kontrol edin
2. .env dosyasının doğru olduğundan emin olun
3. PostgreSQL servisinin çalıştığını kontrol edin
4. Port 5000'in başka uygulama tarafından kullanılmadığını kontrol edin

Bu rehberle 10 dakikada TıpScribe sistemi yerel geliştirme ortamınızda çalışacak!