import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

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
            value: 'test-openai-api-key-123',
        },
        {
            selector: '//select[@id="dokan_ai[dokan_ai_openai_model]"]',
            type: 'select',
            value: 'gpt-3.5-turbo',
        },
    ],
};

const newDataset = {
    title: 'Admin Setting: AI Assist',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_ai_assist >> #dokan_settings_ai_assist_product_generation',
    fields: [
        {
            selector: '#dokan_settings_ai_assist_product_generation_product_image_section_product_info_engine',
            type: 'select',
            value: 'OpenAI',
        },
        {
            selector: '#dokan_settings_ai_assist_product_generation_product_image_section_openai_api_info_group_openai_api_key input[type="password"]',
            type: 'text',
            value: 'test-openai-api-key-123',
        },
        {
            selector: '#openai_model',
            type: 'select',
            value: 'GPT-3.5 Turbo',
        },
    ],
};

test.describe('Admin Setting: AI Assist', { tag: ['@pro'] }, () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);

        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old AI Assist Settings synchronization', async () => {
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

    test('Old to New AI Assist Settings synchronization', async () => {
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
