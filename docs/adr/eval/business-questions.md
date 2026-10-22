# Business-rule questions (Dokan Lite regression set)

## Purpose

The business-rule ADRs in `docs/adr/` (0019 to 0111, together with the earlier ADRs they build on) are meant to be the team's source of truth for how Dokan Lite handles money, orders, refunds, withdraws, Vendors, products, coupons, shipping and reports. This file is the regression test for that claim. An agent that reads **only** `CONTEXT.md`, `docs/adr/` and `docs/adr/reference/`, and never opens the PHP source, must be able to answer every question below correctly.

Every question here can be answered from Dokan Lite and WooCommerce alone. Questions whose answer depends on add-on code are kept in the add-on's own repository.

Each entry records:

- **Question**: asked verbatim, the way a teammate or merchant would ask it.
- **Settings assumed**: the option values the expected answer relies on. Where the answer branches on a setting, every branch is part of the expected answer.
- **Expected answer**: the answer obtained by following the code path. A run passes when the agent's answer states the same rule, the same setting keys and defaults, and (for money questions) the same numbers.
- **Code citations**: where the expected answer was verified, as `lite:path:LINE` or `wc:path:LINE`.
- **Answering ADR**: the ADR or ADRs that should let an agent answer without reading code.
- **Last eval verdict**: the result of the most recent run.

## How to re-run

1. Start a fresh agent session with read access limited to `CONTEXT.md`, `docs/adr/` and `docs/adr/reference/` of this repository. Do not give it the source tree.
2. Ask each question exactly as written, adding the "Settings assumed" line as context.
3. Compare the reply with the expected answer. Mark **pass** when the rule, setting keys, defaults and figures all match; **partial** when the rule is right but a branch, default or figure is missing or wrong; **fail** otherwise.
4. For every partial or fail, fix the answering ADR (or add a new one) rather than this file, then ask the question again.
5. After a Dokan or WooCommerce upgrade, re-check the code citations of each expected answer against the new source before re-running, and update the answer, the ADR and the verdict together.
6. Record the date and outcome in "Last eval verdict".

---

## Commission

### 01-commission-Q1

**Question:** What commission types can an admin choose in Dokan, and how is the admin's commission actually calculated for each one?

**Settings assumed:** `dokan_selling[commission_type]` in {`fixed` (default), `category_based`}; the legacy types `combine`, `percentage` and `flat` exist only on data saved before 3.14.0.

**Expected answer:**

The answer depends on the global setting `dokan_selling[commission_type]`. The same type field also exists at Vendor level (user meta `dokan_admin_percentage_type`) and at product level (post meta `_per_product_admin_commission_type`).

The types offered in the UI are `fixed` and `category_based` (lite:includes/functions.php:3407-3414, filterable through `dokan_commission_types`). The default is `fixed`. The settings field defaults to `fixed` (lite:includes/Admin/Settings.php:520-527), and any save that leaves `commission_type` empty is forced to `fixed` (lite:includes/Admin/Settings.php:77-83). The percentage field (`admin_percentage`) and the fixed fee field (`additional_fee`) both show a UI default of `10` (lite:includes/Admin/Settings.php:534-551). The legacy types `combine`, `percentage` and `flat` from before 3.14.0 still exist in old data (lite:includes/Commission.php:575-581). The 3.14.0 upgrade rewrote global `flat` and `percentage` as `fixed`, with the other component set to 0 (lite:includes/Upgrade/Upgrades/V_3_14_0.php:24-45).

Every type is computed by one function, `Calculator::calculate_raw_admin_commission` (lite:includes/Commission/Calculator.php:139-149). The formula is: admin commission = (line total + admin-funded discount) × percentage / 100 + flat × quantity + combine_flat − admin-funded discount. How the flat part is applied depends on the type:

- `fixed` (and `category_based`, `flat`, `percentage`): the commission is a percentage plus a flat fee charged per unit. `Setting::get_flat_value()` returns the flat fee, which is multiplied by the line quantity, and `get_combine_flat()` returns 0 (lite:includes/Commission/Model/Setting.php:220-243).
- `combine` (legacy): the commission is a percentage plus a flat fee charged once per line item, not per unit. `get_flat_value()` returns 0 and `get_combine_flat()` returns the flat fee (lite:includes/Commission/Model/Setting.php:220-243).
- `category_based`: uses the same formula as `fixed`, but the percentage and flat values are taken from the category table instead of the plain fields (see 01-commission-Q4).

The result is rounded and capped at the line total, and the Vendor receives the remainder (lite:includes/Commission/Calculator.php:114-128). The `Formula\Fixed`, `Flat`, `Combine` and `CategoryBased` classes are no longer used for the money calculation; only their `SOURCE` constants are still referenced.

**Code citations:** lite:includes/functions.php:3407 · lite:includes/Admin/Settings.php:77 · lite:includes/Admin/Settings.php:520 · lite:includes/Admin/Settings.php:534 · lite:includes/Commission.php:575 · lite:includes/Upgrade/Upgrades/V_3_14_0.php:24 · lite:includes/Commission/Calculator.php:139 · lite:includes/Commission/Model/Setting.php:220 · lite:includes/Commission/Calculator.php:114

**Answering ADR:** [ADR-0025](../0025-fixed-commission-is-a-percentage-of-the-line-total-plus-a-flat-fee-charged-per-unit.md), [ADR-0028](../0028-the-commission-formula-is-taken-from-the-product-then-the-vendor-then-the-global-setting-then-zero.md)

**Last eval verdict:** pass (2026-10-22)

### 01-commission-Q4

**Question:** We use category-based commission. Which category's rate applies to a product, and what happens if that category has no rate set?

