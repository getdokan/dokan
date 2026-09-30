import { Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath, helpers, parseBoolean } from '@utils/helpers';

const isPro = parseBoolean(process.env.DOKAN_PRO);

// ---------------------------------------------------------------------------
// Data (co-located). The spec imports `data` from this file, so the shape it
// consumes must be preserved: storeList.sort, storeList.layout.list and
// predefined.vendorStores.vendor1. Values mirror @utils/testData for the
// seeded fixtures (VENDOR=vendor1 => shop "vendor1store").
// ---------------------------------------------------------------------------
export const data = {
    predefined: {
        vendorStores: {
            vendor1: 'vendor1store',
        },
    },
    storeList: {
        sort: 'most_recent', // #stores_orderby options: most_recent | total_orders | random
        layout: {
            grid: 'grid',
            list: 'list',
        },
    },
    // Sub-URL fragments used for waitForResponse gating.
    subUrls: {
        storeListing: 'store-listing',
        gmap: '/maps/api',
    },
};

// ---------------------------------------------------------------------------
// Selectors (co-located). Ported verbatim from the pre-refactor
// selectors.customer.cStoreList group. Lite renders the search/apply filter
// surface; Pro adds the map, category/location/rating/featured/open-now
// filters and the follow button — branches below guard those.
// ---------------------------------------------------------------------------
export const selectors = {
    storeListText: '//h1[normalize-space()="Store List"]',

    map: {
        locationMap: 'div#dokan-geolocation-locations-map',
        map: '//button[normalize-space()="Map"]',
        satellite: '//button[normalize-space()="Satellite"]',
        fullScreenToggle: '//button[@title="Toggle fullscreen view"]',
        pegman: '//button[@title="Drag Pegman onto the map to open Street View"]',
        mapCameraControls: '//button[@title="Map camera controls"]',
        storeOnMap: {
            storePin: '//div[@id="dokan-geolocation-locations-map"]//img[contains(@src, "maps.gstatic.com/mapfiles/transparent.png")]/../..//div[@role="button"]',
            storeCluster: '//div[@id="dokan-geolocation-locations-map"]//div[contains(@style, "dokan-pro/modules/geolocation/assets/images")]',
            storeOnMap: '//span[normalize-space()="To navigate, press the arrow keys."]/..//div',
            storePopup: '.dokan-geo-map-info-window',
            storeListPopup: '.dokan-geo-map-info-windows-in-popup',
            storeOnList: (storeName: string) => `//h3[@class="info-title"]//a[contains(text(),"${storeName}")]`,
            closePopup: 'button.icon-close',
        },
    },

    currentLayout: '.entry-content #dokan-seller-listing-wrap',

    // Filters
    filters: {
        filterDiv: 'div#dokan-store-listing-filter-wrap',
        totalStoreCount: 'p.item.store-count',
        filterButton: 'button.dokan-store-list-filter-button',
        sortBy: '#stores_orderby', // most_recent, total_orders, random
        gridView: '.dashicons-screenoptions',
        listView: '.dashicons-menu-alt',

        filterDetails: {
            searchVendor: '.store-search-input',
            location: '.location-address input',
            radiusSlider: 'input.dokan-range-slider',
            categoryInput: '.category-input',
            featured: '#featured',
            openNow: '#open-now',
            ratings: '.store-ratings.item',
            rating: (star: string) => `.star-${star}`,
            apply: '#apply-filter-btn',
        },
    },

    category: (category: string) => `//div[@class="category-box store_category"]//ul//li[contains(text(), '${category}')]`,
    categoryFirst: '(//div[@class="category-box store_category"]//ul//li)[1]',
    mapResultFirst: '(//div[contains(@class,"pac-container")]//div[@class="pac-item"])[1]',

    // Store card
    storeCard: {
        storeCardDiv: 'div.store-wrapper',
        storeCardHeader: 'div.store-header',
        storeBanner: 'div.store-banner',
        openCloseStatus: 'span.dokan-store-is-open-close-status',
        storeCardContent: 'div.store-content',
        featuredLabel: 'div.featured-label',
        storeData: 'div.store-data',
        storeAddress: 'p.store-address',
        storePhone: 'p.store-phone',
        storeCardFooter: 'div.store-footer',
        storeAvatar: 'div.seller-avatar',
        visitStore: 'a[title="Visit Store"]',
        followUnFollowButton: 'button.dokan-follow-store-button',
    },

    visitStore: (storeName: string) => `//a[text()='${storeName}']/../../../../..//a[@title='Visit Store']`,
};

