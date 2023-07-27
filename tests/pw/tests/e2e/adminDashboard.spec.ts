import { test, Page } from '@playwright/test';
import { AdminDashboardPage } from 'pages/adminDashboardPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Admin dashboard test', () => {


	let admin: AdminDashboardPage;
	let aPage: Page;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new AdminDashboardPage(aPage);
		apiUtils = new ApiUtils(request);
	});


	test.afterAll(async () => {
		await aPage.close();
	});


	test('dokan admin dashboard is rendering properly @lite @pro @explo', async ( ) => {
		await admin.adminDashboardRenderProperly();
	});

	test('admin dashboard at a glance values are accurate @lite @pro', async ( ) => {
		const summary = await apiUtils.getAdminReportSummary( payloads.adminAuth);
		await admin.dokanAtAGlanceValueAccuracy(summary);
	});

	test('admin can add dokan news subscriber @lite @pro', async ( ) => {
		await admin.addDokanNewsSubscriber(data.user.userDetails);
	});

});