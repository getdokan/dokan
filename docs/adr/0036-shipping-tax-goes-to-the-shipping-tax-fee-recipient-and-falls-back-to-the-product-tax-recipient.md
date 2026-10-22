# Shipping tax goes to the shipping tax fee recipient and falls back to the product tax recipient

Status: Accepted (retroactive — documents existing code)

## Context

Until 3.7.19 a single "tax fee recipient" covered all tax on a Vendor order. Version 3.7.19 split shipping tax out into its own recipient so that, for example, a marketplace can collect product tax centrally while letting Vendors keep the tax on the shipping they charge. To avoid changing the outcome for existing stores and orders, the new recipient defaults to whatever the product tax recipient is. This ADR documents that fallback. The product tax rule is [ADR-0033](./0033-product-tax-goes-to-the-tax-fee-recipient-and-excludes-shipping-tax.md); the overall arithmetic is [ADR-0035](./0035-shipping-tax-and-fees-are-added-to-the-vendor-earning-or-the-admin-commission-outside-the-commission-formula.md).

## Rule

- `Fees::get_shipping_tax_fee_recipient()` (`lite:includes/Fees.php:220-235`) returns the order's `shipping_tax_fee_recipient` meta when it is not empty.
- Otherwise it first resolves the **order's product tax recipient** (`get_tax_fee_recipient()`, which itself freezes `tax_fee_recipient` on the order) and uses it as the default for `dokan_get_option( 'shipping_tax_fee_recipient', 'dokan_selling', <product tax recipient> )` (`:227-228`). The result passes through the filter `dokan_shipping_tax_fee_recipient` (value, order ID), is written to the order and the order is saved (`:229-232`). It is then frozen; see Lite ADR 0012.
- The amount given to the recipient is the order's shipping tax net of shipping tax refunded: `get_shipping_tax() − get_total_shipping_tax_refunded()` (`OrderCommission::get_vendor_shipping_tax_fee()`, `lite:includes/Commission/OrderCommission.php:310-316`; `get_admin_shipping_tax_fee()`, `:257-263`). Shipping tax refunded is summed per shipping line and tax rate by `Fees::get_total_shipping_tax_refunded()` (`lite:includes/Fees.php:247-260`).
- **Refunds.** Refunded shipping tax (the `shipping_tax_total` of the refund's tax lines) is charged back to the shipping tax recipient (`OrderRefundCommission::get_tax_refund_for()`, `lite:includes/Commission/OrderRefundCommission.php:371-373`).

## Settings that change it

| Setting | Values | Behaviour |
|---|---|---|
| `dokan_selling[shipping_tax_fee_recipient]` (admin UI: Transaction → Fees → "Shipping Tax Fee", `lite:includes/Admin/Settings/Schema/SettingsSchema.php:611-634`; legacy screen `lite:includes/Admin/Settings.php:627-637`) | `seller` ("Vendor"), `admin`, or **never saved** | `seller`: shipping tax is added to the Vendor's Earning. `admin`: added to the admin's total. Never saved (the key is absent from the stored option): the order's product tax recipient is used. |

"It depends", spelled out: the settings screens display `seller` as the default for this field (`SettingsSchema.php:617`), but the code fallback is the product tax recipient. On a store where the admin set product tax to `admin` and never saved the Fees page after upgrading to 3.7.19, shipping tax also goes to `admin`, even though the form would show "Vendor" if opened. Once the page is saved, the stored value wins. Running the setup wizard also stores the key, because it posts all three recipients with `seller` preselected (`lite:includes/Admin/SetupWizard.php:483-485`, `:527-529`). "Never saved" is checked against both the legacy `dokan_selling` option and the new flat settings option: `dokan_get_option()` reads through `LegacySettingsRepository`, which overlays only keys actually stored in the new option and skips missing ones (`lite:includes/functions.php:1083-1103`, `lite:includes/Admin/Settings/Migration/LegacySettingsBridge.php:343-346`). The schema default `seller` is filled in only for display when the settings screen is rendered, not persisted (`lite:includes/Admin/Settings/Schema/SettingsRegistry.php:343-368`), and no upgrader seeds it, so the fallback branch is live on any install where neither the Fees page nor the setup wizard has been saved.

`dokan_selling[tax_fee_recipient]` therefore indirectly changes this rule while `shipping_tax_fee_recipient` is unset.

## Worked example

Settings: Commission Fixed 10 % + 0 flat; `shipping_fee_recipient = seller`; `tax_fee_recipient = admin`. Vendor order: product 100.00 + 8.00 tax; shipping 10.00 + 0.80 tax. Total 118.80.

- `shipping_tax_fee_recipient` never saved: falls back to `admin`. Earning = 90.00 + 10.00 = **100.00**; admin = 10.00 + 8.00 + 0.80 = **18.80**.
- `shipping_tax_fee_recipient = seller`: Earning = 90.00 + 10.00 + 0.80 = **100.80**; admin = **18.00**.

## Edge cases

- **Existing orders at upgrade.** The 3.7.19 upgrade queues every order and, for orders without Suborders, adds `shipping_tax_fee_recipient` equal to the order's `tax_fee_recipient` (`lite:includes/Upgrade/Upgrades/V_3_7_19.php:19-38`, `lite:includes/Upgrade/Upgrades/BackgroundProcesses/V_3_7_19_UpdateOrderMeta.php:28-42`). The background task adds the meta but does not call `$order->save()`, so the backfill is not persisted; old orders instead resolve through the getter's fallback on first read, which gives the same result when their `tax_fee_recipient` meta is set.
- **Add-ons that set recipients.** Gateways that force `shipping_fee_recipient` and `tax_fee_recipient` on an order without also setting `shipping_tax_fee_recipient` get shipping tax resolved from the stored option, or from the order's (forced) product tax recipient when the option was never saved.
- **No shipping.** Orders without shipping lines return 0 for both getters whatever the recipient.
- **Older helpers.** Code written before 3.7.19 that calls only `get_tax_fee_recipient()` for shipping tax ignores this setting; deprecated wrappers on `dokan()->commission` forward to the `Fees` methods (`lite:includes/Commission.php:447-467`).

## Why

The split was introduced in 3.7.19 (#1848, "separate shipping tax from total tax"). The fallback to the product tax recipient keeps stores that had only one tax recipient behaving exactly as before until the admin explicitly chooses otherwise; the code comment says it is "needed for backward compatibility" (`lite:includes/Fees.php:227`).

## Consequences & risks

- The displayed default and the effective default can disagree until the Fees page is saved, which can surprise an admin reading the screen.
- Resolving the shipping tax recipient also freezes the product tax recipient as a side effect, because the fallback calls `get_tax_fee_recipient()` first.

## Recommendations

- Consider persisting `shipping_tax_fee_recipient` explicitly in an upgrade routine (copying `tax_fee_recipient`) so that the screen and the behaviour agree.
- If the order-meta backfill matters for reporting, add the missing `$order->save()` in a future upgrader.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
