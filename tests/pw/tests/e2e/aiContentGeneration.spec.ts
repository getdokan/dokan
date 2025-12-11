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
            type: 'dropdown',
            value: 'gemini',
        },
        {
            selector: '//input[@id="dokan_ai[dokan_ai_gemini_api_key]"]',
            type: 'text',
            value: 'your-openai-api-key',
        },
        {
            selector: '//h3[contains(text(),"Model")]/ancestor::div[contains(@class,"dokan_ai_image_gemini_model")]//select',
            type: 'select',
            value: 'gemini-2.5-flash-image-preview',
        },
    ],
};

const newDataset = {
    title: 'Admin Setting: AI Assist',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_ai_assist >> #dokan_settings_ai_assist_product_generation',
    fields: [
        {
            selector: '#dokan_settings_ai_assist_product_generation_product_image_section_product_info_generate button[role="switch"]',
            type: 'switch',
            value: 'on', 
        },
        {
            selector: '#dokan_settings_ai_assist_product_generation_product_image_section_product_info_engine',
            type: 'select',
            value: 'Gemini', 
        },
        {
            selector: '#dokan_settings_ai_assist_product_generation_product_image_section_chatgpt_api_info_group_openai_api_key input[type="password"]',
            type: 'text',
            value: 'your-openai-api-key',
        },
        {
            selector: '#openai_model',
            type: 'dropdown',
            value: 'ChatGPT 4o Mini',
        },
        {
            selector: '#dokan_settings_ai_assist_product_generation_product_description_section_product_image_enhancement button[role="switch"]',
            type: 'switch',
            value: 'on', 
        },
        {
            selector: '#product_image_engine',
            type: 'dropdown',
            value: 'DALL-E', 
        },
        {
            selector: '#dokan_settings_ai_assist_product_generation_product_description_section_leonardo_api_info_group_leonardo_api_key input[type="password"]',
            type: 'text',
            value: 'your-leonardo-api-key',
        },
        {
            selector: '#leonardo_model',
            type: 'dropdown',
            value: 'Leonardo Diffusion XL',
        },
    ],
};

test.describe('Admin Setting: AI Assist', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);

        // Login as admin
        await loginPage.adminLogin(data.admin);
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