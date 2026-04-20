# Dokan Product Editor — Developer Guide

The Dokan product editor is a React form system built on the WordPress [`@wordpress/dataviews` DataForm](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/) component. A PHP-defined flat schema of sections and fields is rendered via a configurable layout system with custom Edit components.

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [DataForm Basics](#2-dataform-basics)
3. [Field Schema Reference](#3-field-schema-reference)
4. [Adding a New Field](#4-adding-a-new-field)
5. [Adding a New Section](#5-adding-a-new-section)
6. [Layout Customization](#6-layout-customization)
7. [Dependencies & Conditional Visibility](#7-dependencies--conditional-visibility)
8. [Resolving Field Values (Reading Data)](#8-resolving-field-values-reading-data)
9. [Resolving the Payload (Saving Data)](#9-resolving-the-payload-saving-data)
10. [Custom Edit Components (React)](#10-custom-edit-components-react)
11. [How Dokan-Pro Connects](#11-how-dokan-pro-connects)
12. [Hooks Reference](#12-hooks-reference)
13. [Key Files](#13-key-files)

---

## 1. Architecture

```
                              PHP (Server)
┌─────────────────────────────────────────────────────────┐
│  FormSchema::get_schema($product_id)                    │
│    ├─ Defines flat array of sections + fields           │
│    ├─ apply_filters('dokan_product_editor_schema')      │
│    ├─ apply_filters('dokan_product_editor_prepared_schema') │
│    └─ Resolves field values from WC_Product             │
│                                                         │
│  FormSchema::get_layout()                               │
│    ├─ Defines flat layout items (parent-child tree)     │
│    ├─ apply_filters('dokan_product_editor_layouts') │
│    └─ Sorts by priority (default 999 when omitted)       │
│                                                         │
│  Hooks.php → wp_add_inline_script('dokan-product-editor',│
│    const dokanProductEditor = { form_items, form_layouts,│
│    product_id, is_new_product, view_product_url,         │
│    vendor_earning })                                     │
└───────────────────────┬─────────────────────────────────┘
                        │  JSON (window.dokanProductEditor)
                        ▼
                    React (Client)
┌─────────────────────────────────────────────────────────┐
│  useInitProductEditor() → Redux store (initForm)        │
│                                                         │
│  useProductEditor()                                     │
│    ├─ product   ← store.getProduct()                    │
│    ├─ formItems ← store.getFormItems()                  │
│    └─ fields    ← formItems → getFieldConfig()          │
│                        ├─ getFieldConfig() (label, type,│
│                        │   elements, isVisible, isValid, │
│                        │   prefix) in field-config/      │
│                        └─ getFieldConfigFrom() (Edit    │
│                            component per variant)       │
│                                                         │
│  useLayouts(formItems, product, formLayout)              │
│    ├─ Builds nested tree from PHP flat layout           │
│    ├─ Auto-injects remaining fields from schema         │
│    └─ Responsive: 2 columns > 768px, 1 column mobile   │
│                                                         │
│  <DataForm data={product} fields={fields}               │
│            form={formLayouts} onChange={onChange}        │
│            validity={validity} />                       │
│                                                         │
│  Submit → saveProduct() → PayloadResolver::resolve()    │
│           → WC REST API (POST /wc/v3/products/:id)     │
└─────────────────────────────────────────────────────────┘
```

### Key directories

```
dokan-lite/
├── includes/ProductEditor/
│   ├── FormSchema.php        # Schema definition + value resolution
│   ├── PayloadResolver.php   # Form data → WC REST API shape
│   ├── Elements.php          # Field ID constants
│   └── Hooks.php             # Server-side bootstrapping
│
├── src/dashboard/product-editor/
│   ├── App.tsx               # Main React entry (DataForm)
│   ├── index.tsx             # Webpack entry, mounts App
│   ├── index.scss            # Editor-specific styles
│   ├── exports.ts            # Public API for external consumers (@dokan/product-editor)
│   ├── types/index.ts        # TypeScript interfaces
│   ├── field-config/
│   │   ├── index.ts          # Variant → Edit component mapping (getFieldConfigFrom)
│   │   ├── getFieldConfig.tsx # Field config builder (label, isValid, isVisible, prefix)
│   │   └── validations/index.ts # Field-specific validators (isEmpty, fieldValidators)
│   ├── components/
│   │   ├── CustomField.tsx   # Wrapper for all Edit components (label, error, required)
│   │   ├── PriceEdit.tsx     # Price input + vendor earning
│   │   ├── SelectEdit.tsx    # Select/multi-select with tree
│   │   ├── AsyncSelectEdit.tsx # Async search select
│   │   ├── RichTextEdit.tsx  # WYSIWYG editor
│   │   ├── TextAreaEdit.tsx  # Plain textarea
│   │   ├── ImageEdit.tsx     # Single image upload
│   │   ├── ImagePreview.tsx  # Image preview helper
│   │   ├── GalleryImages.tsx # Image gallery
│   │   ├── FileUploadEdit.tsx# Downloadable files
│   │   ├── DateTimePickerEdit.tsx
│   │   ├── AttributesEdit.tsx
│   │   └── attributes/       # Attribute sub-components
│   │       └── AttributeCard.tsx
│   ├── hooks/
│   │   ├── useProductEditor.ts  # Redux state + submit
│   │   └── useLayouts.tsx       # Layout tree builder
│   └── utils.tsx             # Visibility, dependency, layout helpers
```

---

## 2. DataForm Basics

The editor uses the WordPress [DataForm](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/) component which takes declarative field configuration and renders forms automatically.

### Core props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `object` | The product data being edited |
| `fields` | `Field[]` | Array of field configurations (id, label, type, Edit, elements, isValid, isVisible) |
| `form` | `object` | Nested layout tree defining how fields are arranged |
| `onChange` | `(updates) => void` | Callback when any field value changes |
| `validity` | `object` | Per-field validation state from `useFormValidity()` |

### How Dokan maps its schema to DataForm

1. PHP `FormSchema::get_schema()` produces a flat array of `{ type: 'section' | 'field', ... }` items
2. `useProductEditor()` filters items where `type === 'field'` and passes each through `getFieldConfig()`
3. `getFieldConfig()` (in `field-config/getFieldConfig.tsx`) normalizes options to `elements`, adds `isVisible` / `isValid` / `prefix`, and merges variant-specific config from `getFieldConfigFrom()`
4. `useLayouts()` builds the nested layout tree and auto-appends sections/fields not explicitly placed

---

## 3. Field Schema Reference

Every item in the schema array must include these **required attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Unique identifier (use `Elements::` constants) |
| `type` | `'section' \| 'field'` | Whether this is a section header or an input field |
| `label` | `string` | Display label |
| `variant` | `string` | *Required for fields only.* Controls the input type |

### Supported variants

| Variant | Renders as | Notes |
|---------|-----------|-------|
| `text` | Text input | Default for price fields (auto-detects `PriceEdit`) |
| `number` | Number input | Uses `type: 'integer'` DataForm field |
| `checkbox` | Checkbox | Uses `type: 'boolean'` DataForm field |
| `radio` | Radio group | Uses `'radio'` DataForm edit type |
| `select` | Dropdown | Uses custom `SelectEdit` with tree support |
| `multiselect` | Multi-select | `SelectEdit` with `multiple: true` |
| `async_select` | Async dropdown | `AsyncSelectEdit` for product search |
| `textarea` | Rich text | Uses `RichTextEdit` (plain text mode) |
| `editor` | Rich text | Uses `RichTextEdit` (WYSIWYG mode) |
| `datetime` | Date picker | `DateTimePickerEdit` |
| `image` | Image upload | `ImageEdit` with media library |
| `gallery` | Image gallery | `GalleryImages` for multiple images. PHP variant key: `gallery` |
| `file` | File table | `FileUploadEdit` for downloadable files |
| `attribute` | Attribute editor | `AttributesEdit` with variation support |

### Optional properties

| Property | Type | Description |
|----------|------|-------------|
| `section_id` | `string \| null` | Parent section ID. `null` for sections themselves |
| `options` | `array \| object` | Choices for select/radio fields. Array of `{label, value}` or key-value object |
| `value` | `mixed` | Initial/resolved value |
| `default` | `mixed` | Default value for new products |
| `required` | `bool` | Whether the field is required |
| `requireds` | `array` | Per-product-type required overrides (e.g. `['simple' => true, 'variable' => false]`) |
| `prefix` | `string` | Text prefix shown as a left addon on text inputs (e.g. a base URL for permalink fields). Uses DataForm's built-in `InputControlPrefixWrapper` |
| `placeholder` | `string` | Input placeholder text |
| `tooltip` | `string` | Tooltip text (shown as info icon) |
| `description` | `string` | Help text below the field |
| `priority` | `int` | Sort order for schema fields (default: 999 when omitted) |
| `visibility` | `bool` | Global visibility toggle |
| `visibilities` | `array` | Per-product-type visibility map (see [section 7](#7-dependencies--conditional-visibility)) |
| `labels` | `array` | Per-product-type label overrides |
| `dependencies` | `array` | Conditional rules for visibility or dynamic options (see [section 7](#7-dependencies--conditional-visibility)) |
| `options_map` | `array` | Keyed map of option sets for dynamic `select` options. Used with a `type: 'options'` dependency (see [section 7](#7-dependencies--conditional-visibility)) |
| `product_types` | `string[]` | Restrict field to specific product types |
| `is_custom` | `bool` | Marks field as custom (admin-created) |

---

## 4. Adding a New Field

Hook into `dokan_product_editor_schema` to add fields to existing sections.

```php
add_filter( 'dokan_product_editor_schema', function ( array $fields ): array {
    $fields[] = [
        'id'          => 'my_custom_field',
        'section_id'  => 'general',          // Assign to the "General" section
        'type'        => 'field',
        'label'       => __( 'My Custom Field', 'my-plugin' ),
        'variant'     => 'text',
        'placeholder' => __( 'Enter value...', 'my-plugin' ),
        'required'    => false,
        'visibility'  => true,
    ];

    return $fields;
} );
```

The field will be auto-placed in the "General" card layout. If it is not explicitly referenced in the layout tree, `useLayouts()` appends it to the matching section automatically.

### Value resolution

If the field ID matches a WC_Product getter (e.g., `get_my_custom_field()`), the value is resolved automatically. Otherwise, it falls back to product meta. For custom storage, use the `dokan_product_editor_schema_value` filter (see [section 8](#8-resolving-field-values-reading-data)).

### Payload handling

On save, the field value is sent as-is to the WC REST API using its `id` as the key. If the key needs transformation, use the `dokan_product_editor_schema_payload` filter (see [section 9](#9-resolving-the-payload-saving-data)).

---

## 5. Adding a New Section

Sections are schema items with `type: 'section'` and `section_id: null`.

```php
add_filter( 'dokan_product_editor_schema', function ( array $fields ): array {
    // 1. Add the section
    $fields[] = [
        'id'          => 'my_section',
        'type'        => 'section',
        'label'       => __( 'My Section', 'my-plugin' ),
        'description' => __( 'Configure my custom options', 'my-plugin' ),
        'visibility'  => true,
    ];

    // 2. Add fields to the section
    $fields[] = [
        'id'          => 'my_section_field_1',
        'section_id'  => 'my_section',       // Links to the section above
        'type'        => 'field',
        'label'       => __( 'Option 1', 'my-plugin' ),
        'variant'     => 'checkbox',
        'visibility'  => true,
    ];

    $fields[] = [
        'id'          => 'my_section_field_2',
        'section_id'  => 'my_section',
        'type'        => 'field',
        'label'       => __( 'Option 2', 'my-plugin' ),
        'variant'     => 'number',
        'placeholder' => '0',
        'visibility'  => true,
    ];

    return $fields;
} );
```

### Auto-layout

New sections are automatically placed in the layout without React changes:

1. If you also add a layout item via `dokan_product_editor_layouts` (see [section 6](#6-layout-customization)), the section renders in that position
2. Otherwise, `useLayouts()` auto-creates a card in the primary column using the section label/description as the header
3. Fields with matching `section_id` are auto-injected as children

For full control over positioning and layout type, add both a schema section and a layout item.

---

## 6. Layout Customization

The form layout is defined in PHP via `FormSchema::get_layout()` as a **flat array of layout items** with parent-child relationships. The JS side builds a nested tree from this flat array, enabling PHP-driven layout customization via `apply_filters`.

### Layout item structure

Each layout item has these properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier (use `Elements::` constants for built-in items) |
| `parent_id` | `string\|null` | Yes | ID of the parent layout item. `null` for root |
| `layout` | `array` | No | Layout configuration: `type`, `alignment`, `styles`, `withHeader`, `isCollapsible` |
| `children` | `string[]` | No | Field IDs to render inside this layout item |
| `after` | `string` | No | Insert this item after a specific field ID in the parent's children |
| `label` | `string` | No | Section label (shown when `withHeader` is true) |
| `description` | `string` | No | Section description |
| `priority` | `int` | No | Sort order. Defaults to 999 when omitted. Only needed for filter-added items |
| `responsive` | `array` | No | Responsive breakpoints that override the layout at specific widths |

### Layout types

| Type | Description |
|------|-------------|
| `card` | Card container with optional header and collapsible behavior |
| `row` | Horizontal flex row (e.g., for grouping dimensions or date ranges) |
| `regular` | Simple wrapper, no visual container |

### Built-in layout structure

```
root_layout (row, responsive → regular at ≤768px)
├── primary_column
│   ├── general_section (card)
│   │   ├── [name, slug, type, external_url, button_text, ...]
│   │   ├── digital_options (regular, after: type)
│   │   │   └── [downloadable, virtual]
│   │   └── discount_schedule (row, after: create_schedule_for_discount)
│   │       └── [date_on_sale_from, date_on_sale_to]
│   ├── description_section (card)
│   │   └── [short_description, description]
│   ├── inventory (card, withHeader)
│   │   └── [sku, global_unique_id, manage_stock, ...]
│   ├── shipping_tax (card, withHeader)
│   │   ├── [_disable_shipping, shipping_class, tax_status, ...]
│   │   ├── shipping_dimensions (row, after: _disable_shipping)
│   │   │   └── [weight, length, width, height]
│   │   └── shipping_overwrite (row, after: _overwrite_shipping)
│   │       └── [_additional_price, _additional_qty]
│   └── [Pro sections injected via filter with priority]
└── sidebar_column
    ├── product_publishing (card, isCollapsible: false)
    │   └── [status, catalog_visibility, featured_image_id, ...]
    └── purchase_note_section (card, withHeader, isCollapsible: false)
        └── [purchase_note]
```

### Adding a layout section via filter

Use the `dokan_product_editor_layouts` filter to add new layout sections. Set `priority` to control where the section appears relative to other items in the same parent.

```php
add_filter( 'dokan_product_editor_layouts', function ( array $layout ): array {
    $layout[] = [
        'id'        => 'my_custom_section',
        'parent_id' => \WeDevs\Dokan\ProductEditor\Elements::PRIMARY_COLUMN,
        'priority'  => 75, // After shipping (40), before sidebar items
        'layout'    => [
            'type'       => 'card',
            'withHeader' => true,
        ],
    ];

    return $layout;
} );
```

The `children` for this layout item are auto-populated from schema fields that have `'section_id' => 'my_custom_section'`.

### Customizing children of existing sections

Use the `dokan_product_editor_layout_children` filter to add, remove, or reorder field IDs in any layout item's children array:

```php
add_filter( 'dokan_product_editor_layout_children', function ( array $children, array $item ): array {
    // Add a custom field to the general section
    if ( $item['id'] === \WeDevs\Dokan\ProductEditor\Elements::SECTION_GENERAL ) {
        $children[] = 'my_custom_field';
    }

    return $children;
}, 10, 2 );
```

### Priority and sort order

- **Built-in items** use explicit priority values (10, 20, 40) to define their order.
- **Filter-added items** should set `priority` to control insertion order.
- **Items without `priority`** default to 999 during sorting.
- Items with equal priority preserve their array order.

### Responsive breakpoints

The root layout uses responsive breakpoints to switch from a two-column layout to a single column on smaller screens:

```php
'responsive' => [
    [
        'maxWidth' => 768,
        'layout'   => [
            'type' => 'regular', // Stacks columns vertically
        ],
    ],
],
```

### Using the `after` property

The `after` property lets you insert a nested layout item at a specific position within the parent's children. For example, the digital options group is inserted after the `type` field in the general section:

```php
[
    'id'        => Elements::SECTION_DIGITAL_OPTIONS,
    'parent_id' => Elements::SECTION_GENERAL,
    'after'     => Elements::TYPE,  // Appears right after "Product Type"
    'layout'    => [ 'type' => 'regular' ],
    'children'  => [ Elements::DOWNLOADABLE, Elements::VIRTUAL ],
]
```

### How JS builds the tree

The `buildLayoutTree()` utility in `utils.tsx` converts the flat PHP array into a nested tree:

1. Filters items by `parent_id` to find children of each node
2. Preserves the order from PHP (sorted by priority on the server)
3. For items with `after`, injects the sub-tree at the correct position in the parent's `children` array
4. Auto-appends remaining schema fields not explicitly placed in any layout

### Variation Layout Customization

Variation forms use a separate layout system defined in `WeDevs\DokanPro\Modules\ProductEditor\FormSchema::get_variation_layouts()`. It follows the same flat-array format as the main product layout but is passed to the frontend as `variation_form_layouts` via the `dokan_product_editor_args` filter.

#### Built-in variation layout structure

```
variation_image_sku (row, responsive → regular at ≤768px)
├── image_and_digital_options (row)
│   ├── image_id
│   └── variable_downloadable_options
│       └── [enabled, downloadable, virtual, manage_stock]
└── variation_sku (regular)
    └── [sku]
variation_prices (row)
└── [regular_price, sale_price]
variation_discount_toggle
└── [create_schedule_for_discount]
variation_discount_schedule (row)
└── [date_on_sale_from, date_on_sale_to]
variation_subscription
└── [subscription fields...]
variation_stock_row (row)
└── [stock_quantity, backorders]
variation_standalone_fields
└── [low_stock_amount, shipping_class, tax_class, description]
variation_downloads (card, withHeader)
├── [downloads]
└── variation_downloads_settings (row)
    └── [download_limit, download_expiry]
variation_wholesale_section (with heading)
├── [enable_wholesale]
└── variation_wholesale_fields (row)
    └── [wholesale_price, wholesale_quantity]
variation_min_max_section (with heading)
└── [min_quantity, max_quantity]
```

#### Adding fields to variation layout via filter

Use the `dokan_product_editor_variation_layouts` filter to add new layout items:

```php
add_filter( 'dokan_product_editor_variation_layouts', function ( array $layouts ): array {
    $layouts[] = [
        'id'        => 'my_variation_section',
        'parent_id' => null,
        'priority'  => 85, // After downloads (80), before wholesale (90)
        'layout'    => [
            'type'       => 'card',
            'withHeader' => true,
        ],
        'children'  => [ 'my_variation_field_1', 'my_variation_field_2' ],
    ];

    return $layouts;
} );
```

#### Customizing children of existing variation layout items

Use the `dokan_product_editor_variation_layout_children` filter:

```php
add_filter( 'dokan_product_editor_variation_layout_children', function ( array $children, array $item ): array {
    if ( $item['id'] === 'variation_standalone_fields' ) {
        $children[] = 'my_custom_variation_meta';
    }

    return $children;
}, 10, 2 );
```

#### Custom fields in variations

The variation layout handles remaining custom fields (not explicitly placed) in two ways:

1. **Predefined section custom fields** — Custom fields assigned to built-in sections (e.g., `section_id: 'general'`, `'inventory'`) render flat at the bottom of the form, without a card wrapper.
2. **Custom section custom fields** — Custom fields assigned to user-created sections (where the section itself has `is_custom: true`) render wrapped in a card with the section's label as the header.

---

## 7. Dependencies & Conditional Visibility

### Dependencies (runtime)

Fields can react to other field values using the `dependencies` array. Each condition has an optional `type` that determines its purpose:

| Type           | Default | Description                                      |
|----------------|---------|--------------------------------------------------|
| `'visibility'` | Yes     | Controls whether the field is shown or hidden    |
| `'options'`    | No      | Drives dynamic option swapping via `options_map` |

When `type` is omitted, it defaults to `'visibility'`. Visibility conditions use AND logic — all must be true for the field to appear. The `'options'` type is skipped during visibility evaluation.

#### Visibility dependencies

```php
'dependencies' => [
    [
        'comparison' => '==',
        'key'        => 'manage_stock',   // Another field's ID
        'value'      => true,
    ],
],
```

#### Dynamic options dependencies

Pair `type: 'options'` with `options_map` to swap a select field's options based on another field's value:

```php
$length_options = [
    'day'   => [ [ 'label' => '1 day', 'value' => '1' ], ... ],
    'week'  => [ [ 'label' => '1 week', 'value' => '1' ], ... ],
    'month' => [ [ 'label' => '1 month', 'value' => '1' ], ... ],
    'year'  => [ [ 'label' => '1 year', 'value' => '1' ], ... ],
];

$fields[] = [
    'id'           => '_subscription_length',
    'variant'      => 'select',
    'options'      => $length_options['month'],   // Default options (fallback)
    'options_map'  => $length_options,             // All option sets keyed by dependency value
    'dependencies' => [
        [
            'key'        => '_subscription_period',
            'comparison' => 'not_empty',
            'type'       => 'options',             // Drives options_map lookup, not visibility
        ],
    ],
];
```

When `_subscription_period` changes to `'week'`, `SelectEdit` automatically swaps the options to `$length_options['week']`.

#### Combining both types

A single field can have both visibility and options dependencies:

```php
'dependencies' => [
    [ 'key' => 'product_type', 'comparison' => '==', 'value' => 'subscription' ],   // visibility
    [ 'key' => '_subscription_period', 'comparison' => 'not_empty', 'type' => 'options' ], // dynamic options
],
```

**Supported comparison operators:**

| Operator | Description |
|----------|-------------|
| `==` | Loose equality |
| `===` | Strict equality |
| `!=` | Loose inequality |
| `!==` | Strict inequality |
| `empty` | Value is null, undefined, empty string, or empty array |
| `not_empty` | Value is not empty |
| `contains` | Array value includes the specified value |

**Checkbox values:** Dependency values for checkbox fields use `true`/`false` booleans (e.g., `'value' => true`). Resolved field values may be booleans (from WC getters like `is_downloadable()`) or strings like `'yes'`/`'no'` (from product meta). The frontend `normalizeForCompare()` function normalizes `'on'`/`'off'`, `'yes'`/`'no'`, `1`/`0`, and `'1'`/`'0'` to booleans before comparison, so mixed types work correctly in dependency checks.

### Per-product-type visibility

Use `visibilities` to show/hide fields based on the current product type:

```php
'visibilities' => [
    'simple'    => true,
    'variable'  => false,   // Hidden for variable products
    'variation' => true,
],
```

### Per-product-type labels

Use `labels` to change a field's label based on product type:

```php
'labels' => [
    'simple'   => __( 'Price', 'my-plugin' ),
    'external' => __( 'Regular Price', 'my-plugin' ),
],
```

---

## 8. Resolving Field Values (Reading Data)

When editing an existing product, `FormSchema::resolve_field_value()` populates each field with the product's current data.

### Resolution chain

1. **Built-in switch cases** — Core fields like `name`, `status`, `downloads` are resolved directly via WC_Product methods
2. **`dokan_product_editor_schema_value` filter** — Plugins can intercept and return a value. Return non-null to short-circuit
3. **WC_Product getter** — Tries `$product->get_{field_id}()` automatically
4. **Product meta fallback** — Tries `$product->get_meta( $field_id, true )`

### Hooking in

```php
add_filter( 'dokan_product_editor_schema_value', function ( $value, $field_name, $product ) {
    if ( ! $product instanceof WC_Product ) {
        return $value;
    }

    switch ( $field_name ) {
        case 'my_custom_field':
            return $product->get_meta( '_my_custom_meta_key', true ) ?: '';
        default:
            return $value;  // Return unchanged for other fields
    }
}, 10, 3 );
```

### Value formatting

After resolution, `format_field_value()` transforms values based on variant:

| Variant | Format |
|---------|--------|
| `image` | `{ id: int, url: string }` |
| `gallery` | `[ { id: int, url: string }, ... ]` |
| `file` | `[ { id: string, file: string, name: string }, ... ]` |
| `number` | `float` |
| Default | Raw value |

---

## 9. Resolving the Payload (Saving Data)

When the form is submitted, `PayloadResolver::resolve()` transforms form data (keyed by field IDs) into the WC REST API shape before sending to `POST /wc/v3/products/:id`.

### Built-in resolvers

| Resolver | What it does |
|----------|-------------|
| `resolve_integer_fields()` | Casts `stock_quantity`, `low_stock_amount`, `download_limit`, `download_expiry` to integers |
| `resolve_taxonomies()` | Maps `category_ids`, `product_tag`, `product_brand` → `[{ id: int }, ...]` |
| `resolve_images()` | Maps `image_id` + `gallery_image_ids` → `images: [{ id }, ...]` |
| `resolve_dimensions()` | Groups `length`, `width`, `height` → `dimensions: { ... }` |
| `resolve_linked_products()` | Normalizes `upsell_ids`, `cross_sell_ids` to int arrays |
| `resolve_attributes()` | Transforms attributes to WC REST format with string options |

### Hooking in

```php
add_filter( 'dokan_product_editor_schema_payload', function ( array $payload ): array {
    // Transform custom fields into the format your storage expects
    if ( isset( $payload['my_custom_field'] ) ) {
        $payload['meta_data'][] = [
            'key'   => '_my_custom_meta_key',
            'value' => sanitize_text_field( $payload['my_custom_field'] ),
        ];
        unset( $payload['my_custom_field'] );
    }

    return $payload;
} );
```

### Variation payload

For variations, two hooks are available:

- **`dokan_product_editor_variation_payload`** — Filter to transform variation payload data
- **`dokan_rest_insert_product_variation_object`** — Action fired after a variation is saved, receiving the `WC_Product_Variation` and `WP_REST_Request`

```php
add_action( 'dokan_rest_insert_product_variation_object', function ( $variation, $request ) {
    $data = $request->get_params();
    if ( isset( $data['my_variation_field'] ) ) {
        $variation->update_meta_data( '_my_meta', $data['my_variation_field'] );
        $variation->save();
    }
}, 12, 2 );
```

---

## 10. Custom Edit Components (React)

The `field-config/index.ts` maps every field variant to a handler via `getFieldConfigFrom()`. Handlers for `checkbox`, `radio`, and `number` configure DataForm's built-in field types (`type: 'boolean'`, `Edit: 'radio'`, `type: 'integer'`). Other variants like `select`, `editor`, `image`, etc. provide custom React Edit components. The `text` variant falls through to the default handler, which auto-detects price fields. Additionally, `getFieldConfig()` in `field-config/getFieldConfig.tsx` applies generic behaviors: if a field has a `prefix` string, it automatically uses DataForm's built-in `{ control: 'text', prefix }` — no custom Edit component needed.

### Adding a custom variant (JS filter)

Use the `dokan_product_editor_ui_variant` WordPress JS filter to register custom Edit components:

```js
import { addFilter } from '@wordpress/hooks';
import MyCustomEdit from './MyCustomEdit';

addFilter(
    'dokan_product_editor_ui_variant',
    'my-plugin/custom-variant',
    ( handlers ) => {
        handlers.my_variant = () => ( { Edit: MyCustomEdit } );
        return handlers;
    }
);
```

Then in PHP, use `'variant' => 'my_variant'` on your field definition.

### Edit component props

Every Edit component receives:

```typescript
interface EditProps {
    data: Record<string, any>;     // Current form data (all fields)
    field: FieldConfig;            // This field's configuration
    onChange: (updates) => void;   // Call with { [field.id]: newValue }
    validity?: object;             // Per-field validation state
}
```

### Writing an Edit component

```tsx
import { CustomField, getValidationError } from './CustomField';

const MyCustomEdit = ( { data, field, onChange, validity } ) => {
    const value = data[ field.id ] || '';
    const error = getValidationError( validity );

    return (
        <CustomField field={ field } error={ error }>
            <input
                type="text"
                value={ value }
                onChange={ ( e ) => onChange( { [ field.id ]: e.target.value } ) }
            />
        </CustomField>
    );
};
```

The `CustomField` wrapper provides consistent label rendering, description, and error display.

---

## 11. How Dokan-Pro Connects

Dokan-pro and its modules extend the product editor without modifying dokan-lite code, using the filter hooks described above.

### Standard pattern

Every module creates a `ProductEditorFields` class that hooks into schema, layout, value resolution, and payload filters:

```php
class ProductEditorFields {
    public function __construct() {
        // 1. Add fields to the schema
        add_filter( 'dokan_product_editor_schema', [ $this, 'extend_default_fields' ] );
        // 2. Add layout section for the new fields
        add_filter( 'dokan_product_editor_layouts', [ $this, 'extend_layout' ] );
        // 3. Resolve field values when loading
        add_filter( 'dokan_product_editor_schema_value', [ $this, 'resolve_fields_value' ], 10, 3 );
        // 4. Transform payload when saving
        add_filter( 'dokan_product_editor_schema_payload', [ $this, 'resolve_fields_payload' ] );
    }
}
```

### Complete example (Wholesale module)

```php
class ProductEditorFields {
    const SECTION_WHOLESALE  = 'wholesale_section';
    const ENABLE_WHOLESALE   = 'enable_wholesale';
    const WHOLESALE_PRICE    = 'wholesale_price';
    const WHOLESALE_QUANTITY = 'wholesale_quantity';
    const WHOLESALE_META_KEY = '_dokan_wholesale_meta';

    public function __construct() {
        add_filter( 'dokan_product_editor_schema', [ $this, 'extend_default_fields' ] );
        add_filter( 'dokan_product_editor_layouts', [ $this, 'extend_layout' ] );
        add_filter( 'dokan_product_editor_schema_value', [ $this, 'resolve_fields_value' ], 10, 3 );
        add_filter( 'dokan_product_editor_schema_payload', [ $this, 'resolve_fields_payload' ] );
    }

    // --- 1. Add section and fields ---
    public function extend_default_fields( array $fields ): array {
        $fields[] = [
            'id'          => self::SECTION_WHOLESALE,
            'type'        => 'section',
            'label'       => __( 'Wholesale Options', 'dokan' ),
            'description' => __( 'Set your wholesale options', 'dokan' ),
            'visibility'  => true,
        ];

        $fields[] = [
            'id'         => self::ENABLE_WHOLESALE,
            'section_id' => self::SECTION_WHOLESALE,
            'type'       => 'field',
            'label'      => __( 'Enable wholesale', 'dokan' ),
            'variant'    => 'checkbox',
            'visibility' => true,
        ];

        $fields[] = [
            'id'           => self::WHOLESALE_PRICE,
            'section_id'   => self::SECTION_WHOLESALE,
            'type'         => 'field',
            'label'        => __( 'Wholesale Price', 'dokan' ),
            'variant'      => 'number',
            'placeholder'  => '0',
            'visibility'   => true,
            'dependencies' => [
                [
                    'comparison' => '==',
                    'key'        => self::ENABLE_WHOLESALE,
                    'value'      => true,
                ],
            ],
        ];

        return $fields;
    }

    // --- 2. Add layout section ---
    public function extend_layout( array $layout ): array {
        $layout[] = [
            'id'        => self::SECTION_WHOLESALE,
            'parent_id' => \WeDevs\Dokan\ProductEditor\Elements::PRIMARY_COLUMN,
            'priority'  => 80,
            'layout'    => [
                'type'       => 'card',
                'withHeader' => true,
            ],
        ];

        return $layout;
    }

    // --- 3. Resolve values when loading ---
    public function resolve_fields_value( $value, $field_name, $product ) {
        if ( ! $product instanceof WC_Product ) {
            return $value;
        }

        $wholesale = $product->get_meta( self::WHOLESALE_META_KEY, true ) ?: [];

        switch ( $field_name ) {
            case self::ENABLE_WHOLESALE:
                return $wholesale['enable_wholesale'] ?? 'no';
            case self::WHOLESALE_PRICE:
                return (float) ( $wholesale['price'] ?? 0 );
            default:
                return $value;
        }
    }

    // --- 4. Transform payload when saving ---
    public function resolve_fields_payload( array $payload ): array {
        if ( isset( $payload[ self::ENABLE_WHOLESALE ] ) ) {
            $payload['wholesale'] = [
                'enable_wholesale' => wc_string_to_bool( $payload[ self::ENABLE_WHOLESALE ] ) ? 'yes' : 'no',
                'price'            => wc_format_decimal( $payload[ self::WHOLESALE_PRICE ] ?? 0 ),
                'quantity'         => wc_format_decimal( $payload[ self::WHOLESALE_QUANTITY ] ?? 0 ),
            ];
        }
        return $payload;
    }
}
```

### Modules that extend the product editor

| Module | Section | Key Fields |
|--------|---------|------------|
| ProductFields (core pro) | Shipping, Attributes, Linked | Tax, shipping class, attributes, upsells, cross-sells |
| VendorDiscount | Discount Options | Enable discount, discount %, min quantity |
| OrderMinMax | Min/Max Options | Min/max quantity |
| Wholesale | Wholesale Options | Enable wholesale, price, quantity |
| RMA | RMA Options | Label, type, policy, reasons |
| Vendor Subscription Product | *(General section)* | Subscription price, period, interval, trial |

---

## 12. Hooks Reference

### PHP Filters

| Hook | Arguments | Description |
|------|-----------|-------------|
| `dokan_product_editor_schema` | `(array $items, int $product_id)` | Add or modify schema fields and sections |
| `dokan_product_editor_prepared_schema` | `(array $items, int $product_id)` | Modify schema after admin overrides are applied |
| `dokan_product_editor_schema_value` | `(mixed $value, string $field_name, WC_Product $product)` | Resolve a field's value when loading a product |
| `dokan_product_editor_schema_payload` | `(array $payload)` | Transform form data before saving to WC REST API |
| `dokan_product_editor_layouts` | `(array $layout)` | Add or modify layout items (flat array with parent-child) |
| `dokan_product_editor_layout_children` | `(string[] $children, array $item)` | Modify the children (field IDs) of a specific layout item |
| `dokan_product_editor_variation_layouts` | `(array $layouts)` | Add or modify variation layout items (flat array with parent-child) |
| `dokan_product_editor_variation_layout_children` | `(string[] $children, array $item)` | Modify the children (field IDs) of a specific variation layout item |
| `dokan_product_editor_variation_payload` | `(array $payload, array $data)` | Transform variation payload before saving |
| `dokan_product_editor_price_visibilities` | `(array $visibilities)` | Per-type visibility for price fields |
| `dokan_product_editor_digital_option_visibilities` | `(array $visibilities)` | Per-type visibility for digital option fields |

### PHP Actions

| Hook | Arguments | Description |
|------|-----------|-------------|
| `dokan_rest_insert_product_variation_object` | `(WC_Product_Variation $variation, WP_REST_Request $request)` | Fired after a variation is saved |

### JavaScript Filters (via `@wordpress/hooks`)

| Hook                                    | Arguments                                                          | Description                                                         |
|-----------------------------------------|--------------------------------------------------------------------|---------------------------------------------------------------------|
| `dokan_product_editor_ui_variant`       | `(Record<string, FieldHandler> handlers, FormField field)`         | Register custom Edit components for field variants                  |
| `dokan_product_editor_after_ui_field`   | `(null, FormField field)`                                          | Inject content after a field's Edit component                       |
| `dokan_product_editor_select_options`   | `(Option[] elements, FieldConfig field, Record<string, any> data)` | Dynamically filter select field options based on current form data  |

#### Using `dokan_product_editor_select_options`

The filter is synchronous (`applyFilters`), so async operations like REST API calls cannot run inside it directly. Instead, pre-fetch data and let the filter inject it. Two common patterns:

##### Pattern 1 — Server-localized data (PHP → JS)

Use `wp_localize_script` to pass options from PHP, then consume them in the JS filter:

```php
// PHP: localize data when enqueuing scripts
add_action( 'wp_enqueue_scripts', function () {
    wp_localize_script( 'my-plugin-editor', 'myPluginData', [
        'warehouse_options' => [
            'us' => [
                [ 'label' => 'New York', 'value' => 'ny' ],
                [ 'label' => 'Los Angeles', 'value' => 'la' ],
            ],
            'eu' => [
                [ 'label' => 'Berlin', 'value' => 'ber' ],
                [ 'label' => 'Paris', 'value' => 'par' ],
            ],
        ],
    ] );
} );
```

```js
// JS: use the localized data in the filter
import { addFilter } from '@wordpress/hooks';

addFilter(
    'dokan_product_editor_select_options',
    'my-plugin/warehouse-options',
    ( elements, field, data ) => {
        if ( field.id !== 'warehouse_location' ) {
            return elements;
        }

        // make rest API call or compute options based on form data

        const region = data.shipping_region;
        const regionOptions = window.myPluginData?.warehouse_options?.[ region ];

        return regionOptions || elements;
    }
);
```

> **Note:** The original `elements` (from `options` or `options_map`) are always passed as the first argument. Return them as-is for fields you don't need to modify.

---

## 13. Key Files

| File | Description |
|------|-------------|
| `includes/ProductEditor/FormSchema.php` | Schema definition, layout definition, value resolution |
| `includes/ProductEditor/PayloadResolver.php` | Transforms form payload to WC REST API shape |
| `includes/ProductEditor/Elements.php` | Constants for all field, section, and layout IDs |
| `includes/ProductEditor/Hooks.php` | Server-side bootstrapping, script enqueue, `wp_add_inline_script` localization |
| `src/dashboard/product-editor/App.tsx` | Main React entry — renders DataForm |
| `src/dashboard/product-editor/exports.ts` | Public API for external consumers (`@dokan/product-editor`) |
| `src/dashboard/product-editor/types/index.ts` | TypeScript interfaces (FormItem, FieldConfig, FieldHandler, LayoutItem) |
| `src/dashboard/product-editor/field-config/index.ts` | Maps field variants to Edit components (`getFieldConfigFrom`) |
| `src/dashboard/product-editor/field-config/getFieldConfig.tsx` | Builds field config for DataForm (label, elements, isVisible, isValid, prefix) |
| `src/dashboard/product-editor/field-config/validations/index.ts` | Field-specific validators (`isEmpty`, `fieldValidators`) |
| `src/dashboard/product-editor/components/CustomField.tsx` | Shared wrapper for all Edit components (label, required badge, error) |
| `src/dashboard/product-editor/hooks/useProductEditor.ts` | Redux store integration (product state, fields, submit) |
| `src/dashboard/product-editor/hooks/useLayouts.tsx` | Builds nested layout tree from PHP flat layout |
| `src/dashboard/product-editor/utils.tsx` | Visibility, dependency resolution, `buildLayoutTree()` |
