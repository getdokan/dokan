import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';

// ============================================================================
// Printful module — legacy page object ported into the current self-contained
// architecture. Faithful port of the pre-refactor @pages/printfulPage.ts:
// admin sees the Printful settings nav + vendor submenu when the module is on,
// the vendor Printful settings screen renders the shipping toggles, and the
// connect / disconnect / enable-shipping flows on the classic Vue settings
// surface. Base-class helpers (goto/toBeVisible/hover/clickAndWaitForResponse/
// switcher toggles/background-color asserts) are inlined as raw Playwright.
//
// `payloads` + `ApiUtils` are re-exported REAL from @utils so the spec's
// beforeAll/afterAll can activate/deactivate the printful module over REST.
// ============================================================================

// Re-export the REAL payloads the spec uses (moduleIds.printful, adminAuth).
export { payloads } from '@utils/payloads';

/**
 * Null-tolerant ApiUtils wrapper (mirrors the sibling revived POs).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context
 * and swap it in before the first real call.
 */
export class ApiUtils extends RealApiUtils {
    private lazyCtx: Promise<APIRequestContext> | null = null;

    constructor(ctx: APIRequestContext | null) {
        super(ctx as APIRequestContext);
        if (!ctx) this.lazyCtx = pwRequest.newContext();
    }

    private async ready(): Promise<void> {
        if (this.lazyCtx) {
            const ctx = await this.lazyCtx;
            this.lazyCtx = null;
            (this as { request: APIRequestContext }).request = ctx;
        }
    }

    override async activateModules(...args: Parameters<RealApiUtils['activateModules']>): ReturnType<RealApiUtils['activateModules']> {
        await this.ready();
        return super.activateModules(...args);
    }

