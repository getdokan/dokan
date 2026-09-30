import { test, expect, request, type APIRequestContext, type Locator } from '@playwright/test';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';

// Values typed through the settings UI must survive save + reload. The REST
// sweep (settingsBridgeSweep) writes straight to the API, so it cannot see a
// value the UI drops before sending, or a save the server rejects.

type InputCase = {
    gate: '@lite' | '@pro';
    menu: string;
    subpage: string;
    id: string;
    values: [string, string];
};

const inputCases: InputCase[] = [
    { gate: '@lite', menu: 'general', subpage: 'marketplace', id: 'vendor_store_url_slug', values: ['qa-store', 'qa-shop'] },
    { gate: '@lite', menu: 'transaction', subpage: 'withdraw_charge', id: 'minimum_withdraw_limit', values: ['75', '60'] },
    { gate: '@lite', menu: 'transaction', subpage: 'withdraw_charge', id: 'withdraw_threshold', values: ['3', '5'] },
    { gate: '@lite', menu: 'transaction', subpage: 'reverse_withdrawal', id: 'reverse_withdrawal_balance_threshold', values: ['200', '180'] },
    { gate: '@lite', menu: 'transaction', subpage: 'reverse_withdrawal', id: 'reverse_withdrawal_due_period', values: ['9', '12'] },
    { gate: '@lite', menu: 'appearance', subpage: 'store', id: 'store_products_per_page', values: ['16', '20'] },
    { gate: '@pro', menu: 'general', subpage: 'location', id: 'radius_search_min_distance', values: ['3', '4'] },
    { gate: '@pro', menu: 'general', subpage: 'location', id: 'radius_search_max_distance', values: ['450', '400'] },
    { gate: '@pro', menu: 'general', subpage: 'location', id: 'map_zoom_level', values: ['12', '10'] },
    { gate: '@pro', menu: 'verification', subpage: 'email-verification-page', id: 'registration_notice', values: ['QA: verify your email to finish registration.', 'QA: confirm your email first.'] },
    { gate: '@pro', menu: 'verification', subpage: 'email-verification-page', id: 'login_notice', values: ['QA: your email is not verified yet.', 'QA: check your inbox to verify.'] },
    { gate: '@pro', menu: 'verification', subpage: 'sms-gateways-page', id: 'sender_name', values: ['QA Team', 'Dokan QA'] },
    { gate: '@pro', menu: 'verification', subpage: 'sms-gateways-page', id: 'sms_text', values: ['Code: %CODE%', 'Your QA code is %CODE%'] },
    { gate: '@pro', menu: 'verification', subpage: 'sms-gateways-page', id: 'sms_sent_success', values: ['QA: SMS sent.', 'QA: code sent, check your phone.'] },
    { gate: '@pro', menu: 'verification', subpage: 'sms-gateways-page', id: 'sms_sent_error', values: ['QA: SMS failed.', 'QA: could not send the code.'] },
    { gate: '@pro', menu: 'moderation', subpage: 'store_support', id: 'store_support_button_label', values: ['Get Help', 'Contact Us'] },
    { gate: '@pro', menu: 'vendor', subpage: 'single_product_multi_vendor', id: 'sell_item_button_text', values: ['Sell This Too', 'Resell Item'] },
    { gate: '@pro', menu: 'vendor', subpage: 'single_product_multi_vendor', id: 'available_vendor_display_area_title', values: ['More Sellers', 'Also Sold By'] },
    { gate: '@pro', menu: 'product', subpage: 'product_advertisement', id: 'advertisement_available_slots', values: ['90', '80'] },
    { gate: '@pro', menu: 'product', subpage: 'product_advertisement', id: 'advertisement_expire_days', values: ['12', '14'] },
    { gate: '@pro', menu: 'product', subpage: 'request_for_quote', id: 'decrease_offered_price', values: ['5', '8'] },
    { gate: '@pro', menu: 'product', subpage: 'printful_integration', id: 'size_guide_popup_title', values: ['Fit Guide', 'Sizing Chart'] },
    { gate: '@pro', menu: 'product', subpage: 'printful_integration', id: 'size_guide_button_text', values: ['View Sizes', 'Size Chart'] },
    { gate: '@pro', menu: 'shipment', subpage: 'dashboard-delivery-days-page', id: 'delivery_date_label', values: ['Delivery Day', 'Deliver On'] },
    { gate: '@pro', menu: 'shipment', subpage: 'dashboard-delivery-days-page', id: 'time_slot_minutes', values: ['45', '60'] },
    { gate: '@pro', menu: 'shipment', subpage: 'dashboard-delivery-days-page', id: 'order_per_slot', values: ['4', '6'] },
    { gate: '@pro', menu: 'shipment', subpage: 'dashboard-delivery-days-page', id: 'delivery_box_info', values: ['Ships in %DAY% day(s).', 'Allow %DAY% day(s) to process.'] },
];

