import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Social API',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Social API")]',
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
    selector: '[data-testid="settings-menu-vendor"] >> [data-testid="settings-menu-vendor_social_onboarding"]',
    fields: [
        // Main Social Login Toggle
        {
            selector: '[data-testid="settings-field-vso_social_login"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Facebook Section - Enable first, then inputs
        {
            selector: '[data-testid="settings-field-vso_facebook_enabled"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-vso_facebook_app_id"] input[type="password"]',
            type: 'text',
            value: 'facebook-app-id-test-12345',
        },
        {
            selector: '[data-testid="settings-field-vso_facebook_app_secret"] input[type="password"]',
            type: 'text',
            value: 'facebook-app-secret-test-67890',
        },
        
        // X (Twitter) Section - Enable first, then inputs
        {
            selector: '[data-testid="settings-field-vso_x_enabled"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-vso_x_api_key"] input[type="password"]',
            type: 'text',
            value: 'x-api-key-test-12345',
        },
        {
            selector: '[data-testid="settings-field-vso_x_api_secret"] input[type="password"]',
            type: 'text',
            value: 'x-api-secret-test-67890',
        },
        
        // Google Section - Enable first, then inputs
        {
            selector: '[data-testid="settings-field-vso_google_enabled"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-vso_google_client_id"] input[type="password"]',
            type: 'text',
            value: 'google-client-id-test-12345',
        },
        {
            selector: '[data-testid="settings-field-vso_google_client_secret"] input[type="password"]',
            type: 'text',
            value: 'google-client-secret-test-67890',
        },
        
        // LinkedIn Section - Enable first, then inputs
        {
            selector: '[data-testid="settings-field-vso_linkedin_enabled"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-vso_linkedin_client_id"] input[type="password"]',
            type: 'text',
            value: 'linkedin-client-id-test-12345',
        },
        {
            selector: '[data-testid="settings-field-vso_linkedin_client_secret"] input[type="password"]',
            type: 'text',
            value: 'linkedin-client-secret-test-67890',
        },
        
        // Apple Section - Enable first, then inputs
        {
            selector: '[data-testid="settings-field-vso_apple_enabled"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-vso_apple_service_id"] input[type="password"]',
            type: 'text',
            value: 'apple-service-id-test-12345',
        },
        {
            selector: '[data-testid="settings-field-vso_apple_team_id"] input[type="password"]',
            type: 'text',
            value: 'apple-team-id-test-67890',
        },
        {
            selector: '[data-testid="settings-field-vso_apple_key_id"] input[type="password"]',
            type: 'text',
            value: 'apple-key-id-test-11223',
        },
        {
            selector: '[data-testid="settings-field-vso_apple_key_content"] textarea',
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
