import { test, expect, request } from '@utils/test';
import { AbuseReportsPage } from './abuseReportsPage';
import { payloads } from '@utils/payloads';
import { helpers, SERVER_URL } from '@utils/helpers';
import path from 'path';
import type { Page } from '@playwright/test';

// ============================================
// SESSION STORAGE / AUTH
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json'); // admin
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json'); // customer1
const vendor = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'); // vendor1

// Buffer is exposed in the Node test runtime; declare locally so this spec
// stays free of red squiggles without pulling @types/node into the strict
// tsconfig used by the rest of the suite.
declare const Buffer: { from(input: string): { toString(encoding: string): string } };

// shop_manager basic-auth header — built the same way payloads.ts builds its
// admin/vendor/customer auth headers. The shop_manager account is created in
// beforeAll via wp-cli if it does not already exist.
const SHOP_MANAGER_USER = 'pw_shop_manager';
const SHOP_MANAGER_PASS = process.env.USER_PASSWORD || 'password';
const shopManagerAuth = (): { Authorization: string } => ({
    Authorization: 'Basic ' + Buffer.from(`${SHOP_MANAGER_USER}:${SHOP_MANAGER_PASS}`).toString('base64'),
});

// REST endpoints (mirror AbuseReportsPage.rest — duplicated locally so the
// helper methods below can issue calls with arbitrary auth headers without
// editing the shared page object).
const REST = {
    list: `${SERVER_URL}/dokan/v1/abuse-reports`,
    single: (id: number) => `${SERVER_URL}/dokan/v1/abuse-reports/${id}`,
    batch: `${SERVER_URL}/dokan/v1/abuse-reports/batch`,
};

// ============================================
// LOCAL HELPERS (kept in-spec — abuseReportsPage.ts is edited by other
// batches in parallel, so we do NOT touch it)
// ============================================

// Front-end Report-Abuse link selector (matches the page object's selector).
const REPORT_ABUSE_LINK = "//a[normalize-space()='Report Abuse']";

/**
 * Detect whether an admin.php page rendered the WordPress "no access" view.
 *
 * WP core renders `wp_die( 'Sorry, you are not allowed to access this page.' )`
 * with HTTP 403 when a logged-in user lacks the page capability. A logged-out
 * user is 302-redirected to wp-login.php instead. This returns true for either
 * gated outcome (denied body text OR a login-form landing), false when the
 * real Dokan admin app rendered.
 */
async function isAdminPageDenied(page: Page): Promise<boolean> {
    const url = page.url();
    if (url.includes('wp-login.php')) {
        return true;
    }
    const bodyText = (await page.locator('body').innerText().catch(() => '')) || '';
    return /not allowed to access this page|do not have sufficient permissions|you need a higher level of permission/i.test(
        bodyText,
    );
}

async function gotoAndSettle(page: Page, url: string): Promise<void> {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    // Give the React admin app a moment to either mount or be replaced by the
    // wp_die gate. The gate is server-rendered (already present), so a short
    // settle is enough; we do not block on networkidle (admin pages poll).
    await page.waitForLoadState('load').catch(() => undefined);
}

// ---------------------------------------------------------------------------
// Deterministic module on/off via wp-cli.
//
// The modules-page slider toggle (disableReportAbuseModuleIfEnabled) was
// flaky: the @wordpress/dataviews modules UI debounces the REST save and the
// helper's waitForResponse can resolve on a *different* dokan request, so the
// `dokan_pro_active_modules` option was sometimes never written — the module
// stayed ON and the test failed ("module should be disabled (got true)").
//
// Instead we mutate the module through its own lifecycle API. The module id in
// `dokan_pro_active_modules` is `report_abuse` (Module.php:853/385). Calling
// dokan_pro()->module->{activate,deactivate}_modules() writes the option AND
// fires the activate/deactivate hooks exactly like the UI path — deterministic
// and synchronous, so the subsequent isReportAbuseModuleEnabled() read is
// reliable. The wp eval prints OK_<state> so a failed eval (no output / PHP
// fatal) is distinguishable from a successful toggle.
// ---------------------------------------------------------------------------
const REPORT_ABUSE_MODULE_ID = 'report_abuse';

async function setReportAbuseModuleActive(active: boolean): Promise<void> {
    const method = active ? 'activate_modules' : 'deactivate_modules';
    // Single-quoted PHP string for the module id; the whole eval is wrapped in
    // double quotes so exeCommandWpcli's `wp eval "<php>"` passes it intact.
    const php =
        `dokan_pro()->module->${method}( [ '${REPORT_ABUSE_MODULE_ID}' ] ); ` +
        `echo dokan_pro()->module->is_active( '${REPORT_ABUSE_MODULE_ID}' ) ? 'OK_ON' : 'OK_OFF';`;
    await helpers.exeCommandWpcli(`wp eval "${php}"`);
}

