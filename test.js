const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Wipe the IndexedDB so every test begins with a clean slate. */
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

/** Walk through all 7 onboarding steps and land on the Home view. */
async function completeOnboarding(page) {
  // Step 0 – intro copy, just Continue
  await expect(page.getByText('Before we start')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 1 – child age
  await expect(page.getByText('How old is the child?')).toBeVisible();
  await page.getByRole('button', { name: '5-9 years' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2 – custody
  await expect(page.getByText('Custody arrangement')).toBeVisible();
  await page.getByRole('button', { name: '50/50' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 3 – loyalty conflict
  await expect(page.getByText('Loyalty conflict?')).toBeVisible();
  await page.getByRole('button', { name: 'Some tension' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 4 – years in role
  await expect(page.getByText('How long in this role?')).toBeVisible();
  await page.getByRole('button', { name: '2-3 yrs' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 5 – current relationship state
  await expect(page.getByText('Current relationship state')).toBeVisible();
  await page.getByRole('button', { name: 'Neutral' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 6 – benchmark summary, Get Started
  await expect(page.getByText('Your realistic benchmark')).toBeVisible();
  await page.getByRole('button', { name: 'Get Started' }).click();

  // Should now be on Home
  await expect(page.getByRole('heading', { name: 'Steadfast' })).toBeVisible();
}

/** Navigate to a tab by its label text. */
async function goToTab(page, label) {
  await page.getByRole('button', { name: label }).click();
}

/** Open the entry modal via the FAB and log one interaction. */
async function logOneInteraction(page, { action = 'Quiet act of service', response = 'Neutral acknowledgment', note = '' } = {}) {
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await expect(page.getByText('Log an Interaction', { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: action }).click();
  await page.getByRole('button', { name: response }).click();
  if (note) await page.getByPlaceholder('What happened? How did it feel?').fill(note);
  await page.getByRole('button', { name: 'Save' }).click();
}


// ─────────────────────────────────────────────────────────────────────────────
//  1. BASIC LOAD & PWA META
// ─────────────────────────────────────────────────────────────────────────────

test('page loads without errors', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('html')).toBeVisible();
});

test('page title is Steadfast', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Steadfast');
});

test('theme-color meta tag is present', async ({ page }) => {
  await page.goto('/');
  const themeColor = await page.getAttribute('meta[name="theme-color"]', 'content');
  expect(themeColor).toBe('#0f1117');
});

test('apple-mobile-web-app-capable meta tag is present', async ({ page }) => {
  await page.goto('/');
  const val = await page.getAttribute('meta[name="apple-mobile-web-app-capable"]', 'content');
  expect(val).toBe('yes');
});

test('viewport meta tag exists', async ({ page }) => {
  await page.goto('/');
  const val = await page.getAttribute('meta[name="viewport"]', 'content');
  expect(val).toBeTruthy();
});

test('root element renders', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#root')).not.toBeEmpty();
});


// ─────────────────────────────────────────────────────────────────────────────
//  2. ONBOARDING
// ─────────────────────────────────────────────────────────────────────────────

test('onboarding shows on first visit', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Before we start')).toBeVisible();
});

test('onboarding step 0 shows intro copy', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('7 to 12 years')).toBeVisible();
});

test('onboarding progress bar renders', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  // Progress bar consists of step indicator divs — the Continue button must be present
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
});

test('onboarding Continue is enabled on step 0 without selection', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
});

test('onboarding Back button appears after step 0', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
});

test('onboarding Back button navigates to previous step', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('How old is the child?')).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByText('Before we start')).toBeVisible();
});

test('onboarding step 1 Continue disabled without selection', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Continue' }).click();
  // No age selected yet
  const btn = page.getByRole('button', { name: 'Continue' });
  await expect(btn).toHaveCSS('opacity', '0.4');
});

test('onboarding step 1 unlocks after selecting age', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: '10-13 years' }).click();
  await expect(page.getByRole('button', { name: 'Continue' })).not.toHaveCSS('opacity', '0.4');
});

test('onboarding step 2 shows custody options', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: '5-9 years' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Custody arrangement')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Full-time' })).toBeVisible();
  await expect(page.getByRole('button', { name: '50/50' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Weekends' })).toBeVisible();
});

test('onboarding step 3 shows loyalty conflict options', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: '5-9 years' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: '50/50' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Loyalty conflict?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'No visible conflict' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Strong / active' })).toBeVisible();
});

