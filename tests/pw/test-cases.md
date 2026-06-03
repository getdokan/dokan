# Dokan Test Cases — Author Sheet

> **For QA:** Fill this file out and the Claude skill will scaffold matching specs and page objects under `tests/e2e/<slug>/` (or `tests/api/<slug>.spec.ts` for API features).
>
> **For the skill:** Read this file in full, then create one folder + spec + page object per `## Feature` block. Match the templates in `setup.md` §3 and §4 exactly. Skip blocks where `Status: skip`.

---

## How to add test cases

You have **two ways** to add test cases:

1. **Edit this file directly** — fill in a `## Feature:` block using the template below and save.
2. **Ask Claude** — say "add test cases for <feature>" and the skill will interview you (slug, gate, roles, scenarios) and write the block into this file. The skill **always** writes here first; it never scaffolds straight into `tests/e2e/`.

The skill will not scaffold any spec until the feature block lives in this file with `Status: build`.

---

## Section rules — every feature block has up to three sections

Every `## Feature:` block must include scenarios under these three sections:

| Section            | Required? | What goes in it                                                              |
|--------------------|-----------|------------------------------------------------------------------------------|
| **Happy Paths**    | **Mandatory** | The golden, expected flows. The user does the right thing and the feature works. At least one case. |
| **Edge Cases**     | Optional  | Boundary or unusual conditions: empty state, max length, large quantity, race conditions, slow network. |
| **Negative Cases** | Optional  | The user does the wrong thing or violates a rule. Validation errors, permission denials, 4xx/5xx API responses. |

Edge and Negative sections are **optional** — leave them out (or empty) if not relevant. Happy Paths is **never** optional. The skill will refuse to scaffold a feature with zero Happy Path cases.

When the skill builds specs, it `test.describe`-groups cases by section so the report keeps the structure visible.

---

## Feature template — copy this for every feature

```
## Feature: <human-readable feature name>
- Slug: <kebab-case-folder-name>          # used as folder + file name
- Type: e2e | api                          # which folder it lands in
- Plugin gate: lite | liteOnly | pro      # picks the @lite / @liteOnly / @pro tag
- Roles: admin, vendor, customer, guest   # one or more — picks @role tags
- Storage state: admin, vendor, vendor2, customer, customer2, guest  # which auth files to load
- REST seed: yes | no                      # whether the page object needs a REST helper
- Status: build | skip                     # `skip` means don't generate yet

### Happy Paths
1. <role> can <action>
   - Steps:
     1. <step>
     2. <step>
   - Expected: <observable outcome>
   - Tag extras: @exploratory, @visual    # optional — added on top of @<gate> + @<role>

### Edge Cases    # optional — delete this section if you have no edge cases
1. <role> <handles boundary condition>
   - Steps: ...
   - Expected: ...

### Negative Cases    # optional — delete this section if you have no negative cases
1. <role> cannot <forbidden action>
   - Steps: ...
   - Expected: <error / validation / 4xx>
```

---

## Example — already wired, do NOT regenerate

## Feature: Abuse Reports
- Slug: abuse-reports
- Type: e2e
- Plugin gate: pro
- Roles: admin, customer
- Storage state: admin, customer
- REST seed: yes
- Status: skip

### Happy Paths
1. admin can view abuse reports list
   - Steps:
     1. Log in as admin
     2. Navigate to /wp-admin/admin.php?page=dokan#/abuse-reports
   - Expected: Reports table renders with seeded report rows

2. customer can submit an abuse report from a single product page
   - Steps:
     1. Open a vendor's single product
     2. Click "Report abuse"
     3. Pick a reason, submit
   - Expected: Toast confirms submission; report appears in admin list

### Edge Cases
1. admin sees empty state when no reports exist
   - Steps:
     1. Delete all seeded reports via REST
     2. Reload the abuse reports page
   - Expected: Empty-state placeholder is shown, not a broken table

### Negative Cases
1. customer cannot submit an abuse report without selecting a reason
   - Steps:
     1. Open the report dialog
     2. Leave reason empty, click submit
   - Expected: Inline validation error; no network request fires

2. guest cannot open the report dialog
   - Steps:
     1. Visit a single product as a guest
   - Expected: "Report abuse" link is hidden or redirects to login

---

<!-- ============================================================
     ADD YOUR FEATURES BELOW. Delete this comment when you start.
     Remember: Happy Paths is mandatory, the other two are optional.
     ============================================================ -->

## Feature: Product Form Manager
- Slug: product-form-manager
- Type: e2e
- Plugin gate: pro
- Roles: admin, vendor
- Storage state: admin, vendor
- REST seed: yes
- Status: build

> Dokan Pro `product-editor` module. Admin builds the vendor product form at
> `wp-admin/admin.php?page=dokan-dashboard#/product-form-manager`; config persists
> through `GET/POST /dokan/v1/product-editor/settings` (global `dokan_product_editor`
> option) and is consumed by the vendor editor at `dashboard/new/#/products/{id}/edit`.
> Every test MUST capture the baseline schema in beforeAll and restore it in
> afterEach — the config is a single global option (state-leak risk).
> NOTE: custom field values are stored as product meta but are NOT rendered on the
> storefront single product page (module ships no frontend hook). Storefront display
> applies only to default WooCommerce fields (weight/dimensions/upsells). See
> PRODUCT-FORM-MANAGER-TESTPLAN.md in tests/e2e/product-form-manager/ for the full matrix.

