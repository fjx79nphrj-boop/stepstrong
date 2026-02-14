import { test, expect } from '@playwright/test';

test('My PWA loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.Steadfast/);  // Change to your app's title
});