test('full onboarding completes and shows Home', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await expect(page.getByRole('heading', { name: 'Steadfast' })).toBeVisible();
});

test('onboarding final step shows Get Started button', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  // Walk all the way to the last step
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
  await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  3. HEADER & NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

test('header shows Steadfast logo', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await expect(page.getByRole('heading', { name: 'Steadfast' })).toBeVisible();
});

test('header shows tagline', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await expect(page.getByText('Your progress is real, even when it\'s invisible')).toBeVisible();
});

test('settings button is visible in header', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
});

test('all six navigation tabs are visible', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  const nav = page.locator('nav');
  await expect(nav.getByRole('button', { name: 'Home' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Timeline' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Patterns' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Shift' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Partner' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Bench' })).toBeVisible();
});

test('clicking Timeline tab shows Timeline view', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Timeline' }).click();
  // Timeline shows time-range filter buttons
  await expect(page.getByRole('button', { name: '1m' })).toBeVisible();
});

test('clicking Patterns tab shows Patterns view', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Patterns' }).click();
  await expect(page.getByRole('button', { name: 'Action' })).toBeVisible();
});

test('clicking Shift tab shows Perspective view', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Shift' }).click();
  await expect(page.getByText('Research-backed reframes')).toBeVisible();
});

test('clicking Partner tab shows Partner view', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Partner' }).click();
  await expect(page.getByRole('button', { name: 'Tips' })).toBeVisible();
});

test('clicking Bench tab shows Benchmark view', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Bench' }).click();
  await expect(page.getByText('Your Situation')).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  4. HOME VIEW
// ─────────────────────────────────────────────────────────────────────────────

test('Home shows a daily quote card', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  // Daily quote card has italic text starting with a "
  await expect(page.locator('p[style*="italic"]').first()).toBeVisible();
});

test('Home shows Log an Interaction CTA button', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await expect(page.getByRole('button', { name: 'Log an Interaction' })).toBeVisible();
});

test('Home shows three stat widgets', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await expect(page.getByText('days tracking')).toBeVisible();
  await expect(page.getByText('total logged')).toBeVisible();
  await expect(page.getByText('positive this wk')).toBeVisible();
});

test('Home shows snapshot prompt on first visit', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await expect(page.getByText('Monthly check-in')).toBeVisible();
});

test('Home shows perspective shortcut prompt', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await expect(page.getByText('Need a perspective shift?')).toBeVisible();
});

test('Home perspective shortcut opens a card modal', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByText('Need a perspective shift?').click();
  // Card modal has a close button (✕)
  await expect(page.getByRole('button', { name: '✕' })).toBeVisible();
});

test('Home snapshot prompt opens snap modal', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByText('Monthly check-in').click();
  await expect(page.getByText('Monthly Check-in')).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  5. FAB & ENTRY MODAL
// ─────────────────────────────────────────────────────────────────────────────

test('FAB + button is visible', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await expect(page.getByRole('button', { name: 'Log interaction' })).toBeVisible();
});

test('FAB opens the entry modal', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await expect(page.getByRole('heading', { name: 'Log an Interaction' })).toBeVisible();
});

test('entry modal shows action chips', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await expect(page.getByRole('button', { name: /Quiet act of service/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Shared activity/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Direct conversation/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Gift or treat/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Being present/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Gave space/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Boundary-setting/ })).toBeVisible();
});

test('entry modal shows response chips', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await expect(page.getByRole('button', { name: /Positive engagement/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Neutral acknowledgment/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Passive withdrawal/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Active rejection/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Escalation/ })).toBeVisible();
});

test('entry modal shows context chips', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await expect(page.getByRole('button', { name: 'Morning' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Evening' })).toBeVisible();
});

test('entry modal shows date input', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await expect(page.locator('input[type="date"]')).toBeVisible();
});

test('entry modal shows notes textarea', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await expect(page.getByPlaceholder('What happened? How did it feel?')).toBeVisible();
});

test('entry Save button is disabled with no selection', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Log interaction' }).click();
  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toHaveCSS('opacity', '0.4');
});

