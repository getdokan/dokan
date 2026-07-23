import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

// --- Dataset Definitions ---

// Old UI Email Verification Settings
const oldDataset = [
    {
        title: 'Admin Old Setting: Menu Manager',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Menu Manager")]',
        fields: [
            {
                selector: '.switch-wrapper-placeholder.products label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Orders toggle
                selector: '.switch-wrapper-placeholder.orders label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Request Quotes toggle
                selector: '.switch-wrapper-placeholder.requested-quotes label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Coupons toggle
                selector: '.switch-wrapper-placeholder.coupons label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Reports toggle
                selector: '.switch-wrapper-placeholder.reports label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Delivery Time toggle
                selector: '.switch-wrapper-placeholder.delivery-time-dashboard label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Reviews toggle
                selector: '.switch-wrapper-placeholder.reviews label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Withdraw toggle
                selector: '.switch-wrapper-placeholder.withdraw label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Badge toggle
                selector: '.switch-wrapper-placeholder.seller-badge label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Product Q&A toggle
                selector: '.switch-wrapper-placeholder.product-questions-answers label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Return Requests toggle
                selector: '.switch-wrapper-placeholder.return-request label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Staff toggle
                selector: '.switch-wrapper-placeholder.staffs label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Followers toggle
                selector: '.switch-wrapper-placeholder.followers label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Subscription toggle
                selector: '.switch-wrapper-placeholder.subscription label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Announcements toggle
                selector: '.switch-wrapper-placeholder.announcement label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Admin Support toggle
                selector: '.switch-wrapper-placeholder.vendor-support label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Tools toggle
                selector: '.switch-wrapper-placeholder.tools label.switch',
                type: 'checkbox',
                value: true,
            },
            {
                // Support toggle
                selector: '.switch-wrapper-placeholder.support label.switch',
                type: 'checkbox',
                value: true,
            },
        ],
    },
];

// New UI Email Verification Settings
const newDataset = { 
    title: 'Admin Setting: Email Verification', 
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-appearance"] >> [data-testid="settings-menu-dashboard-menu-manager"]',
    fields: [
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Dashboard',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Products',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Orders',
            type: 'labeled-switch',
            value: true,
        },
         {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Request Quotes',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Coupons',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Reports',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Delivery Time',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Announcement',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Reviews',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Withdraw',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Seller Badge',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Product Q&A',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Return Request',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Staffs',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Followers',
            type: 'labeled-switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'User Subscriptions',
            type: 'labeled-switch',
            value: true,
        },
        {
            // Announcements toggle
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Announcement',
            type: 'labeled-switch',
            value: true,
        },
        {
            // Admin Support toggle
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Vendor Support',
            type: 'labeled-switch',
            value: true,
        },
        {
            // Tools toggle
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Tools',
            type: 'labeled-switch',
            value: true,
        },
        {
            // Support toggle
            selector: '[data-testid="settings-field-menu_manager_left_menus"]',
            label: 'Support',
            type: 'labeled-switch',
            value: true,
        },
    ]
};

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