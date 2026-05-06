import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

// Smoke + regression coverage for the dokan-invoice add-on (1.2.8).
// Intentionally narrow:
//   - TC-A6: plugin survives an admin page render (regression for the
//     seed-`wpo_wcpdf_version` workaround in _site.setup.ts).
//   - TC-E1 (E2E view): the order REST response carries the invoice URL,
//     which is only true when dokan-invoice is active and its filter ran.
// New vendor-dashboard tests (TC-D*) are skipped until dokan-lite ships
// the `dokan_orders_data_view_dataviews_actions` filter point.

let apiUtils: ApiUtils;

test.describe('Dokan Invoice', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('TC-E1: order REST exposes actions.invoice.url (proves dokan-invoice is active)', { tag: ['@pro', '@invoice'] }, async () => {
        const [, , orderId] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
        const [response, body] = await apiUtils.get(endPoints.getSingleOrder(orderId), { headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(body?.actions?.invoice?.url, 'actions.invoice.url should be injected by dokan-invoice').toMatch(
            new RegExp(`document_type=invoice.*order_ids=${orderId}`),
        );
    });

    test('TC-A6: dokan-invoice stays active across an admin page render (fresh-install regression)', { tag: ['@pro', '@invoice'] }, async ({ page }) => {
        // dokan-invoice <=1.2.8 self-deactivates via dependency_notice() on a
        // fresh install if `wpo_wcpdf_version` is missing when its constructor
        // runs. _site.setup.ts seeds the option to prevent that. This test
        // proves the plugin survives the first authenticated wp-admin render
        // by re-fetching an order REST response after admin-page traffic.
        const [, , orderIdBefore] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
        await page.goto('/wp-login.php');
        await page.fill('#user_login', process.env.ADMIN ?? 'admin');
        await page.fill('#user_pass', process.env.ADMIN_PASSWORD ?? 'password');
        await Promise.all([page.waitForLoadState('load'), page.click('#wp-submit')]);
        await page.goto('/wp-admin/plugins.php', { waitUntil: 'load' });

        const [response, body] = await apiUtils.get(endPoints.getSingleOrder(orderIdBefore), { headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        // If dokan-invoice had self-deactivated, its REST filter wouldn't run
        // and `actions.invoice` would be missing from the response.
        expect(body?.actions?.invoice?.url, 'dokan-invoice must still be active after wp-admin page render').toBeTruthy();
    });

    // --- New vendor dashboard (Dokan 5.0.0+) ----------------------------
    // dokan-invoice 1.2.8 registers the JS filter
    // `dokan_orders_data_view_dataviews_actions` (assets/js/dokan-orders.js).
    // dokan-lite's `OrderList.tsx` does not yet call `applyFilters()` for
    // that filter, so the "View Invoice" / "View Packing Slip" actions
    // never render. Re-enable these tests once that hook lands.

    test.skip('TC-D1: vendor sees "View Invoice" action in DataView row menu', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, () => {});
    test.skip('TC-D2: vendor sees "View Packing Slip" action when document enabled', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, () => {});
    test.skip('TC-D3: clicking "View Invoice" opens the PDF in a new tab', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, () => {});
});
