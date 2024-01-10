import { test as test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
// import { endPoints } from '@utils/apiEndPoints';
// import { dbUtils } from '@utils/dbUtils';
// import { dbData } from '@utils/dbData';
// import { helpers } from '@utils/helpers';

test.describe('test environment', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
    });

    test('delete all media items @lite', async () => {
        await apiUtils.deleteAllMediaItems(payloads.adminAuth);
    });

    test('delete all products @lite', async () => {
        await apiUtils.deleteAllProducts('', payloads.adminAuth);
    });

    test('delete all stores @lite', async () => {
        await apiUtils.deleteAllStores(payloads.adminAuth); //todo: don't work
    });

    test('delete all customers @lite', async () => {
        await apiUtils.deleteAllCustomers(payloads.adminAuth);
    });

    test('delete all seller badges @lite', async () => {
        await apiUtils.deleteAllSellerBadges();
    });

    test('delete all RFQ Rules @lite', async () => {
        await apiUtils.deleteAllQuoteRules(payloads.adminAuth);
    });

    test('delete all Request Quotes @lite', async () => {
        await apiUtils.deleteAllQuoteRequests(payloads.adminAuth);
    });

    //todo: delete all announcements
    //todo: delete all support tickets
    //todo: delete all abuse reports tickets
});