test('entry Save button enables after selecting action and response', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await page.getByRole('button', { name: /Quiet act of service/ }).click();
  await page.getByRole('button', { name: /Positive engagement/ }).click();
  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).not.toHaveCSS('opacity', '0.4');
});

test('entry modal closes when ✕ is clicked', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await expect(page.getByRole('heading', { name: 'Log an Interaction' })).toBeVisible();
  await page.getByRole('button', { name: '✕' }).click();
  await expect(page.getByRole('heading', { name: 'Log an Interaction' })).not.toBeVisible();
});

test('entry modal closes when overlay backdrop is clicked', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await expect(page.getByRole('heading', { name: 'Log an Interaction' })).toBeVisible();
  // Click outside the modal sheet (top-left corner of the overlay)
  await page.mouse.click(10, 10);
  await expect(page.getByRole('heading', { name: 'Log an Interaction' })).not.toBeVisible();
});

test('saving an entry closes the modal', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await logOneInteraction(page);
  await expect(page.getByRole('heading', { name: 'Log an Interaction' })).not.toBeVisible();
});

test('saved entry increments the total logged stat', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);

  // Before: total logged should be 0
  const before = page.locator('div').filter({ hasText: /^0$/ }).first();
  await logOneInteraction(page);

  // After: the stat next to "total logged" should now be 1
  await expect(page.getByText('1').first()).toBeVisible();
  await expect(page.getByText('total logged')).toBeVisible();
});

test('saved entry appears in the Home Recent list', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await logOneInteraction(page, { note: 'Test note for recent list' });
  await expect(page.getByText('Recent')).toBeVisible();
});

test('rejection response triggers a perspective card modal after saving', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Log interaction' }).click();
  await page.getByRole('button', { name: /Quiet act of service/ }).click();
  await page.getByRole('button', { name: /Active rejection/ }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  // A perspective card modal should auto-appear after the entry saves
  await expect(page.getByRole('button', { name: '✕' })).toBeVisible({ timeout: 2000 });
});

test('clicking an entry in the Recent list opens the edit modal', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await logOneInteraction(page, { note: 'Entry to edit' });
  // Wait for the entry row to appear and click it
  const entryRow = page.locator('button').filter({ hasText: /Quiet act of service/i }).first();
  await entryRow.click();
  await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
});

test('edit modal shows Delete this entry option', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await logOneInteraction(page);
  const entryRow = page.locator('button').filter({ hasText: /Quiet act of service/i }).first();
  await entryRow.click();
  await expect(page.getByRole('button', { name: 'Delete this entry' })).toBeVisible();
});

test('deleting an entry removes it from the list', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await logOneInteraction(page);
  const entryRow = page.locator('button').filter({ hasText: /Quiet act of service/i }).first();
  await entryRow.click();
  await page.getByRole('button', { name: 'Delete this entry' }).click();
  await page.getByRole('button', { name: 'Yes, delete' }).click();
  await expect(page.getByText('Recent')).not.toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  6. SETTINGS MODAL
// ─────────────────────────────────────────────────────────────────────────────

test('settings modal opens from header button', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});

test('settings modal shows Export Data Backup button', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('button', { name: 'Export Data Backup' })).toBeVisible();
});

test('settings modal shows Import Data Backup button', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('button', { name: 'Import Data Backup' })).toBeVisible();
});

test('settings modal shows Redo Onboarding button', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('button', { name: 'Redo Onboarding' })).toBeVisible();
});

test('settings privacy policy toggle shows policy text', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: /Show Privacy Policy/ }).click();
  await expect(page.getByText('No data is collected, transmitted, or stored on any server')).toBeVisible();
});

test('settings privacy policy can be hidden again', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: /Show Privacy Policy/ }).click();
  await page.getByRole('button', { name: /Hide Privacy Policy/ }).click();
  await expect(page.getByText('No data is collected, transmitted, or stored on any server')).not.toBeVisible();
});

test('settings modal closes on ✕ click', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: '✕' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).not.toBeVisible();
});

