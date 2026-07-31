import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

// --- Dataset Definitions ---

// Old UI Email Verification Settings
const oldDataset = [
    {
        title: 'Admin Old Setting: Email Verification',
        url: 'wp-admin/admin.php?page=dokan#/settings', 
        selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Email Verification")]', 
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
const newDataset = {
    title: 'Admin Setting: Email Verification',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-verification"] >> [data-testid="settings-menu-email-verification-page"]',
    fields: [
        {
            selector: '[data-testid="settings-field-email_verification_enabled"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            // Textarea for 'Registration Notice'
            selector: '[data-testid="settings-field-registration_notice"] textarea',
            type: 'text',
            value: 'Please verify your email to complete registration.',
        },
        {
            // Textarea for 'Login Notice'
            selector: '[data-testid="settings-field-login_notice"] textarea',
            type: 'text',
            value: 'Your email is unverified. Please check your inbox.',
        },
    ],
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

    test('New to Old Email Verification Settings synchronization', { tag: ['@lite', '@admin', '@migration', '@email-verification'] }, async () => {
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