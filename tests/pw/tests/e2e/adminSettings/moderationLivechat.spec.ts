import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Livechat',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Live Chat")]',
        fields: [
            {
                selector: '//label[@for="dokan_live_chat[enable]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true
            },
            {
                selector: 'label[for="1-tawkto-provider"]',
                type: 'radioOld',
                value: true
            },
            {
                selector: '//label[@for="dokan_live_chat[chat_button_seller_page]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true
            },
            {
                selector: '//select[@id="dokan_live_chat[chat_button_product_page]"]',
                type: 'select',
                value: 'above_tab'
            },
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Moderation -> livechat',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-moderation"] >> [data-testid="settings-menu-livechat"]',
    fields: [
        {
            selector: '[data-testid="settings-field-livechat_enabled"] [role="switch"]',
            type: 'switch',
            value: true
        },
        // {
        //     There is problem of some fields. Todo: Fix those selectors later.
        //     selector: '[data-testid="settings-field-livechat_provider"] div[role="radio"][aria-checked="true"]:has-text("Tawk.to")',
        //     type: 'radio',
        //     value: true
        // },
        {
            selector: '[data-testid="settings-field-livechat_vendor_page_button"] [role="switch"]',
            type: 'switch',
            value: true
        },
        {
            selector: '[data-testid="settings-field-livechat_product_page_button"]',
            type: 'customize-radio',
            value: 'above_tab',
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
