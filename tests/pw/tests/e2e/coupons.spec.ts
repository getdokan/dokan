import { test, Page } from '@playwright/test';
import { CouponsPage } from 'pages/couponsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';

const { PRODUCT_ID } = process.env;


test.describe('Coupons test', () => {


	let couponsAdmin: CouponsPage;
	let couponsVendor: CouponsPage;
	let couponsCustomer: CouponsPage;
	let aPage: Page, vPage: Page, cPage: Page;
	let apiUtils: ApiUtils;
	let couponCode: string;

	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		couponsAdmin = new CouponsPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		couponsVendor = new CouponsPage(vPage);

		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		cPage = await customerContext.newPage();
		couponsCustomer = new CouponsPage(cPage);

		apiUtils = new ApiUtils(request);
		await apiUtils.createMarketPlaceCoupon( payloads.createMarketPlaceCoupon(), payloads.adminAuth);
		[,, couponCode] = await apiUtils.createCoupon([PRODUCT_ID], payloads.createCoupon(), payloads.vendorAuth);
	});

	test.afterAll(async ( ) => {
		await aPage.close();
		await vPage.close();
		await cPage.close();
	});

	test('admin can add marketplace coupon @pro', async ( ) => {
		await couponsAdmin.addMarketplaceCoupon(data.coupon);
	});

	test('vendor coupon menu page is rendering properly @pro @explo', async ( ) => {
		await couponsVendor.vendorCouponsRenderProperly();
	});

	test('vendor can view marketPlace coupon @pro', async ( ) => {
		await couponsVendor.viewMarketPlaceCoupon();
	});

	test('vendor can add coupon @pro', async ( ) => {
		await couponsVendor.addCoupon(data.coupon);
	});

	test('vendor can edit coupon @pro', async ( ) => {
		await couponsVendor.editCoupon({ ...data.coupon, editCoupon: couponCode });
	});

	test('vendor can delete coupon @pro', async ( ) => {
		await couponsVendor.deleteCoupon(couponCode);
	});

	test('customer can view coupon on single store @pro', async ( ) => {
		await couponsCustomer.storeCoupon(data.predefined.vendorStores.vendor1, 'c1_v1');
	});

	//todo: add more customer tests


});
