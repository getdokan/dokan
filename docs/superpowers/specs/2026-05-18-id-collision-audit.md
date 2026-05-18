# Field id collision audit

**Date:** 2026-05-18
**Source plan:** `docs/superpowers/plans/2026-05-18-dependency-key-cleanup.md` Phase 2 Task 3
**Parent head:** `2fe6625d8`
**Sources audited:**
- CSV-generated: `includes/Admin/Settings/Schema/Generated/csv_fields.php` (216 entries; 208 of `type=field`)
- dokan-lite hand-authored: `includes/Admin/Settings/Schema/SettingsSchema.php`
- dokan-pro hand-authored: **17 schema files** under `dokan-pro/includes/` and `dokan-pro/modules/` (the Phase 0 discovery report's "5 schema files" guess was wrong — the real number is 17)

## Methodology

Field ids were extracted with a `token_get_all`-based PHP parser (`/tmp/extract_field_ids.php`, not committed) so that multi-line array literals are captured reliably. The parser walks every `[` in each file, recording the top-level `id`, `type`, and parent-pointer keys (`page_id`, `subpage_id`, `section_id`, `fieldgroup_id`) for any array literal that declares both `id` and `type` at depth 1.

For the CSV source, ids were read directly via `require` and indexed by the `id` field; parent context comes from the entry's `top_tab` + `sub_path` keys.

Two views of "collision" matter:
1. **View A — collisions on the new (flat) id.** The collapse target. Two declarations sharing the same id in the merged runtime schema block the `dependency_key === id` flip.
2. **View B — collisions on the CSV `legacy_key.field` value.** These are pre-existing dups in the legacy wp_options storage; they are already resolved by the CSV generator's namespacing rule and surface here only as context.

Only `type=field` and `type=fieldgroup` ids participate in the post-flatten field-id space (plugin-ui's `buildIdIndex` walks only field-type elements; structural-type ids like `page`, `subpage`, `section` are resolved through `*_id` parent pointers with type-compatible matching, so they never enter the field id-space). Structural-type collisions are reported separately as schema smells, not as Task 4 rename targets.

## Pro schema file inventory

17 hand-authored Pro schema files were found, not the 5 listed in the source plan. Per-file field-id counts (only `type=field` + `type=fieldgroup`):

| File | field+fieldgroup ids | section/subpage/page ids | Total |
| --- | ---: | ---: | ---: |
| `includes/Admin/Settings/Schema/ProSettingsSchema.php` | 58 | 17 | 75 |
| `modules/color-scheme-customizer/includes/Admin/Schema/ColorCustomizerSettingsSchema.php` | 1 | 2 | 3 |
| `modules/delivery-time/includes/Admin/Schema/DeliveryTimeSettingsSchema.php` | 9 | 3 | 12 |
| `modules/geolocation/includes/Admin/Schema/GeolocationSettingsSchema.php` | 7 | 2 | 9 |
| `modules/germanized/includes/Admin/Schema/GermanizedSettingsSchema.php` | 5 | 4 | 9 |
| `modules/live-chat/includes/Schema/LiveChatSettingsSchema.php` | 6 | 2 | 8 |
| `modules/printful/includes/Admin/Schema/PrintfulSettingsSchema.php` | 15 | 3 | 18 |
| `modules/product-adv/includes/Admin/Schema/ProductAdvSettingsSchema.php` | 8 | 2 | 10 |
| `modules/report-abuse/includes/Admin/Schema/ReportAbuseSettingsSchema.php` | 4 | 3 | 7 (10 incl. dup-line scan) |
| `modules/request-for-quotation/includes/Admin/Schema/RfqSettingsSchema.php` | 6 | 2 | 8 |
| `modules/rma/includes/Admin/Schema/RmaSettingsSchema.php` | 5 | 4 | 9 (14 incl. dup-line scan) |
| `modules/single-product-multiple-vendor/includes/Admin/Schema/SpmvSettingsSchema.php` | 5 | 2 | 7 |
| `modules/store-support/includes/Admin/Schema/StoreSupportSettingsSchema.php` | 3 | 2 | 5 |
| `modules/subscription/includes/classes/Schema/SubscriptionSettingsSchema.php` | 10 | 2 | 12 |
| `modules/vendor-analytics/includes/Admin/Schema/VendorAnalyticsSettingsSchema.php` | 5 | 2 | 7 |
| `modules/vendor-verification/includes/Admin/Schema/VendorVerificationSettingsSchema.php` | 47 | 7 | 54 |
| `modules/wholesale/includes/Schema/WholesaleSettingsSchema.php` | 3 | 2 | 5 |

(Counts above use the token-parser's depth-1 walk; minor discrepancies vs. naïve `grep -c "'id' =>"` reflect the parser correctly excluding ids declared inside nested option arrays.)

## Totals

| Source | field+fieldgroup declarations | Unique field+fieldgroup ids | In-source duplicates |
| --- | ---: | ---: | ---: |
| CSV-generated | 208 | 208 | 0 (namespaced by generator) |
| dokan-lite (`SettingsSchema.php`) | 61 | 59 | 2 (`google_map_api_key`, `mapbox_api_key`) |
| dokan-pro (17 files) | 191 | 190 | 1 (`social_login`, across 2 files) |
| **Merged across all 3** | **460** | **456** | **4** |

## Cross-source collisions on the new flat id (Task 4 rename targets)

Four ids are declared more than once in the merged field+fieldgroup id-space. These are the only declarations that block the `dependency_key === id` collapse:

| Colliding id | Occurrences | Keep canonical at | Renames | Read-site count (settings reads) |
| --- | --- | --- | --- | --- |
| `enabled` | `dokan-lite/includes/Admin/Settings/Schema/SettingsSchema.php:804` (Reverse Withdrawal switch, `section_id=reverse_withdrawal_section`) **+** `dokan-pro/includes/Admin/Settings/Schema/ProSettingsSchema.php:1258` (Email Verification switch, `section_id=email-verification`) | **Neither.** Both are user-visible "enable this feature" switches on different pages — renaming the lite one (Reverse Withdrawal) drops fewer Pro references; renaming the pro one (Email Verification) drops fewer Lite references. Recommended: rename **both** to disambiguated domain-prefixed names. | lite → `reverse_withdrawal_enabled`; pro → `email_verification_enabled` | 4 lite reads + 4 pro reads (full list below) |
| `social_login` | `dokan-pro/includes/Admin/Settings/Schema/ProSettingsSchema.php:905` (Appearance > Storefront Social Login switch, `section_id=storefont_social_onboarding_section`) **+** `dokan-pro/modules/vendor-verification/includes/Admin/Schema/VendorVerificationSettingsSchema.php:88` (Verification > Social Connect switch, `section_id=social-connect-section`) | `ProSettingsSchema.php:905` (Appearance/Storefront — this is the long-standing "social login on the storefront page" feature; the vendor-verification one is newer and module-gated) | vendor-verification occurrence → `social_verification_login` (preserves intent: this switch enables social-profile verification for vendors, not literal sign-in) | **0 `dokan_get_option` reads on either.** Both ids are referenced only inside their respective schema files as `dep_path` / `$dep_social` source values for `dependencies[].key` rules — those rules will be rewritten in Task 5/6 anyway. |
| `google_map_api_key` | `dokan-lite/includes/Admin/Settings/Schema/SettingsSchema.php:281` (fieldgroup, `section_id=map_api_configuration`) **+** `dokan-lite/includes/Admin/Settings/Schema/SettingsSchema.php:317` (field, `field_group_id=google_map_api_key`) | The **field** at line 317 (this is the data-bearing element; the fieldgroup is a layout wrapper). | Rename the fieldgroup → `google_map_api_key_group` (and update the `field_group_id` pointers at lines 307, 320 to match). | **0 settings reads on `google_map_api_key`.** Storage uses the legacy field name `gmap_api_key` (4 read sites: `includes/Assets.php:1173`, `includes/Admin/SetupWizard.php:487`, `includes/functions.php:3411,3608`); the new schema id `google_map_api_key` does not appear in any `dokan_get_option` call. Rename is schema-only. |
| `mapbox_api_key` | `dokan-lite/includes/Admin/Settings/Schema/SettingsSchema.php:324` (fieldgroup, `section_id=map_api_configuration`) **+** `dokan-lite/includes/Admin/Settings/Schema/SettingsSchema.php:355` (field, `field_group_id=mapbox_api_key`) | The **field** at line 355 (same reasoning as `google_map_api_key`). | Rename the fieldgroup → `mapbox_api_key_group` (and update `field_group_id` pointers at lines 350, 358). | **0 settings reads on `mapbox_api_key`.** Storage uses `mapbox_access_token` (2 read sites: `includes/Assets.php:1188`, `includes/functions.php:3610`); the new schema id is unused in read code. Rename is schema-only. |

### Detailed read sites for `enabled`

**dokan-lite (4 reads):**
- `includes/Assets.php:836` — `dokan_get_option( 'enabled', 'dokan_shipping_status_setting', 'off' )` *(reads the Pro shipping-status `enabled` — Lite ships this read but the option is owned by Pro; mapped by the bridge)*
- `includes/Assets.php:1471` — same
- `includes/ReverseWithdrawal/SettingsHelper.php:24` — `'on' === dokan_get_option( 'enabled', 'dokan_reverse_withdrawal', 'off' )` *(this is the read for the lite-owned Reverse Withdrawal `enabled` field)*
- `includes/Dashboard/Templates/Orders.php:136` — `dokan_get_option( 'enabled', 'dokan_shipping_status_setting', 'off' )`

**dokan-pro (4 reads):**
- `includes/SocialLogin.php:34` — `dokan_get_option( 'enabled', 'dokan_social_api' )` *(reads the CSV-generated Social Onboarding `enabled`; flat-id `vendors_social_onboarding_enabled` after CSV adoption)*
- `includes/EmailVerification.php:382` — `dokan_get_option( 'enabled', 'dokan_email_verification' )` *(reads the pro-owned Email Verification `enabled`)*
- `includes/Shipping/Helper.php:24` — `dokan_get_option( 'enabled', 'dokan_shipping_status_setting', 'off' )`
- `includes/Shipping/ShippingStatus.php:45` — same

The `dokan_get_option('enabled', '<wp_option>', ...)` form already disambiguates by wp_option section, so the legacy storage layer is collision-free. Post-flatten, the rename map produces these new ids:

| Old call site | New direct flat-id read |
| --- | --- |
| `dokan_get_option('enabled', 'dokan_reverse_withdrawal', 'off')` | `dokan_get_option('reverse_withdrawal_enabled', ...)` *(or use the CSV-generated `transactions_reverse_withdrawal_enabled` once CSV is enabled)* |
| `dokan_get_option('enabled', 'dokan_email_verification', ...)` | `dokan_get_option('email_verification_enabled', ...)` *(or CSV `verification_email_verification_enabled`)* |
| `dokan_get_option('enabled', 'dokan_social_api', ...)` | CSV-generated `vendors_social_onboarding_enabled` (no hand-authored declaration today) |
| `dokan_get_option('enabled', 'dokan_shipping_status_setting', 'off')` | CSV-generated `shipment_shipment_setting_enabled` (no hand-authored declaration today) |

Two of the four storage paths (`dokan_social_api`, `dokan_shipping_status_setting`) have no hand-authored schema declaration at all; their `enabled` field exists only in the CSV-generated schema. The Lite + Pro hand-authored schemas only own the Reverse Withdrawal `enabled` (lite) and Email Verification `enabled` (pro) — so only those two needing renames in Task 4. The Pro `Shipping/ShippingStatus.php` legacy `show_if` at line 179 (already noted in the Phase 0 discovery report) reads `dokan_shipping_status_setting.enabled` indirectly via dot-path matching; Task 6 rewrites it.

## Structural-type id collisions (informational — not Task 4 rename targets)

Several structural-type ids share their name with a sibling element. These do **not** collide in the post-flatten field id-space (plugin-ui's `buildIdIndex` only walks `type=field` elements; structural parent pointers use type-compatible matching), so they are not blocking. They are noted here as schema smells that should be cleaned up opportunistically:

| Id | Occurrences | Notes |
| --- | --- | --- |
| `commission` | `dokan-lite/SettingsSchema.php:468` (subpage) **+** `dokan-lite/SettingsSchema.php:476` (section) | Single-section subpage; section id mirrors subpage id. Not a field-space collision. Safe to leave. |
| `fees` | `dokan-lite/SettingsSchema.php:389` (subpage) **+** `dokan-lite/SettingsSchema.php:398` (section) | Same pattern as `commission`. Safe to leave. |
| `vendor_capabilities` | `dokan-lite/SettingsSchema.php:1028` (subpage) **+** `dokan-lite/SettingsSchema.php:1036` (section) | Same pattern. Safe to leave. |
| `vendor_subscription` | `dokan-pro/modules/subscription/.../SubscriptionSettingsSchema.php:22` (subpage) **+** `dokan-pro/modules/subscription/.../SubscriptionSettingsSchema.php:36` (field) | A field and its containing subpage share a name. The field is a "feature switch" and the subpage is its container. Field id-space is unaffected (no second field declares `vendor_subscription`), but a global validator (Task 7 sniff) should accept this with an allow-list entry or flag it. **Recommend renaming the field to `vendor_subscription_enable`** at the same time as Task 4 to remove the smell; otherwise the future PHPCS sniff has to special-case it. |
| `store_template` | `dokan-lite/SettingsSchema.php:1339` (section) **+** `dokan-lite/SettingsSchema.php:1344` (field) | Field-as-only-occupant-of-its-section pattern. Same recommendation: rename field to `store_template_choice` if a structural-id sniff is added. |
| `privacy_policy_content` | `dokan-lite/SettingsSchema.php:1568` (section) **+** `dokan-lite/SettingsSchema.php:1573` (field) | Same pattern as `store_template`. **This was the in-source dup flagged by the source plan as "declared twice"** — the audit confirms it's a section+field name reuse, not two competing field declarations. Recommend rename to `privacy_policy_content_text` (or similar) only if a sniff is added. |

None of these block Task 4. They are listed so the eventual PHPCS sniff (Task 7) knows whether to allow-list or rename them.

## In-source duplicates (cross-source already covered above)

No additional in-source dups beyond the two `lite × lite` fieldgroup-vs-field cases (`google_map_api_key`, `mapbox_api_key`) and the one `pro × pro` cross-file case (`social_login`). All already itemized in the cross-source collision table.

## CSV legacy-key duplicates (informational)

These show up only in the CSV source's `legacy_key.field` column. The CSV generator already namespaces the **new flat id** (e.g. `vendors_single_product_multi_vendor_enable_pricing` vs `vendors_vendor_subscription_enable_pricing`), so they do **not** appear as collisions in View A. They are listed here because they're the ones the Phase 0 spot-check called out and because dokan-pro read sites still use the legacy form via `dokan_get_option('enable_pricing', 'dokan_X', ...)`:

| legacy `field` | Count | Legacy `option` values | CSV-generated new ids |
| --- | ---: | --- | --- |
| `enabled` | 4 | `dokan_email_verification`, `dokan_social_api`, `dokan_shipping_status_setting`, `dokan_reverse_withdrawal` | `verification_email_verification_enabled`, `vendors_social_onboarding_enabled`, `shipment_shipment_setting_enabled`, `transactions_reverse_withdrawal_enabled` |
| `enable_pricing` | 2 | `dokan_spmv`, `dokan_product_subscription` | `vendors_single_product_multi_vendor_enable_pricing`, `vendors_vendor_subscription_enable_pricing` |
| `google_details` | 2 | `dokan_verification`, `dokan_social_api` | `appearance_storefront_social_google_details`, `vendors_social_onboarding_google_details` |
| `linkedin_details` | 2 | `dokan_verification`, `dokan_social_api` | `appearance_storefront_social_linkedin_details`, `vendors_social_onboarding_linkedin_details` |

The Phase 0 discovery report mentioned "3× google_details" and "3× linkedin_details" based on an earlier source-CSV scan; the actual count in the generated `csv_fields.php` is **2× each**.

## Proposed rename map (for Task 4)

The map below is keyed by `old_id => new_id`. Only entries that block the `dependency_key === id` flip are listed — i.e., the **field-vs-field and fieldgroup-vs-field collisions** from the cross-source table above. The rename "loser" is the chosen occurrence to rename; the "keep" occurrence retains its original id.

```php
$renames = [
    // ─────────────────────────────────────────────────────────────────────
    // Cross-source field collision: 'enabled' (lite × pro)
    // Both occurrences rename to disambiguated names. No clear canonical.
    // ─────────────────────────────────────────────────────────────────────
    // dokan-lite: SettingsSchema.php:804 (Reverse Withdrawal switch)
    //   - rename schema id 'enabled' → 'reverse_withdrawal_enabled'
    //   - 1 read site in lite: includes/ReverseWithdrawal/SettingsHelper.php:24
    'enabled@dokan_reverse_withdrawal' => 'reverse_withdrawal_enabled',

    // dokan-pro: ProSettingsSchema.php:1258 (Email Verification switch)
    //   - rename schema id 'enabled' → 'email_verification_enabled'
    //   - 1 read site in pro: includes/EmailVerification.php:382
    'enabled@dokan_email_verification' => 'email_verification_enabled',

    // The other two 'enabled' fields (dokan_social_api, dokan_shipping_status_setting)
    // are CSV-only — already namespaced as 'vendors_social_onboarding_enabled' and
    // 'shipment_shipment_setting_enabled'. No hand-authored rename needed.

    // ─────────────────────────────────────────────────────────────────────
    // Cross-source field collision: 'social_login' (pro × pro)
    // Canonical: ProSettingsSchema (storefront social login).
    // ─────────────────────────────────────────────────────────────────────
    // dokan-pro: modules/vendor-verification/.../VendorVerificationSettingsSchema.php:88
    'social_login@vendor-verification' => 'social_verification_login',

    // ─────────────────────────────────────────────────────────────────────
    // In-source fieldgroup-vs-field collisions (dokan-lite)
    // Canonical: the field. Rename the fieldgroup wrapper.
    // ─────────────────────────────────────────────────────────────────────
    // dokan-lite: SettingsSchema.php:281 (fieldgroup wrapping google_map_api_key field)
    'google_map_api_key@fieldgroup' => 'google_map_api_key_group',

    // dokan-lite: SettingsSchema.php:324 (fieldgroup wrapping mapbox_api_key field)
    'mapbox_api_key@fieldgroup' => 'mapbox_api_key_group',
];
```

> **Note on the `@<context>` suffix:** the keys above include a disambiguator because the old id alone is ambiguous (it's exactly the collision we're trying to resolve). Task 4 will translate this into per-file rewrites — there is no single "rename `enabled` to X" line in the actual code, because each occurrence is in a different file with a different rename target. The map is presented in this shape for readability; the actual implementation walks each occurrence's file:line and applies the right new id.

## Read-site impact map

For Task 4 Step 3, the files that need updating:

| Old id | New id | Files to update |
| --- | --- | --- |
| `enabled` (Reverse Withdrawal occurrence) | `reverse_withdrawal_enabled` | dokan-lite `includes/ReverseWithdrawal/SettingsHelper.php:24` (the `dokan_get_option('enabled', 'dokan_reverse_withdrawal', ...)` call — note: post-Task 4, `dokan_get_option`'s second argument becomes irrelevant for the new flat-id read; the call updates to `dokan_get_option('reverse_withdrawal_enabled', '', 'off')` or whatever the bridge-compat signature lands on) |
| `enabled` (Email Verification occurrence) | `email_verification_enabled` | dokan-pro `includes/EmailVerification.php:382` |
| `social_login` (vendor-verification occurrence) | `social_verification_login` | **None outside the schema file itself.** The id is referenced only as the source of the `$dep_social` dot-path variable inside `VendorVerificationSettingsSchema.php` (line 20 definition, used by lines 113/168/223/285/347/428 of the same file). Task 6 rewrites those dependency rules anyway. No external read site grep hits. |
| `google_map_api_key` (fieldgroup) | `google_map_api_key_group` | **Schema-only.** Update the `field_group_id` pointers at `dokan-lite/SettingsSchema.php:307` and `:320`. No `dokan_get_option('google_map_api_key', ...)` reads exist anywhere; storage uses `gmap_api_key` (4 read sites already enumerated above), which is the **legacy_key**, not the new schema id, and is unaffected by the schema rename. |
| `mapbox_api_key` (fieldgroup) | `mapbox_api_key_group` | **Schema-only.** Update `field_group_id` pointers at `dokan-lite/SettingsSchema.php:350` and `:358`. Storage uses `mapbox_access_token` (2 read sites), again unaffected. |

The Lite `enabled@dokan_shipping_status_setting` and `enabled@dokan_social_api` reads (4 hits) are NOT renamed by Task 4 because the corresponding **hand-authored** field doesn't exist; only the CSV form does, and its id is already disambiguated by the generator. Those read sites continue working through the bridge during the CSV-rollout phase.

## Recommendation

The rename list is **small and uncontroversial**:

1. The two `lite × pro` `enabled` renames are mechanically obvious — neither id is the "canonical" one because both serve different domains (Reverse Withdrawal vs Email Verification). The proposed names (`reverse_withdrawal_enabled`, `email_verification_enabled`) follow the domain-prefix policy stated in the cleanup plan ("when a flat id would collide, pick a domain-prefixed rename").
2. The `social_login` collision picks ProSettingsSchema as canonical because it's the older, user-visible "Storefront Social Login" feature. The vendor-verification occurrence is module-gated and newer; renaming it to `social_verification_login` keeps the semantic intent ("social-profile verification for vendors", which is what that toggle actually controls — see VendorVerificationSettingsSchema.php:88's `description`). **This is the only call worth surfacing to product**: the choice of which `social_login` to rename is a UX decision masquerading as a technical one. **Recommend confirming with product before Task 4 lands.**
3. The two fieldgroup renames are zero-impact (no read site code touches them); the rename is schema-only.
4. No CSV-side renames are needed — the generator's namespacing rule has already produced collision-free ids.
5. No Lite hand-authored renames beyond `enabled@dokan_reverse_withdrawal`.
6. No Pro hand-authored renames beyond `enabled@dokan_email_verification` + `social_login@vendor-verification`.

**Total renames for Task 4:** 5 (2 Lite, 3 Pro). **Total read-site code touches:** 2 (1 Lite, 1 Pro) — the rest are schema-internal or dependency-rule rewrites that Task 5/6 will handle.

The structural-type id reuses (`commission`, `fees`, `vendor_capabilities`, `vendor_subscription`, `store_template`, `privacy_policy_content`) are **not Task 4 work**. They surface only when Task 7's PHPCS sniff lands — at that point the sniff either allow-lists them (recommended for the subpage/section pairs `commission`, `fees`, `vendor_capabilities`) or triggers cleanup renames (recommended for the section/field pairs `vendor_subscription`, `store_template`, `privacy_policy_content`). The Task 7 author should refer back to this section.
