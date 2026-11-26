import { Browser, BrowserContext, Page, expect, test } from '@utils/test';
import { ApiUtils } from '@utils/apiUtils';
import { ADMIN_STORAGE_STATE } from '@utils/authStates';
import { toPath } from '@utils/helpers';
import { FseStorePagesPage, data, fixturePages, isPro, selectors } from './fseStorePagesPage';

// Covers Dokan Lite #3356 (FSE foundation + store blocks) and Dokan Pro #6023 (Pro compatibility).
//
// The suite switches the active theme (Storefront <-> Twenty Twenty-Five) and builds temporary block pages,
// so run it on its own worker: `npx playwright test fse-store-pages --workers=1`.

// override to point at an admin session for another site (defaults to the suite's admin state)
const adminState = process.env.FSE_ADMIN_STORAGE_STATE ?? ADMIN_STORAGE_STATE;
// set on sites without REST basic auth / DB access: the caller has already created the four fixture pages
// (see fixturePages) and set dokan_general.store_category_type, and removes them afterwards
const preconfigured = !!process.env.FSE_SITE_PRECONFIGURED;

type Block = { name: string; category?: string };
type Pattern = { name: string; categories?: string[] };
type PatternCategory = { name: string };
type Template = { id: string; slug: string; source?: string; plugin?: string };

const guestPage = async (browser: Browser): Promise<[BrowserContext, FseStorePagesPage]> => {
    const context = await browser.newContext();
    return [context, new FseStorePagesPage(await context.newPage())];
};

