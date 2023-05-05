import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
require('dotenv').config();

// // api
// const username = process.env.CUSTOMER;
// const password = process.env.CUSTOMER_PASSWORD;
// const basicAuth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const config: PlaywrightTestConfig = {
	// test directory
	testDir: './tests',

	/* Maximum time one test can run for. */
	// timeout: 60 * 1000,
	timeout: 40 * 1000,
	// timeout: 30 * 1000,
	// timeout: 10 * 1000,

	expect: {
		/**
		 * Maximum time expect() should wait for the condition to be met.
		 * For example in `await expect(locator).toHaveText();`
		 */
		timeout: 10 * 1000,
	},

	/* Run tests in files in parallel */
	// fullyParallel: true,

	/* Fail the build on CI if you accidentally left test.only in the source code. */
	// forbidOnly: !!process.env.CI,

	/* Retry on CI only */
	retries: process.env.CI ? 1 : 0,

	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : 1,

	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: process.env.CI ? [['html'],['list', { printSteps: true }], ['junit', { outputFile: 'playwright-report/results.xml' }]] : [['html', { open: 'never' }], ['list', { printSteps: true }]],

	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	globalSetup: require.resolve('./global-setup'),

	use: {
		// storageState: 'storageState.json',  // location of sign in state
		headless: process.env.CI ? !! process.env.CI : false, // Whether to run tests on headless or non-headless mode
		actionTimeout: 0, // Maximum time each action such as `click()` can take. Defaults to 0 (no limit). //
		baseURL: process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:8889', //Base URL
		ignoreHTTPSErrors: true, // Whether to ignore HTTPS errors during navigation.
		trace: 'on-first-retry', // Record trace only when retrying a test for the first time.
		screenshot: 'only-on-failure', // Capture screenshot after each test failure.
		// video: 'on-first-retry', // Record video only when retrying a test for the first time.
		// viewport: { width: 1440, height: 900 },

		// launch options
		launchOptions: {
			slowMo: process.env.SLOWMO ? Number(process.env.SLOWMO) * 1000 : 0, //whether to slow down test execution by provided seconds
		},

		// // api request headers
		// extraHTTPHeaders: {
		// 	Accept: '*/*',
		// 	Authorization: basicAuth,
		// },
	},

	/* Configure projects for major browsers */
	projects: [
		// Setup project
		{ name: 'setup', 
			testMatch: /.*\.setup\.ts/ },

		{
			name: 'e2e_tests',
			testMatch: /.*\.spec\.ts/ ,
			use: {
				...devices['Desktop Chrome'],	
			},
			dependencies: ['setup'],
		},

		//     {
		//         name: 'chromium',
		//         use: {
		//             ...devices['Desktop Chrome'],
		//         },
		//     },

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
	outputDir: 'playwright-report/test-artifacts/',

	/* Run your local dev server before starting the tests */
	// webServer: {
	//   command: 'npm run start',
	//   port: 3000,
	// },
};

export default config;
