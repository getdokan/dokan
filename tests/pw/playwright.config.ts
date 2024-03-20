import { defineConfig, devices, expect } from '@playwright/test';
import { customExpect } from '@utils/pwMatchers';
// import 'dotenv/config';
const { CI, BASE_URL, SLOWMO, ADMIN, ADMIN_PASSWORD } = process.env;

export default defineConfig({
    testDir: './tests/',
    testMatch: /.*\.spec\.ts/,
    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    outputDir: 'playwright/test-artifacts/',
    /* Path to the global setup file. This file will be required and run before all the tests. */
    // globalSetup: './global-setup',
    /* Path to the global teardown file. This file will be required and run after all the tests. */
    // globalTeardown : './global-teardown',
    /* Maximum time in milliseconds the whole test suite can run */
    globalTimeout: CI ? 40 * (60 * 1000) : 40 * (60 * 1000),
    /* The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error. */
    maxFailures: CI ? 40 : 40,
    /* Maximum time one test can run for. */
    timeout: CI ? 45 * 1000 : 45 * 1000,
    /* Configuration for the expect assertion library */
    expect: {
        /* Maximum time expect() should wait for the condition to be met.  For example in `await expect(locator).toHaveText();`*/
        timeout: 15 * 1000,
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.2,
            maxDiffPixels: 500,
            threshold: 0.5,
        },
    },
    /* Whether to preserve test output in the testConfig.outputDir. Defaults to 'always'. */
    preserveOutput: 'always',
    /* Run tests in files in parallel */
    // fullyParallel: true,
    /* Fail the build on CI if you accidentally left test-only in the source code. */
    // forbidOnly: !!CI,
    /* The number of times to repeat each test, useful for debugging flaky tests. */
    repeatEach: CI ? 1 : 0,
    /* The maximum number of retry attempts given to failed tests.  */
    retries: CI ? 1 : 0,
    workers: CI ? 4 : 1 /* Opt out of parallel tests on CI. */,
    reportSlowTests: { max: 3, threshold: 25 } /* Whether to report slow test files. Pass null to disable this feature. */,
    /* Configure reporters */
    reporter: CI
        ? [
              ['github'],
              ['html', { open: 'never', outputFolder: 'playwright-report/html-report' }],
              // ['junit', { outputFile: 'playwright-report/junit-report/results.xml' }],
              ['list', { printSteps: true }],
              ['./utils/summaryReporter.ts', { outputFile: 'playwright-report/summary-report/results.json' }],
          ]
        : [
              ['html', { open: 'never', outputFolder: 'playwright-report/html-report' }],
              // ['junit', { outputFile: 'playwright-report/junit-report/results.xml' }],
              ['list', { printSteps: true }],
              ['./utils/summaryReporter.ts', { outputFile: 'playwright-report/summary-report/results.json' }],
          ],
    use: {
        ...devices['Desktop Chrome'],
        /* Whether to automatically download all the attachments. */
        acceptDownloads: true,
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 25 * 1000,
        /* Maximum time each navigation such as 'goto()' can take. */
        navigationTimeout: 30 * 1000,
        /* Base URL */
        baseURL: BASE_URL ? BASE_URL : 'http://localhost:9999',
        /* Name of the browser that runs tests. */
        // browserName: 'chromium',
        /* Toggles bypassing page's Content-Security-Policy. */
        bypassCSP: true,
        /* Browser distribution channel. */
        // channel: 'chrome',
        /* Emulates 'prefers-colors-scheme' media feature, supported values are 'light', 'dark', 'no-preference' */
        // colorScheme: 'dark' ,
        /* Whether to run tests on headless or non-headless mode */
        headless: CI ? !!CI : false,
        /* Whether to ignore HTTPS errors during navigation. */
        ignoreHTTPSErrors: true,
        /* Record trace only when retrying a test for the first time. */
        // trace: 'on-first-retry',
        trace: {
            mode: 'on-first-retry',
            snapshots: true,
            screenshots: true,
            sources: true,
            attachments: true,
        },
        /* Capture screenshot after each test failure. */
        screenshot: {
            mode: 'only-on-failure',
            fullPage: true,
        },
        /* Record video only when retrying a test for the first time. */
        video: 'on-first-retry',
        /* Size of viewport */
        viewport: { width: 1420, height: 900 }, // default 1280x720
        /* whether to slow down test execution by provided seconds */
        launchOptions: { slowMo: SLOWMO ? Number(SLOWMO) * 1000 : 0 },

        /* api request headers */
        extraHTTPHeaders: {
            Accept: '*/*',
            Authorization: 'Basic ' + Buffer.from(ADMIN + ':' + ADMIN_PASSWORD).toString('base64'),
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});

expect.extend(customExpect);
