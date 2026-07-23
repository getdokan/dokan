import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPageNew as AdminSettingsPage } from '@pages/adminSettingsPageNew';
import { data } from '@utils/testData';
// Shipping Providers – New UI locators (button[role="switch"])
const shippingProviderLocators = {
    australiaPost:      '[data-testid="settings-field-sp-australia-post"] button[role="switch"]',
    canadaPost:         '[data-testid="settings-field-sp-canada-post"] button[role="switch"]',
    cityLink:           '[data-testid="settings-field-sp-city-link"] button[role="switch"]',
    dhl:                '[data-testid="settings-field-sp-dhl"] button[role="switch"]',
    dpd:                '[data-testid="settings-field-sp-dpd"] button[role="switch"]',
    fastwaySouthAfrica: '[data-testid="settings-field-sp-fastway-south-africa"] button[role="switch"]',
    fedex:              '[data-testid="settings-field-sp-fedex"] button[role="switch"]',
    onTrac:             '[data-testid="settings-field-sp-ontrac"] button[role="switch"]',
    parcelForce:        '[data-testid="settings-field-sp-parcelforce"] button[role="switch"]',
    polishProviders:    '[data-testid="settings-field-sp-polish-shipping-providers"] button[role="switch"]',
    royalMail:          '[data-testid="settings-field-sp-royal-mail"] button[role="switch"]',
    tntConsignment:     '[data-testid="settings-field-sp-tnt-express-consignment"] button[role="switch"]',
    tntReference:       '[data-testid="settings-field-sp-tnt-express-reference"] button[role="switch"]',
    fedexSameday:       '[data-testid="settings-field-sp-fedex-sameday"] button[role="switch"]',
    ups:                '[data-testid="settings-field-sp-ups"] button[role="switch"]',
    usps:               '[data-testid="settings-field-sp-usps"] button[role="switch"]',
    dhlUs:              '[data-testid="settings-field-sp-dhl-us"] button[role="switch"]',
    other:              '[data-testid="settings-field-sp-other"] button[role="switch"]',
};

// Old UI - All Shipping Provider Switch Locators (label containing text → switch)
const shippingProviderLocatorsOld = {
    australiaPost:      '//div[normalize-space(text())="Australia Post"]/label[@class="switch tips"]',
    canadaPost:         '//div[normalize-space(text())="Canada Post"]/label[@class="switch tips"]',
    cityLink:           '//div[normalize-space(text())="City Link"]/label[@class="switch tips"]',
    dhl:                '//div[normalize-space(text())="DHL"]/label[@class="switch tips"]',
    dpd:                '//div[normalize-space(text())="DPD"]/label[@class="switch tips"]',
    fastwaySouthAfrica: '//div[normalize-space(text())="Fastway South Africa"]/label[@class="switch tips"]',
    fedex:              '//div[normalize-space(text())="Fedex"]/label[@class="switch tips"]',
    onTrac:             '//div[normalize-space(text())="OnTrac"]/label[@class="switch tips"]',
    parcelForce:        '//div[normalize-space(text())="ParcelForce"]/label[@class="switch tips"]',
    polishProviders:    '//div[normalize-space(text())="Polish shipping providers"]/label[@class="switch tips"]',
    royalMail:          '//div[normalize-space(text())="Royal Mail"]/label[@class="switch tips"]',
    tntConsignment:     '//div[normalize-space(text())="TNT Express (consignment)"]/label[@class="switch tips"]',
    tntReference:       '//div[normalize-space(text())="TNT Express (reference)"]/label[@class="switch tips"]',
    fedexSameday:       '//div[normalize-space(text())="FedEx Sameday"]/label[@class="switch tips"]',
    ups:                '//div[normalize-space(text())="UPS"]/label[@class="switch tips"]',
    usps:               '//div[normalize-space(text())="USPS"]/label[@class="switch tips"]',
    dhlUs:              '//div[normalize-space(text())="DHL US"]/label[@class="switch tips"]',
    other:              '//div[normalize-space(text())="Other"]/label[@class="switch tips"]',
};
const oldDataset = [
    {
        title: 'Admin Old Setting: Shipping Status',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"Shipping Status")]',
        fields: [
            // Main toggles
            {
                selector: '//label[@for="dokan_shipping_status_setting[enabled]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            {
                selector: '//label[@for="dokan_shipping_status_setting[allow_mark_received]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
            // {
            //     selector: '//label[@for="dokan_general[enable_shipstation_logging]"]//label[@class="switch tips"]',
            //     type: 'checkbox',
            //     value: true,
            // },

            // All shipping providers
            { selector: shippingProviderLocatorsOld.australiaPost,      type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.canadaPost,         type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.cityLink,           type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.dhl,                type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.dpd,                type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.fastwaySouthAfrica, type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.fedex,              type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.onTrac,             type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.parcelForce,        type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.polishProviders,    type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.royalMail,          type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.tntConsignment,     type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.tntReference,       type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.fedexSameday,       type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.ups,                type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.usps,               type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.dhlUs,              type: 'checkbox', value: true },
            { selector: shippingProviderLocatorsOld.other,              type: 'checkbox', value: true },
        ],
    },
    {
        title: 'Admin Old Settings: General',
        url: 'wp-admin/admin.php?page=dokan#/settings',
        selector: '//div[@class="nav-title" and contains(text(),"General")]',
        fields: [
            {
                selector: '//label[@for="dokan_general[enable_shipstation_logging]"]//label[@class="switch tips"]',
                type: 'checkbox',
                value: true,
            },
        ],
    }
];

