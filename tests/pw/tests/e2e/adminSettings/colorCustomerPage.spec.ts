import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

// -----------------------------
// OLD UI DATASET
// -----------------------------
const oldColorDataset = {
    title: 'Admin Old Setting: Store Colors',
    url: 'wp-admin/admin.php?page=dokan#/settings',
    selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Colors")]',
    fields: [
        // The legacy colors UI renders no inputs — the selected mode/palette is
        // marked by an `active-pallete` class on the wrapper. The selector
        // therefore encodes the expected state and only has to resolve, so
        // these use `visible` rather than an input-backed radio type.
        {
            // Targets the <div> with class 'color_option' and ensures it contains the required title text.
            selector: '.color_option.active-pallete .color-option-title:has-text("Pre-defined Color Palette")',
            type: 'visible',
        },
        {
            // Palettes are plain radios keyed by name - there is no wrapping
            // <label>, so target the input and set/assert its checked state.
            selector: 'input[name="store_color_pallete"][value="purple pulse"]',
            type: 'radio-input',
        },
    ],
};

// -----------------------------
// NEW UI DATASET
// -----------------------------
const newColorDataset = {
    title: 'Admin Setting: Appearance → Dashboard Color Customizer',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-appearance"] >> [data-testid="settings-menu-dashboard-color-customizer-page"]',
    fields: [
        // The Pro color customizer renders no `settings-field-*` wrapper, so
        // both radio groups are scoped to the section instead. Option values
        // live on the hidden inputs: 'template'/'custom' for the mode and the
        // lowercase palette slug for the palette.
        {
            selector: '[data-testid="settings-section-dokan-store-colors"]',
            type: 'customize-radio',
            value: 'template', // Pre-defined Color Palette
        },
        {
            selector: '[data-testid="settings-section-dokan-store-colors"]',
            type: 'customize-radio',
            value: 'purple pulse',
        },
    ],
};

// -----------------------------
// TESTS
// -----------------------------
test.describe('Admin Setting: Store Colors Migration', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);

        await loginPage.adminLogin(data.admin);
    });

    // ---------------------------------------------------------
    // NEW → OLD SYNC TEST
    // ---------------------------------------------------------
    test('New to Old Store Colors synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {

        await test.step('Update new color settings', async () => {
            await adminSettingsPage.updateSettings(newColorDataset);
        });

        await test.step('Reload old color page', async () => {
            await adminSettingsPage.reloadUrl(oldColorDataset.url);
        });

        await test.step('Check old color settings', async () => {
            await adminSettingsPage.checkSettings(oldColorDataset);
        });
    });

    // ---------------------------------------------------------
    // OLD → NEW SYNC TEST
    // ---------------------------------------------------------
    test('Old to New Store Colors synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {

        await test.step('Update old color settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            await adminSettingsPage.updateSettings(oldColorDataset);
        });

        await test.step('Reload pages after save', async () => {
            await adminSettingsPage.reloadUrl(oldColorDataset.url);
        });

        await test.step('Check new UI settings', async () => {
            await adminSettingsPage.checkSettings(newColorDataset);
        });
    });

});