import { test, expect, type Page } from '@playwright/test';
import { data } from '../utils/testData';
import { LoginPage } from '../pages/loginPage';
import { AdminPage } from '../pages/adminPage';
import { CustomerPage } from '../pages/customerPage';
import { VendorPage } from '../pages/vendorPage';

test.describe('Vendor user functionality test1', () => {

	// test.use({ storageState: 'vendorStorageState.json' });
	test('vendor can register', async ({ page }) => {
		const loginPage = new LoginPage(page)
		const vendorPage = new VendorPage(page)
		await vendorPage.vendorRegister(data.vendor.vendorInfo, data.vendorSetupWizard)
		await loginPage.logout()
	})

	test('vendor can login', async ({ page }) => {
		const loginPage = new LoginPage(page)
		await loginPage.login(data.vendor)
	})

	test('vendor can logout', async ({ page }) => {
		const loginPage = new LoginPage(page)
		await loginPage.login(data.vendor)
		await loginPage.logout()
	})

});

test.describe('Vendor functionality test', () => {

	test.use({ storageState: 'vendorStorageState.json' });

	// let loginPage: any;
	let vendorPage: any;
	// let page: Page;

	test.beforeAll(async ({ browser }) => {
		// page = await browser.newPage();
		// loginPage = new LoginPage(page);
		const vendor = await browser.newPage();
		vendorPage = new VendorPage(vendor);
	});

	test('vendor can setup setup wizard', async ({ }) => {
		await vendorPage.vendorSetupWizard(data.vendorSetupWizard);
	});

	test('vendor can add simple product @product', async ({ }) => {
		await vendorPage.addSimpleProduct(data.product.simple);
	});

	test.fixme('vendor can add variable product', async ({ }) => {
		await vendorPage.addVariableProduct(data.product.variable);
	});

	test('vendor can add simple subscription product', async ({ }) => {
		await vendorPage.addSimpleSubscription(data.product.simpleSubscription);
	});

	test.fixme('vendor can add variable subscription product', async ({ }) => {
		await vendorPage.addVariableSubscription(data.product.variableSubscription);
	});

	test('vendor can add external product', async ({ }) => {
		await vendorPage.addExternalProduct(data.product.external);
	});

	test('vendor can add auction product', async ({ }) => {
		await vendorPage.addAuctionProduct(data.product.auction);
	});

	test('vendor can add booking product', async ({ }) => {
		await vendorPage.addBookingProduct(data.product.booking);
	});

	test.only('vendor can add coupon', async ({ }) => {
		await vendorPage.addCoupon(data.coupon);
	});

	test('vendor can request withdraw', async ({ }) => {
		await vendorPage.requestWithdraw(data.vendor.withdraw);
	});

	test('vendor can cancel request withdraw', async ({ }) => {
		await vendorPage.requestWithdraw( data.vendor.withdraw );
		await vendorPage.cancelRequestWithdraw();
	});

	test('vendor can add auto withdraw disbursement schedule', async ({ }) => {
		await vendorPage.addAutoWithdrawDisbursementSchedule(data.vendor.withdraw);
	});

	test('vendor can add default withdraw payment methods ', async ({ }) => {
		await vendorPage.addDefaultWithdrawPaymentMethods(data.vendor.withdraw.defaultWithdrawMethod.bankTransfer);
		// Cleanup
		await vendorPage.addDefaultWithdrawPaymentMethods(data.vendor.withdraw.defaultWithdrawMethod.paypal);
	});


	test('vendor update account details @lite @pro', async ({ }) => {
		await vendorPage.setVendorDetails(data.vendor.vendorInfo); //TODO: update test order or reset password
	});

	// account settings
	test('vendor can set store settings ', async ({ }) => {
		await vendorPage.setStoreSettings(data.vendor.vendorInfo);
	});

	test('vendor can add addons', async ({ }) => {
		await vendorPage.addAddon(data.vendor.addon);
	});

	test.fixme('vendor can edit addon', async ({ }) => {
		const addonName = await vendorPage.addAddon(data.vendor.addon);
		await vendorPage.editAddon(data.vendor.addon, addonName);
	});

	test('vendor can add payment method', async ({ }) => {
		await vendorPage.setPaymentSettings(data.vendor.payment);
	});

	test.skip('vendor can send id verification request ', async ({ }) => {
		await vendorPage.sendIdVerificationRequest(data.vendor.verification);
	});

	test.skip('vendor can send address verification request ', async ({ }) => {
		await vendorPage.sendAddressVerificationRequest(data.vendor.verification);
	});

	test.skip('vendor can send company verification request ', async ({ }) => {
		await vendorPage.sendCompanyVerificationRequest(data.vendor.verification);
	});

	test('vendor can set delivery time settings ', async ({ }) => {
		await vendorPage.setDeliveryTimeSettings(data.vendor.deliveryTime);
	});

	test('vendor can set shipping policy', async ({ }) => {
		await vendorPage.setShippingPolicies(data.vendor.shipping.shippingPolicy);
	});

	test('vendor can set flat rate shipping ', async ({ }) => {
		await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.flatRate);
	});

	test('vendor can set free shipping ', async ({ }) => {
		await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.freeShipping);
	});

	test('vendor can set local pickup shipping ', async ({ }) => {
		await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.localPickup);
	});

	test('vendor can set table rate shipping shipping ', async ({ }) => {
		await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.tableRateShipping);
	});

	test('vendor can set dokan distance rate shipping ', async ({ }) => {
		await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.distanceRateShipping);
	});

	test('vendor can set social profile settings ', async ({ }) => {
		await vendorPage.setSocialProfile(data.vendor.socialProfileUrls);
	});

	test('vendor can set rma settings ', async ({ }) => {
		await vendorPage.setRmaSettings(data.vendor.rma);
	});
});
