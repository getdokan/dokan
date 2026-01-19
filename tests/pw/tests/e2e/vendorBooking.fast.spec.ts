import { test, request, Page } from '@playwright/test';
import { BookingPage } from '@pages/vendorBookingPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';

// Fast version with minimal setup and optimized execution
test.describe('Booking Product test - Fast Execution', () => {
    // Reduce global timeout to 30 seconds for faster failure detection
    test.setTimeout(30000); 

    // Admin Setup Tests (Critical path only)
    test.describe('Critical Setup', () => {
        test.describe.configure({ mode: 'serial' });
        let apiUtils: ApiUtils;
        let admin: BookingPage;
        let aPage: Page;

        test.beforeAll(async ({ browser }) => {
            const adminContext = await browser.newContext(data.auth.adminAuth);
            aPage = await adminContext.newPage();
            admin = new BookingPage(aPage);
            apiUtils = new ApiUtils(await request.newContext());
        });

        test.afterAll(async () => {
            await aPage?.close();
            await apiUtils?.dispose();
        });

        test('admin can enable booking module', { tag: ['@pro', '@admin'] }, async () => {
            await admin.enableBookingModule();
        });
    });

    // Independent Vendor Tests (Can run in parallel)
    test.describe('Vendor Tests - Parallel', () => {
        test.describe.configure({ mode: 'parallel' });
        
        // Each test creates its own context for true parallelization
        test('vendor can view booking menu page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.vendorBookingRenderProperly();
            await page.close();
        });

        test('vendor can view manage booking page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.vendorManageBookingRenderProperly();
            await page.close();
        });

        test('vendor can view booking calendar page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.vendorBookingCalendarRenderProperly();
            await page.close();
        });

        test('vendor can view manage resource page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.vendorManageResourcesRenderProperly();
            await page.close();
        });
    });

    // Product Management Tests (Parallel with individual products)
    test.describe('Product Management - Parallel', () => {
        test.describe.configure({ mode: 'parallel' });

        test('vendor can add booking product', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.addBookingProduct({ ...data.product.booking, name: data.product.booking.productName() });
            await page.close();
        });

        test('vendor can create and view product', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const apiUtils = new ApiUtils(await request.newContext());
            const [, , productName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
            
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.viewBookingProduct(productName);
            await page.close();
            await apiUtils.dispose();
        });

        test('vendor can create and search product', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const apiUtils = new ApiUtils(await request.newContext());
            const [, , productName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
            
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.searchBookingProduct(productName);
            await page.close();
            await apiUtils.dispose();
        });

        test('vendor can create and duplicate product', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const apiUtils = new ApiUtils(await request.newContext());
            const [, , productName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
            
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.duplicateBookingProduct(productName);
            await page.close();
            await apiUtils.dispose();
        });

        test('vendor can create and delete product', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const apiUtils = new ApiUtils(await request.newContext());
            const [, , productName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
            
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.deleteBookingProduct(productName);
            await page.close();
            await apiUtils.dispose();
        });
    });

    // Filter Tests (Parallel - lightweight)
    test.describe('Filter Tests - Parallel', () => {
        test.describe.configure({ mode: 'parallel' });

        test('vendor can filter by date', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.filterBookingProducts('by-date', '1');
            await page.close();
        });

        test('vendor can filter by category', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.filterBookingProducts('by-category', 'Uncategorized');
            await page.close();
        });

        test('vendor can filter by other', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.filterBookingProducts('by-other', 'featured');
            await page.close();
        });
    });

    // Resource Management (Serial - dependencies)
    test.describe('Resource Management - Serial', () => {
        test.describe.configure({ mode: 'serial' });
        let vendor: BookingPage;
        let page: Page;

        test.beforeAll(async ({ browser }) => {
            const context = await browser.newContext(data.auth.vendorAuth);
            page = await context.newPage();
            vendor = new BookingPage(page);
        });

        test.afterAll(async () => {
            await page?.close();
        });

        test('vendor can manage booking resources', { tag: ['@pro', '@vendor'] }, async () => {
            const resourceName = data.product.booking.resource.resourceName();
            
            // Add resource
            await vendor.addBookingResource(resourceName);
            
            // Edit resource  
            await vendor.editBookingResource({ ...data.product.booking.resource, name: resourceName });
            
            // Delete resource
            await vendor.deleteBookingResource(resourceName);
        });
    });

    // Booking Flow Tests (Parallel - independent)
    test.describe('Booking Flow - Parallel', () => {
        test.describe.configure({ mode: 'parallel' });

        test('vendor can add guest booking', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const apiUtils = new ApiUtils(await request.newContext());
            const [, , productName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
            
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.addBooking(productName, data.bookings);
            await page.close();
            await apiUtils.dispose();
        });

        test('customer can buy bookable product', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const apiUtils = new ApiUtils(await request.newContext());
            const [, , productName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
            
            const context = await browser.newContext(data.auth.customerAuth);
            const page = await context.newPage();
            const customer = new BookingPage(page);
            
            await customer.buyBookableProduct(productName, data.bookings);
            await page.close();
            await apiUtils.dispose();
        });

        test('vendor can add existing customer booking', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const apiUtils = new ApiUtils(await request.newContext());
            const [, , productName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
            
            const context = await browser.newContext(data.auth.vendorAuth);
            const page = await context.newPage();
            const vendor = new BookingPage(page);
            
            await vendor.addBooking(productName, data.bookings, data.customer.username);
            await page.close();
            await apiUtils.dispose();
        });
    });
});
