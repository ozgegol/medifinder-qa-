import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for MediFinder homepage (/tr/)
 * Covers the mini consultation form in the "Kararsız mısınız?" section.
 */
export class HomePage {
  readonly page: Page;

  // Mini form fields
  readonly adInput: Locator;
  readonly soyadInput: Locator;
  readonly consultationButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.adInput = page.getByPlaceholder('Ad');
    this.soyadInput = page.getByPlaceholder('Soyad');
    this.consultationButton = page.getByRole('button', { name: /Konsültasyon talebi/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/tr/');
    await this.page.waitForLoadState('networkidle');
  }

  async scrollToConsultationSection(): Promise<void> {
    await this.consultationButton.scrollIntoViewIfNeeded();
  }

  async fillMiniForm(ad: string, soyad: string): Promise<void> {
    await this.adInput.fill(ad);
    await this.soyadInput.fill(soyad);
    await expect(this.adInput).toHaveValue(ad);
    await expect(this.soyadInput).toHaveValue(soyad);
  }

  async openConsultationModal(): Promise<void> {
    await this.consultationButton.click();
  }
}
