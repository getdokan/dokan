import { Page, expect } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';

const { DOKAN_PRO } = process.env;

// selectors
const storeList = selector.customer.cStoreList;

export class StoreListingPage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // store list

    // store list render properly
    async storeListRenderProperly(link?: string) {
        if (link) {
            await this.goto(link);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.storeListing);
            // store list text is visible
            await this.toBeVisible(storeList.storeListText);
        }

        // map elements are visible
        if (DOKAN_PRO) {
            const { storeOnMap, ...map } = storeList.map;
            await this.multipleElementVisible(map);
        }

        // store filter elements are visible
        const { filterDetails, ...filters } = storeList.filters;
        await this.multipleElementVisible(filters);

        // click filter button to view filter details
        await this.click(storeList.filters.filterButton);

        // store filter detail elements are visible
        if (!DOKAN_PRO) {
            await this.toBeVisible(storeList.filters.filterDetails.searchVendor);
            await this.toBeVisible(storeList.filters.filterDetails.apply);
        } else {
            const { rating, ...filterDetails } = storeList.filters.filterDetails;
            await this.multipleElementVisible(filterDetails);
        }

        // store card elements are visible
        await this.notToHaveCount(storeList.storeCard.storeCardDiv, 0);

        // card header
        await this.notToHaveCount(storeList.storeCard.storeCardHeader, 0);
        await this.notToHaveCount(storeList.storeCard.storeBanner, 0);

        // card content
        await this.notToHaveCount(storeList.storeCard.storeCardContent, 0);
        await this.notToHaveCount(storeList.storeCard.storeData, 0);

        // card footer
        await this.notToHaveCount(storeList.storeCard.storeCardFooter, 0);
        await this.notToHaveCount(storeList.storeCard.storeAvatar, 0);
        await this.notToHaveCount(storeList.storeCard.visitStore, 0);
        if (DOKAN_PRO) {
            await this.notToHaveCount(storeList.storeCard.followUnFollowButton, 0);
        }
    }

    // sort store
    async sortStores(sortBy: string) {
        await this.goIfNotThere(data.subUrls.frontend.storeListing);
        await this.selectByValueAndWaitForResponseAndLoadState(data.subUrls.frontend.storeListing, storeList.filters.sortBy, sortBy);
        await this.notToHaveCount(storeList.storeCard.storeCardDiv, 0);
    }

    // store view layout
    async storeViewLayout(style: string) {
        await this.goIfNotThere(data.subUrls.frontend.storeListing);

        switch (style) {
            case 'grid':
                await this.click(storeList.filters.gridView);
                break;

            case 'list':
                await this.click(storeList.filters.listView);
                break;

            default:
                break;
        }
        await this.toHaveClass(storeList.currentLayout, style + '-view');
    }

    // search store
    async searchStore(storeName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.storeListing);
        await this.click(storeList.filters.filterButton);
        await this.clearAndType(storeList.filters.filterDetails.searchVendor, storeName);
        await this.clickAndWaitForResponse(data.subUrls.frontend.storeListing, storeList.filters.filterDetails.apply);
        await this.toBeVisible(storeList.visitStore(storeName));
    }

    // filter stores
    async filterStores(filterBy: string, value?: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.storeListing);
        await this.click(storeList.filters.filterButton);

        switch (filterBy) {
            case 'by-location':
                await this.typeAndWaitForResponse(data.subUrls.gmap, storeList.filters.filterDetails.location, value!);
                await this.click(storeList.mapResultFirst);
                // await this.press(data.key.arrowDown);
                // await this.pressAndWaitForResponse(data.subUrls.gmap, data.key.enter);
                break;

            case 'by-category':
                await this.click(storeList.filters.filterDetails.categoryInput);
                await this.click(storeList.category(value!));
                break;

            case 'by-ratings':
                await this.click(storeList.filters.filterDetails.rating(value!));
                break;

            case 'featured':
                await this.click(storeList.filters.filterDetails.featured);
                break;

            case 'open-now':
                await this.click(storeList.filters.filterDetails.openNow);
                break;

            default:
                break;
        }

        await this.clickAndWaitForResponse(data.subUrls.frontend.storeListing, storeList.filters.filterDetails.apply);
        await this.notToHaveCount(storeList.storeCard.storeCardDiv, 0);
    }

    // stores on map
    async storeOnMap(storeName?: string) {
        await this.goIfNotThere(data.subUrls.frontend.storeListing);
        const storePinIsVisible = await this.isVisible(storeList.map.storeOnMap.storePin);
        if (storePinIsVisible) {
            await this.click(storeList.map.storeOnMap.storePin);
            await this.toBeVisible(storeList.map.storeOnMap.storePopup);
        } else {
            await this.click(storeList.map.storeOnMap.storeCluster);
            await this.toBeVisible(storeList.map.storeOnMap.storeListPopup);
            await this.click(storeList.map.storeOnMap.closePopup);
        }
        if (storeName) {
            await this.toBeVisible(storeList.map.storeOnMap.storeOnList(storeName));
        }
    }

    // go to single store from store listing
    async goToSingleStoreFromStoreListing(storeName: string): Promise<void> {
        await this.searchStore(storeName);
        await this.clickAndWaitForLoadState(storeList.storeCard.visitStore);
        const storeUrl = this.isCurrentUrl(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        expect(storeUrl).toBeTruthy();
    }
}
