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



### `dokan_withdraw` — Withdraw Options

**wp_option name:** `dokan_withdraw`
**Initial GET slice keys (19, after Pro injections):** `withdraw_methods, withdraw_method_name, withdraw_method_type, withdraw_charges, withdraw_limit, withdraw_order_status, exclude_cod_payment, withdraw_date_limit, hide_withdraw_option, disbursement_schedule_settings, disbursement, disbursement_schedule, quarterly_schedule, monthly_schedule, biweekly_schedule, weekly_schedule, send_announcement_for_payment_change, send_announcement_for_disbursement_schedule_change, dashboard_menu_manager`
**Inventory source:** `includes/Admin/Settings.php::get_settings_fields()` declares 5 Lite fields (`withdraw_methods, withdraw_charges, withdraw_limit, withdraw_order_status, exclude_cod_payment`). Dokan Pro injects 11 more via the `dokan_settings_fields` filter:
- `withdraw_date_limit`, `hide_withdraw_option` from `dokan-pro/includes/Admin/Admin.php::load_settings_sections_fields`.
- `withdraw_method_name`, `withdraw_method_type` from `dokan-pro/includes/CustomWithdrawMethod.php::custom_withdraw_method_admin_settings` (inserted after `withdraw_methods`, both `show_if` `withdraw_methods contains dokan_custom`).
- `disbursement_schedule_settings` (sub_section), `disbursement`, `disbursement_schedule`, `quarterly_schedule`, `monthly_schedule`, `biweekly_schedule`, `weekly_schedule` from `dokan-pro/includes/Withdraw/Manager.php::withdraw_disbursement_schedule_settings`.

Total: **16 declared field slots** (15 input fields + 1 `sub_section` non-input). `send_announcement_for_payment_change` and `send_announcement_for_disbursement_schedule_change` are NOT declared fields — they are write-only trigger flags consumed during save in `Withdraw/Manager.php` (lines ~1133, 1166). They appear in the initial GET as residual `"false"` strings because they were persisted by a prior save and pass through `sanitize_options(...,'read')` untouched. `dashboard_menu_manager` is the Pro MenuManager priority-99 cross-tab leak (not Withdraw-specific). Live `dokan_withdraw_get_methods()` returned 7 keys at trace time: `bank, dokan-paypal-marketplace, dokan-stripe-connect, dokan_custom, dokan_stripe_express, paypal, skrill`. (The baseline GET had a stray `stripe` key — legacy persisted from an older registration; it was stripped from the response on the next save.)

**Available withdraw methods (live):** `bank, dokan-paypal-marketplace, dokan-stripe-connect, dokan_custom, dokan_stripe_express, paypal, skrill`
**Available withdraw_order_status options (live):** `wc-completed, wc-on-hold, wc-processing`

**Hooks observed:**
- `dokan_get_settings_values` (priority 10) → `WeDevs\Dokan\Admin\Settings::set_withdraw_limit_gateways` — runs on every read of `dokan_withdraw`. If the option value is empty, injects `withdraw_methods => ['paypal' => 'paypal']`. Then unconditionally runs `wp_parse_args($value['withdraw_methods'], array_fill_keys(array_keys(dokan_withdraw_get_methods()),''))` — so every read returns ALL known method ids in `withdraw_methods`, with `''` for unselected ones.
- `dokan_save_settings_value` priority 99 → Pro MenuManager leak (writes `dashboard_menu_manager: []` into the persisted option on every save; not Withdraw-specific).
- `dokan_save_settings_value` (Pro) → `WeDevs\DokanPro\CustomWithdrawMethod::validate_custom_withdraw_method_admin_settings` — if `dokan_custom` is selected AND value is non-empty, requires `withdraw_method_name` and `withdraw_method_type` both non-empty; otherwise short-circuits with `wp_send_json_error` and DB is untouched.
- `dokan_save_settings_value` (Pro) → validator that rejects `withdraw_limit < 0` with message "Minimum Withdraw Limit can't be negative value." (located somewhere in Pro; confirmed empirically — not in Lite).
- `dokan_settings_withdraw_methods_default` filter → wraps the `paypal => paypal` default so Pro/marketplace plugins can change the empty-option default.
- `dokan_settings_withdraw_order_status_options` filter → wraps the order status options list.

| Field | UI control | Type | Default | Sentinel sent | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| `withdraw_methods` | multicheck (Lite) | `multicheck` | `{paypal: paypal}` (filterable via `dokan_settings_withdraw_methods_default`) | `{paypal: paypal, bank: bank}` | `settingsData[withdraw_methods][<key>]` | `data.settings.value.withdraw_methods` | `dokan_withdraw.withdraw_methods` | none | **yes (with read-time enrichment)** — DB stores only selected keys; response/GET expands to all 7 known methods with `''` for unselected. | Empty payload persists as empty STRING `s:0:""`, not empty array. |
| `withdraw_method_name` | text (Pro) | `text` | (none) | `__T_wmn_001` | `settingsData[withdraw_method_name]` | `data.settings.value.withdraw_method_name` | `dokan_withdraw.withdraw_method_name` | none | yes | `show_if withdraw_methods contains dokan_custom`. Required if `dokan_custom` selected (Pro validator). |
| `withdraw_method_type` | text (Pro) | `text` | (none) | `__T_wmt_001` | `settingsData[withdraw_method_type]` | `data.settings.value.withdraw_method_type` | `dokan_withdraw.withdraw_method_type` | none | yes | Same `show_if` + validator as above. |
| `withdraw_charges` | charges grid (Lite) | `charges` | `dokan_withdraw_get_method_charges()` | `{paypal: {fixed:7.89,percentage:10.11}, bank:{fixed:1.23,percentage:4.56}, ...}` | `settingsData[withdraw_charges][<method>][fixed\|percentage]` | `data.settings.value.withdraw_charges` | `dokan_withdraw.withdraw_charges` | triggers `refresh_after_save: true` flag → frontend re-fetches field config | yes (per-method sub-keys preserved) | `show_if withdraw_methods contains-any <any known method>`. Charges for unselected methods still round-trip if sent. |
| `withdraw_limit` | text/decimal (Lite) | `text` (`wc_input_price`) | `'50'` | `4242` | `settingsData[withdraw_limit]` | `data.settings.value.withdraw_limit` | `dokan_withdraw.withdraw_limit` | none | yes (as string) | `sanitize_callback: wc_format_decimal`, `response_sanitize_callback: wc_format_localized_price`. Negative values rejected by Pro validator. `0` accepted (semantic: "no minimum"). |
| `withdraw_order_status` | multicheck (Lite) | `multicheck` | `{wc-completed: wc-completed}` | `{wc-processing: wc-processing}` | `settingsData[withdraw_order_status][<status>]` | `data.settings.value.withdraw_order_status` | `dokan_withdraw.withdraw_order_status` | none | yes (only selected keys persist) | Live options: `wc-completed, wc-on-hold, wc-processing`. Filter `dokan_settings_withdraw_order_status_options` may alter. |
| `exclude_cod_payment` | switcher (Lite) | `switcher` | `'off'` | `'on'` | `settingsData[exclude_cod_payment]` | `data.settings.value.exclude_cod_payment` | `dokan_withdraw.exclude_cod_payment` | none | yes | Read by `Order/Hooks.php` + `Order/RefundHandler.php`. |
| `withdraw_date_limit` | number (Pro) | `number` | `'0'` | `7` | `settingsData[withdraw_date_limit]` | `data.settings.value.withdraw_date_limit` | `dokan_withdraw.withdraw_date_limit` | none | yes (as string) | "Withdraw Threshold" days. `0` means disabled. |
| `hide_withdraw_option` | switcher (Pro) | `switcher` | `'off'` | `'on'` | `settingsData[hide_withdraw_option]` | `data.settings.value.hide_withdraw_option` | `dokan_withdraw.hide_withdraw_option` | none | yes | — |
| `disbursement_schedule_settings` | sub_section (Pro, non-input) | `disbursement_sub_section` | n/a | `''` | (not posted as an input) | `data.settings.value.disbursement_schedule_settings` (`''`) | `dokan_withdraw.disbursement_schedule_settings` (`''`) | none | yes (as empty string) | Layout-only field; persists as empty string because the section is iterated for sanitize. |
| `disbursement` | disbursement_method (Pro) | `disbursement_method` | `{manual: manual}` | `{manual: manual}` | `settingsData[disbursement][<mode>]` | `data.settings.value.disbursement` | `dokan_withdraw.disbursement` | none | yes (only selected keys persist) | Allowed values: `manual`, `schedule`. |
| `disbursement_schedule` | disbursement_type (Pro) | `disbursement_type` | `{quarterly:'', monthly:'', biweekly:'', weekly:''}` (all unselected) | `{monthly: monthly}` | `settingsData[disbursement_schedule][<freq>]` | `data.settings.value.disbursement_schedule` | `dokan_withdraw.disbursement_schedule` | none | yes (only selected keys persist) | Frequencies: quarterly, monthly, biweekly, weekly. |
| &nbsp;&nbsp;`quarterly_schedule` | schedule_quarterly (Pro) | `schedule_quarterly` | `{month: march, week: '1', days: monday}` | `{month: june, week: '2', days: tuesday}` | `settingsData[quarterly_schedule][month\|week\|days]` | `data.settings.value.quarterly_schedule` | `dokan_withdraw.quarterly_schedule` | none | yes (per sub-key) | Sub-keys: `month`, `week`, `days`. |
| &nbsp;&nbsp;`monthly_schedule` | schedule_monthly (Pro) | `schedule_monthly` | `{week: '1', days: monday}` | `{week: '2', days: wednesday}` | `settingsData[monthly_schedule][week\|days]` | `data.settings.value.monthly_schedule` | `dokan_withdraw.monthly_schedule` | none | yes (per sub-key) | — |
| &nbsp;&nbsp;`biweekly_schedule` | schedule_biweekly (Pro) | `schedule_biweekly` | `{week: '1', days: monday}` | `{week: '2', days: thursday}` | `settingsData[biweekly_schedule][week\|days]` | `data.settings.value.biweekly_schedule` | `dokan_withdraw.biweekly_schedule` | none | yes (per sub-key) | — |
| &nbsp;&nbsp;`weekly_schedule` | schedule_weekly (Pro) | `schedule_weekly` | `'monday'` | `'friday'` | `settingsData[weekly_schedule]` | `data.settings.value.weekly_schedule` | `dokan_withdraw.weekly_schedule` | none | yes | Scalar string day name. |

