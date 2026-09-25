import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = {
    title: 'Admin Old Setting: General -> Page Setup',
    url: 'wp-admin/admin.php?page=dokan#/settings',
    selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Page Settings")]',
    fields: [
        {
            selector: '//select[@id="dokan_pages[dashboard]"]',
            type: 'select',
            value: 'Dashboard',
        },
        {
            selector: '//select[@id="dokan_pages[my_orders]"]',
            type: 'select',
            value: 'My Orders',
        },
        {
            selector: '//select[@id="dokan_pages[store_listing]"]',
            type: 'select',
            value: 'Store List',
        },
        {
            selector: '//select[@id="dokan_pages[reg_tc_page]"]',
            type: 'select',
            value: 'Terms And Conditions',
        },
    ],
};

const newDataset = {
    title: 'Admin Setting: General -> Page Setup',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-general"] >> [data-testid="settings-menu-dokan_pages"]',
    fields: [
        {
            selector: '[data-testid="settings-field-vendor_dashboard_page"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'Dashboard',
        },
        {
            selector: '[data-testid="settings-field-my_orders_page"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'My Orders',
        },
        {
            selector: '[data-testid="settings-field-store_listing_page"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'Store List',
        },
        {
            selector: '[data-testid="settings-field-reg_tc_page"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'Terms And Conditions',
        },
    ],
};

test.describe('Admin Setting: General -> Page Setup', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    // Test for settings synchronization from new to old
    test('New to Old Page Setup Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
    test('Old to New Page Setup Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
