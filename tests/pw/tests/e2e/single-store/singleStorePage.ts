import { Page, expect } from '@playwright/test';
import { toPath, helpers, parseBoolean, closeAnnouncementModal } from '@utils/helpers';
import { data } from '@utils/testData';

// ============================================================================
// Single Store (customer-facing) — legacy front-end de-stub.
//
// singleStore.spec.ts drives the public vendor storefront rendered at
// `store/<store-slug>` (the `.dokan-single-store` template): store profile,
// product grid, search, sort-by, store open/close time, terms & conditions and
// the social share bar. Ported verbatim from the pre-refactor
// pages/singleStorePage.ts + pages/selectors.ts (customer.cSingleStore) into
// raw Playwright with a co-located selectors object.
//
// `data` is re-exported REAL from @utils/testData so the spec resolves store
// names, product names, the vendor TOC string and the share platform key from
// the single source of truth (no local stubs).
// ============================================================================

// Re-export the REAL test data consumed by the spec.
export { data };

const DOKAN_PRO = parseBoolean(process.env.DOKAN_PRO);

// ---- Co-located selectors (pre-refactor selector.customer.cSingleStore) ----
export const singleStoreSelectors = {
    // Store profile summary
    storeProfile: {
        storeProfileInfoBox: 'div.profile-info-box',
        storeProfileSummary: '.dokan-single-store .profile-info-summery',
        storeBanner: 'div.profile-info-img',
        profileInfoHead: 'div.profile-info-head',
        profileImage: 'div.profile-img.profile-img-circle',
        storeName: 'div.profile-info-head h1.store-name',
        verifiedIcon: '//div[@data-original-title="Verified"]',
        verifiedIconByIcon: (icon: string) => `//div[@data-original-title="Verified"]//i[@class="${icon}"]`,
        profileInfo: 'div.profile-info',
        storeInfo: 'ul.dokan-store-info',
        storeAddress: 'li.dokan-store-address',
        storePhone: 'li.dokan-store-phone',
        storeEmail: 'li.dokan-store-email',
        euComplianceData: {
            companyName: 'li.dokan-company-name',
            companyId: 'li.dokan-company-id-number',
            vatNumber: 'li.dokan-vat-number',
            bankName: 'li.dokan-bank-name',
            bankIban: 'li.dokan-bank-iban',
        },
        storeSocial: 'ul.store-social',
    },

    // Store open/close time
    storeTime: {
        storeTimeDropDown: '.store-open-close-notice',
        storeTimeDiv: '#vendor-store-times',
        storeTimeHeading: '.store-times-heading',
        storeDays: '#vendor-store-times .store-days',
        storeTimes: '#vendor-store-times .store-times',
    },

    // Social icons
    storeSocialIcons: {
        facebook: '.fa-facebook-square',
        twitter: '.fa-square-x-twitter',
        pinterest: '.fa-pinterest-square',
        linked: '.fa-linkedin',
        youtube: '.fa-youtube-square',
        instagram: '.fa-instagram',
        flickr: '.fa-flickr',
    },

    // Store tabs
    storeTabs: {
        follow: 'button.dokan-follow-store-button',
        getSupport: 'button.dokan-store-support-btn',
        chatNow: 'button.dokan-live-chat',
        share: 'button.dokan-share-btn',
        products: '//div[@class="dokan-store-tabs"]//a[contains(text(),"Products")]',
        toc: '//div[@class="dokan-store-tabs"]//a[contains(text(),"Terms and Conditions")]',
        reviews: '//div[@class="dokan-store-tabs"]//a[contains(text(),"Reviews")]',
    },

    // Search product
    search: {
        input: '.product-name-search',
        button: '.search-store-products',
    },

    // Sort (popularity, rating, date, price, price-desc)
    sortBy: '.orderby',

    storeProducts: '.seller-items',

    // Product card
    productCard: {
        card: '.seller-items .product',
        productDetailsLink: '.seller-items .product .woocommerce-LoopProduct-link',
        productTitle: '.seller-items .product .woocommerce-loop-product__title',
        productPrice: '.seller-items .product .price',
        addToCart: '.seller-items .product .add_to_cart_button',
    },

    // Share store platforms
    sharePlatForms: {
        facebook: '.jssocials-share-facebook a',
        twitter: '.jssocials-share-twitter a',
        linkedin: '.jssocials-share-linkedin a',
        pinterest: '.jssocials-share-pinterest a',
        mail: '.jssocials-share-email a',
    },

    // Terms and conditions
    toc: {
        tocContent: '#store-toc-wrapper #store-toc p',
    },
} as const;

const s = singleStoreSelectors;

