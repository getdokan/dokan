import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminToolsPage, adminToolsData, adminToolsEndpoints } from './adminToolsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import path from 'path';

// ============================================
// ADMIN TOOLS — new React admin dashboard (Dokan 5.0.0+, Pro surface)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/tools (Tools.tsx)
//
// ADMIN-ONLY ACTION-BUTTONS page (template: Dummy Data). A bespoke card list of
// "tool sections", each a <ToolsSection> with a stable id wrapper, a name, a
// description and one DokanButton:
//   create_pages (Installation Guide -> Regenerate),
//   regenerate_order_commission (Regenerate),
//   check_duplicate_suborders (Check Orders),
//   rewrite_product_variations_author (Regenerate),
//   dokan_import_dummy_data (Import Dummy Data -> navigates to #/dummy-data),
//   distance_matrix (Get Distance — only when Table Rate Shipping is active).
//
// SAFETY: these actions are destructive / env-polluting (regenerate sync tables,
// queue background commission rebuilds, scan every order, create WP pages). NO
// test clicks a destructive button against the real backend. Mount/visibility
// tests assert structure only; success-flow tests route.fulfill() each tool's
// REST endpoint so the click is OBSERVED but never reaches WordPress. There is
// nothing to seed for vendors/customers. All tool endpoints live under
// dokan/v1/admin/tools/* (ToolsController) gated on manage_woocommerce, so the
// negative cases assert non-admins are denied both the UI and the REST routes.
// ============================================

// The repo's strict tsconfig doesn't pull in `@types/node`, so `process` is
// flagged as undefined elsewhere in the suite. Declare it locally (matching the
// pattern used by the existing admin specs) so this file type-checks.
declare const process: { env: Record<string, string | undefined> };

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;