**Filter validation findings:**
- **Empty-option default:** `wp option delete dokan_withdraw` + fresh `dokan_get_setting_values` GET → `dokan_withdraw` slice contains ONLY `withdraw_methods` key, value `{ paypal: 'paypal', bank: '', 'dokan-paypal-marketplace': '', 'dokan-stripe-connect': '', dokan_custom: '', dokan_stripe_express: '', skrill: '' }`. Verdict: **paypal-only default fires** (via `dokan_settings_withdraw_methods_default` filter wrapping `['paypal' => 'paypal']`), then `wp_parse_args` expands against all 7 live methods. No other declared field re-appears — they would only surface once a save persists them.
- **All methods disabled:** save with `withdraw_methods: {}` → response shows all 7 methods with `''` values; raw DB stores `withdraw_methods` as **empty STRING** `s:0:""` (verified via `wp db query`). Verdict: **accepted as empty** at write; server re-injects the all-methods shape (all `''`) ONLY on read. The empty-option PayPal default does NOT re-fire (option still exists, just contents are empty).
- **`withdraw_limit = -1`** → response `success: false`, message `Validation error`, errors `[{name: withdraw_limit, error: "Minimum Withdraw Limit can't be negative value."}]`; DB unchanged. Verdict: **rejected** by Pro validator before `update_option`.
- **`withdraw_limit = 0`** → response `success: true`, DB stores `'0'` (string). Verdict: **accepted**; downstream consumers treat `0` as "no minimum".
- **Custom-method blank validation:** with `dokan_custom` selected and `withdraw_method_name=''` + `withdraw_method_type=''`, response is `success: false` with errors for both fields. Save short-circuits; DB unchanged. Source: Pro `CustomWithdrawMethod::validate_custom_withdraw_method_admin_settings`.
- **Stale-method drop:** baseline GET surfaced a `stripe` key in `withdraw_methods` (legacy persisted). Re-saving without it (or with it explicitly) DROPS `stripe` from response/DB because `dokan_withdraw_get_methods()` no longer registers `stripe`. Verdict: **read-time strip via `wp_parse_args` against the live method registry** — unknown method ids are silently discarded.
- **Pro `send_announcement_*` keys:** present in baseline GET as `"false"` strings, but absent from the field schema. Any save that doesn't echo them in `settingsData` will lose them (confirmed in Save A — they disappeared from response and DB). Verdict: write-only trigger semantics expected; the persistence-via-omission is a footgun for the new flat-array schema.
- **Post-save async refresh request (`dokan_refresh_admin_settings_field_options` or similar):** observed N — no follow-up XHR fired after Save A or any Save B sub-case in the AJAX channel. `withdraw_charges` declares `refresh_after_save: true` but the frontend (legacy Vue page) consumes that flag client-side without an extra round-trip; the React/plugin-ui rewrite will need to re-implement this client-side refresh signal.

### `dokan_reverse_withdrawal` — Reverse Withdrawal

**wp_option name:** `dokan_reverse_withdrawal`
**Initial GET slice keys (baseline, option non-existent in DB):** `[]` — the option does not exist in `wp_options` on a fresh install; AJAX `dokan_get_setting_values` returns it as an empty PHP array. No filter applies a default at read time.
**Inventory source:** `includes/ReverseWithdrawal/Admin/Settings.php::load_settings_fields()` (hooked on `dokan_settings_fields` priority 21). Declares **8 Lite input fields** + 1 Pro-conditional field (`send_announcement`, only registered when `dokan()->is_pro_exists()`):
- `enabled` (switcher), `payment_gateways` (multicheck, options from `SettingsHelper::get_reverse_withrawal_payment_gateways()` filterable via `dokan_reverse_withdrawal_payment_gateways`), `billing_type` (select, options via `dokan_reverse_withdrawal_billing_type_options`), `reverse_balance_threshold` (number, `show_if billing_type=by_amount`), `monthly_billing_day` (number 1..28, `show_if billing_type=by_month`), `due_period` (number 0..28), `failed_actions` (multicheck, options via `dokan_reverse_withdrawal_failed_payment_actions`), `display_notice` (switcher).
- Pro-only: `send_announcement` (switcher) — gated by `dokan()->is_pro_exists()`. Live in this environment because Pro IS active.

The whole field set is finally wrapped by `apply_filters( 'dokan_reverse_withdrawal_setting_fields', $settings_fields )` before being attached to `$fields['dokan_reverse_withdrawal']`.

**Hooks observed:**
- `dokan_settings_fields` priority 21 → `WeDevs\Dokan\ReverseWithdrawal\Admin\Settings::load_settings_fields` — declares all 8 (+1 Pro) fields.
- `dokan_reverse_withdrawal_setting_fields` filter → final mutation point for the field array (Pro / addons can append/override).
- `dokan_reverse_withdrawal_payment_gateways` / `_billing_type_options` / `_failed_payment_actions` filters → mutate the `options` lists for the three select/multicheck fields.
- `dokan_before_saving_settings` priority 20 → `Settings::validate_admin_settings` — synchronous validation (see "Filter / boundary findings" below); short-circuits with `wp_send_json_error(400)` on any failure, leaving DB untouched.
- `dokan_after_saving_settings` priority 20 → `Settings::create_reverse_withdrawal_base_product` — lazily creates the WC product used to charge vendors on cart-payment path.
- `dokan_after_saving_settings` priority 10 → `BackgroundProcess\CronActions::after_save_settings` — schedules/unschedules `dokan_reverse_withdrawal_monthly_cron` based on `enabled` + `billing_type` + `monthly_billing_day`. When `enabled=off`, BOTH monthly and (via `schedule_action()`) midnight crons are unscheduled.
- Action Scheduler hook `dokan_reverse_withdrawal_midnight_cron` (daily) + `dokan_reverse_withdrawal_monthly_cron` (cron expr `0 8 <day> * *`) — registered on save when `enabled=on` (and the latter only when `billing_type=by_month`).
- `dokan_save_settings_value` priority 99 → Pro MenuManager leak (writes `dashboard_menu_manager: []`; not Reverse-Withdrawal-specific).

| Field | UI control | Type | Default | Sentinel sent | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| `enabled` | switcher (Lite) | `switcher` | `'off'` | `'on'` (Save A) / `'off'` (Save B1) | `settingsData[enabled]` | `data.settings.value.enabled` | `dokan_reverse_withdrawal.enabled` | Schedules/unschedules `dokan_reverse_withdrawal_midnight_cron` + `dokan_reverse_withdrawal_monthly_cron` (Action Scheduler) | yes | `refresh_after_save: true` declared; controls visibility of feature globally via `SettingsHelper::is_enabled()`. |
| `payment_gateways` | multicheck (Lite) | `multicheck` | `{cod: cod}` | `{cod: cod}` | `settingsData[payment_gateways][<gw>]` | `data.settings.value.payment_gateways` | `dokan_reverse_withdrawal.payment_gateways` | none | yes (only selected keys persist) | Options filterable via `dokan_reverse_withdrawal_payment_gateways`. Out-of-the-box only `cod` is available. |
| `billing_type` | select (Lite) | `select` | `'by_amount'` | `'by_month'` | `settingsData[billing_type]` | `data.settings.value.billing_type` | `dokan_reverse_withdrawal.billing_type` | Triggers `monthly_cron` (un)schedule when crossed `by_month` ↔ `by_amount` | yes | Validated: must be `by_amount` OR `by_month`; otherwise rejected. |
| `reverse_balance_threshold` | number (Lite) | `number` (step 0.5, min 0) | `'150'` | `4242` | `settingsData[reverse_balance_threshold]` | `data.settings.value.reverse_balance_threshold` | `dokan_reverse_withdrawal.reverse_balance_threshold` | none | yes (as string) | `show_if billing_type=by_amount`. **Validated only when `billing_type=by_amount`**: `floatval()`, must be > 0; rejects empty/0/negative. When `billing_type=by_month`, value still round-trips but is unused. |
| `monthly_billing_day` | number (Lite) | `number` (1..28, step 1) | `'1'` | `15` | `settingsData[monthly_billing_day]` | `data.settings.value.monthly_billing_day` | `dokan_reverse_withdrawal.monthly_billing_day` | Drives `0 8 <day> * *` cron expression for `dokan_reverse_withdrawal_monthly_cron` | yes (as string) | `show_if billing_type=by_month`. **Validated only when `billing_type=by_month`**: `intval()` 1..28; additionally `monthly_billing_day + due_period <= 28` enforced. |
| `due_period` | number (Lite) | `number` (0..28, step 1) | `'7'` | `10` | `settingsData[due_period]` | `data.settings.value.due_period` | `dokan_reverse_withdrawal.due_period` | Participates in `day + period <= 28` sum check when `by_month` | yes (as string) | Validated `intval()` 0..28; `< 0` → "Due period cannot be negative or empty". |
| `failed_actions` | multicheck (Lite) | `multicheck` | `{enable_catalog_mode: enable_catalog_mode}` | `{hide_withdraw_menu: hide_withdraw_menu}` (Save A); all 3 in B6; empty in B5 | `settingsData[failed_actions][<action>]` | `data.settings.value.failed_actions` | `dokan_reverse_withdrawal.failed_actions` | none | yes (only selected keys persist) | At least one required — empty array rejected. Live options: `enable_catalog_mode, hide_withdraw_menu, status_inactive`. |
| `display_notice` | switcher (Lite) | `switcher` | `'on'` | `'off'` | `settingsData[display_notice]` | `data.settings.value.display_notice` | `dokan_reverse_withdrawal.display_notice` | none | yes | Controls vendor-dashboard grace-period notice via `SettingsHelper::display_notice()`. |
| `send_announcement` | switcher (Pro-only) | `switcher` | `'off'` | not exercised (Pro feature, requires email pipeline) | `settingsData[send_announcement]` | `data.settings.value.send_announcement` | `dokan_reverse_withdrawal.send_announcement` | none | yes (if Pro-active) | Only registered when `dokan()->is_pro_exists()`. Not validated. Read via `SettingsHelper::send_announcement()`. |

**Filter / boundary findings:**
- **Empty-option default:** `wp option delete dokan_reverse_withdrawal` + fresh `dokan_get_setting_values` GET → `data.dokan_reverse_withdrawal === []`. Verdict: **no read-time filter injection**. The slice is literally an empty PHP array; defaults must come from the field schema on the client. Contrast with `dokan_withdraw` where `set_withdraw_limit_gateways` re-injects `withdraw_methods` on every read.
- **Disable while keeping other fields (B1):** response `success: true`, all other fields persist verbatim, **both Action Scheduler crons unscheduled** (`as_unschedule_all_actions` for `*_midnight_cron` and `*_monthly_cron`). Verdict: validators NOT short-circuited when `enabled=off`; values still hit `update_option`.
- **Monthly billing day `0` (with `by_month`):** response `success: false`, errors `[{name: monthly_billing_day, error: "Monthly billing day cannot be empty or less than 1."}]`; DB unchanged.
- **Monthly billing day `32`:** response `success: false`, errors include BOTH `"Monthly billing day cannot be greater than 28."` and `"Monthly billing day + due period cannot be greater than 28."` (cumulative — second check runs even after the first fails); DB unchanged.
- **Grace period (`due_period`) `-1`:** response `success: false`, errors `[{name: due_period, error: "Due period cannot be negative or empty."}]`; DB unchanged.
- **`failed_actions` empty:** response `success: false`, errors `[{name: failed_actions, error: "Please select at least one action."}]`; DB unchanged. Server uses `array_filter()` so falsy values are stripped — sending all `''` keys is equivalent to sending nothing.
- **`failed_actions` ALL three selected (B6):** response `success: true`, DB stores all three keys. Verdict: accepted.
- **`reverse_balance_threshold = 0` with `by_amount`:** response `success: false`, error `"Reverse balance threshold cannot be empty, zero or negative."`. Verdict: `0` rejected (unlike `dokan_withdraw.withdraw_limit` which accepts `0`).
- **`monthly_billing_day = 20` + `due_period = 15` (sum > 28) with `by_month`:** response `success: false`, error `"Monthly billing day + due period cannot be greater than 28."`. Verdict: sum boundary only enforced when `billing_type=by_month`.
- **Cron / schedule side effects:** verified via `wp_actionscheduler_actions` table. Pre-save baseline: no `*reverse_withdrawal*` pending actions (option did not exist). After Save A (`enabled=on, by_month, day=15`): two pending actions appear — `dokan_reverse_withdrawal_midnight_cron` (daily) and `dokan_reverse_withdrawal_monthly_cron` (cron `0 8 15 * *`). After B1 (`enabled=off`): both pending actions are cleared. After restore Save A: both re-appear. Cron rescheduling logic lives in `BackgroundProcess/CronActions.php::after_save_settings`.
- **Pro MenuManager leak:** `dashboard_menu_manager: []` written into `dokan_reverse_withdrawal` on every successful save, identical to all other tabs. Confirmed via DB dump after Save A and B1/B6.

