# Legacy AJAX settings page — live behavior trace report

**Branch:** `refactor/simplify-settings-to-flat-array`
**Page:** `wp-admin/admin.php?page=dokan#/settings`
**Date:** 2026-05-14

> Source spec: `docs/superpowers/specs/2026-05-14-settings-trace-design.md`

## Tab inventory

Code (Lite) is sourced from `includes/Admin/Settings.php::get_settings_sections()`
plus the `dokan_settings_sections` filter in `includes/Intelligence/Admin/Settings.php`
(which appends `dokan_ai`). All other sections come from Dokan Pro or modules and
arrive via the same filter at runtime. **Scope updated per user:** all 30 tabs are
in scope (Lite + Pro). Dokan Pro is confirmed active on this install.

| Section id (from code / GET)     | Tab label (from DOM)         | Status                          |
| -------------------------------- | ---------------------------- | ------------------------------- |
| `dokan_general`                  | General                      | match (Lite)                    |
| `dokan_selling`                  | Selling Options              | match (Lite)                    |
| `dokan_withdraw`                 | Withdraw Options             | match (Lite)                    |
| `dokan_reverse_withdrawal`       | Reverse Withdrawal           | match (Lite)                    |
| `dokan_pages`                    | Page Settings                | match (Lite)                    |
| `dokan_appearance`               | Appearance                   | match (Lite)                    |
| `dokan_privacy`                  | Privacy Policy               | match (Lite)                    |
| `dokan_ai`                       | AI Assist                    | match (Lite — Intelligence)     |
| `dokan_geolocation`              | Geolocation                  | match (Pro — in scope)      |
| `dokan_live_search_setting`      | Live Search                  | match (Pro — in scope)      |
| `dokan_report_abuse`             | Product Report Abuse         | match (Pro — in scope)      |
| `dokan_spmv`                     | Single Product MultiVendor   | match (Pro — in scope)      |
| `dokan_store_support_setting`    | Store Support                | match (Pro — in scope)      |
| `dokan_vendor_analytics`         | Store Stats                  | match (Pro — in scope)      |
| `dokan_verification`             | Vendor Verification          | match (Pro — in scope)      |
| `dokan_verification_sms_gateways`| Verification SMS Gateways    | match (Pro — in scope)      |
| `dokan_printful`                 | Printful                     | match (Pro — in scope)      |
| `dokan_product_subscription`     | Vendor Subscription          | match (Pro — in scope)      |
| `dokan_colors`                   | Colors                       | match (Pro — in scope)      |
| `dokan_email_verification`       | Email Verification           | match (Pro — in scope)      |
| `dokan_social_api`               | Social API                   | match (Pro — in scope)      |
| `dokan_shipping_status_setting`  | Shipping Status              | match (Pro — in scope)      |
| `dokan_quote_settings`           | Quote Settings               | match (Pro — in scope)      |
| `dokan_rma`                      | RMA                          | match (Pro — in scope)      |
| `dokan_live_chat`                | Live Chat                    | match (Pro — in scope)      |
| `dokan_wholesale`                | Wholesale                    | match (Pro — in scope)      |
| `dokan_germanized`               | EU Compliance Fields         | match (Pro — in scope)      |
| `dokan_product_advertisement`    | Product Advertising          | match (Pro — in scope)      |
| `dokan_delivery_time`            | Delivery Time                | match (Pro — in scope)      |

No `code-only` (free Lite) rows missing from the DOM, and no `dom-only` rows
without a corresponding key in the initial GET response.

### Initial GET request

| Field        | Value                                                     |
| ------------ | --------------------------------------------------------- |
| URL          | `https://core-dokan.test/wp-admin/admin-ajax.php`         |
| Method       | `POST`                                                    |
| Form body    | `action=dokan_get_setting_values`, `nonce=<dokan nonce>`  |
| Status       | `200`                                                     |
| Response     | `{"success":true,"data":{ ...30 section keys... }}`        |
| Body length  | 10173 bytes                                               |
| Captured to  | `/tmp/dokan_initial_get.json`                             |

Server handler: `WeDevs\Dokan\Admin\Settings::get_settings_value()` (registered on
`wp_ajax_dokan_get_setting_values`). For each section id from
`get_settings_sections()` it calls `get_option($section_id, [])`, runs
`sanitize_options($value, 'read')`, then `apply_filters('dokan_get_settings_values', $value, $section_id)`.