test.describe('Admin Tools functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // Distance Matrix section only mounts when Table Rate Shipping is active.
        // Activate it so the section can be asserted; assert=false because a
        // re-activation of an already-active module is not a test failure.
        await apiUtils.activateModules('table_rate_shipping', payloads.adminAuth).catch(() => undefined);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let tools: AdminToolsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            tools = new AdminToolsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('Tools route mounts the React shell with the "Tools" heading and intro card', { tag: ['@pro', '@admin'] }, async () => {
            await tools.mockCheckPages(false);
            await tools.goto();
            await expect(tools.reactRoot).toBeVisible();
            await expect(tools.heading).toBeVisible();
            await expect(tools.cardHeading).toBeVisible();
            expect(page.url()).toMatch(/#\/tools/);
            expect(await tools.hasNoPhpFatal(), 'no PHP fatal on /tools').toBe(true);
        });

        test('the core tool sections render with their names and buttons', { tag: ['@pro', '@admin'] }, async () => {
            await tools.mockCheckPages(false);
            await tools.goto();
            const s = adminToolsData.sections;
            const n = adminToolsData.names;
            // Each section's stable-id wrapper + name + a single button is present.
            for (const [id, name] of [
                [s.createPages, n.createPages],
                [s.regenerateCommission, n.regenerateCommission],
                [s.duplicateOrders, n.duplicateOrders],
                [s.regenerateVariableAuthor, n.regenerateVariableAuthor],
                [s.importDummyData, n.importDummyData],
            ] as const) {
                await expect(tools.section(id), `${id} section present`).toBeVisible();
                await expect(tools.sectionName(id)).toHaveText(new RegExp(name));
                await expect(tools.sectionButton(id)).toBeVisible();
            }
        });

        test('the three "Regenerate" sections each carry their own scoped Regenerate button', { tag: ['@pro', '@admin'] }, async () => {
            await tools.mockCheckPages(false);
            await tools.goto();
            // Three sections share the "Regenerate" label; lookups MUST be scoped
            // to the section id wrapper, not the whole page, or they collide.
            for (const id of [adminToolsData.sections.createPages, adminToolsData.sections.regenerateCommission, adminToolsData.sections.regenerateVariableAuthor]) {
                await expect(tools.sectionButton(id)).toHaveText(/Regenerate/);
            }
            // Distinct labels on the other two action sections.
            await expect(tools.sectionButton(adminToolsData.sections.duplicateOrders)).toHaveText(/Check Orders/);
            await expect(tools.sectionButton(adminToolsData.sections.importDummyData)).toHaveText(/Import Dummy Data/);
        });

        test('the Installation Guide Regenerate button posts create-pages (mocked) and shows a success toast', { tag: ['@pro', '@admin'] }, async () => {
            await tools.mockCheckPages(false);
            await tools.stubCreatePages('Required pages created or already exist.');
            await tools.goto();
            const id = adminToolsData.sections.createPages;
            await expect(tools.sectionButton(id)).toBeEnabled();
            const [req] = await Promise.all([
                page.waitForRequest(r => r.url().includes('/dokan/v1/admin/tools/create-pages') && r.method() === 'POST', { timeout: 15000 }),
                tools.clickSectionButton(id),
            ]);
            expect(req.method(), 'create-pages uses POST').toBe('POST');
            await expect(tools.toast(/Success!|Required pages created or already exist\./i)).toBeVisible({ timeout: 5000 });
            expect(await tools.hasNoPhpFatal(), 'no fatal after create-pages').toBe(true);
        });

        test('the Regenerate Order Commission button posts (mocked) and shows the "Queued" toast', { tag: ['@pro', '@admin'] }, async () => {
            await tools.mockCheckPages(false);
            await tools.stubRegenerateCommission('Order commission regeneration has been queued.');
            await tools.goto();
            const id = adminToolsData.sections.regenerateCommission;
            const [req] = await Promise.all([
                page.waitForRequest(r => r.url().includes('/dokan/v1/admin/tools/regenerate-order-commission') && r.method() === 'POST', { timeout: 15000 }),
                tools.clickSectionButton(id),
            ]);
            expect(req.method()).toBe('POST');
            await expect(tools.toast(/Queued|queued/i)).toBeVisible({ timeout: 5000 });
        });

        test('the Import Dummy Data button navigates the HashRouter to #/dummy-data (no REST call)', { tag: ['@pro', '@admin'] }, async () => {
            await tools.mockCheckPages(false);
            await tools.goto();
            await tools.clickSectionButton(adminToolsData.sections.importDummyData);
            await expect(page).toHaveURL(/#\/dummy-data/);
        });
    });

    // ----------------------------------------
    // Destructive affordances — exercise the real button/UI flow but STUB the
    // network so nothing writes to the DB / calls external APIs. Tagged
    // @exploratory because they depend on the section's client behaviour
    // (recursive scan loop / toast surfaces / module gating).
    test.describe('destructive affordances (stubbed network)', () => {
        let ctx: BrowserContext;
        let page: Page;
        let tools: AdminToolsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            tools = new AdminToolsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('Check Orders drives the Duplicate Order Checker progress bar to 100% and toasts "Completed"', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await tools.mockCheckPages(false);
            await tools.stubDuplicateOrders();
            await tools.goto();
            await tools.clickSectionButton(adminToolsData.sections.duplicateOrders);
            // done:'All' on the first pass -> progress completes immediately.
            await expect(tools.duplicateProgressBar).toBeVisible({ timeout: 10000 });
            await expect.poll(async () => await tools.duplicateProgressValue(), { timeout: 15000 }).toBe(100);
            await expect(tools.toast(/Completed|Duplicate order check finished\./i)).toBeVisible({ timeout: 5000 });
        });

        test('Regenerate Variable Product Author IDs posts the current page index (mocked) and toasts "Queued"', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await tools.mockCheckPages(false);
            await tools.stubRegenerateVariableAuthor('Variable product author rewrite has been queued.');
            await tools.goto();
            const id = adminToolsData.sections.regenerateVariableAuthor;
            const [req] = await Promise.all([
                page.waitForRequest(adminToolsEndpoints.regenerateVariableAuthor, { timeout: 15000 }),
                tools.clickSectionButton(id),
            ]);
            const body = req.postDataJSON() as { page?: number };
            expect(body.page, 'first rewrite starts at page 1').toBe(1);
            await expect(tools.toast(/Queued|queued/i)).toBeVisible({ timeout: 5000 });
        });

        test('Distance Matrix (when Table Rate Shipping is active) posts both addresses (mocked) and toasts the distance', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await tools.mockCheckPages(false);
            await tools.stubGetDistance('12.3 km');
            await tools.goto();
            const id = adminToolsData.sections.distanceMatrix;
            // Module-gated: skip gracefully if the section is absent in this env.
            if (!(await tools.isSectionVisible(id, 8000))) {
                test.skip(true, 'Distance Matrix needs the Table Rate Shipping module active');
                return;
            }
            await tools.distanceAddress1.fill('Dhaka, Bangladesh');
            await tools.distanceAddress2.fill('Chittagong, Bangladesh');
            const [req] = await Promise.all([
                page.waitForRequest(adminToolsEndpoints.getDistance, { timeout: 15000 }),
                tools.clickSectionButton(id),
            ]);
            const body = req.postDataJSON() as { address1?: string; address2?: string };
            expect(body.address1, 'address1 carried in payload').toBe('Dhaka, Bangladesh');
            expect(body.address2, 'address2 carried in payload').toBe('Chittagong, Bangladesh');
            await expect(tools.toast(/12\.3 km|Success!/i)).toBeVisible({ timeout: 5000 });
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let tools: AdminToolsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            tools = new AdminToolsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('a failing create-pages call (mocked 500) surfaces a "Failed" toast without a PHP fatal', { tag: ['@pro', '@admin'] }, async () => {
            await tools.mockCheckPages(false);
            await tools.stubCreatePagesError('Could not create pages.');
            await tools.goto();
            await tools.clickSectionButton(adminToolsData.sections.createPages);
            await expect(tools.toast(/Failed|Could not create pages\./i)).toBeVisible({ timeout: 5000 });
            expect(await tools.hasNoPhpFatal(), 'a failed tool call must not crash to a fatal').toBe(true);
        });

        test('the Installation Guide Regenerate button is disabled when all required pages already exist', { tag: ['@pro', '@admin'] }, async () => {
            // check-all-dokan-pages-exists -> all_pages_exists:true disables the button.
            await tools.mockCheckPages(true);
            await tools.goto();
            const btn = tools.sectionButton(adminToolsData.sections.createPages);
            await expect(btn).toBeVisible();
            await expect(btn).toBeDisabled();
        });

        test('reloading on #/tools preserves the route and re-renders the tool sections', { tag: ['@pro', '@admin'] }, async () => {
            await tools.mockCheckPages(false);
            await tools.goto();
            await expect(tools.section(adminToolsData.sections.createPages)).toBeVisible();
            await tools.reload();
            await expect(page).toHaveURL(/#\/tools/);
            await expect(tools.heading).toBeVisible();
            await expect(tools.section(adminToolsData.sections.regenerateCommission)).toBeVisible();
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Tools page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const vendorCtx = await browser.newContext({ storageState: v1 });
            const vendorPage = await vendorCtx.newPage();
            const vendorTools = new AdminToolsPage(vendorPage);
            await vendorPage.goto(vendorTools.url);
            await vendorPage.waitForLoadState('domcontentloaded');
            expect(await vendorTools.isAccessDenied(), 'a vendor must not see the admin Tools UI').toBe(true);
            await vendorCtx.close();
        });

        test('a logged-in customer cannot access the admin Tools page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const customerCtx = await browser.newContext({ storageState: c1 });
            const customerPage = await customerCtx.newPage();
            const customerTools = new AdminToolsPage(customerPage);
            await customerPage.goto(customerTools.url);
            await customerPage.waitForLoadState('domcontentloaded');
            expect(await customerTools.isAccessDenied(), 'a customer must not see the admin Tools UI').toBe(true);
            await customerCtx.close();
        });

        test('the tools REST endpoints reject a vendor (manage_woocommerce required)', { tag: ['@pro', '@vendor'] }, async () => {
            // assert=false: a 401/403 is the expected outcome, not a failure.
            const [createRes] = await apiUtils.post(`${SERVER_URL}/dokan/v1/admin/tools/create-pages`, { headers: payloads.vendorAuth, data: {} }, false);
            const [commissionRes] = await apiUtils.post(`${SERVER_URL}/dokan/v1/admin/tools/regenerate-order-commission`, { headers: payloads.vendorAuth, data: {} }, false);
            const [checkRes] = await apiUtils.get(`${SERVER_URL}/dokan/v1/admin/tools/check-all-dokan-pages-exists`, { headers: payloads.vendorAuth }, false);
            expect(createRes.ok(), 'vendor POST create-pages is rejected').toBe(false);
            expect(commissionRes.ok(), 'vendor POST regenerate-order-commission is rejected').toBe(false);
            expect(checkRes.ok(), 'vendor GET check-all-dokan-pages-exists is rejected').toBe(false);
        });

        test('the tools REST endpoints reject a customer (manage_woocommerce required)', { tag: ['@pro', '@customer'] }, async () => {
            const [createRes] = await apiUtils.post(`${SERVER_URL}/dokan/v1/admin/tools/create-pages`, { headers: payloads.customerAuth, data: {} }, false);
            const [commissionRes] = await apiUtils.post(`${SERVER_URL}/dokan/v1/admin/tools/regenerate-order-commission`, { headers: payloads.customerAuth, data: {} }, false);
            const [checkRes] = await apiUtils.get(`${SERVER_URL}/dokan/v1/admin/tools/check-all-dokan-pages-exists`, { headers: payloads.customerAuth }, false);
            expect(createRes.ok(), 'customer POST create-pages is rejected').toBe(false);
            expect(commissionRes.ok(), 'customer POST regenerate-order-commission is rejected').toBe(false);
            expect(checkRes.ok(), 'customer GET check-all-dokan-pages-exists is rejected').toBe(false);
        });
    });
});
