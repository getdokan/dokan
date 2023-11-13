import { defineConfig, expect } from '@playwright/test';
import { customExpect } from '@utils/pwMatchers';
import 'dotenv/config';

export default defineConfig({
    testDir: './tests/api' /* test directory */,
    outputDir: 'playwright/api/test-artifacts/' /* Folder for test artifacts such as screenshots, videos, traces, etc. */,
    globalSetup: './global-setup' /* Path to the global setup file. This file will be required and run before all the tests. */,
    globalTeardown: './global-teardown' /* Path to the global teardown file. This file will be required and run after all the tests. */,
    globalTimeout: process.env.CI ? 20 * (60 * 1000) : 20 * (60 * 1000) /* Maximum time in milliseconds the whole test suite can run */,
    maxFailures: process.env.CI ? 30 : 30 /* The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error. */,
    timeout: process.env.CI ? 5 * 1000 : 10 * 1000 /* Maximum time one test can run for. */,
    expect: {
        timeout: 5 * 1000 /* Maximum time expect() should wait for the condition to be met.  For example in `await expect(locator).toHaveText();`*/,
    } /* Configuration for the expect assertion library */,
    preserveOutput: 'always' /* Whether to preserve test output in the testConfig.outputDir. Defaults to 'always'. */,
    // fullyParallel  : true, 	/* Run tests in files in parallel */
    // forbidOnly     : !!process.env.CI, 	/* Fail the build on CI if you accidentally left testonly in the source code. */
    repeatEach: 1 /* The number of times to repeat each test, useful for debugging flaky tests. */,
    retries: process.env.CI ? 1 : 0 /* The maximum number of retry attempts given to failed tests.  */,
    workers: process.env.CI ? 4 : 4 /* Opt out of parallel tests on CI. */,
    reportSlowTests: { max: 3, threshold: 10 } /* Whether to report slow test files. Pass null to disable this feature. */,
    reporter: process.env.CI
        ? [
              ['github'],
              ['html', { open: 'never', outputFolder: 'playwright-report/api/html/html-report-api' }],
              //   ['junit', { outputFile: 'playwright-report/api/junit-report/api-results.xml' }],
              ['list', { printSteps: true }],
              ['./utils/summaryReporter.ts', { outputFile: 'playwright-report/api/summary-report/results.json' }],
          ]
        : [
              ['html', { open: 'never', outputFolder: 'playwright-report/api/html/html-report-api' }],
              //   ['junit', { outputFile: 'playwright-report/api/junit-report/api-results.xml' }],
              ['list', { printSteps: true }],
              ['./utils/summaryReporter.ts', { outputFile: 'playwright-report/api/summary-report/results.json' }],
          ],

    use: {
        baseURL: process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:9999' /* Base URL */,
        ignoreHTTPSErrors: true /* Whether to ignore HTTPS errors during navigation. */,
        /* api request headers */
        extraHTTPHeaders: {
            Accept: '*/*',
            Authorization: 'Basic ' + Buffer.from(process.env.ADMIN + ':' + process.env.ADMIN_PASSWORD).toString('base64'),
        },
    },

    projects: [
        // Api project

        // api_setup
        {
            name: 'api_setup',
            // testMatch: /.*\.setup\.ts/,
            testMatch: /.*\.setup\.spec\.ts/,
        },

        // api_tests
        {
            name: 'api_tests',
            testMatch: /.*\.spec\.ts/,
            dependencies: process.env.NO_SETUP ? [] : ['api_setup'] /* whether not to run setup tests before running actual tests */,
        },
    ],
});

expect.extend(customExpect);