## Per-tab traces

### `dokan_general` — General

**wp_option name:** `dokan_general`
**Initial GET slice keys (21):** `site_options, admin_access, custom_store_url, setup_wizard_logo_url, setup_wizard_message, disable_welcome_wizard, global_digital_mode, data_clear_on_uninstall, vendor_store_options, seller_enable_terms_and_conditions, store_products_per_page, enabled_address_on_reg, enable_tc_on_reg, enable_single_seller_mode, store_category_type, product_page_options, show_vendor_info, enabled_more_products_tab, enable_shipstation_logging, dashboard_menu_manager`
**Inventory source:** `includes/Admin/Settings.php::get_settings_fields()` (19 fields total: `general_site_options` + `general_vendor_store_options` + `general_product_page_options`) plus 1 Lite field `show_vendor_info` inserted via `dokan_settings_fields` filter (`includes/Product/VendorStoreInfo.php`). `dashboard_menu_manager` is **not** declared in `settings_fields.dokan_general`; it leaks into the persisted option and every GET/save response (see hooks below).

**Field-injection filters observed:**
- `dokan_settings_general_site_options` (priority 9) → `WeDevs\DokanPro\DigitalProduct::add_admin_setting_digital_mode` adds `global_digital_mode` (radio: sell_physical/sell_digital/sell_both).
- `dokan_settings_general_site_options` (priority 10, shipstation) → `WeDevs\DokanPro\Modules\ShipStation\Settings::add_admin_settings_fields` adds `enable_shipstation_logging` (switcher).
- `dokan_settings_general_site_options` (priority 310) → `Settings::add_dokan_data_clear_setting` (Lite) adds `data_clear_on_uninstall` (switcher).
- `dokan_settings_general_vendor_store_options` (priority 9) → `WeDevs\DokanPro\Admin\Admin::add_settings_general_vendor_store_options` adds `enable_tc_on_reg`, `enable_single_seller_mode` (switchers).
- `dokan_settings_general_vendor_store_options` (default priority) → `WeDevs\DokanPro\StoreCategory::add_admin_settings` adds `store_category_type` (radio: none/single/multiple).
- `dokan_settings_fields` → `WeDevs\Dokan\Product\VendorStoreInfo::admin_settings_for_vendor_info` inserts `show_vendor_info` after `product_page_options` (Lite, switcher).

**Hooks observed during save:**
- `dokan_save_settings_value` (priority 99) → `WeDevs\DokanPro\MenuManager\Admin\DataSource::save_admin_settings` unconditionally appends `dashboard_menu_manager` key to **every** saved section (since the inner `if` branch only fills it for the `dokan_menu_manager` section, but the assignment at line 45 runs for all sections). Confirmed: payload omits the key, persisted option and JSON response both contain `dashboard_menu_manager: []`.
- `dokan_before_saving_settings` → `set_withdraw_limit_value_validation` (no-op for `dokan_general`).
- After `update_option`, `Settings::save_settings_value` flushes rewrite rules **only if** `custom_store_url` actually changed (compares old vs new). Save A changed it (`store` → `__t_store_001`) → rewrite flushed. Save B reverted (`__t_store_001` → `store`) → rewrite flushed again.
- `sanitize_custom_store_url` (registered via `sanitize_callback`) throws `DokanException` when the value matches a WordPress reserved slug (e.g. `admin`, `wp-admin`). Empty values pass through unchanged.

**Save A (positive, sentinels):** request `POST /wp-admin/admin-ajax.php` form-encoded `action=dokan_save_settings`, `nonce=<window.dokan.nonce>`, `section=dokan_general`, `settingsData[<key>]=<sentinel>` (19 payload keys). Response `200 {"success":true,"data":{"message":"...","settings":{"name":"dokan_general","value":{...20 keys...}}}}`. wp_option dump matches response value exactly. No new `dokan_*` wp_options were created (diff against baseline = empty).

**Save B (negative, defaults/empty):** flipped all toggles back, radios/selects → default options, emptied text/url/textarea/number. Same 200 response shape. Empty `store_products_per_page` was accepted as empty string (no server-side default fallback). Empty `setup_wizard_message` accepted (no autop / no default fallback).

**Round-trip (post-save GET):** every payload value matches the next `dokan_get_setting_values` response. No reshape, no autop, no default backfill on read.

