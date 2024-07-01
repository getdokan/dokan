import { defineConfig, expect } from '@playwright/test';
import { customExpect } from '@utils/pwMatchers';
import 'dotenv/config';
const { CI, BASE_URL, NO_SETUP, ADMIN, ADMIN_PASSWORD } = process.env;

export default defineConfig({
    /* test directory */
    testDir: './tests/api',
    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    outputDir: 'playwright/api/test-artifacts/',
    /* Path to the global setup file. This file will be required and run before all the tests. */
    globalSetup: './global-setup',
    /* Path to the global teardown file. This file will be required and run after all the tests. */
    // globalTeardown: './global-teardown',
    /* Maximum time in milliseconds the whole test suite can run */
    globalTimeout: CI ? 20 * (60 * 1000) : 20 * (60 * 1000),
    /* The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error. */
    maxFailures: CI ? 30 : 30,
    /* Maximum time one test can run for. */
    timeout: CI ? 15 * 1000 : 20 * 1000,
    /* Configuration for the expect assertion library */
    expect: {
        /* Maximum time expect() should wait for the condition to be met.  For example in `await expect(locator).toHaveText();`*/
        timeout: 5 * 1000,
    },
    /* Whether to preserve test output in the testConfig.outputDir. Defaults to 'always'. */
    preserveOutput: 'always',
    /* Run tests in files in parallel */
    // fullyParallel  : true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    // forbidOnly     : !!CI,
    /* The number of times to repeat each test, useful for debugging flaky tests. */
    repeatEach: CI ? 1 : 0,
    /* The maximum number of retry attempts given to failed tests.  */
    retries: CI ? 1 : 0,
    /* Opt out of parallel tests on CI. */
    workers: CI ? 4 : 4,
    /* Whether to report slow test files. Pass null to disable this feature. */
    reportSlowTests: { max: 2, threshold: 10 },
    /* Configure reporters */
    reporter: CI
        ? [
              ['github'],
              ['html', { open: 'never', outputFolder: 'playwright-report/api/html-report' }],
              //   ['junit', { outputFile: 'playwright-report/api/junit-report/api-results.xml' }],
              ['list', { printSteps: true }],
              ['./utils/summaryReporter.ts', { outputFile: 'playwright-report/api/summary-report/results.json' }],
          ]
        : [
              ['html', { open: 'never', outputFolder: 'playwright-report/api/html-report' }],
              //   ['junit', { outputFile: 'playwright-report/api/junit-report/api-results.xml' }],
              ['list', { printSteps: true }],
              ['./utils/summaryReporter.ts', { outputFile: 'playwright-report/api/summary-report/results.json' }],
          ],

    use: {
        /* Base URL */
        baseURL: BASE_URL ? BASE_URL : 'http://localhost:9999',
        /* Whether to ignore HTTPS errors during navigation. */
        ignoreHTTPSErrors: true,
        /* api request headers */
        extraHTTPHeaders: {
            Accept: '*/*',
            Authorization: 'Basic ' + Buffer.from(ADMIN + ':' + ADMIN_PASSWORD).toString('base64'),
        },
    },

    projects: [
        // Api project

        // global_setup
        // {
        //     name: 'global_setup',
        //     testMatch: /global\.setup\.ts/,
        // },

        // api_setup
        {
            name: 'api_setup',
            testMatch: /.*\.setup\.ts/,
            // testMatch: /.*\.setup\.spec\.ts/,
        },

        // api_tests
        {
            name: 'api_tests',
            testMatch: /.*\.spec\.ts/,
            /* whether not to run setup tests before running actual tests */
            dependencies: NO_SETUP ? [] : ['api_setup'],
            /* whether not to run teardown tests after running actual tests */
            teardown: NO_SETUP ? undefined : 'coverage_report',
            // teardown: 'global_teardown',
        },

        // coverage_report
        {
            name: 'coverage_report',
            testMatch: '_coverage.teardown.ts',
        },

        // global_teardown
        // {
        //     name: 'global_teardown',
        //     testMatch: /global\.teardown\.ts/,
        // },
    ],
});

expect.extend(customExpect);
