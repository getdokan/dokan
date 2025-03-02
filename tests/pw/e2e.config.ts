import { defineConfig, devices, expect } from '@playwright/test';
import { customExpect } from '@utils/pwMatchers';
import 'dotenv/config';
const { CI, NON_HEADLESS, BASE_URL, SLOWMO, NO_SETUP, DOKAN_PRO } = process.env;

export default defineConfig({
    /* test directory */
    testDir: 'tests/e2e',
    /* Include tests based on the pattern */
    grep: [/@lite/, /@liteOnly/, /@pro/],
    /* Exclude tests based on the pattern */
    grepInvert: DOKAN_PRO ? [/@liteOnly/, /@serial/] : [/@pro/, /@serial/],
    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    outputDir: 'playwright/e2e/test-artifacts/',
    /* Path to the global setup file. This file will be required and run before all the tests. */
    // globalSetup: './global-setup',
    /* Path to the global teardown file. This file will be required and run after all the tests. */
    // globalTeardown: './global-teardown' ,
    /* Maximum time in milliseconds the whole test suite can run */
    globalTimeout: CI ? 40 * (60 * 1000) : 40 * (60 * 1000),
    /* The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error. */
    maxFailures: CI ? 50 : 50,
    /* Maximum time one test can run for. */
    timeout: CI ? 35 * 1000 : 45 * 1000,
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
    // fullyParallel  : true,
    /* Fail the build on CI if you accidentally left test-only in the source code. */
    // forbidOnly     : !!CI,
    /* The number of times to repeat each test, useful for debugging flaky tests. */
    repeatEach: CI ? 0 : 0,
    /* The maximum number of retry attempts given to failed tests.  */
    retries: CI ? 1 : 0,
    /* Opt out of parallel tests on CI. */
    workers: CI ? 4 : 4,
    /* Whether to report slow test files. Pass null to disable this feature. */
    reportSlowTests: { max: 2, threshold: 25 },
    /* Configure reporters */
    reporter: CI
        ? [
              //   ['github'],
              //   ['html', { open: 'never', outputFolder: 'playwright-report/e2e/html-report' }],
              ['blob', { open: 'outputDir', outputDir: 'playwright-report/e2e/blob-report' }],
              ['list', { printSteps: true }],
              ['./utils/summaryReporter.ts', { outputFile: 'playwright-report/e2e/summary-report/results.json' }],
          ]
        : [
              //   ['blob', { open: 'outputDir', outputDir: 'playwright-report/e2e/blob-report' }],
              ['html', { open: 'never', outputFolder: 'playwright-report/e2e/html-report' }],
              ['list', { printSteps: true }],
              ['./utils/summaryReporter.ts', { outputFile: 'playwright-report/e2e/summary-report/results.json' }],
          ],

    use: {
        ...devices['Desktop Chrome'],
        /* Whether to automatically download all the attachments. */
        acceptDownloads: true,
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 15 * 1000,
        /* Maximum time each navigation such as 'goto()' can take. */
        navigationTimeout: 20 * 1000,
        /* Base URL */
        baseURL: BASE_URL ?? 'http://localhost:9999',
        /* Name of the browser that runs tests. */
        // browserName: 'chromium',
        /* Toggles bypassing page's Content-Security-Policy. */
        bypassCSP: true,
        /* Browser distribution channel. */
        // channel: 'chrome',
        /* Emulates 'prefers-colors-scheme' media feature, supported values are 'light', 'dark', 'no-preference' */
        // colorScheme: 'dark' ,
        /* Whether to run tests on headless or non-headless mode */
        headless: !NON_HEADLESS,
        /* Whether to ignore HTTPS errors during navigation. */
        ignoreHTTPSErrors: true,
        /* Record trace only when retrying a test for the first time. */
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
        video: DOKAN_PRO ? 'off' : 'on-first-retry', // to reduce artifacts size in CI for dokan-pro
        /* Size of viewport */
        // viewport: { width: 1420, height: 900 }, // default 1280x720
        /* whether to slow down test execution by provided seconds */
        launchOptions: {
            slowMo: (SLOWMO ?? 0) * 1000,
            // devtools: true,
        },
    },

    projects: [
        // E2E project

        // local_site_setup
        {
            name: 'local_site_setup',
            testMatch: ['_localSite.setup.ts'],
        },

        // site_setup
        {
            name: 'site_setup',
            testMatch: ['_site.setup.ts'],
        },

        // auth_setup
        {
            name: 'auth_setup',
            testMatch: ['_auth.setup.ts'],
            dependencies: NO_SETUP ? [] : ['site_setup'],
            // fullyParallel: true,
            retries: 1,
        },

        // e2e_setup
        {
            name: 'e2e_setup',
            testMatch: ['_env.setup.ts'],
            dependencies: NO_SETUP ? [] : ['auth_setup'],
            fullyParallel: true,
            retries: 1,
        },

        // e2e_tests
        {
            name: 'e2e_tests',
            testMatch: /.*\.spec\.ts/,
            /* whether not to run setup tests before running actual tests */
            dependencies: NO_SETUP ? [] : ['e2e_setup'],
            /* whether not to run teardown tests after running actual tests */
            // teardown: NO_SETUP ? undefined : 'coverage_report',
        },

        // coverage_report
        {
            name: 'coverage_report',
            testMatch: ['_coverage.teardown.ts'],
        },

        // global_teardown
        {
            name: 'global_teardown',
            testMatch: ['global-teardown.ts'],
        },
    ],
});

expect.extend(customExpect);
