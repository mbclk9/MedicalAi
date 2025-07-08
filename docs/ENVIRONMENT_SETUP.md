# 🔧 Environment Setup Guide

## Gerekli Ortam Değişkenleri

Bu proje için aşağıdaki ortam değişkenlerini ayarlamanız gerekiyor. Proje kök dizininde `.env` dosyası oluşturun:

```bash
# AI Medical Assistant Environment Configuration

# ==============================================
# DATABASE CONFIGURATION (Zorunlu)
# ==============================================
# PostgreSQL veritabanı bağlantı string'i
DATABASE_URL="postgresql://postgres:password@localhost:5432/tipscribe_db"

# ==============================================
# API KEYS (Önerilen)
# ==============================================

# Anthropic Claude API Key - Gelişmiş tıbbi not oluşturma için
# https://console.anthropic.com/ adresinden alabilirsiniz
ANTHROPIC_API_KEY="your_anthropic_api_key_here"

# OpenAI API Key - Yedek tıbbi not oluşturma için  
# https://platform.openai.com/api-keys adresinden alabilirsiniz
OPENAI_API_KEY="your_openai_api_key_here"

# Deepgram API Key - Türkçe ses-metin dönüşümü için
# https://console.deepgram.com/ adresinden alabilirsiniz
DEEPGRAM_API_KEY="your_deepgram_api_key_here"

# ==============================================
# SERVER CONFIGURATION (Opsiyonel)
# ==============================================
NODE_ENV="development"
PORT="5001"
```

## 🗃️ Veritabanı Kurulumu

### 1. PostgreSQL Kurulumu

#### Windows:
```bash
# Chocolatey ile
choco install postgresql

# Veya PostgreSQL resmi sitesinden indirin
# https://www.postgresql.org/download/windows/
```

#### macOS:
```bash
# Homebrew ile
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Veritabanı Oluşturma

```bash
# PostgreSQL'e bağlan
sudo -u postgres psql

# Veritabanı ve kullanıcı oluştur
CREATE DATABASE tipscribe_db;
CREATE USER tipscribe WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tipscribe_db TO tipscribe;

# Çıkış
\q
```

### 3. Veritabanı Migrasyonu

```bash
# Bağımlılıkları yükle
npm install

# Veritabanı şemasını oluştur
npm run db:push

# (Opsiyonel) Veritabanı studio'yu aç
npm run db:studio
```

## 🤖 API Anahtarları

### Anthropic API
1. [Anthropic Console](https://console.anthropic.com/) adresine gidin
2. Hesap oluşturun veya giriş yapın
3. API Keys bölümünden yeni anahtar oluşturun
4. Anahtarı `.env` dosyasına ekleyin

### OpenAI API
1. [OpenAI Platform](https://platform.openai.com/api-keys) adresine gidin
2. Hesap oluşturun veya giriş yapın
3. "Create new secret key" butonuna tıklayın
4. Anahtarı `.env` dosyasına ekleyin

### Deepgram API
1. [Deepgram Console](https://console.deepgram.com/) adresine gidin
2. Hesap oluşturun veya giriş yapın
3. API Keys bölümünden yeni anahtar oluşturun
4. Anahtarı `.env` dosyasına ekleyin

## 🚀 Projeyi Başlatma

```bash
# Geliştirme modunda başlat
npm run dev

# Veya sadece backend'i başlat
cd apps/backend
npm run dev

# Veya sadece frontend'i başlat
cd apps/frontend
npm run dev
```

## 🔧 Sorun Giderme

### Veritabanı Bağlantı Hatası
```bash
# PostgreSQL servisinin çalıştığından emin olun
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Bağlantı string'ini kontrol edin
psql "postgresql://postgres:password@localhost:5432/tipscribe_db"
```

### API Anahtar Hatası
```bash
# .env dosyasının doğru yerde olduğundan emin olun
ls -la .env

# Ortam değişkenlerinin yüklendiğini kontrol edin
node -e "console.log(process.env.DATABASE_URL)"
```

### Port Hatası
```bash
# Kullanımdaki portları kontrol edin
netstat -tulpn | grep :5001  # Linux
lsof -i :5001  # macOS

# Farklı bir port kullanın
PORT=5002 npm run dev
```

## 📝 Önemli Notlar

1. **Güvenlik**: API anahtarlarınızı asla Git'e commit etmeyin
2. **Veritabanı**: Production'da güçlü şifreler kullanın
3. **API Limitleri**: Her servisin API limitlerini kontrol edin
4. **Yedekleme**: Veritabanı yedeklerini düzenli alın

## 🆘 Destek

Sorun yaşıyorsanız:
1. Önce bu dökümanı kontrol edin
2. GitHub Issues bölümünde benzer sorunları arayın
3. Yeni issue oluşturun ve ayrıntılı bilgi verin 