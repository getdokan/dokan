import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { productAdvertisement } from '@utils/interfaces';

// selectors
const productAdvertisingAdmin = selector.admin.dokan.productAdvertising;

export class ProductAdvertisingPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // product advertising

    // regenerate product advertisement payment product
    async recreateProductAdvertisementPaymentViaSettingsSave() {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.productAdvertising);
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.settings.productAdvertising.productAdvertisingSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, 'Setting has been saved successfully.');
    }

    // product advertising render properly
    async adminProductAdvertisingRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);

        // product advertising text is visible
        await this.toBeVisible(productAdvertisingAdmin.productAdvertisingText);

        // add new Advertisement is visible
        await this.toBeVisible(productAdvertisingAdmin.addNewProductAdvertising);

        // nav tabs are visible
        await this.multipleElementVisible(productAdvertisingAdmin.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(productAdvertisingAdmin.bulkActions);

        // filter elements are visible
        const { filterByStoreInput, filterByCreatedVia, ...filters } = productAdvertisingAdmin.filters;
        await this.multipleElementVisible(filters);

        // product advertising search is visible
        await this.toBeVisible(productAdvertisingAdmin.search);

        // product advertising table elements are visible
        await this.multipleElementVisible(productAdvertisingAdmin.table);

        // product advertising modal elements are visible
        await this.click(productAdvertisingAdmin.addNewProductAdvertising);
        await this.toBeVisible(productAdvertisingAdmin.addNewAdvertisement.selectStoreDropdown);
        await this.toBeVisible(productAdvertisingAdmin.addNewAdvertisement.selectProductDropdown);
        await this.click(productAdvertisingAdmin.addNewAdvertisement.closeModal);
    }

    // add new product advertisement
    async addNewProductAdvertisement(advertising: productAdvertisement) {
        await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);

        await this.click(productAdvertisingAdmin.addNewProductAdvertising);

        await this.click(productAdvertisingAdmin.addNewAdvertisement.selectStoreDropdown);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, productAdvertisingAdmin.addNewAdvertisement.selectStoreInput, advertising.advertisedProductStore);
        await this.toContainText(productAdvertisingAdmin.addNewAdvertisement.selectedStore, advertising.advertisedProductStore);
        await this.press(data.key.enter);

        await this.click(productAdvertisingAdmin.addNewAdvertisement.selectProductDropdown);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.products, productAdvertisingAdmin.addNewAdvertisement.selectProductInput, advertising.advertisedProduct);
        await this.toContainText(productAdvertisingAdmin.addNewAdvertisement.selectedProduct, advertising.advertisedProduct);
        await this.press(data.key.enter);

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.addNewAdvertisement.addNew);
        await this.click(productAdvertisingAdmin.actionSuccessful);

        // close modal
        await this.click(productAdvertisingAdmin.addNewAdvertisement.closeModal);
    }

    // search advertised product
    async searchAdvertisedProduct(searchKey: string | number) {
        await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);

        await this.clearInputField(productAdvertisingAdmin.search);

        await this.typeAndWaitForResponseAndLoadState(data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.search, String(searchKey));
        await this.toHaveCount(productAdvertisingAdmin.numberOfRows, 1);
        if (typeof searchKey != 'number') {
            // serched by product
            await this.toBeVisible(productAdvertisingAdmin.advertisedProductCell(searchKey));
        } else {
            // serched by orderid
            await this.toBeVisible(productAdvertisingAdmin.advertisedProductOrderIdCell(searchKey));
        }
    }

    // filter advertised product
    async filterAdvertisedProduct(input: string, action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);

        switch (action) {
            case 'by-store':
                await this.click(productAdvertisingAdmin.filters.allStoresDropdown);
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.filters.filterByStoreInput, input);
                await this.pressAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, data.key.enter);
                break;

            case 'by-creation':
                await this.click(productAdvertisingAdmin.filters.createdViaDropdown);
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.filters.filterByCreatedVia(input));
                break;

            default:
                break;
        }

        const count = (await this.getElementText(productAdvertisingAdmin.numberOfRowsFound))?.split(' ')[0];
        expect(Number(count)).toBeGreaterThan(0);

        // clear filter
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.filters.clearFilter);
    }

    // update advertised product
    async updateAdvertisedProduct(productName: string, action: string) {
        await this.searchAdvertisedProduct(productName);

        await this.hover(productAdvertisingAdmin.advertisedProductCell(productName));
        switch (action) {
            case 'expire':
                await this.click(productAdvertisingAdmin.advertisedProductExpire(productName));
                break;

            case 'delete':
                await this.click(productAdvertisingAdmin.advertisedProductDelete(productName));
                break;

            default:
                break;
        }

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.confirmAction);
        await this.click(productAdvertisingAdmin.actionSuccessful);

        // refresh table by clicking filter
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.filters.clearFilter);
    }

    // product advertising bulk action
    async productAdvertisingBulkAction(action: string, productName?: string) {
        if (productName) {
            await this.searchAdvertisedProduct(productName);
        } else {
            await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);
        }

        // ensure row exists
        await this.notToBeVisible(productAdvertisingAdmin.noRowsFound);

        await this.click(productAdvertisingAdmin.bulkActions.selectAll);
        await this.selectByValue(productAdvertisingAdmin.bulkActions.selectAction, action);
        await this.click(productAdvertisingAdmin.bulkActions.applyAction);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.confirmAction);
        await this.click(productAdvertisingAdmin.actionSuccessful);
    }
}
