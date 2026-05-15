# Legacy AJAX Settings Page — Live Trace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce an evidence-backed, per-field trace of the legacy AJAX settings page (`wp-admin/admin.php?page=dokan#/settings`) on the current branch — every tab, every input, every save round-trip, every wp_options write — as a reference the in-progress plugin-ui refactor must reproduce.

**Architecture:** Code-first (read `get_settings_sections()` + `get_settings_fields()` to build a static field inventory per tab), then browser-confirm via Chrome MCP (drive every input with sentinel values and capture network requests/responses), then wp-cli DB reads after each save to confirm persistence. Results accumulate in a single trace report markdown doc, one block per tab.

**Tech Stack:** Chrome MCP browser tools, wp-cli, git, bash, Read/Edit for PHP source inspection.

---

## Source spec

Authoritative spec: `docs/superpowers/specs/2026-05-14-settings-trace-design.md`. Read it before starting Task 0.

## Output artifact (built incrementally across tasks)

`docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md` — created in Task 0, appended to by each per-tab task, finalized in the closing task.

## Conventions used throughout this plan

- **Sentinel values:** prefix every test value with `__T_` so it's easy to scan payloads and DB dumps for the change you just sent. Use distinct sentinels per field. Examples:
  - text → `__T_<field_name>_<timestamp>` (e.g. `__T_site_logo_001`)
  - checkbox/toggle → flip from current (off→on or on→off); note both
  - integer → a clearly non-default number like `4242`
  - select → an alternate non-default option
  - multi-select / repeater → add one row containing `__T_<field>_row1`
- **Chrome tab:** use `tabId=615167388` (already opened earlier). If it's gone, call `tabs_create_mcp`, navigate to `https://core-dokan.test/wp-admin/admin.php?page=dokan#/settings`, and use the new id.
- **Network capture:** before each interaction call `read_network_requests` with `clear: true` so the next read shows only the new requests.
- **DB snapshot helper:**
  ```bash
  wp option list --search='dokan_*' --field=option_name | sort > /tmp/dokan_opts_before.txt
  # …perform save…
  wp option list --search='dokan_*' --field=option_name | sort > /tmp/dokan_opts_after.txt
  diff /tmp/dokan_opts_before.txt /tmp/dokan_opts_after.txt
  ```
- **Per-tab option dump:** `wp option get <section_id> --format=json | jq .` (jq for readability; raw JSON goes in the report).
- **Commit cadence:** one commit per task. Commit message format: `docs(trace): <what>`.

---

## Task 0: Bootstrap report & enumerate tabs (BLOCKING GATE)

**Files:**
- Create: `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`
- Read: `includes/Admin/Settings.php`

- [ ] **Step 1: Create the empty report scaffold**

Write this exact file content to `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`:

```markdown
# Legacy AJAX settings page — live behavior trace report

**Branch:** `refactor/simplify-settings-to-flat-array`
**Page:** `wp-admin/admin.php?page=dokan#/settings`
**Date:** 2026-05-14

> Source spec: `docs/superpowers/specs/2026-05-14-settings-trace-design.md`

## Tab inventory

_Filled in Task 0._

## Per-tab traces

_Each task appends one section here._

## Side-effect / hook checklist

_Filled in Task N+1 (final pass)._

## Surprises

_Filled in Task N+1 (final pass)._

## What the new (plugin-ui) page must reproduce