**Settings assumed:** `dokan_selling[commission_type]` = `category_based` (or the Vendor's `dokan_admin_percentage_type` = `category_based`).

**Expected answer:**

This only applies when the level that wins the chain has type `category_based`. The global level uses `dokan_selling[commission_type]` = `category_based`; the Vendor level uses `dokan_admin_percentage_type` = `category_based`. In every other case the plain percentage and flat fields are used.

**Which category is used.** The product's first chosen category is used (`reset($chosen_cat)`, lite:includes/Commission/Strategies/Product.php:63-72; lite:includes/Commission/ProductCommission.php:76-81). In single-category mode only one category is kept. In multi-category mode, whichever category is first in the saved list wins (lite:includes/ProductCategory/Helper.php:53-85). Rates are never combined, and the highest rate across several categories is never picked.

**Global lookup** (lite:includes/Commission/Settings/GlobalSetting.php:36-62):

- If `dokan_selling[commission_category_based_values]['items'][category_id]` exists, its percentage and flat are used.
- Otherwise the `['all']` row ("All Categories") is used.
- If that is also empty, the percentage and flat stay blank, the global level does not count as set, and the chain falls to the default of 0% and 0 flat (lite:includes/Commission/Strategies/DefaultStrategy.php:43-52). The admin then earns nothing.

**Vendor lookup.** The same items-then-`all` rule is applied to the Vendor's `admin_category_commission` meta (lite:includes/Commission/Settings/Vendor.php:47-59). If neither row exists, the Vendor level does not count as set and the global level is tried next (lite:includes/Commission/Model/Setting.php:289-291).

**How the values are applied.** The category's percentage and flat behave exactly like the `fixed` type: the percentage applies to the line total, and the flat fee is charged per unit (lite:includes/Commission/Model/Setting.php:220-243; lite:includes/Commission/Calculator.php:144-148).

The settings switch `dokan_selling[reset_sub_category_when_edit_all_category]` defaults to `on`. While it is on, editing a parent category's rate in the admin UI also rewrites the rates of its subcategories (lite:includes/Admin/Settings.php:557-568). At calculation time there is no parent-category inheritance: a subcategory without its own row falls back to `all`, not to its parent.

**Code citations:** lite:includes/Commission/Strategies/Product.php:63 · lite:includes/ProductCategory/Helper.php:53 · lite:includes/Commission/Settings/GlobalSetting.php:36 · lite:includes/Commission/Settings/Vendor.php:47 · lite:includes/Commission/Model/Setting.php:289 · lite:includes/Commission/Strategies/DefaultStrategy.php:43 · lite:includes/Commission/Calculator.php:144 · lite:includes/Admin/Settings.php:557

**Answering ADR:** [ADR-0022](../0022-category-based-commission-uses-the-products-chosen-category-and-falls-back-to-the-all-categories-rate.md), [ADR-0019](../0019-a-commission-of-zero-is-a-deliberate-setting-and-only-an-empty-field-falls-through-to-the-next-level.md)

**Last eval verdict:** pass (2026-10-22)

### 01-commission-Q5

**Question:** Is the fixed commission fee charged once per order, once per product line, or per unit? And how is the commission rounded? For example, can the admin ever take more than the product price?

**Settings assumed:** `dokan_selling[commission_type]` = `fixed`, `admin_percentage` = 10, `additional_fee` = 5 (or 0 in the rounding example); WooCommerce price decimals = 2.

**Expected answer:**

Commission is calculated separately for each order line item, and the results are summed per order. `OrderCommission::calculate` loops over `$order->get_items()`, runs `OrderLineItemCommission` for each line, and adds up the admin and Vendor amounts (lite:includes/Commission/OrderCommission.php:79-95). Shipping, tax and fees are not part of commission; they are handled by the fee-recipient rules. On Dokan's own admin-earning order types, such as advertisement and subscription orders, the whole line amount goes to the admin (lite:includes/Commission/OrderCommission.php:78, 87-89; lite:includes/Analytics/Reports/OrderType.php:263-289).

**Flat fee.** For type `fixed` (and for `category_based`, legacy `flat` and legacy `percentage`), the flat fee is charged per unit: flat × line quantity (lite:includes/Commission/Calculator.php:145; lite:includes/Commission/Model/Setting.php:220-222). For the legacy `combine` type, the flat fee is charged once per line item, regardless of quantity (lite:includes/Commission/Model/Setting.php:231-243; lite:includes/Commission/Calculator.php:146-148). No type charges a flat fee once per order.

**Rounding and cap.** Only the admin's share is rounded, to the WooCommerce price decimals setting (`wc_get_price_decimals`). It is then capped at the line total, and the Vendor receives the exact remainder: `admin = min(round(raw, decimals), line_total)` and `vendor = line_total - admin` (lite:includes/Commission/Calculator.php:117-122). The code comments explain why: rounding both shares would leave a fraction of a cent credited to neither party. The admin can therefore never take more than the line total, though the amount can go negative when an admin-funded coupon applies.

**Worked examples.** Settings: global `commission_type` = `fixed`, `admin_percentage` = 10, `additional_fee` = 5, and 2 price decimals.

- 2 units at $50, so the line total is $100. The admin gets 100 × 10% + 5 × 2 = $20.00. The Vendor gets $80.00. With the legacy `combine` type and the same values, the admin would get 10 + 5 = $15.00, and the Vendor $85.00.
- 1 unit at $3.00. The raw commission is 0.30 + 5 = 5.30. It is capped to $3.00, so the Vendor gets $0.00.
- Same settings but `additional_fee` = 0, with 1 unit at $33.33. The raw commission is 3.333, which rounds to $3.33. The Vendor gets $30.00.

The admin percentage field only accepts 0 to 100 when saved for the `fixed` or `flat` type. Out-of-range values are reverted to the stored value (lite:includes/Admin/Settings.php:95-108; for products, lite:includes/Product/Hooks.php:577-581).

**Code citations:** lite:includes/Commission/OrderCommission.php:79 · lite:includes/Commission/Calculator.php:117 · lite:includes/Commission/Calculator.php:145 · lite:includes/Commission/Model/Setting.php:220 · lite:includes/Commission/Model/Setting.php:231 · lite:includes/Analytics/Reports/OrderType.php:263 · lite:includes/Admin/Settings.php:95 · lite:includes/Product/Hooks.php:577

**Answering ADR:** [ADR-0025](../0025-fixed-commission-is-a-percentage-of-the-line-total-plus-a-flat-fee-charged-per-unit.md), [ADR-0023](../0023-commission-is-rounded-and-capped-on-the-admin-share-and-the-vendor-takes-the-exact-remainder.md), [ADR-0029](../0029-the-commission-on-a-vendor-order-is-the-sum-of-its-line-item-commissions.md)

**Last eval verdict:** pass (2026-10-22)

### 01-commission-Q6

**Question:** If the admin changes the commission rate today, does that change what vendors earn on orders that were placed last week (for example, when an old order is edited or a coupon is removed)?

**Settings assumed:** Any commission settings; the behaviour does not depend on setting values.

**Expected answer:**

No. An existing line item keeps the commission terms it was first calculated with. See Lite ADR 0012.

The first source in the chain is the order item itself (lite:includes/Commission/Strategies/OrderItem.php:5-8, 55-61). The first time a line item is calculated, the source that wins (product, Vendor, global or default) is written onto the item as `_dokan_commission_source`, `_dokan_commission_rate`, `_dokan_commission_type`, `_dokan_additional_fee` and `_dokan_commission_meta`. This is done by `AbstractStrategy::save_settings_to_order_item` (lite:includes/Commission/Strategies/AbstractStrategy.php:100-108; lite:includes/Commission/OrderLineItemCommission.php:127) through `Settings\OrderItem::save` (lite:includes/Commission/Settings/OrderItem.php:79-100). From then on, the item's own stored rate or fee is non-empty, so the chain stops there (lite:includes/Commission/Settings/OrderItem.php:35-66; lite:includes/Commission/Model/Setting.php:289-291). The original source label is also kept (lite:includes/Commission/Strategies/OrderItem.php:70-72).

When an existing order is edited and saved (for example a coupon is added or removed, or a line item is added or deleted), `Order\VendorBalanceUpdateHandler` recalculates it on `woocommerce_update_order`: it rewrites the Vendor's earning row in the vendor balance ledger and the `dokan_orders` net amount (lite:includes/Order/VendorBalanceUpdateHandler.php:29-33, 43-111, 147-200; see ADR 0041). The existing lines are recalculated with their frozen terms but the new line totals, so a removed coupon changes the base amount, not the rate. A line item added to the order after the rate change has no stored terms yet. It picks up whatever the chain resolves at that moment, meaning the current product, Vendor or global rate, and those terms are then frozen on it. The same applies when an add-on changes a Vendor's commission settings: only line items calculated afterwards use the new rate.

Orders processed before Dokan 3.14 that stored a flat `_dokan_admin_fee` on the order keep returning that saved value (lite:includes/Commission.php:217-225).

There is a hook to change frozen terms: `dokan_order_line_item_commission_settings_before_save` (lite:includes/Commission/Settings/OrderItem.php:80). Short of using it, or deleting the item meta, there is no UI path to re-price old line items.

**Code citations:** lite:includes/Commission/Strategies/OrderItem.php:5 · lite:includes/Commission/Strategies/AbstractStrategy.php:100 · lite:includes/Commission/OrderLineItemCommission.php:127 · lite:includes/Commission/Settings/OrderItem.php:35 · lite:includes/Commission/Settings/OrderItem.php:79 · lite:includes/Commission/Model/Setting.php:289 · lite:includes/Order/VendorBalanceUpdateHandler.php:29 · lite:includes/Order/VendorBalanceUpdateHandler.php:43 · lite:includes/Order/VendorBalanceUpdateHandler.php:147 · lite:includes/Commission.php:217

**Answering ADR:** [ADR-0012](../0012-commission-terms-are-frozen-onto-the-order-at-first-calculation.md), [ADR-0041](../0041-editing-a-vendor-order-recalculates-its-earning-in-the-vendor-balance-ledger.md)

**Last eval verdict:** pass (2026-10-22). Expected answer corrected at finalisation: the order-edit recalculation runs through `VendorBalanceUpdateHandler`, because `Commission\RecalculateCommissions` returns from its constructor before registering any hook (lite:includes/Commission/RecalculateCommissions.php:16-18). Re-run recommended.

---

## Fees, shipping and tax attribution

### 02-fees-shipping-tax-Q1

**Question:** When a customer pays a shipping charge, does that money go to the vendor or to the marketplace admin? Does the admin take commission on it?

**Settings assumed:** `dokan_selling[shipping_fee_recipient]` default `seller`.

**Expected answer:**

It depends on one admin setting: Dokan → Settings → Transaction → Fees → "Shipping Fee". It is stored as `dokan_selling[shipping_fee_recipient]` and the default is `seller`.

- `seller` (Vendor, the default): the order's shipping total, minus any shipping already refunded, is added to the Vendor's earning (`OrderCommission::get_vendor_shipping_fee`, lite:includes/Commission/OrderCommission.php:295-301). The admin's share of shipping is 0.
- `admin`: the same amount is added to the admin's fees (`OrderCommission::get_admin_shipping_fee`, lite:includes/Commission/OrderCommission.php:227-233). The Vendor gets none of the shipping.

Shipping is never commissionable. Commission is calculated per product line item, on the line's `get_total()`, which is after discount and before tax (lite:includes/Commission/OrderLineItemCommission.php:117-138; percentage formula at lite:includes/Commission/Formula/Percentage.php:63-69). Shipping, tax and shipping tax are passed straight through to whoever the recipient setting names. The Vendor's earning is `vendor_net_earning + get_total_vendor_fees()` (lite:includes/Commission/OrderCommission.php:340-342, 388-390). The admin's total is `admin commission + get_total_admin_fees()` (lite:includes/Commission/OrderCommission.php:377-379, 542-544).

In a multi-vendor order, each Suborder copies only the parent's shipping lines whose `seller_id` item meta matches that Vendor, and sets its own shipping total from them (`Order\Manager::create_shipping`, lite:includes/Order/Manager.php:757-812). So each Vendor's recipient rule applies only to that Vendor's own shipping. The settings field is defined at lite:includes/Admin/Settings/Schema/SettingsSchema.php:561-583, with the legacy field at lite:includes/Admin/Settings.php:605-615. The value is resolved through the `dokan_shipping_fee_recipient` filter (lite:includes/Fees.php:169), which payment add-ons can use to force a recipient.

Other order fees, meaning WooCommerce fee lines such as a checkout surcharge, follow a separate rule with no setting. They go to the admin by default. They go to the Vendor only when the order's `_wc_order_attribution_source_type` meta is `vendor`, which marks an order the Vendor created manually. That rule is in `OrderCommission::get_order_fee_recipient` (lite:includes/Commission/OrderCommission.php:626-634) and can be changed with the `dokan_order_commission_order_fee_recipient` filter. Suborders are built from line items, shipping, tax and coupons only (lite:includes/Order/Manager.php:633-643). Fee lines are not copied, so on a split order the fee lines stay on the parent order and add nothing to any Vendor's earning.

**Code citations:** lite:includes/Fees.php:155-174 · lite:includes/Commission/OrderCommission.php:227-233 · lite:includes/Commission/OrderCommission.php:295-301 · lite:includes/Commission/OrderCommission.php:340-342 · lite:includes/Commission/OrderCommission.php:377-390 · lite:includes/Commission/OrderCommission.php:626-634 · lite:includes/Commission/OrderLineItemCommission.php:117-138 · lite:includes/Admin/Settings/Schema/SettingsSchema.php:561-583 · lite:includes/Order/Manager.php:757-812

**Answering ADR:** [ADR-0034](../0034-shipping-fees-go-to-the-vendor-unless-the-shipping-fee-recipient-is-set-to-admin.md), [ADR-0035](../0035-shipping-tax-and-fees-are-added-to-the-vendor-earning-or-the-admin-commission-outside-the-commission-formula.md), [ADR-0032](../0032-order-fee-lines-go-to-the-admin-unless-the-vendor-created-the-order.md)

**Last eval verdict:** pass (2026-10-22)

### 02-fees-shipping-tax-Q2

**Question:** Who keeps the sales tax collected on an order, and is tax on shipping treated the same way as tax on products?

**Settings assumed:** `dokan_selling[tax_fee_recipient]` default `seller`; `dokan_selling[shipping_tax_fee_recipient]` UI default `seller`, falling back to `tax_fee_recipient` when the key is absent.

**Expected answer:**

They are two separate settings, and both default to the Vendor.

1. **Product tax**: Settings → Transaction → Fees → "Product Tax Fee" (the new schema id is `product_tax_fee_recipient`). It is stored as `dokan_selling[tax_fee_recipient]` (lite:includes/Admin/Settings/Schema/SettingsSchema.php:586-608) and the default is `seller`. Product tax is computed as (order total tax − tax refunded) − (shipping tax − shipping tax refunded). The order's total tax includes shipping tax (wc:includes/abstracts/abstract-wc-order.php:1042), which is why shipping tax is subtracted.
   - `seller`: product tax is added to the Vendor's earning (`get_vendor_tax_fee`, lite:includes/Commission/OrderCommission.php:325-331).
   - `admin`: product tax is added to the admin's fees (`get_admin_tax_fee`, lite:includes/Commission/OrderCommission.php:242-248).
2. **Shipping tax**: "Shipping Tax Fee", stored as `dokan_selling[shipping_tax_fee_recipient]` (lite:includes/Admin/Settings/Schema/SettingsSchema.php:611-633). The settings UI default is `seller`. The amount is the order's shipping tax minus shipping tax refunded.
   - `seller`: goes to the Vendor (lite:includes/Commission/OrderCommission.php:310-316).
   - `admin`: goes to the admin (lite:includes/Commission/OrderCommission.php:257-263).
   - Key never saved: if the settings were never saved with this key, the code falls back to that order's product-tax recipient (`Fees::get_shipping_tax_fee_recipient`, lite:includes/Fees.php:227-229). So on such a site, shipping tax follows product tax rather than defaulting to the Vendor.

The UI help text says the same: shipping tax is not included in the shipping fee, and shipping tax is not included in product tax (lite:includes/Admin/Settings.php:608, 619). So all three amounts (shipping, product tax and shipping tax) can go to different parties. None of them is commissionable. Each value can be changed by a filter, which payment add-ons use to force a recipient: `dokan_tax_fee_recipient` (lite:includes/Fees.php:202) and `dokan_shipping_tax_fee_recipient` (lite:includes/Fees.php:229). The two filters are independent, so an add-on that forces only the product-tax recipient leaves shipping tax on the saved value (or the product-tax fallback when the key is unsaved).

On a split order, each Suborder gets tax lines totalling its own products' tax, plus the tax on its own shipping lines (`Order\Manager::create_taxes`, lite:includes/Order/Manager.php:717-747).

**Code citations:** lite:includes/Fees.php:188-207 · lite:includes/Fees.php:220-234 · lite:includes/Commission/OrderCommission.php:242-263 · lite:includes/Commission/OrderCommission.php:310-331 · lite:includes/Admin/Settings/Schema/SettingsSchema.php:586-633 · lite:includes/Admin/Settings.php:616-637 · wc:includes/abstracts/abstract-wc-order.php:1042 · lite:includes/Order/Manager.php:717-747

**Answering ADR:** [ADR-0033](../0033-product-tax-goes-to-the-tax-fee-recipient-and-excludes-shipping-tax.md), [ADR-0036](../0036-shipping-tax-goes-to-the-shipping-tax-fee-recipient-and-falls-back-to-the-product-tax-recipient.md)

**Last eval verdict:** pass (2026-10-22)

### 02-fees-shipping-tax-Q3

**Question:** Walk me through a real order: product $100, 10% product tax, $20 shipping with $2 shipping tax, 10% commission. How much does the vendor earn and how much does the admin keep under the different fee settings?

**Settings assumed:** Global commission Percentage 10% with no flat part; single Vendor; no coupon and no refund; three scenarios of `shipping_fee_recipient` / `tax_fee_recipient` / `shipping_tax_fee_recipient` as stated.

**Expected answer:**

Assumptions: a single-vendor order with no coupon and no refund. The global commission is Percentage 10% with no flat part. The product line `get_total()` is 100, product tax is 10, shipping total is 20, shipping tax is 2, and the order total is 132.

**Step 1: commission on the product line only.** Admin commission = 100 × 10 / 100 = 10. Vendor net earning = 100 − 10 = 90 (lite:includes/Commission/Formula/Percentage.php:65-69, applied per line item in lite:includes/Commission/OrderCommission.php:79-95).

**Step 2: add the pass-through amounts to whichever side each setting names.** Vendor earning = 90 + Vendor shipping + Vendor product tax + Vendor shipping tax (lite:includes/Commission/OrderCommission.php:340-342, 388-390). Admin total = max(10, 0) + admin shipping + admin product tax + admin shipping tax (lite:includes/Commission/OrderCommission.php:377-379, 542-544; `get_admin_commission` clamps at 0, lite:includes/Commission/Model/Commission.php:165-167). Product tax = total tax 12 − shipping tax 2 = 10.

- **Settings A, all defaults** (`shipping_fee_recipient` = `seller`, `tax_fee_recipient` = `seller`, `shipping_tax_fee_recipient` = `seller`): Vendor = 90 + 20 + 10 + 2 = **122**. Admin = **10**.
- **Settings B** (shipping = `seller`, tax = `admin`, shipping tax = `admin`): Vendor = 90 + 20 = **110**. Admin = 10 + 10 + 2 = **22**.
- **Settings C** (all three = `admin`): Vendor = **90**. Admin = 10 + 20 + 10 + 2 = **42**.

In every case, Vendor + admin = 132, the order total.

**Step 3: what gets stored.** `dokan_sync_insert_order` writes one `dokan_orders` row with `order_total` = 132 and `net_amount` = the Vendor figure, which is 122, 110 or 90 (lite:includes/Order/functions.php:243-270). It also writes a `dokan_vendor_balance` debit for the same amount (lite:includes/Order/functions.php:273-281). Any later reader of the admin side computes it as `order_total − net_amount` (`Commission::get_earning_from_order_table`, lite:includes/Commission.php:364-395).

Edge case: after a refund, each pass-through amount shrinks by its refunded part (`get_shipping_refunded`, `get_tax_refunded`, `get_total_shipping_tax_refunded`, lite:includes/Commission/OrderCommission.php:562-587). A refund's shipping and tax are charged back to whichever party that order's recipient setting names (`OrderRefundCommission::get_tax_refund_for` and `get_shipping_refund_for`, lite:includes/Commission/OrderRefundCommission.php:358-400).

**Code citations:** lite:includes/Commission/Formula/Percentage.php:63-69 · lite:includes/Commission/OrderCommission.php:79-95 · lite:includes/Commission/OrderCommission.php:340-342 · lite:includes/Commission/OrderCommission.php:377-390 · lite:includes/Commission/OrderCommission.php:542-544 · lite:includes/Commission/Model/Commission.php:165-167 · lite:includes/Order/functions.php:243-281 · lite:includes/Commission.php:364-395 · lite:includes/Commission/OrderRefundCommission.php:358-400

**Answering ADR:** [ADR-0035](../0035-shipping-tax-and-fees-are-added-to-the-vendor-earning-or-the-admin-commission-outside-the-commission-formula.md)

**Last eval verdict:** pass (2026-10-22). An edge case about `Commission\RecalculateCommissions` was removed at finalisation, because that class registers no hooks (lite:includes/Commission/RecalculateCommissions.php:16-18).

### 02-fees-shipping-tax-Q4

**Question:** If the admin switches the shipping or tax recipient from Vendor to Admin today, will that change the earnings on orders that were already placed?

**Settings assumed:** Any; the point is the per-order snapshot of the recipient.

**Expected answer:**

No. The recipient is captured on each order the first time it is looked up, and that saved value is used from then on.

- Shipping: `Fees::get_shipping_fee_recipient` first reads the order meta `shipping_fee_recipient`. Only when that meta is empty does it read `dokan_selling[shipping_fee_recipient]` (default `seller`), run the `dokan_shipping_fee_recipient` filter, and save the result to the order meta (lite:includes/Fees.php:164-171).
- Product tax: `get_tax_fee_recipient` does the same with the `tax_fee_recipient` meta (lite:includes/Fees.php:197-204).
- Shipping tax: `get_shipping_tax_fee_recipient` does the same with the `shipping_tax_fee_recipient` meta (lite:includes/Fees.php:222-232).

The commission and refund calculators always go through these getters (lite:includes/Commission/OrderCommission.php:228, 243, 258, 296, 311, 326; lite:includes/Commission/OrderRefundCommission.php:367-388). An order that has already been looked up keeps its original recipient, even when it is recalculated or refunded after the setting changes. A new setting value applies only to orders that have no saved recipient meta yet, which in practice means new orders.

Orders from before shipping tax had its own setting were backfilled when the site upgraded to 3.7.19. For every order that is not a parent order and has no `shipping_tax_fee_recipient` meta, the upgrader copies the order's saved `tax_fee_recipient` into it (lite:includes/Upgrade/Upgrades/BackgroundProcesses/V_3_7_19_UpdateOrderMeta.php:32-41). Those older orders therefore treat shipping tax the same way as their product tax.

On very old installs, the 2.8.6 upgrader seeded both `shipping_fee_recipient` and `tax_fee_recipient` from the former single `extra_fee_recipient` setting, or from `seller` when that was empty (lite:includes/Upgrade/Upgrades/V_2_8_6.php:18-19).

**Code citations:** lite:includes/Fees.php:155-174 · lite:includes/Fees.php:188-207 · lite:includes/Fees.php:220-234 · lite:includes/Commission/OrderCommission.php:228 · lite:includes/Commission/OrderRefundCommission.php:367-388 · lite:includes/Upgrade/Upgrades/BackgroundProcesses/V_3_7_19_UpdateOrderMeta.php:32-41 · lite:includes/Upgrade/Upgrades/V_2_8_6.php:18-19

**Answering ADR:** [ADR-0012](../0012-commission-terms-are-frozen-onto-the-order-at-first-calculation.md), [ADR-0036](../0036-shipping-tax-goes-to-the-shipping-tax-fee-recipient-and-falls-back-to-the-product-tax-recipient.md)

**Last eval verdict:** pass (2026-10-22)

### 02-fees-shipping-tax-Q5

**Question:** On a plain Dokan Lite store using PayPal, who pays PayPal's transaction fee, and how is it split between vendors on a multi-vendor order?

**Settings assumed:** Lite only; payment method `paypal`, `ppec_paypal` or `ppcp-gateway`; recipients default `seller`; 10% commission; fee 6.00 on a 200 parent order split 132/68.

**Expected answer:**

In Lite, the gateway processing fee is taken out of the Vendor's earning. There is no setting that changes this, and it applies only to PayPal gateways that record the fee.

**Which fee is used.** `Fees::get_processing_fee` reads a fee only for these payment methods (lite:includes/Fees.php:126-145):

- `paypal`: order meta `PayPal Transaction Fee`.
- `ppec_paypal`: the `PPEC_FEE_META_NAME_NEW` meta.
- `ppcp-gateway` (WooCommerce PayPal Payments): `paypal_fee.value` from the PayPal fee breakdown.

For any other gateway the fee is 0, unless something hooks the `dokan_get_processing_fee` filter.

**When it is applied.** `Fees::calculate_gateway_fee` runs on `woocommerce_order_status_changed` at priority 100, on `woocommerce_thankyou_ppec_paypal`, and on `woocommerce_paypal_payments_order_captured` (lite:includes/Fees.php:21-23). It walks the order itself, or every Suborder if the order was split (`Commission::get_all_order_to_be_processed`, lite:includes/Commission.php:512-522). It skips any order that has no `dokan_orders` row yet, or that already carries `dokan_gateway_fee` meta (lite:includes/Fees.php:67-72).

**How it is split.** Each order's share is fee × (that order's total ÷ the paid order's total) (lite:includes/Fees.php:74). The `dokan_orders.net_amount` value and the matching `dokan_vendor_balance` debit are both rewritten to the earning minus that share (lite:includes/Fees.php:78-98). The share is saved as `dokan_gateway_fee` meta, and an order note is added (lite:includes/Fees.php:100-105).

Later recalculations stay consistent. When `dokan_gateway_fee_paid_by` is empty, `OrderCommission` treats the payer as `seller` for every gateway except `dokan-stripe-connect` (lite:includes/Commission/OrderCommission.php:400-415). `get_vendor_gateway_fee` then subtracts the fee from the Vendor's fees again (lite:includes/Commission/OrderCommission.php:388-390, 424-432).

**Worked example.** Settings are the defaults (all recipients `seller`) with 10% commission. A Suborder for Vendor A has total 132 and earning 122, as in 02-fees-shipping-tax-Q3. A Suborder for Vendor B has total 68. The parent order total is 200 and PayPal's fee is 6.00.

- Vendor A's share = 6 × 132 / 200 = **3.96**, so `net_amount` = 122 − 3.96 = **118.04**.
- Vendor B's share = 6 × 68 / 200 = **2.04**, deducted from B's earning in the same way.

In the order table, the admin side is `order_total − net_amount` = 132 − 118.04 = 13.96. That is the admin's 10 of commission plus the 3.96 that the Vendor reimbursed, which covers what PayPal actually kept.

Add-ons can change the share or the resulting net with the `dokan_get_processing_gateway_fee` and `dokan_orders_vendor_net_amount` filters (lite:includes/Fees.php:77-79).

**Code citations:** lite:includes/Fees.php:21-23 · lite:includes/Fees.php:57-115 · lite:includes/Fees.php:126-145 · lite:includes/Commission.php:512-522 · lite:includes/Commission/OrderCommission.php:388-390 · lite:includes/Commission/OrderCommission.php:400-432

**Answering ADR:** [ADR-0031](../0031-a-paypal-processing-fee-is-prorated-across-vendor-orders-and-deducted-from-the-vendor-earning.md)

**Last eval verdict:** pass (2026-10-22)

---

## Order status and earnings

### 03-order-status-earnings-Q1

**Question:** A customer bought from three vendors in one checkout. If the admin changes the main (parent) order's status, do the vendors' suborders change too, and does a vendor completing their suborder change the parent? What if the cart only had one vendor?

**Settings assumed:** No filter on `dokan_sub_order_status_update_whitelist` or `dokan_excluded_payment_gateways_on_order_status_update`.

**Expected answer:**

**Downward, from the parent to its Suborders.** Every time any order changes status, Dokan copies the new status onto each child order, but only if a transition whitelist allows the move from the child's current status (`Hooks::on_order_status_change`, lite:includes/Order/Hooks.php:126-138). When a move is blocked, Dokan skips it and writes a log line: "Skipped status update for sub-order ..." (lite:includes/Order/Hooks.php:274-276). The default whitelist (lite:includes/Order/Hooks.php:205-213) is:

- pending: may move to any status.
- on-hold: may move to pending, on-hold, processing, completed or failed. It does **not** follow the parent to cancelled or refunded.
- processing: may move to completed, failed, cancelled or refunded. It does **not** follow the parent to on-hold or pending.
- completed: may move only to refunded.
- failed: may move to pending, on-hold, processing, failed or cancelled. It does **not** follow the parent to completed or refunded.
- cancelled and refunded: terminal. They never follow the parent.

If either the current status or the new status is missing from the whitelist (for example a custom order status), the move is always allowed (lite:includes/Order/Hooks.php:233-236). Developers can change the table with the `dokan_sub_order_status_update_whitelist` filter (lite:includes/Order/Hooks.php:231). Two examples: cancelling an on-hold parent (an unpaid bank-transfer order, say) leaves its on-hold Suborders unchanged; completing a parent completes Suborders that are processing or pending.

**Upward, from Suborders to the parent.** Only one rule exists. Whenever a Suborder changes status, Dokan checks all the sibling Suborders. If every one of them is completed, the parent is set to completed with the note "Mark parent order completed when all child orders are completed" (`Hooks::on_sub_order_change`, lite:includes/Order/Hooks.php:391-430). No other status moves up: if all Suborders are cancelled or refunded, the parent keeps its own status. During the same check, any sibling Suborder that is processing and needs no processing (digital or virtual items only) is auto-completed. This happens only when the Suborder that just changed is paid and its payment method is not `bacs`, `cheque` or `cod`; that exclusion list can be changed with the `dokan_excluded_payment_gateways_on_order_status_update` filter (lite:includes/Order/Hooks.php:409-416). New Suborders start with the parent's status at the time they are split (`Manager::create_sub_order`, lite:includes/Order/Manager.php:652). For the reasoning behind parent orders being a shell (no stock reduction, no refund handling), see Lite ADR 0004; for the Suborder model, see Lite ADR 0011.

**Single-vendor orders.** When the cart has only one Vendor, no Suborder is created. Dokan writes `_dokan_vendor_id` on the order itself, and that order is the Vendor order (`Manager::maybe_split_orders`, lite:includes/Order/Manager.php:931-944). It has no children, so status changes simply apply to it, and the upward rule never runs because its parent id is 0 (lite:includes/Order/Hooks.php:393-395). Its own `dokan_orders` and `dokan_vendor_balance` rows hold the Vendor's earning. If an admin creates an order in wp-admin that has neither a parent nor Suborders, Dokan splits it the first time its status changes in admin (lite:includes/Order/Hooks.php:100-109).

**Code citations:** lite:includes/Order/Hooks.php:36-38 · lite:includes/Order/Hooks.php:126-138 · lite:includes/Order/Hooks.php:199-245 · lite:includes/Order/Hooks.php:391-430 · lite:includes/Order/Manager.php:652 · lite:includes/Order/Manager.php:896-956 · lite:includes/Order/Hooks.php:100-109

**Answering ADR:** [ADR-0038](../0038-a-parent-order-status-change-is-copied-to-its-suborders-only-along-an-allowed-transition-list.md), [ADR-0037](../0037-a-parent-order-is-completed-automatically-only-when-every-suborder-is-completed.md), [ADR-0042](../0042-paid-digital-only-suborders-are-completed-automatically-unless-paid-with-a-manual-gateway.md)

**Last eval verdict:** pass (2026-10-22)

### 03-order-status-earnings-Q2

**Question:** Which order statuses make a sale count toward a vendor's earnings and balance? Does a processing order count, or only completed ones?

**Settings assumed:** `dokan_withdraw[withdraw_order_status]` default `['wc-completed']`; `withdraw_date_limit` 0.

**Expected answer:**

It depends on the setting `dokan_withdraw[withdraw_order_status]` ("Order Status for Withdraw"). This is a multi-select whose options are Completed (`wc-completed`), Processing (`wc-processing`) and On-hold (`wc-on-hold`) (lite:includes/Utilities/AdminSettings.php:62-71). The default is only `wc-completed` (lite:includes/Admin/Settings.php:753-762, and the code fallback at lite:includes/Withdraw/functions.php:356). Dokan always adds `wc-refunded` to whichever statuses are selected (lite:includes/Withdraw/functions.php:357-365). The `dokan_withdraw_active_status` filter can change the final list.

How each choice behaves: every Vendor order (a Suborder, or a single-vendor order) has one `dokan_vendor_balance` row with `trn_type` = `dokan_orders` and `debit` = the Vendor's earning. When an order changes status, the row's status column is overwritten with the new status (lite:includes/Order/Hooks.php:173-183). `Vendor::get_earnings` sums the debit only on rows whose status is in the active list and whose `balance_date` has been reached (lite:includes/Vendor/Vendor.php:830-838). `Vendor::get_balance` applies the same status filter (lite:includes/Vendor/Vendor.php:885-897).

- Default (Completed only): a processing or on-hold order adds nothing until it reaches completed.
- Completed + Processing: an order counts as soon as it is processing, typically right after payment.
- Completed + Processing + On-hold: on-hold orders, such as unpaid bank transfers, also count.
- In every branch, pending, failed, cancelled, draft and custom statuses never count. Refunded always counts; the refund itself is subtracted separately (see 03-order-status-earnings-Q5).

When an order moves out of a counted status, for example processing to cancelled, it stops counting immediately, because the same row's status is overwritten.

The row is created at checkout, when the order or Suborder is synced (`dokan_sync_insert_order`, lite:includes/Order/functions.php:217-282). In this version that insert never sets a status (the model default is `''`, lite:includes/Models/VendorBalance.php:39), so the row starts counting only after the first status change writes one. `balance_date` is also pushed into the future by the withdraw threshold, `dokan_withdraw[withdraw_date_limit]` or the Vendor's user meta `withdraw_date_limit`, default 0 days (lite:includes/functions.php:4058-4066, lite:includes/Order/functions.php:281). Separately, the Vendor's "total sales" figure ignores this setting: it sums `order_total` from `dokan_orders` for completed, processing and on-hold orders (lite:includes/Vendor/Vendor.php:797).

**Code citations:** lite:includes/Admin/Settings.php:753-762 · lite:includes/Utilities/AdminSettings.php:62-71 · lite:includes/Withdraw/functions.php:355-366 · lite:includes/Order/Hooks.php:173-183 · lite:includes/Vendor/Vendor.php:820-858 · lite:includes/Vendor/Vendor.php:873-897 · lite:includes/Order/functions.php:217-282 · lite:includes/functions.php:4058-4066 · lite:includes/Vendor/Vendor.php:797

**Answering ADR:** [ADR-0043](../0043-the-vendor-balance-ledger-copies-the-vendor-order-status-on-every-status-change.md), [ADR-0063](../0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md), [ADR-0039](../0039-a-vendor-order-earning-is-written-to-the-vendor-balance-ledger-once-when-the-order-is-created-not-when-it-is-paid.md)

**Last eval verdict:** pass (2026-10-22)

### 03-order-status-earnings-Q3

**Question:** Our vendors take Cash on Delivery orders. Do those orders add to the vendor's Dokan balance like card payments do?

**Settings assumed:** `dokan_withdraw[exclude_cod_payment]` default `off`.

**Expected answer:**

It depends on `dokan_withdraw[exclude_cod_payment]` ("Exclude COD Payments"), a switch with default `off` (lite:includes/Admin/Settings.php:764-770).

- `off` (default): COD orders are treated like any other order. Each status change copies the new status onto the order's `dokan_vendor_balance` row (lite:includes/Order/Hooks.php:173-183), so the order counts as soon as it reaches a status selected in `withdraw_order_status` (see 03-order-status-earnings-Q2). Refunds on COD orders write the usual approved `dokan_refund` credit rows (lite:includes/Order/RefundHandler.php:214-238).
- `on`, and the order's payment method is `cod`: `on_order_status_change` still updates `dokan_orders.order_status` and still pushes the status to the Suborders (lite:includes/Order/Hooks.php:116-138). It then returns before it updates the balance row (lite:includes/Order/Hooks.php:145-171). The balance row's status therefore never matches an active status, and the order never adds to `Vendor::get_earnings` or `get_balance` (lite:includes/Vendor/Vendor.php:836, :896). Refund credits for that order are also suppressed: `RefundHandler::exclude_cod_payment` makes `dokan_refund_should_insert_into_vendor_balance` return false (lite:includes/Order/RefundHandler.php:94-137). The idea is that the Vendor already holds the cash, so neither the sale nor its refund passes through the Dokan balance. The order still shows in the Vendor's order list and in `dokan_orders`.

The decision can be overridden per order with the filters `dokan_order_should_exclude_from_vendor_balance` (status path, lite:includes/Order/Hooks.php:160-167) and `dokan_order_refund_should_exclude_from_vendor_balance` (refund path, lite:includes/Order/RefundHandler.php:122-130); a POS add-on, for example, can use them. Gateway names other than `cod` are never excluded by this switch.

**Code citations:** lite:includes/Admin/Settings.php:764-770 · lite:includes/Order/Hooks.php:145-183 · lite:includes/Order/RefundHandler.php:19 · lite:includes/Order/RefundHandler.php:94-137 · lite:includes/Order/RefundHandler.php:214-216 · lite:includes/Vendor/Vendor.php:830-838

**Answering ADR:** [ADR-0057](../0057-cash-on-delivery-earnings-stay-out-of-the-withdrawable-balance-only-while-exclude-cod-payments-is-on.md), [ADR-0051](../0051-refunds-of-excluded-cash-on-delivery-orders-never-touch-the-vendor-balance.md)

**Last eval verdict:** pass (2026-10-22)

### 03-order-status-earnings-Q4

**Question:** Can you walk me through a vendor's earnings with real numbers: some orders completed, one processing, one cancelled, and a couple of refunds?

**Settings assumed:** Dokan Lite only; `dokan_withdraw[exclude_cod_payment]` = `off`; `withdraw_date_limit` = 0; Branch A `withdraw_order_status` = `['wc-completed']` (default), Branch B adds `wc-processing` and `wc-on-hold`.

**Expected answer:**

Assumptions: no COD exclusion, withdraw threshold 0 days, and every row's `balance_date` is already in the past. The earning figures below are the `dokan_vendor_balance` debit amounts that Dokan stored for Vendor V when each Vendor order was synced (`dokan_sync_insert_order` sets debit = the Vendor's earning, lite:includes/Order/functions.php:243-249, :273-282).

