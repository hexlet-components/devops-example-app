import { test } from '@playwright/test';

import { ErrorPage } from '../pages/error.page.js';
import { HomePage } from '../pages/home.page.js';

test.describe('Application smoke tests', () => {
  test('home page renders without crash', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.open();
    await homePage.expectLoaded();
  });

  test('error route renders fallback page', async ({ page }) => {
    const errorPage = new ErrorPage(page);

    await errorPage.open();
    await errorPage.expectLoaded();
  });
});
