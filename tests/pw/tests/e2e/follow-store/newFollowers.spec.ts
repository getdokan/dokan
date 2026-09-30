import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewFollowersPage } from './newFollowersPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Net-new coverage for the React vendor "Followers" feature (Pro module
// follow_store) at /dashboard/new/#/followers. The legacy vendor cases in
// tests/e2e/follow-store/followStore.spec.ts ("vendor can view followers menu
// page" / "vendor can view followers") drive the OLD /dashboard/followers Vue
// surface and are retired below once this passes 3×; the admin + customer
// storefront cases in that file STAY (D3).
//
// The Followers list is the simplest vendor DataViews surface: read-only, no
// tabs / row-actions / filters. Follow state is mutated from the storefront as
// a customer, so the behavioral oracles here SEED via REST (apiUtils.followStore
// / unfollowStore as the customer) and assert the follower row appears /
// disappears on the vendor's React list. Shared DB is polluted with other
// followers, so we assert presence/absence of the SEEDED customer's name, never
// exact counts (§7).
// ============================================

const { VENDOR_ID } = process.env;
const FOLLOWERS = `${SERVER_URL}/dokan/v1/follow-store/followers`;

let apiUtils: ApiUtils;
let followerName: string;

/** Read the vendor's followers list (vendor auth) and return the array. */
async function getFollowers(): Promise<Array<{ full_name?: string }>> {
    const [, body] = await apiUtils.get(FOLLOWERS, { headers: payloads.vendorAuth }, false);
    return Array.isArray(body) ? body : (body?.data ?? []);
}

test.describe('Followers (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The vendor Followers route + REST only register while the module is active.
        await apiUtils.activateModules(payloads.moduleIds.followStore, payloads.adminAuth);
        // Seed: the customer follows the vendor so the list is non-empty. Capture the
        // exact rendered name from REST (never hardcode the WP display name).
        await apiUtils.followStore(VENDOR_ID as string, payloads.customerAuth);
        const followers = await getFollowers();
        followerName = String(followers.find(f => f.full_name)?.full_name ?? followers[0]?.full_name ?? '').trim();
    });

    test.afterAll(async () => {
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let followersPage: NewFollowersPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            followersPage = new NewFollowersPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can open the Followers list mounted at #/followers (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await followersPage.goto();
            expect(page.url(), 'on the /followers route').toMatch(/#\/followers/);
            expect(await followersPage.hasColumn(/name/i), 'Name column renders').toBe(true);
            expect(await followersPage.hasColumn(/followed/i), 'Followed At column renders').toBe(true);
            expect(await followersPage.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('the followers list renders Name and Followed At columns (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await followersPage.goto();
            const headers = (await followersPage.columnHeaderTexts()).map(h => h.toLowerCase());
            expect(
                headers.some(h => h.includes('name')),
                'a Name column header',
            ).toBe(true);
            expect(
                headers.some(h => h.includes('followed')),
                'a Followed At column header',
            ).toBe(true);
        });

        test('a customer who follows the vendor (REST) appears in the vendor followers list (React)', { tag: ['@pro', '@vendor', '@customer', '@new-ui'] }, async () => {
            // The follow was seeded in beforeAll; the seeded customer's name is the oracle.
            expect(followerName, 'a follower name was captured from REST').not.toBe('');
            await followersPage.goto();
            await expect(followersPage.rowsWithText(followerName).first(), 'the following customer is listed').toBeVisible({ timeout: 15000 });
        });

        test('searching followers by name narrows the list (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            test.skip(!followerName, 'no follower name captured to search by');
            await followersPage.goto();
            // Search by the first token of the follower's name (server-side filter).
            const token = followerName.split(/\s+/)[0] ?? followerName;
            await followersPage.search(token);
            await expect(followersPage.rowsWithText(followerName).first(), 'the matching follower remains after search').toBeVisible({ timeout: 15000 });
        });

        test('searching a non-follower name shows the empty state (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await followersPage.goto();
            await followersPage.search(`zznotafollower${Date.now()}`);
            await expect(followersPage.rowsWithText(followerName)).toHaveCount(0, { timeout: 15000 });
            expect(await followersPage.emptyStateVisible(), 'the empty state is shown').toBe(true);
        });

        // KNOWN PRODUCT BUG (fixme, not fake-green): unfollowing does NOT update the
        // vendor's followers list — the REST list is cached under get_followers_<md5(args)>
        // but the toggle invalidation deletes only the literal key `get_followers`, so the
        // unfollowed customer keeps showing for up to 2 weeks (the cache TTL). Confirmed live.
        // See bugs/follow-store-followers-cache-stale.md. Re-enable once invalidation is fixed.
        test.fixme('unfollowing (REST) removes the follower from the vendor list (React)', { tag: ['@pro', '@vendor', '@customer', '@new-ui'] }, async () => {
            const before = await getFollowers();
            const nameBefore = String(before.find(f => f.full_name)?.full_name ?? '').trim();
            await followersPage.goto();
            await expect(followersPage.rowsWithText(nameBefore).first(), 'follower present before unfollow').toBeVisible({ timeout: 15000 });
            await apiUtils.unfollowStore(VENDOR_ID as string, payloads.customerAuth);
            await followersPage.goto();
            await expect(followersPage.rowsWithText(nameBefore), 'follower gone after unfollow + reload').toHaveCount(0, { timeout: 15000 });
            // Restore the seed so subsequent tests / re-runs keep a non-empty list.
            await apiUtils.followStore(VENDOR_ID as string, payloads.customerAuth);
        });

        test('HashRouter survives a reload on /followers (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await followersPage.goto();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await followersPage.waitForSettle();
            expect(page.url(), 'still on /followers after reload').toMatch(/#\/followers/);
            expect(await followersPage.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
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

        test('a logged-in customer cannot mount the vendor Followers route (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async ({ browser }) => {
            ctx = await browser.newContext({ storageState: c1 });
            page = await ctx.newPage();
            const followersPage = new NewFollowersPage(page);
            await page.goto(followersPage.url);
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            expect(await page.locator('#dokan-vendor-dashboard-root').count(), 'the vendor SPA root does not mount for a customer').toBe(0);
        });
    });
});
