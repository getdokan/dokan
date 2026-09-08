import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Withdraw Options',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Withdraw Options")]',
        fields: [
            {
                selector: '//input[@id="dokan_withdraw[withdraw_limit]"]',
                type: 'number',
                value: '11'
            },
            {
                selector: '//input[@id="dokan_withdraw[withdraw_date_limit]"]',
                type: 'number',
                value: '11'
            },
            // {
            //     // Todo: Rest of the fields should test manually. New page yeat fully not match with design and mappin is not also implemented (will be implemented after fix with design. )
            // }
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Transaction -> Withdraw',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-transaction"] >> [data-testid="settings-menu-withdraw_charge"]',
    fields: [
        {
            selector: '[data-testid="settings-field-minimum_withdraw_limit"] input[type="number"]',
            type: 'number',
            value: '11',
        },
        {
            selector: '[data-testid="settings-field-withdraw_threshold"] input[type="number"]',
            type: 'number',
            value: '11',
        },
    ],
};

test.describe('Admin Setting: Transaction -> Withdraw', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Withdraw Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to New Withdraw Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