| Field | UI control | Type | Default | Sentinel sent (A) | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ----------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| site_options | (header) | sub_section | — | "" | settingsData[site_options] | data.settings.value.site_options | dokan_general.site_options | (none) | Y | UI-only sub_section header; persisted as empty string (no sanitize callback). Can be dropped from new schema. |
| admin_access | toggle | switcher | "on" | "off" | settingsData[admin_access] | data.settings.value.admin_access | dokan_general.admin_access | (none) | Y | — |
| custom_store_url | text | text | "store" | "__t_store_001" | settingsData[custom_store_url] | data.settings.value.custom_store_url | dokan_general.custom_store_url | (none directly) | Y | sanitize_callback `sanitize_custom_store_url` throws on reserved slugs; change triggers `dokan()->rewrite->register_rule()` + `flush_rewrite_rules()` (side effect, not a separate wp_option). |
| setup_wizard_logo_url | file picker | file | "" | "https://example.test/__T/logo_A.png" | settingsData[setup_wizard_logo_url] | data.settings.value.setup_wizard_logo_url | dokan_general.setup_wizard_logo_url | (none) | Y | Raw URL stored; no sanitize callback. The "file" type is a media library reference, but persisted value is the URL string. |
| setup_wizard_message | rich text | wpeditor | (i18n welcome string) | "<p>__T_msg_001_lorem</p>" | settingsData[setup_wizard_message] | data.settings.value.setup_wizard_message | dokan_general.setup_wizard_message | (none) | Y | No wpautop on save; raw HTML stored. Empty payload accepted (no default fallback). |
| disable_welcome_wizard | toggle | switcher | "off" | "on" | settingsData[disable_welcome_wizard] | data.settings.value.disable_welcome_wizard | dokan_general.disable_welcome_wizard | (none) | Y | — |
| global_digital_mode | radio | radio | "sell_both" | "sell_digital" | settingsData[global_digital_mode] | data.settings.value.global_digital_mode | dokan_general.global_digital_mode | (none) | Y | Pro-only (`DigitalProduct`); options filterable via `dokan_digital_product_types`. |
| enable_shipstation_logging | toggle | switcher | "off" | "on" | settingsData[enable_shipstation_logging] | data.settings.value.enable_shipstation_logging | dokan_general.enable_shipstation_logging | (none) | Y | Pro module ShipStation. Field lives in General even though logically a Selling/Shipping concern (legacy placement). |
| data_clear_on_uninstall | toggle | switcher | "off" | "on" | settingsData[data_clear_on_uninstall] | data.settings.value.data_clear_on_uninstall | dokan_general.data_clear_on_uninstall | (none directly at save time) | Y | Lite field appended at priority 310. Side effect happens only during plugin uninstall (`uninstall.php`), not on save. |
| vendor_store_options | (header) | sub_section | — | "" | settingsData[vendor_store_options] | data.settings.value.vendor_store_options | dokan_general.vendor_store_options | (none) | Y | UI-only sub_section header. Persisted as empty string. |
| seller_enable_terms_and_conditions | toggle | switcher | "off" | "on" | settingsData[seller_enable_terms_and_conditions] | data.settings.value.seller_enable_terms_and_conditions | dokan_general.seller_enable_terms_and_conditions | (none) | Y | — |
| store_products_per_page | number | number | "12" | "4242" | settingsData[store_products_per_page] | data.settings.value.store_products_per_page | dokan_general.store_products_per_page | (none) | Y | Stored as string. Empty value (Save B) accepted unchanged — no server-side fallback to default `12`. |
| enabled_address_on_reg | toggle | switcher | "off" | "on" | settingsData[enabled_address_on_reg] | data.settings.value.enabled_address_on_reg | dokan_general.enabled_address_on_reg | (none) | Y | — |
| enable_tc_on_reg | toggle | switcher | "on" | "off" | settingsData[enable_tc_on_reg] | data.settings.value.enable_tc_on_reg | dokan_general.enable_tc_on_reg | (none) | Y | Pro field (`Admin::add_settings_general_vendor_store_options`). |
| enable_single_seller_mode | toggle | switcher | "off" | "on" | settingsData[enable_single_seller_mode] | data.settings.value.enable_single_seller_mode | dokan_general.enable_single_seller_mode | (none) | Y | Pro field. |
| store_category_type | radio | radio | "none" | "multiple" | settingsData[store_category_type] | data.settings.value.store_category_type | dokan_general.store_category_type | (none directly on save) | Y | Pro field (`StoreCategory`). Note: separate `set_default_category` hook listens for a different key `store_category_default` (not surfaced in this section) and writes wp_option `default_store_category` — that's not exercised by any field in `dokan_general` as currently registered. |
| product_page_options | (header) | sub_section | — | "" | settingsData[product_page_options] | data.settings.value.product_page_options | dokan_general.product_page_options | (none) | Y | UI-only sub_section header. |
| show_vendor_info | toggle | switcher | "off" | "on" | settingsData[show_vendor_info] | data.settings.value.show_vendor_info | dokan_general.show_vendor_info | (none) | Y | Lite, inserted via `dokan_settings_fields` (not `dokan_settings_general_*`). |
| enabled_more_products_tab | toggle | switcher | "on" | "off" | settingsData[enabled_more_products_tab] | data.settings.value.enabled_more_products_tab | dokan_general.enabled_more_products_tab | (none) | Y | — |
| dashboard_menu_manager | (none — not declared in General field list) | — | — | (not sent) | (not in payload) | data.settings.value.dashboard_menu_manager = [] | dokan_general.dashboard_menu_manager = [] | (none) | N/A | **Leak**: appended on every save by `WeDevs\DokanPro\MenuManager\Admin\DataSource::save_admin_settings` (filter `dokan_save_settings_value`, priority 99). It also appears in the initial GET because it's now persisted. New schema should ignore this key when writing the General section. |

