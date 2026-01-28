# Field Factory Implementation Guide

This guide shows how to use the Unified Field Factory with both **JSON-based** and **Class-based (Programmatic)** approaches.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [JSON-Based Approach](#2-json-based-approach)
3. [Class-Based Approach](#3-class-based-approach)
4. [Mixed Approach](#4-mixed-approach)
5. [Working with Elements](#5-working-with-elements)
6. [Validation](#6-validation)
7. [Extending the Factory](#7-extending-the-factory)
8. [Real-World Examples](#8-real-world-examples)

---

## 1. Quick Start

```php
use WeDevs\Dokan\FieldFactory\FieldFactory;

// JSON-based: Pass array configuration
$elements = FieldFactory::create_from_data($json_config);

// Class-based: Use static helper methods
$field = FieldFactory::text('store_name', 'Store Name', ['required' => true]);

// Convert to array (for REST API or frontend)
$output = FieldFactory::to_array($elements);
```

---

## 2. JSON-Based Approach

Best for: **Dynamic forms, stored configurations, REST API driven UIs**

### 2.1 Basic Usage

```php
use WeDevs\Dokan\FieldFactory\FieldFactory;

$config = [
    [
        'id'       => 'general_settings',
        'type'     => 'section',
        'title'    => 'General Settings',
        'children' => [
            [
                'id'          => 'store_name',
                'type'        => 'field',
                'variant'     => 'text',
                'title'       => 'Store Name',
                'placeholder' => 'Enter store name',
                'required'    => true,
            ],
            [
                'id'       => 'enable_selling',
                'type'     => 'field',
                'variant'  => 'switch',
                'title'    => 'Enable Selling',
                'default'  => true,
            ],
        ],
    ],
];

// Create element tree
$elements = FieldFactory::create_from_data($config);

// Convert to array for output
$output = FieldFactory::to_array($elements);
```

### 2.2 Loading from JSON File

```php
$json_file = file_get_contents('/path/to/config.json');
$config    = json_decode($json_file, true);

$elements = FieldFactory::create_from_data($config);
```

### 2.3 Complete Settings Page Example

```php
$settings_config = [
    [
        'id'       => 'selling',
        'type'     => 'page',
        'title'    => 'Selling Options',
        'icon'     => 'dashicons-store',
        'children' => [
            [
                'id'       => 'general',
                'type'     => 'subpage',
                'title'    => 'General',
                'children' => [
                    [
                        'id'       => 'commission_settings',
                        'type'     => 'section',
                        'title'    => 'Commission Settings',
                        'children' => [
                            [
                                'id'       => 'commission_type',
                                'type'     => 'field',
                                'variant'  => 'select',
                                'title'    => 'Commission Type',
                                'default'  => 'percentage',
                                'elements' => [
                                    ['value' => 'percentage', 'label' => 'Percentage'],
                                    ['value' => 'fixed', 'label' => 'Fixed Amount'],
                                    ['value' => 'combined', 'label' => 'Combined'],
                                ],
                            ],
                            [
                                'id'      => 'commission_rate',
                                'type'    => 'field',
                                'variant' => 'number',
                                'title'   => 'Commission Rate',
                                'default' => 10,
                                'min'     => 0,
                                'max'     => 100,
                                'postfix' => '%',
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];

$elements = FieldFactory::create_from_data($settings_config);
```

---

## 3. Class-Based Approach

Best for: **Programmatic form building, step builders, conditional logic**

### 3.1 Using Static Helper Methods

```php
use WeDevs\Dokan\FieldFactory\FieldFactory;

// Text field
$name = FieldFactory::text('store_name', 'Store Name', [
    'required'    => true,
    'placeholder' => 'Enter your store name',
    'maxlength'   => 100,
]);

// Number field
$commission = FieldFactory::number('commission', 'Commission Rate', [
    'default' => 10,
    'min'     => 0,
    'max'     => 100,
    'postfix' => '%',
]);

// Select field
$country = FieldFactory::select('country', 'Country', [
    ['value' => 'US', 'label' => 'United States'],
    ['value' => 'UK', 'label' => 'United Kingdom'],
    ['value' => 'CA', 'label' => 'Canada'],
], [
    'default'     => 'US',
    'searchable'  => true,
]);

// Toggle/Switch field
$enable = FieldFactory::toggle('enable_selling', 'Enable Selling', [
    'default'     => true,
    'description' => 'Allow vendors to sell products',
]);

// Radio field
$type = FieldFactory::radio('selling_type', 'Selling Type', [
    ['value' => 'physical', 'label' => 'Physical Products'],
    ['value' => 'digital', 'label' => 'Digital Products'],
    ['value' => 'both', 'label' => 'Both'],
], [
    'default' => 'both',
]);

// Radio Box field (with icons/descriptions)
$marketplace = FieldFactory::radio_box('marketplace_type', 'Marketplace Type', [
    [
        'value'       => 'single',
        'label'       => 'Single Vendor',
        'description' => 'Only you can sell',
        'icon'        => 'store',
    ],
    [
        'value'       => 'multi',
        'label'       => 'Multi Vendor',
        'description' => 'Multiple vendors can sell',
        'icon'        => 'groups',
    ],
], [
    'default' => 'multi',
]);

// Multicheck field
$payments = FieldFactory::multicheck('payment_methods', 'Payment Methods', [
    ['value' => 'paypal', 'label' => 'PayPal'],
    ['value' => 'stripe', 'label' => 'Stripe'],
    ['value' => 'bank', 'label' => 'Bank Transfer'],
], [
    'default' => ['paypal', 'stripe'],
]);

// Color picker
$color = FieldFactory::color('primary_color', 'Primary Color', [
    'default' => '#1e73be',
]);

// File upload
$logo = FieldFactory::file('store_logo', 'Store Logo', [
    'allowed_types' => ['image/jpeg', 'image/png'],
    'max_size'      => 2097152, // 2MB
]);

// Textarea
$description = FieldFactory::textarea('store_description', 'Description', [
    'rows'        => 5,
    'placeholder' => 'Describe your store...',
]);
```

### 3.2 Building Containers

```php
// Section with children
$section = FieldFactory::section('basic_info', 'Basic Information', [
    [
        'id'       => 'store_name',
        'type'     => 'field',
        'variant'  => 'text',
        'title'    => 'Store Name',
        'required' => true,
    ],
    [
        'id'      => 'store_email',
        'type'    => 'field',
        'variant' => 'text',
        'title'   => 'Email',
    ],
]);

// Page with nested structure
$page = FieldFactory::page('settings', 'Settings', [
    [
        'id'       => 'general',
        'type'     => 'subpage',
        'title'    => 'General',
        'children' => [
            [
                'id'       => 'store_section',
                'type'     => 'section',
                'title'    => 'Store Settings',
                'children' => [
                    ['id' => 'name', 'type' => 'field', 'variant' => 'text', 'title' => 'Name'],
                ],
            ],
        ],
    ],
]);
```

### 3.3 Using the Generic `create()` Method

```php
// Create any element type
$element = FieldFactory::create([
    'id'      => 'custom_field',
    'type'    => 'field',
    'variant' => 'combine_input',
    'title'   => 'Price Range',
    'fields'  => [
        ['id' => 'min_price', 'variant' => 'number', 'placeholder' => 'Min'],
        ['id' => 'max_price', 'variant' => 'number', 'placeholder' => 'Max'],
    ],
]);
```

### 3.4 Available Helper Methods

| Method | Description |
|--------|-------------|
| `FieldFactory::text($id, $label, $options)` | Text input |
| `FieldFactory::textarea($id, $label, $options)` | Multi-line text |
| `FieldFactory::number($id, $label, $options)` | Numeric input |
| `FieldFactory::select($id, $label, $elements, $options)` | Dropdown |
| `FieldFactory::toggle($id, $label, $options)` | Switch/toggle |
| `FieldFactory::radio($id, $label, $elements, $options)` | Radio buttons |
| `FieldFactory::radio_box($id, $label, $elements, $options)` | Radio with description |
| `FieldFactory::multicheck($id, $label, $elements, $options)` | Multiple checkboxes |
| `FieldFactory::color($id, $label, $options)` | Color picker |
| `FieldFactory::file($id, $label, $options)` | File upload |
| `FieldFactory::page($id, $title, $children, $options)` | Page container |
| `FieldFactory::subpage($id, $title, $children, $options)` | Subpage container |
| `FieldFactory::section($id, $title, $children, $options)` | Section container |
| `FieldFactory::field($id, $variant, $options)` | Generic field |
| `FieldFactory::create($config)` | Create from config array |
| `FieldFactory::create_from_data($data)` | Create multiple from array |

---

## 4. Mixed Approach

Combine JSON config with programmatic modifications:

```php
use WeDevs\Dokan\FieldFactory\FieldFactory;

// Start with JSON config
$base_config = [
    [
        'id'       => 'settings',
        'type'     => 'section',
        'title'    => 'Settings',
        'children' => [],
    ],
];

$elements = FieldFactory::create_from_data($base_config);

// Find section and add fields programmatically
$section = FieldFactory::find($elements, 'settings');

if ($section instanceof \WeDevs\Dokan\FieldFactory\Contracts\ContainerInterface) {
    // Add field using create()
    $field = FieldFactory::create([
        'id'       => 'dynamic_field',
        'type'     => 'field',
        'variant'  => 'text',
        'title'    => 'Dynamic Field',
    ]);
    
    $section->add_child($field);
}

// Output
$output = FieldFactory::to_array($elements);
```

---

## 5. Working with Elements

### 5.1 Finding Elements

```php
// Find by ID (recursive search)
$element = FieldFactory::find($elements, 'store_name');

// Get all fields (flattened)
$fields = FieldFactory::get_all_fields($elements);
```

### 5.2 Getting Values

```php
// User submitted data
$submitted_data = [
    'store_name'     => 'My Store',
    'commission'     => 15,
    'enable_selling' => true,
];

// Get all field values
$values = FieldFactory::get_values($elements, $submitted_data);
// Result: ['store_name' => 'My Store', 'commission' => 15, ...]

// Get single field value
$field = FieldFactory::find($elements, 'store_name');
$value = $field->get_value($submitted_data); // 'My Store'
```

### 5.3 Converting to Array

```php
// Convert entire tree to array (for REST API response)
$array_output = FieldFactory::to_array($elements);

// Convert single element
$field_array = $field->to_array();
```

---

## 6. Validation

### 6.1 Basic Validation

```php
$elements = FieldFactory::create_from_data([
    [
        'id'       => 'email',
        'type'     => 'field',
        'variant'  => 'text',
        'title'    => 'Email',
        'required' => true,
    ],
    [
        'id'       => 'age',
        'type'     => 'field',
        'variant'  => 'number',
        'title'    => 'Age',
        'min'      => 18,
        'max'      => 100,
    ],
]);

$data = [
    'email' => '',        // Missing required
    'age'   => 15,        // Below minimum
];

$result = FieldFactory::validate($elements, $data);

// $result = [
//     'valid'  => false,
//     'errors' => [
//         'email' => ['This field is required.'],
//         'age'   => ['Value must be at least 18.'],
//     ],
// ]
```

### 6.2 Validation Rules

| Rule | Property | Example |
|------|----------|---------|
| Required | `required` | `'required' => true` |
| Minimum value | `min` | `'min' => 0` |
| Maximum value | `max` | `'max' => 100` |
| Min length | `minlength` | `'minlength' => 3` |
| Max length | `maxlength` | `'maxlength' => 100` |
| Valid option | `elements` | Auto-validates against provided options |

### 6.3 Stop on First Error

```php
$result = FieldFactory::validate($elements, $data, true); // stop_first = true
```

---

## 7. Extending the Factory

### 7.1 Register Custom Field Type

```php
// Create custom field class
namespace MyPlugin\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

class DateRangeField extends AbstractField {
    protected $variant = 'date_range';
    
    public function validate(array $item = []): array {
        $result = parent::validate($item);
        
        // Custom validation logic
        $value = $this->get_value($item);
        if ($value['start'] > $value['end']) {
            $result['valid'] = false;
            $result['errors'][] = 'Start date must be before end date.';
        }
        
        return $result;
    }
}

// Register via hook
add_action('dokan_field_factory_register_elements', function($registry) {
    $registry->register('field:date_range', \MyPlugin\Fields\DateRangeField::class);
});

// Or register directly
FieldFactory::register('field:date_range', \MyPlugin\Fields\DateRangeField::class);
```

### 7.2 Add Alias for Existing Type

```php
add_action('dokan_field_factory_register_elements', function($registry) {
    // 'my_toggle' will resolve to SwitchField
    $registry->add_alias('my_toggle', 'field:switch');
});
```

---

## 8. Real-World Examples

### 8.1 Setup Wizard Step

```php
class StoreSetupStep {
    
    public function get_fields(): array {
        return FieldFactory::create_from_data([
            [
                'id'       => 'store_setup',
                'type'     => 'section',
                'title'    => 'Set Up Your Store',
                'children' => [
                    [
                        'id'          => 'store_name',
                        'type'        => 'field',
                        'variant'     => 'text',
                        'title'       => 'Store Name',
                        'required'    => true,
                        'placeholder' => 'Enter your store name',
                    ],
                    [
                        'id'       => 'store_type',
                        'type'     => 'field',
                        'variant'  => 'radio_box',
                        'title'    => 'What will you sell?',
                        'default'  => 'physical',
                        'elements' => [
                            [
                                'value' => 'physical',
                                'label' => 'Physical Products',
                                'icon'  => 'box',
                            ],
                            [
                                'value' => 'digital',
                                'label' => 'Digital Products',
                                'icon'  => 'download',
                            ],
                        ],
                    ],
                ],
            ],
        ]);
    }
    
    public function validate(array $data): array {
        $elements = $this->get_fields();
        return FieldFactory::validate($elements, $data);
    }
    
    public function get_schema(): array {
        return FieldFactory::to_array($this->get_fields());
    }
}
```

### 8.2 REST API Endpoint

```php
add_action('rest_api_init', function() {
    register_rest_route('dokan/v1', '/settings/schema', [
        'methods'  => 'GET',
        'callback' => function() {
            $elements = get_settings_elements();
            return rest_ensure_response(FieldFactory::to_array($elements));
        },
    ]);
    
    register_rest_route('dokan/v1', '/settings', [
        'methods'  => 'POST',
        'callback' => function($request) {
            $data     = $request->get_json_params();
            $elements = get_settings_elements();
            
            // Validate
            $validation = FieldFactory::validate($elements, $data);
            if (!$validation['valid']) {
                return new WP_Error('validation_failed', 'Validation failed', [
                    'status' => 400,
                    'errors' => $validation['errors'],
                ]);
            }
            
            // Save
            $values = FieldFactory::get_values($elements, $data);
            foreach ($values as $key => $value) {
                update_option("dokan_{$key}", $value);
            }
            
            return rest_ensure_response(['success' => true]);
        },
    ]);
});
```

### 8.3 Admin Settings Page

```php
class DokanSettings {
    
    private $elements;
    
    public function __construct() {
        $this->elements = $this->build_settings();
    }
    
    private function build_settings(): array {
        return FieldFactory::create_from_data([
            [
                'id'       => 'general',
                'type'     => 'page',
                'title'    => 'General',
                'icon'     => 'dashicons-admin-generic',
                'children' => [
                    [
                        'id'       => 'store_options',
                        'type'     => 'subpage',
                        'title'    => 'Store Options',
                        'children' => $this->get_store_options(),
                    ],
                    [
                        'id'       => 'selling_options',
                        'type'     => 'subpage',
                        'title'    => 'Selling Options',
                        'children' => $this->get_selling_options(),
                    ],
                ],
            ],
        ]);
    }
    
    private function get_store_options(): array {
        return [
            [
                'id'       => 'store_section',
                'type'     => 'section',
                'title'    => 'Store Settings',
                'children' => [
                    [
                        'id'       => 'store_name_required',
                        'type'     => 'field',
                        'variant'  => 'switch',
                        'title'    => 'Store Name Required',
                        'default'  => true,
                    ],
                ],
            ],
        ];
    }
    
    private function get_selling_options(): array {
        return [
            [
                'id'       => 'commission_section',
                'type'     => 'section',
                'title'    => 'Commission',
                'children' => [
                    [
                        'id'       => 'admin_commission',
                        'type'     => 'field',
                        'variant'  => 'number',
                        'title'    => 'Admin Commission',
                        'default'  => 10,
                        'min'      => 0,
                        'max'      => 100,
                        'postfix'  => '%',
                    ],
                ],
            ],
        ];
    }
    
    public function get_schema(): array {
        return FieldFactory::to_array($this->elements);
    }
    
    public function save(array $data): array {
        return FieldFactory::validate($this->elements, $data);
    }
}
```

---

## Summary

| Approach | Best For | Example |
|----------|----------|---------|
| **JSON-Based** | Dynamic configs, REST APIs, stored schemas | `FieldFactory::create_from_data($config)` |
| **Class-Based** | Programmatic building, conditional logic | `FieldFactory::text('id', 'Label')` |
| **Mixed** | Base config + dynamic modifications | Load JSON, then `add_child()` |

Both approaches produce the same output structure and can be freely combined.
