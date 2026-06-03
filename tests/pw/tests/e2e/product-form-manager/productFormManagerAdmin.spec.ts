import { test, expect, Page } from '@utils/test';
import { request } from '@playwright/test';
import {
    ProductFormManager,
    api,
    data,
    type FieldVariant,
    type SchemaItem,
} from './productFormManagerAdminPage';
import path from 'path';

// ============================================================================
// Product Form Manager (Dokan Pro `product-editor` module) — full coverage.
//
// Admin configures the vendor product form at
//   wp-admin/admin.php?page=dokan-dashboard#/product-form-manager
// Config persists through GET/POST /dokan/v1/product-editor/settings into the
// `dokan_product_editor` global option, and is consumed by the vendor product
// editor (dashboard/new/#/products/{id}/edit).
//
// This is ONE spec file on purpose: every test mutates the single global
// `dokan_product_editor` option and restores the captured baseline in
// afterEach. Keeping all cases in one file means they share a single Playwright
// worker and run serially — so they never race each other on that shared option
// (splitting them across files flakes under multi-worker local runs).
//
// Coverage: admin authoring (UI → verified via REST), all 11 field variants,
// field config, default-field toggles, per-product-type overrides, the
// mandatory-field UI contract, validation negatives, permission negatives
// (vendor/customer/guest, read & write), vendor-editor reflection, and custom-
// field meta persistence. See PRODUCT-FORM-MANAGER-TESTPLAN.md.
// ============================================================================

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

const uid = () => Math.random().toString(36).slice(2, 8);

// Field variants the UI authoring cases below exercise individually (text +
// select are covered in 'happy paths'; the rest here in 'field variants').
const REMAINING_VARIANTS: FieldVariant[] = [
    'number',
    'textarea',
    'editor',
    'radio',
    'multiselect',
    'checkbox',
    'datetime',
    'image',
    'file',
];
const OPTION_VARIANTS: ReadonlySet<FieldVariant> = new Set(['radio', 'select', 'multiselect']);

// All 11 variants, used by the render-fidelity matrix.
const ALL_VARIANTS: FieldVariant[] = [
    'text',
    'number',
    'textarea',
    'editor',
    'radio',
    'select',
    'multiselect',
    'checkbox',
    'datetime',
    'image',
    'file',
];
// Only these variants surface the configured placeholder as a control attribute
// in the vendor editor (verified live): text + textarea. Others render the field
// (label + description) but no placeholder attribute.
const PLACEHOLDER_VARIANTS: ReadonlySet<FieldVariant> = new Set(['text', 'textarea']);
const PRODUCT_TYPES = ['simple', 'variable', 'grouped', 'external'] as const;

