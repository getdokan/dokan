# Coupon discounts reduce commission according to who funds the coupon

Status: Accepted (retroactive — documents existing code)

## Context

A coupon lowers what the customer pays for a line item, so it lowers the money available to split between the admin and the Vendor. The question "who absorbs the coupon?" has three possible answers: the Vendor, the admin, or both in a set proportion. Dokan records, per coupon and per line item, which answer applies, and the commission calculator uses it. This ADR describes that mechanism and the arithmetic. Which coupons are marked as admin-funded is decided by whoever manages coupons; Dokan Lite itself does not mark any coupon (add-ons may, by writing the coupon meta described below).

## Rule

**1. Each line item records its coupons and who funds them.** When WooCommerce applies a coupon to a cart or an order, Dokan hooks `woocommerce_coupon_get_apply_quantity` (`lite:includes/Vendor/Coupon.php:21`, fired at `wc:includes/class-wc-discounts.php:384`), re-applies the coupon on a clone of `WC_Discounts`, reads the per-item discount from `WC_Discounts::get_discounts()` (`wc:includes/class-wc-discounts.php:180`) and stores, per coupon code, on the cart item or order item meta `_dokan_coupon_info` (`Coupon::DOKAN_COUPON_META_KEY`, `lite:includes/Vendor/Coupon.php:16`):

- `discount`: the amount this coupon took off this line;
- `coupon_commissions_type`, `admin_shared_coupon_type`, `admin_shared_coupon_amount`: copied from the coupon's meta at the time of application (`lite:includes/Vendor/Coupon.php:161-186` for carts, `:199-243` for orders).

At checkout the cart item's record is copied to the order item (`Coupon::add_coupon_info_to_order_item()`, hooked to `woocommerce_checkout_create_order_line_item`, `lite:includes/Vendor/Coupon.php:19`, `:292-316`). If the recorded discounts on one line add up to more than the product price × quantity, the excess is trimmed from the last coupons. Suborder line items inherit the record because Suborder creation copies all item meta (`lite:includes/Order/Manager.php:693-697`).

**2. The record is split into an admin-funded and a Vendor-funded discount.** `CouponInfo::get_coupon_amount()` (`lite:includes/Commission/CouponInfo.php:74-116`) classifies each coupon by `coupon_commissions_type`:

| `coupon_commissions_type` | Admin-funded part | Vendor-funded part |
|---|---|---|
| missing, `default`, `from_vendor`, or any unknown value | 0 | whole discount |
| `from_admin` | whole discount | 0 |
| `shared_coupon` with `admin_shared_coupon_type = percentage` | discount × `admin_shared_coupon_amount` / 100 | the rest |
| `shared_coupon` with any other `admin_shared_coupon_type` (flat) | `min( discount, admin_shared_coupon_amount )` | the rest |

The parts of all coupons on a line are summed (`lite:includes/Commission/CouponInfo.php:27-37`).

**3. The calculator puts the admin-funded part back into the base and then charges it to the admin** (`Calculator::calculate_raw_admin_commission()`, `lite:includes/Commission/Calculator.php:139-149`):

```
line_total = price × qty − all coupon discounts          (WooCommerce line total, excl. tax)
base       = line_total + admin_funded
raw_admin  = base × percentage / 100 + flat × qty − admin_funded
Earning    = line_total − round(raw_admin)               (see the rounding ADR)
```

In words:

- A **Vendor-funded** discount lowers the base, so the percentage Commission is charged on the discounted price. The Vendor bears the discount, minus the share of it that the percentage would have taken.
- An **admin-funded** discount does not lower the base: the Commission is computed as if the customer had paid full price, and then the discount is subtracted from it. The Vendor's Earning is the same as without the coupon; the admin bears the whole discount.
- A **shared** coupon is the two cases above applied to its two parts.

## Settings that change it

All settings are per coupon (WooCommerce coupon post meta). Dokan Lite has no global setting for coupon funding.

| Coupon meta | Default when absent | Effect |
|---|---|---|
| `coupon_commissions_type` | `from_vendor` (`lite:includes/Commission/CouponInfo.php:78-83`) | Chooses the row of the table above. |
| `admin_shared_coupon_type` | `percent` (which falls into the flat branch, because only `percentage` selects the percentage branch) | Only for `shared_coupon`. |
| `admin_shared_coupon_amount` | `0` | Percentage of the discount, or flat amount per line, funded by the admin. |

