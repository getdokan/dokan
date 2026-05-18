# `dependency_key` cleanup — discovery report

**Date:** 2026-05-18
**Source plan:** `docs/superpowers/plans/2026-05-18-dependency-key-cleanup.md`
**Task:** Phase 0 / Task 0 — read-only audit of dot-path `show_if` / `add_dependency` / `dependencies` rules.

## Scan scope

- **dokan-lite**: `includes/` (PHP) — full subtree
- **dokan-pro**: `/Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/dokan-pro` — full plugin tree (vendor/, dependencies/ excluded as false positives)
- **plugin-ui**: `/Users/mahbub/Development/Projects/core-dokan/wp-content/plugins/plugin-ui/src` — TypeScript + MDX

## Scan methodology

`add_dependency()` does not exist anywhere in either Dokan plugin — the convention is inline `'show_if' => [...]` arrays in legacy schemas and inline `'dependencies' => [...]` arrays in the new flat-array schemas. Both shapes were inspected:

1. **Legacy `show_if`** — key is the first array key inside the `show_if` array, e.g. `'show_if' => [ 'commission_type' => [ 'equal' => 'fixed' ] ]`.
2. **New `dependencies`** — key is the value of the `'key'` entry inside each dependency object, e.g. `'dependencies' => [ [ 'key' => 'commission.commission.commission_type', 'value' => 'fixed', ... ] ]`.

Classification rule:
- **flat** — single segment, no dots (e.g. `commission_type`, `withdraw_methods`, `billing_type`).
- **dot-path** — contains at least one `.` (e.g. `dokan_selling.one_step_product_create`, `commission.commission.commission_type`, `printful_integration.printful_api_settings.printful_api_settings_group.printful_enable`).

Variable-built keys (`$dep_engine`, `$dep_social`, `$dep_path`) were resolved to their literal definitions.

False positives explicitly excluded:
- `dokan-pro/dependencies/GuzzleHttp/Psr7/MimeType.php:497` — MIME map (`'key' => 'application/vnd.apple.keynote'`)
- `dokan-pro/vendor/hybridauth/.../example_06/config.php:16` — bundled vendor example
- `dokan-pro/includes/REST/StoreController.php:275`, `dokan-pro/includes/Reports/SalesByDate.php:147,186,223` — WC report SQL `where` clauses keyed by `order_items.order_item_type` (database column reference, not a settings dependency)
- `dokan-lite/includes/Admin/Settings/Schema/SettingsRegistry.php:263,271` — default `'dependencies' => []` (empty arrays, not rules)
- `dokan-lite/includes/Abstracts/SettingsElement.php:667` — `'dependencies' => $this->get_dependencies()` (output assembly, not a rule literal)
- `dokan-lite/includes/ProductEditor/FormSchema.php` and `dokan-pro/includes/Product/FormSchema.php`, `dokan-pro/includes/VendorDiscount/ProductEditorFields.php`, `dokan-pro/modules/order-min-max|wholesale|rma|vendor-subscription-product/.../ProductEditorFields.php`, `dokan-pro/modules/product-editor/.../ProductEditorController.php` — these `'dependencies'` arrays belong to the **WooCommerce Product Editor block** schema, not the admin settings system. Their `key` values are class constants like `Elements::TYPE`, `ProductDiscount::IS_LOT_DISCOUNT`, `Elements::DISABLE_SHIPPING_META` — none use dot-path strings.
- `dokan-pro/includes/VendorDiscount/BlockSupportIntegration.php:43`, `dokan-pro/modules/delivery-time/.../BlockSupportIntegration.php:54`, `dokan-pro/modules/simple-auction/module.php:358` — script-handle `'dependencies' => []` for `wp_register_script`, unrelated.

## Dot-path show_if / dependencies rules found

### dokan-lite

