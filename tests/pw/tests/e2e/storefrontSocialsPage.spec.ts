import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Social API',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"")]',
        fields: [
            // Todo ( Need ID/classes in Social API section(old settings) to make selectors more reliable )
            // According to mahbub bhai we will do this latter with shohag bhai
            // Need to test manually 
        ],
    },
];


const newDataset = {
    title: 'Admin Setting: Vendor -> social_onboarding',
    url:'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_appearance >> #dokan_settings_appearance_storefont_social_onboarding',
    fields: [
        // Main Social Login Toggle
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_social_login button[role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Facebook Section - Enable first, then inputs
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_facebook_api_group_facebook_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_facebook_api_group_facebook_app_id input',
            type: 'text',
            value: 'facebook-app-id-test-12345',
        },
        // {
        //     selector: '#dokan_settings_vendor_social_onboarding_social_onboarding_facebook_api_group_facebook_app_secret input',
        //     type: 'text',
        //     value: 'facebook-app-secret-test-67890',
        // },
        
        // X (Twitter) Section - Enable first, then inputs
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_x_api_group_x_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_x_api_group_x_api_key input',
            type: 'text',
            value: 'x-api-key-test-12345',
        },
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_x_api_group_x_api_secret input',
            type: 'text',
            value: 'x-api-secret-test-67890',
        },
        
        // Google Section - Enable first, then inputs
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_google_api_group_google_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_google_api_group_google_client_id  input',
            type: 'text',
            value: 'google-client-id-test-12345',
        },
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_google_api_group_google_client_secret input',
            type: 'text',
            value: 'google-client-secret-test-67890',
        },
        
        // LinkedIn Section - Enable first, then inputs
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_linkedin_api_group_linkedin_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_linkedin_api_group_linkedin_client_id input',
            type: 'text',
            value: 'linkedin-client-id-test-12345',
        },
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_linkedin_api_group_linkedin_client_secret input',
            type: 'text',
            value: 'linkedin-client-secret-test-67890',
        },
        
        // Apple Section - Enable first, then inputs
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_apple_api_group_apple_enabled button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_apple_api_group_apple_service_id input',
            type: 'text',
            value: 'apple-service-id-test-12345',
        },
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_apple_api_group_apple_team_id input',
            type: 'text',
            value: 'apple-team-id-test-67890',
        },
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_apple_api_group_apple_key_id input',
            type: 'text',
            value: 'apple-key-id-test-11223',
        },
        {
            selector: '#dokan_settings_appearance_storefont_social_onboarding_storefont_social_onboarding_section_apple_api_group_apple_key_content textarea',
            type: 'text',
            value: 'Hello Apple Key Content',
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

    test('New socialOnboarding check', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update new settings', async () => {
            await adminSettingsPage.updateSettings(newDataset);
        });

        await test.step('Reload new settings urls', async () => {
            for ( const dataset of [newDataset] ) {
                await test.step('Reload '+ dataset.title , async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);         
                });
            }
        });

        await test.step('Check new settings' , async () => {
            await test.step( newDataset.title , async () => {
                await adminSettingsPage.checkSettings(newDataset);
            });
        }); 

        // await test.step('Check new settings', async () => {
        //     await adminSettingsPage.checkSettings(newDataset);
        // }); 
    });

    test.skip('Old to new Social Onboarding Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
