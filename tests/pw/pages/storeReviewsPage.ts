import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { storeReview } from '@utils/interfaces';

// selectors
const storeReviewsAdmin = selector.admin.dokan.storeReviews;
const storeReviewsCustomer = selector.customer.cSingleStore.review;

export class StoreReviewsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // store reviews

    // store reviews render properly
    async adminStoreReviewsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.storeReviews);

        // store reviews text is visible
        await this.toBeVisible(storeReviewsAdmin.storeReviewsText);

        // nav tabs are visible
        await this.multipleElementVisible(storeReviewsAdmin.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(storeReviewsAdmin.bulkActions);

        // filter elements are visible
        const { filterInput, filterClear, ...filters } = storeReviewsAdmin.filters;
        await this.multipleElementVisible(filters);

        // store reviews table elements are visible
        await this.multipleElementVisible(storeReviewsAdmin.table);
    }

    // filter store reviews
    async filterStoreReviews(vendorName: string) {
        await this.goto(data.subUrls.backend.dokan.storeReviews);

        // filter by vendor
        await this.click(storeReviewsAdmin.filters.filterByVendor);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, storeReviewsAdmin.filters.filterInput, vendorName);
        await this.pressAndWaitForResponse(data.subUrls.api.dokan.storeReviews, data.key.enter);
    }

    // view  store review
    async viewStoreReview() {
        await this.goto(data.subUrls.backend.dokan.storeReviews);
        await this.click(storeReviewsAdmin.storeReviewFirstLink);
        const { rating, ...editReview } = storeReviewsAdmin.editReview;
        await this.multipleElementVisible(editReview);
        await this.click(storeReviewsAdmin.editReview.modalClose);
    }

    // edit store review
    async editStoreReview(review: storeReview['review']) {
        await this.goto(data.subUrls.backend.dokan.storeReviews);
        await this.hover(storeReviewsAdmin.storeReviewFirstCell);
        await this.click(storeReviewsAdmin.storeReviewEdit);

        await this.click(storeReviewsAdmin.editReview.rating(review.rating));
        await this.clearAndType(storeReviewsAdmin.editReview.title, review.title);
        await this.clearAndType(storeReviewsAdmin.editReview.content, review.content);

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeReviews, storeReviewsAdmin.editReview.update);
    }

    async updateStoreReview(action: string) {
        await this.goto(data.subUrls.backend.dokan.storeReviews);

        switch (action) {
            case 'trash':
                await this.hover(storeReviewsAdmin.storeReviewFirstCell);
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeReviews, storeReviewsAdmin.storeReviewDelete);
                break;

            case 'permanently-delete':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeReviews, storeReviewsAdmin.navTabs.trash);
                await this.hover(storeReviewsAdmin.storeReviewFirstCell);
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeReviews, storeReviewsAdmin.storeReviewPermanentlyDelete);

                break;

            case 'restore':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeReviews, storeReviewsAdmin.navTabs.trash);
                await this.hover(storeReviewsAdmin.storeReviewFirstCell);
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeReviews, storeReviewsAdmin.storeReviewRestore);
                break;

            default:
                break;
        }
    }

    // store reviews bulk action
    async storeReviewsBulkAction(action: string) {
        await this.goto(data.subUrls.backend.dokan.storeReviews);

        // ensure row exists
        await this.notToBeVisible(storeReviewsAdmin.noRowsFound);

        await this.toPass(async () => {
            await this.check(storeReviewsAdmin.bulkActions.selectAll);
            const isChecked = await this.isChecked(storeReviewsAdmin.bulkActions.firstRowCheckbox);
            if (!isChecked) await this.check(storeReviewsAdmin.bulkActions.selectAll);
            await this.toBeEnabled(storeReviewsAdmin.bulkActions.applyAction);
        });

        await this.selectByValue(storeReviewsAdmin.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeReviews, storeReviewsAdmin.bulkActions.applyAction);
    }

    // customer review store
    async reviewStore(storeName: string, review: storeReview['review'], action: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.storeReviews(helpers.slugify(storeName)));

        // write new or edit previous review
        if (action === 'create') {
            await this.click(storeReviewsCustomer.write);
        } else {
            await this.click(storeReviewsCustomer.edit);
        }
        await this.setAttributeValue(storeReviewsCustomer.rating, 'style', review.ratingByWidth);
        await this.clearAndType(storeReviewsCustomer.title, review.title);
        await this.clearAndType(storeReviewsCustomer.message, review.content);
        await this.clickAndWaitForResponse(data.subUrls.ajax, storeReviewsCustomer.submit);
        await this.toContainText(storeReviewsCustomer.submittedReview(review.content), review.content);
    }

    // view own review
    async viewOwnReview(storeName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.storeReviews(helpers.slugify(storeName)));
        await this.multipleElementVisible(storeReviewsCustomer.reviewDetails);
    }

    // cant review own store
    async cantReviewOwnStore(storeName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.storeReviews(helpers.slugify(storeName)));
        await this.notToBeVisible(storeReviewsCustomer.write);
        await this.notToBeVisible(storeReviewsCustomer.edit);
    }
}
