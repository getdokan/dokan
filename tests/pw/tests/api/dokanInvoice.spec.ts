//COVERAGE_TAG: GET /dokan/v1/orders (dokan-invoice actions injection)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

// dokan-invoice 1.2.8 hooks `dokan_rest_prepare_shop_order_object` to inject
// `actions.invoice.url` and `actions.packing-slip.url` into Dokan order REST
// responses. Only the invoice document is enabled by default in WC PDF; the
// packing-slip document is opt-in and asserted softly below.

let apiUtils: ApiUtils;

test.describe('Dokan Invoice REST integration', () => {
    let orderId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, , orderId] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('TC-E1: /dokan/v1/orders/<id> includes actions.invoice.url', { tag: ['@pro', '@invoice'] }, async () => {
        const [response, body] = await apiUtils.get(endPoints.getSingleOrder(orderId), { headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(body).toBeTruthy();
        expect(body.actions, 'response.actions should be present').toBeTruthy();
        expect(body.actions.invoice, 'invoice action should be injected').toBeTruthy();
        expect(typeof body.actions.invoice.url).toBe('string');
        expect(body.actions.invoice.url.length).toBeGreaterThan(0);
    });

    test('TC-E2: actions.invoice.url is a usable WC PDF endpoint URL', { tag: ['@pro', '@invoice'] }, async () => {
        const [, body] = await apiUtils.get(endPoints.getSingleOrder(orderId), { headers: payloads.adminAuth });
        const url = body.actions?.invoice?.url ?? '';
        // WC PDF builds URLs as /?action=generate_wpo_wcpdf&document_type=invoice&order_ids=<id>
        expect(url).toMatch(/action=generate_wpo_wcpdf/);
        expect(url).toMatch(/document_type=invoice/);
        expect(url).toMatch(new RegExp(`order_ids=${orderId}\\b`));
    });

    test('TC-E4: actions.invoice.url is XSS-safe (no raw <script>, no entities)', { tag: ['@pro', '@invoice'] }, async () => {
        // The hook runs the URL through esc_url_raw( wp_specialchars_decode( ..., ENT_QUOTES ) ).
        // Decoded entities mean no `&amp;` etc; esc_url_raw means no <script> or javascript: scheme.
        const [, body] = await apiUtils.get(endPoints.getSingleOrder(orderId), { headers: payloads.adminAuth });
        const url: string = body.actions?.invoice?.url ?? '';
        expect(url).not.toMatch(/<script/i);
        expect(url).not.toMatch(/javascript:/i);
        expect(url).not.toMatch(/&amp;/);
    });

    test('TC-E?: packing-slip action present only when WC PDF document is enabled', { tag: ['@pro', '@invoice'] }, async () => {
        // The packing-slip document is opt-in. dokan-invoice only injects the
        // action when wcpdf_get_document(...)->is_enabled() returns true, so an
        // out-of-the-box install will not have it. Don't fail when absent —
        // just sanity-check the shape when it is.
        const [, body] = await apiUtils.get(endPoints.getSingleOrder(orderId), { headers: payloads.adminAuth });
        const slip = body.actions?.['packing-slip'];
        if (slip) {
            expect(typeof slip.url).toBe('string');
            expect(slip.url).toMatch(/document_type=packing-slip/);
        }
    });
});