### Happy Paths
1. admin can create a custom block
   - Steps:
     1. Open the Product Form Manager builder
     2. Custom Block tab → Create Block → fill label + description → Save → Save Changes
   - Expected: GET /settings returns a `section` with the label, `is_custom=true`, `visibility!==false`

2. admin can add a custom field of each variant to a custom block
   - Steps:
     1. Create a custom block
     2. Add Field → pick variant (text, number, textarea, editor, radio, select, multiselect, checkbox, datetime, image, file) → Save → Save Changes
   - Expected: each field persists with the correct `variant`, `is_custom=true`, and `section_id` = block id (one test per variant, data-driven)

3. admin can add a select field with options
   - Steps:
     1. Create a block, Add Field, choose Select, add options Small/Medium/Large → Save
   - Expected: `options[]` persists with matching labels in order; values auto-derive from labels

4. admin can configure field description and placeholder
   - Steps:
     1. Add a text field with a description and placeholder → Save Changes
   - Expected: description + placeholder persist; placeholder input is hidden for no-placeholder variants (checkbox/radio/image/file)

5. admin can edit a custom block label and a custom field label
   - Steps:
     1. Create block + field, Save
     2. Reopen, edit block label and field label, Save Changes
   - Expected: new labels persist; old labels absent

6. admin can rename, hide, and require a default field
   - Steps:
     1. Pick an optional default field
     2. Rename it, toggle visibility off, toggle required on (separate tests), Save Changes
   - Expected: `label` updated / `visibility=false` / `required=true` respectively; `id` unchanged

7. admin can set a per-product-type override
   - Steps:
     1. Scope to a product type (e.g. variable), hide/require/relabel a field, Save Changes
   - Expected: change lands in `visibilities`/`requireds`/`labels` keyed by that product-type slug; other types unaffected

8. configured blocks and fields reflect in the vendor product editor
   - Steps:
     1. Set schema via REST (custom block + field; a disabled default field; a renamed default field; a required field)
     2. Vendor creates a product and opens the editor
   - Expected: custom block/field render (`#dokan-form-field-{id}`); disabled field absent; renamed label shows; required field shows the "(REQUIRED)" indicator; options/description/placeholder render
   - Tag extras: @exploratory

9. vendor can create a product with custom field values that persist
   - Steps:
     1. Configure a custom block + fields via REST
     2. Vendor fills every visible custom field with valid values → Publish
     3. Reopen the editor; then update one value and save again
   - Expected: publish succeeds; values stored as product meta keyed by field id (verify via GET /dokan/v1/products/{id}); values pre-populate on reopen; updated value persists after re-save

10. default fields set by the vendor render on the storefront
   - Steps:
     1. Vendor sets weight + dimensions (and upsells) on a product
     2. Open the storefront single product page
   - Expected: weight/dimensions show in the Additional Information tab; upsells render (WooCommerce core display)

### Edge Cases
1. admin can delete a custom field and a custom block
   - Steps:
     1. Create block + field, Save
     2. Delete the field (block survives), then delete the block, Save Changes
   - Expected: field absent then block absent; default sections untouched

2. block with zero fields and block with many fields round-trip
   - Steps:
     1. Create an empty block; create another with ~20 fields → Save Changes
   - Expected: both persist; empty block renders without crashing; all 20 fields render in order in the vendor editor

3. field label at the 255-char sanitize boundary
   - Steps:
     1. Add a field with a 255-char label, and one with 256+ → Save Changes
   - Expected: stored label respects `sanitize_text_field` (255 cap); no crash

4. label with special characters / emoji / RTL persists and renders
   - Steps:
     1. Add a field whose label has `<b>&"'`, emoji, and Arabic text → Save Changes
   - Expected: persists sanitized; renders without breaking admin or vendor layout

5. custom field value survives module being disabled
   - Steps:
     1. Create a product with a custom field value
     2. Disable the product-editor module
   - Expected: product meta is retained (no data loss)

6. custom field value is stored but NOT shown on the storefront (gap assertion)
   - Steps:
     1. Vendor saves a custom field value
     2. Confirm it exists in product meta via REST
     3. Open the storefront single product page
   - Expected: value present in REST meta, absent from storefront HTML — documents the known no-render gap, not a failure

### Negative Cases
1. empty custom field label is rejected
   - Steps:
     1. Add Field, leave label empty, Save
   - Expected: inline "Field label is required."; field not added

2. empty option label on select/radio/multiselect is rejected
   - Steps:
     1. Add a select (and radio, multiselect) field, add an empty option, Save
   - Expected: inline "Option label is required."; field not saved

3. required custom field blocks vendor publish when empty
   - Steps:
     1. Configure a required custom field via REST
     2. Vendor leaves it empty and tries to publish
   - Expected: publish blocked; vendor-side validation error renders under the field; nothing saved

4. mandatory field cannot be hidden
   - Steps:
     1. Set a field `is_mandatory=true` via REST, open the builder
   - Expected: visibility toggle for that field is disabled; cannot turn it off

5. vendor cannot write the form schema
   - Steps:
     1. POST /dokan/v1/product-editor/settings with vendor credentials
   - Expected: 403 (manage_woocommerce required); customer and guest also rejected (403/401)

6. duplicate block/field labels are accepted (gap assertion)
   - Steps:
     1. Create two custom fields with identical labels in one block; two blocks with identical labels → Save Changes
   - Expected: all persist (no duplicate validation exists) — assert current permissive behavior and flag as risk

7. stored XSS via a field label is escaped
   - Steps:
     1. Add a field whose label contains a `<script>` payload → Save Changes
     2. Open the builder and the vendor editor
   - Expected: label stored sanitized and rendered escaped; no script executes
