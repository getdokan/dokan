# [Stripe Express] Manual capture authorizes the payment but the module never captures it (no capture trigger)

**Severity:** Medium · **Status:** Suspected (needs product-team confirmation) · **Module:** `dokan-pro/modules/stripe-express` · **Found by:** E2E `SE-PAY-07`

## Summary
With the Stripe Express gateway's **Manual capture** setting enabled (`capture = yes`), a customer payment is correctly **authorized** (PaymentIntent `capture_method = manual` → status `requires_capture`). However, the module appears to provide **no mechanism to actually capture** that authorized payment afterward — there is no "Capture charge" order action and no capture-on-order-status hook. The authorized funds are therefore never captured by the plugin (the merchant would have to capture manually in the Stripe Dashboard, and the authorization will otherwise expire after ~7 days).

## Environment
- Dokan Pro Stripe Express module (gateway `dokan_stripe_express`), test mode.
- Setting: **Payment and Disbursement → Manual capture = enabled** (`capture = yes`).

## Steps to reproduce
1. Enable Manual capture on the Stripe Express gateway.
2. As a customer, buy a connected-vendor product via block checkout with `4242 4242 4242 4242`.
3. Observe the PaymentIntent on Stripe → status `requires_capture` (authorized, not captured). ✅ expected.
4. Move the WooCommerce order to **Completed** (or Processing).
5. Re-check the PaymentIntent on Stripe.

## Expected
Completing/processing the order (or an admin "Capture charge" order action) captures the authorized PaymentIntent → status `succeeded`, and the vendor disbursement then proceeds against captured funds.

## Actual
The PaymentIntent **stays `requires_capture`** after the order is completed. No capture occurs.

## Evidence (source)
- `capture_method` is set to `manual` only: `includes/Controllers/Checkout.php:117`, `includes/PaymentGateways/Stripe.php:672`.
- The only order-status hook in the module is the **disbursement** handler, not a capture: `includes/Controllers/Order.php:49` → `handle_payment_disbursement` (transfers funds; never calls `PaymentIntent::capture`).
- No "Capture charge" `woocommerce_order_actions` handler and no `->capture()` call were found anywhere under `includes/`.
- Concern: `handle_payment_disbursement` fires on `processing`/`completed` and attempts the **vendor Transfer** even though the charge is not captured — i.e. it may disburse from accumulated platform balance for funds that were never actually captured from the customer.

## Suggested fix / question for the product team
Either (a) capture the authorized PaymentIntent on the order's paid-status transition (and only then disburse), or (b) add a "Capture charge" order action, or (c) if capture is intentionally external-only, document it and ensure disbursement does **not** run for an uncaptured charge.

## Test coverage
`tests/e2e/stripe-express/stripeExpressPayouts.spec.ts` → `SE-PAY-07` now asserts the **verified real behaviour** (authorize → `requires_capture`, no auto-capture on completion) rather than the originally-assumed capture-on-completion. Update the assertion if/when capture behaviour changes.
