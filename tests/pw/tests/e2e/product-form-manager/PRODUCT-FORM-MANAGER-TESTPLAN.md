# Product Form Manager — Exhaustive Test Design

> Module: **Dokan Pro `product-editor`** (a.k.a. "Product Form Manager")
> Admin builder: `wp-admin/admin.php?page=dokan-dashboard#/product-form-manager`
> Persistence: `GET/POST /dokan/v1/product-editor/settings` → `dokan_product_editor` option (`FormSchema::SETTINGS_KEY`)
> Consumer: vendor product editor at `dashboard/new/#/products/{id}/edit` (`dokan-lite/src/dashboard/product-editor`)
> Gate: `@pro`. Admin authoring requires `manage_woocommerce`.

This plan is grounded in the actual module source. Where a phase in the original brief does not map to real behavior, that is called out explicitly rather than inventing coverage.

---

## 0. Ground-truth facts that shape this plan

| # | Fact (code-verified) | Test consequence |
|---|----------------------|------------------|
| F1 | **11 field variants**: `text`, `number`, `textarea`, `editor` (Rich Text), `radio`, `select`, `multiselect`, `checkbox`, `datetime` (Date Picker), `image`, `file` | One creation + persistence + render case per variant. |
| F2 | Custom-field config is limited to **label, type, description, placeholder**, plus an **options list (label/value)** for `select`/`multiselect`/`radio` only. **No** min/max, default-value, or date-format settings exist. | Do **not** write cases for non-existent config (min/max, default, date format). |
| F3 | `placeholder` is suppressed when a variant carries `no_placeholder` (e.g. checkbox/radio/image/file). | Placeholder assertions are variant-specific. |
| F4 | "Conditional logic" = **per-product-type overrides**. `labels`, `visibilities`, `requireds` are maps keyed by product-type slug (`simple`, `variable`, `external`, `grouped`, …). There is **no** "show field X when field Y = Z" builder. | Phase 1.4 "nested/dependent" = product-type override matrix, not field-to-field conditions. |
| F5 | A `dependencies` array appears in the REST schema response but is **not admin-configurable**. | Out of scope for the admin builder; note as a forward-looking risk only. |
| F6 | Default sections: **Shipping** (requires-shipping toggle, weight, L/W/H, shipping class, tax status, tax class, override shipping cost, additional/per-qty cost, processing time), **Attributes & Variations** (`attribute`), **Linked Products** (upsells, cross-sells, grouped — `async_select`), plus **External URL / Button Text**. | Default-block coverage targets these real sections. |
| F7 | **No** default field ships with `is_mandatory=true`; the admin UI nonetheless disables the visibility toggle when `is_mandatory` is set. | "Cannot hide mandatory field" is a UI-contract case, exercised by setting the flag via REST. |
| F8 | Shipping section is hidden for `grouped` and `external` product types by default (`visibilities`). | Product-type override case has a real default to assert against. |
| F9 | Admin client-side validation is **only** `"Field label is required."` and `"Option label is required."`. No duplicate-label, length, or block-label validation. | Several "expected" negatives are actually **gaps** → document as risk, assert current (permissive) behavior. |
| F10 | Custom field value is stored as **product post-meta keyed by the field `id`**, written through the vendor editor's product save (REST). | Persistence is verified via REST `GET /dokan/v1/products/{id}` meta, not storefront HTML. |
| F11 | **The storefront single product page does NOT render custom field values.** The module ships no `woocommerce_single_product_*` hook and an empty `templates/` dir. | **Phase 4 is invalid for custom fields.** Storefront coverage applies only to *default* WooCommerce fields (weight/dimensions/upsells) that WC core renders. A custom field's storefront-absence is itself an assertion. |
| F12 | Config is a **single global option** → cross-test state leakage risk. | Every test must capture+restore the baseline schema (the existing `api.captureBaseline/restoreBaseline` pattern). |
| F13 | `POST /settings` requires `manage_woocommerce`; **vendors cannot** write settings. `GET` falls back to default REST auth. | Permission negatives are real and testable. |

---

## 1. Test Coverage Matrix

Legend — case types: **F**unctional · **V**alidation · **N**egative · **B**oundary · **I**ntegration · **E2E** · **R**isk

