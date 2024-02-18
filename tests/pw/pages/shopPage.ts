import { Page } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

const { DOKAN_PRO } = process.env;

// selectors
const shopCustomer = selector.customer.cShop;

export class ShopPage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // shop

    // shop render properly
    async shopRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.shop);

        // shop text is visible
        await this.toBeVisible(shopCustomer.shopText);

        if (DOKAN_PRO) {
            // map elements are visible
            const { productOnMap, ...map } = shopCustomer.map;
            await this.multipleElementVisible(map);

            // product filter elements are visible
            await this.multipleElementVisible(shopCustomer.filters);
        }

        // product card elements are visible
        await this.notToHaveCount(shopCustomer.productCard.card, 0);
        await this.notToHaveCount(shopCustomer.productCard.productDetailsLink, 0);
        await this.notToHaveCount(shopCustomer.productCard.productTitle, 0);
        await this.notToHaveCount(shopCustomer.productCard.productPrice, 0);
        await this.notToHaveCount(shopCustomer.productCard.addToCart, 0);
    }

    // sort products
    async sortProducts(sortBy: string) {
        await this.goIfNotThere(data.subUrls.frontend.shop);
        await this.selectByValueAndWaitForResponse(data.subUrls.frontend.shop, shopCustomer.sort, sortBy);
    }

    // search product
    async searchProduct(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.shop);
        if (!DOKAN_PRO) {
            await this.clearAndType(shopCustomer.searchProductLite, productName);
            await this.pressAndWaitForLoadState(data.key.enter);
            await this.toContainText(selector.customer.cSingleProduct.productDetails.productTitle, productName);
        } else {
            await this.clearAndType(shopCustomer.filters.searchProduct, productName);
            await this.clickAndWaitForLoadState(shopCustomer.filters.search);
            await this.toContainText(shopCustomer.productCard.productTitle, productName);
        }
    }

    // filter products
    async filterProducts(filterBy: string, value: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.shop);

        switch (filterBy) {
            case 'by-location':
                await this.typeAndWaitForResponse(data.subUrls.gmap, shopCustomer.filters.location, value);
                await this.press(data.key.arrowDown);
                await this.pressAndWaitForResponse(data.subUrls.gmap, data.key.enter);
                break;

            case 'by-category':
                await this.selectByValue(shopCustomer.filters.selectCategory, value);
                break;

            default:
                break;
        }

        await this.clickAndWaitForLoadState(shopCustomer.filters.search);
        await this.notToHaveCount(shopCustomer.productCard.card, 0);
    }

    // products on map
    async productOnMap() {
        await this.goIfNotThere(data.subUrls.frontend.shop);
        const storePinIsVisible = await this.isVisible(shopCustomer.map.productOnMap.productPin);
        if (storePinIsVisible) {
            await this.click(shopCustomer.map.productOnMap.productPin);
            await this.toBeVisible(shopCustomer.map.productOnMap.productPopup);
        } else {
            await this.click(shopCustomer.map.productOnMap.productCluster);
            await this.toBeVisible(shopCustomer.map.productOnMap.productListPopup);
            await this.click(shopCustomer.map.productOnMap.closePopup);
        }
    }

    // go to product details
    async goToProductDetailsFromShop(productName: string): Promise<void> {
        await this.searchProduct(productName);
        if (DOKAN_PRO) {
            await this.clickAndWaitForResponse(data.subUrls.frontend.productCustomerPage, shopCustomer.productCard.productDetailsLink);
            await this.toContainText(selector.customer.cSingleProduct.productDetails.productTitle, productName);
        }
    }
}
