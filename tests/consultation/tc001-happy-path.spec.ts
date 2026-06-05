import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { ConsultationModal } from '../../pages/ConsultationModal';

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

    await test.step('Ana sayfayı aç ve başlık doğrula', async () => {
      await homePage.goto();
      await expect(page).toHaveTitle(/MediFinder/i);
    });

    await test.step('Mini formda Ad ve Soyad doldur', async () => {
      await homePage.scrollToConsultationSection();
      await homePage.fillMiniForm(TEST_DATA.ad, TEST_DATA.soyad);
    });

    await test.step('Konsültasyon talebi butonuna tıkla — modal açılmalı', async () => {
      await homePage.openConsultationModal();
      await modal.expectVisible();
    });

    await test.step(`Hizmet ara: "${TEST_DATA.serviceKw}" → "${TEST_DATA.serviceName}" seç`, async () => {
      await modal.selectService(TEST_DATA.serviceKw, TEST_DATA.serviceName);
    });

    await test.step(`Ülke seç: ${TEST_DATA.country}`, async () => {
      await modal.selectCountry(TEST_DATA.country);
    });

    await test.step(`Zaman aralığı seç: ${TEST_DATA.timeRange}`, async () => {
      await modal.selectTimeRange(TEST_DATA.timeRange);
    });

    await test.step('Ad/Soyad değerleri modalın iletişim sütununa taşınmış olmalı', async () => {
      await modal.expectNamePreFilled(TEST_DATA.ad, TEST_DATA.soyad);
    });

    await test.step('E-posta ve telefon bilgilerini doldur', async () => {
      await modal.fillContactInfo(TEST_DATA.email, TEST_DATA.phone);
    });

    await test.step('Tüm alanlar dolu — Gönder butonu aktif (enabled) olmalı', async () => {
      await modal.expectSubmitEnabled();
    });

    // NOT: BUG-004 nedeniyle submit sonrası adımlar soft assertion.
    await test.step('Formu gönder ve başarı bildirimini doğrula', async () => {
      await modal.submit();

      // Regex daraltıldı: "başarı" yerine daha spesifik pattern
      // (sayfa zemininde "yüksek başarı" metni bulunduğundan false positive önlendi)
      await expect
        .soft(
          page.getByText(/teşekkür|talebin.*alındı|başarıyla.*gönderildi/i).first(),
          'BUG-004: Başarı bildirimi bekleniyordu — form gönderilemedi (intermittent)'
        )
        .toBeVisible({ timeout: 10_000 });

      await expect
        .soft(modal.serviceSearchInput, 'BUG-004: Modal kapanmamış olabilir')
        .not.toBeVisible({ timeout: 8_000 });
    });
  });

});