_Filled in Task N+1 (final pass)._
```

- [ ] **Step 2: Enumerate tabs from code**

Run:
```bash
grep -n "get_settings_sections\|dokan_settings_sections\b\|add_filter.*dokan_settings_sections" -R includes/ | head -40
```

Open `includes/Admin/Settings.php` and find the `get_settings_sections()` method. Capture each section's `id`, `title`, and `icon` (if any). Note that the filter `dokan_settings_sections` may register more from elsewhere — run:
```bash
grep -rn "dokan_settings_sections" includes/ src/
```
Add every additional section id to the list. Free-only sections only (Dokan Pro is out of scope per spec).

- [ ] **Step 3: Enumerate tabs from the live DOM**

Use Chrome:
```
tabs_context_mcp                       # confirm tab 615167388 exists; create new if not
navigate → https://core-dokan.test/wp-admin/admin.php?page=dokan#/settings  (tabId=615167388)
read_network_requests (clear: true, urlPattern: "admin-ajax")   # capture initial load
read_page (filter: "interactive")      # find the tab navigation
```
Record every tab label visible in the sidebar of the settings page, in order.

- [ ] **Step 4: Capture the initial GET**

After page load, call:
```
read_network_requests (tabId: 615167388, urlPattern: "admin-ajax", limit: 30)
```
Find the request whose form-body contains `action=dokan_get_setting_values`. Record:
- Request URL
- Request method
- Form-body fields (action, nonce)
- Response JSON (top-level keys = section ids; each value = current option array)

Save the full response JSON to `/tmp/dokan_initial_get.json` for later reference.

- [ ] **Step 5: Reconcile code list vs DOM list vs initial-GET keys**

Build a 3-column table in the report under "Tab inventory":

| Section id (from code / GET) | Tab label (from DOM) | Status |

Status values: `match`, `code-only`, `dom-only`. `code-only` sections likely indicate Pro-gated or hidden tabs — exclude unless they appear in the DOM. `dom-only` is a red flag — investigate before proceeding.

- [ ] **Step 6: Snapshot baseline DB state**

```bash
wp option list --search='dokan_*' --field=option_name | sort > docs/superpowers/specs/_trace_artifacts/dokan_opts_baseline.txt
mkdir -p docs/superpowers/specs/_trace_artifacts
```
(Create the artifacts dir if missing.) This baseline is the diff target after every later save.

- [ ] **Step 7: PAUSE — confirm tab list with user before proceeding**

Open `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md` in the IDE and ask the user:

> "Tab inventory built. Confirmed tabs in order: [list]. Excluded code-only tabs: [list]. OK to proceed tab-by-tab in this order?"

Wait for explicit approval. Do not proceed to Task 1 without it.

- [ ] **Step 8: Commit**

```bash
git add docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md docs/superpowers/specs/_trace_artifacts/dokan_opts_baseline.txt
git commit -m "docs(trace): bootstrap report and tab inventory"
```

---

## Per-tab task template (repeat as Task 1..N)

> **One task per tab.** When you start Task 1 you'll know `<section_id>` and `<tab_label>` from Task 0's confirmed inventory. Substitute them everywhere below.

### Task <N>: Trace `<tab_label>` (`<section_id>`)

**Files:**
- Read: `includes/Admin/Settings.php` (for `get_settings_fields()` block matching `<section_id>`)
- Modify: `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md` (append one section)
- Create: `docs/superpowers/specs/_trace_artifacts/<section_id>_responses.jsonl` (one line per save)

- [ ] **Step 1: Static field inventory**

Run:
```bash
grep -n "<section_id>" includes/Admin/Settings.php
```
Locate the section's field array. Build a list with these columns per field:

| name | type | default | sanitize_callback | label | tooltip | dependency (show_if/depends_on) |

Also search for tab-specific filters touching this section:
```bash
grep -rn "dokan_settings_fields\b" includes/ src/ | grep -i "<section_id>\|<short_name>"
grep -rn "dokan_get_settings_values\|dokan_save_settings_value\|dokan_before_saving_settings\|dokan_after_saving_settings" includes/ src/ | grep -i "<section_id>"
```
Record any filter hooks that mutate this section.

- [ ] **Step 2: Open the tab and capture its initial slice**

```
navigate (only if not already on the page)
find (tabId: 615167388, query: "<tab_label> settings tab link")
   → click via computer tool using the returned ref