Vendor V's orders:

- #101, completed, earning 90.00. The admin made an itemised partial refund whose Vendor share is 18.00.
- #102, processing, earning 45.00. The admin made an itemised partial refund whose Vendor share is 10.00.
- #103, on-hold, earning 27.00.
- #104, cancelled, earning 30.00.
- #105, earning 60.00, fully refunded with an itemised refund. WooCommerce moves it to refunded (wc:includes/wc-order-functions.php:737-740), and Dokan inserts a 60.00 credit.

What the code writes:

- Each order's status change overwrites the status on its debit row (lite:includes/Order/Hooks.php:173-183).
- Each itemised refund fires `woocommerce_order_refunded` (wc:includes/wc-order-functions.php:752). `RefundHandler::handle_refund` then calls `insert_into_balance_table`, which adds a separate row: `trn_type` `dokan_refund`, credit = the Vendor's share of the refund, status `approved`, `balance_date` = now (lite:includes/Order/RefundHandler.php:37-62, :224-238).
- The debit itself stays at the un-refunded earning, because order edits recalculate it with refund adjustment switched off (`VendorBalanceUpdateHandler::handle_order_edit`, lite:includes/Order/VendorBalanceUpdateHandler.php:49-54, :102-111).

`Vendor::get_earnings` returns SUM(debit) on `dokan_orders` rows whose status is active, minus SUM(credit) on approved `dokan_refund` rows (lite:includes/Vendor/Vendor.php:830-852).

**Branch A**, default `withdraw_order_status` = [`wc-completed`]. The active statuses are `wc-refunded` and `wc-completed` (lite:includes/Withdraw/functions.php:355-366).

- Debits: #101 90 + #105 60 = 150.00.
- Credits: 18 + 10 + 60 = 88.00. The 10.00 credit on #102 is subtracted even though #102's own debit does not count yet, because the credit query does not filter on order status.
- Earnings = 150 − 88 = **62.00**.

**Branch B**, `withdraw_order_status` = [`wc-completed`, `wc-processing`, `wc-on-hold`].

- Debits: 90 + 45 + 27 + 60 = 222.00.
- Credits: 88.00.
- Earnings = **134.00**.

In both branches, the cancelled order #104 (30.00) contributes nothing. The fully refunded #105 nets to 0 (debit 60, credit 60). If #102 is later completed, Branch A becomes 150 + 45 − 88 = 107.00.

