import { test, expect } from '../_shared/fixtures';
import { seedOrder, authOf } from '../_shared/seed';
import { dbUtils } from '@utils/dbUtils';
import { VendorOrdersPage } from './vendorOrdersPage';

// Risk: P0 Vendor orders #6. Turns off a marketplace-wide capability, so this file runs in the
// serial `react_global` project after the parallel suite (see react.config.ts).
// Since 5.2.0 legacy dokan_selling reads are overlaid from the flat dokan_admin_settings option, so write that.

test.describe('Vendor orders: status-change capability off', () => {
    let orderId: string;
    let previous: unknown;

    test.beforeAll(async ({ api }) => {
        // Seed first: moving the order to processing goes through the gated endpoint.
        orderId = await seedOrder(api);
        [previous] = await dbUtils.updateOptionValue('dokan_admin_settings', { vendor_can_change_order_status: 'off' });
    });

    test.afterAll(async () => {
        const was = (previous as Record<string, string> | undefined)?.vendor_can_change_order_status ?? 'on';
        await dbUtils.updateOptionValue('dokan_admin_settings', { vendor_can_change_order_status: was });
    });

    test('#6 vendor cannot change order status', { tag: ['@lite', '@vendor', '@p0'] }, async ({ api, vendorPage }) => {
        const orders = new VendorOrdersPage(vendorPage);
        await orders.goto();
        const row = await orders.find(orderId);
        await row.getByRole('button', { name: 'Actions' }).click();
        const action = vendorPage.getByRole('menuitem', { name: 'Change status to completed', exact: true });

        // Either the UI hides the action, or the server refuses it. Both are fine; a completed order is not.
        const offered = await action.isVisible();
        await vendorPage.keyboard.press('Escape');
        if (offered) {
            const response = await orders.table.rowAction(row, 'Change status to completed');
            expect(response.status()).toBeGreaterThanOrEqual(400);
        }
        const [, order] = await api.getSingleOrder(orderId, authOf('vendor1'));
        expect(order.status).toBe('processing');
    });
});
