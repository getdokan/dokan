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

_Each task appends one section here._

## Side-effect / hook checklist

_Filled in Task N+1 (final pass)._

## Surprises

_Filled in Task N+1 (final pass)._

## What the new (plugin-ui) page must reproduce

_Filled in Task N+1 (final pass)._
