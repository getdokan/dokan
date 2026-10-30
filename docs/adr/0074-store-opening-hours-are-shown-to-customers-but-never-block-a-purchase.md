# Store opening hours are shown to customers but never block a purchase

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

A Vendor can publish weekly opening hours for their Store ("Store has open close time"). Customers then see "Store Open" or "Store Closed" on the store page and store list. Teammates are often asked whether a closed store still takes orders. This ADR records what the hours are, how "open now" is computed, and what they affect.

## Rule

Opening hours are informational. Dokan Lite uses them only to display an open or closed badge and the hours widget; nothing in cart, checkout or order processing consults them, so customers can buy from a Store while it is shown as closed.

- **Data.** Hours live in the Store profile (`dokan_profile_settings`): `dokan_store_time_enabled` (`yes`/`no`), `dokan_store_time[<day>]` with `status` (`open`/`close`), `opening_time[]` and `closing_time[]` stored in 12-hour `g:i a` format, plus optional `dokan_store_open_notice` and `dokan_store_close_notice` (defaults at `lite:includes/Vendor/Vendor.php:249-251`; getters at `:1066-1080`). Vendors save them from the classic dashboard store settings (`lite:includes/Dashboard/Templates/Settings.php:658-700`, `:727-730`) or from the newer store settings screen, which writes the same `dokan_profile_settings` keys (`Vendor\Settings\StoreSettingsWriter::save()`, `lite:includes/Vendor/Settings/StoreSettingsWriter.php:28-47`); the REST store update accepts `store_open_close` (`lite:includes/Vendor/Manager.php:506-525`).
- **Open now.** `dokan_is_store_open( $user_id )` (`lite:includes/functions.php:3136-3174`) takes today's weekday in the site timezone (`dokan_current_datetime()`), returns closed if today is missing or marked `close`, and otherwise returns open when the current time is between the **first** opening time and the **first** closing time of the day. The result passes through the `dokan_is_store_open` filter with the day, the schedule and the Vendor id, which add-ons may use to support more slots.
- **Where it is shown.** The store header shows the badge and notice only when the admin widget setting is on **and** the Vendor enabled hours (`lite:templates/store-header.php:104-108`); the store list card does the same (`lite:templates/store-lists-loop.php:43-44`); the "Store Time" sidebar widget renders the weekly table under the same conditions (`lite:includes/Widgets/StoreOpenClose.php:53-60`, `lite:includes/template-tags.php:571-572`).
- **Where it is not used.** A search of Lite for `dokan_is_store_open` and `dokan_store_time` finds no use in cart, checkout, order or product purchasability code.

## Settings that change it

| Setting | Storage | Default | Effect |
|---|---|---|---|
| Store Opening Closing Time Widget (admin) | canonical `store_opening_closing_time_widget` (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:1828-1848`); legacy `dokan_appearance[store_open_close]` (reads of `dokan_general[store_open_close]` are redirected there by the rearrange map, `lite:includes/functions.php:3478`) | `on` | `on`: badge, notice and widget are shown for Vendors who enabled hours. `off`: none are shown, and `store_open_close` is removed from REST Vendor data (`lite:includes/REST/Manager.php:114-117`). |
| Store has open close time (per Vendor) | `dokan_profile_settings[dokan_store_time_enabled]` | `no` | `yes`: the Vendor's hours are displayed. `no`: nothing is displayed for that Store. |

## Worked example

Site timezone Asia/Dhaka. Vendor V enabled hours with Monday 9:00 am – 5:00 pm. On Monday at 6:30 pm, `dokan_is_store_open( V )` returns false and the store page shows the close notice. A customer adds V's product to the cart and checks out; the order is placed and the Vendor order is created normally.

## Edge cases

- **Overnight hours are not supported.** Times are compared on the same calendar day, so 8:00 pm – 2:00 am never reads as open. The dashboard save keeps the previous values for a day whose opening time is later than its closing time (`lite:includes/Dashboard/Templates/Settings.php:688-693`).
- **Only the first slot counts in Lite.** If more than one slot is stored for a day, Lite evaluates index 0 only; add-ons may evaluate the rest through the `dokan_is_store_open` filter.
- **`dokan_is_store_open()` ignores the enable flag.** It evaluates the schedule even when the Vendor turned hours off; callers check `dokan_store_time_enabled` themselves before displaying anything.
- A day with no hours saved reads as closed.

## Why

No recorded decision. Opening hours appear to have been designed for information (a widget and a badge) rather than as an ordering restriction.

## Consequences & risks

- Customers may expect a "closed" store not to accept orders. Marketplaces that need that behaviour must add it, for example by filtering `woocommerce_is_purchasable` with `dokan_is_store_open()`.
- Code that calls `dokan_is_store_open()` for filtering without checking `dokan_store_time_enabled` will treat every Store without hours as closed.

## Recommendations

- If ordering restrictions are requested, make them a separate admin setting rather than changing the meaning of the existing badge.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
