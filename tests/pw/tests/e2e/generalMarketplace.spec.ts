
import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const newDatasetBackup = {
    title: 'Admin Setting: General -> marketplace',
    old_url: 'admin.php?page=dokan#/settings',
    new_url:'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_general >> #dokan_settings_general_marketplace',
    old_selector: '#dokan_general[custom_store_url]',
    fields: [
        {
            selector: '#dokan_settings_general_marketplace_marketplace_settings_vendor_store_url input',
            old_selector: '#dokan_general[custom_store_url]',
            type: 'text',
            value: 'store-url',
        },
    ],
};
const newDataset = {
    title: 'Admin Setting: General -> marketplace',
    url:'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_general >> #dokan_settings_general_marketplace',
    fields: [
        {
            selector: '#dokan_settings_general_marketplace_marketplace_settings_vendor_store_url input',
            type: 'text',
            value: 'store-url',
        },
    ],
};

test.describe('Admin Setting: General -> marketplace', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    // Test for `General -> Marketplace -> Vendor Store URL` settings synchronization.
    test('General Settings', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await adminSettingsPage.testData(newDataset);
    });
});