type RejectCase = { gate: '@lite' | '@pro'; menu: string; subpage: string; id: string; value: string; reason: string };

const rejectCases: RejectCase[] = [
    { gate: '@lite', menu: 'general', subpage: 'marketplace', id: 'vendor_store_url_slug', value: 'page', reason: 'reserved WordPress slug' },
    { gate: '@pro', menu: 'shipment', subpage: 'dashboard-delivery-days-page', id: 'delivery_date_label', value: '', reason: 'required field left empty' },
    { gate: '@pro', menu: 'shipment', subpage: 'dashboard-delivery-days-page', id: 'time_slot_minutes', value: '5', reason: 'below the 10 minute minimum' },
];

type ChargeCase = {
    gate: '@lite' | '@pro';
    title: string;
    menu: string;
    subpage: string;
    id: string;
    enable?: { id: string };
    legacy: { option: string; path: string[]; percentage: string; fixed: string };
};

const chargeCases: ChargeCase[] = [
    {
        gate: '@lite',
        title: 'Admin commission (fixed type)',
        menu: 'transaction',
        subpage: 'commission',
        id: 'admin_commission',
        legacy: { option: 'dokan_selling', path: [], percentage: 'admin_percentage', fixed: 'additional_fee' },
    },
    {
        gate: '@lite',
        title: 'PayPal withdraw charges',
        menu: 'transaction',
        subpage: 'withdraw_charge',
        id: 'paypal_withdraw_charges',
        enable: { id: 'paypal_withdraw' },
        legacy: { option: 'dokan_withdraw', path: ['withdraw_charges', 'paypal'], percentage: 'percentage', fixed: 'fixed' },
    },
];

// Masked inputs render numbers with the store's decimal format (e.g. "14,00").
const shownAs = (value: string) => new RegExp(`^${value}([.,]0+)?$`);

// Default mode, not serial: one broken field must not hide the others. The
// project is not fullyParallel, so these still run in order on one worker.
test.describe.configure({ mode: 'default' });