### `dokan_selling` — Selling Options

**wp_option name:** `dokan_selling`
**Initial GET slice keys (21):** `admin_percentage, shipping_fee_recipient, tax_fee_recipient, shipping_tax_fee_recipient, selling_capabilities, new_seller_enable_selling, one_step_product_create, disable_product_popup, order_status_change, dokan_any_category_selection, commission_type, additional_fee, commission_fixed_values, fee-recipients, commission_category_based_values, allow_vendor_create_manual_order, reset_sub_category_when_edit_all_category, catalog_mode_settings, catalog_mode_hide_add_to_cart_button, catalog_mode_hide_product_price, dashboard_menu_manager` (plus Pro-injected `min_max_*`, `discount_*`, `product_status`, vendor-capability switches in the persisted snapshot — see initial GET slice in `/tmp/dokan_initial_get.json`; current run focuses on Lite-declared fields).
**Inventory source:** `includes/Admin/Settings.php::get_settings_fields()` → `selling_option_commission` + `selling_option_fees` + `selling_option_vendor_capability`, merged under filter `dokan_settings_selling_options`. Lite adds Catalog Mode fields via `WeDevs\Dokan\CatalogMode\Admin\Settings::admin_settings` (filter priority 10). Lite-only field count = **19** declared (3 sub-section headers + 16 functional fields) + 3 Catalog Mode (1 header + 2 functional) = **22 rows**. The repeater `commission_category_based_values` is declared but only renders when commission_type=`category_based` and is annotated `dokan_pro_commission` = yes (Pro UI, but the field exists in the Lite schema and round-trips through Lite save handlers).

**Field-injection filters observed (Lite + Pro):**
- `dokan_settings_selling_option_commission` (priority 10) → Lite declares the commission sub-tree (`commission_type`, `commission_fixed_values`, `reset_sub_category_when_edit_all_category`, `commission_category_based_values`).
- `dokan_settings_selling_option_fees` (priority 10) → Lite declares fee-recipient radios.
- `dokan_settings_selling_option_vendor_capability` (priority 9) → `WeDevs\DokanPro\Admin\Admin::add_settings_selling_option_vendor_capability` inserts Pro vendor-capability switches (`product_status`, `vendor_duplicate_product`, `product_category_style`, `product_vendors_can_create_tags`, `add_new_attribute`, `hide_customer_info`, `seller_review_manage`, etc.).
- `dokan_settings_selling_option_vendor_capability` (priority 10) → `WeDevs\DokanPro\Shipping\Hooks::add_settings_shipping_tab` adds `disable_shipping_tab`.
- `dokan_settings_selling_option_vendor_capability` (priority 10) → `Modules\ProductEnquiry::guest_user_settings` adds `enable_guest_user_enquiry`.
- `dokan_settings_selling_option_vendor_capability` (priority 11) → `WeDevs\DokanPro\VendorDiscount\Admin\Settings::add_discount_settings` adds `discount_edit_section`, `discount_edit` repeater.
- `dokan_settings_selling_option_vendor_capability` (default 10) → `Dashboard\ManualOrders\Settings::add_manual_order_settings_field` adds `allow_vendor_create_manual_order`.
- `dokan_settings_selling_option_vendor_capability` (default 10) → Pro Min/Max module adds `min_max_sub_section`, `enable_min_max_quantity`, `enable_min_max_amount`.
- `dokan_settings_selling_options` (priority 10) → `WeDevs\Dokan\CatalogMode\Admin\Settings::admin_settings` appends Catalog Mode block (Lite).
- (None of these Pro fields are tested in this Lite-only Save A; their initial-GET values pass through unchanged because the payload does not include them when only Lite UI is loaded.)

