import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';

const oldDataset = [
    {
        title: 'Admin Old Setting: Single Product Multi Vendor',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Single Product MultiVendor")]',
        fields: [
            {
                selector: '//label[@for="dokan_spmv[enable_pricing]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true
            },
            {
                selector: '//input[@id="dokan_spmv[sell_item_btn]"]',
                type: 'text',
                value: 'Sell This Item---'
            },
            {
                selector: '//input[@id="dokan_spmv[available_vendor_list_title]"]',
                type: 'text',
                value: 'Other Available Vendor---'
            },
            {
                selector: '//select[@id="dokan_spmv[available_vendor_list_position]"]',
                type: 'select',
                value: 'below_tabs'
            },
            {
                selector: '//select[@id="dokan_spmv[show_order]"]',
                type: 'select',
                value: 'top_rated_vendor'
            }
        ],
    },
];

const newDataset = {
    title: 'Admin Setting: Vendor -> single_product_multi_vendor',
    url:'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-vendor"] >> [data-testid="settings-menu-single_product_multi_vendor"]',
    fields: [
        {
            selector: '[data-testid="settings-field-single_product_multiple_vendor"] [role="switch"]',
            type: 'switch',
            value: true,
        },
        {
            selector: '[data-testid="settings-field-sell_item_button_text"] input',
            type: 'text',
            value: 'Sell This Item---',
        },
        {
            selector: '[data-testid="settings-field-available_vendor_display_area_title"] input',
            type: 'text',
            value: 'Other Available Vendor---',
        },
        {
            selector: '[data-testid="settings-field-available_vendor_section_display_position"]',
            type: 'customize-radio',
            value: 'top_of_product_tab', // Options: 'Search with Suggestion Box', 'Autoload Replace Current Content'
        },
        {
            selector: '#spmv_products_display',
            type: 'dropdown',
            value: 'Top rated vendor',
        },
    ],
};

test.describe('Admin Setting: Vendor -> single_product_multi_vendor', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Single Product Multi Vendor Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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
        await test.step('Reload new settings url', async () => {
            await adminSettingsPage.reloadUrl(newDataset.url);         
        });
        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });

    test('Old to new Single Product Multi Vendor Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        // There is a problem. New page is not well rendering after updating old settings. Need to fix then verify.
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
