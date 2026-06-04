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
               selector: '.show_filters_before_locations_map label.switch',
                type: 'toggle',
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
    selector: '#dokan_settings_general >> #dokan_settings_general_location',
    fields: [
        {
            selector: '#dokan_settings_general_location_map_api_configuration_map_api_source [role="radiogroup"]',
            type: 'radio-group',
            value: 'Google Maps',
        },
        {
            selector: 'input[placeholder="Enter your Google Maps API key"]',
            type: 'text',
            value: 'NEW_GOOGLE_KEY_TEST',
        },
        {
            selector: '#dokan_settings_general_location_map_display_settings_location_map_position [role="radiogroup"]',
            type: 'radio-group',
            value: 'Top',
        },
        {
            selector: '#dokan_settings_general_location_map_display_settings_show_filters_before_map button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_general_location_map_display_settings_radius_search_unit [role="radiogroup"]',
            type: 'radio-group',
            value: 'Miles',
        },
        {
            selector: '#dokan_settings_general_location_map_display_settings_radius_search_min_distance input',
            type: 'number',
            value: '2',
        },
        {
            selector: '#dokan_settings_general_location_map_display_settings_radius_search_max_distance input',
            type: 'number',
            value: '500',
        },
        {
            selector: '#dokan_settings_general_location_map_display_settings_map_zoom_level input',
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
