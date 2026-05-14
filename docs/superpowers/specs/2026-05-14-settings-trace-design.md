# Legacy AJAX settings page — live behavior trace (design)

**Branch:** `refactor/simplify-settings-to-flat-array`
**Target page:** `wp-admin/admin.php?page=dokan#/settings` — the **legacy AJAX** settings page that still ships on this branch and is in production use.
**Date:** 2026-05-14

## Goal

Produce a complete, evidence-backed reference of how the legacy AJAX settings page behaves end-to-end on this branch: every tab, every input, every save round-trip, every wp_options write. The result is a reference document that the in-progress plugin-ui refactor must reproduce.

## Scope

In scope: the legacy AJAX admin settings page at `wp-admin/admin.php?page=dokan#/settings` — every tab, every field, every save round-trip, every option row written or read.

In scope (per user, 2026-05-14): **all 30 sections** that appear on the legacy page — 8 Lite/Intelligence + 22 Pro (Dokan Pro confirmed active).

Out of scope:
- The new plugin-ui settings page (separate effort).
- Vendor-dashboard settings.
- Store-level settings (`StoreSettingController*`).
- Onboarding wizard.

## What the legacy page does (confirmed from code)

- AJAX endpoints (in `includes/Admin/Settings.php`):
  - `action=dokan_get_setting_values` — initial load; returns all sections as `{ [section_id]: option_array }`.
  - `action=dokan_save_settings` — saves one section per click; payload `{ nonce, section, settingsData[…] }`.
  - `action=dokan_refresh_admin_settings_field_options` — refreshes dynamic options (e.g. dependent dropdowns).
- Persistence: one wp_option per section (`dokan_general`, `dokan_selling`, `dokan_withdraw`, `dokan_appearance`, `dokan_privacy`, `dokan_rma`, `dokan_pages`, …).
- Read-time filter mutators: `dokan_get_settings_values` (e.g. `withdraw_methods` defaults, `commission_type` default, vendor layout fallback).
- Write-time filter mutators: `dokan_save_settings_value` (e.g. clamp `admin_percentage`).
- Side effects: `dokan_before_saving_settings` / `dokan_after_saving_settings`; flush rewrite rules when `custom_store_url` changes; sanitize-fields transient `get_dokan_settings_fields` (90s).

## Method — code-first, browser-confirm

Per tab, in order:

1. **Static inventory (this branch):**
   - From `get_settings_sections()` and `get_settings_fields()` (via the live filters), list every field for the tab: `name`, `type`, `default`, `sanitize_callback`, conditional visibility (`show_if` / dependency), tooltip/label.
   - Note any tab-level filter mutations (read & write).
2. **Live trace (Chrome, this branch):**
   - Open the tab; capture the initial GET (the `dokan_get_setting_values` response slice for this section) — URL, payload, response.
   - For every input: set a unique sentinel value, click Save, capture the `dokan_save_settings` request URL + form payload + JSON response.
   - For toggles/selects/repeaters/dependent fields, exercise the negative/alternate case too.
   - For dependent dropdowns, capture any `dokan_refresh_admin_settings_field_options` requests.
3. **DB read (wp-cli):**
   - After each save: `wp option get <section_id> --format=json` and record the resulting path/value for the field.
   - Note any extra option rows touched (transients, other dokan_*, etc.) via `wp option list --search='dokan_*' --field=option_name` diff.

## Trace table schema

One block per tab; one row per field:

| Field name | UI control | Type | Default (from initial GET) | Sentinel sent | Request action | Payload key path | Response key path | wp_option name | Key path inside option | Extra wp_options touched | Round-trips on reload? | Notes |

Notes flag: validation rejections, payload reshaping, server mutations (response ≠ payload), conditional visibility, async option refresh, side effects (rewrite flush, transient warm).

## Side-effect / hook checklist

Confirm and record observed behavior per save:
- `withdraw_methods` default-injection on empty `dokan_withdraw`.
- `commission_type` defaulting to `fixed` on empty `dokan_selling`.
- `admin_percentage` clamped to [0, 100] for flat/fixed.
- Rewrite-rule flush when `custom_store_url` in `dokan_general` changes (verify via permalinks endpoint or rewrite rules).
- `get_dokan_settings_fields` transient warming on save/load.
- `new_seller_enable_selling` legacy-value mapping in the GET response.

## Deliverable artifact

`docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md` containing:
1. Complete trace table — one block per tab.
2. Side-effect checklist with observed behavior per item.
3. "Surprises" section: anything not obvious from code alone (server-side reshaping, hidden defaults, silent validation, async refresh flows).
4. A short "what the new page must reproduce" summary at the end — feeds the refactor.

## Execution plan (to be expanded by writing-plans)

Tab order — derived live from the page on first load, then locked. Anticipated order:
1. General · 2. Selling · 3. Withdraw · 4. RMA · 5. Pages · 6. Appearance · 7. Privacy · 8. (any remaining tabs discovered).

Step 0 of the plan: enumerate the authoritative tab list from the live page (DOM) + `get_settings_sections()` and confirm with user before grinding through tabs.

## Assumptions

- The live `core-dokan.test` install runs this branch.
- wp-cli works against this install (verified).
- Tabs added by paid Dokan Pro are out of scope unless they appear on the free legacy page.

## Non-goals

- No tracing of the new plugin-ui page.
- No code changes during the trace itself.
- No automated regression tests in this pass.
