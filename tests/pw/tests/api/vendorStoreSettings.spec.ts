//COVERAGE_TAG: GET /dokan/v1/vendor-settings/store
//COVERAGE_TAG: PUT /dokan/v1/vendor-settings/store

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';

const endpoint = endPoints.vendorStoreSettings;

// Flat schema element as returned by the endpoint.
type Element = { type?: string; id?: string; value?: unknown; default?: unknown };

const field = (schema: Element[], id: string): Element | undefined => schema.find(e => e.type === 'field' && e.id === id);
const valueOf = (schema: Element[], id: string): unknown => field(schema, id)?.value;
const ids = (schema: Element[]): string[] => schema.filter(e => e.type === 'field').map(e => e.id as string);

let apiUtils: ApiUtils;

// GET + PUT for the vendor Store Settings endpoint: schema shape, defaults,
// per-field persistence (meta + non_meta), cross-field validation, and auth.
// Mirrors the e2e migration suite at the data layer, and exhaustively covers the
// composite fields the UI suite can't drive.
test.describe('vendor store settings api', () => {
    const original: Record<string, unknown> = {};
    // Snapshot from beforeAll — the read-only GET tests assert against it instead of re-fetching.
    let initialSchema: Element[] = [];

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // Snapshot every field value so the store is restored after the run.
        const [, schema] = await apiUtils.get(endpoint, { headers: payloads.vendorAuth });
        initialSchema = schema as Element[];
        (schema as Element[]).forEach(e => {
            if (e.type === 'field' && typeof e.id === 'string') {
                original[e.id] = e.value;
            }
        });
    });

    test.afterAll(async () => {
        await apiUtils.put(endpoint, { data: { values: original }, headers: payloads.vendorAuth }, false);
        await apiUtils.dispose();
    });

    // ---- GET ----------------------------------------------------------------

    test('GET returns the flat schema with page, subpage and all tabs', { tag: ['@lite', '@vendor'] }, async () => {
        expect(Array.isArray(initialSchema)).toBeTruthy();

        const types = initialSchema.map(e => e.type);
        expect(types).toContain('page');
        expect(types).toContain('subpage');

        const tabIds = initialSchema.filter(e => e.type === 'tab').map(e => e.id);
        expect(tabIds).toEqual(expect.arrayContaining(['tab_general', 'tab_location', 'tab_schedule', 'tab_business', 'tab_policies']));
    });

    test('GET exposes every core field across all sections', { tag: ['@lite', '@vendor'] }, async () => {
        expect(ids(initialSchema)).toEqual(
            expect.arrayContaining([
                'store_name', 'banner', 'gravatar', 'show_email', 'phone',
                'dokan_store_time_enabled', 'dokan_store_open_notice', 'dokan_store_close_notice',
                'catalog_mode_hide_add_to_cart_button', 'enable_tnc', 'store_tnc',
            ]),
        );
    });

    test('GET reports the documented field defaults', { tag: ['@lite', '@vendor'] }, async () => {
        const list = initialSchema;
        expect(field(list, 'store_name')?.default).toBe('');
        expect(field(list, 'phone')?.default).toBe('');
        expect(field(list, 'show_email')?.default).toBe('no');
        expect(field(list, 'enable_tnc')?.default).toBe('off');
        expect(field(list, 'dokan_store_time_enabled')?.default).toBe('no');
    });

    // ---- PUT persistence ----------------------------------------------------

    test('PUT persists scalar fields and GET reflects them', { tag: ['@lite', '@vendor'] }, async () => {
        const values = { store_name: 'API Store Name', phone: '01712345678', show_email: 'yes' };
        const [response, saved] = await apiUtils.put(endpoint, { data: { values }, headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        // The PUT returns the refreshed schema.
        expect(valueOf(saved as Element[], 'store_name')).toBe('API Store Name');

        const [, schema] = await apiUtils.get(endpoint, { headers: payloads.vendorAuth });
        expect(valueOf(schema as Element[], 'store_name')).toBe('API Store Name');
        expect(valueOf(schema as Element[], 'phone')).toBe('01712345678');
        expect(valueOf(schema as Element[], 'show_email')).toBe('yes');
    });

    test('PUT persists the schedule + notice fields', { tag: ['@lite', '@vendor'] }, async () => {
        const values = { dokan_store_time_enabled: 'yes', dokan_store_open_notice: 'Open now', dokan_store_close_notice: 'Closed now' };
        await apiUtils.put(endpoint, { data: { values }, headers: payloads.vendorAuth });

        const [, schema] = await apiUtils.get(endpoint, { headers: payloads.vendorAuth });
        expect(valueOf(schema as Element[], 'dokan_store_time_enabled')).toBe('yes');
        expect(valueOf(schema as Element[], 'dokan_store_open_notice')).toBe('Open now');
        expect(valueOf(schema as Element[], 'dokan_store_close_notice')).toBe('Closed now');
    });

    test('PUT persists non_meta cart min/max amounts', { tag: ['@pro', '@vendor'] }, async () => {
        const values = { min_amount_to_order: '15', max_amount_to_order: '150' };
        const [response] = await apiUtils.put(endpoint, { data: { values }, headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();

        const [, schema] = await apiUtils.get(endpoint, { headers: payloads.vendorAuth });
        expect(String(valueOf(schema as Element[], 'min_amount_to_order'))).toBe('15');
        expect(String(valueOf(schema as Element[], 'max_amount_to_order'))).toBe('150');
    });

    test('PUT persists the Terms & Conditions toggle + content', { tag: ['@lite', '@vendor'] }, async () => {
        const values = { enable_tnc: 'on', store_tnc: 'These are the store terms via API.' };
        const [response] = await apiUtils.put(endpoint, { data: { values }, headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();

        const [, schema] = await apiUtils.get(endpoint, { headers: payloads.vendorAuth });
        expect(valueOf(schema as Element[], 'enable_tnc')).toBe('on');
        expect(String(valueOf(schema as Element[], 'store_tnc'))).toContain('These are the store terms via API.');
    });

    test('PUT persists non_meta vacation fields', { tag: ['@pro', '@vendor'] }, async () => {
        const values = { setting_go_vacation: 'yes', settings_closing_style: 'instantly', setting_vacation_message: 'On vacation via API' };
        const [response] = await apiUtils.put(endpoint, { data: { values }, headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();

        const [, schema] = await apiUtils.get(endpoint, { headers: payloads.vendorAuth });
        expect(valueOf(schema as Element[], 'setting_vacation_message')).toBe('On vacation via API');
    });

    // ---- PUT validation -----------------------------------------------------

    test('PUT rejects an empty required Store Title', { tag: ['@lite', '@vendor'] }, async () => {
        const [response, body] = await apiUtils.put(endpoint, { data: { values: { store_name: '' } }, headers: payloads.vendorAuth }, false);
        expect(response.status()).toBe(400);
        expect(body?.data?.errors).toHaveProperty('store_name');
    });

    test('PUT rejects a minimum greater than the maximum', { tag: ['@pro', '@vendor'] }, async () => {
        const values = { min_amount_to_order: '500', max_amount_to_order: '50' };
        const [response, body] = await apiUtils.put(endpoint, { data: { values }, headers: payloads.vendorAuth }, false);
        expect(response.status()).toBe(400);
        expect(body?.data?.errors).toHaveProperty('max_amount_to_order');
    });

    test('PUT rejects enabling Terms & Conditions without content', { tag: ['@lite', '@vendor'] }, async () => {
        const values = { enable_tnc: 'on', store_tnc: '' };
        const [response, body] = await apiUtils.put(endpoint, { data: { values }, headers: payloads.vendorAuth }, false);
        expect(response.status()).toBe(400);
        expect(body?.data?.errors).toHaveProperty('store_tnc');
    });

    // Note: the endpoint gates access with check_permission (dokandar +
    // dokan_view_store_settings_menu). Unauthenticated-rejection isn't asserted here
    // because api.config.ts injects a default admin Authorization header on every
    // request, so a header-less call is not actually anonymous.
});
