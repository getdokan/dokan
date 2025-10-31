import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';
import { da } from '@faker-js/faker/.';

const oldDataset = [
    {
        title: 'Admin Old Setting: Single Product Multi Vendor',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Single Product Multi Vendor")]',
        fields: [
            {
                selector: '//label[@for="dokan_spmv[enable_pricing]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//input[@id="dokan_spmv[sell_item_btn]"]',
                type: 'text',
                value: 'Sell on behalf',
            },
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Vendor -> single_product_multi_vendor',
    url:'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_vendor >> #dokan_settings_vendor_single_product_multi_vendor',
    fields: [
        {
            selector: '#dokan_settings_vendor_single_product_multi_vendor_single_product_multiple_vendor button',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_vendor_single_product_multi_vendor_single_product_multiple_vendor_sell_item_button_text input',
            type: 'text',
            value: 'Sell on behalf',
        },
    ],
};

test.describe('Admin Setting: Vendor -> single_product_multi_vendor', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Single Product Multi Vendor Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to new Single Product Multi Vendor Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

        await test.step('Check new settings again', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});
