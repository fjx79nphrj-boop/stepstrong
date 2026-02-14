const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clears all local data. 
 * Fix: We go to the homepage FIRST so the browser gives us permission 
 * to access localStorage and IndexedDB.
 */
async function clearStorage(page) {
  await page.goto('/'); 
  await page.evaluate(async () => {
    // Clear standard storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear the IndexedDB database
    const dbs = await window.indexedDB.databases();
    for (const db of dbs) {
      await new Promise((resolve) => {
        const req = window.indexedDB.deleteDatabase(db.name);
        req.onsuccess = resolve;
        req.onerror = resolve;
        req.onblocked = resolve;
      });
    }
  });
  // Reload to ensure the app sees the empty state
  await page.reload();
}

/**
 * Checks if onboarding is required and completes it.
 */
async function ensureOnboarded(page) {
  const onboardingTrigger = page.getByText(/Before we start/i);
  try {
    // Wait up to 5s for onboarding.
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
    await page.waitForLoadState('domcontentloaded');
    await ensureOnboarded(page);
  });

  test('log entry persists and updates stats', async ({ page }) => {
    await logOneInteraction(page, 'CI Test Entry');
    // Verify the "1" count appears
    await expect(page.getByText('1').first()).toBeVisible();

    // Check Timeline
    await page.getByRole('button', { name: /Timeline/i }).click();
    await expect(page.getByText(/Quiet act of service/i)).toBeVisible();
  });

  test('double-click save does not create duplicates', async ({ page }) => {
    await page.getByRole('button', { name: /Log interaction/i }).click();
    await page.getByRole('button', { name: /Quiet act of service/i }).click();
    await page.getByRole('button', { name: /Neutral acknowledgment/i }).click();
    
    // Force a double click to test the "duplicate entry" bug
    await page.getByRole('button', { name: /Save/i }).dblclick();
    
    // We expect only ONE entry, so the count should be "1"
    await expect(page.getByText('1').first()).toBeVisible();
  });
});
