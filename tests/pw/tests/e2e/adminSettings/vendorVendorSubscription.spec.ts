import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Vendor Subscription Settings',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Vendor Subscription")]',
        fields: [
            {
                selector: '//select[@id="dokan_product_subscription[subscription_pack]"]',
                type: 'select',
                value: '69' // Privacy Policy (example)
            },
            {
                selector: '//label[@for="dokan_product_subscription[enable_pricing]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true
            },
            {
                selector: '//label[@for="dokan_product_subscription[enable_subscription_pack_in_reg]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: false
            },
            {
                selector: '//input[@id="dokan_product_subscription[no_of_days_before_mail]"]',
                type: 'text',
                value: '14'
            },
            {
                selector: '//select[@id="dokan_product_subscription[product_status_after_end]"]',
                type: 'select',
                value: 'draft'
            }
            // ToDo. Three more fields to test (email subject and body for cancelling and alert) - Need to test manually as iframe is used in old settings
            // Those fields are moved to woocommerce email settings
        ]
    },
];

const newDataset = {
    title: 'Admin Setting: Vendor -> Vendor Subscription',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-vendor"] >> [data-testid="settings-menu-vendor_subscription"]',
    fields: [
        {
            selector: '[data-testid="settings-field-vendor_subscription"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-subscription_view_page"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'Product Subscription',
        },
        {
            selector: '[data-testid="settings-field-subscription_in_registration"] [role="switch"]',
            type: 'switch',
            value: false,
        },
        {
            selector: '[data-testid="settings-field-alert_days_before_expiry"] input[type="number"]',
            type: 'number',
            value: '14',
        },
        {
            selector: '[data-testid="settings-field-products_status_on_expiry"]',
            type: 'radio-capsule',
            value: 'Draft',
        },
    ],
};

test.describe('Admin Setting: Vendor -> vendor_subscription', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Vendor Subscription Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

        await test.step('Reload new settings urls', async () => {
            for ( const dataset of [newDataset] ) {
                await test.step('Reload '+ dataset.title , async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);         
                });
            }
        });
        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        }); 
    });

    test('Old to new Vendor Subscription Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

        // Ekhane Problem ase. Old e akbar reload korar por o new e jeye changed value pai na tai abar old e jeye reload disi
        await test.step('Reload new settings urls', async () => {
            for ( const dataset of [newDataset] ) {
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