| File | Line | Key | Form | Notes |
| --- | --- | --- | --- | --- |
| `includes/Admin/Settings.php` | 699 | `dokan_selling.one_step_product_create` | dot-path | Legacy `show_if` on `disable_product_popup`. Page-prefixed (2 segments). |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 286 | `location.map_api_configuration.map_api_source` | dot-path | New flat schema `dependencies[].key` (fieldgroup `google_map_api_key`). |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 294 | `location.map_api_configuration.map_api_source` | dot-path | Same fieldgroup, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 329 | `location.map_api_configuration.map_api_source` | dot-path | `mapbox_api_key` fieldgroup. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 337 | `location.map_api_configuration.map_api_source` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 513 | `commission.commission.commission_type` | dot-path | `admin_commission` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 521 | `commission.commission.commission_type` | dot-path | `admin_commission` hide. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 552 | `commission.commission.commission_type` | dot-path | `reset_sub_category_when_edit_all_category` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 560 | `commission.commission.commission_type` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 578 | `commission.commission.commission_type` | dot-path | `commission_category_based_values` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 586 | `commission.commission.commission_type` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 594 | `commission.commission.reset_sub_category_when_edit_all_category` | dot-path | `commission_category_based_values` custom-effect rule. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 602 | `commission.commission.reset_sub_category_when_edit_all_category` | dot-path | Same, off branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 668 | `withdraw_charge.section_withdraw_charge.withdraw_methods_group_paypal.paypal_withdraw` | dot-path | `paypal_withdraw_charges` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 676 | `withdraw_charge.section_withdraw_charge.withdraw_methods_group_paypal.paypal_withdraw` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 723 | `withdraw_charge.section_withdraw_charge.withdraw_methods_group_bank.bank_transfer_withdraw` | dot-path | `bank_transfer_withdraw_charges` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 731 | `withdraw_charge.section_withdraw_charge.withdraw_methods_group_bank.bank_transfer_withdraw` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 859 | `reverse_withdrawal.reverse_withdrawal_section.billing_type` | dot-path | `reverse_balance_threshold` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 867 | `reverse_withdrawal.reverse_withdrawal_section.billing_type` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 890 | `reverse_withdrawal.reverse_withdrawal_section.billing_type` | dot-path | `monthly_billing_day` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 898 | `reverse_withdrawal.reverse_withdrawal_section.billing_type` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1077 | `vendor_capabilities.vendor_capabilities.one_page_creation` | dot-path | `product_popup` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1085 | `vendor_capabilities.vendor_capabilities.one_page_creation` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1221 | `store.google_recaptcha.google_recaptcha_settings.recaptcha` | dot-path | `recaptcha_info` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1229 | `store.google_recaptcha.google_recaptcha_settings.recaptcha` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1248 | `store.google_recaptcha.google_recaptcha_settings.recaptcha` | dot-path | `recaptcha_site_key` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1256 | `store.google_recaptcha.google_recaptcha_settings.recaptcha` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1275 | `store.google_recaptcha.google_recaptcha_settings.recaptcha` | dot-path | `recaptcha_secret_key` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1283 | `store.google_recaptcha.google_recaptcha_settings.recaptcha` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1697 | `product_generation.product_image_section.product_info_generate` | dot-path | `product_info_engine` show. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1705 | `product_generation.product_image_section.product_info_generate` | dot-path | Same, hide branch. |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1752, 1760 | `$dep_engine` → `product_generation.product_image_section.product_info_engine` | dot-path | Dynamic loop over AI providers (per-provider api_info_group). |
| `includes/Admin/Settings/Schema/SettingsSchema.php` | 1782, 1790, 1817, 1825, 1847, 1855, 1886, 1894 | `$dep_generate` → `product_generation.product_image_section.product_info_generate` | dot-path | Same dynamic loop, per-provider api_info / api_notice / api_key / model fields (×4 fields × 2 branches). |

