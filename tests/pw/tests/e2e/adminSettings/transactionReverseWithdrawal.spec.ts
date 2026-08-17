import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Reverse Withdrawal',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Reverse Withdrawal")]',
        fields: [
            // Enable Reverse Withdrawal
            // {
            //     selector: '//label[@for="dokan_reverse_withdrawal[enabled]"]//label[@class="switch tips"]',
            //     type: 'checkbox',
            //     value: true,
            // },
            
            // // Enable Reverse Withdrawal for Gateway - Cash on delivery
            // ToDo: Those fields will be vary based on enabled payment gateways in the site.
            // {
            //     selector: '//div[@class="payment_gateways dokan-settings-field-type-multicheck"]//input[@value="cod"]',
            //     type: 'checkbox',
            //     value: true,
            // },
            
            // Billing Type
            {
                selector: '//select[@id="dokan_reverse_withdrawal[billing_type]"]',
                type: 'select',
                value: 'by_amount'
            },
            
            // Reverse Balance Threshold
            {
                selector: '//input[@id="dokan_reverse_withdrawal[reverse_balance_threshold]"]',
                type: 'number',
                value: '150'
            },
            
            // Grace Period
            {
                selector: '//input[@id="dokan_reverse_withdrawal[due_period]"]',
                type: 'number',
                value: '7'
            },
            
            // // After Grace Period - Disable Add to Cart Button
            // {
            //     selector: '//div[@class="failed_actions dokan-settings-field-type-multicheck"]//input[@value="enable_catalog_mode"]',
            //     type: 'checkbox',
            //     value: true
            // },
            
            // // After Grace Period - Hide Withdraw Menu
            // {
            //     selector: '//div[@class="failed_actions dokan-settings-field-type-multicheck"]//input[@value="hide_withdraw_menu"]',
            //     type: 'checkbox',
            //     value: false
            // },
            
            // // After Grace Period - Make Vendor Status Inactive
            // {
            //     selector: '//div[@class="failed_actions dokan-settings-field-type-multicheck"]//input[@value="status_inactive"]',
            //     type: 'checkbox',
            //     value: false
            // },
            
            // Display Notice During Grace Period
            {
                selector: '//label[@for="dokan_reverse_withdrawal[display_notice]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            
            // Send Announcement
            {
                selector: '//label[@for="dokan_reverse_withdrawal[send_announcement]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: false
            }
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Transaction -> Reverse Withdrawal',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-transaction"] >> [data-testid="settings-menu-reverse_withdrawal"]',
    fields: [
        // Activate Reverse Withdrawal (Cash On Delivery) - Switch
        // Those fields will be vary based on enabled payment gateways in the site.
        // {
        //     selector: '[data-testid="settings-field-reverse_withdrawal_enabled"] button[role="switch"]',
        //     type: 'switch',
        //     value: true,
        // },
        
        // Billing Type - Radio Group
        {
            selector: '[data-testid="settings-field-reverse_withdrawal_billing_type"]',
            type: 'radio-capsule',
            value: 'By Amount Limit', // Options: 'by_amount', 'by_month'
        },
        
        // Reverse Balance Threshold (USD)
        {
            selector: '[data-testid="settings-field-reverse_withdrawal_balance_threshold"] input[type="number"]',
            type: 'number',
            value: '150',
        },
        
        // Grace Period (Days)
        {
            selector: '[data-testid="settings-field-reverse_withdrawal_due_period"] input[type="number"]',
            type: 'number',
            value: '7',
        },
        
        // // Penalty Actions After Grace Period - Add to Cart Button Visibility
        // {
        //     selector: '#simple-checkbox-group-enable_catalog_mode',
        //     type: 'checkbox',
        //     value: true,
        // },
        
        // // Penalty Actions After Grace Period - Withdraw Menu
        // {
        //     selector: '#simple-checkbox-group-hide_withdraw_menu',
        //     type: 'checkbox',
        //     value: false,
        // },
        
        // // Penalty Actions After Grace Period - Make Vendor Status Inactive
        // {
        //     selector: '#simple-checkbox-group-status_inactive',
        //     type: 'checkbox',
        //     value: false,
        // },
        
        // Display Notice During Grace Period - Switch
        {
            selector: '[data-testid="settings-field-reverse_withdrawal_grace_period_notice"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Send Announcement - Switch
        {
            selector: '[data-testid="settings-field-send_announcement"] [role="switch"]',
            type: 'switch',
            value: false,
        },
    ],
};

test.describe('Admin Setting: Transaction -> Reverse Withdrawal', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Reverse Withdrawal Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to New Reverse Withdrawal Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
        // Need to reload again
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