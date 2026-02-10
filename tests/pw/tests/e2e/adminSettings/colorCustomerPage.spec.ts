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
        {
            // Targets the <div> with class 'color_option' and ensures it contains the required title text.
            selector: '.color_option.active-pallete .color-option-title:has-text("Pre-defined Color Palette")',
            type: 'customize-radio',
            value: 'true',
        },
        {
            selector: '.color-pallete-contents.active-pallete label:has-text("purple pulse")',
            type: 'customize-radio',
            value: 'true',
        },
    ],
};

// -----------------------------
// NEW UI DATASET
// -----------------------------
const newColorDataset = {
    title: 'Admin Setting: Appearance → Dashboard Color Customizer',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_appearance >> #dokan_settings_appearance_dashboard-color-customizer-page',
    fields: [
        {
            selector: 'div[role="radio"]:has-text("Pre-defined Color Palette")',
            type: 'radio',
            value: 'true',
        },
        {
            selector: 'div[role="radio"][aria-label="Purple Pulse"]',
            type: 'radio',
            value: 'true',
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