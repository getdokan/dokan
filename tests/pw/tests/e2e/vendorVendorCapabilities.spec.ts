import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';
import { da } from '@faker-js/faker/.';

const oldDataset = [
    {
        title: 'Admin Old Setting: Vendor Capabilities',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Vendor Capabilities")]',
        fields: [
            {
                selector: '//label[@for="dokan_selling[product_status]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//label[@for="dokan_selling[one_step_product_create]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//label[@for="dokan_selling[disable_product_popup]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: false,
            },
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Vendor -> vendor_capabilities',
    url:'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_vendor >> #dokan_settings_vendor_vendor_capabilities',
    fields: [
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_product_status button',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_one_page_creation button',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_product_popup button',
            type: 'switch',
            value: false,
        },
    ],
};

test.describe('Admin Setting: Vendor -> vendor_capabilities', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Vendor Capabilities Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to new Vendor Capabilities Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
