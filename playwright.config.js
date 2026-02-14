// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Look for tests in the current directory
  testDir: './',
  testMatch: /test\.js$/,
  
  /* Run tests in files in parallel */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* 1. FIXES THE "NO FILES FOUND" ERROR: 
     This tells Playwright to create the 'playwright-report' folder. */
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://stepstrong.netlify.app/',

    /* 2. HELPS DEBUGGING: 
       Collect trace when retrying a failed test. 
       You can open these in the report to see exactly what went wrong. */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  /* 3. PREVENTS THE 15-MINUTE HANG:
     Individual tests will now time out after 60 seconds. */
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

 /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // ADD THIS SECTION:
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
