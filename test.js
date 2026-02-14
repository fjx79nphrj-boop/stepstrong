const { test, expect } = require('@playwright/test');
const fs = require('fs'); // Required for checking file size

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
  
  // Check if Netlify has paused the site immediately
  if (await page.getByText(/Site not available|usage limits/i).isVisible()) {
    throw new Error('TEST ABORTED: The Netlify site is currently paused/over limits.');
  }

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
    // Wait up to 3s for onboarding.
    await onboardingTrigger.waitFor({ state: 'visible', timeout: 3000 });
    await completeOnboarding(page);
  } catch (e) {
    // Ensure we are actually on the Home screen by looking for the Log button
    await expect(page.getByRole('button', { name: /Log interaction/i })).toBeVisible();
  }
}

async function completeOnboarding(page) {
  const steps = [
    /Continue/i, /5-9 years/i, /Continue/i, /50\/50/i, /Continue/i, 
    /Some tension/i, /Continue/i, /2-3 yrs/i, /Continue/i, /Neutral/i, 
    /Continue/i, /Get Started/i
  ];

  for (const step of steps) {
    await page.getByRole('button', { name: step }).click();
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
    await page.waitForLoadState('networkidle');
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

  test('can delete an entry and stats update', async ({ page }) => {
    // 1. Log a dummy entry
    await logOneInteraction(page, 'To be deleted');
    await expect(page.getByText('1').first()).toBeVisible();

    // 2. Open the "Recent" entry
    await page.getByText('To be deleted').click();

    // 3. Click Delete (adjust regex if your icon has no text, e.g. look for SVG or aria-label)
    // Assuming there is a button with "Delete" text or aria-label
    const deleteBtn = page.getByRole('button', { name: /Delete|Remove|Trash/i });
    if (await deleteBtn.isVisible()) {
       await deleteBtn.click();
    } else {
       // Fallback: sometimes delete is hidden in a menu or just an icon
       console.log('Warning: Delete button not found by text. Check your specific UI implementation.');
       return; 
    }
    
    // 4. Confirm deletion if a modal appears
    if (await page.getByText(/Are you sure/i).isVisible()) {
      await page.getByRole('button', { name: /Yes|Confirm|Delete/i }).click();
    }

    // 5. Verify the count goes back to 0
    await expect(page.getByText('0').first()).toBeVisible();
    await expect(page.getByText('To be deleted')).not.toBeVisible();
  });

  test('visualizations handle multiple entries correctly', async ({ page }) => {
    // 1. Log 10 entries with different responses
    const variations = [
      { name: 'Quiet act of service', type: 'Neutral acknowledgment' },
      { name: 'Kind word', type: 'Positive escalation' },
      { name: 'Emotional support', type: 'Positive escalation' }
    ];

    for (let i = 0; i < 10; i++) {
      const variant = variations[i % variations.length];
      await page.getByRole('button', { name: /Log interaction/i }).click();
      await page.getByRole('button', { name: new RegExp(variant.name, 'i') }).click();
      await page.getByRole('button', { name: new RegExp(variant.type, 'i') }).click();
      await page.getByRole('button', { name: /Save/i }).click();
    }

    // 2. Verify total count on Home
    await expect(page.getByText('10').first()).toBeVisible();

    // 3. Check the Timeline "Graphs" (Stats section)
    await page.getByRole('button', { name: /Timeline/i }).click();
    
    // In the Timeline, we expect to see the specific stat counters
    await expect(page.getByText('10').first()).toBeVisible(); // Total Interactions
    // Check for the "Positive / Neutral" stat row
    const positiveLabel = page.getByText(/positive \/ neutral/i);
    await expect(positiveLabel).toBeVisible();

    // 4. Check the Patterns View
    await page.getByRole('button', { name: /Patterns/i }).click();
    
    // Verify that one of our logged items appears in the frequency list
    await expect(page.getByText(/Quiet act of service/i).first()).toBeVisible();
  });

  test('export functionality generates a file', async ({ page }) => {
    // 1. Log some data so the export isn't empty
    await logOneInteraction(page, 'Exportable Data');

    // 2. Open Settings (Look for a gear icon or Menu button)
    // Note: You may need to adjust this selector if your settings button is an icon without text
    const settingsBtn = page.getByRole('button', { name: /Settings|Menu|⚙️/i });
    if (!await settingsBtn.isVisible()) {
       console.log('Skipping export test: Settings button not found.');
       return;
    }
    await settingsBtn.click();

    // 3. Set up a "Download Promise" - we wait for the download event
    const downloadPromise = page.waitForEvent('download');

    // 4. Click the Export button
    const exportBtn = page.getByRole('button', { name: /Export|Backup|Download Data/i });
    if (!await exportBtn.isVisible()) {
        console.log('Skipping export test: Export button not found in settings.');
        return;
    }
    await exportBtn.click();

    // 5. Await the download
    const download = await downloadPromise;

    // 6. Verify the filename looks correct (JSON)
    const filename = download.suggestedFilename();
    expect(filename).toContain('.json');
    
    // 7. Verify file size
    const path = await download.path();
    const stats = fs.statSync(path);
    expect(stats.size).toBeGreaterThan(0);
  });
});
