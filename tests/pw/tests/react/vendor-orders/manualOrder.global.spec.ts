import { test, expect } from '../_shared/fixtures';
import { authOf, customerId, productIdOf, seedOrder } from '../_shared/seed';
import { setDokanSetting, setRoleCap } from '../_shared/wp';
import { endPoints } from '@utils/apiEndPoints';
import { ManualOrderPage } from './manualOrderPage';

// Risk: Vendor orders, Pro manual orders (vendor creates an order on a customer's behalf).
// Manual orders are off by default and gated by an admin setting plus a role capability, so this file
// flips marketplace-wide state and runs in react_global, serially.

const CAP = 'dokan_manage_manual_order';

test.describe('Vendor manual orders (React)', () => {
    test.describe.configure({ mode: 'serial' });
    let previous: string;

    test.beforeAll(() => {
        previous = setDokanSetting('dokan_selling', 'allow_vendor_create_manual_order', 'on');
        setRoleCap(CAP, true);
    });

    test.afterAll(() => {
        setDokanSetting('dokan_selling', 'allow_vendor_create_manual_order', previous || 'off');
        setRoleCap(CAP, previous === 'on');
    });

    test('#M1 new order starts as Pending payment and offers every WooCommerce status', { tag: ['@pro', '@vendor', '@p1'] }, async ({ vendorPage }) => {
        const form = new ManualOrderPage(vendorPage);
        await form.goto();
        expect(await form.status()).toMatch(/pending payment/i);
        expect(await form.statusOptions()).toEqual(expect.arrayContaining(['Pending payment', 'Processing', 'On hold', 'Completed', 'Cancelled', 'Refunded', 'Failed']));
    });

    test('#M2 saved manual order holds the product, customer, status and note, and belongs to the vendor', { tag: ['@pro', '@vendor', '@p0'] }, async ({ vendorPage, api }) => {
        // The vendor's customer picker only lists customers who already ordered from this vendor.
        const customer = await customerId(api, 'customer1');
        await seedOrder(api, { customer });
        const note = `pw manual order ${Date.now()}`;
        const form = new ManualOrderPage(vendorPage);
        await form.goto();
        await form.addProduct('p1_v1', /p1_v1/);
        await form.setCustomer('customer1', /customer1/i);
        // Note before status: adding a note resets an unsaved status (#M5).
        await form.addNote(note);
        await form.setStatus('Completed');
        expect(await form.save()).toBeLessThan(400);

        const [, order] = await api.getSingleOrder(form.orderId, authOf('vendor1'));
        expect(order.status).toBe('completed');
        expect(String(order.customer_id)).toBe(customer);
        expect(order.line_items.map((item: { product_id: number }) => String(item.product_id))).toContain(await productIdOf(api));

        const [, notes] = await api.get(endPoints.getAllOrderNotes(form.orderId), { headers: authOf('vendor1') });
        expect((notes as { note: string }[]).map(n => n.note)).toContain(note);

        const [response] = await api.get(endPoints.getSingleOrder(form.orderId), { headers: authOf('vendor2') }, false);
        expect(response.status(), 'another vendor cannot read it').toBe(403);
    });

    test('#M5 adding a note keeps the unsaved order status', { tag: ['@pro', '@vendor', '@p1'] }, async ({ vendorPage }) => {
        // Known bug (found by this suite): adding a note reloads the order and resets the unsaved status to
        // Pending payment, so "pick Completed, add note, Save" stores a pending order. Remove test.fail once fixed.
        test.fail();
        const form = new ManualOrderPage(vendorPage);
        await form.goto();
        await form.setStatus('Completed');
        await form.addNote(`pw note ${Date.now()}`);
        expect(await form.status()).toMatch(/completed/i);
    });

    test('#M3 product search with no match offers nothing', { tag: ['@pro', '@vendor', '@p2'] }, async ({ vendorPage }) => {
        const form = new ManualOrderPage(vendorPage);
        await form.goto();
        await expect(await form.searchProducts(`no-such-product-${Date.now()}`)).toHaveCount(0);
    });

    test('#M4 with the setting off the route and menu entry are gone', { tag: ['@pro', '@vendor', '@admin', '@p0'] }, async ({ vendorPage }) => {
        setDokanSetting('dokan_selling', 'allow_vendor_create_manual_order', 'off');
        setRoleCap(CAP, false);
        const form = new ManualOrderPage(vendorPage);
        await form.gotoExpectingGate();
        await expect(form.notFound).toBeVisible();
        await expect(form.heading).toHaveCount(0);
        await expect(form.navLink).toHaveCount(0);
    });
});
