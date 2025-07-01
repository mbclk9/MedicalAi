# 🩺 TıpScribe - AI Destekli Tıbbi Transkripsiyon Sistemi

> Türkiye Cumhuriyeti Sağlık Bakanlığı standartlarına uygun, modern teknolojilerle geliştirilmiş güvenli ve etkili tıbbi not alma platformu

## 📋 Özellikler

- 🎤 **Gerçek Zamanlı Transkripsiyon** - Deepgram API ile Türkçe %95+ doğruluk
- 🤖 **AI Destekli Not Oluşturma** - Claude Sonnet 4.0 & OpenAI GPT-4o ile yapılandırılmış tıbbi notlar
- 👥 **Hasta Yönetimi** - Kapsamlı hasta kayıt sistemi (TC Kimlik entegrasyonu)
- 🏥 **SOAP Format** - T.C. Sağlık Bakanlığı standartına uygun tıbbi dokümantasyon
- 🔒 **KVKK Uyumlu** - Türkiye veri koruma mevzuatına uygun güvenlik
- 📱 **Modern UI** - Responsive tasarım + shadcn/ui bileşenleri
- ⚡ **Yüksek Performans** - React 18 + TypeScript + Vite

## 🛠 Teknoloji Stack

### Backend
```
Node.js 20+ + TypeScript
Express.js + Drizzle ORM
PostgreSQL 16+ (Neon Serverless)
WebSocket (Real-time)
Deepgram API + OpenAI/Anthropic APIs
Session Authentication
```

### Frontend
```
React 18 + TypeScript
Vite + Tailwind CSS
shadcn/ui Components
TanStack Query (React Query)
React Hook Form + Zod
Wouter Router
```

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
```bash
Node.js 20+
PostgreSQL 16+
Git
VS Code (önerilen)
```

### 2. Projeyi Klonlayın
```bash
git clone <repository-url>
cd tipscribe
npm install
```

### 3. Environment Kurulumu
```bash
# Root klasörde .env dosyası oluşturun
cp .env.example .env
# .env dosyasını API anahtarlarınızla düzenleyin
```

### 4. Veritabanı Kurulumu
```bash
# PostgreSQL veritabanı oluşturun
createdb tipscribe_db

# Schema'yı deploy edin
npm run db:push

# Seed data'yı yükleyin (opsiyonel)
npm run db:seed
```

### 5. Uygulamayı Başlatın
```bash
# Development server'ı başlatın
npm run dev

# Uygulama http://localhost:5000 adresinde çalışacak
```

## 🔧 Konfigürasyon

### Environment Variables (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tipscribe_db"

# Server
PORT=5000
NODE_ENV="development"

# API Keys
DEEPGRAM_API_KEY="your_deepgram_api_key"
OPENAI_API_KEY="your_openai_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"

# PostgreSQL Connection Details (for Neon)
PGHOST="your_pg_host"
PGPORT=5432
PGUSER="your_pg_user"
PGPASSWORD="your_pg_password"
PGDATABASE="tipscribe_db"
```

## 📚 API Endpoints

### Hasta Yönetimi
```
GET    /api/patients           - Hasta listesi
POST   /api/patients           - Yeni hasta ekleme
GET    /api/patients/:id       - Hasta detayı
PUT    /api/patients/:id       - Hasta güncelleme
DELETE /api/patients/:id       - Hasta silme
```

### Muayene Yönetimi
```
GET  /api/visits              - Muayene listesi
POST /api/visits              - Yeni muayene oluşturma
GET  /api/visits/:id          - Muayene detayı
PUT  /api/visits/:id/status   - Muayene durumu güncelleme
```

### Ses Kayıt ve Transkripsiyon
```
POST /api/transcribe          - Ses dosyası transkripsiyon
POST /api/recordings          - Ses kaydı saklama
GET  /api/recordings/:visitId - Muayeneye ait kayıt
```

### Tıbbi Not Oluşturma
```
POST /api/generate-note       - AI ile tıbbi not oluşturma
GET  /api/medical-notes/:visitId - Muayene notunu getir
PUT  /api/medical-notes/:visitId - Notu güncelle
```

### Şablon Yönetimi
```
GET  /api/templates           - Tıbbi şablonlar
GET  /api/templates/:id       - Şablon detayı
GET  /api/templates/specialty/:specialty - Uzmanlığa göre şablonlar
```

## 🔄 Geliştirme Workflow

### 1. Development Server
```bash
npm run dev          # Tam stack development server
npm run build        # Production build
npm run start        # Production server
```

### 2. Database İşlemleri
```bash
npm run db:push      # Schema değişikliklerini deploy et
npm run db:studio    # Drizzle Studio (database UI)
npm run db:seed      # Test verilerini yükle
```

### 3. Code Quality
```bash
npm run type-check   # TypeScript type checking
npm run lint         # ESLint kod kontrolü
npm run format       # Prettier ile kod formatlama
```

## 🧪 Test Kullanıcıları

```
Doktor:
Ad: Dr. Mehmet Yılmaz
Uzmanlık: Dahiliye
ID: 1

