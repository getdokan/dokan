import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';

export class ProductReviewsPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // vendor product review render properly
    async vendorProductReviewsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reviews);

        // settings text is visible
        await this.toBeVisible(selector.vendor.vReviews.reviewsText);

        // product review menu elements are visible
        await this.multipleElementVisible(selector.vendor.vReviews.menus);

        // product review bulk action elements are visible
        await this.multipleElementVisible(selector.vendor.vReviews.bulkActions);

        // product review table elements are visible
        await this.multipleElementVisible(selector.vendor.vReviews.table);

        const noReviewsFound = await this.isVisible(selector.vendor.vReviews.noReviewsFound);
        if (noReviewsFound) {
            return;
        }

        await this.notToHaveCount(selector.vendor.vReviews.numberOfRowsFound, 0);
    }

    // view product review
    async viewProductReview(reviewMessage: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reviews);
        await this.clickAndWaitForLoadState(selector.vendor.vReviews.reviewLink(reviewMessage));
        await this.toBeVisible(selector.vendor.vReviews.reviewDetails.reviewMessageByMessage(reviewMessage));
    }

    // update product review status
    async updateProductReview(action: string, reviewMessage: string) {
        await this.goto(data.subUrls.frontend.vDashboard.reviews);

        switch (action) {
            case 'unApprove':
                await this.hover(selector.vendor.vReviews.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vReviews.unApproveReview(reviewMessage));
                break;

            case 'spam':
                await this.hover(selector.vendor.vReviews.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vReviews.spamReview(reviewMessage));
                break;

            case 'trash':
                await this.hover(selector.vendor.vReviews.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vReviews.trashReview(reviewMessage));
                break;

            case 'approve':
                await this.clickAndWaitForLoadState(selector.vendor.vReviews.menus.pending);
                await this.hover(selector.vendor.vReviews.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vReviews.approveReview(reviewMessage));
                break;

            case 'restore':
                await this.clickAndWaitForLoadState(selector.vendor.vReviews.menus.trash);
                await this.hover(selector.vendor.vReviews.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vReviews.restoreReview(reviewMessage));
                break;

            case 'permanently-delete':
                await this.clickAndWaitForLoadState(selector.vendor.vReviews.menus.trash);
                await this.hover(selector.vendor.vReviews.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vReviews.permanentlyDeleteReview(reviewMessage));
                break;

            default:
                break;
        }
    }

    // product review bulk action
    async productReviewsBulkActions(action: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reviews);

        // ensure row exists
        await this.notToBeVisible(selector.vendor.vReviews.noReviewsFound);

        await this.click(selector.vendor.vReviews.bulkActions.selectAll);
        await this.selectByValue(selector.vendor.vReviews.bulkActions.selectAction, action);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.reviews, selector.vendor.vReviews.bulkActions.applyAction);
    }
}
