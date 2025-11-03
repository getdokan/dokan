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
            selector: '#dokan_pages\\[dashboard\\]',
            type: 'dropdown',
            value: 'Dashboard',
        },
        {
            selector: '#dokan_pages\\[my_orders\\]',
            type: 'dropdown',
            value: 'My Orders',
        },
        {
            selector: '#dokan_pages\\[store_listing\\]',
            type: 'dropdown',
            value: 'Store List',
        },
        {
            selector: '#dokan_pages\\[reg_tc_page\\]',
            type: 'dropdown',
            value: 'Terms And Conditions',
        },
    ],
};

const newDataset = {
    title: 'Admin Setting: General -> Page Setup',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_general >> #dokan_settings_general_dokan_pages',
    fields: [
        {
            selector: '#dokan_settings_general_dokan_pages_dashboard_section_dashboard button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'Dashboard',
        },
        {
            selector: '#dokan_settings_general_dokan_pages_my_orders_section_my_orders button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'My Orders',
        },
        {
            selector: '#dokan_settings_general_dokan_pages_store_listing_section_store_listing button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'Store List',
        },
        {
            selector: '#dokan_settings_general_dokan_pages_reg_tc_page_section_reg_tc_page button[role="combobox"]',
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