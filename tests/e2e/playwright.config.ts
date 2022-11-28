import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

// api 
const httpCredentials = {
    username: process.env.ADMIN,
    password: process.env.ADMIN_PASSWORD,
};
// const httpCredentials = {
//   username: 'shashwata',
//   password: 'fzyemm6nu2f0nal7agzs',
// };
const btoa = (str: string) => Buffer.from(str).toString('base64');
const credentialsBase64 = btoa(`${httpCredentials.username}:${httpCredentials.password}`);


/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    testDir: './tests',
    /* Maximum time one test can run for. */
    timeout: 120 * 1000,
    // timeout: 40 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 2000
    },
    /* Run tests in files in parallel */
    // fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    // forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    // retries: process.env.CI ? 1 : 0,
    retries: 0,
    /* Opt out of parallel tests on CI. */
    // workers: process.env.CI ? 1 : undefined,
    workers: 1,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    // reporter: process.env.CI ? 'github' : 'list',
    reporter: process.env.CI ? 'github' : [['html', { open: 'never' }]],
    // reporter: [['html', { open: 'never' }]],
    // reporter: [['junit', { outputFile: '.playwright-report/junit/test-results.xml' }]],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        // viewport: {width: 500, height: 500},//TODO: start maximized
        // viewport: {width: 1920, height: 1080},
        // viewport: null,
        //Whether to run tests on headless or non-headless mode
        headless: false,
        // headless: true,
        //whether to slow down test execution by provided seconds
        launchOptions: {
            // args: ['--start-fullscreen'],
            slowMo: 2,
        },
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 0,
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://dokan4.test',
        baseURL: process.env.BASE_URL,

        ignoreHTTPSErrors: true,  //Whether to ignore HTTPS errors during navigation.
        trace: 'on-first-retry',  //Record trace only when retrying a test for the first time.
        screenshot: 'only-on-failure',  //Capture screenshot after each test failure.
        video: 'on-first-retry',  //Record video only when retrying a test for the first time.

        //api
        extraHTTPHeaders: {
            'Accept': '*/*',
            'Authorization': `Basic ${credentialsBase64}`,
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },

        // {
        //   name: 'firefox',
        //   use: {
        //     ...devices['Desktop Firefox'],
        //   },
        // },
        //
        // {
        //   name: 'webkit',
        //   use: {
        //     ...devices['Desktop Safari'],
        //   },
        // },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: {
        //     ...devices['Pixel 5'],
        //   },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: {
        //     ...devices['iPhone 12'],
        //   },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: {
        //     channel: 'msedge',
        //   },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: {
        //     channel: 'chrome',
        //   },
        // },
    ],

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    // outputDir: 'test-results/',

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   port: 3000,
    // },
};

export default config;
