import { test, Page } from '@playwright/test';
import { VendorStaffPage } from 'pages/vendorStaffPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Vendor staff test', () => {
	test.skip(!!process.env.CI, 'dokan issue while creating vendor staff');

	let vendor: VendorStaffPage;
	let vPage: Page;
	// let apiUtils: ApiUtils;
	const staff = data.staff();


	test.beforeAll(async ({ browser }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new VendorStaffPage(vPage);

		await vendor.addStaff(staff); //todo: replace with api

		// apiUtils = new ApiUtils(request);
		// await apiUtils.createUser( payloads.staff, payloads.adminAuth);

	});


	test.afterAll(async () => {
		await vPage.close();
	});


	test('vendor staff menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorStaffRenderProperly();
	});

	test('vendor can add new staff @pro', async ( ) => {
		await vendor.addStaff(data.staff());
	});

	test('vendor can edit staff @pro', async ( ) => {
		await vendor.editStaff(staff);
	});

	test('vendor can manage staff permission @pro', async ( ) => {
		await vendor.manageStaffPermission(staff.firstName + ' ' + staff.lastName);
	});

	test('vendor can delete staff @pro', async ( ) => {
		await vendor.deleteStaff(staff.firstName + ' ' + staff.lastName);
	});

});