| Area | F | V | N | B | I | E2E | R | IDs |
|------|---|---|---|---|---|-----|---|-----|
| Module enable/disable | ✓ | | ✓ | | | | | PFM-A01–A03 |
| Custom block CRUD | ✓ | ✓ | ✓ | ✓ | | | | PFM-B01–B09 |
| Custom field — 11 variants | ✓ | | | | | | | PFM-F01–F11 |
| Field config (desc/placeholder/options) | ✓ | ✓ | | ✓ | | | | PFM-C01–C06 |
| Default-field toggles (hide/require/rename) | ✓ | | | | | | ✓ | PFM-D01–D06 |
| Per-product-type overrides | ✓ | | | | ✓ | | ✓ | PFM-P01–P05 |
| Block/field combinations | ✓ | | | | ✓ | | | PFM-M01–M06 |
| Admin validation | | ✓ | ✓ | ✓ | | | ✓ | PFM-V01–V08 |
| Permissions / access control | | | ✓ | | | | ✓ | PFM-X01–X05 |
| Vendor-editor reflection | ✓ | ✓ | | | ✓ | | | PFM-R01–R09 |
| Product creation & persistence | ✓ | ✓ | | ✓ | ✓ | ✓ | | PFM-S01–S08 |
| Storefront display (default fields) | ✓ | | | | ✓ | ✓ | | PFM-W01–W03 |
| Storefront absence (custom fields) | | | ✓ | | | | ✓ | PFM-W04 |
| End-to-end workflows | | | | | | ✓ | | PFM-E01–E04 |

---

## 2. Functional Test Cases

### 2.1 Module & blocks
- **PFM-A01** Admin enables the `product_form_manager` (product-editor) module; builder page loads with "Default Block" + "Custom Block" tabs and a "Save Changes" button.
- **PFM-A02** Admin disables the module; builder page no longer reachable / vendor editor falls back to default form.
- **PFM-B01** Admin creates a custom block (label + description) → persists as `section` with `is_custom=true`, `visibility!==false`.
- **PFM-B02** Admin edits a custom block label → renamed section persists; old label absent.
- **PFM-B03** Admin edits a custom block description → new description persists.
- **PFM-B04** Admin deletes a custom block → section absent; default sections untouched.
- **PFM-B05** Admin creates a block, adds a field, deletes only the field → block survives, field absent.

### 2.2 Custom fields — one per variant (Phase 1.2)
For each: create on a custom block, Save, assert `field` persisted with correct `variant`, `is_custom=true`, `section_id` = block id; then open vendor editor and assert `#dokan-form-field-{id}` renders.

- **PFM-F01** `text` · **PFM-F02** `number` · **PFM-F03** `textarea` · **PFM-F04** `editor` (Rich Text) · **PFM-F05** `radio` (+options) · **PFM-F06** `select` (+options) · **PFM-F07** `multiselect` (+options) · **PFM-F08** `checkbox` · **PFM-F09** `datetime` (Date Picker) · **PFM-F10** `image` · **PFM-F11** `file`.

### 2.3 Field configuration (Phase 1.3)
- **PFM-C01** Description persists and renders as help text in the vendor editor.
- **PFM-C02** Placeholder persists and renders for placeholder-capable variants (text/number/textarea/select).
- **PFM-C03** Placeholder input is **not shown** for `no_placeholder` variants (checkbox/radio/image/file) — UI contract.
- **PFM-C04** `select`/`multiselect`/`radio` options (label→auto value) persist in `options[]` in declared order.
- **PFM-C05** Option `value` auto-derives from label when left blank.
- **PFM-C06** Reordering options in the panel persists the new order to `options[]`.

### 2.4 Default-field controls (Phase 1.3)
- **PFM-D01** Rename a default field → `label` updated, `id` unchanged.
- **PFM-D02** Hide a default field (visibility toggle) → `visibility=false`.
- **PFM-D03** Mark a default field required → `required=true`.
- **PFM-D04** Re-show a hidden default field → `visibility=true`.
- **PFM-D05** Un-require a required default field → `required=false`.
- **PFM-D06** Reset/restore returns the schema to defaults (if Reset action exists; otherwise covered by baseline restore).

---

## 3. Validation Test Cases

- **PFM-V01** Add-field with empty label → inline **"Field label is required."**; field not added.
- **PFM-V02** `select` field with an empty option label → **"Option label is required."**; field not saved.
- **PFM-V03** Same for `radio` empty option → "Option label is required."
- **PFM-V04** Same for `multiselect` empty option → "Option label is required."
- **PFM-V05** Whitespace-only field label (`"   "`) is treated as empty (trim) → "Field label is required."
- **PFM-V06** Saving a valid field clears any prior validation message.
- **PFM-V07** (Gap-documenting) Block label left empty → **no client validation exists**; assert the *current* behavior (block saves / save is silently inert) and flag as risk PFM-R-gap1.
- **PFM-V08** (Gap-documenting) Required custom field present → vendor cannot publish with it empty; vendor-side validation message renders below the field.

