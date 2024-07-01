import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const productReviewsVendor = selector.vendor.vReviews;

export class ProductReviewsPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // vendor product review render properly
    async vendorProductReviewsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reviews);

        // settings text is visible
        await this.toBeVisible(productReviewsVendor.reviewsText);

        // product review menu elements are visible
        await this.multipleElementVisible(productReviewsVendor.menus);

        // product review bulk action elements are visible
        await this.multipleElementVisible(productReviewsVendor.bulkActions);

        // product review table elements are visible
        await this.multipleElementVisible(productReviewsVendor.table);

        const noReviewsFound = await this.isVisible(productReviewsVendor.noReviewsFound);
        if (noReviewsFound) {
            return;
        }

        await this.notToHaveCount(productReviewsVendor.numberOfRowsFound, 0);
    }

    // view product review
    async viewProductReview(reviewMessage: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reviews);
        await this.clickAndWaitForLoadState(productReviewsVendor.reviewLink(reviewMessage));
        await this.toBeVisible(productReviewsVendor.reviewDetails.reviewMessageByMessage(reviewMessage));
    }

    // update product review status
    async updateProductReview(action: string, reviewMessage: string) {
        await this.goto(data.subUrls.frontend.vDashboard.reviews);

        switch (action) {
            case 'unApprove':
                await this.hover(productReviewsVendor.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, productReviewsVendor.unApproveReview(reviewMessage));
                break;

            case 'spam':
                await this.hover(productReviewsVendor.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, productReviewsVendor.spamReview(reviewMessage));
                break;

            case 'trash':
                await this.hover(productReviewsVendor.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, productReviewsVendor.trashReview(reviewMessage));
                break;

            case 'approve':
                await this.clickAndWaitForLoadState(productReviewsVendor.menus.pending);
                await this.hover(productReviewsVendor.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, productReviewsVendor.approveReview(reviewMessage));
                break;

            case 'restore':
                await this.clickAndWaitForLoadState(productReviewsVendor.menus.trash);
                await this.hover(productReviewsVendor.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, productReviewsVendor.restoreReview(reviewMessage));
                break;

            case 'permanently-delete':
                await this.clickAndWaitForLoadState(productReviewsVendor.menus.trash);
                await this.hover(productReviewsVendor.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, productReviewsVendor.permanentlyDeleteReview(reviewMessage));
                break;

            default:
                break;
        }
    }

    // product review bulk action
    async productReviewsBulkActions(action: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reviews);

        // ensure row exists
        await this.notToBeVisible(productReviewsVendor.noReviewsFound);

        await this.click(productReviewsVendor.bulkActions.selectAll);
        await this.selectByValue(productReviewsVendor.bulkActions.selectAction, action);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.reviews, productReviewsVendor.bulkActions.applyAction);
    }
}
