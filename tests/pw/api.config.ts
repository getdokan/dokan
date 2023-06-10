import type { PlaywrightTestConfig } from '@playwright/test';
// import { devices } from '@playwright/test';
require( 'dotenv' ).config();
/**
 * See https://playwright.dev/docs/test-configuration.
 */

const config: PlaywrightTestConfig = {
	// test directory
	testDir: './tests',

	/* Maximum time one test can run for. */
	// timeout: 120 * 1000,
	// timeout: 60 * 1000,
	timeout: 40 * 1000,
	
	expect: {
		/**
		 * Maximum time expect() should wait for the condition to be met.
		 * For example in `await expect(locator).toHaveText();`
		 */
		timeout: 5000,
	},

	/* Run tests in files in parallel */
	// fullyParallel: true,

	/* Fail the build on CI if you accidentally left test.only in the source code. */
	// forbidOnly: !!process.env.CI,

	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : 1,

	/* Retry on CI only */
	retries: process.env.CI ? 1 : 0,
	// retries: 1,

	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: process.env.CI
		? [['html', { open: 'never', outputFolder: 'playwright-report/html-report-api' }], ['junit', { outputFile: 'playwright-report/junit-report/api-results.xml' }], ['list', { printSteps: true }]]
		: [['html', { open: 'never', outputFolder: 'playwright-report/html-report-api' }], ['junit', { outputFile: 'playwright-report/junit-report/api-results.xml' }], ['list', { printSteps: true }]],

	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	globalSetup: require.resolve( './global-setup' ),
	use: {
		// storageState: 'storageState.json',  //location of sign in state
		baseURL: process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:8888', //Base URL
		ignoreHTTPSErrors: true, //Whether to ignore HTTPS errors during navigation.
		// api request headers
		extraHTTPHeaders: {
			Accept: '*/*',
			Authorization: 'Basic ' + Buffer.from( process.env.ADMIN + ':' + process.env.ADMIN_PASSWORD ).toString( 'base64' ),
		},
	},

	/* Configure projects for major browsers */
	// projects: [
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
	// ],

	/* Folder for test artifacts such as screenshots, videos, traces, etc. */
	outputDir: 'playwright-report/test-artifacts/',

	/* Run your local dev server before starting the tests */
	// webServer: {
	//   command: 'npm run start',
	//   port: 3000,
	// },
};

export default config;