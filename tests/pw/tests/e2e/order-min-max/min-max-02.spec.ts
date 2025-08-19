import test, { BrowserContext, expect, Page } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';

import VendorDashboardSidebarPage from '@pages/frontend/vendor-dashboard/common/vendor-sidebar.page';
import VendorProductListPage from '@pages/frontend/vendor-dashboard/products/products-list.page';
import VendorProductAddEditPage from '@pages/frontend/vendor-dashboard/products/product-add-edit.page';
import ShopPage from '@pages/frontend/shop/shop.page';
import SingleProductPage from '@pages/frontend/shop/single-product.page';
import VendorStoreSettingsPage from '@pages/frontend/vendor-dashboard/settings/store/vendor-store.page';
import CartPage from '@pages/frontend/cart.page';
import StorefrontMainMenu from '@pages/frontend/navigation/main-menu.page';
import { faker } from '@faker-js/faker';
import MyAccountAuthPage from '@pages/frontend/my-account/auth/my-account-auth.page';

let api: ApiUtils;
let productName: string;
let vendorId: string;
let storeName: string;
let storeSettingsPage: VendorStoreSettingsPage;

let vendorDashboardSidebarPage: VendorDashboardSidebarPage;
let vendorProductListPage: VendorProductListPage;
let vendorProductAddEditPage: VendorProductAddEditPage;
let vendorMyAccountAuthPage: MyAccountAuthPage;
let vendorPage: Page;
let vendorEmail: string;

let customerPage: Page;
let customerMyAccountAuthPage: MyAccountAuthPage;
let shopPage: ShopPage;
let singleProductPage: SingleProductPage;
let customerCartPage: CartPage;
let storefrontMainMenu: StorefrontMainMenu;
let customerEmail: string;

let vendorBrowserContext: BrowserContext;
let customerBrowserContext: BrowserContext;

