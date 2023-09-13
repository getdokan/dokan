import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { storeReview } from '@utils/interfaces';

export class StoreReviewsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // store reviews

    // store reviews render properly
    async adminStoreReviewsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.storeReviews);

        // store reviews text is visible
        await this.toBeVisible(
            selector.admin.dokan.storeReviews.storeReviewsText,
        );

        // nav tabs are visible
        await this.multipleElementVisible(
            selector.admin.dokan.storeReviews.navTabs,
        );

        // bulk action elements are visible
        await this.multipleElementVisible(
            selector.admin.dokan.storeReviews.bulkActions,
        );

        // filter elements are visible
        const { filterInput, filterClear, ...filters } =
            selector.admin.dokan.storeReviews.filters;
        await this.multipleElementVisible(filters);

        // store reviews table elements are visible
        await this.multipleElementVisible(
            selector.admin.dokan.storeReviews.table,
        );
    }

    // filter store reviews
    async filterStoreReviews(vendorName: string) {
        await this.goto(data.subUrls.backend.dokan.storeReviews);

        // filter by vendor
        await this.click(
            selector.admin.dokan.storeReviews.filters.filterByVendor,
        );
        await this.typeAndWaitForResponse(
            data.subUrls.api.dokan.stores,
            selector.admin.dokan.storeReviews.filters.filterInput,
            vendorName,
        );
        await this.pressAndWaitForResponse(
            data.subUrls.api.dokan.storeReviews,
            data.key.enter,
        );
    }

    // view  store review
    async viewStoreReview() {
        await this.goto(data.subUrls.backend.dokan.storeReviews);
        await this.click(
            selector.admin.dokan.storeReviews.storeReviewFirstLink,
        );
        const { rating, ...editReview } =
            selector.admin.dokan.storeReviews.editReview;
        await this.multipleElementVisible(editReview);
        await this.click(
            selector.admin.dokan.storeReviews.editReview.modalClose,
        );
    }

    // edit store review
    async editStoreReview(review: storeReview['review']) {
        await this.goto(data.subUrls.backend.dokan.storeReviews);
        await this.hover(
            selector.admin.dokan.storeReviews.storeReviewFirstCell,
        );
        await this.click(selector.admin.dokan.storeReviews.storeReviewEdit);

        await this.click(
            selector.admin.dokan.storeReviews.editReview.rating(review.rating),
        );
        await this.clearAndType(
            selector.admin.dokan.storeReviews.editReview.title,
            review.title,
        );
        await this.clearAndType(
            selector.admin.dokan.storeReviews.editReview.content,
            review.content,
        );

        await this.clickAndWaitForResponse(
            data.subUrls.api.dokan.storeReviews,
            selector.admin.dokan.storeReviews.editReview.update,
        );
    }

    // delete store review
    async deleteStoreReview() {
        await this.goto(data.subUrls.backend.dokan.storeReviews);
        await this.hover(
            selector.admin.dokan.storeReviews.storeReviewFirstCell,
        );
        await this.clickAndWaitForResponseAndLoadState(
            data.subUrls.api.dokan.storeReviews,
            selector.admin.dokan.storeReviews.storeReviewDelete,
        );
    }

    // restore store review
    async restoreStoreReview() {
        await this.goto(data.subUrls.backend.dokan.storeReviews);
        // await this.goIfNotThere(data.subUrls.backend.dokan.storeReviews);
        await this.clickAndWaitForResponse(
            data.subUrls.api.dokan.storeReviews,
            selector.admin.dokan.storeReviews.navTabs.trash,
        );

        await this.hover(
            selector.admin.dokan.storeReviews.storeReviewFirstCell,
        );
        await this.clickAndWaitForResponse(
            data.subUrls.api.dokan.storeReviews,
            selector.admin.dokan.storeReviews.storeReviewRestore,
        );
    }

    // permanently delete store review
    async permanentlyDeleteStoreReview() {
        await this.goto(data.subUrls.backend.dokan.storeReviews);
        await this.clickAndWaitForResponse(
            data.subUrls.api.dokan.storeReviews,
            selector.admin.dokan.storeReviews.navTabs.trash,
        );

        await this.hover(
            selector.admin.dokan.storeReviews.storeReviewFirstCell,
        );
        await this.clickAndWaitForResponse(
            data.subUrls.api.dokan.storeReviews,
            selector.admin.dokan.storeReviews.storeReviewPermanentlyDelete,
        );
    }

    // store reviews bulk action
    async storeReviewsBulkAction(action: string) {
        await this.goto(data.subUrls.backend.dokan.storeReviews);

        // ensure row exists
        await this.notToBeVisible(
            selector.admin.dokan.storeReviews.noRowsFound,
        );

        await this.click(
            selector.admin.dokan.storeReviews.bulkActions.selectAll,
        );
        await this.selectByValue(
            selector.admin.dokan.storeReviews.bulkActions.selectAction,
            action,
        );
        await this.clickAndWaitForResponse(
            data.subUrls.api.dokan.storeReviews,
            selector.admin.dokan.storeReviews.bulkActions.applyAction,
        );
    }

    // customer review store
    async reviewStore(
        storeName: string,
        review: storeReview['review'],
        action: string,
    ): Promise<void> {
        await this.goIfNotThere(
            data.subUrls.frontend.storeReviews(helpers.slugify(storeName)),
        );
        // await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)));
        // await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.storeReviews(helpers.slugify(storeName)), selector.customer.cSingleStore.storeTabs.reviews);

        // write new or edit previous review
        if (action === 'create') {
            await this.click(selector.customer.cSingleStore.review.write);
        } else {
            await this.click(selector.customer.cSingleStore.review.edit);
        }
        await this.setAttributeValue(
            selector.customer.cSingleStore.review.rating,
            'style',
            review.ratingByWidth,
        );
        await this.clearAndType(
            selector.customer.cSingleStore.review.title,
            review.title,
        );
        await this.clearAndType(
            selector.customer.cSingleStore.review.message,
            review.content,
        );
        await this.clickAndWaitForResponse(
            data.subUrls.ajax,
            selector.customer.cSingleStore.review.submit,
        );
        await this.toContainText(
            selector.customer.cSingleStore.review.submittedReview(
                review.content,
            ),
            review.content,
        );
    }

    // view own review
    async viewOwnReview(storeName: string): Promise<void> {
        await this.goIfNotThere(
            data.subUrls.frontend.storeReviews(helpers.slugify(storeName)),
        );
        await this.multipleElementVisible(
            selector.customer.cSingleStore.review.reviewDetails,
        );
    }

    // cant review own store
    async cantReviewOwnStore(storeName: string): Promise<void> {
        await this.goIfNotThere(
            data.subUrls.frontend.storeReviews(helpers.slugify(storeName)),
        );
        await this.notToBeVisible(selector.customer.cSingleStore.review.write);
        await this.notToBeVisible(selector.customer.cSingleStore.review.edit);
    }
}
