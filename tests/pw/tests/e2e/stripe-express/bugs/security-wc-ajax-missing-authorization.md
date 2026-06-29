# [Stripe Express] WC-AJAX checkout endpoints lack ownership / login checks (IDOR + guest-reachable)

**Severity:** High · **Status:** Confirmed live by E2E (SE-SEC) · **Module:** `dokan-pro/modules/stripe-express` · `includes/Controllers/Checkout.php`

The Stripe Express checkout WC-AJAX endpoints (`?wc-ajax=dokan_stripe_express_*`) gate only on a **nonce** — there is **no per-user ownership check** on `order_id`/`order` and **no login/capability gate**. Each finding below was reproduced live (test mode) by the `stripeExpressSecurity.spec.ts` suite (the tests assert the real, reachable behaviour and pass; the insecurity is the finding).

---

## 1. `create_payment_intent` — order_id IDOR  (SE-SEC-12)
A logged-in customer can mint a PaymentIntent **for another user's order** by passing its `order_id`. Reproduced: customer #2 minted `pi_…` (amount 2300) for vendor-owned order **743** — no ownership check. `Checkout.php:101-119`.
**Impact:** info disclosure (foreign order total/metadata via the returned client_secret) + ability to drive payment on orders the caller doesn't own.

## 2. `verify_intent` — IDOR / cross-customer payment-method attach  (SE-SEC-08)
Resolves the order purely from `absint($_GET['order'])` — **no `order_key`, no per-user ownership check** (`Checkout.php:217-220`). The only guard is the `dokan_stripe_express_confirm_pi` nonce; once obtained, **any** order id is verified, and with `save_payment_method=1` the victim's payment method can be attached to the **attacker's** Stripe customer (`Checkout.php:242-256`).
**Impact:** highest severity — cross-customer payment-method theft.

## 3. `init_setup_intent` — guest-reachable  (SE-SEC-13)
A logged-out **guest** created a SetupIntent (`seti_…`) using only the guest checkout nonce — no login/capability gate (`Checkout.php:287-294`).
**Impact:** unauthenticated Stripe SetupIntent creation (resource abuse).

## 4. `update_order_status` — force-fail surface  (SE-SEC-09)
The handler's catch path can force an order to `failed` on an intent mismatch with no ownership binding (`Checkout.php:347-391`).
**Impact:** potential order-state DoS on foreign orders.

## 5. `update_payment_intent` — IDOR surface  (SE-SEC-11)
Mutates a PaymentIntent by attacker-supplied id with only a checkout-level nonce (`Checkout.php:159-186`).

---

## Suggested fix
For each endpoint, after the nonce check, verify the caller **owns** the referenced order (`$order->get_customer_id() === get_current_user_id()` and/or a valid `order_key`), and require an authenticated customer where a guest has no legitimate need (`init_setup_intent`).

## Test coverage
`tests/e2e/stripe-express/stripeExpressSecurity.spec.ts` — SE-SEC-08/09/11/12/13 reproduce these live and pass (asserting the real behaviour). They are the regression guards: once ownership checks are added, update them to assert the request is **rejected**.