Because the record copies `WC_Coupon::get_meta()` for each key, a coupon without these meta keys usually produces a record whose fields are empty strings rather than missing. The result is the same: an empty `coupon_commissions_type` falls into the `default` branch of the switch (Vendor-funded), an empty `admin_shared_coupon_type` selects the flat branch, and an empty amount is `floatval('') = 0` (`lite:includes/Commission/CouponInfo.php:85-110`). Without an add-on that writes these meta keys, every coupon is Vendor-funded.

## Worked example

Settings: global `fixed`, `admin_percentage = 10`, `additional_fee = 2`. Line: 1 unit at 100.00. Store decimals 2. Each case has one coupon taking 20.00 off the line, so `line_total = 80.00`.

| Case | admin_funded | base | raw_admin | Commission | Earning |
|---|---|---|---|---|---|
| No coupon (reference, line_total 100.00) | 0 | 100.00 | 10.00 + 2.00 = 12.00 | 12.00 | 88.00 |
| Vendor-funded (`from_vendor`) | 0 | 80.00 | 8.00 + 2.00 = 10.00 | 10.00 | 70.00 |
| Admin-funded (`from_admin`) | 20.00 | 100.00 | 10.00 + 2.00 − 20.00 = −8.00 | −8.00 (subsidy) | 88.00 |
| Shared, `percentage`, amount 50 | 10.00 | 90.00 | 9.00 + 2.00 − 10.00 = 1.00 | 1.00 | 79.00 |
| Shared, `flat`, amount 5 | 5.00 | 85.00 | 8.50 + 2.00 − 5.00 = 5.50 | 5.50 | 74.50 |

The admin-funded case yields a negative Commission; how that is paid out is described in [ADR-0021](./0021-an-admin-funded-discount-larger-than-the-commission-becomes-an-admin-subsidy-to-the-vendor.md).

## Edge cases

- **Flat shared amount is per line, not per coupon.** `min( discount, admin_shared_coupon_amount )` is evaluated for each line item's record. A shared coupon with a flat admin amount of 5.00 that applies to three lines makes the admin fund up to 15.00 in total.
- **Coupon funding is frozen with the line.** The funding fields are copied when the coupon is applied. Editing the coupon later does not change existing orders. Removing a coupon from an order removes its record from the items of that order, its Suborders or its parent (`Coupon::remove_coupon_info_from_order_item()`, `lite:includes/Vendor/Coupon.php:41-68`).
- **Lines without a record** (orders created before this mechanism, or items added by code that bypassed `WC_Discounts`) are treated as fully Vendor-funded, because `line_total` already includes the discount and the admin-funded part is 0.
- **Taxes and shipping** are not part of `line_total`, so a coupon's effect on them is outside this rule.
- **Refunds** of discounted lines are split in proportion to the discounted line total; see the comment in `OrderLineItemCommission::adjust_refunds()` (`lite:includes/Commission/OrderLineItemCommission.php:202-205`) and the [refund ADRs](decisions-index.md#refunds), in particular [ADR-0046](./0046-a-refund-reverses-commission-and-vendor-earning-pro-rata-to-the-refunded-share-of-each-line-item.md).

## Why

The `adjust_refunds()` comment shows the intent that an admin discount changes the base the admin's share is measured against ("If Admin provide discount 20 for 100, then item_total = 80."). Charging an admin-funded coupon to the admin and leaving the Vendor's Earning untouched is what makes marketplace-wide promotions possible without Vendors paying for them.

## Consequences & risks

- An admin-funded coupon larger than the Commission produces a negative Commission. This is intended (a subsidy), but reports that assume Commission ≥ 0 will be wrong unless they use the clamped and subsidy figures.
- The `percent` default for `admin_shared_coupon_type` does not match the `percentage` value the branch checks, so a shared coupon saved without an explicit type is treated as a flat shared amount.
- Because the record is captured through a WooCommerce filter, a coupon applied by code that does not go through `WC_Discounts` leaves no record and is silently treated as Vendor-funded.

## Recommendations

- Align the `admin_shared_coupon_type` default with the value actually checked (`percentage`), or check both.
- Show the admin-funded and Vendor-funded discount per line in the order Commission meta box; the values are already returned on the `Commission` object (`get_admin_discount()`, `get_vendor_discount()`).

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
