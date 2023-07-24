import { test, Page } from '@playwright/test';
import { ProductsPage } from 'pages/productsPage';
import { data } from 'utils/testData';


test.describe('Admin functionality test', () => {

	// test.use({ storageState: data.auth.adminAuthFile });

	let productsAdmin: ProductsPage;
	let productsVendor: ProductsPage;
	let aPage: Page, vPage: Page;

	test.beforeAll(async ({ browser }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		productsAdmin = new ProductsPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		productsVendor = new ProductsPage(vPage);
	});

	test.afterAll(async ( ) => {
		await aPage.close();
		await vPage.close();
	});

	test('admin can add product category @lite @pro', async ( ) => {
		await productsAdmin.addCategory(data.product.category.randomCategory());
	});

	test('admin can add product attribute @lite @pro', async ( ) => {
		await productsAdmin.addAttribute(data.product.attribute.randomAttribute());
	});

	test('admin can add simple product @lite @pro', async ( ) => {
		await productsAdmin.addSimpleProduct(data.product.simple);
	});

	// test.skip('admin can add variable product @pro', async ( )=> {
	// 	await productsAdmin.addVariableProduct(data.product.variable);
	// });

	test('admin can add simple subscription  @pro', async ( ) => {
		await productsAdmin.addSimpleSubscription(data.product.simpleSubscription);
	});

	// test.skip('admin can add variable subscription @pro', async ( )=> {
	// 	await productsAdmin.addVariableSubscription(data.product.variableSubscription);
	// });

	test('admin can add external product @lite @pro', async ( ) => {
		await productsAdmin.addExternalProduct(data.product.external);
	});

	test('admin can add vendor subscription @pro', async ( ) => {
		await productsAdmin.addDokanSubscription(data.product.vendorSubscription);
	});

	test('admin can add auction product @pro', async ( ) => {
		await productsAdmin.addAuctionProduct(data.product.auction);
	});

	test('admin can add booking product @pro', async ( ) => {
		await productsAdmin.addBookingProduct(data.product.booking);
	});

});
