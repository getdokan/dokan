# Settings refactor parity verification — design

**Branch:** `refactor/simplify-settings-to-flat-array`
**Baseline:** `develop`
**Date:** 2026-05-14

## Goal

Prove the settings refactor preserves every observable behavior of the pre-refactor admin settings system. Output is a parity table + gap list, not code changes.

## Scope

In scope: admin settings page at `wp-admin/admin.php?page=dokan#/settings` — every tab, every field, every save round-trip, every option-row written.

Out of scope: vendor-dashboard settings, store settings (`StoreSettingController*`), onboarding wizard settings, AI/intelligence settings unless surfaced on the page above.

## Baseline (develop) — confirmed shape

- AJAX endpoints registered in `includes/Admin/Settings.php`:
  - `wp_ajax_dokan_get_setting_values` — returns `{ [section_id]: option_array }` for every section
  - `wp_ajax_dokan_save_settings` — saves one section per call
  - `wp_ajax_dokan_refresh_admin_settings_field_options` — refresh dynamic options
- Save payload: `action=dokan_save_settings`, `nonce`, `section` (the wp_option name), `settingsData[…]`
- Persistence: one wp_option per section. Section ids are e.g. `dokan_general`, `dokan_selling`, `dokan_withdraw`, `dokan_appearance`, `dokan_privacy`, `dokan_rma`, `dokan_pages`, etc. The authoritative list comes from `get_settings_sections()` + the `dokan_settings_sections` filter.
- Filter hooks affecting save/read:
  - `dokan_get_settings_values` (read mutator) — e.g. `set_withdraw_limit_gateways`, `set_commission_type_if_not_set`, `set_vendor_latest_layout`
  - `dokan_save_settings_value` (write mutator) — e.g. `validate_fixed_price_values`
  - `dokan_before_saving_settings` / `dokan_after_saving_settings` — side effects (e.g. flush rewrite rules when `custom_store_url` changes in `dokan_general`)
- Sanitization: per-field callback resolved from field `type` via `get_sanitize_callback()` and cached in transient `get_dokan_settings_fields` (90s).

## Current branch — observed shape

- All sections consolidated into single `dokan_settings` wp_option (commit 969f20711).
- Admin page rebuilt on `@wedevs/plugin-ui` (commit 985d5e7da).
- Unused legacy field components and the `adminSettings` store removed (commits 589c4c62d, 739d7984d).
- AJAX endpoints, payload shape, and per-section read filters: TO BE VERIFIED via live trace and code inspection.

## Method — code-first, browser-confirm

For each tab, in order:

1. **Static inventory (develop):**
   - From `get_settings_sections()` and `get_settings_fields()` on develop, list every field: `name`, `type`, `default`, `sanitize_callback`, conditional visibility (`show_if` / dependency).
   - Note any tab-level filter mutations (e.g. `dokan_settings_general_site_options`).
2. **Static inventory (current branch):**
   - Locate the equivalent field schema in the new flat-array source.
   - Record the path of each field inside `dokan_settings`.
3. **Live trace (current branch, Chrome):**
   - Navigate to the tab.
   - For every input: change to a sentinel value (distinct per field so the diff is unambiguous), trigger save, capture request URL + JSON payload + JSON response.
   - After save, dump the wp_options row via `wp option get dokan_settings --format=json`.
   - For toggles/selects/repeaters/dependent fields, also exercise the negative case (off, alternate option, empty repeater).
4. **Per-tab parity row:** for each field, fill the parity table (below).

## Parity table schema

| Tab | Field name (old) | Old option key | Old type | Old default | Old sanitize | New path in `dokan_settings` | New type | New default | Saves on UI? | Persisted? | Round-trips on reload? | Parity verdict |

Verdicts: ✅ identical · ⚠️ behavior-equivalent but shape changed · 🔴 regression · ➕ new field · ➖ removed field.

## Filter / side-effect parity checklist

Confirm these old behaviors still happen (or are documented as intentionally dropped):
- `withdraw_methods` defaults to `{ paypal }` on fresh install when `dokan_withdraw` is empty.
- `commission_type` defaults to `fixed` when unset in `dokan_selling`.
- `admin_percentage` clamped to [0, 100] for flat/fixed commission types.
- Rewrite rules flush when `custom_store_url` changes.
- `new_seller_enable_selling` legacy-value mapping (pre/post 4.0.2).
- Sanitize cache transient `get_dokan_settings_fields` (or its successor) still warms.

## Deliverable artifact

`docs/superpowers/specs/2026-05-14-settings-refactor-parity-report.md` (separate from this design doc) containing:
1. The completed parity table (one block per tab).
2. The filter / side-effect checklist with pass/fail per item.
3. A categorized gap list: regressions, intentional changes, ambiguous.

## Execution plan (to be expanded by writing-plans)

Tabs will be processed in this order so dependencies surface early:
1. General · 2. Selling · 3. Withdraw · 4. RMA · 5. Pages · 6. Appearance · 7. Privacy · 8. (any remaining tabs discovered during step 0)

Step 0 of the plan: enumerate the authoritative tab list from both develop's `get_settings_sections()` and the new branch's section registration, reconcile, and confirm with user before grinding through tabs.

## Open questions / assumptions

- Assumes the live `core-dokan.test` install runs the current branch (`refactor/simplify-settings-to-flat-array`). If not, re-baseline.
- Assumes wp-cli works against this install (verified — it does).
- Tabs added/removed by paid Dokan Pro are out of scope.

## Non-goals

- No code changes during the parity check itself. Findings feed a follow-up fix plan.
- No automated regression test creation in this pass (could be a follow-up).
