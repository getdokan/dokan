import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

// ============================================================================
// Dokan ShipStation integration — ported from the pre-refactor page object
// (git e2ec507de:tests/pw/pages/shipStationPage.ts) into the current
// self-contained architecture. Covers the admin-side module toggle (surfaced
// as the vendor "ShipStation" settings sub-menu) and the vendor-side generate /
// revoke of ShipStation API credentials on `dashboard/settings/shipstation`.
//
// Base-class helpers from the reference are inlined as raw Playwright:
//   goto(subPath)                          -> page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' })
//   goIfNotThere(subPath)                  -> goto(subPath) only when not already there
//   hover(x)                               -> page.locator(x).hover()
//   click(x)                               -> page.locator(x).click()
//   toBeVisible(x)                         -> expect(page.locator(x)).toBeVisible()
//   notToBeVisible(x)                      -> expect(page.locator(x)).toBeHidden()
//   multipleElementVisible(group)          -> loop-assert Object.values(group) visible
//   multipleElementNotVisible(group)       -> loop-assert Object.values(group) hidden
//   clickAndAcceptAndWaitForResponse(u,s)  -> Promise.all([waitForResponse(url~u, 200),
//                                             once('dialog', accept), locator(s).click()])
// ============================================================================

// Re-export the REAL shared payloads so the spec's import contract
// ({ ShipStationPage, ApiUtils, payloads }) is wired to the genuine utilities
// (moduleIds.shipStation, adminAuth, vendorAuth) rather than local no-op stubs.
export { payloads } from '@utils/payloads';

