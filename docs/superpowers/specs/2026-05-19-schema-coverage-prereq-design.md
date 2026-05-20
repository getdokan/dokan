# Schema Coverage Prereq — Design Spec

**Date:** 2026-05-19
**Status:** Approved for planning
**Scope:** Backend (PHP) — settings schema additions + one PHPUnit coverage gate

## Goal

Make the admin settings schema authoritative for every legacy `(option, key)` pair that `dokan-lite`'s own code reads via `dokan_get_option()`. Concretely: every call site in `includes/` that reads from a legacy section option (`dokan_general`, `dokan_appearance`, `dokan_selling`, …) must have a corresponding new-flat schema element with a `legacy_key` declaration pointing back to that legacy address.

This is the prerequisite phase before the broader "migrate consumers to `dokan()->settings`" PR (PR-2, future). It does not migrate any callers — that PR cannot proceed safely until every legacy read has a new-flat id to migrate *to*.

## Non-goals

- Does not migrate any `dokan_get_option()` call sites to the new API.
- Does not add `dokan()->settings` container alias (PR-2).
- Does not mark `dokan_get_option()` as deprecated (PR-2).
- Does not modify `LegacySettingsRepository` or `LegacySettingsBridge`.
- Does not touch dokan-pro keys (only `dokan-lite`'s own reads are in scope).

## Current state

A discovery scan of `includes/**/*.php` finds:

- **156** `dokan_get_option()` call sites.
- **84** unique `(section, key)` pairs read.
- **216** `legacy_key` declarations in the schema.
- **21** read pairs have no `legacy_key` declaration anywhere in the schema. These are the gap this PR closes.

### The 21 unmapped reads

| Legacy pair | Call site(s) |
|---|---|
| `dokan_ai.dokan_ai_image_gen_availability` | `includes/REST/ProductControllerV3.php`, `includes/REST/VendorDashboardController.php` |
| `dokan_appearance.captcha_enable_status` | `includes/Captcha/Manager.php` |
| `dokan_appearance.captcha_provider` | `includes/Captcha/Manager.php` |
| `dokan_appearance.default_store_banner` | `includes/Utilities/VendorUtil.php` |
| `dokan_appearance.default_store_profile` | `includes/Utilities/VendorUtil.php` |
| `dokan_appearance.product_sections` | `includes/ProductSections/Featured.php`, `BestSelling.php`, `AbstractProductSection.php` |
| `dokan_appearance.recaptcha_enable_status` | `includes/functions.php`, `includes/Captcha/Manager.php` |
| `dokan_appearance.recaptcha_secret_key` | `includes/functions.php` |
| `dokan_appearance.recaptcha_site_key` | `includes/functions.php` |
| `dokan_appearance.store_list_sort_by` | `includes/Vendor/StoreListsFilter.php` |
| `dokan_appearance.store_products` | `includes/Product/Hooks.php` |
| `dokan_appearance.vendor_layout_style` | `includes/Shortcodes/FullWidthVendorLayout.php` |
| `dokan_general.contact_seller` | `includes/template-tags.php` |
| `dokan_general.store_banner_flex_height` | `includes/Admin/Dashboard/Dashboard.php` |
| `dokan_general.store_banner_flex_width` | `includes/Admin/Dashboard/Dashboard.php` |
| `dokan_general.store_map` | `includes/template-tags.php` |
| `dokan_general.store_open_close` | `includes/template-tags.php` |
| `dokan_reverse_withdrawal.reverse_withdrawal_enabled` | `includes/ReverseWithdrawal/SettingsHelper.php` |
| `dokan_selling.additional_fee` | `includes/Commission/Settings/GlobalSetting.php` |
| `dokan_selling.admin_percentage` | `includes/Commission/Settings/GlobalSetting.php`, `includes/Admin/Settings.php` |

All 21 reads are legitimate `dokan-lite` features — none are pro-only leaks. They lack schema declarations only because the schema was assembled incrementally and these fields were never registered on the new side.

## Approach

### 1. Triage each of the 21 keys

For each unmapped pair:

1. Find its existing legacy default and current value semantics (true/false, enum strings, integer, etc.).
2. Choose a new-flat id. Naming follows neighboring schema entries:
   - Lift the legacy key name directly when it's already descriptive and unique (`recaptcha_site_key` → `recaptcha_site_key`).
   - Prefix or rename when the legacy name is too generic or collides (`additional_fee` → `commission_additional_fee` if `additional_fee` is already taken).
3. Pick the section/subpage the field belongs to in the new UI. Use the existing schema groups (`marketplace_settings`, `appearance_settings`, etc.) — most of these 21 fields are already conceptually represented in those groups; we're just filling in the declarations.
4. Add the schema element with `legacy_key`, `default`, `type`, and any validation that mirrors the legacy behavior.

### 2. Add the schema declarations

Schema elements live in `includes/Admin/Settings/Schema/SettingsSchema.php` and per-tab files under `includes/Admin/Settings/Schema/Tab/`. Add each new declaration alongside its conceptual peers.

The `legacy_key` declaration has two equivalent forms (both accepted by the bridge):

```php
// String form — when path is single-level.
'legacy_key' => 'dokan_general.custom_store_url',

// Array form — also single-level, more explicit.
'legacy_key' => [
    'option' => 'dokan_general',
    'field'  => 'custom_store_url',
],
```

Either form is acceptable. Match the style of the surrounding schema entries in each file.

### 3. Add a PHPUnit coverage gate

New test file: `tests/php/src/Admin/Settings/Schema/LegacyReadCoverageTest.php`.

Behavior:

- Scans `includes/**/*.php` for literal `dokan_get_option('<key>', 'dokan_<section>')` call sites (regex-based — call sites with dynamic arguments are skipped and noted).
- Loads the bridge via `LegacySettingsBridge::get_mapping()` to get the canonical mapping table.
- Asserts every scanned `(section, key)` pair is present in the mapping.
- Test failure message lists any pairs that lack mappings, with their call-site file paths.

Single test method: `test_every_internal_dokan_get_option_call_has_a_legacy_key_mapping()`. Fails fast and loud when a new unmapped read is added.

### 4. Document the allow-list for dynamic call sites

`dokan_get_option()` is sometimes called with dynamic args (e.g., `dokan_get_option( $page, 'dokan_pages' )` where `$page` is a variable). The test's regex skips these — they can't be statically verified. The spec accepts this gap: the coverage gate guards the *static* surface, not the dynamic one. Dynamic call sites are flagged via a separate documented helper if/when they become a concern.

## Files

**Modified:**

- `includes/Admin/Settings/Schema/SettingsSchema.php` — add some of the 21 new schema elements alongside their conceptual peers (most of `dokan_general.*`, `dokan_appearance.*`, `dokan_selling.*` fields).
- `includes/Admin/Settings/Schema/Tab/AppearanceSchema.php` — likely target for `captcha_*`, `recaptcha_*`, `default_store_banner`, `default_store_profile`, `product_sections`, `store_list_sort_by`, `store_products`, `vendor_layout_style`, `store_banner_flex_*`.
- `includes/Admin/Settings/Schema/Tab/ReverseWithdrawalSchema.php` (if it exists; otherwise wherever reverse-withdrawal settings live) — `reverse_withdrawal_enabled`.
- Possibly: a tab file for AI (`AiAssistSchema.php` already exists per directory listing) — `dokan_ai_image_gen_availability`.
- Possibly: commission schema file — `additional_fee`, `admin_percentage`.

Exact file routing is determined during implementation by following neighboring declarations.

**New:**

- `tests/php/src/Admin/Settings/Schema/LegacyReadCoverageTest.php` — single coverage test.

**Not touched:**

- `includes/Admin/Settings/Migration/LegacySettingsBridge.php` — already supports both `legacy_key` forms.
- `includes/Admin/Settings/Repository/SettingsRepository.php` — no behavioral changes.
- `includes/Admin/Settings/Repository/LegacySettingsRepository.php` — no behavioral changes.
- Any `dokan_get_option()` call site — call sites do not change in this PR.

## Verification

After the PR:

1. `npm run phpunit -- --group=admin-settings` — passes, including the new coverage test.
2. `npm run phpunit -- --filter=LegacyReadCoverageTest` — single-test run, asserts 0 unmapped pairs.
3. Existing tests (`LegacySettingsBridgeTest`, `LegacySettingsRepositoryTest`, `DokanGetOptionReflectsNewSettingsTest`) — all pass without modification.
4. `composer phpcs -- includes/Admin/Settings/Schema` — clean.

## Risks

1. **New-flat id collisions.** If a chosen new-flat id matches an existing schema id, the field collides. Mitigation: the implementation plan includes a collision check (grep the existing schema for the proposed id before adding it). The existing `SchemaValidator` also detects duplicates at boot.
2. **Behavioral drift in defaults.** If the new schema entry's default differs from the legacy on-disk default, callers that previously got the legacy default may see the new one once they migrate (PR-2). Mitigation: each new declaration mirrors the existing legacy default exactly.
3. **Dynamic `dokan_get_option()` calls slip past the gate.** Documented in the spec — this PR doesn't try to solve the dynamic-arg case. PR-2 may need to address specific dynamic call sites individually.
4. **Schema element type mismatches.** A legacy value stored as `'on'`/`'off'` (string) must not be declared as `boolean` in the new schema without also declaring a transformer. Mitigation: each new declaration's `type` matches the legacy value shape; transformers are added only where the on-disk value needs translation.

## Rollout

Single PR. No feature flag. Adding schema declarations is additive — existing code paths continue to work; the bridge picks up the new mappings automatically.

1. Add the 21 schema declarations (triage + add, file by file).
2. Add the PHPUnit coverage test.
3. Run the test — it must pass with 0 unmapped pairs.
4. Run the admin-settings group — must still pass.
5. Ship.

## What this unlocks (next PR — out of scope here)

PR-2 will be brainstormed separately. With this prereq in place, every internal `dokan_get_option('<key>', 'dokan_<section>', $default)` call has a known new-flat id (`$bridge->get_mapping()[<new_id>] === ['option' => '<section>', 'field' => '<key>']`), making the bulk migration to `dokan()->settings->get('<new_id>', $default)` mechanical.
