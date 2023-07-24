import { Page } from '@playwright/test';
import { CustomerPage } from 'pages/customerPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';

const { DOKAN_PRO } = process.env;

export class ShopPage extends CustomerPage {

	constructor(page: Page) {
		super(page);
	}


	// shop


	// shop render properly
	async shopRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.shop);

		// shop text is visible
		await this.toBeVisible(selector.customer.cShop.shopText);

		if(DOKAN_PRO){

			// map elements are visible
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { productOnMap, ...map } = selector.customer.cShop.map;
			await this.multipleElementVisible(map);

			// product filter elements are visible
			await this.multipleElementVisible(selector.customer.cShop.filters);

		}

		// product card elements are visible
		await this.notToHaveCount(selector.customer.cShop.productCard.card, 0);
		await this.notToHaveCount(selector.customer.cShop.productCard.productDetailsLink, 0);
		await this.notToHaveCount(selector.customer.cShop.productCard.productTitle, 0);
		await this.notToHaveCount(selector.customer.cShop.productCard.productPrice, 0);
		await this.notToHaveCount(selector.customer.cShop.productCard.addToCart, 0);

	}


	// sort products
	async sortProducts(sortBy: string){
		await this.goIfNotThere(data.subUrls.frontend.shop);
		await this.selectByValueAndWaitForResponse(data.subUrls.frontend.shop, selector.customer.cShop.sort, sortBy);
	}


	// search product
	async searchProduct(productName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.shop);
		if(!DOKAN_PRO){
			await this.clearAndType(selector.customer.cShop.searchProductLite, productName);
			await this.pressAndWaitForNavigation(data.key.enter);
			await this.toContainText(selector.customer.cSingleProduct.productDetails.productTitle, productName );
		} else {
			await this.clearAndType(selector.customer.cShop.filters.searchProduct, productName);
			await this.click(selector.customer.cShop.filters.search);
			await this.toContainText(selector.customer.cShop.productCard.productTitle, productName);
		}
	}


	// products on map
	async productOnMap(productName?: string){
		await this.goIfNotThere(data.subUrls.frontend.shop);
		await this.click(selector.customer.cShop.map.productOnMap.productPin); // TODO: geolocation & store has location but products don't show on map, find-out issue
		await this.toBeVisible(selector.customer.cShop.map.productOnMap.productListPopup);
		productName && await this.toBeVisible(selector.customer.cShop.map.productOnMap.productOnList(productName));
	}


	// go to product details
	async  goToProductDetails(productName: string): Promise<void> {
		await this.searchProduct(productName);
		if(DOKAN_PRO){
			await this.clickAndWaitForResponse(data.subUrls.frontend.productCustomerPage, selector.customer.cShop.productCard.productDetailsLink);
			await this.toContainText(selector.customer.cSingleProduct.productDetails.productTitle, productName );
		}
	}


}
