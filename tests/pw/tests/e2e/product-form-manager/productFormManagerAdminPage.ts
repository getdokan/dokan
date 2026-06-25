import { Page, Locator, expect, request, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { toPath, SERVER_URL } from '@utils/helpers';

// ============================================================================
// Product Form Manager (Dokan Pro `product-editor` module)
// ----------------------------------------------------------------------------
// The admin configures the vendor product form at:
//   wp-admin/admin.php?page=dokan-dashboard#/product-form-manager
// Config persists through GET/POST /dokan/v1/product-editor/settings into the
// `dokan_product_editor` option, and is consumed by the vendor product editor
// (dokan-lite/src/dashboard/product-editor). This page object drives the real
// admin builder UI and verifies the result via REST, then drives the vendor
// editor to confirm the config is reflected.
//
// Schema item shapes (see admin/utils/schema.ts):
//   section: { id, type:'section', label, description?, visibility, is_custom?, is_mandatory?, priority }
//   field:   { id, section_id, type:'field', label, variant, visibility, required,
//              is_custom?, is_mandatory?, show_in_admin?, options?, labels?, visibilities?, requireds? }
// ============================================================================

const { ADMIN, ADMIN_PASSWORD, VENDOR, CUSTOMER, USER_PASSWORD } = process.env;

// The admin builder + REST routes live behind the Dokan Pro `product_editor`
// module. Every /dokan/v1/product-editor/* route 404s until it is activated.
export const PRODUCT_EDITOR_MODULE_ID = 'product_editor';

function basicAuth(username: string, password: string): string {
    return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
}

// ----------------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------------
export type FieldVariant =
    | 'text'
    | 'number'
    | 'textarea'
    | 'editor'
    | 'radio'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'datetime'
    | 'image'
    | 'file';

// Human label shown in the Field Type dropdown for each variant.
export const VARIANT_LABEL: Record<FieldVariant, string> = {
    text: 'Text',
    number: 'Number',
    textarea: 'Textarea',
    editor: 'Rich Text',
    radio: 'Radio',
    select: 'Select',
    multiselect: 'Multi Select',
    checkbox: 'Checkbox',
    datetime: 'Date Picker',
    image: 'Image',
    file: 'File',
};

export interface CustomFieldSpec {
    label: string;
    variant?: FieldVariant;
    description?: string;
    placeholder?: string;
    options?: string[]; // labels for select/multiselect/radio
}

export interface SchemaItem {
    id: string;
    section_id?: string | null;
    type: 'section' | 'field';
    label: string;
    description?: string;
    placeholder?: string;
    variant?: string;
    visibility?: boolean;
    required?: boolean;
    is_custom?: boolean;
    is_mandatory?: boolean;
    show_in_admin?: boolean;
    options?: { label: string; value: string }[];
    labels?: Record<string, string>;
    visibilities?: Record<string, boolean>;
    requireds?: Record<string, boolean>;
}

// ----------------------------------------------------------------------------
// TEST DATA
// ----------------------------------------------------------------------------
export const data = {
    customBlock: (suffix: string) => ({
        label: `PW Block ${suffix}`,
        description: `Block desc ${suffix}`.slice(0, 32),
    }),
    customField: (suffix: string, variant: FieldVariant = 'text'): CustomFieldSpec => ({
        label: `PW Field ${suffix}`,
        variant,
        description: `Field desc ${suffix}`,
        placeholder: `Enter ${suffix}`,
    }),
};

// Default fields the "default field" tests target. A field qualifies only if it
// is a real, vendor-facing core field that is safe to toggle: non-custom,
// non-mandatory, optional, visible & admin-editable, AND renders in the vendor
// product editor inside a `#dokan-form-field-{id}` wrapper (so the vendor-
// reflection assertions can find it). These ids are tried in order; the first one
// present in the live schema (and still matching those constraints) wins.
//
// Curated on purpose: an active module can inject schema items that look like
// default fields but aren't safe to target. The Product Add-ons module injects
// `product_addons_sub_*` checkbox CONFIG toggles that are `required:true`, never
// render as vendor product fields, and have `is_mandatory` force-cleared by the
// module (ProductEditorFields::clear_legacy_mandatory_flags). Those sort ahead of
// the core fields, so an unfiltered scan used to grab one and break the rename /
// required / is_mandatory / vendor-reflection cases.
const PREFERRED_DEFAULT_FIELD_IDS = [
    'purchase_note',
    'short_description',
    'stock_status',
    'tax_class',
    'shipping_class',
];

// Variants whose vendor-editor control renders through the CustomField wrapper
// (emitting `#dokan-form-field-{id}`). Used by the fallback search only.
const VENDOR_WRAPPED_VARIANTS: ReadonlySet<string> = new Set([
    'textarea',
    'editor',
    'select',
    'multiselect',
    'datetime',
    'image',
    'gallery',
    'file',
    'async_select',
    'attributes',
]);

// ----------------------------------------------------------------------------
// API CLIENT
// ----------------------------------------------------------------------------
export const api = {
    _ctx: null as APIRequestContext | null,
    _baseline: null as SchemaItem[] | null,

    async init() {
        this._ctx = await request.newContext();
    },
    async dispose() {
        await this._ctx?.dispose();
    },
    adminAuth() {
        return { Authorization: basicAuth(ADMIN!, ADMIN_PASSWORD!) };
    },
    vendorAuth() {
        return { Authorization: basicAuth(VENDOR!, USER_PASSWORD!) };
    },
    customerAuth() {
        return { Authorization: basicAuth(CUSTOMER!, USER_PASSWORD!) };
    },
    // Generous request timeout to absorb transient slowness under parallel workers.
    _reqTimeout: 30000,
    async get(endpoint: string, headers?: Record<string, string>): Promise<any> {
        const r = await this._ctx!.get(`${SERVER_URL}${endpoint}`, {
            headers: headers ?? this.adminAuth(),
            timeout: this._reqTimeout,
        });
        return r.json();
    },
    async post(endpoint: string, payload: any, headers?: Record<string, string>): Promise<any> {
        const r = await this._ctx!.post(`${SERVER_URL}${endpoint}`, {
            headers: headers ?? this.adminAuth(),
            data: payload,
            timeout: this._reqTimeout,
        });
        return r.json();
    },
    async del(endpoint: string, headers?: Record<string, string>): Promise<void> {
        await this._ctx!.delete(`${SERVER_URL}${endpoint}`, {
            headers: headers ?? this.adminAuth(),
            timeout: this._reqTimeout,
        });
    },
    // POST that returns the raw HTTP status — used by permission negatives where
    // we assert a 401/403 rather than parsing the WP_Error body.
    async postStatus(
        endpoint: string,
        payload: any,
        headers?: Record<string, string>
    ): Promise<number> {
        const r = await this._ctx!.post(`${SERVER_URL}${endpoint}`, {
            headers: headers ?? this.adminAuth(),
            data: payload,
            timeout: this._reqTimeout,
        });
        return r.status();
    },
    async put(endpoint: string, payload: any, headers?: Record<string, string>): Promise<any> {
        const r = await this._ctx!.put(`${SERVER_URL}${endpoint}`, {
            headers: headers ?? this.adminAuth(),
            data: payload,
            timeout: this._reqTimeout,
        });
        return r.json();
    },

    // --- Module activation -----------------------------------------------------
    _moduleWasInactive: false,
    // Activate the product_editor module (remembering whether it was off) so the
    // spec is self-sufficient on a fresh env where the module ships inactive.
    async ensureModuleActive(): Promise<void> {
        const isActive = (list: any): boolean =>
            Array.isArray(list) &&
            (list as Array<{ id: string; active?: boolean }>).find(
                (m) => m.id === PRODUCT_EDITOR_MODULE_ID
            )?.active === true;

        const before = await this.get('/dokan/v1/admin/modules');
        this._moduleWasInactive = !isActive(before);

        if (this._moduleWasInactive) {
            await this.put('/dokan/v1/admin/modules/activate', {
                module: [PRODUCT_EDITOR_MODULE_ID],
            });
        }

        // Fail fast with a clear precondition error: confirm the module is active
        // AND its REST route actually serves the form schema. Without this guard a
        // failed activation (e.g. Dokan Pro inactive) surfaces later as confusing
        // "not persisted" assertion failures instead of an actionable message.
        const after = await this.get('/dokan/v1/admin/modules');
        const schema = await this.getSchema();
        if (!isActive(after) || schema.length === 0) {
            throw new Error(
                'Precondition failed: the "product_editor" (Product Form Manager) module ' +
                    'is not active or GET /dokan/v1/product-editor/settings returned no schema. ' +
                    'Ensure Dokan Pro is active and the product_editor module can be enabled ' +
                    'before running these tests.'
            );
        }
    },
    // Leave the env exactly as found: only deactivate if it was inactive before.
    async restoreModuleState(): Promise<void> {
        if (this._moduleWasInactive) {
            await this.put('/dokan/v1/admin/modules/deactivate', {
                module: [PRODUCT_EDITOR_MODULE_ID],
            }).catch(() => undefined);
        }
    },

    // --- Form Manager settings -------------------------------------------------
    async getSchema(): Promise<SchemaItem[]> {
        const res = await this.get('/dokan/v1/product-editor/settings');
        return Array.isArray(res?.schema) ? res.schema : [];
    },
    async saveSchema(schema: SchemaItem[]): Promise<void> {
        await this.post('/dokan/v1/product-editor/settings', { schema });
    },
    // Snapshot the default schema once, restore it after each test so the global
    // option never leaks state into other product-editor tests.
    async captureBaseline(): Promise<void> {
        this._baseline = await this.getSchema();
    },
    async restoreBaseline(): Promise<void> {
        if (this._baseline) {
            await this.saveSchema(this._baseline);
        }
    },

    // Schema query helpers (operate on a fresh GET unless a schema is passed).
    sections(schema: SchemaItem[]): SchemaItem[] {
        return schema.filter((i) => i.type === 'section');
    },
    fields(schema: SchemaItem[]): SchemaItem[] {
        return schema.filter((i) => i.type === 'field');
    },
    sectionByLabel(schema: SchemaItem[], label: string): SchemaItem | undefined {
        return schema.find((i) => i.type === 'section' && i.label === label);
    },
    fieldByLabel(schema: SchemaItem[], label: string): SchemaItem | undefined {
        return schema.find((i) => i.type === 'field' && i.label === label);
    },
    // A default (non-custom) field that is editable in the admin UI and safe to
    // toggle: visible in admin, not mandatory, currently visible, optional, and
    // vendor-facing. Prefers a curated core field (see PREFERRED_DEFAULT_FIELD_IDS)
    // so a module-injected pseudo-field can never be picked; falls back to any
    // optional default field that renders the vendor `#dokan-form-field-{id}`
    // wrapper.
    pickOptionalDefaultField(
        schema: SchemaItem[]
    ): { section: SchemaItem; field: SchemaItem } | undefined {
        const isEditableOptional = (field: SchemaItem): boolean =>
            field.type === 'field' &&
            !field.is_custom &&
            !field.is_mandatory &&
            field.show_in_admin !== false &&
            field.visibility !== false &&
            field.required !== true;
        const adminSectionOf = (field: SchemaItem): SchemaItem | undefined =>
            schema.find(
                (s) =>
                    s.type === 'section' &&
                    s.id === field.section_id &&
                    s.show_in_admin !== false
            );

        // Prefer a known-stable, vendor-rendering core field.
        for (const id of PREFERRED_DEFAULT_FIELD_IDS) {
            const field = schema.find((i) => i.id === id);
            if (field && isEditableOptional(field)) {
                const section = adminSectionOf(field);
                if (section) return { section, field };
            }
        }

        // Fallback: any optional default field that renders the vendor wrapper.
        for (const field of this.fields(schema)) {
            if (!isEditableOptional(field)) continue;
            if (!VENDOR_WRAPPED_VARIANTS.has(String(field.variant))) continue;
            const section = adminSectionOf(field);
            if (section) return { section, field };
        }
        return undefined;
    },

    // A default field flagged is_mandatory in the PHP schema (e.g. Title) and
    // shown in the admin builder, whose visibility toggle the builder must lock.
    pickMandatoryDefaultField(
        schema: SchemaItem[]
    ): { section: SchemaItem; field: SchemaItem } | undefined {
        const isShownMandatory = (field: SchemaItem): boolean =>
            field.type === 'field' &&
            !field.is_custom &&
            field.is_mandatory === true &&
            field.show_in_admin !== false;
        const adminSectionOf = (field: SchemaItem): SchemaItem | undefined =>
            schema.find(
                (s) =>
                    s.type === 'section' &&
                    s.id === field.section_id &&
                    s.show_in_admin !== false
            );

        for (const field of this.fields(schema)) {
            if (!isShownMandatory(field)) continue;
            const section = adminSectionOf(field);
            if (section) return { section, field };
        }
        return undefined;
    },

    // --- Vendor product helpers ------------------------------------------------
    async getProductCategoryId(): Promise<number> {
        const cats = await this.get('/wc/v3/products/categories?per_page=1');
        if (Array.isArray(cats) && cats[0]?.id) {
            return Number(cats[0].id);
        }
        const created = await this.post('/wc/v3/products/categories', {
            name: `pw_cat_${faker.string.nanoid(6)}`,
        });
        return Number(created.id);
    },
    async createVendorProduct(categoryId: number): Promise<string> {
        return this.createVendorProductWithFields(categoryId, {});
    },
    // Create a vendor product of an explicit type (simple | variable | grouped |
    // external) so the editor can be checked per product type.
    async createVendorProductOfType(
        type: 'simple' | 'variable' | 'grouped' | 'external',
        categoryId: number
    ): Promise<string> {
        const payload: Record<string, any> = {
            name: `PW PFM ${type} ${faker.string.nanoid(6)}`,
            type,
            status: 'publish',
            // `description` and `purchase_note` are required+visible default
            // fields; populate them so the editor's save button (gated by
            // FORM-level validity) is held only by the field under test.
            description: 'PW autotest product description.',
            purchase_note: 'PW autotest purchase note.',
            categories: [{ id: categoryId }],
        };
        if (type === 'simple' || type === 'external') {
            payload.regular_price = '20';
        }
        if (type === 'external') {
            payload.external_url = 'https://example.com';
            payload.button_text = 'Buy';
        }
        const json = await this.post('/dokan/v1/products', payload, this.vendorAuth());
        return String(json.id);
    },
    // Create a vendor-owned product, optionally passing custom-field values as
    // top-level params (keyed by field id). The product_editor save hooks
    // (dokan_new_product_added) persist those as product meta keyed by field id.
    async createVendorProductWithFields(
        categoryId: number,
        extraParams: Record<string, any>
    ): Promise<string> {
        const json = await this.post(
            '/dokan/v1/products',
            {
                name: `PW PFM ${faker.string.nanoid(6)}`,
                type: 'simple',
                regular_price: '20',
                status: 'publish',
                // `description` and `purchase_note` are required+visible default
                // fields; populate them so the editor's save button (gated by
                // FORM-level validity) is held only by the field under test.
                description: 'PW autotest product description.',
                purchase_note: 'PW autotest purchase note.',
                categories: [{ id: categoryId }],
                ...extraParams,
            },
            this.vendorAuth()
        );
        return String(json.id);
    },
    // Read a single product-meta value (by key) from the vendor product. Custom
    // field values only round-trip through REST meta_data when the field id is
    // NOT underscore-prefixed (underscore ids are protected/hidden meta).
    async getProductMetaValue(productId: string, key: string): Promise<any> {
        const product = await this.getProduct(productId);
        const meta = Array.isArray(product?.meta_data) ? product.meta_data : [];
        const found = meta.find((m: { key: string; value: any }) => m?.key === key);
        return found ? found.value : undefined;
    },
    async deleteProduct(productId: string): Promise<void> {
        await this.del(`/dokan/v1/products/${productId}?force=true`, this.vendorAuth());
    },
    async getProduct(productId: string): Promise<any> {
        return this.get(`/dokan/v1/products/${productId}`, this.vendorAuth());
    },
};

// ----------------------------------------------------------------------------
// SELECTORS
// ----------------------------------------------------------------------------
export const selectors = {
    pageHeading: 'h1:has-text("Product Form Manager"), h2:has-text("Product Form Manager")',
    saveChanges: 'button:has-text("Save Changes")',
    savedToast: 'text=/Settings saved successfully/i',
    // A section/block card (default sections + created custom blocks).
    sectionCard: 'div.shadow-sm.overflow-hidden',
    fieldRow: 'div.grid.grid-cols-12',
};

// ----------------------------------------------------------------------------
// PAGE OBJECT
// ----------------------------------------------------------------------------
export class ProductFormManager {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void this.installAnnouncementModalHandler();
    }

    private async installAnnouncementModalHandler(): Promise<void> {
        const flag = '__dokanAnnouncementModalHandlerInstalled' as const;
        const pwf = this.page as Page & { [flag]?: boolean };
        if (pwf[flag]) return;
        pwf[flag] = true;
        const modal = this.page.locator('.vendor-announcement-modal');
        await this.page
            .addLocatorHandler(
                modal,
                async () => {
                    const btn = modal.locator('button[aria-label="Close"]').first();
                    if (await btn.isVisible().catch(() => false)) {
                        await btn.click({ timeout: 2000 }).catch(() => undefined);
                    } else {
                        await this.page.keyboard.press('Escape').catch(() => undefined);
                    }
                },
                { noWaitAfter: true }
            )
            .catch(() => undefined);
    }

    // ========================================================================
    // ADMIN: navigation & tabs
    // ========================================================================
    // Both the admin builder and the vendor editor are hash-routed SPAs. Calling
    // page.goto() with only a changed URL fragment is a no-op (no document
    // reload), so React state — active tab, open edit panels, the in-memory
    // schema, the loaded product — would leak from the previous test. Routing
    // through about:blank forces a fresh document load and a clean React mount
    // every time, which is what isolates these tests from one another.
    private async freshGoto(url: string): Promise<void> {
        await this.page.goto('about:blank');
        // Resolve as soon as the document is parsed rather than waiting for the
        // full `load` event — the WP dashboard pulls many assets and `load` can
        // exceed the default 30s under CI/parallel load. Readiness is then gated
        // by the explicit element waits in goto()/gotoVendorEditor().
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    }

    async goto(): Promise<void> {
        await this.freshGoto(
            toPath('wp-admin/admin.php?page=dokan-dashboard#/product-form-manager')
        );
        await this.page.waitForLoadState('domcontentloaded');
        await this.page
            .getByRole('button', { name: 'Save Changes' })
            .waitFor({ state: 'visible', timeout: 30000 });
    }

    async switchTab(tab: 'Default Block' | 'Custom Block'): Promise<void> {
        const byRole = this.page.getByRole('tab', { name: tab });
        if (await byRole.count()) {
            await byRole.first().click();
        } else {
            // Fallback: DokanTab may render the tab label as a button.
            await this.page.getByRole('button', { name: tab, exact: true }).first().click();
        }
    }

    // ========================================================================
    // ADMIN: card / row scoping
    // ========================================================================
    sectionCard(label: string): Locator {
        return this.page
            .locator(selectors.sectionCard)
            .filter({ has: this.page.getByRole('heading', { name: label, exact: true }) });
    }

    private fieldRow(card: Locator, fieldLabel: string): Locator {
        return card
            .locator(selectors.fieldRow)
            .filter({ has: this.page.getByText(fieldLabel, { exact: true }) });
    }

    // Field-edit / add panel inputs (FieldEditPanel) — only one open at a time.
    private fieldLabelInput(): Locator {
        return this.page.getByPlaceholder('Enter field label');
    }
    private fieldDescInput(): Locator {
        return this.page.getByPlaceholder('Write down');
    }
    private fieldPlaceholderInput(): Locator {
        return this.page.getByPlaceholder('Enter placeholder text');
    }
    private panelSaveButton(scope: Locator): Locator {
        return scope.getByRole('button', { name: 'Save', exact: true });
    }

    private async pickFieldType(label: string): Promise<void> {
        // react-select (@dokan/components) — control opens a portal menu.
        await this.page.locator('.react-select__control').first().click();
        // Exact match: "Select" must not also resolve "Multi Select" (strict-mode).
        const option = this.page.getByRole('option', { name: label, exact: true }).first();
        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click();
    }

    // ========================================================================
    // ADMIN: custom blocks
    // ========================================================================
    /** Create a custom block on the Custom Block tab. Returns the block label. */
    async createCustomBlock(block: { label: string; description?: string }): Promise<string> {
        await this.switchTab('Custom Block');
        await this.page.getByRole('button', { name: 'Create Block' }).click();

        // The create panel is the innermost div holding both the description
        // input and a Save button.
        const panel = this.page
            .locator('div')
            .filter({ has: this.page.locator('#block-description') })
            .filter({ has: this.page.getByRole('button', { name: 'Save', exact: true }) })
            .last();
        await this.page.getByPlaceholder('Write here').first().fill(block.label);
        if (block.description) {
            await this.page.locator('#block-description').fill(block.description);
        }
        await this.panelSaveButton(panel).click();

        // The block now renders as a section card.
        await expect(this.sectionCard(block.label)).toBeVisible({ timeout: 10000 });
        return block.label;
    }

    async editCustomBlock(currentLabel: string, newLabel: string, newDesc?: string): Promise<void> {
        const card = this.sectionCard(currentLabel);
        await card.getByRole('button', { name: 'Edit Block' }).click();
        // SectionEditPanel inputs.
        await this.page.getByPlaceholder('Enter section label').fill(newLabel);
        if (newDesc !== undefined) {
            await this.page.getByPlaceholder('Enter section description').fill(newDesc);
        }
        // The edit panel renders inside the card; its Save is the card's only exact "Save".
        await this.panelSaveButton(card).click();
        await expect(this.sectionCard(newLabel)).toBeVisible({ timeout: 10000 });
    }

    async deleteCustomBlock(label: string): Promise<void> {
        const card = this.sectionCard(label);
        await card.getByRole('button', { name: 'Delete section' }).click();
        await this.confirmDeleteModal();
        await expect(this.sectionCard(label)).toHaveCount(0);
    }

    // ========================================================================
    // ADMIN: custom fields
    // ========================================================================
    /** Add a custom field to the named block. Returns the field label. */
    async addCustomField(blockLabel: string, field: CustomFieldSpec): Promise<string> {
        const card = this.sectionCard(blockLabel);
        await card.getByRole('button', { name: 'Add Field' }).click();

        await this.fillFieldPanel(field, true);
        await this.panelSaveButton(card).click();

        await expect(this.fieldRow(card, field.label)).toBeVisible({ timeout: 10000 });
        return field.label;
    }

    async editCustomFieldLabel(blockLabel: string, currentLabel: string, newLabel: string): Promise<void> {
        const card = this.sectionCard(blockLabel);
        const row = this.fieldRow(card, currentLabel);
        await row.getByRole('button', { name: 'Edit field' }).click();
        await this.fieldLabelInput().fill(newLabel);
        await this.panelSaveButton(card).click();
        await expect(this.fieldRow(card, newLabel)).toBeVisible({ timeout: 10000 });
    }

    async deleteCustomField(blockLabel: string, fieldLabel: string): Promise<void> {
        const card = this.sectionCard(blockLabel);
        const row = this.fieldRow(card, fieldLabel);
        await row.getByRole('button', { name: 'Delete field' }).click();
        await this.confirmDeleteModal();
        await expect(this.fieldRow(card, fieldLabel)).toHaveCount(0);
    }

    // Fill the FieldEditPanel (label, type, options, description, placeholder).
    private async fillFieldPanel(field: CustomFieldSpec, isCustom: boolean): Promise<void> {
        await this.fieldLabelInput().fill(field.label);

        if (isCustom && field.variant && field.variant !== 'text') {
            await this.pickFieldType(VARIANT_LABEL[field.variant]);
        }
        if (field.options?.length) {
            for (let i = 0; i < field.options.length; i++) {
                await this.page.getByRole('button', { name: 'Add', exact: true }).click();
                await this.page.getByPlaceholder('Value').nth(i).fill(field.options[i]!);
            }
        }
        if (field.description !== undefined) {
            await this.fieldDescInput().fill(field.description);
        }
        if (field.placeholder !== undefined && (await this.fieldPlaceholderInput().count())) {
            await this.fieldPlaceholderInput().fill(field.placeholder);
        }
    }

    // ========================================================================
    // ADMIN: default field toggles & rename
    // ========================================================================
    async toggleFieldVisibility(sectionLabel: string, fieldLabel: string): Promise<void> {
        const card = this.sectionCard(sectionLabel);
        await this.fieldRow(card, fieldLabel).getByRole('switch').nth(0).click();
    }

    // The visibility toggle of a field row (switch #0). Exposed so a test can
    // assert it is disabled for an is_mandatory field (the builder forbids hiding
    // mandatory fields).
    fieldVisibilitySwitch(sectionLabel: string, fieldLabel: string): Locator {
        return this.fieldRow(this.sectionCard(sectionLabel), fieldLabel)
            .getByRole('switch')
            .nth(0);
    }

    async toggleFieldRequired(sectionLabel: string, fieldLabel: string): Promise<void> {
        const card = this.sectionCard(sectionLabel);
        await this.fieldRow(card, fieldLabel).getByRole('switch').nth(1).click();
    }

    async renameField(sectionLabel: string, fieldLabel: string, newLabel: string): Promise<void> {
        const card = this.sectionCard(sectionLabel);
        const row = this.fieldRow(card, fieldLabel);
        await row.getByRole('button', { name: 'Edit field' }).click();
        await this.fieldLabelInput().fill(newLabel);
        await this.panelSaveButton(card).click();
    }

    // ========================================================================
    // ADMIN: shared
    // ========================================================================
    private async confirmDeleteModal(): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await dialog.waitFor({ state: 'visible', timeout: 10000 });
        await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    }

    async saveChanges(): Promise<void> {
        await this.page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(this.page.locator(selectors.savedToast).first()).toBeVisible({ timeout: 20000 });
    }

    // ========================================================================
    // VENDOR: product editor reflection
    // ========================================================================
    async gotoVendorEditor(productId: string): Promise<void> {
        await this.freshGoto(toPath(`dashboard/new/#/products/${productId}/edit`));
        await this.page.waitForLoadState('domcontentloaded');
        await this.page
            .locator('#dokan-vendor-dashboard-root')
            .waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForFunction(
            () => Boolean((window as any).dokanProductEditor?.product_id),
            undefined,
            { timeout: 30000 }
        );
        // product_id being set only means the editor bootstrapped — the form
        // fields paint a moment later (after /init/fields resolves). Wait for the
        // form to actually render so text/label assertions don't race a slow load.
        await this.page
            .locator('.dokan-form-field-label')
            .first()
            .waitFor({ state: 'visible', timeout: 30000 });
    }

    // The `#dokan-form-field-{id}` wrapper is emitted only by variants that render
    // through the CustomField wrapper (select, textarea, editor, datetime, image,
    // file, async_select, attributes, price…). Plain text/number fields render a
    // bare control with NO such wrapper, so id-based assertions only suit the
    // wrapped variants (default fields use them). For variant-agnostic checks,
    // assert on the rendered field label instead (see *ByLabel helpers).
    vendorField(fieldId: string): Locator {
        return this.page.locator(`#dokan-form-field-${fieldId}`);
    }

    async assertVendorFieldVisible(fieldId: string): Promise<void> {
        await expect(this.vendorField(fieldId)).toBeVisible({ timeout: 15000 });
    }

    async assertVendorFieldAbsent(fieldId: string): Promise<void> {
        await expect(this.vendorField(fieldId)).toHaveCount(0);
    }

    // Every rendered field (custom or default) carries its label in a
    // `.dokan-form-field-label` node — the variant-agnostic way to assert a field
    // is present/absent in the vendor editor regardless of its input wrapper.
    vendorFieldByLabel(label: string): Locator {
        return this.page
            .locator('.dokan-form-field-label')
            .filter({ hasText: label });
    }

    async assertVendorFieldVisibleByLabel(label: string): Promise<void> {
        await expect(this.vendorFieldByLabel(label).first()).toBeVisible({ timeout: 15000 });
    }

    async assertVendorFieldAbsentByLabel(label: string): Promise<void> {
        await expect(this.vendorFieldByLabel(label)).toHaveCount(0);
    }

    // A field's help text (description) renders verbatim in the vendor editor.
    // The wrapper class differs per variant (text/select/etc. use
    // `.dokan-form-field-description`; number/radio/checkbox render it on the bare
    // control), so assert on the unique description text itself.
    async assertVendorDescriptionVisible(description: string): Promise<void> {
        await expect(this.page.getByText(description, { exact: false }).first()).toBeVisible({
            timeout: 15000,
        });
    }

    // Placeholder-capable variants (text, textarea) surface the configured
    // placeholder as the control's `placeholder` attribute.
    async assertVendorPlaceholderVisible(placeholder: string): Promise<void> {
        await expect(
            this.page
                .locator(
                    `input[placeholder="${placeholder}"], textarea[placeholder="${placeholder}"]`
                )
                .first()
        ).toBeVisible({ timeout: 15000 });
    }

    async assertVendorSeesText(text: string): Promise<void> {
        await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({
            timeout: 15000,
        });
    }

    // ========================================================================
    // VENDOR: save / fill (for required-field enforcement during create & edit)
    // ========================================================================
    // The editor's save button is rendered into the dashboard header via a Fill
    // slot; its label is "Update Product" (existing product) or "Save Changes"
    // (new), and it is `disabled` whenever the form is invalid — so a required
    // field left empty disables it.
    vendorSaveButton(): Locator {
        return this.page
            .getByRole('button', { name: /Update Product|Save Changes/ })
            .first();
    }

    async fillVendorFieldByPlaceholder(placeholder: string, value: string): Promise<void> {
        await this.page.getByPlaceholder(placeholder).first().fill(value);
    }

    // A CustomField-wrapped field (textarea/select/…) renders a "(REQUIRED)"
    // marker beside its label when configured required. Scoped to the field's
    // #dokan-form-field-{id} wrapper so other required fields don't interfere.
    async assertVendorFieldRequiredMarker(fieldId: string): Promise<void> {
        await expect(
            this.vendorField(fieldId).getByText('(REQUIRED)', { exact: false })
        ).toBeVisible({ timeout: 15000 });
    }

    async assertVendorFieldNoRequiredMarker(fieldId: string): Promise<void> {
        await expect(this.vendorField(fieldId)).toBeVisible({ timeout: 15000 });
        await expect(
            this.vendorField(fieldId).getByText('(REQUIRED)', { exact: false })
        ).toHaveCount(0);
    }

    // Click save and wait for the success toast ("Product saved successfully.").
    async saveVendorProduct(): Promise<void> {
        await this.vendorSaveButton().click();
        await expect(
            this.page.getByText('Product saved successfully.', { exact: false }).first()
        ).toBeVisible({ timeout: 20000 });
    }
}