### `dokan_pages` — Page Settings

**wp_option name:** `dokan_pages`
**Initial GET slice keys:** `dashboard`, `store_listing`, `my_orders` (only 3 of 5 declared fields present — `reg_tc_page` and `vendor_onboarding` unset in baseline DB)
**Hooks observed:**
- `dokan_save_settings_value` priority 10 → `\WeDevs\Dokan\Admin\Hooks::update_pages` merges submitted payload into existing option via `array_replace_recursive` (only `dokan_pages` section). **Unique to this tab — all other tabs overwrite.**
- `dokan_save_settings_value` priority 99 → Pro MenuManager leak (writes `dashboard_menu_manager: []`; not Pages-specific)

| Field | UI control | Type | Default | Sentinel sent | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| `dashboard` | Page select (`<select>` of published pages) | int (stored as string) | unset (initial DB: `6`) | `219` | `settingsData[dashboard]` | `data.settings.value.dashboard` | `dokan_pages.dashboard` | none | yes (string `"219"`) | Special: dashboard routing depends on this. Restored to `6` after Save B. |
| `my_orders` | Page select | int (stored as string) | unset (initial DB: `8`) | `11` | `settingsData[my_orders]` | `data.settings.value.my_orders` | `dokan_pages.my_orders` | none | yes (`"11"`) | Used by `template-tags.php:514` for my-orders shortcode. |
| `store_listing` | Page select | int (stored as string) | unset (initial DB: `7`) | `10` | `settingsData[store_listing]` | `data.settings.value.store_listing` | `dokan_pages.store_listing` | none | yes (`"10"`) | Used by `Rewrites.php:58` for breadcrumbs. |
| `reg_tc_page` | Page select | int (stored as string) | unset (no schema default) | `106` | `settingsData[reg_tc_page]` | `data.settings.value.reg_tc_page` | `dokan_pages.reg_tc_page` | none | yes (`"106"`) | T&C page id; `functions.php:3423` + `BecomeAVendor.php:191`. |
| `vendor_onboarding` | Page select | int (stored as string) | unset (no schema default; auto-created by `V_5_0_0::create_vendor_onboarding_page`) | `12` | `settingsData[vendor_onboarding]` | `data.settings.value.vendor_onboarding` | `dokan_pages.vendor_onboarding` | none | yes (`"12"`) | Vendor onboarding/login route. |

**Filter / boundary findings:**
- **Empty-option default:** after `wp option delete dokan_pages` and GET, slice is `{}`. No schema-level defaults; merge filter has no current settings to fall back on. Installer (`Installer.php:287`) seeds the option at activation with auto-created pages.
- **Page id = 0:** all 5 fields accepted `0`, coerced to string `"0"`, stored as-is. No "page must exist" validation server-side. Verdict: accepted silently, would break routing if user submitted.
- **Non-existent page id (999999):** `store_listing=999999` accepted, stored as string `"999999"`. No `get_post()` existence check. Verdict: accepted silently.
- **Merge semantics (unique to this tab):** submitting `{dashboard: 6, my_orders: 8, store_listing: 7}` after a full B-save preserved `dashboard_menu_manager` key (since merge), but `reg_tc_page` and `vendor_onboarding` from Save B were also preserved at value `"0"` — so partial submits cannot *clear* a key, only overwrite. To remove a key the option itself must be deleted.
- **Rewrite rules count before/after Save A:** `394` / `394`. Verdict: **unchanged** — no rewrite flush is triggered by `dokan_pages` save (unlike `custom_store_url` in `dokan_general`).
- **Newly-created pages?** Pre-save count `19`, post-Save-A count `19`. Verdict: **no auto-creation** during settings save. Page auto-creation only happens at install/upgrade time (`Installer.php`, `V_5_0_0.php`).

### `dokan_appearance` — Appearance

**wp_option name:** `dokan_appearance`
**Initial GET slice keys (from `/tmp/dokan_initial_get.json`):** `contact_seller`, `enable_theme_store_sidebar`, `hide_vendor_info`, `store_header_template`, `store_banner_width`, `store_banner_height`, `store_open_close`, `disable_dokan_fontawesome`, `map_api_source`, `gmap_api_key`, `mapbox_access_token`, `recaptcha_validation_label`, `vendor_layout_style`, `appearance_options`, `store_map`, `default_store_banner`, `default_store_profile`, `dashboard_menu_manager` (last three are Pro-only or derived; `vendor_product_editor` declared but not in baseline DB)
**Hooks observed:**
- `dokan_get_settings_values` priority 20 → `Settings::set_vendor_latest_layout` injects `vendor_layout_style = 'legacy'` when empty (Settings.php:1208). Only Appearance-specific filter.
- `dokan_save_settings_value` priority 99 → Pro MenuManager leak (writes `dashboard_menu_manager: []`; not Appearance-specific)
- No `dokan_save_settings_value` merge filter on `dokan_appearance` — `update_option` overwrites the whole array.

| Field | UI control | Type | Default | Sentinel sent | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| `vendor_layout_style` | Radio (`latest` / `legacy`) | string | `legacy` (forced by filter when empty) | `latest` | `settingsData[vendor_layout_style]` | `data.settings.value.vendor_layout_style` | `dokan_appearance.vendor_layout_style` | none | yes | `set_vendor_latest_layout` filter re-applies `'legacy'` on read if value is empty. |
| `vendor_product_editor` | Radio (`latest` / `legacy`) | string | `legacy` | `latest` | `settingsData[vendor_product_editor]` | `data.settings.value.vendor_product_editor` | `dokan_appearance.vendor_product_editor` | none | yes | Not in initial GET slice (key absent until first save). Pro-consumed. |
| `show_register_as_vendor` | Switcher | `on`/`off` | `on` | `off` | `settingsData[show_register_as_vendor]` | `data.settings.value.show_register_as_vendor` | `dokan_appearance.show_register_as_vendor` | none | yes | Adds vendor toggle to WC My Account form. |
| `store_map` | Switcher | `on`/`off` | `on` | `off` | `settingsData[store_map]` | `data.settings.value.store_map` | `dokan_appearance.store_map` | none | yes | |
| `map_api_source` | Radio (`google_maps` / `mapbox`) | string | `google_maps` | `mapbox` | `settingsData[map_api_source]` | `data.settings.value.map_api_source` | `dokan_appearance.map_api_source` | none | yes | `refresh_after_save: true` — triggers full settings re-fetch. |
| `gmap_api_key` | Text (secret) | string | empty | `__T_gmap_001` | `settingsData[gmap_api_key]` | `data.settings.value.gmap_api_key` | `dokan_appearance.gmap_api_key` | none | yes | `secret_text: true` — masked in UI but stored plain. |
| `mapbox_access_token` | Text (secret) | string | empty | `__T_mbox_001` | `settingsData[mapbox_access_token]` | `data.settings.value.mapbox_access_token` | `dokan_appearance.mapbox_access_token` | none | yes | `secret_text: true`. Shown only when `map_api_source=mapbox`. |
| `contact_seller` | Switcher | `on`/`off` | `on` | `off` | `settingsData[contact_seller]` | `data.settings.value.contact_seller` | `dokan_appearance.contact_seller` | none | yes | |
| `store_header_template` | radio_image (`default`, `layout1`, `layout2`, `layout3`) | string | `default` | `layout2` | `settingsData[store_header_template]` | `data.settings.value.store_header_template` | `dokan_appearance.store_header_template` | none | yes | **No whitelist validation** — Save B value `not-a-template-XYZ` accepted verbatim. |
| `default_store_banner` | croppable_image (media picker) | string (URL or attachment id) | `assets/images/default-store-banner.png` | `https://example.test/__T/banner.png` | `settingsData[default_store_banner]` | `data.settings.value.default_store_banner` | `dokan_appearance.default_store_banner` | none | yes | Stored verbatim as string; server does not validate URL/attachment existence. Save B value `'0'` and `999999` (non-existent id) also accepted. |
| `default_store_profile` | croppable_image (media picker) | string (URL or attachment id) | `assets/images/mystery-person.jpg` | `https://example.test/__T/profile.png` | `settingsData[default_store_profile]` | `data.settings.value.default_store_profile` | `dokan_appearance.default_store_profile` | none | yes | Same as above; no validation. |
| `store_open_close` | Switcher | `on`/`off` | `on` | `off` | `settingsData[store_open_close]` | `data.settings.value.store_open_close` | `dokan_appearance.store_open_close` | none | yes | |
| `enable_theme_store_sidebar` | Switcher | `on`/`off` | `off` | `on` | `settingsData[enable_theme_store_sidebar]` | `data.settings.value.enable_theme_store_sidebar` | `dokan_appearance.enable_theme_store_sidebar` | none | yes | Read by `store-functions.php:11`. |
| `hide_vendor_info` | Multicheck (`email`, `phone`, `address`) | assoc array | `{email:'', phone:'', address:''}` | `{email:'email', phone:'phone', address:'address'}` | `settingsData[hide_vendor_info][<k>]` | `data.settings.value.hide_vendor_info` | `dokan_appearance.hide_vendor_info` | none | yes | **Omitting key entirely drops it from DB** (proves overwrite mode). Initial DB had only `phone=phone`. |
| `disable_dokan_fontawesome` | Switcher | `on`/`off` | `off` | `on` | `settingsData[disable_dokan_fontawesome]` | `data.settings.value.disable_dokan_fontawesome` | `dokan_appearance.disable_dokan_fontawesome` | none | yes | Read by `Assets.php:787`. |

**Filter / boundary findings:**
- **Empty-option default:** after `wp option delete dokan_appearance` and GET via `wp_ajax_dokan_get_setting_values`, slice = `{vendor_layout_style: "legacy"}` only — the `set_vendor_latest_layout` filter is the *only* source of schema defaults at read time. All other declared `default` values are NOT injected; the UI falls back to React-side defaults instead.
- **Save mode:** **OVERWRITE** (no merge filter). Confirmed by omitting `hide_vendor_info` in Save B — the key disappeared from DB. Contrast with `dokan_pages` which merges via `array_replace_recursive`. Also: keys present in initial DB but absent from any subsequent save (`recaptcha_validation_label`, `store_banner_width`, `store_banner_height`, `appearance_options`) were dropped on Save A.
- **Media id = 0:** `default_store_banner='0'` accepted verbatim, stored as string `"0"`. No validation, no attachment-existence check. Would render a broken image on frontend.
- **Non-existent media id (999999):** `default_store_profile='999999'` accepted verbatim, stored as string `"999999"`. No `get_post()` check.
- **Invalid select / radio_image value:** `store_header_template='not-a-template-XYZ'` accepted verbatim. No whitelist enforcement against declared `options` array.
- **Invalid color value:** N/A — Appearance tab declares zero color fields in Lite. (`recaptcha_validation_label` is Pro-only.)
- **`refresh_after_save` field:** `map_api_source` has this flag — UI re-fetches all settings after save (client-side concern, no server effect).
- **Round-trip count:** 16 fields declared (excluding 2 `sub_section`), 16 traced, 16 round-tripped after restore Save A.

