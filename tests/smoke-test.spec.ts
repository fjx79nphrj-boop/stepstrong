import { test, expect } from '@playwright/test';

test('PWA loads on Netlify ', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('https://stepstrong.netlify.app/');
});