Flat-key declarations in dokan-lite (kept for context, not part of the cleanup target):
- `includes/Intelligence/Admin/Settings.php` lines 79, 95 — `dokan_ai_engine` (flat)
- `includes/ReverseWithdrawal/Admin/Settings.php` lines 79, 95 — `billing_type` (flat)
- `includes/Admin/Settings.php` lines 586, 599, 612 — `commission_type` (flat); 757 — `withdraw_methods` (flat); 909, 922 — `map_api_source` (flat)
- `includes/CatalogMode/Admin/Settings.php` line 57 — `catalog_mode_hide_add_to_cart_button` (flat)
- `includes/Captcha/Manager.php` lines 169, 181 — `captcha_enable_status`, `captcha_provider` (flat)

### dokan-pro

| File | Line | Key | Form | Notes |
| --- | --- | --- | --- | --- |
| `includes/Shipping/ShippingStatus.php` | 179 | `dokan_shipping_status_setting.enabled` | dot-path | Legacy single-line `show_if` (`'dokan_shipping_status_setting.enabled' => [ 'equal' => 'on' ]`). Page-prefixed (2 segments). |
| `includes/Admin/Settings/Schema/ProSettingsSchema.php` | 579 | `withdraw_charge.withdraw_option_visibility_section.weekly_withdraw_group.weekly_withdraw` | dot-path | Weekly withdraw schedule fields. |
| `includes/Admin/Settings/Schema/ProSettingsSchema.php` | 644 | `withdraw_charge.withdraw_option_visibility_section.monthly_withdraw_group.monthly_withdraw` | dot-path | Monthly schedule. |
| `includes/Admin/Settings/Schema/ProSettingsSchema.php` | 691 | `withdraw_charge.withdraw_option_visibility_section.biweekly_withdraw_group.biweekly_withdraw` | dot-path | Biweekly. |
| `includes/Admin/Settings/Schema/ProSettingsSchema.php` | 738 | `withdraw_charge.withdraw_option_visibility_section.quarterly_withdraw_group.quarterly_withdraw` | dot-path | Quarterly. |
| `includes/Admin/Settings/Schema/ProSettingsSchema.php` | 805 | `withdraw_charge.section_withdraw_charge.withdraw_methods_group_custom.custom_withdraw` | dot-path | Custom method name. |
| `includes/Admin/Settings/Schema/ProSettingsSchema.php` | 822 | `withdraw_charge.section_withdraw_charge.withdraw_methods_group_custom.custom_withdraw` | dot-path | Custom method type. |
| `includes/Admin/Settings/Schema/ProSettingsSchema.php` | 933 | `$dep_path` → `storefont_social_onboarding.storefont_social_onboarding_section.social_login` | dot-path | Resolved from line 924 definition. |
| `includes/Admin/Settings/Schema/ProSettingsSchema.php` | 1147 | `shipment-setting-page.shipment-settings.allows_shipment_tracking` | dot-path | Note: uses hyphens in two segments (page-id + section-id), then underscore field id. |
| `modules/printful/includes/Admin/Schema/PrintfulSettingsSchema.php` | 62, 63, 73, 74, 84, 85, 96, 97, 108, 109 | `printful_integration.printful_api_settings.printful_api_settings_group.printful_enable` | dot-path | All 10 dependency clauses for printful_app_name / printful_app_url / printful_redirection_domains / printful_client_id / printful_secret_key (5 fields × show+hide). |
| `modules/live-chat/includes/Schema/LiveChatSettingsSchema.php` | 62, 100, 118 | `livechat.livechat_settings.livechat_enabled` | dot-path | Visibility on `livechat_enabled`. |
| `modules/live-chat/includes/Schema/LiveChatSettingsSchema.php` | 74, 86 | `livechat.livechat_settings.livechat_provider` | dot-path | Visibility on `livechat_provider == talkjs`. |
| `modules/vendor-verification/includes/Admin/Schema/VendorVerificationSettingsSchema.php` | 113, 168, 223, 285, 347, 428 | `$dep_social` → `vendor-verification-page.social-connect-section.social_login` | dot-path | Resolved from line 20 definition. Note: page + section ids use hyphens. |
| `modules/vendor-verification/includes/Admin/Schema/VendorVerificationSettingsSchema.php` | 448 | `vendor-verification-page.social-connect-section.social_verification_required` | dot-path | |
| `modules/vendor-verification/includes/Admin/Schema/VendorVerificationSettingsSchema.php` | 511 | `sms-gateways-page.sms-provider.sms_provider` | dot-path | |
| `modules/vendor-verification/includes/Admin/Schema/VendorVerificationSettingsSchema.php` | 586 | `sms-gateways-page.sms-provider.sms_provider` | dot-path | |

