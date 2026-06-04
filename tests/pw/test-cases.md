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

<!-- ============================================================
     PRODUCT ADD-ONS MODULE — FULL COVERAGE (Dokan Pro 5.0.0+)
     Already covered elsewhere (do NOT duplicate):
       • tests/e2e/product-addons/productFormManagerAddons.spec.ts
         → per-product add-on field types + sub-controls in the new editor
       • tests/e2e/product-addons/productAddons.spec.ts
         → React add-on list smoke tests (renders + search)
     The four blocks below cover the remaining surfaces.
     ============================================================ -->

## Feature: Product Add-ons — Global Add-on Management
- Slug: product-addon-global
- Type: e2e
- Plugin gate: pro
- Roles: vendor, admin
- Storage state: vendor, admin
- REST seed: yes
- Status: build

> Surfaces: the new React add-on list (`dashboard/new/#settings/product-addon`, DataViews:
> Name / Priority / Product Categories / Number of Fields, search, Edit/Delete row actions,
> "Create New Addon") and the legacy create/edit form
> (`dashboard/settings/product-addon/?add=1` and `?edit=<id>`: `#addon-reference`,
> `#addon-priority`, `#addon-objects[]` Select2, the add-on field panel, `#submit`).

### Happy Paths
1. vendor can create a global add-on applied to all products
   - Steps:
     1. Log in as vendor; open `dashboard/settings/product-addon/?add=1`
     2. Fill Name (`#addon-reference`) and Priority (`#addon-priority`)
     3. Leave Product Categories (`#addon-objects`) as "All Products"
     4. Add one Multiple Choice field with a priced option, then Publish (`#submit`)
   - Expected: redirected to the add-on list; the new add-on appears with "All Products" and field count 1
   - Tag extras: @exploratory

2. vendor can create a global add-on restricted to a specific category
   - Steps:
     1. Seed a product category via REST (admin)
     2. Open the add form, fill Name + Priority
     3. In `#addon-objects` Select2, pick the seeded category (deselecting "All Products")
     4. Add a field and Publish
   - Expected: list row shows the category name (not "All Products")

3. vendor can edit a global add-on's name and priority
   - Steps:
     1. Seed a global add-on via REST
     2. Open `?edit=<id>`, change `#addon-reference` and `#addon-priority`, Update
   - Expected: list reflects the new name and priority

4. vendor can search the add-on list by name
   - Steps:
     1. Seed two global add-ons with distinct names via REST
     2. Open the React list, type one name into the search box
   - Expected: only the matching row remains; pagination resets to page 1

5. vendor can delete a global add-on from the list row action
   - Steps:
     1. Seed a global add-on via REST; open the React list
     2. Trigger the row Delete action and confirm
   - Expected: success toast "Product addon deleted successfully"; row disappears; GET list no longer returns it

### Edge Cases
1. vendor sees the empty-state when no global add-ons exist
   - Steps:
     1. Delete all global add-ons via REST
     2. Reload the React list
   - Expected: "No data found" empty-state renders (not a broken table)

2. list renders Priority, Product Categories and Number of Fields columns correctly
   - Steps:
     1. Seed an "all products" add-on (2 fields) and a category-restricted add-on (1 field)
   - Expected: rows show correct priority number, "All Products" vs category name, and field counts 2 / 1

### Negative Cases
1. vendor cannot publish a global add-on without a name
   - Steps:
     1. Open the add form, leave `#addon-reference` empty, add a field, click Publish
   - Expected: form does not submit / stays on the form (required validation); no new list row

2. vendor cannot view or edit another vendor's global add-on
   - Steps:
     1. Seed a global add-on owned by vendor2 via REST
     2. As vendor1, open `?edit=<vendor2_addon_id>`
   - Expected: the form is not populated with vendor2's data (access denied / empty form)

---

