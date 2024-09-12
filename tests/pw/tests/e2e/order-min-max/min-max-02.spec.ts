import test, { Browser, chromium, expect, Page } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import randomstring from 'randomstring';

import 'dotenv/config';
import VendorDashboardSidebarPage from '@pages/frontend/vendor-dashboard/common/vendor-sidebar.page';
import MyAccountAuthPage from '@pages/frontend/my-account/auth/my-account-auth.page';
import VendorProductListPage from '@pages/frontend/vendor-dashboard/products/products-list.page';
import VendorProductAddEditPage from '@pages/frontend/vendor-dashboard/products/product-add-edit.page';
import ShopPage from '@pages/frontend/shop/shop.page';
import SingleProductPage from '@pages/frontend/shop/single-product.page';
import VendorStoreSettingsPage from '@pages/frontend/vendor-dashboard/settings/store/vendor-store.page';

let baseUrl: string;
let api: ApiUtils;
let productName: string;
let customerEmail: string;
let vendorId: string;
let vendorEmail: string;
let storeName: string;
let storeSettingsPage: VendorStoreSettingsPage;

let vendorDashboardSidebarPage: VendorDashboardSidebarPage;
let vendorMyAccountAuthPage: MyAccountAuthPage;
let vendorProductListPage: VendorProductListPage;
let vendorProductAddEditPage: VendorProductAddEditPage;
let vendorPage: Page;

let customerPage: Page;
let customerMyAccountAuthPage: MyAccountAuthPage;
let shopPage: ShopPage;
let singleProductPage: SingleProductPage;

let vendorBrowser: Browser;
let customerBrowser: Browser;

