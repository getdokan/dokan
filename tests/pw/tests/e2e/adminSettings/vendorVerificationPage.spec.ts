import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

// Both UIs expose the same two things for vendor verification: the verified
// icon and the list of verification methods. The Social Connect credentials
// (app id / secret per provider) only render once a provider panel is expanded
// in the legacy UI, so they are left to dedicated social coverage.
//
// The legacy page identifies a verification method by the method id on its
// checkbox (1..5); the new UI renders each method as a card whose title labels
// the row, so the same method is addressed by label there.
const methods = [
    { id: '1', label: 'Passport' },
    { id: '2', label: 'National ID' },
    { id: '3', label: 'Driving License' },
    { id: '4', label: 'Address' },
    { id: '5', label: 'Company' },
];

const oldDataset = {
    title: 'Admin Old Setting: Vendor Verification',
    url: 'wp-admin/admin.php?page=dokan#/settings',
    selector: '//div[@class="nav-title" and contains(text(),"Vendor Verification")]',
    fields: [
        {
            // The verified icon is a radio group keyed by icon slug. The input
            // itself is visually hidden behind a styled label, so drive the label.
            selector: '//label[@for="dokan_verification[verified_icon][check_circle_solid]"]',
            type: 'radioOld',
            value: 'true',
        },
        ...methods.map(method => ({
            selector: `label.switch:has(input[value="${method.id}"])`,
            type: 'checkbox',
            value: true,
        })),
    ],
};

const newDataset = {
    title: 'Admin Setting: Verification -> Vendor Verification',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-verification"] >> [data-testid="settings-menu-vendor-verification-page"]',
    fields: [
        {
            selector: '[data-testid="settings-field-verified_icon"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'Check Circle (Solid)',
        },
        ...methods.map(method => ({
            // The methods list is a custom renderer, so it carries a section
            // testid rather than a per-field one.
            selector: '[data-testid="settings-section-verification-methods-section"]',
            label: method.label,
            type: 'labeled-switch',
            value: true,
        })),
    ],
};

test.describe('Admin Setting: Verification -> Vendor Verification', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);

        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Vendor Verification Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to New Vendor Verification Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            await adminSettingsPage.updateSettings(oldDataset);
        });

        await test.step('Reload old settings url', async () => {
            await adminSettingsPage.reloadUrl(oldDataset.url);
        });

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});
