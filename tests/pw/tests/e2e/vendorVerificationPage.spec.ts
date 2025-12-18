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
           {
                selector: '#document-passport .slider.round',
                type: 'switch',
                value: true
            },
            {
                selector: '#document-national-id .slider.round',
                type: 'switch',
                value: true,
            },
            {
                selector: '#document-driving-license .slider.round',
                type: 'switch',
                value: true,
            },
            {
                selector: '#document-address .slider.round',
                type: 'switch',
                value: true,
            },
              {
                selector: '#document-address .slider.round',
                type: 'switch',
                value: true,
            },
            {
                selector: '#document-company .slider.round',
                type: 'switch',
                value: true,
            },
        ]
    }
];

// New UI dataset - Locators previously fixed and are stable based on new UI HTML
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
            // Targets the switch button inside the row explicitly marked with the 'Passport' class
            selector: 'div.Passport button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            // Targets the switch button inside the row that contains 'National ID' class
            selector: 'div.National.ID button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            // Targets the switch button inside the row that contains 'Driving License' class
            selector: 'div.Driving.License button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            // Targets the switch button inside the row explicitly marked with the 'Company' class
            selector: 'div.Company button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            // Targets the switch button inside the row explicitly marked with the 'Company' class
            selector: 'div.Address button[role="switch"]',
            type: 'switch',
            value: true,
        },
          // Main Social Login Toggle
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_social_login button[role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Facebook Section - Enable first, then inputs
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_facebook_api_group_facebook_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_facebook_api_group_facebook_app_id input',
            type: 'text',
            value: 'facebook-app-id-test-12345',
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_facebook_api_group_facebook_app_secret input',
            type: 'text',
            value: 'facebook-app-secret-test-67890',
        },
        // X (Twitter) Section - Enable first, then inputs
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_x_api_group_x_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_x_api_group_x_api_key input',
            type: 'text',
            value: 'x-api-key-test-12345',
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_x_api_group_x_api_secret input',
            type: 'text',
            value: 'x-api-secret-test-67890',
        },
        
        // Google Section - Enable first, then inputs
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_google_api_group_google_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_google_api_group_google_client_id input',
            type: 'text',
            value: 'google-client-id-test-12345',
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_google_api_group_google_client_secret input',
            type: 'text',
            value: 'google-client-secret-test-67890',
        },
        
        // LinkedIn Section - Enable first, then inputs
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_linkedin_api_group_linkedin_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_linkedin_api_group_linkedin_client_id input',
            type: 'text',
            value: 'linkedin-client-id-test-12345',
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_linkedin_api_group_linkedin_client_secret input',
            type: 'text',
            value: 'linkedin-client-secret-test-67890',
        },
        
        // Apple Section - Enable first, then inputs
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_apple_api_group_apple_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_apple_api_group_apple_service_id input',
            type: 'text',
            value: 'apple-service-id-test-12345',
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_apple_api_group_apple_team_id input',
            type: 'text',
            value: 'apple-team-id-test-67890',
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_apple_api_group_apple_key_id input',
            type: 'text',
            value: 'apple-key-id-test-11223',
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_apple_api_group_apple_key_content textarea',
            type: 'text',
            value: 'Hello Apple Key Content',
        },
        {
            selector: '#dokan_verification_vendor-verification-page_social_onboarding_minimum_social_connections input',
            type: 'number',
            value: '3',
        },
    ]
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