Balance is not the same as earnings: `Vendor::get_balance` subtracts every credit row, including withdrawals (lite:includes/Vendor/Vendor.php:885-899). If a gateway fee applies, `Fees::calculate_gateway_fee` lowers the debit after payment (lite:includes/Fees.php:57-101).

**Code citations:** lite:includes/Order/functions.php:243-282 · lite:includes/Order/Hooks.php:173-183 · lite:includes/Order/RefundHandler.php:37-62 · lite:includes/Order/RefundHandler.php:191-238 · lite:includes/Order/VendorBalanceUpdateHandler.php:43-111 · lite:includes/Vendor/Vendor.php:820-858 · lite:includes/Withdraw/functions.php:355-366 · wc:includes/wc-order-functions.php:717-752 · lite:includes/Fees.php:57-101

**Answering ADR:** [ADR-0043](../0043-the-vendor-balance-ledger-copies-the-vendor-order-status-on-every-status-change.md), [ADR-0047](../0047-each-refund-is-booked-as-a-separate-dokan-refund-credit-on-the-vendor-balance.md), [ADR-0063](../0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md), [ADR-0106](../0106-the-legacy-dashboard-earning-counter-is-ledger-earnings-in-withdraw-statuses-minus-approved-refunds.md)

**Last eval verdict:** pass (2026-10-22)

### 03-order-status-earnings-Q5

**Question:** What happens to the vendor's balance when an order is cancelled or fails, or when someone just changes the status to Refunded?

**Settings assumed:** Dokan Lite only; `exclude_cod_payment` off (if on, excluded COD orders never touch the balance at all; see 03-order-status-earnings-Q3).

**Expected answer:**

Dokan Lite keeps one earning (debit) row per Vendor order and writes refunds as separate credit rows. A status change never deletes the debit row or changes its amount; it only overwrites the row's status column (lite:includes/Order/Hooks.php:173-183). Whether the debit counts then depends on that status being in the active list (`dokan_withdraw[withdraw_order_status]` plus the always-included `wc-refunded`, lite:includes/Withdraw/functions.php:355-366).

**Cancelled or failed.** Neither status is ever in the active list, so the order's earning drops out of the Vendor's earnings and balance as soon as the status changes (lite:includes/Vendor/Vendor.php:836, :896). It comes back automatically if the order returns to an active status, for example failed to processing, because the same row is updated again. No credit row is written. Any refund credits already recorded for the order remain. The `dokan_orders` row also keeps its `net_amount` and only changes `order_status` (lite:includes/Order/Hooks.php:117-123). For a parent order, the cancel reaches only the Suborders the whitelist allows: pending, processing and failed Suborders follow; on-hold and completed ones do not (lite:includes/Order/Hooks.php:205-213).

**Refunded.** The result depends on how the order became refunded.

- An itemised refund (amounts or quantities entered against line items, shipping or tax): WooCommerce creates a refund with those items and fires `woocommerce_order_refunded` (wc:includes/wc-order-functions.php:752). `RefundHandler::handle_refund` works out the Vendor's share (`OrderRefundCommission::get_vendor_total_refund` = prorated line-item earning + Vendor tax + Vendor shipping − gateway fee returned, lite:includes/Commission/OrderRefundCommission.php:287-295). It then inserts an approved `dokan_refund` credit for that amount, but only if the amount is greater than 0 (lite:includes/Order/RefundHandler.php:214-238). Earnings fall by that amount.
- Only the status is changed to Refunded, with no itemised refund: WooCommerce's `wc_order_fully_refunded` creates a refund for the remaining amount with no line items (wc:includes/wc-order-functions.php:915-940). Dokan computes the Vendor's share from refund items only (`OrderCommission::calculate_for_refund`, lite:includes/Commission/OrderCommission.php:167-197; tax and shipping from refund items, lite:includes/Commission/OrderRefundCommission.php:387-399, :464-480), so the share is 0 and no credit row is written. The debit row's status becomes `wc-refunded`, which always counts, so the Vendor's earning for that order still counts in full. In other words, a status-only "Refunded" does not take money out of the Vendor's balance; only itemised refunds do.
- A refund on a parent order that has Suborders is ignored. Lite returns early for parent-order refunds (lite:includes/Order/RefundHandler.php:52-54), and the refund calculator returns 0 for parent orders (lite:includes/Commission/OrderRefundCommission.php:288-290). Vendor balances change only through refunds on the Suborders. See Lite ADR 0004.
- The `Hooks::manage_refunded_for_order` path, which would credit the full earning when the status is set from the Vendor dashboard, never inserts anything in practice. It compares the status to `wc-refunded`, but WooCommerce passes statuses without that prefix (wc:includes/abstracts/abstract-wc-order.php:905). It also requires a `post_type=shop_order` field that the dashboard form does not send (lite:includes/Order/Hooks.php:294-309, lite:templates/orders/details.php:226-238).

An add-on that announces itself through `dokan_is_pro_exists` switches Lite's refund handler off (lite:includes/Order/RefundHandler.php:39-41); this answer describes Lite on its own.

**Code citations:** lite:includes/Order/Hooks.php:117-123 · lite:includes/Order/Hooks.php:173-183 · lite:includes/Order/Hooks.php:205-213 · lite:includes/Order/Hooks.php:290-309 · lite:includes/Withdraw/functions.php:355-366 · lite:includes/Vendor/Vendor.php:830-838 · lite:includes/Order/RefundHandler.php:37-62 · lite:includes/Order/RefundHandler.php:214-238 · lite:includes/Commission/OrderRefundCommission.php:287-295 · lite:includes/Commission/OrderCommission.php:153-205 · wc:includes/wc-order-functions.php:915-940 · wc:includes/abstracts/abstract-wc-order.php:903-905

**Answering ADR:** [ADR-0040](../0040-cancelling-or-failing-a-vendor-order-drops-its-earning-from-the-balance-without-a-reversal-entry.md), [ADR-0049](../0049-only-the-itemised-part-of-a-refund-is-charged-to-the-vendor.md), [ADR-0004](../0004-vendor-order-is-authoritative-parent-is-mirror.md)

**Last eval verdict:** pass (2026-10-22)

---

## Refunds

### 04-refund-Q2

**Question:** A customer bought 2 units at $50 each from one Vendor, plus $10 shipping. We refund one unit and the shipping. How much comes out of the Vendor's balance, and how much Commission does the admin keep?

**Settings assumed:** `dokan_selling[admin_percentage]` = 10, no flat fee; `dokan_selling[shipping_fee_recipient]` = `seller` (default); no tax; no coupon; `dokan_withdraw[exclude_cod_payment]` = `off` (default); single-vendor order or Suborder; `dokan_refund_gateway_fee` not hooked (returns 0).

**Expected answer:**

Refund lines: $50 on the product line and $10 on the shipping line. Refund total $60.

**1) The original sale** (lite:includes/Commission/Calculator.php, `calculate()`):

- Admin Commission = round(100 × 10%) = $10.00. The Vendor takes the exact remainder: $100 − $10 = $90.
- Shipping goes to the Vendor.
- Vendor earning = $90 + $10 = $100. This is written as the Vendor balance row with `trn_type` = `dokan_orders` and debit 100 (lite:includes/Order/functions.php:273-281).

**2) The refund.** `OrderRefundCommission::get_vendor_total_refund` = prorated line earning + Vendor's tax share + Vendor's shipping share − gateway fee returned (lite:includes/Commission/OrderRefundCommission.php:287-295).

- Line item (`Calculator::calculate_for_refund`, lite:includes/Commission/Calculator.php:191-212). The split is in proportion to the item's original Commission:
  - admin part = round((10 / 100) × 50) = $5.00
  - Vendor part = 50 − 5 = $45.00

  Only the admin share is rounded, and the Vendor absorbs the remainder (lite:includes/Commission/Calculator.php:205-206). The original item split comes from `OrderCommission::calculate_for_refund` → `OrderLineItemCommission::calculate_for_refund_item` (lite:includes/Commission/OrderCommission.php:153-204; lite:includes/Commission/OrderLineItemCommission.php:171-186).
- Shipping: the recipient is the seller, so the Vendor gives back $10 (`get_shipping_refund_for`, lite:includes/Commission/OrderRefundCommission.php:387-400).
- Tax: $0.
- Gateway fee returned: $0. The `dokan_refund_gateway_fee` filter defaults to 0 (lite:includes/Commission/OrderRefundCommission.php:417-453).
- Vendor total = 45 + 10 = $55.

**3) Where it is recorded.** `RefundHandler::insert_into_balance_table` writes one row to `dokan_vendor_balance` (lite:includes/Order/RefundHandler.php:191-239): `trn_type` = `dokan_refund`, `trn_id` = order ID, credit 55, debit 0, status `approved`.

- The original debit row of 100 is **not** reduced. `VendorBalanceUpdateHandler` recomputes it with refunds ignored (`set_should_adjust_refund(false)`, lite:includes/Order/VendorBalanceUpdateHandler.php:44-52).
- The Vendor's earnings are SUM(debit of `dokan_orders` rows whose status is in the withdraw statuses) − SUM(credit of approved `dokan_refund` rows) (lite:includes/Vendor/Vendor.php:830-849). Here that is 100 − 55 = **$45**.

**4) Result.**

- The customer gets $60 back. The Vendor bears $55 and the admin gives up $5 of Commission.
- The admin keeps $5 Commission on the remaining unit. Check: 10% of the remaining $50 is $5.
- The `dokan_orders` row is recalculated on the next order save: `net_amount` = $45 and `order_total` = 110 − 60 = $50 (`VendorBalanceUpdateHandler::update_dokan_order_table`, lite:includes/Order/VendorBalanceUpdateHandler.php:146-200; the per-item adjustment is in `OrderLineItemCommission::adjust_refunds`, lite:includes/Commission/OrderLineItemCommission.php:195-227).

Note on flat fees: a per-unit flat Commission is **not** added back per unit. It is prorated by amount, like the rest of the item's Commission. For example, 10% + $2 per unit on this line gives an admin share of $14. Refunding $50 then takes back round(14/100 × 50) = $7 from the admin.

In Lite the calculation runs as soon as the refund is created (see ADR 0048).

**Code citations:** lite:includes/Commission/Calculator.php:191 · lite:includes/Commission/Calculator.php:205 · lite:includes/Commission/OrderCommission.php:153 · lite:includes/Commission/OrderLineItemCommission.php:171 · lite:includes/Commission/OrderLineItemCommission.php:195 · lite:includes/Commission/OrderRefundCommission.php:287 · lite:includes/Commission/OrderRefundCommission.php:387 · lite:includes/Commission/OrderRefundCommission.php:417 · lite:includes/Order/RefundHandler.php:191 · lite:includes/Order/RefundHandler.php:224 · lite:includes/Order/VendorBalanceUpdateHandler.php:44 · lite:includes/Vendor/Vendor.php:830

**Answering ADR:** [ADR-0046](../0046-a-refund-reverses-commission-and-vendor-earning-pro-rata-to-the-refunded-share-of-each-line-item.md), [ADR-0047](../0047-each-refund-is-booked-as-a-separate-dokan-refund-credit-on-the-vendor-balance.md), [ADR-0050](../0050-refunded-shipping-and-tax-go-back-from-whichever-party-received-them-and-the-gateway-fee-stays-where-it-was.md)

**Last eval verdict:** pass (2026-10-22)

### 04-refund-Q3

**Question:** If the admin just types a refund amount instead of entering it against specific products or shipping lines, does the Vendor's balance still go down?

**Settings assumed:** No custom filter on `dokan_refund_should_insert_into_vendor_balance` or `dokan_vendor_earning_in_refund`.

**Expected answer:**

No. Dokan works out the Vendor's and admin's shares from the refund's line rows (products, shipping, tax). A refund that has only a total amount and no line rows takes $0 from the Vendor's balance.

How the code does it:

- Product lines: `OrderCommission::calculate_for_refund` loops over `$refund->get_items()`, the refunded product lines only, and prorates each one against the original line's Commission (lite:includes/Commission/OrderCommission.php:153-204, especially the loop at 167).
- Shipping: read only from the refund's shipping rows (lite:includes/Commission/OrderRefundCommission.php:387-400).
- Tax: read only from the refund's tax rows (lite:includes/Commission/OrderRefundCommission.php:464-480).
- WooCommerce only creates refund rows for lines that were given a quantity, total or tax (wc:includes/wc-order-functions.php:600-657). With no lines filled in, the refund carries just its total (wc:includes/wc-order-functions.php:661).
- So `get_vendor_total_refund()` = 0 (lite:includes/Commission/OrderRefundCommission.php:287-295).
- `RefundHandler::insert_into_balance_table` only writes a `dokan_refund` row when the amount is above 0: `apply_filters( 'dokan_refund_should_insert_into_vendor_balance', $vendor_earning_refund > 0, ... )` (lite:includes/Order/RefundHandler.php:214). With 0, no row is written and the Vendor's balance does not change. The admin carries the whole refund.

The same applies when the order status is set to Refunded without an itemised refund. WooCommerce's `wc_order_fully_refunded` (wc:includes/wc-order-functions.php:915-940) then creates an automatic refund for whatever is left, with `'line_items' => array()` and no gateway call. Lite also has an older handler, `manage_refunded_for_order`, that would credit the full earning (lite:includes/Order/Hooks.php:290-360). In practice it does not run on that path. It compares the status against `wc-refunded`, but WooCommerce passes the status without the `wc-` prefix (Lite itself adds the prefix in `on_order_status_change`, lite:includes/Order/Hooks.php:110-113). It also requires a `post_type` field that the Vendor status form does not send (lite:templates/orders/details.php:225-238).

Practical guidance: to charge a refund back to the Vendor, enter it against the product lines, plus the shipping and tax lines if those were refunded.

**Code citations:** lite:includes/Commission/OrderCommission.php:167 · lite:includes/Commission/OrderRefundCommission.php:287 · lite:includes/Commission/OrderRefundCommission.php:387 · lite:includes/Commission/OrderRefundCommission.php:464 · lite:includes/Order/RefundHandler.php:214 · wc:includes/wc-order-functions.php:600 · wc:includes/wc-order-functions.php:915 · lite:includes/Order/Hooks.php:290 · lite:includes/Order/Hooks.php:110

**Answering ADR:** [ADR-0049](../0049-only-the-itemised-part-of-a-refund-is-charged-to-the-vendor.md)

**Last eval verdict:** pass (2026-10-22)

### 04-refund-Q4

**Question:** Does refunding a Cash on Delivery order take money out of the Vendor's withdrawable balance?

**Settings assumed:** `dokan_withdraw[exclude_cod_payment]` default `off`; both branches described.

**Expected answer:**

It depends on the setting `dokan_withdraw[exclude_cod_payment]` (Withdraw options → "Exclude COD payments"). The default is `off`.

- **Off (default):** COD orders are treated like any other order. Their earning counts toward the Vendor's balance once the order reaches a withdraw status. A refund writes a `dokan_refund` credit row for the Vendor's prorated share, and the balance goes down by that amount (lite:includes/Order/RefundHandler.php:191-239). The calculation is the one in 04-refund-Q2.
- **On, and the order was paid with `cod`:**
  - `RefundHandler::exclude_cod_payment` returns false for `dokan_refund_should_insert_into_vendor_balance`, so no `dokan_refund` row is written (lite:includes/Order/RefundHandler.php:19, 94-137, especially 103 and 108).
  - The sale itself is also kept out of the balance. On a status change, `Hooks::on_order_status_change` returns before it updates the status of the order's `dokan_orders` balance row (lite:includes/Order/Hooks.php:145-172). That row therefore never reaches a status that `Vendor::get_earnings` counts, since `get_earnings` only sums `dokan_orders` debits whose status is in the withdraw statuses (lite:includes/Vendor/Vendor.php:830-838).
  - Net effect: a COD order is neither added to nor taken from the withdrawable balance when it is refunded. The Vendor collected the cash and settles it themselves.
