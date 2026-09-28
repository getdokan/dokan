import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Selling Options - Commission',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Selling Options")]',
        fields: [
            {
                selector: '//select[@id="dokan_selling[commission_type]"]',
                type: 'select',
                value: 'fixed',
            },
            // {
            //     selector: '//input[@id="dokan_selling[admin_percentage]"]',
            //     type: 'number',
            //     value: '45',
            // },
            // {
            //     selector: '//input[@id="dokan_selling[additional_fee]"]',
            //     type: 'number',
            //     value: '10',
            // }
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Transaction -> Commission',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-transaction"] >> [data-testid="settings-menu-commission"]',
    fields: [
        // Commission Type - Radio Group
        {
            selector: '[data-testid="settings-field-commission_type"]',
            type: 'radio-capsule',
            value: 'Fixed', // Options: 'fixed', 'category_based'
        },

        // Those fields are working in when we go through --debug mode but in ui mode first fill with our given value but immediately after that it fill with previouly filled value.
        // ToDo
        
        // // Admin Commission Percentage
        // {
        //     selector: '[data-testid="settings-field-admin_commission"] div.relative.flex:has(span:text("%")) input[type="text"]',
        //     type: 'text',
        //     value: '14',
        // },
        
        // // Admin Commission Fixed Fee
        // {
        //     selector: '[data-testid="settings-field-admin_commission"] div.relative.flex:has(span:text("$")) input[type="text"]',
        //     type: 'text',
        //     value: '11',
        // },
    ],
};

test.describe('Admin Setting: Transaction -> Commission', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Commission Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to New Commission Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

