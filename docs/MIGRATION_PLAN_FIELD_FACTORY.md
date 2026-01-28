# Migration Plan: Admin Setup Guide & Status Page to Unified Field Factory

## Executive Summary

This document outlines the gap analysis and implementation plan for migrating the **Admin Setup Guide** and **Status Page** from their current implementations to the **Unified Field Factory** system.

---

## 1. Current State Analysis

### 1.1 Admin Setup Guide

**Current Implementation:**

- **Base Class**: `AbstractStep` → `Settings` → `SettingsElement`
- **Factory Pattern**: `ComponentFactory` (fluent builder pattern)
- **Output Method**: `populate()` → returns array structure
- **Usage**: `$step->populate()` returns complete step data

**Data Structure (from `populate()`):**

```php
[
    'id'             => string,
    'type'           => string,
    'title'          => string,
    'icon'           => string,
    'tooltip'        => string,
    'display'        => bool,
    'hook_key'       => string,
    'children'       => array,
    'description'    => string,
    'dependency_key' => string,
    'dependencies'   => array,
    'validations'    => array,
]
```

**Example Usage:**

```php
// In BasicStep::describe_settings()
Factory::section('basic')
    ->set_title('Basic')
    ->add(
        Factory::field('shipping_fee_recipient', 'radio_box')
            ->set_title('Shipping Fee Recipient')
            ->set_value($dokan_selling['shipping_fee_recipient'])
    );

// In REST Controller
$step_array = $step->populate();
```

**Key Components:**

- `ComponentFactory::section()`, `ComponentFactory::field()`, etc.
- Fluent builder pattern with `->add()`, `->set_title()`, `->set_value()`, etc.
- Elements stored in `SettingsElement` children array
- Data hydration via `hydrate_data()` from WordPress options

---

### 1.2 Status Page

**Current Implementation:**

- **Base Class**: `Status` → `StatusElement`
- **Factory Pattern**: `StatusElementFactory` (fluent builder pattern)
- **Output Method**: `render()` → returns array structure
- **Usage**: `$status_fields = (new Status())->render()` returns children array

**Data Structure (from `render()`):**

```php
[
    'id'          => string,
    'title'       => string,
    'description' => string,
    'icon'        => string,
    'type'        => string,
    'data'        => string,  // Escaped data
    'hook_key'    => string,
    'children'    => array,
]
```

**Example Usage:**

```php
// In Status::describe()
$this->add(
    StatusElementFactory::section('overridden_features')
        ->set_title('Overridden Templates')
        ->add(
            StatusElementFactory::table('override_table')
                ->set_headers(['Template', 'Feature', 'Action'])
                ->add(
                    StatusElementFactory::table_row('override_row')
                        ->add(
                            StatusElementFactory::table_column('template')
                                ->add(
                                    StatusElementFactory::paragraph('file')
                                        ->set_title('FileA.php')
                                )
                        )
                )
        )
);

// In REST Controller
$status_fields = (new Status())->render();
```

**Key Components:**

- `StatusElementFactory::section()`, `StatusElementFactory::table()`, etc.
- Fluent builder pattern similar to ComponentFactory
- Elements stored in `StatusElement` children array
- Special handling for tables, paragraphs, buttons

---

### 1.3 Unified Field Factory

**Target Implementation:**

- **Base Classes**: `ElementInterface`, `ContainerInterface`, `FieldInterface`
- **Factory Pattern**: `FieldFactory` (static methods + JSON config)
- **Output Method**: `to_array()` → returns array structure
- **Usage**: `FieldFactory::create_from_data($config)` or `FieldFactory::section()`, etc.

**Data Structure (from `to_array()`):**

