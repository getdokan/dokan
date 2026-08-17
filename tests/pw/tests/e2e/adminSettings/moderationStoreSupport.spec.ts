import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Store Support',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Store Support")]',
        fields: [
            {
                selector: '//label[@for="dokan_store_support_setting[enabled_for_customer_order]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true
            },
            {
                selector: '//select[@id="dokan_store_support_setting[store_support_product_page]"]',
                type: 'select',
                value: 'above_tab' // Options: 'above_tab', 'inside_tab', 'dont_show'
            },
            {
                selector: '//input[@id="dokan_store_support_setting[support_button_label]"]',
                type: 'text',
                value: 'Support'
            }
        ]
    },
];


const newDataset = {
    title: 'Admin Setting: Moderation -> store_support',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-moderation"] >> [data-testid="settings-menu-store_support"]',
    fields: [
        {
            selector: '[data-testid="settings-field-store_support_order_details"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-store_support_button_label"] input',
            type: 'text',
            value: 'Support',
        },
        {
            selector: '[data-testid="settings-field-store_support_product_page"]',
            type: 'customize-radio',
            value: 'above_tab'
        }
    ],
};

test.describe('Admin Setting: Moderation -> store_support', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Store Support Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to New Store Support Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
        // Need the following reload again. Todo
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
