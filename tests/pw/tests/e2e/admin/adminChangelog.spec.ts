import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminChangelogPage, adminChangelogData } from './adminChangelogPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import path from 'path';

// ============================================
// ADMIN CHANGELOG — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/changelog (ChangelogPage).
//
// ADMIN-ONLY, read-only viewer. The changelog data is served by
// GET /dokan/v1/admin/changelog/lite (a JSON STRING the component JSON.parses,
// derived from templates/whats-new.php). There is NOTHING to seed in the DB:
// every deterministic state (multi-version list, latest tag, >5-item collapse,
// empty payload, malformed JSON, 500 error, loading spinner) is produced by
// page.route mocks of that one read-only endpoint, exactly as the checklist
// permits. The Lite/Pro PackageToggle is Lite-absent (header_info.is_pro_exists
// is false), so this Lite spec asserts it is NOT rendered.
// See tests/pw/test-cases/new-dashboards-test-cases.md lines 494-539.
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;

test.describe('Admin Changelog functionality', () => {
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
        let changelog: AdminChangelogPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            changelog = new AdminChangelogPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Changelog page with the "Dokan Changelog" title and no PHP fatal', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.goto();
            await expect(changelog.reactRoot).toBeVisible();
            await expect(changelog.heading).toBeVisible();
            await changelog.waitForContent();
            expect(await changelog.hasNoPhpFatal(), 'no PHP fatal banner on /changelog').toBe(true);
        });

        test('the version list renders one VersionRow per version from the changelog payload', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            expect(await changelog.getVersionCount(), 'one card per mocked version').toBe(adminChangelogData.mockVersions.length);
            for (const v of adminChangelogData.mockVersions) {
                await expect(changelog.versionCardHeading(v.version)).toBeVisible();
            }
        });

        test('the latest version (index 0) shows the "Latest" tag and has no See Details toggle even with >5 items', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            const latest = adminChangelogData.mockVersions[0];
            const latestCard = changelog.versionCard(latest.version);
            await expect(latestCard.getByText('Latest', { exact: true })).toBeVisible();
            // shouldShowToggle is false when isLatest -> no See Details/See Less.
            await expect(changelog.seeDetailsToggle(latest.version)).toHaveCount(0);
        });

        test('a non-latest version with >5 items collapses to 5 and exposes a "See Details" toggle that expands/collapses', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            const collapsible = adminChangelogData.mockVersions[1]; // 7 total items.
            expect(await changelog.visibleItemCount(collapsible.version), 'collapsed to 5 items').toBe(5);
            const toggle = changelog.seeDetailsToggle(collapsible.version);
            await expect(toggle).toHaveText(/See Details/);
            await toggle.click();
            await expect(changelog.seeDetailsToggle(collapsible.version)).toHaveText(/See Less/);
            expect(await changelog.visibleItemCount(collapsible.version), 'expanded to all 7 items').toBe(7);
            await changelog.seeDetailsToggle(collapsible.version).click();
            await expect(changelog.seeDetailsToggle(collapsible.version)).toHaveText(/See Details/);
            expect(await changelog.visibleItemCount(collapsible.version), 'collapsed back to 5').toBe(5);
        });

        test('ChangeBadge renders the New, Fix, Improvement and Update type labels', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            // Expand the non-latest card so its Improvement/Update sections show.
            await changelog.seeDetailsToggle(adminChangelogData.mockVersions[1].version).click();
            for (const type of ['New', 'Fix', 'Improvement', 'Update']) {
                await expect(changelog.reactRoot.getByText(type, { exact: true }).first()).toBeVisible();
            }
        });

        test('the "Jump to version" dropdown opens and lists the latest versions when the search is empty', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            await changelog.openJumpDropdown();
            // SearchBar shows versions.slice(0,5); the first entry carries (Latest).
            await expect(changelog.dropdownOption(adminChangelogData.mockVersions[0].version).first()).toBeVisible();
            await expect(changelog.dropdownOption(adminChangelogData.mockVersions[1].version).first()).toBeVisible();
            await expect(changelog.searchInput.locator('xpath=ancestor::div[contains(@class,"absolute")][1]').getByText('(Latest)')).toBeVisible();
        });

        test('typing a version substring filters the dropdown to matching versions only', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            await changelog.openJumpDropdown();
            await changelog.typeVersionSearch('8.8.8');
            await expect(changelog.dropdownOption('ACHG-8.8.8').first()).toBeVisible();
            await expect(changelog.dropdownOption('ACHG-9.9.9')).toHaveCount(0);
        });

        test('selecting a version from the dropdown highlights its card with the purple ring', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            const target = adminChangelogData.mockVersions[1].version;
            await changelog.openJumpDropdown();
            await changelog.selectVersionFromDropdown(target);
            // VersionRow gets ring-2 ring-[#7047EB] when highlighted.
            await expect(changelog.versionCard(target).locator('.ring-2').first()).toBeVisible();
        });

        test('the X clear button resets the version search and restores the default list', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            await changelog.openJumpDropdown();
            await changelog.typeVersionSearch('8.8.8');
            await expect(changelog.dropdownOption('ACHG-9.9.9')).toHaveCount(0);
            await changelog.clearVersionSearch();
            await expect(changelog.searchInput).toHaveValue('');
            await expect(changelog.dropdownOption('ACHG-9.9.9').first()).toBeVisible();
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let changelog: AdminChangelogPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            changelog = new AdminChangelogPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        // @liteOnly: the Lite/Pro PackageToggle only hides when Pro is ABSENT. In a
        // Pro environment (the PR/Full gate) the toggle correctly shows, so this
        // assertion is valid only on the Lite-only run.
        test('the Lite/Pro PackageToggle is hidden in a Lite-only environment', { tag: ['@liteOnly', '@admin'] }, async () => {
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            // PackageToggle returns null when hasPro is false; neither button renders.
            await expect(changelog.liteToggle).toHaveCount(0);
            await expect(changelog.proToggle).toHaveCount(0);
        });

        test('searching a non-existent version shows the "No versions found" dropdown empty state', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            await changelog.openJumpDropdown();
            await changelog.typeVersionSearch(adminChangelogData.searchMiss);
            await expect(changelog.noVersionsFound).toBeVisible();
        });

        test('hostile / overlong version search input yields "No versions found" with no script execution', { tag: ['@lite', '@admin'] }, async () => {
            let dialogFired = false;
            page.on('dialog', async d => {
                dialogFired = true;
                await d.dismiss().catch(() => undefined);
            });
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            await changelog.openJumpDropdown();
            await changelog.typeVersionSearch(adminChangelogData.searchXss);
            await expect(changelog.noVersionsFound).toBeVisible();
            await changelog.typeVersionSearch('a'.repeat(500));
            await expect(changelog.noVersionsFound).toBeVisible();
            expect(dialogFired, 'no injected dialog should fire').toBe(false);
        });

        test('an empty changelog payload renders the "No changelog data available." empty state', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.mockChangelog([]);
            await changelog.goto();
            await expect(changelog.emptyState).toBeVisible({ timeout: 15000 });
            expect(await changelog.getVersionCount()).toBe(0);
        });

        test('the loading spinner shows while the changelog request is in flight then is replaced by version rows', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            await changelog.mockChangelogDelayed(adminChangelogData.mockVersions, 2500);
            await page.goto(changelog.url);
            await page.waitForLoadState('domcontentloaded');
            await expect(changelog.heading).toBeVisible({ timeout: 30000 });
            await expect(changelog.loadingSpinner).toBeVisible({ timeout: 5000 });
            await expect(changelog.loadingSpinner).toBeHidden({ timeout: 15000 });
            expect(await changelog.getVersionCount(), 'rows render after spinner clears').toBeGreaterThan(0);
        });

        test('reloading on #/changelog preserves the route and re-renders the changelog', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.mockChangelog(adminChangelogData.mockVersions);
            await changelog.goto();
            await changelog.waitForContent();
            await changelog.reload();
            await expect(page).toHaveURL(/#\/changelog/);
            await expect(changelog.heading).toBeVisible();
            await changelog.waitForContent();
            expect(await changelog.getVersionCount()).toBeGreaterThan(0);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let changelog: AdminChangelogPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            changelog = new AdminChangelogPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('a failed/500 changelog response is swallowed and the empty state renders instead of crashing', { tag: ['@lite', '@admin'] }, async () => {
            await changelog.mockChangelogError();
            await changelog.goto();
            await expect(changelog.emptyState).toBeVisible({ timeout: 15000 });
            expect(await changelog.hasNoPhpFatal(), 'no fatal / React error boundary on a 500').toBe(true);
        });

        test('a malformed JSON string from the endpoint does not white-screen the page', { tag: ['@lite', '@admin'] }, async () => {
            // Body is a valid JSON string whose CONTENTS are not parseable JSON,
            // so the component's JSON.parse throws and is caught -> empty state.
            await changelog.mockChangelogRaw(JSON.stringify('{not valid json'));
            await changelog.goto();
            await expect(changelog.heading).toBeVisible();
            await expect(changelog.emptyState).toBeVisible({ timeout: 15000 });
            expect(await changelog.hasNoPhpFatal(), 'no fatal on malformed JSON').toBe(true);
        });

        test('the changelog REST endpoint forbids a customer lacking manage_woocommerce', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getAdminChangelogLite, { headers: payloads.customerAuth }, false);
            expect([401, 403], 'customer must be rejected, not served the changelog').toContain(response.status());
        });

        test('the changelog REST endpoint forbids a vendor lacking manage_woocommerce', { tag: ['@lite', '@vendor'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getAdminChangelogLite, { headers: payloads.vendorAuth }, false);
            expect([401, 403], 'vendor must be rejected, not served the changelog').toContain(response.status());
        });

        test('a logged-in vendor cannot reach the admin Changelog page', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
            const vctx = await browser.newContext({ storageState: v1 });
            const vpage = await vctx.newPage();
            const vchangelog = new AdminChangelogPage(vpage);
            await vpage.goto(vchangelog.url);
            await vpage.waitForLoadState('domcontentloaded');
            expect(await vchangelog.isAccessDenied(), 'a vendor must not see the admin Changelog UI').toBe(true);
            await vctx.close();
        });

        test('a logged-in customer cannot reach the admin Changelog page', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
            const cctx = await browser.newContext({ storageState: c1 });
            const cpage = await cctx.newPage();
            const cchangelog = new AdminChangelogPage(cpage);
            await cpage.goto(cchangelog.url);
            await cpage.waitForLoadState('domcontentloaded');
            expect(await cchangelog.isAccessDenied(), 'a customer must not see the admin Changelog UI').toBe(true);
            await cctx.close();
        });
    });
});