```php
// Container/Element
[
    'id'             => string,
    'type'           => string,
    'title'          => string,
    'description'    => string,
    'icon'           => string,
    'display'        => bool,
    'hook_key'       => string,
    'dependency_key' => string,
    'dependencies'   => array,
    'tooltip'        => string,
    'children'       => array,  // Recursive
]

// Field
[
    // ... all container properties above ...
    'field_type'           => string,
    'variant'              => string,
    'label'                => string,  // Note: 'label' not 'title'
    'value'                => mixed,
    'default'              => mixed,
    'elements'             => array,  // Options for select/radio
    'placeholder'          => string,
    'read_only'            => bool,
    'required'             => bool,
    'disabled'             => bool,
    'enable_sorting'       => bool,
    'enable_hiding'        => bool,
    'enable_global_search' => bool,
    'is_valid'             => bool,
    'visibility'           => array,
    'filter_by'            => mixed,
    'format'               => array,
    'helper_text'          => string,
    'size'                 => string,
    'prefix'               => string,
    'postfix'              => string,
    'enable_state'         => array,
    'disable_state'        => array,
]
```

**Example Usage:**

```php
// JSON-based
$elements = FieldFactory::create_from_data([
    [
        'id' => 'basic',
        'type' => 'section',
        'title' => 'Basic',
        'children' => [
            [
                'id' => 'shipping_fee_recipient',
                'type' => 'field',
                'variant' => 'radio_box',
                'title' => 'Shipping Fee Recipient',
                'elements' => [
                    ['label' => 'Admin', 'value' => 'admin'],
                    ['label' => 'Vendor', 'value' => 'seller'],
                ],
                'value' => $dokan_selling['shipping_fee_recipient'],
            ],
        ],
    ],
]);

// Class-based
$section = FieldFactory::section('basic', 'Basic', [
    FieldFactory::radio_box('shipping_fee_recipient', 'Shipping Fee Recipient', [
        ['label' => 'Admin', 'value' => 'admin'],
        ['label' => 'Vendor', 'value' => 'seller'],
    ], ['value' => $dokan_selling['shipping_fee_recipient']]),
]);

// Convert to array
$output = FieldFactory::to_array([$section]);
```

---

## 2. Gap Analysis

### 2.1 Structural Gaps

| Aspect | Admin Setup Guide | Status Page | FieldFactory | Gap |
|--------|------------------|-------------|--------------|-----|
| **Base Class** | `SettingsElement` | `StatusElement` | `AbstractElement` | Different inheritance hierarchies |
| **Factory** | `ComponentFactory` | `StatusElementFactory` | `FieldFactory` | Different factory patterns |
| **Builder Pattern** | Fluent (`->add()`) | Fluent (`->add()`) | Static methods + JSON | Different API styles |
| **Output Method** | `populate()` | `render()` | `to_array()` | Different method names |
| **Field Title** | `title` | `title` | `label` (for fields) | Property name mismatch |
| **Data Property** | N/A | `data` (string) | N/A | Status has unique `data` field |
| **Validations** | `validations` array | N/A | Built-in validation | Different validation approaches |

### 2.2 Property Mapping Gaps

#### Admin Setup Guide → FieldFactory

| Current Property | FieldFactory Property | Notes |
|------------------|----------------------|-------|
| `title` (field) | `label` | Fields use `label`, containers use `title` |
| `type` | `type` | ✅ Compatible |
| `variant` | `variant` | ✅ Compatible (via `field_type` in config) |
| `value` | `value` | ✅ Compatible |
| `default` | `default` | ✅ Compatible |
| `options` (radio/select) | `elements` | Different property name |
| `validations` | Built-in validation | Need to map validation rules |
| `dependencies` | `dependencies` | ✅ Compatible |
| `dependency_key` | `dependency_key` | ✅ Compatible |

#### Status Page → FieldFactory

| Current Property | FieldFactory Property | Notes |
|------------------|----------------------|-------|
| `data` (string) | N/A | Status-specific, may need custom handling |
| `title` | `title` | ✅ Compatible |
| `type` | `type` | ✅ Compatible |
| `headers` (table) | `headers` | ✅ Compatible (Table element) |
| `children` | `children` | ✅ Compatible |

### 2.3 Functional Gaps

1. **Data Hydration**
   - **Current**: `Settings::hydrate_data()` loads from WordPress options
   - **FieldFactory**: No built-in hydration, values must be set manually
   - **Gap**: Need adapter to load values from options