### `dokan_privacy` — Privacy Policy

**wp_option name:** `dokan_privacy`
**Initial GET slice (pre-trace):** `[]` — option did not exist in DB on the test instance; `get_option('dokan_privacy', [])` returns empty array and no schema defaults are injected on read.
**Hooks observed:**
- `dokan_save_settings_value` priority 99 → Pro MenuManager leak (writes `dashboard_menu_manager: []`; not Privacy-specific)
- No Privacy-specific `dokan_get_settings_values` or `dokan_save_settings_value` filter found in Lite. (`includes/Privacy.php` only handles WP personal-data export/erase, not settings.)
- Read-only consumers: `dokan_get_privacy_policy_text()` and `dokan_privacy_policy_text()` in `includes/functions.php` (lines 3282–3320); `dokan_add_privacy_policy()` in `includes/wc-template.php:377` hooked to `dokan_contact_form`.

| Field | UI control | Type | Default | Sentinel sent | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| `enable_privacy` | Switcher | `on`/`off` | `on` (schema) — but NOT injected on empty option read | `on` | `settingsData[enable_privacy]` | `data.settings.value.enable_privacy` | `dokan_privacy.enable_privacy` | none | yes | `dokan_privacy_policy_text()` short-circuits and returns early when not `'on'`. |
| `privacy_page` | Select (`<select>` of published pages) | int-as-string | unset (no schema `default`) | `709` | `settingsData[privacy_page]` | `data.settings.value.privacy_page` | `dokan_privacy.privacy_page` | none | yes (`"709"`) | Consumed by `functions.php:3282` to build privacy-policy permalink; `dokan_privacy_policy_text()` ALSO returns early when this is falsy — so `0` effectively disables the feature even with `enable_privacy=on`. |
| `privacy_policy` | wpeditor (TinyMCE) | string (HTML) | `Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [dokan_privacy_policy]` (schema) | `__T_pp_lorem` | `settingsData[privacy_policy]` | `data.settings.value.privacy_policy` | `dokan_privacy.privacy_policy` | none | yes | `[dokan_privacy_policy]` token gets replaced at render time (`functions.php:3286`). |

**Filter / boundary findings:**
- **Empty-option default:** `wp option delete dokan_privacy` + GET → slice is `[]` (empty PHP array). Schema `default` values are NOT injected on read by the legacy AJAX endpoint. The runtime fallback only happens at the `dokan_get_option('privacy_policy', 'dokan_privacy', <default>)` call site in `functions.php:3305` (third arg is the default), and only for `privacy_policy`. `enable_privacy` defaults to `'on'` in the *schema* but at read time it returns empty/null, so `'on' === dokan_get_option('enable_privacy', 'dokan_privacy')` evaluates false → **feature is off by default on a fresh install until the admin clicks Save once.**
- **Save mode:** **OVERWRITE** (no merge filter). Confirmed by tracking key set across A → B1 → B2 → restore: every save writes exactly the submitted keys plus the `dashboard_menu_manager` leak. No prior keys persist.
- **wpeditor empty:** sending `privacy_policy=''` accepted and stored as empty string `""`. No `wp_kses_post` server-side sanitization on this field (proven by next bullet).
- **wpeditor with `<script>`:** sending `<p>hello <script>alert(1)</script><strong>world</strong></p>` round-trips **verbatim including the `<script>` tag**. No `wp_kses_post`/`wp_kses` filter in the legacy save path for this field. **Security concern** — output is rendered via `wpautop()` in `dokan_privacy_policy_text()` (line 3315) without escaping. Mitigating factor: the field is admin-only (`manage_woocommerce` cap required to write), and the output is rendered on store contact forms, so XSS scope is admin-injected. Still worth flagging — the new plugin-ui implementation should sanitize via `wp_kses_post` on save.
- **`wpautop` behavior on read:** The AJAX response does NOT apply `wpautop`; raw stored HTML is returned. `wpautop` is only applied at frontend render (`dokan_privacy_policy_text()`).
- **Page id 0:** `privacy_page='0'` accepted, stored as string `"0"`. No `get_post()` existence check. Behavioral effect: `dokan_privacy_policy_text()` returns early so the feature silently disables — no error to the admin.
- **Page id 999999 (non-existent):** accepted, stored as string `"999999"`. `dokan_get_privacy_policy_text()` then calls `get_permalink(999999)` which returns `false` and produces a broken `<a href="">` link. No validation; the new page should reject non-page-post-type ids or fall back gracefully.
- **Round-trip count:** 3 fields declared, 3 traced, 3 round-tripped after restore Save A.
- **Rewrite rules / cron / other side effects:** none. Only `dokan_general` flushes rewrites; Privacy tab has zero scheduled actions or cache invalidation.

### `dokan_ai` — AI Assist

**wp_option name:** `dokan_ai`
**Registered by:** Intelligence module via `dokan_settings_sections` filter — `includes/Intelligence/Admin/Settings.php::render_appearance_section()` (NOT in `includes/Admin/Settings.php`). Field schema is built in `render_ai_settings()` (text providers, Lite) and extended by Pro at `dokan-pro/includes/Intelligence/Settings.php::add_settings_fields()` (image providers) via `dokan_ai_settings_fields` filter.
**Initial GET slice keys (pre-trace DB, 8):** `dokan_ai_engine, dokan_ai_chatgpt_model, dokan_ai_gemini_model, dokan_ai_gemini_api_key, dokan_ai_chatgpt_api_key, dokan_ai_max_tokens_for_marketplace, dokan_ai_openai_api_key, dokan_ai_openai_model`. **3 of these (`dokan_ai_chatgpt_*`, `dokan_ai_max_tokens_for_marketplace`) have NO corresponding entry in the current `settings_fields.dokan_ai` schema** — they are stale legacy keys from an earlier Dokan version (when the provider id was `chatgpt`, before being renamed to `openai`, and when a `max_tokens` field existed). They survived because the legacy save handler does not filter to schema (see findings).
**Live `settings_fields.dokan_ai` keys (13, includes 2 sub_section labels):** `dokan_ai_product_info` (sub_section, Lite), `dokan_ai_engine` (Lite), `dokan_ai_openai_api_key` (Lite), `dokan_ai_openai_model` (Lite), `dokan_ai_gemini_api_key` (Lite), `dokan_ai_gemini_model` (Lite), `dokan_ai_image_gen` (sub_section, Pro), `dokan_ai_image_gen_availability` (Pro), `dokan_ai_image_engine` (Pro), `dokan_ai_image_gemini_api_key` (Pro), `dokan_ai_image_gemini_model` (Pro), `dokan_ai_image_bria-ai_api_key` (Pro), `dokan_ai_image_bria-ai_model` (Pro).
**Hooks observed:**
- `dokan_settings_sections` → `Intelligence\Admin\Settings::render_appearance_section` appends the `dokan_ai` section.
- `dokan_settings_fields` → `Intelligence\Admin\Settings::render_ai_settings` builds the Lite text-provider fields; then applies `dokan_ai_settings_fields` filter so Pro can extend.
- `dokan_ai_settings_fields` → `DokanPro\Intelligence\Settings::add_settings_fields` adds image-generation fields (`dokan_ai_image_*`).
- `dokan_intelligence_providers` → providers self-register via `Provider::__construct` (Lite: OpenAI, Gemini; Pro: BriaAi + image-capable Gemini models).
- `dokan_intelligence_text_supported_providers` / `dokan_intelligence_image_supported_providers` → filter the provider list for the engine dropdowns.
- `dokan_save_settings_value` priority 99 → Pro MenuManager leak (writes `dashboard_menu_manager: []`; not AI-specific, observed on every tab).
- No `dokan_get_settings_values` / `dokan_save_settings_value` filter is AI-specific in Lite. No `pre_update_option_dokan_ai` / `update_option_dokan_ai` hooks observed.

| Field | UI control | Type | Default (schema) | Sentinel sent | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ---------------- | ------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| `dokan_ai_engine` | Select (OpenAI/Gemini) | string | `openai` — NOT injected on empty option read | `openai` (A) / `__unknown_provider__` (B) | `settingsData[dokan_ai_engine]` | `data.settings.value.dokan_ai_engine` | `dokan_ai.dokan_ai_engine` | none | yes | No validation against registered provider ids — unknown value stored verbatim. Read-side consumer `Manager::is_configured()` validates against `get_engines()` and returns `false` if engine is not in the list, silently disabling AI. |
| `dokan_ai_openai_api_key` | Text (`secret_text: true`, password mask) | string | `''` | `__T_FAKE_KEY_OPENAI_001` | `settingsData[dokan_ai_openai_api_key]` | `data.settings.value.dokan_ai_openai_api_key` | `dokan_ai.dokan_ai_openai_api_key` | none | yes | Empty string + whitespace-only both accepted and stored verbatim — no `trim()`, no length check, no provider-format check. Browser tool auto-redacts response payloads as `[BLOCKED: Sensitive key]` (client-side guard), but DB stores raw string. `show_if`: visible only when `dokan_ai_engine === 'openai'`. |
| `dokan_ai_openai_model` | Select (9 OpenAI models) | string | `gpt-3.5-turbo` | `gpt-4o-mini` (A) / `__unknown_model__` (B) | `settingsData[dokan_ai_openai_model]` | `data.settings.value.dokan_ai_openai_model` | `dokan_ai.dokan_ai_openai_model` | none | yes | Unknown model id accepted verbatim. `show_if`: `dokan_ai_engine === 'openai'`. |
| `dokan_ai_gemini_api_key` | Text (`secret_text: true`) | string | `''` | `__T_FAKE_KEY_GEMINI_001` | `settingsData[dokan_ai_gemini_api_key]` | `data.settings.value.dokan_ai_gemini_api_key` | `dokan_ai.dokan_ai_gemini_api_key` | none | yes | Same as OpenAI key — whitespace/empty accepted. `show_if`: `dokan_ai_engine === 'gemini'`. |
| `dokan_ai_gemini_model` | Select (3 Gemini models) | string | `gemini-2.0-flash` (schema) — but `2.0-flash` is NOT in the live options list (`2.5-flash`, `2.5-flash-lite-preview-06-17`, `2.5-pro`) — **bug**: declared default is unreachable from the UI | `gemini-2.5-flash` | `settingsData[dokan_ai_gemini_model]` | `data.settings.value.dokan_ai_gemini_model` | `dokan_ai.dokan_ai_gemini_model` | none | yes | `show_if`: `dokan_ai_engine === 'gemini'`. |
| `dokan_ai_image_gen_availability` | Switcher | `on`/`off` | `off` | `on` (A) / `off` (B) | `settingsData[dokan_ai_image_gen_availability]` | `data.settings.value.dokan_ai_image_gen_availability` | `dokan_ai.dokan_ai_image_gen_availability` | none | yes | Pro-only. Gates all subsequent image fields via `show_if`. |
| `dokan_ai_image_engine` | Select (BRIA AI / Gemini) | string | `openai` (schema) — **bug**: declared default is not in the live options list (`bria-ai`, `gemini` only) so default is unreachable | `gemini` | `settingsData[dokan_ai_image_engine]` | `data.settings.value.dokan_ai_image_engine` | `dokan_ai.dokan_ai_image_engine` | none | yes | Pro. `show_if`: `dokan_ai_image_gen_availability === 'on'`. Unknown provider id accepted verbatim. |
| `dokan_ai_image_gemini_api_key` | Text (`secret_text: true`) | string | `''` | `__T_FAKE_KEY_IMG_GEMINI_001` | `settingsData[dokan_ai_image_gemini_api_key]` | `data.settings.value.dokan_ai_image_gemini_api_key` | `dokan_ai.dokan_ai_image_gemini_api_key` | none | yes | Pro. Empty/whitespace accepted. |
| `dokan_ai_image_gemini_model` | Select (2 image models) | string | `gemini-2.0-flash` (schema) — not in image options list — **bug** | `gemini-2.5-flash-image` | `settingsData[dokan_ai_image_gemini_model]` | `data.settings.value.dokan_ai_image_gemini_model` | `dokan_ai.dokan_ai_image_gemini_model` | none | yes | Pro. |
| `dokan_ai_image_bria-ai_api_key` | Text (`secret_text: true`) | string | `''` | `__T_FAKE_KEY_BRIA_001` | `settingsData[dokan_ai_image_bria-ai_api_key]` | `data.settings.value.dokan_ai_image_bria-ai_api_key` | `dokan_ai.dokan_ai_image_bria-ai_api_key` | none | yes | Pro. Note hyphen in key — round-trips through `URLSearchParams[]` bracket encoding cleanly. |
| `dokan_ai_image_bria-ai_model` | Select (1 BRIA model) | string | `bria-generate-background` | `bria-generate-background` | `settingsData[dokan_ai_image_bria-ai_model]` | `data.settings.value.dokan_ai_image_bria-ai_model` | `dokan_ai.dokan_ai_image_bria-ai_model` | none | yes | Pro. Single-option select. |

