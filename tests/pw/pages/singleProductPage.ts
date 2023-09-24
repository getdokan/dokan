import { Page } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { product } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

export class SingleProductPage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // single product page

    // single product render properly
    async singleProductRenderProperly(productName: string) {
        await this.goToProductDetails(productName);

        // basic details are visible
        const { viewCart, ...productDetails } = selector.customer.cSingleProduct.productDetails;
        await this.multipleElementVisible(productDetails);

        // description elements are visible
        // await this.click(selector.customer.cSingleProduct.menus.description);
        await this.multipleElementVisible(selector.customer.cSingleProduct.description);

        // review elements are visible
        await this.click(selector.customer.cSingleProduct.menus.reviews);

        await this.toBeVisible(selector.customer.cSingleProduct.reviews.ratings);
        await this.toBeVisible(selector.customer.cSingleProduct.reviews.reviewMessage);
        await this.toBeVisible(selector.customer.cSingleProduct.reviews.submitReview);

        // vendor info elements are visible
        await this.click(selector.customer.cSingleProduct.menus.vendorInfo);
        await this.multipleElementVisible(selector.customer.cSingleProduct.vendorInfo);

        // more products elements are visible
        await this.click(selector.customer.cSingleProduct.menus.moreProducts);
        await this.toBeVisible(selector.customer.cSingleProduct.moreProducts.moreProductsDiv);
        await this.notToHaveCount(selector.customer.cSingleProduct.moreProducts.product, 0);

        // related products elements are visible
        await this.multipleElementVisible(selector.customer.cSingleProduct.relatedProducts);

        if (DOKAN_PRO) {
            // get support is visible
            await this.toBeVisible(selector.customer.cSingleProduct.getSupport.getSupport);

            // report abuse is visible
            await this.toBeVisible(selector.customer.cSingleProduct.reportAbuse.reportAbuse);

            // vendor highlighted info elements are visible
            await this.multipleElementVisible(selector.customer.cSingleProduct.vendorHighlightedInfo);

            // product shipping elements are visible
            // await this.click(selector.customer.cSingleProduct.menus.shipping);
            // await this.multipleElementVisible(selector.customer.cSingleProduct.shipping);  // todo:  need vendor shipping

            // product location elements are visible
            await this.click(selector.customer.cSingleProduct.menus.location);
            await this.multipleElementVisible(selector.customer.cSingleProduct.location);

            // // warranty policy is visible
            // await this.click(selector.customer.cSingleProduct.menus.warrantyPolicy);
            // await this.multipleElementVisible(selector.customer.cSingleProduct.warrantyPolicy); // todo:  need warranty policy

            // product enquiry is visible
            await this.click(selector.customer.cSingleProduct.menus.productEnquiry);
            const { submitEnquirySuccessMessage, guest, ...productEnquiry } = selector.customer.cSingleProduct.productEnquiry;
            await this.multipleElementVisible(productEnquiry);
        }
    }

    // review product
    async reviewProduct(productName: string, review: product['review']): Promise<void> {
        await this.goToProductDetails(productName);
        const reviewMessage = review.reviewMessage();
        await this.click(selector.customer.cSingleProduct.menus.reviews);
        await this.click(selector.customer.cSingleProduct.reviews.rating(review.rating));
        await this.clearAndType(selector.customer.cSingleProduct.reviews.reviewMessage, reviewMessage);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.productReview, selector.customer.cSingleProduct.reviews.submitReview, 302);
        await this.toContainText(selector.customer.cSingleProduct.reviews.submittedReview(reviewMessage), reviewMessage);
    }

    // product vendor info
    async productVendorInfo(productName: string) {
        await this.goToProductDetails(productName);
        await this.click(selector.customer.cSingleProduct.menus.vendorInfo);
        await this.multipleElementVisible(selector.customer.cSingleProduct.vendorInfo);
    }

    // product location
    async productLocation(productName: string) {
        await this.goToProductDetails(productName);
        await this.click(selector.customer.cSingleProduct.menus.location);
        await this.multipleElementVisible(selector.customer.cSingleProduct.location);
    }

    // product warranty policy
    async productWarrantyPolicy(productName: string) {
        await this.goToProductDetails(productName);
        await this.click(selector.customer.cSingleProduct.menus.warrantyPolicy);
        await this.multipleElementVisible(selector.customer.cSingleProduct.warrantyPolicy);
    }

    // view vendor more product
    async viewMoreProducts(productName: string) {
        await this.goToProductDetails(productName);
        await this.click(selector.customer.cSingleProduct.menus.moreProducts);

        await this.toBeVisible(selector.customer.cSingleProduct.moreProducts.moreProductsDiv);
        await this.notToHaveCount(selector.customer.cSingleProduct.moreProducts.product, 0);
    }

    // view vendor more product
    async viewRelatedProducts(productName: string) {
        await this.goToProductDetails(productName);
        await this.multipleElementVisible(selector.customer.cSingleProduct.relatedProducts);
    }

    // view highlighted vendor info
    async viewHighlightedVendorInfo(productName: string) {
        await this.goToProductDetails(productName);
        await this.multipleElementVisible(selector.customer.cSingleProduct.vendorHighlightedInfo);
    }
}
