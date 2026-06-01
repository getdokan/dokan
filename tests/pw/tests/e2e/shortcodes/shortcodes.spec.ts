import { test, Page } from '@utils/test';
import { ShortcodePage, ApiUtils, data, payloads, dbUtils, dbData } from './shortcodesPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Shortcodes test', () => {
    let admin: ShortcodePage;
    let vendor: ShortcodePage;
    let customer: ShortcodePage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ShortcodePage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new ShortcodePage(vPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new ShortcodePage(cPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => {
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await apiUtils.dispose();
    });

    // KEEP skipped: page-object method createPageWithShortcode is an empty stub (no real implementation).
    test.skip('admin can create page with dokan shortcode', { tag: ['@lite', '@admin'] }, async () => { await admin.createPageWithShortcode(data.pageTitle, data.dokanShortcodes.dashboard); });

    // KEEP skipped: page-object method viewDashboard is an empty stub (no real implementation).
    test.skip('vendor can view Dokan dashboard (shortcode)', { tag: ['@lite', '@admin'] }, async () => {
        const [responseBody, pageId] = await apiUtils.createPage(payloads.dashboardShortcode, payloads.adminAuth);
        await vendor.viewDashboard(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
    });

    test('vendor can view Dokan subscription packs (shortcode)', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.vendorSubscription, { enable_pricing: 'on' });
        const [responseBody, pageId] = await apiUtils.createPage(payloads.dokanSubscriptionPackShortcode, payloads.adminAuth);
        await vendor.viewDokanSubscriptionPacks(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
        await dbUtils.setOptionValue(dbData.dokan.optionName.vendorSubscription, dbData.dokan.vendorSubscriptionSettings);
    });

    // KEEP skipped: page-object method viewVendorRegistrationForm is an empty stub (no real implementation).
    test.skip('guest user can view vendor registration form (shortcode)', { tag: ['@lite', '@admin'] }, async ({ page }) => {
        const guest = new ShortcodePage(page);
        const [responseBody, pageId] = await apiUtils.createPage(payloads.vendorRegistrationShortcode, payloads.adminAuth);
        await guest.viewVendorRegistrationForm(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
    });

    // KEEP skipped: page-object method viewVendorOnboardingForm is an empty stub (no real implementation).
    test.skip('guest user can view vendor onboarding form (shortcode)', { tag: ['@lite', '@admin'] }, async ({ page }) => {
        const guest = new ShortcodePage(page);
        const [responseBody, pageId] = await apiUtils.createPage(payloads.vendorOnboardingShortcode, payloads.adminAuth);
        await guest.viewVendorOnboardingForm(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
    });

    test('customer can view best selling products (shortcode)', { tag: ['@lite', '@admin'] }, async () => {
        const [responseBody, pageId] = await apiUtils.createPage(payloads.bestSellingProductShortcode, payloads.adminAuth);
        await customer.viewProducts(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
    });

    test('customer can view top rated products (shortcode)', { tag: ['@lite', '@admin'] }, async () => {
        const [responseBody, pageId] = await apiUtils.createPage(payloads.topRatedProductShortcode, payloads.adminAuth);
        await customer.viewProducts(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
    });

    test('customer can view customer migration form (shortcode)', { tag: ['@pro', '@admin'] }, async () => {
        const [responseBody, pageId] = await apiUtils.createPage(payloads.customerMigrationShortcode, payloads.adminAuth);
        await customer.viewMigrationForm(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
    });

    test('customer can view geolocation filter form (shortcode)', { tag: ['@pro', '@admin'] }, async () => {
        const [responseBody, pageId] = await apiUtils.createPage(payloads.geolocationFilterFormShortcode, payloads.adminAuth);
        await customer.viewGeolocationFilterForm(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
    });

    test('customer can view advertised products (shortcode)', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.adminAuth);
        const [responseBody, pageId] = await apiUtils.createPage(payloads.productAdvertisementShortcode, payloads.adminAuth);
        await customer.viewAdvertisedProducts(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
    });

    // KEEP skipped: page-object method viewStores is an empty stub (no real implementation).
    test.skip('customer can view stores (shortcode)', { tag: ['@lite', '@admin'] }, async () => {
        const [responseBody, pageId] = await apiUtils.createPage(payloads.storesShortcode, payloads.adminAuth);
        await customer.viewStores(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
    });

    // KEEP skipped: page-object method viewMyOrders is an empty stub (no real implementation).
    test.skip('customer can view my orders (shortcode)', { tag: ['@lite', '@admin'] }, async () => {
        const [responseBody, pageId] = await apiUtils.createPage(payloads.myOrdersShortcode, payloads.adminAuth);
        await customer.viewMyOrders(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
    });

    test('customer can view request for quote (shortcode)', { tag: ['@pro', '@admin'] }, async () => {
        const [responseBody, pageId] = await apiUtils.createPage(payloads.requestQuoteShortcode, payloads.adminAuth);
        await customer.viewRequestQuote(responseBody.link);
        await apiUtils.deletePage(pageId, payloads.adminAuth);
    });
});