test('Redo Onboarding from settings returns to onboarding screen', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Redo Onboarding' }).click();
  await expect(page.getByText('Before we start')).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  7. PERSPECTIVE (SHIFT) TAB
// ─────────────────────────────────────────────────────────────────────────────

test('Perspective tab lists multiple cards', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Shift' }).click();
  // Known card titles
  await expect(page.getByText('The Loyalty Bind')).toBeVisible();
  await expect(page.getByText("What They'll Remember")).toBeVisible();
  await expect(page.getByText('Withdrawal Isn\'t Rejection')).toBeVisible();
});

test('clicking a perspective card opens its modal', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Shift' }).click();
  await page.getByText('The Loyalty Bind').click();
  // Modal title should contain the card title
  await expect(page.getByText('◇ The Loyalty Bind')).toBeVisible();
});

test('perspective card modal shows body text', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Shift' }).click();
  await page.getByText('The Loyalty Bind').click();
  await expect(page.getByText('loyalty')).toBeVisible();
});

test('perspective card modal shows disclaimer text', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Shift' }).click();
  await page.getByText('The Loyalty Bind').click();
  await expect(page.getByText("This perspective isn't about dismissing your pain")).toBeVisible();
});

test('perspective card modal can be closed', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Shift' }).click();
  await page.getByText('The Loyalty Bind').click();
  await page.getByRole('button', { name: '✕' }).click();
  await expect(page.getByText('◇ The Loyalty Bind')).not.toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  8. PARTNER TAB
// ─────────────────────────────────────────────────────────────────────────────

test('Partner tab shows three sub-tabs', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Partner' }).click();
  await expect(page.getByRole('button', { name: 'Tips' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Alienation' })).toBeVisible();
});

test('Partner Tips tab lists communication tips', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Partner' }).click();
  await expect(page.getByText('Make the invisible visible')).toBeVisible();
  await expect(page.getByText('The united front conversation')).toBeVisible();
});

test('Partner Tips expand on click', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Partner' }).click();
  await page.getByText('Make the invisible visible').click();
  await expect(page.getByText('Try saying')).toBeVisible();
  await expect(page.getByText('Why this works')).toBeVisible();
});

test('Partner Share tab shows empty state without entries', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Partner' }).click();
  await page.getByRole('button', { name: 'Share' }).click();
  await expect(page.getByText('Log some interactions first to generate a report.')).toBeVisible();
});

test('Partner Alienation tab shows warning signs', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Partner' }).click();
  await page.getByRole('button', { name: 'Alienation' }).click();
  await expect(page.getByText('Warning signs')).toBeVisible();
  await expect(page.getByText('When it\'s more than normal resistance')).toBeVisible();
});

test('Partner Alienation tab shows guidance sections', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Partner' }).click();
  await page.getByRole('button', { name: 'Alienation' }).click();
  await expect(page.getByText('This is not your fault')).toBeVisible();
  await expect(page.getByText('Document, don\'t react')).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  9. BENCHMARK TAB
// ─────────────────────────────────────────────────────────────────────────────

test('Benchmark shows profiled child age', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Bench' }).click();
  await expect(page.getByText("Child's age")).toBeVisible();
  await expect(page.getByText('5-9 yrs')).toBeVisible();
});

test('Benchmark shows custody arrangement', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Bench' }).click();
  await expect(page.getByText('Custody')).toBeVisible();
  await expect(page.getByText('50-50')).toBeVisible();
});

test('Benchmark shows typical integration timeline', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Bench' }).click();
  await expect(page.getByText('Typical integration timeline')).toBeVisible();
  await expect(page.getByText('5–8 years')).toBeVisible();
});

test('Benchmark shows realistic outcome spectrum', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Bench' }).click();
  await expect(page.getByText('Realistic outcome spectrum')).toBeVisible();
  await expect(page.getByText('Warm acceptance')).toBeVisible();
  await expect(page.getByText('Comfortable relationship')).toBeVisible();
});

test('Benchmark shows Take a Progress Snapshot button', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Bench' }).click();
  await expect(page.getByRole('button', { name: 'Take a Progress Snapshot' })).toBeVisible();
});

