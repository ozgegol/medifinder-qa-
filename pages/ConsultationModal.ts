import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for the Consultation Request modal.
 *
 * The modal is structured in 3 columns:
 *  Left   — Service selection (search + checkbox list)
 *  Middle — Country selection + time range + budget slider
 *  Right  — Contact info (name, email, phone)
 */
export class ConsultationModal {
  readonly page: Page;

  // Left column — service
  readonly serviceSearchInput: Locator;

  // Middle column — destination & timing
  readonly countrySearchInput: Locator;

  // Right column — contact info
  readonly adInput: Locator;
  readonly soyadInput: Locator;
  readonly emailInput: Locator;
  readonly phoneNumberInput: Locator;

  // Submit
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.serviceSearchInput  = page.getByPlaceholder('Hizmet ara');
    this.countrySearchInput  = page.getByPlaceholder('Ülke ara');
    this.emailInput          = page.getByPlaceholder('E-posta adresi');
    this.phoneNumberInput    = page.getByPlaceholder('Telefon numarası');
    this.submitButton        = page.getByRole('button', { name: /^Gönder$/i });

    // Name fields in the modal's right column
    this.adInput    = page.getByPlaceholder('Ad').last();
    this.soyadInput = page.getByPlaceholder('Soyad').last();
  }

  /** Assert the modal is visible */
  async expectVisible(): Promise<void> {
    await expect(this.serviceSearchInput).toBeVisible({ timeout: 8_000 });
    await expect(this.submitButton).toBeVisible();
  }

  /** Search for a service and select the matching checkbox */
  async selectService(searchTerm: string, serviceLabel: string): Promise<void> {
    await this.serviceSearchInput.fill(searchTerm);
    await this.page.getByLabel(serviceLabel).check();
    await expect(this.page.getByLabel(serviceLabel)).toBeChecked();
  }

  /** Select a country from the list (uses search for reliability) */
  async selectCountry(countryName: string): Promise<void> {
    await this.countrySearchInput.fill(countryName);
    await this.page.getByLabel(countryName).first().check();
    await expect(this.page.getByLabel(countryName).first()).toBeChecked();
  }

  /** Click a time-range option button */
  async selectTimeRange(optionText: string): Promise<void> {
    await this.page.getByRole('button', { name: optionText }).click();
  }

  /**
   * Verify that Ad/Soyad values entered in the mini form
   * were correctly pre-populated in the modal's right column.
   */
  async expectNamePreFilled(expectedAd: string, expectedSoyad: string): Promise<void> {
    await expect(this.adInput).toHaveValue(expectedAd);
    await expect(this.soyadInput).toHaveValue(expectedSoyad);
  }

  /** Fill contact info fields */
  async fillContactInfo(email: string, phoneNumber: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.phoneNumberInput.fill(phoneNumber);
    await expect(this.emailInput).toHaveValue(email);
  }

  /** Assert submit button is enabled */
  async expectSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  /** Assert submit button is disabled */
  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  /** Click submit */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Wait for success notification.
   *
   * NOTE: BUG-004 — form submission is intermittently failing in production.
   * This assertion uses a soft check so the rest of the report remains informative
   * even when the backend returns an error. The bug is documented separately.
   */
  async expectSuccessNotification(): Promise<void> {
    const success = this.page.getByText(/teşekkür|başarı|talebin.*alındı/i);
    await expect(success).toBeVisible({ timeout: 10_000 });
  }

  /** Check whether the modal is still open (used after submission) */
  async expectModalClosed(): Promise<void> {
    await expect(this.serviceSearchInput).not.toBeVisible({ timeout: 8_000 });
  }
}
