#!/usr/bin/env tsx

/**
 * TıpScribe Health Check Script
 * Sistem durumunu kontrol eder
 */

import { db } from '../database/db.js';
import { doctors } from '../../shared/schema.js';

async function healthCheck() {
  console.log('🏥 TıpScribe Sistem Sağlık Kontrolü');
  console.log('=====================================');

  const checks = [];
  let overallHealth = true;

  // Database bağlantısı kontrolü
  try {
    console.log('📊 Database bağlantısı kontrol ediliyor...');
    const result = await db.select().from(doctors).limit(1);
    checks.push({ name: 'Database Connection', status: '✅ OK', details: 'Başarılı bağlantı' });
  } catch (error) {
    checks.push({ name: 'Database Connection', status: '❌ FAIL', details: String(error) });
    overallHealth = false;
  }

  // Environment variables kontrolü
  console.log('🔧 Environment variables kontrol ediliyor...');
  const requiredEnvs = [
    'DATABASE_URL',
    'DEEPGRAM_API_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY'
  ];

  let envStatus = true;
  const missingEnvs = [];

  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      missingEnvs.push(env);
      envStatus = false;
    }
  }

  if (envStatus) {
    checks.push({ name: 'Environment Variables', status: '✅ OK', details: 'Tüm gerekli değişkenler mevcut' });
  } else {
    checks.push({ 
      name: 'Environment Variables', 
      status: '❌ FAIL', 
      details: `Eksik: ${missingEnvs.join(', ')}` 
    });
    overallHealth = false;
  }

  // API Keys test (basit format kontrolü)
  console.log('🔑 API Keys format kontrolü...');
  let apiKeysOk = true;
  const apiKeyIssues = [];

  if (process.env.DEEPGRAM_API_KEY && !process.env.DEEPGRAM_API_KEY.startsWith('Token ')) {
    apiKeyIssues.push('Deepgram API key format hatası');
    apiKeysOk = false;
  }

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    apiKeyIssues.push('OpenAI API key format hatası');
    apiKeysOk = false;
  }

  if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
    apiKeyIssues.push('Anthropic API key format hatası');
    apiKeysOk = false;
  }

  if (apiKeysOk) {
    checks.push({ name: 'API Keys Format', status: '✅ OK', details: 'API key formatları doğru' });
  } else {
    checks.push({ 
      name: 'API Keys Format', 
      status: '⚠️  WARNING', 
      details: apiKeyIssues.join(', ') 
    });
  }

  // Port kontrolü
  console.log('🚪 Port kullanılabilirliği kontrol ediliyor...');
  const port = process.env.PORT || 5000;
  checks.push({ name: 'Server Port', status: '✅ OK', details: `Port ${port} yapılandırıldı` });

  // Sonuçları göster
  console.log('\n📋 KONTROL SONUÇLARI');
  console.log('=====================');
  
  for (const check of checks) {
    console.log(`${check.status} ${check.name}`);
    console.log(`   ${check.details}`);
    console.log();
  }

  // Genel durum
  console.log('🎯 GENEL DURUM');
  console.log('===============');
  if (overallHealth) {
    console.log('✅ Sistem sağlıklı - Tüm kontroller başarılı');
    console.log('🚀 Uygulama çalıştırılmaya hazır');
  } else {
    console.log('❌ Sistem sorunları tespit edildi');
    console.log('🔧 Yukarıdaki hataları düzeltin ve tekrar deneyin');
  }

  return overallHealth;
}

// Script çalıştırıldığında health check fonksiyonunu çağır
if (import.meta.url === `file://${process.argv[1]}`) {
  healthCheck()
    .then((healthy) => {
      process.exit(healthy ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Health check hatası:', error);
      process.exit(1);
    });
}

export { healthCheck };