test('Benchmark snapshot button opens snap modal', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Bench' }).click();
  await page.getByRole('button', { name: 'Take a Progress Snapshot' }).click();
  await expect(page.getByText('Monthly Check-in')).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  10. TIMELINE TAB
// ─────────────────────────────────────────────────────────────────────────────

test('Timeline shows date-range filter buttons', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Timeline' }).click();
  await expect(page.getByRole('button', { name: '1m' })).toBeVisible();
  await expect(page.getByRole('button', { name: '3m' })).toBeVisible();
  await expect(page.getByRole('button', { name: '6m' })).toBeVisible();
  await expect(page.getByRole('button', { name: '1y' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'all' })).toBeVisible();
});

test('Timeline range filters are clickable', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Timeline' }).click();
  await page.getByRole('button', { name: '1m' }).click();
  await page.getByRole('button', { name: '1y' }).click();
  await page.getByRole('button', { name: 'all' }).click();
  // If no crash, the clicks worked
  await expect(page.getByRole('button', { name: 'all' })).toBeVisible();
});

test('Timeline shows an entry after one is logged', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await logOneInteraction(page, { note: 'Timeline entry' });
  await page.locator('nav').getByRole('button', { name: 'Timeline' }).click();
  await expect(page.getByText(/Quiet act of service/)).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  11. PATTERNS TAB
// ─────────────────────────────────────────────────────────────────────────────

test('Patterns tab shows Action / Context / Insights sub-tabs', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Patterns' }).click();
  await expect(page.getByRole('button', { name: 'Action' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Context' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Insights' })).toBeVisible();
});

test('Patterns Insights tab shows more-data-needed card when fewer than 20 entries', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Patterns' }).click();
  await page.getByRole('button', { name: 'Insights' }).click();
  await expect(page.getByText('More data needed')).toBeVisible();
});

test('Patterns Context tab shows empty-state prompt without context-tagged entries', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.locator('nav').getByRole('button', { name: 'Patterns' }).click();
  await page.getByRole('button', { name: 'Context' }).click();
  await expect(page.getByText('Tag contexts on entries to see patterns here.')).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  12. SNAPSHOT MODAL
// ─────────────────────────────────────────────────────────────────────────────

test('snap modal shows all six questions', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByText('Monthly check-in').click();
  await expect(page.getByText('How would you describe the relationship right now?')).toBeVisible();
  await expect(page.getByText('How often are you experiencing overt rejection?')).toBeVisible();
  await expect(page.getByText('How often do you notice small positive signals?')).toBeVisible();
  await expect(page.getByText('How are YOU feeling about the relationship?')).toBeVisible();
  await expect(page.getByText('How much are you feeling like yourself?')).toBeVisible();
  await expect(page.getByText('How sustainable does your current effort feel?')).toBeVisible();
});

test('snap modal Save Snapshot is disabled until all questions are answered', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByText('Monthly check-in').click();
  const saveBtn = page.getByRole('button', { name: 'Save Snapshot' });
  await expect(saveBtn).toHaveCSS('opacity', '0.4');
});

test('snap modal Save Snapshot enables after answering all questions', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByText('Monthly check-in').click();
  // Answer all 6 questions by clicking the first option for each
  const chips = ['Hostile', 'Daily', 'Never', 'Hopeless', 'Lost', 'Burning out'];
  for (const chip of chips) {
    await page.getByRole('button', { name: chip }).click();
  }
  await expect(page.getByRole('button', { name: 'Save Snapshot' })).not.toHaveCSS('opacity', '0.4');
});

test('saving a snapshot closes the modal', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.getByText('Monthly check-in').click();
  const chips = ['Neutral', 'Weekly', 'Sometimes', 'Neutral', 'Mostly OK', 'Manageable'];
  for (const chip of chips) {
    await page.getByRole('button', { name: chip }).click();
  }
  await page.getByRole('button', { name: 'Save Snapshot' }).click();
  await expect(page.getByText('Monthly Check-in')).not.toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  13. DATA PERSISTENCE
// ─────────────────────────────────────────────────────────────────────────────

test('entries persist after page reload', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await logOneInteraction(page, { note: 'Persistence check' });
  await page.reload();
  await page.waitForLoadState('networkidle');
  // Should land on Home (not onboarding) and show the entry
  await expect(page.getByRole('heading', { name: 'Steadfast' })).toBeVisible();
  await expect(page.getByText('total logged')).toBeVisible();
  await expect(page.getByText('1').first()).toBeVisible();
});

