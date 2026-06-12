import { Locator, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// Unique, recognisable coupon codes so list/search assertions can match the
// exact coupon a test created and the afterAll cleanup can delete them by
// prefix without touching the pre-seeded `c1_v1` fixture.
export const NEW_COUPON_PREFIX = 'pwnewui';

export const newCouponData = {
    prefix: NEW_COUPON_PREFIX,
    seededCode: 'c1_v1',
    uniqueCode: (suffix = '') => `${NEW_COUPON_PREFIX}_${suffix}${faker.string.nanoid(6)}`.toLowerCase(),
    percentage: () => ({
        code: `${NEW_COUPON_PREFIX}_pct_${faker.string.nanoid(6)}`.toLowerCase(),
        description: 'New UI percentage discount coupon (automated test).',
        discountType: 'percent' as const,
        amount: '15',
    }),
    fixedProduct: () => ({
        code: `${NEW_COUPON_PREFIX}_fixprod_${faker.string.nanoid(6)}`.toLowerCase(),
        description: 'New UI fixed product discount coupon (automated test).',
        discountType: 'fixed_product' as const,
        amount: '5',
        product: 'p1_v1',
    }),
} as const;

// Human-readable option labels in the Radix discount-type select. These come
// from `window.dokanCoupon.coupon_types` (verified live), NOT a native <select>.
export const DISCOUNT_TYPE_LABELS = {
    percent: 'Percentage discount',
    fixed_product: 'Fixed product discount',
    fixed_cart: 'Fixed cart discount',
} as const;

export type DiscountTypeKey = keyof typeof DISCOUNT_TYPE_LABELS;

// ============================================
// SELECTORS — verified against the live coupons render and the React source
// (dokan-pro/src/frontend/coupons/*). The list is a @wedevs/plugin-ui DataViews
// surface; the form uses stable ids per `formConfig.ts`.
// ============================================
export const newCouponsSelectors = {
    reactRoot: '#dokan-vendor-dashboard-root',
    couponDashboard: '#dokan-coupon-dashboard',
    addNewButton: 'button:has-text("Add New Coupon")',
    heading: 'h3:has-text("Coupons")',

    // ---- DataViews list ----
    dataViewsTable: 'table.dataviews-view-table, table',
    dataRow: 'table tbody tr',
    searchInput: 'input[placeholder="Search"]',
    tabMyCoupons: 'button[role="tab"]:has-text("My Coupons")',
    tabMarketplace: 'button[role="tab"]:has-text("Marketplace Coupons")',
    // Coupon code cell link (vendor tab) — navigates to /coupons/update/:id
    codeCellLink: 'table tbody tr td a',
    // 3-dot row actions button — in tbody only (header toolbar also has one).
    rowActionsBtn: "//tbody//tr//button[@aria-label='Actions']",
    actionMenuItem: (label: string) => `//*[@role='menuitem'][normalize-space()='${label}']`,
    emptyState: "text=/no data found|no items|no coupons|nothing to show/i",

    // ---- Create / edit form (#dokan-coupon-form) ----
    form: '#dokan-coupon-form',
    code: '#code',
    description: '#description',
    // Radix Select trigger (button), NOT a native <select>. Options render in a
    // portal mounted into `.dokan-layout`.
    discountTypeTrigger: '#discount_type',
    couponAmount: '#coupon_amount',
    emailRestrictions: '#email_restrictions',
    usageLimit: '#usage_limit',
    usageLimitPerUser: '#usage_limit_per_user',
    dateExpires: '#date_expires',
    minimumAmount: '#minimumAmount',
    excludeSaleItems: '#exclude_sale_items',
    showOnStore: '#show_on_store',
    freeShipping: '#free_shipping',
    // react-select (AsyncSearchableSelect / SearchableTaxonomy) inputs. The
    // editable combobox is `input#product` (react-select's `inputId={name}`);
    // `#product input` resolves to it (a sibling DIV also carries id=product, so
    // the input is a descendant of that wrapper). Verified live.
    productSelectInput: 'input#product[role="combobox"]',
    categoriesSelectInput: 'input#categories[role="combobox"]',
    // react-select default (no classNamePrefix) renders options with
    // `role="option"` and an emotion class `css-*-option` — NOT `__option`.
    // Verified live: match by role and filter by the option label text.
    reactSelectOption: '[role="option"]',

    // Buttons.
    createButton: 'button[type="submit"]:has-text("Create")',
    updateButton: 'button[type="submit"]:has-text("Update")',
    cancelButton: 'button:has-text("Cancel")',
    backButton: 'button:has-text("Back"), a:has-text("Back")',

    // Feedback.
    successToast: 'div:has-text("Coupon created successfully"), div:has-text("Coupon updated successfully"), div:has-text("Coupon deleted successfully")',
    // Validation-error toast rendered by useCouponForm on a bad submit.
    errorToast: 'div:has-text("Validation Error"), div:has-text("This field is required")',
    // Delete confirm dialog button.
    confirmDeleteButton: 'button:has-text("Delete")',
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// ============================================
// PAGE OBJECT — new React Coupons (Dokan 5.0.0+)
// Surface: /dashboard/new/#/coupons (DataViews list) +
//          /dashboard/new/#/coupons/create | /coupons/update/:id (form). Pro.
// Self-contained per house style §1.
// ============================================
export class NewCouponsPage {
    readonly page: Page;
    readonly listUrl = toPath('dashboard/new/#/coupons');
    readonly createUrl = toPath('dashboard/new/#/coupons/create');
    readonly testData = { product: { name: 'p1_v1 (simple)' } };

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get heading(): Locator { return this.page.locator(newCouponsSelectors.heading).first(); }
    get addNewButton(): Locator { return this.page.locator(newCouponsSelectors.addNewButton).first(); }
    get searchInput(): Locator { return this.page.locator(newCouponsSelectors.searchInput).first(); }
    get tabMyCoupons(): Locator { return this.page.locator(newCouponsSelectors.tabMyCoupons).first(); }
    get tabMarketplace(): Locator { return this.page.locator(newCouponsSelectors.tabMarketplace).first(); }
    get codeInput(): Locator { return this.page.locator(newCouponsSelectors.code).first(); }
    get descriptionInput(): Locator { return this.page.locator(newCouponsSelectors.description).first(); }
    get couponAmountInput(): Locator { return this.page.locator(newCouponsSelectors.couponAmount).first(); }
    get createButton(): Locator { return this.page.locator(newCouponsSelectors.createButton).first(); }
    get updateButton(): Locator { return this.page.locator(newCouponsSelectors.updateButton).first(); }
    get successToast(): Locator { return this.page.locator(newCouponsSelectors.successToast).first(); }
    get errorToast(): Locator { return this.page.locator(newCouponsSelectors.errorToast).first(); }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.listUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForListReady();
    }

    async gotoCreate(): Promise<void> {
        await this.page.goto(this.createUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForFormReady();
    }

    /** List ready = react root + coupon dashboard visible AND (≥1 row OR an
     *  empty-state banner). Polls up to ~15s for the DataViews fetch. */
    async waitForListReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newCouponsSelectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
        await this.page.locator(newCouponsSelectors.couponDashboard).first().waitFor({ state: 'visible', timeout: timeoutMs }).catch(() => undefined);
        const start = Date.now();
        while (Date.now() - start < 15000) {
            const rows = await this.page.locator(newCouponsSelectors.dataRow).count();
            if (rows > 0) return;
            const empty = await this.page.locator(newCouponsSelectors.emptyState).count();
            if (empty > 0) return;
            await this.page.waitForTimeout(250);
        }
    }

    async waitForFormReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newCouponsSelectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
        await this.codeInput.waitFor({ state: 'visible', timeout: timeoutMs });
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page.locator(newCouponsSelectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }

    // ---- List queries ----
    async getRowCount(): Promise<number> {
        return this.page.locator(newCouponsSelectors.dataRow).count();
    }

    /** A row whose code cell matches the given text. */
    rowByCode(code: string): Locator {
        return this.page.locator(newCouponsSelectors.dataRow).filter({ hasText: code });
    }

    async hasCouponRow(code: string): Promise<boolean> {
        return (await this.rowByCode(code).count()) > 0;
    }

    async fillSearch(query: string): Promise<void> {
        const input = this.searchInput;
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(query);
        // Search is debounced; allow the DataViews refetch to settle.
        await this.page.waitForTimeout(1000);
    }

    async clearSearch(): Promise<void> {
        const input = this.searchInput;
        if (await input.isVisible().catch(() => false)) {
            await input.fill('');
            await this.page.waitForTimeout(800);
        }
    }

    async switchToMarketplaceTab(): Promise<void> {
        await this.tabMarketplace.click();
        // Tab switch clears data then refetches /coupons/marketplace.
        await this.page.waitForTimeout(1200);
    }

    async switchToMyCouponsTab(): Promise<void> {
        await this.tabMyCoupons.click();
        await this.page.waitForTimeout(1200);
    }

    async clickAddNew(): Promise<void> {
        await this.addNewButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.addNewButton.click();
        await this.waitForFormReady();
    }

    // ---- Row actions ----
    async openRowActionMenuByIndex(index: number): Promise<void> {
        const buttons = this.page.locator(newCouponsSelectors.rowActionsBtn);
        await buttons.nth(index).waitFor({ state: 'visible', timeout: 10000 });
        await buttons.nth(index).click();
        await this.page.locator(newCouponsSelectors.actionMenuItem('Edit')).first()
            .waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    }

    async clickActionMenuItem(label: string): Promise<void> {
        await this.page.locator(newCouponsSelectors.actionMenuItem(label)).first().click();
    }

    /** Open the row whose code matches, then click its 3-dot Actions menu. */
    async openRowActionMenuByCode(code: string): Promise<void> {
        const actionsBtn = this.rowByCode(code).locator("xpath=.//button[@aria-label='Actions']").first();
        await actionsBtn.waitFor({ state: 'visible', timeout: 10000 });
        await actionsBtn.click();
        await this.page.locator(newCouponsSelectors.actionMenuItem('Edit')).first()
            .waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    }

    /** Click the coupon-code link in its row to open the edit form. */
    async openCouponByCodeLink(code: string): Promise<void> {
        await this.rowByCode(code).locator('a').first().click();
        await this.waitForFormReady();
    }

    async deleteCouponByCode(code: string): Promise<void> {
        await this.openRowActionMenuByCode(code);
        await this.clickActionMenuItem('Delete');
        // Destructive action shows a confirm dialog with a "Delete" button.
        const confirm = this.page.locator(newCouponsSelectors.confirmDeleteButton).last();
        await confirm.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        if (await confirm.isVisible().catch(() => false)) {
            await confirm.click();
        }
        // Wait for the success toast / list refetch.
        await this.successToast.waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);
        await this.page.waitForTimeout(800);
    }

    // ---- Form actions ----
    /** Pick a discount type from the Radix Select. The trigger is a button and
     *  options render in a portal inside `.dokan-layout`. */
    async selectDiscountType(key: DiscountTypeKey): Promise<void> {
        const label = DISCOUNT_TYPE_LABELS[key];
        const trigger = this.page.locator(newCouponsSelectors.discountTypeTrigger).first();
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        await trigger.click();
        const option = this.page.getByRole('option', { name: label, exact: true }).first();
        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click();
    }

    /** Fill the coupon amount. For `percent` it is a SimpleInput; for
     *  `fixed_product` it is a masked DokanPriceInput — both expose `#coupon_amount`.
     *  Clear then type so the mask handler runs per-keystroke. */
    async fillAmount(value: string): Promise<void> {
        const input = this.couponAmountInput;
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.click();
        await input.fill('');
        await input.pressSequentially(value, { delay: 30 });
        await input.press('Tab').catch(() => undefined);
    }

    /** Pick a product in the AsyncSearchableSelect (#product). Requires ≥3 chars
     *  to trigger the async product search (300ms debounced + REST round-trip).
     *  react-select renders results as `[role="option"]` (emotion class, no
     *  `__option`), so we match by role and the option label text. After picking,
     *  the chosen product shows as a multi-value chip inside `#product`. */
    async selectProduct(query: string): Promise<void> {
        const input = this.page.locator(newCouponsSelectors.productSelectInput).first();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.click();
        await input.pressSequentially(query, { delay: 30 });

        // Wait for the async option that matches the query to render, then click it.
        const option = this.page.locator(newCouponsSelectors.reactSelectOption)
            .filter({ hasText: new RegExp(query, 'i') }).first();
        try {
            await option.waitFor({ state: 'visible', timeout: 8000 });
            await option.click();
        } catch {
            // Fallback: the first concrete result option (skips placeholder/no-options).
            const firstReal = this.page.locator(newCouponsSelectors.reactSelectOption)
                .filter({ hasNotText: /Type at least|No options/i }).first();
            await firstReal.waitFor({ state: 'visible', timeout: 5000 });
            await firstReal.click();
        }

        // Confirm the product was actually added (a multi-value chip with the
        // query text appears inside the #product wrapper). This makes the
        // fixed_product create deterministic: without a product the React form
        // blocks save with a "Please specify any product or category" error.
        await this.page.locator('div#product').filter({ hasText: new RegExp(query, 'i') })
            .first().waitFor({ state: 'visible', timeout: 5000 });
    }

    async setCheckbox(selector: string, value: boolean): Promise<void> {
        const cb = this.page.locator(selector).first();
        if (!(await cb.count())) return;
        const checked = await cb.isChecked().catch(() => false);
        if (checked !== value) {
            await cb.click().catch(async () => {
                await cb.evaluate((el) => (el as HTMLInputElement).click());
            });
        }
    }

    async setShowOnStore(value: boolean): Promise<void> {
        await this.setCheckbox(newCouponsSelectors.showOnStore, value);
    }

    async setFreeShipping(value: boolean): Promise<void> {
        await this.setCheckbox(newCouponsSelectors.freeShipping, value);
    }

    async submitCreate(): Promise<void> {
        await this.createButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.createButton.click();
    }

    async submitUpdate(): Promise<void> {
        await this.updateButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.updateButton.click();
    }

    /** A successful create/update shows a success toast and then redirects to
     *  the coupons list (HashRouter). Either signal is acceptable. */
    async waitForSaveSuccess(timeoutMs = 15000): Promise<void> {
        await Promise.race([
            this.successToast.waitFor({ state: 'visible', timeout: timeoutMs }),
            this.page.waitForURL(/#\/coupons(\b|\/?$)/, { timeout: timeoutMs }).catch(() => undefined),
        ]);
    }

    /** Create a percentage-discount coupon end-to-end (fill -> submit -> wait). */
    async createPercentageCoupon(data: { code: string; description?: string; amount: string }): Promise<void> {
        await this.codeInput.fill(data.code);
        if (data.description) await this.descriptionInput.fill(data.description);
        await this.selectDiscountType('percent');
        await this.fillAmount(data.amount);
        await this.setShowOnStore(true);
        await this.submitCreate();
        await this.waitForSaveSuccess();
    }

    /** Create a fixed-product discount coupon. fixed_product requires at least
     *  one product OR category (validated client-side), so a product is added. */
    async createFixedProductCoupon(data: { code: string; description?: string; amount: string; product: string }): Promise<void> {
        await this.codeInput.fill(data.code);
        if (data.description) await this.descriptionInput.fill(data.description);
        await this.selectDiscountType('fixed_product');
        await this.fillAmount(data.amount);
        await this.selectProduct(data.product);
        await this.setShowOnStore(true);
        await this.submitCreate();
        await this.waitForSaveSuccess();
    }

    /** Native HTML5 validity of the required `#code` (Coupon Title) field. The
     *  field carries the native `required` attribute, so an empty-title submit is
     *  blocked by the browser BEFORE React's handleSubmit runs — no React
     *  "Validation Error" toast is shown. Tests assert this real behavior. */
    async getCodeFieldValidity(): Promise<{ valid: boolean; valueMissing: boolean; required: boolean }> {
        const code = this.codeInput;
        await code.waitFor({ state: 'visible', timeout: 10000 });
        return code.evaluate((el: HTMLInputElement) => ({
            valid: el.validity.valid,
            valueMissing: el.validity.valueMissing,
            required: el.required,
        }));
    }

    /** The Usage cell renders `usage_count/usage_limit` (e.g. `0/∞`). */
    async getUsageForCoupon(code: string): Promise<string> {
        const row = this.rowByCode(code).first();
        await row.waitFor({ state: 'visible', timeout: 10000 });
        return (await row.innerText()).replace(/\s+/g, ' ').trim();
    }
}