2. **Value Setting**
   - **Current**: `->set_value()` in fluent builder
   - **FieldFactory**: `$field->fill(['value' => $val])` or `$field->set_value($val)`
   - **Gap**: Different API, but compatible

3. **Options/Elements Format**
   - **Current**: `->add_option('Label', 'value')` builds array
   - **FieldFactory**: Expects `elements` as `[['label' => 'Label', 'value' => 'value']]`
   - **Gap**: Format conversion needed

4. **Table Structure**
   - **Current**: `Table` → `TableRow` → `TableColumn` → content
   - **FieldFactory**: Same structure ✅
   - **Gap**: None, fully compatible

5. **Paragraph/Display Elements**
   - **Current**: `StatusElementFactory::paragraph()`
   - **FieldFactory**: `Paragraph` element ✅
   - **Gap**: None, fully compatible

6. **Switch Field States**
   - **Current**: `->set_enable_state('Enabled', 'on')` and `->set_disable_state('Disabled', 'off')`
   - **FieldFactory**: `enable_state` and `disable_state` properties ✅
   - **Gap**: None, fully compatible

---

## 3. Implementation Plan

### Phase 1: Create Adapter Layer (Week 1)

**Goal**: Create bridge classes to translate between old and new systems without breaking existing code.

#### 1.1 Create SettingsElement to FieldFactory Adapter

**File**: `includes/FieldFactory/Adapters/SettingsElementAdapter.php`

```php
<?php
namespace WeDevs\Dokan\FieldFactory\Adapters;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\FieldFactory\FieldFactory;
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;

class SettingsElementAdapter {
    /**
     * Convert SettingsElement tree to FieldFactory elements.
     */
    public static function to_field_factory(SettingsElement $element): ElementInterface {
        // Convert element structure
    }
    
    /**
     * Convert FieldFactory element to SettingsElement populate() format.
     */
    public static function to_populate_format(ElementInterface $element, array $data = []): array {
        // Convert back to old format for backward compatibility
    }
}
```

#### 1.2 Create StatusElement to FieldFactory Adapter

**File**: `includes/FieldFactory/Adapters/StatusElementAdapter.php`

```php
<?php
namespace WeDevs\Dokan\FieldFactory\Adapters;

use WeDevs\Dokan\Abstracts\StatusElement;
use WeDevs\Dokan\FieldFactory\FieldFactory;
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;

class StatusElementAdapter {
    /**
     * Convert StatusElement tree to FieldFactory elements.
     */
    public static function to_field_factory(StatusElement $element): ElementInterface {
        // Convert element structure
    }
    
    /**
     * Convert FieldFactory element to StatusElement render() format.
     */
    public static function to_render_format(ElementInterface $element): array {
        // Convert back to old format for backward compatibility
    }
}
```

#### 1.3 Create Value Hydration Helper

**File**: `includes/FieldFactory/Helpers/ValueHydrator.php`

```php
<?php
namespace WeDevs\Dokan\FieldFactory\Helpers;

use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;
use WeDevs\Dokan\FieldFactory\Contracts\FieldInterface;

class ValueHydrator {
    /**
     * Hydrate field values from WordPress options.
     */
    public static function hydrate_from_option(
        ElementInterface $element,
        string $option_name,
        array $defaults = []
    ): ElementInterface {
        $data = get_option($option_name, $defaults);
        return self::hydrate_from_data($element, $data);
    }
    
    /**
     * Hydrate field values from array data.
     */
    public static function hydrate_from_data(
        ElementInterface $element,
        array $data
    ): ElementInterface {
        // Recursively set values on fields
    }
}
```

**Tasks:**

- [ ] Create `SettingsElementAdapter` class
- [ ] Create `StatusElementAdapter` class
- [ ] Create `ValueHydrator` helper
- [ ] Write unit tests for adapters
- [ ] Document adapter usage

---

### Phase 2: Migrate Admin Setup Guide (Week 2-3)

**Goal**: Migrate `AbstractStep` implementations to use FieldFactory while maintaining backward compatibility.