**Filter / boundary findings:**
- **Empty-option default:** `wp option delete dokan_ai` + GET → slice is `[]` (empty PHP array). Schema `default` values are NOT injected on read by the legacy AJAX endpoint. Read-side consumers (`Manager::active_engine`, `Manager::is_configured`, `dokan_get_option(...,'dokan_ai',<default>)`) supply per-call defaults at call sites — so on a fresh install, no defaults persist until the admin clicks Save. Captured to `_trace_artifacts/dokan_ai_empty_default.json`.
- **Save mode:** **OVERWRITE, but with NO schema filter.** Proven two ways: (1) pre-trace DB contained stale `dokan_ai_chatgpt_*` and `dokan_ai_max_tokens_for_marketplace` keys; after Save A these were absent from response/DB → overwrite. (2) Save B included `__unexpected_extra_key__: 'should_it_persist'` which was NOT in the schema; it persisted in both the AJAX response and the DB. So the save handler stores **exactly the `settingsData` payload, unfiltered**, plus the Pro MenuManager `dashboard_menu_manager: []` leak. **This is how `dokan_ai_chatgpt_*` survived across versions** — Dokan renamed the provider id from `chatgpt` → `openai` but never migrated/cleaned the old keys, and the unfiltered save let them ride along on every GET until a subsequent Save A overwrote them.
- **API key field — empty:** `dokan_ai_openai_api_key=''` accepted, stored as `""`. `Manager::is_configured()` then returns `false` so AI is silently disabled.
- **API key field — whitespace:** `dokan_ai_gemini_api_key='   '` accepted, stored as `"   "` verbatim. **No `trim()`**. `Manager::is_configured()` checks `empty($api_key)` which is `false` for `"   "` (non-empty string), so AI will report as configured and then fail at the first API call with a remote-auth error. **Bug** — sanitize-on-save should `trim()` and treat all-whitespace as empty.
- **API key field — masking on read:** No server-side masking; raw key returned in AJAX response body. Client-side `secret_text: true` controls UI masking (password input). The browser MCP tool's auto-redaction layer (`[BLOCKED: Sensitive key]`) is independent of Dokan; do not rely on it.
- **Unknown provider id (`dokan_ai_engine` / `dokan_ai_image_engine`):** Both accepted verbatim. Read-side `Manager::is_configured()` validates against registered providers and returns false → silent disable. The new plugin-ui should reject at save with an allow-list.
- **Unknown model id:** Accepted verbatim. No read-side validation observed in `Manager::active_engine` or `AIRequestController` beyond the API call itself; an unknown model id will fall through to the remote API and 4xx there. New plugin-ui should constrain via select-only.
- **Unexpected/extra payload keys:** **PERSIST.** This is the most surprising finding. The legacy `dokan_save_settings_value` save handler accepts any keys in `settingsData[...]` and `update_option`s them in. Mitigation: `current_user_can('manage_woocommerce')` gate prevents non-admins from polluting, but any admin-level script (or stale UI from an older version) can write garbage keys that survive forever. **The new plugin-ui implementation MUST filter to the active schema on save.**
- **Numeric / boundary tests:** Not applicable — no numeric fields in the current `dokan_ai` schema (the `dokan_ai_max_tokens_for_marketplace` in the DB is a stale legacy key with no UI control).
- **Real-key redaction:** `grep -E 'sk-[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_\-]{20,}'` against committed `_trace_artifacts/dokan_ai_*.json` returned empty. All artifacts use `__T_FAKE_KEY_*_001` sentinels.
- **Restore policy:** Per spec, the user's original real API keys (captured in `/tmp/dokan_initial_get.json` and `/tmp/dokan_ai_real_keys_backup.json`, outside the repo) were **NOT** re-saved by this trace. The live DB currently holds sentinel `__T_FAKE_KEY_*` values for both Lite (openai/gemini) and Pro (image gemini/bria-ai) API key fields. The user can restore real keys themselves by editing the AI Assist tab and re-pasting.
- **Round-trip count:** 11 writable fields declared (excluding 2 `sub_section` labels), 11 traced, 11 round-tripped after restore Save A.
- **Rewrite rules / cron / other side effects:** none observed. No flush, no scheduled action, no transient invalidation.

### `dokan_menu_manager` — Menu Manager (Pro, FIRST Pro tab)

**wp_option name:** `dokan_menu_manager`
**Registered by:** Dokan Pro `MenuManager` module — section added in `dokan-pro/includes/MenuManager/Admin/Settings.php::add_menu_manager_section()` (hooked on `dokan_settings_sections` priority 11, inserted after `dokan_appearance`). Fields built in `add_menu_manager_section_fields()` (hooked on `dokan_settings_fields` priority 99).
**Initial GET slice (pre-trace):** `[]` — option did not exist in DB on the test instance; `get_option('dokan_menu_manager', [])` returns empty array; no schema defaults injected on read by the AJAX endpoint.
**Live schema (one `sub_tab` field with two inner tabs):**
- `menu_manager_menu_tab.tabs.left_menus.fields` — 21 menu items: `dashboard, products, orders, requested-quotes, coupons, pos, reports, delivery-time-dashboard, reviews, reverse-withdrawal, seller-badge, product-questions-answers, return-request, staffs, followers, subscription, announcement, analytics, tools, auction, support`.
- `menu_manager_menu_tab.tabs.settings_sub_menu.fields` — 8 menu items: `store, payment, verification, shipping, shipstation, social, rma, seo`.
- Each item carries: `title, icon, url, pos, icon_name, react_route?, permission?, switchable, is_sortable`. The frontend (`Sortable.vue:105-152`) augments each item with `menu_key, menu_manager_title, previous_title, is_switched_on, menu_manager_position, edit_now, editable, temporary_disable_edit` before submit.
- `dashboard` (left) and `store` (settings sub) are pinned (`switchable=false, is_sortable=false`) by `apply_menu_restrictions()` (Settings.php:144-157).

**Hooks observed:**
- `dokan_settings_sections` p11 → `Settings::add_menu_manager_section` adds the section.
- `dokan_settings_fields` p99 → `Settings::add_menu_manager_section_fields` builds the `menu_manager_menu_tab` sub-tab. Calls `dokan_get_dashboard_nav()` under a temporary `dokan_is_seller_enabled => true` filter so the admin view sees all vendor menu items.
- `dokan_menu_manager_restricted_menus` filter — Pro itself + extensions can pin extra items.
- `dashboard_menu_manager_before_admin_settings` filter — final hook before fields are emitted.
- `dokan_save_settings_value` p99 → **`DataSource::save_admin_settings` (`dokan-pro/includes/MenuManager/Admin/DataSource.php:36-48`)** — THIS is the same filter that, on every other tab, injects `dashboard_menu_manager: []` (the cross-tab leak observed in Tasks 1–8). On THIS tab the filter does its real work: rebuilds `$option_value['dashboard_menu_manager']` by keeping only `left_menus` / `settings_sub_menu` subkeys, then passes each menu item through `filter_title()` (lines 59-83) to resolve empty `menu_manager_title` via fallback chain `trim(title) -> trim(previous_title) -> item.title`.

| Field group | UI control | Type | Default | Sentinel sent | Payload path | Response path | wp_option path | Round-trips? | Notes |
| ----------- | ---------- | ---- | ------- | ------------- | ------------ | ------------- | -------------- | ------------ | ----- |
| `menu_manager_menu_tab` (sub_tab wrapper) | Two tabs (Left Menu / Settings Sub Menu) with sortable/toggle/rename rows | `sub_tab` | — | n/a (container only) | n/a — children submit under `settingsData[dashboard_menu_manager][...]` | n/a | n/a | n/a | The schema key is `menu_manager_menu_tab` but the *payload* and *DB* key is `dashboard_menu_manager` (`Constants::MENU_MANAGER_OPTIONS`). This name mismatch is intentional and handled by `DataSource::save_admin_settings`. |
| `dashboard_menu_manager.left_menus.<menu_key>` (21 rows; representative: `products`) | Per-row toggle (`is_switched_on`), inline rename (`menu_manager_title`), drag-handle (`menu_manager_position`) | object | — (only populated after first save) | `products`: title=`__T_Products_Renamed__`, on=false, pos swapped with `orders` | `settingsData[dashboard_menu_manager][left_menus][products][menu_manager_title=...][is_switched_on=][menu_manager_position=2][...]` | `data.settings.value.dashboard_menu_manager.left_menus.products.{menu_manager_title, is_switched_on, menu_manager_position}` | `dokan_menu_manager.dashboard_menu_manager.left_menus.products.*` | yes | `is_switched_on=false` serializes as `""` via the FormData boolean encoder. `dashboard` row is pinned (not switchable/sortable). |
| `dashboard_menu_manager.left_menus.orders` (rename only) | inline rename + drag | object | — | title=`__T_Orders_Renamed__`, pos=1 | `settingsData[dashboard_menu_manager][left_menus][orders][menu_manager_title=__T_Orders_Renamed__]` | `data.settings.value.dashboard_menu_manager.left_menus.orders.menu_manager_title` | `dokan_menu_manager.dashboard_menu_manager.left_menus.orders.menu_manager_title` | yes | Position swap with `products` round-trips. |
| `dashboard_menu_manager.settings_sub_menu.<menu_key>` (8 rows; representative: `payment`) | Same controls as left_menus rows | object | — | `payment`: title=`__T_Payment_OFF__`, on=false | `settingsData[dashboard_menu_manager][settings_sub_menu][payment][...]` | `data.settings.value.dashboard_menu_manager.settings_sub_menu.payment.*` | `dokan_menu_manager.dashboard_menu_manager.settings_sub_menu.payment.*` | yes | `store` row is pinned. |

**Per-item stored shape (after Save A on `left_menus.products`):**
```
{ title, icon, url, pos, icon_name, permission, switchable, is_sortable,
  menu_key: "products", menu_manager_title: "__T_Products_Renamed__",
  previous_title: "Products", is_switched_on: "",
  menu_manager_position: "2", edit_now: "", editable: "1",
  temporary_disable_edit: "" }
```
All booleans round-trip as `""` (false) / `"1"` (true) due to legacy jQuery-style form encoding; the read path treats `""` as falsy.

