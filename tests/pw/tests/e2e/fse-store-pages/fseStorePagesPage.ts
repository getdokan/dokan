import { Page, Response, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { helpers, parseBoolean, toPath } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { data as siteData } from '@utils/testData';

export const isPro = parseBoolean(process.env.DOKAN_PRO);

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
export const data = {
    // seeded vendor store (VENDOR=vendor1 => shop "vendor1store"); override for other sites
    store: {
        slug: process.env.FSE_STORE_SLUG ?? 'vendor1store',
        name: process.env.FSE_STORE_NAME ?? 'vendor1store',
        missingSlug: 'fse-store-that-does-not-exist',
    },
    themes: {
        classic: 'storefront',
        block: 'twentytwentyfive',
    },
    urls: {
        storeListing: 'store-listing/',
    },
    // `dokan_general.store_category_type` – the Pro category filter only renders when it is not "none"
    storeCategoryType: 'multiple',
    category: 'Uncategorized',
    // the 16 blocks this PR registers (src/blocks/*, without `shared`)
    blocks: [
        'dokan/store-avatar',
        'dokan/store-banner',
        'dokan/store-category-menu',
        'dokan/store-contact-form',
        'dokan/store-filter-bar',
        'dokan/store-header',
        'dokan/store-info',
        'dokan/store-list',
        'dokan/store-location-map',
        'dokan/store-name',
        'dokan/store-open-close-hours',
        'dokan/store-product-section',
        'dokan/store-sidebar',
        'dokan/store-social',
        'dokan/store-tab-content',
        'dokan/store-tabs',
    ],
    patterns: ['dokan/store-listing-default', 'dokan/single-store-default', 'dokan/single-store-header-default', 'dokan/single-store-header-minimal', 'dokan/single-store-header-panel', 'dokan/single-store-header-split', 'dokan/single-store-header-stacked'],
    patternCategories: ['dokan-store', 'dokan-store-listing'],
    // registered via register_block_template('dokan//single-store'); WordPress lists it as `<active-theme>//single-store` with source `plugin`
    template: { slug: 'single-store', source: 'plugin' },
    // The store tabs: Lite has the products tab (store root) + T&C; Pro adds biography and reviews.
    storeTabs: {
        lite: ['', 'toc/'],
        pro: ['biography/', 'reviews/'],
    },
    viewport: {
        desktop: { width: 1280, height: 900 },
        tabletEdge: { width: 768, height: 900 }, // first width at which the list layout is allowed
        mobileEdge: { width: 767, height: 900 }, // last width forced to grid
        phone: { width: 390, height: 844 },
    },
};

// block markup used to build the temporary pages
const blocks = {
    filterBar: '<!-- wp:dokan/store-filter-bar /-->',
    storeList: '<!-- wp:dokan/store-list /-->',
    group: (inner: string) => `<!-- wp:group {"className":"dokan-store-listing"} --><div class="wp-block-group dokan-store-listing">${inner}</div><!-- /wp:group -->`,
    column: (width: string, inner: string) => `<!-- wp:column {"width":"${width}"} --><div class="wp-block-column" style="flex-basis:${width}">${inner}</div><!-- /wp:column -->`,
    columns: (inner: string) => `<!-- wp:columns --><div class="wp-block-columns">${inner}</div><!-- /wp:columns -->`,
};

export const fixturePages = {
    // one filter bar + one listing (the shipped `dokan/store-listing-default` pattern)
    single: { title: 'FSE QA Single Bar', content: blocks.group(blocks.filterBar + blocks.storeList) },
    // two filter bars on one page – the duplicate-id / `include_once` regressions
    twoBars: { title: 'FSE QA Two Bars', content: blocks.group(blocks.filterBar + blocks.filterBar + blocks.storeList) },
    // one bar driving two listings – `setView()` must reach both wrappers
    twoLists: { title: 'FSE QA Two Lists', content: blocks.group(blocks.filterBar + blocks.storeList + blocks.storeList) },
    // a filter bar squeezed into a 25% column – the container-query layout
    narrowColumn: { title: 'FSE QA Narrow Column', content: blocks.columns(blocks.column('25%', blocks.filterBar) + blocks.column('75%', blocks.storeList)) },
};

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectors = {
    listingWrap: '[id="dokan-seller-listing-wrap"]',
    filterBar: '.dokan-store-filter-bar-block',
    filterButton: 'button.dokan-store-list-filter-button',
    filterFormWrap: '[id="dokan-store-listing-filter-form-wrap"]',
    searchInput: '.store-search-input',
    applyButton: '#apply-filter-btn',
    nonceInput: 'input[name="_store_filter_nonce"]',
    sortBy: '#stores_orderby',
    viewToggle: '.toggle-view span',
    gridIcon: '.toggle-view span[data-view="grid-view"]',
    listIcon: '.toggle-view span[data-view="list-view"]',
    storeCard: '.dokan-single-seller',
    storeFooter: '.store-footer',
    avatar: '.seller-avatar',
    noVendorText: 'text=/No vendor found/i',
    // Pro filter fields
    ratingStars: '[data-rating]',
    categoryInput: '.store-lists-category .category-input',
    categoryBox: '.category-box',
    categoryItem: '.category-box li[data-slug]',
    categoryLabel: '.category-items',
    featured: '#featured',
    openNow: '#open-now',
    // single store
    storeNotBlog: '[class*="dokan-store"]',
    fatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ListingMetrics {
    storeListsDefined: boolean;
    validatorDefined: boolean;
    datepickerDefined: boolean;
    scriptOrderOk: boolean;
    avatarRadius: string | null;
    wrapBoxSizing: string | null;
    wrapClasses: string[];
    activeViews: string[];
    storedLayout: string | null;
    cardCount: number;
    firstRowCount: number;
    cardsInsideWrap: boolean;
    firstCardHeight: number;
    firstFooterInsideCard: boolean;
}

export interface BarLayout {
    barWidth: number;
    overflowingChildren: string[];
    horizontalScroll: boolean;
}

// a third-party map script (Mapbox / Google) failing on a dummy key is not a Dokan error
const thirdPartyNoise = /mapbox|googleapis|google\.maps|gstatic|Failed to fetch|favicon/i;

// ---------------------------------------------------------------------------
// Page object
// ---------------------------------------------------------------------------
export class FseStorePagesPage {
    readonly page: Page;
    readonly pageErrors: string[] = [];

    constructor(page: Page) {
        this.page = page;
        // uncaught exceptions are what the `dokan.js` dependency bug produced (`$.validator is not a function`)
        this.page.on('pageerror', error => this.pageErrors.push(error.message));
    }

    // ---- setup / teardown helpers (used from beforeAll / afterAll) ----

    static async activateTheme(theme: string): Promise<boolean> {
        try {
            await helpers.exeCommandWpcli(siteData.commands.wpcli.activateTheme(theme));
            return true;
        } catch {
            try {
                await helpers.exeCommandWpcli(siteData.commands.wpcli.installTheme(theme));
                return true;
            } catch {
                return false;
            }
        }
    }

    // create the temporary block pages; returns { key: pageId }
    static async createFixturePages(apiUtils: ApiUtils, pages: Array<{ title: string; content: string }>): Promise<string[]> {
        const ids: string[] = [];
        for (const page of pages) {
            const [, id] = await apiUtils.createPage({ title: page.title, status: 'publish', content: page.content }, payloads.adminAuth);
            ids.push(id);
        }
        return ids;
    }

    static async deleteFixturePages(apiUtils: ApiUtils, ids: string[]): Promise<void> {
        for (const id of ids) {
            await apiUtils.deletePage(id, payloads.adminAuth);
        }
    }

    // turn the Pro store-category filter on; returns the previous value for restoring
    static async setStoreCategoryType(type: string): Promise<string> {
        const [original] = await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { store_category_type: type });
        return original?.store_category_type ?? 'none';
    }

    static pageUrl(fixture: { title: string }): string {
        return toPath(helpers.slugify(fixture.title));
    }

    // ---- navigation ----

    async goto(url: string): Promise<Response | null> {
        const response = await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        await this.page.waitForLoadState('load');
        return response;
    }

    async gotoStoreListing(): Promise<void> {
        await this.goto(toPath(data.urls.storeListing));
        await expect(this.page.locator(selectors.storeCard).first()).toBeVisible();
    }

    async gotoFixture(fixture: { title: string }): Promise<void> {
        await this.goto(FseStorePagesPage.pageUrl(fixture));
        await expect(this.page.locator(selectors.filterBar).first()).toBeVisible();
    }

    async clearSavedLayout(): Promise<void> {
        await this.page.evaluate(() => localStorage.removeItem('dokan-layout'));
    }

    // fresh visit: no saved layout preference
    async gotoStoreListingFresh(): Promise<void> {
        await this.page.goto(toPath(data.urls.storeListing), { waitUntil: 'domcontentloaded' });
        await this.clearSavedLayout();
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await expect(this.page.locator(selectors.storeCard).first()).toBeVisible();
    }

    // ---- measurements ----

    // Everything the foundation PR claims about the listing, measured in one pass.
    async getListingMetrics(): Promise<ListingMetrics> {
        return this.page.evaluate(sel => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const w = window as any;
            const wrap = document.querySelector<HTMLElement>(sel.listingWrap);
            const avatar = document.querySelector<HTMLElement>(sel.avatar);
            const cards = Array.from(document.querySelectorAll<HTMLElement>(sel.storeCard));
            const tops = cards.map(c => Math.round(c.getBoundingClientRect().top));
            const wrapRect = wrap?.getBoundingClientRect();
            const first = cards[0];
            const firstRect = first?.getBoundingClientRect();
            const footerRect = first?.querySelector<HTMLElement>(sel.storeFooter)?.getBoundingClientRect();
            const ids = Array.from(document.scripts).map(s => s.id);
            const at = (handle: string) => ids.indexOf(`${handle}-js`);

            return {
                storeListsDefined: typeof w.dokan?.storeLists === 'object',
                validatorDefined: typeof w.jQuery?.validator !== 'undefined',
                datepickerDefined: typeof w.jQuery?.fn?.datepicker === 'function',
                scriptOrderOk: at('dokan-script') > -1 && at('dokan-form-validate') > -1 && at('jquery-ui-datepicker') > -1 && at('dokan-form-validate') < at('dokan-script') && at('jquery-ui-datepicker') < at('dokan-script'),
                avatarRadius: avatar ? getComputedStyle(avatar).borderRadius : null,
                wrapBoxSizing: wrap ? getComputedStyle(wrap).boxSizing : null,
                wrapClasses: wrap ? Array.from(wrap.classList) : [],
                activeViews: Array.from(document.querySelectorAll<HTMLElement>(sel.viewToggle))
                    .filter(s => s.classList.contains('active'))
                    .map(s => s.dataset.view ?? ''),
                storedLayout: localStorage.getItem('dokan-layout'),
                cardCount: cards.length,
                firstRowCount: tops.filter(t => t === tops[0]).length,
                cardsInsideWrap: !!wrapRect && cards.every(c => c.getBoundingClientRect().right <= wrapRect.right + 1),
                firstCardHeight: Math.round(firstRect?.height ?? 0),
                firstFooterInsideCard: !!firstRect && !!footerRect && footerRect.top >= firstRect.top && footerRect.bottom <= firstRect.bottom + 1,
            };
        }, selectors);
    }

    // How far a filter bar's contents spill out of it (the narrow-container regression).
    // Anything inside a clipping ancestor (overflow != visible) is skipped: Pro draws its Google map inside the bar,
    // and the map's tile/overlay nodes extend past the bar's box while being clipped from view.
    // Reproduce locally: set an invalid Google map key (dokan_admin_settings.google_map_api_key).
    async getBarLayout(barIndex = 0): Promise<BarLayout> {
        return this.page.evaluate(
            ({ sel, index }) => {
                const bar = document.querySelectorAll<HTMLElement>(sel.filterBar)[index];
                if (!bar) return { barWidth: 0, overflowingChildren: ['filter bar not found'], horizontalScroll: false };
                const barRect = bar.getBoundingClientRect();
                const overflowingChildren = Array.from(bar.querySelectorAll<HTMLElement>('*'))
                    .filter(e => {
                        for (let p = e.parentElement; p && p !== bar; p = p.parentElement) {
                            const { overflowX, overflowY } = getComputedStyle(p);
                            if (overflowX !== 'visible' || overflowY !== 'visible') return false;
                        }
                        const r = e.getBoundingClientRect();
                        return r.width > 0 && (r.right > barRect.right + 1 || r.left < barRect.left - 1);
                    })
                    .map(e => `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}`);
                return {
                    barWidth: Math.round(barRect.width),
                    overflowingChildren,
                    horizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
                };
            },
            { sel: selectors, index: barIndex },
        );
    }

    async storeCount(): Promise<number> {
        return this.page.locator(selectors.storeCard).count();
    }

    // "Total stores showing: N" is the number across all pages, not just the 10 cards rendered
    async totalStores(): Promise<number> {
        const text = (await this.page.locator('[class*="store-count"]').first().textContent()) ?? '';
        return Number(text.replace(/\D/g, ''));
    }

    // dokan-store-count of an arbitrary listing URL, fetched in-page so cookies/nonce rules match a browser visit
    async totalStoresFor(url: string): Promise<number> {
        return this.page.evaluate(async u => {
            const html = await (await fetch(u)).text();
            const text = new DOMParser().parseFromString(html, 'text/html').querySelector('[class*="store-count"]')?.textContent ?? '';
            return Number(text.replace(/\D/g, ''));
        }, url);
    }

    async filterNonce(): Promise<string> {
        return (await this.page.locator(selectors.nonceInput).first().getAttribute('value')) ?? '';
    }

    // current non-fatal page errors (third-party map noise removed)
    dokanPageErrors(): string[] {
        return this.pageErrors.filter(message => !thirdPartyNoise.test(message));
    }

    async hasFatal(): Promise<boolean> {
        return this.page
            .locator(selectors.fatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
    }

    // ---- filter bar interactions ----

    // a block page has one `.dokan-store-filter-bar-block` per bar; the classic shortcode page has none, so scope to the page
    private async bar(index: number) {
        const bars = this.page.locator(selectors.filterBar);
        return (await bars.count()) ? bars.nth(index) : this.page.locator('body');
    }

    async toggleFilterForm(barIndex = 0): Promise<void> {
        await (await this.bar(barIndex)).locator(selectors.filterButton).first().click();
    }

    // [display of every bar's filter form] in DOM order
    async filterFormDisplays(): Promise<string[]> {
        return this.page.evaluate(sel => Array.from(document.querySelectorAll<HTMLElement>(sel)).map(f => getComputedStyle(f).display), selectors.filterFormWrap);
    }

    async searchStores(term: string, barIndex = 0): Promise<void> {
        const bar = this.page.locator(selectors.filterBar).nth(barIndex);
        const scope = (await bar.count()) ? bar : this.page.locator('body');
        if (!(await scope.locator(selectors.searchInput).first().isVisible())) {
            await scope.locator(selectors.filterButton).first().click();
        }
        await scope.locator(selectors.searchInput).first().fill(term);
        await Promise.all([this.page.waitForURL(/dokan_seller_search=/), scope.locator(selectors.applyButton).first().click()]);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async pickCategory(barIndex = 0, categoryName?: string): Promise<string> {
        const bar = await this.bar(barIndex);
        await bar.locator(selectors.categoryInput).first().click();
        const item = categoryName ? bar.locator(selectors.categoryItem).filter({ hasText: categoryName }).first() : bar.locator(selectors.categoryItem).first();
        const slug = (await item.getAttribute('data-slug')) ?? '';
        await item.click();
        return slug;
    }

    async pickRating(stars: number, barIndex = 0): Promise<void> {
        await (await this.bar(barIndex)).locator(`[data-rating="${stars}"]`).first().click();
    }

    async applyFilters(barIndex = 0): Promise<void> {
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), (await this.bar(barIndex)).locator(selectors.applyButton).first().click()]);
        await this.page.waitForURL(/_store_filter_nonce=/);
    }

    async setLayout(view: 'grid-view' | 'list-view'): Promise<void> {
        await this.page
            .locator(view === 'grid-view' ? selectors.gridIcon : selectors.listIcon)
            .first()
            .click();
    }

    async resizeViewport(size: { width: number; height: number }): Promise<void> {
        await this.page.setViewportSize(size);
        // the resize handler runs on the window event; give jQuery a tick
        await this.page.waitForTimeout(250);
    }

    // ---- single store ----

    async openStore(subPath = ''): Promise<number> {
        const response = await this.page.goto(toPath(`store/${data.store.slug}/${subPath}`), { waitUntil: 'domcontentloaded' });
        return response?.status() ?? 0;
    }

    async openMissingStore(subPath = ''): Promise<number> {
        const response = await this.page.goto(toPath(`store/${data.store.missingSlug}/${subPath}`), { waitUntil: 'domcontentloaded' });
        return response?.status() ?? 0;
    }

    async isBlogIndex(): Promise<boolean> {
        return this.page.evaluate(() => document.body.classList.contains('blog') || document.body.classList.contains('home'));
    }

    // ---- REST (admin / guest) ----

    // cookie-authenticated REST call: the page's session cookie plus a core `rest-nonce`
    async restGet(route: string, authenticated = true): Promise<{ status: number; body: unknown }> {
        let url = `${toPath('')}?rest_route=${route}`;
        if (authenticated) {
            const nonceResponse = await this.page.request.get(toPath('wp-admin/admin-ajax.php?action=rest-nonce'));
            url += `&_wpnonce=${(await nonceResponse.text()).trim()}`;
        }
        const response = await this.page.request.get(url);
        let body: unknown = null;
        try {
            body = await response.json();
        } catch {
            body = null;
        }
        return { status: response.status(), body };
    }
}
