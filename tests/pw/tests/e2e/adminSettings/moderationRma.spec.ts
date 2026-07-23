import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: RMA',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"RMA")]',
        fields: [
            {
                selector: '//select[@id="dokan_rma[rma_order_status]"]',
                type: 'select',
                value: 'wc-completed',
            },
            {
                selector: '//label[@for="dokan_rma[rma_enable_refund_request]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//label[@for="dokan_rma[rma_enable_coupon_request]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: false,
            },
            {
                selector: '//div[contains(@class,"rma_policy")]//iframe[contains(@id,"dokan-tinymce") and contains(@id,"_ifr")]',
                type: 'textareaOld',
                value: 'Refund policy text',
            },
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Moderation -> rma',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-moderation"] >> [data-testid="settings-menu-rma"]',
    fields: [
        {
            selector: '#rma_order_status',
            type: 'dropdown',
            value: 'Completed',
        },
        {
            selector: '[data-testid="settings-field-rma_refund_requests"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-rma_coupon_requests"] [role="switch"]',
            type: 'switch',
            value: false,
        },
        {
            selector: '[data-testid="settings-field-rma_refund_policy"] [contenteditable="true"]',
            type: 'richtext',
            value: 'Refund policy text',
        },
    ],
};

test.describe('Admin Setting: Moderation -> rma', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old RMA Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to New RMA Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
        // Need extra reload (Todo: will be fixed later)
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
