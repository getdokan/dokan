import { defineConfig, devices } from '@playwright/test';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const apiSuiteConfig = {
	name: 'api_suite',
	testDir: './tests/api',
	testMatch: /.*\.spec\.ts/,
	outputDir: 'playwright/api/test-artifacts/', 	/* Folder for test artifacts such as screenshots, videos, traces, etc. */
	// globalSetup: './global-setup', /* Path to the global setup file. This file will be required and run before all the tests. */
	// globalTeardown: './global-teardown', /* Path to the global teardown file. This file will be required and run after all the tests. */
	// globalTimeout: process.env.CI ? 20 * (60 * 1000) : 20 * (60 * 1000), /* Maximum time in milliseconds the whole test suite can run */
	// maxFailures: process.env.CI ? 30 : 30, /* The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error. */
	timeout: 40 * 1000, /* Maximum time one test can run for. */
	expect: { timeout: 5 * 1000, /* Maximum time expect() should wait for the condition to be met.  For example in `await expect(locator).toHaveText();`*/
	},  /* Configuration for the expect assertion library */
	// preserveOutput: 'always',  /* Whether to preserve test output in the testConfig.outputDir. Defaults to 'always'. */
	// fullyParallel: true, 	/* Run tests in files in parallel */
	// forbidOnly: !!process.env.CI, 	/* Fail the build on CI if you accidentally left test.only in the source code. */
	repeatEach: 1, /* The number of times to repeat each test, useful for debugging flaky tests. */
	// retries: process.env.CI ? 1 : 0,  	/* The maximum number of retry attempts given to failed tests.  */
	// workers: process.env.CI ? 1 : 1, 	/* Opt out of parallel tests on CI. */
	// reportSlowTests: { max: 10, threshold: 20 },  /* Whether to report slow test files. Pass null to disable this feature. */
	// reporter: process.env.CI
	// 	? [
	// 		['html', { open: 'never', outputFolder: 'playwright-report/api/html/html-report-api' }],
	// 		['junit', { outputFile: 'playwright-report/api/junit-report/api-results.xml' }],
	// 		['list', { printSteps: true }]]
	// 	: [
	// 		['html', { open: 'never', outputFolder: 'playwright-report/api/html/html-report-api' }],
	// 		['junit', { outputFile: 'playwright-report/api/junit-report/api-results.xml' }],
	// 		['list', { printSteps: true }],
	// 		['allure-playwright',	{ detail: true, outputFolder: 'playwright-report/api/allure/allure-report', suiteTitle: false }]
	// 	],
	use : {
		baseURL: process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:9999', // Base url
		ignoreHTTPSErrors: true, // Whether to ignore HTTPS errors during navigation.
		// Api request headers
		extraHTTPHeaders: {
			Accept: '*/*',
			Authorization: 'Basic ' + Buffer.from( process.env.ADMIN + ':' + process.env.ADMIN_PASSWORD ).toString( 'base64' ),
		}
	},

};