#### 2.1 Update AbstractStep Base Class

**File**: `includes/Admin/OnboardingSetup/Steps/AbstractStep.php`

**Changes:**

- Add optional FieldFactory support
- Keep existing `populate()` method for backward compatibility
- Add new `populate_via_factory()` method using FieldFactory

```php
/**
 * Populate using FieldFactory (new method).
 */
public function populate_via_factory(): array {
    $this->hydrate_data();
    
    // Build using FieldFactory
    $elements = $this->build_with_factory();
    
    // Convert to array
    return FieldFactory::to_array($elements);
}

/**
 * Build step structure using FieldFactory.
 * Override in child classes.
 */
protected function build_with_factory(): array {
    // Default: convert from old structure
    return SettingsElementAdapter::to_field_factory($this)->get_children();
}
```

#### 2.2 Migrate BasicStep Example

**File**: `includes/Admin/OnboardingSetup/Steps/BasicStep.php`

**Migration Strategy:**

1. Keep `describe_settings()` for now (backward compatibility)
2. Add new `build_with_factory()` method
3. Gradually migrate field by field

```php
protected function build_with_factory(): array {
    $default_settings = $this->get_default_settings();
    $dokan_selling = get_option('dokan_selling', $default_settings);
    
    return [
        FieldFactory::section('basic', __('Basic', 'dokan-lite'), [
            FieldFactory::radio_box(
                'shipping_fee_recipient',
                __('Shipping Fee Recipient', 'dokan-lite'),
                [
                    ['label' => __('Admin', 'dokan-lite'), 'value' => 'admin'],
                    ['label' => __('Vendor', 'dokan-lite'), 'value' => 'seller'],
                ],
                [
                    'description' => __('Choose who receives shipping charges...', 'dokan-lite'),
                    'default' => $default_settings['shipping_fee_recipient'],
                    'value' => $dokan_selling['shipping_fee_recipient'] ?? $default_settings['shipping_fee_recipient'],
                ]
            ),
            // ... more fields
        ]),
    ];
}
```

#### 2.3 Update REST Controller

**File**: `includes/REST/AdminSetupGuideController.php`

**Changes:**

- Add feature flag to switch between old and new implementation
- Update `get_item()` to use new method when flag is enabled

```php
public function get_item($request) {
    // ... existing code ...
    
    $step = $steps[$step_index];
    
    // Use new FieldFactory if enabled
    if (apply_filters('dokan_use_field_factory_for_setup_guide', false)) {
        $step_array = $step->populate_via_factory();
    } else {
        $step_array = $step->populate(); // Legacy
    }
    
    return rest_ensure_response($step_array);
}
```

**Tasks:**

- [ ] Update `AbstractStep` with `populate_via_factory()` method
- [ ] Migrate `BasicStep` to FieldFactory
- [ ] Migrate other step classes one by one
- [ ] Update REST controller with feature flag
- [ ] Test backward compatibility
- [ ] Update frontend if data structure changes

---

### Phase 3: Migrate Status Page (Week 4)

**Goal**: Migrate `Status` class to use FieldFactory.

#### 3.1 Update Status Base Class

**File**: `includes/Admin/Status/Status.php`

**Changes:**

- Add FieldFactory support
- Keep existing `render()` method for backward compatibility
- Add new `render_via_factory()` method

```php
public function render_via_factory(): array {
    try {
        $this->describe();
    } catch (Exception $e) {
        dokan_log($e->getMessage());
    }
    
    // Convert children to FieldFactory elements
    $elements = [];
    foreach ($this->get_children() as $child) {
        $elements[] = StatusElementAdapter::to_field_factory($child);
    }
    
    // Convert to array (matching old render() format)
    $output = FieldFactory::to_array($elements);
    
    // Transform to match old render() structure if needed
    return StatusElementAdapter::to_render_format($output);
}
```

#### 3.2 Migrate Status Elements

**Strategy:**

- Convert `StatusElementFactory` calls to `FieldFactory` calls
- Map table structures
- Handle paragraph elements

