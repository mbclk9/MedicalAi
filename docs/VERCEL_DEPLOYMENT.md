# 🚀 TıpScribe Vercel Deployment Rehberi

## 📋 Genel Bakış

Bu rehber, TıpScribe AI Tıbbi Asistan uygulamasını Vercel'de nasıl deploy edeceğinizi adım adım açıklar.

## 🔧 Düzeltilen Sorunlar

### ✅ Yapılan Düzeltmeler:
1. **Vercel.json Konfigürasyonu**: Monorepo yapısı için optimize edildi
2. **Build Scripts**: Root seviyede Vercel-specific build komutları eklendi
3. **API Routing**: Serverless fonksiyonlar için düzeltildi
4. **Frontend Build**: Production için optimize edildi
5. **Environment Variables**: Vercel deployment için hazırlandı

## 🚀 Deployment Adımları

### 1. GitHub Repository Hazırlığı
```bash
# Değişiklikleri commit edin
git add .
git commit -m "Fix: Vercel deployment configuration"
git push origin main
```

### 2. Vercel Dashboard'a Gidin
1. [vercel.com](https://vercel.com) adresine gidin
2. GitHub hesabınızla giriş yapın
3. "New Project" butonuna tıklayın
4. Repository'nizi seçin

### 3. Environment Variables Ayarlayın
Vercel dashboard'da Settings > Environment Variables bölümüne gidin ve aşağıdaki değişkenleri ekleyin:

```env
DATABASE_URL=postgresql://username:password@host:5432/database_name
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
NODE_ENV=production
```

### 4. Build Ayarları
Vercel otomatik olarak aşağıdaki ayarları kullanacak:
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `apps/frontend/dist`
- **Install Command**: `npm run install:all`

### 5. Deploy Edin
"Deploy" butonuna tıklayın. Build süreci başlayacak.

## 📊 Build Süreci

### Turbo Build Pipeline:
```
1. packages/db build → Database schema ve types
2. apps/backend build → API serverless functions
3. apps/frontend build → React production build
```

### Vercel Functions:
- API routes `/api/*` → `api/index.js` serverless function
- Frontend routes `/*` → Static files from `apps/frontend/dist`

## 🔍 Troubleshooting

### Build Hataları

#### 1. Database Connection Error
```bash
# Çözüm: Environment variables'ı kontrol edin
DATABASE_URL=postgresql://user:pass@host:5432/db
```

#### 2. API Keys Missing
```bash
# Çözüm: Tüm API keys'leri Vercel dashboard'da ayarlayın
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
```

#### 3. Build Timeout
```bash
# Çözüm: Build command'i optimize edin
npm run build:vercel
```

### Runtime Hataları

#### 1. API Routes 404
- Vercel.json'da routing kontrolü yapın
- `api/index.js` dosyasının doğru export ettiğini kontrol edin

#### 2. Environment Variables Not Found
- Vercel dashboard'da tüm variables'ların ayarlandığını kontrol edin
- Redeploy yapın

## 📱 Production URL'leri

Deploy tamamlandıktan sonra:
- **Frontend**: `https://your-project-name.vercel.app`
- **API**: `https://your-project-name.vercel.app/api/health`
- **Dashboard**: `https://your-project-name.vercel.app/dashboard`

## 🔄 Güncelleme Süreci

### Kod Değişiklikleri:
```bash
git add .
git commit -m "Update: feature description"
git push origin main
# Vercel otomatik olarak yeniden deploy eder
```

### Environment Variables Güncelleme:
1. Vercel dashboard → Settings → Environment Variables
2. Değişkeni düzenleyin
3. "Redeploy" butonuna tıklayın

## 🎯 Performance Optimizasyonları

### Frontend:
- ✅ Code splitting aktif
- ✅ Bundle optimization
- ✅ Console.log'lar production'da kaldırılıyor
- ✅ Terser minification

### Backend:
- ✅ Serverless functions
- ✅ Cold start optimization
- ✅ Error handling
- ✅ Graceful fallbacks

## 🔒 Güvenlik

### Environment Variables:
- ✅ Tüm API keys güvenli şekilde saklanıyor
- ✅ Database credentials şifreleniyor
- ✅ Production ortamında debug bilgileri gizleniyor

### API Security:
- ✅ CORS koruması
- ✅ Request validation
- ✅ Error handling
- ✅ Rate limiting (gerektiğinde)

## 📞 Destek

Deployment sorunları için:
1. Vercel build logs'ları kontrol edin
2. Browser console'da hata mesajlarını inceleyin
3. API health check'i test edin: `/api/health`

### Yaygın Sorunlar:

| Sorun | Çözüm |
|-------|--------|
| Build timeout | Build command'i optimize et |
| API 404 | Routing konfigürasyonunu kontrol et |
| Environment variables missing | Vercel dashboard'da ayarla |
| Database connection failed | DATABASE_URL'i kontrol et |

## ✅ Deployment Checklist

- [ ] GitHub repository güncel
- [ ] Environment variables ayarlandı
- [ ] Database erişilebilir
- [ ] API keys geçerli
- [ ] Build başarılı
- [ ] API health check çalışıyor
- [ ] Frontend yükleniyor
- [ ] Tüm özellikler test edildi

---

**🎉 Deployment başarılı! TıpScribe artık production'da çalışıyor.** 