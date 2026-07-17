# [Stripe Express] Multi-vendor per-sub-order refund does not reverse the vendor's Stripe Transfer

**Severity:** High (vendor over-paid / marketplace loses funds) · **Status:** Suspected (needs product-team confirmation) · **Module:** `dokan-pro/modules/stripe-express` · **Found by:** E2E `SE-REF-03`

## Summary
For a **multi-vendor** order paid with Stripe Express (separate charge + per-vendor transfers), a refund:
- **cannot** be issued on the parent order — Dokan rejects it with *"You can not refund orders that have suborders. Please refund from specific suborders."*, and
- when issued on a **sub-order**, **does not reverse** that vendor's Stripe `Transfer`.

The vendor therefore keeps the transferred funds even though the customer was refunded — the platform eats the loss. Single-vendor refunds reverse correctly (`SE-REF-01/02/05` pass), so the gap is specific to multi-vendor sub-orders.

## Environment
- Dokan Pro Stripe Express, test mode, `disburse_mode = ON_ORDER_COMPLETED`, two **real connected** test vendors.

## Steps to reproduce
1. Customer buys two products from two different connected vendors in one cart → one platform charge `ch_…`, two transfers (one per vendor `acct_…`). Verified on Stripe.
2. Complete the order so both transfers disburse.
3. Attempt a refund:
   - Refund the **parent** order via Dokan (method=1) → **rejected**: "You can not refund orders that have suborders."
   - Refund a **sub-order** → the Dokan/Stripe refund runs, but `GET /v1/transfers/{id}/reversals` for that vendor's transfer stays **empty** (`amount_reversed = 0`) after 45s+.

## Expected
Refunding a vendor's sub-order reverses (fully or proportionally) that vendor's Stripe Transfer, clawing the funds back to the platform — exactly as single-vendor refunds do.

## Actual
No transfer reversal is created for the sub-order refund.

## Evidence (order meta, multi-vendor order)
- **Parent** holds the payment/charge meta + `_dokan_stripe_express_withdraw_data` = `[{"user_id":3,"amount":"43.00","order_id":647}, {"user_id":5,...}]` — note `order_id` points at an **original** sub-order id (647) that no longer matches the current sub-orders (e.g. 653/654 after completion regenerated them).
- **Sub-orders** carry only `_dokan_stripe_express_disburse_mode` and `_dokan_stripe_express_fee` — **no `_dokan_stripe_express_transfer_id`**. So the per-sub refund handler has no transfer id to reverse.
- Contrast: a single-vendor order stores `_dokan_stripe_express_transfer_id` on the order, and refunding it reverses the transfer (works).

## Suspected cause
The per-vendor transfer id is not persisted on the (current) sub-order, and/or the disbursement record references a stale/regenerated sub-order id — so the refund→reversal handler cannot locate the transfer to reverse. (The sub-order regeneration on order completion may be the trigger; needs product-team confirmation of the intended multi-vendor refund flow.)

## Test coverage
`tests/e2e/stripe-express/stripeExpressRefunds.spec.ts` → `SE-REF-03` is marked `test.fixme` with this reference (documented known-issue, NOT a faked pass). Un-fixme once the reversal works.
