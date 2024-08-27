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

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ShippingPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, zoneId] = await apiUtils.createShippingZone(payloads.createRandomShippingZone(), payloads.adminAuth);
        await apiUtils.addShippingZoneLocation(zoneId, payloads.addShippingZoneLocation, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils.deleteShippingZone(zoneId, payloads.adminAuth);
        await aPage.close();
        await apiUtils.dispose();
    });

    test('admin can enable shipping', { tag: ['@lite', '@admin'] }, async () => {
        await admin.enableShipping();
    });

    test('admin can add shipping zone', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addShippingZone(data.shipping.zone());
    });

    test('admin can delete shipping zone', { tag: ['@lite', '@admin'] }, async () => {
        const [, , zoneName] = await apiUtils.createShippingZone(payloads.createRandomShippingZone(), payloads.adminAuth);
        await admin.deleteShippingZone(zoneName);
    });

    test('admin can add flat rate shipping method', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addShippingMethod(zoneId, data.shipping.methods.flatRate);
    });

    test('admin can add free shipping method', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addShippingMethod(zoneId, data.shipping.methods.freeShipping);
    });

    test('admin can add vendor table rate shipping method', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addShippingMethod(zoneId, data.shipping.methods.tableRateShipping);
    });

    test('admin can add vendor distance rate shipping method', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addShippingMethod(zoneId, data.shipping.methods.distanceRateShipping);
    });

    test('admin can add vendor shipping method', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addShippingMethod(zoneId, data.shipping.methods.vendorShipping);
    });

    test('admin can edit shipping method', { tag: ['@lite', '@admin'] }, async () => {
        const methodExits = await apiUtils.shippingMethodExistOrNot(zoneId, 'flat_rate', payloads.adminAuth);
        if (!methodExits) await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodFlatRate, payloads.adminAuth);
        await admin.addShippingMethod(zoneId, data.shipping.methods.flatRate, true);
    });

    test('admin can delete shipping method', { tag: ['@lite', '@admin'] }, async () => {
        const [, zoneId, zoneName] = await apiUtils.createShippingZone(payloads.createRandomShippingZone(), payloads.adminAuth);
        await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodFlatRate, payloads.adminAuth);
        await admin.deleteShippingMethod(zoneName, 'Flat rate');
        await apiUtils.deleteShippingZone(zoneId, payloads.adminAuth);
    });
});
