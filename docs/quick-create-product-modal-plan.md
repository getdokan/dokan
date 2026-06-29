# Build Plan — Schema-Driven Quick-Create Product Modal

Lightweight React "Add New Product" modal on the vendor product-listing page.
Reuses the existing Product Editor **FormSchema** as the single source of truth,
renders only an essential field subset, and creates a draft product through the
shared product-editor store.

## Goal

A small popup/modal on the vendor product listing that:

- Fetches the product-editor schema (`GET dokan/v3/products/init/fields`).
- Renders **only** a 5-field subset (no full editor, no multi-column layout).
- Creates a **simple, draft** product via the shared store + V3 REST endpoint.
- Redirects to the full React editor so the vendor can finish.

## Decisions (locked)

| # | Decision | Value |
|---|----------|-------|
| 1 | Render target | Lightweight React form (not full editor) |
| 2 | Placement | Popup/modal on the product-listing page |
| 3 | Fields | `name` (req), `image_id` (featured), `regular_price`, `category_ids`, `short_description` |
| 4 | Hidden defaults | `type=simple`, `status=draft` |
| 5 | Post-create | Redirect to full editor `<productsBase><id>/edit` |
| 6 | Legacy popup | Replaced by React modal when the feature is active (gated) |
| 7 | State | Reuse `productEditor` store (`initForm` / `updateProduct` / `saveProduct`) |

## What is reused (no rebuild)

| Piece | Source | Reuse |
|-------|--------|-------|
| Schema (fields) | `GET dokan/v3/products/init/fields` → `form_items` | Fetch, filter to subset |
| Field → component map | `src/dashboard/product-editor/field-config/` (`getFieldConfig`) | Render fields |
| Form renderer | `DataForm` + `useFormValidity` from `@dokan/product-editor` | Render + validate |
| Store | `src/stores/productEditor/` (`initForm`, `updateProduct`, `saveProduct`) | State + save |
| Payload transform | `includes/ProductEditor/PayloadResolver.php` (server, `rest_pre_dispatch`) | Schema-keys → WC REST shape. **Zero FE transform** |
| Modal shell | `DokanModal` (`@src/components`) | Wrap the form |

The custom flat layout `form = { fields: SUBSET }` keeps the modal light —
`DataForm` only renders fields listed there, so the full schema stays hidden
while validation/dependencies still work.

## Blocker (must fix first)

`store.saveProduct(0)` at `src/stores/productEditor/actions.ts:206` **discards the
apiFetch response**, so the new product `id` is unavailable for the redirect.

**Fix:** capture and return the response:

```ts
const created = await apiFetch( {
    path: `dokan/v3/products/${ productId ? productId : '' }`,
    method: productId ? 'PUT' : 'POST',
    data: product,
} );
// ...existing variation handling...
return created;
```

The full editor ignores this return value today, so the change is non-breaking.

## Data flow

```
Button .dokan-quick-create-trigger
  → React modal opens
  → GET dokan/v3/products/init/fields (id empty)     [FormSchema::get_schema(0)]
  → filter form_items to 5 fields → getFieldConfig → DataForm
  → vendor fills → updateProduct(0, data)            [store]
  → Create: updateProduct(0,{type:simple,status:draft})
            saveProduct(0) → POST dokan/v3/products
              → rest_pre_dispatch → PayloadResolver::resolve   [schema keys → WC REST]
              → create_item → do_action dokan_new_product_added
              → returns product { id }
  → redirect <productsBase><id>/edit                 [full editor]
```

## File-by-file changes

### NEW — `src/dashboard/product-editor/QuickCreateModal.tsx` ✅ (created)

The modal component. Props: `isOpen`, `onClose`, `editBase`. Fetches schema,
seeds store via `useInitProductEditor(0, ...)`, reads via `useProductEditor(0, true)`,
renders subset via `DataForm`, saves via store `saveProduct(0)`, redirects to editor.

### NEW — `src/dashboard/product-editor/quick-create.tsx` (entry / mount)