Flat-key legacy `show_if` declarations in dokan-pro (not part of the cleanup target):
- `includes/CustomWithdrawMethod.php` 155, 168 — `withdraw_methods` (flat)
- `includes/Intelligence/Settings.php` 57, 78, 96 — `dokan_ai_image_gen_availability` (flat)
- `modules/vendor-verification/includes/Admin/Settings.php` 408, 472 — `active_gateway` (flat)
- `modules/delivery-time/includes/Settings.php` 120, 133 — `delivery_buffer_unit` (flat)
- `modules/product-adv/includes/Admin/Settings.php` 96 — `per_product_enabled` (flat)
- `modules/live-chat/includes/AdminSettings.php` 92, 104, 119, 131 — `provider` (flat)

### plugin-ui (TS sources)

Plugin-ui code under `src/components/settings/` does **not** hardcode any dot-path dependency keys — the consumers (`fields.tsx`, `field-renderer.tsx`, `settings-context.tsx`, `settings-formatter.ts`) read whatever `element.dependency_key` value PHP supplies, then match it against rule `key` strings as-is. The dot-paths only appear inside Storybook fixtures and MDX docs:

| File | Line range | Form | Notes |
| --- | --- | --- | --- |
| `src/components/settings/Settings.stories.tsx` | 155, 1521, 1577, 1614, 1656, 1693, 1730, 1759, 1783, 1811, 1846, 1853, 1888, 1983, 2007, 2102, 2126, 2221, 2245, 2340, 2347, 2382, 2420, 2465, 2501, 2525, 2567, 2604, 2641, 2677, 2715, 2746, 2770, 2794, 2801, 2851, 2889, 2927, 2984, 3021, 3058, 3095, 3132, 3161, 3168, 3201, 3238, 3275, 3312, 3341, 3378, 3409, 3444, 3481, 3518, 3549, 3575, 3599, 3641, 3678, 3725, 3769, 3813, 3857, 3893, 3900, 3924, 3949, 3975, 4001, 4027, 4053, 4078, 4104, 4133, 4141, 4192, 4229, 4292, 4338, 4385, 4421, 4455, 4544, 4590, 4637, 4673, 4707, 4775, 4799, 4836, 4895, 4941, 4988, 5024, 5058, 5118, 5124, 5174, 5216, 5253, 5290, 5327, 5361, 5378, 5385, 5419, 5461, 5498, 5535, 5572, 5609, 5665, 5702, 5739, 5776, 5813, 5850, 5887, 5924, 5969, 5976, 6011, 6048, 6073, 6098, 6146, 6181, … (407 `dependency_key` lines, vast majority dot-path) | dot-path | Stories were copy-imported from rendered PHP fixtures during the plugin-ui design phase; they reflect the current PHP shape. Cleanup happens during Phase 2 task that rebuilds the storybook fixture. |
| `src/components/settings/Settings.stories.tsx` | 207, 224, 235, 246, 274, 285, 305, 328, 339, 372, 416, 432, 446, 464, 509, 520, 544, 1337, 1346, 1359, 1409, 1437 | flat | A subset of the same file uses flat keys (the demo store/payment/notification fixtures). |
| `src/DeveloperGuide.mdx` | 895, 896, 897 | flat | Docs example uses flat keys (`store_name`, `enable_tax`, `tax_rate`). |
| `src/components/settings/Settings.mdx` | 58, 281, 288, 306, 404, 437, 721 | flat | Docs examples. |
| `src/components/settings/settings-types.ts` | 52, 142 | n/a | Type declaration (`dependency_key?: string`). |
| `src/components/settings/fields.tsx` | 176, 200, 238, 270, 290, 375, 416, 451, 471, 475, 515, 537, 591, 597, 726, 925, 928, 944, 961 | n/a | Reads `element.dependency_key!` as the field id passed to `onChange`. Will need to swap to `element.id` in Phase 2. |
| `src/components/settings/settings-context.tsx` | 30, 32, 139, 146, 147, 178, 312, 329, 359 | n/a | Reads `element.dependency_key` for value-map keys, dirty tracking, error matching. Phase 2 swap. |
| `src/components/settings/settings-formatter.ts` | 14 occurrences | n/a | The formatter that currently **rebuilds dot-paths client-side** (overwrites server `dependency_key`). Phase 2 must rewrite it to keep server-supplied `id`. |
| `src/components/settings/field-renderer.tsx` | 2 occurrences | n/a | Reads `element.dependency_key` for rule matching. Phase 2 swap. |