**Filter / boundary findings:**
- **Empty-option default:** `wp option delete dokan_menu_manager` + GET → `[]` (empty PHP array). Captured to `_trace_artifacts/dokan_menu_manager_empty_default.json`. The active menu config is recomputed at render time from `dokan_get_dashboard_nav()` when no overlay exists.
- **Save mode:** **OVERWRITE.** `update_option()` writes the full `$option_value` returned by the `dokan_save_settings_value` filter chain. Confirmed by Save B (which sent only the menu data + 2 unknown keys) — the response/DB contains exactly those keys, nothing else.
- **Recursive leak (does `dokan_menu_manager` get its own `dashboard_menu_manager: []` leak injected?):** **NO.** The DataSource filter at `DataSource.php:38` is gated by `Constants::DOKAN_MENU_MANAGER === $option_name`, so on THIS tab it populates `dashboard_menu_manager` with the real menu config (built from `$option_value[MENU_MANAGER_OPTIONS]`). It does NOT re-wrap into `dashboard_menu_manager.dashboard_menu_manager`. Verified: `get_option('dokan_menu_manager')['dashboard_menu_manager']` has top-level keys `['left_menus', 'settings_sub_menu']` only.
- **Cross-tab leak source (the bug observed in Tasks 1–8):** **`dokan-pro/includes/MenuManager/Admin/DataSource.php:45`** — the line `$option_value[ Constants::MENU_MANAGER_OPTIONS ] = $this->filter_title( $filtered_value );` runs **unconditionally** for every option being saved. The `$filtered_value` starts as `[]` and is only populated when `$option_name === DOKAN_MENU_MANAGER` (lines 38-44). On every OTHER tab the conditional is false, `$filtered_value` stays `[]`, and `filter_title([])` returns `[]` — but line 45 still writes `dashboard_menu_manager: []` into the unrelated option. Fix: wrap lines 45-47 in an `if ( Constants::DOKAN_MENU_MANAGER === $option_name )` guard (or early-return at top of the method).
- **Unknown-key persistence on this tab:** **CONFIRMED, same as other tabs.** Save B included `settingsData[__unknown_menu_key__]=__T_unknown_value__` and `settingsData[some_random_field]=__T_random__`. Both persisted at the top level of the saved option (DB confirmed). The DataSource filter does NOT strip extra keys; the generic `Settings::save_settings_value` handler does NOT filter to the active schema. Same root cause as Task 8 finding.
- **Empty `menu_manager_title` fallback:** Confirmed by Save B (all titles sent as `''`). `filter_title()` (DataSource.php:67-74) chains: `trim(menu_manager_title)` → if empty, `trim(previous_title)` → if still empty, `item.title`. So sending empty titles round-trips back to the original titles (verified: `products.menu_manager_title` came back as `"Products"`). **Side effect:** the admin cannot save a deliberately blank menu label — the system always re-fills it.
- **Boolean encoding:** `is_switched_on=false` serializes to `""` (empty string) via the FormData encoder used by the legacy Vue Sortable component. The read side (`Sortable.vue:113`) treats `""` as falsy. The new plugin-ui implementation must accept either `boolean false` OR `string ""` to be backward-compatible with DB rows written by the legacy UI.
- **Menu-key with hyphen:** Keys like `delivery-time-dashboard`, `requested-quotes`, `product-questions-answers`, `return-request`, `reverse-withdrawal`, `seller-badge` round-trip cleanly through `URLSearchParams[]` bracket encoding. No issues.
- **Pinned rows:** `dashboard` (left) and `store` (settings_sub) have `switchable=false, is_sortable=false` injected by `apply_menu_restrictions()`. The UI hides toggle/grab controls. The server does NOT enforce this on save — sending `dashboard.is_switched_on=false` would persist, but the UI would never emit that. New plugin-ui should enforce server-side.
- **Sortable position:** swapping `products` (pos=2) and `orders` (pos=1) round-trips. Position is stored as string-coerced int (`"1"`, `"2"`) — `Sortable.vue:134-138` sorts numerically via `position_a - position_b` which works for string coercion.
- **Baseline-diff:** Only `dokan_menu_manager` newly created. No side-effect options written. No cron/rewrite/transient invalidation observed in the save path.
- **Round-trip count:** 21 left + 8 settings_sub = 29 sortable/renamable rows traced via representative sentinels (`products`, `orders`, `payment`). All sentinels round-trip after restore Save A — captured in `_trace_artifacts/dokan_menu_manager_reload.json`.
- **Frontend caveat:** The UI is Vue 2 (legacy admin settings React+Vue hybrid) — `Sortable.vue` mutates `fieldValue.dashboard_menu_manager` directly on `created()`. There is no per-field `refresh_after_save` handler — meaning after save, the page expects a refresh to re-read state. New plugin-ui flow should explicitly re-fetch.

### `dokan_geolocation` — Geolocation (Pro)

**wp_option name:** `dokan_geolocation`
**Registered by:** Dokan Pro Geolocation module — section + fields in `dokan-pro/modules/geolocation/class-geolocation-admin-settings.php:31` (section) and `:54` (fields). Filters: `dokan_settings_sections`, `dokan_settings_fields` (default priority 10, no explicit order).
**Initial GET slice (pre-trace):** `[]` — option did not exist in DB on the test instance. `get_option('dokan_geolocation', [])` returns `[]`. No schema defaults injected on read.
**Field count:** 9 writable fields (1 nested `gmap` object with 4 sub-keys).

**Hooks observed:**
- `dokan_settings_sections` → `Dokan_Geolocation_Admin_Settings::add_settings_section` registers the section (`title`, `icon_url`, `document_link`, `settings_title`, `settings_description`).
- `dokan_settings_fields` → `Dokan_Geolocation_Admin_Settings::add_settings_fields` declares 9 fields.
- `dokan_geolocation_default_location` filter — Pro/extensions can override the resolved default location at read sites (in `functions.php:41`).
- `dokan_save_settings_value` p99 → Pro MenuManager leak: `dashboard_menu_manager: []` injected into this option (same cross-tab leak documented in Tasks 1–9).
- **No** save-side filters from the Geolocation module itself — there is zero server-side validation/sanitization beyond `Settings::sanitize_options($_, 'edit')` (which does generic `wp_kses_post`-style sanitization on strings, no numeric range/enum/lat-lng checks).

