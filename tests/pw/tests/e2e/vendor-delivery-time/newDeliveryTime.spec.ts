import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { toPath } from '@utils/helpers';
import { REACT_ROOT, PHP_FATAL, waitForRootReady, hasNoPhpFatal } from '@utils/dataViews';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Deliberately-minimal MOUNT SMOKE for the React vendor "Delivery Time" dashboard
// (Pro module delivery_time) at /dashboard/new/#/delivery-time-dashboard.
//
// This surface is NOT a DataViews list and NOT a form we can drive: the dashboard
// bundle is a React-wrapped FullCalendar widget (no rows/tabs/search), and the
// delivery-time SETTINGS surface (#/settings/delivery-time) is a LEGACY PHP template
// with a classic POST + redirect save. So there is no behavioral React CRUD to port:
// per house-style §7 this file ships only a labeled mount smoke (root mounts, the
// calendar paints, no PHP fatal) + the cross-role negative. The vendor set-slots /
// filter / view-style behaviors stay on the legacy surface; the admin enable/disable
// and the customer storefront "buy with delivery time" cases STAY (D3). The legacy
// spec's transitional "(React)" describes navigate the LEGACY URL and are retired.
// ============================================

const DELIVERY_URL = toPath('dashboard/new/#/delivery-time-dashboard');
const CALENDAR_ROOT = '.fc, .fc-view-harness, .dokan-delivery-time, [class*="calendar"]';

let apiUtils: ApiUtils;

test.describe('Delivery Time (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.activateModules(payloads.moduleIds.deliveryTime, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can mount the Delivery Time dashboard calendar at #/delivery-time-dashboard (mount smoke, React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await page.goto(DELIVERY_URL);
            await page.waitForLoadState('domcontentloaded');
            await waitForRootReady(page);
            await page.waitForTimeout(1500);
            expect(page.url(), 'on the /delivery-time-dashboard route').toMatch(/#\/delivery-time-dashboard/);
            const calendarVisible = await page
                .locator(CALENDAR_ROOT)
                .first()
                .isVisible({ timeout: 12000 })
                .catch(() => false);
            expect(calendarVisible, 'the FullCalendar widget paints').toBe(true);
            expect(await hasNoPhpFatal(page), 'no PHP fatal').toBe(true);
        });

        test('the Delivery Time dashboard survives a reload (mount smoke, React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await page.goto(DELIVERY_URL);
            await page.waitForLoadState('domcontentloaded');
            await waitForRootReady(page);
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await waitForRootReady(page);
            expect(page.url(), 'still on /delivery-time-dashboard after reload').toMatch(/#\/delivery-time-dashboard/);
            expect(await hasNoPhpFatal(page), 'no PHP fatal after reload').toBe(true);
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

        test('a logged-in customer cannot mount the vendor Delivery Time route (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async ({ browser }) => {
            ctx = await browser.newContext({ storageState: c1 });
            page = await ctx.newPage();
            await page.goto(DELIVERY_URL);
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            expect(await page.locator(REACT_ROOT).count(), 'the vendor SPA root does not mount for a customer').toBe(0);
            void PHP_FATAL;
        });
    });
});
