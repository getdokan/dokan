import { test, Page } from '@playwright/test';
import { GeolocationPage } from '@pages/geolocationPage';
import { dbData } from '@utils/dbData';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';

test.describe('Geolocation test', () => {
    let admin: GeolocationPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new GeolocationPage(aPage);
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.geolocation, dbData.dokan.geolocationSettings);
        await aPage.close();
    });

    ['top', 'left', 'right'].forEach((position: string) => {
        test(`admin can set map position (${position})`, { tag: ['@pro', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.geolocation, { show_locations_map: position });
            await admin.viewMapPosition(position as 'top' | 'left' | 'right');
        });
    });

    ['all', 'store_listing', 'shop'].forEach((place: string) => {
        test(`admin can set map display page (${place})`, { tag: ['@pro', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.geolocation, { show_location_map_pages: place });
            await admin.viewMap(place as 'all' | 'store_listing' | 'shop');
        });
    });

    ['enable', 'disable'].forEach((status: string) => {
        test(`admin can ${status}  filters before location map`, { tag: ['@pro', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.geolocation, { show_filters_before_locations_map: status === 'enable' ? 'on' : 'off' });
            await admin.viewMapFilters(status as 'enable' | 'disable');
        });
    });

    ['enable', 'disable'].forEach((status: string) => {
        test(`admin can ${status} product location tab on single product page`, { tag: ['@pro', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.geolocation, { show_product_location_in_wc_tab: status === 'enable' ? 'on' : 'off' });
            await admin.viewProductLocationTab(data.predefined.simpleProduct.product1.name, status as 'enable' | 'disable');
        });
    });
});
