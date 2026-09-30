import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewBookingPage } from './newBookingPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Net-new coverage for the React vendor "Booking" SPA (Pro module booking) at
// /dashboard/new/#/booking{,/resources,/calendar}. Ports the portable legacy
// vendor cases from tests/e2e/vendor-booking + vendor-booking-fast (both no-op
// stubs) + the A1 delete: products list render / search / delete, resource
// add + remove, calendar render. The add/edit product, manual add-booking, and
// resource-edit forms are LEGACY (window.location.href) → scoped out; those form
// cases + the storefront view/buy/bid cases + admin cases STAY (D3).
//
// DEFERRED (documented gap): the "my-bookings" list + Confirm-a-pending-booking
// flow. A booking ROW has no dokan create-REST — it requires a wc-bookings POST
// plus a _booking_seller_id / pending-confirmation post-meta seed (or a real
// storefront checkout), which is not reliably reproducible here. Covered nowhere
// yet; tracked in CONVERSION-LOG. Products delete + resource CRUD are the strong
// behavioral oracles this file ships.
//
// Requires the WooCommerce Bookings plugin active; module activation grants the
// vendor the 4 booking caps. Seed booking products via createBookableProduct
// (vendorAuth). Shared DB is polluted, so assert on the SEEDED name (§7).
// ============================================

let apiUtils: ApiUtils;
const seededProductIds: string[] = [];
const seededResourceIds: string[] = [];
const RESOURCES = `${SERVER_URL}/dokan/v1/booking/resources`;
// The shared DB accumulates resources from every run, so read a large page to
// find a just-created one (the default page size can push it off page 1).
const RESOURCES_ALL = `${RESOURCES}?per_page=100`;

/** All resources on the vendor's list (large page). */
async function listResources(): Promise<Array<{ id?: number; name?: string; title?: string }>> {
    const [, body] = await apiUtils.get(RESOURCES_ALL, { headers: payloads.vendorAuth }, false);
    return Array.isArray(body) ? body : (body?.data ?? []);
}

/** Seed a vendor-owned bookable product. Returns [id, name]. */
async function seedBookableProduct(): Promise<{ id: string; name: string }> {
    const [, id, name] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
    seededProductIds.push(id);
    return { id, name };
}