**Hooks observed during save / read:**
- `dokan_get_settings_values` (priority 10) → `Settings::set_commission_type_if_not_set` — empty `commission_type` mapped to `fixed` on read **and** on the post-save response (since the response builder runs the same filter chain). Confirmed by Save-B sub-case `B_commission_type_empty`.
- `dokan_save_settings_value` (priority 10) → `Settings::validate_fixed_price_values` — when `commission_type ∈ {flat, fixed}` and `admin_percentage < 0` or `> 100`, replaces with `dokan_get_option('admin_percentage','dokan_selling','0')`. **Gotcha:** if the previously-saved `admin_percentage` is an empty string, the clamp returns `""` not `"0"` (dokan_get_option only returns the third-arg default when the key is unset, not when stored as `''`). Confirmed by sub-cases `B_admin_percentage_150_fixed` and `B_admin_percentage_neg10_flat`.
- `dokan_get_settings_values` chain → `Settings::get_settings_value` then runs a special **legacy mapper** (line 131–138): if `new_seller_enable_selling` is `'on'` → `'automatically'`; if `'off'` → `'manually'`. Runs only on the dedicated GET endpoint (`dokan_get_setting_values`), **not** on the post-save response builder — so save response returns the raw `'on'`/`'off'`, while next page-load GET returns the mapped string. Confirmed by Save-B sub-cases `B_new_seller_enable_selling_legacy_on/off` followed by reload GET.
- `dokan_save_settings_value` (priority 99) → Pro MenuManager `DataSource::save_admin_settings` leak — writes `dashboard_menu_manager: []` to every saved section (not Selling-specific). Confirmed: payload omits the key, response and wp_option both contain `dashboard_menu_manager: []`.
- `dokan_before_saving_settings` / `dokan_after_saving_settings` — no Selling-specific side effects observed in Lite. (The withdraw_limit validation in `WithdrawLimit` only acts on `dokan_withdraw`.)
- `update_option` replaces the **entire** `wp_option` value with the sanitized payload — there is **no merge**. A save payload that omits a key effectively deletes that key from the persisted option. This is critical for the new flat-array schema design.

**Save A (positive, sentinels):** `POST /wp-admin/admin-ajax.php` form-encoded with 22 keys including nested `commission_category_based_values[all][flat]=7` and `[percentage]=13`. Response `200 {"success":true,"data":{"settings":{"name":"dokan_selling","value":{...21 keys + dashboard_menu_manager leak...}}}}`. wp_option dump matches response exactly. No new `dokan_*` options created (diff against baseline = empty).

**Save B (negative + filter-validation):** flipped toggles, switched `commission_type` to `percentage`, reset category-commission to defaults, emptied numeric fields. Four extra sub-cases recorded inline in `dokan_selling_save_B.json` cover the `admin_percentage` clamp behaviour, empty `commission_type`, and legacy `new_seller_enable_selling` values. Final wp_option state (after restoring B-negative) matches the response value.

**Round-trip (post-save GET via `dokan_get_setting_values`):** captured in `dokan_selling_reload.json`. Every Save-A sentinel matches verbatim. Server-side mutations occur **only** on these keys:
- `commission_type` empty → mutated to `'fixed'` on every read.
- `new_seller_enable_selling` legacy `'on'`/`'off'` → mapped to `'automatically'`/`'manually'` on read.
- `admin_percentage` out-of-range → clamped on save (not on read).