export class StoreListingPage {
    readonly page: Page;
    readonly url = toPath(data.subUrls.storeListing);

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Helpers (ported from the pre-refactor basePage) ----

    // Assert every string selector in a (possibly nested) object is visible.
    // Recurses into plain objects; skips function selectors (they need args).
    private async multipleElementVisible(group: { [key: string]: unknown }): Promise<void> {
        for (const key of Object.keys(group)) {
            const value = group[key];
            if (typeof value === 'function') {
                continue;
            } else if (value !== null && typeof value === 'object') {
                await this.multipleElementVisible(value as { [key: string]: unknown });
            } else if (typeof value === 'string') {
                await expect(this.page.locator(value)).toBeVisible();
            }
        }
    }

    // Assert two selectors resolve to the same element count (retries until it passes).
    private async toHaveEqualCount(selector1: string, selector2: string): Promise<void> {
        await expect(async () => {
            const [count1, count2] = await Promise.all([this.page.locator(selector1).count(), this.page.locator(selector2).count()]);
            expect(count1).toBe(count2);
        }).toPass();
    }

    // Whether the browser is currently on the given sub-path (trailing slash agnostic).
    private isCurrentUrl(subPath: string): boolean {
        const currentURL = new URL(this.page.url()).href.replace(/[/]$/, '');
        return currentURL === toPath(subPath);
    }

    // Navigate to the store listing page only if not already there.
    private async goToStoreList(): Promise<void> {
        if (!this.isCurrentUrl(data.subUrls.storeListing)) {
            await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
        }
    }

    // ---- Store list ----

    // store list renders properly
    async storeListRenderProperly(link?: string): Promise<void> {
        if (link) {
            await this.page.goto(link, { waitUntil: 'domcontentloaded' });
        } else {
            await this.page.goto(this.url, { waitUntil: 'networkidle' });
            // store list text is visible
            await expect(this.page.locator(selectors.storeListText)).toBeVisible();
        }

        // map elements are visible (Pro only)
        if (isPro) {
            const { storeOnMap, ...map } = selectors.map;
            await this.multipleElementVisible(map);
        }

        // store filter elements are visible
        const { filterDetails, ...filters } = selectors.filters;
        await this.multipleElementVisible(filters);

        // click filter button to reveal filter details
        await this.page.locator(selectors.filters.filterButton).click();

        // store filter detail elements are visible
        if (!isPro) {
            await expect(this.page.locator(selectors.filters.filterDetails.searchVendor)).toBeVisible();
            await expect(this.page.locator(selectors.filters.filterDetails.apply)).toBeVisible();
        } else {
            const { rating, ...restFilterDetails } = selectors.filters.filterDetails;
            await this.multipleElementVisible(restFilterDetails);
        }

        // store card elements are visible
        await expect(this.page.locator(selectors.storeCard.storeCardDiv)).not.toHaveCount(0);

        // card header
        await expect(this.page.locator(selectors.storeCard.storeCardHeader)).not.toHaveCount(0);
        await expect(this.page.locator(selectors.storeCard.storeBanner)).not.toHaveCount(0);

        // card content
        await expect(this.page.locator(selectors.storeCard.storeCardContent)).not.toHaveCount(0);
        await expect(this.page.locator(selectors.storeCard.storeData)).not.toHaveCount(0);

        // card footer
        await expect(this.page.locator(selectors.storeCard.storeCardFooter)).not.toHaveCount(0);
        await expect(this.page.locator(selectors.storeCard.storeAvatar)).not.toHaveCount(0);
        await expect(this.page.locator(selectors.storeCard.visitStore)).not.toHaveCount(0);
        if (isPro) {
            await expect(this.page.locator(selectors.storeCard.followUnFollowButton)).not.toHaveCount(0);
        }
    }

