## ADDED Requirements

### Requirement: Base SettingsElement properties map to standard array keys
Every settings element SHALL map its SettingsElement properties to these array keys: `id`, `type`, `title`, `description`, `icon`, `hook_key`, `dependency_key`, `doc_link`, `tooltip`, `dependencies`, `validations`. The `display` property defaults to true. The `value` and `children` properties SHALL NOT appear in the schema definition — `value` is populated at runtime, and `children` are flattened to separate elements with parent pointers.

#### Scenario: Page element conversion preserves all base properties
- **WHEN** converting a Page with id="general", title="General", priority=100, icon="Settings", storage_key="dokan_settings_general"
- **THEN** the output SHALL be `['id' => 'general', 'type' => 'page', 'title' => 'General', 'priority' => 100, 'icon' => 'Settings', 'storage_key' => 'dokan_settings_general']`

#### Scenario: Null/empty optional properties are omitted
- **WHEN** a SettingsElement has `description = ''`, `icon = ''`, `doc_link = null`
- **THEN** those properties SHALL be omitted from the output array

### Requirement: Parent-child tree flattens to parent pointer keys
The OOP `->add()` calls SHALL be converted to parent pointer keys. The key name MUST match the parent's type: `page_id`, `subpage_id`, `tab_id`, `section_id`, `subsection_id`, `field_group_id`.

#### Scenario: SubPage added to Page via fluent chain
- **WHEN** the OOP code has `$generalPage->add(ElementFactory::sub_page('marketplace')->...)`
- **THEN** the subpage's array SHALL include `'page_id' => 'general'`

#### Scenario: Field added to FieldGroup inside Section
- **WHEN** the OOP code has a FieldGroup `google_map_api_key` inside section `map_api_configuration` containing field `google_map_api_key`
- **THEN** the field's array SHALL include `'field_group_id' => 'google_map_api_key'`
- **AND** the FieldGroup's array SHALL include `'section_id' => 'map_api_configuration'`

#### Scenario: Section added to Tab (not directly to SubPage)
- **WHEN** the OOP code adds a section to a Tab element
- **THEN** the section's array SHALL include `'tab_id' => '<tab_id>'` (NOT `subpage_id`)

### Requirement: Field variant equals input_type from field_map
Every field element SHALL have `variant` equal to the `$input_type` string — the same key used in `Field::$field_map`.

#### Scenario: Switcher variant is "switch" not "switcher"
- **WHEN** converting a Switcher field instance
- **THEN** the output SHALL include `'variant' => 'switch'`

#### Scenario: RefreshSelectField variant preserves underscore format
- **WHEN** converting a RefreshSelectField instance
- **THEN** the output SHALL include `'variant' => 'refresh_select'`

### Requirement: Text-family properties map consistently across 20+ variants
All fields inheriting from Text SHALL support: `default`, `placeholder`, `readonly` (from `$is_readonly`), `disabled`, `size`, `helper_text`, `postfix`, `prefix`, `image_url`.

#### Scenario: image_url used for payment method icons
- **WHEN** converting a field like PayPal withdraw switch from TransactionPage that uses `set_image_url(plugin_dir_url(DOKAN_FILE) . 'assets/images/.../paypal.svg')`
- **THEN** the output SHALL include `'image_url' => '<full_url>'`

#### Scenario: validation_func preserved as callback reference
- **WHEN** converting a Text field like `vendor_store_url` that has `set_validation_func(function($value) {...})`
- **THEN** the output SHALL include `'validation_func' => <callable>` alongside `'validations' => [...]`

### Requirement: Number properties use min_value/max_value keys
Number's `$minimum` and `$maximum` SHALL map to `min_value` and `max_value`. `$step` maps to `step`.

#### Scenario: Number field with range
- **WHEN** converting `monthly_billing_day` (Number) with minimum=1, maximum=28
- **THEN** the output SHALL include `'min_value' => 1, 'max_value' => 28`

### Requirement: Options format preserves value+title structure
Fields with `$options` SHALL use the format `[['value' => string, 'title' => string], ...]`. This applies to: checkbox, select, refresh_select, radio, radio_box, radio_capsule, customize_radio, select_color_picker.