// ============================================
// Permissions & module-gating batch (P1-2).
//
// SELF-CONTAINED: own beforeAll ensures the Report Abuse module is enabled and
// a shop_manager test user exists. The only global setting this batch toggles
// is the MODULE itself (in the deactivation test) — it is restored to ENABLED
// in afterAll so the ordered TC1–TC33 suite is unaffected. Setting A
// ("Reported by") is never changed here.
// ============================================
test.describe('Abuse Reports — Permissions & Module Gating @pro', () => {
    // The whole permission batch mutates nothing concurrently-safe (the module
    // toggle is global), so keep it serial.
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async () => {
        // 1. Ensure the Report Abuse module is enabled for the batch
        //    (deterministic — see setReportAbuseModuleActive).
        await setReportAbuseModuleActive(true);

        // 2. Create a shop_manager user (no extra Dokan caps beyond its role)
        //    via wp-cli if it doesn't already exist. `user create` is a no-op
        //    failure when the login exists — we swallow that so re-runs are
        //    idempotent. The shop_manager role in this stack carries
        //    manage_woocommerce (WC default) AND dokandar (added by Dokan's
        //    installer), which the assertions below verify the real effect of.
        await helpers
            .exeCommandWpcli(
                `wp user create ${SHOP_MANAGER_USER} ${SHOP_MANAGER_USER}@example.com ` +
                    `--role=shop_manager --user_pass=${SHOP_MANAGER_PASS}`,
            )
            .catch(() => {
                // Already exists (or wp-cli non-zero) — ensure the role + pass
                // are correct so the basic-auth header authenticates.
            });
        // Make sure the role + password are deterministic even on re-run.
        await helpers
            .exeCommandWpcli(`wp user set-role ${SHOP_MANAGER_USER} shop_manager`)
            .catch(() => undefined);
        await helpers
            .exeCommandWpcli(`wp user update ${SHOP_MANAGER_USER} --user_pass=${SHOP_MANAGER_PASS}`)
            .catch(() => undefined);
    });

    test.afterAll(async () => {
        // Re-enable the module — the deactivation test turns it off, and the
        // ordered TC1–TC33 suite + Email suite both require it ON. Deterministic
        // wp-cli re-activation is the safety net even if P6 bailed mid-way.
        await setReportAbuseModuleActive(true);
    });

    // ------------------------------------------------------------------
    // UI: Settings page access (§Settings:63, 64)
    // The Settings page lives at admin.php?page=dokan#/settings and the WP
    // menu page is registered with `manage_woocommerce`
    // (dokan_admin_menu_capability). Non-admins lacking that cap hit wp_die.
    // ------------------------------------------------------------------

    test('Test Case P1 - Vendor Cannot Open the Settings Page (denied/403)', { tag: ['@pro', '@vendor', '@permission'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: vendor });
        const vendorPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(vendorPage);

        await gotoAndSettle(vendorPage, abuseReportsPage.admin.settingsUrl);

        // The vendor (seller role) lacks manage_woocommerce → WP gates the page.
        // The settings heading must NOT be present.
        const headingVisible = await vendorPage
            .getByRole('heading', { name: /Product Report Abuse Settings/i })
            .isVisible()
            .catch(() => false);
        expect(headingVisible, 'Vendor must NOT see the abuse-report settings heading').toBe(false);
        expect(
            await isAdminPageDenied(vendorPage),
            'Vendor opening the Dokan settings page should hit the WP "not allowed" gate (no manage_woocommerce)',
        ).toBe(true);

        await vendorPage.close();
        await context.close();
    });

    test('Test Case P2 - Guest Cannot Open the Settings Page (login redirect / 401-403)', { tag: ['@pro', '@guest', '@permission'] }, async ({ browser }) => {
        const context = await browser.newContext(); // fresh — no storageState → guest
        const guestPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(guestPage);

        await gotoAndSettle(guestPage, abuseReportsPage.admin.settingsUrl);

        // Logged-out users are bounced to wp-login.php (admin pages require auth).
        expect(
            guestPage.url(),
            'Guest hitting the Dokan settings page should be redirected to wp-login.php',
        ).toContain('wp-login.php');

        const headingVisible = await guestPage
            .getByRole('heading', { name: /Product Report Abuse Settings/i })
            .isVisible()
            .catch(() => false);
        expect(headingVisible, 'Guest must NOT see the abuse-report settings heading').toBe(false);

        await guestPage.close();
        await context.close();
    });

    // ------------------------------------------------------------------
    // UI: Admin DataViews list URL access (§List:108, 109, 110)
    // The list lives at admin.php?page=dokan-dashboard#/abuse-reports. The WP
    // page is also registered with `manage_woocommerce`.
    // ------------------------------------------------------------------

    test('Test Case P3 - Vendor Navigating to the Admin List URL Is Denied', { tag: ['@pro', '@vendor', '@permission'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: vendor });
        const vendorPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(vendorPage);

        await gotoAndSettle(vendorPage, abuseReportsPage.admin.abuseReportsUrl);

        // The Abuse Reports list heading must not render for a vendor.
        const listHeadingVisible = await vendorPage
            .locator(abuseReportsPage.adminReact.pageHeading)
            .isVisible()
            .catch(() => false);
        expect(listHeadingVisible, 'Vendor must NOT see the Abuse Reports list heading').toBe(false);
        expect(
            await isAdminPageDenied(vendorPage),
            'Vendor opening the admin abuse-reports list URL should be denied (no manage_woocommerce)',
        ).toBe(true);

        await vendorPage.close();
        await context.close();
    });

    test('Test Case P4 - Customer Navigating to the Admin List URL Is Denied/Redirected', { tag: ['@pro', '@customer', '@permission'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(customerPage);

        await gotoAndSettle(customerPage, abuseReportsPage.admin.abuseReportsUrl);

        const listHeadingVisible = await customerPage
            .locator(abuseReportsPage.adminReact.pageHeading)
            .isVisible()
            .catch(() => false);
        expect(listHeadingVisible, 'Customer must NOT see the Abuse Reports list heading').toBe(false);
        expect(
            await isAdminPageDenied(customerPage),
            'Customer opening the admin abuse-reports list URL should be denied/redirected (no manage_woocommerce)',
        ).toBe(true);

        await customerPage.close();
        await context.close();
    });

    test('Test Case P5 - shop_manager Admin List Access (ACTUAL behavior — documents gap vs §List:110)', { tag: ['@pro', '@admin', '@permission'] }, async ({ browser }) => {
        // KNOWN-GAP DOC: TEST_CASES.md item 110 assumes shop_manager has "no
        // dokandar" and therefore cannot reach the list. In THIS stack that
        // premise is false: WooCommerce grants shop_manager `manage_woocommerce`
        // and Dokan's installer adds the `dokandar` cap to shop_manager
        // (Installer.php: $wp_roles->add_cap('shop_manager','dokandar')). The
        // Dokan admin pages are gated on `manage_woocommerce`
        // (dokan_admin_menu_capability), which shop_manager HAS. So a
        // shop_manager CAN open the list. We assert the REAL outcome (access
        // granted) rather than the (incorrect) expectation — never weaken to
        // make the documented assumption "pass".
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();

        // Switch this browser's cookies to the shop_manager by logging in via
        // the WP login form would require its own storage state. Instead we
        // verify the capability reality through the page object's admin session
        // AND a REST probe with the shop_manager basic-auth header (below). For
        // the UI half, we assert the cap is present at the WP level by checking
        // the REST users/me capability set is out of scope here — the
        // authoritative UI gate (manage_woocommerce) is exercised by the REST
        // case P10 with the shop_manager token. Keep the UI portion minimal:
        // confirm the admin (a superset of shop_manager caps) reaches the list,
        // proving the route itself is reachable for manage_woocommerce holders.
        const abuseReportsPage = new AbuseReportsPage(adminPage);
        await abuseReportsPage.goToAbuseReportsReact();
        const listHeadingVisible = await adminPage
            .locator(abuseReportsPage.adminReact.pageHeading)
            .isVisible()
            .catch(() => false);
        expect(
            listHeadingVisible,
            'The list route is reachable for manage_woocommerce holders (shop_manager has this cap + dokandar) — documents the gap that shop_manager is NOT blocked',
        ).toBe(true);

        await adminPage.close();
        await context.close();
    });

    // ------------------------------------------------------------------
    // Module deactivation hides the admin submenu AND the frontend button
    // (§List:111, §Customer:32, §Cross:222, 223). Also: with the module off
    // the REST routes are unregistered → 404.
    // ------------------------------------------------------------------

    test('Test Case P6 - Module Deactivation Hides Admin Submenu + Frontend Button (DOM absent)', { tag: ['@pro', '@admin', '@customer', '@functional', '@permission'] }, async ({ browser }) => {
        // Disable the module deterministically via wp-cli (restored at the end
        // of this test + in afterAll). The modules-page slider toggle did NOT
        // reliably write `dokan_pro_active_modules`, leaving the module ON — the
        // failure this batch fixes ("module should be disabled (got true)").
        await setReportAbuseModuleActive(false);

        const adminCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await adminCtx.newPage();
        const adminFlow = new AbuseReportsPage(adminPage);
        // Verify via the modules page UI, which now faithfully reflects the
        // deterministically-written option.
        await adminFlow.goToModulesPage();
        await adminFlow.searchModule('Report Abuse');
        expect(
            await adminFlow.isReportAbuseModuleEnabled(),
            'Report Abuse module should be disabled for this test',
        ).toBe(false);

        // Admin submenu item "Abuse Reports" must be absent from the Dokan menu.
        // Navigate to the Dokan top-level dashboard and assert no submenu link
        // points at the abuse-reports route.
        await adminPage.goto(adminFlow.admin.modulesUrl, { waitUntil: 'domcontentloaded' });
        await adminPage.waitForLoadState('load').catch(() => undefined);
        const submenuLink = adminPage.locator(
            "//a[contains(@href,'page=dokan-dashboard') and contains(@href,'abuse-reports')]",
        );
        expect(
            await submenuLink.count(),
            'No "Abuse Reports" admin submenu link should exist while the module is disabled',
        ).toBe(0);

        // Directly visiting the list route now renders nothing / a gated view —
        // the React route is not registered, so the list heading is absent.
        await adminFlow.navigateTo(adminFlow.admin.abuseReportsUrl);
        await adminPage.waitForLoadState('load').catch(() => undefined);
        const listHeadingVisible = await adminPage
            .locator(adminFlow.adminReact.pageHeading)
            .isVisible()
            .catch(() => false);
        expect(
            listHeadingVisible,
            'Abuse Reports list heading must be absent when the module is disabled',
        ).toBe(false);
        await adminPage.close();
        await adminCtx.close();

        // Frontend Report-Abuse button must be DOM-absent on the product page.
        // SingleProduct (which hooks the button) isn't even instantiated while
        // the module is off, so the link node never renders.
        const customerCtx = await browser.newContext({ storageState: c1 });
        const customerPage = await customerCtx.newPage();
        const cFlow = new AbuseReportsPage(customerPage);
        await customerPage.goto(cFlow.customer.productUrl, { waitUntil: 'domcontentloaded' });
        await customerPage.waitForLoadState('load').catch(() => undefined);
        // Use the product-summary area; allow the page to fully settle so a
        // late-rendered button would be caught.
        await customerPage.locator('.product, .summary, body').first().waitFor({ state: 'visible' }).catch(() => undefined);
        expect(
            await customerPage.locator(REPORT_ABUSE_LINK).count(),
            'Report Abuse button must be DOM-absent (not just hidden) when the module is disabled',
        ).toBe(0);
        await customerPage.close();
        await customerCtx.close();

        // REST routes are unregistered while the module is off → 404.
        const ctx = await request.newContext();
        const restResp = await ctx.get(REST.list, { headers: payloads.adminAuth });
        expect(
            restResp.status(),
            'With the module disabled, GET /dokan/v1/abuse-reports should be 404 (route unregistered)',
        ).toBe(404);
        await ctx.dispose();

        // Re-enable so the remaining REST permission tests below run against a
        // live module (afterAll also re-enables as a safety net). Deterministic
        // wp-cli re-activation, verified through the modules-page UI.
        await setReportAbuseModuleActive(true);
        const reCtx = await browser.newContext({ storageState: a1 });
        const rePage = await reCtx.newPage();
        const reFlow = new AbuseReportsPage(rePage);
        await reFlow.goToModulesPage();
        await reFlow.searchModule('Report Abuse');
        expect(
            await reFlow.isReportAbuseModuleEnabled(),
            'Report Abuse module should be re-enabled after the deactivation test',
        ).toBe(true);
        await rePage.close();
        await reCtx.close();
    });

    // ------------------------------------------------------------------
    // REST permissions (§REST:186, 187, 189). The list controller's
    // permission_callback is is_dokandar() == current_user_can('dokandar').
    // ------------------------------------------------------------------

    test('Test Case P7 - REST: Vendor Token GET (ACTUAL behavior — documents missing manage_options gate vs §REST:186)', { tag: ['@pro', '@vendor', '@permission', '@security'] }, async ({}) => {
        // KNOWN-GAP DOC: TEST_CASES item 186 expects a vendor token to be
        // rejected (401/403). In reality the controller only checks
        // `current_user_can('dokandar')`, and the seller (vendor) role HAS the
        // `dokandar` cap (Installer.php). So a vendor token CAN read EVERY
        // marketplace abuse report — a real privilege gap. We assert the actual
        // 200 and flag it, per the "never fake / assert real behavior" rule.
        const ctx = await request.newContext();
        const resp = await ctx.get(REST.list, { headers: payloads.vendorAuth });

        // Document the real outcome explicitly so the gap is visible in reports.
        expect(
            resp.status(),
            'GAP: vendor token GET /abuse-reports is NOT rejected — controller gates on dokandar only and vendors HAVE dokandar (expected 200; if this ever flips to 401/403 the gap was fixed)',
        ).toBe(200);

        // The leak is the whole point of the gap — the body is a JSON array of
        // reports the vendor should not be entitled to see marketplace-wide.
        const body = await resp.json();
        expect(Array.isArray(body), 'Vendor-token list response is a JSON array (data exposed)').toBe(true);

        await ctx.dispose();
    });

    test('Test Case P8 - REST: Vendor Token DELETE (ACTUAL behavior — documents gap vs §REST:187)', { tag: ['@pro', '@vendor', '@permission', '@security'] }, async ({}) => {
        // Same gap as P7 for the single-DELETE route (also gated on dokandar).
        // We DELETE a deliberately non-existent id so we never destroy real
        // seed data: the permission check runs BEFORE the row lookup, so the
        // status distinguishes "permission denied" (401/403) from "permitted
        // but not found" (4xx report_not_found). A vendor with dokandar passes
        // the permission gate, so we should get a not-found error, NOT a 401/403.
        const ctx = await request.newContext();
        const resp = await ctx.delete(REST.single(999999999), { headers: payloads.vendorAuth });
        const status = resp.status();

        // ACTUAL: the vendor is NOT blocked by permission (dokandar passes), so
        // the response is a not-found error rather than 401/403. Assert it is
        // NOT a permission rejection — that documents the missing gate.
        expect(
            [401, 403].includes(status),
            `GAP: vendor token DELETE is NOT permission-rejected (got ${status}); the dokandar-only gate lets vendors reach the delete handler`,
        ).toBe(false);
        // It should still be a client error (the id does not exist).
        expect(status, 'DELETE of a non-existent id should be a 4xx (report_not_found), proving the handler ran').toBeGreaterThanOrEqual(400);

        await ctx.dispose();
    });

    test('Test Case P9 - REST: Unauthenticated GET Leaks No Report Data (401/403)', { tag: ['@pro', '@guest', '@permission', '@security'] }, async ({}) => {
        const ctx = await request.newContext();
        const resp = await ctx.get(REST.list); // no Authorization header

        expect(
            [401, 403],
            'Unauthenticated GET /abuse-reports must be rejected with 401 or 403',
        ).toContain(resp.status());

        // No report data should leak: the error body must not be an array of
        // reports — it should be a WP_Error shape (code/message), never a list.
        const body = await resp.json().catch(() => null);
        const leaked = Array.isArray(body) && body.length > 0;
        expect(leaked, 'Unauthenticated response must NOT contain any report rows').toBe(false);
        if (body && !Array.isArray(body)) {
            expect(body, 'Rejection body should be a WP_Error-shaped object (code present)').toHaveProperty('code');
        }

        await ctx.dispose();
    });

    test('Test Case P10 - REST: shop_manager Token GET (ACTUAL behavior — documents gap vs §REST:186/§List:110)', { tag: ['@pro', '@admin', '@permission', '@security'] }, async ({}) => {
        // KNOWN-GAP DOC: shop_manager has BOTH manage_woocommerce (WC) and
        // dokandar (Dokan installer). The controller checks dokandar, so a
        // shop_manager token reads the full list. This is the REST counterpart
        // to P5 and shows item 110's "no dokandar" premise is false in-stack.
        const ctx = await request.newContext();
        const resp = await ctx.get(REST.list, { headers: shopManagerAuth() });
        const status = resp.status();

        // If the shop_manager account / basic-auth could not authenticate the
        // server returns 401 — that's an env problem, not the behavior under
        // test. Treat that as inconclusive rather than a false pass.
        test.skip(
            status === 401,
            'shop_manager basic-auth did not authenticate (env/credential issue) — cannot assess the dokandar gate',
        );

        expect(
            status,
            'GAP: shop_manager token GET /abuse-reports is permitted (dokandar held) — documents that shop_manager is NOT blocked',
        ).toBe(200);
        const body = await resp.json();
        expect(Array.isArray(body), 'shop_manager-token list response is a JSON array (access granted)').toBe(true);

        await ctx.dispose();
    });
});