**Example Migration:**

```php
// Old
$this->add(
    StatusElementFactory::section('overridden_features')
        ->set_title('Overridden Templates')
        ->add(
            StatusElementFactory::table('override_table')
                ->set_headers(['Template', 'Feature', 'Action'])
        )
);

// New
$section = FieldFactory::section('overridden_features', 'Overridden Templates', [
    FieldFactory::create([
        'id' => 'override_table',
        'type' => 'table',
        'headers' => ['Template', 'Feature', 'Action'],
        'children' => [
            // ... rows
        ],
    ]),
]);
$this->add_field_factory_element($section);
```

#### 3.3 Update Status REST Endpoint

**File**: Find Status REST controller

**Changes:**

- Add feature flag
- Use new render method when enabled

**Tasks:**

- [ ] Update `Status` class with `render_via_factory()` method
- [ ] Migrate `Status::describe()` to use FieldFactory
- [ ] Update Status REST endpoint
- [ ] Test table rendering
- [ ] Test paragraph elements
- [ ] Verify backward compatibility

---

### Phase 4: Data Structure Alignment (Week 5)

**Goal**: Ensure output data structures are compatible with frontend.

#### 4.1 Property Name Mapping

Create transformer to map between old and new property names:

```php
class DataStructureTransformer {
    public static function to_legacy_format(array $field_factory_output): array {
        // Transform 'label' → 'title' for fields
        // Transform 'elements' format
        // Add 'validations' if needed
    }
    
    public static function to_field_factory_format(array $legacy_output): array {
        // Transform 'title' → 'label' for fields
        // Transform options to elements format
    }
}
```

#### 4.2 Frontend Compatibility

**Check Frontend Expectations:**

- Review React/TypeScript components
- Ensure property names match
- Update if necessary

**Files to Check:**

- `src/admin/dashboard/pages/setup-guide/Elements/Fields/FieldParser.tsx`
- `src/Status/SettingsParser.tsx`

**Tasks:**

- [ ] Create `DataStructureTransformer` class
- [ ] Review frontend components
- [ ] Update frontend if needed
- [ ] Test end-to-end

---

### Phase 5: Testing & Validation (Week 6)

**Goal**: Comprehensive testing and validation.

#### 5.1 Unit Tests

- [ ] Test adapters
- [ ] Test value hydration
- [ ] Test data structure transformation
- [ ] Test backward compatibility

#### 5.2 Integration Tests

- [ ] Test Admin Setup Guide REST endpoints
- [ ] Test Status Page REST endpoints
- [ ] Test form submission
- [ ] Test validation

#### 5.3 Frontend Tests

- [ ] Test form rendering
- [ ] Test field interactions
- [ ] Test table display
- [ ] Test paragraph elements

#### 5.4 Migration Validation

- [ ] Compare old vs new output
- [ ] Verify all fields render correctly
- [ ] Verify all values save correctly
- [ ] Performance comparison

---

### Phase 6: Gradual Rollout (Week 7-8)

**Goal**: Enable FieldFactory gradually with feature flags.

#### 6.1 Feature Flags

```php
// Enable for specific steps
add_filter('dokan_use_field_factory_for_setup_guide', '__return_true');
add_filter('dokan_use_field_factory_for_status', '__return_true');

// Or enable per step
add_filter('dokan_use_field_factory_for_step', function($use, $step_id) {
    return in_array($step_id, ['basic', 'payment']);
}, 10, 2);
```

#### 6.2 Monitoring

- [ ] Add logging for migration
- [ ] Monitor errors
- [ ] Collect feedback

#### 6.3 Rollback Plan

- [ ] Keep old code for 2-3 releases
- [ ] Document rollback procedure
- [ ] Test rollback

---

## 4. Migration Checklist

### Pre-Migration

- [x] Document current implementations
- [x] Identify gaps
- [ ] Review FieldFactory capabilities
- [ ] Plan adapter layer

### Phase 1: Adapters