## Feature: Vendor Product Add-ons REST API
- Slug: product-addon-api
- Type: api
- Plugin gate: pro
- Roles: vendor, admin
- Storage state: vendor, admin
- REST seed: yes
- Status: build

> Routes (namespace `dokan/v1`, base `vendor/product-addons`):
> GET `/`, GET `/{id}`, PUT `/{id}`, DELETE `/{id}`, POST `/serialize`, POST `/unserialize`.
> Permission: current vendor must own the add-on (or be its staff). Global add-ons are the
> `global_product_addon` post type, created via `wc-product-add-ons/v1/product-add-ons`.

### Happy Paths
1. vendor can list their global product add-ons
   - Steps:
     1. Seed ≥1 global add-on for the vendor via REST
     2. GET `dokan/v1/vendor/product-addons` with vendor auth
   - Expected: 200; array includes the seeded add-on with `id`, `name`, `priority`, `categories`, `field_count`

2. vendor can fetch a single add-on by id
   - Steps:
     1. GET `dokan/v1/vendor/product-addons/{id}` with vendor auth
   - Expected: 200; body `id` matches and includes `fields`

3. vendor can update an add-on (name, priority, categories, fields)
   - Steps:
     1. PUT `dokan/v1/vendor/product-addons/{id}` with changed `name`, `priority`, `restrict_to_categories`, `fields`
   - Expected: 200; response reflects the changes; re-GET confirms persistence

4. vendor can delete an add-on
   - Steps:
     1. DELETE `dokan/v1/vendor/product-addons/{id}`
   - Expected: 200/204; subsequent GET of that id returns 404

5. vendor can serialize (export) add-ons
   - Steps:
     1. POST `dokan/v1/vendor/product-addons/serialize` with an `addons` array
   - Expected: 200; body contains a serialized string that round-trips via unserialize

6. vendor can unserialize (import) add-ons
   - Steps:
     1. POST `dokan/v1/vendor/product-addons/unserialize` with the serialized string from the export
   - Expected: 200; body returns the decoded `addons` array matching the input

### Negative Cases
1. unauthenticated request is rejected
   - Steps:
     1. GET `dokan/v1/vendor/product-addons` with no auth
   - Expected: 401

2. vendor cannot read/update/delete another vendor's add-on
   - Steps:
     1. Seed an add-on owned by vendor2
     2. As vendor1, GET / PUT / DELETE that add-on id
   - Expected: 403 (or 404) — access denied; vendor2's add-on unchanged

3. unserialize rejects malformed data
   - Steps:
     1. POST `/unserialize` with a non-serialized / corrupt string
   - Expected: error response or empty `addons` (no fatal); nothing is imported

---

## Feature: Product Add-ons — Storefront Cart & Pricing
- Slug: product-addon-storefront
- Type: e2e
- Plugin gate: pro
- Roles: customer, vendor
- Storage state: customer, vendor
- REST seed: yes
- Status: build

> Surfaces: WooCommerce single-product page add-on fields (rendered from `_product_addons` +
> matching global add-ons) and the cart totals. Price types: flat_fee, quantity_based,
> percentage_based, plus customer-defined `custom_price` and `input_multiplier` (Quantity).

### Happy Paths
1. customer sees add-on fields on a vendor product's single page
   - Steps:
     1. Seed a vendor product with a `_product_addons` field via REST
     2. Open the product's single page as a customer
   - Expected: the add-on field (label + option) renders above Add to cart

2. flat-fee add-on adds a fixed amount to the price
   - Steps:
     1. Seed a product with a flat_fee option priced at e.g. 10
     2. Open the product, select the option
   - Expected: displayed price = base + 10; cart line total reflects +10

3. quantity-based add-on scales the add-on cost with quantity
   - Steps:
     1. Seed a quantity_based option; set product quantity to 3 and select the option
   - Expected: add-on cost = optionPrice × 3 added to the line total

