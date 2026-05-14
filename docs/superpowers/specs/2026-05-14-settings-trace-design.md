# Settings page live-behavior trace — design

**Branch:** `refactor/simplify-settings-to-flat-array`
**Date:** 2026-05-14

## Goal

Produce a complete, evidence-backed reference of how the current admin settings page behaves end-to-end: every tab, every input, every save round-trip, every wp_options write. No comparison to develop — current branch only.

## Scope

In scope: admin settings page at `wp-admin/admin.php?page=dokan#/settings` — every tab, every field, every save round-trip, every option row written or read.

Out of scope: vendor-dashboard settings, store settings (`StoreSettingController*`), onboarding wizard, AI/intelligence settings unless surfaced on the page above.

## Method — code-first, browser-confirm

For each tab, in order:

1. **Static inventory (current branch):**
   - From the section/field registration source on this branch, list every field: `name`, `type`, `default`, sanitize/validation, conditional visibility (`show_if` / dependency), path inside the consolidated `dokan_settings` wp_option.
   - Note any tab-level filter mutations or hooks (read/write).
2. **Live trace (Chrome, current branch):**
   - Navigate to the tab.
   - On first load, capture the GET request (URL + payload + response) used to fetch settings.
   - For every input: change to a sentinel value (distinct per field), trigger save, capture request URL + JSON payload + JSON response.
   - For toggles/selects/repeaters/dependent fields, exercise the negative case too (off, alternate option, empty repeater).
3. **DB read:** after each save, dump the row via `wp option get dokan_settings --format=json` and record the resulting path/value for the field. Note any extra option rows touched.
4. **Per-tab record:** fill the trace table (below) row by row.

## Trace table schema

One block per tab; one row per field:

| Field name | UI control | Type | Default (initial GET) | Sentinel value sent | Request URL | Payload key path | Response key path | `dokan_settings` key path | Extra wp_options touched | Round-trips on reload? | Notes |

Notes column flags: validation rejections, payload reshaping, server-side mutations (response ≠ payload), conditional visibility, async option refresh requests, side effects (rewrite flush, transient warm, etc.).

## Side-effect / hook checklist

Confirm and record current-branch behaviors per save:
- Default population (e.g. withdraw methods, commission type) — does the server inject defaults when absent?
- Validation clamping (e.g. percentage [0,100]) — what does the server return when out-of-range is sent?
- Rewrite-rule flush triggers (custom store URL change) — verify via permalinks.
- Sanitization-fields transient or its successor — does it warm on save? what key?
- Any async "refresh field options" request (the old `dokan_refresh_admin_settings_field_options` analog).

## Deliverable artifact

`docs/superpowers/specs/2026-05-14-settings-trace-report.md` containing:
1. The complete trace table (one block per tab).
2. The side-effect checklist with observed behavior per item.
3. A "surprises" section: any behavior that wasn't obvious from the code alone (server-side reshaping, hidden defaults, silent validation, etc.).

## Execution plan (to be expanded by writing-plans)

Tab order — derived live from the page on first load, then locked. Anticipated order:
1. General · 2. Selling · 3. Withdraw · 4. RMA · 5. Pages · 6. Appearance · 7. Privacy · 8. (any remaining tabs discovered).

Step 0 of the plan: enumerate the authoritative tab list from the page (DOM) + the section registration in code, reconcile, and confirm with user before grinding through tabs.

## Assumptions

- Live `core-dokan.test` install runs the current branch. If not, re-baseline before proceeding.
- wp-cli works against this install (verified).
- Tabs added by paid Dokan Pro are out of scope.

## Non-goals

- No comparison to develop or any prior version.
- No code changes during the trace itself.
- No automated regression test creation in this pass.
