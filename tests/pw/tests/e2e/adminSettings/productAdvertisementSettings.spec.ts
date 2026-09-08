import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = {
    title: 'Admin Old Setting: general -> Product Advertisement',
    url: 'wp-admin/admin.php?page=dokan#/settings',
    selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Product Advertising")]',
    fields: [
        {
            selector: '#dokan_product_advertisement\\[total_available_slot\\]',
            type: 'number',
            value: '6',
        },
        {
            selector: '#dokan_product_advertisement\\[expire_after_days\\]',
            type: 'number',
            value: '21',
        },
        {
            selector: '//label[@for="dokan_product_advertisement[per_product_enabled]"]//label[@class="switch tips"]',
            type: 'checkbox',
            value: false,
        },
        {
            selector: '//label[@for="dokan_product_advertisement[vendor_subscription_enabled]"]//label[@class="switch tips"]',
            type: 'checkbox',
            value: false,
        },
        {
            selector: '//label[@for="dokan_product_advertisement[featured]"]//label[@class="switch tips"]',
            type: 'checkbox',
            value: true,
        },
        {
            selector: '//label[@for="dokan_product_advertisement[catalog_priority]"]//label[@class="switch tips"]',
            type: 'checkbox',
            value: false,
        },
        {
            selector: '//label[@for="dokan_product_advertisement[hide_out_of_stock_items]"]//label[@class="switch tips"]',
            type: 'checkbox',
            value: true,
        },
    ],
};

const newDataset = {
    title: 'Admin Setting: Product -> Product Advertisement',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-product"] >> [data-testid="settings-menu-product_advertisement"]',
    fields: [
        {
            selector: '[data-testid="settings-field-advertisement_available_slots"] input[type="number"]',
            type: 'number',
            value: '6',
        },
        {
            selector: '[data-testid="settings-field-advertisement_expire_days"] input[type="number"]',
            type: 'number',
            value: '21',
        },
        {
            selector: '[data-testid="settings-field-vendor_can_purchase_advertisement"] [role="switch"]',
            type: 'switch',
            value: false,
        },
        {
            selector: '[data-testid="settings-field-advertisement_in_subscription"] [role="switch"]',
            type: 'switch',
            value: false,
        },
        {
            selector: '[data-testid="settings-field-mark_advertised_as_featured"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-display_advertised_on_top"] [role="switch"]',
            type: 'switch',
            value: false,
        },
        {
            selector: '[data-testid="settings-field-out_of_stock_visibility"] [role="switch"]',
            type: 'switch',
            value: true,
        },
    ],
};

test.describe('Admin Setting: Product -> Product Advertisement', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    // Test for settings synchronization from new to old
    test('New to Old Product Advertisement Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update new settings', async () => {
            await adminSettingsPage.updateSettings(newDataset);
        });
       
        await test.step('Check old settings', async () => {
            await adminSettingsPage.checkSettings(oldDataset);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        }); 
    });

    // Test for settings synchronization from old to new
    test('Old to New Product Advertisement Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            await adminSettingsPage.updateSettings(oldDataset); 
        });

        await test.step('Reload old settings url', async () => {
            await adminSettingsPage.reloadUrl(oldDataset.url);
            await adminSettingsPage.reloadUrl(oldDataset.url);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});
