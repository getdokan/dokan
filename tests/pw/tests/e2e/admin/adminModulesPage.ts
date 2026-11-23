import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// The admin Modules page (#/pro-modules) is a SELF-CONTAINED Lite "advertise"
// grid: it reads a static module list baked into the PHP page settings
// (includes/Admin/Dashboard/Pages/Modules.php :: settings()['modules']) and
// renders one marketing Card per module. It NEVER activates a module — toggling
// any card switch opens the Upgrade-to-Pro modal. So there is no vendor /
// customer precondition to seed (admin-dashboard-seeding-strategy.md § 246-256:
// "Modules ... need ZERO vendor/customer precondition").
//
// All fixtures below are derived from the REAL static module list in
// Modules.php, so they stay in sync with the rendered grid. The "AMOD" prefix
// is reserved for any namespaced data this folder would seed via REST — the
// advertise grid needs none, but the prefix is honoured on the @pro backend
// reset helper module ids it touches (see spec).
export const adminModulesData = {
    // First module alphabetically (the grid sorts by title A-Z): the page
    // settings sort guarantees "Auction Integration" is the first Card.
    firstModuleAlphabetical: 'Auction Integration',
    // A module whose title contains a substring shared by exactly two cards:
    // "Stripe Connect" + "Stripe Express" both match a "stripe" search.
    stripeSearch: { term: 'stripe', expectedCount: 2 },
    // A single-card exact-ish search (only "Auction Integration" matches).
    auctionSearch: { term: 'Auction', module: 'Auction Integration' },
    // A category tag present on several modules — clicking it filters the grid.
    paymentTag: 'Payment',
    productManagementTag: 'Product Management',
    // A module that carries the Payment tag (sanity target for tag filtering).
    paymentModule: 'Stripe Connect',
    // A module with a `requires` field — renders the requirements tooltip.
    moduleWithRequires: 'Auction Integration',
    // A search term guaranteed to match no module title, for the empty grid edge.
    searchMiss: 'AMOD_no_such_module_zzz',
    // A regex-metacharacter search term: must be matched literally, never crash.
    regexSearch: 'a+b*(c',
    // An XSS probe: must be treated as plain text in the search box.
    xssSearch: '<script>window.__amodXss=1</script>',
} as const;

// ============================================
// SELECTORS — verified against the real React source:
//   src/admin/dashboard/pages/modules/index.tsx        (page shell, header, chips)
//   src/admin/dashboard/pages/modules/Card.tsx         (.module-card, .module-tag, ToggleSwitch)
//   src/admin/dashboard/pages/modules/SearchBox.tsx    (SearchControl placeholder "Search Modules")
//   src/admin/dashboard/pages/modules/CategorySelector.tsx (Popover + SimpleCheckboxGroup)
//   src/admin/dashboard/pages/modules/UpgradeModal.tsx (DokanModal namespace "upgrade-to-pro")
// Mounted on #dokan-admin-dashboard at admin.php?page=dokan-dashboard#/pro-modules.
// ============================================
export const adminModulesSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    // One marketing Card per module (Card.tsx root div).
    card: '.module-card',
    // Module title link inside a card (anchor wrapping the title text).
    cardTitleLink: '.module-card h3 a',
    // A clickable category tag pill on a card (Card.tsx renders <button.module-tag>).
    cardTag: 'button.module-tag',
    // The per-card toggle switch (ToggleSwitch -> role=switch). Used relative to a
    // cardByTitle() locator, so it must NOT re-prefix .module-card (there is no
    // .toggle-container wrapper in the rendered DOM).
    cardToggle: '[role="switch"], input[type="checkbox"]',
    // SearchBox renders a @wordpress/components SearchControl with this placeholder.
    searchInput: 'input[placeholder="Search Modules"]',
    // Active-filter chips + "Clear filter" button live in the chip row.
    clearFilterButton: 'button:has-text("Clear filter")',
    // The Upgrade-to-Pro modal is a @wordpress/components Modal (role=dialog).
    upgradeDialog: 'div[role="dialog"]',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // Non-admin permission wall (wp_die) when a vendor/customer hits the page.
    permissionDenied: 'text=/you are not allowed|do not have permission|cheatin/i',
    loginForm: '#loginform, #user_login',
} as const;

