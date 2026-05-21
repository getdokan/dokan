import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: General',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"General")]',
        fields: [
            {
                selector: '//input[@id="dokan_general[custom_store_url]"]',
                type: 'text',
                value: 'my-url',
            },
            {
                selector: '//label[@for="dokan_general[enable_single_seller_mode]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//label[@for="0-none-store_category_type"]',
                type: 'radioOld',
                value: 'true',
            },
        ],
    },
    {
        title: 'Admin Old Setting: Selling Options',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Selling Options")]',
        fields: [
            {
                selector: '//label[@for="dokan_selling[hide_customer_info]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },  
            {
                selector: '//label[@for="dokan_selling[enable_guest_user_enquiry]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//label[@for="dokan_selling[catalog_mode_hide_add_to_cart_button]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: false,
            },
        ],
    },
    {
        title: 'Admin Old Setting: Live Search',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Live Search")]',
        fields: [
            {
                selector: '//select[@id="dokan_live_search_setting[live_search_option]"]',
                type: 'select',
                value: 'suggestion_box', // Options: 'suggestion_box', 'old_live_search'
            },
        ]
    }
];

const newDataset = {
    title: 'Admin Setting: General -> marketplace',
    url:'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_general >> #dokan_settings_general_marketplace',
    fields: [
        {
            selector: '#dokan_settings_general_marketplace_marketplace_settings_vendor_store_url_slug input',
            type: 'text',
            value: 'my-url',
        },
        {
            selector: '#dokan_settings_general_marketplace_marketplace_settings_enable_single_seller_mode button',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_general_marketplace_marketplace_settings_store_category_mode button[name="none"]',
            type: 'radio',
            value: 'true',
        },
        {
            selector: '#dokan_settings_general_marketplace_marketplace_settings_show_customer_details_to_vendors button[role="switch"]',
            type: 'switch',
            value: false, // Note: Inverted value compared to old setting
        },
        {
            selector: '#dokan_settings_general_marketplace_marketplace_settings_guest_product_enquiry button[role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '#dokan_settings_general_marketplace_marketplace_settings_add_to_cart_button_visibility button[role="switch"]',
            type: 'switch',
            value: false,
        },
        {
            selector: '#dokan_settings_general_marketplace_live_search_search_box_radio div[role="radio"][aria-label="Search with Suggestion Box"]',
            type: 'radio',
            value: 'true', // Options: 'Search with Suggestion Box', 'Autoload Replace Current Content'
        },
    ],
};

test.describe('Admin Setting: General -> marketplace', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    // Test for `General -> Marketplace -> Vendor Store URL` settings synchronization.
    test('New to Old General Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

    // Test for `General -> Marketplace -> Vendor Store URL` settings synchronization.
    test('Old to new General Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