## Totals

- Dot-path keys in **dokan-lite**: **31 literal dot-paths** in `SettingsSchema.php` (30 literal + 1 in legacy `Admin/Settings.php:699`) plus **10 dynamic** (`$dep_engine` × 2 + `$dep_generate` × 8, in a `foreach` over AI providers — so the runtime count is `2 + 8 = 10` per registered provider).
- Dot-path keys in **dokan-pro**: **17 direct literals** in PHP schema files + **6 occurrences of `$dep_social` (1 literal definition) + 1 occurrence of `$dep_path` (1 literal definition)** + **1 legacy `show_if`** (`ShippingStatus.php:179`). Effective count = **25 distinct rule sites**, spanning 5 files: `Shipping/ShippingStatus.php`, `Admin/Settings/Schema/ProSettingsSchema.php`, `modules/printful/.../PrintfulSettingsSchema.php`, `modules/live-chat/.../LiveChatSettingsSchema.php`, `modules/vendor-verification/.../VendorVerificationSettingsSchema.php`.
- Dot-path keys in **plugin-ui**: **0 in production source code** (`fields.tsx`, `settings-context.tsx`, `settings-formatter.ts`, `field-renderer.tsx`); **~380+ in Storybook fixtures** (`Settings.stories.tsx`), all of which are fixture data mirroring the current PHP output.
- **Compat-fallback needed?** **YES** (read-side fallback in REST controller + dependency matcher, deprecation-logged).

## Reasoning

The cleanup cannot land without the read-side compat fallback. Both `dokan-lite` and `dokan-pro` ship production schemas that declare `dependencies[].key` (and one `show_if` per plugin) in fully-qualified dot-path form. In `dokan-lite/SettingsSchema.php` every single `dependency` rule (30 literal + 10 dynamic) is dot-path; there are **zero** flat dependency-rule key literals in the new flat-schema file. In `dokan-pro` the situation is identical for every schema file that participates in the new flat-schema system (`ProSettingsSchema`, `PrintfulSettingsSchema`, `LiveChatSettingsSchema`, `VendorVerificationSettingsSchema`).

Today these rules **work** because the existing plugin-ui formatter (`settings-formatter.ts:188`) regenerates the same dot-path for each element by walking the tree, and the matcher in `field-renderer.tsx` does exact-string comparison. The moment Phase 3 collapses `dependency_key` → `id` (flat), every one of these rules breaks unless the matcher can still resolve a dot-path rule key to the field id (last segment). That is exactly what the plan's "read-side compat — try `id` first, then last-dot-segment fallback" describes, and the plan's deprecation-log behavior (`_doing_it_wrong`-style) is the right policy because **most of those rules are first-party Dokan PHP** that we own and will rewrite incrementally — but we cannot rewrite them atomically with the contract flip, because:

1. They live across two plugins shipped independently (lite users may run pro versions that lag behind by one release cycle).
2. Third-party addons that copied the pattern from `ProSettingsSchema.php` or `PrintfulSettingsSchema.php` will keep emitting dot-paths after our cleanup, indefinitely. The compat fallback protects them.

Two borderline cases were resolved as **dot-path** rather than flat:

- The single dokan-lite legacy `show_if` at `Admin/Settings.php:699` (`dokan_selling.one_step_product_create`) is technically a 2-segment dot-path (page-prefix + field id). It is still dot-path under the project's definition. Removable in a Phase 2 cleanup commit but the matcher must support it until then.
- dokan-pro's `ShippingStatus.php:179` (`dokan_shipping_status_setting.enabled`) is the same shape: option-group-prefix + field id. Same treatment.

The plugin-ui Storybook fixtures (~380 dot-path `dependency_key` strings in `Settings.stories.tsx`) are not "production" in the sense of running in WP, but they are the canonical demo and visual-regression baseline; Phase 2 includes a rebuild of those fixtures to flat-id form (or, ideally, a fixture generator that consumes the real REST shape).

**Decision:** keep Task 3 Step 4 (matcher read-side fallback) and Task 5 Step 2 (REST controller read-side fallback) **with the deprecation log** in the implementation plan. Do NOT simplify Task 5 to a fallback-removal-only change.

## Plugin-ui consumers reading `element.dependency_key`

Verbatim grep output for `dependency_key` in `plugin-ui/src` (TS/TSX, MDX). Useful for sizing the Phase 2 swap to `element.id`:

```
plugin-ui/src/components/settings/settings-formatter.ts:    14 occurrences (most critical — it currently REBUILDS dot-path; Phase 2 deletes that logic)
plugin-ui/src/components/settings/fields.tsx:               19 occurrences (every onChange call site)
plugin-ui/src/components/settings/settings-types.ts:         2 occurrences (interface declaration + comment)
plugin-ui/src/components/settings/field-renderer.tsx:        2 occurrences (rule matching read path)
plugin-ui/src/components/settings/settings-context.tsx:      9 occurrences (value map keys, dirty tracking, error matching, scope index)
plugin-ui/src/components/settings/Settings.stories.tsx:    472 occurrences (Storybook fixtures — ~407 dot-path, rest flat)
plugin-ui/src/components/settings/Settings.mdx:              ~10 occurrences (docs examples — already flat)
plugin-ui/src/DeveloperGuide.mdx:                            3 occurrences (already flat)
```

Total: **47 occurrences in plugin-ui core source** (excluding stories + docs) — manageable atomic swap to `element.id` in Phase 2.

## dokan-lite consumers reading `element.dependency_key` (frontend)

Verbatim grep output for `dependency_key` in `dokan-lite/src`. Same use — Phase 2 sizing:

```
src/admin/dashboard/utils/settingsDependencyParser.ts:        2 occurrences  (lines 29, 31)
src/admin/dashboard/utils/settingsDependencyApplicator.ts:    4 occurrences  (lines 80, 81, 85, 91)
src/admin/dashboard/utils/settingsTypes.ts:                   1 occurrence   (line 50 — interface field)
src/admin/dashboard/pages/settings/fields/DokanVendorInfoPreview.tsx: 2 occurrences (lines 129, 132)
src/admin/dashboard/pages/settings/fields/DokanSingleProductPreview.tsx: 2 occurrences (lines 140, 143)
src/admin/dashboard/pages/settings/fields/DokanDoubleInput.tsx:       2 occurrences (lines 25, 28)
src/admin/dashboard/pages/setup-guide/StepSettings.tsx:               1 occurrence  (line 45 — interface field)
```

Total: **14 occurrences in dokan-lite frontend** — very small Phase 2 swap surface. No hardcoded dot-path strings in TS source (every value is read from `element.dependency_key`, which is server-supplied).
