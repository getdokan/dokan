# `BILLING.SUBSCRIPTION.PAYMENT.FAILED` webhook is dead — the handler reads a doubled user-meta key

**Component:** Dokan Pro → PayPal Marketplace module → webhook events
**Version observed:** dokan-pro 5.0.9 (`74f2f3303`)
**Severity:** High — a failed vendor-subscription payment silently leaves the vendor with full posting rights
**Type:** Bug (functional)
**Discovered by:** PayPal Marketplace E2E suite, case `PP-WHK-18`
**Spec:** `tests/pw/tests/e2e/paypal-marketplace/paypalMarketplaceWebhooks.spec.ts` (written as `test.fixme`)

## Summary

`BillingSubscriptionPaymentFailed::handle()` resolves the vendor's subscription order from the
user meta key `product_order_idproduct_order_id`. The real meta key written everywhere else in
Dokan is `product_order_id`. The doubled key never exists, so `wc_get_order()` is always called
with an empty value, the handler logs "Invalid Order id: " and returns, and the single mutation
the handler exists to perform — revoking the vendor's product-posting capability — never runs.

The handler is therefore a no-op for every real PayPal payment-failure notification.

## Evidence

`wp-content/plugins/dokan-pro/modules/paypal-marketplace/includes/WebhookEvents/BillingSubscriptionPaymentFailed.php:57`

```php
$order_id = get_user_meta( $vendor_id, 'product_order_idproduct_order_id', true );

// validate order
$order = wc_get_order( $order_id );
if ( ! $order ) {
    dokan_log( '[Dokan PayPal Marketplace] Webhook: BillingSubscriptionPaymentFailed, Invalid Order id: ' . $order_id ); // maybe deleted order
    return;
}
```

The correct key, written by the subscription module when a pack is activated:

`wp-content/plugins/dokan-pro/modules/subscription/includes/classes/SubscriptionPack.php:488`

```php
update_user_meta( $user_id, 'product_order_id', $order->get_id() );
```

and deleted again by
`wp-content/plugins/dokan-pro/modules/subscription/includes/classes/Helper.php:690`
(`delete_subscription_pack()`), which likewise uses `product_order_id`.

The sibling handlers in the same module read the correct key, which is what makes the doubled
one look like a copy-paste slip rather than an intentional second key:

- `BillingSubscriptionReActivated.php:59` — `get_user_meta( $vendor_id, 'product_order_id', true )`
- `BillingSubscriptionSuspended.php:62` — `get_user_meta( $vendor_id, 'product_order_id', true )`

A repository-wide search for `product_order_idproduct_order_id` returns exactly one hit: the line
above. Nothing ever writes it.

## Steps to reproduce

1. Activate the `paypal_marketplace` and `product_subscription` modules and configure the PayPal
   Marketplace gateway in sandbox mode.
2. Give a vendor an active vendor-subscription paid with `dokan_paypal_marketplace`, so the vendor
   holds `product_order_id`, `can_post_product = 1` and
   `_dokan_paypal_marketplace_vendor_subscription_id`, and the subscription order holds
   `_dokan_vendor_subscription_order = yes` plus the matching subscription id.
3. Deliver a `BILLING.SUBSCRIPTION.PAYMENT.FAILED` event for that subscription id (a real PayPal
   delivery, or the E2E injection route `dokan-test-paypal/v1/paypal-webhook`).

## Expected

The vendor's `can_post_product` user meta is set to `'0'`, so a vendor whose subscription payment
failed can no longer publish products until the subscription is paid.

## Actual

Nothing changes. `can_post_product` stays `'1'`. The only trace is a `dokan_log()` line reading
`Invalid Order id:` with an empty id. The vendor keeps every subscription-gated capability
indefinitely, because no other code path revokes it on a payment failure — the module's own
fallback (`Helper::update_order_status( $order, 'on-hold', … )`) is commented out on line 84 of
the same file.

## Suggested fix

```diff
-        $order_id = get_user_meta( $vendor_id, 'product_order_idproduct_order_id', true );
+        $order_id = get_user_meta( $vendor_id, 'product_order_id', true );
```

## Notes for whoever picks this up

- The E2E case is deliberately written as `test.fixme` with the *correct-behaviour* assertions
  spelled out beneath it. Do not convert it into a passing test that asserts nothing happens —
  that would ossify the defect as intended behaviour. Remove the `fixme` once the key is fixed.
- Worth checking at the same time whether the commented-out `Helper::update_order_status()` call
  on line 84 was meant to ship; as written, a failed renewal leaves the subscription order in its
  previous status too.
