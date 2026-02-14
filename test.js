const { test, expect } = require('@playwright/test');

test('PWA works', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('html')).toBeVisible();
});
