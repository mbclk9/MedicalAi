# 🚀 TıpScribe Vercel Deployment Rehberi

## 📋 Genel Bakış

Bu rehber, TıpScribe AI Tıbbi Asistan uygulamasını Vercel'de nasıl deploy edeceğinizi adım adım açıklar.

## 🆕 Güncel Vercel Konfigürasyonu (2025-07-10)

**Önemli Güncellemeler:**
- ✅ Monorepo yapısı için Vercel konfigürasyonu optimize edildi
- ✅ Backend serverless function olarak çalışacak şekilde düzenlendi
- ✅ Database bağlantısı production SSL ayarları düzeltildi
- ✅ Route yapısı `/api/*` → `apps/backend/src/index.ts` olarak ayarlandı
- ✅ Frontend build output'u düzeltildi
- ✅ Storage ve service import path'leri güncellendi

## 🔧 Düzeltilen Sorunlar

### ✅ Yapılan Düzeltmeler:
1. **Vercel.json Konfigürasyonu**: Monorepo yapısı için optimize edildi
2. **Build Scripts**: Turbo build hem frontend hem backend için çalışıyor
3. **API Routing**: Serverless fonksiyonlar için düzeltildi
4. **Static Files**: Frontend assets doğru serve ediliyor
5. **Environment Variables**: Production için optimize edildi
6. **CORS**: API istekleri için doğru header'lar eklendi
7. **TypeScript Config**: Frontend build sorunları düzeltildi
8. **Turbo Build**: Hem frontend hem backend build ediliyor

## 🚀 Deployment Adımları

### 1. GitHub Repository Hazırlığı
```bash
# Değişiklikleri commit edin
git add .
git commit -m "Fix: Vercel deployment configuration - build process fixed"
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
VITE_API_BASE_URL=/api
```

⚠️ **Önemli**: `VITE_API_BASE_URL` değerini mutlaka `/api` olarak ayarlayın!

### 4. Build Ayarları
Vercel otomatik olarak aşağıdaki ayarları kullanacak:
- **Build Command**: `turbo build --filter=frontend --filter=backend`
- **Output Directory**: `apps/frontend/dist`
- **Install Command**: `npm install`

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

#### 1. Frontend Build Edilmiyor
```bash
# Çözüm: Turbo.json'da build task'ı kontrol edin
turbo build --filter=frontend --filter=backend
```

#### 2. TypeScript Build Hataları
```bash
# Çözüm: Frontend tsconfig.json'da noEmit: false ayarlandı
# Vite build kullanılıyor, tsc build kaldırıldı
```

#### 3. API Routes 404
```bash
# Çözüm: Environment variables'ı kontrol edin
VITE_API_BASE_URL=/api
```

#### 4. Static Files Yüklenmiyor
```bash
# Çözüm: Vercel.json'da routing kontrolü yapın
"src": "/.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$"
```

### Runtime Hataları

#### 1. API Calls Fail
- `VITE_API_BASE_URL` değerinin `/api` olduğunu kontrol edin
- Browser console'da network tab'ını kontrol edin

#### 2. CORS Errors
- Vercel.json'da CORS headers'ları ayarlandığını kontrol edin
- API response'larında Access-Control headers'ları olduğunu kontrol edin

## 📱 Production URL'leri

Deploy tamamlandıktan sonra:
- **Frontend**: `https://your-project-name.vercel.app`
- **API**: `https://your-project-name.vercel.app/api/health`
- **Dashboard**: `https://your-project-name.vercel.app/dashboard`

## 🎯 Test Checklist

Deploy sonrası test edin:
- [ ] Ana sayfa yükleniyor
- [ ] API health check çalışıyor: `/api/health`
- [ ] Dashboard sayfası açılıyor
- [ ] Hasta listesi yükleniyor
- [ ] Yeni hasta ekleme çalışıyor
- [ ] Ses kaydı fonksiyonu çalışıyor
- [ ] AI not oluşturma çalışıyor

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
- ✅ Static asset optimization

### Backend:
- ✅ Serverless functions
- ✅ Cold start optimization
- ✅ Error handling
- ✅ Graceful fallbacks
- ✅ 30 saniye timeout

## 🔒 Güvenlik

### Environment Variables:
- ✅ Tüm API keys güvenli şekilde saklanıyor
- ✅ Database credentials şifreleniyor
- ✅ Production ortamında debug bilgileri gizleniyor

### API Security:
- ✅ CORS koruması
- ✅ Request validation
- ✅ Error handling
- ✅ Secure headers

## 📞 Destek

Deployment sorunları için:
1. Vercel build logs'ları kontrol edin
2. Browser console'da hata mesajlarını inceleyin
3. API health check'i test edin: `/api/health`
4. Network tab'ında API calls'ları kontrol edin

### Yaygın Sorunlar:

| Sorun | Çözüm |
|-------|--------|
| Build timeout | Turbo build command'i kontrol et |
| API 404 | VITE_API_BASE_URL="/api" ayarla |
| Static files 404 | Vercel.json routing kontrol et |
| CORS error | Headers konfigürasyonu kontrol et |
| Frontend build fail | TypeScript config kontrol et |

## ✅ Deployment Checklist

- [ ] GitHub repository güncel
- [ ] Environment variables ayarlandı
- [ ] VITE_API_BASE_URL="/api" ayarlandı
- [ ] Database erişilebilir
- [ ] API keys geçerli
- [ ] Build başarılı (hem frontend hem backend)
- [ ] API health check çalışıyor
- [ ] Frontend yükleniyor
- [ ] API calls çalışıyor
- [ ] Tüm özellikler test edildi

---

**🎉 Deployment başarılı! TıpScribe artık production'da çalışıyor.**

### 🔧 Son Düzeltmeler:
1. Frontend ve backend build süreci düzeltildi
2. TypeScript build sorunları çözüldü
3. Turbo build command'i optimize edildi
4. API routing serverless functions için optimize edildi
5. Static files doğru serve ediliyor 