export class SingleStorePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Navigation ----
    // Pre-refactor gotoSingleStore -> goIfNotThere(store/<slug>, 'networkidle').
    async gotoSingleStore(storeName: string): Promise<void> {
        const storeUrl = data.subUrls.frontend.vendorDetails(helpers.slugify(storeName));
        await this.page.goto(toPath(storeUrl), { waitUntil: 'networkidle' });
    }

    // Recursively assert every string selector in an object is visible.
    // Functions are skipped; nested plain objects recurse (mirrors basePage.multipleElementVisible).
    private async multipleElementVisible(selectors: { [key: string]: unknown }): Promise<void> {
        for (const key in selectors) {
            const value = selectors[key];
            if (helpers.isPlainObject(value)) {
                await this.multipleElementVisible(value as { [key: string]: unknown });
            } else if (typeof value === 'function') {
                continue;
            } else {
                await expect(this.page.locator(value as string)).toBeVisible();
            }
        }
    }

    // ---- Single store renders properly ----
    async singleStoreRenderProperly(storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);

        // store profile elements are visible (skip verified icon + eu-compliance here)
        const { verifiedIcon, verifiedIconByIcon, euComplianceData, ...storeProfile } = s.storeProfile;
        await this.multipleElementVisible(storeProfile);

        // store tab elements are visible
        if (!DOKAN_PRO) {
            await expect(this.page.locator(s.storeTabs.products)).toBeVisible();
            // await expect(this.page.locator(s.storeTabs.toc)).toBeVisible(); // todo: need vendor toc
        } else {
            const { toc, chatNow, ...storeTabs } = s.storeTabs;
            await this.multipleElementVisible(storeTabs);

            // eu compliance data is visible
            await this.multipleElementVisible(s.storeProfile.euComplianceData);
        }

        // search elements are visible
        await this.multipleElementVisible(s.search);

        // sortby element is visible
        await expect(this.page.locator(s.sortBy)).toBeVisible();

        // store products are visible
        await expect(this.page.locator(s.storeProducts)).toBeVisible();

        // product card elements are visible (at least one of each)
        await expect(this.page.locator(s.productCard.card)).not.toHaveCount(0);
        await expect(this.page.locator(s.productCard.productDetailsLink)).not.toHaveCount(0);
        await expect(this.page.locator(s.productCard.productTitle)).not.toHaveCount(0);
        await expect(this.page.locator(s.productCard.productPrice)).not.toHaveCount(0);
        await expect(this.page.locator(s.productCard.addToCart)).not.toHaveCount(0);

        // store social icons are visible
        await this.multipleElementVisible(s.storeSocialIcons);
    }

    // ---- Sort products on single store ----
    async singleStoreSortProducts(storeName: string, sortBy: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        const storeUrl = data.subUrls.frontend.vendorDetails(helpers.slugify(storeName));
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(storeUrl) && resp.status() === 200),
            this.page.waitForLoadState('domcontentloaded'),
            this.page.selectOption(s.sortBy, { value: sortBy }),
        ]);
        await expect(this.page.locator(s.productCard.card)).not.toHaveCount(0);
    }

    // ---- Search product on single store ----
    async singleStoreSearchProduct(storeName: string, productName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        const storeUrl = data.subUrls.frontend.vendorDetails(helpers.slugify(storeName));
        await this.page.locator(s.search.input).fill(productName);
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(storeUrl) && resp.status() === 200),
            this.page.locator(s.search.button).click(),
        ]);
        await expect(this.page.locator(s.productCard.productTitle)).toContainText(productName);
    }

    // ---- Store open/close time ----
    async storeOpenCloseTime(storeName: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        await this.page.locator(s.storeTime.storeTimeDropDown).hover();

        await expect(this.page.locator(s.storeTime.storeTimeDiv)).toBeVisible();
        await expect(this.page.locator(s.storeTime.storeTimeHeading)).toBeVisible();

        await expect(this.page.locator(s.storeTime.storeDays)).toHaveCount(7);
        await expect(this.page.locator(s.storeTime.storeTimes)).toHaveCount(7);
    }

    // ---- Store terms and conditions ----
    async storeTermsAndCondition(storeName: string, toc: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        const storeUrl = data.subUrls.frontend.vendorDetails(helpers.slugify(storeName));
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(storeUrl) && resp.status() === 200),
            this.page.locator(s.storeTabs.toc).click(),
        ]);
        await expect(this.page.locator(s.toc.tocContent)).toContainText(toc);
    }

    // ---- Store share ----
    async storeShare(storeName: string, site: string): Promise<void> {
        await this.gotoSingleStore(storeName);
        await this.page.locator(s.storeTabs.share).click();

        const shareSelector = s.sharePlatForms[site as keyof typeof s.sharePlatForms];

        // ensure the share link opens in a new tab, then force it to the same tab
        await expect(this.page.locator(shareSelector)).toHaveAttribute('target', '_blank');
        await this.page.locator(shareSelector).evaluate(el => el.setAttribute('target', '_self'));

        await Promise.all([
            this.page.waitForURL(new RegExp('.*' + site + '.*'), { waitUntil: 'domcontentloaded' }),
            this.page.locator(shareSelector).click(),
        ]);
    }
}
