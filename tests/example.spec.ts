import { test, expect } from '@playwright/test';

test('StepStrong PWA loads', async ({ page }) => {
  await page.goto('https://stepstrong.netlify.app/');
  await expect(page.locator('html')).toBeVisible();
});
