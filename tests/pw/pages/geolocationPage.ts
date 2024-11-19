import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

export class GeolocationPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    async goToProductDetails(productName: string): Promise<void> {
        await this.gotoUntilNetworkidle(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
    }

    // view map position
    async viewMapPosition(position: 'top' | 'left' | 'right'): Promise<void> {
        await this.gotoUntilNetworkidle(data.subUrls.frontend.storeListing);
        switch (position) {
            case 'top':
                await this.toHaveAttribute(selector.customer.cStoreList.map.locationMap, 'class', 'dokan-geolocation-locations-map-top');
                break;

            case 'left':
                await this.toHaveAttribute(selector.customer.cStoreList.map.locationMap, 'class', 'dokan-geolocation-locations-map-left');
                break;

            case 'right':
                await this.toHaveAttribute(selector.customer.cStoreList.map.locationMap, 'class', 'dokan-geolocation-locations-map-right');
                break;

            default:
                break;
        }
    }

    // view map
    async viewMap(position: 'all' | 'store_listing' | 'shop'): Promise<void> {
        switch (position) {
            case 'all':
                await this.gotoUntilNetworkidle(data.subUrls.frontend.shop);
                await this.toBeVisible(selector.customer.cStoreList.map.locationMap);
                await this.gotoUntilNetworkidle(data.subUrls.frontend.storeListing);
                await this.toBeVisible(selector.customer.cStoreList.map.locationMap);
                break;

            case 'store_listing':
                await this.gotoUntilNetworkidle(data.subUrls.frontend.shop);
                await this.notToBeVisible(selector.customer.cStoreList.map.locationMap);
                await this.gotoUntilNetworkidle(data.subUrls.frontend.storeListing);
                await this.toBeVisible(selector.customer.cStoreList.map.locationMap);
                break;

            case 'shop':
                await this.gotoUntilNetworkidle(data.subUrls.frontend.shop);
                await this.toBeVisible(selector.customer.cStoreList.map.locationMap);
                await this.gotoUntilNetworkidle(data.subUrls.frontend.storeListing);
                await this.notToBeVisible(selector.customer.cStoreList.map.locationMap);
                break;

            default:
                break;
        }
    }

    // view map filters
    async viewMapFilters(status: 'enable' | 'disable'): Promise<void> {
        await this.gotoUntilNetworkidle(data.subUrls.frontend.shop);
        switch (status) {
            case 'enable':
                await this.toBeVisible(selector.customer.cShop.filters.filterDiv);
                break;

            case 'disable':
                await this.notToBeVisible(selector.customer.cShop.filters.filterDiv);
                break;

            default:
                break;
        }
    }

    // view product location
    async viewProductLocationTab(productName: string, status: 'enable' | 'disable'): Promise<void> {
        switch (status) {
            case 'enable':
                await this.goToProductDetails(productName);
                await this.toBeVisible(selector.customer.cSingleProduct.menus.location);
                break;

            case 'disable':
                await this.goToProductDetails(productName);
                await this.notToBeVisible(selector.customer.cSingleProduct.menus.location);
                break;

            default:
                break;
        }
    }
}