test.describe('Order Min-Max - Cart Page', () => {
    test.beforeEach(async ({ page, request, browser, baseURL }) => {
        await page.goto(baseURL as string);
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
        const title = `Automation Simple Product ${vendorId}${faker.string.alpha(10)}`;
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
        vendorBrowserContext = await browser.newContext();
        vendorPage = await vendorBrowserContext.newPage();

        vendorDashboardSidebarPage = new VendorDashboardSidebarPage(vendorPage);
        vendorProductListPage = new VendorProductListPage(vendorPage);
        vendorProductAddEditPage = new VendorProductAddEditPage(vendorPage);
        vendorMyAccountAuthPage = new MyAccountAuthPage(vendorPage);
        storeSettingsPage = new VendorStoreSettingsPage(vendorPage);

        // customer
        customerBrowserContext = await browser.newContext();
        customerPage = await customerBrowserContext.newPage();
        shopPage = new ShopPage(customerPage);
        customerMyAccountAuthPage = new MyAccountAuthPage(customerPage);
        singleProductPage = new SingleProductPage(customerPage);
        customerCartPage = new CartPage(customerPage);
        storefrontMainMenu = new StorefrontMainMenu(customerPage);

        await vendorPage.goto(data.subUrls.frontend.vDashboard.dashboard);
        await vendorMyAccountAuthPage.enterUsername(vendorEmail);
        await vendorMyAccountAuthPage.enterPassword(process.env.USER_PASSWORD);
        await vendorMyAccountAuthPage.clickOnLoginButton();

        await customerPage.goto(data.subUrls.frontend.myAccount);
        await customerMyAccountAuthPage.enterUsername(customerEmail);
        await customerMyAccountAuthPage.enterPassword(process.env.USER_PASSWORD);
        await customerMyAccountAuthPage.clickOnLoginButton();
    });

    test.afterEach(async () => {
        await vendorBrowserContext.close();
        await customerBrowserContext.close();
    });

    test('Product quantity should not be more than maximum limit', { tag: ['@admin'] }, async () => {
        // vendor
        await vendorDashboardSidebarPage.clickOnProductsTab();
        await vendorProductListPage.clickOnProductWithTitle(productName);
        await vendorProductAddEditPage.enterSimpleProductMaxQty('4');
        await vendorProductAddEditPage.selectProductStatus('publish');
        await vendorProductAddEditPage.clickOnSaveProduct();

        // customer
        await customerPage.goto(data.subUrls.frontend.shop);
        await shopPage.clickOnProductWithTitle(productName);
        await singleProductPage.clickOnAddToCartButton();
        await customerPage.goto(data.subUrls.frontend.cart);
        await customerCartPage.enterQuantityValue(productName, '5');
        await customerCartPage.clickOnUpdateCartButton();

        const quantityErrorMessage = await customerCartPage.quantityErrorElement().textContent();
        const woocommerceError = await customerCartPage.woocommerceErrorMessage().textContent();

        expect(quantityErrorMessage?.includes(`Maximum 4 allowed`)).toBeTruthy();
        expect(woocommerceError?.includes(`Maximum allowed quantity for ${productName} is 4.`)).toBeTruthy();
    });

    test('Product quantity should not be less than minimum limit', { tag: ['@admin'] }, async () => {
        // vendor
        await vendorDashboardSidebarPage.clickOnProductsTab();
        await vendorProductListPage.clickOnProductWithTitle(productName);
        await vendorProductAddEditPage.enterSimpleProductMinQty('3');
        await vendorProductAddEditPage.selectProductStatus('publish');
        await vendorProductAddEditPage.clickOnSaveProduct();

        // customer
        await customerPage.goto(data.subUrls.frontend.shop);
        await shopPage.clickOnProductWithTitle(productName);
        await singleProductPage.clickOnAddToCartButton();
        await customerPage.goto(data.subUrls.frontend.cart);
        await customerCartPage.enterQuantityValue(productName, '2');
        await customerCartPage.clickOnUpdateCartButton();

        const quantityErrorMessage = await customerCartPage.quantityErrorElement().textContent();
        const woocommerceError = await customerCartPage.woocommerceErrorMessage().textContent();

        expect(quantityErrorMessage?.includes(`Minimum 3 required`)).toBeTruthy();
        expect(woocommerceError?.includes(`Minimum required quantity for ${productName} is 3.`)).toBeTruthy();
    });

    test('Cart total should not be more than maximum amount limit', { tag: ['@admin'] }, async () => {
        // vendor
        await vendorDashboardSidebarPage.clickOnProductsTab();
        await vendorProductListPage.clickOnProductWithTitle(productName);
        await vendorProductAddEditPage.selectProductStatus('publish');
        await vendorProductAddEditPage.clickOnSaveProduct();

        await vendorDashboardSidebarPage.clickOnSettingsTab();
        await storeSettingsPage.enterMaximumOrderAmount('30');
        await storeSettingsPage.clickOnUpdateSettingsButton();

        // customer
        await customerPage.goto(data.subUrls.frontend.shop);
        await shopPage.clickOnProductWithTitle(productName);
        await singleProductPage.clickOnAddToCartButton();
        await customerPage.goto(data.subUrls.frontend.cart);
        await customerCartPage.enterQuantityValue(productName, '4');
        await customerCartPage.clickOnUpdateCartButton();

        const woocommerceError = await customerCartPage.woocommerceErrorMessage().textContent();

        expect(woocommerceError?.trim()).toEqual(`Maximum allowed cart amount for ${storeName} is $30.00. You currently have $40.00 in cart.`);
    });

    test('Cart total should not be less than minimum amount limit', { tag: ['@admin'] }, async () => {
        // vendor
        await vendorDashboardSidebarPage.clickOnProductsTab();
        await vendorProductListPage.clickOnProductWithTitle(productName);
        await vendorProductAddEditPage.selectProductStatus('publish');
        await vendorProductAddEditPage.clickOnSaveProduct();

        await vendorDashboardSidebarPage.clickOnSettingsTab();
        await storeSettingsPage.enterMinimumOrderAmount('30');
        await storeSettingsPage.clickOnUpdateSettingsButton();

        // customer
        await customerPage.goto(data.subUrls.frontend.shop);
        await shopPage.clickOnProductWithTitle(productName);
        await singleProductPage.enterQuantityValue(productName, '2');
        await singleProductPage.clickOnAddToCartButton();
        await customerPage.goto(data.subUrls.frontend.cart);
        await storefrontMainMenu.clickOnCartContentLink();

        const woocommerceError = await customerCartPage.woocommerceErrorMessage().textContent();

        expect(woocommerceError?.trim()).toEqual(`Minimum required cart amount for ${storeName} is $30.00. You currently have $20.00 in cart.`);
    });
});
