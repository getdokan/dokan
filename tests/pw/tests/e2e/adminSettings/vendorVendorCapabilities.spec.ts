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
                selector: '//label[@for="0-sell_physical-global_digital_mode"]',
                type: 'radioOld',
                value: 'true',
            },
        ],
    },
    {
        "title": "Admin Old Setting: Selling Options (12 Mapped Fields)",
        "url": "wp-admin/admin.php?page=dokan#/settings",
        "selector": '//div[@class="nav-title" and contains(text(),"Selling Options")]',
        "fields": [
            {
                "selector": '//select[@id="dokan_selling[new_seller_enable_selling]"]',
                "type": "select",
                "value": "automatically"
            },
            {
                "selector": '//label[@for="dokan_selling[allow_vendor_create_manual_order]"]//label[@class="switch tips"]',
                "type": "checkbox",
                "value": true
            },
            {
                "selector": '//label[@for="dokan_selling[one_step_product_create]"]//label[@class="switch tips"]',
                "type": "checkbox",
                "value": false
            },
            {
                "selector": '//label[@for="dokan_selling[disable_product_popup]"]//label[@class="switch tips"]',
                "type": "checkbox",
                "value": true
            },
            {
                "selector": '//label[@for="dokan_selling[order_status_change]"]//label[@class="switch tips"]',
                "type": "checkbox",
                "value": true
            },
            {
                "selector": '//label[@for="dokan_selling[dokan_any_category_selection]"]//label[@class="switch tips"]',
                "type": "checkbox",
                "value": true
            },
            {
                "selector": '//label[@for="dokan_selling[vendor_duplicate_product]"]//label[@class="switch tips"]',
                "type": "checkbox",
                "value": true
            },
            {
                "selector": '//label[@for="0-single-product_category_style"]',
                "type": "radioOld",
                "value": "true"
            },
            {
                "selector": '//label[@for="dokan_selling[product_vendors_can_create_tags]"]//label[@class="switch tips"]',
                "type": "checkbox",
                "value": true
            },
            {
                "selector": '//label[@for="dokan_selling[add_new_attribute]"]//label[@class="switch tips"]',
                "type": "checkbox",
                "value": true
            },
            {
                "selector": '//label[@for="dokan_selling[seller_review_manage]"]//label[@class="switch tips"]',
                "type": "checkbox",
                "value": true
            },
            {
                "selector": '//label[@for="0-publish-product_status"]',
                "type": "radioOld",
                "value": "true"
            }
        ]
    }
];

const newDataset = {
    title: 'Admin Setting: Vendor -> vendor_capabilities',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '#dokan_settings_vendor >> #dokan_settings_vendor_vendor_capabilities',
    fields: [
        // Selling Product Types - Radio Group
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_global_digital_mode button[name="sell_physical"]',
            type: 'radio',
            value: 'true', // Options: 'sell_physical', 'sell_digital', 'sell_both'
        },
        
        // Product Status - Radio Group
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_product_status button[name="publish"]',
            type: 'radio',
            value: 'true', // Options: 'publish', 'pending'
        },
        
        // Duplicate Product - Switch
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_duplicate_product button[role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Allow vendors to create orders - Switch
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_allow_vendor_create_manual_order button[role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // One Page Product Creation - Switch
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_one_page_creation button[role="switch"]',
            type: 'switch',
            value: false, // should be false for Product Popup to be visible
        },
        
        // Product Popup - Switch
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_vendor_new_product_popup button[role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Order Status Change - Switch
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_vendor_can_change_order_status button[role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Select any category - Switch
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_select_any_category button[role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Product Category Selection - Radio Group
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_category_selection button[name="single"]',
            type: 'radio',
            value: 'true', // Options: 'single', 'multiple'
        },
        
        // Vendors Can Create Tags - Switch
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_vendors_create_tags button[role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Add New Attribute Values - Switch
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_add_new_attribute_values button[role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Product Review Management by Vendors - Switch
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_product_review_management button[role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Discount Editing - Switch
        {
            selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_discount_order_settings button[role="switch"]',
            type: 'switch',
            value: true,
        },
        
        // Order Discount - Checkbox (becomes visible when Discount Editing is enabled)
        // {
        //     selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_discount_settings input[value="order-discount"]',
        //     type: 'checkbox',
        //     value: true,
        // },
        
        // // Product Quantity Discount - Checkbox (becomes visible when Discount Editing is enabled)
        // {
        //     selector: '#dokan_settings_vendor_vendor_capabilities_vendor_capabilities_discount_settings input[value="product-discount"]',
        //     type: 'checkbox',
        //     value: true,
        // },
    ],
};

test.describe('Admin Setting: Vendor -> vendor_capabilities', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Vendor Capabilities Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update new settings', async () => {
            await adminSettingsPage.updateSettings(newDataset);
        });
       
        // await test.step('Check old settings' , async () => {
        //     for (const dataset of oldDataset) {
        //         await test.step( dataset.title , async () => {
        //             await adminSettingsPage.checkSettings(dataset);
        //         });
        //     }
        // }); 
        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload '+ dataset.title , async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
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

    test('Old to new Vendor Capabilities Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