4. percentage-based add-on adds a percent of the base price
   - Steps:
     1. Seed a percentage_based option (e.g. 10%) on a product with a known base price
     2. Select the option
   - Expected: add-on cost = base × 10% added to the price

5. customer-defined price add-on adds the entered amount
   - Steps:
     1. Seed a `custom_price` field; enter a valid amount on the product page
   - Expected: the entered amount is added to the price and carried into the cart

6. category-restricted global add-on appears on a matching product
   - Steps:
     1. Seed a category; create a global add-on restricted to it; create a vendor product in that category
     2. Open the product's single page
   - Expected: the global add-on field renders on the product

### Edge Cases
1. input multiplier (Quantity) add-on multiplies its price by the entered quantity
   - Steps:
     1. Seed an `input_multiplier` field priced per unit; enter quantity N on the product page
   - Expected: add-on cost = unitPrice × N

2. product with "Exclude global add-ons" hides global add-ons on its single page
   - Steps:
     1. Seed a global add-on (all products) and a product with `_product_addons_exclude_global = 1`
     2. Open that product
   - Expected: the global add-on field does NOT render on this product

### Negative Cases
1. required add-on field blocks Add to cart when left empty
   - Steps:
     1. Seed a product with a `required` add-on field
     2. Open the product, leave the field empty, click Add to cart
   - Expected: the item is not added; a validation message is shown

2. custom price below the configured minimum is rejected
   - Steps:
     1. Seed a `custom_price` field with `min` set; enter a value below `min`, try Add to cart
   - Expected: validation error; item not added

---

## Feature: Product Add-ons — Import / Export & Exclude Global
- Slug: product-addon-import-export
- Type: e2e
- Plugin gate: pro
- Roles: vendor
- Storage state: vendor
- REST seed: yes
- Status: skip

> ⚠️ DEPENDS ON the Product Form Manager add-ons feature branch. The add-ons card
> (with the Import/Export controls and the "Exclude global add-ons" checkbox) only
> renders in the new product editor when that branch is deployed. This is NOT in the
> current test environment, so this block stays `skip` until it is.
>
> Functional coverage of the same behaviour is already provided elsewhere:
>   • Import/Export round-trip → REST serialize/unserialize in `tests/api/productAddon.spec.ts`.
>   • Exclude-global behaviour → storefront edge case in `product-addon-storefront`
>     (`_product_addons_exclude_global` hides global add-ons on the single page).
> Scaffold the editor-UI version below once the feature branch lands.
>
> Surfaces: the product editor add-ons card import/export controls (Export modal readonly
> serialized textarea; Import modal paste textarea, "The imported fields will be appended.")
> and the "Exclude global add-ons" checkbox persisting to `_product_addons_exclude_global`.

### Happy Paths
1. vendor can export a product's add-on fields to serialized data
   - Steps:
     1. Seed a product with two add-on fields via REST; open it in the new editor
     2. Open the add-ons card, reveal Import/Export, click Export
   - Expected: the export textarea contains a non-empty serialized string representing both fields

2. vendor can import add-on fields into a product by pasting
   - Steps:
     1. Open a product with no add-ons; reveal Import; paste a known serialized add-on string
     2. Click Import, then Save
   - Expected: the imported fields appear in the card and persist to `_product_addons`

3. vendor can enable "Exclude global add-ons" on a product
   - Steps:
     1. Open a product in the editor; check "Exclude global add-ons"; Save
   - Expected: `_product_addons_exclude_global` meta is saved as 1; reopening keeps it checked

### Edge Cases
1. import appends to existing fields rather than replacing them
   - Steps:
     1. Open a product that already has one add-on field; import a serialized field
     2. Save
   - Expected: the product ends with both the original and the imported field

### Negative Cases
1. importing malformed data shows an error and adds no fields
   - Steps:
     1. Open the Import modal; paste a corrupt / non-serialized string; click Import
   - Expected: an inline error is shown; the card gains no new fields
