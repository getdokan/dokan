import { test, Page } from '@playwright/test';
import { AdminDashboardPage } from 'pages/adminDashboardPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Admin dashboard test', () => {


	let adminDashboardPage: AdminDashboardPage;
	let page: Page;
	let apiUtils: ApiUtils;

	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		page = await adminContext.newPage();
		adminDashboardPage = new AdminDashboardPage(page);
		apiUtils = new ApiUtils(request);
	});

	test.afterAll(async ( ) => {
		await page.close();
	});

	// test.use({ storageState: data.auth.adminAuthFile });

	test('dokan admin dashboard is rendering properly @lite @pro @explo', async ( ) => {
		await adminDashboardPage.adminDashboardRenderProperly();
	});

	test('admin dashboard at a glance values are accurate @lite @pro', async ( ) => {
		const summary = await apiUtils.getAdminReportSummary( payloads.adminAuth); //TODO: fix admin auth don't work if test use auth from storage json
		await adminDashboardPage.dokanAtAGlanceValueAccuracy(summary);
	});

	test('admin can add dokan news subscriber @lite @pro', async ( ) => {
		await adminDashboardPage.addDokanNewsSubscriber(data.user.userDetails);
	});

});