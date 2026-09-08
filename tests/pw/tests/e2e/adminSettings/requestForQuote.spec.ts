import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = {
    title: 'Admin Old Setting: General -> Request For Quote',
    url: 'wp-admin/admin.php?page=dokan#/settings',
    selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Quote Settings")]',
    fields: [
        {
            selector: '//label[@for="dokan_quote_settings[enable_out_of_stock]"]//label[@class="switch tips"]',
            type: 'checkbox',
            value: false,
        },
        {
            selector: '//label[@for="dokan_quote_settings[enable_ajax_add_to_quote]"]//label[@class="switch tips"]',
            type: 'checkbox',
            value: false,
        },
        {
            selector: '//label[@for="dokan_quote_settings[redirect_to_quote_page]"]//label[@class="switch tips"]',
            type: 'checkbox',
            value: true,
        },
        {
            selector: '#dokan_quote_settings\\[decrease_offered_price\\]',
            type: 'number',
            value: '10',
        },
        {
            selector: '//label[@for="dokan_quote_settings[enable_convert_to_order]"]//label[@class="switch tips"]',
            type: 'checkbox',
            value: true,
        },
        {
            selector: '//label[@for="dokan_quote_settings[enable_quote_converter_display]"]//label[@class="switch tips"]',
            type: 'checkbox',
            value: false,
        },
    ],
};

const newDataset = {
    title: 'Admin Setting: Product -> Request For Quote',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-product"] >> [data-testid="settings-menu-request_for_quote"]',
    fields: [
        {
            selector: '[data-testid="settings-field-enable_quote_out_of_stock"] [role="switch"]',
            type: 'switch',
            value: false,
        },
        {
            selector: '[data-testid="settings-field-enable_ajax_add_to_quote"] [role="switch"]',
            type: 'switch',
            value: false,
        },
        {
            selector: '[data-testid="settings-field-redirect_to_quote_page"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-decrease_offered_price"] input[type="number"]',
            type: 'number',
            value: '10',
        },
        {
            selector: '[data-testid="settings-field-convert_to_order"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-quote_converter_display"] [role="switch"]',
            type: 'switch',
            value: false,
        },
    ],
};

test.describe('Admin Setting: Product -> Request For Quote', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Request For Quote Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to New Request For Quote Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            await adminSettingsPage.updateSettings(oldDataset);
        });

        await test.step('Reload old settings url', async () => {
            await adminSettingsPage.reloadUrl(oldDataset.url);
            await adminSettingsPage.reloadUrl(oldDataset.url);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});