/**
 * Null-tolerant ApiUtils wrapper.
 *
 * The spec constructs `new ApiUtils(null)` but the real ApiUtils requires an
 * APIRequestContext. When null is passed we lazily create our own request
 * context and swap it in before the first real REST call (module activate /
 * deactivate via PUT, credential create via POST, credential delete via DELETE)
 * or dispose. All auth is supplied per-call (adminAuth / vendorAuth) and the
 * shipstation / module endpoints are absolute URLs, so the fresh context needs
 * no baseURL. Mirrors the sibling ported suites (e.g. toolsPage, withdrawsPage).
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

    override async put(...args: Parameters<RealApiUtils['put']>): ReturnType<RealApiUtils['put']> {
        await this.ready();
        return super.put(...args);
    }

    override async post(...args: Parameters<RealApiUtils['post']>): ReturnType<RealApiUtils['post']> {
        await this.ready();
        return super.post(...args);
    }

    override async delete(...args: Parameters<RealApiUtils['delete']>): ReturnType<RealApiUtils['delete']> {
        await this.ready();
        return super.delete(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ============================================================================
// SELECTORS (recovered from pre-refactor selectors.ts)
//   - selector.vendor.vDashboard.menus.primary.settings / .subMenus.shipStation
//   - selector.vendor.vShipStationSettings.*
// ============================================================================
const shipStationSelectors = {
    menus: {
        // The primary "Settings" menu item in the vendor dashboard sidebar.
        settings: '(//ul[@class="dokan-dashboard-menu"]//li[contains(@class,"settings has-submenu")]//a)[1]',
        // The ShipStation sub-menu — only rendered when the module is active.
        shipStation: '.submenu-item.shipstation',
    },
    settings: {
        shipStationSettingsDiv: 'div#dokan-shipstation-vendor-settings',

        generateCredentials: 'button#dokan-shipstation-generate-credentials-btn',
        confirmGeneration: 'button.swal2-confirm',
        revokeCredentials: 'button#dokan-shipstation-revoke-credentials-btn',
        confirmRevoke: 'button.swal2-confirm',
        revokeSuccessMessage: '//div[@id="swal2-html-container" and normalize-space()="API credentials revoked successfully."]',

        credentials: {
            authenticationKey: '//label[normalize-space()="Authentication Key"]/..//code',
            consumerKey: '//label[normalize-space()="Consumer Key"]/..//code',
            consumerSecret: '//label[normalize-space()="Consumer Secret"]/..//code',
        },
        secretKeyHideWarning: '//p[normalize-space(text())="Note: Once this page is refreshed, the consumer secret will no longer be available."]',
    },
} as const;

// Sub-paths (raw, un-prefixed) reused for navigation and response matching.
const subUrls = {
    dashboard: data.subUrls.frontend.vDashboard.dashboard, // 'dashboard'
    settingsShipStation: data.subUrls.frontend.vDashboard.settingsShipStation, // 'dashboard/settings/shipstation'
    apiShipStation: data.subUrls.api.dokan.shipStation, // 'dokan/v1/shipstation'
} as const;

export class ShipStationPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- inlined base-class helpers -----------------------------------------

    private async goto(subPath: string): Promise<void> {
        await this.page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
    }

    // Navigate only when not already on the target URL (trailing slash tolerant).
    private async goIfNotThere(subPath: string): Promise<void> {
        const target = toPath(subPath).replace(/\/$/, '');
        const current = this.page.url().replace(/\/$/, '');
        if (current !== target) {
            await this.goto(subPath);
        }
    }

    // Click the confirm button while (a) waiting for the matching REST/navigation
    // response and (b) auto-accepting any native dialog that may fire. Mirrors
    // basePage.clickAndAcceptAndWaitForResponse(subUrl, selector).
    private async clickAndAcceptAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        this.page.once('dialog', dialog => {
            void dialog.accept();
        });
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
    }

    // ---- module toggle (admin enables/disables the ShipStation integration) --

    // enable ShipStation module: the vendor Settings menu now exposes a
    // ShipStation sub-menu.
    async enableShipStationModule(): Promise<void> {
        // vendor dashboard settings menu
        await this.goto(subUrls.dashboard);
        await this.page.locator(shipStationSelectors.menus.settings).hover();
        await expect(this.page.locator(shipStationSelectors.menus.shipStation)).toBeVisible();
    }

    // disable ShipStation module: the ShipStation sub-menu and the settings page
    // content are both gone.
    async disableShipStationModule(): Promise<void> {
        // vendor dashboard settings menu
        await this.goto(subUrls.dashboard);
        await this.page.locator(shipStationSelectors.menus.settings).hover();
        await expect(this.page.locator(shipStationSelectors.menus.shipStation)).toBeHidden();

        // vendor dashboard settings menu page
        await this.goto(subUrls.settingsShipStation);
        await expect(this.page.locator(shipStationSelectors.settings.shipStationSettingsDiv)).toBeHidden();
    }

    // ---- vendor credential generate / revoke --------------------------------

    // generate shipStation credentials
    async generateShipStationCredentials(): Promise<void> {
        const s = shipStationSelectors.settings;
        await this.goIfNotThere(subUrls.settingsShipStation);
        await this.page.locator(s.generateCredentials).click();
        await this.clickAndAcceptAndWaitForResponse(subUrls.settingsShipStation, s.confirmGeneration);

        await expect(this.page.locator(s.revokeCredentials)).toBeVisible();
        for (const credentialSelector of Object.values(s.credentials)) {
            await expect(this.page.locator(credentialSelector)).toBeVisible();
        }
        await expect(this.page.locator(s.secretKeyHideWarning)).toBeVisible();
    }

    // revoke shipStation credentials
    async revokeShipStationCredentials(): Promise<void> {
        const s = shipStationSelectors.settings;
        await this.goIfNotThere(subUrls.settingsShipStation);

        await this.page.locator(s.revokeCredentials).click();
        await this.clickAndAcceptAndWaitForResponse(subUrls.apiShipStation, s.confirmRevoke);
        await expect(this.page.locator(s.revokeSuccessMessage)).toBeVisible();

        await expect(this.page.locator(s.generateCredentials)).toBeVisible();
        for (const credentialSelector of Object.values(s.credentials)) {
            await expect(this.page.locator(credentialSelector)).toBeHidden();
        }
    }
}
