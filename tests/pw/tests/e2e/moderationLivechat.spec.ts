import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Livechat',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Livechat")]',
        fields: [
            {
                selector: '//label[@for="dokan_live_chat[enable]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//select[@id="dokan_live_chat[provider]"]',
                type: 'select',
                value: 'tawk',
            },
            {
                selector: '//input[@id="dokan_live_chat[app_id]"]',
                type: 'text',
                value: 'app-id',
            },
            {
                selector: '//input[@id="dokan_live_chat[app_secret]"]',
                type: 'text',
                value: 'app-secret',
            },
            {
                selector: '//label[@for="dokan_live_chat[chat_button_seller_page]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Moderation -> livechat',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_moderation >> #dokan_settings_moderation_livechat',
    fields: [
        {
            selector: '#dokan_settings_moderation_livechat_livechat_settings_livechat_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_moderation_livechat_livechat_settings_livechat_provider select',
            type: 'select',
            value: 'tawk',
        },
        {
            selector: '#dokan_settings_moderation_livechat_livechat_settings_livechat_app_id input',
            type: 'text',
            value: 'app-id',
        },
        {
            selector: '#dokan_settings_moderation_livechat_livechat_settings_livechat_app_secret input',
            type: 'text',
            value: 'app-secret',
        },
        {
            selector: '#dokan_settings_moderation_livechat_livechat_settings_livechat_vendor_page_button button[role="switch"]',
            type: 'switch',
            value: true,
        },
    ],
};

test.describe('Admin Setting: Moderation -> livechat', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Livechat Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update new settings', async () => {
            await adminSettingsPage.updateSettings(newDataset);
        });

        await test.step('Check old settings', async () => {
            for (const dataset of oldDataset) {
                await test.step(dataset.title, async () => {
                    await adminSettingsPage.checkSettings(dataset);
                });
            }
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });

    test('Old to New Livechat Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            for (const dataset of oldDataset) {
                await test.step('Update ' + dataset.title, async () => {
                    await adminSettingsPage.updateSettings(dataset);
                });
            }
        });

        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload ' + dataset.title, async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });

        await test.step('Check new settings again', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});
