# [Stripe Connect] A checkout recalculation destroys the entered card and tells the shopper nothing

**Severity:** Major (the shopper only discovers the card is gone when Place order fails) · **Status:** Confirmed on wp-env (`:9999`), Stripe test mode · **Module:** `dokan-pro/modules/stripe` · **Found by:** automation, validating a manual report · **GitHub:** `getdokan/plugin-internal-tasks#2297`

## Summary

When WooCommerce recalculates the order review on the classic checkout, the Stripe Payment Element is re-created. The card typed into the previous instance is destroyed with it, and nothing on the page says so.

## Environment

- dokan-pro `feat/stripe-connect-revemp` at `9770acc32`, gateway `dokan-stripe-connect`, test mode.
- Classic `[woocommerce_checkout]` page. WooCommerce 11.0.1, HPOS, USD.

## Steps to reproduce

1. As a guest, add a product to the cart and open the classic checkout.
2. Fill the billing details and select Stripe Connect.
3. Enter `4242 4242 4242 4242`, any future expiry, any CVC.
4. Cause WooCommerce to recalculate the order review.
5. Compare the Stripe iframe names before and after, and read the page notices.

**A trap worth recording:** editing the billing city did not trigger `update_order_review` on this site, and neither did a programmatic fill of the postcode. Both leave the element untouched, which looks exactly like the issue not reproducing. Confirm the recalculation actually fired before drawing any conclusion.

## Expected

Either the card survives the recalculation, or the shopper is told plainly, next to the payment field and at the moment it happens, that it needs entering again.

## Actual

Two of the four Stripe frames are replaced:

```
before: __privateStripeFrame7213, 7217, 7219, 7216
after:  __privateStripeFrame7213, 72114, 72116, 7216
```

Filtering the page notices for anything mentioning the card or the payment method returns an empty string. The shopper is told nothing.

## Test coverage

- **Case:** `tests/e2e/stripe-connect/stripeConnectReportedIssues.spec.ts`, "#2297".
- **Marker:** imperative `test.fail()`.
- **Guard:** the test asserts `update_order_review` actually fired before judging anything, so it cannot report a vacuous pass.
- **Remove the marker when:** the element survives, or a card-specific notice appears at the moment it is replaced.
