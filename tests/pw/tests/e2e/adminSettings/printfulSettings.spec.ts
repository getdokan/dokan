import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = {
    title: 'Admin Old Setting: Printful Integration',
    url: 'wp-admin/admin.php?page=dokan#/settings',
    selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Printful")]',
    fields: [
    ],
};

const newDataset = {
    title: 'Admin Setting: Printful Integration',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-product"] >> [data-testid="settings-menu-printful_integration"]',
    fields: [
        // The Printful app enable toggle and app-name field were dropped from the
        // schema; the integration is now driven by the Client ID / Secret Key pair.
        {
            selector: '[data-testid="settings-field-printful_client_id"] input[type="password"]',
            type: 'text',
            value: 'test-client-id-123',
        },
        {
            selector: '[data-testid="settings-field-printful_secret_key"] input[type="password"]',
            type: 'text',
            value: 'test-secret-key-456',
        },
        {
            selector: '[data-testid="settings-field-size_guide_popup_title"] input',
            type: 'text',
            value: 'Size Guide',
        },
        {
            selector: '[data-testid="settings-field-size_guide_button_text"] input',
            type: 'text',
            value: 'Size Guide',
        },
        // Colour fields: popover trigger + WP ColorPicker hex input.
        {
            selector: '[data-testid="settings-field-size_guide_popup_text_color"]',
            type: 'color-picker',
            value: '#25252d',
        },
        {
            selector: '[data-testid="settings-field-size_guide_popup_background_color"]',
            type: 'color-picker',
            value: '#ffffff',
        },
        {
            selector: '[data-testid="settings-field-size_guide_tab_background_color"]',
            type: 'color-picker',
            value: '#f5f5f5',
        },
        {
            selector: '[data-testid="settings-field-size_guide_active_tab_background_color"]',
            type: 'color-picker',
            value: '#7047eb',
        },
        {
            selector: '[data-testid="settings-field-size_guide_button_text_color"]',
            type: 'color-picker',
            value: '#ffffff',
        },
        {
            selector: '[data-testid="settings-field-size_guide_measurement_unit"]',
            type: 'radio-capsule',
            value: 'Inches',
        },
    ],
};

test.describe('Admin Setting: Printful Integration', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);

        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    // Test for settings synchronization from new to old
    test('New to Old Printful Settings synchronization', { tag: ['@pro', '@admin', '@migration'] }, async () => {
        await test.step('Update new settings', async () => {
            await adminSettingsPage.updateSettings(newDataset);
        });

        await test.step('Check old settings', async () => {
            await adminSettingsPage.checkSettings(oldDataset);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });

    // Test for settings synchronization from old to new
    test('Old to New Printful Settings synchronization', { tag: ['@pro', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            await adminSettingsPage.updateSettings(oldDataset);
        });

        await test.step('Reload old settings url', async () => {
            await adminSettingsPage.reloadUrl(oldDataset.url);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});
