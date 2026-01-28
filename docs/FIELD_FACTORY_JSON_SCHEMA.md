# Field Factory JSON Schema

This document defines the JSON schema format for the Unified Field Factory.

---

## Table of Contents

1. [Basic Structure](#1-basic-structure)
2. [Element Types](#2-element-types)
3. [Field Properties](#3-field-properties)
4. [Complete Examples](#4-complete-examples)

---

## 1. Basic Structure

Every element follows this base structure:

```json
{
    "id": "unique_identifier",
    "type": "element_type",
    "title": "Display Title",
    "description": "Optional description",
    "display": true,
    "children": []
}
```

### Base Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | string | Yes | Element type (page, section, field, etc.) |
| `title` | string | No | Display label |
| `description` | string | No | Help text |
| `display` | boolean | No | Visibility (default: true) |
| `children` | array | No | Nested child elements |

---

## 2. Element Types

### 2.1 Containers

#### Page

```json
{
    "id": "general_settings",
    "type": "page",
    "title": "General Settings",
    "icon": "dashicons-admin-generic",
    "children": []
}
```

#### Subpage

```json
{
    "id": "store_options",
    "type": "subpage",
    "title": "Store Options",
    "children": []
}
```

### 2.2 Layouts

#### Section

```json
{
    "id": "selling_options",
    "type": "section",
    "title": "Selling Options",
    "description": "Configure selling preferences",
    "children": []
}
```

#### Subsection

```json
{
    "id": "commission_settings",
    "type": "subsection",
    "title": "Commission Settings",
    "children": []
}
```

#### Field Group

```json
{
    "id": "address_group",
    "type": "fieldgroup",
    "title": "Address Information",
    "children": []
}
```

### 2.3 Tables

#### Table

```json
{
    "id": "system_status",
    "type": "table",
    "title": "System Status",
    "headers": ["Name", "Value", "Status"],
    "children": []
}
```

#### Table Row

```json
{
    "id": "row_php_version",
    "type": "table-row",
    "children": []
}
```

#### Table Column

```json
{
    "id": "col_name",
    "type": "table-column",
    "children": []
}
```

### 2.4 Display Elements

#### Paragraph

```json
{
    "id": "intro_text",
    "type": "paragraph",
    "title": "Welcome to Dokan",
    "description": "This is the setup wizard for your marketplace."
}
```

---

## 3. Field Properties

All fields have `type: "field"` and a `variant` that specifies the field type.

### 3.1 Common Field Properties

```json
{
    "id": "field_id",
    "type": "field",
    "variant": "text",
    "title": "Field Label",
    "description": "Help text",
    "placeholder": "Enter value...",
    "default": "",
    "required": true,
    "disabled": false,
    "read_only": false,
    "display": true
}
```

| Property | Type | Description |
|----------|------|-------------|
| `variant` | string | Field type: text, select, switch, number, radio, etc. |
| `placeholder` | string | Placeholder text |
| `default` | mixed | Default value |
| `required` | boolean | Is field required |
| `disabled` | boolean | Is field disabled |
| `read_only` | boolean | Is field read-only |
| `helper_text` | string | Additional help text below field |
| `prefix` | string | Text/icon before input |
| `postfix` | string | Text/icon after input |

### 3.2 Field Variants

#### Text Field

```json
{
    "id": "store_name",
    "type": "field",
    "variant": "text",
    "title": "Store Name",
    "placeholder": "Enter your store name",
    "required": true,
    "minlength": 3,
    "maxlength": 100
}
```

#### Textarea Field

```json
{
    "id": "store_description",
    "type": "field",
    "variant": "textarea",
    "title": "Store Description",
    "placeholder": "Describe your store...",
    "rows": 5
}
```

#### Number Field

```json
{
    "id": "commission_rate",
    "type": "field",
    "variant": "number",
    "title": "Commission Rate",
    "default": 10,
    "min": 0,
    "max": 100,
    "step": 0.5,
    "postfix": "%"
}
```

#### Select Field

```json
{
    "id": "country",
    "type": "field",
    "variant": "select",
    "title": "Country",
    "placeholder": "Select a country",
    "default": "US",
    "multiple": false,
    "searchable": true,
    "elements": [
        { "value": "US", "label": "United States" },
        { "value": "UK", "label": "United Kingdom" },
        { "value": "CA", "label": "Canada" }
    ]
}
```

#### Switch/Toggle Field

```json
{
    "id": "enable_shipping",
    "type": "field",
    "variant": "switch",
    "title": "Enable Shipping",
    "description": "Allow vendors to configure shipping",
    "default": true,
    "enable_state": {
        "value": "on",
        "title": "Enabled"
    },
    "disable_state": {
        "value": "off",
        "title": "Disabled"
    }
}
```

#### Radio Field

```json
{
    "id": "selling_type",
    "type": "field",
    "variant": "radio",
    "title": "Selling Type",
    "default": "both",
    "layout": "vertical",
    "elements": [
        { "value": "physical", "label": "Physical Products" },
        { "value": "digital", "label": "Digital Products" },
        { "value": "both", "label": "Both" }
    ]
}
```

#### Radio Box Field

```json
{
    "id": "marketplace_type",
    "type": "field",
    "variant": "radio_box",
    "title": "Marketplace Type",
    "default": "multi",
    "elements": [
        {
            "value": "single",
            "label": "Single Vendor",
            "description": "Only admin can sell",
            "icon": "dashicons-store"
        },
        {
            "value": "multi",
            "label": "Multi Vendor",
            "description": "Multiple vendors can sell",
            "icon": "dashicons-groups"
        }
    ]
}
```

#### Multicheck Field

```json
{
    "id": "payment_methods",
    "type": "field",
    "variant": "multicheck",
    "title": "Payment Methods",
    "default": ["paypal", "stripe"],
    "elements": [
        { "value": "paypal", "label": "PayPal" },
        { "value": "stripe", "label": "Stripe" },
        { "value": "bank", "label": "Bank Transfer" },
        { "value": "cod", "label": "Cash on Delivery" }
    ]
}
```

#### Combine Input Field

```json
{
    "id": "commission_range",
    "type": "field",
    "variant": "combine_input",
    "title": "Commission Range",
    "fields": [
        {
            "id": "min_commission",
            "variant": "number",
            "placeholder": "Min",
            "min": 0
        },
        {
            "id": "max_commission",
            "variant": "number",
            "placeholder": "Max",
            "max": 100
        }
    ]
}
```

#### File Upload Field

```json
{
    "id": "store_logo",
    "type": "field",
    "variant": "file_upload",
    "title": "Store Logo",
    "allowed_types": ["image/jpeg", "image/png", "image/gif"],
    "max_size": 2097152,
    "multiple": false
}
```

#### Color Picker Field

```json
{
    "id": "primary_color",
    "type": "field",
    "variant": "color",
    "title": "Primary Color",
    "default": "#1e73be"
}
```

#### Info Field (Read-only)

```json
{
    "id": "api_key_info",
    "type": "field",
    "variant": "info",
    "title": "API Key",
    "value": "sk_live_xxxxxxxxxxxxx",
    "info_type": "info"
}
```

#### Notice Field

```json
{
    "id": "warning_notice",
    "type": "field",
    "variant": "notice",
    "title": "Warning",
    "description": "This action cannot be undone.",
    "notice_type": "warning"
}
```

### 3.3 Conditional Visibility

Fields can be shown/hidden based on other field values:

```json
{
    "id": "shipping_cost",
    "type": "field",
    "variant": "number",
    "title": "Shipping Cost",
    "visibility": {
        "field": "enable_shipping",
        "value": true,
        "operator": "equal"
    }
}
```

Operators: `equal`, `not_equal`, `contains`, `in`, `not_in`, `empty`, `not_empty`, `gt`, `lt`, `gte`, `lte`

### 3.4 Validation Rules

```json
{
    "id": "email",
    "type": "field",
    "variant": "text",
    "title": "Email Address",
    "required": true,
    "is_valid": {
        "required": true,
        "custom": "email"
    }
}
```

---

## 4. Complete Examples

### 4.1 Settings Page

```json
[
    {
        "id": "general",
        "type": "page",
        "title": "General",
        "icon": "dashicons-admin-generic",
        "children": [
            {
                "id": "store_settings",
                "type": "subpage",
                "title": "Store Settings",
                "children": [
                    {
                        "id": "basic_info",
                        "type": "section",
                        "title": "Basic Information",
                        "children": [
                            {
                                "id": "store_name",
                                "type": "field",
                                "variant": "text",
                                "title": "Store Name",
                                "required": true,
                                "placeholder": "Enter store name"
                            },
                            {
                                "id": "store_description",
                                "type": "field",
                                "variant": "textarea",
                                "title": "Description",
                                "rows": 4
                            }
                        ]
                    },
                    {
                        "id": "selling_options",
                        "type": "section",
                        "title": "Selling Options",
                        "children": [
                            {
                                "id": "enable_selling",
                                "type": "field",
                                "variant": "switch",
                                "title": "Enable Selling",
                                "default": true
                            },
                            {
                                "id": "commission_type",
                                "type": "field",
                                "variant": "select",
                                "title": "Commission Type",
                                "default": "percentage",
                                "elements": [
                                    { "value": "percentage", "label": "Percentage" },
                                    { "value": "fixed", "label": "Fixed Amount" },
                                    { "value": "combined", "label": "Combined" }
                                ]
                            },
                            {
                                "id": "commission_rate",
                                "type": "field",
                                "variant": "number",
                                "title": "Commission Rate",
                                "default": 10,
                                "min": 0,
                                "max": 100,
                                "postfix": "%",
                                "visibility": {
                                    "field": "commission_type",
                                    "value": "percentage",
                                    "operator": "equal"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
]
```

### 4.2 Setup Wizard

```json
[
    {
        "id": "basic_setup",
        "type": "section",
        "title": "Basic Setup",
        "description": "Configure your marketplace basics",
        "children": [
            {
                "id": "marketplace_type",
                "type": "field",
                "variant": "radio_box",
                "title": "Marketplace Type",
                "default": "multi",
                "elements": [
                    {
                        "value": "single",
                        "label": "Single Vendor",
                        "description": "Only you can sell products",
                        "icon": "store"
                    },
                    {
                        "value": "multi",
                        "label": "Multi Vendor",
                        "description": "Allow multiple vendors to sell",
                        "icon": "groups"
                    }
                ]
            },
            {
                "id": "vendor_options",
                "type": "subsection",
                "title": "Vendor Options",
                "visibility": {
                    "field": "marketplace_type",
                    "value": "multi",
                    "operator": "equal"
                },
                "children": [
                    {
                        "id": "vendor_registration",
                        "type": "field",
                        "variant": "switch",
                        "title": "Allow Vendor Registration",
                        "default": true
                    },
                    {
                        "id": "vendor_approval",
                        "type": "field",
                        "variant": "switch",
                        "title": "Require Admin Approval",
                        "default": true
                    }
                ]
            }
        ]
    },
    {
        "id": "payment_setup",
        "type": "section",
        "title": "Payment Setup",
        "children": [
            {
                "id": "payment_methods",
                "type": "field",
                "variant": "multicheck",
                "title": "Payment Methods",
                "default": ["paypal"],
                "elements": [
                    { "value": "paypal", "label": "PayPal" },
                    { "value": "stripe", "label": "Stripe" },
                    { "value": "bank", "label": "Bank Transfer" }
                ]
            }
        ]
    }
]
```

### 4.3 Status Page with Tables

```json
[
    {
        "id": "system_status",
        "type": "section",
        "title": "System Status",
        "children": [
            {
                "id": "environment_table",
                "type": "table",
                "title": "Environment",
                "headers": ["Setting", "Value", "Status"],
                "children": [
                    {
                        "id": "row_php",
                        "type": "table-row",
                        "children": [
                            {
                                "id": "col_php_name",
                                "type": "table-column",
                                "children": [
                                    {
                                        "id": "php_label",
                                        "type": "paragraph",
                                        "title": "PHP Version"
                                    }
                                ]
                            },
                            {
                                "id": "col_php_value",
                                "type": "table-column",
                                "children": [
                                    {
                                        "id": "php_value",
                                        "type": "paragraph",
                                        "title": "8.1.0"
                                    }
                                ]
                            },
                            {
                                "id": "col_php_status",
                                "type": "table-column",
                                "children": [
                                    {
                                        "id": "php_status",
                                        "type": "field",
                                        "variant": "info",
                                        "value": "OK",
                                        "info_type": "success"
                                    }
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

### 4.4 Form with Field Groups

```json
[
    {
        "id": "vendor_form",
        "type": "section",
        "title": "Vendor Registration",
        "children": [
            {
                "id": "personal_info",
                "type": "fieldgroup",
                "title": "Personal Information",
                "children": [
                    {
                        "id": "first_name",
                        "type": "field",
                        "variant": "text",
                        "title": "First Name",
                        "required": true
                    },
                    {
                        "id": "last_name",
                        "type": "field",
                        "variant": "text",
                        "title": "Last Name",
                        "required": true
                    },
                    {
                        "id": "email",
                        "type": "field",
                        "variant": "text",
                        "title": "Email",
                        "required": true,
                        "is_valid": {
                            "required": true,
                            "custom": "email"
                        }
                    }
                ]
            },
            {
                "id": "store_info",
                "type": "fieldgroup",
                "title": "Store Information",
                "children": [
                    {
                        "id": "store_name",
                        "type": "field",
                        "variant": "text",
                        "title": "Store Name",
                        "required": true
                    },
                    {
                        "id": "store_logo",
                        "type": "field",
                        "variant": "file_upload",
                        "title": "Store Logo",
                        "allowed_types": ["image/jpeg", "image/png"]
                    },
                    {
                        "id": "store_banner_color",
                        "type": "field",
                        "variant": "color",
                        "title": "Banner Color",
                        "default": "#1e73be"
                    }
                ]
            }
        ]
    }
]
```

---

## 5. Quick Reference

### Element Types

| Type | Description |
|------|-------------|
| `page` | Top-level container |
| `subpage` | Child of page |
| `section` | Content section |
| `subsection` | Nested section |
| `fieldgroup` | Group of fields |
| `table` | Table container |
| `table-row` | Table row |
| `table-column` | Table column |
| `paragraph` | Display text |
| `field` | Input field (requires `variant`) |

### Field Variants

| Variant | Description |
|---------|-------------|
| `text` | Single line text |
| `textarea` | Multi-line text |
| `rich_text` | WYSIWYG editor |
| `number` | Numeric input |
| `select` | Dropdown |
| `switch` / `toggle` | Boolean toggle |
| `radio` | Radio buttons |
| `radio_box` | Radio with description/icon |
| `radio_capsule` | Pill-style radio |
| `multicheck` | Multiple checkboxes |
| `file_upload` | File picker |
| `color` | Color picker |
| `combine_input` | Multiple inputs |
| `repeater` | Repeatable fields |
| `copy_field` | Copy to clipboard |
| `show_hide` | Show/hide toggle |
| `info` | Read-only info |
| `notice` | Alert message |
| `base_field_label` | Label only |
