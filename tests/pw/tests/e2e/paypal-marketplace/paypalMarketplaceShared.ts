import { BASE_URL, SERVER_URL } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { PAYPAL_BUYER } from './paypalMarketplacePage';
import { PAYPAL_VENDOR_LOGINS } from './helpers';
import type { Probe } from './helpers';
import { USE_CARD_CAPTURE, CARD } from './paypalMarketplaceCardCheckout';

/**
 * Values shared by more than one PayPal spec's page object.
 *
 * Only definitions that are IDENTICAL in every file that had them live here. Two categories were
 * deliberately left duplicated per page object instead:
 *
 *   - Mutable module state (`productId`, `createdOrderIds`, `moduleActive`, `status`, ...). Each
 *     spec's `beforeAll` writes these; a single shared binding would let one spec's setup overwrite
 *     another's and reintroduce cross-spec state leakage.
 *   - Same-named constants whose TEXT differs per spec — `CREDENTIALS_SKIP` has 12 distinct
 *     variants, `MODULE_SKIP` 6, `MERCHANT_SKIP` 6, `BUYER_SKIP` 4 — because each states why THAT
 *     case cannot run. Merging them would erase the per-case reason.
 *
 * `APPROVAL_ACTOR_SKIP` looks identical in every file but is NOT here: it resolves to `CARD_SKIP`
 * or `BUYER_SKIP`, both of which are per-spec, so sharing the text would silently share the wrong
 * reason.
 */

export type Headers = Record<string, string>;

/** Single-site persistent-cart user meta — the exact row `dbUtils.clearCustomerCart()` deletes. */
export const PERSISTENT_CART_META = '_woocommerce_persistent_cart_1';

/** The WooCommerce store-currency option, mutated and restored by the currency cases. */
export const CURRENCY_OPTION = 'woocommerce_currency';

/** Gateway title/description as shipped, i.e. what a restore must put back. */
export const DEFAULT_TITLE = 'PayPal Marketplace';
export const DEFAULT_DESCRIPTION = "Pay via PayPal Marketplace; you can pay with your credit card if you don't have a PayPal account";

/** Classic checkout's AJAX endpoint — matched on the response, not the URL bar. */
export const CHECKOUT_AJAX = /wc-ajax=checkout/;

/** Namespace of the test mu-plugin's REST routes (status, seed, probe, webhook injection). */
export const TEST_NS = `${SERVER_URL}/dokan-test-paypal/v1`;

/** admin-ajax lives at the SITE ROOT, not under the REST base (SERVER_URL ends in /wp-json). */
export const ADMIN_AJAX_URL = `${BASE_URL.replace(/\/$/, '')}/wp-admin/admin-ajax.php`;

/** Env-driven like every other identity here; hardcoding it seeds the wrong sandbox account. */
export const VENDOR1_EMAIL = PAYPAL_VENDOR_LOGINS.vendor1.email || 'dokangit@vendor1.com';
export const VENDOR2_EMAIL = PAYPAL_VENDOR_LOGINS.vendor2.email || 'dokangit@vendor2.com';

/** Whether a real sandbox buyer exists to drive PayPal's hosted approval. */
export const HAS_BUYER_LOGIN = Boolean(PAYPAL_BUYER.email && PAYPAL_BUYER.password);

/** The actor that can approve on the ACTIVE route: a sandbox buyer for the wallet, a card for UCC. */
export const HAS_APPROVAL_ACTOR = USE_CARD_CAPTURE ? CARD.number !== '' : HAS_BUYER_LOGIN;

export const CUSTOMER: Headers = payloads.customerAuth as Headers;
export const VENDOR2: Headers = payloads.vendor2Auth as Headers;

/**
 * Explicitly empty Authorization. `request.newContext()` INHERITS the shared config's admin Basic
 * auth when `extraHTTPHeaders` is omitted, so an "anonymous" probe is not anonymous without this.
 */
export const ANON: Headers = { Authorization: '' };

/**
 * Absolute site URL. `browser.newContext()` does NOT inherit `use.baseURL` — only the
 * `context`/`page` fixtures do — so a relative `page.goto('/cart/')` inside a manually created
 * context fails outright. Every navigation on a manual context goes through here.
 */
export const siteUrl = (path: string): string => `${BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

export const errorCode = (p: Probe): string => (typeof p.json?.code === 'string' ? p.json.code : '');
