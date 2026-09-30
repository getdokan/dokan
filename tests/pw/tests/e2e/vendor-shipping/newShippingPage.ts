import { Locator, Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// The seeded fixture has one "US" shipping zone (no methods). We add throwaway
// methods to it and clean up so the seeded zone keeps working for other suites.
export const newShippingData = {
    seededZoneName: 'US',
    seededZoneRegion: 'United States (US)',
    methods: {
        flatRate: 'Flat rate',
        freeShipping: 'Free shipping',
        localPickup: 'Local pickup',
    },
    // A recognisable cost so the edit assertion can match the persisted value.
    editedCost: '12.50',
} as const;

// ============================================
// SELECTORS — verified against the live /dashboard/new/#/settings/shipping
// render (tmp-explore/shipping.{json,html}) and the Pro React source under
// dokan-pro/src/features/shipping/*. This is a DataViews zones list (no search
// box: ZoneList renders <DataViews search={false} />). Self-contained per
// house-style §1.
// ============================================
export const newShippingSelectors = {
    reactRoot: '#dokan-vendor-dashboard-root',
    container: '.dokan-shipping-zone-list-container',
    heading: 'text=/^Shipping$/',
    policyButton: 'button:has-text("Click here to add Shipping Policies")',

    // Zones DataViews table.
    table: 'table',
    dataRow: 'table tbody tr',
    // Zone Name cell renders a DokanLink: <a class="!dokan-link cursor-pointer">.
    zoneNameLink: (name: string) =>
        `//tbody//tr//a[contains(@class,"dokan-link")][.//span[normalize-space()="${name}"]]`,
    // 3-dot per-row actions button lives inside .dataviews-item-actions in tbody.
    rowActionsBtn: "//tbody//tr//button[@aria-label='Actions']",
    actionMenuItem: (label: string) => `//*[@role='menuitem'][normalize-space()='${label}']`,

    // Single zone edit view (#/settings/shipping/:zoneID).
    zoneNameLabel: 'text=/Zone Name/i',
    shippingMethodsHeading: 'text=/Shipping Methods/i',
    addMethodButton: 'button:has-text("Add Shipping Method")',

    // Add / Edit method modal (WP Modal -> role="dialog", DokanModal markup).
    dialog: '[role="dialog"]',
    addMethodDialogTitle: 'text=/Add New Shipping Method/i',
    editMethodDialogTitle: 'text=/Edit Shipping Method/i',
    // react-select inside the modal (classNamePrefix defaults to 'react-select').
    selectControl: '.react-select__control',
    selectInput: 'input.react-select__input',
    selectOption: '.react-select__option',
    addMethodConfirm: 'button:has-text("Add Method")',
    saveMethodConfirm: 'button:has-text("Save Method")',
    methodTitleInput: 'input[type="text"]',
    methodCostInput: 'input[placeholder="0.00"]',
    dialogClose: '[role="dialog"] button[aria-label="Close"]',

    // Methods DataViews table (inside the zone edit view).
    methodRow: 'table tbody tr',

    // Shipping Policy view (#/settings/shipping/settings).
    policyHeading: 'text=/Shipping Policy/i',
    processingTimeHeading: 'text=/Processing Time/i',
    refundPolicyHeading: 'text=/Refund Policy/i',

    // Toast feedback.
    toast: 'div[role="status"]',
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    notFound: 'text=/page can.?t be found|not found|no permission/i',
} as const;

// ============================================
// PAGE OBJECT — new React Shipping settings (Dokan 5.0.0+, Pro)
// Surface: /dashboard/new/#/settings/shipping  (DataViews zones list).
// ============================================
export class NewShippingPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/settings/shipping');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get heading(): Locator { return this.page.locator(newShippingSelectors.heading).first(); }
    get policyButton(): Locator { return this.page.locator(newShippingSelectors.policyButton).first(); }
    get table(): Locator { return this.page.locator(newShippingSelectors.table).first(); }
    get addMethodButton(): Locator { return this.page.locator(newShippingSelectors.addMethodButton).first(); }
    get shippingMethodsHeading(): Locator { return this.page.locator(newShippingSelectors.shippingMethodsHeading).first(); }
    get dialog(): Locator { return this.page.locator(newShippingSelectors.dialog).first(); }
    get toast(): Locator { return this.page.locator(newShippingSelectors.toast); }

    seededZoneRow(name = newShippingData.seededZoneName): Locator {
        return this.page.locator(newShippingSelectors.zoneNameLink(name)).first();
    }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForListReady();
    }

    async waitForReactReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newShippingSelectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
    }

    /** List is ready when the react root is visible AND a zone row OR an empty
     *  banner is present — poll up to ~15s (house-style §5). */
    async waitForListReady(timeoutMs = 30000): Promise<void> {
        await this.waitForReactReady(timeoutMs);
        const start = Date.now();
        while (Date.now() - start < 15000) {
            const rows = await this.page.locator(newShippingSelectors.dataRow).count();
            if (rows > 0) return;
            const empty = await this.page.locator('text=/no data found|no items|nothing to show/i').count();
            if (empty > 0) return;
            await this.page.waitForTimeout(250);
        }
    }

    async reload(): Promise<void> {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.waitForListReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page.locator(newShippingSelectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }

    async getRowCount(): Promise<number> {
        return await this.page.locator(newShippingSelectors.dataRow).count();
    }

    // ---- Zone navigation ----
    /** Open the seeded zone by clicking its Zone Name link; lands on the zone
     *  edit view (#/settings/shipping/:zoneID). */
    async openZoneByName(name = newShippingData.seededZoneName): Promise<void> {
        const link = this.seededZoneRow(name);
        await link.waitFor({ state: 'visible', timeout: 15000 });
        await link.click();
        await this.waitForZoneEditReady();
    }

    /** Open a zone via the 3-dot row action -> Edit (alternative entry point). */
    async openZoneViaRowAction(index = 0): Promise<void> {
        const buttons = this.page.locator(newShippingSelectors.rowActionsBtn);
        await buttons.nth(index).waitFor({ state: 'visible', timeout: 10000 });
        await buttons.nth(index).click();
        const edit = this.page.locator(newShippingSelectors.actionMenuItem('Edit')).first();
        await edit.waitFor({ state: 'visible', timeout: 5000 });
        await edit.click();
        await this.waitForZoneEditReady();
    }

    async waitForZoneEditReady(timeoutMs = 30000): Promise<void> {
        await this.waitForReactReady(timeoutMs);
        // URL hash carries the numeric zone id.
        await this.page.waitForURL(/#\/settings\/shipping\/\d+/, { timeout: timeoutMs }).catch(() => undefined);
        await this.shippingMethodsHeading.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.addMethodButton.waitFor({ state: 'visible', timeout: timeoutMs });
    }

    isOnZoneEditView(): boolean {
        return /#\/settings\/shipping\/\d+/.test(this.page.url());
    }

    // ---- Shipping methods ----
    /** Count of method rows in the zone edit DataViews table. */
    async getMethodRowCount(): Promise<number> {
        return await this.page.locator(newShippingSelectors.methodRow).count();
    }

    /** Locate a method row by its visible Method Title.
     *  The methods DataViews `title` column renders `item.title`, which the REST
     *  layer fills from the method's `settings.title` (see
     *  dokan-pro ShippingZone::get_shipping_methods ->
     *  `apply_filters('dokan_shipping_method_translatable_title', $settings['title'], …)`).
     *  So the row label IS the custom Method Title (e.g. an edited title shows up
     *  here). The title is escaped before building the RegExp so values that
     *  contain regex metacharacters — like the parentheses in
     *  "Flat rate (PW edited)" — match literally instead of as a capture group. */
    methodRowByTitle(title: string): Locator {
        return this.page
            .locator(newShippingSelectors.methodRow)
            .filter({ hasText: new RegExp(escapeRegExp(title), 'i') })
            .first();
    }

    /** Loose (substring) presence check. ONLY safe for asserting that a method
     *  is present (`true`) by a UNIQUE title. NEVER use it to assert a method is
     *  gone (`false`) by a generic label: the shared US zone keeps leftover
     *  same-type rows from prior runs that this loose matcher would still see,
     *  so a removal assertion could never hold. For any presence/absence check
     *  on a real per-run title use `isMethodListedExact`. */
    async isMethodListed(title: string): Promise<boolean> {
        return await this.methodRowByTitle(title).isVisible({ timeout: 8000 }).catch(() => false);
    }

    /** All method rows whose title cell text is EXACTLY the given value
     *  (case-insensitive, whitespace-normalised). The title field renders the
     *  plain `item.title` string in the row's primary <td>. Returns the unfiltered
     *  set so callers can pick `.first()` / `.last()` deliberately. */
    methodRowsByExactTitle(title: string): Locator {
        const esc = title.replace(/"/g, '&quot;');
        return this.page.locator(
            `//tbody//tr[.//td[normalize-space(translate(.,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"))="${esc.toLowerCase()}"]]`
        );
    }

    /** A single method row matched EXACTLY by title (first occurrence). Used to
     *  pick a row by its UNIQUE title (one-of-a-kind, so first == only) without
     *  accidentally matching a leftover renamed row that merely *contains* that
     *  substring (e.g. "Flat rate (PW edited …)"). */
    methodRowByExactTitle(title: string): Locator {
        return this.methodRowsByExactTitle(title).first();
    }

    /** Presence check scoped to an EXACT title-cell match. Use for UNIQUE
     *  per-run titles so a leftover generic same-type row never makes a removal
     *  ("gone") assertion read as still-present (or a presence assertion pass
     *  on the wrong row). */
    async isMethodListedExact(title: string): Promise<boolean> {
        return await this.methodRowByExactTitle(title).isVisible({ timeout: 8000 }).catch(() => false);
    }

    /** Open the "Add New Shipping Method" modal, pick a method, confirm. Waits
     *  for the success toast / method row to appear. */
    async addShippingMethod(methodLabel: string): Promise<void> {
        await this.addMethodButton.click();
        await this.dialog.waitFor({ state: 'visible', timeout: 10000 });
        await this.page.locator(newShippingSelectors.addMethodDialogTitle).first().waitFor({ state: 'visible', timeout: 10000 });

        // react-select: click the control, then choose the option by exact label.
        const control = this.dialog.locator(newShippingSelectors.selectControl).first();
        await control.click();
        const option = this.page
            .locator(newShippingSelectors.selectOption)
            .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(methodLabel)}\\s*$`, 'i') })
            .first();
        await option.waitFor({ state: 'visible', timeout: 8000 });
        await option.click();

        const confirm = this.dialog.locator(newShippingSelectors.addMethodConfirm).first();
        await expect(confirm).toBeEnabled({ timeout: 5000 });
        await Promise.all([
            this.page.waitForResponse(r => /dokan\/v1\/shipping\/\d+\/methods/i.test(r.url()) && r.request().method() === 'POST', { timeout: 15000 }).catch(() => undefined),
            confirm.click(),
        ]);
        // Modal closes and the method row renders.
        await this.dialog.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);
        await expect(this.methodRowByTitle(methodLabel)).toBeVisible({ timeout: 10000 });
    }

    /** Open the row-action Edit modal for a method, change its title (and cost
     *  when present), save. Returns the new title.
     *
     *  `opts.pickLastExact` resolves the row as the LAST exact-title match
     *  instead of the first — required when renaming a just-added method whose
     *  default type title (e.g. "Flat Rate") collides with leftover same-type
     *  rows in the polluted shared zone. The newest method is rendered last. */
    async editShippingMethod(currentTitle: string, newTitle: string, cost?: string, opts: { pickLastExact?: boolean } = {}): Promise<string> {
        // Prefer an EXACT title-cell match so we open the intended row even when
        // a leftover row's title merely contains `currentTitle` as a substring;
        // fall back to the loose matcher if no exact row exists (e.g. the title
        // was already customised).
        const exactRows = this.methodRowsByExactTitle(currentTitle);
        const exactCount = await exactRows.count();
        let row: Locator;
        if (exactCount > 0) {
            row = opts.pickLastExact ? exactRows.last() : exactRows.first();
        } else {
            row = this.methodRowByTitle(currentTitle);
        }
        await row.waitFor({ state: 'visible', timeout: 10000 });
        // Click the row's own Actions button.
        const actions = row.locator("//button[@aria-label='Actions']").first();
        await actions.click();
        const edit = this.page.locator(newShippingSelectors.actionMenuItem('Edit')).first();
        await edit.waitFor({ state: 'visible', timeout: 5000 });
        await edit.click();

        await this.dialog.waitFor({ state: 'visible', timeout: 10000 });
        await this.page.locator(newShippingSelectors.editMethodDialogTitle).first().waitFor({ state: 'visible', timeout: 10000 });

        const titleInput = this.dialog.locator(newShippingSelectors.methodTitleInput).first();
        await titleInput.waitFor({ state: 'visible', timeout: 8000 });
        await titleInput.fill(newTitle);

        if (cost !== undefined) {
            const costInput = this.dialog.locator(newShippingSelectors.methodCostInput).first();
            if (await costInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await costInput.fill(cost);
            }
        }

        const save = this.dialog.locator(newShippingSelectors.saveMethodConfirm).first();
        await Promise.all([
            this.page.waitForResponse(r => /dokan\/v1\/shipping\/\d+\/methods\/\d+/i.test(r.url()) && r.request().method() === 'PUT', { timeout: 15000 }).catch(() => undefined),
            save.click(),
        ]);
        await this.dialog.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);
        // Assert by EXACT title — `newTitle` is a one-of-a-kind per-run value, so
        // this confirms OUR renamed row rendered (not a leftover that merely
        // contains the text).
        await expect(this.methodRowByExactTitle(newTitle)).toBeVisible({ timeout: 10000 });
        return newTitle;
    }

    /** Add a method of the given type, then immediately rename it to a unique
     *  Method Title and (for non–free-shipping) set a recognisable cost. Returns
     *  the unique title so callers can scope all later assertions/cleanup to
     *  exactly this method.
     *
     *  Why: every method added via the modal gets the same default title (the
     *  method *type* label, e.g. "Flat Rate"), so multiple flat-rate methods in
     *  the same zone render as indistinguishable rows. Tests that assert a
     *  method persists / is removed must target a UNIQUE row, otherwise a
     *  leftover same-type row keeps a generic `/Flat rate/i` locator visible and
     *  the removal assertion can never hold. Renaming guarantees a one-of-a-kind
     *  row label. */
    async addMethodWithUniqueTitle(methodLabel: string, uniqueTitle: string, cost?: string): Promise<string> {
        // Count existing same-type rows first so we can wait until the table has
        // re-rendered with OUR new row before renaming it. The shared US zone is
        // polluted with leftover same-type rows; without this wait, `.last()`
        // could resolve to a leftover during the React re-render window.
        const before = await this.methodRowsByExactTitle(methodLabel).count();
        await this.addShippingMethod(methodLabel);
        await expect
            .poll(async () => this.methodRowsByExactTitle(methodLabel).count(), { timeout: 10000 })
            .toBeGreaterThan(before);
        // The freshly added method carries its default (type) title and is the
        // LAST same-type row (newest instance_id, rendered last). Rename THAT
        // row — never a leftover same-type row from a prior run.
        await this.editShippingMethod(methodLabel, uniqueTitle, cost, { pickLastExact: true });
        return uniqueTitle;
    }

    /** Delete a method via its row-action Delete. (DokanModal delete action in
     *  ShippingMethods fires the DELETE immediately — no confirm dialog.)
     *
     *  `title` MUST be a UNIQUE per-run Method Title (e.g. one produced by
     *  `addMethodWithUniqueTitle`). The shared live US zone is polluted with
     *  leftover generic same-type rows ("Flat Rate", "Free Shipping", …) from
     *  prior runs, so the row is targeted — and its removal asserted — by EXACT
     *  title-cell match (`methodRowByExactTitle`). A loose substring/`hasText`
     *  matcher on a generic label would keep matching a pre-existing row and the
     *  removal assertion could never hold. */
    async deleteShippingMethod(title: string): Promise<void> {
        const row = this.methodRowByExactTitle(title);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const actions = row.locator("//button[@aria-label='Actions']").first();
        await actions.click();
        const del = this.page.locator(newShippingSelectors.actionMenuItem('Delete')).first();
        await del.waitFor({ state: 'visible', timeout: 5000 });
        await Promise.all([
            this.page.waitForResponse(r => /dokan\/v1\/shipping\/\d+\/methods\/\d+/i.test(r.url()) && r.request().method() === 'DELETE', { timeout: 15000 }).catch(() => undefined),
            del.click(),
        ]);
        // Confirm THIS exact row is gone (toast then re-render). Scoped to the
        // unique title so leftover generic same-type rows don't keep it visible.
        await expect(this.methodRowByExactTitle(title)).toBeHidden({ timeout: 10000 });
    }

    // ---- Shipping policies ----
    /** Click "Click here to add Shipping Policies" -> #/settings/shipping/settings. */
    async openShippingPolicies(): Promise<void> {
        await this.policyButton.waitFor({ state: 'visible', timeout: 15000 });
        await this.policyButton.click();
        await this.page.waitForURL(/#\/settings\/shipping\/settings/, { timeout: 30000 }).catch(() => undefined);
        await this.waitForReactReady();
        await this.page.locator(newShippingSelectors.processingTimeHeading).first().waitFor({ state: 'visible', timeout: 30000 });
    }

    isOnPolicyView(): boolean {
        return /#\/settings\/shipping\/settings/.test(this.page.url());
    }

    get processingTimeHeading(): Locator { return this.page.locator(newShippingSelectors.processingTimeHeading).first(); }
    get refundPolicyHeading(): Locator { return this.page.locator(newShippingSelectors.refundPolicyHeading).first(); }
}

// Local helper (folders never import each other; duplication is fine).
function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
