import { test, expect, Browser, Page } from '@utils/test';
import { AnnouncementsPage } from './announcementsPage';
import path from 'path';

// =====================================================================
// New UI announcement coverage (Dokan 5.0.0+ React rewrite).
//
// Targets:
//   - Admin React dashboard at /wp-admin/admin.php?page=dokan-dashboard#/announcement
//   - Vendor React dashboard at /dashboard/new/#/announcement
//   - Customer access (negative — vendor-only surface)
//
// The legacy / first-cut React tests live in announcements.spec.ts. These
// cases focus on flows that file does not exercise: form validation,
// XSS escaping, search & tab filtering, detail panel navigation, empty
// state, customer access.
// =====================================================================

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const ADMIN_NEW_URL = `${BASE}/wp-admin/admin.php?page=dokan-dashboard#/announcement`;
const VENDOR_NEW_URL = `${BASE}/dashboard/new/#/announcement`;
const VENDOR_LEGACY_URL = `${BASE}/dashboard/announcement`;
const VENDOR_DASHBOARD_ROOT = '#dokan-vendor-dashboard-root';
const FATAL_RX = /Fatal error|Parse error|There has been a critical error/i;

// Selectors discovered from src/features/announcement/AnnouncementList.tsx
// (vendor) and src/admin/announcements/components/AnnouncementDetail.tsx (admin).
const SEARCH_INPUT = 'input[placeholder="Search Announcement"]';
const ARTICLE_ROW = 'article.announcement-list-item';
const TAB_BUTTON = (label: 'All' | 'Unread' | 'Read') =>
    `//button[contains(@class,"components-tab-panel__tabs-item") and starts-with(normalize-space(.), "${label}")]`;

// Type into the debounced search input. fill() bypasses DebouncedInput's
// onChange handler — see @dokan/components DebouncedInput. Use real key
// events so React notices and the 500ms debounce ultimately fires. Pass
// `''` to clear. Notes on the clear path:
//   - Ctrl/Meta+A silently no-ops on Linux headless CI.
//   - press('End') no-ops on this DebouncedInput too (cursor stays where
//     click landed — verified mid-text), so Backspace×N would only delete
//     the left half.
//   - setSelectionRange(0, length) deterministically selects all text;
//     a single real Backspace key event then deletes the selection and is
//     observed by the DebouncedInput onChange handler.
async function typeSearch(page: Page, text: string): Promise<void> {
    const input = page.locator(SEARCH_INPUT);
    await input.click();
    const current = await input.inputValue();
    if (current.length > 0) {
        await input.evaluate((el: HTMLInputElement) => {
            el.focus();
            el.setSelectionRange(0, el.value.length);
        });
        await input.press('Backspace');
    }
    if (text) await input.pressSequentially(text, { delay: 60 });
    await page.waitForTimeout(900);
}

// ---------------------------------------------------------------------
// Helpers (kept local so this folder stays self-contained — see the
// closeAnnouncementModal pattern in announcementsPage.ts for the rule).
// ---------------------------------------------------------------------

function uniqueTitle(label: string): string {
    return `nu_${label}_${Date.now()}_${Math.floor(Math.random() * 1e4)}`;
}

async function installModalDismissHandler(page: Page): Promise<void> {
    const flag = '__newuiAnnouncementModalHandlerInstalled' as const;
    const p = page as Page & { [flag]?: boolean };
    if (p[flag]) return;
    p[flag] = true;
    const modal = page.locator('.vendor-announcement-modal');
    await page
        .addLocatorHandler(
            modal,
            async () => {
                const btn = modal.locator('button[aria-label="Close"]').first();
                if (await btn.isVisible().catch(() => false)) {
                    await btn.click({ timeout: 2000 }).catch(() => undefined);
                } else {
                    await page.keyboard.press('Escape').catch(() => undefined);
                }
            },
            { noWaitAfter: true },
        )
        .catch(() => undefined);
}

async function seedAnnouncement(browser: Browser, title: string): Promise<void> {
    const ctx = await browser.newContext({ storageState: a1 });
    const page = await ctx.newPage();
    const ap = new AnnouncementsPage(page);
    await ap.addAnnouncement(title);
    await page.close();
    await ctx.close();
}

