import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA — namespaced with the "ACHG" area prefix.
// ============================================
// The admin Changelog is a READ-ONLY viewer. Its data comes from the REST
// endpoint GET /dokan/v1/admin/changelog/lite (a JSON STRING the component
// JSON.parses), which is derived server-side from templates/whats-new.php and
// transient-cached per plugin version. There is nothing to seed in the DB:
// every state (multi-version list, >5-item collapse, empty payload, malformed
// JSON, 500) is driven by page.route mocks of that one endpoint, so this spec
// is fully self-contained and parallel-safe. See new-dashboards-test-cases.md
// lines 494-539.
export const adminChangelogData = {
    // REST endpoint the ChangelogPage fetches on mount (lite package). Trailing
    // wildcard is REQUIRED — the request carries query params
    // (…/changelog/lite?<params>), so a glob without it never intercepts and the
    // real changelog renders instead (whose entries contain words like "fatal
    // error", tripping the PHP-fatal check, plus the wrong versions).
    liteEndpoint: '**/dokan/v1/admin/changelog/lite*',
    // A mock changelog payload covering: a latest version (index 0, fully
    // expanded, "Latest" tag, no toggle even with >5 items) and a non-latest
    // version with >5 total items (collapses to 5 + "See Details"). Every
    // ChangeBadge type (New / Fix / Improvement / Update) appears, plus an
    // unknown type ("Security") for the default-badge edge. The endpoint returns
    // a JSON STRING, so tests fulfil() with JSON.stringify(JSON.stringify(...)).
    mockVersions: [
        {
            version: 'ACHG-9.9.9',
            released: '2026-06-08',
            changes: {
                New: [
                    { title: 'ACHG latest new feature one', description: '' },
                    { title: 'ACHG latest new feature two', description: '' },
                ],
                Fix: [
                    { title: 'ACHG latest fix one', description: '' },
                    { title: 'ACHG latest fix two', description: '' },
                    { title: 'ACHG latest fix three', description: '' },
                    { title: 'ACHG latest fix four', description: '' },
                    { title: 'ACHG latest fix five', description: '' },
                    { title: 'ACHG latest fix six', description: '' },
                ],
            },
        },
        {
            version: 'ACHG-8.8.8',
            released: '2026-01-15',
            changes: {
                Improvement: [
                    { title: 'ACHG older improvement one', description: '' },
                    { title: 'ACHG older improvement two', description: '' },
                    { title: 'ACHG older improvement three', description: '' },
                ],
                Update: [
                    { title: 'ACHG older update one', description: '' },
                    { title: 'ACHG older update two', description: '' },
                    { title: 'ACHG older update three', description: '' },
                ],
                Security: [{ title: 'ACHG older security note', description: '' }],
            },
        },
        {
            version: 'ACHG-7.7.7',
            released: '2025-09-01',
            changes: {
                Fix: [{ title: 'ACHG small release fix', description: '' }],
            },
        },
    ],
    // A search substring guaranteed to match no version (empty-state edge).
    searchMiss: 'zzz_no_such_version_zzz',
    // A hostile string for the search-input XSS/length edge.
    searchXss: '<img src=x onerror=alert(1)>',
} as const;

// ============================================
// SELECTORS — verified against
// src/admin/dashboard/pages/changelog/{index,SearchBar,PackageToggle,
// ChangeBadge,VersionRow}.tsx. The admin Changelog is NOT the AdminDataViews
// table surface — it is a bespoke card list (one VersionRow per version) with a
// custom "Jump to version" SearchBar dropdown. So there is no DataViews
// table / status tab / row-action kebab here; selectors are role/text based off
// the real JSX.
// ============================================
export const adminChangelogSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    // ChangelogPage h1 — { __( 'Dokan Changelog', 'dokan-lite' ) }.
    title: 'Dokan Changelog',
    // VersionRow heading is an <h3> per version; the version string is its text.
    versionHeading: 'h3',
    // SearchBar trigger button label.
    jumpTrigger: 'Jump to version',
    // SearchBar input placeholder — { __( 'Search version…', 'dokan-lite' ) }.
    searchInput: 'input[placeholder="Search version…"]',
    // Loading spinner (animate-spin) shown while the REST request is in flight.
    loadingSpinner: '.animate-spin',
    // Empty / error state — { __( 'No changelog data available.', 'dokan-lite' ) }.
    emptyState: 'text=No changelog data available.',
    // SearchBar no-match — { __( 'No versions found', 'dokan-lite' ) }.
    noVersionsFound: 'text=No versions found',
    // PHP fatal marker. Changelog ENTRIES legitimately contain "Fatal error" /
    // "Parse error" prose (e.g. "Fixed a fatal error when…"), so match ONLY the
    // WordPress critical-error page phrase, which never appears in changelog copy.
    phpFatal: 'text=/There has been a critical error on this website/i',
} as const;

