import { Page } from '@playwright/test';
import { CustomerPage } from 'pages/customerPage';
import { selector } from 'pages/selectors';
import { helpers } from 'utils/helpers';
import { data } from 'utils/testData';
import { storeShare } from 'utils/interfaces';

const { DOKAN_PRO } = process.env;

export class SingleStorePage extends CustomerPage {

	constructor(page: Page) {
		super(page);
	}


	// single store


	// single store render properly
	async singleStoreRenderProperly(storeName: string){
		await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));

		// store profile elements are visible
		await this.multipleElementVisible(selector.customer.cSingleStore.storeProfile);

		// store tab elements are visible
		if (!DOKAN_PRO){
			await this.toBeVisible(selector.customer.cSingleStore.storeTabs.products);
			await this.toBeVisible(selector.customer.cSingleStore.storeTabs.toc); //TODO: enable toc on setup , get page id via api then user db // also need vendor toc
		} else {
			await this.multipleElementVisible(selector.customer.cSingleStore.storeTabs);
		}

		// search elements are visible
		await this.multipleElementVisible(selector.customer.cSingleStore.search);

		// sortby element is visible
		await this.toBeVisible(selector.customer.cSingleStore.sortBy);

		// store products are visible
		await this.toBeVisible(selector.customer.cSingleStore.storeProducts);

		// product card elements are visible
		await this.notToHaveCount(selector.customer.cSingleStore.productCard.card, 0);
		await this.notToHaveCount(selector.customer.cSingleStore.productCard.productDetailsLink, 0);
		await this.notToHaveCount(selector.customer.cSingleStore.productCard.productTitle, 0);
		await this.notToHaveCount(selector.customer.cSingleStore.productCard.productPrice, 0);
		await this.notToHaveCount(selector.customer.cSingleStore.productCard.addToCart, 0);

		// store social icons are visible
		await this.multipleElementVisible(selector.customer.cSingleStore.storeSocialIcons);
	}


	// sort products on single store
	async singleStoreSortProducts(storeName: string, sortBy: string){
		await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
		await this.selectByValueAndWaitForResponse(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)), selector.customer.cSingleStore.sortBy, sortBy);
	}


	// search product on single store
	async singleStoreSearchProduct(storeName: string, productName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
		await this.clearAndType(selector.customer.cSingleStore.search.input, productName);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)), selector.customer.cSingleStore.search.button);
		await this.toContainText(selector.customer.cSingleStore.productCard.productTitle, productName);
	}


	// store open close
	async storeOpenCloseTime(storeName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
		await this.hover(selector.customer.cSingleStore.storeTime.storeTimeDropDown);

		await this.toBeVisible(selector.customer.cSingleStore.storeTime.storeTimeDiv);
		await this.toBeVisible(selector.customer.cSingleStore.storeTime.storeTimeHeading);

		await this.toHaveCount(selector.customer.cSingleStore.storeTime.storeDays, 7);
		await this.toHaveCount(selector.customer.cSingleStore.storeTime.storeTimes, 7);
	}


	// store terms and condition
	async storeTermsAndCondition(storeName: string, toc: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
		await this.clickAndWaitForResponse(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)), selector.customer.cSingleStore.storeTabs.toc);
		await this.toContainText(selector.customer.cSingleStore.toc.tocContent, toc);
	}


	// store share
	async storeShare(storeName: string, site: storeShare): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
		await this.click(selector.customer.cSingleStore.storeTabs.share);
		// await this.clickAndWaitForUrl(site.url, selector.customer.cSingleStore.sharePlatForms[site.name]); //TODO: fix this
	}


}
