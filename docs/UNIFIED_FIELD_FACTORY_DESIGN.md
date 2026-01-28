# Unified Field Factory Design Document

## Related Documentation

| Document | Description |
|----------|-------------|
| [Implementation Guide](./FIELD_FACTORY_IMPLEMENTATION_GUIDE.md) | How to use (JSON & Class-based) |
| [JSON Schema Reference](./FIELD_FACTORY_JSON_SCHEMA.md) | Complete JSON examples |

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [High-Level Architecture](#3-high-level-architecture)
4. [WordPress DataViews API Alignment](#4-wordpress-dataviews-api-alignment)
5. [Core Interfaces & Abstract Classes](#5-core-interfaces--abstract-classes)
6. [Element Registry & Resolution](#6-element-registry--resolution)
7. [Sample Factory Implementation](#7-sample-factory-implementation)
8. [JSON Parsing & Rendering Demo](#8-json-parsing--rendering-demo)
9. [Implementation Plan](#9-implementation-plan)
10. [Trade-offs & Scalability Analysis](#10-trade-offs--scalability-analysis)

---

## 1. Executive Summary

This document outlines a **Unified Field Factory** system that consolidates multiple independent UI builders into a single, extensible architecture. The factory will:

- Parse JSON configurations as the single source of truth
- Instantiate correct element classes based on `type` and `variant`
- Support deeply nested structures (page → section → table → row → column → field)
- Remain decoupled from specific page contexts
- Be easily extensible for new field types
- **Align with WordPress DataViews Fields API** for consistency

### Key Patterns Used

| Pattern | Purpose |
|---------|---------|
| **Registry Pattern** | Register/resolve element types dynamically |
| **Factory Pattern** | Create element instances from configuration |
| **Composite Pattern** | Handle nested parent-child structures |
| **Strategy Pattern** | Swap rendering/validation strategies |

### Implementation Scope

This implementation includes **19 field types** across 5 categories:

| Category | Fields |
|----------|--------|
| Core | `text`, `select`, `switch`, `number` |
| Selection | `radio`, `radio_box`, `radio_capsule`, `multicheck` |
| Text | `textarea`, `rich_text`, `copy_field` |
| Composite | `combine_input`, `repeater` |
| Media/Info | `file_upload`, `color`, `info`, `notice`, `base_field_label`, `show_hide` |

Plus containers (`page`, `subpage`), layouts (`section`, `subsection`, `fieldgroup`), tables (`table`, `table-row`, `table-column`), and display elements (`paragraph`).

---

## 2. Current State Analysis

### 2.1 JSON Structure Patterns Identified

After analyzing the four JSON datasets, I identified these structural patterns:

#### Pattern A: Form Manager (Flat Sections)

```json
{
    "sections": [
        {
            "id": "general",
            "label": "General",
            "fields": [
                { "id": "name", "field_type": "text", ... }
            ]
        }
    ]
}
```

#### Pattern B: Settings (Deep Hierarchy)

```json
[
    {
        "id": "general",
        "type": "page",
        "children": [
            {
                "type": "subpage",
                "children": [
                    {
                        "type": "section",
                        "children": [
                            { "type": "field", "variant": "text", ... }
                        ]
                    }
                ]
            }
        ]
    }
]
```

#### Pattern C: Setup Wizard (Sections with Subsections)

```json
[
    {
        "id": "basic",
        "type": "section",
        "children": [
            { "type": "field", "variant": "radio_box", ... },
            {
                "type": "subsection",
                "children": [
                    { "type": "field", "variant": "switch", ... }
                ]
            }
        ]
    }
]
```

#### Pattern D: Status Page (Tables)

```json
[
    {
        "id": "overridden_features",
        "type": "section",
        "children": [
            {
                "type": "table",
                "headers": ["Template"],
                "children": [
                    {
                        "type": "table-row",
                        "children": [
                            {
                                "type": "table-column",
                                "children": [
                                    { "type": "paragraph", "title": "..." }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
]
```

### 2.2 Element Types

| Category | Types |
|----------|-------|
| **Containers** | page, subpage |
| **Layouts** | section, subsection, fieldgroup |
| **Tables** | table, table-row, table-column |
| **Display** | paragraph |
| **Core Fields** | text, select, switch, number |
| **Selection Fields** | radio, radio_box, radio_capsule, multicheck |
| **Text Fields** | textarea, rich_text, copy_field |
| **Composite Fields** | combine_input, repeater |
| **Media Fields** | file_upload, color |
| **Info Fields** | info, notice, base_field_label, show_hide |

---

## 3. High-Level Architecture

> **JSON Schema Reference:** See [FIELD_FACTORY_JSON_SCHEMA.md](./FIELD_FACTORY_JSON_SCHEMA.md) for complete JSON examples.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           JSON Configuration                                │
│                      (Single Source of Truth)                               │
│      See: docs/FIELD_FACTORY_JSON_SCHEMA.md for complete examples           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Element Factory                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Element Registry                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │  Containers  │  │   Layouts    │  │    Tables    │               │    │
│  │  │  • page      │  │  • section   │  │  • table     │               │    │
│  │  │  • subpage   │  │  • subsection│  │  • table-row │               │    │
│  │  │              │  │  • fieldgroup│  │  • table-col │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  │  ┌──────────────┐  ┌──────────────────────────────────────────┐     │    │
│  │  │   Display    │  │              Fields (19 types)           │     │    │
│  │  │  • paragraph │  │  text, select, switch, number, radio,    │     │    │
│  │  │              │  │  radio_box, radio_capsule, multicheck,   │     │    │
│  │  │              │  │  textarea, rich_text, copy_field,        │     │    │
│  │  │              │  │  combine_input, repeater, file_upload,   │     │    │
│  │  │              │  │  color, info, notice, base_field_label,  │     │    │
│  │  │              │  │  show_hide                               │     │    │
│  │  └──────────────┘  └──────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Output                                            │
│  • PHP Array (for REST API)                                                 │
│  • React/Vue Props (for frontend)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Directory Structure

```text
includes/FieldFactory/
├── Contracts/
│   ├── ElementInterface.php
│   ├── ContainerInterface.php
│   └── FieldInterface.php
├── Abstracts/
│   ├── AbstractElement.php
│   ├── AbstractContainer.php
│   └── AbstractField.php
├── Elements/
│   ├── Containers/
│   │   ├── Page.php
│   │   └── Subpage.php
│   ├── Layouts/
│   │   ├── Section.php
│   │   ├── Subsection.php
│   │   └── FieldGroup.php
│   ├── Tables/
│   │   ├── Table.php
│   │   ├── TableRow.php
│   │   └── TableColumn.php
│   ├── Display/
│   │   └── Paragraph.php
│   └── Fields/
│       ├── TextField.php
│       ├── SelectField.php
│       ├── SwitchField.php
│       ├── NumberField.php
│       ├── RadioField.php
│       ├── RadioBoxField.php
│       ├── RadioCapsuleField.php
│       ├── TextareaField.php
│       ├── MulticheckField.php
│       ├── ShowHideField.php
│       ├── CopyField.php
│       ├── CombineInputField.php
│       ├── RichTextField.php
│       ├── RepeaterField.php
│       ├── FileUploadField.php
│       ├── ColorPickerField.php
│       ├── InfoField.php
│       ├── NoticeField.php
│       └── BaseLabelField.php
├── Registry/
│   └── ElementRegistry.php
├── Factory/
│   └── ElementFactory.php
├── FieldFactory.php              # Static facade
└── Examples/
    └── cli-test.php              # CLI test runner
```

---

## 4. WordPress DataViews API Alignment

The Field Factory is aligned with the [WordPress DataViews Fields API](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/#fields-api).

### 4.1 Field Types

DataViews field types supported:

| Type | Description |
|------|-------------|
| `text` | Basic text input |
| `integer` | Whole number input |
| `number` | Decimal number input |
| `boolean` | True/false toggle |

### 4.2 Edit Controls (Variants)

| Variant | Description |
|---------|-------------|
| `text` | Text input |
| `select` | Dropdown select |
| `toggle` / `switch` | Toggle switch |
| `number` | Number input |

### 4.3 Key API Properties

| DataViews Property | PHP Implementation |
|-------------------|-------------------|
| `id` | `get_id()` |
| `type` | `get_field_type()` |
| `label` | `get_label()` |
| `getValue` | `get_value($item)` |
| `setValue` | `set_value($value)` |
| `getValueFormatted` | `get_value_formatted($item)` |
| `elements` | `get_elements()` |
| `placeholder` | `get_placeholder()` |
| `readOnly` | `is_read_only()` |
| `isValid` | `validate($item)` |
| `isVisible` | `is_visible($item)` |
| `enableSorting` | `is_sorting_enabled()` |
| `enableHiding` | `is_hiding_enabled()` |
| `enableGlobalSearch` | `is_global_search_enabled()` |
| `filterBy` | `get_filter_by()` |
| `format` | `get_format()` |
| `sort` | `sort($a, $b, $direction)` |

### 4.4 Filter Operators

| Field Type | Default Operators |
|------------|-------------------|
| `text` | `is`, `isNot`, `contains`, `startsWith` |
| `number` | `is`, `isNot`, `lessThan`, `greaterThan`, `between` |
| `boolean` | `is`, `isNot` |

---

## 5. Core Interfaces & Abstract Classes

### 5.1 Element Interface

```php
<?php
namespace WeDevs\Dokan\FieldFactory\Contracts;

interface ElementInterface {
    public function get_id(): string;
    public function get_type(): string;
    public function get_title(): string;
    public function get_description(): string;
    public function should_display(): bool;
    public function get_category(): string;
    public function get_hook_key(): string;
    public function get_dependencies(): array;
    public function fill( array $config ): self;
    public function to_array(): array;
}
```

### 5.2 Container Interface

```php
<?php
namespace WeDevs\Dokan\FieldFactory\Contracts;

interface ContainerInterface extends ElementInterface {
    public function add_child( ElementInterface $element ): self;
    public function get_children(): array;
    public function has_children(): bool;
    public function find_child( string $id ): ?ElementInterface;
    public function remove_child( string $id ): bool;
}
```

### 5.3 Field Interface (DataViews Aligned)

```php
<?php
namespace WeDevs\Dokan\FieldFactory\Contracts;

interface FieldInterface extends ElementInterface {
    // Type & Variant
    public function get_field_type(): string;
    public function get_variant(): string;
    public function get_label(): string;

    // Value Management (DataViews: getValue/setValue)
    public function get_value( array $item = [] );
    public function set_value( $value ): array;
    public function get_value_formatted( array $item = [] ): string;
    public function get_default();

    // Options/Elements
    public function get_elements(): array;
    public function get_placeholder(): string;

    // State
    public function is_required(): bool;
    public function is_read_only(): bool;
    public function is_visible( array $item = [] ): bool;

    // Validation
    public function validate( array $item = [] ): array;
    public function get_validation_rules(): array;

    // DataViews Features
    public function is_sorting_enabled(): bool;
    public function is_hiding_enabled(): bool;
    public function is_global_search_enabled(): bool;
    public function get_filter_by();
    public function get_format(): array;
}
```

---

## 6. Element Registry & Resolution

### 6.1 Registry

```php
<?php
namespace WeDevs\Dokan\FieldFactory\Registry;

class ElementRegistry {
    private static ?self $instance = null;
    private array $elements = [];
    private array $aliases = [];

    private function register_defaults(): void {
        $base = 'WeDevs\\Dokan\\FieldFactory\\Elements\\';

        // Containers
        $this->register( 'page', $base . 'Containers\\Page' );
        $this->register( 'subpage', $base . 'Containers\\Subpage' );

        // Layouts
        $this->register( 'section', $base . 'Layouts\\Section' );
        $this->register( 'subsection', $base . 'Layouts\\Subsection' );

        // Core Fields
        $this->register( 'field:text', $base . 'Fields\\TextField' );
        $this->register( 'field:select', $base . 'Fields\\SelectField' );
        $this->register( 'field:switch', $base . 'Fields\\SwitchField' );
        $this->register( 'field:number', $base . 'Fields\\NumberField' );

        // Aliases
        $this->register( 'field:toggle', $base . 'Fields\\SwitchField' );
        $this->register( 'field', $base . 'Fields\\TextField' );

        // Legacy aliases
        $this->add_alias( 'text', 'field:text' );
        $this->add_alias( 'select', 'field:select' );
        $this->add_alias( 'switch', 'field:switch' );
        $this->add_alias( 'number', 'field:number' );
    }

    public function register( string $type_key, string $class_name ): self {
        $this->elements[ $type_key ] = $class_name;
        return $this;
    }

    public function resolve_type_key( string $type, ?string $variant = null ): string {
        if ( $variant !== null && $variant !== '' ) {
            $full_key = "{$type}:{$variant}";
            if ( $this->has( $full_key ) ) {
                return $full_key;
            }
        }
        return $this->has( $type ) ? $type : 'field';
    }
}
```

---

## 7. Sample Factory Implementation

### 7.1 Element Factory

```php
<?php
namespace WeDevs\Dokan\FieldFactory\Factory;

use WeDevs\Dokan\FieldFactory\Registry\ElementRegistry;
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;
use WeDevs\Dokan\FieldFactory\Contracts\ContainerInterface;

class ElementFactory {
    private ElementRegistry $registry;
    private SchemaNormalizer $normalizer;

    public function __construct(
        ?ElementRegistry $registry = null,
        ?SchemaNormalizer $normalizer = null
    ) {
        $this->registry   = $registry ?? ElementRegistry::get_instance();
        $this->normalizer = $normalizer ?? new SchemaNormalizer();
    }

    public function create( array $config ): ElementInterface {
        $config = $this->normalizer->normalize_element( $config );

        $type    = $config['type'] ?? 'field';
        $variant = $config['variant'] ?? $config['field_type'] ?? null;

        $type_key   = $this->registry->resolve_type_key( $type, $variant );
        $class_name = $this->registry->get( $type_key );

        $element = new $class_name();
        $element->fill( $config );

        if ( $element instanceof ContainerInterface ) {
            $this->create_children( $element, $config );
        }

        return $element;
    }

    public function create_from_data( array $data ): array {
        $normalized = $this->normalizer->normalize( $data );
        return array_map( fn( $config ) => $this->create( $config ), $normalized );
    }
}
```

---

## 8. JSON Parsing & Rendering Demo

### 8.1 Basic Usage

```php
<?php
use WeDevs\Dokan\FieldFactory\Factory\ElementFactory;

$factory = new ElementFactory();

// Parse JSON file
$elements = $factory->create_from_data(
    json_decode( file_get_contents( 'admin-settings-data.json' ), true )
);

// Convert to array for REST API
$output = array_map( fn( $el ) => $el->to_array(), $elements );

wp_send_json_success( $output );
```

### 8.2 Working with Fields

```php
<?php
use WeDevs\Dokan\FieldFactory\Factory\ElementFactory;

$factory = new ElementFactory();

// Create a single field
$field = $factory->create([
    'id'       => 'store_name',
    'type'     => 'field',
    'variant'  => 'text',
    'label'    => 'Store Name',
    'required' => true,
    'placeholder' => 'Enter store name',
]);

// Get/Set values (DataViews style)
$item = ['store_name' => 'My Store'];
echo $field->get_value( $item ); // "My Store"
echo $field->get_value_formatted( $item ); // "My Store"

// Validate
$result = $field->validate( $item );
if ( ! $result['valid'] ) {
    print_r( $result['errors'] );
}
```

### 8.3 Extending with Custom Fields

```php
<?php
add_action( 'dokan_field_factory_register_elements', function( $registry ) {
    $registry->register(
        'field:color_picker',
        My_Plugin\Fields\ColorPickerField::class
    );
});
```

---

## 9. Implementation Plan

### Phase 1: Foundation (Complete)

| Task | Status |
|------|--------|
| Directory structure | ✅ |
| Core interfaces (ElementInterface, ContainerInterface, FieldInterface) | ✅ |
| Abstract base classes (AbstractElement, AbstractContainer, AbstractField) | ✅ |
| Element Registry with aliases | ✅ |
| Element Factory with recursive child creation | ✅ |
| Schema Normalizer (multi-format detection) | ✅ |

### Phase 2: Core Elements (Complete)

| Task | Status |
|------|--------|
| **Containers** | |
| Page | ✅ |
| Subpage | ✅ |
| **Layouts** | |
| Section | ✅ |
| Subsection | ✅ |
| FieldGroup | ✅ |
| **Core Fields** | |
| TextField | ✅ |
| SelectField | ✅ |
| SwitchField | ✅ |
| NumberField | ✅ |

### Phase 3: Extended Fields (Complete)

| Task | Status |
|------|--------|
| RadioField | ✅ |
| RadioBoxField | ✅ |
| RadioCapsuleField | ✅ |
| TextareaField | ✅ |
| MulticheckField | ✅ |
| ShowHideField | ✅ |
| CopyField | ✅ |
| CombineInputField | ✅ |
| RichTextField | ✅ |
| RepeaterField | ✅ |
| FileUploadField | ✅ |
| ColorPickerField | ✅ |
| InfoField | ✅ |
| NoticeField | ✅ |
| BaseLabelField | ✅ |

### Phase 4: Tables & Display (Complete)

| Task | Status |
|------|--------|
| Table | ✅ |
| TableRow | ✅ |
| TableColumn | ✅ |
| Paragraph | ✅ |

### Phase 5: Core Features (Complete)

| Task | Status |
|------|--------|
| Validation Engine (min/max/required/minlength/maxlength) | ✅ |
| Value extraction (get_value, set_value) | ✅ |
| Nested value support (dot notation paths) | ✅ |
| Element finding (recursive search) | ✅ |
| to_array() serialization | ✅ |
| FieldFactory static facade | ✅ |
| CLI test runner | ✅ |

### Phase 6: Future Enhancements

| Task | Status |
|------|--------|
| Dependency Resolver (conditional visibility) | Partial |
| Frontend React integration | Pending |
| Unit tests | Pending |
| Migration guide from legacy builders | Pending |

---

## 10. Trade-offs & Scalability Analysis

### 10.1 Why This Design Scales Better

| Aspect | Multiple Isolated Builders | Unified Factory |
|--------|---------------------------|-----------------|
| **Code Duplication** | Each builder has its own logic | Single implementation shared |
| **Consistency** | Different field behaviors | Consistent behavior everywhere |
| **Adding New Fields** | Update multiple builders | Register once, available everywhere |
| **Testing** | Test each builder separately | Test factory once |
| **Third-party Extensions** | Complex integration | Single hook to register |

### 10.2 DataViews API Benefits

- **Consistency with WordPress Core** - Same API patterns as Gutenberg
- **Future-proof** - Aligns with WordPress direction
- **Familiar to developers** - Standard interface
- **Frontend compatibility** - Direct mapping to React components

### 10.3 Extensibility

```php
// Register custom field
add_action( 'dokan_field_factory_register_elements', function( $registry ) {
    $registry->register( 'field:map', My_Map_Field::class );
});

// Modify element after creation
add_filter( 'dokan_field_factory_element_created', function( $element, $config ) {
    if ( $element->get_variant() === 'switch' ) {
        $element->set_property( 'data-analytics', 'track' );
    }
    return $element;
}, 10, 2 );
```

---

## 11. Summary

This Unified Field Factory provides:

1. **Single Source of Truth:** JSON or programmatic configs define all UI structures
2. **DataViews Alignment:** Compatible with WordPress Fields API
3. **Type Safety:** Interfaces enforce consistent behavior
4. **Extensibility:** Registry pattern allows easy additions
5. **Maintainability:** Clear separation of concerns
6. **WordPress Integration:** Hooks for third-party extensions
7. **CLI Testing:** Run tests without WordPress environment

### Current Includes

**Containers (2):** `Page`, `Subpage`

**Layouts (3):** `Section`, `Subsection`, `FieldGroup`

**Tables (3):** `Table`, `TableRow`, `TableColumn`

**Display (1):** `Paragraph`

**Fields (19):**

- Core: `TextField`, `SelectField`, `SwitchField`, `NumberField`
- Selection: `RadioField`, `RadioBoxField`, `RadioCapsuleField`, `MulticheckField`
- Text: `TextareaField`, `RichTextField`, `CopyField`
- Composite: `CombineInputField`, `RepeaterField`
- Media: `FileUploadField`, `ColorPickerField`
- Info: `InfoField`, `NoticeField`, `BaseLabelField`, `ShowHideField`

**Core Features:**

- Validation engine (required, min, max, minlength, maxlength)
- Value extraction with nested path support
- Recursive element finding
- Static facade (`FieldFactory`) for easy access

### Usage

Two approaches are supported:

| Approach | Best For | Example |
|----------|----------|---------|
| **JSON-Based** | Dynamic configs, REST APIs | `FieldFactory::create_from_data($config)` |
| **Class-Based** | Programmatic building | `FieldFactory::text('id', 'Label')` |

```php
use WeDevs\Dokan\FieldFactory\FieldFactory;

// JSON-based
$elements = FieldFactory::create_from_data([
    ['id' => 'section', 'type' => 'section', 'title' => 'Settings', 'children' => [...]]
]);

// Class-based
$field = FieldFactory::text('name', 'Store Name', ['required' => true]);

// Validate
$result = FieldFactory::validate($elements, $data);

// Convert to array for REST/frontend
$schema = FieldFactory::to_array($elements);
```

> **See:** [Implementation Guide](./FIELD_FACTORY_IMPLEMENTATION_GUIDE.md) for complete examples.

Additional field types can be added by extending `AbstractField` and registering via the `dokan_field_factory_register_elements` hook.
