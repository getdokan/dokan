import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

// ============================================================================
// Product Reviews — VENDOR-ONLY revival (ported from the pre-refactor PO).
//
// The vendor Reviews screen (/dashboard/reviews) still renders the classic
// PHP/jQuery WP-comments table (menus: Approved/Pending/Spam/Trash, a bulk
// action bar, and row actions driven over admin-ajax.php) inside the new
// dashboard shell. The four methods below reproduce the exact flow/assertions
// from tests/pw/pages/productReviewsPage.ts (git e2ec507de), with the base
// class helpers inlined as raw Playwright.
//
// data / payloads / ApiUtils are re-exported REAL from @utils so the spec's
// beforeAll can seed real reviews over the WC REST API.
// ============================================================================

// Re-export the REAL payloads used by the spec (createProductReview + vendorAuth).
export { payloads } from '@utils/payloads';

/**
 * Null-tolerant ApiUtils wrapper (mirrors the sibling de-stubbed POs).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context
 * and swap it in before the first real HTTP call.
 */
export class ApiUtils extends RealApiUtils {
    private lazyCtx: Promise<APIRequestContext> | null = null;

    constructor(ctx: APIRequestContext | null) {
        super(ctx as APIRequestContext);
        if (!ctx) this.lazyCtx = pwRequest.newContext();
    }

    private async ready(): Promise<void> {
        if (this.lazyCtx) {
            const ctx = await this.lazyCtx;
            this.lazyCtx = null;
            (this as { request: APIRequestContext }).request = ctx;
        }
    }

    override async post(...args: Parameters<RealApiUtils['post']>): ReturnType<RealApiUtils['post']> {
        await this.ready();
        return super.post(...args);
    }

    override async get(...args: Parameters<RealApiUtils['get']>): ReturnType<RealApiUtils['get']> {
        await this.ready();
        return super.get(...args);
    }

