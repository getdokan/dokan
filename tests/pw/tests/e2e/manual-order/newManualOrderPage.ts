import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath, helpers } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// `p1_v1 (simple)` is the pre-seeded fixture product (id 19). The manual-order
// product search renders it as `p1_v1 (simple) - $<price> (SKU: )`, so we match
// on the product-name prefix only.
export const newManualOrderData = {
    product: { name: 'p1_v1 (simple)', search: 'p1_v1' },
    status: 'Completed',
    note: 'Manual order created by Playwright (React UI).',
    customerSearch: 'customer1',
} as const;

// ============================================
// SELECTORS — verified against the live /dashboard/new/#/orders/new render
// (vendor1, manual-order capability enabled). The React form is the manual
// order editor: it auto-creates a draft order on mount and renders an edit form.
// react-select wrappers use emotion class names (`css-*-control`), so we scope
// each select by its stable `.form-field.order-*` wrapper.
// ============================================
export const newManualOrderSelectors = {
    reactRoot: '#dokan-vendor-dashboard-root',
    heading: 'text=/Add New Order/i',
    // The React router gates the route by the `dokan_manage_manual_order` cap.
    // When the cap is absent the surface renders one of two "unreachable" views:
    //   • 404 NotFound — "Sorry, the page can't be found" / "moved, deleted …"
    //   • 403 Forbidden — "Permission Denied" / "you don't have permission …"
    // Match either heading/message so the gate is detected robustly.
    notFound: "text=/can.t be found|page can’t be found|moved, deleted|permission denied|don.t have permission/i",

    // General section field wrappers.
    statusWrapper: '.form-field.order-statuses',
    customerWrapper: '.form-field.order-customer',
    createdDateWrapper: '.form-field.order-created-date',

    // react-select internals (relative to a wrapper).
    rsControl: '[class*="-control"]',
    rsInput: 'input[role="combobox"]',
    rsOption: '[class*="-option"]',
    rsSingleValue: '[class*="singleValue"]',

    // Order items.
    addItemsButton: 'button:has-text("Add item(s)")',
    addProductButton: 'button:has-text("Add product(s)")',
    addFeeButton: 'button:has-text("Add fee")',
    cancelItemsButton: 'button:has-text("Cancel")',
    saveItemsButton: 'button:has-text("Save")',

    // "Add Products to Order" modal. The DokanModal renders a WordPress
    // `<Modal>` → `.components-modal__frame[role="dialog"]`. The bare
    // `[role="dialog"]` alternative matches the dialog WRAPPER div (not an
    // input), so the search-input selector must scope to the modal FRAME and
    // resolve to the react-select combobox INPUT only.
    productModal: '.components-modal__frame',
    productModalHeading: 'text=/Add Products to Order/i',
    // The react-select (SearchableSelect from @getdokan/dokan-ui) input inside
    // the product modal. Scope to the frame, then the combobox input.
    productModalSearchInput: '.components-modal__frame input[role="combobox"]',
    productConfirmButton: 'button:has-text("Add Products")',

    // Order notes.
    addNoteTextarea: '#add_order_note, textarea[name="order_note"]',
    addNoteButton: 'button:has-text("Add note")',

    // Persistent Save button for the order form.
    saveButton: 'button:has-text("Save")',
    successNotice: 'div[role="status"]',
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',

    // Sidebar nav entry (present only when the capability is granted).
    navAddNewOrder: 'a:has-text("Add New Order")',
} as const;

// ============================================
// wp-cli toggles for the gating setting + capability.
// The React route `orders/new` is registered with
// `capabilities: ['dokan_manage_manual_order']`, and the nav entry requires the
// same permission. The admin setting *Selling → Allow Vendors to Create Orders*
// (`dokan_selling['allow_vendor_create_manual_order']`) drives it: when saved
// 'on', `dokan_after_saving_settings` adds `dokan_manage_manual_order` to the
// seller/administrator/shop_manager roles. We reproduce that exact effect here
// (option + role caps) so the gate is deterministic in either direction.
// ============================================
const MANUAL_ORDER_CAP = 'dokan_manage_manual_order';

