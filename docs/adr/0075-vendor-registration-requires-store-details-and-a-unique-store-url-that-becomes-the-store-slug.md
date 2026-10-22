# Vendor registration requires store details and a unique store URL that becomes the store slug

Status: Accepted (retroactive — documents existing code)

## Context

When a visitor signs up as a Vendor (the role check is in [ADR-0067](./0067-a-visitor-can-register-as-a-vendor-only-through-a-form-that-offers-the-vendor-role.md)), Dokan has to create a usable Store at the same time: a store name, a contact phone and a public store URL. Lite ADR 0009 establishes that the store URL is the user's `user_nicename`. This ADR records what a Vendor sign-up must contain, what is written at sign-up, and who is told about it.

## Rule

A Vendor sign-up through the WooCommerce My Account form or Dokan's Vendor registration shortcodes must carry first name, last name, phone, store name and a store URL that no other user already uses. The store URL is written as the user's `user_nicename` when the user is inserted, and the Store profile is created immediately afterwards.

- **Required fields.** For `role=seller`, `Registration::validate_registration()` requires every key of the `dokan_seller_registration_required_fields` filter; the default list is `fname`, `lname`, `phone`, `shopname`, `shopurl` (`lite:includes/Registration.php:166-182`). An empty value returns that field's error message and the account is not created.
- **Unique store URL.** The posted `shopurl` is rejected with "Shop URL is not available" when `get_user_by( 'slug', $shop_url )` finds any user (`lite:includes/Registration.php:184-187`). The check is against every user's slug, not only Vendors.
- **Slug fixed at insert.** `Registration::set_new_vendor_names()` sets `first_name`, `last_name` and `user_nicename = sanitize_user( shopurl )` on WooCommerce's `woocommerce_new_customer_data` (`lite:includes/Registration.php:214-216`; filter applied at `wc:includes/wc-user-functions.php:163`). WordPress then inserts the user with that slug.
- **Store profile.** `Registration::save_vendor_info()` (`lite:includes/Registration.php:229-285`, on `woocommerce_created_customer`, fired at `wc:includes/wc-user-functions.php:198`) writes `dokan_profile_settings` with the store name, phone, optional address, empty social links, empty payment details, `show_email = no` and `banner = 0`, plus a profile-completion block that starts at 20 % (store name 10 + phone 10; address adds 10 when street, city, ZIP and country are present). It mirrors the store name into `dokan_store_name` (`:281-282`).
- **Notification.** `save_vendor_info()` fires `dokan_new_seller_created` (`:284`). The admin's new-Vendor email (`Emails\NewSeller`, hooked at `lite:includes/Emails/NewSeller.php:38`; default subject "[{site_title}] A New vendor has registered", heading "New Vendor Registered - {seller_name}", `:53-65`) is sent to the configured recipient, by default the site admin email (`:44`). `{seller_name}` is the user's display name (`:84`), which WordPress builds as "First Last" when both names are given at insert.
- **Selling Activation** is decided during the same request by `user_register`; see [ADR-0065](./0065-a-new-vendors-selling-is-enabled-automatically-or-left-pending-according-to-the-enable-selling-setting.md). **Direct Publishing** is not written at sign-up, so a new Vendor is untrusted (see [ADR-0076](./0076-a-new-vendor-product-is-published-immediately-only-when-the-vendor-has-direct-publishing-otherwise-it-waits-as-pending-review.md)).

## Settings that change it

| Setting | Storage | Default | Effect |
|---|---|---|---|
| Address Fields | canonical `vendor_registration_address_fields`; legacy `dokan_general[enabled_address_on_reg]` (`lite:includes/Admin/Settings/Schema/SettingsSchema.php:1337-1358`) | `off` | `on`: the registration forms show store address inputs (`lite:templates/global/seller-registration-form.php:44`, `lite:templates/account/vendor-registration.php:78`) and the posted `dokan_address` is saved into the profile. `off`: no address is collected at sign-up. Address fields are not part of the server-side required list unless an add-on adds them to `dokan_seller_registration_required_fields`. |
| Terms and Conditions on registration | legacy `dokan_general[enable_tc_on_reg]`, page `dokan_pages[reg_tc_page]` | Lite itself registers no admin field for `enable_tc_on_reg` (add-ons may), and the registration forms read it with no fallback, so with nothing stored the checkbox is hidden | When the value is `on` **and** a terms page is selected, the Vendor must agree to the linked terms page to register; the forms show a required "I agree" checkbox (`lite:templates/global/seller-registration-form.php:59-66`, `lite:templates/account/vendor-registration.php:90-97`). Otherwise no checkbox is shown. |
| `dokan_seller_registration_required_fields` filter | code | five fields above | Adds or removes server-side required fields. |

## Worked example

A visitor submits the Vendor form with first name "Rina", last name "Das", phone "01700000000", store name "Rina's Crafts" and store URL `rinas-crafts`. No user has the slug `rinas-crafts`, so validation passes. The user is inserted with `user_nicename = rinas-crafts`, so the store is served at `/store/rinas-crafts/` (with the default store base). `dokan_profile_settings.store_name` and `dokan_store_name` are both "Rina's Crafts", the profile completion shows 20 %, and the admin receives the new-Vendor email with the heading "New Vendor Registered - Rina Das".

A second visitor then tries store URL `rinas-crafts` and is told "Shop URL is not available".

## Edge cases

- Uniqueness is checked on the raw posted value, while the stored slug is `sanitize_user()` of it and WordPress further runs `sanitize_title()` and appends `-2`, `-3`… on collision (`wp_insert_user()`, `wp-includes/user.php:2346-2381`). A URL that differs only in characters stripped by sanitising can therefore pass the check and be silently suffixed. A sanitised slug longer than 50 characters makes WordPress refuse to create the user (`:2366-2367`).
- Store Admin-created Vendors (`Vendor\Manager::create()`) do not go through these checks, and the "New Vendor Registered" email is not fired there; WordPress's own new-user notification is sent instead (`lite:includes/Vendor/Manager.php:224-229`).
- The Become a Vendor upgrade has a different required-field list and no uniqueness check; see [ADR-0064](./0064-a-customer-becomes-a-vendor-through-become-a-vendor-and-loses-their-previous-roles.md).

## Why

No recorded rationale beyond the code. The slug-at-insert approach follows from Lite ADR 0009 (the store URL is the user's `user_nicename`).

## Consequences & risks

- The dashboard store settings form does not offer the store URL, so for most Vendors it stays what they chose at sign-up. It can still change later: a Store Admin can edit it on the WP Admin user profile (`Admin\UserProfile::save_meta_fields()`, `lite:includes/Admin/UserProfile.php:561-567`), and the REST store update passes `user_nicename` to `Vendor\Manager::update()` (`lite:includes/Vendor/Manager.php:358-365`; parameter declared at `lite:includes/REST/StoreController.php:1226`). Any change breaks old store links.
- Because the same request also decides Selling Activation, a newly registered Vendor can be live before they have filled in an address or payment details.

## Recommendations

- Run the uniqueness check on the sanitised slug, so the Vendor sees the URL they will actually get.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
