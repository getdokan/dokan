import { test } from '@playwright/test';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import path from 'path';

// Reuse the admin session captured by the auth_setup project instead of
// logging in through the UI before every test.
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

const oldDataset = {
    title: 'Admin Old Setting: AI Assist',
    url: 'wp-admin/admin.php?page=dokan#/settings',
    selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"AI Assist")]',
    fields: [
        {
            selector: '//select[@id="dokan_ai[dokan_ai_engine]"]',
            type: 'select',
            value: 'openai',
        },
        {
            selector: '//input[@id="dokan_ai[dokan_ai_openai_api_key]"]',
            type: 'text',
            value: 'your-openai-api-key',
        },
    ],
};

// New-UI selectors use the stable test contract exposed by the refactored
// settings app: each field wrapper carries `data-testid="settings-field-<id>"`
// and nav items `data-testid="settings-menu-<id>"`. The control inside is a
// Base UI element (`button[role="combobox"]`, `[role="switch"]`,
// `input[type="password"]`). Verified against the live DOM at
// page=dokan-dashboard. NOTE: the text engine is set to OpenAI so the OpenAI
// API key/model fields it fills stay visible (engine selection gates which
// provider group renders) and to mirror the legacy `oldDataset` (OpenAI).
// The AI Product Info Generator section is header-only — it has no enable
// toggle, matching the legacy `dokan_ai_product_info` sub_section.
const newDataset = {
    title: 'Admin Setting: AI Assist',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-ai_assist"] >> [data-testid="settings-menu-product_generation"]',
    fields: [
        {
            selector: '[data-testid="settings-field-ai_product_info_engine"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'OpenAI',
        },
        {
            selector: '[data-testid="settings-field-text_openai_api_key"] input[type="password"]',
            type: 'text',
            value: 'your-openai-api-key',
        },
        {
            selector: '[data-testid="settings-field-text_openai_model"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'OpenAI GPT-4o Mini',
        },
        {
            selector: '[data-testid="settings-field-ai_product_image_enhancement"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-ai_product_image_engine"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'Gemini',
        },
        {
            selector: '[data-testid="settings-field-image_gemini_api_key"] input[type="password"]',
            type: 'text',
            value: 'your-gemini-api-key',
        },
        {
            selector: '[data-testid="settings-field-image_gemini_model"] button[role="combobox"]',
            type: 'radix-dropdown',
            value: 'Gemini 2.5 Flash Image (aka Nano Banana)',
        },
    ],
};

test.describe('Admin Setting: AI Assist', () => {
    test.use({ storageState: a1 });

    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        adminSettingsPage = new AdminSettingsPage(page);
    });
    test('New to Old AI Assist Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    // 🌟 Added tags for better filtering, matching the structure of your second file
    test('Old to New AI Assist Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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