function buildSettingEval(enabled: boolean): string {
    const value = enabled ? 'on' : 'off';
    const capMethod = enabled ? 'add_cap' : 'remove_cap';
    // Single-line PHP, double-quoted for `wp eval`, inner quotes escaped so the
    // string survives both the `npm run wp-env run tests-cli --` wrapper and a
    // direct `cd <site> && wp ...` shell.
    const php =
        `\\$o = get_option( \\"dokan_selling\\", array() ); ` +
        `if ( ! is_array( \\$o ) ) { \\$o = array(); } ` +
        `\\$o[\\"allow_vendor_create_manual_order\\"] = \\"${value}\\"; ` +
        `update_option( \\"dokan_selling\\", \\$o ); ` +
        `global \\$wp_roles; ` +
        `if ( class_exists( \\"WP_Roles\\" ) && ! isset( \\$wp_roles ) ) { \\$wp_roles = new WP_Roles(); } ` +
        `\\$wp_roles->${capMethod}( \\"seller\\", \\"${MANUAL_ORDER_CAP}\\" ); ` +
        `\\$wp_roles->${capMethod}( \\"administrator\\", \\"${MANUAL_ORDER_CAP}\\" ); ` +
        `\\$wp_roles->${capMethod}( \\"shop_manager\\", \\"${MANUAL_ORDER_CAP}\\" );`;
    return `wp eval "${php}"`;
}