// =============================================================================
// 1. Classic theme: the listing fixes that are not block specific
// =============================================================================
test.describe('FSE store pages - classic theme store listing', () => {
    let context: BrowserContext;
    let guest: FseStorePagesPage;
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        await FseStorePagesPage.activateTheme(data.themes.classic);
        [context, guest] = await guestPage(browser);
        page = guest.page;
    });

    test.afterAll(async () => {
        await context?.close();
    });

    test.beforeEach(async () => {
        guest.pageErrors.length = 0;
        await guest.resizeViewport(data.viewport.desktop);
    });

    // ---- dokan.js dependency chain ------------------------------------------------

    test('dokan.js initialises on the store listing without uncaught errors', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        const metrics = await guest.getListingMetrics();
        expect(metrics.storeListsDefined, 'dokan.storeLists is registered').toBe(true);
        expect(metrics.validatorDefined, 'jQuery.validator is available').toBe(true);
        expect(metrics.datepickerDefined, 'jQuery.fn.datepicker is available').toBe(true);
        expect(guest.dokanPageErrors()).toEqual([]);
    });

    test('dokan-form-validate and jquery-ui-datepicker load before dokan.js', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        expect((await guest.getListingMetrics()).scriptOrderOk).toBe(true);
    });

    test('store listing renders without a fatal error', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        expect(await guest.hasFatal()).toBe(false);
        expect(await guest.storeCount()).toBeGreaterThan(0);
    });

    // ---- card styling ---------------------------------------------------------------

    test('store avatars are circles, not squircles', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        expect((await guest.getListingMetrics()).avatarRadius).toBe('50%');
    });

    test('listing opts into border-box so percentage cards fit their gutters', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        expect((await guest.getListingMetrics()).wrapBoxSizing).toBe('border-box');
    });

    test('grid view fits three cards per row and no card spills out of the listing', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListingFresh();
        const metrics = await guest.getListingMetrics();
        test.skip(metrics.cardCount < 3, 'needs at least three stores to measure a row');
        expect(metrics.wrapClasses).toContain('grid-view');
        expect(metrics.firstRowCount).toBe(3);
        expect(metrics.cardsInsideWrap).toBe(true);
    });

    // ---- grid / list toggle ---------------------------------------------------------

    test('grid icon is pre-selected on a first visit and the list icon is not', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListingFresh();
        const metrics = await guest.getListingMetrics();
        expect(metrics.activeViews).toEqual(['grid-view']);
        expect(metrics.storedLayout).toBeNull();
    });

    test('list view renders each store on a single row with its footer inside the card', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListingFresh();
        await guest.setLayout('list-view');
        const metrics = await guest.getListingMetrics();
        expect(metrics.wrapClasses).toContain('list-view');
        expect(metrics.wrapClasses).not.toContain('grid-view');
        expect(metrics.activeViews).toEqual(['list-view']);
        expect(metrics.firstRowCount).toBe(1);
        expect(metrics.firstFooterInsideCard, 'footer is not dropped onto a second line').toBe(true);
    });

    test('switching back to grid restores the grid layout and icon', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListingFresh();
        await guest.setLayout('list-view');
        await guest.setLayout('grid-view');
        const metrics = await guest.getListingMetrics();
        expect(metrics.wrapClasses).toContain('grid-view');
        expect(metrics.activeViews).toEqual(['grid-view']);
    });

    test('chosen layout is remembered after a reload', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListingFresh();
        await guest.setLayout('list-view');
        await page.reload({ waitUntil: 'domcontentloaded' });
        const metrics = await guest.getListingMetrics();
        expect(metrics.storedLayout).toBe('list-view');
        expect(metrics.wrapClasses).toContain('list-view');
        expect(metrics.activeViews).toEqual(['list-view']);
    });

    test('shrinking to 767px forces the grid and keeps the grid icon in step', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListingFresh();
        await guest.setLayout('list-view');
        await guest.resizeViewport(data.viewport.mobileEdge);
        const metrics = await guest.getListingMetrics();
        expect(metrics.wrapClasses).toContain('grid-view');
        expect(metrics.wrapClasses).not.toContain('list-view');
        expect(metrics.activeViews).toEqual(['grid-view']);
    });

    test('768px is still wide enough to keep the list layout (boundary)', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListingFresh();
        await guest.setLayout('list-view');
        await guest.resizeViewport(data.viewport.tabletEdge);
        const metrics = await guest.getListingMetrics();
        expect(metrics.wrapClasses).toContain('list-view');
        expect(metrics.activeViews).toEqual(['list-view']);
    });

    test('a resize on a wide screen does not force-mark the grid icon over a list layout', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListingFresh();
        await guest.setLayout('list-view');
        await guest.resizeViewport({ width: 1200, height: 900 });
        const metrics = await guest.getListingMetrics();
        expect(metrics.wrapClasses).toContain('list-view');
        expect(metrics.activeViews, 'icon and layout agree').toEqual(['list-view']);
    });

    // ---- filter bar ------------------------------------------------------------------

    test('filter button opens and closes the filter form', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        await expect(page.locator(selectors.filterFormWrap).first()).toBeHidden();
        await page.locator(selectors.filterButton).first().click();
        await expect(page.locator(selectors.filterFormWrap).first()).toBeVisible();
        await page.locator(selectors.filterButton).first().click();
        await expect(page.locator(selectors.filterFormWrap).first()).toBeHidden();
    });

    test('searching for a store lists it', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        await guest.searchStores(data.store.name, 0);
        await expect(page.locator(selectors.storeCard).filter({ hasText: data.store.name }).first()).toBeVisible();
    });

    test('searching for a store that does not exist shows the empty state', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        await guest.searchStores('zz-no-such-store-zz', 0);
        await expect(page.locator(selectors.noVendorText).first()).toBeVisible();
        expect(await guest.storeCount()).toBe(0);
    });

    test('pressing Enter in the search box submits the filter', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        await page.locator(selectors.filterButton).first().click();
        await page.locator(selectors.searchInput).first().fill(data.store.name);
        await Promise.all([page.waitForURL(/dokan_seller_search=/), page.locator(selectors.searchInput).first().press('Enter')]);
        await expect(page.locator(selectors.storeCard).filter({ hasText: data.store.name }).first()).toBeVisible();
    });

    test('filter parameters without a valid nonce are ignored', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        const all = await guest.totalStores();
        const base = toPath(data.urls.storeListing);
        const nonce = await guest.filterNonce();

        // same query, three nonces: missing and forged are ignored, the real one filters
        expect(await guest.totalStoresFor(`${base}?dokan_seller_search=zz-no-such-store-zz`), 'no nonce').toBe(all);
        expect(await guest.totalStoresFor(`${base}?dokan_seller_search=zz-no-such-store-zz&_store_filter_nonce=forged`), 'forged nonce').toBe(all);
        expect(await guest.totalStoresFor(`${base}?dokan_seller_search=zz-no-such-store-zz&_store_filter_nonce=${nonce}`), 'valid nonce').toBe(0);
    });

    for (const sortBy of ['most_recent', 'total_orders', 'random']) {
        test(`sorting by "${sortBy}" keeps the listing populated`, { tag: ['@lite', '@guest'] }, async () => {
            await guest.goto(toPath(`${data.urls.storeListing}?stores_orderby=${sortBy}`));
            expect(await guest.hasFatal()).toBe(false);
            expect(await guest.storeCount()).toBeGreaterThan(0);
        });
    }

    test('an unknown sort option is ignored instead of breaking the listing', { tag: ['@lite', '@guest'] }, async () => {
        await guest.goto(toPath(`${data.urls.storeListing}?stores_orderby=drop-table`));
        expect(await guest.hasFatal()).toBe(false);
        expect(await guest.storeCount()).toBeGreaterThan(0);
    });

    // ---- Pro filter fields -------------------------------------------------------------

    test('featured filter lists only featured stores', { tag: ['@pro', '@guest'] }, async () => {
        test.skip(!isPro, 'Pro filter field');
        await guest.gotoStoreListing();
        await page.locator(selectors.filterButton).first().click();
        await page.locator(selectors.featured).click();
        await guest.applyFilters(0);
        const cards = await guest.storeCount();
        expect(cards).toBeGreaterThan(0);
        await expect(page.locator(`${selectors.storeCard} div.featured-label`)).toHaveCount(cards);
    });

    // Pre-existing (reproduces on develop): rating=5 leaves "Total stores showing" unchanged even when no store
    // has a rating. Un-fixme once Pro's rating filter excludes unrated stores.
    test.fixme('rating filter narrows the result set', { tag: ['@pro', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        const all = await guest.totalStores();
        await page.locator(selectors.filterButton).first().click();
        await guest.pickRating(5, 0);
        await guest.applyFilters(0);
        expect(await guest.totalStores()).toBeLessThan(all);
    });
});

