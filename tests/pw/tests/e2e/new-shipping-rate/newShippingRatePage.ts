import { Locator, Page, APIResponse } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { REACT_ROOT, PHP_FATAL, hasNoPhpFatal } from '@utils/dataViews';

// ============================================
// SELECTORS — verified against the LIVE render of the Dokan React vendor
// dashboard per-instance shipping drill-in routes
// (localhost:9999, Dokan Pro, table-rate-shipping module active):
//
//   /dashboard/new/#/settings/shipping/:zoneID/table-rate/:instanceID
//   /dashboard/new/#/settings/shipping/:zoneID/distance-rate/:instanceID
//
// Rendering components (Pro module dokan-pro/modules/table-rate-shipping):
//   - table-settings/index.tsx     -> <TableRateShippingSettings/>
//   - table-settings/MethodSettings.tsx
//   - table-rates/index.tsx        -> #table-rates-shipping-table
//   - distance-settings/index.tsx  -> <DistanceRateShippingSettings/>
//   - distance-settings/DistanceMethodSettings.tsx
//   - index.tsx (route registration + dokan_shipping_edit_shipping_method action)
//
// SELECTOR DRIFT (fixed here): the brief expected the Method Title field to be
// `input[placeholder="Enter method title"]`. It is NOT — MethodSettings renders
// the field with `@getdokan/dokan-ui` <SimpleInput placeholder=... />, but
// SimpleInput's public props (SimpleInput.d.ts) do NOT include a top-level
// `placeholder`; a placeholder is only forwarded when passed via its `input`
// prop. The component passes it top-level, so the rendered <input> carries NO
// placeholder attribute and the brief's selector matches nothing (verified
// live: 0 matches). The stable anchor is the labelled grid row: each settings
// section is a `sm:grid` row whose <dt> holds an <h3>Method Title</h3> and whose
// <dd> holds the single <input> (MethodSettings.tsx:41-58,
// DistanceMethodSettings.tsx:47-58 — identical structure for both forms).
// Self-contained per house-style §1 (only @utils/* imports).
// ============================================
export const newShippingRateSelectors = {
    reactRoot: REACT_ROOT,

    // ---- Table-rate settings form (table-settings/index.tsx) ----
    // Root wrapper rendered only after the mount GET resolves (isLoading=false)
    // and the instance is found (isNotFound=false -> <NotFound/> otherwise).
    // (table-settings/index.tsx:104 `div.dokan-table-rate-shipping-settings-container`.)
    tableRateContainer: '.dokan-table-rate-shipping-settings-container',
    // Client-side rates table (table-rates/index.tsx:166 `id="table-rates-shipping-table"`).
    ratesTable: '#table-rates-shipping-table',
    // Save control: <Button className="dokan-btn" label="Save Changes" /> ->
    // renders a <button> with visible text "Save Changes"
    // (table-settings/index.tsx:134-139). Triggers the PUT settings oracle.
    saveChangesBtn: 'button:has-text("Save Changes")',

    // ---- Distance-rate settings form (distance-settings/index.tsx) ----
    // Outer wrapper ALWAYS renders once loaded — it contains EITHER the full
    // form OR the GMAP gate alert (distance-settings/index.tsx:109).
    distanceRateContainer: '.dokan-distance-rate-shipping-settings-container',
    // GMAP gate: full form renders only when `dokanTableRateShippingHelper
    // ?.map_api_key` (module.php:188 -> dokan_appearance.gmap_api_key) is
    // truthy; otherwise this alert renders instead
    // (distance-settings/index.tsx:146-156).
    gmapAlert: '.dokan-alert-danger[role="alert"]',
    gmapAlertText: /requires Google map API key/i,

    // ---- Shared ----
    // Method Title <input> — labelled-row anchor (see SELECTOR DRIFT note above).
    // Identical markup in both MethodSettings.tsx and DistanceMethodSettings.tsx.
    methodTitleInput:
        '//div[contains(@class,"sm:grid")][.//h3[normalize-space()="Method Title"]]//input',
    // 404 fallback: mount GET 404 -> <NotFound/> (table-settings/index.tsx:95-96).
    notFound: 'text=/page can.?t be found|not found|no permission/i',
    phpFatal: PHP_FATAL,
} as const;

// Version-agnostic settings PUT oracles (house-style §3 — never pin to /v1/).
// apiFetch PUTs settings on Save Changes:
//   table-settings/index.tsx:74-78  -> /dokan/v1/shipping/table-rate/settings/zone/{z}/instance/{i}
//   distance-settings/index.tsx:77-80 -> /dokan/v1/shipping/distance-rate/settings/zone/{z}/instance/{i}
const TABLE_RATE_SETTINGS_PUT_RE = /dokan\/v[0-9]+\/shipping\/table-rate\/settings\/zone\/\d+\/instance\/\d+/i;
const DISTANCE_RATE_SETTINGS_PUT_RE = /dokan\/v[0-9]+\/shipping\/distance-rate\/settings\/zone\/\d+\/instance\/\d+/i;

