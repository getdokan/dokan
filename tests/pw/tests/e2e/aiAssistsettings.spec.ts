import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = {
    title: 'Admin Old Setting: AI Assist',
    url: 'wp-admin/admin.php?page=dokan#/settings',
    selector: '//h2[contains(text(),"AI Assist Settings")]/ancestor::div[contains(@class,"metabox-holder")]',
    fields: [
        {
            selector: '//h3[contains(text(),"AI Product Info Generator")]/ancestor::div[contains(@class,"dokan_ai_product_info")]//input[@type="text"]',
            type: 'text',
            value: 'Enabled',
        },
        {
            selector: '//h3[contains(text(),"Engine")]/ancestor::div[contains(@class,"dokan_ai_engine")]//select',
            type: 'select',
            value: 'openai',
        },
        {
            selector: '//h3[contains(text(),"AI Product Image Enhance")]/ancestor::div[contains(@class,"dokan_ai_image_gen")]//input[@type="checkbox"]',
            type: 'switch',
            value: 'on',
        },
        {
            selector: '//h3[contains(text(),"Engine")]/ancestor::div[contains(@class,"dokan_ai_image_engine")]//select',
            type: 'select',
            value: 'bria-ai',
        },
        {
            selector: '//h3[contains(text(),"Gemini API Key")]/ancestor::div[contains(@class,"dokan_ai_image_gemini_api_key")]//input[@type="text"]',
            type: 'text',
            value: 'test-gemini-api-key-123',
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
    selector: '#dokan_settings_ai_assist',
    fields: [
        {
            selector: '#dokan_settings_ai_assist_product_generation_product_image_section_product_info_generate button[role="switch"]',
            type: 'switch',
            value: 'on',
        },
        {
            selector: '#product_info_engine',
            type: 'select',
            value: 'Gemini',
        },
        {
            selector: '#:r1s5:',
            type: 'text',
            value: 'test-openai-api-key-123',
        },
        {
            selector: '#dokan_settings_ai_assist_product_generation_product_image_section_product_info_model',
            type: 'select',
            value: 'ChatGPT 4o Mini',
        },
        {
            selector: '#toggle-:r1s7:',
            type: 'switch',
            value: 'on',
        },
        {
            selector: '#product_image_engine',
            type: 'select',
            value: 'Leonardo AI',
        },
        {
            selector: '#:r1s9:',
            type: 'text',
            value: 'test-leonardo-api-key-456',
        },
        {
            selector: '#leonardo_model',
            type: 'select',
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
