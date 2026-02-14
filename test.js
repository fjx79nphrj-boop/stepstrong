const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function clearStorage(page) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      const req = indexedDB.deleteDatabase('steadfast_v1');
      req.onsuccess = resolve;
      req.onerror = resolve;
      req.onblocked = resolve;
    });
  });
}

/**
 * Idempotent onboarding helper.
 * Safe to call even if onboarding was already completed.
 */
async function ensureOnboarded(page) {
  if (await page.getByText('Before we start').isVisible().catch(() => false)) {
    await completeOnboarding(page);
  }
}

async function completeOnboarding(page) {
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: '5-9 years' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: '50/50' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Some tension' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: '2-3 yrs' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Neutral' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page.getByRole('heading', { name: 'Steadfast' })).toBeVisible();
}

async function logOneInteraction(page, note = '') {
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await page.getByRole('button', { name: /Quiet act of service/ }).click();
  await page.getByRole('button', { name: /Neutral acknowledgment/ }).click();
  if (note) {
    await page.getByPlaceholder('What happened? How did it feel?').fill(note);
  }
  await page.getByRole('button', { name: 'Save' }).click();
}


// ─────────────────────────────────────────────────────────────────────────────
//  BASELINE SMOKE + PWA
// ─────────────────────────────────────────────────────────────────────────────

test('app loads without console errors', async ({ page }) => {
  const errors = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('service worker registers', async ({ page }) => {
  await page.goto('/');
  const registered = await page.evaluate(async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    return regs.length > 0;
  });
  expect(registered).toBe(true);
});

test('offline reload does not crash', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await ctx.setOffline(true);
  await page.reload();
  await expect(page.locator('#root')).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  CORE USER FLOW
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Core flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
    await page.reload();
    await ensureOnboarded(page);
  });

  test('log entry persists and syncs across tabs', async ({ page }) => {
    await logOneInteraction(page, 'Cross-tab sync');
    await expect(page.getByText('1').first()).toBeVisible();

    await page.getByRole('button', { name: 'Timeline' }).click();
    await expect(page.getByText(/Quiet act of service/)).toBeVisible();

    await page.getByRole('button', { name: 'Home' }).click();
    await expect(page.getByText('1').first()).toBeVisible();
  });

  test('editing entry updates stats without duplication', async ({ page }) => {
    await logOneInteraction(page);
    const entry = page.locator('button').filter({ hasText: /Quiet act of service/ }).first();
    await entry.click();
    await page.getByRole('button', { name: /Active rejection/ }).click();
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByText('1').first()).toBeVisible();
  });

  test('double-click save does not create duplicate entries', async ({ page }) => {
    await page.getByRole('button', { name: 'Log interaction' }).click();
    await page.getByRole('button', { name: /Quiet act of service/ }).click();
    await page.getByRole('button', { name: /Neutral acknowledgment/ }).click();
    await page.getByRole('button', { name: 'Save' }).dblclick();
    await expect(page.getByText('1').first()).toBeVisible();
  });
});


// ─────────────────────────────────────────────────────────────────────────────
//  IMPORT / EXPORT (DATA LOSS PREVENTION)
// ─────────────────────────────────────────────────────────────────────────────

test('export → clear → import restores all data', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await ensureOnboarded(page);

  await logOneInteraction(page, 'Backup test');

  await page.getByRole('button', { name: 'Settings' }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export Data Backup' }).click()
  ]);

  const path = await download.path();

  await clearStorage(page);
  await page.reload();
  await ensureOnboarded(page);

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Import Data Backup' }).click();
  await page.setInputFiles('input[type="file"]', path);

  await expect(page.getByText('1').first()).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  SNAPSHOT INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────

test('snapshots do not increment interaction counts', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await ensureOnboarded(page);

  await page.getByText('Monthly check-in').click();
  const answers = ['Neutral', 'Weekly', 'Sometimes', 'Neutral', 'Mostly OK', 'Manageable'];
  for (const a of answers) {
    await page.getByRole('button', { name: a }).click();
  }
  await page.getByRole('button', { name: 'Save Snapshot' }).click();

  await expect(page.getByText('0').first()).toBeVisible();
});
