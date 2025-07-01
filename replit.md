# Türkiye Tıbbi Sekreter Platformu - Replit Dokümantasyonu

## Genel Bakış

Bu platform, Türkiye Cumhuriyeti Sağlık Bakanlığı standartlarına uygun olarak geliştirilmiş tıbbi sekreter asistanı uygulamasıdır. Türkiye sağlık sistemi için özel olarak tasarlanmış bu platform, ses kayıt teknolojisi ve yapay zeka destekli tıbbi not oluşturma özelliklerini bir araya getirir. Platform, 6698 sayılı KVKK uyumlu ses kaydı, Türkçe konuşma-metin dönüştürme ve T.C. Sağlık Bakanlığı tıbbi dokümantasyon standartlarına uygun SOAP formatında not oluşturma işlevlerini destekler.

## System Architecture

### Professional Monorepo Structure
- **Architecture**: Modern monorepo with workspace management
- **Frontend**: `apps/frontend/` - React 18 with TypeScript and Vite
- **Backend**: `apps/backend/` - Express server with TypeScript
- **Shared Types**: `packages/types/` - Common TypeScript definitions
- **Documentation**: `docs/` - Comprehensive project documentation

### Frontend Architecture (apps/frontend/)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Path Aliases**: Clean imports with @ prefixes

### Backend Architecture (apps/backend/)
- **Runtime**: Node.js 20 with Express server
- **Language**: TypeScript with ES modules
- **API Style**: RESTful endpoints with JSON responses
- **File Upload**: Multer for audio file handling
- **Session Management**: Express sessions with PostgreSQL store
- **Database**: Drizzle ORM with PostgreSQL

### Shared Packages (packages/)
- **Types**: Centralized TypeScript definitions and database schema
- **Schema**: Drizzle ORM models with Zod validation
- **Configuration**: Shared build and development settings

## Key Components

### Audio Processing System
- **Recording**: Browser-based MediaRecorder API with WebM format
- **Transcription**: Deepgram SDK for Turkish speech-to-text
- **File Handling**: 50MB limit with memory storage
- **Format Support**: WebM with Opus codec for optimal quality

### AI Integration
- **Language Model**: OpenAI GPT-4o for medical note generation
- **Prompt Engineering**: Specialized prompts for Turkish medical terminology
- **Context Awareness**: Template-based note structuring
- **Medical Formatting**: SOAP format compliance for Turkish healthcare

### User Interface
- **Component Library**: Radix UI primitives with custom styling
- **Layout**: Sidebar navigation with responsive design
- **Forms**: React Hook Form with Zod validation
- **Toast Notifications**: Custom toast system for user feedback

### Medical Templates System
- **Specialty-Based**: Customizable templates by medical specialty
- **SOAP Format**: Structured Subjective, Objective, Assessment, Plan notes
- **Default Templates**: Pre-configured templates for common specialties
- **JSON Structure**: Flexible template definition system

## Data Flow

### Recording Workflow
1. User initiates recording via MediaRecorder API
2. Audio chunks collected in real-time
3. Recording stopped and converted to Blob
4. Audio file uploaded to server via FormData
5. Deepgram processes audio for Turkish transcription
6. Transcription returned to client for review

### Note Generation Process
1. Transcription text submitted with template selection
2. OpenAI GPT-4o processes text with medical context
3. AI generates structured medical note in Turkish
4. Note formatted according to selected template structure
5. Generated note saved to database with visit association
6. Real-time updates via TanStack Query invalidation

### Data Persistence
1. Patient information stored with Turkish ID validation
2. Visit records linked to patients and doctors
3. Medical notes associated with visits
4. Audio recordings optionally stored for compliance
5. Templates managed with specialty categorization

## External Dependencies

### Core Services
- **Deepgram**: Primary speech-to-text service for Turkish language
- **OpenAI**: GPT-4o model for medical note generation
- **Neon Database**: Serverless PostgreSQL hosting

### Development Dependencies
- **Vite**: Build tool with HMR and TypeScript support  
- **ESBuild**: Fast bundling for production builds
- **Tailwind**: Utility-first CSS framework
- **PostCSS**: CSS processing and optimization

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Consistent icon system
- **React Query**: Server state management
- **Wouter**: Lightweight routing solution

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Hot Reload**: Vite dev server with TypeScript support
- **Database**: Local PostgreSQL with Drizzle migrations
- **Port Configuration**: Server on 5000, exposed on port 80

### Production Build
- **Frontend**: Vite build with optimized assets
- **Backend**: ESBuild bundle with external packages
- **Database**: Drizzle push for schema deployment
- **Environment**: Node.js production mode with process management

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Auto-scaling**: Configured for production deployment

## Değişiklik Geçmişi
```
Türkiye Sağlık Bakanlığı Uyumlu Platform Güncellemeleri:
- 28 Haziran 2025: Profesyonel Proje Reorganizasyonu ve Paylaşım Hazırlığı
  * Kapsamlı README.md, API dokümantasyonu ve deployment kılavuzu
  * client/src klasör yapısı: services/, types/, utils/ ayrımı
  * server/scripts/ dizini: seed.ts, health-check.ts
  * Docker ve docker-compose production kurulumu
  * .env.example ve LICENSE dosyaları
  * Profesyonel geliştirme workflow'u ve rehberler
- 28 Haziran 2025: Aynı Sayfa Tıbbi Not Sistemi
  * NewVisit sayfasında ses kaydı sonrası aynı sayfada tıbbi not görüntüleme
  * Hasta bilgileri (ad, soyad, TC kimlik) ile entegre not gösterimi
  * PDF formatına uygun profesyonel Türkçe SOAP yapısı
  * Bölümlenmiş tıbbi not editörleme (Subjektif, Objektif, Değerlendirme)
  * Freed.ai akışı: Kayıt → Transkripsiyon → Otomatik Not Oluşturma (aynı sayfa)
- 28 Haziran 2025: Freed.ai Tarzında Otomatik AI Not Oluşturma
  * useAudioRecording hook'u Freed.ai akışı için genişletildi
  * Transkripsiyon sonrası otomatik AI not oluşturma (manuel buton kaldırıldı)
  * Claude API hatalarında OpenAI fallback sistemi
  * Hasta listesinden direkt muayene başlatma özelliği
  * Real-time loading durumları ve hata yönetimi
- 28 Haziran 2025: Hasta yönetimi ve UI iyileştirmeleri
  * Hasta listesi sayfası eklendi (grid tasarım, arama, silme)
  * Sidebar yeniden düzenlendi - Muayene ve Hasta ayrı bölümler
  * Hasta seçili muayene başlatma özelliği
  * Claude Anthropic API entegrasyonu tamamlandı
  * Son muayene silme özelliği eklendi
- 27 Haziran 2025: Platform Türkiye sağlık standartlarına uygun hale getirildi
  * KVKK uyumlu ses kayıt sistemi
  * T.C. Sağlık Bakanlığı SOAP formatı uygulandı
  * Türk Tabipleri Birliği etik kuralları entegrasyonu
  * Deepgram Türkçe transkripsiyon + OpenAI tıbbi not üretimi
  * Hasta mahremiyeti ve güvenlik önlemleri eklendi
- 27 Haziran 2025: İlk kurulum ve temel yapı
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```