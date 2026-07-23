import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Delivery Time',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Delivery Time")]',
        fields: [
            {
                selector: '//label[@for="dokan_delivery_time[allow_vendor_override_settings]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//label[@for="dokan_delivery_time[selection_required]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//div[contains(text(),"Home Delivery")]/label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//div[contains(text(),"Store Pickup")]/label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: 'input[name="dokan_delivery_time[delivery_date_label]"]',
                type: 'text',
                value: 'Delivery Date Set',
            },
            {
                selector: 'input[name="dokan_delivery_time[preorder_date]"]',
                type: 'number',
                value: '10',
            },
            {
                selector: 'input[name="dokan_delivery_time[time_slot_minutes]"]',
                type: 'number',
                value: '60',
            },
            {
                selector: 'input[name="dokan_delivery_time[order_per_slot]"]',
                type: 'number',
                value: '5',
            },
            // {
            //     selector: 'textarea[name=""]',
            //     type: 'textarea',
            //     value: 'This store needs %DAY% day(s) to process your delivery request',
            // },
            {
                selector: '//input[@id="dokan_delivery_time[delivery_box_info]"]',
                type: 'text',
                value: 'This store needs Y% day(s) to process your delivery request new',
            },
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Shipment -> dashboard-delivery-days-page',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-shipment"] >> [data-testid="settings-menu-dashboard-delivery-days-page"]',
    fields: [
        {
            selector: '[data-testid="settings-field-allow_vendor_override_settings"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-selection_required"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        // { Todo: Fix mapping issue later
        //     selector: 'input#simple-checkbox-group-delivery',
        //     type: 'checkbox',
        //     value: true,
        // },
        // {
        //     selector: 'input#simple-checkbox-group-store-pickup',
        //     type: 'checkbox',
        //     value: true,
        // },
        {
            selector: '[data-testid="settings-field-delivery_date_label"] input',
            type: 'text',
            value: 'Delivery Date Set',
        },
        {
            selector: '[data-testid="settings-field-preorder_date"] input[type="number"]',
            type: 'number',
            value: '10',
        },
        {
            selector: '[data-testid="settings-field-time_slot_minutes"] input[type="number"]',
            type: 'number',
            value: '60',
        },
        {
            selector: '[data-testid="settings-field-order_per_slot"] input[type="number"]',
            type: 'number',
            value: '5',
        },
        {
            selector: '[data-testid="settings-field-delivery_box_info"] textarea',
            type: 'text',
            value: 'This store needs Y% day(s) to process your delivery request new',
        },
        {
            // Todo
            // Delivery time filed will be checked manually.
        },
    ],
};

test.describe('Admin Setting: Shipment -> dashboard-delivery-days-page', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Delivery Time Settings synchronization', { tag: ['@pro', '@admin', '@migration'] }, async () => {
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

    test('Old to new Delivery Time Settings synchronization', { tag: ['@pro', '@admin', '@migration'] }, async () => {
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