// ============================================
// PAGE OBJECT — new React Manual Order form (Dokan 5.0.0+, Pro).
// Surface: /dashboard/new/#/orders/new. Self-contained per house style §1.
// ============================================
export class NewManualOrderPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/orders/new');
    readonly ordersUrl = toPath('dashboard/new/#/orders');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Admin gating (static; no page needed) ----
    /** Enable the "Allow Vendors to Create Orders" setting + grant the manual
     *  order capability (mirrors the admin settings save). */
    static async enableVendorOrderCreation(): Promise<void> {
        await helpers.exeCommandWpcli(buildSettingEval(true));
        // The role-cap change is written to the `wp_user_roles` option, but the
        // running web/PHP-FPM container caches user caps in the object cache.
        // The cap is read client-side from `/wp/v2/users/me`, so flush the cache
        // so the next REST request returns the updated capabilities.
        await helpers.exeCommandWpcli('wp cache flush');
    }

    /** Disable the setting + revoke the capability. */
    static async disableVendorOrderCreation(): Promise<void> {
        await helpers.exeCommandWpcli(buildSettingEval(false));
        // Symmetric with enable: flush so the revoked cap is reflected on the
        // next request (otherwise the gated route stays reachable from cache).
        await helpers.exeCommandWpcli('wp cache flush');
    }

    // ---- Locators ----
    get heading(): Locator { return this.page.locator(newManualOrderSelectors.heading).first(); }
    get notFound(): Locator { return this.page.locator(newManualOrderSelectors.notFound).first(); }
    get statusControl(): Locator { return this.page.locator(`${newManualOrderSelectors.statusWrapper} ${newManualOrderSelectors.rsControl}`).first(); }
    get customerInput(): Locator { return this.page.locator(`${newManualOrderSelectors.customerWrapper} ${newManualOrderSelectors.rsInput}`).first(); }
    get addItemsButton(): Locator { return this.page.locator(newManualOrderSelectors.addItemsButton).first(); }
    get addProductButton(): Locator { return this.page.locator(newManualOrderSelectors.addProductButton).first(); }
    get saveButton(): Locator { return this.page.locator(newManualOrderSelectors.saveButton).first(); }
    get successNotice(): Locator { return this.page.locator(newManualOrderSelectors.successNotice).first(); }
    get navAddNewOrder(): Locator { return this.page.locator(newManualOrderSelectors.navAddNewOrder); }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForRoot();
    }

    async gotoOrdersList(): Promise<void> {
        await this.page.goto(this.ordersUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForRoot();
    }

    async waitForRoot(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newManualOrderSelectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
    }

    /** Wait until the manual-order editor has finished mounting: the form
     *  auto-creates a draft order and then renders the "Add New Order" heading
     *  plus the General section. */
    async waitForFormReady(timeoutMs = 30000): Promise<void> {
        await this.waitForRoot(timeoutMs);
        await this.heading.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.page.locator(newManualOrderSelectors.statusWrapper).first().waitFor({ state: 'visible', timeout: timeoutMs });
    }

    /** True when the route is gated (renders the 404 not-found OR 403 forbidden
     *  view). The cap is fetched async from `/wp/v2/users/me`, then the router
     *  decides between the form and the gated view, so don't sample once: wait
     *  until EITHER the gated heading OR the form heading resolves, then report
     *  which won. Returns false only when the form (reachable route) rendered. */
    async isNotFound(): Promise<boolean> {
        await this.waitForRoot().catch(() => undefined);
        // Race the gated view against the form heading so this returns promptly
        // on both paths instead of always burning the full timeout.
        await Promise.race([
            this.notFound.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined),
            this.heading.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined),
        ]);
        return this.notFound.isVisible().catch(() => false);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page.locator(newManualOrderSelectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }

    // ---- Order status (react-select) ----
    async getOrderStatus(): Promise<string> {
        const single = this.page.locator(`${newManualOrderSelectors.statusWrapper} ${newManualOrderSelectors.rsSingleValue}`).first();
        return (await single.textContent().catch(() => ''))?.trim() ?? '';
    }

    async setOrderStatus(status: string): Promise<void> {
        await this.statusControl.scrollIntoViewIfNeeded().catch(() => undefined);
        await this.statusControl.click();
        const option = this.page
            .locator(newManualOrderSelectors.rsOption)
            .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(status)}\\s*$`, 'i') })
            .first();
        await option.waitFor({ state: 'visible', timeout: 6000 });
        await option.click();
    }

    /** Open the order-status dropdown and return the available option labels. */
    async getOrderStatusOptions(): Promise<string[]> {
        await this.statusControl.click();
        const options = this.page.locator(newManualOrderSelectors.rsOption);
        await options.first().waitFor({ state: 'visible', timeout: 6000 }).catch(() => undefined);
        const labels = await options.allTextContents();
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return labels.map(l => l.trim()).filter(Boolean);
    }

    // ---- Customer (async react-select; may be empty in some environments) ----
    /** Search the customer field and return the rendered option labels. */
    async searchCustomer(query: string): Promise<string[]> {
        await this.customerInput.click();
        await this.customerInput.fill(query);
        // Async loader; wait for the request + render to settle.
        await this.page.waitForTimeout(2500);
        const options = this.page.locator(newManualOrderSelectors.rsOption);
        const count = await options.count();
        if (count === 0) return [];
        return (await options.allTextContents()).map(l => l.trim()).filter(Boolean);
    }

    /** Try to select a customer by search term. Returns true if a match was
     *  chosen, false if the (async, possibly empty) list had no option. */
    async selectCustomer(query: string): Promise<boolean> {
        const labels = await this.searchCustomer(query);
        if (labels.length === 0) {
            await this.page.keyboard.press('Escape').catch(() => undefined);
            return false;
        }
        await this.page.locator(newManualOrderSelectors.rsOption).first().click();
        return true;
    }

    // ---- Order items ----
    /** Reveal the add-item action row ("Add product(s)" / "Add fee" / …). */
    async openAddItems(): Promise<void> {
        const btn = this.addItemsButton;
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
        await this.addProductButton.waitFor({ state: 'visible', timeout: 8000 });
    }

    /**
     * Add a product line: open the add-item row, open the "Add Products to
     * Order" modal, search + pick the product, confirm. Persists the line via
     * POST /dokan/v1/manual-orders/{id}.
     */
    async addProductLine(productSearch: string, productName: string): Promise<void> {
        await this.openAddItems();
        await this.addProductButton.click();
        const modal = this.page.locator(newManualOrderSelectors.productModal).first();
        await modal.waitFor({ state: 'visible', timeout: 8000 });
        await this.page.locator(newManualOrderSelectors.productModalHeading).first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);

        const search = this.page.locator(newManualOrderSelectors.productModalSearchInput).first();
        await search.waitFor({ state: 'visible', timeout: 8000 });
        await search.click();
        // ProductAddForm only fires the fetch when the term is >2 chars and
        // debounces 1000ms, so type the term and let the debounced request run.
        await search.fill(productSearch);
        const option = this.page
            .locator(newManualOrderSelectors.rsOption)
            .filter({ hasText: new RegExp(escapeRegExp(productName), 'i') })
            .first();
        await option.waitFor({ state: 'visible', timeout: 8000 });
        await option.click();

        const confirm = this.page.locator(`${newManualOrderSelectors.productModal} ${newManualOrderSelectors.productConfirmButton}`).first();
        await Promise.all([
            this.page.waitForResponse(r => /dokan\/v1\/manual-orders\/\d+/.test(r.url()) && r.request().method() !== 'GET', { timeout: 15000 }).catch(() => undefined),
            confirm.click(),
        ]);
        // Wait until the line item appears in the order.
        await this.lineItemLocator(productName).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    }

    lineItemLocator(productName: string): Locator {
        return this.page.locator(`text=/${escapeRegExp(productName.replace(/\s*\(simple\)\s*/i, ''))}/i`);
    }

    async lineItemCount(productName: string): Promise<number> {
        return this.lineItemLocator(productName).count();
    }

    /** Open the "Add Products to Order" modal and type a search term into the
     *  product picker (react-select combobox INPUT, scoped to the modal frame —
     *  never the dialog wrapper div). Waits for the debounced fetch to settle. */
    async searchProductInModal(productSearch: string): Promise<void> {
        await this.openAddItems();
        await this.addProductButton.click();
        const modal = this.page.locator(newManualOrderSelectors.productModal).first();
        await modal.waitFor({ state: 'visible', timeout: 8000 });
        const search = this.page.locator(newManualOrderSelectors.productModalSearchInput).first();
        await search.waitFor({ state: 'visible', timeout: 8000 });
        await search.click();
        await search.fill(productSearch);
        // 1000ms debounce + the dokan/v2/products request; give it room to settle.
        await this.page.waitForTimeout(2500);
    }

    /** Count of selectable product options currently rendered in the picker.
     *  (react-select renders the no-options message in a `*--no-options` notice,
     *  not a `*-option`, so a bogus search yields 0 here.) */
    async productOptionCount(): Promise<number> {
        return this.page.locator(newManualOrderSelectors.rsOption).count();
    }

    // ---- Order notes ----
    async addOrderNote(note: string): Promise<void> {
        const textarea = this.page.locator(newManualOrderSelectors.addNoteTextarea).first();
        if (!(await textarea.count())) return;
        await textarea.fill(note);
        await this.page.locator(newManualOrderSelectors.addNoteButton).first().click().catch(() => undefined);
    }

    // ---- Save ----
    /** Click the form's Save and wait for the persist request to resolve. */
    async save(): Promise<void> {
        const btn = this.saveButton;
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.waitFor({ state: 'visible', timeout: 8000 });
        await Promise.all([
            this.page.waitForResponse(r => /dokan\/v1\/manual-orders\/\d+/.test(r.url()) && r.request().method() !== 'GET', { timeout: 15000 }).catch(() => undefined),
            btn.click(),
        ]);
        await this.successNotice.waitFor({ state: 'visible', timeout: 6000 }).catch(() => undefined);
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