test.describe('Product Form Manager', () => {
    let admin: ProductFormManager;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        await api.init();
        // product_editor ships inactive on a fresh env — activate it (and remember
        // the prior state) so every /dokan/v1/product-editor/* route resolves.
        await api.ensureModuleActive();
        await api.captureBaseline();

        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ProductFormManager(aPage);
    });

    test.afterEach(async () => {
        await api.restoreBaseline();
    });

    test.afterAll(async () => {
        await api.restoreBaseline();
        await api.restoreModuleState();
        await aPage?.close();
        await api.dispose();
    });

    // ========================================================================
    // HAPPY PATHS — admin authoring, verified via REST
    // ========================================================================
    test.describe('happy paths', () => {
        test(
            'admin can create a custom block',
            { tag: ['@pro', '@admin'] },
            async () => {
                const block = data.customBlock(uid());
                await admin.goto();
                await admin.createCustomBlock(block);
                await admin.saveChanges();

                const schema = await api.getSchema();
                const section = api.sectionByLabel(schema, block.label);
                expect(section, `block "${block.label}" persisted`).toBeTruthy();
                expect(section!.type).toBe('section');
                expect(section!.is_custom).toBe(true);
                expect(section!.visibility).not.toBe(false);
            }
        );

        test(
            'admin can add a custom text field to a custom block',
            { tag: ['@pro', '@admin'] },
            async () => {
                const block = data.customBlock(uid());
                const field = data.customField(uid(), 'text');
                await admin.goto();
                await admin.createCustomBlock(block);
                await admin.addCustomField(block.label, field);
                await admin.saveChanges();

                const schema = await api.getSchema();
                const section = api.sectionByLabel(schema, block.label)!;
                const saved = api.fieldByLabel(schema, field.label);
                expect(saved, `field "${field.label}" persisted`).toBeTruthy();
                expect(saved!.type).toBe('field');
                expect(saved!.is_custom).toBe(true);
                expect(saved!.variant).toBe('text');
                expect(saved!.section_id).toBe(section.id);
            }
        );

        test(
            'admin can add a custom select field with options',
            { tag: ['@pro', '@admin'] },
            async () => {
                const block = data.customBlock(uid());
                const field = {
                    ...data.customField(uid(), 'select' as FieldVariant),
                    options: ['Small', 'Medium', 'Large'],
                };
                await admin.goto();
                await admin.createCustomBlock(block);
                await admin.addCustomField(block.label, field);
                await admin.saveChanges();

                const schema = await api.getSchema();
                const saved = api.fieldByLabel(schema, field.label);
                expect(saved, `select field "${field.label}" persisted`).toBeTruthy();
                expect(saved!.variant).toBe('select');
                const labels = (saved!.options ?? []).map((o) => o.label);
                expect(labels).toEqual(field.options);
            }
        );

        test(
            'admin can edit a custom block label',
            { tag: ['@pro', '@admin'] },
            async () => {
                const block = data.customBlock(uid());
                const newLabel = `PW Renamed ${uid()}`;
                await admin.goto();
                await admin.createCustomBlock(block);
                await admin.saveChanges();

                await admin.goto();
                await admin.switchTab('Custom Block');
                await admin.editCustomBlock(block.label, newLabel);
                await admin.saveChanges();

                const schema = await api.getSchema();
                expect(api.sectionByLabel(schema, newLabel)).toBeTruthy();
                expect(api.sectionByLabel(schema, block.label)).toBeFalsy();
            }
        );

        test(
            'admin can edit a custom field label',
            { tag: ['@pro', '@admin'] },
            async () => {
                const block = data.customBlock(uid());
                const field = data.customField(uid(), 'text');
                const newLabel = `PW Field Renamed ${uid()}`;
                await admin.goto();
                await admin.createCustomBlock(block);
                await admin.addCustomField(block.label, field);
                await admin.saveChanges();

                await admin.goto();
                await admin.switchTab('Custom Block');
                await admin.editCustomFieldLabel(block.label, field.label, newLabel);
                await admin.saveChanges();

                const schema = await api.getSchema();
                expect(api.fieldByLabel(schema, newLabel)).toBeTruthy();
                expect(api.fieldByLabel(schema, field.label)).toBeFalsy();
            }
        );

        test(
            'admin can rename a default field',
            { tag: ['@pro', '@admin'] },
            async () => {
                const baseline = await api.getSchema();
                const pick = api.pickOptionalDefaultField(baseline);
                expect(pick, 'a renamable default field exists').toBeTruthy();
                const { section, field } = pick!;
                const newLabel = `PW ${field.label} ${uid()}`;

                await admin.goto();
                await admin.renameField(section.label, field.label, newLabel);
                await admin.saveChanges();

                const schema = await api.getSchema();
                const updated = schema.find((i) => i.id === field.id);
                expect(updated?.label).toBe(newLabel);
            }
        );

        test(
            'admin can disable a default field',
            { tag: ['@pro', '@admin'] },
            async () => {
                const baseline = await api.getSchema();
                const { section, field } = api.pickOptionalDefaultField(baseline)!;

                await admin.goto();
                await admin.toggleFieldVisibility(section.label, field.label);
                await admin.saveChanges();

                const schema = await api.getSchema();
                const updated = schema.find((i) => i.id === field.id);
                expect(updated?.visibility).toBe(false);
            }
        );

        test(
            'admin can mark a default field required',
            { tag: ['@pro', '@admin'] },
            async () => {
                const baseline = await api.getSchema();
                // a visible, optional, non-mandatory default field
                const { section, field } = api.pickOptionalDefaultField(baseline)!;

                await admin.goto();
                await admin.toggleFieldRequired(section.label, field.label);
                await admin.saveChanges();

                const schema = await api.getSchema();
                const updated = schema.find((i) => i.id === field.id);
                expect(updated?.required).toBe(true);
            }
        );
    });

    // ========================================================================
    // EDGE / REMOVAL — deletion round-trips
    // ========================================================================
    test.describe('edge cases', () => {
        test(
            'admin can delete a custom field',
            { tag: ['@pro', '@admin'] },
            async () => {
                const block = data.customBlock(uid());
                const field = data.customField(uid(), 'text');
                await admin.goto();
                await admin.createCustomBlock(block);
                await admin.addCustomField(block.label, field);
                await admin.saveChanges();

                await admin.goto();
                await admin.switchTab('Custom Block');
                await admin.deleteCustomField(block.label, field.label);
                await admin.saveChanges();

                const schema = await api.getSchema();
                expect(api.fieldByLabel(schema, field.label)).toBeFalsy();
                // the block itself survives
                expect(api.sectionByLabel(schema, block.label)).toBeTruthy();
            }
        );

        test(
            'admin can delete a custom block',
            { tag: ['@pro', '@admin'] },
            async () => {
                const block = data.customBlock(uid());
                await admin.goto();
                await admin.createCustomBlock(block);
                await admin.saveChanges();

                await admin.goto();
                await admin.switchTab('Custom Block');
                await admin.deleteCustomBlock(block.label);
                await admin.saveChanges();

                const schema = await api.getSchema();
                expect(api.sectionByLabel(schema, block.label)).toBeFalsy();
            }
        );
    });

    // ========================================================================
    // NEGATIVE — validation
    // ========================================================================
    test.describe('negative cases', () => {
        test(
            'empty custom field label is rejected',
            { tag: ['@pro', '@admin'] },
            async () => {
                const block = data.customBlock(uid());
                await admin.goto();
                await admin.createCustomBlock(block);

                // Open the Add Field panel and save with an empty label.
                const card = admin.sectionCard(block.label);
                await card.getByRole('button', { name: 'Add Field' }).click();
                await card.getByRole('button', { name: 'Save', exact: true }).click();

                await expect(
                    aPage.getByText('Field label is required.', { exact: false })
                ).toBeVisible({ timeout: 10000 });
            }
        );

        test(
            'empty option label on a select field is rejected',
            { tag: ['@pro', '@admin'] },
            async () => {
                const block = data.customBlock(uid());
                await admin.goto();
                await admin.createCustomBlock(block);

                const card = admin.sectionCard(block.label);
                await card.getByRole('button', { name: 'Add Field' }).click();
                await aPage.getByPlaceholder('Enter field label').fill(`PW Field ${uid()}`);
                // switch to a select variant, add an empty option, then save
                await aPage.locator('.react-select__control').first().click();
                await aPage.locator('.react-select__option').filter({ hasText: 'Select' }).first().click();
                await aPage.getByRole('button', { name: 'Add', exact: true }).click();
                await card.getByRole('button', { name: 'Save', exact: true }).click();

                await expect(
                    aPage.getByText('Option label is required.', { exact: false })
                ).toBeVisible({ timeout: 10000 });
            }
        );
    });

    // ========================================================================
    // VENDOR REFLECTION — config (set via REST) changes the vendor editor
    // ========================================================================
    test.describe('vendor reflection', () => {
        let vendor: ProductFormManager;
        let vPage: Page;
        let categoryId: number;
        const productIds: string[] = [];

        test.beforeAll(async ({ browser }) => {
            categoryId = await api.getProductCategoryId();
            const vendorContext = await browser.newContext({ storageState: v1 });
            vPage = await vendorContext.newPage();
            vendor = new ProductFormManager(vPage);
        });

        test.afterAll(async () => {
            for (const id of productIds) {
                await api.deleteProduct(id).catch(() => undefined);
            }
            await vPage?.close();
        });

        test(
            'a disabled default field is hidden in the vendor editor',
            { tag: ['@pro', '@vendor'] },
            async () => {
                test.slow();
                const baseline = await api.getSchema();
                const { field } = api.pickOptionalDefaultField(baseline)!;

                // Sanity: visible before we disable it.
                const id = await api.createVendorProduct(categoryId);
                productIds.push(id);
                await vendor.gotoVendorEditor(id);
                await vendor.assertVendorFieldVisible(field.id);

                // Disable via REST, reopen, assert it is gone.
                const next = baseline.map((i) =>
                    i.id === field.id ? { ...i, visibility: false, visibilities: {} } : i
                );
                await api.saveSchema(next);
                await vendor.gotoVendorEditor(id);
                await vendor.assertVendorFieldAbsent(field.id);
            }
        );

        test(
            'a renamed default field label shows in the vendor editor',
            { tag: ['@pro', '@vendor'] },
            async () => {
                test.slow();
                const baseline = await api.getSchema();
                const { field } = api.pickOptionalDefaultField(baseline)!;
                const newLabel = `PW Label ${uid()}`;

                const next = baseline.map((i) =>
                    i.id === field.id ? { ...i, label: newLabel, labels: {} } : i
                );
                await api.saveSchema(next);

                const id = await api.createVendorProduct(categoryId);
                productIds.push(id);
                await vendor.gotoVendorEditor(id);
                await vendor.assertVendorSeesText(newLabel);
            }
        );

        test(
            'a custom block and field render in the vendor editor',
            { tag: ['@pro', '@vendor'] },
            async () => {
                test.slow();
                const baseline = await api.getSchema();
                const blockId = `_dokan_custom_section_pw_${uid()}`;
                const fieldId = `_dokan_custom_field_pw_${uid()}`;
                const blockLabel = `PW VBlock ${uid()}`;
                const fieldLabel = `PW VField ${uid()}`;

                const next = [
                    ...baseline,
                    {
                        id: blockId,
                        section_id: null,
                        type: 'section' as const,
                        label: blockLabel,
                        description: 'vendor custom block',
                        visibility: true,
                        is_custom: true,
                        priority: 999,
                    },
                    {
                        id: fieldId,
                        section_id: blockId,
                        type: 'field' as const,
                        label: fieldLabel,
                        variant: 'text',
                        visibility: true,
                        required: false,
                        is_custom: true,
                        priority: 1000,
                    },
                ];
                await api.saveSchema(next);

                const id = await api.createVendorProduct(categoryId);
                productIds.push(id);
                await vendor.gotoVendorEditor(id);
                await vendor.assertVendorSeesText(blockLabel);
                // A custom `text` field renders a bare control (no
                // #dokan-form-field-{id} wrapper), so assert on its label.
                await vendor.assertVendorFieldVisibleByLabel(fieldLabel);
            }
        );
    });

    // ========================================================================
    // RENDER FIDELITY — every custom field variant configured for the form
    // renders in the VENDOR product editor with its EXACT label, description and
    // (where the variant supports it) placeholder — across all product types
    // (simple, variable, grouped, external). One E2E case proves an admin-UI-
    // authored field renders verbatim; the matrix proves all 11 variants for
    // each product type (seeded via REST = the same option the builder writes).
    // ========================================================================
    test.describe('render fidelity across product types', () => {
        let vendor: ProductFormManager;
        let vPage: Page;
        let categoryId: number;
        const productIds: string[] = [];

        test.beforeAll(async ({ browser }) => {
            categoryId = await api.getProductCategoryId();
            const vendorContext = await browser.newContext({ storageState: v1 });
            vPage = await vendorContext.newPage();
            vendor = new ProductFormManager(vPage);
        });

        test.afterAll(async () => {
            for (const id of productIds) {
                await api.deleteProduct(id).catch(() => undefined);
            }
            await vPage?.close();
        });

        // Append one custom block carrying every variant (unique label /
        // description / placeholder markers) to the baseline and save it.
        const seedAllVariants = async (tag: string) => {
            const baseline = await api.getSchema();
            const blockId = `dokan_custom_section_fid_${tag}`;
            const blockLabel = `FID Block ${tag}`;
            const specs = ALL_VARIANTS.map((variant, i) => ({
                variant,
                label: `LBL_${tag}_${variant}`,
                description: `DSC_${tag}_${variant}`,
                placeholder: `PHD_${tag}_${variant}`,
                priority: 951 + i,
            }));
            const items: SchemaItem[] = [
                {
                    id: blockId,
                    section_id: null,
                    type: 'section',
                    label: blockLabel,
                    description: `fid block ${tag}`,
                    visibility: true,
                    is_custom: true,
                },
                ...specs.map((s) => ({
                    id: `dokan_custom_field_fid_${tag}_${s.variant}`,
                    section_id: blockId,
                    type: 'field' as const,
                    label: s.label,
                    description: s.description,
                    placeholder: s.placeholder,
                    variant: s.variant,
                    visibility: true,
                    required: false,
                    is_custom: true,
                    ...(OPTION_VARIANTS.has(s.variant)
                        ? {
                              options: [
                                  { label: `OPT1_${s.variant}`, value: `opt1_${s.variant}` },
                                  { label: `OPT2_${s.variant}`, value: `opt2_${s.variant}` },
                              ],
                          }
                        : {}),
                })),
            ];
            await api.saveSchema([...baseline, ...items]);
            return { blockLabel, specs };
        };

        // E2E: a field AUTHORED in the admin builder (label + description +
        // placeholder) renders verbatim in the vendor editor.
        test(
            'an admin-authored field renders verbatim (label + description + placeholder) in the vendor editor',
            { tag: ['@pro', '@admin', '@vendor'] },
            async () => {
                test.slow();
                const block = data.customBlock(uid());
                const field = data.customField(uid(), 'text');

                await admin.goto();
                await admin.createCustomBlock(block);
                await admin.addCustomField(block.label, field);
                await admin.saveChanges();

                const id = await api.createVendorProductOfType('simple', categoryId);
                productIds.push(id);
                await vendor.gotoVendorEditor(id);

                await vendor.assertVendorSeesText(block.label);
                await vendor.assertVendorFieldVisibleByLabel(field.label);
                await vendor.assertVendorDescriptionVisible(field.description!);
                await vendor.assertVendorPlaceholderVisible(field.placeholder!);
            }
        );

        // Matrix: all 11 variants render with exact label/description (and
        // placeholder for placeholder-capable variants) on every product type.
        for (const type of PRODUCT_TYPES) {
            test(
                `all custom field variants render with exact label/description/placeholder on a ${type} product`,
                { tag: ['@pro', '@vendor'] },
                async () => {
                    test.slow();
                    const { blockLabel, specs } = await seedAllVariants(`${type}${uid()}`);

                    const id = await api.createVendorProductOfType(type, categoryId);
                    productIds.push(id);
                    await vendor.gotoVendorEditor(id);

                    await vendor.assertVendorSeesText(blockLabel);
                    for (const s of specs) {
                        await vendor.assertVendorFieldVisibleByLabel(s.label);
                        await vendor.assertVendorDescriptionVisible(s.description);
                        if (PLACEHOLDER_VARIANTS.has(s.variant)) {
                            await vendor.assertVendorPlaceholderVisible(s.placeholder);
                        }
                    }
                }
            );
        }
    });

    // ========================================================================
    // DEFAULT-BLOCK CUSTOM FIELDS & REQUIRED/NON-REQUIRED ENFORCEMENT
    //
    // Admins can add custom fields inside an EXISTING default block (not only
    // under the Custom Block tab); those render alongside the default fields in
    // the vendor editor. Required/Non-Required conditions must take effect during
    // vendor product create & edit: the editor's save button is disabled while a
    // required field is empty and enabled once filled (validated through the real
    // vendor editor UI). Optional fields never block saving.
    // ========================================================================
    test.describe('field conditions & default-block fields', () => {
        let vendor: ProductFormManager;
        let vPage: Page;
        let categoryId: number;
        const productIds: string[] = [];

        test.beforeAll(async ({ browser }) => {
            categoryId = await api.getProductCategoryId();
            const vendorContext = await browser.newContext({ storageState: v1 });
            vPage = await vendorContext.newPage();
            vendor = new ProductFormManager(vPage);
        });

        test.afterAll(async () => {
            for (const id of productIds) {
                await api.deleteProduct(id).catch(() => undefined);
            }
            await vPage?.close();
        });

        // Append a custom block holding a single textarea field to the baseline.
        // textarea is a CustomField-wrapped variant, so it renders the
        // "(REQUIRED)" marker + an #dokan-form-field-{id} wrapper and exposes its
        // placeholder (fillable). Products are created WITH a description so the
        // only thing that can gate the editor's save button is this field.
        const seedCustomField = async (
            tag: string,
            required: boolean
        ): Promise<{ fieldId: string; placeholder: string; label: string }> => {
            const baseline = await api.getSchema();
            const blockId = `dokan_custom_section_${tag}`;
            const fieldId = `dokan_custom_field_${tag}`;
            const placeholder = `PH_${tag}`;
            const label = `Cond Field ${tag}`;
            await api.saveSchema([
                ...baseline,
                {
                    id: blockId,
                    section_id: null,
                    type: 'section',
                    label: `Cond Block ${tag}`,
                    visibility: true,
                    is_custom: true,
                },
                {
                    id: fieldId,
                    section_id: blockId,
                    type: 'field',
                    label,
                    placeholder,
                    variant: 'textarea',
                    visibility: true,
                    required,
                    is_custom: true,
                },
            ]);
            return { fieldId, placeholder, label };
        };

        test(
            'admin can add a custom field to a default block; it renders alongside default fields',
            { tag: ['@pro', '@admin', '@vendor'] },
            async () => {
                test.slow();
                const field = data.customField(uid(), 'text');
                const SECTION = 'Inventory';

                await admin.goto();
                await admin.addCustomField(SECTION, field);
                await admin.saveChanges();

                // Persisted as a custom field whose parent is the default section.
                const schema = await api.getSchema();
                const saved = api.fieldByLabel(schema, field.label);
                expect(saved, 'custom field on default block persisted').toBeTruthy();
                expect(saved!.is_custom).toBe(true);
                const inventory = api.sectionByLabel(schema, SECTION)!;
                expect(saved!.section_id).toBe(inventory.id);

                // Renders in the vendor editor next to the default Inventory fields.
                const id = await api.createVendorProductOfType('simple', categoryId);
                productIds.push(id);
                await vendor.gotoVendorEditor(id);
                await vendor.assertVendorFieldVisibleByLabel(field.label);
            }
        );

        test(
            'a required custom field is marked, blocks saving while empty, then persists when filled',
            { tag: ['@pro', '@vendor'] },
            async () => {
                test.slow();
                const { fieldId, placeholder } = await seedCustomField(`req${uid()}`, true);

                const id = await api.createVendorProductOfType('simple', categoryId);
                productIds.push(id);
                await vendor.gotoVendorEditor(id);

                // Configured-required is rendered, and an empty required field
                // disables save (all default required fields are satisfied, so the
                // button state reflects only this field).
                await vendor.assertVendorFieldRequiredMarker(fieldId);
                await expect(vendor.vendorSaveButton()).toBeDisabled();

                // Fill a valid value → save enabled → saving persists the value.
                const value = `req-value-${uid()}`;
                await vendor.fillVendorFieldByPlaceholder(placeholder, value);
                await expect(vendor.vendorSaveButton()).toBeEnabled();
                await vendor.saveVendorProduct();
                expect(await api.getProductMetaValue(id, fieldId)).toBe(value);
            }
        );

        test(
            'a non-required custom field carries no required marker and does not block saving',
            { tag: ['@pro', '@vendor'] },
            async () => {
                test.slow();
                const { fieldId } = await seedCustomField(`opt${uid()}`, false);

                const id = await api.createVendorProductOfType('simple', categoryId);
                productIds.push(id);
                await vendor.gotoVendorEditor(id);

                // Not marked required, and leaving it empty does not block saving.
                await vendor.assertVendorFieldNoRequiredMarker(fieldId);
                await expect(vendor.vendorSaveButton()).toBeEnabled();
                await vendor.saveVendorProduct();
            }
        );
    });

    // ========================================================================
    // FIELD VARIANTS — the 9 remaining variants persist from the builder
    // (text + select are covered above).
    // ========================================================================
    test.describe('field variants', () => {
        for (const variant of REMAINING_VARIANTS) {
            test(
                `admin can add a custom ${variant} field`,
                { tag: ['@pro', '@admin'] },
                async () => {
                    const block = data.customBlock(uid());
                    const needsOptions = OPTION_VARIANTS.has(variant);
                    const field = {
                        ...data.customField(uid(), variant),
                        ...(needsOptions ? { options: ['Alpha', 'Beta', 'Gamma'] } : {}),
                    };

                    await admin.goto();
                    await admin.createCustomBlock(block);
                    await admin.addCustomField(block.label, field);
                    await admin.saveChanges();

                    const schema = await api.getSchema();
                    const saved = api.fieldByLabel(schema, field.label);
                    expect(saved, `${variant} field "${field.label}" persisted`).toBeTruthy();
                    expect(saved!.type).toBe('field');
                    expect(saved!.is_custom).toBe(true);
                    expect(saved!.variant).toBe(variant);

                    if (needsOptions) {
                        const labels = (saved!.options ?? []).map((o) => o.label);
                        expect(labels).toEqual(field.options);
                    }
                }
            );
        }

        test(
            'admin can configure a custom field description',
            { tag: ['@pro', '@admin'] },
            async () => {
                const block = data.customBlock(uid());
                const field = data.customField(uid(), 'text');
                field.description = `Help text ${uid()}`;

                await admin.goto();
                await admin.createCustomBlock(block);
                await admin.addCustomField(block.label, field);
                await admin.saveChanges();

                const schema = await api.getSchema();
                const saved = api.fieldByLabel(schema, field.label);
                expect(saved, `field "${field.label}" persisted`).toBeTruthy();
                expect(saved!.description).toBe(field.description);
            }
        );
    });

    // ========================================================================
    // BOUNDARIES & GAPS — REST-level so locator strict-mode on duplicate or
    // changed labels never bites.
    // ========================================================================
    test.describe('boundaries & gaps', () => {
        test(
            'duplicate field labels are accepted (no server-side dedup, risk R2)',
            { tag: ['@pro', '@admin'] },
            async () => {
                const baseline = await api.getSchema();
                const blockId = `_dokan_custom_section_dup_${uid()}`;
                const dupLabel = `PW Dup ${uid()}`;
                const next: SchemaItem[] = [
                    ...baseline,
                    {
                        id: blockId,
                        section_id: null,
                        type: 'section',
                        label: `PW Dup Block ${uid()}`,
                        visibility: true,
                        is_custom: true,
                    },
                    {
                        id: `${blockId}_f1`,
                        section_id: blockId,
                        type: 'field',
                        label: dupLabel,
                        variant: 'text',
                        visibility: true,
                        required: false,
                        is_custom: true,
                    },
                    {
                        id: `${blockId}_f2`,
                        section_id: blockId,
                        type: 'field',
                        label: dupLabel,
                        variant: 'text',
                        visibility: true,
                        required: false,
                        is_custom: true,
                    },
                ];
                await api.saveSchema(next);

                const schema = await api.getSchema();
                const dups = api.fields(schema).filter((f) => f.label === dupLabel);
                expect(dups.length).toBe(2);
            }
        );

        test(
            'a 255-char field label persists within the sanitize boundary',
            { tag: ['@pro', '@admin'] },
            async () => {
                const baseline = await api.getSchema();
                const blockId = `_dokan_custom_section_bv_${uid()}`;
                const longLabel = 'A'.repeat(255);
                const next: SchemaItem[] = [
                    ...baseline,
                    {
                        id: blockId,
                        section_id: null,
                        type: 'section',
                        label: `PW BV Block ${uid()}`,
                        visibility: true,
                        is_custom: true,
                    },
                    {
                        id: `${blockId}_f`,
                        section_id: blockId,
                        type: 'field',
                        label: longLabel,
                        variant: 'text',
                        visibility: true,
                        required: false,
                        is_custom: true,
                    },
                ];
                await api.saveSchema(next);

                const schema = await api.getSchema();
                const saved = schema.find((i) => i.id === `${blockId}_f`);
                expect(saved, '255-char field persisted').toBeTruthy();
                expect(saved!.label.length).toBeLessThanOrEqual(255);
            }
        );
    });

    // ========================================================================
    // PER-PRODUCT-TYPE OVERRIDES — "conditional logic" is a per-product-type map
    // (labels / visibilities keyed by product-type slug), not a field-to-field
    // condition builder. These round-trip through REST; the third case documents
    // the `requireds` gap (R5) where the sanitizer silently drops the override.
    // ========================================================================
    test.describe('per-product-type overrides', () => {
        test(
            'a per-type visibility override persists (PFM-P01)',
            { tag: ['@pro', '@admin'] },
            async () => {
                const baseline = await api.getSchema();
                const { field } = api.pickOptionalDefaultField(baseline)!;
                const next = baseline.map((i) =>
                    i.id === field.id ? { ...i, visibilities: { variable: false } } : i
                );
                await api.saveSchema(next);
                const saved = (await api.getSchema()).find((i) => i.id === field.id);
                expect(saved?.visibilities?.variable).toBe(false);
            }
        );

        test(
            'a per-type label override persists (PFM-P03)',
            { tag: ['@pro', '@admin'] },
            async () => {
                const baseline = await api.getSchema();
                const { field } = api.pickOptionalDefaultField(baseline)!;
                const label = `PW Variable Label ${uid()}`;
                const next = baseline.map((i) =>
                    i.id === field.id ? { ...i, labels: { variable: label } } : i
                );
                await api.saveSchema(next);
                const saved = (await api.getSchema()).find((i) => i.id === field.id);
                expect(saved?.labels?.variable).toBe(label);
            }
        );

        test(
            'a per-type required override is dropped by the REST sanitizer (gap R5)',
            { tag: ['@pro', '@admin'] },
            async () => {
                const baseline = await api.getSchema();
                const { field } = api.pickOptionalDefaultField(baseline)!;
                const next = baseline.map((i) =>
                    i.id === field.id ? { ...i, requireds: { simple: true } } : i
                );
                await api.saveSchema(next);
                const saved = (await api.getSchema()).find((i) => i.id === field.id);
                // Documents current behavior: sanitize_schema_item() has no
                // `requireds` branch, so per-type required overrides never persist.
                expect(saved?.requireds).toBeUndefined();
            }
        );
    });

    // ========================================================================
    // MANDATORY FIELD — the builder must not let an admin hide a field flagged
    // is_mandatory (PFM-N04). The flag is set via REST, then the UI is asserted.
    // ========================================================================
    test.describe('mandatory field UI contract', () => {
        test(
            'the visibility toggle is disabled for an is_mandatory field',
            { tag: ['@pro', '@admin'] },
            async () => {
                const baseline = await api.getSchema();
                const { section, field } = api.pickOptionalDefaultField(baseline)!;
                const next = baseline.map((i) =>
                    i.id === field.id ? { ...i, is_mandatory: true } : i
                );
                await api.saveSchema(next);

                await admin.goto();
                await expect(
                    admin.fieldVisibilitySwitch(section.label, field.label)
                ).toBeDisabled();
            }
        );
    });

    // ========================================================================
    // DEFAULT SCHEMA — the builder renders the core default sections (PFM-A01).
    // ========================================================================
    test.describe('default schema', () => {
        test(
            'the builder renders the core default sections',
            { tag: ['@pro', '@admin'] },
            async () => {
                await admin.goto();
                await expect(admin.sectionCard('Inventory')).toBeVisible();
                await expect(admin.sectionCard('Shipping and Tax')).toBeVisible();
            }
        );
    });

    // ========================================================================
    // PERMISSION CONTROL — only manage_woocommerce may read or write the global
    // form schema. The permission_callback guards BOTH GET and POST.
    // ========================================================================
    test.describe('permission control', () => {
        test(
            'vendor cannot write the product form schema (403)',
            { tag: ['@pro', '@vendor'] },
            async () => {
                const status = await api.postStatus(
                    '/dokan/v1/product-editor/settings',
                    { schema: [] },
                    api.vendorAuth()
                );
                expect(status, 'vendor POST is forbidden').toBe(403);
            }
        );

        test(
            'customer cannot write the product form schema (403)',
            { tag: ['@pro', '@customer'] },
            async () => {
                const status = await api.postStatus(
                    '/dokan/v1/product-editor/settings',
                    { schema: [] },
                    api.customerAuth()
                );
                expect(status, 'customer POST is forbidden').toBe(403);
            }
        );

        test(
            'an unauthenticated request cannot write the product form schema (401)',
            { tag: ['@pro', '@guest'] },
            async () => {
                const status = await api.postStatus(
                    '/dokan/v1/product-editor/settings',
                    { schema: [] },
                    {}
                );
                expect(status, 'unauthenticated POST is rejected').toBe(401);
            }
        );

        test(
            'a vendor cannot read the product form schema (403)',
            { tag: ['@pro', '@vendor'] },
            async () => {
                const ctx = await request.newContext();
                const res = await ctx.get(
                    `${process.env.SERVER_URL}/dokan/v1/product-editor/settings`,
                    { headers: api.vendorAuth() }
                );
                expect(res.status(), 'vendor GET is forbidden').toBe(403);
                await ctx.dispose();
            }
        );
    });

    // ========================================================================
    // PERSISTENCE — a custom field value is saved as product meta keyed by field
    // id on publish (dokan_new_product_added). A non-underscore field id keeps
    // the meta visible so it round-trips through REST. NOTE: partial REST updates
    // do not re-save the meta and storefront output is theme/cache-sensitive, so
    // PFM-S04 (update round-trip) and PFM-W04 (storefront non-render) stay as
    // documented manual cases — see PRODUCT-FORM-MANAGER-TESTPLAN.md §10.
    // ========================================================================
    test.describe('persistence', () => {
        let categoryId: number;
        const productIds: string[] = [];

        test.beforeAll(async () => {
            categoryId = await api.getProductCategoryId();
        });

        test.afterAll(async () => {
            for (const id of productIds) {
                await api.deleteProduct(id).catch(() => undefined);
            }
        });

        // Seed a custom text field with a non-underscore id (so its meta is not a
        // protected key) and return its id.
        const seedRoundTripField = async (): Promise<string> => {
            const baseline = await api.getSchema();
            const blockId = `dokan_custom_section_pw_${uid()}`;
            const fieldId = `dokan_custom_field_pw_${uid()}`;
            const next: SchemaItem[] = [
                ...baseline,
                {
                    id: blockId,
                    section_id: null,
                    type: 'section',
                    label: `PW Persist Block ${uid()}`,
                    visibility: true,
                    is_custom: true,
                },
                {
                    id: fieldId,
                    section_id: blockId,
                    type: 'field',
                    label: `PW Persist Field ${uid()}`,
                    variant: 'text',
                    visibility: true,
                    required: false,
                    is_custom: true,
                },
            ];
            await api.saveSchema(next);
            return fieldId;
        };

        test(
            'a custom field value is persisted as product meta on publish (PFM-S01)',
            { tag: ['@pro', '@vendor'] },
            async () => {
                const fieldId = await seedRoundTripField();

                const value = `pw-value-${uid()}`;
                const productId = await api.createVendorProductWithFields(categoryId, {
                    [fieldId]: value,
                });
                productIds.push(productId);
                expect(
                    await api.getProductMetaValue(productId, fieldId),
                    'value persisted on create, keyed by field id'
                ).toBe(value);
            }
        );

        test(
            'two products carry independent custom field values (PFM-S08)',
            { tag: ['@pro', '@vendor'] },
            async () => {
                const fieldId = await seedRoundTripField();

                const valueA = `pw-A-${uid()}`;
                const valueB = `pw-B-${uid()}`;
                const idA = await api.createVendorProductWithFields(categoryId, {
                    [fieldId]: valueA,
                });
                const idB = await api.createVendorProductWithFields(categoryId, {
                    [fieldId]: valueB,
                });
                productIds.push(idA, idB);

                expect(await api.getProductMetaValue(idA, fieldId)).toBe(valueA);
                expect(await api.getProductMetaValue(idB, fieldId)).toBe(valueB);
            }
        );
    });
});
