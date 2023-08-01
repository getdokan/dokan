import { test, Page } from '@playwright/test';
import { ProductsPage } from 'pages/productsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Product functionality test', () => {


	let admin: ProductsPage;
	let vendor: ProductsPage;
	let aPage: Page, vPage: Page;
	let apiUtils: ApiUtils;
	let productName: string;


	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new ProductsPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new ProductsPage(vPage);

		apiUtils = new ApiUtils(request);
		[,, productName] = await apiUtils.createProduct(payloads.createProduct(), payloads. vendorAuth);

	});


	test.afterAll(async () => {
		await aPage.close();
		await vPage.close();
	});


	test('admin can add product category @lite @pro', async ( ) => {
		await admin.addCategory(data.product.category.randomCategory());
	});

	test('admin can add product attribute @lite @pro', async ( ) => {
		await admin.addAttribute(data.product.attribute.randomAttribute());
	});

	test('admin can add simple product @lite @pro', async ( ) => {
		await admin.addSimpleProduct(data.product.simple);
	});

	// test.skip('admin can add variable product @pro', async ( ) => {
	// 	await admin.addVariableProduct(data.product.variable);
	// });

	test('admin can add simple subscription  @pro', async ( ) => {
		await admin.addSimpleSubscription(data.product.simpleSubscription);
	});

	// test.skip('admin can add variable subscription @pro', async ( ) => {
	// 	// await admin.addVariableSubscription(data.product.variableSubscription);
	// });

	test('admin can add external product @lite @pro', async ( ) => {
		await admin.addExternalProduct(data.product.external);
	});

	test('admin can add vendor subscription @pro', async ( ) => {
		await admin.addDokanSubscription(data.product.vendorSubscription);
	});

	test('admin can add auction product @pro', async ( ) => {
		await admin.addAuctionProduct(data.product.auction);
	});

	test('admin can add booking product @pro', async ( ) => {
		await admin.addBookingProduct(data.product.booking);
	});


	//vendors


	test('vendor product menu page is rendering properly @lite @pro @explo', async ( ) => {
		await vendor.vendorProductsRenderProperly();
	});

	test('vendor can export products @pro', async ( ) => {
		await vendor.exportProducts();
	});

	test('vendor can search product @lite @pro', async ( ) => {
		await vendor.searchProduct(data.predefined.simpleProduct.product1.name);
	});

	test('vendor can filter products by date @lite @pro', async ( ) => {
		await vendor.filterProducts('by-date', '1');
	});

	test('vendor can filter products by category @lite @pro', async ( ) => {
		await vendor.filterProducts('by-category', 'Uncategorized');
	});

	test('vendor can filter products by type @lite @pro', async ( ) => {
		test.skip(!!process.env.CI, 'Filter gets removed if booking module is enabled!');
		await vendor.filterProducts('by-other', 'simple');
	});

	test('vendor can filter products by other @pro', async ( ) => {
		await vendor.filterProducts('by-other', 'featured');
	});

	test('vendor can view product @lite @pro', async ( ) => {
		await vendor.viewProduct(data.predefined.simpleProduct.product1.name);
	});

	test('vendor can edit product @lite @pro', async ( ) => {
		await vendor.editProduct({ ...data.product.simple, editProduct: productName });
	});

	test('vendor can quick edit product @pro', async ( ) => {
		await vendor.quickEditProduct({ ...data.product.simple, editProduct: productName });
	});

	test('vendor can duplicate product @pro', async ( ) => {
		await vendor.duplicateProduct(productName);
	});

	test('vendor can permanently delete product @lite @pro', async ( ) => {
		const [,, productName] = await apiUtils.createProduct(payloads.createProduct(), payloads. vendorAuth);
		await vendor.permanentlyDeleteProduct(productName);
	});

});