- [ ] Create `SettingsElementAdapter`
- [ ] Create `StatusElementAdapter`
- [ ] Create `ValueHydrator`
- [ ] Write tests

### Phase 2: Admin Setup Guide

- [ ] Update `AbstractStep`
- [ ] Migrate `BasicStep`
- [ ] Migrate other steps
- [ ] Update REST controller
- [ ] Test

### Phase 3: Status Page

- [ ] Update `Status` class
- [ ] Migrate `Status::describe()`
- [ ] Update REST endpoint
- [ ] Test

### Phase 4: Data Alignment

- [ ] Create transformer
- [ ] Review frontend
- [ ] Update if needed

### Phase 5: Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] Frontend tests
- [ ] Validation

### Phase 6: Rollout

- [ ] Feature flags
- [ ] Monitoring
- [ ] Rollback plan

---

## 5. Risk Mitigation

### 5.1 Backward Compatibility

**Risk**: Breaking existing functionality

**Mitigation**:

- Keep old methods (`populate()`, `render()`) intact
- Use feature flags for gradual rollout
- Create adapters to bridge old and new
- Maintain old code for 2-3 releases

### 5.2 Data Structure Changes

**Risk**: Frontend breaks due to property name changes

**Mitigation**:

- Create transformer to map properties
- Test frontend thoroughly
- Update frontend if needed
- Document all changes

### 5.3 Performance

**Risk**: Slower performance with new system

**Mitigation**:

- Benchmark old vs new
- Optimize adapters
- Cache where possible
- Monitor performance

### 5.4 Testing Coverage

**Risk**: Missing edge cases

**Mitigation**:

- Comprehensive unit tests
- Integration tests
- Frontend tests
- Manual testing checklist

---

## 6. Success Criteria

1. ✅ All Admin Setup Guide steps work with FieldFactory
2. ✅ Status Page works with FieldFactory
3. ✅ Backward compatibility maintained
4. ✅ Frontend renders correctly
5. ✅ Form submission works
6. ✅ Validation works
7. ✅ Performance is acceptable
8. ✅ All tests pass
9. ✅ Documentation updated

---

## 7. Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Adapters | 1 week | Week 1 | Week 1 |
| Phase 2: Admin Setup Guide | 2 weeks | Week 2 | Week 3 |
| Phase 3: Status Page | 1 week | Week 4 | Week 4 |
| Phase 4: Data Alignment | 1 week | Week 5 | Week 5 |
| Phase 5: Testing | 1 week | Week 6 | Week 6 |
| Phase 6: Rollout | 2 weeks | Week 7 | Week 8 |

**Total Duration**: 8 weeks

---

## 8. Next Steps

1. **Review this plan** with the team
2. **Prioritize** which steps to migrate first
3. **Create feature branch** for migration
4. **Start with Phase 1** (Adapters)
5. **Iterate** based on findings

---

## 9. Appendix

### 9.1 Key Files to Modify

**Admin Setup Guide:**

- `includes/Admin/OnboardingSetup/Steps/AbstractStep.php`
- `includes/Admin/OnboardingSetup/Steps/BasicStep.php`
- `includes/Admin/OnboardingSetup/Steps/*.php` (other steps)
- `includes/REST/AdminSetupGuideController.php`
- `includes/Admin/OnboardingSetup/Components/ComponentFactory.php` (deprecate)

**Status Page:**

- `includes/Admin/Status/Status.php`
- `includes/Admin/Status/*.php` (status elements)
- Status REST controller (find location)

**FieldFactory:**

- `includes/FieldFactory/FieldFactory.php` (already exists)
- `includes/FieldFactory/Adapters/*.php` (new)
- `includes/FieldFactory/Helpers/ValueHydrator.php` (new)

### 9.2 Reference Documentation

- [Unified Field Factory Design](./UNIFIED_FIELD_FACTORY_DESIGN.md)
- [Field Factory Implementation Guide](./FIELD_FACTORY_IMPLEMENTATION_GUIDE.md)
- [Field Factory JSON Schema](./FIELD_FACTORY_JSON_SCHEMA.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-28  
**Author**: Migration Planning
