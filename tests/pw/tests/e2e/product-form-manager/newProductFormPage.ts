import { Locator, Page, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { closeAnnouncementModal } from '@utils/helpers';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';

// ============================================
// TEST DATA
// ============================================
const uniqueId = () => `${Date.now()}-${faker.string.nanoid(6)}`;

export const newProductFormData = {
    valid: () => {
        const id = uniqueId();
        return {
            title: faker.commerce.productName(),
            slug: `${faker.commerce
                .productName()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9\-]/g, '')}-${id}`,
            price: '99.99',
            salePrice: '79.99',
            shortDescription: 'This is a short description for testing.',
            description: 'This is a full product description used in automated tests.',
            sku: `${faker.commerce.productAdjective().toUpperCase()}-${id}`,
            gtin: faker.string.numeric(14),
            stockQty: '50',
            weight: '500',
            length: '20',
            width: '15',
            height: '10',
            purchaseNote: 'Thank you for purchasing!',
            minQty: '1',
            maxQty: '10',
            category: 'Uncategorized',
            tags: ['accessories'],
            scheduleFrom: '2026-06-01',
            scheduleTo: '2026-06-30',
        };
    },
    invalid: {
        emptyTitle: '',
        longTitle: 'A'.repeat(300),
        negativePrice: '-10',
        nonNumericPrice: 'abc',
        zeroPrice: '0',
        salePriceHigherThanRegular: { price: '50', salePrice: '80' },
        invalidSlug: 'Invalid Slug With Spaces!',
        specialTitle: `Test <script>alert('x')</script> & "quotes"`,
    },
    images: {
        feature: 'utils/sampleData/dokan.png',
        gallery: ['utils/sampleData/dokan.png', 'utils/sampleData/banner.png'],
    },
    duplicateSku: 'DUPLICATE-SKU-001',
} as const;

export type ProductData = ReturnType<typeof newProductFormData.valid>;

// ============================================
// SELECTORS
// Selector reality is captured in `_dom-full.html` after one render of the
// /dashboard/new/#/products/create page; placeholders / labels below mirror it
// exactly. Don't trust the field-name comments in WP admin source — that form
// is a different (legacy) page.
// ============================================
export const newProductFormSelectors = {
    reactRoot: '#dokan-vendor-dashboard-root',
    editorRoot: '.dokan-product-product-editor',

    fieldWrapper: (id: string) => `#dokan-form-field-${id}`,

    // Core fields — WP InputControl, no `name=`.
    title: 'input[placeholder="Enter product title..."]',
    slug: 'input[placeholder="Enter product slug..."]',

    regularPrice: '#regular_price',
    salePrice: '#sale_price',

    // Rich text editors are Quill `<div contenteditable>` instances. They live
    // inside the description / short_description wrappers but have no name; we
    // also use placeholder so the editor element itself can be addressed.
    shortDescriptionEditor: '#dokan-form-field-short_description [contenteditable="true"]',
    descriptionEditor: '#dokan-form-field-description [contenteditable="true"]',

    sku: 'input[placeholder="Enter product SKU"]',
    gtin: 'input[placeholder="Enter code"]',

    // Inventory / shipping / min-max — only placeholders or types are stable.
    stockQty: 'input[id^="0."][type="text"]',
    weight: 'input[placeholder="Weight (lbs)"]',
    length: 'input[placeholder="Length (in)"]',
    width: 'input[placeholder="Width (in)"]',
    height: 'input[placeholder="Height (in)"]',

    // react-select wrappers.
    productTypeWrapper: '#dokan-form-field-type',
    categoryWrapper: '#dokan-form-field-category_ids',
    tagsWrapper: '#dokan-form-field-product_tag',
    brandsWrapper: '#dokan-form-field-product_brand',
    stockStatusWrapper: '#dokan-form-field-stock_status',
    taxStatusWrapper: '#dokan-form-field-tax_status',
    taxClassWrapper: '#dokan-form-field-tax_class',
    visibilityWrapper: '#dokan-form-field-catalog_visibility',
    shippingClassWrapper: '#dokan-form-field-shipping_class',

    purchaseNote: 'textarea[placeholder="Purchase Note"]',

    attributesWrapper: '#dokan-form-field-attributes',

    // Save button — rendered into the page header via WP Fill slot.
    saveButton: 'button:has-text("Save Changes"), button:has-text("Update Product"), button:has-text("Create Product"), button:has-text("Publish")',
    saveAsDraftButton: 'button:has-text("Save as draft"), button:has-text("Save Draft")',

    // Image upload buttons (open WP media modal).
    featureImageButton: '#dokan-form-field-image_id [role="button"]',
    galleryImageButton: '#dokan-form-field-gallery_image_ids [role="button"]',

    // WP media modal — opened when feature / gallery upload buttons are
    // clicked. Use the same selectors as the legacy product form so the
    // upload flow is consistent.
    // Each MediaUploader instance leaves its own `.media-modal` in the DOM, so
    // there can be several at once (featured + gallery). Always scope to the
    // one that is currently visible. Inner selectors are relative to that modal.
    wpMedia: {
        modal: '.media-modal:visible',
        uploadMenu: 'button#menu-item-upload',
        libraryMenu: 'button#menu-item-browse',
        fileInput: 'input[type="file"]',
        firstAttachment: '.attachment',
        selectButton: '.media-toolbar-primary button.media-button-select',
        // Some media frames (e.g. featured image with cropping) show an
        // "insert"/crop button instead of/after select.
        insertButton: '.media-toolbar-primary button.media-button-insert',
    },
} as const;

// Checkbox label text exactly as it appears in `.dokan-form-field-label`.
const LABELS = {
    downloadable: 'Downloadable',
    virtual: 'Virtual',
    manageStock: 'Manage stock?',
    soldIndividually: 'Allow only one quantity of this product to be bought in a single order.',
    scheduleToggle: 'Create Schedule for Discount',
    enableReviews: 'Enable product reviews',
    overrideShipping: 'Override your store',
    overrideRma: 'Override your default RMA settings for this product',
    enableWholesale: 'Enable wholesale for this product',
    enableBulkDiscount: 'Enable bulk discount',
} as const;

// ============================================
// PAGE OBJECT
// ============================================
export class NewProductFormPage {
    readonly page: Page;
    readonly url = `${BASE_URL}/dashboard/new/#/products/create`;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get title(): Locator {
        return this.page.locator(newProductFormSelectors.title).first();
    }
    get slug(): Locator {
        return this.page.locator(newProductFormSelectors.slug).first();
    }
    get price(): Locator {
        return this.page.locator(newProductFormSelectors.regularPrice).first();
    }
    get salePrice(): Locator {
        return this.page.locator(newProductFormSelectors.salePrice).first();
    }
    get shortDescription(): Locator {
        return this.page.locator(newProductFormSelectors.shortDescriptionEditor).first();
    }
    get description(): Locator {
        return this.page.locator(newProductFormSelectors.descriptionEditor).first();
    }
    get sku(): Locator {
        return this.page.locator(newProductFormSelectors.sku).first();
    }
    get gtin(): Locator {
        return this.page.locator(newProductFormSelectors.gtin).first();
    }
    get weight(): Locator {
        return this.page.locator(newProductFormSelectors.weight).first();
    }
    get length(): Locator {
        return this.page.locator(newProductFormSelectors.length).first();
    }
    get width(): Locator {
        return this.page.locator(newProductFormSelectors.width).first();
    }
    get height(): Locator {
        return this.page.locator(newProductFormSelectors.height).first();
    }
    get purchaseNote(): Locator {
        return this.page.locator(newProductFormSelectors.purchaseNote).first();
    }

    // Min/Max quantity — the only `type="number"` inputs in the form, in order.
    get minQty(): Locator {
        return this.page.locator('input[type="number"]').nth(0);
    }
    get maxQty(): Locator {
        return this.page.locator('input[type="number"]').nth(1);
    }

    // Schedule date inputs — date inputs nested inside the discount section.
    // The form renders them only when "Create Schedule for Discount" is on.
    get scheduleFrom(): Locator {
        return this.page.locator('input[type="date"]').nth(0);
    }
    get scheduleTo(): Locator {
        return this.page.locator('input[type="date"]').nth(1);
    }

    // Stock quantity — appears after Manage Stock is toggled on. The field has
    // a randomly-generated id so we match by being inside the inventory card
    // and immediately following the Manage Stock checkbox.
    get stockQty(): Locator {
        return this.page
            .locator('input.appearance-none, input[id^="0."]')
            .filter({ hasNot: this.page.locator('[placeholder]') })
            .first();
    }

    get virtualToggle(): Locator {
        return this.checkboxByLabel(LABELS.virtual);
    }
    get downloadableToggle(): Locator {
        return this.checkboxByLabel(LABELS.downloadable);
    }
    get manageStockToggle(): Locator {
        return this.checkboxByLabel(LABELS.manageStock);
    }
    get soldIndividually(): Locator {
        return this.checkboxByLabel(LABELS.soldIndividually);
    }
    get enableReviews(): Locator {
        return this.checkboxByLabel(LABELS.enableReviews);
    }
    get scheduleToggle(): Locator {
        return this.checkboxByLabel(LABELS.scheduleToggle);
    }

    // Status radios — `value` is the most stable hook here. The label and the
    // input are siblings, not nested, so a `label > input` locator fails.
    get statusPublish(): Locator {
        return this.page.locator('input[type="radio"][value="publish"]').first();
    }
    get statusDraft(): Locator {
        return this.page.locator('input[type="radio"][value="draft"]').first();
    }

    get saveButton(): Locator {
        return this.page.locator(newProductFormSelectors.saveButton).first();
    }
    get saveAsDraftButton(): Locator {
        return this.page.locator(newProductFormSelectors.saveAsDraftButton).first();
    }

    /**
     * Success feedback. The submit handler shows a `react-hot-toast` status
     * message and then redirects to the products list. The toast is visible
     * for ~a second between save and redirect.
     */
    get successNotice(): Locator {
        // `:has-text` accepts a string but not a /regex/ literal; we use
        // `filter` with hasText so callers get regex matching.
        return this.page
            .locator('div[role="status"]')
            .filter({ hasText: /saved|success|created/i })
            .first();
    }
    get errorNotice(): Locator {
        return this.page.locator('div[role="alert"]').first();
    }

    // react-select wrappers exposed as locators.
    get productTypeSelect(): Locator {
        return this.page.locator(newProductFormSelectors.productTypeWrapper).first();
    }
    get categoryInput(): Locator {
        return this.reactSelectInput(newProductFormSelectors.categoryWrapper);
    }
    get tagsInput(): Locator {
        return this.reactSelectInput(newProductFormSelectors.tagsWrapper);
    }
    get visibility(): Locator {
        return this.page.locator(`${newProductFormSelectors.visibilityWrapper} .react-select__single-value`).first();
    }
    get stockStatus(): Locator {
        return this.page.locator(`${newProductFormSelectors.stockStatusWrapper} .react-select__single-value`).first();
    }
    get taxStatus(): Locator {
        return this.page.locator(`${newProductFormSelectors.taxStatusWrapper} .react-select__single-value`).first();
    }
    get taxClass(): Locator {
        return this.page.locator(`${newProductFormSelectors.taxClassWrapper} .react-select__single-value`).first();
    }

    // ---- Internal helpers ----
    private checkboxByLabel(text: string): Locator {
        return this.page
            .locator('.components-base-control.components-checkbox-control')
            .filter({ has: this.page.locator('.dokan-form-field-label', { hasText: new RegExp(escapeRegExp(text), 'i') }) })
            .locator('input.components-checkbox-control__input')
            .first();
    }

    /**
     * Flip a WP CheckboxControl by dispatching a native click directly on
     * the `<input>`. Playwright's `.check()` and `.label.click()` work for
     * top-of-form checkboxes but fail silently for ones farther down (Manage
     * stock, Wholesale, RMA, Bulk Discount) — the click is received, React's
     * onChange fires, but the checked state immediately reverts on the next
     * render. Dispatching the click via `evaluate(el => el.click())` is the
     * one path that survives the re-render.
     */
    async setCheckbox(text: string, value: boolean): Promise<void> {
        const cb = this.checkboxByLabel(text);
        if (!(await cb.count())) return;
        await cb.scrollIntoViewIfNeeded().catch(() => undefined);
        let checked = await cb.isChecked().catch(() => false);
        // Retry the click — React batches state updates and a single click
        // is sometimes coalesced away when the form is mid-hydration.
        for (let i = 0; i < 3 && checked !== value; i++) {
            await cb.evaluate(el => (el as HTMLInputElement).click());
            await this.page.waitForTimeout(150);
            checked = await cb.isChecked().catch(() => false);
        }
    }

    // React-select renders in two flavours here: the classed `<Select>` (adds
    // `react-select__*` classes) and the creatable `TaggableSelect` used for
    // product tags when vendors may create tags (emotion-hashed classes, no
    // `react-select__*`). Both keep stable ARIA roles, so target those instead
    // of the class prefix.
    private reactSelectInput(wrapper: string): Locator {
        return this.page.locator(`${wrapper} input[role="combobox"]`).first();
    }

    private reactSelectOption(text?: string): Locator {
        const base = this.page.locator('[role="option"]');
        return text ? base.filter({ hasText: new RegExp(`^\\s*${escapeRegExp(text)}\\s*$`, 'i') }) : base;
    }

    private async chooseReactSelectOption(wrapper: string, optionText: string): Promise<void> {
        // Clicking the combobox input opens the menu for both react-select flavours.
        await this.reactSelectInput(wrapper).click();
        await this.reactSelectOption(optionText).first().click();
    }

    private async setReactSelectByTyping(wrapper: string, value: string): Promise<void> {
        const input = this.reactSelectInput(wrapper);
        await input.click();
        await input.fill(value);
        // For creatable tags the matching option reads `Create "value"`, so match
        // on a substring rather than the exact label.
        const option = this.reactSelectOption()
            .filter({ hasText: new RegExp(escapeRegExp(value), 'i') })
            .first();
        await option.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        if (await option.isVisible().catch(() => false)) {
            await option.click();
            return;
        }
        // Creatable react-select: Enter creates a new option. Use the page
        // keyboard rather than `input.press` — react-select re-renders the
        // input on each keystroke and the original locator detaches.
        await this.page.keyboard.press('Enter');
    }

    /**
     * Fill a Quill editor. We focus, clear via DOM, then type — Quill's input
     * pipeline drops bulk `.fill()` writes.
     */
    private async fillRichText(editor: Locator, text: string): Promise<void> {
        await editor.waitFor({ state: 'visible' });
        await editor.click();
        await editor.evaluate(el => {
            (el as HTMLElement).innerHTML = '';
        });
        await editor.pressSequentially(text);
        await editor.press('Tab').catch(() => undefined);
    }

    /**
     * Fill a Cleave.js-masked price input (regular_price / sale_price). The
     * masked input only updates its React state in response to real input
     * events — `.fill()` sets the DOM value but the next mask re-render wipes
     * it, so the form posts an empty price on save. Clear via select+delete,
     * then type so each keystroke runs through the mask handler.
     */
    async fillPrice(input: Locator, value: string): Promise<void> {
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.evaluate(el => (el as HTMLInputElement).select());
        await this.page.keyboard.press('Delete');
        await input.pressSequentially(value, { delay: 30 });
        await input.press('Tab').catch(() => undefined);
    }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async waitForFormReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newProductFormSelectors.reactRoot).waitFor({ state: 'visible', timeout: timeoutMs });
        await this.page
            .locator(newProductFormSelectors.title)
            .first()
            .waitFor({ state: 'visible', timeout: timeoutMs })
            .catch(() => undefined);
        await this.page
            .locator(newProductFormSelectors.descriptionEditor)
            .first()
            .waitFor({ state: 'visible', timeout: timeoutMs })
            .catch(() => undefined);
    }

    // ---- Composite fillers ----
    async fillBasicInfo(data: Partial<ProductData>): Promise<void> {
        if (data.title !== undefined) await this.title.fill(data.title);
        if (data.price !== undefined) await this.fillPrice(this.price, data.price);
        if (data.salePrice !== undefined) await this.fillPrice(this.salePrice, data.salePrice);
        if (data.shortDescription !== undefined) await this.fillRichText(this.shortDescription, data.shortDescription);
        if (data.description !== undefined) await this.fillRichText(this.description, data.description);
    }

    async fillInventory(data: Partial<ProductData>): Promise<void> {
        if (data.sku !== undefined && (await this.sku.count())) await this.sku.fill(data.sku);
        if (data.gtin !== undefined && (await this.gtin.count())) await this.gtin.fill(data.gtin);
        if (data.stockQty !== undefined) {
            await this.enableManageStock();
            if (await this.stockQty.count()) await this.stockQty.fill(data.stockQty);
        }
    }

    async fillShipping(data: Partial<ProductData>): Promise<void> {
        if (data.weight !== undefined && (await this.weight.count())) await this.weight.fill(data.weight);
        if (data.length !== undefined && (await this.length.count())) await this.length.fill(data.length);
        if (data.width !== undefined && (await this.width.count())) await this.width.fill(data.width);
        if (data.height !== undefined && (await this.height.count())) await this.height.fill(data.height);
    }

    async fillSchedule(from: string, to: string): Promise<void> {
        await this.setCheckbox(LABELS.scheduleToggle, true);
        if (await this.scheduleFrom.count()) await this.scheduleFrom.fill(from);
        if (await this.scheduleTo.count()) await this.scheduleTo.fill(to);
    }

    async selectCategory(name: string): Promise<void> {
        const wrapper = newProductFormSelectors.categoryWrapper;
        const existing = this.page.locator(`${wrapper} .react-select__multi-value__label`, { hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`, 'i') });
        if ((await existing.count()) > 0) return;
        await this.setReactSelectByTyping(wrapper, name);
    }

    async unselectCategory(name: string): Promise<void> {
        const removeBtn = this.page.locator(`${newProductFormSelectors.categoryWrapper} [aria-label="Remove ${name}"]`).first();
        if (await removeBtn.isVisible().catch(() => false)) {
            await removeBtn.click();
        }
    }

    /** Number of currently-selected categories (multi-value chips, else a single value). */
    async selectedCategoryCount(): Promise<number> {
        const multi = await this.page.locator(`${newProductFormSelectors.categoryWrapper} .react-select__multi-value__label`).count();
        if (multi > 0) return multi;
        return await this.page.locator(`${newProductFormSelectors.categoryWrapper} .react-select__single-value`).count();
    }

    /** True when a category with the given name is currently selected (multi or single). */
    async isCategorySelected(name: string): Promise<boolean> {
        const chip = this.page.locator(`${newProductFormSelectors.categoryWrapper} .react-select__multi-value__label`, { hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`, 'i') });
        if ((await chip.count()) > 0) return true;
        const single = this.page.locator(`${newProductFormSelectors.categoryWrapper} .react-select__single-value`, { hasText: new RegExp(escapeRegExp(name), 'i') });
        return (await single.count()) > 0;
    }

    async addTags(tags: string[]): Promise<void> {
        for (const tag of tags) {
            await this.setReactSelectByTyping(newProductFormSelectors.tagsWrapper, tag);
        }
    }

    async selectVisibility(value: 'visible' | 'catalog' | 'search' | 'hidden'): Promise<void> {
        const map = { visible: 'Visible', catalog: 'Catalog', search: 'Search', hidden: 'Hidden' } as const;
        await this.chooseReactSelectOption(newProductFormSelectors.visibilityWrapper, map[value]);
    }

    async selectStockStatus(value: 'instock' | 'outofstock' | 'onbackorder'): Promise<void> {
        const map = { instock: 'In stock', outofstock: 'Out of stock', onbackorder: 'On backorder' } as const;
        await this.chooseReactSelectOption(newProductFormSelectors.stockStatusWrapper, map[value]);
    }

    async selectTaxStatus(value: 'taxable' | 'shipping' | 'none'): Promise<void> {
        const map = { taxable: 'Taxable', shipping: 'Shipping only', none: 'None' } as const;
        await this.chooseReactSelectOption(newProductFormSelectors.taxStatusWrapper, map[value]);
    }

    async enableManageStock(): Promise<void> {
        await this.setCheckbox(LABELS.manageStock, true);
    }

    async enableVirtual(): Promise<void> {
        await this.setCheckbox(LABELS.virtual, true);
    }

    async enableDownloadable(): Promise<void> {
        await this.setCheckbox(LABELS.downloadable, true);
    }

    async setProductType(type: 'simple' | 'variable' | 'grouped' | 'external'): Promise<void> {
        // Exact option labels as rendered by the live type dropdown.
        const labelMap = {
            simple: 'Simple',
            variable: 'Variable',
            grouped: 'Group Product',
            external: 'External/Affiliate product',
        } as const;
        await this.chooseReactSelectOption(newProductFormSelectors.productTypeWrapper, labelMap[type]);
    }

    /**
     * Save a NEW product and return the created id read from the create POST
     * response. More robust than searching getAllProducts (which paginates).
     * The create is POST /dokan/vN/products (no id in path); batch / variations /
     * duplicate / init / /:id calls are excluded.
     */
    async saveCreateAndGetId(): Promise<string> {
        const respP = this.page
            .waitForResponse(
                r =>
                    r.request().method() === 'POST' &&
                    /\/products\b/i.test(r.url()) &&
                    !/\/products\/\d+/.test(r.url()) &&
                    !/batch|variations|duplicate|init/i.test(r.url()),
                { timeout: 25000 },
            )
            .catch(() => undefined);
        await this.save();
        const resp = await respP;
        const body = resp ? await resp.json().catch(() => ({})) : {};
        return String((body as { id?: number | string })?.id ?? '');
    }

    // NOTE: the React editor lists External/Affiliate + Group Product in the type
    // dropdown but does NOT render their type-specific fields (external_url /
    // button_text / grouped_products wrappers are absent after choosing the type),
    // so there is nothing to fill for those creates yet — see the limitation note
    // in newProductFormTypes.spec.ts. setProductType() still switches the dropdown.

    // ---- Attributes ----
    get attributesSection(): Locator {
        return this.page.locator(newProductFormSelectors.attributesWrapper);
    }

    // The "Add" picker renders after any cards, so it's the last combobox.
    get addAttributeInput(): Locator {
        return this.attributesSection.locator('input[role="combobox"]').last();
    }

    attributeCard(name: string): Locator {
        return this.attributesSection
            .locator('span.font-semibold')
            .filter({ hasText: new RegExp(escapeRegExp(name), 'i') })
            .first();
    }

    get attributeTermsValue(): Locator {
        return this.attributesSection.locator('.react-select__value-container').first();
    }

    async addGlobalAttribute(name: string): Promise<void> {
        // Menu can render outside the viewport, so commit with Enter not a click.
        await this.attributesSection.scrollIntoViewIfNeeded().catch(() => undefined);
        const input = this.addAttributeInput;
        await input.click();
        await input.fill(name);
        await this.reactSelectOption(name).first().waitFor({ state: 'visible', timeout: 8000 });
        await this.page.keyboard.press('Enter');
        await this.attributesSection
            .getByRole('button', { name: /add new/i })
            .first()
            .click();
        await this.attributeCard(name).waitFor({ state: 'visible', timeout: 8000 });
    }

    async selectAllAttributeTerms(): Promise<void> {
        await this.attributesSection
            .getByRole('button', { name: /^select all$/i })
            .first()
            .click();
    }

    // ---- Save / drafts ----
    async save(): Promise<void> {
        const btn = this.saveButton;
        await btn.waitFor({ state: 'visible' });
        // Wait for debounced validation to enable the button; a disabled button
        // is the "blocked save" signal, so return without clicking.
        await expect(btn)
            .toBeEnabled({ timeout: 6000 })
            .catch(() => undefined);
        if (!(await btn.isEnabled().catch(() => false))) return;
        await btn.click();
    }

    async saveAsDraft(): Promise<void> {
        const draft = this.saveAsDraftButton;
        if (await draft.isVisible().catch(() => false)) {
            await draft.click();
            return;
        }
        if ((await this.statusDraft.count()) && !(await this.statusDraft.isChecked().catch(() => false))) {
            await this.statusDraft.check({ force: true }).catch(async () => {
                // Status radio sometimes needs label click.
                await this.page.locator('label[for*="inspector-radio-control-0-1"]').first().click();
            });
        }
        await this.save();
    }

    /**
     * The submit handler shows a toast then redirects to the products list.
     * Either signal is acceptable.
     */
    async waitForSaveSuccess(timeoutMs = 15000): Promise<void> {
        await Promise.race([this.successNotice.waitFor({ state: 'visible', timeout: timeoutMs }), this.page.waitForURL(/\/dashboard\/new\/#\/products(\b|\/?$)/, { timeout: timeoutMs }).catch(() => undefined)]);
    }

    async createSimpleProduct(data: ProductData): Promise<void> {
        await this.fillBasicInfo(data);
        await this.fillInventory(data);
        await this.fillShipping(data);
        await this.save();
    }

    // ---- EDIT surface (/dashboard/new/#/products/:id/edit) ----
    // The create + edit routes share the same App component. Edit prefills from
    // GET dokan/v3/products/init/fields?id=, saves via PUT dokan/v3/products/:id
    // ("Update Product"), and — unlike create — does NOT redirect on save. So the
    // completion signal is the PUT response + "Product saved successfully." toast,
    // never a URL change, and a reload re-prefills the form (persistence oracle).
    editUrl(id: string | number): string {
        return `${BASE_URL}/dashboard/new/#/products/${id}/edit`;
    }

    async gotoEdit(id: string | number): Promise<void> {
        await this.page.goto(this.editUrl(id));
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForEditReady();
    }

    /** Ready when the editor root is mounted AND a prefilled field (title) is visible. */
    async waitForEditReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newProductFormSelectors.reactRoot).waitFor({ state: 'visible', timeout: timeoutMs });
        await this.title.waitFor({ state: 'visible', timeout: timeoutMs });
    }

    /** Public description setters (edit spec drives long/short desc). */
    async setShortDescription(text: string): Promise<void> {
        await this.fillRichText(this.shortDescription, text);
    }

    async setDescription(text: string): Promise<void> {
        await this.fillRichText(this.description, text);
    }

    /**
     * Click "Update Product" and wait for the PUT to /dokan/vN/products/:id to
     * return, then the success toast — with NO URL-change race (edit stays put).
     */
    async saveEdit(): Promise<void> {
        const btn = this.saveButton;
        await btn.waitFor({ state: 'visible' });
        await expect(btn)
            .toBeEnabled({ timeout: 8000 })
            .catch(() => undefined);
        await Promise.all([this.page.waitForResponse(r => /dokan\/v[0-9]+\/products\/\d+/i.test(r.url()) && r.request().method() === 'PUT', { timeout: 20000 }).catch(() => undefined), btn.click()]);
        await this.successNotice.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
        await this.page.waitForTimeout(500);
    }

    /** Is the Update Product button currently disabled (the "blocked save" signal)? */
    async saveIsDisabled(): Promise<boolean> {
        const btn = this.saveButton;
        await btn.waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);
        return !(await btn.isEnabled().catch(() => true));
    }

    // Current form values (read-back after reload).
    async titleValue(): Promise<string> {
        return await this.title.inputValue();
    }
    async skuValue(): Promise<string> {
        return await this.sku.inputValue();
    }

    // ---- Images ----
    /**
     * Uploads via the WP media modal. The form's upload button opens the
     * standard `media-modal`; we send the file to its file input and select
     * the resulting attachment.
     */
    async uploadFeatureImage(filePath: string): Promise<void> {
        await this.page.locator(newProductFormSelectors.featureImageButton).first().click();
        await this.uploadViaMediaModal(filePath);
    }

    /**
     * Adds each file as a separate gallery image. We upload one file per media
     * session because multi-file selection races — the modal's "Select" button
     * enables as soon as the first attachment is selected, so a single session
     * reliably captures only one image. The gallery merges by id across
     * sessions, so looping yields all images.
     */
    async uploadGallery(filePaths: readonly string[]): Promise<void> {
        for (const filePath of filePaths) {
            await this.page.locator(newProductFormSelectors.galleryImageButton).first().click();
            await this.uploadViaMediaModal(filePath);
        }
    }

    private async uploadViaMediaModal(filePath: string | string[]): Promise<void> {
        const m = newProductFormSelectors.wpMedia;
        // A stale modal can linger, so drive the last (newest) visible one.
        const modal = this.page.locator(m.modal).last();
        await modal.waitFor({ state: 'visible', timeout: 15000 });
        // Send the file(s) through the Upload tab's input. WP then switches to
        // the library view with the new attachment(s) auto-selected.
        await modal
            .locator(m.uploadMenu)
            .click()
            .catch(() => undefined);
        await modal.locator(m.fileInput).first().setInputFiles(filePath);

        // The "Select" button only enables once an attachment is selected.
        // Auto-selection can lag while the upload finishes, so poll: if the
        // button is still disabled, nudge by clicking the first attachment.
        const selectBtn = modal.locator(m.selectButton).first();
        await expect(async () => {
            if (!(await selectBtn.isEnabled().catch(() => false))) {
                await modal
                    .locator(m.firstAttachment)
                    .first()
                    .click()
                    .catch(() => undefined);
            }
            await expect(selectBtn).toBeEnabled({ timeout: 1000 });
        }).toPass({ timeout: 30000 });

        await selectBtn.click();
        // Featured-image crop frames show an extra "insert" step.
        const insertBtn = modal.locator(m.insertButton).first();
        if (await insertBtn.isVisible().catch(() => false)) {
            await insertBtn.click().catch(() => undefined);
        }
        // Close this frame before the next upload opens one; nudge with Escape.
        await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(async () => {
            await this.page.keyboard.press('Escape').catch(() => undefined);
            await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
        });
    }

    // Preview <img> elements rendered after a successful upload.
    get featureImagePreview(): Locator {
        return this.page.locator('#dokan-form-field-image_id img, .dokan-product-image_id img');
    }

    get galleryImagePreviews(): Locator {
        return this.page.locator('#dokan-form-field-gallery_image_ids .dokan-product-gallery_image_ids img');
    }

    async featureImageCount(): Promise<number> {
        return this.featureImagePreview.count();
    }

    async galleryItemCount(): Promise<number> {
        return this.galleryImagePreviews.count();
    }

    /**
     * Remove the featured image. The remove button is the overlay `<button>`
     * inside the preview item; it's hover-revealed (`opacity-0`), so we hover
     * the item first. Opacity doesn't block Playwright clicks but hovering keeps
     * the interaction realistic.
     */
    async removeFeatureImage(): Promise<void> {
        const item = this.page.locator('#dokan-form-field-image_id .dokan-product-image_id').first();
        if (!(await item.count())) return;
        await item.hover().catch(() => undefined);
        await item.locator('button[type="button"]').first().click();
    }

    async removeGalleryImage(index = 0): Promise<void> {
        const item = this.page
            .locator('#dokan-form-field-gallery_image_ids .dokan-product-gallery_image_ids')
            .filter({ has: this.page.locator('img') })
            .nth(index);
        if (!(await item.count())) return;
        await item.hover().catch(() => undefined);
        await item.locator('button[type="button"]').first().click();
    }

    // ---- Pro: wholesale / RMA / bulk-discount / geolocation ----
    async enableWholesale(price: string, qty: string): Promise<void> {
        await this.setCheckbox(LABELS.enableWholesale, true);
        const priceInput = this.page.locator('input[name="wholesale_price"], #dokan-form-field-wholesale_price input').first();
        const qtyInput = this.page.locator('input[name="wholesale_quantity"], #dokan-form-field-wholesale_quantity input').first();
        if (await priceInput.count()) await priceInput.fill(price);
        if (await qtyInput.count()) await qtyInput.fill(qty);
    }

    async overrideRma(): Promise<void> {
        await this.setCheckbox(LABELS.overrideRma, true);
    }

    async enableBulkDiscount(): Promise<void> {
        await this.setCheckbox(LABELS.enableBulkDiscount, true);
    }

    async overrideGeolocation(query: string): Promise<void> {
        const same = this.page.locator('#dokan-geo-use-store-settings');
        if (await same.isChecked().catch(() => false)) {
            await this.page
                .locator('label[for="dokan-geo-use-store-settings"]')
                .first()
                .click()
                .catch(() => undefined);
        }
        const search = this.page.locator('#dokan-form-field-dokan_geolocation_map input, input[placeholder*="location" i]').first();
        if (await search.count()) await search.fill(query);
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
