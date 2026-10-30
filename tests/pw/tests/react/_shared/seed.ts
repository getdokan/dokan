import type { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { wpEval } from './wp';

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

/** Move an order's creation date `days` into the past (the WooCommerce REST API ignores date_created on update). */
export function backdateOrder(orderId: string, days: number): void {
    wpEval(`$o = wc_get_order(${Number(orderId)}); $o->set_date_created(time() - ${Number(days)} * DAY_IN_SECONDS); $o->save();`);
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
    // customer_id is always explicit: payloads.createOrder defaults it to the setup-written CUSTOMER_ID env var.
    const order = { ...payloads.createOrder, line_items: [{ product_id: productId, quantity }], customer_id: Number(customer ?? 0) };
    const [, , orderId] = await api.createOrderWithStatus(productId, order, status, VENDORS[vendor].auth);
    return orderId;
}

/**
 * A guest order with one product from each fixture vendor. Dokan splits it into one suborder per vendor under
 * the parent. Returns the parent id and each vendor's suborder id (matched by line-item product).
 */
export async function seedMultiVendorOrder(api: ApiUtils): Promise<{ parent: string; suborders: Record<Vendor, string> }> {
    const [p1, p2] = await Promise.all([productIdOf(api, 'vendor1'), productIdOf(api, 'vendor2')]);
    const [, , parent] = await api.createOrderWc({
        ...payloads.createOrder,
        customer_id: 0,
        status: 'processing',
        line_items: [
            { product_id: p1, quantity: 1 },
            { product_id: p2, quantity: 1 },
        ],
    });
    const [, children] = await api.get(endPoints.wc.getAllOrders, { headers: payloads.adminAuth, params: { parent } });
    const owner = (productId: string) =>
        String((children as { id: number; line_items: { product_id: number }[] }[]).find(o => o.line_items.some(l => String(l.product_id) === productId))?.id ?? '');
    return { parent, suborders: { vendor1: owner(p1), vendor2: owner(p2) } };
}

export type Staff = { id: string; username: string; password: string; email: string; name: string; auth: { Authorization: string } };

/** A new vendor staff member of `vendor`, with Dokan's default staff capabilities. */
export async function createStaff(api: ApiUtils, vendor: Vendor = 'vendor1'): Promise<Staff> {
    const payload = { ...payloads.createStaff(), first_name: 'Staff', last_name: `PW-${Date.now()}${Math.floor(Math.random() * 1000)}` };
    const [, id] = await api.createVendorStaff(payload, authOf(vendor));
    const auth = { Authorization: `Basic ${Buffer.from(`${payload.username}:${payload.password}`).toString('base64')}` };
    return { id: String(id), username: payload.username, password: payload.password, email: payload.email, name: `${payload.first_name} ${payload.last_name}`, auth };
}

/** Grant (true) or revoke (false) staff capabilities the way the vendor does (REST). */
export async function setStaffCaps(api: ApiUtils, staffId: string, caps: Record<string, boolean>, vendor: Vendor = 'vendor1'): Promise<void> {
    const capabilities = Object.entries(caps).map(([capability, access]) => ({ capability, access }));
    await api.put(endPoints.updateVendorStaffCapabilities(staffId), { headers: authOf(vendor), data: { capabilities } });
}

export async function staffCaps(api: ApiUtils, staffId: string, vendor: Vendor = 'vendor1'): Promise<Record<string, boolean>> {
    return (await api.get(endPoints.getVendorStaffCapabilities(staffId), { headers: authOf(vendor) }))[1];
}
