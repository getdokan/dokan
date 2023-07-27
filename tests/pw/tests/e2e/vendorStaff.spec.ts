import { test, Page } from '@playwright/test';
import { VendorStaffPage } from 'pages/vendorStaffPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe.skip('Vendor staff test', () => {


	let vendor: VendorStaffPage;
	let vPage: Page;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, request }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new VendorStaffPage(vPage);
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


	test.afterAll(async () => {
		await vPage.close();
	});


	test('vendor staff menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorStaffRenderProperly();
	});

	test('vendor can add new staff @pro', async ( ) => {
		await vendor.addStaff(data.staff);
	});

	test('vendor can edit staff @pro', async ( ) => {
		await vendor.editStaff(data.staff);
	});

	test('vendor can manage staff permission @pro', async ( ) => {
		await vendor.manageStaffPermission(data.staff.firstName);
	});

	test('vendor can delete staff @pro', async ( ) => {
		await vendor.deleteStaff(data.staff.firstName);
	});

	//todo:  add tests for all permission group
	//todo : add tests for email template

});