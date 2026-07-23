import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = {
    title: 'Admin Old Setting: Printful Integration',
    url: 'wp-admin/admin.php?page=dokan#/settings',
    selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Printful")]',
    fields: [
        {
            selector: '//h3[contains(text(),"Client ID")]/ancestor::fieldset//input[@class="secret-input"]',
            type: 'text',
            value: 'test-client-id-123',
        },
        {
            selector: '//h3[contains(text(),"Secret key")]/ancestor::fieldset//input[@class="secret-input"]',
            type: 'text',
            value: 'test-secret-key-456',
        },
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
        // Color Picker Fields
        {
            selector: 'label:has-text("Size guide popup text color") >> xpath=ancestor::div[contains(@class,"grid")][contains(@class,"grid-cols-12")][1]//span[contains(@class,"component-color-indicator")]',
            type: 'color-picker',
            value: 'rgb(37, 37, 45)',
        },
        {
            selector: 'label:has-text("Size Guide Popup Background Color") >> xpath=ancestor::div[contains(@class,"grid")][contains(@class,"grid-cols-12")][1]//span[contains(@class,"component-color-indicator")]',
            type: 'color-picker',
            value: 'rgb(255, 255, 255)',
        },
        {
            selector: 'label:has-text("Size Guide Tab Background Color") >> xpath=ancestor::div[contains(@class,"grid")][contains(@class,"grid-cols-12")][1]//span[contains(@class,"component-color-indicator")]',
            type: 'color-picker',
            value: 'rgb(255, 255, 255)',
        },
        {
            selector: 'label:has-text("Size Guide Active Tab Background Color") >> xpath=ancestor::div[contains(@class,"grid")][contains(@class,"grid-cols-12")][1]//span[contains(@class,"component-color-indicator")]',
            type: 'color-picker',
            value: 'rgb(112, 71, 235)',
        },
        {
            selector: 'label:has-text("Size Guide Button Text Color") >> xpath=ancestor::div[contains(@class,"grid")][contains(@class,"grid-cols-12")][1]//span[contains(@class,"component-color-indicator")]',
            type: 'color-picker',
            value: 'rgb(255, 255, 255)',
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