const newDataset = {
    title: 'Admin Setting: Shipment -> shipment-settings',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-shipment"] >> [data-testid="settings-menu-shipment-setting-page"]',
    fields: [
        // Main toggles
        { selector: '[data-testid="settings-field-allows_shipment_tracking"] [role="switch"]', type: 'switch', value: true },
        { selector: '[data-testid="settings-field-enable_shipstation_logging"] [role="switch"]', type: 'switch', value: true },
        { selector: '[data-testid="settings-field-allow_mark_received"] [role="switch"]', type: 'switch', value: true },

        // All shipping providers
        { selector: shippingProviderLocators.australiaPost,      type: 'switch', value: true },
        { selector: shippingProviderLocators.canadaPost,         type: 'switch', value: true },
        { selector: shippingProviderLocators.cityLink,           type: 'switch', value: true },
        { selector: shippingProviderLocators.dhl,                type: 'switch', value: true },
        { selector: shippingProviderLocators.dpd,                type: 'switch', value: true },
        { selector: shippingProviderLocators.fastwaySouthAfrica, type: 'switch', value: true },
        { selector: shippingProviderLocators.fedex,              type: 'switch', value: true },
        { selector: shippingProviderLocators.onTrac,             type: 'switch', value: true },
        { selector: shippingProviderLocators.parcelForce,        type: 'switch', value: true },
        { selector: shippingProviderLocators.polishProviders,    type: 'switch', value: true },
        { selector: shippingProviderLocators.royalMail,          type: 'switch', value: true },
        { selector: shippingProviderLocators.tntConsignment,     type: 'switch', value: true },
        { selector: shippingProviderLocators.tntReference,       type: 'switch', value: true },
        { selector: shippingProviderLocators.fedexSameday,       type: 'switch', value: true },
        { selector: shippingProviderLocators.ups,                type: 'switch', value: true },
        { selector: shippingProviderLocators.usps,               type: 'switch', value: true },
        { selector: shippingProviderLocators.dhlUs,              type: 'switch', value: true },
        { selector: shippingProviderLocators.other,              type: 'switch', value: true },
        // Shipment status field will be checked manually.
    ],
};

test.describe('Admin Setting: Shipment -> shipment-settings', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);

        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    test('New to Old Shipment Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
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

        await test.step('Check new settings', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });

    test('Old to new Shipment Settings synchronization', { tag: ['@lite', '@admin', '@migration'] }, async () => {
        await test.step('Update old settings', async () => {
            await adminSettingsPage.setSaveButtonSelector(adminSettingsPage.oldSaveButtonSelector);
            for (const dataset of oldDataset) {
                await test.step('Update ' + dataset.title, async () => {
                    await adminSettingsPage.updateSettings(dataset);
                });
            }
        });

        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload ' + dataset.title, async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });

        // Need reload again
        await test.step('Reload old settings urls', async () => {
            for (const dataset of oldDataset) {
                await test.step('Reload ' + dataset.title, async () => {
                    await adminSettingsPage.reloadUrl(dataset.url);
                });
            }
        });
        await test.step('Check new settings again', async () => {
            await adminSettingsPage.checkSettings(newDataset);
        });
    });
});