| Field | UI control | Type | Default | Sentinel sent (A) | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ----------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| commission | (header) | sub_section | — | "" | settingsData[commission] | data.settings.value.commission | dokan_selling.commission | (none) | Y | UI-only sub_section header; persisted as empty string. |
| commission_type | select | select | "fixed" | "flat" | settingsData[commission_type] | data.settings.value.commission_type | dokan_selling.commission_type | (none) | Y | Mutated by `set_commission_type_if_not_set` filter when empty → `"fixed"` on every read. Options sourced from `dokan_commission_types()` (`fixed`, `flat`, `percentage`, `category_based` and Pro-extended like `combine`). |
| commission_fixed_values | composite (percent + flat) | commission_fixed | "fixed" (meta) | "" (parent key) | settingsData[commission_fixed_values] | data.settings.value.commission_fixed_values | dokan_selling.commission_fixed_values | (none) | Y | Composite render-only wrapper. The actual data lives in sibling keys `admin_percentage` and `additional_fee`. Persisted as empty string. `show_if: commission_type == fixed`. |
| &nbsp;&nbsp;admin_percentage | text (number) | text | "10" | "42" | settingsData[admin_percentage] | data.settings.value.admin_percentage | dokan_selling.admin_percentage | (none) | Y | sanitize_callback `wc_format_decimal` on save; `wc_format_decimal` on response. **Clamped** by `validate_fixed_price_values` to previously-saved value if outside [0,100] when `commission_type ∈ {flat,fixed}`. |
| &nbsp;&nbsp;additional_fee | text (number) | text | "10" | "4242" | settingsData[additional_fee] | data.settings.value.additional_fee | dokan_selling.additional_fee | (none) | Y | sanitize_callback `wc_format_decimal` on save; `wc_format_localized_price` on response (so the response value can be a localized string like `"4,242.00"` depending on WC settings — in this test the WC site uses US/en, so it returned `"4242"` unchanged). Same callback on read. |
| reset_sub_category_when_edit_all_category | toggle | switcher | "on" | "off" | settingsData[reset_sub_category_when_edit_all_category] | data.settings.value.reset_sub_category_when_edit_all_category | dokan_selling.reset_sub_category_when_edit_all_category | (none) | Y | `show_if: commission_type == category_based`. Not surfaced in UI when commission_type=flat, but still round-trips via save payload. |
| commission_category_based_values | repeater (per-category) | category_based_commission | (none — Pro field) | { all: { flat: "7", percentage: "13" } } | settingsData[commission_category_based_values][&lt;cat&gt;][flat/percentage] | data.settings.value.commission_category_based_values | dokan_selling.commission_category_based_values | (none) | Y | Pro renders the repeater; Lite save handler accepts the nested array verbatim (no sanitize callback registered for the parent key). Required: `all` key (default category) must always exist. |
| fee-recipients | (header) | sub_section | — | "" | settingsData[fee-recipients] | data.settings.value.fee-recipients | dokan_selling.fee-recipients | (none) | Y | UI-only sub_section header. Note the hyphenated key — a candidate for renaming in the new schema. |
| shipping_fee_recipient | radio | radio | "seller" | "admin" | settingsData[shipping_fee_recipient] | data.settings.value.shipping_fee_recipient | dokan_selling.shipping_fee_recipient | (none) | Y | Options: `seller`/`admin`. |
| tax_fee_recipient | radio | radio | "seller" | "admin" | settingsData[tax_fee_recipient] | data.settings.value.tax_fee_recipient | dokan_selling.tax_fee_recipient | (none) | Y | Options: `seller`/`admin`. |
| shipping_tax_fee_recipient | radio | radio | "seller" | "admin" | settingsData[shipping_tax_fee_recipient] | data.settings.value.shipping_tax_fee_recipient | dokan_selling.shipping_tax_fee_recipient | (none) | Y | Options: `seller`/`admin`. |
| selling_capabilities | (header) | sub_section | — | "" | settingsData[selling_capabilities] | data.settings.value.selling_capabilities | dokan_selling.selling_capabilities | (none) | Y | UI-only sub_section header. |
| new_seller_enable_selling | select | select | "automatically" | "manually" | settingsData[new_seller_enable_selling] | data.settings.value.new_seller_enable_selling | dokan_selling.new_seller_enable_selling | (none) | Y (modern values) / Mapped on read (legacy values) | Options: `automatically`/`manually`. Legacy values `'on'`/`'off'` are stored verbatim on save and mapped to `automatically`/`manually` by `Settings::get_settings_value` on the dedicated GET endpoint (mapper not applied to the post-save response). New schema should normalize to modern values on write to drop the legacy mapper. |
| one_step_product_create | toggle | switcher | "on" | "off" | settingsData[one_step_product_create] | data.settings.value.one_step_product_create | dokan_selling.one_step_product_create | (none) | Y | Controls visibility of `disable_product_popup`. |
| disable_product_popup | toggle | switcher | "off" | "on" | settingsData[disable_product_popup] | data.settings.value.disable_product_popup | dokan_selling.disable_product_popup | (none) | Y | `show_if: dokan_selling.one_step_product_create == off` — note the qualified `<section>.<field>` syntax in show_if (vs unqualified used elsewhere). |
| order_status_change | toggle | switcher | "on" | "off" | settingsData[order_status_change] | data.settings.value.order_status_change | dokan_selling.order_status_change | (none) | Y | — |
| dokan_any_category_selection | toggle | switcher | "off" | "on" | settingsData[dokan_any_category_selection] | data.settings.value.dokan_any_category_selection | dokan_selling.dokan_any_category_selection | (none) | Y | Key uniquely prefixed with `dokan_` (other Selling keys are unprefixed) — likely a renaming candidate. |
| catalog_mode_settings | (header) | sub_section | — | "" | settingsData[catalog_mode_settings] | data.settings.value.catalog_mode_settings | dokan_selling.catalog_mode_settings | (none) | Y | UI-only sub_section header. Injected by `CatalogMode\Admin\Settings::admin_settings` via `dokan_settings_selling_options` filter. |
| catalog_mode_hide_add_to_cart_button | toggle | switcher | "off" | "on" | settingsData[catalog_mode_hide_add_to_cart_button] | data.settings.value.catalog_mode_hide_add_to_cart_button | dokan_selling.catalog_mode_hide_add_to_cart_button | (none) | Y | Lite (CatalogMode). |
| catalog_mode_hide_product_price | toggle | switcher | "off" | "on" | settingsData[catalog_mode_hide_product_price] | data.settings.value.catalog_mode_hide_product_price | dokan_selling.catalog_mode_hide_product_price | (none) | Y | Lite (CatalogMode). `show_if: catalog_mode_hide_add_to_cart_button == on`. |
| dashboard_menu_manager | (none — not declared in Selling field list) | — | — | (not sent) | (not in payload) | data.settings.value.dashboard_menu_manager = [] | dokan_selling.dashboard_menu_manager = [] | (none) | N/A | **Leak**: same as in `dokan_general`. Appended on every save by Pro MenuManager `DataSource::save_admin_settings` at priority 99. Not a Selling field — listed here only because it persists into the option. New schema should ignore. |

