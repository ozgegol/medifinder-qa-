# MediFinder QA — Playwright Test Suite

E2E test suite for [MediFinder](https://www.medifinder.com) — prepared as part of a QA Challenge submission.

## Stack

- [Playwright](https://playwright.dev) `v1.44`
- TypeScript `v5.4`
- Page Object Model pattern

## Project Structure

```
medifinder-qa/
├── pages/
│   ├── HomePage.ts            # Ana sayfa & mini form interactions
│   └── ConsultationModal.ts   # Konsültasyon talebi modal interactions
└── tests/
    └── consultation/
        └── tc001-happy-path.spec.ts   # TC-001 · Pozitif senaryo
```

## Test Coverage

| ID | Akış | Tür | Öncelik |
|----|------|-----|---------|
| TC-001 | Konsültasyon Talebi — tüm zorunlu alanlar dolu, başarılı gönderim | Pozitif | Critical |

## Setup

```bash
npm install
npx playwright install chromium
```

## Çalıştırma

```bash
# Headless
npm test

# Headed (browser görünür)
npm run test:headed

# HTML rapor
npm run test:report
```

## Bilinen Sorunlar

**BUG-004** — Konsültasyon talebi form gönderimi üretim ortamında aralıklı olarak başarısız oluyor.  
TC-001'de submit sonrası adımlar `expect.soft()` ile işaretlenmiştir; bu adımlardaki başarısızlık testin senaryosunu değil, backend instability'yi yansıtır.

## Notlar

- Tüm testler `tr-TR` locale ile çalışır
- Selector stratejisi: önce `getByRole` / `getByLabel` / `getByPlaceholder` (erişilebilirlik tabanlı), gerektiğinde CSS selector
- Başarısız testlerde screenshot ve trace otomatik kaydedilir (`test-results/`)
