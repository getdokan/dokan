import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { VendorStoreSettingsPage, SyncField } from '@pages/vendorStoreSettingsPage';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';

const migration = data.vendorStoreSettingsMigration;
const { BASE_URL } = process.env;

// New React vendor Store Settings page <-> legacy vendor dashboard settings form.
// Both persist to the same `dokan_profile_settings` meta, so every setting must
// round-trip either direction. Serial: the tests share one logged-in vendor page
// and mutate shared meta; originals are captured up front and restored at the end.
test.describe('Vendor Store Settings Migration', () => {
    test.describe.configure({ mode: 'serial' });

    let vendorPage: Page;
    let store: VendorStoreSettingsPage;

    test.beforeAll(async ({ browser }) => {
        // Catalog Mode is gated by Helper::is_enabled_by_admin — with it off the whole
        // Business tab drops out of the schema. Seed it rather than inherit whatever
        // the previously-run spec left behind.
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { catalog_mode_hide_add_to_cart_button: 'on', catalog_mode_hide_product_price: 'on' });

        const context = await browser.newContext({ baseURL: BASE_URL ?? 'http://localhost:9999' });
        vendorPage = await context.newPage();
        await new LoginPage(vendorPage).login(data.vendor);
        store = new VendorStoreSettingsPage(vendorPage);
        await store.captureOriginals();
    });

    test.afterAll(async () => {
        await store?.restoreOriginals().catch(() => undefined);
        await vendorPage?.close();
    });

    test('every tab and section renders', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        await store.assertTabsAndSections();
    });

    // Standalone vice-versa coverage for each built-in-variant field, all tabs.
    for (const field of migration.syncFields as unknown as SyncField[]) {
        test(`${field.label} (${field.kind}) stays in sync both directions`, { tag: [field.gate, '@vendor', '@migration'] }, async () => {
            await store.assertFieldSync(field);
        });
    }

    // Business tab — cart min/max (custom number inputs) + its validation.
    test('cart min-max amounts stay in sync both directions', { tag: ['@pro', '@vendor', '@migration'] }, async () => {
        await store.assertMinMaxSync();
    });

    test('cart minimum greater than maximum is rejected', { tag: ['@pro', '@vendor', '@migration'] }, async () => {
        await store.assertMinMaxValidation();
    });

    // Terms & Conditions is covered entirely by the API spec — both the content
    // round-trip and the required-when-enabled validation — because its
    // toggle-revealed rich-text editor is too timing-sensitive to drive reliably
    // in a long serial UI run. See tests/api/vendorStoreSettings.spec.ts.

    // General tab — required Store Title.
    test('store title is required', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        await store.assertStoreNameRequired();
    });

    test('store settings schema exposes the documented field defaults', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        const defaults = await store.getSchemaDefaults();
        for (const [id, expected] of Object.entries(migration.defaults)) {
            expect(defaults[id]).toBe(expected);
        }
    });
});