- Find root `#dokan-quick-create-root` on the listing page; `createRoot` render.
- Manage `isOpen` state; bind click on `.dokan-quick-create-trigger` to open.
- Pass `editBase` from a localized global (see Assets).

### EDIT — `src/stores/productEditor/actions.ts:206`

Return the created/updated product from `saveProduct` (blocker fix above).

### EDIT — `webpack-entries.js` (after `product-editor-utils`, ~line 96)

```js
'product-quick-create': './src/dashboard/product-editor/quick-create.tsx',
```

### EDIT — `includes/Assets.php`

- Register `dokan-product-quick-create` from `assets/js/product-quick-create.js`
  (asset.php deps + `dokan-stores-product-editor`, `dokan-product-editor-utils`).
- Enqueue on the products listing page — extend the block near `:899`
  (`dokan_is_seller_dashboard() && isset( $wp->query_vars['products'] )`),
  only when the feature + popup mode is active.
- Localize `dokanQuickCreate = { editBase: dokan_get_navigation_url( 'products', true ) }`.
- Ensure `wp.media` (cover image) and the category-search nonce are present on the page.

### EDIT — `includes/Dashboard/Templates/Products.php:595-607`

- `load_add_new_product_modal()` → output `<div id="dokan-quick-create-root"></div>`
  when the feature is active.
- When active, **skip** `load_add_new_product_popup()` (legacy iziModal template)
  to avoid a double popup.

### EDIT — `templates/products/products-listing.php:69`

- When the feature is active, swap the button class `dokan-add-new-product`
  → `dokan-quick-create-trigger` (so legacy JS does not bind). Keep `href` as a
  no-JS fallback.

### OPTIONAL — `includes/Admin/Settings.php` (~667)

- Add a Selling Options toggle to gate the feature, or reuse the existing
  `one_step_product_create` / `disable_product_popup` logic. Use `@since DOKAN_SINCE`.

## Field IDs (schema → component)

| Field ID (`Elements`) | Variant | Component |
|-----------------------|---------|-----------|
| `name` (NAME) | text | default text |
| `image_id` (FEATURED_IMAGE_ID) | image | `ImageEdit` (wp.media) |
| `regular_price` (REGULAR_PRICE) | (id has "price") | `PriceEdit` |
| `category_ids` (CATEGORIES) | async_select | `AsyncSelectEdit` |
| `short_description` (SHORT_DESCRIPTION) | textarea | `TextAreaEdit` |

## Build & test

1. `npm run build` (or `npm run start` for watch).
2. E2E (`tests/pw/`): open modal, fill name + price + category, create →
   draft product exists as the vendor → lands on the full editor. Tag per
   `dokan-qa-automation` conventions.
3. No PHPUnit needed unless the settings toggle is added (reuses the V3 endpoint;
   no new PHP save logic).

## Risks / notes

- `image_id` → `ImageEdit` needs media scripts (`wp.media`) enqueued on the
  listing page — verify.
- `category_ids` → `async_select` needs the category-search nonce/localize that
  the products page already provides (`Assets.php:1296`) — verify.
- Flat `form = { fields: [...] }` must match the `@wordpress/dataviews` `DataForm`
  `form` shape (single-column `regular` layout) — confirm against the full
  editor's usage in `App.tsx:205`.
- Redirect default targets the **new** editor route
  (`LegacySwitcher::get_new_product_editor_url`). Honoring legacy-preferred
  vendors can be a follow-up.
- The subset filter is **frontend-only**; it does not touch the server schema or
  the `dokan_product_editor_schema` filter.

## Phase order

1. Store fix (`actions.ts` return). ← unblocks redirect
2. `QuickCreateModal.tsx` ✅ + `quick-create.tsx` mount/trigger.
3. Webpack entry + Assets register/enqueue + localize.
4. PHP wiring (mount div, button class swap, skip legacy popup, optional toggle).
5. Build + E2E.
