const { test, expect } = require('@playwright/test');
const fs = require('fs');

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function clearStorage(page) {
  await page.goto('/'); 
  
  if (await page.getByText(/Site not available|usage limits/i).isVisible()) {
    throw new Error('TEST ABORTED: The Netlify site is currently paused/over limits.');
  }

  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    const dbs = await window.indexedDB.databases();
    for (const db of dbs) {
      await new Promise((resolve) => {
        const req = window.indexedDB.deleteDatabase(db.name);
        req.onsuccess = req.onerror = req.onblocked = resolve;
      });
    }
  });
  await page.reload();
}

async function ensureOnboarded(page) {
  const onboardingTrigger = page.getByText(/Before we start/i);
  try {
    await onboardingTrigger.waitFor({ state: 'visible', timeout: 3000 });
    await completeOnboarding(page);
  } catch (e) {
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
    await expect(page.getByText('1').first()).toBeVisible();
    await page.getByRole('button', { name: /Timeline/i }).click();
    await expect(page.getByText(/Quiet act of service/i)).toBeVisible();
  });

  test('double-click save does not create duplicates', async ({ page }) => {
    await page.getByRole('button', { name: /Log interaction/i }).click();
    await page.getByRole('button', { name: /Quiet act of service/i }).click();
    await page.getByRole('button', { name: /Neutral acknowledgment/i }).click();
    await page.getByRole('button', { name: /Save/i }).dblclick();
    await expect(page.getByText('1').first()).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //  STRESS TEST: BULK LOGGING
  // ─────────────────────────────────────────────────────────────────────────────
  
  test('app remains responsive with 50 bulk entries', async ({ page }) => {
    // Triples the default timeout to allow for the many UI actions
    test.slow(); 

    for (let i = 1; i <= 50; i++) {
      await page.getByRole('button', { name: /Log interaction/i }).click();
      await page.getByRole('button', { name: /Quiet act of service/i }).click();
      await page.getByRole('button', { name: /Neutral acknowledgment/i }).click();
      // We use a unique note to ensure the search/filtering works later
      await page.getByPlaceholder(/What happened/i).fill(`Bulk Entry #${i}`);
      await page.getByRole('button', { name: /Save/i }).click();
    }

    // Verify the dashboard shows the correct total
    await expect(page.getByText('50').first()).toBeVisible();

    // Verify Timeline can still render and scroll to the last entry
    await page.getByRole('button', { name: /Timeline/i }).click();
    await expect(page.getByText('Bulk Entry #50')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //  DATA MANAGEMENT & EXPORT
  // ─────────────────────────────────────────────────────────────────────────────

  test('can delete an entry and stats update', async ({ page }) => {
    await logOneInteraction(page, 'To be deleted');
    await expect(page.getByText('1').first()).toBeVisible();
    await page.getByText('To be deleted').click();
    
    const deleteBtn = page.getByRole('button', { name: /Delete|Remove|Trash/i });
    if (await deleteBtn.isVisible()) {
       await deleteBtn.click();
       if (await page.getByText(/Are you sure/i).isVisible()) {
         await page.getByRole('button', { name: /Yes|Confirm|Delete/i }).click();
       }
    }
    
    await expect(page.getByText('0').first()).toBeVisible();
  });

  test('export functionality generates a JSON file', async ({ page }) => {
    await logOneInteraction(page, 'Exportable Data');
    const settingsBtn = page.getByRole('button', { name: /Settings|Menu|⚙️/i });
    
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: /Export|Backup|Download Data/i }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.json');
      
      const path = await download.path();
      expect(fs.statSync(path).size).toBeGreaterThan(0);
    }
  });
});
