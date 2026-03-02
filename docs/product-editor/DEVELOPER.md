# Dokan Product Editor — Developer Guide

The Dokan product editor is a React form system built on the WordPress [`@wordpress/dataviews` DataForm](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/) component. A PHP-defined flat schema of sections and fields is rendered via a configurable layout system with custom Edit components.

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [DataForm Basics](#2-dataform-basics)
3. [Field Schema Reference](#3-field-schema-reference)
4. [Adding a New Field](#4-adding-a-new-field)
5. [Adding a New Section](#5-adding-a-new-section)
6. [Dependencies & Conditional Visibility](#6-dependencies--conditional-visibility)
7. [Resolving Field Values (Reading Data)](#7-resolving-field-values-reading-data)
8. [Resolving the Payload (Saving Data)](#8-resolving-the-payload-saving-data)
9. [Custom Edit Components (React)](#9-custom-edit-components-react)
10. [How Dokan-Pro Connects](#10-how-dokan-pro-connects)
11. [Hooks Reference](#11-hooks-reference)
12. [Key Files](#12-key-files)

---

## 1. Architecture

```
                              PHP (Server)
┌─────────────────────────────────────────────────────────┐
│  FormSchema::get_schema($product_id)                    │
│    ├─ Defines flat array of sections + fields           │
│    ├─ apply_filters('dokan_product_editor_schema')      │
│    ├─ apply_filters('dokan_product_editor_schema_response') │
│    └─ Resolves field values from WC_Product             │
│                                                         │
│  Hooks.php → wp_localize_script('dokanFormManager', {   │
│      form_items, product_id, is_new_product,            │
│      view_product_url, vendor_earning                   │
│  })                                                     │
└───────────────────────┬─────────────────────────────────┘
                        │  JSON (window.dokanFormManager)
                        ▼
                    React (Client)
┌─────────────────────────────────────────────────────────┐
│  useInitProductEditor() → Redux store (initForm)        │
│                                                         │
│  useProductEditor()                                     │
│    ├─ product   ← store.getProduct()                    │
│    ├─ formItems ← store.getFormItems()                  │
│    └─ fields    ← formItems → getFieldConfig()          │
│                        ├─ FieldRenderer (label, type,   │
│                        │   elements, isVisible, isValid) │
│                        └─ getFieldConfigFrom() (Edit    │
│                            component per variant)       │
│                                                         │
│  useLayouts(formItems, product)                         │
│    ├─ Defines card/row/regular layout tree              │
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
│   ├── types/index.ts        # TypeScript interfaces
│   ├── field-config/index.ts # Variant → Edit component mapping
│   ├── components/
│   │   ├── FieldRenderer.tsx # Field config builder
│   │   ├── CustomField.tsx   # Wrapper for all Edit components
│   │   ├── PriceEdit.tsx     # Price input + vendor earning
│   │   ├── SelectEdit.tsx    # Select/multi-select with tree
│   │   ├── RichTextEdit.tsx  # Editor & textarea
│   │   ├── ImageEdit.tsx     # Single image upload
│   │   ├── GalleryImages.tsx # Image gallery
│   │   ├── FileUploadEdit.tsx# Downloadable files
│   │   ├── DateTimePickerEdit.tsx
│   │   ├── AsyncSelectEdit.tsx
│   │   └── AttributesEdit.tsx
│   ├── hooks/
│   │   ├── useProductEditor.ts  # Redux state + submit
│   │   ├── useLayouts.tsx       # Layout tree builder
│   │   ├── useVariations.ts     # Variation CRUD
│   │   └── useVariationLayouts.tsx
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
3. `getFieldConfig()` (in `FieldRenderer.tsx`) normalizes options to `elements`, adds `isVisible` / `isValid`, and merges variant-specific config from `getFieldConfigFrom()`
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
| `placeholder` | `string` | Input placeholder text |
| `tooltip` | `string` | Tooltip text (shown as info icon) |
| `description` | `string` | Help text below the field |
| `priority` | `int` | Sort order (default: 30) |
| `visibility` | `bool` | Global visibility toggle |
| `visibilities` | `array` | Per-product-type visibility map (see [section 6](#6-dependencies--conditional-visibility)) |
| `labels` | `array` | Per-product-type label overrides |
| `dependencies` | `array` | Conditional rules for visibility or dynamic options (see [section 6](#6-dependencies--conditional-visibility)) |
| `options_map` | `array` | Keyed map of option sets for dynamic `select` options. Used with a `type: 'options'` dependency (see [section 6](#6-dependencies--conditional-visibility)) |
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
        'priority'    => 30,
        'visibility'  => true,
    ];

    return $fields;
} );
```

The field will be auto-placed in the "General" card layout. If it is not explicitly referenced in the layout tree, `useLayouts()` appends it to the matching section automatically.

### Value resolution

If the field ID matches a WC_Product getter (e.g., `get_my_custom_field()`), the value is resolved automatically. Otherwise, it falls back to product meta. For custom storage, use the `dokan_product_editor_schema_value` filter (see [section 7](#7-resolving-field-values-reading-data)).

### Payload handling

On save, the field value is sent as-is to the WC REST API using its `id` as the key. If the key needs transformation, use the `dokan_product_editor_schema_payload` filter (see [section 8](#8-resolving-the-payload-saving-data)).

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
        'priority'    => 30,
        'visibility'  => true,
    ];

    // 2. Add fields to the section
    $fields[] = [
        'id'          => 'my_section_field_1',
        'section_id'  => 'my_section',       // Links to the section above
        'type'        => 'field',
        'label'       => __( 'Option 1', 'my-plugin' ),
        'variant'     => 'checkbox',
        'priority'    => 30,
        'visibility'  => true,
    ];

    $fields[] = [
        'id'          => 'my_section_field_2',
        'section_id'  => 'my_section',
        'type'        => 'field',
        'label'       => __( 'Option 2', 'my-plugin' ),
        'variant'     => 'number',
        'placeholder' => '0',
        'priority'    => 30,
        'visibility'  => true,
    ];

    return $fields;
} );
```

### Auto-layout

The `useLayouts()` hook automatically handles new sections:

1. `getRemainingFields()` finds fields/sections not explicitly placed in the layout tree
2. If a section ID matches an existing layout node, its fields are appended there
3. Otherwise, `appendToLeftColumn()` creates a new card in the left column with the section label and description as the header

No React code changes are needed. New sections appear automatically.

---

## 6. Dependencies & Conditional Visibility

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

## 7. Resolving Field Values (Reading Data)

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

## 8. Resolving the Payload (Saving Data)

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

## 9. Custom Edit Components (React)

The `field-config/index.ts` maps every field variant to a handler. Handlers for `checkbox`, `radio`, and `number` configure DataForm's built-in field types (`type: 'boolean'`, `Edit: 'radio'`, `type: 'integer'`). Other variants like `select`, `editor`, `image`, etc. provide custom React Edit components. The `text` variant falls through to the default handler, which auto-detects price fields.

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

## 10. How Dokan-Pro Connects

Dokan-pro and its modules extend the product editor without modifying dokan-lite code, using the filter hooks described above.

### Standard pattern

Every module creates a `ProductEditorFields` class that hooks into 3 filters:

```php
class ProductEditorFields {
    public function __construct() {
        // 1. Add fields to the schema
        add_filter( 'dokan_product_editor_schema', [ $this, 'extend_default_fields' ] );
        // 2. Resolve field values when loading
        add_filter( 'dokan_product_editor_schema_value', [ $this, 'resolve_fields_value' ], 10, 3 );
        // 3. Transform payload when saving
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
            'priority'    => 30,
            'visibility'  => true,
        ];

        $fields[] = [
            'id'         => self::ENABLE_WHOLESALE,
            'section_id' => self::SECTION_WHOLESALE,
            'type'       => 'field',
            'label'      => __( 'Enable wholesale', 'dokan' ),
            'variant'    => 'checkbox',
            'priority'   => 30,
            'visibility' => true,
        ];

        $fields[] = [
            'id'           => self::WHOLESALE_PRICE,
            'section_id'   => self::SECTION_WHOLESALE,
            'type'         => 'field',
            'label'        => __( 'Wholesale Price', 'dokan' ),
            'variant'      => 'number',
            'placeholder'  => '0',
            'priority'     => 30,
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

    // --- 2. Resolve values when loading ---
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

    // --- 3. Transform payload when saving ---
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

## 11. Hooks Reference

### PHP Filters

| Hook | Arguments | Description |
|------|-----------|-------------|
| `dokan_product_editor_schema` | `(array $items, int $product_id)` | Add or modify schema fields and sections |
| `dokan_product_editor_schema_response` | `(array $items, int $product_id)` | Modify schema after admin overrides are applied |
| `dokan_product_editor_schema_value` | `(mixed $value, string $field_name, WC_Product $product)` | Resolve a field's value when loading a product |
| `dokan_product_editor_schema_payload` | `(array $payload)` | Transform form data before saving to WC REST API |
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

## 12. Key Files

| File | Description |
|------|-------------|
| `includes/ProductEditor/FormSchema.php` | Schema definition, value resolution, value formatting |
| `includes/ProductEditor/PayloadResolver.php` | Transforms form payload to WC REST API shape |
| `includes/ProductEditor/Elements.php` | Constants for all field and section IDs |
| `includes/ProductEditor/Hooks.php` | Server-side bootstrapping, script enqueue, localization |
| `src/dashboard/product-editor/App.tsx` | Main React entry — renders DataForm |
| `src/dashboard/product-editor/types/index.ts` | TypeScript interfaces (FlatFormItem, FieldConfig, FieldHandler) |
| `src/dashboard/product-editor/field-config/index.ts` | Maps field variants to Edit components |
| `src/dashboard/product-editor/components/FieldRenderer.tsx` | Builds field config for DataForm (label, elements, visibility) |
| `src/dashboard/product-editor/components/CustomField.tsx` | Shared wrapper for all Edit components |
| `src/dashboard/product-editor/hooks/useProductEditor.ts` | Redux store integration (product state, fields, submit) |
| `src/dashboard/product-editor/hooks/useLayouts.tsx` | Builds responsive layout tree from schema |
| `src/dashboard/product-editor/utils.tsx` | Visibility, dependency resolution, layout utilities |