/** Seed a vendor-owned booking resource via the dokan REST endpoint. Returns [id, name]. */
async function seedResource(): Promise<{ id: string; name: string }> {
    const name = `PW Resource ${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const [, body] = await apiUtils.post(RESOURCES, { data: { name }, headers: payloads.vendorAuth });
    const id = String(body?.id ?? body?.resource_id ?? '');
    if (id) seededResourceIds.push(id);
    return { id, name };
}

test.describe('Booking (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The vendor Booking routes + REST + caps register only while the module is active.
        await apiUtils.activateModules(payloads.moduleIds.booking, payloads.adminAuth);
    });

    test.afterAll(async () => {
        for (const id of seededProductIds) await apiUtils.deleteProduct(id, payloads.adminAuth, true).catch(() => undefined);
        for (const id of seededResourceIds) await apiUtils.delete(`${RESOURCES}/${id}`, { headers: payloads.vendorAuth }).catch(() => undefined);
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor — products', () => {
        let ctx: BrowserContext;
        let page: Page;
        let booking: NewBookingPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            booking = new NewBookingPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can open the Booking products list mounted at #/booking (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const p = await seedBookableProduct();
            await booking.gotoProducts();
            expect(page.url(), 'on the /booking route').toMatch(/#\/booking/);
            expect(await booking.tabsVisible(), 'All / Published tabs render').toBe(true);
            await booking.search(p.name);
            await expect(booking.rowsWithText(p.name).first(), 'the seeded bookable product is listed').toBeVisible({ timeout: 15000 });
            expect(await booking.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('the booking products list renders Products / Type / Status / Price columns (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await seedBookableProduct();
            await booking.gotoProducts();
            expect(await booking.hasColumn(/product/i), 'Products column').toBe(true);
            expect(await booking.hasColumn(/type/i), 'Type column').toBe(true);
            expect(await booking.hasColumn(/status/i), 'Status column').toBe(true);
            expect(await booking.hasColumn(/price/i), 'Price column').toBe(true);
        });

        test('searching by product name narrows the list (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const p = await seedBookableProduct();
            await booking.gotoProducts();
            await booking.search(p.name);
            await expect(booking.rowsWithText(p.name).first(), 'the matching product remains after search').toBeVisible({ timeout: 15000 });
        });

        test('vendor can permanently delete a booking product after confirming (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const p = await seedBookableProduct();
            await booking.gotoProducts();
            await booking.search(p.name);
            await expect(booking.rowsWithText(p.name).first(), 'product present before delete').toBeVisible({ timeout: 15000 });
            await booking.deleteProduct(p.name);
            // UI oracle: row gone.
            await expect(booking.rowsWithText(p.name), 'booking product row removed').toHaveCount(0, { timeout: 15000 });
            // REST oracle: the product is gone (WC single-product GET 404s / not returned).
            const [resp] = await apiUtils.get(`${SERVER_URL}/dokan/v1/products/${p.id}`, { headers: payloads.vendorAuth }, false);
            expect([404, 403].includes(resp.status()), 'the deleted product is no longer retrievable (REST)').toBe(true);
        });

        test('HashRouter survives a reload on /booking (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await booking.gotoProducts();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await booking.waitForSettle();
            expect(page.url(), 'still on /booking after reload').toMatch(/#\/booking/);
            expect(await booking.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('vendor — resources', () => {
        let ctx: BrowserContext;
        let page: Page;
        let booking: NewBookingPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            booking = new NewBookingPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can add a booking resource via the React modal (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const name = `PW Res ${Date.now()}${Math.floor(Math.random() * 1000)}`;
            await booking.gotoResources();
            // The create POST returns the new resource id — the definitive create oracle.
            const createdId = await booking.addResource(name);
            if (createdId) seededResourceIds.push(createdId);
            expect(createdId, 'the create POST returned a resource id').toBeTruthy();
            // UI oracle: the new resource row appears in the list.
            await expect(booking.rowsWithText(name).first(), 'the new resource is listed').toBeVisible({ timeout: 15000 });
        });

        test('vendor can remove a booking resource (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const r = await seedResource();
            test.skip(!r.id, 'resource seed did not return an id');
            await booking.gotoResources();
            await expect(booking.rowsWithText(r.name).first(), 'seeded resource present before remove').toBeVisible({ timeout: 15000 });
            await booking.removeResource(r.name);
            // UI oracle: the resource row is gone.
            await expect(booking.rowsWithText(r.name), 'resource row removed').toHaveCount(0, { timeout: 15000 });
            // REST oracle: the vendor list no longer returns it.
            const arr = await listResources();
            expect(
                arr.some(x => String(x.id) === r.id),
                'the resource is gone from the vendor REST list',
            ).toBe(false);
        });

        test('HashRouter survives a reload on /booking/resources (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await booking.gotoResources();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await booking.waitForSettle();
            expect(page.url(), 'still on /booking/resources after reload').toMatch(/#\/booking\/resources/);
            expect(await booking.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('vendor — calendar', () => {
        let ctx: BrowserContext;
        let page: Page;
        let booking: NewBookingPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            booking = new NewBookingPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view the booking calendar and it fetches events (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const eventsFired = page
                .waitForResponse(r => /dokan\/v[0-9]+\/booking\/calendar-events\b/i.test(r.url()), { timeout: 20000 })
                .then(() => true)
                .catch(() => false);
            await booking.gotoCalendar();
            expect(page.url(), 'on the /booking/calendar route').toMatch(/#\/booking\/calendar/);
            expect(await booking.calendarVisible(), 'the FullCalendar widget renders').toBe(true);
            expect(await eventsFired, 'the calendar-events REST call fired').toBe(true);
            expect(await booking.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('cross-role', () => {
        let ctx: BrowserContext;
        let page: Page;

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('a logged-in customer cannot mount the vendor Booking route (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async ({ browser }) => {
            ctx = await browser.newContext({ storageState: c1 });
            page = await ctx.newPage();
            const booking = new NewBookingPage(page);
            await page.goto(booking.listUrl);
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            expect(await page.locator('#dokan-vendor-dashboard-root').count(), 'the vendor SPA root does not mount for a customer').toBe(0);
        });
    });
});
