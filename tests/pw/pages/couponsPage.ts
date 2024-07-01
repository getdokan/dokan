import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { coupon } from '@utils/interfaces';

// selectors
const couponsAdmin = selector.admin.marketing;
const couponsVendor = selector.vendor.vCoupon;

export class CouponsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    customerPage = new CustomerPage(this.page);

    // add marketplace coupon
    async addMarketplaceCoupon(coupon: coupon) {
        await this.goIfNotThere(data.subUrls.backend.wc.addCoupon);

        await this.clearAndType(couponsAdmin.addNewCoupon.couponCode, coupon.title);
        await this.clearAndType(couponsAdmin.addNewCoupon.couponDescription, coupon.description);
        await this.selectByValue(couponsAdmin.addNewCoupon.discountType, coupon.discountType);
        await this.clearAndType(couponsAdmin.addNewCoupon.couponAmount, coupon.amount());

        await this.click(couponsAdmin.addNewCoupon.vendorLimits);
        await this.check(couponsAdmin.addNewCoupon.enableForAllVendors);
        await this.check(couponsAdmin.addNewCoupon.showOnStores);
        await this.check(couponsAdmin.addNewCoupon.notifyVendors);
        await this.scrollToTop();
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, couponsAdmin.addNewCoupon.publish);
        await this.toContainText(couponsAdmin.addNewCoupon.publishSuccessMessage, 'Coupon updated.');
    }

    // vendor coupons render properly
    async vendorCouponsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.coupons);

        // coupon text is visible
        await this.toBeVisible(couponsVendor.couponText);

        // add new coupon is visible
        await this.toBeVisible(couponsVendor.addNewCoupon);

        // coupon menus are visible
        await this.multipleElementVisible(couponsVendor.menus);

        // table elements are visible
        await this.multipleElementVisible(couponsVendor.table);
    }

    // vendor view marketplace coupon
    async viewMarketPlaceCoupons(marketplaceCoupon: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.coupons);
        await this.click(couponsVendor.menus.marketplaceCoupons);
        await this.toBeVisible(couponsVendor.marketPlaceCoupon.marketPlaceCoupon);
        marketplaceCoupon && (await this.toBeVisible(couponsVendor.marketPlaceCoupon.couponCell(marketplaceCoupon)));
    }

    // update coupon fields
    async updateCouponFields(coupon: coupon) {
        await this.clearAndType(couponsVendor.couponTitle, coupon.title);
        await this.clearAndType(couponsVendor.description, coupon.description);
        await this.selectByValue(couponsVendor.discountType, coupon.discountType);
        await this.clearAndType(couponsVendor.amount, coupon.amount());
        await this.click(couponsVendor.selectAll);
        await this.check(couponsVendor.applyForNewProducts);
        await this.check(couponsVendor.showOnStore);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.coupons, couponsVendor.createCoupon, 302);
    }

    // vendor add coupon
    async addCoupon(coupon: coupon) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.coupons);
        await this.click(couponsVendor.addNewCoupon);
        await this.updateCouponFields(coupon);
    }

    // vendor edit coupon
    async editCoupon(coupon: coupon) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.coupons);
        await this.clickAndWaitForLoadState(couponsVendor.couponLink(coupon.title));
        await this.updateCouponFields(coupon);
        await this.toContainText(couponsVendor.dokanMessage, couponsVendor.couponUpdateSuccessMessage);
    }

    // vendor edit coupon
    async deleteCoupon(couponCode: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.coupons);
        await this.hover(couponsVendor.couponCell(couponCode));
        await this.clickAndAccept(couponsVendor.couponDelete(couponCode));
        await this.toContainText(couponsVendor.dokanMessage, 'Coupon has been deleted successfully!');
    }

    // customer

    // single store coupon
    async viewStoreCoupon(storeName: string, couponCode: string) {
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        await this.toBeVisible(selector.customer.cSingleStore.storeCoupon.coupon(couponCode));
    }

    // apply coupon
    async applyCoupon(productName: string, couponCode: string) {
        await this.customerPage.addProductToCart(productName, 'single-product');
        await this.customerPage.applyCoupon(couponCode);
    }

    // buy product with coupon
    async buyProductWithCoupon(productName: string, couponCode: string) {
        await this.customerPage.addProductToCart(productName, 'single-product');
        await this.customerPage.applyCoupon(couponCode);
        await this.customerPage.placeOrder();
    }
}
