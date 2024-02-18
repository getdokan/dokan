import { test, request, Page } from '@playwright/test';
import { BookingPage } from '@pages/vendorBookingPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';

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
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    test('admin can add booking product @pro @a', async () => {
        await admin.adminAddBookingProduct(data.product.booking);
    });

    test('vendor booking menu page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorBookingRenderProperly();
    });

    test('vendor manage booking page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorManageBookingRenderProperly();
    });

    test('vendor booking calendar page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorBookingCalendarRenderProperly();
    });

    test('vendor manage booking resource page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorManageResourcesRenderProperly();
    });

    test('vendor can add booking product @pro @v', async () => {
        await vendor.addBookingProduct({ ...data.product.booking, name: data.product.booking.productName() });
    });

    test('vendor can edit booking product @pro @v', async () => {
        await vendor.editBookingProduct({ ...data.product.booking, name: bookableProductName });
    });

    test('vendor can filter booking products by date @pro @v', async () => {
        await vendor.filterBookingProducts('by-date', '1');
    });

    test('vendor can filter booking products by category @pro @v', async () => {
        await vendor.filterBookingProducts('by-category', 'Uncategorized');
    });

    test('vendor can filter booking products by other @pro @v', async () => {
        await vendor.filterBookingProducts('by-other', 'featured');
    });

    test('vendor can view booking product @pro @v', async () => {
        await vendor.viewBookingProduct(bookableProductName);
    });

    test("vendor can't buy own booking product @pro @v", async () => {
        await vendor.cantBuyOwnBookingProduct(bookableProductName);
    });

    test('vendor can search booking product @pro @v', async () => {
        await vendor.searchBookingProduct(bookableProductName);
    });

    test('vendor can duplicate booking product @pro @v', async () => {
        await vendor.duplicateBookingProduct(bookableProductName);
    });

    test('vendor can permanently delete booking product @pro @v', async () => {
        const [, , bookableProductName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
        await vendor.deleteBookingProduct(bookableProductName);
    });

    test('vendor can add booking resource @pro @v', async () => {
        await vendor.addBookingResource(data.product.booking.resource.resourceName());
    });

    test('vendor can edit booking resource @pro @v', async () => {
        const bookingResourceName = data.product.booking.resource.resourceName();
        await vendor.addBookingResource(bookingResourceName); // todo: convert with woo api :fatal error exits on api
        // const [responseBody, id] = await apiUtils.createPost({ ...payloads.createBookingResourceByDb(), author: process.env.VENDOR_ID }, payloads.adminAuth);
        // await dbUtils.createBookingResource(id, process.env.BASE_URL);
        // const bookingResourceName = responseBody.title.raw;
        await vendor.editBookingResource({ ...data.product.booking.resource, name: bookingResourceName });
    });

    test('vendor can delete booking resource @pro @v', async () => {
        const bookingResourceName = data.product.booking.resource.resourceName();
        await vendor.addBookingResource(bookingResourceName); // todo: convert with woo api:fatal error exits on api
        await vendor.deleteBookingResource(bookingResourceName);
    });

    test('vendor can add booking for guest customer @pro @v', async () => {
        await vendor.addBooking(bookableProductName, data.bookings);
    });

    test.skip('vendor can add booking for existing customer @pro @v', async () => {
        await vendor.addBooking(bookableProductName, data.bookings, data.customer.username);
    });

    test.skip('customer can buy bookable product @pro @c', async () => {
        // todo: customer storage state gets reset from previous tests
        await customer.buyBookableProduct(bookableProductName, data.bookings);
    });

    // todo: vendor can add booking resource to booking product
});
