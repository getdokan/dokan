# A visitor can register as a Vendor only through a form that offers the vendor role

Status: Accepted (retroactive — documents existing code)

## Context

Dokan does not have its own account system. A Vendor is a WordPress user with the `seller` role (Lite ADR 0009), and new accounts are created by WooCommerce's My Account registration (`wc_create_new_customer()`). Dokan adds a "I am a customer / I am a vendor" choice to that form and also ships dedicated Vendor sign-up pages. Because the role is just a posted field (`role=seller`), the marketplace has to decide, on the server, which roles a given registration request may claim. Marketplaces commonly want to stop Vendor sign-ups on the generic My Account page while still running a dedicated "Sell with us" page.

## Rule

A registration request may create a Vendor only when the form it came from offers the Vendor role. Every other registration creates a Customer.

- **Allowed roles.** `Registration::get_allowed_registration_roles()` (`lite:includes/Registration.php:107-116`) always allows `customer`. It adds `seller` when either:
  - the request was submitted from one of Dokan's dedicated Vendor sign-up forms, proven by the `dokan_vendor_registration_form_nonce` marker (`Registration::is_vendor_form_request()`, `lite:includes/Registration.php:125-135`), or
  - the "Show Register as a Vendor in Sign Up Page" setting is not `off` (`lite:includes/Registration.php:111`).
  The list is filterable through `dokan_register_user_role` (`:115`).
- **Enforcement.** `Registration::validate_registration()` (`lite:includes/Registration.php:144-191`) runs on both WooCommerce registration error filters (`woocommerce_process_registration_errors` and `woocommerce_registration_errors`, hooked at `:34-35`). It verifies the `woocommerce-register` nonce (`:153`, `Registration::validate_nonce()` at `:342-352`) and rejects any `role` that is missing or not in the allowed list with the error "Cheating, eh?" (`:160-162`).
- **Role written to the user.** `Registration::set_new_vendor_names()` (`lite:includes/Registration.php:200-219`, on `woocommerce_new_customer_data`, applied at `wc:includes/wc-user-functions.php:163`) sets `role` to the posted role only if it is allowed, otherwise to `customer` (`:206`).
- **Dedicated forms.** `[dokan-vendor-registration]` (`Shortcodes\VendorRegistration`) and `[dokan-vendor-onboarding-registration]` print the marker through `dokan_vendor_reg_form_start` (`Registration::render_vendor_form_marker()`, `:64-66`). If a theme override of the form template does not fire that action, `Registration::inject_vendor_form_marker()` (`:81-95`) adds the marker to any rendered form that contains a `role` input. Both shortcodes return "You are already logged in" for logged-in users (`lite:includes/Shortcodes/VendorRegistration.php:18`).
- **WordPress's own sign-up page is not a Vendor path.** `dokan_redirect_to_register()` (`lite:includes/functions.php:1152-1161`, on `login_init`) redirects `wp-login.php?action=register` to the WooCommerce My Account page.
- **Requests that skip Dokan's validation.** Checkout registrations, WP-CLI and REST requests return early from `validate_registration()` (`:145-151`). The intended rule is that an account created at checkout is a Customer: a checkout form carries no `woocommerce-register` nonce, so `set_new_vendor_names()` leaves the role WooCommerce chose (`customer`) untouched (`:201-203`).

## Settings that change it

| Setting | Storage | Default | Effect |
|---|---|---|---|
| Show "Register as a Vendor" in Sign Up Page | canonical `show_register_as_vendor`; legacy `dokan_appearance[show_register_as_vendor]` (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:1359-1379`) | `on` | `on`: the WooCommerce My Account form shows the role choice (`lite:templates/global/seller-registration-form.php:87`) and accepts `role=seller`. `off`: the choice is hidden **and** a `role=seller` post from the My Account form is rejected. Dokan's dedicated Vendor forms keep working in both cases. |
| `dokan_register_nonce_check` filter | code | `true` | Returning `false` disables the nonce check and makes every request count as a dedicated Vendor form request (`lite:includes/Registration.php:127-129`), so `seller` is always allowed. Intended for sites that drive their own sign-up forms. |
| WooCommerce "Allow customers to create an account on the My account page" | WooCommerce option | WooCommerce default | If WooCommerce does not render its registration form, Dokan's role choice on it is not rendered either. Dokan's shortcodes render their own form. |

## Worked example

Setting `show_register_as_vendor = off`.

1. A visitor opens My Account. The role toggle is not shown. A crafted POST with `role=seller` from this form fails with "Cheating, eh?" because the request carries no Vendor-form marker and `seller` is not in the allowed list.
2. The same visitor opens the page holding `[dokan-vendor-registration]`. The form posts `role=seller` together with the marker nonce. `seller` is allowed, the required store fields are validated (see [ADR-0075](./0075-vendor-registration-requires-store-details-and-a-unique-store-url-that-becomes-the-store-slug.md)), and the account is created as a Vendor.

## Edge cases

- The marker is a WordPress nonce printed together with WooCommerce's own `woocommerce-register` nonce, so both expire together. When a Vendor form is left open past the nonce lifetime, WooCommerce's `WC_Form_Handler::process_registration()` does not process the submission at all (`wc:includes/class-wc-form-handler.php:1355`), so the visitor is never silently registered as a Customer instead.
- Becoming a Vendor after registering as a Customer is a separate path and is not governed by this setting ([ADR-0064](./0064-a-customer-becomes-a-vendor-through-become-a-vendor-and-loses-their-previous-roles.md)).
- Store Admin-created Vendors (WP Admin, REST `POST /dokan/v1/stores`) bypass registration entirely; `Vendor\Manager::create()` forces `role = seller` (`lite:includes/Vendor/Manager.php:217`).

## Why

The docblock and inline comment of `get_allowed_registration_roles()` record the decision: the appearance setting "only hides the vendor option in the WooCommerce form's template, so a role that form never offered has to be refused server side too" (`lite:includes/Registration.php:100-101`), and "Dokan's dedicated vendor pages exist to sign vendors up, so a setting naming the WooCommerce form must not close them" (`:110`).

## Consequences & risks

- There is no single "close Vendor registration" switch. Turning the setting off closes only the My Account path; a marketplace that wants no new Vendors must also remove the dedicated shortcode pages, or filter `dokan_register_user_role`.
- Add-ons that add their own registration forms must either print the Vendor-form marker or extend the allowed roles through `dokan_register_user_role`.

## Recommendations

- If a full stop on Vendor sign-ups is a common request, a dedicated setting that empties `seller` from the allowed roles for every form would be clearer than relying on page removal.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
