# Shipping fees go to the Vendor unless the shipping fee recipient is set to admin

Status: Accepted (retroactive — documents existing code)

## Context

Every Vendor order that ships has one or more WooCommerce shipping lines. The marketplace operator decides once, globally, whether shipping money belongs to the Vendor (who usually ships the goods) or to the admin (when the marketplace ships centrally or wants to keep shipping income). This is the **Fee recipient** for shipping in CONTEXT.md. The general arithmetic that adds shipping to the Earning or the admin total is in [ADR-0036](./0036-shipping-tax-and-fees-are-added-to-the-vendor-earning-or-the-admin-commission-outside-the-commission-formula.md).

## Rule

- The shipping recipient of a Vendor order is resolved by `Fees::get_shipping_fee_recipient()` (`lite:includes/Fees.php::get_shipping_fee_recipient()`). It returns the order's `shipping_fee_recipient` meta when present. Otherwise it reads `dokan_get_option( 'shipping_fee_recipient', 'dokan_selling', 'seller' )`, passes it through the filter `dokan_shipping_fee_recipient` (arguments: value, order ID), writes it to the order and saves the order. The value is frozen per order from then on; see Lite ADR 0013.
- The recipient receives the order's **shipping total excluding shipping tax**, net of shipping already refunded: `get_shipping_total() − get_total_shipping_refunded()` (`lite:includes/Commission/OrderCommission.php::get_vendor_shipping_fee()`, `::get_admin_shipping_fee()`). Shipping tax is a separate amount with its own recipient; see [ADR-0037](./0037-shipping-tax-goes-to-the-shipping-tax-fee-recipient-and-falls-back-to-the-product-tax-recipient.md).
- The recipient is all-or-nothing: exactly one of the two getters returns the amount, the other returns 0.
- On a Suborder, the shipping total is the sum of the parent's shipping lines whose `seller_id` item meta matches that Vendor (`lite:includes/Order/Manager.php::create_shipping()`, where the list also passes through the filter `dokan_shipping_methods`). Which shipping lines a Vendor gets is a shipping-method concern and is out of scope here.
- **Refunds.** When a refund includes shipping lines, the refunded shipping is charged back to whoever is the shipping recipient: `OrderRefundCommission::get_shipping_refund_for()` returns the refunded shipping only for the matching recipient (`lite:includes/Commission/OrderRefundCommission.php::get_shipping_refund_for()`), and it is included in `get_vendor_total_refund()` / `get_admin_total_refund()` (`::get_vendor_total_refund()`, `::get_admin_total_refund()`).

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| `dokan_selling[shipping_fee_recipient]` (admin UI: Transaction → Fees → "Shipping Fee", `lite:includes/Admin/Settings/Schema/SettingsSchema.php::transaction_page()` (field `shipping_fee_recipient`); legacy screen `lite:includes/Admin/Settings.php::get_settings_fields()` (field `shipping_fee_recipient`)) | `seller` (shown as "Vendor"), `admin` | `seller` | `seller`: shipping is added to the Vendor's Earning. `admin`: shipping is added to the admin's total and the Vendor gets none of it. |

The setup wizard and onboarding also write this key (`lite:includes/Admin/SetupWizard.php::dokan_setup_store()`, `::dokan_setup_store_save()`, `lite:includes/Admin/OnboardingSetup/Steps/BasicStep.php::get_field_ids()`). Changing it affects only orders whose recipient has not yet been resolved.

## Worked example

Settings: Commission Fixed 10 % + 0 flat; product tax and shipping tax recipients `seller`. Vendor order: product line 50.00, shipping 12.00, no tax, total 62.00.

- `shipping_fee_recipient = seller`: Vendor net earning 45.00 + shipping 12.00 = Earning **57.00**; admin total 5.00.
- `shipping_fee_recipient = admin`: Vendor Earning **45.00**; admin total 5.00 + 12.00 = **17.00**.

Partial refund of 4.00 of the shipping line later, recipient `seller`: the refund calculation charges the 4.00 to the Vendor through `get_vendor_shipping_refund()`, so the Balance receives a 4.00 refund entry while the original 57.00 order debit stays (order edits recalculate the debit without refunds, `lite:includes/Order/VendorBalanceUpdateHandler.php::handle_order_edit()`). The refund-netted recalculation used for `dokan_orders.net_amount` gives Vendor shipping 12.00 − 4.00 = 8.00 and Earning 53.00 (`lite:includes/Order/VendorBalanceUpdateHandler.php::update_dokan_order_table()`). With recipient `admin`, the 4.00 is charged to the admin instead and the Vendor's figures do not move.

## Edge cases

- **Multi-vendor parent Order.** The parent carries all shipping lines but is never calculated (Lite ADR 0004); each Suborder is resolved and frozen independently. A recipient read on the parent is written to the parent too but has no money effect.
- **Filter after first read.** `dokan_shipping_fee_recipient` only matters before the meta exists. Add-ons that need a different recipient for a particular payment method or order kind must either filter it before the first calculation or write the `shipping_fee_recipient` order meta directly.
- **Invalid order.** Passing a non-existent order returns a `WP_Error`, which compares unequal to both `seller` and `admin`, so neither party receives shipping in that call.
- **Deprecated helper.** `dokan_get_seller_amount_from_order( $order_id, true )` still reads the *current* option rather than the frozen order meta (`lite:includes/Order/functions.php::dokan_get_seller_amount_from_order()`); it is deprecated since 3.8.0.

## Why

Most marketplaces let Vendors ship their own goods and pay the carrier, so the Vendor default matches the common case. The option exists because centrally fulfilled marketplaces collect shipping themselves. The setting description warns that shipping tax is not included, which is why shipping tax got its own recipient in 3.7.19.

## Consequences & risks

- A refund of shipping is always charged to the shipping recipient, so with `admin` the admin's figure drops even when the Vendor initiated the refund.
- Because the recipient is frozen per order, a mid-season change of this setting produces a mix of orders under old and new terms. Reports that group by "shipping income" must read the order meta, not the option.

## Recommendations

- Treat the `shipping_fee_recipient` order meta as part of the financial record (see Lite ADR 0013).
- If per-Vendor shipping recipients are ever needed, implement them as an earlier-priority `dokan_shipping_fee_recipient` filter so the freeze still captures the result.

_Verified against Lite @fbae0ce7d / WooCommerce 11.2.1 — 2026-11-19._