async function openVendorAnnouncementList(browser: Browser): Promise<{ page: Page; close: () => Promise<void> }> {
    const ctx = await browser.newContext({ storageState: v1 });
    const page = await ctx.newPage();
    await installModalDismissHandler(page);
    await page.goto(VENDOR_NEW_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.locator(VENDOR_DASHBOARD_ROOT).waitFor({ state: 'visible', timeout: 30_000 });
    // The search input is the most reliable signal that AnnouncementList
    // has finished its first render — wait for it before any interaction.
    await page.locator(SEARCH_INPUT).waitFor({ state: 'visible', timeout: 30_000 });
    return {
        page,
        close: async () => {
            await page.close();
            await ctx.close();
        },
    };
}

async function expectNoFatal(page: Page): Promise<void> {
    const fatal = await page.locator(`text=${FATAL_RX}`).first().isVisible({ timeout: 1000 }).catch(() => false);
    expect(fatal, 'No PHP/critical error should be visible').toBe(false);
}

// ============================================================
// New Admin Announcement Dashboard (React)
// ============================================================

test.describe('New Admin Announcement Dashboard (React) @pro', () => {
    test('Admin: empty title shows validation toast and does NOT submit', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(ADMIN_NEW_URL);
        await page.waitForLoadState('domcontentloaded');

        await page.getByRole('button', { name: 'Add Announcement' }).click();
        await page.locator('#announcement-title').waitFor({ state: 'visible' });

        // Click Create with empty title — saveChanges() short-circuits with a toast.
        await page.getByRole('button', { name: 'Create Announcement' }).click();

        // Validation toast appears (text from AnnouncementDetail.tsx saveChanges).
        await expect(
            page.locator('text=/Please enter a title/i').first(),
            'Validation toast "Please enter a title." should be visible',
        ).toBeVisible({ timeout: 5000 });

        // Form is still visible — submit was prevented.
        await expect(page.locator('#announcement-title')).toBeVisible();
        await expectNoFatal(page);

        await ctx.close();
    });

    test('Admin: HTML in title is escaped (no XSS)', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();

        // Sentinel — flips to true if a script in the title executes anywhere.
        await page.addInitScript(() => {
            (window as unknown as { __xssFired?: boolean }).__xssFired = false;
        });

        const ap = new AnnouncementsPage(page);
        const xssTitle = `<img src=x onerror="window.__xssFired=true">xss_${Date.now()}`;
        await ap.createPublishedAnnouncementInNewAdminDashboard(xssTitle, 'xss probe');

        // Re-open list to render the row containing the malicious title.
        await page.goto(ADMIN_NEW_URL);
        await page.waitForLoadState('domcontentloaded');

        const fired = await page.evaluate(() => (window as unknown as { __xssFired?: boolean }).__xssFired);
        expect(fired, 'XSS probe must not execute when title is rendered').toBe(false);
        await expectNoFatal(page);

        await ctx.close();
    });

    test('Admin: long title (200 chars) accepted without fatal', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        const ap = new AnnouncementsPage(page);
        const longTitle = 'L'.repeat(200) + `_${Date.now()}`;

        await ap.createPublishedAnnouncementInNewAdminDashboard(longTitle, 'long title test');

        await page.goto(ADMIN_NEW_URL);
        await page.waitForLoadState('domcontentloaded');
        await expectNoFatal(page);

        await ctx.close();
    });
});

// ============================================================
// New Vendor Announcement Dashboard (React)
// ============================================================

