import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  readonly heading: Locator;

  readonly message: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText('Привет от Хекслета!');
    this.message = page.locator('.lead');
  }

  async open() {
    await this.page.goto('/');
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.message).toBeVisible();
  }
}