const e2eSuiteConfig = {
	name: 'e2e_suite',
	testDir: './tests/e2e',
	testMatch: /.*\.spec\.ts/,
	outputDir: 'playwright/e2e/test-artifacts/', 	/* Folder for test artifacts such as screenshots, videos, traces, etc. */
	globalSetup: require.resolve( './global-setup' ), /* Path to the global setup file. This file will be required and run before all the tests. */
	// globalTeardown: './global-teardown', /* Path to the global teardown file. This file will be required and run after all the tests. */
	globalTimeout: process.env.CI ? 20 * (60 * 1000) : 20 * (60 * 1000), /* Maximum time in milliseconds the whole test suite can run */
	maxFailures: process.env.CI ? 20 : 20, /* The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error. */
	timeout: 45 * 1000, /* Maximum time one test can run for. */
	expect: { timeout: 10 * 1000, /* Maximum time expect() should wait for the condition to be met.  For example in `await expect(locator).toHaveText();`*/
	},  /* Configuration for the expect assertion library */
	preserveOutput: 'always',  /* Whether to preserve test output in the testConfig.outputDir. Defaults to 'always'. */
	fullyParallel: true, 	/* Run tests in files in parallel */
	// forbidOnly: !!process.env.CI, 	/* Fail the build on CI if you accidentally left test.only in the source code. */
	repeatEach: 1, /* The number of times to repeat each test, useful for debugging flaky tests. */
	retries: process.env.CI ? 1 : 0,  	/* The maximum number of retry attempts given to failed tests.  */
	workers: process.env.CI ? 1 : 0, 	/* Opt out of parallel tests on CI. */
	reportSlowTests: { max: 10, threshold: 20 },  /* Whether to report slow test files. Pass null to disable this feature. */
	reporter: process.env.CI
		? [
			['html', { open: 'never', outputFolder: 'playwright-report/e2e/html/html-report-e2e' }],
			['junit', { outputFile: 'playwright-report/e2e/junit-report/e2e-results.xml' }],
			['list', { printSteps: true }]]
		: [
			['html', { open: 'never', outputFolder: 'playwright-report/e2e/html/html-report-e2e' }],
			['junit', { outputFile: 'playwright-report/e2e/junit-report/e2e-results.xml' }],
			['list', { printSteps: true }],
			['allure-playwright',	{ detail: true, outputFolder: 'playwright-report/e2e/allure/allure-report', suiteTitle: false }]
		],
	use: {
		...devices['Desktop Chrome'],
		acceptDownloads: true, /* Whether to automatically download all the attachments. */
		actionTimeout: 0, /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
		baseURL: process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:9999', // Base url
		// browserName: 'chromium', /* Name of the browser that runs tests. */
		bypassCSP: true, /* Toggles bypassing page's Content-Security-Policy. */
		// channel: 'chrome', /* Browser distribution channel. */
		// colorScheme: 'dark', /* Emulates 'prefers-colors-scheme' media feature, supported values are 'light', 'dark', 'no-preference' */
		headless: process.env.CI ? !! process.env.CI : false, // Whether to run tests on headless or non-headless mode
		ignoreHTTPSErrors: false, // Whether to ignore HTTPS errors during navigation.
		// trace: 'on-first-retry', // Record trace only when retrying a test for the first time.
		// screenshot: 'only-on-failure', // Capture screenshot after each test failure.
		// video: 'on-first-retry', // Record video only when retrying a test for the first time.
		// viewport: { width: 1280, height: 720 }, /* Size of viewport */
		launchOptions: { slowMo: process.env.SLOWMO ? Number(process.env.SLOWMO) * 1000 : 0, // whether to slow down test execution by provided seconds
		},
	},
};


