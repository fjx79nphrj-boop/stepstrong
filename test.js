const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clears all local data. We navigate to about:blank first to ensure
 * no active connections to IndexedDB are held by the app.
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
    // Short wait to see if onboarding appears; if not, we assume we're already in.
    await onboardingTrigger.waitFor({ state: 'visible', timeout: 5000 });
    await completeOnboarding(page);
  } catch (e) {
    // If it doesn't appear, check if we're already on the dashboard
    await expect(page.getByRole('heading', { name: /Steadfast|StepStrong/i })).toBeVisible();
  }
}

async function completeOnboarding(page) {
  const steps = [
    { button: /Continue/i },
    { button: /5-9 years/i },
    { button: /Continue/i },
    { button: /50\/50/i },
    { button: /Continue/i },
    { button: /Some tension/i },
    { button: /Continue/i },
    { button: /2-3 yrs/i },
    { button: /Continue/i },
    { button: /Neutral/i },
    { button: /Continue/i },
    { button: /Get Started/i }
  ];

  for (const step of steps) {
    await page.getByRole('button', { name: step.button }).click();
  }
  await expect(page.getByRole('heading', { name: /Steadfast|StepStrong/i })).toBeVisible();
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
//  SMOKE TESTS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Baseline Integrity', () => {
  test('app loads without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
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
});

// ─────────────────────────────────────────────────────────────────────────────
//  CORE USER FLOW
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Core flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await ensureOnboarded(page);
  });

  test('log entry persists and updates stats', async ({ page }) => {
    await logOneInteraction(page, 'Cross-tab sync');
    // Check for the "1" count in the circular progress/stat
    await expect(page.getByText('1').first()).toBeVisible();

    await page.getByRole('button', { name: /Timeline/i }).click();
    await expect(page.getByText(/Quiet act of service/i)).toBeVisible();

    await page.getByRole('button', { name: /Home/i }).click();
    await expect(page.getByText('1').first()).toBeVisible();
  });

  test('editing entry updates stats without duplication', async ({ page }) => {
    await logOneInteraction(page);
    const entry = page.locator('button').filter({ hasText: /Quiet act of service/i }).first();
    await entry.click();
    await page.getByRole('button', { name: /Active rejection/i }).click();
    await page.getByRole('button', { name: /Update/i }).click();
    
    // Total interactions should still be 1
    await expect(page.getByText('1').first()).toBeVisible();
  });

  test('double-click save does not create duplicate entries', async ({ page }) => {
    await page.getByRole('button', { name: /Log interaction/i }).click();
    await page.getByRole('button', { name: /Quiet act of service/i }).click();
    await page.getByRole('button', { name: /Neutral acknowledgment/i }).click();
    await page.getByRole('button', { name: /Save/i }).dblclick();
    
    await expect(page.getByText('1').first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  DATA LOSS PREVENTION
// ─────────────────────────────────────────────────────────────────────────────

test('export → clear → import restores all data', async ({ page }) => {
  await clearStorage(page);
  await page.goto('/');
  await ensureOnboarded(page);

  await logOneInteraction(page, 'Backup test');

  await page.getByRole('button', { name: /Settings/i }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Export Data Backup/i }).click()
  ]);

  const path = await download.path();

  // Wipe and verify empty state
  await clearStorage(page);
  await page.goto('/');
  await ensureOnboarded(page);
  await expect(page.getByText('0').first()).toBeVisible();

  // Import
  await page.getByRole('button', { name: /Settings/i }).click();
  await page.setInputFiles('input[type="file"]', path);

  // Verify data returned
  await page.getByRole('button', { name: /Home/i }).click();
  await expect(page.getByText('1').first()).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
//  SNAPSHOT INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────

test('snapshots do not increment interaction counts', async ({ page }) => {
  await clearStorage(page);
  await page.goto('/');
  await ensureOnboarded(page);

  await page.getByText(/Monthly check-in/i).click();
  const answers = ['Neutral', 'Weekly', 'Sometimes', 'Neutral', 'Mostly OK', 'Manageable'];
  for (const a of answers) {
    await page.getByRole('button', { name: a }).click();
  }
  await page.getByRole('button', { name: /Save Snapshot/i }).click();

  // Snapshots are separate from daily interactions
  await expect(page.getByText('0').first()).toBeVisible();
});
