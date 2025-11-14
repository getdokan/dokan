import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';
import { da } from '@faker-js/faker/.'; 

// --- Dataset Definitions ---

// Old UI Email Verification Settings
const oldDataset = [
    {
        title: 'Admin Old Setting: Menu Manager',
        url: 'wp-admin/admin.php?page=dokan#/settings', 
        selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Menu Manager")]', 
        fields: [
            {
                selector: '//div[@id="dokan_email_verification"]//label[contains(@class,"switch")]//span[contains(@class,"slider")]',
                type: 'checkbox-switch',
                value: true,
            },
            {
                // Textarea for 'Registration Notice'
                selector: '#dokan_email_verification\\[registration_notice\\]',
                type: 'text',
                value: 'Please verify your email to complete registration.',
            },
            {
                // Textarea for 'Login Notice'
                selector: '#dokan_email_verification\\[login_notice\\]',
                type: 'text',
                value: 'Your email is unverified. Please check your inbox.',
            },
        ],
    },
];

// New UI Email Verification Settings
const newDataset = [
    {
    title: 'Admin Setting: Email Verification',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_appearance >> #dokan_settings_appearance_dashboard-menu-manager-page',
    fields: 
        [
            {
                // Dashboard is the 1st menu item. It appears disabled (cursor-not-allowed opacity-50).
                selector: '.menu-manager-menu-manager-left_menus > div > div > div:nth-child(1) button[role="switch"]',
                type: 'switch',
                value: true,
            },
            {
                // Products is the 2nd menu item.
                selector: '.menu-manager-menu-manager-left_menus > div > div > div:nth-child(2) button[role="switch"]',
                type: 'switch',
                value: true,
            },
            {
                // Delivery Time is the 3rd menu item.
                selector: '.menu-manager-menu-manager-left_menus > div > div > div:nth-child(3) button[role="switch"]',
                type: 'switch',
                value: true,
            },
            {
                // Announcements is the 4th menu item.
                selector: '.menu-manager-menu-manager-left_menus > div > div > div:nth-child(4) button[role="switch"]',
                type: 'switch',
                value: true,
            },
            {
                // Staff is the 5th menu item.
                selector: '.menu-manager-menu-manager-left_menus > div > div > div:nth-child(5) button[role="switch"]',
                type: 'switch',
                value: true,
            },
            {
                // Store Stats is the 6th menu item.
                selector: '.menu-manager-menu-manager-left_menus > div > div > div:nth-child(6) button[role="switch"]',
                type: 'switch',
                value: true,
            },
            {
                // Tools is the 7th menu item.
                selector: '.menu-manager-menu-manager-left_menus > div > div > div:nth-child(7) button[role="switch"]',
                type: 'switch',
                value: true,
            },
            {
                // Reports is the 8th menu item.
                selector: '.menu-manager-menu-manager-left_menus > div > div > div:nth-child(8) button[role="switch"]',
                type: 'switch',
                value: true,
            },
            {
                // Reviews is the 9th menu item.
                selector: '.menu-manager-menu-manager-left_menus > div > div > div:nth-child(9) button[role="switch"]',
                type: 'switch',
                value: true,
            },
            {
                // Coupons is the 10th menu item.
                selector: '.menu-manager-menu-manager-left_menus > div > div > div:nth-child(10) button[role="switch"]',
                type: 'switch',
                value: true,
            },
    ]
},
];

// --- Test Suite ---

test.describe('Admin Setting: Email Verification Settings Synchronization', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);

        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Menu manager Settings synchronization', { tag: ['@lite', '@admin', '@migration', '@email-verification'] }, async () => {
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

    test('Old to New Email Verification Settings synchronization', { tag: ['@lite', '@admin', '@migration', '@email-verification'] }, async () => {
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

        await test.step('Check new settings again', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});