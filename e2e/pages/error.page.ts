import { expect, type Locator, type Page } from '@playwright/test';

export class ErrorPage {
  readonly page: Page;

  readonly heading: Locator;

  readonly errorText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText('Внимание, тут что-то не так!');
    this.errorText = page.getByText('Oops! Something went wrong!');
  }

  async open() {
    await this.page.goto('/error');
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.errorText).toBeVisible();
  }
}
