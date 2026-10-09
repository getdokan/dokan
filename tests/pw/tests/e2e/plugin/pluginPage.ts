import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, helpers, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

// ============================================================================
// Plugin activate / deactivate (WP-admin Plugins screen) — ported from the
// pre-refactor tests/pw/pages/pluginPage.ts into the current self-contained
// architecture.
//
// data / payloads / ApiUtils are re-exported REAL from @utils so the spec's
// beforeAll/afterAll drive the real wp/v2/plugins REST API (getSinglePlugin,
// updatePlugin) while the PluginPage methods drive the actual WP-admin UI.
// ============================================================================

// Re-export the REAL test data + payloads used across the spec (import contract).
export { data };
export { payloads } from '@utils/payloads';

/**
 * Null-tolerant ApiUtils wrapper (mirrors vendorReturnRequestPage / store-supports).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context
 * and swap it in before the first real REST call. getSinglePlugin routes
 * through `get`, updatePlugin through `put`, and `dispose` tears the context
 * down — so those three are the override surface.
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

    override async get(...args: Parameters<RealApiUtils['get']>): ReturnType<RealApiUtils['get']> {
        await this.ready();
        return super.get(...args);
    }

    override async put(...args: Parameters<RealApiUtils['put']>): ReturnType<RealApiUtils['put']> {
        await this.ready();
        return super.put(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ============================================================================
// SELECTORS (recovered from pre-refactor selector.admin.plugins)
// ============================================================================
const pluginsSelectors = {
    installedPlugins: '//a[text()="Installed Plugins"]',
    plugin: (pluginSlug: string) => `//tr[@data-slug='${pluginSlug}']`,
    activatePlugin: (plugin: string) => `a#activate-${plugin}`,
    deactivatePlugin: (plugin: string) => `a#deactivate-${plugin}`,

    // WeDevs deactivation-feedback modal (shown for Dokan plugins).
    deactivateReason: {
        deactivateReasonModal: 'div.wd-dr-modal.modal-active',
        reason: (reasonNumber: number) => `//div[contains(@class, 'wd-dr-modal modal-active')]//ul[@class="wd-de-reasons"]//li[${reasonNumber}]`,
        reasonInput: 'div.wd-dr-modal.modal-active div.wd-dr-modal-reason-input textarea',
        skipAndDeactivate: 'div.wd-dr-modal.modal-active div.wd-dr-modal-footer a.dont-bother-me',
        cancel: 'div.wd-dr-modal.modal-active div.wd-dr-modal-footer button.wd-dr-cancel-modal',
        submitAndDeactivate: 'div.wd-dr-modal.modal-active div.wd-dr-modal-footer button.wd-dr-submit-modal',
    },
} as const;

// The WP plugins list-table action-link id is `activate-<id>` / `deactivate-<id>` where
// <id> = plugin `data-slug` (falls back to sanitize_title(Plugin Name)). Dokan Lite's
// Plugin Name is "Dokan" and its wp.org slug is "dokan", so its links are
// `activate-dokan` / `deactivate-dokan` — NOT `-dokan-lite`. Dokan Pro's Name is
// "Dokan Pro" → `-dokan-pro` (already matches). Map the logical name to the real id-attr.
const linkIdAttr: Record<string, string> = { 'dokan-lite': 'dokan' };
const resolveLinkId = (plugin: string): string => linkIdAttr[plugin] ?? plugin;

export class PluginPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Navigation ----
    async goToPlugins(): Promise<void> {
        await this.page.goto(toPath(data.subUrls.backend.plugins), { waitUntil: 'domcontentloaded' });
    }

    // Click an action link that triggers a WP admin GET (302 redirect), accepting
    // any native confirm dialog and waiting for the redirect + load state.
    // Raw port of basePage.clickAndAcceptAndWaitForResponseAndLoadState.
    private async clickAndAcceptAndWaitForResponse(subUrl: string, selector: string, code = 302): Promise<void> {
        // page.once auto-dismisses a single native confirm (mirrors acceptAlert).
        this.page.once('dialog', dialog => {
            void dialog.accept();
        });
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.waitForLoadState('domcontentloaded'),
            this.page.locator(selector).click(),
        ]);
    }

    // ---- Activate ----
    async activatePlugin(plugin: string): Promise<void> {
        const id = resolveLinkId(plugin);
        await this.goToPlugins();
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.backend.activatePlugin, pluginsSelectors.activatePlugin(id), 302);
        await expect(this.page.locator(pluginsSelectors.deactivatePlugin(id))).toBeVisible();
    }

    // ---- Deactivate (plugins WITHOUT a deactivation popup) ----
    async deactivatePlugin(plugin: string): Promise<void> {
        const id = resolveLinkId(plugin);
        await this.goToPlugins();
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.backend.deactivatePlugin, pluginsSelectors.deactivatePlugin(id), 302);
        await expect(this.page.locator(pluginsSelectors.activatePlugin(id))).toBeVisible();
    }

    // ---- Deactivate Dokan plugin (deactivation-feedback modal) ----
    async deactivateDokanPlugin(plugin: string, submitReason: boolean, reason: string = 'test deactivate reason'): Promise<void> {
        const id = resolveLinkId(plugin);
        await this.goToPlugins();
        // First click is intercepted by JS to open the feedback modal (no navigation).
        await this.page.locator(pluginsSelectors.deactivatePlugin(id)).click();
        // Wait for the WeDevs feedback modal to actually open before interacting; if the
        // JS handler hadn't bound and the click navigated, this fails loudly (not silently).
        await expect(this.page.locator(pluginsSelectors.deactivateReason.deactivateReasonModal)).toBeVisible();
        if (submitReason) {
            await this.page.locator(pluginsSelectors.deactivateReason.reason(helpers.getRandomNumber(1, 7))).click();
            await this.page.locator(pluginsSelectors.deactivateReason.reasonInput).fill(reason);
            await this.clickAndAcceptAndWaitForResponse(data.subUrls.backend.deactivatePlugin, pluginsSelectors.deactivateReason.submitAndDeactivate, 302);
        } else {
            await this.clickAndAcceptAndWaitForResponse(data.subUrls.backend.deactivatePlugin, pluginsSelectors.deactivateReason.skipAndDeactivate, 302);
        }
        await expect(this.page.locator(pluginsSelectors.activatePlugin(id))).toBeVisible();
    }
}
