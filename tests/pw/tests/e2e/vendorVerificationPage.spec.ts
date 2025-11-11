import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

// Old UI dataset
const oldDataset = [
    {
        title: 'Admin Old Setting: Vendor Verification Settings',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//h2[contains(text(),"Vendor Verification Settings")]',
        fields: [
            {
                selector: 'input#dokan_verification\\[verified_icon\\]\\[check_circle_solid\\]',
                type: 'radio',
                value: true,
            },
            {
                selector: '//li//p[contains(text(),"Passport")]/following-sibling::div//input[@type="checkbox"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//li//p[contains(text(),"National ID")]/following-sibling::div//input[@type="checkbox"]',
                type: 'checkbox',
                value: false,
            },
            {
                selector: '//li//p[contains(text(),"Driving License")]/following-sibling::div//input[@type="checkbox"]',
                type: 'checkbox',
                value: true,
            },
        ]
    }
];

// New UI dataset
const newDataset = {
    title: 'Admin Setting: Vendor -> Vendor Verification',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_verification >> #dokan_verification_vendor-verification-page',
    fields: [
        {
            selector: '#verified_icon',
            type: 'dropdown',
            value: 'Icon 1',
        },
{
        selector: 'section:has-text("Verification Methods") div:has-text("Passport") button[role="switch"]',
        type: 'switch',
        value: true,
    },
    {
        selector: 'section:has-text("Verification Methods") div:has-text("National ID") button[role="switch"]',
        type: 'switch',
        value: false,
    },
    {
        selector: 'section:has-text("Verification Methods") div:has-text("Driving License") button[role="switch"]',
        type: 'switch',
        value: true,
    },
    {
        selector: 'section:has-text("Verification Methods") div:has-text("Company") button[role="switch"]',
        type: 'switch',
        value: true,
    },
    {
        selector: 'section:has-text("Verification Methods") div:has-text("Require Social Verification") button[role="switch"]',
        type: 'switch',
        value: false,
    },
    ]
};

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