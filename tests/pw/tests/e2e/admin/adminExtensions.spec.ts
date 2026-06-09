import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminExtensionsPage, adminExtensionsData } from './adminExtensionsPage';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import path from 'path';

// ============================================
// ADMIN EXTENSIONS — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/extensions (ExtensionsPage).
//
// ADMIN-ONLY spec. The Extensions area is a STATIC, server-driven marketing /
// recommendations surface (getSettings('extensions') baked from
// includes/Admin/Dashboard/Pages/Extensions.php) — it has no per-test DB/REST
// state, so there is genuinely nothing to seed. The only network call the page
// makes is POST /dokan/v1/admin/extensions/install, which we MOCK via page.route
// so CI never performs a real wp.org plugin install.
// See tests/pw/test-cases/new-dashboards-test-cases.md (§ Extensions 458-493).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

// REST endpoint the Install Free card POSTs to (RecommendedAddons.handleInstall).
const INSTALL_ENDPOINT = /\/dokan\/v1\/admin\/extensions\/install/;

let apiUtils: ApiUtils;

test.describe('Admin Extensions page functionality', () => {
    test.beforeAll(async () => {
        // Admin-context ApiUtils kept for parity with the other admin specs and
        // to drive the REST authorization edge directly; no data is seeded.
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let extensions: AdminExtensionsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            extensions = new AdminExtensionsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Extensions page heading, banner and four tabs', { tag: ['@lite', '@admin'] }, async () => {
            await extensions.goto();
            await expect(extensions.reactRoot).toBeVisible();
            await expect(extensions.heading).toBeVisible();
            await expect(extensions.bannerHeading).toBeVisible();
            await expect(extensions.bannerImage).toBeVisible();
            await expect(extensions.tab(adminExtensionsData.tabs.recommended)).toBeVisible();
            await expect(extensions.tab(adminExtensionsData.tabs.mobileApps)).toBeVisible();
            await expect(extensions.tab(adminExtensionsData.tabs.compatibility)).toBeVisible();
            await expect(extensions.tab(adminExtensionsData.tabs.services)).toBeVisible();
            expect(await extensions.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test("'Picks for you' is the default active tab and renders the recommended grid", { tag: ['@lite', '@admin'] }, async () => {
            await extensions.goto();
            expect(await extensions.isTabSelected(adminExtensionsData.tabs.recommended), 'recommended tab is selected by default').toBe(true);
            expect(await extensions.addonCardCount(), 'recommended addon cards render').toBeGreaterThan(0);
            await expect(extensions.ecosystemHeading).toBeVisible();
        });

        test('recommended addons render in server-defined position order with the right badges', { tag: ['@lite', '@admin'] }, async () => {
            await extensions.goto();
            const titles = await extensions.addonTitlesInOrder();
            // Extensions.php sorts by position: Dokan WPML (10) is first.
            expect(titles[0], 'first card is the lowest-position addon').toBe(adminExtensionsData.firstAddonTitle);
            // An install card shows a green "Free" badge.
            await expect(extensions.addonCard(adminExtensionsData.firstAddonTitle).getByText('Free', { exact: true })).toBeVisible();
            await expect(extensions.addonButton(adminExtensionsData.firstAddonTitle)).toHaveText(/Install Free/);
            // A get_plugin card shows a crown "Pro" badge + "Get Addon".
            await expect(extensions.addonCard(adminExtensionsData.proAddonTitle).getByText('Pro', { exact: true })).toBeVisible();
        });

        test("clicking 'Install Free' POSTs the addon wp_org_slug and transitions to 'Installed'", { tag: ['@lite', '@admin'] }, async () => {
            // Mock the install endpoint -> 200 so CI never hits wp.org.
            await page.route(INSTALL_ENDPOINT, async route => {
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Plugin installed successfully.' }) });
            });
            await extensions.goto();
            const [req] = await Promise.all([page.waitForRequest(INSTALL_ENDPOINT, { timeout: 15000 }), extensions.clickInstall(adminExtensionsData.firstAddonTitle)]);
            const body = req.postDataJSON();
            expect(body?.slug, 'POST body carries the addon wp_org_slug').toBe(adminExtensionsData.installSlug);
            await expect(extensions.addonButton(adminExtensionsData.firstAddonTitle), 'button resolves to Installed').toHaveText(/Installed/, { timeout: 10000 });
            await expect(extensions.addonButton(adminExtensionsData.firstAddonTitle)).toBeDisabled();
        });

        test("a 'get_plugin' addon renders 'Get Addon' as a safe external link (no install POST)", { tag: ['@lite', '@admin'] }, async () => {
            let installCalled = false;
            await page.route(INSTALL_ENDPOINT, async route => {
                installCalled = true;
                await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
            });
            await extensions.goto();
            const link = extensions.getAddonLink(adminExtensionsData.proAddonTitle);
            await expect(link).toBeVisible();
            await expect(link).toHaveAttribute('href', adminExtensionsData.proAddonHref);
            await expect(link).toHaveAttribute('target', '_blank');
            // The raw <a> in RecommendedAddons sets rel="noopener noreferrer".
            await expect(link).toHaveAttribute('rel', /noopener noreferrer/);
            expect(installCalled, 'a get_plugin card must not call the install endpoint').toBe(false);
        });

        test('Mobile Apps tab shows three app cards with audience badges and Get App links', { tag: ['@lite', '@admin'] }, async () => {
            await extensions.goto();
            await extensions.openTab(adminExtensionsData.tabs.mobileApps);
            expect(await extensions.isTabSelected(adminExtensionsData.tabs.mobileApps)).toBe(true);
            const titles = await extensions.addonTitlesInOrder();
            // Sorted by position: Customer (10), Vendor (20), Delivery Driver (30).
            expect(titles).toEqual(['Dokan Customer App', 'Dokan Vendor App', 'Delivery Driver App']);
            await expect(extensions.activePanel.getByText('For Customers')).toBeVisible();
            await expect(extensions.activePanel.getByText('For Vendors')).toBeVisible();
            await expect(extensions.activePanel.getByText('For Delivery Staff')).toBeVisible();
            const getAppLinks = extensions.activePanel.getByRole('link', { name: 'Get App' });
            expect(await getAppLinks.count(), 'three Get App links').toBe(3);
            await expect(getAppLinks.first()).toHaveAttribute('target', '_blank');
        });

        test('Compatibility tab shows the two static cards with working Browse links', { tag: ['@lite', '@admin'] }, async () => {
            await extensions.goto();
            await extensions.openTab(adminExtensionsData.tabs.compatibility);
            await expect(extensions.activePanel.getByRole('heading', { name: '50+ Compatible Themes' })).toBeVisible();
            await expect(extensions.activePanel.getByRole('heading', { name: '100+ Integrated Plugins' })).toBeVisible();
            await expect(extensions.externalLinkByText('Browse Themes')).toHaveAttribute('href', adminExtensionsData.externalLinks.browseThemes);
            await expect(extensions.externalLinkByText('Browse Plugins')).toHaveAttribute('href', adminExtensionsData.externalLinks.browsePlugins);
            await expect(extensions.externalLinkByText('Browse Themes')).toHaveAttribute('target', '_blank');
        });

        test('Services tab shows the weLabs card with Visit weLabs and View Details', { tag: ['@lite', '@admin'] }, async () => {
            await extensions.goto();
            await extensions.openTab(adminExtensionsData.tabs.services);
            await expect(extensions.activePanel.getByText('weLabs', { exact: true })).toBeVisible();
            await expect(extensions.externalLinkByText('Visit weLabs')).toHaveAttribute('href', adminExtensionsData.externalLinks.welabs);
            await expect(extensions.externalLinkByText('Visit weLabs')).toHaveAttribute('target', '_blank');
            await expect(extensions.viewDetailsTrigger).toBeVisible();
        });

        test("'View Details' opens the custom-development modal with a Book a meeting link", { tag: ['@lite', '@admin'] }, async () => {
            await extensions.goto();
            await extensions.openTab(adminExtensionsData.tabs.services);
            await extensions.openServicesDetails();
            await expect(extensions.servicesModal.getByText('Custom Development for your Marketplace')).toBeVisible();
            const bookMeeting = extensions.servicesModal.getByRole('link', { name: 'Book a meeting' }).first();
            await expect(bookMeeting).toHaveAttribute('href', adminExtensionsData.externalLinks.bookMeeting);
            await expect(bookMeeting).toHaveAttribute('target', '_blank');
            // Modal closes via its dismiss (X) control.
            await extensions.closeServicesModalViaButton();
            await expect(extensions.servicesModal).toBeHidden();
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let extensions: AdminExtensionsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            extensions = new AdminExtensionsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('reloading on #/extensions preserves the route and re-renders the page', { tag: ['@lite', '@admin'] }, async () => {
            await extensions.goto();
            await extensions.reload();
            await expect(page).toHaveURL(/#\/extensions/);
            await expect(extensions.reactRoot).toBeVisible();
            await expect(extensions.heading).toBeVisible();
            await expect(extensions.bannerHeading).toBeVisible();
        });

        test('tab selection does not persist across reload — resets to Picks for you', { tag: ['@lite', '@admin'] }, async () => {
            await extensions.goto();
            await extensions.openTab(adminExtensionsData.tabs.services);
            expect(await extensions.isTabSelected(adminExtensionsData.tabs.services)).toBe(true);
            await extensions.reload();
            // Uncontrolled defaultValue="recommended" — reload resets to the default.
            expect(await extensions.isTabSelected(adminExtensionsData.tabs.recommended)).toBe(true);
        });

        test('Esc closes the Services details modal and re-opening works', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            await extensions.goto();
            await extensions.openTab(adminExtensionsData.tabs.services);
            await extensions.openServicesDetails();
            await expect(extensions.servicesModal).toBeVisible();
            await extensions.closeServicesModalViaEsc();
            await expect(extensions.servicesModal).toBeHidden();
            // Re-open to prove the trigger is still wired after an Esc dismiss.
            await extensions.openServicesDetails();
            await expect(extensions.servicesModal).toBeVisible();
        });

        test('loading #/extensions produces no PHP fatal and no uncaught JS console errors', { tag: ['@lite', '@admin'] }, async () => {
            const consoleErrors: string[] = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            await extensions.goto();
            await extensions.openTab(adminExtensionsData.tabs.mobileApps);
            await extensions.openTab(adminExtensionsData.tabs.services);
            expect(await extensions.hasNoPhpFatal(), 'no PHP fatal banner').toBe(true);
            // Ignore benign network/resource noise (e.g. 404 svg, favicon); fail on real JS errors.
            const realErrors = consoleErrors.filter(e => !/Failed to load resource|favicon|net::ERR|status of 4\d\d|status of 5\d\d/i.test(e));
            expect(realErrors, `unexpected console errors: ${realErrors.join(' | ')}`).toHaveLength(0);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let extensions: AdminExtensionsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            extensions = new AdminExtensionsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test("install failure (500) reverts the button to 'Install Free' without a stuck spinner", { tag: ['@lite', '@admin'] }, async () => {
            await page.route(INSTALL_ENDPOINT, async route => {
                await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ code: 'dokan_rest_plugin_install_failed', message: 'Unable to install.' }) });
            });
            await extensions.goto();
            await Promise.all([page.waitForResponse(INSTALL_ENDPOINT, { timeout: 15000 }), extensions.clickInstall(adminExtensionsData.firstAddonTitle)]);
            // handleInstall's finally clears installingSlugs and never marks installed.
            await expect(extensions.addonButton(adminExtensionsData.firstAddonTitle), 'button returns to Install Free').toHaveText(/Install Free/, { timeout: 10000 });
            await expect(extensions.addonButton(adminExtensionsData.firstAddonTitle)).toBeEnabled();
        });

        test('rapid double-click Install Free issues only one install request for the addon', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            let postCount = 0;
            await page.route(INSTALL_ENDPOINT, async route => {
                postCount += 1;
                // Slow response so the second click lands while the first is in flight.
                await new Promise(resolve => setTimeout(resolve, 1200));
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
            });
            await extensions.goto();
            const btn = extensions.addonButton(adminExtensionsData.firstAddonTitle);
            await btn.click();
            // Second click: button is disabled while installing + handleInstall early-returns.
            await btn.click({ force: true }).catch(() => undefined);
            await page.waitForResponse(INSTALL_ENDPOINT, { timeout: 15000 });
            await page.waitForTimeout(500);
            expect(postCount, 'exactly one install POST for the addon').toBe(1);
        });

        test('install REST endpoint rejects an unauthenticated request (401/403)', { tag: ['@lite', '@admin'] }, async () => {
            const anon = new ApiUtils(await request.newContext());
            // assert=false: don't fail the helper on a non-2xx — we EXPECT a rejection.
            const [response, body] = await anon.post(`${endPoints.serverUrl}/dokan/v1/admin/extensions/install`, { data: { slug: adminExtensionsData.installSlug } }, false);
            const status = response.status();
            expect([401, 403], `unauthenticated install must be rejected, got ${status}: ${JSON.stringify(body)}`).toContain(status);
            await anon.dispose();
        });

        test('a logged-in vendor cannot access the admin Extensions page', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
            const vctx = await browser.newContext({ storageState: v1 });
            const vpage = await vctx.newPage();
            const vext = new AdminExtensionsPage(vpage);
            await vpage.goto(vext.url);
            await vpage.waitForLoadState('domcontentloaded');
            expect(await vext.isAccessDenied(), 'a vendor must not see the admin Extensions UI').toBe(true);
            await vctx.close();
        });

        test('a logged-in customer cannot access the admin Extensions page', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
            const cctx = await browser.newContext({ storageState: c1 });
            const cpage = await cctx.newPage();
            const cext = new AdminExtensionsPage(cpage);
            await cpage.goto(cext.url);
            await cpage.waitForLoadState('domcontentloaded');
            expect(await cext.isAccessDenied(), 'a customer must not see the admin Extensions UI').toBe(true);
            await cctx.close();
        });
    });
});