export default defineConfig({
	// testDir: './tests/',
	// testMatch: /.*\.spec\.ts/,
	// outputDir: 'playwright/test-artifacts/', 	/* Folder for test artifacts such as screenshots, videos, traces, etc. */
	globalSetup: './global-setup', /*Path to the global setup file. This file will be required and run before all the tests. */
	// // globalTeardown: './global-teardown', /*Path to the global teardown file. This file will be required and run after all the tests. */
	globalTimeout: process.env.CI ? 20 * (60 * 1000) : 20 * (60 * 1000), /* Maximum time in milliseconds the whole test suite can run */
	maxFailures: process.env.CI ? 20 : 20, /* The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error. */
	// timeout: 45 * 1000, /* Maximum time one test can run for. */
	// expect: { timeout: 10 * 1000, /* Maximum time expect() should wait for the condition to be met.  For example in `await expect(locator).toHaveText();`*/
	// },  /* Configuration for the expect assertion library */
	preserveOutput: 'always',  /* Whether to preserve test output in the testConfig.outputDir. Defaults to 'always'. */
	// // fullyParallel: true, 	/* Run tests in files in parallel */
	// forbidOnly: !!process.env.CI, 	/* Fail the build on CI if you accidentally left test.only in the source code. */
	// repeatEach: 1, /* The number of times to repeat each test, useful for debugging flaky tests. */
	// retries: process.env.CI ? 1 : 0,  	/*The maximum number of retry attempts given to failed tests.  */
	workers: process.env.CI ? 1 : 1, 	/* Opt out of parallel tests on CI. */
	reportSlowTests: { max: 10, threshold: 20 },  /* Whether to report slow test files. Pass null to disable this feature. */
	reporter: process.env.CI
		? [
			// ['html', { open: 'never', outputFolder: 'playwright-report/html-report' }],
			['junit', { outputFile: 'playwright-report/junit-report/results.xml' }],
			['list', { printSteps: true }]]
		: [
			// ['html', { open: 'never', outputFolder: 'playwright-report/html-report' }],
			['junit', { outputFile: 'playwright-report/junit-report/results.xml' }],
			['list', { printSteps: true }],
		// ['allure-playwright',	{ detail: true, outputFolder: 'playwright-report/allure-report', suiteTitle: false }]
		],
	use: {
	// 	...devices['Desktop Chrome'],
	// 	acceptDownloads: true, /* Whether to automatically download all the attachments. */
	// 	actionTimeout: 0, /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
	// 	baseURL: process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:9999', // Base url
	// 	browserName: 'chromium', /* Name of the browser that runs tests. */
	// 	bypassCSP: true, /* Toggles bypassing page's Content-Security-Policy. */
	// 	channel: 'chrome', /* Browser distribution channel. */
	// 	colorScheme: 'dark', /* Emulates 'prefers-colors-scheme' media feature, supported values are 'light', 'dark', 'no-preference' */
	// 	headless: process.env.CI ? !! process.env.CI : false, // Whether to run tests on headless or non-headless mode
	// 	ignoreHTTPSErrors: false, // Whether to ignore HTTPS errors during navigation.
		trace: 'on-first-retry', // Record trace only when retrying a test for the first time.
		screenshot: 'only-on-failure', // Capture screenshot after each test failure.
		video: 'on-first-retry', // Record video only when retrying a test for the first time.
	// 	// viewport: { width: 1280, height: 720 }, /* Size of viewport */
	// 	launchOptions: { slowMo: process.env.SLOWMO ? Number(process.env.SLOWMO) * 1000 : 0, // whether to slow down test execution by provided seconds
	// 	},
	},

	/* Configure projects for major browsers */
	projects: [

		//TODO: this flags are not allowed in project
		// globalSetup: './global-setup', /* Path to the global setup file. This file will be required and run before all the tests. */
		// // globalTeardown: './global-teardown', /* Path to the global teardown file. This file will be required and run after all the tests. */
		// globalTimeout: process.env.CI ? 20 * (60 * 1000) : 20 * (60 * 1000), /* Maximum time in milliseconds the whole test suite can run */
		// maxFailures: process.env.CI ? 30 : 30, /* The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error. */
		// preserveOutput: 'always',  /* Whether to preserve test output in the testConfig.outputDir. Defaults to 'always'. */
		// forbidOnly: !!process.env.CI, 	/* Fail the build on CI if you accidentally left test.only in the source code. */
		// // workers: process.env.CI ? 1 : 1, 	/* Opt out of parallel tests on CI. */
		// reportSlowTests: { max: 10, threshold: 20 },  /* Whether to report slow test files. Pass null to disable this feature. */
		// reporter: process.env.CI
		// 	? [
		// 		['html', { open: 'never', outputFolder: 'playwright-report/api/html/html-report-api' }],
		// 		['junit', { outputFile: 'playwright-report/api/junit-report/api-results.xml' }],
		// 		['list', { printSteps: true }]]
		// 	: [
		// 		['html', { open: 'never', outputFolder: 'playwright-report/api/html/html-report-api' }],
		// 		['junit', { outputFile: 'playwright-report/api/junit-report/api-results.xml' }],
		// 		['list', { printSteps: true }],
		// 		['allure-playwright',	{ detail: true, outputFolder: 'playwright-report/api/allure/allure-report', suiteTitle: false }]
		// 	],


		// Api project

		// api_setup
		{
			...apiSuiteConfig,
			name: 'api_setup',
			testMatch: /.*\.setup\.ts/,
		},

		// api_tests
		{
			...apiSuiteConfig,
			name: 'api_tests',
			testMatch: /.*\.spec\.ts/,
			dependencies: process.env.SETUP ? ['api_setup'] : [],
			//TODO: which fields are allowed, not all are allowed
		},

		// E2e project

		// e2e_setup
		{
			...e2eSuiteConfig,
			name: 'e2e_setup',
			testMatch: /.*\.setup\.ts/,

		},

		// e2e_tests
		{
			...e2eSuiteConfig,
			name: 'e2e_tests',
			testMatch: /.*\.spec\.ts/,
			dependencies: process.env.SETUP ? ['e2e_setup'] : [],
		},

		// local site setup project
		{
			...e2eSuiteConfig,
			name: 'site_setup',
			testMatch: /.*\.install\.ts/,
		},
	],

});
