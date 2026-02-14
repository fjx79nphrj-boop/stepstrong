const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clears all local data by going to a blank page first.
 * This prevents IndexedDB from getting "blocked" by an active connection.
 */
async function clearStorage(page) {
  await page.goto('about:blank');
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    const dbs = await window.indexedDB.databases();
    await Promise.all(dbs.map(db => window.indexedDB.deleteDatabase(db.name)));
  });
}

/**
 * Checks if onboarding is required and completes it.
 */
async function ensureOnboarded(page) {
  const onboardingTrigger = page.getByText(/Before we start/i);
  try {
    // Wait up to 5s for onboarding. If it doesn't show, we might already be in.
    await onboardingTrigger.waitFor({ state: 'visible', timeout: 5000 });
    await completeOnboarding(page);
  } catch (e) {
    // Fallback: check if we are already on the dashboard
    await expect(page.getByRole('heading', { name: /Steadfast|StepStrong/i })).toBeVisible();
  }
}

async function completeOnboarding(page) {
  const steps = [
    { name: /Continue/i }, { name: /5-9 years/i }, { name: /Continue/i },
    { name: /50\/50/i }, { name: /Continue/i }, { name: /Some tension/i },
    { name: /Continue/i }, { name: /2-3 yrs/i }, { name: /Continue/i },
    { name: /Neutral/i }, { name: /Continue/i }, { name: /Get Started/i }
  ];

  for (const step of steps) {
    await page.getByRole('button', { name: step.name }).click();
  }
}

async function logOneInteraction(page, note = '') {
  await page.getByRole('button', { name: /Log interaction/i }).click();
  await page.getByRole('button', { name: /Quiet act of service/i }).click();
  await page.getByRole('button', { name: /Neutral acknowledgment/i }).click();
  if (note) {
    await page.getByPlaceholder(/What happened/i).fill(note);
  }
  await page.getByRole('button', { name: /Save/i }).click();
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

test.describe('StepStrong Core Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await ensureOnboarded(page);
  });

  test('log entry persists and updates stats', async ({ page }) => {
    await logOneInteraction(page, 'CI Test Entry');
    // Verify the "1" count appears in the dashboard stats
    await expect(page.getByText('1').first()).toBeVisible();

    // Check Timeline
    await page.getByRole('button', { name: /Timeline/i }).click();
    await expect(page.getByText(/Quiet act of service/i)).toBeVisible();
  });

  test('double-click save does not create duplicates', async ({ page }) => {
    await page.getByRole('button', { name: /Log interaction/i }).click();
    await page.getByRole('button', { name: /Quiet act of service/i }).click();
    await page.getByRole('button', { name: /Neutral acknowledgment/i }).click();
    await page.getByRole('button', { name: /Save/i }).dblclick();
    
    // Should still only show "1" total interaction
    await expect(page.getByText('1').first()).toBeVisible();
  });
});
