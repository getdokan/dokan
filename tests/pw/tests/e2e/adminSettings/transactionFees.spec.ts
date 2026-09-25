import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Selling Options',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Selling Options")]',
        fields: [
            {
                selector: '//label[@for="0-seller-shipping_fee_recipient"]',
                type: 'radioOld',
                value: 'true',
            },
            {
                selector: '//label[@for="0-seller-tax_fee_recipient"]',
                type: 'radioOld',
                value: 'true',
            },
            {
                selector: '//label[@for="0-seller-shipping_tax_fee_recipient"]',
                type: 'radioOld',
                value: 'true',
            },
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Transaction -> Fees',
    url:'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-transaction"] >> [data-testid="settings-menu-fees"]',
    fields: [
        {
            selector: '[data-testid="settings-field-shipping_fee_recipient"]',
            type: 'radio-capsule',
            value: 'Vendor',
        },
        {
            selector: '[data-testid="settings-field-product_tax_fee_recipient"]',
            type: 'radio-capsule',
            value: 'Vendor',
        },
        {
            selector: '[data-testid="settings-field-shipping_tax_fee_recipient"]',
            type: 'radio-capsule',
            value: 'Vendor',
        },
    ],
};

test.describe('Admin Setting: Transaction -> Fees', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    // Test for `Transaction -> Fees` settings synchronization.
    test('New to Old Transaction Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update new settings', async () => {
            await adminSettingsPage.updateSettings(newDataset);
        });
       
        await test.step('Check old settings' , async () => {
            for (const dataset of oldDataset) {
                await test.step( dataset.title , async () => {
                    await adminSettingsPage.checkSettings(dataset);
                });
            }
        }); 

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        }); 
    });

    // Test for `Transaction -> Fees ` settings synchronization.
    test('Old to new Transaction Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            for (const dataset of oldDataset) {
                await test.step('Update '+ dataset.title , async () => {
                    await adminSettingsPage.updateSettings(dataset);
                });
            }
        });

        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload '+ dataset.title , async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });

        // Need to reload again
        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload '+ dataset.title , async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });

        await test.step('Check new settings again', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});
