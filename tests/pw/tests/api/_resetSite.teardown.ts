import { test, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
// import { endPoints } from '@utils/apiEndPoints';
// import { dbUtils } from '@utils/dbUtils';
// import { dbData } from '@utils/dbData';
// import { helpers } from '@utils/helpers';

test.describe('test environment', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('delete all media items', async () => {
        await apiUtils.deleteAllMediaItems(payloads.adminAuth);
    });

    test('delete all products', async () => {
        await apiUtils.deleteAllProducts('', payloads.adminAuth);
    });

    test('delete all stores', async () => {
        await apiUtils.deleteAllStores(payloads.adminAuth); //todo: don't work
    });

    test('delete all customers', async () => {
        await apiUtils.deleteAllCustomers(payloads.adminAuth);
    });

    test('delete all seller badges', async () => {
        await apiUtils.deleteAllSellerBadges();
    });

    test('delete all RFQ Rules', async () => {
        await apiUtils.deleteAllQuoteRules(payloads.adminAuth);
    });

    test('delete all request quotes', async () => {
        await apiUtils.deleteAllQuoteRequests(payloads.adminAuth);
    });

    test('delete all announcements', async () => {
        // await apiUtils.deleteAllAnnouncements(payloads.adminAuth);
    });

    test('delete all support tickets', async () => {
        // await apiUtils.deleteAllSupportTickets(payloads.adminAuth);
    });

    test('delete all abuse report tickets', async () => {
        // await apiUtils.deleteAllAbuseReports(payloads.adminAuth);
    });
});
