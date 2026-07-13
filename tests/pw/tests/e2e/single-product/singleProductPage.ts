import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { helpers, toPath, parseBoolean, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

// ============================================================================
// Single Product (customer storefront) — de-stub / revival.
//
// Ported from the pre-refactor page object tests/pw/pages/singleProductPage.ts
// (git e2ec507de) which extended CustomerPage. The customer-facing single
// product template is still the classic WooCommerce/PHP product page (gallery,
// tabbed summary: description / reviews / vendor info / location / more
// products, related products, and the Pro-only get-support / report-abuse /
// highlighted-vendor / enquiry surfaces). The methods below reproduce the exact
// flow and assertions from the reference, with the base-class helpers
// (goToProductDetails, multipleElementVisible, toBeVisible, click, clearAndType,
// clickAndWaitForResponseAndLoadState, toContainText, notToHaveCount) inlined as
// raw Playwright.
//
// data / payloads / ApiUtils are re-exported REAL from @utils so the spec's
// beforeAll can seed a real product over the WC REST API.
// ============================================================================

// Re-export the REAL utils the spec imports from this module.
export { data };
export { payloads } from '@utils/payloads';

// Pro injects the get-support / report-abuse / highlighted-vendor / location /
// enquiry surfaces onto the storefront product page — gate those assertions on
// the build flag (parseBoolean, never a raw env string).
const DOKAN_PRO = parseBoolean(process.env.DOKAN_PRO);

// Sub-URLs (from @utils/testData) used by the single-product flow.
// WooCommerce product permalink base is `/product/<slug>/` on this install; the
// legacy shared `shop/uncategorized/<slug>` structure 404s (products are seeded
// into a non-default category), so build the canonical permalink directly.
const productDetailsUrl = (productName: string): string => `${data.subUrls.frontend.productCustomerPage}/${helpers.slugify(productName)}`; // 'product/<slug>'
const productReviewUrl = data.subUrls.frontend.productReview; // 'wp-comments-post.php'

/**
 * Null-tolerant ApiUtils wrapper (mirrors the sibling de-stubbed POs).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context
 * and swap it in before the first real HTTP call (and before dispose()).
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
// Co-located selectors (ported from selector.customer.cSingleProduct @ e2ec507de).
// ----------------------------------------------------------------------------
export const singleProductSelectors = {
    // Product details (summary column)
    productDetails: {
        productImage: '.woocommerce-product-gallery__wrapper img.wp-post-image',
        productTitle: '.product_title.entry-title',
        price: '//div[@class="summary entry-summary"]//p[@class="price"]',
        quantity: 'div.quantity input.qty',
        addToCart: 'button.single_add_to_cart_button',
        category: '.product_meta .posted_in',
    },

    // Tabbed sub-menus
    menus: {
        description: '.tabs description_tab a',
        shipping: '.tabs .shipping_tab a',
        reviews: '.tabs .reviews_tab a',
        vendorInfo: '.tabs .seller_tab a',
        location: '.tabs .geolocation_tab a',
        moreProducts: '.tabs .more_seller_product_tab a',
        warrantyPolicy: '.tabs .refund_policy_tab a',
        productEnquiry: '.tabs .seller_enquiry_form_tab a',
    },

    // Description tab
    description: {
        content: 'div[id="tab-description"] p',
    },

    // Reviews tab
    reviews: {
        noReviews: '.woocommerce-noreviews',
        ratings: '.comment-form-rating .stars',
        rating: (star: string): string => `.star-${star}`,
        reviewMessage: '#comment',
        submitReview: '#submit',
        submittedReview: (reviewMessage: string): string => `//div[@class='comment_container']//div[@class='description']// p[text()='${reviewMessage}']`,
    },

    // Vendor info tab
    vendorInfo: {
        storeName: '.store-name',
        vendor: '.seller-name',
        storeAddress: '.store-address',
    },

    // Location tab
    location: {
        productLocation: 'div[id="tab-geolocation"] address',
        map: '#dokan-geolocation-locations-map',
    },

    // More products tab
    moreProducts: {
        noProductsDiv: 'div#tab-more_seller_product',
        moreProductsDiv: '#tab-more_seller_product .products',
        product: '#tab-more_seller_product .product',
    },

    // Warranty / refund policy tab
    warrantyPolicy: {
        content: 'div[id="tab-refund_policy"] p',
    },

    // Product enquiry tab (Pro)
    productEnquiry: {
        productEnquiryHeading: '//h3[normalize-space()="Product Enquiry"]',
        enquiryMessage: '#dokan-enq-message',
        submitEnquiry: 'input.dokan-btn-theme',
    },

    // Related products
    relatedProducts: {
        relatedProductHeading: '//h2[normalize-space()="Related products"]',
        products: '.related.products .products',
    },

    // Highlighted vendor info (Pro)
    vendorHighlightedInfo: {
        vendorInfoDiv: '.dokan-vendor-info-wrap',
        vendorImage: '.dokan-vendor-image',
        vendorInfo: '.dokan-vendor-info',
        vendorName: '.dokan-vendor-name',
        vendorRating: '.dokan-vendor-rating',
    },

    // Get support (Pro)
    getSupport: {
        getSupport: '.dokan-store-support-btn',
    },

    // Report abuse (Pro)
    reportAbuse: {
        reportAbuse: 'a.dokan-report-abuse-button',
    },
} as const;

const s = singleProductSelectors;

type Review = { rating: string; reviewMessage: () => string };

export class SingleProductPage {
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

    private async goToProductDetails(productName: string): Promise<void> {
        await this.goIfNotThere(productDetailsUrl(productName));
    }

    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).first().click();
    }

    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).first().fill(text);
    }

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toBeVisible();
    }

    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toContainText(text);
    }

    private async notToHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    // recurse into nested plain objects, assert every string selector visible,
    // skip functions — mirrors basePage.multipleElementVisible.
    private async multipleElementVisible(sels: Record<string, unknown>): Promise<void> {
        for (const key in sels) {
            const v = sels[key];
            if (typeof v === 'string') {
                await this.toBeVisible(v);
            } else if (v && typeof v === 'object' && !Array.isArray(v)) {
                await this.multipleElementVisible(v as Record<string, unknown>);
            }
            // functions skipped
        }
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
    // Single product page — customer methods (REAL).
    // ==================================================================

    // single product page renders properly
    async singleProductRenderProperly(productName: string): Promise<void> {
        await this.goToProductDetails(productName);

        // basic product details are visible
        await this.multipleElementVisible({
            productImage: s.productDetails.productImage,
            productTitle: s.productDetails.productTitle,
            price: s.productDetails.price,
            quantity: s.productDetails.quantity,
            addToCart: s.productDetails.addToCart,
            category: s.productDetails.category,
        });

        // description elements are visible
        await this.multipleElementVisible(s.description);

        // review elements are visible
        await this.click(s.menus.reviews);
        await this.toBeVisible(s.reviews.ratings);
        await this.toBeVisible(s.reviews.reviewMessage);
        await this.toBeVisible(s.reviews.submitReview);

        // vendor info elements are visible
        await this.click(s.menus.vendorInfo);
        await this.multipleElementVisible(s.vendorInfo);

        // more products elements are visible
        await this.click(s.menus.moreProducts);
        await this.toBeVisible(s.moreProducts.moreProductsDiv);
        await this.notToHaveCount(s.moreProducts.product, 0);

        // related products elements are visible
        await this.multipleElementVisible(s.relatedProducts);

        if (DOKAN_PRO) {
            // get support is visible
            await this.toBeVisible(s.getSupport.getSupport);

            // report abuse is visible
            await this.toBeVisible(s.reportAbuse.reportAbuse);

            // vendor highlighted info elements are visible
            await this.multipleElementVisible(s.vendorHighlightedInfo);

            // product location elements are visible
            await this.click(s.menus.location);
            // location address gets reset by other tests — assert only the map (matches reference)
            await this.toBeVisible(s.location.map);

            // product enquiry is visible
            await this.click(s.menus.productEnquiry);
            await this.multipleElementVisible({
                productEnquiryHeading: s.productEnquiry.productEnquiryHeading,
                enquiryMessage: s.productEnquiry.enquiryMessage,
                submitEnquiry: s.productEnquiry.submitEnquiry,
            });
        }
    }

    // review a product
    async reviewProduct(productName: string, review: Review): Promise<void> {
        await this.goToProductDetails(productName);
        const reviewMessage = review.reviewMessage();
        await this.click(s.menus.reviews);
        await this.click(s.reviews.rating(review.rating));
        await this.clearAndType(s.reviews.reviewMessage, reviewMessage);
        await this.clickAndWaitForResponseAndLoadState(productReviewUrl, s.reviews.submitReview, 302);
        await this.toContainText(s.reviews.submittedReview(reviewMessage), reviewMessage);
    }

    // product vendor info
    async productVendorInfo(productName: string): Promise<void> {
        await this.goToProductDetails(productName);
        await this.click(s.menus.vendorInfo);
        await this.multipleElementVisible(s.vendorInfo);
    }

    // product location
    async productLocation(productName: string): Promise<void> {
        await this.goToProductDetails(productName);
        await this.click(s.menus.location);
        // location address gets reset by other tests — assert only the map (matches reference)
        await this.toBeVisible(s.location.map);
    }

    // product warranty policy
    async productWarrantyPolicy(productName: string): Promise<void> {
        await this.goToProductDetails(productName);
        await this.click(s.menus.warrantyPolicy);
        await this.multipleElementVisible(s.warrantyPolicy);
    }

    // view vendor's more products
    async viewMoreProducts(productName: string): Promise<void> {
        await this.goToProductDetails(productName);
        await this.click(s.menus.moreProducts);
        await this.toBeVisible(s.moreProducts.moreProductsDiv);
        await this.notToHaveCount(s.moreProducts.product, 0);
    }

    // view related products
    async viewRelatedProducts(productName: string): Promise<void> {
        await this.goToProductDetails(productName);
        await this.multipleElementVisible(s.relatedProducts);
    }

    // view highlighted vendor info
    async viewHighlightedVendorInfo(productName: string): Promise<void> {
        await this.goToProductDetails(productName);
        await this.multipleElementVisible(s.vendorHighlightedInfo);
    }
}
