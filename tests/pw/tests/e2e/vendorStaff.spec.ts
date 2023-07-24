import { test, Page } from '@playwright/test';
import { VendorStaffPage } from 'pages/vendorStaffPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Vendor staff test', () => {


	let vendorStaffPage: VendorStaffPage;
	let vPage: Page;
	let apiUtils: ApiUtils;

	test.beforeAll(async ({ browser, request }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendorStaffPage = new VendorStaffPage(vPage);
		apiUtils = new ApiUtils(request);
		// const staff = {
		// 	username: 'staff1',
		// 	first_name: 'staff1',
		// 	last_name: 's1',
		// 	email: 's1@g.c',
		// 	roles: ['vendor_staff'],
		// 	password: '01dokan01'
		// 	meta:[
		// 		{
		// 			key: '_vendor_id'
		// 			value:
		// 		}
		// 	]
		// };

		// await apiUtils.createUser( staff, payloads.adminAuth);
	});

	test.afterAll(async ( ) => {
		await vPage.close();
	});


	test('vendor staff menu page is rendering properly @pro @explo', async ( ) => {
		await vendorStaffPage.vendorStaffRenderProperly();
	});

	test('vendor can add new staff @pro', async ( ) => {
		await vendorStaffPage.addStaff(data.staff);
	});

	test('vendor can edit staff @pro', async ( ) => {
		await vendorStaffPage.editStaff(data.staff);
	});

	test('vendor can manage staff permission @pro', async ( ) => {
		await vendorStaffPage.manageStaffPermission(data.staff.firstName);
	});

	test('vendor can delete staff @pro', async ( ) => {
		await vendorStaffPage.deleteStaff(data.staff.firstName);
	});

	//TODO: add tests for all permission group
	//TODL : add tests for email template

});