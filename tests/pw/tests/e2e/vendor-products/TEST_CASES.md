# Vendor Products — Test Cases & Edge Cases

Scope: vendor-side product creation flow on the legacy `/dashboard/products/`
form. The new React product editor (`src/dashboard/product-editor/`) is
exercised by the broader `products/` folder.

This folder is the *new-product happy path* for vendors (simple,
downloadable, virtual), plus required-field validation. Editing existing
products is in `products/`.

Conventions:
- **V1** = `vendor1`
- "Legacy product form" = the WP classic-TinyMCE-backed form at `/dashboard/products/`
- "New product editor" = the React form (covered in `products/`, not here)

---

## 1. Add product happy paths

| #    | Title                                                   | Steps                                                                | Expected                                                         |
|------|---------------------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------------|
| 1.1  | Open Add New Product page (TC1)                         | V1 → `/dashboard/products` → "Add new product"                      | Form renders; title input visible; heading "Add New Product"     |
| 1.2  | Add a simple product (TC2)                              | Fill title + price + descriptions → Publish                          | Success message; product searchable from list                    |
| 1.3  | Add a downloadable product (TC3)                        | Tick Downloadable → add file (URL) → Publish                         | Product saved with download metadata                             |
| 1.4  | Add a virtual product (TC4)                             | Tick Virtual → Publish                                                | Product saved as virtual (no shipping)                           |
| 1.5  | Vendor sees required-field validation on empty save (TC5)| Submit empty form                                                     | Inline error referencing missing fields                          |

## 2. Edit / delete (currently not in this folder)

These live in `products/` since they exercise the React editor in 5.0.0+.

## 3. Edge cases

| #    | Title                                                                       | Notes                                                                              |
|------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| 3.1  | Title with HTML/JS payload                                                  | `<script>alert(1)</script>` — should be escaped on display, stored verbatim        |
| 3.2  | Sale price ≥ regular price                                                   | WC validation should block or warn                                                 |
| 3.3  | Negative price                                                               | WC blocks                                                                          |
| 3.4  | Decimal price with comma vs dot (locale)                                     | Depends on `wc_decimal_separator` option                                           |
| 3.5  | Long title (300 chars)                                                       | Stored truncated or accepted; check DB schema                                      |
| 3.6  | Vendor inactive / pending                                                    | Should not see "Add new product" button                                            |
| 3.7  | Capability removed mid-flow                                                   | Submit should fail server-side with permission error                               |
| 3.8  | TinyMCE not loaded                                                           | Page object writes to underlying textarea directly; this is the workaround for slow editor mount |

## 4. Known issues

- **TinyMCE iframe race:** the page object uses the underlying `<textarea>` rather than the rendered iframe to avoid timing issues — see `fillShortDescription`/`fillLongDescription`.
- **`selectSimpleProductType`:** the legacy form has no type radio. Default is Simple unless Virtual/Downloadable checkboxes are ticked.

## 5. Suggested follow-ups (not in this PR)

1. Variable / Grouped / External product types (PHP modules).
2. Image upload (media library).
3. Stock management edge cases (zero stock, out-of-stock).
4. Product categories / tags assignment.
5. Once the new React editor (`src/dashboard/product-editor/`) is GA, port these tests to it and rename current ones as "Old Test Case N - …".
