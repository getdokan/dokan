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
import CartPage from '@pages/frontend/cart.page';
import StorefrontMainMenu from '@pages/frontend/navigation/main-menu.page';

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
let cartPage: CartPage;
let storefrontMainMenu: StorefrontMainMenu;

let vendorBrowser: Browser;
let customerBrowser: Browser;

test.describe.only('Order Min-Max - Cart Page', () => {
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
        const title = `Automation Simple Product ${vendorId}${randomstring.generate(5)}`;
        const product = await api.createProduct(
            {
                name: title,
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
        cartPage = new CartPage(customerPage);
        storefrontMainMenu = new StorefrontMainMenu(customerPage);

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

    test('Product quantity should not be more than maximum limit', { tag: ['@lite', '@admin'] }, async () => {
        // vendor
        await vendorDashboardSidebarPage.clickOnProductsTab();
        await vendorProductListPage.clickOnProductWithTitle(productName);
        await vendorProductAddEditPage.enterSimpleProductMaxQty('4');
        await vendorProductAddEditPage.selectProductStatus('publish');
        await vendorProductAddEditPage.clickOnSaveProduct();

        // customer
        await customerPage.goto(baseUrl + '/shop/');
        await shopPage.clickOnProductWithTitle(productName);
        await singleProductPage.clickOnAddToCartButton();
        await customerPage.goto(baseUrl + '/cart/');
        await cartPage.enterQuantityValue(productName, '5');
        await cartPage.clickOnUpdateCartButton();

        const quantityErrorMessage = await cartPage.quantityErrorElement().textContent();
        const woocommerceError = await cartPage.woocommerceErrorMessage().textContent();

        expect(quantityErrorMessage?.includes(`Maximum 4 allowed`)).toBeTruthy();
        expect(woocommerceError?.includes(`Maximum allowed quantity for ${productName} is 4.`)).toBeTruthy();
    });

    test('Product quantity should not be less than minimum limit', { tag: ['@lite', '@admin'] }, async () => {
        // vendor
        await vendorDashboardSidebarPage.clickOnProductsTab();
        await vendorProductListPage.clickOnProductWithTitle(productName);
        await vendorProductAddEditPage.enterSimpleProductMinQty('3');
        await vendorProductAddEditPage.selectProductStatus('publish');
        await vendorProductAddEditPage.clickOnSaveProduct();

        // customer
        await customerPage.goto(baseUrl + '/shop/');
        await shopPage.clickOnProductWithTitle(productName);
        await singleProductPage.clickOnAddToCartButton();
        await customerPage.goto(baseUrl + '/cart/');
        await cartPage.enterQuantityValue(productName, '2');
        await cartPage.clickOnUpdateCartButton();

        const quantityErrorMessage = await cartPage.quantityErrorElement().textContent();
        const woocommerceError = await cartPage.woocommerceErrorMessage().textContent();

        expect(quantityErrorMessage?.includes(`Minimum 3 required`)).toBeTruthy();
        expect(woocommerceError?.includes(`Minimum required quantity for ${productName} is 3.`)).toBeTruthy();
    });

    test('Cart total should not be more than maximum amount limit', { tag: ['@lite', '@admin'] }, async () => {
        // vendor
        await vendorDashboardSidebarPage.clickOnProductsTab();
        await vendorProductListPage.clickOnProductWithTitle(productName);
        await vendorProductAddEditPage.selectProductStatus('publish');
        await vendorProductAddEditPage.clickOnSaveProduct();

        await vendorDashboardSidebarPage.clickOnSettingsTab();
        await storeSettingsPage.enterMaximumOrderAmount('30');
        await storeSettingsPage.clickOnUpdateSettingsButton();

        // customer
        await customerPage.goto(baseUrl + '/shop/');
        await shopPage.clickOnProductWithTitle(productName);
        await singleProductPage.clickOnAddToCartButton();
        await customerPage.goto(baseUrl + '/cart/');
        await cartPage.enterQuantityValue(productName, '4');
        await cartPage.clickOnUpdateCartButton();

        const woocommerceError = await cartPage.woocommerceErrorMessage().textContent();

        expect(woocommerceError?.trim()).toEqual(`Maximum allowed cart amount for ${storeName} is $30.00. You currently have $40.00 in cart.`);
    });

    test.only('Cart total should not be less than minimum amount limit', { tag: ['@lite', '@admin'] }, async () => {
        // vendor
        await vendorDashboardSidebarPage.clickOnProductsTab();
        await vendorProductListPage.clickOnProductWithTitle(productName);
        await vendorProductAddEditPage.selectProductStatus('publish');
        await vendorProductAddEditPage.clickOnSaveProduct();

        await vendorDashboardSidebarPage.clickOnSettingsTab();
        await storeSettingsPage.enterMinimumOrderAmount('30');
        await storeSettingsPage.clickOnUpdateSettingsButton();

        // customer
        await customerPage.goto(baseUrl + '/shop/');
        await shopPage.clickOnProductWithTitle(productName);
        await singleProductPage.enterQuantityValue(productName, '2');
        await singleProductPage.clickOnAddToCartButton();
        await customerPage.goto(baseUrl + '/cart/');
        await storefrontMainMenu.clickOnCartContentLink();

        const woocommerceError = await cartPage.woocommerceErrorMessage().textContent();

        expect(woocommerceError?.trim()).toEqual(`Minimum required cart amount for ${storeName} is $30.00. You currently have $20.00 in cart.`);
    });
});
