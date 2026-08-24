# [Stripe Connect] Seller-pays-the-fee transfers the vendor the GROSS earning on the classic checkout

**Severity:** Critical (the vendor is overpaid by the processing fee on every such order, and nothing reverses it) · **Status:** Confirmed on wp-env (`:9999`), Stripe test mode · **Module:** `dokan-pro/modules/stripe` · **Found by:** automation, case SC-42, while reproducing a manual report · **GitHub:** `getdokan/plugin-internal-tasks#2294`

## Summary

With `seller_pays_the_processing_fee = yes`, the marketplace records the vendor's earning **net** of the Stripe processing fee. On the **classic** checkout the vendor is sometimes transferred the **gross** amount instead, and no reversal corrects it, so the vendor keeps a fee the platform has already deducted on paper.

**The root cause is deterministic. The money symptom is a race.**

`IntentController.php:102-108` defers disbursement when the seller pays the fee and the fee has not settled yet, precisely so the transfer is not made before the amount is known. That deferral fires on the block checkout and **never** fires on the classic one:

| Surface | `_dokan_stripe_awaiting_disbursement` | Observed                                    |
| ------- | ------------------------------------- | ------------------------------------------- |
| Block   | `yes`, every run                      | transfer always equals the recorded earning |
| Classic | **never set**, 5 runs out of 5        | over-transferred on 3 runs out of 5         |

With no deferral the transfer races Stripe attaching the balance transaction. Win the race and the fee is already known, so the net amount goes out. Lose it and the gross does.

Five consecutive classic orders, same build and settings:

| Run | Transferred | Recorded earning | Over by |
| --- | ----------- | ---------------- | ------- |
| 1   | 100.00      | 100.00           | matched |
| 2   | 175.19      | 169.40           | 5.79    |
| 3   | 153.20      | 148.09           | 5.11    |
| 4   | 166.50      | 160.98           | 5.52    |
| 5   | 178.85      | 178.85           | matched |

A 60 percent per-order rate is consistent with the six-out-of-six run in the original report, all of which were classic orders.

## Environment

- dokan-pro `feat/stripe-connect-revemp` at `9770acc32`, gateway `dokan-stripe-connect`, test mode.
- `seller_pays_the_processing_fee = yes`. Single-vendor cart, no coupon.
- vendor1 connected to real test account `acct_1Tiw3dA9NwgmGeKQ` (`charges_enabled` and `payouts_enabled` both true).
- WooCommerce 11.0.1, HPOS enabled, store currency USD.

## Steps to reproduce

1. Set _WooCommerce → Payments → Stripe Connect → Seller pays the processing fee_ to yes.
2. As a guest, put one product from a single connected vendor in the cart.
3. Pay on a **classic** `[woocommerce_checkout]` page with `4242 4242 4242 4242`.
4. Read the vendor's earning from `GET /wp-json/dokan/v1/orders/{id}`.
5. Read the transfer from `GET /v1/transfers/{_dokan_stripe_transfer_id}` on the Stripe API.
6. Compare the two amounts.

## Expected

The transfer equals the recorded earning. With the seller paying the fee, both are the net figure.

## Actual

Order 123: recorded earning **$159.05**, transferred **$164.50**, gateway fee **$5.45**, `dokan_gateway_fee_paid_by = seller`. This is one of the runs where the race is lost.

```
tr_3U7LqmAr112Ud1FO014XkWoU  amount=16450  dest=acct_1Tiw3dA9NwgmGeKQ
reversed=false  amount_reversed=0
```

$159.05 + $5.45 = $164.50. Nothing reverses the difference.

## Evidence

Reproduced twice outside the suite (order 123) and on every classic run inside it. The block checkout paid the correct net amount on five separate runs: 191.05, 152.27, 146.45, 140.63 and 115.42, each matching its recorded earning to the cent.

## Cause

`_dokan_stripe_awaiting_disbursement` is never set on the classic path, so `maybe_disburse_deferred_payment()` has nothing to release and the immediate disbursement below the guard runs instead. Confirmed on 5 runs out of 5.

## Suspected fix

Set `_dokan_stripe_awaiting_disbursement` on the classic path as well, so the transfer waits for `charge.updated` the way it already does on the block checkout. That removes the race rather than adjusting the amount.

## Test coverage

- **Case:** SC-42, `tests/e2e/stripe-connect/stripeConnectMultiVendor.spec.ts`, run on both surfaces.
- **Marker:** imperative `test.fail()`, scoped to the classic surface, and placed on the **cause**: that seller-pays-the-fee defers disbursement. That fails deterministically (5 out of 5). The money symptom is deliberately not the marked assertion, because a marker on something that appears 3 times in 5 makes the suite flaky and gets ignored.
- **Still asserted hard:** on the block surface the transfer must equal the recorded earning exactly, so a regression there goes red at once. On the classic surface the figures are logged every run, with an explicit warning line when the overpayment manifests.
- **Remove the marker when:** the classic path sets the deferral flag. The test then passes, the marker fails the run, and deleting it is the signal.
- **Red-check:** shifting the money expectation to the gross amount fails with `Expected: 151.5, Received: 146.45`, so the equality assertion detects the defect's exact shape.
