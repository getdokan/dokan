import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA — Admin Extensions page (Dokan 5.0.0+ React admin dashboard)
// ============================================
// The Extensions area is a STATIC, server-driven marketing/recommendations
// surface: the recommended addons, mobile apps and weLabs data are baked into
// getSettings('extensions') from includes/Admin/Dashboard/Pages/Extensions.php
// — there is no per-test DB/REST state to seed. So this fixture only namespaces
// the data the tests INVENT for the mocked-settings / mocked-install edges with
// the area prefix "AEXT". See tests/pw/test-cases/new-dashboards-test-cases.md
// (§ Extensions, lines 458-493) and admin-dashboard-seeding-strategy.md.
export const adminExtensionsData = {
    prefix: 'AEXT',
    // The four marketing tabs, in render order (index.tsx <TabsTrigger>).
    tabs: {
        recommended: 'Picks for you',
        mobileApps: 'Mobile Apps',
        compatibility: 'Compatibility',
        services: 'Services',
    },
    // Real, server-defined addons used to assert ordering / badge type.
    // First (position 10) is an install card. The get_plugin (Pro) card must be
    // one with NO local sibling plugin, else it renders "Installed" instead of
    // the "Get Addon" external link (e.g. Dokan Booking Addon is installed in
    // the wp-env because woocommerce-bookings is a sibling). CartPulse is a
    // pure get_plugin card (external paid addon, never installed) → reliably
    // shows the "Pro" badge + a "Get Addon" link to cartpulse.co. From Extensions.php.
    firstAddonTitle: 'Dokan WPML',
    proAddonTitle: 'CartPulse',
    // The external destination a get_plugin "Get Addon" link points to.
    proAddonHref: /cartpulse\.co/,
    // The real install slug an Install Free card POSTs (addon.wp_org_slug).
    installSlug: 'dokan-wpml',
    // A synthetic addon used only when the test MOCKS getSettings('extensions')
    // for the empty-state / installed-state / placeholder edges.
    mockInstallSlug: 'aext-mock-addon',
    // Static external links the page renders (assert href + target=_blank).
    externalLinks: {
        browseThemes: 'https://dokan.co/wordpress/themes/',
        browsePlugins: 'https://dokan.co/wordpress/compatible-plugins/',
        welabs: 'https://welabs.dev',
        bookMeeting: 'https://calendly.com/welabstech/30min',
    },
} as const;

// ============================================
// SELECTORS — verified against the React source under
// src/admin/dashboard/pages/extensions/ (index.tsx, RecommendedAddons.tsx,
// MobileApps.tsx, Compatibility.tsx, Services.tsx) and the @wedevs/plugin-ui
// Tabs primitive (Radix → role=tab/tablist/tabpanel + aria-selected).
// Mounted on #dokan-admin-dashboard at admin.php?page=dokan-dashboard#/extensions.
// ============================================
export const adminExtensionsSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    // The plugin-ui shell renders a .pui-root inside the admin dashboard root.
    puiRoot: '#dokan-admin-dashboard .pui-root',
    // PHP fatal markers (same convention as adminVendorsPage).
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // Non-admin permission wall (wp_die) when a vendor/customer hits the page.
    permissionDenied: 'text=/you are not allowed|do not have permission|cheatin/i',
    loginForm: '#loginform, #user_login',
} as const;