    override async deactivateModules(...args: Parameters<RealApiUtils['deactivateModules']>): ReturnType<RealApiUtils['deactivateModules']> {
        await this.ready();
        return super.deactivateModules(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ============================================================================
// SUB-URLS (pre-refactor data.subUrls values, inlined co-located)
// ============================================================================
const subUrls = {
    ajax: 'admin-ajax.php',
    dokanSettings: 'wp-admin/admin.php?page=dokan#/settings',
    // The bare `dashboard` root now lands on the React analytics Overview
    // (?path=/analytics/Overview) where the classic `ul.dokan-dashboard-menu`
    // sidebar is not rendered/hoverable. The classic sidebar + settings
    // submenu (which carries `.submenu-item.printful`) still render on the
    // legacy settings sub-pages, so drive the menu checks from Store settings.
    settingsStore: 'dashboard/settings/store',
    settingsPrintful: 'dashboard/settings/printful',
    // absolute — used only as a waitForResponse url substring, never navigated
    printfulOAuth: 'https://www.printful.com/oauth/authorize',
};

// ============================================================================
// SELECTORS (recovered from pre-refactor selectors.ts)
// ============================================================================
const selectors = {
    // admin dokan settings — Printful settings nav (classic Vue settings menu)
    adminPrintfulSettingsMenu: '//div[@class="nav-title" and contains(text(),"Printful")]',

    // vendor dashboard menu
    //
    // The vendor dashboard navigation moved to a React sidebar
    // (<aside class="dokan-frontend-sidebar">). The legacy Vue/PHP
    // `ul.dokan-dashboard-menu` markup is still emitted but rendered
    // visibility:hidden inside the new full-width wrapper, so its
    // `.submenu-item.printful` link can never be hovered/seen. The Printful
    // settings entry now surfaces as a visible link in the React sidebar; its
    // Settings group auto-expands on any /dashboard/settings/* route.
    vendorMenus: {
        printfulSubMenu: 'aside.dokan-frontend-sidebar a[href*="/settings/printful"]',
    },

    // vendor printful settings screen
    vPrintfulSettings: {
        printfulSettingsDiv: 'div#dokan-pro-printful-vendor-settings',
        connectToPrintful: 'button#dokan-pro-connect-printful-btn',
        authorize: '//a[normalize-space()="Authorize"]',
        disconnectToPrintful: 'button#dokan-pro-disconnect-printful-btn',
        confirmDisconnect: 'button.swal2-confirm',
        disconnectSuccessMessage: '//div[@id="swal2-html-container" and normalize-space()="Disconnecting from Printful Successfully"]',
        printfulShipping: '//input[@id="dokan-pro-printful-enable-shipping-toggle"]//..',
        marketplaceShipping: '//input[@id="dokan-pro-printful-enable-rates-toggle"]//..',
    },
};

const vendorPrintful = selectors.vPrintfulSettings;
const ENABLED_COLOR = 'rgb(33, 150, 243)';
const DISABLED_COLOR = 'rgb(204, 204, 204)';

export class PrintfulPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // ------------------------------------------------------------------
    // Inlined base helpers (raw Playwright equivalents of the old @pages)
    // ------------------------------------------------------------------
    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private async goto(subPath: string): Promise<void> {
        await this.page.goto(this.createUrl(subPath), { waitUntil: 'domcontentloaded' });
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        const target = this.createUrl(subPath).replace(/\/$/, '');
        const current = this.page.url().replace(/\/$/, '');
        if (current !== target) {
            await this.goto(subPath);
        }
    }

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toBeVisible();
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toBeHidden();
    }

    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).first().click();
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).first().click(),
        ]);
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).first().click(),
        ]);
    }

    private async getElementBackgroundColor(selector: string): Promise<string> {
        return await this.page.locator(selector).first().evaluate(el => window.getComputedStyle(el).getPropertyValue('background-color'));
    }

    // vendor-dashboard toggle switches paint blue (rgb(33,150,243)) when on.
    private async enableSwitcherVendorDashboard(selector: string): Promise<void> {
        const target = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getElementBackgroundColor(target);
        if (!value.includes(ENABLED_COLOR)) {
            await this.click(target);
        }
    }

    private async disableSwitcherVendorDashboard(selector: string): Promise<void> {
        const target = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getElementBackgroundColor(target);
        if (value.includes(ENABLED_COLOR)) {
            await this.click(target);
        }
    }

    private async toHaveBackgroundColor(selector: string, backgroundColor: string): Promise<void> {
        await expect(async () => {
            const value = await this.getElementBackgroundColor(selector);
            expect(value).toBe(backgroundColor);
        }).toPass();
    }

    // ==================================================================
    // ADMIN
    // ==================================================================

    // enable printful module — module ON exposes the admin settings nav + the
    // vendor dashboard settings submenu entry
    async enablePrintfulModule(): Promise<void> {
        // dokan settings
        await this.goto(subUrls.dokanSettings);
        await this.toBeVisible(selectors.adminPrintfulSettingsMenu);

        // vendor dashboard nav (React sidebar) — the Settings group auto-expands
        // on a settings route, surfacing the visible Printful entry.
        await this.goto(subUrls.settingsStore);
        await this.toBeVisible(selectors.vendorMenus.printfulSubMenu);
    }

    // disable printful module — module OFF removes the admin nav, the vendor
    // submenu, and the vendor printful settings surface
    async disablePrintfulModule(): Promise<void> {
        // dokan settings
        await this.goto(subUrls.dokanSettings);
        await this.notToBeVisible(selectors.adminPrintfulSettingsMenu);

        // vendor dashboard nav (React sidebar) — with the module off, the
        // Printful entry is no longer registered, so it must be absent.
        await this.goto(subUrls.settingsStore);
        await this.notToBeVisible(selectors.vendorMenus.printfulSubMenu);

        // vendor dashboard settings menu
        await this.goto(subUrls.settingsPrintful);
        await this.notToBeVisible(vendorPrintful.printfulSettingsDiv);
    }

    // ==================================================================
    // VENDOR
    // ==================================================================

    // vendor printful settings screen renders (shipping toggles present)
    async vendorPrintfulSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.settingsPrintful);
        // connect/disconnect state depends on the account link — assert toggles
        await this.toBeVisible(vendorPrintful.printfulShipping);
        await this.toBeVisible(vendorPrintful.marketplaceShipping);
    }

    // connect to printful (OAuth authorize round-trip → disconnect button shows)
    async connectPrintful(): Promise<void> {
        await this.goIfNotThere(subUrls.settingsPrintful);
        await this.clickAndWaitForResponseAndLoadState(subUrls.printfulOAuth, vendorPrintful.connectToPrintful);
        await this.clickAndWaitForResponseAndLoadState(subUrls.settingsPrintful, vendorPrintful.authorize);
        await this.toBeVisible(vendorPrintful.disconnectToPrintful);
    }

    // disconnect from printful (swal confirm → admin-ajax → success message)
    async disconnectPrintful(): Promise<void> {
        await this.goIfNotThere(subUrls.settingsPrintful);
        await this.click(vendorPrintful.disconnectToPrintful);
        await this.clickAndWaitForResponse(subUrls.ajax, vendorPrintful.confirmDisconnect);
        await this.toBeVisible(vendorPrintful.disconnectSuccessMessage);
    }

    // enable shipping — printful only / marketplace only / both, asserting the
    // resulting toggle colors
    async enableShipping(shipping: 'printful' | 'marketplace' | 'both'): Promise<void> {
        await this.goIfNotThere(subUrls.settingsPrintful);

        switch (shipping) {
            case 'printful':
                await this.enableSwitcherVendorDashboard(vendorPrintful.printfulShipping);
                await this.toHaveBackgroundColor(vendorPrintful.printfulShipping + '//span', ENABLED_COLOR);
                break;

            case 'marketplace':
                await this.disableSwitcherVendorDashboard(vendorPrintful.printfulShipping);
                await this.toHaveBackgroundColor(vendorPrintful.printfulShipping + '//span', DISABLED_COLOR);
                await this.enableSwitcherVendorDashboard(vendorPrintful.marketplaceShipping);
                await this.toHaveBackgroundColor(vendorPrintful.marketplaceShipping + '//span', ENABLED_COLOR);
                break;

            case 'both':
                await this.enableSwitcherVendorDashboard(vendorPrintful.printfulShipping);
                await this.enableSwitcherVendorDashboard(vendorPrintful.marketplaceShipping);
                await this.toHaveBackgroundColor(vendorPrintful.printfulShipping + '//span', ENABLED_COLOR);
                await this.toHaveBackgroundColor(vendorPrintful.marketplaceShipping + '//span', ENABLED_COLOR);
                break;

            default:
                break;
        }
    }
}
