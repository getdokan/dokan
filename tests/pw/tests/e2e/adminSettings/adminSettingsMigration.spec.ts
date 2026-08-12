import { test, expect } from '@utils/test';
import { AdminSettingsPage, LegacyTab, NewNav } from '@pages/adminSettingsPage';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';

/**
 * Upgrade regression: every setting an existing marketplace already owns must
 * stay in sync across the legacy (Vue) settings screen and the new (React)
 * settings app, in both directions, and must land in both option rows.
 *
 * Each field is exercised through the same round trip:
 *   new UI write -> legacy UI reads it back -> both option rows agree
 *   -> legacy UI write -> reloaded new UI reads it back
 *
 * The reload matters: without it the last assertion only re-reads the client
 * state the write left behind and would pass even if nothing was persisted.
 */

const MARKETPLACE: NewNav = { page: 'general', subpage: 'marketplace' };
const ONBOARDING: NewNav = { page: 'vendor', subpage: 'vendor_onboarding' };
const CAPABILITIES: NewNav = { page: 'vendor', subpage: 'vendor_capabilities' };

const LEGACY_OPTIONS = ['dokan_general', 'dokan_selling', 'dokan_live_search_setting'] as const;
const NEW_OPTION = 'dokan_admin_settings';

type NewType = 'switch' | 'text' | 'buttons' | 'radios' | 'richtext';
type LegacyType = 'switch' | 'text' | 'select' | 'radio' | 'richtext';

interface SyncField {
    title: string;
    tags?: string[];
    nav: NewNav;
    id: string;
    newType: NewType;
    legacy: { tab: LegacyTab; type: LegacyType; group: string; key: string };
    // Legacy stores the negation of the new value (e.g. show vs hide).
    inverted?: boolean;
    // Alternating values for non-boolean fields.
    values?: [string, string];
    // Field is only rendered while another setting holds a given value.
    requires?: { id: string; value: boolean };
}

