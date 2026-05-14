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
| `dokan_menu_manager`             | Menu Manager                 | match (Pro — in scope)      |
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



## Side-effect / hook checklist

_Filled in Task N+1 (final pass)._

## Surprises

_Filled in Task N+1 (final pass)._

## What the new (plugin-ui) page must reproduce

_Filled in Task N+1 (final pass)._
