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

    // Optimize test timeout - reduced from 120s to 45s for faster execution
    test.setTimeout(45000); // 45 seconds per test

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
        
        // Retry API product creation with exponential backoff
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
            try {
                [, , bookableProductName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
                console.log(`Successfully created bookable product: ${bookableProductName}`);
                break;
            } catch (error: any) {
                attempts++;
                console.log(`Attempt ${attempts} failed to create bookable product:`, error.message);
                if (attempts === maxAttempts) {
                    throw new Error(`Failed to create bookable product after ${maxAttempts} attempts: ${error.message}`);
                }
                // Faster retry: 0.5s, 1s, 2s  
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts - 1) * 500));
            }
        }

        // disable vendor global rma settings with error handling
        try {
            await dbUtils.setUserMeta(VENDOR_ID, '_dokan_rma_settings', dbData.testData.dokan.rmaSettings, true);
        } catch (error: any) {
            console.log('Warning: Failed to set vendor RMA settings:', error.message);
            // Don't fail the test setup for this non-critical operation
        }
    });

    test.afterAll(async () => {
        // Cleanup operations with error handling
        try {
            await apiUtils.activateModules(payloads.moduleIds.booking, payloads.adminAuth);
        } catch (error: any) {
            console.log('Warning: Failed to activate booking modules:', error.message);
        }
        
        // Close pages with error handling
        try {
            await aPage?.close();
        } catch (error: any) {
            console.log('Warning: Failed to close admin page:', error.message);
        }
        
        try {
            await vPage?.close();
        } catch (error: any) {
            console.log('Warning: Failed to close vendor page:', error.message);
        }
        
        try {
            await cPage?.close();
        } catch (error: any) {
            console.log('Warning: Failed to close customer page:', error.message);
        }
        
        try {
            await apiUtils?.dispose();
        } catch (error: any) {
            console.log('Warning: Failed to dispose API utils:', error.message);
        }
    });

    // Admin Setup Tests (Sequential - module dependencies)
    test('admin can enable woocommerce booking integration module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableBookingModule();
    });

    test('admin can add booking product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.adminAddBookingProduct(data.product.booking);
    });

    // Vendor UI Validation Tests (can run in parallel)
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

    // Vendor Product Management Tests (can run in parallel)
    test('vendor can add booking product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addBookingProduct({ ...data.product.booking, name: data.product.booking.productName() });
    });

    test('vendor can edit booking product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.editBookingProduct({ ...data.product.booking, name: bookableProductName });
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

    // Vendor Filter Tests (can run in parallel)
    test('vendor can filter booking products by date', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterBookingProducts('by-date', '1');
    });

    test('vendor can filter booking products by category', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterBookingProducts('by-category', 'Uncategorized');
    });

    test('vendor can filter booking products by other', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterBookingProducts('by-other', 'featured');
    });

    test('vendor can permanently delete booking product', { tag: ['@pro', '@vendor'] }, async () => {
        // Create a dedicated product for deletion to avoid affecting other tests
        let productToDelete: string = '';
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                [, , productToDelete] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
                break;
            } catch (error: any) {
                attempts++;
                console.log(`Attempt ${attempts} failed to create product for deletion:`, error.message);
                if (attempts === maxAttempts) {
                    throw new Error(`Failed to create product for deletion after ${maxAttempts} attempts: ${error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts - 1) * 500));
            }
        }
        
        if (!productToDelete) {
            throw new Error('Failed to create product for deletion test');
        }
        
        await vendor.deleteBookingProduct(productToDelete);
    });

    // Vendor Resource Management Tests (Sequential - resource dependencies)
    test('vendor can add booking resource', { tag: ['@pro', '@vendor'] }, async () => {
        const resourceName = data.product.booking.resource.resourceName();
        await vendor.addBookingResource(resourceName);
        // Store in test context for next test
        test.info().annotations.push({ type: 'resourceName', description: resourceName });
    });

    test('vendor can edit booking resource', { tag: ['@pro', '@vendor'] }, async () => {
        const resourceName = data.product.booking.resource.resourceName();
        await vendor.addBookingResource(resourceName);
        await vendor.editBookingResource({ ...data.product.booking.resource, name: resourceName });
    });

    test('vendor can delete booking resource', { tag: ['@pro', '@vendor'] }, async () => {
        const resourceName = data.product.booking.resource.resourceName();
        await vendor.addBookingResource(resourceName);
        await vendor.deleteBookingResource(resourceName);
    });

    // Booking Flow Tests (can run in parallel)
    test('vendor can add booking for guest customer', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addBooking(bookableProductName, data.bookings);
    });

    test('customer can buy bookable product', { tag: ['@pro', '@customer'] }, async () => {
        await customer.buyBookableProduct(bookableProductName, data.bookings); //todo: failed on git action if ran after 12 am local time
    });

    test('vendor can add booking for existing customer', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addBooking(bookableProductName, data.bookings, data.customer.username);
    });

    // Admin Cleanup (Sequential - module dependencies)
    test('admin can disable woocommerce booking integration module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.booking, payloads.adminAuth);
        await admin.disableBookingModule();
    });
});
