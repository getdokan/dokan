import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';
const oldDataset = [
    {
        title: 'Admin Old Setting: General',
        url: 'wp-admin/admin.php?page=dokan#/settings',
         selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Appearance")]',
        fields: [
              {
                selector: '//label[@for="0-google_maps-map_api_source"]',
                type: 'radioOld',
                value: 'true',
            },
            {
                selector: '#dokan_appearance\\[gmap_api_key\\]',
                type: 'input',
                value: 'NEW_GOOGLE_KEY_TEST',
            },

        ],
    },
    {
        title: 'Admin Old Setting: Selling Options',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"General")] >> //div[@class="nav-title" and contains(text(),"Geolocation")]',
        fields: [
               {
                selector: '.show_locations_map label[for="0-top-show_locations_map"]',
                type: 'old-radio',
                value: 'top',
                },
                {
               selector: '.show_filters_before_locations_map',
                type: 'checkbox',
                value: true,
                },
                {
                selector: 'div.field_contents:has(h3:has-text("Radius Search - Unit")) label:has(input[value="miles"])',
                type: 'old-radio',
                value: 'Miles',
                },
                {
                selector: '#dokan_geolocation\\[distance_min\\]',
                type: 'number',
                value: '2',
                },
                {
                selector: '#dokan_geolocation\\[distance_max\\]',
                type: 'input',
                value: '500',
                },
        ],
    }
];

const newDataset = {
    title: 'Admin Setting: General -> Location Settings',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-general"] >> [data-testid="settings-menu-location"]',
    fields: [
        {
            selector: '[data-testid="settings-field-map_api_source"]',
            type: 'radio-capsule',
            value: 'Google Maps',
        },
        {
            selector: 'input[placeholder="Enter your Google Maps API key"]',
            type: 'text',
            value: 'NEW_GOOGLE_KEY_TEST',
        },
        {
            selector: '[data-testid="settings-field-location_map_position"]',
            type: 'radio-capsule',
            value: 'Top',
        },
        {
            selector: '[data-testid="settings-field-show_filters_before_map"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-radius_search_unit"]',
            type: 'radio-capsule',
            value: 'Miles',
        },
        {
            selector: '[data-testid="settings-field-radius_search_min_distance"] input[type="number"]',
            type: 'number',
            value: '2',
        },
        {
            selector: '[data-testid="settings-field-radius_search_max_distance"] input[type="number"]',
            type: 'number',
            value: '500',
        },
        {
            selector: '[data-testid="settings-field-map_zoom_level"] input[type="number"]',
            type: 'number',
            value: '14',
        },
    ],
};

test.describe('Admin Setting: General -> Location Settings', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);

        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Location Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {

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
          await test.step('Update old settings' , async () => {
            for (const dataset of oldDataset) {
              await test.step( dataset.title , async () => {
                    await adminSettingsPage.updateSettings(dataset);
                });
             }
        });
        await test.step('Check new settings again', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});
