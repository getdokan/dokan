import { Page } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { product } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const singleProductCustomer = selector.customer.cSingleProduct;

export class SingleProductPage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // single product page

    // single product render properly
    async singleProductRenderProperly(productName: string) {
        await this.goToProductDetails(productName);

        // basic details are visible
        const { viewCart, ...productDetails } = singleProductCustomer.productDetails;
        await this.multipleElementVisible(productDetails);

        // description elements are visible
        // await this.click(singleProductCustomer.menus.description);
        await this.multipleElementVisible(singleProductCustomer.description);

        // review elements are visible
        await this.click(singleProductCustomer.menus.reviews);

        await this.toBeVisible(singleProductCustomer.reviews.ratings);
        await this.toBeVisible(singleProductCustomer.reviews.reviewMessage);
        await this.toBeVisible(singleProductCustomer.reviews.submitReview);

        // vendor info elements are visible
        await this.click(singleProductCustomer.menus.vendorInfo);
        await this.multipleElementVisible(singleProductCustomer.vendorInfo);

        // more products elements are visible
        await this.click(singleProductCustomer.menus.moreProducts);
        await this.toBeVisible(singleProductCustomer.moreProducts.moreProductsDiv);
        await this.notToHaveCount(singleProductCustomer.moreProducts.product, 0);

        // related products elements are visible
        await this.multipleElementVisible(singleProductCustomer.relatedProducts);

        if (DOKAN_PRO) {
            // get support is visible
            await this.toBeVisible(singleProductCustomer.getSupport.getSupport);

            // report abuse is visible
            await this.toBeVisible(singleProductCustomer.reportAbuse.reportAbuse);

            // vendor highlighted info elements are visible
            await this.multipleElementVisible(singleProductCustomer.vendorHighlightedInfo);

            // product shipping elements are visible
            // await this.click(singleProductCustomer.menus.shipping);
            // await this.multipleElementVisible(singleProductCustomer.shipping);  // todo:  need vendor shipping

            // product location elements are visible
            await this.click(singleProductCustomer.menus.location);
            await this.multipleElementVisible(singleProductCustomer.location);

            // // warranty policy is visible
            // await this.click(singleProductCustomer.menus.warrantyPolicy);
            // await this.multipleElementVisible(singleProductCustomer.warrantyPolicy); // todo:  need warranty policy

            // product enquiry is visible
            await this.click(singleProductCustomer.menus.productEnquiry);
            const { submitEnquirySuccessMessage, guest, ...productEnquiry } = singleProductCustomer.productEnquiry;
            await this.multipleElementVisible(productEnquiry);
        }
    }

    // review product
    async reviewProduct(productName: string, review: product['review']): Promise<void> {
        await this.goToProductDetails(productName);
        const reviewMessage = review.reviewMessage();
        await this.click(singleProductCustomer.menus.reviews);
        await this.click(singleProductCustomer.reviews.rating(review.rating));
        await this.clearAndType(singleProductCustomer.reviews.reviewMessage, reviewMessage);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.productReview, singleProductCustomer.reviews.submitReview, 302);
        await this.toContainText(singleProductCustomer.reviews.submittedReview(reviewMessage), reviewMessage);
    }

    // product vendor info
    async productVendorInfo(productName: string) {
        await this.goToProductDetails(productName);
        await this.click(singleProductCustomer.menus.vendorInfo);
        await this.multipleElementVisible(singleProductCustomer.vendorInfo);
    }

    // product location
    async productLocation(productName: string) {
        await this.goToProductDetails(productName);
        await this.click(singleProductCustomer.menus.location);
        await this.multipleElementVisible(singleProductCustomer.location);
    }

    // product warranty policy
    async productWarrantyPolicy(productName: string) {
        await this.goToProductDetails(productName);
        await this.click(singleProductCustomer.menus.warrantyPolicy);
        await this.multipleElementVisible(singleProductCustomer.warrantyPolicy);
    }

    // view vendor more product
    async viewMoreProducts(productName: string) {
        await this.goToProductDetails(productName);
        await this.click(singleProductCustomer.menus.moreProducts);
        await this.toBeVisible(singleProductCustomer.moreProducts.moreProductsDiv);
        await this.notToHaveCount(singleProductCustomer.moreProducts.product, 0);
    }

    // view vendor more product
    async viewRelatedProducts(productName: string) {
        await this.goToProductDetails(productName);
        await this.multipleElementVisible(singleProductCustomer.relatedProducts);
    }

    // view highlighted vendor info
    async viewHighlightedVendorInfo(productName: string) {
        await this.goToProductDetails(productName);
        await this.multipleElementVisible(singleProductCustomer.vendorHighlightedInfo);
    }
}