- **On, but the order used another gateway:** same as off.

Override: other plugins (for example POS) can change the decision through the filters `dokan_order_refund_should_exclude_from_vendor_balance` (lite:includes/Order/RefundHandler.php:122-130) and `dokan_order_should_exclude_from_vendor_balance` (lite:includes/Order/Hooks.php:160-167).

**Code citations:** lite:includes/Order/RefundHandler.php:19 · lite:includes/Order/RefundHandler.php:103 · lite:includes/Order/RefundHandler.php:122 · lite:includes/Order/RefundHandler.php:214 · lite:includes/Order/Hooks.php:145 · lite:includes/Order/Hooks.php:160 · lite:includes/Vendor/Vendor.php:830

**Answering ADR:** [ADR-0051](../0051-refunds-of-excluded-cash-on-delivery-orders-never-touch-the-vendor-balance.md), [ADR-0057](../0057-cash-on-delivery-earnings-stay-out-of-the-withdrawable-balance-only-while-exclude-cod-payments-is-on.md)

**Last eval verdict:** pass (2026-10-22)

### 04-refund-Q5

**Question:** When we refund shipping or tax, who pays that back: the Vendor or the admin?

**Settings assumed:** Defaults: `dokan_selling[shipping_fee_recipient]` = `seller`, `dokan_selling[tax_fee_recipient]` = `seller`, `dokan_selling[shipping_tax_fee_recipient]` falls back to `tax_fee_recipient`. The example uses `shipping_tax_fee_recipient` = `admin`.

**Expected answer:**

Whoever originally received that fee gives it back. Who received it depends on three settings. Each one is copied onto the order the first time it is read, so changing a setting later does not change refunds on existing orders.

1. **Shipping:** `dokan_selling[shipping_fee_recipient]`, default `seller` (lite:includes/Fees.php:155-175 reads it with default `seller` and saves it to order meta `shipping_fee_recipient`).
   - `seller` (default): refunded shipping rows are added to the Vendor's refund amount and come off the Vendor's balance.
   - `admin`: refunded shipping counts towards the admin's share, and the Vendor's balance is untouched for it.

   (Rule: `OrderRefundCommission::get_shipping_refund_for`, lite:includes/Commission/OrderRefundCommission.php:387-400.)
2. **Product tax:** `dokan_selling[tax_fee_recipient]`, default `seller` (lite:includes/Fees.php:188-208, saved as order meta `tax_fee_recipient`).
   - `seller` (default): the refunded product tax comes off the Vendor's balance.
   - `admin`: the admin carries it.
3. **Shipping tax:** `dokan_selling[shipping_tax_fee_recipient]`. Its default is whatever the product tax recipient is (lite:includes/Fees.php:220-235, saved as order meta `shipping_tax_fee_recipient`).
   - `seller`: the refunded shipping tax comes off the Vendor's balance.
   - `admin`: the admin carries it.

   (Tax routing: `OrderRefundCommission::get_tax_refund_for` and `get_refunded_tax_totals`, lite:includes/Commission/OrderRefundCommission.php:357-378, 464-480.)

**Example:** a $10 shipping line plus $1.50 of shipping tax is refunded. Settings are shipping = `seller` (default) and shipping tax = `admin`. The Vendor's `dokan_refund` row includes $10, and the admin carries the $1.50 (`OrderRefundCommission::get_vendor_total_refund`, lite:includes/Commission/OrderRefundCommission.php:287-295).

**Product lines** are always split by the line's original Commission, never by these settings (`Calculator::calculate_for_refund`, lite:includes/Commission/Calculator.php:191-212).

**Parent orders:** refunds made on a parent order that has Suborders allocate nothing (`has_sub_orders`, lite:includes/Commission/OrderRefundCommission.php:329-333). Refund the Suborder instead.

**Code citations:** lite:includes/Fees.php:155 · lite:includes/Fees.php:188 · lite:includes/Fees.php:220 · lite:includes/Commission/OrderRefundCommission.php:287 · lite:includes/Commission/OrderRefundCommission.php:357 · lite:includes/Commission/OrderRefundCommission.php:387 · lite:includes/Commission/OrderRefundCommission.php:464 · lite:includes/Commission/Calculator.php:191 · lite:includes/Commission/OrderRefundCommission.php:329

**Answering ADR:** [ADR-0050](../0050-refunded-shipping-and-tax-go-back-from-whichever-party-received-them-and-the-gateway-fee-stays-where-it-was.md)

**Last eval verdict:** pass (2026-10-22)

---

## Withdraw

### 05-withdraw-Q1

**Question:** A vendor says their order money is not showing in their withdrawable balance yet. Which orders actually count toward the balance a vendor can withdraw, and does Cash on Delivery change anything?

**Settings assumed:** `dokan_withdraw[withdraw_order_status]` default `['wc-completed' => 'wc-completed']`; `dokan_withdraw[exclude_cod_payment]` default `off`.

**Expected answer:**

It depends on two admin settings under Dokan → Settings → Withdraw: "Order Status for Withdraw" and "Exclude COD Payments".

How the balance is calculated: `Vendor::get_balance()` adds up the earning (debit) rows in the `dokan_vendor_balance` ledger whose status is one of the active withdraw statuses and whose `balance_date` is today or earlier. It then subtracts every credit row (approved withdrawals, refunds and similar) dated today or earlier, whatever its status (lite:includes/Vendor/Vendor.php:873, query at lines 888-901). Each earning row's status follows the order's WooCommerce status, because `Order\Hooks::on_order_status_change` copies the new status onto the `dokan_orders` ledger row (lite:includes/Order/Hooks.php:95, update at about line 175). When an earning is first recorded its status is empty, so it does not count until the order changes status (lite:includes/Order/functions.php:271-282).

**Setting 1: `dokan_withdraw[withdraw_order_status]`.** This is a multicheck with the options Completed (`wc-completed`), Processing (`wc-processing`) and On-hold (`wc-on-hold`) (lite:includes/Utilities/AdminSettings.php:62). The default is only `wc-completed` (lite:includes/Admin/Settings.php:753-762; the code fallback in `dokan_withdraw_get_active_order_status` is also `['wc-completed']`, lite:includes/Withdraw/functions.php:355). `wc-refunded` is always added to the list (lite:includes/Withdraw/functions.php:357), so the original earning on a refunded order still counts and the separate refund credit row cancels it out.

- Default (Completed only): an order's earning becomes withdrawable only when the Suborder or Vendor order is Completed. Processing or On-hold orders show in reports but not in the withdrawable balance.
- Processing ticked as well: the earning becomes withdrawable as soon as the order is Processing, which usually means once payment is captured.
- On-hold ticked as well: on-hold orders count too.
- Pending payment, cancelled and failed orders never count, because those statuses cannot be selected.

**Setting 2: `dokan_withdraw[exclude_cod_payment]`.** This is a switch and the default is `off` (lite:includes/Admin/Settings.php:764-769).

- `off`: COD orders behave like any other order.
- `on`: if an order's payment method is `cod`, `on_order_status_change` returns before it updates the vendor-balance ledger status (lite:includes/Order/Hooks.php:145-171). The earning row never picks up a withdraw-eligible status, so COD earnings never become withdrawable. The refund side follows the same rule: no refund credit is posted to the balance for COD orders (lite:includes/Order/RefundHandler.php:94-132, lite:includes/Order/Hooks.php:298-301). The idea is that the Vendor already collected the cash in person. Add-ons can override the decision through the `dokan_order_should_exclude_from_vendor_balance` filter.

A further timing condition, the withdraw threshold in days, also controls when an earning matures (see ADR 0062).

**Code citations:** lite:includes/Vendor/Vendor.php:873 · lite:includes/Withdraw/functions.php:355 · lite:includes/Utilities/AdminSettings.php:62 · lite:includes/Admin/Settings.php:753 · lite:includes/Admin/Settings.php:764 · lite:includes/Order/Hooks.php:95 · lite:includes/Order/Hooks.php:145 · lite:includes/Order/RefundHandler.php:94 · lite:includes/Order/functions.php:281

**Answering ADR:** [ADR-0063](../0063-the-withdrawable-balance-is-matured-earnings-in-a-withdraw-order-status-minus-every-matured-withdraw-and-refund.md), [ADR-0057](../0057-cash-on-delivery-earnings-stay-out-of-the-withdrawable-balance-only-while-exclude-cod-payments-is-on.md), [ADR-0062](../0062-the-withdraw-threshold-delays-each-earning-by-a-fixed-number-of-days-counted-from-checkout.md)

**Last eval verdict:** pass (2026-10-22)

### 05-withdraw-Q3

**Question:** If we charge a withdrawal fee, who pays it and how much does the vendor actually receive? For example, a vendor with $300 available asks to withdraw $200 by PayPal.

**Settings assumed:** `withdraw_charges[paypal]` fixed = 2, percentage = 3; `withdraw_limit` = 50; Vendor balance 300; `withdraw_order_status` default.

**Expected answer:**

The Vendor pays the fee. It comes out of the payout, and the Vendor's balance is still reduced by the full amount requested.

Settings: `dokan_withdraw[withdraw_charges][<method>]` stores a `fixed` amount and a `percentage` for each withdraw method. Both default to 0.00. Only methods registered with `apply_charge` = true can carry a charge, which covers PayPal and Bank in Lite (lite:includes/Withdraw/functions.php:12-27, 523-560; field at lite:includes/Admin/Settings.php:724-742). Add-ons that register further methods decide for each one whether a charge applies.

Formula, from `Withdraw::calculate_charge` (lite:includes/Withdraw/Withdraw.php:383-401): charge = fixed + (percentage / 100) × requested amount; receivable = amount − charge. When the request is created, the charge, the receivable amount and the charge settings used are saved into the request's details (lite:includes/Withdraw/Withdraw.php:436-450). Validation rejects a request whose receivable amount would be negative (lite:includes/Withdraw/Manager.php:69-80).

**Worked example.** Settings: `withdraw_charges[paypal]` = {fixed: 2, percentage: 3}, `withdraw_limit` = 50 (the default), PayPal email set in the Vendor's payment settings, current balance 300.

1. The Vendor requests 200 by PayPal. Validation (lite:includes/Withdraw/Manager.php:29-89): 200 ≤ 300 balance, 200 ≥ 50 minimum, PayPal is one of the Vendor's active methods, the Vendor is enabled for selling. All checks pass.
2. Charge = 2 + 3% × 200 = 2 + 6 = 8.00. Receivable = 200 − 8 = 192.00.
3. The request is saved as pending. The balance is still 300, because pending requests are not deducted.
4. When the admin approves it, `Hooks::update_vendor_balance` writes a credit row for the full amount of 200, not 192 (lite:includes/Withdraw/Hooks.php:110-160). The new balance is 300 − 200 = 100.
5. The admin pays the Vendor 192 outside Dokan. The 8 difference stays with the marketplace.

Edge case: the minimum withdraw limit is checked against the gross amount. A request for exactly 50 under these settings passes the limit, costs 2 + 1.50 = 3.50 in charges, and pays the Vendor 46.50.

**Code citations:** lite:includes/Withdraw/Withdraw.php:383 · lite:includes/Withdraw/Withdraw.php:436 · lite:includes/Withdraw/Manager.php:29 · lite:includes/Withdraw/Hooks.php:110 · lite:includes/Withdraw/functions.php:523 · lite:includes/Withdraw/functions.php:543 · lite:includes/Admin/Settings.php:724

**Answering ADR:** [ADR-0060](../0060-the-withdraw-charge-is-a-fixed-fee-plus-a-percentage-deducted-from-the-requested-amount.md), [ADR-0055](../0055-a-withdraw-moves-money-only-when-the-admin-approves-it-and-approval-is-final.md)

**Last eval verdict:** pass (2026-10-22)

### 05-withdraw-Q4

**Question:** What limits apply when a vendor asks for a withdrawal? Is there a minimum or maximum, can they have more than one request open, and what blocks a request?

**Settings assumed:** `dokan_withdraw[withdraw_limit]` default `50`; `dokan_withdraw[withdraw_methods]` default `['paypal']`.

**Expected answer:**

**Minimum.** This depends on `dokan_withdraw[withdraw_limit]` ("Minimum Withdraw Limit"). The settings default is `50` (lite:includes/Admin/Settings.php:743-752). If the option was never saved, the code falls back to 0 (lite:includes/Withdraw/Manager.php:487-489).

- Set to X > 0: the request is rejected with "Withdraw amount must be greater than or equal to X" when the amount is below X (lite:includes/Withdraw/Manager.php:52-55).
- Blank or 0: there is no minimum.

Negative values are refused when settings are saved (lite:includes/Admin/Settings.php:1116-1130).

**Maximum.** There is no separate maximum-withdraw setting. The only ceiling is the Vendor's current withdrawable balance. Amount and balance are compared in whole cents, so withdrawing the exact balance works (lite:includes/Withdraw/Manager.php:44-50).

**One open request at a time.** A Vendor who already has a pending request cannot create another, whether through AJAX or REST (`has_pending_request`, lite:includes/Withdraw/Manager.php:223; lite:includes/Withdraw/Hooks.php:173-175; lite:includes/REST/WithdrawController.php:470-472). A pending request does not lower the displayed balance. The money only leaves the balance when the request is approved (see 05-withdraw-Q5).

**Other checks** in `Manager::is_valid_approval_request` (lite:includes/Withdraw/Manager.php:29-89):

- The amount must not be empty, and negative amounts are refused (lite:includes/Withdraw/Hooks.php:194-196).
- The method must be one the Vendor has set up in payment settings: a PayPal email, a bank account number, or a Skrill email, plus any methods add-ons supply through `dokan_get_seller_active_withdraw_methods` (lite:includes/Withdraw/functions.php:67-86). The Vendor-facing list is also limited to the methods the admin enabled in `dokan_withdraw[withdraw_methods]`, which defaults to PayPal only (lite:includes/Admin/Settings.php:715-722; lite:includes/Withdraw/functions.php:52).
- The Vendor must be enabled for selling (`dokan_is_seller_enabled`).
- The fee must not exceed the amount (see 05-withdraw-Q3).
- Add-ons can add rules through the `dokan_withdraw_is_valid_request` filter.

**Reverse withdrawal** (see Lite ADR 0014): if a Vendor does not pay their reverse-withdrawal balance in time, the admin-chosen failure actions can include "Hide Withdraw Menu", which removes the Withdraw menu from that Vendor's dashboard (lite:includes/ReverseWithdrawal/Hooks.php:104-114; options at lite:includes/ReverseWithdrawal/SettingsHelper.php:190-197). The failure action "Make Vendor Status Inactive" disables selling, and that makes the `dokan_is_seller_enabled` check fail for any new request.

**Code citations:** lite:includes/Withdraw/Manager.php:29 · lite:includes/Withdraw/Manager.php:223 · lite:includes/Withdraw/Manager.php:487 · lite:includes/Admin/Settings.php:743 · lite:includes/Admin/Settings.php:1116 · lite:includes/Withdraw/Hooks.php:165 · lite:includes/REST/WithdrawController.php:445 · lite:includes/Withdraw/functions.php:67 · lite:includes/ReverseWithdrawal/Hooks.php:104 · lite:includes/ReverseWithdrawal/SettingsHelper.php:190

**Answering ADR:** [ADR-0056](../0056-a-withdraw-must-be-at-least-the-minimum-withdraw-limit-and-at-most-the-balance-and-there-is-no-maximum-limit.md), [ADR-0053](../0053-a-vendor-may-have-only-one-pending-withdraw-request-and-a-pending-request-does-not-hold-the-balance.md), [ADR-0054](../0054-a-withdraw-can-use-only-a-method-the-admin-enabled-and-the-vendor-has-filled-in.md), [ADR-0059](../0059-overdue-reverse-withdrawal-debt-can-block-withdraws-but-is-never-deducted-from-the-balance.md)

