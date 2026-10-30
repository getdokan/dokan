//COVERAGE_TAG: GET /dokan/v1/orders
//COVERAGE_TAG: GET /dokan/v1/orders/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/orders/(?P<id>[\d]+)
//COVERAGE_TAG: GET /dokan/v2/orders
//COVERAGE_TAG: GET /dokan/v2/orders/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v2/orders/(?P<id>[\d]+)

import { test, expect } from '../_shared/fixtures';
import { seedOrder, seedMultiVendorOrder, authOf } from '../_shared/seed';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

// Risk: P0 Vendor orders, the REST layer behind the React list. Failure-mode ids (#n) refer to
// tests/pw/baseline/failure-modes/vendor-orders.md.

const ids = (body: unknown) => (body as { id: number }[]).map(o => String(o.id));

for (const version of ['v1', 'v2']) {
    const url = (u: string) => u.replace('/dokan/v1/', `/dokan/${version}/`);

    test.describe(`Vendor orders REST ${version}`, () => {
        let own: string;
        let other: string;

        test.beforeAll(async ({ api }) => {
            [own, other] = await Promise.all([seedOrder(api), seedOrder(api, { vendor: 'vendor2' })]);
        });

        test("#1 list excludes another vendor's order", { tag: ['@lite', '@vendor', '@p0'] }, async ({ api }) => {
            const [, mine] = await api.get(url(endPoints.getAllOrders), { headers: authOf('vendor1'), params: { search: own } });
            const [, theirs] = await api.get(url(endPoints.getAllOrders), { headers: authOf('vendor1'), params: { search: other } });
            // `mine` guards `theirs`: search works, so an empty result means filtered out.
            expect(ids(mine)).toContain(own);
            expect(ids(theirs)).not.toContain(other);
        });

        test("#2 cannot read another vendor's order by id", { tag: ['@lite', '@vendor', '@p0'] }, async ({ api }) => {
            const [response] = await api.get(url(endPoints.getSingleOrder(other)), { headers: authOf('vendor1') }, false);
            expect(response.status()).toBe(403);
        });

        test("#2 cannot update another vendor's order", { tag: ['@lite', '@vendor', '@p0'] }, async ({ api }) => {
            const [response] = await api.put(url(endPoints.updateOrder(other)), { headers: authOf('vendor1'), data: { status: 'completed' } }, false);
            // Dokan answers 400 "not your product" here, not 403; what matters is the refusal and the untouched order.
            expect(response.status()).toBeGreaterThanOrEqual(400);
            expect(response.status()).toBeLessThan(500);
            const [, order] = await api.getSingleOrder(other, authOf('vendor2'));
            expect(order.status).toBe('processing');
        });

        test('#13 customer is refused', { tag: ['@lite', '@customer', '@p0'] }, async ({ api }) => {
            const [response] = await api.get(url(endPoints.getAllOrders), { headers: payloads.customerAuth }, false);
            expect(response.status()).toBe(403);
        });

        test('#13 guest is refused', { tag: ['@lite', '@guest', '@p0'] }, async () => {
            // Plain fetch: the project's API context sends admin auth by default.
            expect((await fetch(url(endPoints.getAllOrders))).status).toBe(401);
        });
    });
}

test("#3 a multi-vendor order lists only the vendor's own suborder, never the parent", { tag: ['@lite', '@vendor', '@p0'] }, async ({ api }) => {
    const { parent, suborders } = await seedMultiVendorOrder(api);
    expect(suborders.vendor1, 'Dokan split the order per vendor').not.toBe('');
    expect(suborders.vendor2, 'Dokan split the order per vendor').not.toBe('');

    const listed = async (vendor: 'vendor1' | 'vendor2', search: string) => ids((await api.get(endPoints.getAllOrders, { headers: authOf(vendor), params: { search } }))[1]);
    expect(await listed('vendor1', suborders.vendor1)).toContain(suborders.vendor1);
    expect(await listed('vendor1', parent), 'parent order in vendor1 list').not.toContain(parent);
    expect(await listed('vendor1', suborders.vendor2), "vendor2's suborder in vendor1 list").not.toContain(suborders.vendor2);
    expect(await listed('vendor2', suborders.vendor2)).toContain(suborders.vendor2);
    expect(await listed('vendor2', parent), 'parent order in vendor2 list').not.toContain(parent);

    // The parent carries the other vendor's line items, so reading it by id would leak them.
    const [response] = await api.get(endPoints.getSingleOrder(parent), { headers: authOf('vendor1') }, false);
    expect(response.status(), 'vendor1 reading the parent order').toBeGreaterThanOrEqual(400);
});

// #8 (earning + commission) is owned by tests/api/calculation.spec.ts (assertOrderCalculation over the commission matrix).