// =============================================================================
// 2. Classic theme: single store pages (regression)
// =============================================================================
test.describe('FSE store pages - classic theme single store', () => {
    let context: BrowserContext;
    let guest: FseStorePagesPage;

    test.beforeAll(async ({ browser }) => {
        await FseStorePagesPage.activateTheme(data.themes.classic);
        [context, guest] = await guestPage(browser);
    });

    test.afterAll(async () => {
        await context?.close();
    });

    for (const tab of data.storeTabs.lite) {
        test(`store page "/${tab}" renders the store, not the blog index`, { tag: ['@lite', '@guest'] }, async () => {
            expect(await guest.openStore(tab)).toBe(200);
            expect(await guest.isBlogIndex()).toBe(false);
            expect(await guest.hasFatal()).toBe(false);
            await expect(guest.page.locator(selectors.storeNotBlog).first()).toBeAttached();
        });
    }

    for (const tab of data.storeTabs.pro) {
        test(`Pro store tab "/${tab}" renders for an existing store`, { tag: ['@pro', '@guest'] }, async () => {
            test.skip(!isPro, 'Pro store tab');
            expect(await guest.openStore(tab)).toBe(200);
            expect(await guest.isBlogIndex()).toBe(false);
            expect(await guest.hasFatal()).toBe(false);
        });
    }

    for (const tab of [...data.storeTabs.lite, ...data.storeTabs.pro]) {
        test(`missing store "/${tab}" is a 404, not a fatal error`, { tag: ['@lite', '@guest'] }, async () => {
            expect(await guest.openMissingStore(tab)).toBe(404);
            expect(await guest.hasFatal()).toBe(false);
        });
    }
});