**Last eval verdict:** pass (2026-10-22)

### 05-withdraw-Q5

**Question:** What happens to a withdrawal request after a vendor submits it? Who approves it, what statuses can it have, and can it be cancelled or reversed?

**Settings assumed:** None.

**Expected answer:**

**Statuses.** A request is stored in the `dokan_withdraw` table with a numeric status: 0 = pending, 1 = approved (`completed` maps to the same code), 2 = cancelled (`Manager::get_status_code` / `get_status_name`, lite:includes/Withdraw/Manager.php:289-350). Every request starts as pending, whether the Vendor created it by AJAX or REST, or an add-on created it (lite:includes/Withdraw/Hooks.php:214-222; lite:includes/REST/WithdrawController.php:488-495).

**Approval.** Only an administrator or shop manager (`manage_woocommerce`) can approve, either one request at a time with `PUT /withdraw/{id}` or in bulk with `POST /withdraw/batch` (lite:includes/REST/WithdrawController.php:539-606, 689-715; batch permission at line 266). Before approving, the request is checked again with `is_valid_approval_request`. The Vendor must still have enough balance, the amount must meet the minimum, the method must still be active, and the Vendor must still be enabled. A request that is already approved cannot be approved again (lite:includes/Withdraw/Manager.php:65-67). Saving the new status fires `dokan_withdraw_request_approved` (lite:includes/Withdraw/Withdraw.php:528). Lite then writes a single ledger credit row for the full requested amount (`trn_type` `dokan_withdraw`, status `approved`), which lowers the Vendor's balance. If the balance has dropped below the amount by then, no credit row is written, and the code checks for an existing row so the same request is never credited twice (lite:includes/Withdraw/Hooks.php:17, 110-160). The Vendor receives the "Withdraw Approved" email (lite:includes/Emails/WithdrawApproved.php:43). Approval does not send money. The admin makes the payment outside Dokan, unless a payment-gateway add-on pays Vendors automatically at order time.

**Cancellation.** Only pending requests can be cancelled. `is_valid_cancellation_request` looks up the request with status = pending and refuses anything else (lite:includes/Withdraw/Manager.php:101-122). A Vendor may cancel their own pending request, and the controller forces the status to cancelled because Vendors cannot do anything else to a request. An admin or shop manager can cancel any pending request, one at a time or in bulk (lite:includes/REST/WithdrawController.php:551-561, 718-735). Cancelling never touches the balance, because a pending request was never deducted. The Vendor receives the "Withdraw Cancelled" email (lite:includes/Emails/WithdrawCancelled.php:44).

**Reversing an approved request.** An approved request cannot be cancelled. Admins (`manage_woocommerce`) can delete any request (lite:includes/REST/WithdrawController.php:244, 625-646). Deleting only removes the request row and clears the cache (lite:includes/Withdraw/Withdraw.php:544-565; lite:includes/Withdraw/WithdrawCache.php:27). The "Approve withdraw request" credit in the vendor-balance ledger is left in place, so deleting an approved request does not give the money back to the Vendor's balance.

**Code citations:** lite:includes/Withdraw/Manager.php:289 · lite:includes/Withdraw/Manager.php:101 · lite:includes/Withdraw/Manager.php:65 · lite:includes/Withdraw/Hooks.php:110 · lite:includes/Withdraw/Withdraw.php:493 · lite:includes/REST/WithdrawController.php:539 · lite:includes/REST/WithdrawController.php:689 · lite:includes/REST/WithdrawController.php:625 · lite:includes/Emails/WithdrawApproved.php:43 · lite:includes/Emails/WithdrawCancelled.php:44

**Answering ADR:** [ADR-0055](../0055-a-withdraw-moves-money-only-when-the-admin-approves-it-and-approval-is-final.md), [ADR-0058](../0058-only-a-pending-withdraw-can-be-cancelled-and-cancelling-never-changes-the-balance.md)

**Last eval verdict:** pass (2026-10-22)

---

## Vendor lifecycle

### 06-vendor-lifecycle-Q1

**Question:** When someone signs up as a vendor, can they start selling straight away, or does an admin have to approve them first? Is it the same for a brand-new sign-up and for an existing customer who clicks "Become a Vendor"?

**Settings assumed:** Both values of `dokan_selling[new_seller_enable_selling]`: `automatically` (the default, which is also what the legacy `on` and an unsaved option mean) and `manually` (which is also what the legacy `off` means). No extension hooks `dokan_can_enable_selling` or `dokan_new_seller_enable_selling_status`.

**Expected answer:**

It depends on one setting: `dokan_selling[new_seller_enable_selling]` (labelled "Enable Selling" for new Vendors). Dokan reads it through `AdminSettings::get_new_seller_enable_selling_status()` (lite:includes/Utilities/AdminSettings.php:17). If the option has never been saved it falls back to the legacy value `on`. The legacy value `on` is mapped to `automatically` and `off` is mapped to `manually` (lite:includes/Utilities/AdminSettings.php:19-27), so the effective default is `automatically`. The result passes through the filter `dokan_new_seller_enable_selling_status`, and the list of choices passes through `dokan_new_seller_enable_selling_statuses`, so add-ons can add more choices (lite:includes/Utilities/AdminSettings.php:29, 39-45).

What the setting does:

- `automatically` (the default): the new Vendor is activated. `Vendor::make_active()` writes the user meta `dokan_enable_selling` = `yes` and fires `dokan_vendor_enabled` (lite:includes/Vendor/Vendor.php:985-1025).
- `manually`: the Vendor is created without selling enabled. `dokan_enable_selling` stays absent or is set to `no`, and an admin has to switch selling on later, either in WP Admin → Users → Edit User (lite:includes/Admin/UserProfile.php:571-579) or through the Vendor REST/admin update (lite:includes/Vendor/Manager.php:382-388).

The same setting applies on every registration path:

1. **The WooCommerce / Dokan registration form with the vendor role.** WordPress fires `user_register`, and Dokan's `dokan_admin_user_register()` activates or deactivates the Vendor according to the setting (lite:includes/functions.php:1496-1516). The form handler only stores the store profile and fires `dokan_new_seller_created` (lite:includes/Registration.php:229-285). The "publish products directly" (trusted) flag is not set on this path, so the Vendor starts untrusted.
2. **An existing customer using "Become a Vendor" (My Account).** The handler `BecomeAVendor::become_a_seller_form_handler()` (lite:includes/Frontend/MyAccount/BecomeAVendor.php:73-130) calls `dokan_user_update_to_seller()`. That function swaps the role to seller, then calls `make_active()` for `automatically` or `make_inactive()` for `manually`, and always sets `dokan_publishing` = `no` (untrusted) (lite:includes/functions.php:4451-4457). `user_register` does not fire here, because the user already exists.
3. **An admin creates the Vendor (admin UI or REST).** `wp_insert_user` fires `user_register`, so the setting applies first. After that, if the admin sent `enabled=true`, `make_active()` runs, and `trusted=true` sets `dokan_publishing` = `yes` (lite:includes/Vendor/Manager.php:272-283). Sending `enabled=false` at creation does not switch off a Vendor that the `automatically` setting already activated.

Even with `automatically`, an extension can block activation through the `dokan_can_enable_selling` filter. When that happens, `make_active()` returns without writing the meta (lite:includes/Vendor/Vendor.php:1004-1015).

What "not enabled" means in practice for a Vendor:

- the dashboard shows a "not enabled" warning (lite:includes/Dashboard/Templates/Dashboard.php:50);
- the Vendor cannot add products (lite:includes/Assets.php:195, lite:includes/REST/ProductController.php:383);
- withdraw requests are refused (lite:includes/Withdraw/Manager.php:61);
- the store is left out of the default "approved" store listing, which requires `dokan_enable_selling` = `yes` (lite:includes/Vendor/Manager.php:66, 76-83).

**Code citations:** lite:includes/Utilities/AdminSettings.php:17 · lite:includes/Utilities/AdminSettings.php:39 · lite:includes/functions.php:1496 · lite:includes/functions.php:1516 · lite:includes/functions.php:4451 · lite:includes/Frontend/MyAccount/BecomeAVendor.php:73 · lite:includes/Registration.php:229 · lite:includes/Vendor/Vendor.php:985 · lite:includes/Vendor/Vendor.php:1004 · lite:includes/Vendor/Vendor.php:1034 · lite:includes/Vendor/Manager.php:272 · lite:includes/Vendor/Manager.php:382 · lite:includes/Admin/UserProfile.php:571 · lite:includes/Dashboard/Templates/Dashboard.php:50 · lite:includes/Withdraw/Manager.php:61 · lite:includes/REST/ProductController.php:383 · lite:includes/Vendor/Manager.php:76

**Answering ADR:** [ADR-0065](../0065-a-new-vendors-selling-is-enabled-automatically-or-left-pending-according-to-the-enable-selling-setting.md), [ADR-0064](../0064-a-customer-becomes-a-vendor-through-become-a-vendor-and-loses-their-previous-roles.md), [ADR-0066](../0066-a-vendor-without-selling-enabled-keeps-the-dashboard-but-cannot-add-products-or-request-a-withdraw.md), [ADR-0070](../0070-enabling-a-vendors-selling-can-be-vetoed-by-an-add-on-but-disabling-cannot.md)

**Last eval verdict:** pass (2026-10-22)

### 06-vendor-lifecycle-Q3

**Question:** If we disable a vendor's selling, what happens to their products? Say the vendor has 230 published products, 5 waiting for review and 3 drafts, and we re-enable them a week later. Which products come back online?

**Settings assumed:** `dokan_product_status_changer_per_page` left at its default of 100; no extension hooks `dokan_can_enable_selling`; no manual status changes while the Vendor is disabled; the Action Scheduler queue runs.

**Expected answer:**

Disabling selling (Edit User checkbox, Vendor REST update, or `dokan()->vendor->deactivate()`) calls `Vendor::make_inactive()`. That method sets `dokan_enable_selling` = `no`, queues a background status change with the task type `change_status`, and fires `dokan_vendor_disabled` (lite:includes/Vendor/Vendor.php:1034-1043, lite:includes/Vendor/Manager.php:622-630).

**Which products are picked.** `ChangeProductStatus::get_products()` selects only the Vendor's products with status `publish` for the `change_status` task, and only products with status `pending` for the `revert` task. Every WooCommerce product type is included except `product_pack` (lite:includes/Vendor/ChangeProductStatus.php:25-41).

**How the work is queued.** `add_to_queue()` reads the product IDs straight away, 100 per page by default (filter `dokan_product_status_changer_per_page`), and schedules one Action Scheduler job, `dokan_product_status_changer_async`, for each page (lite:includes/Abstracts/ProductStatusChanger.php:42, 180-234).

**What each job does to a product.** It sets the status to `pending` and stores the old status in the product meta `_dokan_previous_status` (lite:includes/Abstracts/ProductStatusChanger.php:288-317).

**Worked example** (default page size of 100):

- **Disable.** The query matches the 230 published products only, so 3 jobs are queued (100 + 100 + 30). When they run, all 230 products become `pending` with `_dokan_previous_status` = `publish`. The 5 products that were already pending and the 3 drafts are not selected, so they are left alone and get no meta. The storefront now shows none of the Vendor's products, and the shop has 235 pending plus 3 draft.
- **While disabled.** The Vendor sees the "not enabled" notice (lite:includes/Dashboard/Templates/Dashboard.php:50), cannot create products (lite:includes/REST/ProductController.php:383, lite:includes/Assets.php:195) and cannot request withdrawals (lite:includes/Withdraw/Manager.php:61). The store also drops out of the default "approved" store list (lite:includes/Vendor/Manager.php:76-83).
- **Re-enable.** `make_active()` sets `dokan_enable_selling` = `yes`, queues the `revert` task and fires `dokan_vendor_enabled` (lite:includes/Vendor/Vendor.php:1017-1022). The revert query matches all 235 pending products, so 3 jobs are queued (100 + 100 + 35). For each product, `revert()` restores `_dokan_previous_status` and deletes the meta. When a product has no stored previous status, `revert()` returns without changing it (lite:includes/Abstracts/ProductStatusChanger.php:328-355).
- **Result:** the 230 products come back as `publish`. The 5 products that were pending before the Vendor was disabled stay `pending`, so an admin still has to review them. The 3 drafts stay drafts.

Edge cases:

- If an extension blocks re-activation through `dokan_can_enable_selling`, the revert job is never queued and the 230 products stay pending (lite:includes/Vendor/Vendor.php:1004-1015).
- If an admin changes one of those products by hand while the Vendor is disabled (for example publishes it), the product is no longer `pending` when the Vendor is re-enabled, so the revert query does not pick it up.
- The status change runs in the background, so the products only move once the Action Scheduler queue has run.
- Within `add_to_queue()`, the branch that schedules `dokan_clear_product_cache_async` sits behind a while condition that already stops on an empty page, so in practice that branch is not reached (lite:includes/Abstracts/ProductStatusChanger.php:210-219).

**Code citations:** lite:includes/Vendor/Vendor.php:1034 · lite:includes/Vendor/Vendor.php:1055 · lite:includes/Vendor/Vendor.php:1017 · lite:includes/Vendor/Vendor.php:1004 · lite:includes/Vendor/Manager.php:622 · lite:includes/Vendor/ChangeProductStatus.php:25 · lite:includes/Abstracts/ProductStatusChanger.php:206 · lite:includes/Abstracts/ProductStatusChanger.php:288 · lite:includes/Abstracts/ProductStatusChanger.php:328 · lite:includes/Dashboard/Templates/Dashboard.php:50 · lite:includes/Withdraw/Manager.php:61 · lite:includes/Vendor/Manager.php:76

**Answering ADR:** [ADR-0069](../0069-disabling-a-vendor-puts-their-published-products-into-pending-review-and-re-enabling-restores-only-those.md), [ADR-0066](../0066-a-vendor-without-selling-enabled-keeps-the-dashboard-but-cannot-add-products-or-request-a-withdraw.md)

**Last eval verdict:** pass (2026-10-22)

---

## Products

### 07-products-Q3

**Question:** When a vendor picks a sub-category for a product, which categories does the product actually end up in? Can a vendor pick more than one category?

**Settings assumed:** `dokan_any_category_selection` = `off` (default) versus `on`; `product_category_style` = `single` (the default, and the only value on Lite alone) versus `multiple` (only when an add-on provides the setting).

**Expected answer:**

Two settings in the `dokan_selling` option control this.

**A) `dokan_selling[dokan_any_category_selection]`** ("Select any category", default `off`). `Helper::set_object_terms_from_chosen_categories()` always stores what the Vendor picked in post meta `chosen_product_cat`. The `product_cat` terms it then assigns depend on this setting:

- `off` (default): for each chosen category, it adds every ancestor from `get_ancestors(..., 'product_cat')` plus the category itself, removes duplicates (`array_unique`), and assigns the result.
- `on`: only the chosen categories are assigned. No ancestors are added.

Worked example. The tree is Men (id 10) > Clothing (id 20) > T-Shirts (id 30). The Vendor picks T-Shirts.

- Setting `off`: `get_ancestors(30)` returns [20, 10], merged with [30], so the product gets 3 categories: {20, 10, 30}. `chosen_product_cat` = [30].
- Setting `on`: the product gets 1 category: {30}. `chosen_product_cat` = [30].

**B) `dokan_selling[product_category_style]`**, read by `Helper::product_category_selection_is_single()`. It defaults to `single`. Lite registers no admin field for it, so on Lite alone it is always `single`; an add-on can provide the Single/Multiple choice.