    override async delete(...args: Parameters<RealApiUtils['delete']>): ReturnType<RealApiUtils['delete']> {
        await this.ready();
        return super.delete(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ----------------------------------------------------------------------------
// Sub-URLs (from @utils/testData) used by the vendor Reviews flow.
// ----------------------------------------------------------------------------
const reviewsUrl = data.subUrls.frontend.vDashboard.reviews; // 'dashboard/reviews'
const ajaxUrl = data.subUrls.ajax; // '/admin-ajax.php'

// ----------------------------------------------------------------------------
// Co-located selectors (ported from selector.vendor.vReviews @ e2ec507de).
// ----------------------------------------------------------------------------
export const productReviewsSelectors = {
    reviewsText: '//h1[normalize-space()="Reviews"]',

    // menus
    menus: {
        approved: '//div[@id="dokan-comments_menu"]//a[contains(text(), "Approved")]',
        pending: '//div[@id="dokan-comments_menu"]//a[contains(text(), "Pending")]',
        spam: '//div[@id="dokan-comments_menu"]//a[contains(text(), "Spam")]',
        trash: '//div[@id="dokan-comments_menu"]//a[contains(text(), "Trash")]',
    },

    // bulk actions
    bulkActions: {
        selectAll: '.dokan-check-all',
        selectAction: 'select[name="comment_status"]', // none, hold, spam, trash, approve, delete
        applyAction: 'input[value="Apply"]',
    },

    // table
    table: {
        table: '#dokan-comments-table',
        authorColumn: '//th[normalize-space()="Author"]',
        commentColumn: '//th[normalize-space()="Comment"]',
        linkToColumn: '//th[normalize-space()="Link To"]',
        ratingColumn: '//th[normalize-space()="Rating"]',
    },

    noReviewsFound: '//td[normalize-space()="No Results Found"]',
    numberOfRowsFound: '.dokan-reviews-content tbody tr',

    // review row actions (scoped to the row that holds `reviewMessage`)
    reviewRow: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/../..`,
    reviewMessageCell: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..`,
    rowActions: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//ul[@class='dokan-cmt-row-actions']`,
    unApproveReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//a[contains(text(),'Unapprove')]`,
    approveReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//a[contains(text(),'Approve')]`,
    spamReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//a[contains(text(),'Spam')]`,
    trashReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//a[contains(text(),'Trash')]`,
    restoreReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//a[contains(text(),'Restore')]`,
    permanentlyDeleteReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//a[contains(text(),'Delete Permanently')]`,
    reviewLink: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/../..//td[@class="col-link"]//a`,
    viewReview: '//a[contains(text(),"View Comment")]',

    reviewDetails: {
        reviewer: 'strong.woocommerce-review__author',
        reviewPublishDate: 'time.woocommerce-review__published-date',
        reviewMessage: '.comment-text .description p',
        rating: '#reviews div.star-rating',
        reviewMessageByMessage: (reviewMessage: string) => `//div[@class="description"]//p[contains(text(), '${reviewMessage}')]`,
    },
} as const;

const s = productReviewsSelectors;

export class ProductReviewsPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // ------------------------------------------------------------------
    // Inlined base helpers (base-class methods → raw Playwright).
    // ------------------------------------------------------------------
    private async goto(subPath: string): Promise<void> {
        await this.page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        const target = toPath(subPath).replace(/\/$/, '');
        const current = this.page.url().replace(/\/$/, '');
        if (current !== target) {
            await this.goto(subPath);
        }
    }

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toBeVisible();
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toBeHidden();
    }

    private async notToHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    private async isVisible(selector: string, timeoutMs = 2000): Promise<boolean> {
        try {
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    private async multipleElementVisible(sels: Record<string, unknown>): Promise<void> {
        for (const key in sels) {
            const v = sels[key];
            if (typeof v === 'string') await this.toBeVisible(v);
        }
    }

    private async hover(selector: string): Promise<void> {
        await this.page.locator(selector).first().hover();
    }

    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).first().click();
    }

    private async selectByValue(selector: string, value: string): Promise<void> {
        await this.page.selectOption(selector, { value });
    }

    // force the (hover-revealed) row-action bar to be visible — avoids flakiness
    // when hover doesn't settle before the click.
    private async setElementCssStyle(selector: string, property: string, value: string): Promise<void> {
        await this.page.locator(selector).first().evaluate(
            (el, args) => {
                (el as HTMLElement).style.setProperty(args[0], args[1]);
            },
            [property, value] as [string, string],
        );
    }

    private async clickAndWaitForLoadState(selector: string): Promise<void> {
        await Promise.all([
            this.page.waitForLoadState('domcontentloaded'),
            this.page.locator(selector).first().click(),
        ]);
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).first().click(),
        ]);
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).first().click(),
        ]);
        expect(response.status()).toBe(code);
    }

    // ==================================================================
    // VENDOR methods — REAL (legacy /dashboard/reviews regression).
    // ==================================================================

    // vendor product review menu page renders properly
    async vendorProductReviewsRenderProperly(): Promise<void> {
        await this.goIfNotThere(reviewsUrl);

        // reviews heading is visible
        await this.toBeVisible(s.reviewsText);

        // review menu elements are visible
        await this.multipleElementVisible(s.menus);

        // bulk action elements are visible
        await this.multipleElementVisible(s.bulkActions);

        // review table elements are visible
        await this.multipleElementVisible(s.table);

        const noReviewsFound = await this.isVisible(s.noReviewsFound);
        if (noReviewsFound) {
            return;
        }

        await this.notToHaveCount(s.numberOfRowsFound, 0);
    }

    // view a single product review
    async viewProductReview(reviewMessage: string): Promise<void> {
        await this.goIfNotThere(reviewsUrl);
        await this.clickAndWaitForLoadState(s.reviewLink(reviewMessage));
        await this.toBeVisible(s.reviewDetails.reviewMessageByMessage(reviewMessage));
    }

    // update a product review's status
    async updateProductReview(action: string, reviewMessage: string): Promise<void> {
        await this.goto(reviewsUrl);

        switch (action) {
            case 'unApprove':
                await this.hover(s.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(ajaxUrl, s.unApproveReview(reviewMessage));
                break;

            case 'spam':
                await this.hover(s.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(ajaxUrl, s.spamReview(reviewMessage));
                break;

            case 'trash':
                await this.hover(s.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(ajaxUrl, s.trashReview(reviewMessage));
                break;

            case 'approve':
                await this.clickAndWaitForLoadState(s.menus.pending);
                await this.setElementCssStyle(s.rowActions(reviewMessage), 'visibility', 'visible'); // force row actions visible, to avoid flakiness
                await this.hover(s.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(ajaxUrl, s.approveReview(reviewMessage));
                break;

            case 'restore':
                await this.clickAndWaitForLoadState(s.menus.trash);
                await this.hover(s.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(ajaxUrl, s.restoreReview(reviewMessage));
                break;

            case 'permanently-delete':
                await this.clickAndWaitForLoadState(s.menus.trash);
                await this.hover(s.reviewMessageCell(reviewMessage));
                await this.clickAndWaitForResponse(ajaxUrl, s.permanentlyDeleteReview(reviewMessage));
                break;

            default:
                break;
        }
    }

    // bulk action on product reviews
    async productReviewsBulkActions(action: string): Promise<void> {
        await this.goIfNotThere(reviewsUrl);

        // ensure at least one row exists
        await this.notToBeVisible(s.noReviewsFound);

        await this.click(s.bulkActions.selectAll);
        await this.selectByValue(s.bulkActions.selectAction, action);
        await this.clickAndWaitForResponseAndLoadState(reviewsUrl, s.bulkActions.applyAction);
    }
}