test.describe('Admin Setting: input values persist through the UI', () => {
    test.use({ storageState: data.auth.adminAuthFile });

    let apiContext: APIRequestContext;
    let restorePoint: Record<string, string>;
    let settingsPage: AdminSettingsPage;

    const storedValue = async (id: string): Promise<any> => {
        const response = await apiContext.get('/wp-json/dokan/v1/admin/settings');
        expect(response.ok(), `settings schema should be readable: ${response.status()} ${(await response.text()).slice(0, 300)}`).toBeTruthy();
        const schema: Array<{ type: string; id: string; value: unknown }> = await response.json();
        return schema.find(entry => entry.type === 'field' && entry.id === id)?.value;
    };

    const storedCharge = async (id: string): Promise<{ admin_percentage?: string; additional_fee?: string }> => {
        const value = await storedValue(id);
        return value && typeof value === 'object' ? value : {};
    };

    // Always move off the stored value, so the form is dirty and a lost write shows.
    const nextValue = (current: unknown, [a, b]: [string, string]) => (String(current ?? '') === a ? b : a);

    const legacyCharge = async (legacy: ChargeCase['legacy']) => {
        const row = await dbUtils.getOptionValue(legacy.option);
        const node = legacy.path.reduce((acc: any, key) => acc?.[key], row);
        return { percentage: node?.[legacy.percentage], fixed: node?.[legacy.fixed] };
    };

    const openCharge = async (charge: ChargeCase) => {
        await settingsPage.openSubpage(charge.menu, charge.subpage);
        if (charge.id === 'admin_commission') {
            await settingsPage.radioCapsuleOption({ selector: '[data-testid="settings-field-commission_type"]', value: 'Fixed' }).click();
        }
        if (charge.enable) {
            await settingsPage.ensureSwitchOn(charge.enable.id);
        }
        return settingsPage.combineInputsFor(charge.id);
    };

    // Masked inputs show "14,00" or "14.00" depending on the store's decimal mark.
    const shownNumber = async (input: Locator) => Number((await input.inputValue()).replace(',', '.'));

    // Pick from what the UI shows, not the store: combine inputs display the
    // legacy value while the store can still hold "", and retyping the shown
    // value leaves the form clean.
    const nextShown = async (input: Locator, [a, b]: [string, string]) => ((await shownNumber(input)) === Number(a) ? b : a);

    // User-paced entry: each input settles before the next one is touched.
    const enterCharge = async (inputs: { percentage: Locator; fixed: Locator }, percentage?: string, fixed?: string) => {
        if (percentage !== undefined) {
            await settingsPage.typeValue(inputs.percentage, percentage);
            await settingsPage.flushDebounce();
        }
        if (fixed !== undefined) {
            await settingsPage.typeValue(inputs.fixed, fixed);
            await settingsPage.flushDebounce();
        }
    };

    const expectChargePersisted = async (charge: ChargeCase, percentage: string, fixed: string) => {
        const stored = await storedCharge(charge.id);
        expect(Number(stored.admin_percentage), `${charge.id} percentage in settings store`).toBe(Number(percentage));
        expect(Number(stored.additional_fee), `${charge.id} fixed fee in settings store`).toBe(Number(fixed));

        const legacy = await legacyCharge(charge.legacy);
        expect(Number(legacy.percentage), `${charge.legacy.option} legacy percentage`).toBe(Number(percentage));
        expect(Number(legacy.fixed), `${charge.legacy.option} legacy fixed fee`).toBe(Number(fixed));

        await settingsPage.reloadSettings();
        const inputs = await openCharge(charge);
        await expect(inputs.percentage, `${charge.id} percentage after reload`).toHaveValue(shownAs(percentage));
        await expect(inputs.fixed, `${charge.id} fixed fee after reload`).toHaveValue(shownAs(fixed));
    };

    test.beforeAll(async () => {
        // Basic auth only: inherited admin cookies without a REST nonce make WP return 401.
        apiContext = await request.newContext({ ...data.header.adminAuth, storageState: { cookies: [], origins: [] } });
        restorePoint = await dbUtils.getOptionRows('dokan\\_%');
    });

    test.afterAll(async () => {
        for (const [name, raw] of Object.entries(restorePoint ?? {})) {
            await dbUtils.setOptionValue(name, raw, false);
        }
        await apiContext?.dispose();
    });

    test.beforeEach(async ({ page }) => {
        // A rejected save leaves the form dirty; accept the beforeunload prompt on reload.
        page.on('dialog', dialog => dialog.accept());
        // Time still flows; flushDebounce() only fast-forwards it.
        await page.clock.install();
        settingsPage = new AdminSettingsPage(page);
        await page.goto('wp-admin/admin.php?page=dokan-dashboard#/settings');
    });

    test.describe('happy paths', () => {
        for (const charge of chargeCases) {
            test(`${charge.title}: typed percentage and fixed fee both persist`, { tag: [charge.gate, '@admin'] }, async () => {
                const inputs = await openCharge(charge);
                const percentage = await nextShown(inputs.percentage, ['14', '16']);
                const fixed = await nextShown(inputs.fixed, ['11', '9']);

                await enterCharge(inputs, percentage, fixed);
                await settingsPage.saveChanges();

                await expectChargePersisted(charge, percentage, fixed);
            });
        }

        for (const field of inputCases) {
            test(`${field.id}: typed value persists`, { tag: [field.gate, '@admin'] }, async () => {
                const value = nextValue(await storedValue(field.id), field.values);

                await settingsPage.openSubpage(field.menu, field.subpage);
                await settingsPage.typeValue(settingsPage.inputFor(field.id), value);
                await settingsPage.saveChanges();

                expect(String(await storedValue(field.id)), `${field.id} in settings store`).toBe(value);
                await settingsPage.reloadSettings();
                await settingsPage.openSubpage(field.menu, field.subpage);
                await expect(settingsPage.inputFor(field.id), `${field.id} after reload`).toHaveValue(value);
            });
        }
    });

    test.describe('edge cases', () => {
        const commission = chargeCases[0]!;

        // Seeds a known pair. saveSettings() (not saveChanges) because the pair
        // may already be stored, leaving nothing to save.
        const seedCommission = async (percentage: string, fixed: string) => {
            await enterCharge(await openCharge(commission), percentage, fixed);
            await settingsPage.saveSettings();
            await settingsPage.reloadSettings();
        };

        test('Admin commission: editing only the fixed fee keeps the saved percentage', { tag: ['@lite', '@admin'] }, async () => {
            await seedCommission('12', '7');

            await enterCharge(await openCharge(commission), undefined, '8');
            await settingsPage.saveChanges();

            await expectChargePersisted(commission, '12', '8');
        });

        test('Admin commission: editing only the percentage keeps the saved fixed fee', { tag: ['@lite', '@admin'] }, async () => {
            await seedCommission('12', '7');

            await enterCharge(await openCharge(commission), '13');
            await settingsPage.saveChanges();

            await expectChargePersisted(commission, '13', '7');
        });

        test('Admin commission: 100% boundary persists', { tag: ['@lite', '@admin'] }, async () => {
            const inputs = await openCharge(commission);
            const fixed = await nextShown(inputs.fixed, ['6', '5']);

            await enterCharge(inputs, '100', fixed);
            await settingsPage.saveChanges();

            await expectChargePersisted(commission, '100', fixed);
        });

        for (const charge of chargeCases) {
            test(`${charge.title}: percentage and fee typed back-to-back both persist`, { tag: [charge.gate, '@admin'] }, async () => {
                const inputs = await openCharge(charge);
                const percentage = await nextShown(inputs.percentage, ['15', '17']);
                const fixed = await nextShown(inputs.fixed, ['4', '3']);

                // Fee typed while the percentage is still debouncing, like a quick Tab.
                await settingsPage.typeValue(inputs.percentage, percentage);
                await settingsPage.typeValue(inputs.fixed, fixed);
                await settingsPage.flushDebounce();
                await settingsPage.saveChanges();

                await expectChargePersisted(charge, percentage, fixed);
            });
        }
    });

    test.describe('negative cases', () => {
        test('Admin commission: percentage above 100 is not saved', { tag: ['@lite', '@admin'] }, async () => {
            const commission = chargeCases[0]!;
            const before = await storedCharge(commission.id);

            const inputs = await openCharge(commission);
            await settingsPage.typeValue(inputs.percentage, '101');
            const response = await settingsPage.clickSaveAndCapture();

            if (response) {
                expect(response.status(), 'server should reject a percentage above 100').toBeGreaterThanOrEqual(400);
            }
            expect(await storedCharge(commission.id)).toEqual(before);
        });

        for (const field of rejectCases) {
            test(`${field.id}: ${field.reason} is not saved`, { tag: [field.gate, '@admin'] }, async () => {
                const before = await storedValue(field.id);

                await settingsPage.openSubpage(field.menu, field.subpage);
                await settingsPage.typeValue(settingsPage.inputFor(field.id), field.value);
                const response = await settingsPage.clickSaveAndCapture();

                if (response) {
                    expect(response.status(), `server should reject ${field.reason}`).toBeGreaterThanOrEqual(400);
                }
                expect(await storedValue(field.id)).toEqual(before);
            });
        }
    });
});
