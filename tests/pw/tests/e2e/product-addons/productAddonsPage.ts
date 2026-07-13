import { Page, expect, request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { unserialize } from 'php-serialize';

// ============================================================================
// Legacy Product Add-ons (WooCommerce Product Add-ons module) — VENDOR revival.
//
// Ported from the pre-refactor page object (git e2ec507de:pages/productAddonsPage.ts
// + pages/productsPage.ts addon methods) into the current self-contained style.
// Two surfaces are driven:
//   - Global add-ons: /dashboard/settings/product-addon (list + create/edit form)
//   - Per-product add-ons: the classic PHP product-edit screen (Add-ons metabox)
// Base-class helpers (toBeVisible / clearAndType / clickAndWaitForResponse / ...)
// are inlined as raw Playwright below. Selector strings are recovered verbatim
// from pre-refactor selectors.ts (selector.vendor.vAddonSettings + .product).
//
// data / payloads / dbUtils / ApiUtils / responseBody are re-exported REAL from
// @utils so the spec's beforeAll seeds real categories/addons/products over REST
// and re-owns the global addon to the vendor via a raw SQL post_author update.
// ============================================================================

// ---- Re-exported REAL test utils (import contract for productAddons.spec.ts) --
export { data } from '@utils/testData';
export { payloads } from '@utils/payloads';
export { dbUtils } from '@utils/dbUtils';
export type { responseBody } from '@utils/interfaces';

/**
 * Null-tolerant ApiUtils wrapper (mirrors vendor-return-request / store-supports).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context and
 * swap it in before the first real HTTP call. Every high-level method funnels
 * through get/post/put/delete, so gating those four (plus dispose) is enough.
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

    override async post(...args: Parameters<RealApiUtils['post']>): ReturnType<RealApiUtils['post']> {
        await this.ready();
        return super.post(...args);
    }

    override async put(...args: Parameters<RealApiUtils['put']>): ReturnType<RealApiUtils['put']> {
        await this.ready();
        return super.put(...args);
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
// SUB-URLS + SUCCESS MESSAGES (recovered from pre-refactor testData.ts)
// ============================================================================
const subUrls = {
    ajax: '/admin-ajax.php',
    dashboard: 'dashboard',
    products: 'dashboard/products',
    settingsAddon: 'dashboard/settings/product-addon',
    settingsAddonEdit: (addonId: string) => `dashboard/settings/product-addon/?edit=${addonId}`,
    productEdit: (productId: string, nonce: string) => `dashboard/products/?product_id=${productId}&action=edit&_dokan_edit_product_nonce=${nonce}`,
};

const messages = {
    addonSaved: 'Add-on saved successfully',
    productSaved: 'Success! The product has been saved successfully.',
};

// ============================================================================
// VENDOR DASHBOARD MENUS (selector.vendor.vDashboard.menus)
// ============================================================================
const menusVendor = {
    settings: '(//ul[@class="dokan-dashboard-menu"]//li[contains(@class,"settings has-submenu")]//a)[1]',
    addons: '.submenu-item.product-addon',
};

// ============================================================================
// GLOBAL ADD-ON SETTINGS SELECTORS (selector.vendor.vAddonSettings)
// ============================================================================
const addonsVendor = {
    productAddonsDiv: 'div.dokan-pa-all-addons',
    productAddonsText: '.dokan-settings-content h1',
    visitStore: '//a[normalize-space()="Visit Store"]',

    createNewAddon: '.dokan-pa-all-addons .dokan-btn',

    // table
    table: {
        addonTable: '#global-addons-table',
        nameColumn: 'th[scope="col"]',
        priorityColumn: '//th[normalize-space()="Priority"]',
        productCategoriesColumn: '//th[normalize-space()="Product Categories"]',
        numberOfFieldsColumn: '//th[normalize-space()="Number of Fields"]',
    },

    noRowsFound: '//td[normalize-space()="No add-ons found."]',
    firstAddonRow: '#the-list tr td .edit a',
    addonRow: (addon: string) => `//a[contains(text(), '${addon}')]/..`,
    rowActions: (addon: string) => `//a[contains(text(), '${addon}')]/..//div[@class="row-actions"]`,
    editAddon: (addon: string) => `//a[contains(text(), '${addon}')]/..//a[contains(text(), 'Edit')]`,
    deleteAddon: (addon: string) => `//a[contains(text(), '${addon}')]/..//a[contains(text(), 'Delete')]`,

    backToAddonLists: '.back-to-addon-lists-btn',

    addon: {
        name: '#addon-reference',
        priority: '#addon-priority',
        productCategories: '.select2-search__field',
        result: 'li.select2-results__option.select2-results__option--highlighted',

        // Addon fields
        addField: 'button.wc-pao-add-field',
        type: 'select#wc-pao-addon-content-type-0',
        displayAs: 'select#wc-pao-addon-content-display-0',
        titleRequired: 'input#wc-pao-addon-content-name-0',
        formatTitle: 'select#wc-pao-addon-content-title-format',
        addDescription: 'input#wc-pao-addon-description-enable-0',
        descriptionInput: 'textarea#wc-pao-addon-description-0',
        requiredField: 'input#wc-pao-addon-required-0',
        import: 'button.wc-pao-import-addons',
        export: 'button.wc-pao-export-addons',
        importInput: 'textarea.wc-pao-import-field',
        exportInput: 'textarea.wc-pao-export-field',
        expandAll: 'a.wc-pao-expand-all',
        closeAll: 'a.wc-pao-close-all',
        addonRow: (addon: string) => `//h3[@class="wc-pao-addon-name" and contains(text(), '${addon}')]/../..`,
        removeAddon: (addon: string) => `//h3[@class="wc-pao-addon-name" and contains(text(), '${addon}')]/../..//button[contains(@class, "wc-pao-remove-addon")]`,
        confirmRemove: 'button.swal2-confirm',

        publishOrUpdate: '#submit',
        addonUpdateSuccessMessage: '.dokan-alert.dokan-alert-success',

        // addons option
        option: {
            enterAnOption: '//input[@placeholder="Enter an option"]',
            optionPriceType: 'select.wc-pao-addon-option-price-type',
            optionPriceInput: 'div.wc-pao-addon-content-price input.wc_input_price',
            addOption: 'button.wc-pao-add-option',
        },
    },
};

// ============================================================================
// PER-PRODUCT ADD-ON + PRODUCT EDIT SELECTORS (selector.vendor.product)
// ============================================================================
const productsVendor = {
    addNewProduct: 'span.dokan-add-product-link .dokan-btn.dokan-btn-theme:first-child',
    title: '#post_title',
    saveProduct: 'input#publish',
    updatedSuccessMessage: 'div.dokan-message',

    search: {
        searchInput: 'input[placeholder="Search Products"]',
        searchBtn: 'button[name="product_listing_search"]',
    },

    productCell: (productName: string) => `//strong//a[contains(text(),'${productName}')]/../..`,
    productLink: (productName: string) => `//strong//a[contains(text(),'${productName}')]`,
    editProduct: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="edit"]//a`,
    rowActions: (productName: string) => `//a[contains(text(), '${productName}')]/../..//div[@class="row-actions"]`,

    addon: {
        addonSection: 'div#dokan-product-addons-options',
        addonForm: 'div.wc-pao-addon.open',
        addField: 'button.wc-pao-add-field',
        type: 'select#wc-pao-addon-content-type-0',
        displayAs: 'select#wc-pao-addon-content-display-0',
        titleRequired: 'input#wc-pao-addon-content-name-0',
        formatTitle: 'select#wc-pao-addon-content-title-format',
        addDescription: 'input#wc-pao-addon-description-enable-0',
        descriptionInput: 'textarea#wc-pao-addon-description-0',
        requiredField: 'input#wc-pao-addon-required-0',
        import: 'button.wc-pao-import-addons',
        export: 'button.wc-pao-export-addons',
        importInput: 'textarea.wc-pao-import-field',
        exportInput: 'textarea.wc-pao-export-field',
        excludeAddons: 'input#\\_product_addons_exclude_global',
        addonRow: (addon: string) => `//h3[@class="wc-pao-addon-name" and contains(text(), '${addon}')]/../..`,
        removeAddon: (addon: string) => `//h3[@class="wc-pao-addon-name" and contains(text(), '${addon}')]/../..//button[contains(@class, "wc-pao-remove-addon")]`,
        confirmRemove: 'button.swal2-confirm',
        option: {
            enterAnOption: '//input[@placeholder="Enter an option"]',
            optionPriceType: 'select.wc-pao-addon-option-price-type',
            optionPriceInput: 'div.wc-pao-addon-content-price input.wc_input_price',
        },
    },
};

// ============================================================================
// DATA SHAPES (match testData.data.vendor.addon() / .product.productInfo.addon)
// ============================================================================
export interface GlobalAddonData {
    name: string;
    priority: string;
    category: string;
    type: string;
    displayAs: string;
    title: string;
    formatTitle: string;
    addDescription: string;
    enterAnOption: string;
    optionPriceType: string;
    optionPriceInput: string;
    saveSuccessMessage?: string;
    deleteSuccessMessage: string;
}

export interface ProductAddonData {
    type: string;
    displayAs: string;
    title: string;
    formatTitle: string;
    addDescription: string;
    enterAnOption: string;
    optionPriceType: string;
    optionPriceInput: string;
}

// ---- shared navigation helper (base-class goIfNotThere semantics) -----------
async function goIfNotThere(page: Page, subPath: string): Promise<void> {
    const target = toPath(subPath).replace(/\/$/, '');
    if (page.url().replace(/\/$/, '') === target) return;
    await expect(async () => {
        await page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
        expect(page.url()).toContain(subPath);
    }).toPass();
}

// ============================================================================
// GLOBAL PRODUCT ADD-ON PAGE (vendor dashboard settings)
// ============================================================================
export class ProductAddonsPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // recursively assert every string selector in an object is visible (skips functions)
    private async multipleElementVisible(selectors: { [key: string]: any }): Promise<void> {
        for (const key in selectors) {
            const value = selectors[key];
            if (typeof value === 'function') continue;
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                await this.multipleElementVisible(value);
            } else {
                await expect(this.page.locator(value)).toBeVisible();
            }
        }
    }

    // enable product addon module
    async enableProductAddonModule(): Promise<void> {
        // vendor dashboard settings menu
        await this.page.goto(toPath(subUrls.dashboard), { waitUntil: 'domcontentloaded' });
        await this.page.locator(menusVendor.settings).hover();
        await expect(this.page.locator(menusVendor.addons)).toBeVisible();

        // vendor dashboard
        await this.page.goto(toPath(subUrls.products), { waitUntil: 'domcontentloaded' });
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(productsVendor.addNewProduct).click()]);
        await expect(this.page.locator(productsVendor.addon.addonSection)).toBeVisible();
    }

    // disable product addon module
    async disableProductAddonModule(): Promise<void> {
        // vendor dashboard settings menu
        await this.page.goto(toPath(subUrls.dashboard), { waitUntil: 'domcontentloaded' });
        await this.page.locator(menusVendor.settings).hover();
        await expect(this.page.locator(menusVendor.addons)).toBeHidden();

        // vendor dashboard settings menu page
        await this.page.goto(toPath(subUrls.settingsAddon), { waitUntil: 'domcontentloaded' });
        await expect(this.page.locator(addonsVendor.productAddonsDiv)).toBeHidden();

        // vendor dashboard
        await this.page.goto(toPath(subUrls.products), { waitUntil: 'domcontentloaded' });
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(productsVendor.addNewProduct).click()]);
        await expect(this.page.locator(productsVendor.addon.addonSection)).toBeHidden();
    }

    // product addons render properly
    async vendorProductAddonsSettingsRenderProperly(): Promise<void> {
        await goIfNotThere(this.page, subUrls.settingsAddon);

        // product addon text is visible
        await expect(this.page.locator(addonsVendor.productAddonsText)).toBeVisible();

        // visit store link is visible
        await expect(this.page.locator(addonsVendor.visitStore)).toBeVisible();

        // create new addon text is visible
        await expect(this.page.locator(addonsVendor.createNewAddon)).toBeVisible();

        // product addon table elements are visible
        await this.multipleElementVisible(addonsVendor.table);

        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(addonsVendor.createNewAddon).click()]);
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrls.ajax) && resp.status() === 200),
            this.page.locator(addonsVendor.addon.addField).click(),
        ]);
        await this.page.locator(addonsVendor.addon.addDescription).check();

        // product addon field elements are visible (mirrors the pre-refactor destructure filter)
        const a = addonsVendor.addon;
        const addonFields = {
            name: a.name,
            priority: a.priority,
            productCategories: a.productCategories,
            addField: a.addField,
            type: a.type,
            displayAs: a.displayAs,
            titleRequired: a.titleRequired,
            formatTitle: a.formatTitle,
            addDescription: a.addDescription,
            descriptionInput: a.descriptionInput,
            requiredField: a.requiredField,
            import: a.import,
            export: a.export,
            expandAll: a.expandAll,
            closeAll: a.closeAll,
            publishOrUpdate: a.publishOrUpdate,
        };
        await this.multipleElementVisible(addonFields);

        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(addonsVendor.backToAddonLists).click()]);
    }

    // goto addon edit
    private async goToAddonEdit(addonId: string): Promise<void> {
        await goIfNotThere(this.page, subUrls.settingsAddonEdit(addonId));
    }

    // save addon
    private async saveAddon(): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrls.settingsAddon) && resp.status() === 200),
            this.page.locator(addonsVendor.addon.publishOrUpdate).click(),
        ]);
        expect(response.status()).toBe(200);
        await expect(this.page.locator(addonsVendor.addon.addonUpdateSuccessMessage)).toContainText(messages.addonSaved);
    }

    // update addon fields
    private async updateAddonFields(addon: GlobalAddonData, add = true): Promise<void> {
        await this.page.locator(addonsVendor.addon.name).fill(addon.name);
        await this.page.locator(addonsVendor.addon.priority).fill(addon.priority);

        // category (select2)
        await this.page.locator(addonsVendor.addon.productCategories).click();
        await this.page.locator(addonsVendor.addon.productCategories).fill(addon.category);
        await expect(this.page.locator(addonsVendor.addon.result)).toContainText(addon.category);
        await this.page.keyboard.press('Enter');

        if (add) {
            await Promise.all([
                this.page.waitForResponse(resp => resp.url().includes(subUrls.ajax) && resp.status() === 200),
                this.page.locator(addonsVendor.addon.addField).click(),
            ]);
        } else {
            await this.page.locator(addonsVendor.addon.addonRow(addon.title)).click();
        }

        await this.page.locator(addonsVendor.addon.type).selectOption({ value: addon.type });
        await this.page.locator(addonsVendor.addon.displayAs).selectOption({ value: addon.displayAs });
        await this.page.locator(addonsVendor.addon.titleRequired).fill(addon.title);
        await this.page.locator(addonsVendor.addon.formatTitle).selectOption({ value: addon.formatTitle });
        await this.page.locator(addonsVendor.addon.addDescription).check();
        await this.page.locator(addonsVendor.addon.descriptionInput).fill(addon.addDescription);
        await this.page.locator(addonsVendor.addon.requiredField).uncheck();
        await this.page.locator(addonsVendor.addon.option.enterAnOption).fill(addon.enterAnOption);
        await this.page.locator(addonsVendor.addon.option.optionPriceType).selectOption({ value: addon.optionPriceType });
        await this.page.locator(addonsVendor.addon.option.optionPriceInput).fill(addon.optionPriceInput);

        await this.saveAddon();
    }

    // add addon
    async addAddon(addon: GlobalAddonData): Promise<void> {
        await goIfNotThere(this.page, subUrls.settingsAddon);
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(addonsVendor.createNewAddon).click()]);
        await this.updateAddonFields(addon);
    }

    // edit addon
    async editAddon(addon: GlobalAddonData): Promise<void> {
        await goIfNotThere(this.page, subUrls.settingsAddon);
        // force the row actions visible to avoid hover flakiness
        await this.page.locator(addonsVendor.rowActions(addon.name)).evaluate((el: HTMLElement) => {
            el.style.visibility = 'visible';
        });
        await this.page.locator(addonsVendor.addonRow(addon.name)).hover();
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(addonsVendor.editAddon(addon.name)).click()]);
        await this.updateAddonFields(addon, false);
    }

    // import addon field
    async importAddonField(addonId: string, addon: string, addonTitle: string): Promise<void> {
        await this.goToAddonEdit(addonId);
        await this.page.locator(addonsVendor.addon.import).click();
        await this.page.locator(addonsVendor.addon.importInput).fill(addon);
        await expect(this.page.locator(addonsVendor.addon.addonRow(addonTitle))).toBeVisible();
        await this.saveAddon();
        await expect(this.page.locator(addonsVendor.addon.addonRow(addonTitle))).toBeVisible();
    }

    // export addon field
    async exportAddonField(addonId: string, addon: any): Promise<void> {
        await this.goToAddonEdit(addonId);
        await this.page.locator(addonsVendor.addon.export).click();
        const exportedText = await this.page.locator(addonsVendor.addon.exportInput).textContent();
        const exportedAddon = unserialize(exportedText!);
        exportedAddon[0].options.forEach((option: { min: any; max: any }) => {
            delete option.min;
            delete option.max;
        });
        expect(exportedAddon[0]).toEqual(expect.objectContaining(addon));
    }

    // remove addon field
    async removeAddonField(addonId: string, addonFieldTitle: string): Promise<void> {
        await this.goToAddonEdit(addonId);
        await this.page.locator(addonsVendor.addon.removeAddon(addonFieldTitle)).click();
        await this.page.locator(addonsVendor.addon.confirmRemove).click();
        await expect(this.page.locator(addonsVendor.addon.addonRow(addonFieldTitle))).toBeHidden();
    }

    // remove addon
    async removeAddon(addon: GlobalAddonData): Promise<void> {
        await goIfNotThere(this.page, subUrls.settingsAddon);
        await this.page.locator(addonsVendor.addonRow(addon.name)).hover();
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(addonsVendor.deleteAddon(addon.name)).click()]);
        await expect(this.page.locator(addonsVendor.addon.addonUpdateSuccessMessage)).toContainText(addon.deleteSuccessMessage);
    }
}

// ============================================================================
// PER-PRODUCT ADD-ONS (classic product-edit screen)
// ============================================================================
export class ProductsPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // vendor search product
    private async searchProduct(productName: string): Promise<void> {
        await goIfNotThere(this.page, subUrls.products);
        await this.page.locator(productsVendor.search.searchInput).fill(productName);
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrls.products) && resp.status() === 200),
            this.page.locator(productsVendor.search.searchBtn).click(),
        ]);
        await expect(this.page.locator(productsVendor.productLink(productName))).toBeVisible();
    }

    // go to product edit (search-based, name is not numeric)
    private async goToProductEdit(productName: string): Promise<void> {
        await this.searchProduct(productName);
        // force the row actions visible to avoid hover flakiness
        await this.page.locator(productsVendor.rowActions(productName)).evaluate((el: HTMLElement) => el.removeAttribute('class'));
        await this.page.locator(productsVendor.productCell(productName)).hover();
        const [, response] = await Promise.all([
            // eslint-disable-next-line playwright/no-networkidle
            this.page.waitForLoadState('networkidle'),
            this.page.waitForResponse(resp => resp.url().includes(subUrls.products) && resp.status() === 200),
            this.page.locator(productsVendor.editProduct(productName)).click(),
        ]);
        expect(response.status()).toBe(200);
        await expect(this.page.locator(productsVendor.title)).toHaveValue(productName);
    }

    // go to product edit by id (numeric -> direct nonce URL, else search)
    private async goToProductEditById(productId: string): Promise<void> {
        if (productId && !Number.isNaN(Number(productId))) {
            const nonce = process.env.PRODUCT_EDIT_NONCE ?? '';
            await this.page.goto(toPath(subUrls.productEdit(productId, nonce)), { waitUntil: 'networkidle' });
        } else {
            await this.goToProductEdit(productId);
        }
    }

    // save product
    private async saveProduct(): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrls.products) && resp.status() === 200),
            this.page.locator(productsVendor.saveProduct).click(),
        ]);
        expect(response.status()).toBe(200);
        await expect(this.page.locator(productsVendor.updatedSuccessMessage)).toContainText(messages.productSaved);
    }

    // add product addon
    async addProductAddon(productName: string, addon: ProductAddonData): Promise<void> {
        await this.goToProductEditById(productName);
        await expect(async () => {
            await Promise.all([
                this.page.waitForResponse(resp => resp.url().includes(subUrls.ajax) && resp.status() === 200),
                this.page.locator(productsVendor.addon.addField).click(),
            ]);
            await expect(this.page.locator(productsVendor.addon.addonForm)).toBeVisible();
        }).toPass();

        await this.page.locator(productsVendor.addon.type).selectOption({ value: addon.type });
        await this.page.locator(productsVendor.addon.displayAs).selectOption({ value: addon.displayAs });
        await this.page.locator(productsVendor.addon.titleRequired).fill(addon.title);
        await this.page.locator(productsVendor.addon.formatTitle).selectOption({ value: addon.formatTitle });
        await this.page.locator(productsVendor.addon.addDescription).check();
        await this.page.locator(productsVendor.addon.descriptionInput).fill(addon.addDescription);
        await this.page.locator(productsVendor.addon.requiredField).check();
        // option
        await this.page.locator(productsVendor.addon.option.enterAnOption).fill(addon.enterAnOption);
        await this.page.locator(productsVendor.addon.option.optionPriceType).selectOption({ value: addon.optionPriceType });
        await this.page.locator(productsVendor.addon.option.optionPriceInput).fill(addon.optionPriceInput);
        await this.page.locator(productsVendor.addon.excludeAddons).check();

        await this.saveProduct();

        await expect(this.page.locator(productsVendor.addon.addonRow(addon.title))).toBeVisible();
        await this.page.locator(productsVendor.addon.addonRow(addon.title)).click();

        // assert persisted values
        await expect(this.page.locator(productsVendor.addon.type)).toHaveValue(addon.type);
        await expect(this.page.locator(productsVendor.addon.displayAs)).toHaveValue(addon.displayAs);
        await expect(this.page.locator(productsVendor.addon.titleRequired)).toHaveValue(addon.title);
        await expect(this.page.locator(productsVendor.addon.formatTitle)).toHaveValue(addon.formatTitle);
        await expect(this.page.locator(productsVendor.addon.addDescription)).toBeChecked();
        await expect(this.page.locator(productsVendor.addon.descriptionInput)).toHaveValue(addon.addDescription);
        await expect(this.page.locator(productsVendor.addon.requiredField)).toBeChecked();
        // option
        await expect(this.page.locator(productsVendor.addon.option.enterAnOption)).toHaveValue(addon.enterAnOption);
        await expect(this.page.locator(productsVendor.addon.option.optionPriceType)).toHaveValue(addon.optionPriceType);
        await expect(this.page.locator(productsVendor.addon.option.optionPriceInput)).toHaveValue(addon.optionPriceInput);
        await expect(this.page.locator(productsVendor.addon.excludeAddons)).toBeChecked();
    }

    // import addon
    async importAddon(productName: string, addon: string, addonTitle: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.page.locator(productsVendor.addon.import).click();
        await this.page.locator(productsVendor.addon.importInput).fill(addon);
        await this.saveProduct();
        await expect(this.page.locator(productsVendor.addon.addonRow(addonTitle))).toBeVisible();
    }

    // export addon
    async exportAddon(productName: string, addon: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.page.locator(productsVendor.addon.export).click();
        await expect(this.page.locator(productsVendor.addon.exportInput)).toContainText(addon);
    }

    // remove addon
    async removeAddon(productName: string, addonName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.page.locator(productsVendor.addon.removeAddon(addonName)).click();
        await this.page.locator(productsVendor.addon.confirmRemove).click();
        await expect(this.page.locator(productsVendor.addon.addonRow(addonName))).toBeHidden();
        await this.saveProduct();
        await expect(this.page.locator(productsVendor.addon.addonRow(addonName))).toBeHidden();
    }
}
