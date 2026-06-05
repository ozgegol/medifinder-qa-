import { type Page, type Locator, expect } from '@playwright/test';

export class ConsultationModal {
  readonly page: Page;

  readonly serviceSearchInput: Locator;
  readonly countrySearchInput: Locator;
  readonly adInput: Locator;
  readonly soyadInput: Locator;
  readonly emailInput: Locator;
  readonly phoneNumberInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.serviceSearchInput  = page.getByPlaceholder('Hizmet ara');
    this.countrySearchInput  = page.getByPlaceholder('Ülke ara');
    this.emailInput          = page.getByPlaceholder('E-posta adresi');
    this.phoneNumberInput    = page.getByPlaceholder('Telefon numarası');
    this.submitButton        = page.getByRole('button', { name: /^Gönder$/i });
    this.adInput             = page.getByPlaceholder('Ad', { exact: true }).last();
    this.soyadInput          = page.getByPlaceholder('Soyad', { exact: true }).last();
  }

  async expectVisible(): Promise<void> {
    await expect(this.serviceSearchInput).toBeVisible({ timeout: 8_000 });
    await expect(this.submitButton).toBeVisible();
  }

  async selectService(searchTerm: string, serviceLabel: string): Promise<void> {
    await this.serviceSearchInput.fill(searchTerm);
    await this.page.getByRole('button', { name: serviceLabel, exact: true }).click();
  }

  async selectCountry(countryName: string): Promise<void> {
    await this.page.getByRole('button', { name: countryName }).first().click();
  }

  async selectTimeRange(optionText: string): Promise<void> {
    await this.page.getByRole('button', { name: optionText }).click();
  }

  async expectNamePreFilled(expectedAd: string, expectedSoyad: string): Promise<void> {
    await expect(this.adInput).toHaveValue(expectedAd);
    await expect(this.soyadInput).toHaveValue(expectedSoyad);
  }

  async fillContactInfo(email: string, phoneNumber: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.phoneNumberInput.fill(phoneNumber);
    await expect(this.emailInput).toHaveValue(email);
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async expectSuccessNotification(): Promise<void> {
    const success = this.page.getByText(/teşekkür|başarı|talebin.*alındı/i);
    await expect(success).toBeVisible({ timeout: 10_000 });
  }

  async expectModalClosed(): Promise<void> {
    await expect(this.serviceSearchInput).not.toBeVisible({ timeout: 8_000 });
  }
}