// ============================================
// PAGE OBJECT — admin Extensions / recommendations page.
// Surface: wp-admin/admin.php?page=dokan-dashboard#/extensions
// NOTE: admin-facing — deliberately does NOT register the vendor
// announcement-modal handler (it never appears in wp-admin and a generic
// role=dialog handler would race the Services "View Details" DokanModal).
// ============================================
export class AdminExtensionsPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/extensions');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminExtensionsSelectors.reactRoot).first();
    }

    get puiRoot(): Locator {
        return this.page.locator(adminExtensionsSelectors.puiRoot).first();
    }

    /** The page <h1> 'Extensions' (index.tsx). */
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Extensions', level: 1 }).first();
    }

    /** Marketing banner <h2> 'Supercharge Your Marketplace'. */
    get bannerHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Supercharge Your Marketplace' }).first();
    }

    /** Banner illustration <img alt="Banner Icons">. */
    get bannerImage(): Locator {
        return this.page.locator('img[alt="Banner Icons"]').first();
    }

    /** The Radix tablist wrapping the four extension tabs. */
    get tabList(): Locator {
        return this.page.getByRole('tablist').first();
    }

    /** A tab trigger by its visible label, e.g. 'Picks for you' / 'Services'. */
    tab(name: string): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** The currently visible tabpanel (Radix only mounts the active panel). */
    get activePanel(): Locator {
        return this.page.getByRole('tabpanel').first();
    }

    /** A recommended-addon / mobile-app card matched by its title text.
     * Cards carry `shadow relative` (RecommendedAddons + MobileApps); this
     * EXCLUDES the ecosystem grid (`shadow` without `relative`) so a card
     * lookup never collides with the ecosystem section's own <h3> items. */
    addonCard(title: string): Locator {
        return this.page.locator('div.shadow.relative', { hasText: title }).first();
    }

    /** Ecosystem section heading below the addon grid. */
    get ecosystemHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Your complete business ecosystem' }).first();
    }

    /** Services "View Details" trigger (a DokanLink rendered as a div). */
    get viewDetailsTrigger(): Locator {
        return this.page.getByText('View Details', { exact: true }).first();
    }

    /** The custom-development DokanModal (role=dialog from @wordpress/components Modal). */
    get servicesModal(): Locator {
        return this.page.getByRole('dialog').first();
    }

    /** DokanModal close (X) button — aria-label="Close". */
    get modalCloseButton(): Locator {
        return this.servicesModal.getByRole('button', { name: 'Close' }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready once the plugin-ui shell has painted AND the Extensions heading is up. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.puiRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.heading.waitFor({ state: 'visible', timeout: timeoutMs }).catch(() => undefined);
    }

    async reload(): Promise<void> {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminExtensionsSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Tabs ----
    /** Switch to a tab and wait for its panel to repaint. */
    async openTab(name: string): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await this.page.waitForTimeout(400); // Radix panel mount/repaint.
    }

    /** True when the named tab is the selected one (aria-selected="true"). */
    async isTabSelected(name: string): Promise<boolean> {
        const state = await this.tab(name).getAttribute('aria-selected');
        return state === 'true';
    }

    // ---- Reads ----
    /** Count of addon/app cards in the active grid. `shadow relative` matches
     * only card containers (RecommendedAddons + MobileApps), not the ecosystem
     * grid (`shadow` without `relative`). */
    async addonCardCount(): Promise<number> {
        return await this.activePanel.locator('div.shadow.relative').count();
    }

    /** Ordered list of card titles in the active grid (the card-level <h3>). */
    async addonTitlesInOrder(): Promise<string[]> {
        const titles = this.activePanel.locator('div.shadow.relative h3');
        return (await titles.allInnerTexts()).map(t => t.trim()).filter(Boolean);
    }

    /** The install/get button rendered inside a named addon card. */
    addonButton(title: string): Locator {
        return this.addonCard(title).getByRole('button').first();
    }

    /** The "Get Addon" external anchor inside a get_plugin addon card. */
    getAddonLink(title: string): Locator {
        return this.addonCard(title).getByRole('link').first();
    }

    /** An external link by its visible text within the active panel. */
    externalLinkByText(text: string): Locator {
        return this.activePanel.getByRole('link', { name: text }).first();
    }

    // ---- Install action (read-only mocked in CI) ----
    /** Click an addon's "Install Free" button. The caller pre-mocks the POST. */
    async clickInstall(title: string): Promise<void> {
        const btn = this.addonButton(title);
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
    }

    // ---- Services modal ----
    async openServicesDetails(): Promise<void> {
        await this.viewDetailsTrigger.waitFor({ state: 'visible', timeout: 10000 });
        await this.viewDetailsTrigger.click();
        await this.servicesModal.waitFor({ state: 'visible', timeout: 10000 });
    }

    async closeServicesModalViaButton(): Promise<void> {
        await this.modalCloseButton.click();
        await this.servicesModal.waitFor({ state: 'hidden', timeout: 10000 });
    }

    async closeServicesModalViaEsc(): Promise<void> {
        await this.page.keyboard.press('Escape');
        await this.servicesModal.waitFor({ state: 'hidden', timeout: 10000 });
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Extensions UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible || !headingVisible;
    }
}
