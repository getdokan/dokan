import { Page } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { CustomerPage } from 'pages/customerPage';
import { selector } from 'pages/selectors';
import { helpers } from 'utils/helpers';
import { data } from 'utils/testData';
import{ coupon } from 'utils/interfaces';


export class CouponsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}

	customerPage = new CustomerPage(this.page);


	// add marketplace coupon
	async addMarketplaceCoupon(coupon: coupon){
		await this.goIfNotThere(data.subUrls.backend.wc.coupons);

		await this.clickAndWaitForResponse(data.subUrls.backend.wc.addCoupon, selector.admin.marketing.addCoupon);
		await this.clearAndType(selector.admin.marketing.addNewCoupon.couponCode, coupon.title);
		await this.clearAndType(selector.admin.marketing.addNewCoupon.couponDescription, coupon.description);
		await this.selectByValue(selector.admin.marketing.addNewCoupon.discountType, coupon.discountType);
		await this.clearAndType(selector.admin.marketing.addNewCoupon.couponAmount, coupon.amount());

		await this.click(selector.admin.marketing.addNewCoupon.vendorLimits);
		await this.check(selector.admin.marketing.addNewCoupon.enableForAllVendors);
		await this.check(selector.admin.marketing.addNewCoupon.showOnStores);
		await this.check(selector.admin.marketing.addNewCoupon.notifyVendors);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.marketing.addNewCoupon.publish);
		await this.toContainText(selector.admin.marketing.addNewCoupon.publishSuccessMessage, 'Coupon updated.');
	}


	// vendor coupons render properly
	async vendorCouponsRenderProperly(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.coupons);

		// coupon text is visible
		await this.toBeVisible(selector.vendor.vCoupon.couponText);

		// add new coupon is visible
		await this.toBeVisible(selector.vendor.vCoupon.addNewCoupon);

		// coupon menus are visible
		await this.multipleElementVisible(selector.vendor.vCoupon.menus);

		// table elements are visible
		await this.multipleElementVisible(selector.vendor.vCoupon.table);

	}


	// vendor view marketplace coupon
	async viewMarketPlaceCoupon(marketplaceCoupon: string) {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.coupons);
		await this.click(selector.vendor.vCoupon.menus.marketplaceCoupons);
		await this.toBeVisible(selector.vendor.vCoupon.marketPlaceCoupon.marketPlaceCoupon);
		marketplaceCoupon && await this.toBeVisible(selector.vendor.vCoupon.marketPlaceCoupon.couponCell(marketplaceCoupon));
	}


	// update coupon fields
	async updateCouponFields(coupon: coupon){
		await this.clearAndType(selector.vendor.vCoupon.couponTitle, coupon.title);
		await this.clearAndType(selector.vendor.vCoupon.description, coupon.description);
		await this.selectByValue(selector.vendor.vCoupon.discountType, coupon.discountType);
		await this.clearAndType(selector.vendor.vCoupon.amount, coupon.amount());
		await this.click(selector.vendor.vCoupon.selectAll);
		await this.check(selector.vendor.vCoupon.applyForNewProducts);
		await this.check(selector.vendor.vCoupon.showOnStore);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.coupons, selector.vendor.vCoupon.createCoupon, 302);
	}


	// vendor add coupon
	async addCoupon(coupon: coupon) {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.coupons);
		await this.click(selector.vendor.vCoupon.addNewCoupon);
		await this.updateCouponFields(coupon);

	}


	// vendor edit coupon
	async editCoupon(coupon: coupon) {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.coupons);
		await this.clickAndWaitForLoadState(selector.vendor.vCoupon.couponLink(coupon.title));
		await this.updateCouponFields(coupon);
		await this.toContainText(selector.vendor.vCoupon.dokanMessage, selector.vendor.vCoupon.couponUpdateSuccessMessage );
	}


	// vendor edit coupon
	async deleteCoupon(couponCode: string) {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.coupons);
		await this.hover(selector.vendor.vCoupon.couponCell(couponCode));
		await this.clickAndAccept(selector.vendor.vCoupon.couponDelete(couponCode));
		await this.toContainText(selector.vendor.vCoupon.dokanMessage, 'Coupon has been deleted successfully!');
	}


	// customer


	// single store coupon
	async viewStoreCoupon(storeName: string, couponCode:string){
		await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
		await this.toBeVisible(selector.customer.cSingleStore.storeCoupon.coupon(couponCode));

	}


	// apply coupon
	async applyCoupon(productName: string, couponCode:string){
		await this.customerPage.addProductToCart(productName, 'single-product');
		await this.customerPage.applyCoupon(couponCode);
	}


	// buy product with coupon
	async buyProductWithCoupon(productName: string, couponCode:string){
		await this.customerPage.addProductToCart(productName, 'single-product');
		await this.customerPage.applyCoupon(couponCode);
		await this.customerPage.placeOrder();
	}


}
