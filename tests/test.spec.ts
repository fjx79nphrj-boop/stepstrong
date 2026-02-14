const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
  await page.goto('https://stepstrong.netlify.app/');
  await expect(page).toHaveURL('https://stepstrong.netlify.app/**');
});
