import { Page, expect } from '@playwright/test';
import { CustomerPage } from 'pages/customerPage';
import { selector } from 'pages/selectors';
import { helpers } from 'utils/helpers';
import { data } from 'utils/testData';

const { DOKAN_PRO } = process.env;


export class StoreListingPage extends CustomerPage {

	constructor(page: Page) {
		super(page);
	}


	// store list


	// store list render properly
	async storeListRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.storeListing);

		// store list text is visible
		await this.toBeVisible(selector.customer.cStoreList.storeListText);

		// map elements are visible
		if(DOKAN_PRO){
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { storeOnMap, ...map } = selector.customer.cStoreList.map;
			await this.multipleElementVisible(map);
		}

		// store filter elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { filterDetails, ...filters } = selector.customer.cStoreList.filters;
		await this.multipleElementVisible(filters);

		// click filter button to view filter details
		await this.click(selector.customer.cStoreList.filters.filterButton);

		// store filter detail elements are visible
		if (!DOKAN_PRO){
			await this.toBeVisible(selector.customer.cStoreList.filters.filterDetails.searchVendor);
			await this.toBeVisible(selector.customer.cStoreList.filters.filterDetails.apply);
		} else {
			//TODO: remove every eslint comment before push
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { rating, ...filterDetails } = selector.customer.cStoreList.filters.filterDetails;
			await this.multipleElementVisible(filterDetails);
		}

		// store card elements are visible
		await this.notToHaveCount(selector.customer.cStoreList.storeCard.storeCardDiv, 0);

		// card header
		await this.notToHaveCount(selector.customer.cStoreList.storeCard.storeCardHeader, 0);
		await this.notToHaveCount(selector.customer.cStoreList.storeCard.storeBanner, 0);

		// card content
		await this.notToHaveCount(selector.customer.cStoreList.storeCard.storeCardContent, 0);
		await this.notToHaveCount(selector.customer.cStoreList.storeCard.storeData, 0);

		// card footer
		await this.notToHaveCount(selector.customer.cStoreList.storeCard.storeCardFooter, 0);
		await this.notToHaveCount(selector.customer.cStoreList.storeCard.storeAvatar, 0);
		await this.notToHaveCount(selector.customer.cStoreList.storeCard.visitStore, 0);
		DOKAN_PRO && await this.notToHaveCount(selector.customer.cStoreList.storeCard.followUnFollowButton, 0);

	}


	// sort store
	async sortStores(sortBy: string){
		await this.goIfNotThere(data.subUrls.frontend.storeListing);
		await this.selectByValueAndWaitForResponse(data.subUrls.frontend.storeListing, selector.customer.cStoreList.filters.sortBy, sortBy);
	}


	// store view layout
	async storeViewLayout(style: string){
		await this.goIfNotThere(data.subUrls.frontend.storeListing);

		switch (style) {

		case 'grid' :
			await this.click(selector.customer.cStoreList.filters.gridView);
			break;

		case 'list' :
			await this.click(selector.customer.cStoreList.filters.listView);
			break;

		default :
			break;
		}
		await this.toHaveClass(selector.customer.cStoreList.currentLayout, style+ '-view');
	}


	// search store
	async searchStore(storeName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.storeListing);
		await this.click(selector.customer.cStoreList.filters.filterButton);
		await this.clearAndType(selector.customer.cStoreList.filters.filterDetails.searchVendor, storeName);
		await this.clickAndWaitForResponse(data.subUrls.frontend.storeListing, selector.customer.cStoreList.filters.filterDetails.apply);
		await this.toBeVisible(selector.customer.cStoreList.visitStore(storeName));
	}


	// stores on map
	async storeOnMap(storeName?: string){
		await this.goIfNotThere(data.subUrls.frontend.storeListing);
		await this.click(selector.customer.cStoreList.map.storeOnMap.storePin);
		await this.toBeVisible(selector.customer.cStoreList.map.storeOnMap.storeListPopup);
		storeName && await this.toBeVisible(selector.customer.cStoreList.map.storeOnMap.storeOnList(storeName));
	}


	// go to single store from store listing
	async goToSingleStoreFromStoreListing(storeName: string): Promise<void> {
		await this.searchStore(storeName);
		await this.clickAndWaitForNavigation(selector.customer.cStoreList.storeCard.visitStore);
		const cartUrl =  this.isCurrentUrl(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
		expect(cartUrl).toBeTruthy();
	}


}