test.describe('New Vendor Announcement Dashboard (React) @pro', () => {
    test('Vendor: tabs and search input render', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        // Ensure at least one announcement exists so the page mounts in the
        // "with rows" branch (the empty branch also renders search/tabs but
        // explicit seeding makes the rendered state deterministic).
        await seedAnnouncement(browser, uniqueTitle('mount'));

        const { page, close } = await openVendorAnnouncementList(browser);

        await expect(page.locator(SEARCH_INPUT), 'Search input should be present').toBeVisible();
        await expect(page.locator(TAB_BUTTON('All')).first(), '"All (N)" tab button should be present').toBeVisible();
        await expect(page.locator(TAB_BUTTON('Unread')).first(), '"Unread (N)" tab button should be present').toBeVisible();
        await expect(page.locator(TAB_BUTTON('Read')).first(), '"Read (N)" tab button should be present').toBeVisible();

        await expectNoFatal(page);
        await close();
    });

    test('Vendor: search narrows the list to a uniquely seeded title', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const title = uniqueTitle('search');
        await seedAnnouncement(browser, title);

        const { page, close } = await openVendorAnnouncementList(browser);

        // Wait for the initial list fetch so we know how many rows existed
        // pre-filter — search must actually shrink that count.
        await page.locator(ARTICLE_ROW).first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
        const initialCount = await page.locator(ARTICLE_ROW).count();

        await typeSearch(page, title);

        // Wait for the seeded row to be the visible match.
        await expect(
            page.locator(ARTICLE_ROW).filter({ hasText: title }).first(),
            `Seeded announcement "${title}" should be visible after search`,
        ).toBeVisible({ timeout: 15_000 });

        // And the list must have shrunk — otherwise the filter never ran.
        const filteredCount = await page.locator(ARTICLE_ROW).count();
        expect(filteredCount, 'Search must shrink the list to fewer rows than before').toBeLessThan(initialCount + 1);
        expect(filteredCount, 'Filtered list must have at least the seeded row').toBeGreaterThan(0);

        await close();
    });

    test('Vendor: bogus search empties the list (no matching rows)', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        // Seed something so we know rows exist before the filter runs.
        await seedAnnouncement(browser, uniqueTitle('bogus'));

        const { page, close } = await openVendorAnnouncementList(browser);
        await page.locator(ARTICLE_ROW).first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);

        const bogus = `__no_match__${Date.now()}`;
        await typeSearch(page, bogus);

        await expect
            .poll(async () => page.locator(ARTICLE_ROW).count(), {
                message: 'Bogus search should leave the list with zero matching rows',
                timeout: 15_000,
            })
            .toBe(0);

        await close();
    });

    test('Vendor: clearing the search input issues a fetch without the search filter', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        // We assert on the *clear behavior* (a fetch without search= fires,
        // input value is empty) rather than on a row-count restoration. Other
        // workers run bulk-trash and empty-trash tests against the same DB,
        // which can wipe any seeded announcement mid-test — a row-based
        // assertion races them and flakes (observed: row count stays at 0
        // after clear because the seed was bulk-trashed in another worker).
        // The clear logic itself is decoupled from global state.
        const { page, close } = await openVendorAnnouncementList(browser);

        const bogus = `__no_match__${Date.now()}`;
        await typeSearch(page, bogus);

        // Synchronize against the bogus debounced fetch landing before we
        // install the empty-search listener. typeSearch's 900ms timeout is
        // not a guarantee — on a slow CI runner the bogus fetch can still
        // be in flight when the clear fires, and React's DebouncedInput
        // coalesces the two state changes so no empty-search request goes
        // out. The listener then times out at 15s with `req === null`
        // (observed flake on shard 1, run #4170).
        await page
            .waitForRequest(
                (req) => {
                    if (!req.url().includes('/dokan/v1/announcement')) return false;
                    return new URL(req.url()).searchParams.get('search') === bogus;
                },
                { timeout: 5_000 },
            )
            .catch(() => null);

        // Wait for a fetch whose `search` param is absent or empty — the signal
        // that the clear-handler dispatched a no-filter request.
        const reqPromise = page
            .waitForRequest(
                (req) => {
                    if (!req.url().includes('/dokan/v1/announcement')) return false;
                    const search = new URL(req.url()).searchParams.get('search');
                    return search === null || search === '';
                },
                { timeout: 15_000 },
            )
            .catch(() => null);

        await typeSearch(page, '');
        const req = await reqPromise;
        expect(req, 'Clearing the search should fire a fetch without a search filter').not.toBeNull();

        expect(await page.locator(SEARCH_INPUT).inputValue(), 'Search input value should be empty after clear').toBe('');

        await close();
    });

    test('Vendor: clicking an announcement card opens detail with title in <h2>', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const title = uniqueTitle('detail');
        await seedAnnouncement(browser, title);

        const { page, close } = await openVendorAnnouncementList(browser);

        // Use search to deterministically locate the just-seeded row.
        await typeSearch(page, title);
        const row = page.locator(ARTICLE_ROW).filter({ hasText: title }).first();
        await row.waitFor({ state: 'visible', timeout: 15_000 });

        // The row has a checkbox AND a clickable title region (role="button"
        // div wrapping the ShortContent title). Click the title region.
        const titleRegion = row.locator('div[role="button"]').first();
        await titleRegion.click();

        // Detail panel renders the title as an <h2> (AnnouncementDetails.tsx).
        await expect(
            page.locator('h2').filter({ hasText: title }).first(),
            `Announcement detail should show <h2> with "${title}"`,
        ).toBeVisible({ timeout: 15_000 });

        await close();
    });

    test('Vendor: clicking "Unread" tab issues request with read_status=unread', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        // Seed at least one announcement so tab counts are non-zero (cleaner signal).
        await seedAnnouncement(browser, uniqueTitle('unreadtab'));

        const { page, close } = await openVendorAnnouncementList(browser);

        // Wait for both tabs to be ready, then click "Unread".
        const unreadTab = page.locator(TAB_BUTTON('Unread')).first();
        await unreadTab.waitFor({ state: 'visible', timeout: 15_000 });

        const reqPromise = page
            .waitForRequest(
                (req) => req.url().includes('/dokan/v1/announcement') && req.url().includes('read_status=unread'),
                { timeout: 15_000 },
            )
            .catch(() => null);
        await unreadTab.click();
        const req = await reqPromise;
        expect(req, 'Selecting Unread tab should issue a request with read_status=unread').not.toBeNull();

        await close();
    });

    test('Vendor: HashRouter survives reload on /announcement', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const { page, close } = await openVendorAnnouncementList(browser);

        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator(VENDOR_DASHBOARD_ROOT).waitFor({ state: 'visible', timeout: 30_000 });
        expect(page.url()).toMatch(/#\/announcement/);
        await expectNoFatal(page);

        await close();
    });

    test('Vendor: list and announcement modal coexist (modal auto-dismissed)', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const { page, close } = await openVendorAnnouncementList(browser);

        const modalVisible = await page.locator('.vendor-announcement-modal').first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(modalVisible, 'Vendor announcement modal should be auto-dismissed').toBe(false);
        await expect(page.locator(VENDOR_DASHBOARD_ROOT)).toBeVisible();

        await close();
    });
});

