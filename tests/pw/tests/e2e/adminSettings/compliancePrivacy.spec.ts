import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Privacy Settings',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Privacy")]',
        fields: [
            {
                selector: '//label[@for="dokan_privacy[enable_privacy]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//select[@id="dokan_privacy[privacy_page]"]',
                type: 'select',
                value: '12' // Dashboard page for safe side
            },
            {
                selector: '//div[@class="privacy_policy dokan-settings-field-type-wpeditor"]//iframe[contains(@id,"dokan-tinymce") and contains(@id,"_ifr")]',
                type: 'textareaOld',
                value: 'newTest',
            },
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Compliance -> Privacy',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-compliance"] >> [data-testid="settings-menu-privacy"]',
    fields: [
        // Privacy Policy Display - Switch
        {
            selector: '[data-testid="settings-field-privacy_policy_visibility"] [role="switch"]',
            type: 'switch',
            value: true,
        },

        // Privacy Policy Page - Dropdown
        {
            selector: '[data-testid="settings-field-privacy_policy_page"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'Dashboard', // Dashboard page for safe side
        },

        // Privacy Policy Content - Textarea (Quill Editor)
        {
            selector: '[data-testid="settings-field-privacy_policy_content"] [contenteditable="true"]',
            type: 'richtext',
            value: 'newTest',
        },
    ],
};

test.describe('Admin Setting: Compliance -> Privacy', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Privacy Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to New Privacy Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
        // Need to reload again to reflect the changes in new settings page
        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload ' + dataset.title, async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});