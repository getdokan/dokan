import type { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';

export type Vendor = 'vendor1' | 'vendor2';

// Each fixture vendor owns one seeded product (p1_v1 / p1_v2 from the setup project).
const VENDORS: Record<Vendor, { productId: () => string; auth: { Authorization: string } }> = {
    vendor1: { productId: () => process.env.PRODUCT_ID as string, auth: payloads.vendorAuth },
    vendor2: { productId: () => process.env.PRODUCT_ID_V2 as string, auth: payloads.vendor2Auth },
};

export const authOf = (vendor: Vendor) => VENDORS[vendor].auth;

/** Create a fresh order for one vendor's product and move it to `status`; returns the order id. */
export async function seedOrder(api: ApiUtils, vendor: Vendor = 'vendor1', status = 'wc-processing', quantity = 1): Promise<string> {
    const { productId, auth } = VENDORS[vendor];
    const [, , orderId] = await api.createOrderWithStatus(productId(), { ...payloads.createOrder, line_items: [{ product_id: productId(), quantity }] }, status, auth);
    return orderId;
}
