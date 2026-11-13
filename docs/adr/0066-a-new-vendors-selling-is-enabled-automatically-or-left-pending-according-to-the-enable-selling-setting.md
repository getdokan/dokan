# A new Vendor's selling is enabled automatically or left pending according to the Enable Selling setting

Status: Accepted (retroactive — documents existing code)

## Context

Selling Activation (CONTEXT.md) decides whether a Vendor's Store is live. It is stored as the `dokan_enable_selling` user meta and read only through `dokan_is_seller_enabled()`, which treats anything other than `yes`, including a missing row, as Pending (Lite ADR 0010). Every marketplace has to choose whether new Vendors may start selling at once or must wait for review. Dokan exposes that choice as one admin setting, but a Vendor can come into existence through several code paths. Teammates are regularly asked "why is this new Vendor pending?" and the answer depends on which path created them.

## Rule

When a user becomes a Vendor, Dokan reads the "Enable Selling" setting. Under `automatically` the new Vendor is approved (`dokan_enable_selling = yes`); under `manually` the new Vendor is Pending until a Store Admin approves them.

The setting is normalised by `AdminSettings::get_new_seller_enable_selling_status()` (`lite:includes/Utilities/AdminSettings.php:17-30`): an empty value reads the stored option with a fallback of `on`, legacy `on` becomes `automatically`, legacy `off` becomes `manually`, and the result passes through the `dokan_new_seller_enable_selling_status` filter.

How each entry path applies it:

| Entry path | Code | `automatically` | `manually` |
|---|---|---|---|
| Self-registration (WooCommerce My Account form, Vendor registration shortcodes) and any other `wp_insert_user()` with the `seller` role | `dokan_admin_user_register()` on core `user_register` (`lite:includes/functions.php:1496-1516`) | Approved (`dokan()->vendor->activate()` → `Vendor::make_active()`) | Pending (`:1504-1506`) |
| Customer upgrades through Become a Vendor | `dokan_user_update_to_seller()` (`lite:includes/functions.php:4451-4455`) | Approved (`make_active()`) | Pending (`make_inactive()` writes `dokan_enable_selling = no`) |
| Store Admin creates the Vendor (REST `POST /dokan/v1/stores`, admin Vendors screen) | `Vendor\Manager::create()` (`lite:includes/Vendor/Manager.php:206-318`). `wp_insert_user()` fires `user_register` first, so the first row applies; then, for a caller with `manage_woocommerce`, `enabled = true` in the payload calls `make_active()` (`:279-282`) | Approved by `user_register`; `enabled = false` in the payload does not undo it | Pending unless the payload says `enabled = true` |
| A user is given the `seller` role later (WP Admin → Users → change role, or code calling `add_role`) | No Dokan hook | Pending (no row) | Pending (no row) |

Add-ons may introduce further values through the `dokan_new_seller_enable_selling_statuses` filter (`lite:includes/Utilities/AdminSettings.php:39-46`); any value other than `automatically` behaves like `manually` in the Lite paths above, because they all compare against the literal `'automatically'`. Activation itself can still be vetoed by an add-on; see [ADR-0071](./0071-enabling-a-vendors-selling-can-be-vetoed-by-an-add-on-but-disabling-cannot.md).

## Settings that change it

| Setting | Storage | Default | Values |
|---|---|---|---|
| Enable Selling (Vendor Onboarding) | canonical `vendor_auto_enable_selling` (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:1315-1330`); legacy `dokan_selling[new_seller_enable_selling]` with `EnableSellingStatusTransformer` | `automatically` (legacy reader fallback `on`, which maps to `automatically`) | `automatically`: new Vendors are approved on creation. `manually`: new Vendors are Pending until a Store Admin enables selling. Values added by add-ons: treated as `manually` by Lite. |

The same value is offered in the admin setup wizard (`lite:includes/Admin/SetupWizard.php:571-624`).

## Worked example

Setting = `manually`.

- Ali registers on the Vendor registration page. `user_register` runs `dokan_admin_user_register()`; target "not enabled" equals current "not enabled", so nothing is written. Ali has no `dokan_enable_selling` row and appears under the admin's Pending tab, because Pending is "everyone not approved, a missing flag included" (`lite:includes/Vendor/Manager.php:99-107`).
- Bina, an existing Customer, uses Become a Vendor. `dokan_user_update_to_seller()` calls `make_inactive()`, so Bina gets `dokan_enable_selling = no`.
- The admin creates Chandra through the REST API with `enabled: true`. `user_register` writes nothing, then `create()` calls `make_active()`, and Chandra is approved.

Setting changed to `automatically`: Dev registers on the Vendor registration page and is approved at sign-up (`dokan_enable_selling = yes`). Ali and Bina stay Pending until a Store Admin approves them.

## Edge cases

- Changing the setting affects only Vendors created afterwards. Existing Pending Vendors are not approved retroactively.

## Why

No recorded rationale for how each entry path applies the setting. The setting itself was turned from an on/off switch into a status list in 4.0.2 so that add-ons could add statuses (`@since 4.0.2` on both `AdminSettings` methods).

## Consequences & risks

- The meaning of "Pending" is "no `yes` row", not "a `no` row".

## Recommendations

None.

_Verified against Lite @1808fb2ac / Pro @965848058 / WooCommerce 11.2.1 — 2026-11-13._