| Field | UI control | Type | Default | Sentinel sent | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| `show_locations_map` | Radio (Top/Left/Right) | string enum | `top` | `right` | `settingsData[show_locations_map]` | `data.settings.value.show_locations_map` | `dokan_geolocation.show_locations_map` | none | yes | Unknown enum value (`__unknown_position__`) accepted verbatim — no allow-list on save. |
| `show_location_map_pages` | Radio (Both/Store Listing/Shop Page) | string enum | `all` (schema) — but `dokan_get_option(...,'shop')` is the read-site fallback in `class-dokan-geolocation-product-view.php:188` — **inconsistency** | `store_listing` | `settingsData[show_location_map_pages]` | `data.settings.value.show_location_map_pages` | `dokan_geolocation.show_location_map_pages` | none | yes | Schema declares `default: 'all'` but read-side `dokan_get_option('show_location_map_pages','dokan_geolocation','shop')` passes a different fallback when option key missing. Fresh installs see `shop` until first save, then `all` after-default-injection-never-happens stays missing. |
| `show_filters_before_locations_map` | Switcher (on/off) | string `'on'\|'off'` | `'on'` | `'off'` | `settingsData[show_filters_before_locations_map]` | `data.settings.value.show_filters_before_locations_map` | `dokan_geolocation.show_filters_before_locations_map` | none | yes | Stored as `'on'`/`'off'` literal strings (not bool). |
| `show_product_location_in_wc_tab` | Switcher (on/off) | string `'on'\|'off'` | `'on'` | `'off'` | `settingsData[show_product_location_in_wc_tab]` | `data.settings.value.show_product_location_in_wc_tab` | `dokan_geolocation.show_product_location_in_wc_tab` | none | yes | — |
| `distance_unit` | Radio (Kilometers/Miles) | string enum | `km` | `miles` | `settingsData[distance_unit]` | `data.settings.value.distance_unit` | `dokan_geolocation.distance_unit` | none | yes | Unknown enum accepted. |
| `distance_min` | Number (`min=0`) | number (stored as string) | `0` | `'5'` (positive), `'-5'` (negative) | `settingsData[distance_min]` | `data.settings.value.distance_min` | `dokan_geolocation.distance_min` | none | yes | Schema `min=0` not enforced — `-5` stored verbatim. |
| `distance_max` | Number (`min=1`) | number (stored as string) | `10` | `'4242'` (positive), `'0'` (boundary) | `settingsData[distance_max]` | `data.settings.value.distance_max` | `dokan_geolocation.distance_max` | none | yes | Schema `min=1` not enforced — `0` stored verbatim. |
| `map_zoom` | Number (`min=1 max=18`) | number (stored as string) | `11` | `'12'` (positive), `'100'` (out-of-range) | `settingsData[map_zoom]` | `data.settings.value.map_zoom` | `dokan_geolocation.map_zoom` | none | yes | Schema `min=1 max=18` not enforced — `100` stored verbatim. Read site `functions.php:86` reads with default `11`. |
| `location` (gmap composite) | Google Map picker (address search + draggable marker + zoom) | object `{latitude, longitude, address, zoom}` | `{latitude: 23.709921, longitude: 90.40714300000002, address: 'Dhaka', zoom: 10}` | `{12.34, 56.78, '__T_Default_Addr_001', 7}` (positive), `{95.5, -200.7, '   ', 999}` (negative) | `settingsData[location][latitude]`, `[longitude]`, `[address]`, `[zoom]` | `data.settings.value.location.{latitude,longitude,address,zoom}` | `dokan_geolocation.location.{...}` | none | yes | All four sub-keys round-trip as strings. **NO lat/lng range validation** (±90, ±180) on save. Whitespace-only address (`'   '`) persisted verbatim — no `trim()`. **Body encoding matters:** `application/x-www-form-urlencoded` parses `[latitude]` into nested array correctly; `multipart/form-data` (FormData default) leaves keys as literal `'location[latitude'` strings at the top level (PHP doesn't bracket-parse multipart field names the same way). The legacy Vue UI uses jQuery `$.ajax` (urlencoded by default), so production saves work — but the new plugin-ui must NOT switch to multipart FormData without explicit serialization. |

**Filter / boundary findings:**
- **Empty-option default:** `wp option delete dokan_geolocation` + GET → `[]` (empty PHP array). Captured to `_trace_artifacts/dokan_geolocation_empty_default.json`. Schema defaults are NOT injected on read; read-site consumers in `dokan-pro/modules/geolocation/functions.php` and the product/vendor view classes each supply their own per-call default via `dokan_get_option('<key>', 'dokan_geolocation', <fallback>)`. **Schema-vs-fallback inconsistency:** the admin schema declares `show_location_map_pages` default `'all'` while the read site (`class-dokan-geolocation-product-view.php:188`, `class-dokan-geolocation-product-query.php:158`) passes `'shop'` as the fallback — fresh installs effectively behave with `shop`, contradicting what the settings UI shows as the "current default" (`all`). The new plugin-ui should reconcile this (either inject defaults at GET, or align fallback strings).
- **Save mode:** **OVERWRITE, unfiltered.** Save B confirmed: payload included two unknown keys (`__unknown_extra__`, `some_random_field`) and both persisted at the top level of `dokan_geolocation` in the DB. No schema filter on save. Same bug class as Tasks 8 (`dokan_ai`) and 9 (`dokan_menu_manager`).
- **Lat/lng out-of-range:** `latitude=95.5`, `longitude=-200.7` accepted verbatim and stored. No server-side range check. Read site may produce broken Google Maps coordinates (the Maps JS API will silently clamp/wrap or render off-globe). **New plugin-ui must clamp** to ±90 / ±180 on save.
- **Zoom boundary:** `map_zoom=100` and `location.zoom=999` both stored verbatim. Google Maps accepts zoom 0–22 (varies by map type); larger values are clamped client-side. New plugin-ui should enforce 1–18 (or 0–22) on save.
- **Unknown enum (`show_locations_map`, `show_location_map_pages`, `distance_unit`):** Accepted verbatim. Read sites fall through `switch/if` chains and produce silent UI degradation (no map position match → element rendered with neither top/left/right class).
- **Whitespace-only `location.address`:** `'   '` stored verbatim — no `trim()`. New plugin-ui should `trim()` and treat all-whitespace as empty.
- **Cross-tab leak:** `dashboard_menu_manager: []` present in DB after every save — root cause documented in Task 9 (`dokan_menu_manager`). This tab inherits the leak unchanged.
- **Real-key redaction:** **N/A** — no API-key fields on this tab. Geolocation provider keys (Google Maps API key, Mapbox token) live in `dokan_appearance` (already traced in Task 6), not here. No `/tmp/dokan_geolocation_real_keys_backup.json` needed; no redaction grep required.
- **Rewrite rules / cron / other side effects:** none. Save path runs `update_option` only; no `flush_rewrite_rules`, no scheduled action, no transient invalidation. The `'dokan_general' === $option_name` rewrite branch in `Settings.php:186` is gated, does not fire for this tab.
- **DB state after task:** `dokan_geolocation` left in DB with Save A sentinels (`distance_max=4242`, `location.address=__T_Default_Addr_001`, etc.). User can clear via Reset Defaults on the tab, or `wp option delete dokan_geolocation`.
- **Round-trip count:** 9/9 writable fields traced, 9/9 round-trip after restore Save A — captured in `_trace_artifacts/dokan_geolocation_reload.json`.

### `dokan_live_search_setting` — Live Search (Pro)

**wp_option name:** `dokan_live_search_setting`
**Registered by:** Dokan Pro Live Search module — section + fields in `dokan-pro/modules/live-search/module.php:173` (section) and `:196` (fields). Filters: `dokan_settings_sections`, `dokan_settings_fields` (default priority 10).
**Initial GET slice (pre-trace):** `{ "live_search_option": "old_live_search", "dashboard_menu_manager": [] }` — value present in DB; the `dashboard_menu_manager: []` key is the Pro MenuManager cross-tab leak documented in Task 9.
**Field count:** 1 writable field.

**Hooks observed:**
- `dokan_settings_sections` → `Dokan_Live_Search::render_live_search_section` registers the section (`title`, `icon_url`, `document_link`, `settings_title`, `settings_description`).
- `dokan_settings_fields` → `Dokan_Live_Search::render_live_search_settings` declares the single `live_search_option` select field.
- `dokan_save_settings_value` p99 → Pro MenuManager leak: `dashboard_menu_manager: []` injected into this option (same cross-tab leak documented in Tasks 1–10).
- **No** save-side filters from the Live Search module itself — no validation/sanitization beyond the generic `Settings::sanitize_options` pass.
- Read site: `dokan_get_option( 'live_search_option', 'dokan_live_search_setting', 'old_live_search' )` in `dokan-pro/modules/live-search/classes/class-dokan-live-search.php:53` — **hard-coded fallback `old_live_search`** when option key is missing.

| Field | UI control | Type | Default | Sentinel sent | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| `live_search_option` | Select (Search with Suggestion Box / Autoload Replace Current Content) | string enum (`suggestion_box` \| `old_live_search`) | `suggestion_box` (admin schema) — but read-site fallback in widget render is `old_live_search` — **schema-vs-fallback inconsistency** | `suggestion_box` (Save A, positive); `__unknown_enum_val__` (Save B, negative) | `settingsData[live_search_option]` | `data.settings.value.live_search_option` | `dokan_live_search_setting.live_search_option` | none (only the `dashboard_menu_manager: []` leak) | yes | Unknown enum value (`__unknown_enum_val__`) accepted verbatim — no allow-list on save. Frontend widget falls through `if ('old_live_search' === $live_search_option) { ... } else { 'dokan-ajax-search-suggestion' }` so unknown values silently behave as `suggestion_box` mode at render time. |

**Filter / boundary findings:**
- **Empty-option default:** `wp option delete dokan_live_search_setting` + read → option does not exist; `get_option('dokan_live_search_setting')` returns `false`. `dokan_get_option('live_search_option','dokan_live_search_setting')` returns `''` (empty string) when no fallback arg passed. With the widget's explicit fallback `'old_live_search'`, fresh installs render the legacy autoload-replace mode — contradicting the admin schema default of `suggestion_box`. Captured to `_trace_artifacts/dokan_live_search_setting_empty_default.json`. Same class of bug as Task 10 (`dokan_geolocation.show_location_map_pages`).
- **Save mode:** **OVERWRITE, unfiltered.** Save B confirmed: payload included one unknown extra key (`some_random_field=__T_Random_001`) and it persisted at the top level of `dokan_live_search_setting`. No schema filter on save. Same bug class as Tasks 8 (`dokan_ai`), 9 (`dokan_menu_manager`), 10 (`dokan_geolocation`).
- **Unknown enum:** `live_search_option=__unknown_enum_val__` accepted verbatim. Read site degrades silently to the `suggestion_box` rendering branch (no explicit allow-list / no error log). New plugin-ui must enforce the enum (`suggestion_box`, `old_live_search`) on save.
- **Cross-tab leak:** `dashboard_menu_manager: []` present in DB after every save — root cause documented in Task 9. This tab inherits the leak unchanged.
- **Real-key redaction:** **N/A** — no API-key fields on this tab. No backup file needed.
- **Rewrite rules / cron / other side effects:** none. Save path runs `update_option` only; no `flush_rewrite_rules`, no scheduled action, no transient invalidation. The `'dokan_general' === $option_name` rewrite branch in `Settings.php:186` is gated, does not fire for this tab.
- **Body encoding:** confirmed `application/x-www-form-urlencoded; charset=UTF-8` (jQuery `$.ajax` default). New plugin-ui must not switch to multipart FormData without explicit `settingsData[live_search_option]` serialization, per the encoding finding established in Task 10.
- **DB state after task:** `dokan_live_search_setting` restored to Save A state (`live_search_option=suggestion_box`). User can clear via Reset Defaults on the tab, or `wp option delete dokan_live_search_setting`.
- **Round-trip count:** 1/1 writable field traced, 1/1 round-trip after restore Save A — captured in `_trace_artifacts/dokan_live_search_setting_reload.json`.

### `dokan_report_abuse` — Product Report Abuse (Pro)

**wp_option name:** `dokan_report_abuse`
**Registered by:** Dokan Pro Report Abuse module — section + fields in `dokan-pro/modules/report-abuse/includes/AdminSettings.php:29` (section) and `:52` (fields). Filters: `dokan_settings_sections`, `dokan_settings_fields` (default priority 10, no explicit order).
**Initial GET slice (pre-trace):** `{ "abuse_reasons": [ 8 default entries: report_as_spam / report_as_adult / report_as_abusive / report_as_violent / report_as_risk_of_hurting / report_as_infringes_copyright / report_as_contains_private_info / other ] }` — option present in DB seeded by module activation hook (`module.php:85-127` populates default `abuse_reasons` array via `update_option` on `dokan_activated_module_report_abuse` action). `reported_by_logged_in_users_only` key is **not** seeded — relies on schema default `'off'` at read time (which is never injected; readers each pass their own fallback).
**Field count:** 2 writable fields (1 switcher, 1 repeater of `{id, value}` objects).

**Hooks observed:**
- `dokan_settings_sections` → `AdminSettings::add_settings_section` registers the section (`title`, `icon_url`, `description`, `document_link`, `settings_title`, `settings_description`).
- `dokan_settings_fields` → `AdminSettings::add_settings_fields` declares the 2 fields (`reported_by_logged_in_users_only` switcher default `'off'`; `abuse_reasons` repeatable, no schema default — relies on module-activation seeding).
- `dokan_activated_module_report_abuse` → `Module::activate` seeds 8 default abuse reasons via `update_option('dokan_report_abuse', $option, false)` (`module.php:127`).
- `dokan_save_settings_value` p99 → Pro MenuManager leak: `dashboard_menu_manager: []` injected into this option (same cross-tab leak documented in Tasks 1–11).
- **No** save-side filters from the Report Abuse module itself — no validation/sanitization beyond the generic `Settings::sanitize_options` pass.
- Read sites: `(array) get_option( 'dokan_report_abuse', [] )` in `dokan-pro/modules/report-abuse/includes/SingleProduct.php:62`, `module.php:85`, `Admin.php:110`. Each reader iterates `$options['abuse_reasons'] ?? []` with no schema default fallback for the repeater.

| Field | UI control | Type | Default | Sentinel sent | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| `reported_by_logged_in_users_only` | Switcher (on/off) | string `'on'\|'off'` | `'off'` (schema) — not persisted on fresh install (relies on schema default at read) | `'on'` (Save A); `'off'` (Save B) | `settingsData[reported_by_logged_in_users_only]` | `data.settings.value.reported_by_logged_in_users_only` | `dokan_report_abuse.reported_by_logged_in_users_only` | none | yes | Stored as literal `'on'`/`'off'` strings (not bool). Frontend (`dokan-report-abuse.js`) checks `'on' === dokanReportAbuse.reported_by_logged_in_users_only`. Unknown values silently behave as off. No allow-list on save. |
| `abuse_reasons` | Repeatable (`{id, value}` rows) | array of objects `[{id: string, value: string}]` | seeded on module activation as 8 default reasons (see Initial GET); **no schema default** — empty repeater after `wp option delete` returns `[]` | `[{id:'__T_reason_A1', value:'__T_Sentinel reason A1'}, {id:'other', value:'__T_Other A1'}]` (Save A, alt subset); omitted entirely (Save B, overwrite confirmation) | `settingsData[abuse_reasons][N][id]`, `settingsData[abuse_reasons][N][value]` | `data.settings.value.abuse_reasons[N].{id,value}` | `dokan_report_abuse.abuse_reasons[N].{id,value}` | none | yes | **OVERWRITE semantics:** omitting `abuse_reasons` from payload drops the key from DB entirely (no merge with existing values). Save B confirmed: 8 seeded reasons wiped after a save that did not include the field. **No schema validation:** any string allowed in `id`/`value`. Duplicate `id` values, empty strings, and arbitrary whitespace all persist verbatim. Front-end report form uses radios keyed by `id` — empty `id` or duplicate `id` would silently render unusable radios. **Body encoding:** urlencoded with bracket nesting (`settingsData[abuse_reasons][0][id]`); jQuery `$.ajax` default works; multipart FormData would NOT parse the nested array correctly (same encoding caveat as Task 10 `dokan_geolocation.location`). |

**Filter / boundary findings:**
- **Empty-option default:** `wp option delete dokan_report_abuse` + `get_option('dokan_report_abuse', [])` → `[]` (empty PHP array). Captured to `_trace_artifacts/dokan_report_abuse_empty_default.json`. Schema defaults are NOT injected on read; the module relies on its activation hook to seed the 8 default abuse reasons. **If the activation hook is missed** (e.g., option manually deleted post-activation), the report form renders with zero reasons.
- **Save mode:** **OVERWRITE, unfiltered.** Save B confirmed: payload omitted `abuse_reasons` entirely and the DB no longer contains the key. Also included two unknown extras (`__unknown_extra__`, `reported_by_logged_in_users_only_extra`) — both persisted at the top level. No schema filter on save. Same bug class as Tasks 8 (`dokan_ai`), 9 (`dokan_menu_manager`), 10 (`dokan_geolocation`), 11 (`dokan_live_search_setting`).
- **Switcher non-boolean values:** `reported_by_logged_in_users_only` accepts any string verbatim (only `'on'` triggers the logged-in-only check). Read site degrades silently. New plugin-ui must enforce `{'on','off'}` on save.
- **Empty repeater:** Save B confirmed that omitting `abuse_reasons` produces a "no abuse reasons configured" state. The legacy admin UI does not prevent saving with zero reasons. Front-end report form renders an empty radio group — UX bug class. New plugin-ui should require at least one reason or fall back to the seeded defaults.
- **Repeater row validation:** No `id`/`value` length, uniqueness, or character-set checks. Duplicate `id` across rows silently persists; the front-end report form keys radios by `id` value, so duplicate `id`s render multiple radios sharing the same `name`/`value`. New plugin-ui should enforce unique non-empty `id` and non-empty `value`.
- **Schema-vs-fallback divergence:** Yes — `abuse_reasons` has no schema default; the only source of seeded defaults is the module-activation `update_option` call. Schema says nothing; fallback in read sites is `[]`. New plugin-ui should reconcile (either declare a schema default or re-seed on every save when empty).
- **Cross-tab leak:** `dashboard_menu_manager: []` present in DB after every save — root cause documented in Task 9. This tab inherits the leak unchanged.
- **Real-key redaction:** **N/A** — no API-key/email/URL fields on this tab. No backup file needed.
- **Rewrite rules / cron / other side effects:** none. Save path runs `update_option` only; no `flush_rewrite_rules`, no scheduled action, no transient invalidation. `ReportAbuseCache` is a frontend cache (no settings-save invalidation hook).
- **DB state after task:** `dokan_report_abuse` restored to Save A sentinel state (`reported_by_logged_in_users_only=on`, `abuse_reasons=[__T_reason_A1,other]`, plus `some_random_field=__T_Random_A1` unknown extra). To restore production defaults, user can re-trigger module activation (`wp option delete dokan_report_abuse && wp dokan module deactivate report-abuse && wp dokan module activate report-abuse`).
- **Round-trip count:** 2/2 writable fields traced, 2/2 round-trip after restore Save A — captured in `_trace_artifacts/dokan_report_abuse_reload.json`.

### `dokan_spmv` — Single Product MultiVendor (Pro)

**wp_option name:** `dokan_spmv`
**Registered by:** Dokan Pro Single Product Multiple Vendor module — section + fields in `dokan-pro/modules/single-product-multiple-vendor/includes/admin.php:28` (section) and `:49` (fields). Filters: `dokan_settings_sections` (priority 10), `dokan_settings_fields` (priority 12 — non-default, registered later than most tabs).
**Initial GET slice (pre-trace):** `[]` (option does not exist in DB; not seeded on module activation — read-site fallbacks supply defaults at each call site).
**Field count:** 5 writable fields (1 switcher, 2 text, 2 select).

**Hooks observed:**
- `dokan_settings_sections` p10 → `Dokan_SPMV_Admin::add_new_section_admin_panel` registers section (`title`, `icon_url`, `description`, `document_link`, `settings_title`, `settings_description`).
- `dokan_settings_fields` **p12** → `Dokan_SPMV_Admin::add_new_setting_field_admin_panel` declares the 5 fields. Non-default priority (12 vs the usual 10) — registered after most other Pro tabs in the filter chain; no observed dependency, but worth flagging.
- `dokan_after_saving_settings` p10 → **`Dokan_SPMV_Product_Visibility::after_saving_settings`** (`product-visibility.php:31`) — fires on EVERY `dokan_save_settings` call, checks `'dokan_spmv' === $option_name`, then **cancels any pending background process and dispatches a new `Dokan_SPMV_Update_Product_Visibility` background job** over all `dokan_product_map.map_id` rows. **New side-effect class** not seen in prior tasks: settings save spawns a `WP_Background_Process` queue. Save A and Save B both triggered this hook (the wpdb query runs even when the spmv table is empty; the dispatched job is a no-op when there are no map rows).
- `dokan_spmv_show_order_options` (filter, `functions.php:57`) → extensibility hook for the `show_order` enum allow-list (`show_all`, `min_price`, `max_price`).
- `dokan_save_settings_value` p99 → Pro MenuManager leak: `dashboard_menu_manager: []` injected (cross-tab leak documented in Task 9).
- **No** save-side filters from the SPMV module itself — no validation/sanitization beyond generic `Settings::sanitize_options`.
- Read sites: `dokan_get_option( 'show_order', 'dokan_spmv', 'show_all' )` (functions.php:86, product-visibility.php:104); `dokan_get_option( 'enable_pricing', 'dokan_spmv', 'off' )` (elementor widgets `ProductSPMV.php:111`, `ProductSPMVList.php:110`). Each reader passes its own per-key fallback; **schema defaults are never injected on read**.

| Field | UI control | Type | Default | Sentinel sent | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| `enable_pricing` | Switcher (on/off) | string `'on'\|'off'` | `'off'` (schema and read-site fallback agree) | `'on'` (Save A); `'off'` (Save B) | `settingsData[enable_pricing]` | `data.settings.value.enable_pricing` | `dokan_spmv.enable_pricing` | none | yes | Stored as literal `'on'`/`'off'`. Elementor widgets gate render on `'on' === $enable_option`. Unknown values silently behave as off. No allow-list on save. |
| `sell_item_btn` | Text input | string | `'Sell This Item'` (schema default) — NOT persisted on fresh install; relies on schema fallback at display time | `'__T_Sell_A1'` (Save A); `''` empty string (Save B, boundary) | `settingsData[sell_item_btn]` | `data.settings.value.sell_item_btn` | `dokan_spmv.sell_item_btn` | none | yes | Empty string accepted and persisted. No min-length / no fallback-on-empty at save time. Front-end will render an empty button label if user saves empty. New plugin-ui should fall back to schema default when empty. |
| `available_vendor_list_title` | Text input | string | `'Other Available Vendor'` (schema) — NOT persisted on fresh install | `'__T_Title_A1'` (Save A); **omitted entirely** (Save B, overwrite-drop test) | `settingsData[available_vendor_list_title]` | `data.settings.value.available_vendor_list_title` | `dokan_spmv.available_vendor_list_title` | none | yes | **OVERWRITE confirmed:** Save B omitted the field; DB no longer contains the key. Same pattern as Task 12 `abuse_reasons`. No merge with prior state. |
| `available_vendor_list_position` | Select | string enum (`below_tabs` \| `inside_tabs` \| `after_tabs`) | `'below_tabs'` (schema) — NOT persisted on fresh install | `'inside_tabs'` (Save A); `'__unknown_enum_val__'` (Save B) | `settingsData[available_vendor_list_position]` | `data.settings.value.available_vendor_list_position` | `dokan_spmv.available_vendor_list_position` | none | yes | Unknown enum accepted verbatim. Front-end template branches on the three known values; unknown values fall through to no-render. No allow-list on save. New plugin-ui must enforce the enum. |
| `show_order` | Select (sourced from `dokan_spmv_get_show_order_options()` filter) | string enum (`show_all` \| `min_price` \| `max_price`) | `'show_all'` (read-site fallback at `functions.php:86`); schema default also `'show_all'` — **NOT persisted on fresh install** | `'min_price'` (Save A); `'__unknown_show_order__'` (Save B) | `settingsData[show_order]` | `data.settings.value.show_order` | `dokan_spmv.show_order` | **triggers `Dokan_SPMV_Update_Product_Visibility` background job** (see hooks) | yes | Unknown enum accepted verbatim. Background visibility-recalc job is dispatched on EVERY save (not just when `show_order` changes) — see Surprises. `dokan_spmv_update_clone_visibilities()` reads the option and rewrites `wc_product_visibility` taxonomy terms for all clones in each map. Allow-list is filterable via `dokan_spmv_show_order_options`. |

**Filter / boundary findings:**
- **Empty-option default:** `wp option delete dokan_spmv` + `get_option('dokan_spmv')` → option does not exist; returns `false`. Captured to `_trace_artifacts/dokan_spmv_empty_default.json`. **Schema defaults never injected on read** — every read site supplies its own per-key fallback. The two programmatic readers use `'show_all'` for `show_order` and `'off'` for `enable_pricing`; the text fields (`sell_item_btn`, `available_vendor_list_title`) have no programmatic readers in the SPMV module — they're consumed by legacy templates with schema fallbacks at display time. **Risk:** if a third-party theme reads via `get_option('dokan_spmv')['sell_item_btn']` directly without fallback, they would get `null`/empty on fresh installs.
- **Save mode:** **OVERWRITE, unfiltered.** Save B confirmed: omitted `available_vendor_list_title` dropped from DB; unknown extra key `__unknown_extra__` persisted at top level; unknown enum values accepted verbatim. Same bug class as Tasks 8–12.
- **Unknown enum:** both `available_vendor_list_position` and `show_order` accept arbitrary strings. New plugin-ui must enforce enums on save.
- **Background side-effect (NEW pattern):** `dokan_after_saving_settings` p10 **always dispatches `Dokan_SPMV_Update_Product_Visibility` background job** when `option_name === 'dokan_spmv'`, regardless of whether `show_order` changed. This is a non-trivial DB-walking job (selects all `map_id` from `wp_dokan_product_map`, then rewrites visibility taxonomy for every clone). On large marketplaces, **every settings save** to this tab queues a slow background process. New plugin-ui should:
  - Preserve the dispatch hook for backward compat.
  - Consider gating on whether `show_order` actually changed (diff old/new value) to avoid redundant runs.
- **Cross-tab leak:** `dashboard_menu_manager: []` present in DB after every save — root cause documented in Task 9. This tab inherits the leak unchanged.
- **Real-key redaction:** **N/A** — no API-key/email/URL fields. No backup file needed.
- **Rewrite rules / cron:** none from this tab's save path itself. The dispatched background job uses WP cron internally (`WP_Background_Process` extends `WP_Async_Request` + cron fallback).
- **DB state after task:** `dokan_spmv` restored to Save A state (`enable_pricing=on`, `sell_item_btn=__T_Sell_A1`, `available_vendor_list_title=__T_Title_A1`, `available_vendor_list_position=inside_tabs`, `show_order=min_price`, `some_random_field=__T_Random_A1`). To restore production defaults, user can run `wp option delete dokan_spmv` (every read site has a fallback).
- **Round-trip count:** 5/5 writable fields traced, 5/5 round-trip after restore Save A — captured in `_trace_artifacts/dokan_spmv_reload.json`. Unknown extra `some_random_field` also round-trips (no schema filter on read).

## Side-effect / hook checklist

_Filled in Task N+1 (final pass)._

## Surprises

_Filled in Task N+1 (final pass)._

## What the new (plugin-ui) page must reproduce

_Filled in Task N+1 (final pass)._
