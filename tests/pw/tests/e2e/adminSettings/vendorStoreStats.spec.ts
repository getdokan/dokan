import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';

// The legacy vendor-analytics settings only render the "Add Tracking Code"
// switcher once the marketplace is connected to Google Analytics — until then
// the section holds a "Sign in with Google" button and nothing else. The new
// settings UI registers the switch unconditionally, so without a connection
// there is no legacy control to bridge against and both directions time out.
// Seeding a connected state (with cached profiles, so neither UI calls the
// Google API) gives both UIs the same field to synchronize.
const analyticsApiDataOption = 'dokan_vendor_analytics_google_api_data';
const connectedAnalyticsApiData = {
    token: JSON.stringify({
        access_token: 'test_access_token_value',
        refresh_token: 'test_refresh_token_value',
        expires_in: 3600,
        created: 1700000000,
    }),
    profiles: [
        {
            group_label: 'Test Analytics Account',
            group_values: [{ label: 'Test Property', value: 'ga:12345678' }],
        },
    ],
};

const oldDataset = [
    {
        title: 'Admin Old Setting: Store Stats',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Store Stats")]',
        fields: [
            {
                // Legacy "Store Stats" section is the vendor-analytics module's
                // `dokan_vendor_analytics` settings group.
                selector: '//label[@for="dokan_vendor_analytics[add_tracking_code]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Vendor -> store_state',
    url:'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-vendor"] >> [data-testid="settings-menu-store_state"]',
    fields: [
        {
            selector: '[data-testid="settings-field-analytics_add_tracking_code"] [role="switch"]',
            type: 'switch',
            value: true,
        },
    ],
};

test.describe('Admin Setting: Vendor -> store_state (Store Stats)', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeAll(async () => {
        await dbUtils.setOptionValue(analyticsApiDataOption, connectedAnalyticsApiData);
    });

    test.afterAll(async () => {
        await dbUtils.deleteOptionRow([analyticsApiDataOption]);
    });

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Store Stats Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    test('Old to new Store Stats Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