// =============================================================================
// 3. Blocks, patterns and templates registry (classic theme + REST)
// =============================================================================
test.describe('FSE store pages - block registry', () => {
    let adminContext: BrowserContext;
    let admin: FseStorePagesPage;
    let guestContext: BrowserContext;
    let guest: FseStorePagesPage;

    test.beforeAll(async ({ browser }) => {
        await FseStorePagesPage.activateTheme(data.themes.classic);
        adminContext = await browser.newContext({ storageState: adminState });
        admin = new FseStorePagesPage(await adminContext.newPage());
        [guestContext, guest] = await guestPage(browser);
    });

    test.afterAll(async () => {
        await adminContext?.close();
        await guestContext?.close();
    });

    test('admin sees all 16 store blocks registered under the dokan category', { tag: ['@lite', '@admin'] }, async () => {
        const { status, body } = await admin.restGet('/wp/v2/block-types/dokan');
        expect(status).toBe(200);
        const registered = new Map((body as Block[]).map(block => [block.name, block.category]));
        for (const name of data.blocks) {
            expect(registered.has(name), `${name} is registered`).toBe(true);
            expect(registered.get(name), `${name} category`).toBe('dokan');
        }
    });

    test('admin sees the store listing and single store patterns in their own categories', { tag: ['@lite', '@admin'] }, async () => {
        const { status, body } = await admin.restGet('/wp/v2/block-patterns/patterns');
        expect(status).toBe(200);
        const patterns = new Map((body as Pattern[]).map(pattern => [pattern.name, pattern.categories ?? []]));
        for (const name of data.patterns) {
            expect(patterns.has(name), `${name} is registered`).toBe(true);
        }
        expect(patterns.get('dokan/store-listing-default')).toContain('dokan-store-listing');
        expect(patterns.get('dokan/single-store-default')).toContain('dokan-store');
    });

    test('admin sees the two Dokan pattern categories', { tag: ['@lite', '@admin'] }, async () => {
        const { status, body } = await admin.restGet('/wp/v2/block-patterns/categories');
        expect(status).toBe(200);
        const names = (body as PatternCategory[]).map(category => category.name);
        for (const category of data.patternCategories) {
            expect(names).toContain(category);
        }
    });

    test('the single store block template is not registered on a classic theme', { tag: ['@lite', '@admin'] }, async () => {
        const { status, body } = await admin.restGet('/wp/v2/templates');
        // classic themes do not expose the templates endpoint at all (404) or return a list without ours
        if (status === 200) {
            expect((body as Template[]).filter(template => template.slug === data.template.slug && template.source === data.template.source)).toEqual([]);
        } else {
            expect([403, 404]).toContain(status);
        }
    });

    test('a guest cannot read the block registry through REST', { tag: ['@lite', '@guest'] }, async () => {
        for (const route of ['/wp/v2/block-types/dokan', '/wp/v2/block-patterns/patterns', '/wp/v2/templates']) {
            const { status } = await guest.restGet(route, false);
            expect([401, 403, 404], route).toContain(status);
        }
    });
});

