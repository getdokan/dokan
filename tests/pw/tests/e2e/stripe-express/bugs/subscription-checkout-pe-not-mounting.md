# [Stripe Express] Payment Element does not mount on vendor-subscription (pack) block checkout

**Severity:** High (vendors cannot subscribe via Express) · **Status:** Suspected (needs confirmation on a clean env) · **Module:** `dokan-pro/modules/stripe-express` (+ `product_subscription`) · **Found by:** E2E `SE-SUB-01/02`

## Summary
When a vendor adds a recurring `product_pack` to the cart and opens the **block** checkout, the Stripe Express payment method **is offered** (its radio renders), but the Stripe **Payment Element never mounts** — `#dokan-stripe-express-payment-element` (and its card iframe) never become visible, even after 45s of retrying the method selection. The vendor therefore cannot complete a subscription purchase through Express.

This mirrors the known "Could not initialize Stripe" Payment-Element-init class of issue seen on subscription checkout.

## Environment
- localhost:9999 wp-env, HPOS, `product_subscription` **active**, `stripe_express` **active**, `stripe` (Connect) inactive.
- Note: `/dashboard/subscription` also returns **HTTP 404** here (the vendor subscription dashboard page/rewrite is not wired), which separately blocks the cancel/reactivate flow.

## Steps to reproduce
1. Ensure the Stripe Express gateway is API-ready and `product_subscription` is active.
2. Create a recurring subscription pack (`product_pack`).
3. As a vendor, add the pack to the cart → open the **block** checkout (`/checkout/`).
4. Select the "Stripe Express" payment method.

## Expected
The Stripe Payment Element mounts (`#dokan-stripe-express-payment-element` visible) so the vendor can enter card details and create the subscription (a Stripe `sub_…` on the platform customer).

## Actual
The method radio renders, but the Payment Element container never becomes visible (timeout). No card iframe appears, so the purchase cannot proceed.

## Evidence
- `selectBlockGateway()` clears the gateway-radio wait (method IS offered) but the subsequent mount wait for `#dokan-stripe-express-payment-element` exhausts its 45s budget.
- Test artifact: `playwright/e2e/test-artifacts/...subscription-no-duplicate.../error-context.md` → "waiting for `#dokan-stripe-express-payment-element` to be visible" / "Stripe Payment Element card iframe not found (did the 'Card' accordion open?)".
- Regular (non-subscription) connected-vendor carts mount the PE fine (the whole SE-MASTER/3DS/CURRENCY/PAYOUTS suites pass), so the failure is specific to the subscription/pack cart.

## Suggested next step
Confirm on a clean environment with the subscription dashboard pages flushed. If it reproduces, the Payment Element init path for a vendor-subscription cart (platform charge, no connected-account transfer) likely needs the same init fix applied on the Connect side.

## Test coverage
`tests/e2e/stripe-express/stripeExpressSubscriptions.spec.ts` — the lifecycle tests are marked `test.fixme` referencing this file (documented known-issue, NOT faked). They become live regression guards once the PE mounts on pack checkout. Webhook-lifecycle cases (renewal/failure/deletion/SCA) depend on first creating a real `sub_…` via this checkout, so they are gated behind the same blocker.
