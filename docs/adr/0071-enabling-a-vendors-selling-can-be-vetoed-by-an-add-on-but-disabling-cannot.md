# Enabling a Vendor's selling can be vetoed by an add-on, but disabling cannot

Status: Accepted (retroactive — documents existing code)

## Context

Every route that approves a Vendor ends in `Vendor::make_active()`, and every route that disables one ends in `Vendor::make_inactive()` (registration, Become a Vendor, admin user profile, the WP Admin Users list "Approve Vendors" bulk action, REST status and batch endpoints, `Vendor\Manager::create()` / `update()`, and the reverse withdrawal failed-payment action). Marketplaces often need extra conditions before a Vendor may sell, such as identity verification, a paid plan or a compliance check, and those conditions are implemented outside Lite. Lite therefore needs one place where such conditions can stop an approval, whichever screen or API triggered it.

## Rule

`Vendor::make_active()` asks the `dokan_can_enable_selling` filter first. If any callback returns `false`, nothing changes: `dokan_enable_selling` is not written, products are not restored, and `dokan_vendor_enabled` does not fire. Disabling has no such filter and always takes effect.

- **Veto point.** `make_active()` applies `dokan_can_enable_selling` with default `true` and the Vendor id (`lite:includes/Vendor/Vendor.php:985-1004`). On `false` it writes a `dokan_log()` line ("Vendor activation blocked for vendor #N by dokan_can_enable_selling filter.") and returns `to_array()` unchanged (`:1006-1015`).
- **Normal activation.** Otherwise it writes `dokan_enable_selling = yes`, queues the product status revert, and fires `dokan_vendor_enabled` (`:1017-1022`).
- **Deactivation.** `make_inactive()` writes `dokan_enable_selling = no`, queues the product status change, and fires `dokan_vendor_disabled` (`lite:includes/Vendor/Vendor.php:1034-1043`). There is no filter that can stop it.
- **Read path.** Separately from the write path, `dokan_is_seller_enabled()` passes its answer through the `dokan_is_seller_enabled` filter (`lite:includes/functions.php:1172-1177`), so an add-on can also make an approved Vendor *behave* as not enabled without changing stored data.

## Settings that change it

None in Lite. Whether activation is vetoed depends entirely on which add-ons hook `dokan_can_enable_selling`.

## Worked example

An add-on requires verified identity and returns `false` from `dokan_can_enable_selling` for Vendor 42, who is not verified. A Store Admin ticks "Enable selling" for Vendor 42 on the WP Admin user profile and saves. `Admin\UserProfile::save_meta_fields()` sees the state changed and calls `Manager::activate( 42 )` → `make_active()`. The filter returns `false`, the log line is written, and Vendor 42 stays Pending. The admin screen reloads showing the checkbox unticked, because it reads the stored meta.

## Edge cases

- **The return value does not report a veto.** `make_active()` returns the Vendor array in both cases. The docblock says so explicitly and tells callers to check `dokan_is_seller_enabled()` afterwards (`lite:includes/Vendor/Vendor.php:994-998`).
- **Registration under `automatically`.** If an add-on vetoes, a new Vendor who would have been auto-approved stays Pending with no `dokan_enable_selling` row.
- A veto also stops the revert of products that were held when the Vendor was disabled; they stay in pending review.

## Why

Recorded in the docblock (added in 5.0.2): the filter "allows extensions (verification, KYC, compliance, etc.) to short-circuit vendor activation" (`lite:includes/Vendor/Vendor.php:986-1003`). No rationale is recorded for leaving deactivation unfiltered; disabling a Vendor is a safety action and is expected always to work.

## Consequences & risks

- Support questions of the form "I enabled this Vendor but they are still pending" usually mean an add-on vetoed activation; check the Dokan log.
- Because the read-side filter `dokan_is_seller_enabled` exists too, stored data and effective behaviour can disagree. Reports that query `dokan_enable_selling` directly will not see read-side overrides.

## Recommendations

None.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