**Filter validation findings:**
- `admin_percentage = 150` with `commission_type = fixed` → response: `""`, DB: `""`, verdict: **clamped** (filter `validate_fixed_price_values` replaced with `dokan_get_option('admin_percentage','dokan_selling','0')`; because the previously-stored value was `""`, the "default" used for clamping is the empty string, not `'0'`). The filter's safety net is brittle if the option is ever stored empty.
- `admin_percentage = -10` with `commission_type = flat` → response: `""`, DB: `""`, verdict: **clamped** (same behavior). `flat` and `fixed` are both treated by `validate_fixed_price_values`.
- `commission_type = ""` → save response: `"fixed"` (immediate, because the response builder runs the same `dokan_get_settings_values` filter chain); subsequent GET-after-save returns `"fixed"` as well; **DB stores the empty string** literally — only the read pipeline injects `fixed`. Verdict: read-time normalization, not write-time. The persisted column can hold `""`; renderer/consumer must always go through the filter or the new schema must normalize on write.
- `new_seller_enable_selling = "on"` (legacy) → save response: `"on"` (raw, mapper not applied); next GET via `dokan_get_setting_values`: `"automatically"`. DB stores `"on"`.
- `new_seller_enable_selling = "off"` (legacy) → save response: `"off"`; next GET (by symmetry): `"manually"`. DB stores `"off"`.



## Side-effect / hook checklist

_Filled in Task N+1 (final pass)._

## Surprises

_Filled in Task N+1 (final pass)._

## What the new (plugin-ui) page must reproduce

_Filled in Task N+1 (final pass)._
