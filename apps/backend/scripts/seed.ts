#!/usr/bin/env tsx

/**
 * TıpScribe Database Seed Script
 * Test verilerini veritabanına yükler
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file
config({ path: path.resolve(process.cwd(), '../../.env') });

import { db, doctors, patients, medicalTemplates } from '@repo/db';

async function seed() {
  console.log('🌱 Database seed başlatılıyor...');

  try {
    // Test doktoru oluştur
    console.log('👨‍⚕️ Doktor verisi ekleniyor...');
    await db.insert(doctors).values({
      name: 'Dr. Mehmet Yılmaz',
      specialty: 'Dahiliye',
      email: 'mehmet.yilmaz@tipscribe.com',
      licenseNumber: 'TR123456789'
    }).onConflictDoNothing();

    // Test hastaları oluştur
    console.log('👥 Hasta verileri ekleniyor...');
    const testPatients = [
      {
        name: 'Ahmet',
        surname: 'Yılmaz',
        tcKimlik: '12345678901',
        birthDate: new Date('1980-05-15'),
        gender: 'erkek',
        phone: '+90 555 111 2233',
        email: 'ahmet.yilmaz@email.com',
        address: 'Çankaya, Ankara'
      },
      {
        name: 'Fatma',
        surname: 'Kaya',
        tcKimlik: '98765432109',
        birthDate: new Date('1975-08-22'),
        gender: 'kadın',
        phone: '+90 555 444 5566',
        email: 'fatma.kaya@email.com',
        address: 'Kadıköy, İstanbul'
      },
      {
        name: 'Mehmet',
        surname: 'Demir',
        tcKimlik: '11223344556',
        birthDate: new Date('1990-12-03'),
        gender: 'erkek',
        phone: '+90 555 777 8899',
        email: 'mehmet.demir@email.com',
        address: 'Konak, İzmir'
      },
      {
        name: 'Ayşe',
        surname: 'Öztürk',
        tcKimlik: '55667788990',
        birthDate: new Date('1985-03-18'),
        gender: 'kadın',
        phone: '+90 555 000 1122',
        email: 'ayse.ozturk@email.com',
        address: 'Nilüfer, Bursa'
      }
    ];

    for (const patient of testPatients) {
      await db.insert(patients).values(patient).onConflictDoNothing();
    }

    // Tıbbi şablonları oluştur
    console.log('📋 Tıbbi şablonlar ekleniyor...');
    const templates = [
      {
        name: 'Dahiliye Genel Muayene',
        description: 'Dahiliye branşı için genel muayene şablonu',
        specialty: 'Dahiliye',
        structure: {
          subjective: {
            complaint: 'Ana şikayet',
            currentComplaints: 'Mevcut şikayetler detayı',
            medicalHistory: 'Tıbbi geçmiş bilgileri',
            medications: 'Kullandığı ilaçlar',
            socialHistory: 'Sosyal anamnez',
            reviewOfSystems: 'Sistem sorgulaması'
          },
          objective: {
            vitalSigns: 'Vital bulgular (nabız, tansiyon, ateş)',
            physicalExam: 'Fizik muayene bulguları',
            diagnosticResults: 'Tetkik ve analiz sonuçları'
          },
          assessment: {
            general: 'Genel değerlendirme',
            diagnoses: 'Tanılar ve ICD-10 kodları'
          },
          plan: {
            treatment: 'Tedavi planı',
            medications: 'İlaç tedavisi',
            followUp: 'Takip planı',
            lifestyle: 'Yaşam tarzı önerileri'
          }
        }
      },
      {
        name: 'Kardiyoloji Konsültasyonu',
        description: 'Kardiyoloji konsültasyon şablonu',
        specialty: 'Kardiyoloji',
        structure: {
          subjective: {
            complaint: 'Kardiyovasküler şikayetler',
            currentComplaints: 'Göğüs ağrısı, nefes darlığı, çarpıntı detayları',
            medicalHistory: 'Kardiyak geçmiş, risk faktörleri',
            medications: 'Kardiyovasküler ilaçlar',
            socialHistory: 'Sigara, alkol, egzersiz alışkanlıkları'
          },
          objective: {
            vitalSigns: 'Kan basıncı, nabız, oksijen saturasyonu',
            physicalExam: 'Kardiyak muayene, periferik nabızlar',
            diagnosticResults: 'EKG, ekokardiyografi, lab sonuçları'
          },
          assessment: {
            general: 'Kardiyovasküler risk değerlendirmesi',
            diagnoses: 'Kardiyak tanılar'
          },
          plan: {
            treatment: 'Kardiyak tedavi yaklaşımı',
            medications: 'Antihipertansif, antikoagülan, diğer',
            followUp: 'Kardiyoloji takip programı',
            lifestyle: 'Diyet, egzersiz, yaşam tarzı önerileri'
          }
        }
      },
      {
        name: 'Çocuk Sağlığı Kontrolleri',
        description: 'Pediatri rutin kontrol şablonu',
        specialty: 'Çocuk Sağlığı ve Hastalıkları',
        structure: {
          subjective: {
            complaint: 'Ebeveyn şikayetleri',
            currentComplaints: 'Beslenme, uyku, gelişim sorunları',
            medicalHistory: 'Doğum hikayesi, geçmiş hastalıklar',
            medications: 'Vitamin, ilaç kullanımı',
            socialHistory: 'Aile yapısı, sosyal çevre'
          },
          objective: {
            vitalSigns: 'Boy, kilo, baş çevresi, vital bulgular',
            physicalExam: 'Sistemik pediatrik muayene',
            diagnosticResults: 'Gelişim testleri, lab sonuçları'
          },
          assessment: {
            general: 'Büyüme-gelişim değerlendirmesi',
            diagnoses: 'Pediatrik tanılar'
          },
          plan: {
            treatment: 'Tedavi önerileri',
            medications: 'Çocuk dozajında ilaçlar',
            followUp: 'Aşı takvimi, kontrol planı',
            lifestyle: 'Beslenme, eğitim önerileri'
          }
        }
      }
    ];

    for (const template of templates) {
      await db.insert(medicalTemplates).values(template).onConflictDoNothing();
    }

    console.log('✅ Seed veriler başarıyla yüklendi!');
    console.log('📊 Yüklenen veriler:');
    console.log('   - 1 Doktor');
    console.log('   - 4 Hasta');
    console.log('   - 3 Tıbbi Şablon');
    
  } catch (error) {
    console.error('❌ Seed işlemi başarısız:', error);
    process.exit(1);
  }
}

// Script çalıştırıldığında seed fonksiyonunu çağır
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log('🎉 Database seed tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { seed };