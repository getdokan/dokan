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
                // Bridged through InvertOnOffTransformer: the new UI stores
                // "Add to Cart Button Visibility", so visibility off means the
                // legacy "hide add to cart button" flag is on.
                selector: '//label[@for="dokan_selling[catalog_mode_hide_add_to_cart_button]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
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
    selector: '[data-testid="settings-menu-general"] >> [data-testid="settings-menu-marketplace"]',
    fields: [
        {
            selector: '[data-testid="settings-field-vendor_store_url_slug"] input',
            type: 'text',
            value: 'my-url',
        },
        {
            selector: '[data-testid="settings-field-enable_single_seller_mode"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-store_category_mode"]',
            type: 'radio-capsule',
            value: 'None',
        },
        {
            selector: '[data-testid="settings-field-show_customer_details_to_vendors"] [role="switch"]',
            type: 'switch',
            value: false, // Note: Inverted value compared to old setting
        },
        {
            selector: '[data-testid="settings-field-guest_product_enquiry"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-catalog_mode_add_to_cart_button_visibility"] [role="switch"]',
            type: 'switch',
            value: false,
        },
        {
            selector: '[data-testid="settings-field-live_search_option"]',
            type: 'customize-radio',
            value: 'suggestion_box', // Options: 'Search with Suggestion Box', 'Autoload Replace Current Content'
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
