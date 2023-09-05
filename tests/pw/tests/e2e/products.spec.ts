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


	test('admin can add product category @lite', async ( ) => {
		await admin.addCategory(data.product.category.randomCategory());
	});

	test('admin can add product attribute @lite', async ( ) => {
		await admin.addAttribute(data.product.attribute.randomAttribute());
	});

	test('admin can add simple product @lite', async ( ) => {
		await admin.addSimpleProduct(data.product.simple);
	});

	// test('admin can add variable product @pro', async ( ) => {
	// 	await admin.addVariableProduct(data.product.variable);
	// });

	test('admin can add simple subscription  @pro', async ( ) => {
		await admin.addSimpleSubscription(data.product.simpleSubscription);
	});

	// test('admin can add variable subscription @pro', async ( ) => {
	// 	await admin.addVariableSubscription(data.product.variableSubscription);
	// });

	test('admin can add external product @lite', async ( ) => {
		await admin.addExternalProduct(data.product.external);
	});

	test('admin can add vendor subscription @pro', async ( ) => {
		await admin.addDokanSubscription(data.product.vendorSubscription);
	});


	//vendors

	//todo: move create product in separate files, or product functionality to another page

	test('vendor can add simple product @lite', async ( ) => {
		await vendor.vendorAddSimpleProduct(data.product.simple);
	});

	test('vendor can add variable product @pro', async ( ) => {
		await vendor.vendorAddVariableProduct(data.product.variable);
	});

	test('vendor can add simple subscription product @pro', async ( ) => {
		await vendor.vendorAddSimpleSubscription(data.product.simpleSubscription);
	});

	test('vendor can add variable subscription product @pro', async ( ) => {
		await vendor.vendorAddVariableSubscription(data.product.variableSubscription);
	});

	test('vendor can add external product @pro', async ( ) => {
		await vendor.vendorAddExternalProduct(data.product.external);
	});

	test('vendor can add product product category @lite', async ( ) => {
		await vendor.vendorAddProductCategory(data.predefined.simpleProduct.product1.name, data.product.category.unCategorized);
	});


	test('vendor product menu page is rendering properly @lite @explo', async ( ) => {
		await vendor.vendorProductsRenderProperly();
	});

	test('vendor can export products @pro', async ( ) => {
		await vendor.exportProducts();
	});

	test('vendor can search product @lite', async ( ) => {
		await vendor.searchProduct(data.predefined.simpleProduct.product1.name);
	});

	test('vendor can filter products by date @lite', async ( ) => {
		await vendor.filterProducts('by-date', '1');
	});

	test('vendor can filter products by category @lite', async ( ) => {
		await vendor.filterProducts('by-category', 'Uncategorized');
	});

	test('vendor can filter products by type @lite', async ( ) => {
		test.skip(!!process.env.CI, 'Filter gets removed if booking module is enabled!');
		await vendor.filterProducts('by-other', 'simple');
	});

	test('vendor can filter products by other @pro', async ( ) => {
		await vendor.filterProducts('by-other', 'featured');
	});

	test('vendor can view product @lite', async ( ) => {
		await vendor.viewProduct(data.predefined.simpleProduct.product1.name);
	});

	test('vendor can\'t buy own product @pro', async ( ) => {
		await vendor.cantBuyOwnProduct(productName);
	});

	test('vendor can edit product @lite', async ( ) => {
		await vendor.editProduct({ ...data.product.simple, editProduct: productName });
	});

	test('vendor can quick edit product @pro', async ( ) => {
		await vendor.quickEditProduct({ ...data.product.simple, editProduct: productName });
	});

	// test('vendor can add product quantity discount @pro', async ( ) => {
	// 	await vendor.addProductQuantityDiscount(data.predefined.simpleProduct.product1.name, data.vendor.vendorInfo.quantityDiscount);
	// });

	test('vendor can add product rma settings @pro', async ( ) => {
		await vendor.addProductRmaSettings(data.predefined.simpleProduct.product1.name, data.vendor.rma);
	});

	//todo: add more product edit tests -> discount, wholesale, advertising

	test('vendor can duplicate product @pro', async ( ) => {
		await vendor.duplicateProduct(productName);
	});

	test('vendor can permanently delete product @lite', async ( ) => {
		const [,, productName] = await apiUtils.createProduct(payloads.createProduct(), payloads. vendorAuth);
		await vendor.permanentlyDeleteProduct(productName);
	});


});
