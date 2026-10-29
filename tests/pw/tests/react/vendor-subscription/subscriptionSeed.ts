import type { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { wpEval } from '../_shared/wp';

export type Pack = { id: string; title: string; price: string; products: number; validityDays: number };

/** Create a non-recurring vendor subscription pack (WC product of type product_pack). */
export function createPack({ products = 1, validityDays = 30, price = '19.50' } = {}): Pack {
    const title = `pw pack ${Date.now()}`;
    const id = wpEval(
        `$p = new WC_Product_Product_Pack(0); $p->set_name(${JSON.stringify(title)}); $p->set_regular_price(${JSON.stringify(price)}); $p->set_status('publish'); ` +
            `$id = $p->save(); wp_set_object_terms($id, 'product_pack', 'product_type'); ` +
            `update_post_meta($id, '_no_of_product', ${JSON.stringify(String(products))}); update_post_meta($id, '_pack_validity', ${JSON.stringify(String(validityDays))}); echo $id;`,
    );
    return { id, title, price, products, validityDays };
}

export function deletePack(pack: Pack): void {
    wpEval(`wp_delete_post(${Number(pack.id)}, true);`);
}

/**
 * Buy `pack` for a vendor through WooCommerce's own hooks, minus the checkout UI: the order fires
 * checkout_order_processed (Pro stamps it as a subscription order) and then completes (Pro activates the pack).
 * Returns the order id and its total (tax included).
 */
export function purchasePack(vendorId: string, pack: Pack): { orderId: string; total: string } {
    const [orderId = '', total = ''] = wpEval(
        `$o = wc_create_order(['customer_id' => ${Number(vendorId)}]); $o->add_product(wc_get_product(${Number(pack.id)})); $o->calculate_totals(); $o->save(); ` +
            `do_action('woocommerce_checkout_order_processed', $o->get_id(), [], $o); $o = wc_get_order($o->get_id()); $o->update_status('completed'); echo $o->get_id() . ' ' . $o->get_total();`,
    ).split(' ');
    return { orderId, total };
}

/**
 * Assign `pack` to a vendor the way an admin does in the React vendor editor: the store update with
 * `assigned_subscription` plus a `dokan_admin` nonce (minted for the admin with no session, which is what basic auth presents).
 */
export async function assignPack(api: ApiUtils, vendorId: string, pack: Pack): Promise<void> {
    const nonce = wpEval(`wp_set_current_user(get_user_by('login', ${JSON.stringify(process.env.ADMIN)})->ID); echo wp_create_nonce('dokan_admin');`);
    await api.put(endPoints.updateStore(vendorId), { headers: payloads.adminAuth, data: { assigned_subscription: Number(pack.id), subscription_nonce: nonce } });
}