const fields: SyncField[] = [
    {
        title: 'vendor store URL slug',
        nav: MARKETPLACE,
        id: 'vendor_store_url_slug',
        newType: 'text',
        legacy: { tab: 'General', type: 'text', group: 'dokan_general', key: 'custom_store_url' },
        values: data.adminSettingsMigration.testData.storeUrlSlugs as [string, string],
    },
    {
        title: 'single seller mode',
        nav: MARKETPLACE,
        id: 'enable_single_seller_mode',
        newType: 'switch',
        legacy: { tab: 'General', type: 'switch', group: 'dokan_general', key: 'enable_single_seller_mode' },
    },
    {
        title: 'store category mode',
        nav: MARKETPLACE,
        id: 'store_category_mode',
        newType: 'buttons',
        legacy: { tab: 'General', type: 'radio', group: 'dokan_general', key: 'store_category_type' },
        values: ['none', 'multiple'],
    },
    {
        title: 'show customer details to vendors',
        nav: MARKETPLACE,
        id: 'show_customer_details_to_vendors',
        newType: 'switch',
        legacy: { tab: 'Selling Options', type: 'switch', group: 'dokan_selling', key: 'hide_customer_info' },
        inverted: true,
    },
    {
        title: 'guest product enquiry',
        nav: MARKETPLACE,
        id: 'guest_product_enquiry',
        newType: 'switch',
        legacy: { tab: 'Selling Options', type: 'switch', group: 'dokan_selling', key: 'enable_guest_user_enquiry' },
    },
    {
        title: 'add to cart button visibility',
        nav: MARKETPLACE,
        id: 'catalog_mode_add_to_cart_button_visibility',
        newType: 'switch',
        legacy: { tab: 'Selling Options', type: 'switch', group: 'dokan_selling', key: 'catalog_mode_hide_add_to_cart_button' },
        inverted: true,
    },
    {
        title: 'live search option',
        nav: MARKETPLACE,
        id: 'live_search_option',
        newType: 'radios',
        legacy: { tab: 'Live Search', type: 'select', group: 'dokan_live_search_setting', key: 'live_search_option' },
        values: ['suggestion_box', 'old_live_search'],
    },
    {
        title: 'vendor selling capability on registration',
        nav: ONBOARDING,
        id: 'vendor_auto_enable_selling',
        newType: 'buttons',
        legacy: { tab: 'Selling Options', type: 'select', group: 'dokan_selling', key: 'new_seller_enable_selling' },
        values: ['automatically', 'manually'],
    },
    {
        title: 'address fields on registration',
        nav: ONBOARDING,
        id: 'vendor_registration_address_fields',
        newType: 'switch',
        legacy: { tab: 'General', type: 'switch', group: 'dokan_general', key: 'enabled_address_on_reg' },
    },
    {
        title: 'terms and conditions on registration',
        nav: ONBOARDING,
        id: 'terms_conditions',
        newType: 'switch',
        legacy: { tab: 'General', type: 'switch', group: 'dokan_general', key: 'enable_tc_on_reg' },
    },
    {
        title: 'vendor welcome wizard',
        nav: ONBOARDING,
        id: 'vendor_welcome_wizard_enabled',
        newType: 'switch',
        legacy: { tab: 'General', type: 'switch', group: 'dokan_general', key: 'disable_welcome_wizard' },
        inverted: true,
    },
    {
        title: 'vendor setup wizard message',
        nav: ONBOARDING,
        id: 'vendor_setup_wizard_message',
        newType: 'richtext',
        legacy: { tab: 'General', type: 'richtext', group: 'dokan_general', key: 'setup_wizard_message' },
        values: data.adminSettingsMigration.testData.wizardMessages as [string, string],
    },
    {
        title: 'vendor product duplication',
        nav: CAPABILITIES,
        id: 'vendor_can_duplicate_products',
        newType: 'switch',
        legacy: { tab: 'Selling Options', type: 'switch', group: 'dokan_selling', key: 'vendor_duplicate_product' },
    },
    {
        title: 'vendor manual order creation',
        nav: CAPABILITIES,
        id: 'allow_vendor_create_manual_order',
        newType: 'switch',
        legacy: { tab: 'Selling Options', type: 'switch', group: 'dokan_selling', key: 'allow_vendor_create_manual_order' },
    },
    {
        title: 'one page product creation',
        nav: CAPABILITIES,
        id: 'one_page_product_creation',
        newType: 'switch',
        legacy: { tab: 'Selling Options', type: 'switch', group: 'dokan_selling', key: 'one_step_product_create' },
    },
    {
        title: 'new product popup',
        nav: CAPABILITIES,
        id: 'vendor_new_product_popup',
        newType: 'switch',
        legacy: { tab: 'Selling Options', type: 'switch', group: 'dokan_selling', key: 'disable_product_popup' },
        inverted: true,
        // The popup field is removed from the DOM while one-page creation is on.
        requires: { id: 'one_page_product_creation', value: false },
    },
    {
        title: 'vendor order status change',
        nav: CAPABILITIES,
        id: 'vendor_can_change_order_status',
        newType: 'switch',
        legacy: { tab: 'Selling Options', type: 'switch', group: 'dokan_selling', key: 'order_status_change' },
    },
    {
        title: 'vendor any category selection',
        nav: CAPABILITIES,
        id: 'vendor_select_any_product_category',
        newType: 'switch',
        legacy: { tab: 'Selling Options', type: 'switch', group: 'dokan_selling', key: 'dokan_any_category_selection' },
    },
    {
        // Needs the Auction module plus WooCommerce Simple Auctions.
        title: 'auction capability for new vendors',
        tags: ['@pro'],
        nav: CAPABILITIES,
        id: 'new_seller_enable_auction',
        newType: 'switch',
        legacy: { tab: 'Selling Options', type: 'switch', group: 'dokan_selling', key: 'new_seller_enable_auction' },
    },
];

type FieldValue = boolean | string;

async function readNew(settings: AdminSettingsPage, field: SyncField): Promise<FieldValue> {
    switch (field.newType) {
        case 'switch':
            return await settings.getNewSwitch(field.nav, field.id);
        case 'text':
            return await settings.getNewText(field.nav, field.id);
        case 'buttons':
            return await settings.getNewButtonGroup(field.nav, field.id);
        case 'radios':
            return await settings.getNewRadio(field.nav, field.id);
        case 'richtext':
            return await settings.getNewRichText(field.nav, field.id);
    }
}

async function writeNew(settings: AdminSettingsPage, field: SyncField, value: FieldValue): Promise<void> {
    switch (field.newType) {
        case 'switch':
            return await settings.setNewSwitch(field.nav, field.id, value as boolean);
        case 'text':
            return await settings.setNewText(field.nav, field.id, value as string);
        case 'buttons':
            return await settings.setNewButtonGroup(field.nav, field.id, value as string);
        case 'radios':
            return await settings.setNewRadio(field.nav, field.id, value as string);
        case 'richtext':
            return await settings.setNewRichText(field.nav, field.id, value as string);
    }
}

async function readLegacy(settings: AdminSettingsPage, field: SyncField): Promise<FieldValue> {
    const { tab, type, group, key } = field.legacy;
    switch (type) {
        case 'switch':
            return await settings.getLegacySwitch(tab, key);
        case 'text':
            return await settings.getLegacyText(tab, group, key);
        case 'select':
            return await settings.getLegacySelect(tab, group, key);
        case 'radio':
            return await settings.getLegacyRadio(tab, key);
        case 'richtext':
            return await settings.getLegacyRichText(tab, key);
    }
}

