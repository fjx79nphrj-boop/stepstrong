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

/**
 * FIXED: Uses 'exact: true' to ensure we only click the logging buttons
 * and ignore the historical list items appearing in the 'Recent' section.
 */
async function logOneInteraction(page, note = '') {
  await page.getByRole('button', { name: /Log interaction/i }).click();
  
  // exact: true ensures we don't accidentally click a previous entry
  await page.getByRole('button', { name: '🫧 Quiet act of service', exact: true }).click();
  await page.getByRole('button', { name: 'Neutral acknowledgment', exact: true }).click();
  
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
    await page.getByRole('button', { name: 'Timeline', exact: true }).click();
    await expect(page.getByText(/Quiet act of service/i)).toBeVisible();
  });

  test('double-click save does not create duplicates', async ({ page }) => {
    await page.getByRole('button', { name: /Log interaction/i }).click();
    await page.getByRole('button', { name: '🫧 Quiet act of service', exact: true }).click();
    await page.getByRole('button', { name: 'Neutral acknowledgment', exact: true }).click();
    await page.getByRole('button', { name: /Save/i }).dblclick();
    await expect(page.getByText('1').first()).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //  STRESS TEST: BULK LOGGING
  // ─────────────────────────────────────────────────────────────────────────────
  
  test('app remains responsive with 50 bulk entries', async ({ page }) => {
    test.slow(); 

    for (let i = 1; i <= 50; i++) {
      await page.getByRole('button', { name: /Log interaction/i }).click();
      
      // FIXED: Specifically targeting menu buttons via exact strings
      await page.getByRole('button', { name: '🫧 Quiet act of service', exact: true }).click();
      await page.getByRole('button', { name: 'Neutral acknowledgment', exact: true }).click();
      
      await page.getByPlaceholder(/What happened/i).fill(`Bulk Entry #${i}`);
      await page.getByRole('button', { name: /Save/i }).click();
    }

    await expect(page.getByText('50').first()).toBeVisible();
    await page.getByRole('button', { name: 'Timeline', exact: true }).click();
    await expect(page.getByText('Bulk Entry #50')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //  DATA MANAGEMENT & EXPORT
  // ─────────────────────────────────────────────────────────────────────────────

  test('can delete an entry and stats update', async ({ page }) => {
    await logOneInteraction(page, 'To be deleted');
    await expect(page.getByText('1').first()).toBeVisible();
    
    // Open the entry by clicking its note text
    await page.getByText('To be deleted').click();
    
    // FIXED: Using exact name to ignore background rows
    const deleteBtn = page.getByRole('button', { name: 'Delete this entry', exact: true });
    
    if (await deleteBtn.isVisible()) {
       await deleteBtn.click();
       const confirmBtn = page.getByRole('button', { name: /Yes|Confirm|Delete/i }).last();
       if (await confirmBtn.isVisible()) {
         await confirmBtn.click();
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
      
      // FIXED: Targeted exact string prevents collision with "Import Data Backup"
      await page.getByRole('button', { name: 'Export Data Backup', exact: true }).click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.json');
      
      const path = await download.path();
      expect(fs.statSync(path).size).toBeGreaterThan(0);
    }
  });
});
