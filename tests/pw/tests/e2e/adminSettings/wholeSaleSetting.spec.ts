import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldWholesaleDataset = {
    title: 'Admin Old Setting: Wholesale',
    url: 'wp-admin/admin.php?page=dokan#/settings',
    selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Wholesale")]',
    fields: [
        // {
        //     selector: 'input[id="0-all_user-wholesale_price_display"]',
        //     type: 'radioOld',
        //     value: 'all_user',
        // },
        // {
        //     selector: 'input[id="1-wholesale_customer-wholesale_price_display"]',
        //     type: 'radioOld',
        //     value: 'wholesale_customer',
        // },
        {
            selector: 'label[for="dokan_wholesale[display_price_in_shop_archieve]"] .slider',
            type: 'switch',
            value: false,
        },
        {
            selector: 'label[for="dokan_wholesale[need_approval_for_wholesale_customer]"] .slider',
            type: 'switch',
            value: false,
        },
    ],
};

const newWholesaleDataset = {
    title: 'Admin Setting: Wholesale',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_product >> #dokan_settings_product_wholesale',
    fields: [
        {
            selector: '#dokan_settings_product_wholesale_display_wholesale_pricing_to button[name="all_user"]',
            type: 'radio',
            value: 'true',
        },
        {
            selector: '#dokan_settings_product_wholesale_display_wholesale_pricing_to button[name="wholesale_customer"]',
            type: 'radio',
            value: 'false',
        },
        {
            selector: '#dokan_settings_product_wholesale_wholesale_price_on_shop_archive button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_product_wholesale_need_approval_for_customer button[role="switch"]',
            type: 'switch',
            value: true,
        },
    ],
};

test.describe('Admin Setting: Wholesale', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    // New to Old wholesale settings synchronization
    test('New to Old Wholesale Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update new settings', async () => {
            await adminSettingsPage.updateSettings(newWholesaleDataset);
        });

        await test.step('Check old settings', async () => {
            await adminSettingsPage.checkSettings(oldWholesaleDataset);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newWholesaleDataset);
        });
    });

    // Old to New wholesale settings synchronization
    test('Old to New Wholesale Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            await adminSettingsPage.updateSettings(oldWholesaleDataset);
        });

        await test.step('Reload old settings url', async () => {
            await adminSettingsPage.reloadUrl(oldWholesaleDataset.url);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newWholesaleDataset);
        });
    });
});