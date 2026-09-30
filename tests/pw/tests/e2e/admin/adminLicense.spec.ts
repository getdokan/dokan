import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminLicensePage, adminLicenseEndpoints } from './adminLicensePage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import path from 'path';

// ============================================
// ADMIN LICENSE MANAGER — new React admin dashboard (Dokan Pro 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/license (LicensePage,
// registered onto the dokan-admin-dashboard-routes filter at path '/license').
//
// ADMIN-ONLY, Pro-gated. The shared environment ALREADY has a live, activated
// Pro license, so the page renders its ACTIVE surface on mount (GET
// /dokan-pro/v1/license/status -> is_valid): an "Active" pill, a masked
// license_key field, "Deactivate License" + "Refresh" buttons, and the
// Activations Remaining / Usage card.
//
// HARD SAFETY CONSTRAINT: these tests are NON-DESTRUCTIVE only. We NEVER click
// "Deactivate License" — doing so would disable Dokan Pro for the whole shared
// env and break every @pro test. We assert the deactivate button is PRESENT but
// never invoke it; the only action exercised is the idempotent "Refresh"
// re-check, after which we assert the license is still Active. No data is seeded.
//
// // @exploratory (NOT IMPLEMENTED, intentionally): a full activate->deactivate
// // round-trip would need an isolated env with a throwaway license key; it is
// // out of scope here precisely because deactivation is globally destructive.
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;

test.describe('Admin License manager functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let license: AdminLicensePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            license = new AdminLicensePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the License page with the "License" heading and no PHP fatal', { tag: ['@pro', '@admin'] }, async () => {
            await license.goto();
            await expect(license.reactRoot).toBeVisible();
            await expect(license.heading).toBeVisible();
            await expect(license.activationHeading).toBeVisible();
            expect(await license.hasNoPhpFatal(), 'no PHP fatal banner on /license').toBe(true);
        });

        test('the License Activation card shows the "Active" status pill', { tag: ['@pro', '@admin'] }, async () => {
            await license.goto();
            expect(await license.isActive(), 'a licensed env must render the Active pill').toBe(true);
        });

        test('the masked license_key field is present', { tag: ['@pro', '@admin'] }, async () => {
            await license.goto();
            expect(await license.isLicenseKeyFieldVisible(), 'license_key input is rendered').toBe(true);
            // When Active the field is shown read-only/disabled and the value is masked.
            await expect(license.licenseKeyInput).toBeVisible();
            await expect(license.licenseKeyInput).toHaveAttribute('placeholder', 'Enter your key here');
        });

        test('the "Deactivate License" and "Refresh" buttons are both present', { tag: ['@pro', '@admin'] }, async () => {
            await license.goto();
            // SAFETY: assert PRESENCE only — the Deactivate button is NEVER clicked.
            await expect(license.deactivateButton).toBeVisible();
            await expect(license.refreshButton).toBeVisible();
        });

        test('the Activations Remaining / Usage card is shown for an active license', { tag: ['@pro', '@admin'] }, async () => {
            await license.goto();
            await expect(license.isActive()).resolves.toBe(true);
            await expect(license.activationsRemainingHeading).toBeVisible();
        });

        test('clicking "Refresh" re-checks the status and the license stays Active with no error', { tag: ['@pro', '@admin'] }, async () => {
            await license.goto();
            expect(await license.isActive(), 'precondition: license is Active before Refresh').toBe(true);
            // Re-checks via GET /dokan-pro/v1/license/status (non-destructive).
            await license.clickRefreshAndAwaitStatus();
            expect(await license.isActive(), 'license remains Active after Refresh').toBe(true);
            expect(await license.hasNoPhpFatal(), 'Refresh must not surface a fatal/error').toBe(true);
            // The Deactivate button still renders -> we are still on the Active surface.
            await expect(license.deactivateButton).toBeVisible();
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let license: AdminLicensePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            license = new AdminLicensePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('reloading on #/license preserves the route and re-renders the Active surface', { tag: ['@pro', '@admin'] }, async () => {
            await license.goto();
            expect(await license.isActive()).toBe(true);
            await license.reload();
            await expect(page).toHaveURL(/#\/license/);
            await expect(license.heading).toBeVisible();
            expect(await license.isActive(), 'Active surface re-renders after reload').toBe(true);
        });

        test('a slow GET status keeps the page from crashing and resolves to the Active surface', { tag: ['@pro', '@admin'] }, async () => {
            // Delay (NOT alter) the real status response so the in-flight Spinner is
            // observable; we forward the genuine body so the env stays Active.
            await page.route(adminLicenseEndpoints.status, async route => {
                await new Promise(resolve => setTimeout(resolve, 2500));
                await route.continue();
            });
            await page.goto(license.url);
            await page.waitForLoadState('domcontentloaded');
            await expect(license.heading).toBeVisible({ timeout: 30000 });
            await expect(license.loadingSpinner).toBeVisible({ timeout: 5000 });
            expect(await license.isActive(20000), 'Active surface paints after the slow status resolves').toBe(true);
            expect(await license.hasNoPhpFatal(), 'a slow status must not crash the page').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('the license status REST endpoint forbids a vendor lacking manage_options', { tag: ['@pro', '@vendor'] }, async () => {
            // assert=false: a 401/403 is the expected outcome, not a failure.
            const [response] = await apiUtils.get(adminLicenseEndpoints.statusUrl, { headers: payloads.vendorAuth }, false);
            expect(response.ok(), 'vendor GET license status must be rejected').toBe(false);
            expect([401, 403], 'vendor must be rejected, not served the license status').toContain(response.status());
        });

        test('the license status REST endpoint forbids a customer lacking manage_options', { tag: ['@pro', '@customer'] }, async () => {
            const [response] = await apiUtils.get(adminLicenseEndpoints.statusUrl, { headers: payloads.customerAuth }, false);
            expect(response.ok(), 'customer GET license status must be rejected').toBe(false);
            expect([401, 403], 'customer must be rejected, not served the license status').toContain(response.status());
        });

        test('a logged-in vendor cannot reach the admin License page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const vctx = await browser.newContext({ storageState: v1 });
            const vpage = await vctx.newPage();
            const vlicense = new AdminLicensePage(vpage);
            await vpage.goto(vlicense.url);
            await vpage.waitForLoadState('domcontentloaded');
            expect(await vlicense.isAccessDenied(), 'a vendor must not see the admin License UI').toBe(true);
            await vctx.close();
        });

        test('a logged-in customer cannot reach the admin License page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const cctx = await browser.newContext({ storageState: c1 });
            const cpage = await cctx.newPage();
            const clicense = new AdminLicensePage(cpage);
            await cpage.goto(clicense.url);
            await cpage.waitForLoadState('domcontentloaded');
            expect(await clicense.isAccessDenied(), 'a customer must not see the admin License UI').toBe(true);
            await cctx.close();
        });
    });
});
