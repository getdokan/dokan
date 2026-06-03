import { test, expect, Page } from '@utils/test';
import {
    ProductFormManager,
    api,
    data,
    type FieldVariant,
} from './productFormManagerAdminPage';
import path from 'path';

// ============================================================================
// Product Form Manager (Dokan Pro `product-editor` module).
//
// Admin configures the vendor product form at
//   wp-admin/admin.php?page=dokan-dashboard#/product-form-manager
// Every test drives the REAL admin builder UI and verifies the result through
// REST (GET /dokan/v1/product-editor/settings). A final group sets config via
// REST and opens the vendor product editor to prove the config is reflected.
//
// The config is a single global option, so afterEach restores the captured
// baseline schema — no test leaks state into the next or into other suites.
// ============================================================================

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

const uid = () => Math.random().toString(36).slice(2, 8);

test.describe('Product Form Manager', () => {
    let admin: ProductFormManager;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        await api.init();
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
                await vendor.assertVendorFieldVisible(fieldId);
            }
        );
    });
});
