import { test, expect, Page, request } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { VendorStoreSettingsPage, SyncField } from '@pages/vendorStoreSettingsPage';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';

const migration = data.vendorStoreSettingsMigration;
const { BASE_URL, VENDOR_ID, USER_PASSWORD } = process.env;
const nextMonthDay = (day: number): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, day);
};
const ymd = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const PROFILE_META = 'dokan_profile_settings';
const ADMIN_SETTINGS = 'dokan_admin_settings';

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

    test('page loads without console errors and fetches the schema once', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        const { consoleErrors, failedRequests, schemaGets } = await store.loadNewPageAndCollect();
        expect(consoleErrors).toEqual([]);
        expect(failedRequests).toEqual([]);
        expect(schemaGets).toBe(1);
    });

    test('double-clicking save sends a single request', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        expect(await store.doubleClickSaveCount('01711000010')).toBe(1);
    });

    test('cancel discards unsaved edits', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        const stored = await store.cancelEdit('01711000099');
        expect(stored.afterCancel).not.toBe('01711000099');
        expect(stored.afterReload).toBe(stored.afterCancel);
    });

    test('tab deep link opens the requested tab', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        await store.assertDeepLinkOpensTab('location');
    });

    test('terms editor follows the terms toggle', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        await store.assertDependentField('policies', 'terms_conditions', 'enable_tnc', migration.selectors.newUI.fieldRichText('store_tnc'));
        await store.discardChanges();
    });

    test('store notices follow the store hours toggle', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        await store.assertDependentField('schedule', 'store_schedule', 'dokan_store_time_enabled', migration.selectors.newUI.fieldInput('dokan_store_open_notice'));
        await store.discardChanges();
    });

    test('store settings schema exposes the documented field defaults', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        const defaults = await store.getSchemaDefaults();
        for (const [id, expected] of Object.entries(migration.defaults)) {
            expect(defaults[id]).toBe(expected);
        }
    });

    test('store hours set on the new page show on the legacy page', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        await store.setMondayHours([['9:00 am', '5:00 pm']]);
        expect(await store.getLegacyMondayHours()).toEqual({ opening: ['9:00 am'], closing: ['5:00 pm'] });
    });

    test('a second time range per day shows on the legacy page', { tag: ['@pro', '@vendor', '@migration'] }, async () => {
        await store.setMondayHours([
            ['9:00 am', '12:00 pm'],
            ['2:00 pm', '6:00 pm'],
        ]);
        expect(await store.getLegacyMondayHours()).toEqual({ opening: ['9:00 am', '2:00 pm'], closing: ['12:00 pm', '6:00 pm'] });
    });

    test('time options follow the site time format', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        const original = (await dbUtils.getOptionValueOrNull('time_format')) ?? 'g:i a';
        await dbUtils.setOptionValue('time_format', 'H:i', false);
        try {
            expect(await store.getTimeOptionLabels()).toContain('13:00');
        } finally {
            await dbUtils.setOptionValue('time_format', original, false);
        }
        expect(await store.getTimeOptionLabels()).toContain('1:00 pm');
    });

    test('date-wise vacation can be added and deleted', { tag: ['@pro', '@vendor', '@migration'] }, async () => {
        const from = nextMonthDay(10);
        const to = nextMonthDay(12);
        const message = `Vacation ${Date.now()}`;
        await store.addVacation(from, to, message);
        expect(await store.getStoredValue('settings_closing_style')).toBe('datewise');
        expect(await store.getStoredValue('seller_vacation_schedules')).toEqual(expect.arrayContaining([expect.objectContaining({ from: ymd(from), to: ymd(to), message })]));

        await store.deleteVacation(message);
        expect(await store.getStoredValue('seller_vacation_schedules')).not.toEqual(expect.arrayContaining([expect.objectContaining({ message })]));
    });

    for (const image of migration.images) {
        test(`${image.id} upload, crop and remove stay in sync with the legacy page`, { tag: ['@lite', '@vendor', '@migration'] }, async () => {
            const id = await store.uploadImage(image.index, image.file);
            expect(id).toBeGreaterThan(0);
            expect(await store.getLegacyImageId(image.legacyInput)).toBe(id);

            await store.removeImage(image.index);
            expect(Number(await store.getStoredValue(image.id))).toBe(0);
            expect(await store.getLegacyImageId(image.legacyInput)).toBe(0);
        });
    }

    test('map address loads from the legacy data', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        const address = await store.getNewMapAddress();
        test.skip(address === undefined, 'Store map needs a map API key configured');
        expect(address).toBe(await store.getLegacyMapAddress());
    });

    test('a failed save keeps the edit and stores nothing', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        const before = await store.getStoredPhone();
        const result = await store.saveWithServerError('01711000077', 'Simulated server failure');
        expect(result).toEqual({ toastVisible: true, stillDirty: true });
        expect(await store.getStoredPhone()).toBe(before);
    });

    // The admin "Vendor Store Settings" switcher picks the menu target. Written to the flat
    // dokan_admin_settings option: reads of dokan_appearance are overlaid from it, so a raw
    // write to dokan_appearance alone is ignored.
    test('store settings menu follows the vendor store settings switcher', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        const [original] = await dbUtils.updateOptionValue(ADMIN_SETTINGS, { vendor_store_settings: 'legacy' });
        try {
            const legacy = await store.legacyMenuLinkCount();
            expect(legacy.legacy).toBeGreaterThan(0);
            expect(legacy.react).toBe(0);

            await dbUtils.updateOptionValue(ADMIN_SETTINGS, { vendor_store_settings: 'latest' });
            expect((await store.legacyMenuLinkCount()).react).toBeGreaterThan(0);
        } finally {
            await dbUtils.setOptionValue(ADMIN_SETTINGS, original);
        }
    });

    test('vendor staff with store settings access sees the vendor store', { tag: ['@pro', '@vendor', '@migration'] }, async ({ browser }) => {
        const api = new ApiUtils(await request.newContext());
        const staff = payloads.createStaff();
        const [, staffId] = await api.createVendorStaff(staff, payloads.vendorAuth);
        const context = await browser.newContext({ baseURL: BASE_URL ?? 'http://localhost:9999' });
        try {
            await api.updateStaffCapabilities(staffId, { capabilities: [{ capability: 'dokan_view_store_settings_menu', access: true }] }, payloads.vendorAuth);
            const staffPage = await context.newPage();
            await new LoginPage(staffPage).login({ username: staff.username, password: String(USER_PASSWORD) });
            expect(await new VendorStoreSettingsPage(staffPage).getNewStoreName()).toBe(await store.getNewStoreName());
        } finally {
            await context.close();
            await api.deleteUser(staffId, payloads.adminAuth);
            await api.dispose();
        }
    });

    // Kept last: the describe is serial, so a failure here must not skip other tests.
    // BUG-1: the old page accepted this schedule; with store hours off the grid is hidden,
    // so it must not block saving an unrelated field.
    test('legacy store hours with store hours off do not block an unrelated save', { tag: ['@lite', '@vendor', '@migration'] }, async () => {
        const original = await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META);
        try {
            await dbUtils.setUserMeta(VENDOR_ID as string, PROFILE_META, { ...original, dokan_store_time_enabled: 'no', dokan_store_time: { ...original.dokan_store_time, ...migration.legacySchedule } }, true);
            await store.saveFieldOnNewPage('phone', '01711000011');
        } finally {
            await dbUtils.setUserMeta(VENDOR_ID as string, PROFILE_META, original, true);
        }
    });
});
