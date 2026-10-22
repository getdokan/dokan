# A Customer becomes a Vendor through Become a Vendor and loses their previous roles

Status: Accepted (retroactive — documents existing code)

## Context

Many Vendors start as Customers of the marketplace. Because a Vendor is a WordPress user with the `seller` role (Lite ADR 0009), upgrading a Customer is a role change on the existing account rather than a new account. Dokan Lite owns this "Become a Vendor" flow on the WooCommerce My Account page (it replaced an older add-on implementation, which Lite unhooks for old add-on versions in `BecomeAVendor::remove_account_update_feature_from_dokan_pro()`, `lite:includes/Frontend/MyAccount/BecomeAVendor.php:49-64`).

## Rule

A logged-in user who is not already a Vendor can submit the Become a Vendor form. On success, every role the user held is removed, the `seller` role is added, and the Store is created on the same account.

- **Where.** A call to action is rendered under the My Account dashboard for non-Vendors (`BecomeAVendor::render_become_a_vendor_section()` on `woocommerce_after_my_account`, `lite:includes/Frontend/MyAccount/BecomeAVendor.php:141-148`; fired at `wc:templates/myaccount/dashboard.php:79`). The form lives on the `account-migration` My Account endpoint (`:157-205`) or the `[dokan-customer-migration]` shortcode.
- **Who may submit.** `BecomeAVendor::become_a_seller_form_handler()` (`lite:includes/Frontend/MyAccount/BecomeAVendor.php:73-132`, on `template_redirect`) requires the `account_migration` nonce (`:74`), a logged-in user (`:81-85`) and a user who is not already a Vendor by `dokan_is_user_seller()` (`:87-91`). Administrators and shop managers hold the `dokandar` capability, so they count as Vendors and are refused; when an administrator opens the `account-migration` endpoint, `load_customer_to_vendor_update_template()` shows an error telling them to use the admin settings instead of rendering the form (`:169-170`).
- **Required fields.** `fname`, `shopname`, `phone` by default, filterable through `dokan_customer_migration_required_fields` (`:93-107`). Last name, store URL and address are optional on this path.
- **Role change.** `dokan_user_update_to_seller()` (`lite:includes/functions.php:4414-4461`, pluggable through `function_exists`) removes `customer` and then every other current role (`:4423-4428`), adds `seller` (`:4431`), sets `user_nicename` from the posted store URL (`:4433-4438`), saves first and last name, and saves store name, phone and address through the `Vendor` setters.
- **Operating Terms.** Selling Activation follows the Enable Selling setting by calling `make_active()` or `make_inactive()` directly (`:4451-4455`; see [ADR-0065](./0065-a-new-vendors-selling-is-enabled-automatically-or-left-pending-according-to-the-enable-selling-setting.md)). Direct Publishing is explicitly written as `no` (`:4457`).
- **After.** `dokan_new_seller_created` fires (`:4459`), which triggers the admin's new-Vendor email (`Emails\NewSeller`, hooked at `lite:includes/Emails/NewSeller.php:38`; heading "New Vendor Registered - {seller_name}"). The user is redirected to the Vendor setup wizard, or to the Vendor dashboard when the welcome wizard is disabled (`lite:includes/Frontend/MyAccount/BecomeAVendor.php:124-131`, filter `dokan_customer_migration_redirect`).

## Settings that change it

| Setting | Storage | Default | Effect |
|---|---|---|---|
| Enable Selling | canonical `vendor_auto_enable_selling`; legacy `dokan_selling[new_seller_enable_selling]` | `automatically` | `automatically`: the upgraded Vendor is approved. `manually`: `dokan_enable_selling = no` is written and the Vendor is Pending. |
| Welcome Wizard | canonical `vendor_welcome_wizard_enabled` (default `on`, `lite:includes/Admin/Settings/Schema/SettingsSchema.php:1410-1430`); legacy `dokan_general[disable_welcome_wizard]` (inverted, default `off`). The handler reads `dokan_get_option( 'disable_welcome_wizard', 'dokan_selling', 'off' )`, which the rearrange map redirects to `dokan_general` (`lite:includes/functions.php:3484`) | wizard on | On: redirect to `?page=dokan-seller-setup`. Off: redirect to the Vendor dashboard. |
| Terms and Conditions on registration | legacy `dokan_general[enable_tc_on_reg]` plus the terms page `dokan_pages[reg_tc_page]` | `on` when nothing is stored, because this form reads it with an `on` fallback (`lite:includes/Frontend/MyAccount/BecomeAVendor.php:190`); Lite itself registers no admin field for it, add-ons may | When the value is `on` **and** a terms page is selected, the upgrade form shows a required "I agree" checkbox (`lite:templates/account/update-customer-to-vendor.php:69-82`). With no terms page selected, no checkbox is shown. |

The "Show Register as a Vendor" setting does not affect this path.

## Worked example

Setting Enable Selling = `manually`. Customer Mitu (roles: `customer`, `subscriber`) fills in first name, store name "Mitu Tea" and phone, leaving the store URL empty, and submits. Both roles are removed and `seller` is added. Because the store URL was empty, `wp_update_user()` receives an empty `user_nicename` and WordPress derives it from her username. `dokan_enable_selling = no` and `dokan_publishing = no` are written, the admin is sent the new-Vendor email, and Mitu lands on the setup wizard as a Pending Vendor. Her previous orders as a Customer stay attached to her account.

## Edge cases

- **Roles are replaced, not added.** A user with any other role (for example `editor` or a membership role) loses it on upgrade. Only users who do not hold `dokandar` reach this point.
- **No store URL uniqueness check.** Unlike registration, the handler does not reject a taken store URL. WordPress's `wp_insert_user()` silently appends `-2`, `-3`… to keep `user_nicename` unique, so the Vendor may get a different URL from the one they typed.
- **No `dokan_profile_settings` reset.** The Store is built through the `Vendor` setters and `save()`, so profile-completion data is not seeded the way registration seeds it.
- Under `manually`, `dokan_vendor_disabled` fires for the new Vendor (see the Enable Selling ADR above).

## Why

No recorded rationale for replacing all roles. The code removes `customer` explicitly and then every remaining role, which suggests the intent was "a Vendor account carries only the Vendor role".

## Consequences & risks

- Sites that use extra roles for memberships, wholesale pricing or LMS access will see those roles disappear when such a user becomes a Vendor.
- Because `dokan_user_update_to_seller()` is pluggable, a site can replace the whole upgrade behaviour by defining the function first.

## Recommendations

- Consider keeping roles other than `customer`, or making the removal list filterable, so upgrading does not strip unrelated access.
- Apply the same store URL availability check as registration, so the Vendor sees an error instead of a silently changed URL.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