async function writeLegacy(settings: AdminSettingsPage, field: SyncField, value: FieldValue): Promise<void> {
    const { tab, type, group, key } = field.legacy;
    switch (type) {
        case 'switch':
            return await settings.setLegacySwitch(tab, key, value as boolean);
        case 'text':
            return await settings.setLegacyText(tab, group, key, value as string);
        case 'select':
            return await settings.setLegacySelect(tab, group, key, value as string);
        case 'radio':
            return await settings.setLegacyRadio(tab, key, value as string);
        case 'richtext':
            return await settings.setLegacyRichText(tab, key, value as string);
    }
}

// The value the legacy screen holds for a given new-UI value.
function toLegacy(field: SyncField, value: FieldValue): FieldValue {
    return field.inverted ? !(value as boolean) : value;
}

// The alternate value used to prove the field actually moved.
function alternate(field: SyncField, current: FieldValue): FieldValue {
    if (field.newType === 'switch') {
        return !(current as boolean);
    }
    const [first, second] = field.values as [string, string];
    return current === first ? second : first;
}

// Dokan persists booleans as the strings 'on' / 'off' in both option rows.
function stored(value: FieldValue): string {
    return typeof value === 'boolean' ? (value ? 'on' : 'off') : value;
}

async function assertPersisted(field: SyncField, value: FieldValue): Promise<void> {
    const legacyOption = await dbUtils.getOptionValue(field.legacy.group);
    const newOption = await dbUtils.getOptionValue(NEW_OPTION);
    const legacyValue = stored(toLegacy(field, value));

    if (field.newType === 'richtext') {
        // Rich text is stored as HTML with encoded entities, so the plain text the
        // editor reports back is not comparable byte for byte. The invariant that
        // matters is that both rows hold the very same markup.
        expect(String(newOption[field.id]), `${NEW_OPTION}.${field.id}`).toBe(String(legacyOption[field.legacy.key]));
        return;
    }

    expect(String(legacyOption[field.legacy.key]), `${field.legacy.group}.${field.legacy.key}`).toBe(legacyValue);
    expect(String(newOption[field.id]), `${NEW_OPTION}.${field.id}`).toBe(stored(value));
}

test.describe('Admin settings migration', () => {
    test.use({ storageState: data.auth.adminAuthFile });

    // Settings are global state; snapshot every touched option row and put the
    // marketplace back exactly as the suite found it.
    const snapshot = new Map<string, unknown>();

    test.beforeAll(async () => {
        for (const option of [...LEGACY_OPTIONS, NEW_OPTION]) {
            snapshot.set(option, await dbUtils.getOptionValue(option));
        }
    });

    test.afterAll(async () => {
        for (const [option, value] of snapshot) {
            await dbUtils.setOptionValue(option, value as object);
        }
    });

    for (const field of fields) {
        test(`should keep ${field.title} in sync between legacy and new admin settings`, { tag: ['@lite', '@admin', '@migration', ...(field.tags ?? [])] }, async ({ page }) => {
            const settings = new AdminSettingsPage(page);

            if (field.requires) {
                await settings.setNewSwitch(field.nav, field.requires.id, field.requires.value);
            }

            const original = await readNew(settings, field);
            const updated = alternate(field, original);

            await test.step('a change made in the new settings reaches the legacy screen', async () => {
                await writeNew(settings, field, updated);
                expect(await readLegacy(settings, field)).toBe(toLegacy(field, updated));
                await assertPersisted(field, updated);
            });

            await test.step('a change made on the legacy screen reaches the new settings', async () => {
                await writeLegacy(settings, field, toLegacy(field, original));
                await settings.reloadNewSettings(field.nav);
                expect(await readNew(settings, field)).toBe(original);
                await assertPersisted(field, original);
            });
        });
    }

    test('should persist the vendor setup wizard logo selected in the new settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        const settings = new AdminSettingsPage(page);
        const logoField = page.locator('[data-testid="settings-field-vendor_setup_wizard_logo"]');

        await settings.openNewSubpage(ONBOARDING);

        // The field offers "Upload Image" while empty and "Change" once set.
        await logoField.getByRole('button', { name: /Upload Image|Change/ }).first().click();
        await page.locator('.media-modal input[type="file"]').first().setInputFiles(data.adminSettingsMigration.testData.logo);

        // The upload is auto-selected once processed; confirm it.
        const select = page.locator('.media-modal').getByRole('button', { name: 'Select', exact: true });
        await expect(select).toBeEnabled({ timeout: 30000 });
        await select.click();

        await settings.saveNewSettings();
        await expect(logoField.locator('img')).toBeVisible();

        // The legacy screen stores the same media URL under dokan_general.
        const [newOption, legacyOption] = await Promise.all([dbUtils.getOptionValue(NEW_OPTION), dbUtils.getOptionValue('dokan_general')]);
        expect(String(newOption.vendor_setup_wizard_logo)).not.toBe('');
        expect(String(legacyOption.setup_wizard_logo_url)).toBe(String(newOption.vendor_setup_wizard_logo));
    });
});
