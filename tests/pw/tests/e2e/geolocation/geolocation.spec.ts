import { test, Page } from '@playwright/test';
import { GeolocationPage, api, db, payloads, testData } from './geolocationPage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Geolocation test', () => {
    let admin: GeolocationPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new GeolocationPage(aPage);

        await api.init();
    });

    test.beforeEach(async () => {
        await db.setOptionValue(testData.geolocationOptionName, testData.geolocationSettings);
    });

    test.afterAll(async () => {
        await db.setOptionValue(testData.geolocationOptionName, testData.geolocationSettings);
        await api.activateModules(payloads.moduleIds.geolocation, payloads.adminAuth);
        await aPage?.close();
        await api.dispose();
        await db.dispose();
    });

    // admin

    test('admin can enable geolocation module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableGeolocationModule();
    });

    ['top', 'left', 'right'].forEach((position: string) => {
        test(`admin can set map position (${position})`, { tag: ['@pro', '@admin'] }, async () => {
            await db.updateOptionValue(testData.geolocationOptionName, { show_locations_map: position });
            await admin.viewMapPosition(position as 'top' | 'left' | 'right');
        });
    });

    ['all', 'store_listing', 'shop'].forEach((place: string) => {
        test(`admin can set map display page (${place})`, { tag: ['@pro', '@admin'] }, async () => {
            await db.updateOptionValue(testData.geolocationOptionName, { show_location_map_pages: place });
            await admin.viewMap(place as 'all' | 'store_listing' | 'shop');
        });
    });

    ['enable', 'disable'].forEach((status: string) => {
        test(`admin can ${status}  filters before location map`, { tag: ['@pro', '@admin'] }, async () => {
            await db.updateOptionValue(testData.geolocationOptionName, {
                show_filters_before_locations_map: status === 'enable' ? 'on' : 'off',
            });
            await admin.viewMapFilters(status as 'enable' | 'disable');
        });
    });

    ['enable', 'disable'].forEach((status: string) => {
        test(`admin can ${status} product location tab on single product page`, { tag: ['@pro', '@admin'] }, async () => {
            await db.updateOptionValue(testData.geolocationOptionName, {
                show_product_location_in_wc_tab: status === 'enable' ? 'on' : 'off',
            });
            await admin.viewProductLocationTab(testData.predefinedSimpleProduct1, status as 'enable' | 'disable');
        });
    });

    ['km', 'miles'].forEach((unit: string) => {
        test(`admin can set map radius search unit and distance ${unit} `, { tag: ['@pro', '@admin'] }, async () => {
            await db.updateOptionValue(testData.geolocationOptionName, {
                distance_unit: unit,
                distance_min: '0',
                distance_max: '10',
            });
            await admin.viewMapRadiusSearchUnitAndDistance(unit as 'km' | 'miles', { min: '0', max: '10' });
        });
    });

    test('customer can slide map radius bar', { tag: ['@pro', '@customer'] }, async () => {
        await admin.slideMapRadiusBar('5');
    });

    // admin

    test('admin can disable geolocation module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.geolocation, payloads.adminAuth);
        await admin.disableGeolocationModule();
    });
});