// ============================================
// PAGE OBJECT — admin Changelog viewer (Dokan 5.0.0+ React admin dashboard).
// Surface: wp-admin/admin.php?page=dokan-dashboard#/changelog (HashRouter).
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler.
// ============================================
export class AdminChangelogPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/changelog');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminChangelogSelectors.reactRoot).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: adminChangelogSelectors.title }).first();
    }
    /** All VersionRow cards' version headings (one <h3> per version). */
    get versionHeadings(): Locator {
        return this.reactRoot.locator(adminChangelogSelectors.versionHeading);
    }
    get jumpTrigger(): Locator {
        return this.page.getByRole('button', { name: adminChangelogSelectors.jumpTrigger }).first();
    }
    get searchInput(): Locator {
        return this.page.locator(adminChangelogSelectors.searchInput).first();
    }
    get loadingSpinner(): Locator {
        return this.page.locator(adminChangelogSelectors.loadingSpinner).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminChangelogSelectors.emptyState).first();
    }
    get noVersionsFound(): Locator {
        return this.page.locator(adminChangelogSelectors.noVersionsFound).first();
    }
    /** The Lite/Pro PackageToggle buttons (rendered only when Dokan Pro exists). */
    get liteToggle(): Locator {
        return this.page.getByRole('button', { name: 'Lite', exact: true }).first();
    }
    get proToggle(): Locator {
        return this.page.getByRole('button', { name: 'Pro', exact: true }).first();
    }

    /** A VersionRow card located by its version-string heading. */
    versionCardHeading(version: string): Locator {
        return this.versionHeadings.filter({ hasText: version }).first();
    }

    /** A dropdown option button bearing the given version string. */
    dropdownOption(version: string): Locator {
        return this.page.getByRole('button', { name: new RegExp(escapeRegExp(version)) });
    }

    // ---- Mocking (read-only endpoint per the checklist) ----
    /** Fulfil GET /changelog/lite with a JSON STRING of `versions`. The
     * component does JSON.parse on the response, so the HTTP body must itself be
     * a JSON string -> body = JSON.stringify(JSON.stringify(versions)). */
    async mockChangelog(versions: unknown): Promise<void> {
        await this.page.route(adminChangelogData.liteEndpoint, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(JSON.stringify(versions)),
            });
        });
    }

    /** Fulfil GET /changelog/lite with a raw string body (for malformed-JSON
     * and empty-payload edges). */
    async mockChangelogRaw(body: string): Promise<void> {
        await this.page.route(adminChangelogData.liteEndpoint, async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body });
        });
    }

    /** Make GET /changelog/lite fail with a 500 (the component swallows it). */
    async mockChangelogError(): Promise<void> {
        await this.page.route(adminChangelogData.liteEndpoint, async route => {
            await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'boom' }) });
        });
    }

    /** Delay the changelog response by `delayMs` so the loading spinner is
     * observable, then return the mock payload as a JSON string. */
    async mockChangelogDelayed(versions: unknown, delayMs: number): Promise<void> {
        await this.page.route(adminChangelogData.liteEndpoint, async route => {
            await new Promise(resolve => setTimeout(resolve, delayMs));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(JSON.stringify(versions)),
            });
        });
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root + the "Dokan Changelog" title are visible. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.heading.waitFor({ state: 'visible', timeout: timeoutMs });
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminChangelogSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Reads ----
    /** Number of VersionRow cards currently rendered. */
    async getVersionCount(): Promise<number> {
        return await this.versionHeadings.count();
    }

    /** True once at least one VersionRow OR an empty-state has painted. */
    async waitForContent(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.getVersionCount()) > 0) return;
            if (await this.emptyState.isVisible().catch(() => false)) return;
            await this.page.waitForTimeout(250);
        }
    }

    async isEmptyStateVisible(): Promise<boolean> {
        return await this.emptyState.isVisible({ timeout: 5000 }).catch(() => false);
    }

    // ---- VersionRow helpers ----
    /** The whole VersionRow row container, located via its <h3> heading.
     * VersionRow's outer element is `div.flex.gap-20.mb-10` and the `gap-20`
     * class is unique to it, so we climb to the nearest ancestor carrying it.
     * This container wraps BOTH the left version column and the right changes
     * card (See Details toggle + the `ul li` change items live in the latter). */
    versionCard(version: string): Locator {
        return this.versionCardHeading(version).locator('xpath=ancestor::div[contains(@class,"gap-20")][1]').first();
    }

    /** The "See Details" / "See Less" toggle inside a version's card. */
    seeDetailsToggle(version: string): Locator {
        return this.versionCard(version)
            .getByRole('button', { name: /See Details|See Less/ })
            .first();
    }

    /** Count of bullet change items currently visible in a version's card. */
    async visibleItemCount(version: string): Promise<number> {
        return await this.versionCard(version).locator('ul li').count();
    }

    // ---- SearchBar (Jump to version) ----
    async openJumpDropdown(): Promise<void> {
        await this.jumpTrigger.waitFor({ state: 'visible', timeout: 10000 });
        await this.jumpTrigger.click();
        await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    }

    async typeVersionSearch(query: string): Promise<void> {
        await this.searchInput.fill(query);
        await this.page.waitForTimeout(300); // client-side substring filter.
    }

    /** Click the dropdown's X clear button (only present when query non-empty). */
    async clearVersionSearch(): Promise<void> {
        // The X button is the second button inside the search input wrapper.
        await this.searchInput.locator('xpath=following-sibling::button[1]').first().click();
        await this.page.waitForTimeout(200);
    }

    async selectVersionFromDropdown(version: string): Promise<void> {
        await this.dropdownOption(version).first().click();
        await this.page.waitForTimeout(400); // highlight + smooth-scroll.
    }

    async isDropdownOpen(): Promise<boolean> {
        return await this.searchInput.isVisible({ timeout: 2000 }).catch(() => false);
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Changelog UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
