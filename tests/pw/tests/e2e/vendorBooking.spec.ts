import { test, request, Page } from '@playwright/test';
import { BookingPage } from '@pages/vendorBookingPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';

const { VENDOR_ID } = process.env;

test.describe('Booking Product test', () => {
    let admin: BookingPage;
    let vendor: BookingPage;
    let customer: BookingPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let bookableProductName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new BookingPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new BookingPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new BookingPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , bookableProductName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);

        // disable vendor global rma settings
        await dbUtils.setUserMeta(VENDOR_ID, '_dokan_rma_settings', dbData.testData.dokan.rmaSettings, true);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.booking, payloads.adminAuth);
        await aPage.close();
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can enable woocommerce booking integration module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableBookingModule();
    });

    test('admin can add booking product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.adminAddBookingProduct(data.product.booking);
    });

    // vendor

    test('vendor can view booking menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorBookingRenderProperly();
    });

    test('vendor can view manage booking page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorManageBookingRenderProperly();
    });

    test('vendor can view booking calendar page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorBookingCalendarRenderProperly();
    });

    test('vendor can view manage booking resource page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorManageResourcesRenderProperly();
    });

    test('vendor can add booking product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addBookingProduct({ ...data.product.booking, name: data.product.booking.productName() });
    });

    test('vendor can edit booking product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.editBookingProduct({ ...data.product.booking, name: bookableProductName });
    });

    test('vendor can filter booking products by date', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterBookingProducts('by-date', '1');
    });

    test('vendor can filter booking products by category', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterBookingProducts('by-category', 'Uncategorized');
    });

    test('vendor can filter booking products by other', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterBookingProducts('by-other', 'featured');
    });

    test('vendor can view booking product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.viewBookingProduct(bookableProductName);
    });

    test("vendor can't buy own booking product", { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.cantBuyOwnBookingProduct(bookableProductName);
    });

    test('vendor can search booking product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.searchBookingProduct(bookableProductName);
    });

    test('vendor can duplicate booking product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.duplicateBookingProduct(bookableProductName);
    });

    test('vendor can permanently delete booking product', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , bookableProductName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
        await vendor.deleteBookingProduct(bookableProductName);
    });

    test('vendor can add booking resource', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addBookingResource(data.product.booking.resource.resourceName());
    });

    test('vendor can edit booking resource', { tag: ['@pro', '@vendor'] }, async () => {
        const bookingResourceName = data.product.booking.resource.resourceName();
        await vendor.addBookingResource(bookingResourceName);
        await vendor.editBookingResource({ ...data.product.booking.resource, name: bookingResourceName });
    });

    test('vendor can delete booking resource', { tag: ['@pro', '@vendor'] }, async () => {
        const bookingResourceName = data.product.booking.resource.resourceName();
        await vendor.addBookingResource(bookingResourceName);
        await vendor.deleteBookingResource(bookingResourceName);
    });

    test('vendor can add booking for guest customer', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addBooking(bookableProductName, data.bookings);
    });

    test('vendor can add booking for existing customer', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addBooking(bookableProductName, data.bookings, data.customer.username);
    });

    test('customer can buy bookable product', { tag: ['@pro', '@customer'] }, async () => {
        await customer.buyBookableProduct(bookableProductName, data.bookings); //todo: failed on git action if ran after 12 am local time
    });

    // admin

    test('admin can disable woocommerce booking integration module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.booking, payloads.adminAuth);
        await admin.disableBookingModule();
    });
});
