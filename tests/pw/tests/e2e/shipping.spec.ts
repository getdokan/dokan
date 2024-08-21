import { test, request, Page } from '@playwright/test';
import { ShippingPage } from '@pages/shippingPage';
import { data } from '@utils/testData';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';

test.describe('shipping test', () => {
    let admin: ShippingPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let zoneId: string;
    let zoneName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ShippingPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, zoneId, zoneName] = await apiUtils.createShippingZone({ ...payloads.createRandomShippingZone() }, payloads.adminAuth);
        await apiUtils.addShippingZoneLocation(zoneId, payloads.addShippingZoneLocation, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils.deleteShippingZone(zoneId, payloads.adminAuth);
        await aPage.close();
        await apiUtils.dispose();
    });

    test('admin can enable shipping method', { tag: ['@lite', '@admin'] }, async () => {
        await admin.enableShipping();
    });

    test('admin can add flat rate shipping method', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addShippingMethod({ ...data.shipping.methods.flatRate, zoneName: zoneName });
    });

    test('admin can add free shipping method', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addShippingMethod({ ...data.shipping.methods.freeShipping, zoneName: zoneName });
    });

    test('admin can add vendor table rate shipping method', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addShippingMethod({ ...data.shipping.methods.tableRateShipping, zoneName: zoneName });
    });

    test('admin can add vendor distance rate shipping method', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addShippingMethod({ ...data.shipping.methods.distanceRateShipping, zoneName: zoneName });
    });

    test('admin can add vendor shipping method', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addShippingMethod({ ...data.shipping.methods.vendorShipping });
    });

    test('admin can delete shipping method', { tag: ['@lite', '@admin'] }, async () => {
        const [, zoneId, zoneName] = await apiUtils.createShippingZone({ ...payloads.createRandomShippingZone() }, payloads.adminAuth);
        await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodFlatRate, payloads.adminAuth);
        await admin.deleteShippingMethod(zoneName, 'Flat rate');
        await apiUtils.deleteShippingZone(zoneId, payloads.adminAuth);
    });

    test('admin can delete shipping zone', { tag: ['@lite', '@admin'] }, async () => {
        const [, , zoneName] = await apiUtils.createShippingZone({ ...payloads.createRandomShippingZone() }, payloads.adminAuth);
        await admin.deleteShippingZone(zoneName);
    });
});
