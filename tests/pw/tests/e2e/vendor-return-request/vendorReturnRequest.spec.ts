import { Page, expect, test } from '@utils/test';
import { VendorReturnRequestPage, CustomerPage, OrdersPage, ApiUtils, data, payloads } from './vendorReturnRequestPage';
import { endPoints } from '@utils/apiEndPoints';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');
const { PRODUCT_ID, VENDOR_ID, CUSTOMER_ID } = process.env;
const RMA = `${endPoints.serverUrl}/dokan/v1/rma/warranty-requests`;

interface Seed {
    orderId: string;
    requestId: string;
}

// Seed one return request over REST (mirrors tests/e2e/new-return-request):
// fresh WC order → POST warranty-request as the CUSTOMER (RMA create is
// customer-only) → recover the request id as the VENDOR. RMA rows live in the
// custom wp_dokan_rma_* tables, so this is REST-only (no raw SQL).
async function seedReturnRequest(apiUtils: ApiUtils, type: 'replace' | 'refund' | 'coupon' = 'refund', status: 'new' | 'processing' = 'new'): Promise<Seed> {
    const [, order, orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID as string, payloads.createOrder, 'wc-processing', payloads.vendorAuth);
    const [res] = await apiUtils.post(
        RMA,
        {
            data: {
                order_id: Number(orderId),
                customer_id: Number(CUSTOMER_ID),
                vendor_id: Number(VENDOR_ID),
                type,
                status,
                reasons: 'defective',
                details: `PW RMA ${type}/${status} ${Date.now()}`,
                items: [{ product_id: order.line_items[0].product_id, item_id: order.line_items[0].id, quantity: 1 }],
            },
            headers: payloads.customerAuth,
        },
        false,
    );
    expect(res.status(), 'RMA request seeded (201)').toBe(201);
    const [, rows] = await apiUtils.get(`${RMA}?order_id=${orderId}`, { headers: payloads.vendorAuth }, false);
    return { orderId, requestId: String(rows[0].id) };
}

async function getRmaStatus(apiUtils: ApiUtils, requestId: string): Promise<string> {
    const [, body] = await apiUtils.get(`${RMA}/${requestId}`, { headers: payloads.vendorAuth }, false);
    return String(body?.status ?? '');
}

test.describe('Vendor RMA test', () => {
    let admin: VendorReturnRequestPage;
    let vendor: VendorReturnRequestPage;
    let vendor1: OrdersPage;
    let customer: VendorReturnRequestPage;
    let customer1: CustomerPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let orderId: string;
    let requestId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new VendorReturnRequestPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorReturnRequestPage(vPage);
        vendor1 = new OrdersPage(vPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new VendorReturnRequestPage(cPage);
        customer1 = new CustomerPage(cPage);

        apiUtils = new ApiUtils(null);
        // the legacy /dashboard/return-request vendor screen only renders when the module is active
        await apiUtils.activateModules(payloads.moduleIds.rma, payloads.adminAuth);
        // clean the vendor's existing requests so list/row oracles stay deterministic
        const [, existing] = await apiUtils.get(`${RMA}?per_page=100`, { headers: payloads.vendorAuth }, false);
        for (const r of Array.isArray(existing) ? existing : []) {
            await apiUtils.delete(`${RMA}/${r.id}`, { headers: payloads.vendorAuth }).catch(() => undefined);
        }
        // seed one refund request (drives view/message/status/refund/delete)
        ({ orderId, requestId } = await seedReturnRequest(apiUtils, 'refund', 'new'));
    });

    test.afterAll(async () => {
        // the last case deactivates the module — reactivate before RMA REST cleanup
        await apiUtils.activateModules(payloads.moduleIds.rma, payloads.adminAuth);
        const [, existing] = await apiUtils.get(`${RMA}?per_page=100`, { headers: payloads.vendorAuth }, false).catch(() => [undefined, []] as any);
        for (const r of Array.isArray(existing) ? existing : []) {
            await apiUtils.delete(`${RMA}/${r.id}`, { headers: payloads.vendorAuth }).catch(() => undefined);
        }
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await apiUtils?.dispose();
    });

    test('admin can RMA module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableRmaModule(); });
    test('vendor can view return request menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorReturnRequestRenderProperly(); });
    test('vendor can view return request settings menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorRmaSettingsRenderProperly(); });
    test('vendor can view return request details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorViewRmaDetails(orderId); });
    test('customer can send rma message', { tag: ['@pro', '@customer'] }, async () => { await customer.customerSendRmaMessage(orderId, 'test customer rma message'); });
    test('vendor can send rma message', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorSendRmaMessage(orderId, 'test vendor rma message'); });

    test('vendor can update rma status', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorUpdateRmaStatus(orderId, 'processing');
        // REST oracle: the request transitioned to processing
        expect(await getRmaStatus(apiUtils, requestId), 'status transitioned to processing (REST)').toBe('processing');
    });

    test('vendor can rma refund', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorRmaRefund(orderId, data.predefined.simpleProduct.product1.name, 'processing');
        // admin REST oracle: a pending refund now exists for this order
        const refundId = await apiUtils.getRefundIdByOrderId(orderId, 'pending', payloads.adminAuth).catch(() => undefined);
        expect(refundId, 'a pending refund was created for the order (admin REST)').toBeTruthy();
    });

    test('vendor can delete rma request', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorDeleteRmaRequest(orderId);
        // REST oracle: the request no longer resolves
        const [, rows] = await apiUtils.get(`${RMA}?order_id=${orderId}`, { headers: payloads.vendorAuth }, false);
        expect(Array.isArray(rows) ? rows.length : 0, 'deleted request no longer resolves (REST)').toBe(0);
    });

    test('customer can view return request menu page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => { await customer.customerReturnRequestRenderProperly(); });

    test('customer can request warranty', { tag: ['@pro', '@customer'] }, async () => {
        await customer1.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
        await customer1.goToCheckout();
        const newOrderId = await customer1.paymentOrder();
        await vendor1.updateOrderStatusOnTable(newOrderId, 'processing');
        await customer.customerRequestWarranty(newOrderId, data.predefined.simpleProduct.product1.name, data.rma.requestWarranty);
    });

    test('admin can disable RMA module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.rma, payloads.adminAuth);
        await admin.disableRmaModule();
    });
});

