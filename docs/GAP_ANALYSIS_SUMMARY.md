# Gap Analysis Summary: Field Factory Migration

## Quick Reference

### Current vs Target Data Structures

### Admin Setup Guide (`populate()`)

```php
[
    'id'             => string,
    'type'           => string,
    'title'          => string,        // ⚠️ Fields use 'label' in FieldFactory
    'icon'           => string,
    'tooltip'        => string,
    'display'        => bool,
    'hook_key'       => string,
    'children'       => array,
    'description'    => string,
    'dependency_key' => string,
    'dependencies'   => array,
    'validations'    => array,         // ⚠️ Different validation approach
]
```

### Status Page (`render()`)

```php
[
    'id'          => string,
    'title'       => string,
    'description' => string,
    'icon'        => string,
    'type'        => string,
    'data'        => string,          // ⚠️ Unique to Status, not in FieldFactory
    'hook_key'    => string,
    'children'    => array,
]
```

### FieldFactory (`to_array()`)

```php
// Container
[
    'id'             => string,
    'type'           => string,
    'title'          => string,        // ✅ Containers use 'title'
    'description'    => string,
    'icon'           => string,
    'display'        => bool,
    'hook_key'       => string,
    'dependency_key' => string,
    'dependencies'   => array,
    'tooltip'        => string,
    'children'       => array,
]

// Field
[
    // ... container properties ...
    'field_type'  => string,
    'variant'     => string,
    'label'       => string,          // ⚠️ Fields use 'label', not 'title'
    'value'       => mixed,
    'default'     => mixed,
    'elements'    => array,           // ⚠️ Options stored as 'elements'
    // ... many more field properties ...
]
```

---

## Key Gaps Identified

### 1. Property Name Mismatches

| Current | FieldFactory | Impact |
|---------|--------------|--------|
| Field `title` | Field `label` | ⚠️ **High** - Frontend may break |
| `options` (radio/select) | `elements` | ⚠️ **Medium** - Format conversion needed |
| `validations` array | Built-in validation | ⚠️ **Medium** - Need to map rules |
| Status `data` property | N/A | ⚠️ **Low** - Custom handling needed |

### 2. API Pattern Differences

| Aspect | Current | FieldFactory | Gap |
|--------|---------|--------------|-----|
| **Factory** | `ComponentFactory::section()` | `FieldFactory::section()` | ✅ Easy migration |
| **Builder** | Fluent (`->add()`, `->set_title()`) | Static methods + JSON | ⚠️ Different style |
| **Output** | `populate()` / `render()` | `to_array()` | ⚠️ Method name change |
| **Value Setting** | `->set_value($val)` | `->fill(['value' => $val])` | ⚠️ Different API |

### 3. Data Hydration

| Current | FieldFactory | Gap |
|---------|--------------|-----|
| `Settings::hydrate_data()` | Manual value setting | ⚠️ Need helper/adapter |
| Loads from `get_option()` | No built-in hydration | ⚠️ Need `ValueHydrator` |

### 4. Options/Elements Format

**Current (ComponentFactory):**

```php
->add_option('Admin', 'admin')
->add_option('Vendor', 'seller')
```

**FieldFactory:**

```php
'elements' => [
    ['label' => 'Admin', 'value' => 'admin'],
    ['label' => 'Vendor', 'value' => 'seller'],
]
```

**Gap**: Format conversion needed

---

## Compatibility Matrix

| Feature | Admin Setup Guide | Status Page | FieldFactory | Status |
|---------|------------------|-------------|--------------|--------|
| **Sections** | ✅ | ✅ | ✅ | ✅ Compatible |
| **Fields** | ✅ | ❌ | ✅ | ✅ Compatible |
| **Tables** | ❌ | ✅ | ✅ | ✅ Compatible |
| **Paragraphs** | ❌ | ✅ | ✅ | ✅ Compatible |
| **Radio Box** | ✅ | ❌ | ✅ | ✅ Compatible |
| **Switch/Toggle** | ✅ | ❌ | ✅ | ✅ Compatible |
| **Select** | ✅ | ❌ | ✅ | ✅ Compatible |
| **Value Hydration** | ✅ | ❌ | ⚠️ | ⚠️ Need adapter |
| **Validation** | ✅ | ❌ | ✅ | ✅ Compatible |
| **Dependencies** | ✅ | ❌ | ✅ | ✅ Compatible |

---

## Migration Priority

### High Priority (Must Fix)

1. ✅ **Property name mapping** (`title` → `label` for fields)
2. ✅ **Options format conversion** (`add_option()` → `elements` array)
3. ✅ **Data hydration** (create `ValueHydrator`)

### Medium Priority (Should Fix)

4. ⚠️ **Validation rules mapping**
5. ⚠️ **Status `data` property handling**
6. ⚠️ **Frontend compatibility check**

### Low Priority (Nice to Have)

7. ⚠️ **Performance optimization**
8. ⚠️ **Code cleanup** (remove old factories)

---

## Quick Migration Steps

### Step 1: Create Adapters

```php
// SettingsElementAdapter::to_field($settingsElement)
// StatusElementAdapter::to_field($statusElement)
// ValueHydrator::hydrate_from_option($element, $option_name)
```

### Step 2: Update AbstractStep

```php
public function populate_via_factory(): array {
    $elements = $this->build_with_factory();
    return FieldFactory::to_array($elements);
}
```

### Step 3: Migrate Steps One by One

```php
// BasicStep::build_with_factory()
return [
    FieldFactory::section('basic', 'Basic', [
        FieldFactory::radio_box('field_id', 'Label', $options, $config),
    ]),
];
```

### Step 4: Update REST Controllers

```php
// Use feature flag (example only)
if ( apply_filters( 'dokan_use_field_elements', false ) ) {
    $output = $step->populate_via_factory();
} else {
    $output = $step->populate(); // Legacy
}
```

---

## Testing Checklist

- [ ] All fields render correctly
- [ ] Values load from options correctly
- [ ] Form submission works
- [ ] Validation works
- [ ] Tables display correctly
- [ ] Paragraphs display correctly
- [ ] Frontend receives correct data structure
- [ ] Backward compatibility maintained

---

**See**: [Full Migration Plan](./MIGRATION_PLAN_FIELD_FACTORY.md) for detailed implementation.