// =============================================================================
// 4. Block theme: store listing + single store built from blocks
// =============================================================================
test.describe('FSE store pages - block theme', () => {
    let context: BrowserContext;
    let guest: FseStorePagesPage;
    let page: Page;
    let adminContext: BrowserContext;
    let admin: FseStorePagesPage;
    const apiUtils = new ApiUtils(null);
    let pageIds: string[] = [];
    let originalCategoryType = 'none';
    let blockThemeReady = false;

    test.beforeAll(async ({ browser }) => {
        blockThemeReady = await FseStorePagesPage.activateTheme(data.themes.block);
        if (!blockThemeReady) return;

        if (!preconfigured) {
            if (isPro) originalCategoryType = await FseStorePagesPage.setStoreCategoryType(data.storeCategoryType);
            pageIds = await FseStorePagesPage.createFixturePages(apiUtils, Object.values(fixturePages));
        }

        [context, guest] = await guestPage(browser);
        page = guest.page;
        adminContext = await browser.newContext({ storageState: adminState });
        admin = new FseStorePagesPage(await adminContext.newPage());
    });

    test.afterAll(async () => {
        if (pageIds.length) await FseStorePagesPage.deleteFixturePages(apiUtils, pageIds);
        if (isPro && blockThemeReady && !preconfigured) await FseStorePagesPage.setStoreCategoryType(originalCategoryType);
        await context?.close();
        await adminContext?.close();
        await FseStorePagesPage.activateTheme(data.themes.classic);
    });

    test.beforeEach(async () => {
        test.skip(!blockThemeReady, `${data.themes.block} could not be installed/activated`);
        guest.pageErrors.length = 0;
        await guest.resizeViewport(data.viewport.desktop);
    });

    // ---- store listing page on a block theme --------------------------------------------

    test('store listing page works on a block theme: dokan.js initialises and avatars are round', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoStoreListing();
        const metrics = await guest.getListingMetrics();
        expect(metrics.storeListsDefined).toBe(true);
        expect(metrics.validatorDefined && metrics.datepickerDefined).toBe(true);
        expect(metrics.avatarRadius).toBe('50%');
        expect(guest.dokanPageErrors()).toEqual([]);
    });

    // ---- one filter bar + one list (the shipped pattern) ---------------------------------

    test('Store Listing pattern renders a filter bar and a populated list', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoFixture(fixturePages.single);
        await expect(page.locator(selectors.filterBar)).toHaveCount(1);
        expect(await guest.storeCount()).toBeGreaterThan(0);
        expect(await guest.hasFatal()).toBe(false);
        expect(guest.dokanPageErrors()).toEqual([]);
    });

    test('filter bar block searches stores and shows the empty state for no match', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoFixture(fixturePages.single);
        await guest.searchStores(data.store.name, 0);
        await expect(page.locator(selectors.storeCard).filter({ hasText: data.store.name }).first()).toBeVisible();

        await guest.gotoFixture(fixturePages.single);
        await guest.searchStores('zz-no-such-store-zz', 0);
        await expect(page.locator(selectors.noVendorText).first()).toBeVisible();
    });

    test('filter bar block ignores a forged nonce', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoFixture(fixturePages.single);
        const all = await guest.totalStores();
        const base = FseStorePagesPage.pageUrl(fixturePages.single);
        expect(await guest.totalStoresFor(`${base}?dokan_seller_search=zz-no-such-store-zz&_store_filter_nonce=forged`)).toBe(all);
    });

    // ---- two filter bars on one page (duplicated ids) ------------------------------------

    test('each filter button opens only its own filter form', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoFixture(fixturePages.twoBars);
        await expect(page.locator(selectors.filterBar)).toHaveCount(2);
        expect(await guest.filterFormDisplays()).toEqual(['none', 'none']);

        await guest.toggleFilterForm(1);
        await expect.poll(() => guest.filterFormDisplays()).toEqual(['none', 'block']);

        await guest.toggleFilterForm(0);
        await expect.poll(() => guest.filterFormDisplays()).toEqual(['block', 'block']);

        await guest.toggleFilterForm(1);
        await expect.poll(() => guest.filterFormDisplays()).toEqual(['block', 'none']);
    });

    test('a search typed in the second bar is submitted by that bar and refills both bars', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoFixture(fixturePages.twoBars);
        await guest.searchStores(data.store.name, 1);
        await expect(page.locator(selectors.storeCard).filter({ hasText: data.store.name }).first()).toBeVisible();
        for (const input of await page.locator(selectors.searchInput).all()) {
            await expect(input).toHaveValue(data.store.name);
        }
    });

    // ---- two listings on one page --------------------------------------------------------

    test('the view toggle switches every listing on the page, not just the first', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoFixture(fixturePages.twoLists);
        await guest.clearSavedLayout();
        await page.reload({ waitUntil: 'domcontentloaded' });

        const wraps = page.locator(selectors.listingWrap);
        await expect(wraps).toHaveCount(2);

        await guest.setLayout('list-view');
        for (const wrap of await wraps.all()) await expect(wrap).toHaveClass(/list-view/);

        await guest.setLayout('grid-view');
        for (const wrap of await wraps.all()) await expect(wrap).toHaveClass(/grid-view/);
    });

    // ---- narrow layouts ------------------------------------------------------------------

    test('filter bar stays inside a phone viewport with the form open', { tag: ['@lite', '@guest'] }, async () => {
        await guest.resizeViewport(data.viewport.phone);
        await guest.gotoFixture(fixturePages.single);
        await guest.toggleFilterForm(0);
        await expect(page.locator(selectors.filterFormWrap).first()).toBeVisible();
        const layout = await guest.getBarLayout(0);
        expect(layout.horizontalScroll, 'page does not scroll sideways').toBe(false);
        expect(layout.overflowingChildren).toEqual([]);
    });

    test('filter bar in a 25% column keeps its fields inside the bar', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoFixture(fixturePages.narrowColumn);
        await guest.toggleFilterForm(0);
        await expect(page.locator(selectors.filterFormWrap).first()).toBeVisible();
        const layout = await guest.getBarLayout(0);
        expect(layout.barWidth).toBeLessThan(300);
        expect(layout.overflowingChildren).toEqual([]);
        expect(layout.horizontalScroll).toBe(false);
    });

    test('a wide filter bar is not forced into the phone arrangement by the viewport alone', { tag: ['@lite', '@guest'] }, async () => {
        await guest.gotoFixture(fixturePages.single);
        const layout = await guest.getBarLayout(0);
        expect(layout.barWidth).toBeGreaterThan(500);
        expect(layout.overflowingChildren).toEqual([]);
    });

    // ---- Pro fields inside the blocks ----------------------------------------------------

    test('rating field is present on every filter bar of the page', { tag: ['@pro', '@guest'] }, async () => {
        test.skip(!isPro, 'Pro filter field');
        await guest.gotoFixture(fixturePages.twoBars);
        for (let index = 0; index < 2; index++) {
            await expect(page.locator(selectors.filterBar).nth(index).locator(selectors.ratingStars)).toHaveCount(5);
        }
    });

    test('category dropdown on the second bar selects a category and filters both bars', { tag: ['@pro', '@guest'] }, async () => {
        test.skip(!isPro, 'Pro filter field');
        await guest.gotoFixture(fixturePages.twoBars);
        await guest.toggleFilterForm(1);
        const slug = await guest.pickCategory(1, data.category);
        await guest.pickRating(4, 1);
        await guest.applyFilters(1);

        await expect(page).toHaveURL(new RegExp(`store_categories(%5B%5D|\\[\\])=${slug}`));
        await expect(page).toHaveURL(/rating=4/);
        expect(await guest.storeCount()).toBeGreaterThan(0);

        // both bars come back showing the same selection
        for (let index = 0; index < 2; index++) {
            const bar = page.locator(selectors.filterBar).nth(index);
            await expect(bar.locator(`${selectors.categoryItem}[data-slug="${slug}"]`)).toHaveClass(/dokan-btn-theme/);
            await expect(bar.locator('[data-rating="4"]')).toHaveClass(/active/);
        }
    });

    test('selecting a category with no stores shows the empty state', { tag: ['@pro', '@guest'] }, async () => {
        test.skip(!isPro, 'Pro filter field');
        await guest.gotoFixture(fixturePages.single);
        const nonce = await guest.filterNonce();
        await guest.goto(`${FseStorePagesPage.pageUrl(fixturePages.single)}?store_categories[]=no-such-category&_store_filter_nonce=${nonce}`);
        await expect(page.locator(selectors.noVendorText).first()).toBeVisible();
        expect(await guest.hasFatal()).toBe(false);
    });

    test('featured filter from the block bar lists only featured stores', { tag: ['@pro', '@guest'] }, async () => {
        test.skip(!isPro, 'Pro filter field');
        await guest.gotoFixture(fixturePages.single);
        await guest.toggleFilterForm(0);
        await page.locator(selectors.featured).first().click();
        await guest.applyFilters(0);
        const cards = await guest.storeCount();
        expect(cards).toBeGreaterThan(0);
        await expect(page.locator(`${selectors.storeCard} div.featured-label`)).toHaveCount(cards);
    });

    test('category field is hidden while the store category feature is off', { tag: ['@pro', '@guest'] }, async () => {
        test.skip(!isPro, 'Pro filter field');
        test.skip(preconfigured, 'toggles the option through the database');
        await FseStorePagesPage.setStoreCategoryType('none');
        try {
            await guest.gotoFixture(fixturePages.single);
            await expect(page.locator(selectors.categoryInput)).toHaveCount(0);
        } finally {
            await FseStorePagesPage.setStoreCategoryType(data.storeCategoryType);
        }
    });

    // ---- single store on a block theme ----------------------------------------------------

    for (const tab of data.storeTabs.lite) {
        test(`store page "/${tab}" falls back to a store, never the blog index`, { tag: ['@lite', '@guest'] }, async () => {
            expect(await guest.openStore(tab)).toBe(200);
            expect(await guest.isBlogIndex()).toBe(false);
            expect(await guest.hasFatal()).toBe(false);
            await expect(page.locator(selectors.storeNotBlog).first()).toBeAttached();
        });
    }

    for (const tab of data.storeTabs.pro) {
        test(`Pro store tab "/${tab}" renders on a block theme`, { tag: ['@pro', '@guest'] }, async () => {
            test.skip(!isPro, 'Pro store tab');
            expect(await guest.openStore(tab)).toBe(200);
            expect(await guest.isBlogIndex()).toBe(false);
            expect(await guest.hasFatal()).toBe(false);
        });
    }

    for (const tab of [...data.storeTabs.lite, ...data.storeTabs.pro]) {
        test(`missing store "/${tab}" is a 404 on a block theme`, { tag: ['@lite', '@guest'] }, async () => {
            expect(await guest.openMissingStore(tab)).toBe(404);
            expect(await guest.hasFatal()).toBe(false);
        });
    }

    // ---- template registry (needs an active block theme) -----------------------------------

    test('admin sees the single store template registered by Dokan', { tag: ['@lite', '@admin'] }, async () => {
        const { status, body } = await admin.restGet('/wp/v2/templates');
        expect(status).toBe(200);
        const template = (body as Template[]).find(item => item.slug === data.template.slug && item.source === data.template.source);
        expect(template, 'the single store template is registered by a plugin').toBeDefined();
        expect(template?.plugin).toMatch(/^dokan/);
    });

    test('a guest cannot read the template registry', { tag: ['@lite', '@guest'] }, async () => {
        const { status } = await guest.restGet('/wp/v2/templates', false);
        expect([401, 403]).toContain(status);
    });
});