    // sort stores
    async sortStores(sortBy: string): Promise<void> {
        await this.goToStoreList();
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.storeListing) && resp.status() === 200),
            this.page.waitForLoadState(),
            this.page.selectOption(selectors.filters.sortBy, { value: sortBy }),
        ]);
        await expect(this.page.locator(selectors.storeCard.storeCardDiv)).not.toHaveCount(0);
    }

    // change store view layout
    async storeViewLayout(style: string): Promise<void> {
        await this.goToStoreList();

        switch (style) {
            case 'grid':
                await this.page.locator(selectors.filters.gridView).click();
                break;

            case 'list':
                await this.page.locator(selectors.filters.listView).click();
                break;

            default:
                break;
        }
        await expect(this.page.locator(selectors.currentLayout)).toHaveClass(style + '-view');
    }

    // search store
    async searchStore(storeName: string): Promise<void> {
        await this.goToStoreList();
        await this.page.locator(selectors.filters.filterButton).click();
        await this.page.locator(selectors.filters.filterDetails.searchVendor).fill(storeName);
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.storeListing) && resp.status() === 200),
            this.page.locator(selectors.filters.filterDetails.apply).click(),
        ]);
        await expect(this.page.locator(selectors.visitStore(storeName))).toBeVisible();
    }

    // filter stores
    async filterStores(filterBy: string, value?: string): Promise<void> {
        await this.goToStoreList();
        await this.page.locator(selectors.filters.filterButton).click();

        switch (filterBy) {
            case 'by-location':
                await Promise.all([
                    this.page.waitForResponse(resp => resp.url().includes(data.subUrls.gmap) && resp.status() === 200),
                    this.page.locator(selectors.filters.filterDetails.location).fill(value!),
                ]);
                await this.page.locator(selectors.mapResultFirst).click();
                break;

            case 'by-category':
                await this.page.locator(selectors.filters.filterDetails.categoryInput).click();
                await this.page.locator(selectors.category(value!)).click();
                break;

            case 'by-ratings':
                await this.page.locator(selectors.filters.filterDetails.rating(value!)).click();
                break;

            case 'featured':
                await this.page.locator(selectors.filters.filterDetails.featured).click();
                break;

            case 'open-now':
                await this.page.locator(selectors.filters.filterDetails.openNow).click();
                break;

            default:
                break;
        }

        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.storeListing) && resp.status() === 200),
            this.page.locator(selectors.filters.filterDetails.apply).click(),
        ]);
        await expect(this.page.locator(selectors.storeCard.storeCardDiv)).not.toHaveCount(0);

        switch (filterBy) {
            case 'featured':
                await this.toHaveEqualCount(selectors.storeCard.storeCardDiv, selectors.storeCard.featuredLabel);
                break;

            case 'open-now':
                await this.toHaveEqualCount(selectors.storeCard.storeCardDiv, selectors.storeCard.openCloseStatus);
                break;

            default:
                break;
        }
    }

    // stores on map
    async storeOnMap(storeName?: string): Promise<void> {
        await this.goToStoreList();
        const storePinIsVisible = await this.page.locator(selectors.map.storeOnMap.storePin).isVisible();
        if (storePinIsVisible) {
            await this.page.locator(selectors.map.storeOnMap.storePin).click();
            await expect(this.page.locator(selectors.map.storeOnMap.storePopup)).toBeVisible();
        } else {
            await this.page.locator(selectors.map.storeOnMap.storeCluster).click();
            await expect(this.page.locator(selectors.map.storeOnMap.storeListPopup)).toBeVisible();
            await this.page.locator(selectors.map.storeOnMap.closePopup).click();
        }
        if (storeName) {
            await expect(this.page.locator(selectors.map.storeOnMap.storeOnList(storeName))).toBeVisible();
        }
    }

    // go to single store from store listing
    async goToSingleStoreFromStoreListing(storeName: string): Promise<void> {
        await this.searchStore(storeName);
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(selectors.storeCard.visitStore).click()]);
        const storeUrl = this.isCurrentUrl(`store/${helpers.slugify(storeName)}`);
        expect(storeUrl).toBeTruthy();
    }
}
