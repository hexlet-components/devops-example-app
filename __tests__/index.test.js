const appUrl = 'http://localhost:5000';

describe('app', () => {
  it('main page opens', async () => {
    await page.goto(appUrl);
    await page.waitForSelector('p[class="lead"]');
    await expect(page).toMatch('Привет от Хекслета!');
    await expect(page).toMatch('Приложение запущено на сервере: 10.10.10.10');
  });
});