#### Scenario: Radio capsule options from TransactionPage
- **WHEN** converting `commission_type` (radio_capsule) with options added via `add_option('Fixed', 'fixed')` and `add_option('Category Based', 'category_based')`
- **THEN** the output SHALL include `'options' => [['title' => 'Fixed', 'value' => 'fixed'], ['title' => 'Category Based', 'value' => 'category_based']]`

### Requirement: Switcher enable/disable states flatten with label+value
Switcher's `set_enable_state(label, value)` and `set_disable_state(label, value)` SHALL flatten to `enable_state` and `disable_state` keys, each containing `{label: string, value: string}`.

#### Scenario: ShipmentPage provider switch with custom states
- **WHEN** converting a provider switch that uses `set_enable_state('Enabled', 'sp-australia-post')` and `set_disable_state('Disabled', '')`
- **THEN** the output SHALL include `'enable_state' => ['label' => 'Enabled', 'value' => 'sp-australia-post'], 'disable_state' => ['label' => 'Disabled', 'value' => '']`

#### Scenario: Simple on/off switch without custom states
- **WHEN** converting a switch field like `admin_access` with default states
- **THEN** the output SHALL include `'enable_state' => ['label' => 'on', 'value' => 'on'], 'disable_state' => ['label' => 'off', 'value' => 'off']`

### Requirement: Dependency paths use dot-notation matching SettingsMapper format
Dependencies added via `add_dependency(path, value, to_self, attribute, effect, comparison)` SHALL map to the `dependencies` array key. The `path` parameter uses the same dot-notation as `SettingsMapper` new-key format (minus the page prefix): `SubPageId.SectionId.FieldId`.

#### Scenario: Conditional field visibility from TransactionPage
- **WHEN** converting `admin_commission` (combine_input) with `add_dependency('commission.commission.commission_type', 'fixed', true, 'display', 'show', '===')`
- **THEN** the output SHALL include `'dependencies' => [['key' => 'commission.commission.commission_type', 'value' => 'fixed', 'to_self' => true, 'attribute' => 'display', 'effect' => 'show', 'comparison' => '===']]`

### Requirement: Complex fields preserve internal structure in "fields" key
CombineInput and CategoryBasedCommission fields with internal sub-fields SHALL preserve those in a `fields` array key. Repeater fields' children (added via `->add()`) SHALL be preserved in an `items` key.

#### Scenario: CombineInput admin_commission from TransactionPage
- **WHEN** converting `admin_commission` (combine_input) which has internal percent_fee and fixed_fee sub-fields
- **THEN** the output SHALL include a `fields` key containing the nested field definitions

#### Scenario: Repeater shipment_status_list from ShipmentPage
- **WHEN** converting `shipment_status_list` (repeater) which has children fields added via `->add()`
- **THEN** the output SHALL include `'items' => [<field_definitions>]` containing the child field schemas

### Requirement: SettingsMapper key-path format determines dependency_key
The `dependency_key` for each field SHALL follow the format `SubPageId.SectionId.FieldId` (3+ segments, including FieldGroup if present). This matches the `SettingsMapper` new-key format with the page prefix removed.

#### Scenario: Field dependency_key matches mapper path
- **WHEN** the SettingsMapper has `'dokan_general.custom_store_url' => 'general.marketplace.marketplace_settings.vendor_store_url'`
- **THEN** the field `vendor_store_url` SHALL have `dependency_key = 'marketplace.marketplace_settings.vendor_store_url'`
- **AND** prepending the page id gives the full mapper path: `general.marketplace.marketplace_settings.vendor_store_url`

#### Scenario: FieldGroup adds segment to dependency_key
- **WHEN** a field `facebook_app_id` is inside FieldGroup `facebook_api_group` inside section `storefont_social_onboarding_section`
- **THEN** the dependency_key SHALL be `storefont_social_onboarding.storefont_social_onboarding_section.facebook_api_group.facebook_app_id`

### Requirement: Storage key preserved per page
Each page's `$storage_key` property SHALL map to a `storage_key` array key in the page element. The storage format is one `wp_options` row per page containing the full nested data structure.

#### Scenario: TransactionPage storage
- **WHEN** converting TransactionPage with `storage_key = 'dokan_settings_transaction'`
- **THEN** the page element SHALL include `'storage_key' => 'dokan_settings_transaction'`
- **AND** the storage structure SHALL be `['commission' => ['commission' => [...]], 'fees' => [...], 'withdraw_charge' => [...]]`
