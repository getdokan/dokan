import { defineConfig, devices, expect } from '@playwright/test';
import { customExpect } from '@utils/pwMatchers';
import 'dotenv/config';

export default defineConfig({
    testDir: './tests/e2e' /* test directory */,
    outputDir: 'playwright/e2e/test-artifacts/' /* Folder for test artifacts such as screenshots, videos, traces, etc. */,
    globalSetup: './global-setup' /* Path to the global setup file. This file will be required and run before all the tests. */,
    // globalTeardown: './global-teardown' /* Path to the global teardown file. This file will be required and run after all the tests. */,
    globalTimeout: process.env.CI ? 40 * (60 * 1000) : 20 * (60 * 1000) /* Maximum time in milliseconds the whole test suite can run */,
    maxFailures: process.env.CI ? 30 : 30 /* The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error. */,
    timeout: process.env.CI ? 40 * 1000 : 35 * 1000 /* Maximum time one test can run for. */,
    expect: {
        timeout: 10 * 1000 /* Maximum time expect() should wait for the condition to be met.  For example in `await expect(locator).toHaveText();`*/,
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.2,
            maxDiffPixels: 500,
            threshold: 0.5,
        },
    } /* Configuration for the expect assertion library */,
    preserveOutput: 'always' /* Whether to preserve test output in the testConfig.outputDir. Defaults to 'always'. */,
    // fullyParallel  : true, 	/* Run tests in files in parallel */
    // forbidOnly     : !!process.env.CI, 	/* Fail the build on CI if you accidentally left test-only in the source code. */
    repeatEach: 1 /* The number of times to repeat each test, useful for debugging flaky tests. */,
    retries: process.env.CI ? 1 : 0 /* The maximum number of retry attempts given to failed tests.  */,
    workers: process.env.CI ? 1 : 1 /* Opt out of parallel tests on CI. */,
    reportSlowTests: { max: 3, threshold: 25 } /* Whether to report slow test files. Pass null to disable this feature. */,
    reporter: process.env.CI
        ? [
              ['github'],
              ['html', { open: 'never', outputFolder: 'playwright-report/e2e/html/html-report-e2e' }],
              //   ['junit', { outputFile: 'playwright-report/e2e/junit-report/e2e-results.xml' }],
              ['list', { printSteps: true }],
              ['./utils/summaryReporter.ts', { outputFile: 'playwright-report/e2e/summary-report/results.json' }],
          ]
        : [
              ['html', { open: 'never', outputFolder: 'playwright-report/e2e/html/html-report-e2e' }],
              //   ['junit', { outputFile: 'playwright-report/e2e/junit-report/e2e-results.xml' }],
              ['list', { printSteps: true }],
              ['./utils/summaryReporter.ts', { outputFile: 'playwright-report/e2e/summary-report/results.json' }],
          ],

    use: {
        ...devices['Desktop Chrome'],
        acceptDownloads: true /* Whether to automatically download all the attachments. */,
        actionTimeout: 15 * 1000 /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */,
        navigationTimeout: 20 * 1000 /* Maximum time each navigation such as 'goto()' can take. */,
        baseURL: process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:9999' /* Base URL */,
        // browserName: 'chromium' /* Name of the browser that runs tests. */,
        bypassCSP: true /* Toggles bypassing page's Content-Security-Policy. */,
        // channel: 'chrome' /* Browser distribution channel. */,
        // colorScheme: 'dark' /* Emulates 'prefers-colors-scheme' media feature, supported values are 'light', 'dark', 'no-preference' */,
        headless: process.env.CI ? !!process.env.CI : false /* Whether to run tests on headless or non-headless mode */,
        ignoreHTTPSErrors: true /* Whether to ignore HTTPS errors during navigation. */,
        trace: 'on-first-retry' /* Record trace only when retrying a test for the first time. */,
        screenshot: 'only-on-failure' /* Capture screenshot after each test failure. */,
        // video: 'retain-on-failure' /* Record video only when retrying a test for the first time. */,
        video: 'on-first-retry' /* Record video only when retrying a test for the first time. */,
        // viewport         : { width: 1280, height: 720 }, /* Size of viewport */
        launchOptions: { slowMo: process.env.SLOWMO ? Number(process.env.SLOWMO) * 1000 : 0 /* whether to slow down test execution by provided seconds */ },
    },

    projects: [
        // E2e project

        // e2e_setup
        {
            name: 'e2e_setup',
            // testMatch: /.*\.setup\.ts/,
            testMatch: /.*\.setup\.spec\.ts/,
        },

        // e2e_tests
        {
            name: 'e2e_tests',
            testMatch: /.*\.spec\.ts/,
            // dependencies: process.env.NO_SETUP ? [] : ['e2e_setup'] /* whether not to run setup tests before running actual tests */,
        },

        // local site setup project
        {
            name: 'site_setup',
            testMatch: /.*\.install\.ts/,
            // globalSetup: '',
        },
    ],
});

expect.extend(customExpect);