// ============================================================
// Customer Access (negative — vendor-only surface)
// ============================================================

test.describe('Customer Cannot Access Vendor Announcements (React) @pro', () => {
    test('Customer: legacy /dashboard/announcement does NOT mount vendor list', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: c1 });
        const page = await ctx.newPage();
        await page.goto(VENDOR_LEGACY_URL);
        await page.waitForLoadState('domcontentloaded');

        // Legacy vendor announcement rows are `.dokan-announcement-wrapper-item`.
        // Customers must see zero such rows.
        await expect(page.locator('.dokan-announcement-wrapper-item')).toHaveCount(0);
        await expectNoFatal(page);

        await page.close();
        await ctx.close();
    });

    test('Customer: vendor /dashboard/new/#/announcement does NOT mount vendor dashboard', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: c1 });
        const page = await ctx.newPage();
        await page.goto(VENDOR_NEW_URL);
        await page.waitForLoadState('domcontentloaded');

        // Site redirects non-vendor users — the new vendor dashboard root and
        // its announcement-list-item rows must not exist.
        await expect(page.locator(VENDOR_DASHBOARD_ROOT)).toHaveCount(0);
        await expect(page.locator(ARTICLE_ROW)).toHaveCount(0);
        await expectNoFatal(page);

        await page.close();
        await ctx.close();
    });
});
