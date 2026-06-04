import { Page, expect, request, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { toPath, SERVER_URL } from '@utils/helpers';
import { dbUtils } from '@utils/dbUtils';

// ============================================
// ENVIRONMENT
// ============================================
const { ADMIN, ADMIN_PASSWORD, VENDOR_ID } = process.env;

function basicAuth(username: string, password: string): string {
    return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
}

// ============================================
// ROUTES
// ============================================
// List = new React DataViews dashboard. Add/edit form = legacy settings page.
export const globalAddonRoutes = {
    list: 'dashboard/new/#settings/product-addon',
    add: 'dashboard/settings/product-addon/?add=1',
    edit: (id: string) => `dashboard/settings/product-addon/?edit=${id}`,
};

// ============================================
// SELECTORS
// ============================================
export const globalAddonSelectors = {
    // React list
    heading: { name: 'Product Addons' },
    createButton: /Create New Addon/i,
    search: { name: 'Search' },
    noData: 'No data found',
    rowByName: (name: string) => `text=${name}`,

    // Legacy add/edit form
    nameInput: '#addon-reference',
    priorityInput: '#addon-priority',
    categorySelect: '#addon-objects',
    submit: '#submit',
    // Add-on field panel (WC Product Add-ons markup reused by Dokan)
    addFieldButton: '.wc-pao-add-field',
    fieldTypeSelect: '.wc-pao-addon-type-select',
    fieldNameInput: '.wc-pao-addon-content-name',
    optionLabelInput: 'input[name^="product_addon_option_label"]',
    optionPriceInput: 'input[name^="product_addon_option_price"]',
};

// ============================================
// REST SEEDING
// ============================================
// Global add-ons are the `global_product_addon` post type. They are created via
// the WC Product Add-ons REST endpoint (admin), then re-assigned to a vendor by
// flipping post_author — the same approach the legacy add-on suite uses. Vendor
// basic-auth is not relied on, so seeding works on any environment.
export const api = {
    _context: null as APIRequestContext | null,

    async init() {
        this._context = await request.newContext();
    },
    async dispose() {
        await this._context?.dispose();
    },
    adminAuth() {
        return { Authorization: basicAuth(ADMIN!, ADMIN_PASSWORD!) };
    },

    async get(endpoint: string): Promise<any> {
        const r = await this._context!.get(`${SERVER_URL}${endpoint}`, { headers: this.adminAuth() });
        return r.json();
    },
    async post(endpoint: string, data: any): Promise<any> {
        const r = await this._context!.post(`${SERVER_URL}${endpoint}`, { headers: this.adminAuth(), data });
        return r.json();
    },
    async del(endpoint: string): Promise<number> {
        const r = await this._context!.delete(`${SERVER_URL}${endpoint}`, { headers: this.adminAuth() });
        return r.status();
    },

    // A valid global add-on field (every key the WC schema requires).
    field(name: string, optionPrice = '10') {
        return {
            name,
            title_format: 'label',
            description_enable: 0,
            description: '',
            type: 'multiple_choice',
            display: 'select',
            position: 0,
            required: 0,
            restrictions: 0,
            restrictions_type: 'any_text',
            adjust_price: 0,
            price_type: 'flat_fee',
            price: '',
            min: 0,
            max: 0,
            options: [{ label: 'Option 1', price: optionPrice, image: '', price_type: 'flat_fee' }],
        };
    },

    // Create a global add-on (admin-owned) and re-assign it to a vendor.
    async seedGlobalAddon(opts: {
        name?: string;
        priority?: number;
        categoryId?: number;
        fields?: number;
        ownerId?: string;
    } = {}): Promise<{ id: string; name: string }> {
        const name = opts.name ?? `PW Global ${faker.string.nanoid(8)}`;
        const fields = Array.from({ length: opts.fields ?? 1 }, (_, i) => this.field(`${name} Field ${i + 1}`));
        const body = await this.post('/wc-product-add-ons/v1/product-add-ons', {
            name,
            priority: opts.priority ?? 10,
            restrict_to_categories: opts.categoryId ? [opts.categoryId] : [],
            fields,
        });
        const id = String(body.id);
        await this.setAuthor(id, opts.ownerId ?? VENDOR_ID!);
        return { id, name };
    },

    // Re-assign the add-on to a vendor by flipping post_author directly in the DB.
    // `dokan_pa_get_global_addons_for_vendor_staff_vendor` lists global add-ons by
    // the current vendor's post author, so this is what scopes the add-on to them.
    async setAuthor(addonId: string, authorId: string): Promise<void> {
        await dbUtils.updateCell(addonId, authorId);
    },

    async getAllGlobalAddons(): Promise<any[]> {
        const list = await this.get('/wc-product-add-ons/v1/product-add-ons');
        return Array.isArray(list) ? list : [];
    },

    async findByName(name: string): Promise<any | undefined> {
        return (await this.getAllGlobalAddons()).find((a) => a.name === name);
    },

    async deleteAddon(id: string): Promise<void> {
        await this.del(`/wc-product-add-ons/v1/product-add-ons/${id}?force=true`);
    },

    async deleteAllGlobalAddons(): Promise<void> {
        for (const a of await this.getAllGlobalAddons()) {
            await this.deleteAddon(String(a.id));
        }
    },

    async getProductCategoryId(): Promise<number> {
        const cats = await this.get('/wc/v3/products/categories?per_page=1');
        if (Array.isArray(cats) && cats[0]?.id) {
            return Number(cats[0].id);
        }
        const created = await this.post('/wc/v3/products/categories', { name: `pw_cat_${faker.string.nanoid(6)}` });
        return Number(created.id);
    },
};

// ============================================
// PAGE OBJECT
// ============================================
export class ProductAddonGlobalPage {
    constructor(readonly page: Page) {
        // The DataViews list caches the add-on GET, so a reused page serves stale
        // rows after a later seed/delete. Force the response to no-store so every
        // navigation refetches the current list.
        this.page
            .route('**/dokan/v1/vendor/product-addons**', async (route) => {
                if (route.request().method() !== 'GET') {
                    return route.continue();
                }
                const response = await route.fetch();
                await route.fulfill({
                    response,
                    headers: { ...response.headers(), 'cache-control': 'no-store, no-cache, must-revalidate' },
                });
            })
            .catch(() => undefined);

        // Auto-dismiss the Dokan Pro vendor announcement modal (setup.md §10).
        this.page
            .addLocatorHandler(this.page.getByRole('dialog'), async (modal) => {
                await modal
                    .getByRole('button', { name: /close|dismiss/i })
                    .click()
                    .catch(() => undefined);
            })
            .catch(() => undefined);
    }

    // ---- React list ----------------------------------------------------------
    async gotoList(): Promise<void> {
        await this.page.goto(toPath(globalAddonRoutes.list));
        await this.page.waitForLoadState('networkidle');
        await expect(this.page.getByRole('heading', globalAddonSelectors.heading)).toBeVisible({ timeout: 30_000 });
    }

    async assertListRenders(): Promise<void> {
        await this.gotoList();
        await expect(this.page.getByRole('link', { name: globalAddonSelectors.createButton })).toBeVisible();
        await expect(this.page.getByRole('textbox', globalAddonSelectors.search)).toBeVisible();
    }

    async assertRowVisible(name: string): Promise<void> {
        await expect(this.page.getByText(name, { exact: false }).first()).toBeVisible({ timeout: 30_000 });
    }

    async assertEmptyState(): Promise<void> {
        await this.gotoList();
        await expect(this.page.getByText(globalAddonSelectors.noData)).toBeVisible({ timeout: 30_000 });
    }

    async search(term: string): Promise<void> {
        const box = this.page.getByRole('textbox', globalAddonSelectors.search);
        await box.click();
        await box.fill(term);
        await this.page.waitForTimeout(800);
    }

    // Open a row's DataViews actions menu and assert it exposes Edit + Delete.
    // NOTE: end-to-end deletion is asserted in the REST API spec
    // (tests/api/productAddon.spec.ts) — the AddonList DataViews `callback`
    // action does not fire reliably when driven headlessly in this build, so the
    // e2e layer verifies the management affordance and the API layer the effect.
    async assertRowActionsAvailable(name: string): Promise<void> {
        const row = this.page.locator('tr.dataviews-view-table__row', { hasText: name });
        await row.getByRole('button', { name: 'Actions' }).click();
        await expect(this.page.getByRole('menuitem', { name: 'Edit' })).toBeVisible({ timeout: 10_000 });
        await expect(this.page.getByRole('menuitem', { name: 'Delete' })).toBeVisible();
    }

    // ---- Legacy add/edit form ------------------------------------------------
    async gotoAddForm(): Promise<void> {
        await this.page.goto(toPath(globalAddonRoutes.add));
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(globalAddonSelectors.nameInput).waitFor({ state: 'visible', timeout: 30_000 });
    }

    async gotoEditForm(id: string): Promise<void> {
        await this.page.goto(toPath(globalAddonRoutes.edit(id)));
        await this.page.waitForLoadState('domcontentloaded');
    }

    // Fill name/priority, optionally pick a category, add one priced field, publish.
    async createGlobalAddon(opts: { name: string; priority?: number; categoryId?: number; optionPrice?: string }): Promise<void> {
        await this.gotoAddForm();
        await this.page.fill(globalAddonSelectors.nameInput, opts.name);
        if (opts.priority !== undefined) {
            await this.page.fill(globalAddonSelectors.priorityInput, String(opts.priority));
        }
        if (opts.categoryId !== undefined) {
            await this.selectCategory(opts.categoryId);
        }
        await this.addField(`${opts.name} Field`, opts.optionPrice ?? '10');
        await this.submit();
    }

    // #addon-objects is a native multiple <select> enhanced by Select2. Selecting on
    // the underlying element by value (the category id) replaces the "All Products"
    // default; dispatching change keeps the Select2 widget in sync.
    async selectCategory(categoryId: number): Promise<void> {
        const select = this.page.locator(globalAddonSelectors.categorySelect);
        await select.selectOption({ value: String(categoryId) });
        await select.dispatchEvent('change');
    }

    async addField(title: string, optionPrice = '10'): Promise<void> {
        await this.page.locator(globalAddonSelectors.addFieldButton).first().click();
        const nameInput = this.page.locator(globalAddonSelectors.fieldNameInput).last();
        await nameInput.waitFor({ state: 'visible', timeout: 15_000 });
        await nameInput.fill(title);
        const optionLabel = this.page.locator(globalAddonSelectors.optionLabelInput).last();
        if (await optionLabel.isVisible().catch(() => false)) {
            await optionLabel.fill('Option 1');
            await this.page.locator(globalAddonSelectors.optionPriceInput).last().fill(optionPrice);
        }
    }

    async editNameAndPriority(name: string, priority: number): Promise<void> {
        await this.page.fill(globalAddonSelectors.nameInput, name);
        await this.page.fill(globalAddonSelectors.priorityInput, String(priority));
        await this.submit();
    }

    async submit(): Promise<void> {
        await this.page.locator(globalAddonSelectors.submit).click();
        await this.page.waitForLoadState('networkidle');
    }

    // For the negative "no name" case: the required field blocks submit.
    async tryPublishWithoutName(): Promise<void> {
        await this.gotoAddForm();
        await this.page.fill(globalAddonSelectors.nameInput, '');
        await this.addField('No-name field');
        await this.page.locator(globalAddonSelectors.submit).click();
    }

    // Read the value currently in the form's name field (for the cross-vendor test).
    async readFormName(): Promise<string> {
        return this.page.locator(globalAddonSelectors.nameInput).inputValue().catch(() => '');
    }
}
