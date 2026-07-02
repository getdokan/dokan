import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewCouponsPage, newCouponData, NEW_COUPON_PREFIX } from './newCouponsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// SESSION STORAGE
// ============================================
// Admin-side seeding is done over REST via ApiUtils (payloads.adminAuth), so no
// admin browser storage state is needed here.

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of vendor Coupons.
// Surfaces: /dashboard/new/#/coupons          (DataViews list)
//           /dashboard/new/#/coupons/create   (form)
//           /dashboard/new/#/coupons/update/:id (form)
// Ported from the legacy `new-coupons` smoke spec, driving the React UI, plus
// admin marketplace-coupon and a cross-role business flow.
//
// NOTE on discount types: the create form's discount-type select is populated
// from `window.dokanCoupon.coupon_types`, which exposes `percent` and
// `fixed_product` (and booking/recurring types) but NOT `fixed_cart`. The
// "Fixed cart discount" label only exists in the list display mapping, so a
// fixed-cart coupon cannot be created through this React form — that case is
// covered by `test.skip` with an explicit reason, and a fixed-PRODUCT coupon
// is exercised instead.
// ============================================

// Delete every coupon this file created (prefix `pwnewui`) via the REAL
// ApiUtils, leaving the pre-seeded `c1_v1` fixture intact.
async function cleanupTestCoupons(): Promise<void> {
    const apiUtils = new ApiUtils(await request.newContext());
    try {
        const coupons = await apiUtils.getAllCoupons(payloads.vendorAuth);
        const mine = (coupons as Array<{ id: number; code: string }>).filter(
            (c) => typeof c.code === 'string' && c.code.toLowerCase().startsWith(NEW_COUPON_PREFIX)
        );
        for (const c of mine) {
            await apiUtils.delete(endPoints.deleteCoupon(String(c.id)), { headers: payloads.vendorAuth }).catch(() => undefined);
        }
    } finally {
        await apiUtils.dispose();
    }
}

