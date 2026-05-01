# Products — Test Cases & Edge Cases

Scope: Admin product creation flow (categories, attributes, simple/variable/external/subscription products) and vendor-side product editing on the new React editor.

Conventions: see `tests/pw/CONVENTIONS.md`.

---

## React UI (Dokan 5.0.0+)

Two React surfaces are in scope here:

1. **Vendor product list** — `src/dashboard/products/ProductList.tsx` mounts
   at `/dashboard/products/`. Smoke covered in `vendor-products/`.
2. **Vendor product editor** — `src/dashboard/product-editor/App.tsx`. New
   React form for vendor-side product create/edit. **Not yet covered** by
   automated tests.

Future React-specific tests (not yet implemented):

| #     | Title                                                              | Notes                                                                         |
|-------|--------------------------------------------------------------------|-------------------------------------------------------------------------------|
| R.1   | React product editor renders all field groups                      | Title, price, descriptions, gallery, attributes, custom fields                |
| R.2   | Vendor adds simple product via React editor                        | Replaces "Old Test Case" once UI is GA                                        |
| R.3   | Vendor adds variable product via React editor                      | Variations CRUD                                                               |
| R.4   | Vendor edits existing product                                       | Form pre-populates from API                                                  |
| R.5   | Field-level validation                                              | Required, min/max price, etc.                                                |
| R.6   | RichText editor (description) renders in React                     | Replaces TinyMCE iframe                                                       |

**Note:** the entire `Product functionality test` describe is currently
`test.describe.skip` pending suite refactor. Re-enable in a follow-up PR.


## Active tests

- admin can add product category
- admin can add product attribute
- admin can add simple product
- admin can add variable product
- admin can add simple subscription product
- admin can add variable subscription product
- admin can add external product
- admin can add vendor subscription
- vendor can view product menu page
- vendor can view add new product page
- vendor can add simple product
- vendor can add variable product
- vendor can add simple subscription product
- vendor can add variable subscription product
- vendor can add external product
- vendor can add group product
- vendor can add downloadable product
- vendor can add virtual product
- vendor can search product
- vendor can filter products by date
- vendor can filter products by category
- vendor can filter products by type
- vendor can filter products by other
- vendor can reset filter
- vendor can import products
- vendor can export products
- vendor can duplicate product
- vendor can permanently delete product
- vendor can view product
- vendor can edit product
- vendor can quick edit product

## Conventions applied

- Self-contained page object (modal helper inlined per CONVENTIONS.md §4).
- `'networkidle'` replaced with `'load'` (ESLint `playwright/no-networkidle`).
- All tests tagged with `@lite` / `@pro` plus role tag.
- Legacy tests retained where they parallel a React rewrite (look for "Old Test Case N - …" names).

## Edge cases & known issues

- Pre-existing CI flakies in this folder: see `tracking details to order` and `shipment to order` — both retry-pass historically. Root cause is shared vendor announcement modal interaction; the inline modal handler covers most cases but not all.
- Run individually with: `npm run test:e2e -- tests/e2e/{folder}` (or `NO_SETUP=true npx playwright test --project=e2e_tests tests/e2e/{folder}`).