// ============================================
// PAGE OBJECT — new React per-instance shipping settings (Dokan 5.0.0+, Pro).
// Surfaces: the table-rate and distance-rate drill-in forms reached from
// #/settings/shipping/:zoneID by editing a dokan_table_rate_shipping /
// dokan_distance_rate_shipping method instance. Deep-linked directly here in
// tests via REST-seeded instance ids. Methods act + return; the spec asserts
// (house-style §3).
// ============================================
export class NewShippingRatePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- URL builders ----
    tableRateUrl(zoneId: string | number, instanceId: string | number): string {
        return toPath(`dashboard/new/#/settings/shipping/${zoneId}/table-rate/${instanceId}`);
    }

    distanceRateUrl(zoneId: string | number, instanceId: string | number): string {
        return toPath(`dashboard/new/#/settings/shipping/${zoneId}/distance-rate/${instanceId}`);
    }

    // ---- Locators ----
    get tableRateContainer(): Locator { return this.page.locator(newShippingRateSelectors.tableRateContainer).first(); }
    get ratesTable(): Locator { return this.page.locator(newShippingRateSelectors.ratesTable).first(); }
    get saveChangesButton(): Locator { return this.page.locator(newShippingRateSelectors.saveChangesBtn).first(); }
    get distanceRateContainer(): Locator { return this.page.locator(newShippingRateSelectors.distanceRateContainer).first(); }
    get gmapAlert(): Locator { return this.page.locator(newShippingRateSelectors.gmapAlert).first(); }
    get methodTitleInput(): Locator { return this.page.locator(newShippingRateSelectors.methodTitleInput).first(); }
    get notFound(): Locator { return this.page.locator(newShippingRateSelectors.notFound).first(); }

    // ---- Readiness (house-style §5) ----
    async waitForReactReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newShippingRateSelectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
    }

    /** Ready when the SPA root is up AND the table-rate form container OR the
     *  NotFound fallback is present. While the mount GET is in flight the route
     *  paints <SettingsSkeleton/> (no container), so waiting for the container
     *  proves the fetch resolved — poll at 250ms up to ~20s. */
    async waitForTableRateReady(timeoutMs = 30000): Promise<void> {
        await this.waitForReactReady(timeoutMs);
        const start = Date.now();
        while (Date.now() - start < 20000) {
            if (await this.tableRateContainer.isVisible().catch(() => false)) return;
            if (await this.notFound.isVisible().catch(() => false)) return;
            await this.page.waitForTimeout(250);
        }
    }

    /** Ready when the SPA root is up AND the distance-rate outer container is
     *  present. That wrapper renders regardless of the GMAP gate — it contains
     *  EITHER the full form OR the requires-API-key alert — so it is the single
     *  settled signal for both branches. */
    async waitForDistanceRateReady(timeoutMs = 30000): Promise<void> {
        await this.waitForReactReady(timeoutMs);
        const start = Date.now();
        while (Date.now() - start < 20000) {
            if (await this.distanceRateContainer.isVisible().catch(() => false)) return;
            if (await this.notFound.isVisible().catch(() => false)) return;
            await this.page.waitForTimeout(250);
        }
    }

    // ---- Navigation ----
    async gotoTableRate(zoneId: string | number, instanceId: string | number): Promise<void> {
        await this.page.goto(this.tableRateUrl(zoneId, instanceId));
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForTableRateReady();
    }

    async gotoDistanceRate(zoneId: string | number, instanceId: string | number): Promise<void> {
        await this.page.goto(this.distanceRateUrl(zoneId, instanceId));
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForDistanceRateReady();
    }

    async reloadTableRate(): Promise<void> {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.waitForTableRateReady();
    }

    async reloadDistanceRate(): Promise<void> {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.waitForDistanceRateReady();
    }

    // ---- Actions ----
    /** Read the current Method Title field value (bound to settings.title,
     *  populated by the mount GET). Used for post-reload read-back. */
    async getMethodTitle(): Promise<string> {
        return await this.methodTitleInput.inputValue();
    }

    /** Overwrite the Method Title field (controlled input -> settings.title). */
    async setMethodTitle(value: string): Promise<void> {
        await this.methodTitleInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.methodTitleInput.fill(value);
    }

    /** Click "Save Changes" on the table-rate form, paired with the version-
     *  agnostic settings PUT (§3). Returns the PUT APIResponse (or undefined if
     *  none fired) so the spec can assert ok() — the primary persistence oracle. */
    async saveTableRateSettings(): Promise<APIResponse | undefined> {
        const [resp] = await Promise.all([
            this.page
                .waitForResponse(r => TABLE_RATE_SETTINGS_PUT_RE.test(r.url()) && ['PUT', 'POST'].includes(r.request().method()), { timeout: 15000 })
                .catch(() => undefined),
            this.saveChangesButton.click(),
        ]);
        return resp;
    }

    /** Click "Save Changes" on the distance-rate form, paired with its version-
     *  agnostic settings PUT (§3). Returns the PUT APIResponse (or undefined). */
    async saveDistanceRateSettings(): Promise<APIResponse | undefined> {
        const [resp] = await Promise.all([
            this.page
                .waitForResponse(r => DISTANCE_RATE_SETTINGS_PUT_RE.test(r.url()) && ['PUT', 'POST'].includes(r.request().method()), { timeout: 15000 })
                .catch(() => undefined),
            this.saveChangesButton.click(),
        ]);
        return resp;
    }

    // ---- Oracles ----
    async hasNoPhpFatal(): Promise<boolean> {
        return hasNoPhpFatal(this.page);
    }
}