// ============================================
// PAGE OBJECT — admin Modules / Pro-modules grid (Dokan 5.0.0+ React dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/pro-modules
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// Upgrade-to-Pro modal this page legitimately opens).
// ============================================
export class AdminModulesPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/pro-modules');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminModulesSelectors.reactRoot).first();
    }
    get cards(): Locator {
        return this.page.locator(adminModulesSelectors.card);
    }
    get searchBox(): Locator {
        return this.page.locator(adminModulesSelectors.searchInput).first();
    }
    get clearFilterButton(): Locator {
        return this.page.locator(adminModulesSelectors.clearFilterButton).first();
    }
    get upgradeDialog(): Locator {
        return this.page.locator(adminModulesSelectors.upgradeDialog).first();
    }

    /** The page H1 ("Modules"). */
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Modules', exact: true, level: 1 }).first();
    }

    /** The "Pro Modules (N)" header label (count badge). */
    get proModulesLabel(): Locator {
        return this.page.getByText(/Pro Modules \(\d+\)/).first();
    }

    /** The "Select Category" popover trigger. */
    get categoryTrigger(): Locator {
        return this.page.getByText(/Select\s+Category/i).first();
    }

    /** A single module Card matched by its title (the title link text == module title). */
    cardByTitle(title: string): Locator {
        return this.cards.filter({ has: this.page.locator(`a:text-is("${title}")`) }).first();
    }

    /** The "Upgrade to Pro" CTA inside the upgrade modal. */
    get upgradeCta(): Locator {
        return this.page.getByRole('link', { name: /Upgrade to Pro/i }).first();
    }

    /** The modal close (X) control (aria-label="Close" in DokanModal). */
    get modalCloseButton(): Locator {
        return this.page.getByRole('button', { name: 'Close' }).first();
    }

    /** An active-filter chip carrying the given tag text. */
    filterChip(tag: string): Locator {
        return this.page.locator('div.rounded-full').filter({ hasText: tag }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root is visible AND at least one Card has painted. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        const start = Date.now();
        while (Date.now() - start < 15000) {
            if ((await this.cards.count()) > 0) return;
            await this.page.waitForTimeout(250);
        }
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminModulesSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Reads ----
    async getCardCount(): Promise<number> {
        return await this.cards.count();
    }

    /** The integer N inside the "Pro Modules (N)" header label. */
    async getHeaderModuleCount(): Promise<number> {
        const text = await this.proModulesLabel.innerText();
        const match = text.match(/\((\d+)\)/);
        return match?.[1] ? parseInt(match[1], 10) : 0;
    }

    /** The title text of the first rendered card (top-left of the grid). */
    async getFirstCardTitle(): Promise<string> {
        const first = this.page.locator(adminModulesSelectors.cardTitleLink).first();
        await first.waitFor({ state: 'visible', timeout: 10000 });
        return (await first.innerText()).trim();
    }

    /** The href of a module card's title link. */
    async getCardTitleHref(title: string): Promise<string | null> {
        return await this.cardByTitle(title).locator('a').first().getAttribute('href');
    }

    // ---- Search ----
    async search(query: string): Promise<void> {
        const input = this.searchBox;
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(query);
        await this.page.waitForTimeout(700); // state propagation + grid re-render.
    }

    async clearSearch(): Promise<void> {
        const input = this.searchBox;
        if (await input.isVisible().catch(() => false)) {
            await input.fill('');
            await this.page.waitForTimeout(500);
        }
    }

    // ---- Category filter ----
    /** Open the category popover and tick the checkbox for a tag (by visible label prefix). */
    async filterByCategory(tag: string): Promise<void> {
        await this.openCategoryPopover();
        const option = this.page.getByRole('checkbox', { name: new RegExp('^' + escapeRegExp(tag) + '\\b', 'i') }).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.check();
        // Close the popover by clicking the page body so chips/grid settle.
        await this.page.keyboard.press('Escape').catch(() => undefined);
        await this.page.waitForTimeout(600);
    }

    async openCategoryPopover(): Promise<void> {
        await this.categoryTrigger.waitFor({ state: 'visible', timeout: 10000 });
        await this.categoryTrigger.click();
        await this.page.waitForTimeout(400); // popover mount + focus.
    }

    /** Click "Clear filter" to drop all active category filters. */
    async clearFilter(): Promise<void> {
        if (await this.clearFilterButton.isVisible().catch(() => false)) {
            await this.clearFilterButton.click();
            await this.page.waitForTimeout(500);
        }
    }

    /** Click a tag pill on a specific card, which adds it to the active filter. */
    async clickCardTag(cardTitle: string, tag: string): Promise<void> {
        const pill = this.cardByTitle(cardTitle).locator(adminModulesSelectors.cardTag).filter({ hasText: tag }).first();
        await pill.waitFor({ state: 'visible', timeout: 10000 });
        await pill.click();
        await this.page.waitForTimeout(500);
    }

    /** Count the active-filter chips currently shown in the chip row. */
    async getActiveFilterChipCount(tag: string): Promise<number> {
        return await this.page.locator('div.rounded-full').filter({ hasText: tag }).count();
    }

    // ---- Toggle -> Upgrade modal ----
    /** Click a card's toggle switch; the Lite page responds by opening the Upgrade modal. */
    async toggleModule(title: string): Promise<void> {
        const toggle = this.cardByTitle(title).locator(adminModulesSelectors.cardToggle).first();
        await toggle.waitFor({ state: 'visible', timeout: 10000 });
        await toggle.click();
    }

    async isUpgradeModalOpen(): Promise<boolean> {
        return await this.upgradeDialog.isVisible({ timeout: 5000 }).catch(() => false);
    }

    async closeUpgradeModal(): Promise<void> {
        if (await this.modalCloseButton.isVisible().catch(() => false)) {
            await this.modalCloseButton.click();
            await this.page.waitForTimeout(400);
        }
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Modules UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
