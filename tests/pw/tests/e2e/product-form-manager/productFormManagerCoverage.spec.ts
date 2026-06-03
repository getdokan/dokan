import { test, expect, Page } from '@utils/test';
import { request, APIRequestContext } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import {
    ProductFormManager,
    api,
    data,
    type FieldVariant,
    type SchemaItem,
} from './productFormManagerAdminPage';
import path from 'path';

// The Product Form Manager (product_editor) module is INACTIVE by default in a
// fresh env — every /dokan/v1/product-editor/* route 404s until it is turned on.
// We activate it in beforeAll and restore the prior state in afterAll.
const MODULE_ID = 'product_editor';

// Vendor REST basic-auth (api.vendorAuth) does not work in this env: vendor1's
// REST password != USER_PASSWORD, so any REST call made as the vendor fails with
// "incorrect_password". Tests that need a vendor REST call are skipped with a
// reason until that auth path is fixed (it also affects the vendor-reflection
// tests in productFormManagerAdmin.spec.ts). See PRODUCT-FORM-MANAGER-TESTPLAN.md.
const VENDOR_AUTH_BROKEN = 'blocked: vendor REST basic-auth fails in this env (vendor1 password != USER_PASSWORD)';

// ============================================================================
// Product Form Manager — EXTENDED COVERAGE (additive to productFormManagerAdmin.spec.ts).
//
// This file deliberately reuses the existing page object + REST client from
// productFormManagerAdminPage.ts and only adds the cases that spec does NOT
// already cover:
//   • the 10 remaining field variants (admin spec covers text + select)
//   • field description persistence
//   • duplicate-label gap (no server-side dedup) — documents current behavior
//   • 255-char label sanitize boundary
//   • permission negatives on POST /settings (vendor / customer / guest)
//   • custom-field meta round-trip via REST
//   • storefront NON-render of custom field values (documents the known gap)
//
// Config is a single global option, so afterEach restores the captured baseline.
// Full rationale + the rest of the matrix: PRODUCT-FORM-MANAGER-TESTPLAN.md.
// ============================================================================

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

const uid = () => Math.random().toString(36).slice(2, 8);

// Variants the admin spec already exercises (text, select) are omitted here.
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

test.describe('Product Form Manager - extended coverage', () => {
    let admin: ProductFormManager;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let modCtx: APIRequestContext;
    let restoreModuleInactive = false;

    test.beforeAll(async ({ browser }) => {
        await api.init();

        // Activate the product_editor module, remembering whether it was off so
        // afterAll can leave the env exactly as it was found.
        modCtx = await request.newContext();
        apiUtils = new ApiUtils(modCtx);
        const mods = await apiUtils.getAllModules({}, payloads.adminAuth);
        const mod = (mods as Array<{ id: string; active?: boolean }>).find((m) => m.id === MODULE_ID);
        restoreModuleInactive = mod ? !mod.active : true;
        await apiUtils.activateModules(MODULE_ID, payloads.adminAuth);

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
        if (restoreModuleInactive) {
            await apiUtils.deactivateModules(MODULE_ID, payloads.adminAuth).catch(() => undefined);
        }
        await aPage?.close();
        await modCtx?.dispose();
        await api.dispose();
    });

    // ========================================================================
    // HAPPY PATHS — every remaining field variant persists from the builder
    // ========================================================================
    test.describe('happy paths', () => {
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
    // EDGE / BOUNDARY — gaps and sanitize boundaries (REST-level so locator
    // strict-mode on duplicate/changed labels never bites)
    // ========================================================================
    test.describe('edge cases', () => {
        test(
            'duplicate field labels are accepted (no server-side dedup)',
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
                // Documents current permissive behavior: both survive (risk R2).
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
    // NEGATIVE — only manage_woocommerce may write the global form schema
    // ========================================================================
    test.describe('negative cases', () => {
        test(
            'vendor cannot write the product form schema',
            { tag: ['@pro', '@vendor'] },
            async () => {
                test.skip(true, VENDOR_AUTH_BROKEN);
                const res = await api.post(
                    '/dokan/v1/product-editor/settings',
                    { schema: [] },
                    api.vendorAuth()
                );
                expect(res?.data?.status, 'vendor POST is forbidden').toBeGreaterThanOrEqual(400);
            }
        );

        test(
            'an unauthenticated request cannot write the product form schema',
            { tag: ['@pro', '@guest'] },
            async () => {
                // Empty headers → no Authorization → treated as a guest.
                const res = await api.post('/dokan/v1/product-editor/settings', { schema: [] }, {});
                expect(res?.data?.status, 'unauthenticated POST is forbidden').toBeGreaterThanOrEqual(
                    400
                );
            }
        );
    });

    // ========================================================================
    // PERSISTENCE & STOREFRONT — pending vendor REST auth.
    //
    // NOTE on approach (per QA decision): custom field values are stored as
    // PROTECTED (underscore-prefixed) post-meta, so WC REST meta_data never
    // returns them — a REST round-trip cannot verify persistence. The faithful
    // check is via the vendor editor UI: fill the field, publish, reopen, and
    // confirm the value re-populates. That needs (a) a vendor-owned product and
    // (b) per-variant fill/read helpers on the page object — both blocked today
    // by the vendor REST-auth gap. Kept as skipped placeholders so the intent
    // and the known storefront non-render gap (F11) stay visible.
    // ========================================================================
    test.describe('persistence & storefront', () => {
        test(
            'a custom field value persists across editor reopen (UI round-trip)',
            { tag: ['@pro', '@vendor'] },
            async () => {
                test.skip(true, `${VENDOR_AUTH_BROKEN} — verify via vendor editor UI once unblocked`);
            }
        );

        test(
            'a custom field value is NOT rendered on the storefront single product page',
            { tag: ['@pro', '@customer'] },
            async () => {
                test.skip(true, `${VENDOR_AUTH_BROKEN} — needs a vendor-owned product to seed the value`);
            }
        );
    });
});