Test Hastaları:
- Ahmet Yılmaz (TC: 12345678901)
- Fatma Kaya (TC: 98765432109)
- Mehmet Demir (TC: 11223344556)
```

## 📁 Proje Yapısı

```
tipscribe/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/       # UI Bileşenleri
│   │   │   ├── ui/          # shadcn/ui base components
│   │   │   ├── forms/       # Form components
│   │   │   └── features/    # Feature-specific components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Sayfa bileşenleri
│   │   ├── services/        # API servisleri
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Utility functions
├── server/                   # Node.js Backend
│   ├── routes.ts            # API routes
│   ├── services/            # Business logic services
│   │   ├── anthropicService.ts
│   │   ├── openaiService.ts
│   │   ├── deepgramService.ts
│   │   └── intelligentMedicalService.ts
│   ├── storage.ts           # Database interface
│   ├── databaseStorage.ts   # Database implementation
│   └── db.ts               # Database connection
├── shared/                  # Paylaşılan kodlar
│   └── schema.ts           # Database schema & types
├── uploads/                 # Yüklenen dosyalar
└── docs/                   # Dokümantasyon
```

## 🐛 Debugging

### Development Debugging
```bash
# Verbose logging ile başlatma
DEBUG=* npm run dev

# Sadece Express logları
DEBUG=express:* npm run dev

# Database bağlantısını test etme
npm run db:studio
```

### Yaygın Sorunlar
```bash
# Port zaten kullanımda
lsof -ti:5000 | xargs kill -9

# Database bağlantı sorunu
psql -h localhost -U postgres -d tipscribe_db

# API key kontrol
curl -H "Authorization: Token YOUR_DEEPGRAM_KEY" \
     https://api.deepgram.com/v1/projects
```

## 🔒 Güvenlik

- Session-based authentication
- KVKK uyumlu veri işleme
- Hasta mahremiyeti koruması
- Input validation (Zod)
- CORS koruması
- Rate limiting (production)
- Secure file upload

## 📈 Performans

- React 18 concurrent features
- Lazy loading ile code splitting
- Audio dosya compression
- Database query optimization
- Real-time WebSocket connections
- Caching strategies

## 🚀 Deployment

### Replit Deployment
```bash
# Otomatik deployment için hazır
# Deploy butonuna tıklayın
```

### Manual Deployment
```bash
# Production build
npm run build

# Environment variables ayarlayın
# Database URL'i production'a güncelleyin
# API keys'leri production values ile değiştirin

# Start production server
npm run start
```

### Docker Deployment
```bash
# Docker image build
docker build -t tipscribe .

# Container çalıştırma
docker run -p 5000:5000 -e DATABASE_URL=... tipscribe
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add some amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 Destek

- 📧 Email: support@tipscribe.com
- 📱 WhatsApp: +90 555 123 4567
- 💬 Telegram: @tipscribe_support

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## ⚡ Hızlı İpuçları

**Optimal Kayıt için:**
- Mikrofonu hastaya 30-50cm mesafede konumlandırın
- Sessiz bir ortamda kayıt yapın
- Konuşma hızını normal tutun
- Teknik terimleri net telaffuz edin

**AI Not Kalitesi için:**
- Yapılandırılmış konuşma (şikayet → muayene → plan)
- Uzmanlığa uygun şablon seçimi
- AI önerilerini kontrol edin
- Eksik bilgileri manuel tamamlayın

**Sistem Bakımı:**
- Düzenli database backup
- Audio dosyaları temizleme
- API usage monitoring
- Log file rotation

## 🔧 Sorun Giderme

### Audio Kaydında Sorun
```javascript
// Mikrofon izinlerini kontrol edin
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('Mikrofon aktif'))
  .catch(err => console.error('Mikrofon hatası:', err));
```

### AI Not Oluşturmada Sorun
- API key'lerinizi kontrol edin
- İnternet bağlantınızı test edin
- Transkripsiyon kalitesini değerlendirin
- Fallback servis (Claude → OpenAI) çalışıyor mu

### Database Bağlantı Sorunu
```bash
# Bağlantıyı test edin
npx drizzle-kit studio

# Schema'yı senkronize edin
npm run db:push
```

**Sistem Requirements:**
- Minimum: 2GB RAM, 1GB disk space
- Önerilen: 4GB RAM, 5GB disk space
- İnternet: Stabil bağlantı (upload/download)
- Browser: Chrome 90+, Firefox 88+, Safari 14+