- `single`: the classic edit form keeps only the first chosen category (`reset()`). REST product create rejects more than one category with error `dokan_product_category_no_more_one`. Every product must have a category; REST returns `dokan_product_category` when none is given.
- `multiple`: all chosen categories are kept. Example with setting A `off`: the Vendor picks T-Shirts (30) and Shoes (40, child of Men 10). Merging [20, 10, 30] and [10, 40] gives 4 unique categories: {10, 20, 30, 40}. With setting A `on`, the product gets 2 categories: {30, 40}.

**Code citations:** lite:includes/ProductCategory/Helper.php:23 · lite:includes/ProductCategory/Helper.php:34 · lite:includes/ProductCategory/Helper.php:174 · lite:includes/ProductCategory/Helper.php:187 · lite:includes/ProductCategory/Helper.php:192 · lite:includes/ProductCategory/Helper.php:197 · lite:includes/ProductCategory/Helper.php:204 · lite:includes/Admin/Settings.php:686 · lite:includes/Dashboard/Templates/Products.php:551 · lite:includes/REST/ProductController.php:396 · lite:includes/Product/functions.php:37

**Answering ADR:** [ADR-0082](../0082-choosing-a-subcategory-also-assigns-its-parent-categories-unless-any-category-selection-is-on.md), [ADR-0079](../0079-a-vendor-product-needs-a-category-and-single-category-mode-keeps-only-one.md)

**Last eval verdict:** pass (2026-10-22)

---

## Coupons

### 08-coupons-Q1

**Question:** A customer has products from two different vendors in the cart. Can they still use a coupon, or does it fail because the cart is mixed?

**Settings assumed:** No global Dokan setting is involved; the behaviour depends only on the coupon's `discount_type`.

**Expected answer:**

It depends on the coupon's discount type, which is a per-coupon setting (the WooCommerce `discount_type` field). Dokan has no global marketplace option that changes this rule.

**Branch 1: `fixed_cart`** ("Fixed cart discount"). If the cart holds products from more than one Vendor, the coupon is rejected with "This coupon is invalid for multiple vendors." Dokan Lite hooks `woocommerce_coupon_is_valid` (lite:includes/Order/Hooks.php:52). `Hooks::ensure_coupon_is_valid` resolves the Vendor of every product line in the cart or order through `dokan_get_vendor_by_product( $id, true )`, removes duplicates, and throws when the type is `fixed_cart` and more than one distinct Vendor is found (lite:includes/Order/Hooks.php:465-480). The count covers every line in the cart, not only the lines the coupon would discount. A fixed cart coupon therefore fails as soon as any other Vendor's product (or a product sold by the admin store) is added. The check also runs when a coupon is applied to an existing order, because it reads `WC_Discounts::get_items()`.

**Branch 2: `percent`** ("Percentage discount") **or `fixed_product`** ("Fixed product discount"). These types are allowed in a mixed cart. WooCommerce works out the discount line by line (wc:includes/class-wc-discounts.php:362-421 for percent and :428 for fixed product), so each discount belongs to a single product and therefore to a single Vendor. Which lines actually get the discount follows the coupon's own WooCommerce restrictions (products, categories, exclusions, minimum spend and so on). In Lite, the only Dokan-specific check is the fixed cart rule above. After Lite's own check, the result goes through the `dokan_coupon_is_valid` filter (lite:includes/Order/Hooks.php:491), which add-ons can use to add further rules.

Note: the docblock above `ensure_coupon_is_valid` says the method checks that an admin product is in the cart (lite:includes/Order/Hooks.php:446-455). The code does not do this. The only rule it enforces is the fixed cart / multiple Vendor rule.

**Code citations:** lite:includes/Order/Hooks.php:52 · lite:includes/Order/Hooks.php:465-480 · lite:includes/Order/Hooks.php:491 · lite:includes/Order/Hooks.php:446-455 · wc:includes/class-wc-discounts.php:362-421 · wc:includes/class-wc-discounts.php:428

**Answering ADR:** [ADR-0088](../0088-a-fixed-cart-coupon-can-be-used-only-when-every-product-in-the-cart-comes-from-one-vendor.md)

**Last eval verdict:** pass (2026-10-22)

### 08-coupons-Q3

**Question:** A customer uses a 10% coupon on an order with $100 from Vendor A and $50 from Vendor B. How much discount ends up on each vendor's order?

**Settings assumed:** Coupon `SAVE10`, type `percent`, amount 10, no product restrictions; one coupon only; no tax and no shipping; `woocommerce_calc_discounts_sequentially` = `no` (default); no `limit_usage_to_x_items`. Vendor A: 1 × $100. Vendor B: 2 × $25.

**Expected answer:**

Each Vendor's Suborder gets exactly the discount WooCommerce calculated for that Vendor's own product lines. Vendor A gets $10 and Vendor B gets $5. The discount is not spread evenly or pro-rated afresh across Suborders.

The code path:

1. **Cart.** WooCommerce works out a percentage discount per line: floor(price × 10%) in cents (wc:includes/class-wc-discounts.php:362-410). Vendor A has one product at $100, so the discount is $10. Vendor B has two products at $25 each (line price $50), so the discount is $5. The total is $15. WooCommerce's remainder check also gives round(150 × 10%) = 15, so there is no leftover to redistribute (wc:includes/class-wc-discounts.php:413-418). Dokan Lite's `Vendor\Coupon::intercept_wc_coupon` sits on `woocommerce_coupon_get_apply_quantity` (lite:includes/Vendor/Coupon.php:21, 114-129). It re-applies the coupon on a clone and reads `WC_Discounts::get_discounts()`, which returns currency units rather than cents (wc:includes/class-wc-discounts.php:180-183). It stores the result on each cart line under `_dokan_coupon_info[SAVE10]`. Line A gets discount 10, per_qty_amount 10 and quantity 1. Line B gets discount 5, per_qty_amount 2.5 and quantity 2. The coupon's commission meta is stored with them (lite:includes/Vendor/Coupon.php:161-186).
2. **Checkout.** `add_coupon_info_to_order_item` copies `_dokan_coupon_info` onto each parent-order line item (lite:includes/Vendor/Coupon.php:19, 292-317). The parent order has subtotal 150, discount 15 and total 135. Its line totals are 90 for A and 45 for B.
3. **Splitting.** `Order\Manager::create_sub_order` builds one Suborder per Vendor (lite:includes/Order/Manager.php:581-662). `create_line_items` copies each line's subtotal and its already-discounted total (`set_total( $item->get_total() )`), together with all item meta, including `_dokan_coupon_info` (lite:includes/Order/Manager.php:690-697). `create_coupons` then adds up `_dokan_coupon_info[code]['discount']` across the Suborder's lines, for codes that are present on the parent. It adds one coupon line item per code with that amount and `discount_tax` hard-coded to 0 (lite:includes/Order/Manager.php:821-879, lines 848-877).
4. **Totals.** The Suborder's `calculate_totals()` does not re-apply the coupon. It sets discount_total = line subtotal − line total (wc:includes/abstracts/abstract-wc-order.php:2545).

Result:

- Suborder A: subtotal 100, coupon line SAVE10 = 10, discount_total 10, total 90.
- Suborder B: subtotal 50, coupon line SAVE10 = 5, discount_total 5, total 45.

The Suborders add up to 135, which matches the parent.

If a Vendor's lines received no discount (for example, they are excluded by the coupon's product restrictions), that Suborder gets no coupon line at all. A fixed cart coupon could not have been used here, because the cart has two Vendors (08-coupons-Q1).

Edge cases:

- With several coupons stacked on one line, `add_coupon_info_to_order_item` caps the combined recorded discount at product price × quantity. Coupons processed after the cap is reached are recorded as 0 for that line (lite:includes/Vendor/Coupon.php:298-313).
- If an admin later applies a coupon to a parent order that has Suborders, it is also applied to every Suborder that lacks it (lite:includes/Vendor/Coupon.php:239-267).
- Removing a coupon line removes it from the child Suborders, or, when it is removed from a Suborder, from the matching parent lines' meta (lite:includes/Vendor/Coupon.php:23, 41-92, 274-283).

How the $10 and $5 are then charged in commission (the Vendor bears it, the admin bears it, or it is shared) is the rule in ADR 0024.

**Code citations:** wc:includes/class-wc-discounts.php:362-418 · wc:includes/class-wc-discounts.php:180-183 · lite:includes/Vendor/Coupon.php:114-129 · lite:includes/Vendor/Coupon.php:161-186 · lite:includes/Vendor/Coupon.php:292-317 · lite:includes/Order/Manager.php:581-662 · lite:includes/Order/Manager.php:690-697 · lite:includes/Order/Manager.php:821-879 · wc:includes/abstracts/abstract-wc-order.php:2545 · lite:includes/Vendor/Coupon.php:239-283

**Answering ADR:** [ADR-0086](../0086-a-coupon-discount-is-split-across-suborders-exactly-as-woocommerce-allocated-it-to-each-line-item.md), [ADR-0085](../0085-a-coupon-added-to-or-removed-from-a-parent-order-is-mirrored-onto-its-suborders.md), [ADR-0024](../0024-coupon-discounts-reduce-commission-according-to-who-funds-the-coupon.md)

**Last eval verdict:** pass (2026-10-22)

### 08-coupons-Q4

**Question:** A coupon has a usage limit. If a customer buys from three vendors in one checkout with that coupon, does that use up one use or several?

**Settings assumed:** Coupon with `usage_limit` set (WooCommerce coupon field); Suborder status whitelist unfiltered; parent order moves from pending to processing on payment.

**Expected answer:**

Dokan Lite adds no coupon-usage logic of its own. Validation and counting are WooCommerce's, and they run per WooCommerce order. Each Dokan Suborder is a full WooCommerce order.

**Validation happens once, against the whole cart.** When the coupon is applied, WooCommerce checks `usage_count < usage_limit` (wc:includes/class-wc-discounts.php:628) and the per-customer limit (:677) a single time for the cart. A coupon with one use left is therefore accepted for a cart from any number of Vendors.

**Counting happens per order.** WooCommerce records a use for every coupon code on an order when that order moves into pending, on-hold, processing or completed. It undoes the use on cancelled, failed or trash. A per-order flag (`_recorded_coupon_usage_counts`) ensures each order is counted only once (wc:includes/wc-order-functions.php:1020-1086). `increase_usage_count( $used_by, $order )` increments the global count and also the per-user record (:1060-1073).

**Dokan copies the coupon onto Suborders.** `Order\Manager::create_coupons` adds a coupon line item with the same code to every Suborder whose lines carry a share of that coupon's discount (lite:includes/Order/Manager.php:821-879). At creation the Suborder's status is set from empty to the parent's status. WooCommerce fires no status-transition hook for a change from an empty status (wc:includes/class-wc-order.php:319-339). When the parent later changes status, for example pending to processing after payment, `Order\Hooks::on_order_status_change` calls `update_status()` on each Suborder (lite:includes/Order/Hooks.php:124-138). The Suborder whitelist allows any change from pending (:205-213). That is a real transition, so `woocommerce_order_status_processing` fires for the Suborder (wc:includes/class-wc-order.php:457) and `wc_update_coupon_usage_counts` runs for it.

Following the code, one checkout therefore records 1 use for the parent plus 1 for each Suborder that received part of the discount. With three Vendors who all received a discount, that is 4 uses, and the per-customer count rises by the same amount. Suborders of Vendors whose products got no discount carry no coupon line and add nothing. Example: a coupon has `usage_limit` 5 and `usage_count` 2. It is accepted for the three-vendor cart, because 2 < 5. After payment the count is 2 + 1 + 3 = 6. This is the code-path result, and no Dokan code excludes Suborders from WooCommerce's counter. Confirm it on a staging order before quoting it to a merchant.

No global Dokan setting changes this. A coupon restricted to one Vendor's products only discounts that Vendor's lines, so it normally lands on the parent and one Suborder, which records 2 uses for that checkout.

**Code citations:** wc:includes/class-wc-discounts.php:628 · wc:includes/class-wc-discounts.php:677 · wc:includes/wc-order-functions.php:1020-1086 · lite:includes/Order/Manager.php:821-879 · wc:includes/class-wc-order.php:319-339 · wc:includes/class-wc-order.php:457 · lite:includes/Order/Hooks.php:124-138 · lite:includes/Order/Hooks.php:205-213

**Answering ADR:** [ADR-0087](../0087-a-coupon-used-on-a-multi-vendor-order-counts-one-use-for-the-order-and-one-for-each-suborder.md)

**Last eval verdict:** pass (2026-10-22)

---

## Shipping

### 09-shipping-Q1

**Question:** A customer buys from two vendors in one checkout on a Dokan Lite site (no Pro). The admin has a single WooCommerce Flat rate method. How much shipping does the customer pay, and why is it different from a normal WooCommerce store?

**Settings assumed:** No Dokan add-on has taken over the shipping split; admin zone Flat rate cost `5 + 2 * [qty]`; no shipping classes; no coupons.

**Expected answer:**

On a Lite-only site Dokan replaces WooCommerce's single cart package with one shipping package per Vendor. It does this through the `woocommerce_cart_shipping_packages` filter, and only when no add-on has announced itself through `dokan_is_pro_exists` (lite:includes/Shipping/Hooks.php:23-28). `Hooks::split_shipping_packages` (lite:includes/Shipping/Hooks.php:42-77) loops over the cart, skips virtual items (line 48), groups the rest by the product's `post_author` (the Vendor, line 51), and builds one package per Vendor with that Vendor's items, `contents_cost` = the sum of their `line_total` (after discount), the cart coupons, `seller_id` and the customer's destination. The result can be changed through the `dokan_cart_shipping_packages` filter (line 76). WooCommerce then runs every method in the matching admin zone once per package, so a Flat rate is charged once for each Vendor package. Lite has no Vendor-level shipping methods; the admin's WooCommerce zone methods apply to every Vendor's package. Each package is labelled "Shipping: <store name>" through `Hooks::change_shipping_pack_name`, which also exposes the `dokan_shipping_package_name` filter (lite:includes/Shipping/Hooks.php:106-121).

**Worked example.** One admin zone matches the customer, with Flat rate cost = `5 + 2 * [qty]`; no shipping classes; no coupons. Cart: Vendor A, 1 × 50.00 (physical); Vendor B, 2 × 20.00 (physical); Vendor B also adds 1 virtual e-book.

- Package A: qty 1, so the Flat rate evaluates to 5 + 2 × 1 = 7.00 (`WC_Shipping_Flat_Rate::calculate_shipping` evaluates the cost with qty = package item quantity and cost = package `contents_cost`, wc:includes/shipping/flat-rate/class-wc-shipping-flat-rate.php:163-184).
- Package B: the e-book is left out because it is virtual (lite:includes/Shipping/Hooks.php:48), so qty is 2 and the rate is 5 + 2 × 2 = 9.00.
- The customer pays 7.00 + 9.00 = **16.00** in shipping. On stock WooCommerce the cart would be a single package with qty 3, giving 5 + 2 × 3 = 11.00.

With a plain fixed cost of 10, the customer would pay 10 per Vendor, so 20.00 for two Vendors.

What changes this: an add-on that announces itself through `dokan_is_pro_exists` stops Lite from registering these hooks (lite:includes/Shipping/Hooks.php:23) and is expected to provide its own split.

**Code citations:** lite:includes/Shipping/Hooks.php:23 · lite:includes/Shipping/Hooks.php:42 · lite:includes/Shipping/Hooks.php:48 · lite:includes/Shipping/Hooks.php:76 · lite:includes/Shipping/Hooks.php:106 · wc:includes/shipping/flat-rate/class-wc-shipping-flat-rate.php:163

