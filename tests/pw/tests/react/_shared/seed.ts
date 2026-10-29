import type { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';

export type Vendor = 'vendor1' | 'vendor2';

// Fixture vendors and the simple product each one owns (created by the e2e site setup).
const VENDORS: Record<Vendor, { product: string; auth: { Authorization: string } }> = {
    vendor1: { product: data.predefined.simpleProduct.product1.name, auth: payloads.vendorAuth },
    vendor2: { product: data.predefined.vendor2.simpleProduct.product1.name, auth: payloads.vendor2Auth },
};

export const authOf = (vendor: Vendor) => VENDORS[vendor].auth;

// Looked up by name once per worker: the setup's PRODUCT_ID env vars only exist inside a run that includes setup.
const productIds = new Map<Vendor, Promise<string>>();

/** Id of the fixture product owned by `vendor` (p1_v1 / p1_v2). */
export function productIdOf(api: ApiUtils, vendor: Vendor = 'vendor1'): Promise<string> {
    if (!productIds.has(vendor)) {
        const { product, auth } = VENDORS[vendor];
        productIds.set(
            vendor,
            api.getProductId(product, auth).then(id => {
                if (!id) throw new Error(`fixture product "${product}" not found for ${vendor}; run the e2e setup project`);
                return String(id);
            }),
        );
    }
    return productIds.get(vendor)!;
}

/** WordPress user id of a fixture customer (e.g. "customer1"). */
export async function customerId(api: ApiUtils, username: string): Promise<string> {
    return String(await api.getCustomerId(username, payloads.adminAuth));
}

/**
 * Create a fresh order for the vendor's fixture product and move it to `status`; returns the order id.
 * Orders are guest orders unless `customer` is given.
 */
export async function seedOrder(
    api: ApiUtils,
    { vendor = 'vendor1', status = 'wc-processing', quantity = 1, customer }: { vendor?: Vendor; status?: string; quantity?: number; customer?: string } = {},
): Promise<string> {
    const productId = await productIdOf(api, vendor);
    const order = { ...payloads.createOrder, line_items: [{ product_id: productId, quantity }], ...(customer ? { customer_id: Number(customer) } : {}) };
    const [, , orderId] = await api.createOrderWithStatus(productId, order, status, VENDORS[vendor].auth);
    return orderId;
}
