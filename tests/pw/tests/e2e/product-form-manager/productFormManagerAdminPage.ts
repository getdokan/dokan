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

const { ADMIN, ADMIN_PASSWORD, VENDOR, USER_PASSWORD } = process.env;

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
    async get(endpoint: string, headers?: Record<string, string>): Promise<any> {
        const r = await this._ctx!.get(`${SERVER_URL}${endpoint}`, {
            headers: headers ?? this.adminAuth(),
        });
        return r.json();
    },
    async post(endpoint: string, payload: any, headers?: Record<string, string>): Promise<any> {
        const r = await this._ctx!.post(`${SERVER_URL}${endpoint}`, {
            headers: headers ?? this.adminAuth(),
            data: payload,
        });
        return r.json();
    },
    async del(endpoint: string, headers?: Record<string, string>): Promise<void> {
        await this._ctx!.delete(`${SERVER_URL}${endpoint}`, {
            headers: headers ?? this.adminAuth(),
        });
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
    // toggle: visible in admin, not mandatory, currently visible, optional, text-like.
    pickOptionalDefaultField(
        schema: SchemaItem[]
    ): { section: SchemaItem; field: SchemaItem } | undefined {
        for (const field of this.fields(schema)) {
            if (field.is_custom || field.is_mandatory) continue;
            if (field.show_in_admin === false) continue;
            if (field.visibility === false) continue;
            const section = schema.find(
                (s) => s.type === 'section' && s.id === field.section_id
            );
            if (!section || section.show_in_admin === false) continue;
            return { section, field };
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
        const json = await this.post(
            '/dokan/v1/products',
            {
                name: `PW PFM ${faker.string.nanoid(6)}`,
                type: 'simple',
                regular_price: '20',
                status: 'publish',
                categories: [{ id: categoryId }],
            },
            this.vendorAuth()
        );
        return String(json.id);
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
    async goto(): Promise<void> {
        await this.page.goto(toPath('wp-admin/admin.php?page=dokan-dashboard#/product-form-manager'));
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
        const option = this.page
            .locator('.react-select__option')
            .filter({ hasText: label })
            .first();
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
        await this.page.goto(toPath(`dashboard/new/#/products/${productId}/edit`));
        await this.page.waitForLoadState('domcontentloaded');
        await this.page
            .locator('#dokan-vendor-dashboard-root')
            .waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForFunction(
            () => Boolean((window as any).dokanProductEditor?.product_id),
            undefined,
            { timeout: 30000 }
        );
    }

    vendorField(fieldId: string): Locator {
        return this.page.locator(`#dokan-form-field-${fieldId}`);
    }

    async assertVendorFieldVisible(fieldId: string): Promise<void> {
        await expect(this.vendorField(fieldId)).toBeVisible({ timeout: 15000 });
    }

    async assertVendorFieldAbsent(fieldId: string): Promise<void> {
        await expect(this.vendorField(fieldId)).toHaveCount(0);
    }

    async assertVendorSeesText(text: string): Promise<void> {
        await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({
            timeout: 15000,
        });
    }
}
