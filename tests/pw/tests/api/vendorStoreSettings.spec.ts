//COVERAGE_TAG: GET /dokan/v1/vendor-settings/store
//COVERAGE_TAG: PUT /dokan/v1/vendor-settings/store

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import { dbUtils } from '@utils/dbUtils';

const endpoint = endPoints.vendorStoreSettings;
const { VENDOR_ID, USER_PASSWORD } = process.env;
const PROFILE_META = 'dokan_profile_settings';

// Flat schema element as returned by the endpoint.
type Element = { type?: string; id?: string; value?: unknown; default?: unknown };

const field = (schema: Element[], id: string): Element | undefined => schema.find(e => e.type === 'field' && e.id === id);
const valueOf = (schema: Element[], id: string): unknown => field(schema, id)?.value;
const ids = (schema: Element[]): string[] => schema.filter(e => e.type === 'field').map(e => e.id as string);
const isoDate = (offsetDays: number): string => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);
const valuesOf = (schema: Element[]): Record<string, unknown> =>
    Object.fromEntries(schema.filter(e => e.type === 'field' && typeof e.id === 'string' && e.value !== null && e.value !== undefined).map(e => [e.id as string, e.value]));

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

// Migration safety net: the React page saves every field on every save, so these
// pin data integrity against legacy-shaped data and the API contract edges.
// Each test seeds the vendor's raw profile meta, then restores it; relies on the
// file running in one worker (api_tests is not fullyParallel).
test.describe('vendor store settings api - migration integrity', () => {
    let api: ApiUtils;
    let originalMeta: Record<string, any>;

    const getSchema = async (): Promise<Element[]> => {
        const [, schema] = await api.get(endpoint, { headers: payloads.vendorAuth });
        return schema as Element[];
    };
    const seedMeta = async (patch: Record<string, unknown>): Promise<void> => {
        await dbUtils.setUserMeta(VENDOR_ID as string, PROFILE_META, { ...originalMeta, ...patch }, true);
    };

    test.beforeAll(async () => {
        api = new ApiUtils(await request.newContext());
        originalMeta = await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META);
    });

    test.afterEach(async () => {
        await dbUtils.setUserMeta(VENDOR_ID as string, PROFILE_META, originalMeta, true);
    });

    test.afterAll(async () => {
        await api.dispose();
    });

    test.describe('happy paths', () => {
        test('saving every field unchanged leaves the stored profile untouched', { tag: ['@lite', '@vendor'] }, async () => {
            const before = await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META);
            const [response] = await api.put(endpoint, { data: { values: valuesOf(await getSchema()) }, headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            expect(await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META)).toEqual(before);
        });

        test('a single-field save changes only that field', { tag: ['@lite', '@vendor'] }, async () => {
            const before = valuesOf(await getSchema());
            await api.put(endpoint, { data: { values: { phone: '01700000999' } }, headers: payloads.vendorAuth });
            const after = valuesOf(await getSchema());
            expect(after.phone).toBe('01700000999');
            expect({ ...after, phone: before.phone }).toEqual(before);
        });

        test('legacy string-format store times load and save', { tag: ['@lite', '@vendor'] }, async () => {
            await seedMeta({ dokan_store_time: { monday: { status: 'open', opening_time: '9:00 am', closing_time: '5:00 pm' } } });
            const [response] = await api.put(endpoint, { data: { values: valuesOf(await getSchema()) }, headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            const stored = await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META);
            expect(stored.dokan_store_time.monday).toEqual({ status: 'open', opening_time: ['9:00 am'], closing_time: ['5:00 pm'] });
        });

        test('legacy profile missing optional keys loads with defaults and saves', { tag: ['@lite', '@vendor'] }, async () => {
            const { show_email, enable_tnc, store_tnc, catalog_mode, dokan_store_time, ...rest } = originalMeta;
            void show_email, void enable_tnc, void store_tnc, void catalog_mode, void dokan_store_time;
            await dbUtils.setUserMeta(VENDOR_ID as string, PROFILE_META, rest, true);
            const schema = await getSchema();
            expect(valueOf(schema, 'show_email')).toBe('no');
            expect(valueOf(schema, 'enable_tnc')).toBe('off');
            const [response] = await api.put(endpoint, { data: { values: valuesOf(schema) }, headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
        });
    });

    test.describe('edge cases', () => {
        // Legacy accepted these schedules (Lite allows open == close; Pro's save_store_times has no
        // server check). With store hours OFF the grid is hidden, so it must not block other saves.
        const legacySchedules = [
            { label: 'open equals close', day: { status: 'open', opening_time: ['9:00 am'], closing_time: ['9:00 am'] } },
            { label: 'overnight range', day: { status: 'open', opening_time: ['10:00 pm'], closing_time: ['2:00 am'] } },
            { label: 'open with no times', day: { status: 'open', opening_time: [], closing_time: [] } },
        ];
        for (const { label, day } of legacySchedules) {
            test(`legacy schedule (${label}) with store hours off does not block an unrelated save`, { tag: ['@lite', '@vendor'] }, async () => {
                await seedMeta({ dokan_store_time_enabled: 'no', dokan_store_time: { ...originalMeta.dokan_store_time, monday: day } });
                const [response, body] = await api.put(endpoint, { data: { values: { phone: '01700000888' } }, headers: payloads.vendorAuth }, false);
                expect(response.status(), JSON.stringify(body?.data?.errors ?? body)).toBe(200);
                expect(valueOf(await getSchema(), 'phone')).toBe('01700000888');
            });
        }

        test('a boolean true on a switch is never stored as disabled', { tag: ['@lite', '@vendor'] }, async () => {
            await seedMeta({ show_email: 'yes', enable_tnc: 'on', store_tnc: 'Terms' });
            const [response] = await api.put(endpoint, { data: { values: { show_email: true, enable_tnc: true } }, headers: payloads.vendorAuth }, false);
            if (response.ok()) {
                const schema = await getSchema();
                expect(valueOf(schema, 'show_email')).toBe('yes');
                expect(valueOf(schema, 'enable_tnc')).toBe('on');
            } else {
                expect(response.status()).toBe(400);
            }
        });

        test('a partial store_map keeps the stored find_address', { tag: ['@lite', '@vendor'] }, async () => {
            const map = valueOf(await getSchema(), 'store_map') as { find_address?: string } | undefined;
            test.skip(map === undefined, 'Store map needs a map API key configured');
            await seedMeta({ find_address: 'New York, NY, USA' });
            await api.put(endpoint, { data: { values: { store_map: { location: '40.7,-74.0' } } }, headers: payloads.vendorAuth });
            expect(valueOf(await getSchema(), 'store_map')).toEqual({ location: '40.7,-74.0', find_address: 'New York, NY, USA' });
        });

        test('keys outside the schema are ignored', { tag: ['@lite', '@vendor'] }, async () => {
            const before = await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META);
            const values = { payment: { paypal: { email: 'other@example.com' } }, social: { fb: 'https://example.com' }, profile_completion: {} };
            const [response] = await api.put(endpoint, { data: { values }, headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            expect(await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META)).toEqual(before);
        });

        test('markup is stripped from the store title', { tag: ['@lite', '@vendor'] }, async () => {
            await api.put(endpoint, { data: { values: { store_name: '<script>alert(1)</script>Store 店 & Co' } }, headers: payloads.vendorAuth });
            expect(valueOf(await getSchema(), 'store_name')).toBe('Store 店 & Co');
        });
    });

    test.describe('pro surfaces', () => {
        test('multiple time ranges per day are saved', { tag: ['@pro', '@vendor'] }, async () => {
            const monday = { status: 'open', opening_time: ['9:00 am', '2:00 pm'], closing_time: ['12:00 pm', '6:00 pm'] };
            const [response] = await api.put(endpoint, { data: { values: { dokan_store_time_enabled: 'yes', dokan_store_time: { ...originalMeta.dokan_store_time, monday } } }, headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            expect((valueOf(await getSchema(), 'dokan_store_time') as Record<string, unknown>).monday).toEqual(monday);
        });

        test('overlapping time ranges are rejected', { tag: ['@pro', '@vendor'] }, async () => {
            const monday = { status: 'open', opening_time: ['9:00 am', '11:00 am'], closing_time: ['12:00 pm', '6:00 pm'] };
            const [response, body] = await api.put(endpoint, { data: { values: { dokan_store_time_enabled: 'yes', dokan_store_time: { ...originalMeta.dokan_store_time, monday } } }, headers: payloads.vendorAuth }, false);
            expect(response.status()).toBe(400);
            expect(String(body?.data?.errors?.dokan_store_time)).toContain('can not overlap');
        });

        test('date-wise vacation schedule is saved', { tag: ['@pro', '@vendor'] }, async () => {
            const row = { from: isoDate(2), to: isoDate(4), message: 'Back soon' };
            const values = { setting_go_vacation: 'yes', settings_closing_style: 'datewise', seller_vacation_schedules: [row] };
            const [response] = await api.put(endpoint, { data: { values }, headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            const schema = await getSchema();
            expect(valueOf(schema, 'settings_closing_style')).toBe('datewise');
            expect(valueOf(schema, 'seller_vacation_schedules')).toEqual([expect.objectContaining(row)]);
        });

        test('a vacation range starting in the past is rejected', { tag: ['@pro', '@vendor'] }, async () => {
            const values = { setting_go_vacation: 'yes', settings_closing_style: 'datewise', seller_vacation_schedules: [{ from: isoDate(-5), to: isoDate(2), message: 'Away' }] };
            const [response, body] = await api.put(endpoint, { data: { values }, headers: payloads.vendorAuth }, false);
            expect(response.status()).toBe(400);
            expect(body?.data?.errors).toBeTruthy();
        });

        test('legacy past vacation ranges survive a full save', { tag: ['@pro', '@vendor'] }, async () => {
            const past = { from: isoDate(-30), to: isoDate(-25), message: 'Last month' };
            await seedMeta({ setting_go_vacation: 'yes', settings_closing_style: 'datewise', seller_vacation_schedules: [past] });
            const [response, body] = await api.put(endpoint, { data: { values: valuesOf(await getSchema()) }, headers: payloads.vendorAuth }, false);
            expect(response.status(), JSON.stringify(body?.data?.errors ?? '')).toBe(200);
            const stored = await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META);
            expect(stored.seller_vacation_schedules).toEqual([expect.objectContaining(past)]);
        });

        test('vendor discount settings (legacy-only section) survive a React save', { tag: ['@pro', '@vendor'] }, async () => {
            const discount = { show_min_order_discount: 'yes', setting_minimum_order_amount: '100', setting_order_percentage: '10' };
            await seedMeta(discount);
            const [response] = await api.put(endpoint, { data: { values: valuesOf(await getSchema()) }, headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            expect(await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META)).toEqual(expect.objectContaining(discount));
        });

        test('vendor staff access follows the store settings capability', { tag: ['@pro', '@vendor'] }, async () => {
            const staff = payloads.createStaff();
            const [, staffId] = await api.createVendorStaff(staff, payloads.vendorAuth);
            const staffAuth = { Authorization: api.getBasicAuth({ username: staff.username, password: String(USER_PASSWORD) }) };
            const setAccess = (access: boolean) =>
                api.updateStaffCapabilities(staffId, { capabilities: [{ capability: 'dokan_view_store_settings_menu', access }] }, payloads.vendorAuth);
            try {
                await setAccess(true);
                const [allowed, schema] = await api.get(endpoint, { headers: staffAuth }, false);
                expect(allowed.status()).toBe(200);
                expect(valueOf(schema as Element[], 'store_name')).toBe(originalMeta.store_name);

                await setAccess(false);
                const [denied] = await api.get(endpoint, { headers: staffAuth }, false);
                expect(denied.status()).toBe(403);
            } finally {
                await api.deleteUser(staffId, payloads.adminAuth);
            }
        });
    });

    test.describe('localization', () => {
        test('store times stay in canonical g:i a regardless of the site time format', { tag: ['@lite', '@vendor'] }, async () => {
            const original = (await dbUtils.getOptionValueOrNull('time_format')) ?? 'g:i a';
            await dbUtils.setOptionValue('time_format', 'H:i', false);
            try {
                const monday = { status: 'open', opening_time: ['9:00 am'], closing_time: ['5:00 pm'] };
                const [response] = await api.put(endpoint, { data: { values: { dokan_store_time: { ...originalMeta.dokan_store_time, monday } } }, headers: payloads.vendorAuth });
                expect(response.ok()).toBeTruthy();
                const stored = await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META);
                expect(stored.dokan_store_time.monday).toEqual(monday);
            } finally {
                await dbUtils.setOptionValue('time_format', original, false);
            }
        });
    });

    test.describe('negative cases', () => {
        test('values that are not an object are rejected', { tag: ['@lite', '@vendor'] }, async () => {
            const [response] = await api.put(endpoint, { data: { values: 'abc' }, headers: payloads.vendorAuth }, false);
            expect(response.status()).toBe(400);
        });

        test('guest is rejected', { tag: ['@lite', '@guest'] }, async () => {
            // api.config injects admin auth on every request — blank it to go anonymous.
            const [getResponse] = await api.get(endpoint, { headers: { Authorization: '' } }, false);
            const [putResponse] = await api.put(endpoint, { data: { values: { phone: '1' } }, headers: { Authorization: '' } }, false);
            expect(getResponse.status()).toBe(401);
            expect(putResponse.status()).toBe(401);
        });

        test('customer is forbidden', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await api.get(endpoint, { headers: payloads.customerAuth }, false);
            expect(response.status()).toBe(403);
        });

        test('a vendor cannot write another vendor\'s store', { tag: ['@lite', '@vendor'] }, async () => {
            const [, vendor2Schema] = await api.get(endpoint, { headers: payloads.vendor2Auth });
            const vendor2Phone = valueOf(vendor2Schema as Element[], 'phone');
            const before = await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META);
            await api.put(`${endpoint}?vendor_id=${VENDOR_ID}`, { data: { vendor_id: VENDOR_ID, values: { phone: vendor2Phone } }, headers: payloads.vendor2Auth });
            expect(await dbUtils.getUserMeta(VENDOR_ID as string, PROFILE_META)).toEqual(before);
        });
    });
});