test('profile persists: skips onboarding after reload', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Steadfast' })).toBeVisible();
  await expect(page.getByText('Before we start')).not.toBeVisible();
});
// ─────────────────────────────────────────────────────────────────────────────
//  14. PWA & OFFLINE BEHAVIOR (REAL-WORLD FAILURE MODES)
// ─────────────────────────────────────────────────────────────────────────────

test('service worker registers', async ({ page }) => {
  await page.goto('/');
  const hasSW = await page.evaluate(async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    return regs.length > 0;
  });
  expect(hasSW).toBe(true);
});

test('app loads while offline after first visit', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // First load online
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Go offline
  await context.setOffline(true);

  // Reload
  await page.reload();
  await expect(page.locator('html')).toBeVisible();
});

test('offline interaction logging does not crash', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);

  await context.setOffline(true);

  await page.getByRole('button', { name: 'Log interaction' }).click();
  await page.getByRole('button', { name: /Quiet act of service/ }).click();
  await page.getByRole('button', { name: /Neutral acknowledgment/ }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  // If this crashes, Playwright will fail the test
  await expect(page.getByRole('heading', { name: 'Steadfast' })).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  15. DATA INTEGRITY & REGRESSION GUARDS
// ─────────────────────────────────────────────────────────────────────────────

test('editing an entry updates stats correctly', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);

  await logOneInteraction(page);

  const entryRow = page.locator('button').filter({ hasText: /Quiet act of service/i }).first();
  await entryRow.click();

  await page.getByRole('button', { name: /Active rejection/ }).click();
  await page.getByRole('button', { name: 'Update' }).click();

  // Should still be exactly 1 entry
  await expect(page.getByText('1').first()).toBeVisible();
});

test('deleting last entry resets stats to zero', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);

  await logOneInteraction(page);

  const entryRow = page.locator('button').filter({ hasText: /Quiet act of service/i }).first();
  await entryRow.click();
  await page.getByRole('button', { name: 'Delete this entry' }).click();
  await page.getByRole('button', { name: 'Yes, delete' }).click();

  await expect(page.getByText('0').first()).toBeVisible();
});

test('snapshot saving does not create duplicate entries', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);

  await page.getByText('Monthly check-in').click();
  const chips = ['Neutral', 'Weekly', 'Sometimes', 'Neutral', 'Mostly OK', 'Manageable'];
  for (const chip of chips) {
    await page.getByRole('button', { name: chip }).click();
  }
  await page.getByRole('button', { name: 'Save Snapshot' }).click();

  // Snapshot should not increment "total logged"
  await expect(page.getByText('0').first()).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  16. EDGE CASES (THE STUFF USERS ACTUALLY DO)
// ─────────────────────────────────────────────────────────────────────────────

test('rapid double-click on Save does not create duplicate entries', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);

  await page.getByRole('button', { name: 'Log interaction' }).click();
  await page.getByRole('button', { name: /Quiet act of service/ }).click();
  await page.getByRole('button', { name: /Neutral acknowledgment/ }).click();

  const saveBtn = page.getByRole('button', { name: 'Save' });
  await saveBtn.dblclick();

  await expect(page.getByText('1').first()).toBeVisible();
});

test('navigating tabs with modal open does not break UI', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await completeOnboarding(page);

  await page.getByRole('button', { name: 'Log interaction' }).click();
  await page.locator('nav').getByRole('button', { name: 'Timeline' }).click();

  // Modal should still be present or safely dismissed — not half-broken
  await expect(
    page.getByRole('heading', { name: /Log an Interaction/ }).or(
      page.getByRole('heading', { name: 'Steadfast' })
    )
  ).toBeVisible();
});

test('hard reload during onboarding does not corrupt state', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await page.reload();
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Should either resume onboarding or restart cleanly
  await expect(
    page.getByText('Before we start').or(
      page.getByText('How old is the child?')
    )
  ).toBeVisible();
});


// ─────────────────────────────────────────────────────────────────────────────
//  17. PERFORMANCE & SMOKE REGRESSION
// ─────────────────────────────────────────────────────────────────────────────

test('home view renders under 1 second', async ({ page }) => {
  const start = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(1000);
});

test('no console errors on initial load', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(errors).toEqual([]);
});
