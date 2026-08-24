# [Stripe Connect] The block checkout replaces Stripe's decline reason with a generic message

**Severity:** Major (a declined shopper is never told why, so they cannot know to try another card) · **Status:** Confirmed on wp-env (`:9999`), Stripe test mode · **Module:** `dokan-pro/modules/stripe` · **Found by:** automation, validating a manual report · **GitHub:** `getdokan/plugin-internal-tasks#2295`

## Summary

The same declined card produces Stripe's real reason on the classic checkout and a generic message on the block checkout. The decline is handled correctly underneath, so this is purely what the shopper reads.

## Environment

- dokan-pro `feat/stripe-connect-revemp` at `9770acc32`, gateway `dokan-stripe-connect`, test mode.
- WooCommerce 11.0.1, HPOS enabled, USD.

## Steps to reproduce

1. As a guest, add a product from a connected vendor to the cart.
2. Open the **block** checkout, fill the shipping details, choose Stripe Connect.
3. Pay with `4000 0000 0000 0002`, any future expiry, any CVC.
4. Read the message shown.
5. Repeat on a **classic** `[woocommerce_checkout]` page with the same card.

## Expected

Both checkouts show the reason the payment failed, as Stripe reported it.

## Actual

```
classic: "Your card has been declined."
block:   "Something went wrong. Please contact us to get assistance."
```

## Evidence

Both messages captured in one test run, back to back, on the same build and the same product. No paid order is created on either surface and the cart survives for a retry, so only the message differs.

## Test coverage

- **Case:** `tests/e2e/stripe-connect/stripeConnectReportedIssues.spec.ts`, "#2295".
- **Marker:** imperative `test.fail()` one line before the assertion. The positive control above it, that the classic checkout does show the reason, still reports honestly.
- **Remove the marker when:** the block checkout shows the real decline reason.
