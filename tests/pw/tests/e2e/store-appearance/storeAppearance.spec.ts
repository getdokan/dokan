import { Page, expect, test } from '@utils/test';
import { StoreAppearancePage, ApiUtils, dbUtils, data, dbData, payloads } from './storeAppearancePage';
import path from 'path';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const { VENDOR_ID } = process.env;

test.describe('Store Appearance test', () => {
    let admin: StoreAppearancePage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new StoreAppearancePage(aPage);
        apiUtils = new ApiUtils(null);
        await dbUtils.setOptionValue('sidebars_widgets', dbData.emptySideBarsWidgets);
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.appearance, dbData.dokan.appearanceSettings);
        await aPage?.close();
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
        test.skip(`admin can set store header template (${template})`, { tag: ['@lite', '@admin'] }, async () => {
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

    test('admin can set store banner size', { tag: ['@lite', '@admin'] }, async () => { await admin.setBannerSize(data.storeBanner); });

    ['enable', 'disable'].forEach((status: string) => {
        test(`admin can ${status} store sidebar from theme`, { tag: ['@lite', '@admin'] }, async () => {
            await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { enable_theme_store_sidebar: status === 'enable' ? 'off' : 'on' });
            await admin.viewStoreSideBarFromTheme(status as 'enable' | 'disable', data.predefined.vendorStores.vendor1);
        });
    });

    ['enable', 'disable'].forEach((status: string) => {
        test(`admin can ${status} vendor info on single store page`, { tag: ['@lite', '@admin'] }, async () => {
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

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Store Appearance (React) Tests @lite', () => {
    test('Test Case 1 - Store settings page renders', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/settings/store/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Store name field is visible', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/settings/store/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        // Vendor settings should expose store name input
        const nameInput = page.locator('input[name="dokan_store_name"], input[name="store_name"], input[id*="store_name"]');
        const visible = await nameInput.first().isVisible({ timeout: 5000 }).catch(() => false);
        expect(visible).toBe(true);
        await page.close();
        await ctx.close();
    });
});

