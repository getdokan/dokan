import { test, Page, request } from '@playwright/test';
import { StoreAppearancePage } from '@pages/storeAppearancePage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';

const { VENDOR_ID } = process.env;

test.describe('Store Appearance test', () => {
    let admin: StoreAppearancePage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new StoreAppearancePage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        // await dbUtils.updateOptionValue(dbData.dokanWidgets.names.storeLocation, dbData.dokanWidgets.values.storeLocationWidget);
        // await dbUtils.updateOptionValue(dbData.dokanWidgets.names.storeOpenClose, dbData.dokanWidgets.values.storeOpenCloseWidget);
        // await dbUtils.updateOptionValue(dbData.dokanWidgets.names.storeContactForm, dbData.dokanWidgets.values.storeContactFormWidget);
        // await dbUtils.updateOptionValue('sidebars_widgets', { 'sidebar-store': [dbData.dokanWidgets.widgets.storeLocation, dbData.dokanWidgets.widgets.storeOpenClose, dbData.dokanWidgets.widgets.storeContactForm] });
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.appearance, dbData.dokan.appearanceSettings);
        // await dbUtils.setOptionValue('sidebars_widgets', dbData.emptySideBarsWidgets);
        await aPage.close();
        await apiUtils.dispose();
    });

    ['enable', 'disable'].forEach((status: string) => {
        test.skip(`admin can ${status} store map on store sidebar`, { tag: ['@lite', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { store_map: status === 'enable' ? 'on' : 'off' });
            await admin.viewStoreMapOnStoreSidebar(status as 'enable' | 'disable', data.predefined.vendorStores.vendor1);
        });
    });

    ['Google Maps', 'Mapbox'].forEach((api: string) => {
        test.skip(`admin can set map api source (${api})`, { tag: ['@lite', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { store_map: 'on', map_api_source: api === 'Google Maps' ? 'google_maps' : 'mapbox' });
            await admin.viewMapAPISource(api as 'Google Maps' | 'Mapbox', data.predefined.vendorStores.vendor1);
        });
    });

    ['enable', 'disable'].forEach((status: string) => {
        test.skip(`admin can ${status} Google reCAPTCHA validation`, { tag: ['@lite', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { recaptcha_enable_status: status === 'enable' ? 'on' : 'off' });
            await admin.viewGoogleRecaptcha(status as 'enable' | 'disable', data.predefined.vendorStores.vendor1);
        });
    });

    ['enable', 'disable'].forEach((status: string) => {
        test(`admin can ${status} store contact form on store sidebar`, { tag: ['@lite', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { contact_seller: status === 'enable' ? 'on' : 'off' });
            await admin.viewStoreContactFormOnStoreSidebar(status as 'enable' | 'disable', data.predefined.vendorStores.vendor1);
        });
    });

    ['default', 'layout1', 'layout2', 'layout3'].forEach((template: string) => {
        test(`admin can set store header template (${template})`, { tag: ['@lite', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { store_header_template: template });
            await admin.viewStoreHeaderTemplate(template as 'default' | 'layout1' | 'layout2' | 'layout3', data.predefined.vendorStores.vendor1);
        });
    });

    ['enable', 'disable'].forEach((status: string) => {
        test(`admin can ${status} store open-close time on store sidebar`, { tag: ['@lite', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { store_open_close: status === 'enable' ? 'on' : 'off' });
            await admin.viewStoreOpenCloseTimeOnStoreSidebar(status as 'enable' | 'disable', data.predefined.vendorStores.vendor1);
        });
    });

    test('admin can set store banner size', { tag: ['@lite', '@admin'] }, async () => {
        await admin.setBannerSize(data.storeBanner);
    });

    ['enable', 'disable'].forEach((status: string) => {
        test(`admin can ${status} store sidebar from theme`, { tag: ['@lite', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { enable_theme_store_sidebar: status === 'enable' ? 'off' : 'on' });
            await admin.viewStoreSideBarFromTheme(status as 'enable' | 'disable', data.predefined.vendorStores.vendor1);
        });
    });

    ['enable', 'disable'].forEach((status: string) => {
        test(`admin can ${status} vendor info on single store page`, { tag: ['@lite', '@admin'] }, async () => {
            // await apiUtils.updateStore(VENDOR_ID, { show_email: 'yes' }, payloads.adminAuth); // todo: apply this after api issue fix
            await apiUtils.updateStore(VENDOR_ID, { ...payloads.storeResetFields, show_email: 'yes' }, payloads.adminAuth);
            await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { hide_vendor_info: status === 'enable' ? { email: '', phone: '', address: '' } : { email: 'email', phone: 'phone', address: 'address' } });
            await admin.viewVendorInfoOnSingleStorePage(status as 'enable' | 'disable', data.predefined.vendorStores.vendor1);
        });
    });

    ['enable', 'disable'].forEach((status: string) => {
        test(`admin can ${status} Dokan FontAwesome library`, { tag: ['@lite', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { disable_dokan_fontawesome: status === 'enable' ? 'off' : 'on' });
            await admin.viewFontAwesomeLibrary(status as 'enable' | 'disable', data.predefined.vendorStores.vendor1);
        });
    });
});