---

## 4. Negative Test Cases

- **PFM-N01** (Gap) Two custom fields with **identical labels** in one block → **no duplicate validation**; both persist. Assert current behavior + flag risk.
- **PFM-N02** (Gap) Two custom blocks with identical labels → both persist; flag risk (selector ambiguity downstream).
- **PFM-N03** Delete a block that has fields → block + all child fields removed together.
- **PFM-N04** Attempt to hide an `is_mandatory` field (flag set via REST) → visibility toggle disabled in UI; cannot disable.
- **PFM-N05** Cancel out of an open field-edit panel → no schema change persisted.
- **PFM-N06** Save with an open-but-unsaved field panel → builder either forces panel-save or discards; assert no orphaned/partial field in schema.

---

## 5. Boundary Value Test Cases

- **PFM-B-BV1** Field label at **255 chars** (PHP `sanitize_text_field` cap) → persists; at 256+ → trimmed/sanitized, assert stored length.
- **PFM-B-BV2** Block with **0 fields** → persists and renders an empty section (no crash) in the vendor editor.
- **PFM-B-BV3** Block with **many fields** (e.g. 20) → all persist and render in order.
- **PFM-B-BV4** `select` with **1 option** and with **many options** (e.g. 25) → all persist.
- **PFM-B-BV5** Label with **special characters / emoji / RTL** (`<b>&"'`, 😀, العربية) → persists (sanitized), renders without breaking layout; XSS payload is escaped (see PFM-X05).
- **PFM-B-BV6** `number` field vendor input boundaries: `0`, negative, decimal, very large, non-numeric → vendor-side handling.
- **PFM-B-BV7** `datetime` vendor input: min/leap/invalid date strings.

---

## 6. Integration Test Cases (admin config ↔ vendor editor ↔ stored data)

- **PFM-R01** Only blocks/fields with `visibility!==false` for the product type appear in the vendor editor (no extra blocks).
- **PFM-R02** Disabled default field is **absent** in vendor editor (`assertVendorFieldAbsent`).
- **PFM-R03** Renamed default field shows the **new label** in vendor editor.
- **PFM-R04** Required field renders the **"(REQUIRED)"** indicator.
- **PFM-R05** Custom block + field render in vendor editor (`assertVendorSeesText(block)` + `assertVendorFieldVisible(field)`).
- **PFM-R06** Field **ordering** in admin == render order in vendor editor.
- **PFM-R07** `select`/`radio` options shown in vendor editor match configured options.
- **PFM-R08** Help text (description) shows under the vendor field.
- **PFM-R09** Placeholder shows in the vendor input for placeholder-capable variants.

### Per-product-type override matrix (Phase 1.4 "dependent config")
- **PFM-P01** Hide a field for `variable` only → hidden when editing a variable product, visible for `simple`.
- **PFM-P02** Require a field for `simple` only → required for simple, optional for `variable`.
- **PFM-P03** Override a field label per product type → correct label per type.
- **PFM-P04** Default: Shipping section hidden for `grouped`/`external` product types (F8) → assert not rendered.
- **PFM-P05** `grouped` field (Linked Products) appears only for grouped product type.

---

## 7. End-to-End Scenarios (Phases 2 → 3 → 4)

- **PFM-S01** Vendor creates a product, fills every visible custom field with valid values, publishes → 200; values stored as product meta keyed by field id (verify via `GET /dokan/v1/products/{id}`).
- **PFM-S02** Required custom field left empty → publish blocked, vendor-side error; nothing saved.
- **PFM-S03** **Persistence after edit:** reopen the product editor → custom field values pre-populate from saved meta.
- **PFM-S04** **Persistence after update:** change a custom field value, save again → updated value persists; old value gone.
- **PFM-S05** **Re-publish:** unpublish → re-publish → custom field values intact.
- **PFM-S06** Per-variant value round-trip: select/multiselect store value(s); checkbox stores boolean; datetime stores normalized date; image/file store attachment id/URL.
- **PFM-S07** Deleting the field config from admin does **not** delete already-stored product meta (orphan behavior) — assert and document.
- **PFM-S08** Multiple products each carry independent custom field values (no cross-contamination).

