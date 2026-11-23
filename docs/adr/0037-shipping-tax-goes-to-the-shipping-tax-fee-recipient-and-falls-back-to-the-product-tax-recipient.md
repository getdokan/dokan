# Shipping tax goes to the shipping tax fee recipient and falls back to the product tax recipient

Status: Accepted (retroactive — documents existing code)

## Context

Until 3.7.19 a single "tax fee recipient" covered all tax on a Vendor order. Version 3.7.19 split shipping tax out into its own recipient so that, for example, a marketplace can collect product tax centrally while letting Vendors keep the tax on the shipping they charge. To avoid changing the outcome for existing stores and orders, the new recipient defaults to whatever the product tax recipient is. This ADR documents that fallback. The product tax rule is [ADR-0034](./0034-product-tax-goes-to-the-tax-fee-recipient-and-excludes-shipping-tax.md); the overall arithmetic is [ADR-0036](./0036-shipping-tax-and-fees-are-added-to-the-vendor-earning-or-the-admin-commission-outside-the-commission-formula.md).

## Rule

- `Fees::get_shipping_tax_fee_recipient()` (`lite:includes/Fees.php::get_shipping_tax_fee_recipient()`) returns the order's `shipping_tax_fee_recipient` meta when it is not empty.
- Otherwise it first resolves the **order's product tax recipient** (`get_tax_fee_recipient()`, which itself freezes `tax_fee_recipient` on the order) and uses it as the default for `dokan_get_option( 'shipping_tax_fee_recipient', 'dokan_selling', <product tax recipient> )`. The product tax recipient is therefore used only when the option key has never been saved; once it is saved, the stored option value wins and the order's own `tax_fee_recipient` does not affect the result (it is still resolved and frozen as a side effect). The result passes through the filter `dokan_shipping_tax_fee_recipient` (value, order ID), is written to the order and the order is saved (all in `::get_shipping_tax_fee_recipient()`). It is then frozen; see Lite ADR 0013.
- The amount given to the recipient is the order's shipping tax net of shipping tax refunded: `get_shipping_tax() − get_total_shipping_tax_refunded()` (`lite:includes/Commission/OrderCommission.php::get_vendor_shipping_tax_fee()`, `::get_admin_shipping_tax_fee()`). Shipping tax refunded is summed per shipping line and tax rate by `Fees::get_total_shipping_tax_refunded()` (`lite:includes/Fees.php::get_total_shipping_tax_refunded()`).
- **Refunds.** Refunded shipping tax (the `shipping_tax_total` of the refund's tax lines) is charged back to the shipping tax recipient (the shipping-tax branch of `lite:includes/Commission/OrderRefundCommission.php::get_tax_refund_for()`).

## Settings that change it

| Setting | Values | Behaviour |
|---|---|---|
| `dokan_selling[shipping_tax_fee_recipient]` (admin UI: Transaction → Fees → "Shipping Tax Fee", `lite:includes/Admin/Settings/Schema/SettingsSchema.php::transaction_page()` (field `shipping_tax_fee_recipient`); legacy screen `lite:includes/Admin/Settings.php::get_settings_fields()` (field `shipping_tax_fee_recipient`)) | `seller` ("Vendor"), `admin`, or **never saved** | `seller`: shipping tax is added to the Vendor's Earning. `admin`: added to the admin's total. Never saved (the key is absent from the stored option): the order's product tax recipient is used. |

"It depends", spelled out: the settings screens display `seller` as the default for this field (the `default` of field `shipping_tax_fee_recipient` in `SettingsSchema.php::transaction_page()`), but the code fallback is the product tax recipient. On a store where the admin set product tax to `admin` and never saved the Fees page after upgrading to 3.7.19, shipping tax also goes to `admin`, even though the form would show "Vendor" if opened. Once the page is saved, the stored value wins. Running the setup wizard also stores the key, because it posts all three recipients with `seller` preselected (`lite:includes/Admin/SetupWizard.php::dokan_setup_store()`, `::dokan_setup_store_save()`). The onboarding Basic step is a third writer: it declares `shipping_tax_fee_recipient` among its fields (`lite:includes/Admin/OnboardingSetup/Steps/BasicStep.php::get_field_ids()`) and its save writes every declared field it receives to the settings store (`lite:includes/Admin/OnboardingSetup/Steps/AbstractStep.php::save()`). Its prefill comes from `SettingsRegistry`, which hydrates missing keys through `LegacySettingsBridge::hydrate_new_from_legacy()`; for a key stored on neither side that falls back to the schema default `seller` (`lite:includes/Admin/Settings/Migration/LegacySettingsBridge.php::hydrate_new_from_legacy()`, `lite:includes/Admin/Settings/Schema/SettingsRegistry.php::populate_values()`), not to the product tax recipient. "Never saved" is checked against both the legacy `dokan_selling` option and the new flat settings option: `dokan_get_option()` reads through `LegacySettingsRepository`, which overlays only keys actually stored in the new option and skips missing ones (`lite:includes/functions.php::dokan_get_option()`, `lite:includes/Admin/Settings/Migration/LegacySettingsBridge.php::hydrate_legacy_from_new()`). The schema default `seller` is filled in only for display when the settings screen is rendered, not persisted (`lite:includes/Admin/Settings/Schema/SettingsRegistry.php::populate_values()`), and no upgrader seeds it, so the fallback branch is live on any install where none of the Fees page, the setup wizard or the onboarding Basic step has been saved.

`dokan_selling[tax_fee_recipient]` therefore indirectly changes this rule while `shipping_tax_fee_recipient` is unset.

## Worked example

Settings: Commission Fixed 10 % + 0 flat; `shipping_fee_recipient = seller`; `tax_fee_recipient = admin`. Vendor order: product 100.00 + 8.00 tax; shipping 10.00 + 0.80 tax. Total 118.80.

- `shipping_tax_fee_recipient` never saved: falls back to `admin`. Earning = 90.00 + 10.00 = **100.00**; admin = 10.00 + 8.00 + 0.80 = **18.80**.
- `shipping_tax_fee_recipient = seller`: Earning = 90.00 + 10.00 + 0.80 = **100.80**; admin = **18.00**.

## Edge cases

- **Existing orders at upgrade.** The 3.7.19 upgrade queues every order and, for orders without Suborders, adds `shipping_tax_fee_recipient` equal to the order's `tax_fee_recipient` (`lite:includes/Upgrade/Upgrades/V_3_7_19.php::update_order_meta()`, `lite:includes/Upgrade/Upgrades/BackgroundProcesses/V_3_7_19_UpdateOrderMeta.php::task()`). The background task adds the meta but does not call `$order->save()` (`lite:includes/Upgrade/Upgrades/BackgroundProcesses/V_3_7_19_UpdateOrderMeta.php::task()`), so the backfill is not persisted. An old order with no `shipping_tax_fee_recipient` meta is resolved by the getter on its next calculation, with two outcomes:
  - option `shipping_tax_fee_recipient` never saved: the order's own `tax_fee_recipient` is used, which is what the backfill intended;
  - option saved (Fees page, setup wizard or onboarding Basic step): the order takes the **current** option value, not its own `tax_fee_recipient` (`lite:includes/Fees.php::get_shipping_tax_fee_recipient()`). On a store with `tax_fee_recipient = admin` on old orders and the option later saved as `seller`, shipping tax on those old orders goes to the Vendor when they are next calculated (for example on an order edit or refund).
- **Add-ons that set recipients.** Gateways that force `shipping_fee_recipient` and `tax_fee_recipient` on an order without also setting `shipping_tax_fee_recipient` get shipping tax resolved from the stored option, or from the order's (forced) product tax recipient when the option was never saved.
- **No shipping.** Orders without shipping lines return 0 for both getters whatever the recipient.
- **Older helpers.** Code written before 3.7.19 that calls only `get_tax_fee_recipient()` for shipping tax ignores this setting; deprecated wrappers on `dokan()->commission` forward to the `Fees` methods (`lite:includes/Commission.php::get_tax_fee_recipient()`, `::get_shipping_tax_fee_recipient()`).

## Why

The split was introduced in 3.7.19 (#1848, "separate shipping tax from total tax"). The fallback to the product tax recipient keeps stores that had only one tax recipient behaving exactly as before until the admin explicitly chooses otherwise; the code comment says it is "needed for backward compatibility" (`lite:includes/Fees.php::get_shipping_tax_fee_recipient()`).

## Consequences & risks

- The displayed default and the effective default can disagree until the Fees page is saved, which can surprise an admin reading the screen.
- Resolving the shipping tax recipient also freezes the product tax recipient as a side effect, because the fallback calls `get_tax_fee_recipient()` first.
- Finishing onboarding can change who receives shipping tax without the admin touching that field. On a store whose `tax_fee_recipient` is `admin` and whose `shipping_tax_fee_recipient` was never saved, shipping tax currently follows product tax to the admin; the Basic step prefills `seller` from the schema default, and saving the step with that value stores `seller`, so shipping tax on later orders goes to the Vendor.

## Recommendations

- Consider persisting `shipping_tax_fee_recipient` explicitly in an upgrade routine (copying `tax_fee_recipient`) so that the screen and the behaviour agree.
- If the order-meta backfill matters for reporting, add the missing `$order->save()` in a future upgrader.

_Verified against Lite @fbae0ce7d / WooCommerce 11.2.1 — 2026-11-19._
