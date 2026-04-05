import { test, Page } from '@playwright/test';
import { ShippingPage, ApiUtils, data, payloads } from './shippingPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('shipping test', () => {
    let admin: ShippingPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let zoneId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ShippingPage(aPage);
        apiUtils = new ApiUtils(null);
        [, zoneId] = await apiUtils.createShippingZone(payloads.createRandomShippingZone(), payloads.adminAuth);
        await apiUtils.addShippingZoneLocation(zoneId, payloads.addShippingZoneLocation, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils.deleteShippingZone(zoneId, payloads.adminAuth);
        await aPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable shipping', { tag: ['@lite', '@admin'] }, async () => { await admin.enableShipping(); });
    test('admin can add shipping zone', { tag: ['@lite', '@admin'] }, async () => { await admin.addShippingZone(data.shipping.zone()); });

    test('admin can delete shipping zone', { tag: ['@lite', '@admin'] }, async () => {
        const [, , zoneName] = await apiUtils.createShippingZone(payloads.createRandomShippingZone(), payloads.adminAuth);
        await admin.deleteShippingZone(zoneName);
    });

    test('admin can add flat rate shipping method', { tag: ['@lite', '@admin'] }, async () => { await admin.addShippingMethod(zoneId, data.shipping.methods.flatRate); });
    test('admin can add free shipping method', { tag: ['@lite', '@admin'] }, async () => { await admin.addShippingMethod(zoneId, data.shipping.methods.freeShipping); });
    test('admin can add vendor table rate shipping method', { tag: ['@pro', '@admin'] }, async () => { await admin.addShippingMethod(zoneId, data.shipping.methods.tableRateShipping); });
    test('admin can add vendor distance rate shipping method', { tag: ['@pro', '@admin'] }, async () => { await admin.addShippingMethod(zoneId, data.shipping.methods.distanceRateShipping); });
    test('admin can add vendor shipping method', { tag: ['@pro', '@admin'] }, async () => { await admin.addShippingMethod(zoneId, data.shipping.methods.vendorShipping); });

    test('admin can edit shipping method', { tag: ['@lite', '@admin'] }, async () => {
        const methodExits = await apiUtils.shippingMethodExistOrNot(zoneId, 'flat_rate', payloads.adminAuth);
        if (!methodExits) await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodFlatRate, payloads.adminAuth);
        await admin.addShippingMethod(zoneId, data.shipping.methods.flatRate, true);
    });

    test('admin can delete shipping method', { tag: ['@lite', '@admin'] }, async () => {
        const [, zoneId2, zoneName] = await apiUtils.createShippingZone(payloads.createRandomShippingZone(), payloads.adminAuth);
        await apiUtils.addShippingZoneMethod(zoneId2, payloads.addShippingMethodFlatRate, payloads.adminAuth);
        await admin.deleteShippingMethod(zoneName, 'Flat rate');
        await apiUtils.deleteShippingZone(zoneId2, payloads.adminAuth);
    });
});