read_network_requests (clear: true)   # clear before interactions
read_page (filter: "interactive", ref_id: <main settings panel ref>)
```
Pull the slice for this section out of `/tmp/dokan_initial_get.json` (it's the value at `data.<section_id>`). This is the "Default (from initial GET)" column for every row.

- [ ] **Step 3: Exercise every field**

For each field in the static inventory, in order:

1. Pick a sentinel value per the conventions section above.
2. Find the input via `find` (query by label or visible text).
3. Set the value via `form_input` or, for non-form controls, the `computer` tool.
4. If the page has per-field save: trigger save now. If the page has a single tab-level Save button: continue to next field, then save once.
5. Capture network with `read_network_requests (clear: true)` immediately before clicking Save; read again after Save settles to grab `dokan_save_settings`.
6. Append one line to `_trace_artifacts/<section_id>_responses.jsonl`:
   ```json
   {"field":"<name>","sentinel":<sentinel>,"req_url":"…","req_body":{…},"resp":{…}}
   ```
7. Run:
   ```bash
   wp option get <section_id> --format=json | jq '.<name>'
   ```
   Record the path/value back into the trace row.
8. Run the wp_options diff helper:
   ```bash
   wp option list --search='dokan_*' --field=option_name | sort > /tmp/dokan_opts_after.txt
   diff docs/superpowers/specs/_trace_artifacts/dokan_opts_baseline.txt /tmp/dokan_opts_after.txt
   ```
   Record any newly-touched options in the "Extra wp_options touched" column for this field.
9. Negative case (if applicable): toggle off / pick alternate option / submit empty repeater, repeat capture, append second JSONL line, record secondary observations in Notes.

- [ ] **Step 4: Round-trip verification**

Reload the page in Chrome:
```
navigate → same URL (tabId: 615167388)
read_network_requests (clear: true, urlPattern: "admin-ajax")
```
Wait for the new `dokan_get_setting_values` response. Verify each sentinel value still appears in the response under `data.<section_id>.<field>`. Mark "Round-trips on reload?" Y/N per field.

- [ ] **Step 5: Append tab block to the report**

Append this template (filled in) to `2026-05-14-legacy-settings-trace-report.md` under "Per-tab traces":

```markdown
### `<section_id>` — <tab_label>

**wp_option name:** `<section_id>`
**Initial GET slice keys:** `<comma-separated list>`
**Hooks observed on this tab:**
- `<filter or action>` → `<one-line effect>`

| Field | UI control | Type | Default | Sentinel sent | Payload path | Response path | wp_option path | Extra options touched | Round-trips? | Notes |
| ----- | ---------- | ---- | ------- | ------------- | ------------ | ------------- | -------------- | --------------------- | ------------ | ----- |
| <name> | text | text | "" | __T_…_001 | settingsData[<name>] | data.settings.value.<name> | <section_id>.<name> | (none) | Y | — |
```

One row per field. For repeaters/groups, indent sub-keys with `&nbsp;&nbsp;`.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md docs/superpowers/specs/_trace_artifacts/<section_id>_responses.jsonl
git commit -m "docs(trace): <tab_label> tab (<section_id>) field trace"
```

---

## Tasks 1..N: per-tab traces

Instantiate the per-tab template once for each tab confirmed in Task 0. Anticipated order (subject to Task 0 reconciliation):

- Task 1: General (`dokan_general`)
- Task 2: Selling (`dokan_selling`)
- Task 3: Withdraw (`dokan_withdraw`)
- Task 4: RMA (`dokan_rma`)
- Task 5: Pages (`dokan_pages`)
- Task 6: Appearance (`dokan_appearance`)
- Task 7: Privacy (`dokan_privacy`)
- Task 8..N: any remaining tabs surfaced by Task 0

> If Task 0 finds tabs not listed here, add tasks for them following the template verbatim before moving to Task N+1.

---

## Task N+1: Side-effect / hook checklist

**Files:**
- Modify: `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`

- [ ] **Step 1: `withdraw_methods` default injection**

```bash
wp option delete dokan_withdraw
```
Reload settings page → trigger an initial GET → check that the response for `dokan_withdraw` contains `withdraw_methods` keyed by all known method ids with `paypal => 'paypal'` (or filtered default). Record under checklist as Pass/Fail with the observed value.

After this test, restore by saving the Withdraw tab once via the UI so a clean baseline returns.

- [ ] **Step 2: `commission_type` default**

```bash
wp option patch update dokan_selling commission_type ''
```
Reload, capture GET response, confirm `commission_type` reads as `fixed`. Record Pass/Fail.

- [ ] **Step 3: `admin_percentage` clamp [0, 100]**

In Chrome, set Selling > Admin Commission > percentage to `150`, save. Capture response value and `wp option get dokan_selling | jq .admin_percentage`. Repeat with `-10`. Record both observed values.

- [ ] **Step 4: Rewrite flush on store-URL change**

Note current rewrite rules: `wp rewrite list --format=count` (count). Save General tab with `custom_store_url` changed to `store-trace-001`. Re-count. Visit any vendor store URL and verify 200. Record before/after counts and verdict.