**Answering ADR:** [ADR-0093](../0093-the-cart-is-split-into-one-shipping-package-per-vendor-and-virtual-items-get-no-package.md), [ADR-0091](../0091-in-dokan-lite-every-vendor-package-is-charged-the-stores-own-woocommerce-shipping-rates-separately.md)

**Last eval verdict:** pass (2026-10-22)

### 09-shipping-Q4

**Question:** After a multi-vendor order is placed, where does each vendor's shipping charge end up? Does the vendor's suborder show only their own shipping?

**Settings assumed:** Multi-vendor order (2 Vendors); same cart as 09-shipping-Q1.

**Expected answer:**

Yes. Every shipping line on the parent order is tagged with the Vendor whose package it came from, and each Suborder receives only its own Vendor's lines.

1. **Tagging at checkout.** When WooCommerce creates the order's shipping items, Dokan hooks `woocommerce_checkout_create_order_shipping_item` and stores the package's `seller_id` as the `seller_id` item meta (`Hooks::add_shipping_pack_meta`, lite:includes/Shipping/Hooks.php:26, 91-93). Because there is one package per Vendor (see 09-shipping-Q1), the parent order has one shipping line per Vendor, each labelled "Shipping: <store name>" (lite:includes/Shipping/Hooks.php:106-121).
2. **Splitting.** `Order\Manager::maybe_split_orders` creates Suborders only when the order has more than one Vendor. With a single Vendor, no Suborder is made: the order is stamped with `_dokan_vendor_id` and keeps its own shipping line (lite:includes/Order/Manager.php:924-945). For each Suborder, `Manager::create_shipping` (lite:includes/Order/Manager.php:757-811) reads the parent's shipping items and keeps those whose `seller_id` meta equals the Suborder's Vendor (lines 766-775). Add-ons can change this through the `dokan_shipping_methods` filter (line 788; the old `dokan_shipping_method` filter is deprecated since 3.7.19). It then clones each matching line onto the Suborder (lines 798-808) and sets the Suborder's shipping total to the sum of those lines (line 809). If no line matches, for example because the Vendor's items were all virtual, the Suborder gets no shipping (lines 790-795). The shipping tax total for the Vendor's order is summed from those same lines (lite:includes/Order/Manager.php:718-741).

Example, continuing 09-shipping-Q1: the parent order carries "Shipping: Store A" 7.00 (`seller_id` = A) and "Shipping: Store B" 9.00 (`seller_id` = B), for a parent shipping total of 16.00. Suborder A gets one 7.00 line and a `shipping_total` of 7.00; Suborder B gets one 9.00 line and a `shipping_total` of 9.00. The parent order keeps both lines; parent orders are not the place where Vendor shipping is tracked.

There are no admin settings for this placement; it always follows the `seller_id` tag. Who earns the shipping money (the Vendor or the admin) is a separate rule (see ADR 0034).

**Code citations:** lite:includes/Shipping/Hooks.php:26 · lite:includes/Shipping/Hooks.php:91 · lite:includes/Order/Manager.php:932 · lite:includes/Order/Manager.php:757 · lite:includes/Order/Manager.php:768 · lite:includes/Order/Manager.php:788 · lite:includes/Order/Manager.php:809 · lite:includes/Order/Manager.php:718

**Answering ADR:** [ADR-0090](../0090-each-shipping-line-belongs-to-one-vendor-and-a-suborder-receives-only-its-own-vendors-shipping-lines.md)

**Last eval verdict:** pass (2026-10-22)

---

## Reports

### 10-reports-analytics-Q1

**Question:** Which orders actually count in a vendor's analytics and in the marketplace analytics? Do pending, failed or cancelled orders show up, and could a multi-vendor order be counted twice?

**Settings assumed:** `woocommerce_excluded_report_order_statuses` at its WooCommerce default (pending, failed, cancelled) unless a branch says otherwise.

**Expected answer:**

It depends on WooCommerce's "Excluded report order statuses" setting. Dokan does not keep its own status list for the modern analytics; it reuses WooCommerce's.

The setting is `woocommerce_excluded_report_order_statuses` (WooCommerce → Analytics → Settings). By default it excludes pending, failed and cancelled. `auto-draft` and `trash` are always excluded on top of whatever is saved (wc:src/Admin/API/Reports/DataStore.php:845-866; the defaults appear in wc:src/Internal/Admin/Settings.php:448-460). Dokan's own SQL helpers read the same option with the same default, and they also always exclude `checkout-draft`. Their result passes through `woocommerce_analytics_excluded_order_statuses` and then `dokan_analytics_excluded_order_statuses` (lite:includes/Utilities/ReportUtil.php:66-82).

How each choice plays out:

- **Default (pending, failed, cancelled excluded):** processing, on-hold, completed, refunded and any custom statuses are counted.
- **The admin adds a status, for example on-hold:** those orders disappear from every report total.
- **The admin removes a status, for example cancelled:** cancelled orders start counting.

The same rule is applied in WooCommerce Analytics, both in wp-admin and in the Vendor dashboard (because Dokan joins `dokan_order_stats` onto WooCommerce's query and does not change the status logic), in the Lite admin-dashboard sales chart (lite:includes/Models/DataStore/VendorOrderStatsStore.php:172-176) and in the Lite admin-dashboard "active vendors" count (lite:includes/Models/DataStore/VendorOrderStatsStore.php:83-93). One observed exception: the admin-dashboard "top performing vendors" query applies no status filter at all (lite:includes/Models/DataStore/VendorOrderStatsStore.php:121-140).

**Double counting.** Each order and refund gets an `order_type` in `dokan_order_stats` (lite:includes/Analytics/Reports/OrderType.php:15-25, assigned in lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:139). WooCommerce Analytics queries are then limited to the Vendor-level order types (`BaseQueryFilter::add_where_subquery`, lite:includes/Analytics/Reports/BaseQueryFilter.php:44-54, 87-95):

- single-vendor orders
- Suborders
- Suborder refunds and single-order refunds
- advertisement and subscription orders

Multi-vendor parent orders (type 0) and parent refunds (type 3) are therefore left out.

`should_filter_by_vendor_id()` always returns true (lite:includes/Analytics/Reports/BaseQueryFilter.php:81-83), so this applies to the admin as well. The admin sees the sum of all Suborders, not the parent order. The admin can narrow the report with the `sellers` query parameter, while a Vendor is always locked to their own ID (lite:includes/Analytics/Reports/BaseQueryFilter.php:162-172).

The order count includes only non-refund types (single orders and Suborders). Refund rows are not counted as orders (lite:includes/Analytics/Reports/Orders/Stats/QueryFilter.php:56-67, lite:includes/Analytics/Reports/OrderType.php:179-184).

**When WooCommerce Analytics is turned off.** The old Lite dashboard sales overview does not use the setting. It uses a fixed list of completed, processing and on-hold, which can be changed only through the `woocommerce_reports_order_statuses` filter (lite:includes/reports.php:114-119).

**Code citations:** wc:src/Admin/API/Reports/DataStore.php:845 · wc:src/Internal/Admin/Settings.php:448 · lite:includes/Utilities/ReportUtil.php:66 · lite:includes/Analytics/Reports/BaseQueryFilter.php:44 · lite:includes/Analytics/Reports/BaseQueryFilter.php:81 · lite:includes/Analytics/Reports/BaseQueryFilter.php:162 · lite:includes/Analytics/Reports/OrderType.php:148 · lite:includes/Analytics/Reports/Orders/Stats/QueryFilter.php:56 · lite:includes/Models/DataStore/VendorOrderStatsStore.php:83 · lite:includes/Models/DataStore/VendorOrderStatsStore.php:121 · lite:includes/Models/DataStore/VendorOrderStatsStore.php:172 · lite:includes/reports.php:118

**Answering ADR:** [ADR-0100](../0100-reports-leave-out-the-order-statuses-excluded-in-woocommerce-analytics-settings.md), [ADR-0097](../0097-analytics-count-each-sale-once-at-the-vendor-order-level-and-never-count-parent-orders.md), [ADR-0094](../0094-a-vendor-sees-only-their-own-vendor-orders-in-analytics-and-only-report-managers-can-choose-a-vendor.md), [ADR-0111](../0111-top-performing-vendors-are-ranked-by-earning-on-orders-created-in-the-month-whatever-their-status.md)

**Last eval verdict:** pass (2026-10-22)

### 10-reports-analytics-Q3

**Question:** A vendor sold a $100 item, the admin's commission is 10%, and later the customer got a $50 partial refund. What will the analytics show for net sales, vendor earning and admin commission?

**Settings assumed:** 10% percentage commission (flat 0); no shipping, tax, fees, coupons or gateway fee; WooCommerce Analytics enabled; default excluded statuses; `woocommerce_date_type` = `date_paid`.

**Expected answer:**

The order is a single-vendor order, or the Vendor's Suborder; both are Vendor-level order types.

**At sale time (one `dokan_order_stats` row for the order).** WooCommerce re-imports the order and Dokan's listener calls `DataStore::sync_order` (lite:includes/Analytics/Reports/Orders/Stats/ScheduleListener.php:28-42). For a `shop_order`, this runs `OrderCommission` (lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:112-117). The line-item calculation splits the $100 item into $10 admin commission and $90 Vendor earning (lite:includes/Commission/OrderLineItemCommission.php:107-145).

The stored values are:

- `vendor_earning` = Vendor net earning + Vendor fees = 90 + 0 = **$90** (lite:includes/Commission/OrderCommission.php:340-342, 388-390)
- `admin_commission` = admin net commission + admin fees = **$10** (lite:includes/Commission/OrderCommission.php:531-533)

**After the $50 refund:**

1. *The refund gets its own row.* It is a `shop_order_refund` with order_type 4 (Suborder refund) or 5 (single-order refund). No commission is calculated for it, so its `vendor_earning` and `admin_commission` are **0** (lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:119-121, 141-155). WooCommerce's row for the refund has `total_sales` = −50 and `net_total` = −50, because net total is total minus tax minus shipping (wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:772-775).
2. *The original order row is recalculated net of the refund.* `wc_create_refund()` saves the order (wc:includes/wc-order-functions.php:749), and that save triggers a re-import of the order. Refund adjustment is on by default (`should_adjust_refund = true`, lite:includes/Commission/AbstractCommissionCalculator.php:15). `OrderLineItemCommission::adjust_refunds()` (lite:includes/Commission/OrderLineItemCommission.php:195-226) calls `Calculator::calculate_for_refund(90, 10, 100, 50)` (lite:includes/Commission/Calculator.php:191-212):
   - admin share of the refund = round(10 / 100 × 50) = 5
   - Vendor share of the refund = 50 − 5 = 45
   - new admin commission = 10 − 5 = **$5**
   - new Vendor earning = 90 − 45 = **$45**

**Result in the Vendor's Revenue/Orders analytics.** The stats query adds `SUM(vendor_earning)` and `SUM(admin_commission)` across all included order and refund types (lite:includes/Analytics/Reports/Orders/Stats/QueryFilter.php:85-99):

- Total Vendor earning = 45 (order) + 0 (refund) = **$45**
- Total admin commission = 5 + 0 = **$5**
- Net sales (WooCommerce `net_total`) = 100 + (−50) = **$50**
- Order count = **1**, because refund rows are not counted as orders (lite:includes/Analytics/Reports/Orders/Stats/QueryFilter.php:64-67)

The refund therefore reduces earning and commission once, on the original order's row, and reduces sales once, through the negative refund row. Nothing is subtracted twice.

**Date effect when the refund lands in a later period.** With the default date type `date_paid`, WooCommerce gives the refund row a `date_paid` equal to the refund's own creation date (wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:643-645). The −$50 net sales therefore appears in the refund's month. The earning reduction, however, is written onto the original order's row, so the original month's Vendor earning changes from $90 to $45.

**Code citations:** lite:includes/Analytics/Reports/Orders/Stats/ScheduleListener.php:29 · lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:112 · lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:141 · lite:includes/Commission/OrderCommission.php:340 · lite:includes/Commission/OrderCommission.php:531 · lite:includes/Commission/AbstractCommissionCalculator.php:15 · lite:includes/Commission/OrderLineItemCommission.php:195 · lite:includes/Commission/Calculator.php:191 · lite:includes/Analytics/Reports/Orders/Stats/QueryFilter.php:85 · wc:includes/wc-order-functions.php:749 · wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:643 · wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:772

**Answering ADR:** [ADR-0099](../0099-commission-and-earning-in-analytics-are-the-vendor-orders-figures-after-refunds-while-refunds-reduce-sales-as-separate-rows.md), [ADR-0046](../0046-a-refund-reverses-commission-and-vendor-earning-pro-rata-to-the-refunded-share-of-each-line-item.md)

**Last eval verdict:** pass (2026-10-22)

### 10-reports-analytics-Q4

**Question:** An order was placed on March 31 but paid or completed on April 2. Which month does it show up in on the reports?

**Settings assumed:** `woocommerce_date_type` covered for all three values (default `date_paid`).

**Expected answer:**

It depends on which report you open, and for WooCommerce Analytics it also depends on the WooCommerce "Date Type" setting.

**1. WooCommerce Analytics** (the Vendor dashboard Reports app when analytics is on, and wp-admin Analytics). The setting is `woocommerce_date_type` (WooCommerce → Analytics → Settings → Date Type). Its default is `date_paid`, and the allowed values are `date_created`, `date_paid` and `date_completed` (wc:src/Internal/Admin/Settings.php:478-490). The orders stats data store reads it, and falls back to `date_paid` if the value is invalid (wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:104).

Dokan's order-stats store subclasses WooCommerce's and leaves the date column alone; the line that would override it is commented out (lite:includes/Analytics/Reports/Orders/Stats/WcDataStore.php:13-32, lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:63-66). Dokan also preloads `woocommerce_date_type` into the Vendor app, so Vendors use the admin's choice (lite:includes/Analytics/Settings.php:49-72).

How each choice plays out:

- **`date_paid` (default):** the order shows in **April**, because it was paid on April 2. An order that was never paid has a NULL date and drops out of date-filtered reports.
- **`date_created`:** the order shows in **March**.
- **`date_completed`:** the order shows in the month it reached completed status. An order that has not completed yet does not appear.

Refunds get `date_paid` and `date_completed` backfilled from the refund's own creation date, but only when the parent order has that date itself (wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:636-645). A refund therefore usually lands in the period it was issued, not the period of the original sale.

**2. The Lite admin dashboard widgets** (sales chart, active vendors, top performing vendors) ignore the setting and always filter on the order's creation date, `wc_order_stats.date_created` (lite:includes/Models/DataStore/VendorOrderStatsStore.php:96, 131, 182-185). This order shows in **March**.

**3. The legacy Vendor dashboard sales chart** (used when WooCommerce Analytics is off) also plots Vendor orders by creation date, through `dokan_get_order_report_data()` (lite:includes/reports.php:20-248; see ADR 0109), so this order shows in **March**.

**Code citations:** wc:src/Internal/Admin/Settings.php:478 · wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:104 · wc:src/Admin/API/Reports/Orders/Stats/DataStore.php:643 · lite:includes/Analytics/Reports/Orders/Stats/WcDataStore.php:23 · lite:includes/Analytics/Reports/Orders/Stats/DataStore.php:63 · lite:includes/Analytics/Settings.php:57 · lite:includes/Models/DataStore/VendorOrderStatsStore.php:182 · lite:includes/reports.php:20

**Answering ADR:** [ADR-0098](../0098-analytics-date-a-sale-by-the-woocommerce-date-type-but-dokan-dashboard-statistics-use-the-order-creation-date.md), [ADR-0109](../0109-the-legacy-vendor-sales-chart-plots-gross-totals-of-processing-on-hold-and-completed-vendor-orders-by-creation-date.md)

**Last eval verdict:** pass (2026-10-22). The add-on report sections of the original answer were removed at finalisation; item 3 was added from ADR 0109. Re-run recommended.

---

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