test.describe.only('Order Min-Max - Single Product Page', () => {
    test.beforeEach(async ({ page, request }, testInfo) => {
        baseUrl = testInfo.project.use.baseURL as string;
        await page.goto(baseUrl);
        api = new ApiUtils(request);

        // create customer
        const customer = await api.createCustomer(payloads.createCustomer(), payloads.adminAuth);
        customerEmail = customer[0].email;

        // create vendor
        const vendor = await api.createStore(payloads.createStore(), payloads.adminAuth);
        vendorId = vendor[0].id;
        vendorEmail = vendor[0].email;
        storeName = vendor[0]['store_name'];

        // // create product
        const productTitle = `Automation Simple Product ${vendorId}${randomstring.generate(5)}`;
        const product = await api.createProduct(
            {
                name: productTitle,
                type: 'simple',
                regular_price: '10',
                status: 'publish',
                post_author: `${vendorId}`,
                categories: [{}],
                description: '<p>test description</p>',
            },
            payloads.adminAuth,
        );

        productName = product[0]['name'];

        // vendor
        vendorBrowser = await chromium.launch();
        vendorPage = await vendorBrowser.newPage();
        vendorDashboardSidebarPage = new VendorDashboardSidebarPage(vendorPage);
        vendorMyAccountAuthPage = new MyAccountAuthPage(vendorPage);
        vendorProductListPage = new VendorProductListPage(vendorPage);
        vendorProductAddEditPage = new VendorProductAddEditPage(vendorPage);
        storeSettingsPage = new VendorStoreSettingsPage(vendorPage);

        // customer
        customerBrowser = await chromium.launch();
        customerPage = await customerBrowser.newPage();
        customerMyAccountAuthPage = new MyAccountAuthPage(customerPage);
        shopPage = new ShopPage(customerPage);
        singleProductPage = new SingleProductPage(customerPage);

        // vendor login
        await vendorPage.goto(baseUrl + '/dashboard/');
        await vendorMyAccountAuthPage.enterUsername(vendorEmail);
        await vendorMyAccountAuthPage.enterPassword(process.env.USER_PASSWORD);
        await vendorMyAccountAuthPage.clickOnLoginButton();

        // customer login
        await customerPage.goto(baseUrl + '/my-account/');
        await customerMyAccountAuthPage.enterUsername(customerEmail);
        await customerMyAccountAuthPage.enterPassword(process.env.USER_PASSWORD);
        await customerMyAccountAuthPage.clickOnLoginButton();
    });

    test.afterEach(async () => {
        await vendorBrowser.close();
        await customerBrowser.close();
    });

    test('Adding more product than max quantity limit displays error in single product page', { tag: ['@lite', '@admin'] }, async () => {
        // await vendorPage.goto(baseUrl + '/dashboard/');
        // await vendorMyAccountAuthPage.enterUsername(vendorEmail);
        // await vendorMyAccountAuthPage.enterPassword(process.env.USER_PASSWORD);
        // await vendorMyAccountAuthPage.clickOnLoginButton();

        await vendorDashboardSidebarPage.clickOnProductsTab();
        await vendorProductListPage.clickOnProductWithTitle(productName);

        const maxQuantity = '2';

        await vendorProductAddEditPage.enterSimpleProductMaxQty(maxQuantity);
        await vendorProductAddEditPage.selectProductStatus('publish');
        await vendorProductAddEditPage.clickOnSaveProduct();

        // await customerPage.goto(baseUrl + '/my-account/');
        // await customerMyAccountAuthPage.enterUsername(customerEmail);
        // await customerMyAccountAuthPage.enterPassword(process.env.USER_PASSWORD);
        // await customerMyAccountAuthPage.clickOnLoginButton();

        await customerPage.goto(baseUrl + '/shop/');
        await shopPage.clickOnProductWithTitle(productName);
        await singleProductPage.clickOnAddToCartButton();
        await singleProductPage.clickOnAddToCartButton();
        await singleProductPage.clickOnAddToCartButton();

        const errorMessage = await singleProductPage.errorMessageElement().allInnerTexts();
        const expectedErrorMessage = `Maximum allowed quantity for ${productName} is ${maxQuantity}.`;

        expect(errorMessage[0]).toEqual(expectedErrorMessage);
    });

    test('Error displayed in single product page if added product exceeds maximum allowed amount', { tag: ['@lite', '@admin'] }, async () => {
        // await vendorPage.goto(baseUrl + '/dashboard/');
        // await vendorMyAccountAuthPage.enterUsername(vendorEmail);
        // await vendorMyAccountAuthPage.enterPassword(process.env.USER_PASSWORD);
        // await vendorMyAccountAuthPage.clickOnLoginButton();

        await vendorDashboardSidebarPage.clickOnProductsTab();
        await vendorProductListPage.clickOnProductWithTitle(productName);

        await vendorProductAddEditPage.selectProductStatus('publish');
        await vendorProductAddEditPage.clickOnSaveProduct();

        const maxAmount = '20';

        await vendorDashboardSidebarPage.clickOnSettingsTab();
        await storeSettingsPage.enterMaximumOrderAmount(maxAmount);
        await storeSettingsPage.clickOnUpdateSettingsButton();

        // await customerPage.goto(baseUrl + '/my-account/');
        // await customerMyAccountAuthPage.enterUsername(customerEmail);
        // await customerMyAccountAuthPage.enterPassword(process.env.USER_PASSWORD);
        // await customerMyAccountAuthPage.clickOnLoginButton();

        await customerPage.goto(baseUrl + '/shop/');
        await shopPage.clickOnProductWithTitle(productName);
        await singleProductPage.clickOnAddToCartButton();
        await singleProductPage.clickOnAddToCartButton();
        await singleProductPage.clickOnAddToCartButton();

        const errorMessage = await singleProductPage.errorMessageElement().allInnerTexts();
        const expectedErrorMessage = `Maximum allowed cart amount for ${storeName} is $${maxAmount}.00. You currently have $20.00 in cart.`;

        expect(errorMessage[0]).toEqual(expectedErrorMessage);
    });
});
