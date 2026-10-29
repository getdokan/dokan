import type { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
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

export type FreshVendor = { id: string; username: string; password: string; auth: { Authorization: string } };

/** A brand-new vendor no other test touches, for state that must not leak (subscriptions, limits, onboarding). */
export async function createVendor(api: ApiUtils): Promise<FreshVendor> {
    const store = payloads.createStore();
    const [, id] = await api.createStore(store, payloads.adminAuth);
    const auth = { Authorization: `Basic ${Buffer.from(`${store.user_login}:${store.user_pass}`).toString('base64')}` };
    return { id: String(id), username: store.user_login, password: store.user_pass, auth };
}

let category: Promise<number> | undefined;

/** A product category id that exists on the site (vendor products require one). */
export function categoryId(api: ApiUtils): Promise<number> {
    category ??= api.get(endPoints.wc.getAllCategories, { headers: payloads.adminAuth, params: { per_page: 1 } }).then(([, body]) => Number(body[0].id));
    return category;
}

/** Create a published simple product as `auth` (any vendor); returns the saved product as REST returns it. */
export async function createProductAs(api: ApiUtils, auth: { Authorization: string }): Promise<{ id: number; status: string; code?: string }> {
    const [, body] = await api.post(endPoints.createProduct, { headers: auth, data: { ...payloads.createProduct(), categories: [{ id: await categoryId(api) }] } }, false);
    return body;
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
