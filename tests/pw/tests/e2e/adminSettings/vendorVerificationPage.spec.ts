import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

// Old UI dataset - Locators updated based on the latest HTML structure
const oldDataset = [
    {
        title: 'Admin Old Setting: Vendor Verification Settings',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Vendor Verification")]',
        fields: [
        ],
    },
];

// New UI dataset - Locators previously fixed and are stable based on new UI HTML
const newDataset = {
    title: 'Admin Setting: Vendor -> Vendor Verification',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-verification"] >> [data-testid="settings-menu-vendor-verification-page"]',
    fields: [
        {
            selector: '[data-testid="settings-field-verified_icon"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'Check Circle (Solid)',
        },
    ],
};

// Playwright Test suite begins here
test.describe('Admin Setting: Vendor -> Vendor Verification', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);

        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Vendor Verification Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

        await test.step('Reload new settings urls', async () => {
            await adminSettingsPage.reloadUrl(newDataset.url);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });

    test('Old to new Vendor Verification Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            // Assuming this method sets the save button selector for the old UI
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            for (const dataset of oldDataset) {
                await test.step('Update ' + dataset.title, async () => {
                    await adminSettingsPage.updateSettings(dataset);
                });
            }
        });

        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await adminSettingsPage.reloadUrl(dataset.url);
            }
        });

        await test.step('Reload new settings urls', async () => {
            await adminSettingsPage.reloadUrl(newDataset.url);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});