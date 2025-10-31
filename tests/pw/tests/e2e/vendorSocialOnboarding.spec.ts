import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';
import { da } from '@faker-js/faker/.';

const oldDataset = [
    {
        title: 'Admin Old Setting: Social Onboarding',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Social Login")]',
        fields: [
            {
                selector: '//label[@for="dokan_social_api[enabled]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//input[@id="dokan_social_api[fb_app_id]"]',
                type: 'text',
                value: 'fb-app-id',
            },
            {
                selector: '//input[@id="dokan_social_api[google_app_id]"]',
                type: 'text',
                value: 'google-client-id',
            },
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Vendor -> social_onboarding',
    url:'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_vendor >> #dokan_settings_vendor_social_onboarding',
    fields: [
        {
            selector: '#dokan_settings_vendor_social_onboarding_social_onboarding_social_login button',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_vendor_social_onboarding_social_onboarding_facebook_api_group_facebook_app_id input',
            type: 'text',
            value: 'fb-app-id',
        },
        {
            selector: '#dokan_settings_vendor_social_onboarding_social_onboarding_google_api_group_google_client_id input',
            type: 'text',
            value: 'google-client-id',
        },
    ],
};

test.describe('Admin Setting: Vendor -> social_onboarding', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Social Onboarding Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update new settings', async () => {
            await adminSettingsPage.updateSettings(newDataset);
        });
       
        await test.step('Check old settings' , async () => {
            for (const dataset of oldDataset) {
                await test.step( dataset.title , async () => {
                    await adminSettingsPage.checkSettings(dataset);
                });
            }
        }); 

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        }); 
    });

    test('Old to new Social Onboarding Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            for (const dataset of oldDataset) {
                await test.step('Update '+ dataset.title , async () => {
                    await adminSettingsPage.updateSettings(dataset);
                });
            }
        });

        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload '+ dataset.title , async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });

        await test.step('Check new settings again', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});
