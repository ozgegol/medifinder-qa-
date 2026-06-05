import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { ConsultationModal } from '../../pages/ConsultationModal';

/**
 * TC-001 · Konsültasyon Talebi — Tüm Zorunlu Alanlar Eksiksiz Doldurularak Başarılı Gönderim
 *
 * Akış   : Consultation Request (Happy Path)
 * Tür    : Pozitif
 * Öncelik: Critical
 *
 * Önkoşullar:
 *  - Kullanıcı giriş yapmış durumda
 *  - Tarayıcı önbelleği temizlenmiş, önceki form verisi yok
 *  - Ağ bağlantısı stabil
 *
 * Bilinen sorun:
 *  BUG-004 — Form gönderimi üretim ortamında aralıklı olarak başarısız oluyor.
 *  Submit sonrası adımlar soft assertion ile işaretlenmiştir; bu adımlardaki başarısızlık
 *  testin kendisini değil, mevcut backend instability'yi yansıtır.
 */

const TEST_DATA = {
  ad:          'Özge',
  soyad:       'Test',
  serviceKw:   'saç',
  serviceName: 'Saç Ekimi',
  country:     'Almanya',
  timeRange:   '1-3 hafta',
  email:       'ozge@test.com',
  phone:       '5386428422',
} as const;

test.describe('Consultation Request', () => {

  test('TC-001 · Tüm zorunlu alanlar dolu — başarılı form gönderimi', async ({ page }) => {
    const homePage = new HomePage(page);
    const modal    = new ConsultationModal(page);

    // ── Step 1-2: Ana sayfaya git ────────────────────────────────────────────
    await test.step('Ana sayfayı aç ve başlık doğrula', async () => {
      await homePage.goto();
      await expect(page).toHaveTitle(/MediFinder/i);
    });

    // ── Step 3: Mini formu doldur ────────────────────────────────────────────
    await test.step('Mini formda Ad ve Soyad doldur', async () => {
      await homePage.scrollToConsultationSection();
      await homePage.fillMiniForm(TEST_DATA.ad, TEST_DATA.soyad);
    });

    // ── Step 4: Modalı aç ───────────────────────────────────────────────────
    await test.step('Konsültasyon talebi butonuna tıkla — modal açılmalı', async () => {
      await homePage.openConsultationModal();
      await modal.expectVisible();
    });

    // ── Step 5: Hizmet seç ──────────────────────────────────────────────────
    await test.step(`Hizmet ara: "${TEST_DATA.serviceKw}" → "${TEST_DATA.serviceName}" seç`, async () => {
      await modal.selectService(TEST_DATA.serviceKw, TEST_DATA.serviceName);
    });

    // ── Step 6: Ülke seç ────────────────────────────────────────────────────
    await test.step(`Ülke seç: ${TEST_DATA.country}`, async () => {
      await modal.selectCountry(TEST_DATA.country);
    });

    // ── Step 7: Zaman aralığı seç ───────────────────────────────────────────
    await test.step(`Zaman aralığı seç: ${TEST_DATA.timeRange}`, async () => {
      await modal.selectTimeRange(TEST_DATA.timeRange);
    });

    // ── Step 9: Ad/Soyad mini formdan taşınmış olmalı ───────────────────────
    await test.step('Ad/Soyad değerleri modalın iletişim sütununa taşınmış olmalı', async () => {
      await modal.expectNamePreFilled(TEST_DATA.ad, TEST_DATA.soyad);
    });

    // ── Step 10-11: İletişim bilgilerini doldur ──────────────────────────────
    await test.step('E-posta ve telefon bilgilerini doldur', async () => {
      await modal.fillContactInfo(TEST_DATA.email, TEST_DATA.phone);
    });

    // ── Step 12: Gönder butonu aktif olmalı ─────────────────────────────────
    await test.step('Tüm alanlar dolu — Gönder butonu aktif (enabled) olmalı', async () => {
      await modal.expectSubmitEnabled();
    });

    // ── Step 13-14: Gönder ve başarı doğrula ────────────────────────────────
    // NOT: BUG-004 nedeniyle submit aşaması production'da aralıklı başarısız olabilir.
    await test.step('Formu gönder ve başarı bildirimini doğrula', async () => {
      await modal.submit();

      // Soft assertion — BUG-004 aktif olduğunda bu adım başarısız olabilir.
      // Bu, test senaryosunun değil, backend davranışının bir yansımasıdır.
      await expect
        .soft(page.getByText(/teşekkür|başarı|talebin.*alındı/i), 'BUG-004: Başarı bildirimi bekleniyordu — form gönderilemedi (intermittent)')
        .toBeVisible({ timeout: 10_000 });

      // Başarılı gönderim sonrası modal kapanmış olmalı
      await expect
        .soft(modal.serviceSearchInput, 'BUG-004: Modal kapanmamış olabilir')
        .not.toBeVisible({ timeout: 8_000 });
    });
  });

});