- **PFM-W01** (Storefront, default field) Vendor sets **weight + dimensions** → storefront product "Additional information" tab shows them (WC core render).
- **PFM-W02** (Storefront, default field) Vendor sets **upsells/cross-sells** → related products render on storefront.
- **PFM-W03** (Storefront, default field) Disabling the weight field in the form and leaving weight unset → no weight row on storefront.
- **PFM-W04** (Storefront, custom field — **gap assertion**) A populated **custom** field value is present in product meta (REST) but **absent** from the storefront single-product HTML — confirms F11. Flag as product gap, not test failure.

### Composite E2E
- **PFM-E01** Full admin authoring (create block → add 1 field of each placeholder-capable variant → save) → vendor creates product filling all → publish → reopen → values intact.
- **PFM-E02** Mixed standard+custom: hide one default field, require another, add a custom required select → vendor editor reflects all three; product save enforces the required ones.
- **PFM-E03** Product-type switch mid-edit: vendor changes product type → fields show/hide per override map without losing entered values for still-visible fields.
- **PFM-E04** Module disable mid-life: products created with custom fields keep their meta after the module is disabled (no data loss).

---

## 8. Risk-Based Scenarios (prioritized)

| Risk | Why it matters | Covered by |
|------|----------------|-----------|
| **R1 — Global-option state leak** | One shared `dokan_product_editor` option; a leaked schema breaks unrelated product/editor tests | F12, baseline restore in every test |
| **R2 — No duplicate-label validation** | Duplicate field/block labels break label-based selectors and confuse vendors | PFM-N01, PFM-N02 |
| **R3 — Stored XSS via labels** | Labels are rendered in admin + vendor editor; only `sanitize_text_field` server-side | PFM-X05, PFM-B-BV5 |
| **R4 — Mandatory-field protection** | A hideable mandatory field could remove a required WC field from the form | PFM-N04 |
| **R5 — Product-type override correctness** | Wrong override map hides/requires the wrong field for the wrong type | PFM-P01–P05 |
| **R6 — Storefront non-display surprise** | Vendors/admins may expect custom values on the storefront (they don't render) | PFM-W04 (documents F11) |
| **R7 — Orphaned product meta** | Deleting field config leaves stale meta on products | PFM-S07 |
| **R8 — Vendor privilege escalation** | Vendor must not write the global form schema | PFM-X01–X04 |

---

## 9. Permission / Access-Control Cases

- **PFM-X01** Vendor `POST /dokan/v1/product-editor/settings` → **403** (`manage_woocommerce` required).
- **PFM-X02** Guest/unauthenticated `POST /settings` → 401/403.
- **PFM-X03** Vendor cannot reach `#/product-form-manager` admin page (no `manage_woocommerce`).
- **PFM-X04** Customer `POST /settings` → 403.
- **PFM-X05** Label containing `<script>` payload → stored sanitized; rendered escaped in admin + vendor editor (no script execution).

---

## 10. Automation Candidate Classification

| Bucket | Cases | Rationale |
|--------|-------|-----------|
| **Automate now (Playwright E2E, @pro)** | PFM-A01–A03, B01–B05, F01–F11, C01–C06, D01–D06, R01–R09, P01–P05, S01–S06, S08, V01–V06, V08, N01–N06, X01–X04, M01–M06 | Deterministic UI + REST round-trips; the existing page object already drives most primitives. |
| **Automate (boundary, lower priority)** | B-BV1–B-BV7, X05 | Valuable but slower; some need fixture data (images/files). |
| **Automate with caveat** | PFM-W01–W03 | Storefront default-field render — needs WC storefront assertions, slower, theme-sensitive. |
| **Document-only / manual** | PFM-W04, S07, E04, V07 | These assert *gaps* (no storefront render, orphan meta, missing validation). Encode as explicit "current behavior" assertions, not aspirational. |
| **Exploratory (`@exploratory`)** | E01–E03 | Long multi-step journeys; run as smoke, not on every PR. |

---

## 11. Notes & open questions for product/dev

1. **F11 (no storefront render of custom fields)** — confirm whether this is intended. The original Phase 4 assumes storefront display; if that's a real requirement, it's a **missing feature**, not a test to write.
2. **F9 gaps** — no duplicate-label, length, or block-label validation. Confirm whether these should be added before we lock the negative-case expectations (PFM-V07, N01, N02 currently assert the permissive behavior).
3. **F5 `dependencies`** — REST exposes it but the admin builder doesn't. Is field-to-field conditional logic on the roadmap? If so, this plan needs a whole new section.
4. **PFM-S07 orphan meta** — confirm desired cleanup behavior when a field config is deleted.