- [ ] **Step 5: Sanitize-fields transient warm**

```bash
wp transient delete get_dokan_settings_fields
```
Save any tab via UI. Then:
```bash
wp transient get get_dokan_settings_fields | head -c 200
```
Record whether it now exists and a one-line shape note.

- [ ] **Step 6: `new_seller_enable_selling` legacy mapping**

```bash
wp option patch update dokan_selling new_seller_enable_selling '1'   # legacy boolean
```
Reload, capture initial GET → confirm `dokan_selling.new_seller_enable_selling` reads as the modern string value (`automatically` or `manually`). Record observed mapping.

- [ ] **Step 7: Append checklist results to the report**

Append a "Side-effect / hook checklist" table to the report. Columns: `Behavior | Test performed | Observed | Verdict`.

- [ ] **Step 8: Commit**

```bash
git add docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md
git commit -m "docs(trace): side-effect and hook checklist results"
```

---

## Task N+2: Surprises section

**Files:**
- Modify: `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`

- [ ] **Step 1: Re-read every per-tab block looking for `Notes` entries flagged as non-obvious**

Specifically scan for: payload reshaping, response value ≠ payload value, fields that round-trip differently, hidden default injection, fields with no UI but present in payload, fields with UI but not in payload, async option-refresh requests.

- [ ] **Step 2: Write the section**

Append to report:
```markdown
## Surprises

For each item: behavior, where observed (tab/field), evidence (link to JSONL line in `_trace_artifacts/`), implication for the new page.
```
Fill bullets only with concrete evidence — no speculation.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md
git commit -m "docs(trace): surprises captured from per-tab notes"
```

---

## Task N+3: "What the new page must reproduce" summary

**Files:**
- Modify: `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`

- [ ] **Step 1: Synthesize a contract**

From the per-tab tables + checklist + surprises, write 5–15 bullets describing the observable behaviors the new plugin-ui page is required to preserve. Each bullet should be a single behavior, e.g.:

- "Initial load: a single GET returning `{ [section_id]: option_array }` for every visible section."
- "Save: per-section request; server returns the persisted value (read filters applied) so the client can refresh state without a second GET."
- "Withdraw: empty `dokan_withdraw` row must still surface `withdraw_methods` keyed by all known method ids."
- "`admin_percentage` must be clamped to [0, 100] for `fixed`/`flat` commission types — server-side, not client-side."

Append under heading `## What the new (plugin-ui) page must reproduce`.

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md
git commit -m "docs(trace): contract summary for the new plugin-ui page"
```

---

## Task N+4: Final self-review

- [ ] **Step 1: Verify every confirmed tab has a block**

```bash
grep -c "^### \`dokan_" docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md
```
Compare against count of confirmed tabs from Task 0. Equal? Good. Not equal? Identify gaps, return to per-tab task for the missing one.

- [ ] **Step 2: Verify every field has a row**

For each tab, cross-check the static inventory from Step 1 of its task against rows in the report. Any field present in inventory but missing from the table is a gap — add a row (running the trace if needed).

- [ ] **Step 3: Verify all sentinel values round-tripped**

```bash
grep -c '"sentinel"' docs/superpowers/specs/_trace_artifacts/*.jsonl
```
Sanity check vs total fields. Any field whose "Round-trips? = N" must have a Notes explanation.

- [ ] **Step 4: Final commit (no-op if clean)**

```bash
git status
# if anything uncommitted:
git add docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md
git commit -m "docs(trace): final self-review pass"
```

---

## Stop conditions / escalation

- If Chrome can't load the page or the install isn't on the current branch, stop and ask the user. Do not fabricate data.
- If a Save returns a non-success response, capture the error verbatim and continue with that field marked `Notes: save-error <message>` — don't abort the tab.
- If a tab uses a UI control that `form_input` can't drive (e.g. custom React widget), document the obstacle in Notes for that field, skip the negative case, and continue.

## Done definition

- Report exists at `docs/superpowers/specs/2026-05-14-legacy-settings-trace-report.md`.
- One block per confirmed tab, one row per field.
- Side-effect checklist filled with observed verdicts.
- Surprises section populated only from concrete evidence.
- "What the new page must reproduce" contract written.
- Every artifact JSONL exists in `_trace_artifacts/`.
- All work committed.