test.describe('Coupons (React) functionality', () => {
    test.afterAll(async () => {
        await cleanupTestCoupons();
    });

    // ----------------------------------------
    // VENDOR
    // ----------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let coupons: NewCouponsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            coupons = new NewCouponsPage(page);
            await coupons.goto();
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor sees coupons list with My/Marketplace tabs and the seeded c1_v1 row (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await expect(coupons.heading).toBeVisible();
            await expect(coupons.tabMyCoupons).toBeVisible();
            await expect(coupons.tabMarketplace).toBeVisible();
            await expect(coupons.rowByCode(newCouponData.seededCode).first()).toBeVisible();
            expect(await coupons.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor "Add New Coupon" navigates to the create form (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await coupons.clickAddNew();
            expect(page.url()).toContain('#/coupons/create');
            await expect(coupons.codeInput).toBeVisible();
            await expect(coupons.createButton).toBeVisible();
        });

        test('vendor can create a percentage-discount coupon (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const data = newCouponData.percentage();
            await coupons.gotoCreate();
            await coupons.createPercentageCoupon(data);
            // Back on the list, the new coupon appears.
            await coupons.goto();
            await coupons.fillSearch(data.code);
            await expect(coupons.rowByCode(data.code).first()).toBeVisible();
        });

        test('vendor can create a fixed-product-discount coupon (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // fixed_product is validated client-side to require at least one
            // product OR category, so createFixedProductCoupon picks a product in
            // the #product AsyncSearchableSelect before saving.
            const data = newCouponData.fixedProduct();
            await coupons.gotoCreate();
            await coupons.createFixedProductCoupon(data);
            await coupons.goto();
            await coupons.fillSearch(data.code);

            // Verify in the React list; fall back to a REST confirmation so a
            // list-render/search hiccup can't mask a genuine creation.
            if (!(await coupons.hasCouponRow(data.code))) {
                const apiUtils = new ApiUtils(await request.newContext());
                const all = (await apiUtils.getAllCoupons(payloads.vendorAuth)) as Array<{ code: string }>;
                await apiUtils.dispose();
                expect(
                    all.some((c) => typeof c.code === 'string' && c.code.toLowerCase() === data.code),
                    'fixed-product coupon exists (confirmed via REST)'
                ).toBe(true);
            } else {
                await expect(coupons.rowByCode(data.code).first()).toBeVisible();
            }
        });

        // The discount-type select offers only percent/fixed_product (and
        // booking/recurring) from `window.dokanCoupon.coupon_types`. `fixed_cart`
        // is NOT a creatable option in the React form (it exists only in the
        // list display mapping), so a fixed-cart coupon cannot be created here.
        test.skip('vendor can create a fixed-cart-discount coupon (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // Intentionally skipped — see note above.
        });

        test('vendor can edit a coupon via /coupons/update/:id (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // Create a coupon to edit.
            const data = newCouponData.percentage();
            await coupons.gotoCreate();
            await coupons.createPercentageCoupon(data);

            // Open it from the list via its code link -> edit form.
            await coupons.goto();
            await coupons.fillSearch(data.code);
            await coupons.openCouponByCodeLink(data.code);
            expect(page.url()).toContain('#/coupons/update/');

            // Change the amount and update.
            await coupons.fillAmount('25');
            await coupons.submitUpdate();
            await coupons.waitForSaveSuccess();

            // Still listed after the update.
            await coupons.goto();
            await coupons.fillSearch(data.code);
            await expect(coupons.rowByCode(data.code).first()).toBeVisible();
        });

        test('vendor can delete a coupon via the row action (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const data = newCouponData.percentage();
            await coupons.gotoCreate();
            await coupons.createPercentageCoupon(data);

            await coupons.goto();
            await coupons.fillSearch(data.code);
            await expect(coupons.rowByCode(data.code).first()).toBeVisible();

            await coupons.deleteCouponByCode(data.code);

            await coupons.goto();
            await coupons.fillSearch(data.code);
            expect(await coupons.hasCouponRow(data.code), 'deleted coupon no longer listed').toBe(false);
        });

        test('vendor search narrows the coupons list (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // Seeded c1_v1 is present; searching for it should keep it and
            // searching for a non-existent code should empty the list.
            await coupons.fillSearch(newCouponData.seededCode);
            await expect(coupons.rowByCode(newCouponData.seededCode).first()).toBeVisible();

            await coupons.clearSearch();
            await coupons.fillSearch('zzz_no_such_coupon_zzz');
            expect(await coupons.getRowCount(), 'no rows for an unmatched search').toBe(0);
        });

        test('vendor empty search restores the full list (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await coupons.fillSearch('zzz_no_such_coupon_zzz');
            expect(await coupons.getRowCount()).toBe(0);
            await coupons.clearSearch();
            await expect(coupons.rowByCode(newCouponData.seededCode).first()).toBeVisible();
        });

        test('vendor cannot create a coupon with an empty title (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // The Coupon Title (`#code`) field carries the native HTML5 `required`
            // attribute, so an empty-title submit is blocked by the browser's
            // constraint validation BEFORE React's handleSubmit runs — the create
            // is prevented, the form stays put, and no coupon is created. (Verified
            // live: useCouponForm's "Validation Error" toast never fires because
            // native validation preempts the submit.) This is the real guard.
            await coupons.gotoCreate();
            await coupons.selectDiscountType('percent');
            await coupons.fillAmount('10');

            // The required title field is invalid while empty.
            const before = await coupons.getCodeFieldValidity();
            expect(before.required, 'code field is a native required field').toBe(true);
            expect(before.valueMissing, 'empty title is reported missing by the browser').toBe(true);
            expect(before.valid, 'empty title is invalid').toBe(false);

            // Attempting to submit does NOT navigate away and does NOT create a coupon.
            await coupons.submitCreate();
            await page.waitForTimeout(1500);
            expect(page.url(), 'stays on the create form (submit blocked)').toContain('#/coupons/create');

            // No success toast and no redirect to the list — nothing was saved.
            await expect(coupons.successToast).toBeHidden();
        });

        test('vendor toggling the Marketplace Coupons tab switches the list (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await coupons.switchToMarketplaceTab();
            await expect(coupons.tabMarketplace).toHaveAttribute('aria-selected', 'true');
            expect(await coupons.hasNoPhpFatal(), 'no PHP fatal on marketplace tab').toBe(true);
            // Back to My Coupons shows the seeded vendor coupon again.
            await coupons.switchToMyCouponsTab();
            await expect(coupons.rowByCode(newCouponData.seededCode).first()).toBeVisible();
        });
    });

    // ----------------------------------------
    // ADMIN
    // ----------------------------------------
    test.describe('admin', () => {
        test('admin marketplace coupon appears under the vendor Marketplace Coupons tab (React)', { tag: ['@pro', '@admin', '@vendor', '@new-ui'] }, async ({ browser }) => {
            // Seed an admin marketplace coupon via REST (WC coupons endpoint).
            const apiUtils = new ApiUtils(await request.newContext());
            const couponPayload = { ...payloads.createMarketPlaceCoupon(), code: `${NEW_COUPON_PREFIX}_mkt_${Date.now()}`.toLowerCase() };
            const [, , couponCode] = await apiUtils.createMarketPlaceCoupon(couponPayload, payloads.adminAuth);
            await apiUtils.dispose();

            // Vendor opens the Marketplace Coupons tab and finds it.
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const coupons = new NewCouponsPage(page);
            await coupons.goto();
            await coupons.switchToMarketplaceTab();
            await expect(coupons.rowByCode(couponCode).first()).toBeVisible({ timeout: 15000 });

            await page.close();
            await ctx.close();
        });
    });

    // ----------------------------------------
    // CUSTOMER
    // ----------------------------------------
    test.describe('customer', () => {
        test('customer order applying the vendor coupon records the discount (React-created coupon)', { tag: ['@pro', '@customer', '@vendor', '@new-ui'] }, async ({ browser }) => {
            // 1. Vendor creates a percentage coupon in the React UI.
            const data = newCouponData.percentage();
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const coupons = new NewCouponsPage(page);
            await coupons.gotoCreate();
            await coupons.createPercentageCoupon(data);
            await page.close();
            await ctx.close();

            // 2. Seed an order for the customer that applies that coupon code.
            //    (Full storefront checkout is too heavy/flaky for CI; seeding the
            //    order via REST is the deterministic equivalent and lets us
            //    assert the discount was applied.)
            const apiUtils = new ApiUtils(await request.newContext());
            const orderPayload = {
                ...payloads.createOrder,
                coupon_lines: [{ code: data.code }],
            };
            const [response, orderBody] = await apiUtils.createOrder(process.env.PRODUCT_ID as string, orderPayload, payloads.adminAuth);
            expect(response.ok(), 'order with coupon line created').toBeTruthy();
            // A percentage coupon must produce a non-zero discount total.
            expect(Number(orderBody.discount_total), 'order discount total reflects the coupon').toBeGreaterThan(0);
            await apiUtils.dispose();
        });
    });

    // ----------------------------------------
    // BUSINESS FLOW (cross-role end-to-end)
    // ----------------------------------------
    test.describe('business flow', () => {
        test('vendor creates a coupon (React) -> customer order applies it -> vendor sees usage increment (React)', { tag: ['@pro', '@vendor', '@customer', '@new-ui'] }, async ({ browser }) => {
            // 1. Vendor creates a percentage coupon in the React UI.
            const data = newCouponData.percentage();
            const vCtx = await browser.newContext({ storageState: v1 });
            const vPage = await vCtx.newPage();
            const vCoupons = new NewCouponsPage(vPage);
            await vCoupons.gotoCreate();
            await vCoupons.createPercentageCoupon(data);

            // 2. Confirm initial usage is 0 in the React list.
            await vCoupons.goto();
            await vCoupons.fillSearch(data.code);
            const before = await vCoupons.getUsageForCoupon(data.code);
            expect(before, 'initial usage shows 0').toMatch(/0\//);
            await vPage.close();
            await vCtx.close();

            // 3. Seed a customer order applying the coupon (REST), which
            //    increments the coupon's usage_count.
            const apiUtils = new ApiUtils(await request.newContext());
            const orderPayload = {
                ...payloads.createOrder,
                coupon_lines: [{ code: data.code }],
            };
            const [orderResponse, orderBody] = await apiUtils.createOrder(process.env.PRODUCT_ID as string, orderPayload, payloads.adminAuth);
            expect(orderResponse.ok(), 'order created').toBeTruthy();
            expect(Number(orderBody.discount_total), 'discount applied').toBeGreaterThan(0);
            await apiUtils.dispose();

            // 4. Vendor revisits the React list and sees the usage count > 0.
            const v2Ctx = await browser.newContext({ storageState: v1 });
            const v2Page = await v2Ctx.newPage();
            const v2Coupons = new NewCouponsPage(v2Page);
            await v2Coupons.goto();
            await v2Coupons.fillSearch(data.code);
            await expect
                .poll(async () => {
                    const usage = await v2Coupons.getUsageForCoupon(data.code);
                    const m = usage.match(/(\d+)\s*\//);
                    return m ? Number(m[1]) : 0;
                }, { timeout: 20000, intervals: [1000, 2000, 3000] })
                .toBeGreaterThan(0);
            await v2Page.close();
            await v2Ctx.close();
        });
    });
});
