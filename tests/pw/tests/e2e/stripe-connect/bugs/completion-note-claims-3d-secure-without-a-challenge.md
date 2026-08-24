# [Stripe Connect] Every completed order is recorded as "3d secure", including payments with no challenge

**Severity:** Minor (no money moves, but the order record asserts an authentication that never happened) · **Status:** Confirmed on wp-env (`:9999`), Stripe test mode · **Module:** `dokan-pro/modules/stripe` · **Found by:** automation, case SC-48, validating a manual report · **GitHub:** `getdokan/plugin-internal-tasks#2299`

## Summary

Orders paid with a plain non-3DS card carry a completion note saying the payment completed "via ... 3d secure". Anyone reading the order history later, for a chargeback or a support question, would reasonably conclude the shopper was authenticated when they were not.

## Environment

- dokan-pro `feat/stripe-connect-revemp` at `9770acc32`, gateway `dokan-stripe-connect`, test mode.
- WooCommerce 11.0.1, HPOS, USD.

## Steps to reproduce

1. Pay for an order with `4242 4242 4242 4242`, which presents no 3D Secure challenge.
2. When the order reaches Processing, open it in WooCommerce → Orders.
3. Read the completion note.

## Expected

The note describes what actually happened, and says 3D Secure only when a challenge was presented.

## Actual

> Order 166 payment is completed via Stripe Connect **3d secure**. (Charge ID: ch_3U7SWZAr112Ud1FO07IKllGp)

Reproduced on orders 34, 35, 36 and 166, all paid with the non-3DS card and never challenged.

## Note on the related claim in the same issue

The second half of `#2299`, that the stored transaction id is sometimes the charge and sometimes the PaymentIntent, did **not** reproduce here. Orders that settled through a completed 3D Secure challenge (155, 158) and orders with no challenge (151, 152) all stored a `ch_` id. That is not a refutation, since which identifier is stored plausibly depends on which path finalises the order, and there is nothing reproducible here to assert against yet.

## Test coverage

- **Case:** SC-48 (Tier 3), `tests/e2e/stripe-connect/stripeConnectCheckout.spec.ts`.
- **Marker:** imperative `test.fail()`, with a positive control above it asserting a completion note exists at all.
- **Remove the marker when:** an unchallenged payment is no longer described as 3D Secure.
