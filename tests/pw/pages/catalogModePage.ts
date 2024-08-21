import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = process.env;

// selectors
const settingsAdmin = selector.admin.dokan.settings;
const settingsVendor = selector.vendor.vStoreSettings;
const shopCustomer = selector.customer.cShop;
const singleStoreCustomer = selector.customer.cSingleStore;

export class CatalogModePage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // admin add catalog mode
    async addCatalogMode() {
        await this.goToDokanSettings();
        await this.click(settingsAdmin.menus.sellingOptions);

        // catalog mode
        await this.enableSwitcher(settingsAdmin.selling.removeAddToCartButton);
        await this.enableSwitcher(settingsAdmin.selling.hideProductPrice);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.selling.sellingOptionsSaveChanges);

        await this.switcherHasColor(settingsAdmin.selling.removeAddToCartButton, data.colorCode.blue);
        await this.switcherHasColor(settingsAdmin.selling.hideProductPrice, data.colorCode.blue);
    }

    // vendor

    // vendor can't access catalog mode settings
    async accessCatalogModeSettings() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
        await this.notToBeVisible(settingsVendor.hideProductPrice);
    }

    // customer

    async viewRfqInCatalogMode(productName: string, storeName: string, shopClass: any, singleStoreClass: any) {
        // single product page
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
        await this.toBeVisible(selector.customer.cRequestForQuote.singleProductDetails.addToQuote);

        // single store page
        const SingleStorePage = new singleStoreClass(this.page);
        await SingleStorePage.singleStoreSearchProduct(storeName, productName);
        await this.toBeVisible(singleStoreCustomer.productCard.addToQuote);

        if (DOKAN_PRO) {
            // shop page
            const shopPage = new shopClass(this.page);
            await shopPage.searchProduct(productName);
            await this.toBeVisible(shopCustomer.productCard.addToQuote);
        }
    }

    // view price in catalog mode product
    async viewPriceInCatalogModeProduct(productName: string, storeName: string, shopClass: any, singleStoreClass: any) {
        // single product page
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
        await this.toBeVisible(selector.customer.cSingleProduct.productDetails.price);

        // single store page
        const SingleStorePage = new singleStoreClass(this.page);
        await SingleStorePage.singleStoreSearchProduct(storeName, productName);
        await this.toBeVisible(singleStoreCustomer.productCard.productPrice);

        if (DOKAN_PRO) {
            // shop page
            const shopPage = new shopClass(this.page);
            await shopPage.searchProduct(productName);
            await this.toBeVisible(shopCustomer.productCard.productPrice);
        }
    }

    // view catalog mode product
    async viewCatalogModeProduct(productName: string, storeName: string, shopClass: any, singleStoreClass: any) {
        // single product page
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
        await this.notToBeVisible(selector.customer.cSingleProduct.productDetails.price);
        await this.notToBeVisible(selector.customer.cSingleProduct.productDetails.addToCart);

        // single store page
        const SingleStorePage = new singleStoreClass(this.page);
        await SingleStorePage.singleStoreSearchProduct(storeName, productName);
        await this.notToBeVisible(singleStoreCustomer.productCard.productPrice);
        await this.notToBeVisible(singleStoreCustomer.productCard.addToCart);

        if (DOKAN_PRO) {
            // shop page
            const shopPage = new shopClass(this.page);
            await shopPage.searchProduct(productName);
            await this.notToBeVisible(shopCustomer.productCard.productPrice);
            await this.notToBeVisible(shopCustomer.productCard.addToCart);
        }
    }
}
