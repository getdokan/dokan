# New Vendors are sent to the store setup wizard unless the welcome wizard is turned off

Status: Accepted (retroactive — documents existing code)

## Context

Right after sign-up a Vendor has only a store name and phone number ([ADR-0076](./0076-vendor-registration-requires-store-details-and-a-unique-store-url-that-becomes-the-store-slug.md)). Dokan offers a short, optional setup wizard at `?page=dokan-seller-setup` to collect the store address and withdraw details. This ADR records when a Vendor is sent there and what the wizard does and does not enforce.

## Rule

After self-registration as a Vendor, or after Become a Vendor, the user is redirected to the Vendor setup wizard when the Welcome Wizard setting is on, and to the Vendor dashboard when it is off. Completing the wizard is optional and has no effect on Selling Activation or Direct Publishing.

- **After registration.** `Vendor\SetupWizard::filter_woocommerce_registration_redirect()` (`lite:includes/Vendor/SetupWizard.php::filter_woocommerce_registration_redirect()`, hooked in `::__construct()` on `woocommerce_registration_redirect`, applied in `wc:includes/class-wc-form-handler.php::process_registration()`) sends users with the `seller` role to `?page=dokan-seller-setup` (filter `dokan_seller_setup_wizard_url`), or to `dokan_get_navigation_url()` when the wizard is disabled.
- **After Become a Vendor.** The same choice is made in `BecomeAVendor::become_a_seller_form_handler()` (`lite:includes/Frontend/MyAccount/BecomeAVendor.php::become_a_seller_form_handler()`), and the destination then passes through the `dokan_customer_migration_redirect` filter.
- **Wizard steps.** `Vendor\SetupWizard::setup_wizard()` (`lite:includes/Vendor/SetupWizard.php::setup_wizard()`) works on `dokan_get_current_user_id()`. The store step requires street, city, ZIP and country, and also a state unless WooCommerce lists the country with an empty state list (`::dokan_setup_store_save()`). The payment step (`::dokan_setup_payment_save()`) is added only when at least one withdraw method is active (`::set_steps()`), and a direct request for it is redirected to the next step when none is active (`::setup_wizard()`). Steps are filterable through `dokan_seller_wizard_steps` (in `::set_steps()`).
- **Not a gate.** Nothing in Selling Activation or product creation checks whether the wizard was completed.

## Settings that change it

| Setting | Storage | Default | Effect |
|---|---|---|---|
| Welcome Wizard | canonical `vendor_welcome_wizard_enabled` (`lite:includes/Admin/Settings/Schema/SettingsSchema.php::vendor_page()`, field `vendor_welcome_wizard_enabled`); legacy `dokan_general[disable_welcome_wizard]`, inverted by `InvertOnOffTransformer`. Code reads `dokan_get_option( 'disable_welcome_wizard', 'dokan_selling' )`, which the rearrange map redirects to `dokan_general` (`lite:includes/functions.php::dokan_admin_settings_rearrange_map()`) | wizard on (`disable_welcome_wizard = off`) | On: redirect to the wizard. Off: redirect to the dashboard. |
| Vendor Setup Wizard Logo / Message | canonical `vendor_setup_wizard_logo`, `vendor_setup_wizard_message`; legacy `dokan_general[setup_wizard_logo_url]`, `dokan_general[setup_wizard_message]` | site default / shipped welcome text | Branding only. |

## Worked example

Welcome Wizard on. A visitor registers as a Vendor and lands on the wizard introduction. They leave the wizard without saving any step and go straight to the dashboard. They are a Vendor with the selling status set by the onboarding setting; skipping the wizard only means the store address and payment details are still empty.

## Edge cases

- Store Admin-created Vendors are never redirected; they meet the wizard only if they open the URL themselves.
- Add-ons can change or override the destination: the wizard URL passes through `dokan_seller_setup_wizard_url`, and a later callback on `woocommerce_registration_redirect` (Dokan's runs at priority 10, `lite:includes/Vendor/SetupWizard.php::__construct()`) can replace it, for example to log an unverified user out instead.
- The registration redirect checks the `seller` role only (`::filter_woocommerce_registration_redirect()`), not Selling Activation, so Pending Vendors are sent to the wizard too.

## Why

The wizard's own welcome text says it is "completely optional"; no other rationale is recorded.

## Consequences & risks

- A Vendor can be live (under `automatically`) with no address and no withdraw method. Withdraw requests will fail until a method is configured.

## Recommendations

- If address or payout details are business-critical, enforce them where they are used (checkout, withdraw), not in the wizard.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
