## ADDED Requirements

### Requirement: Legacy UI read adapter reconstructs old section format
The system SHALL provide a `LegacyAdapter` class that reads from the new storage format and reconstructs the old-style section arrays (`dokan_general`, `dokan_selling`, etc.) for consumption by the legacy Vue settings UI via AJAX.

#### Scenario: Reconstruct old section for AJAX get
- **WHEN** the legacy UI requests settings via `wp_ajax_dokan_get_setting_values`
- **THEN** the adapter reads from new option keys, applies reverse transforms (un-merge, un-split, un-rename), and returns data structured as `{ dokan_general: { custom_store_url: 'store', admin_access: 'on', ... }, dokan_selling: { ... } }`

#### Scenario: Renamed fields appear under old names
- **WHEN** the adapter reconstructs `dokan_general`
- **THEN** the field `vendor_store_url` from new storage appears as `custom_store_url` in the old format

#### Scenario: Merged fields are split back
- **WHEN** the adapter reconstructs `dokan_selling`
- **AND** new storage has `admin_commission: { admin_percentage: '10', additional_fee: '5' }`
- **THEN** the old format contains separate `admin_percentage: '10'` and `additional_fee: '5'` fields

### Requirement: Legacy UI write adapter decomposes old format to new storage
The system SHALL intercept saves from the legacy Vue UI and decompose the old-format payload into new-format per-subpage option writes.

#### Scenario: Save from legacy UI writes to new storage
- **WHEN** the legacy UI sends a save via `wp_ajax_dokan_save_settings` with payload `{ section: 'dokan_general', settingsData: { custom_store_url: 'mystore', admin_access: 'on' } }`
- **THEN** the adapter maps `custom_store_url` → `vendor_store_url` and writes to `dokan_settings_general_marketplace['marketplace_settings']['vendor_store_url'] = 'mystore'`
- **AND** maps `admin_access` and writes to the correct new option key

#### Scenario: Merged fields reconstructed on save
- **WHEN** the legacy UI saves `dokan_selling` with `admin_percentage: '15'` and `additional_fee: '3'`
- **THEN** the adapter combines them into `admin_commission: { admin_percentage: '15', additional_fee: '3' }` and writes to the new option key

#### Scenario: dokan_before_saving_settings hook still fires
- **WHEN** the legacy UI triggers a save
- **THEN** the `dokan_before_saving_settings` and `dokan_after_saving_settings` hooks fire with appropriate parameters

### Requirement: Legacy field definitions served from new schema
The system SHALL continue to serve old-style field definitions (sections and fields arrays) to the legacy Vue UI via the existing `dokan_admin_localize_script` hook. The field definitions SHALL be generated from the new schema by reverse-converting new nodes to old format.

#### Scenario: Old field types in legacy output
- **WHEN** the legacy UI requests field definitions
- **THEN** new `switch` variants appear as `switcher` type, `customize_radio` as `radio_image`, `combine_input` as `commission_fixed`, and `dependencies` are converted back to `show_if` conditions

#### Scenario: All original sections present
- **WHEN** the legacy Vue UI loads
- **THEN** it receives all 7 original sections (`dokan_general`, `dokan_selling`, `dokan_withdraw`, `dokan_reverse_withdrawal`, `dokan_pages`, `dokan_appearance`, `dokan_privacy`) with their fields

### Requirement: Extension adapter converts old filter results to new schema
The system SHALL fire `dokan_settings_fields` and `dokan_settings_sections` filters during schema build. Fields added by third-party extensions (not present in Lite/Pro known fields) SHALL be converted to new schema nodes and injected into the appropriate subpage under an `_extensions` section.

#### Scenario: Third-party field appears in new UI
- **WHEN** a third-party plugin adds `my_field` to `dokan_selling` via `dokan_settings_fields` filter
- **THEN** the field appears in the `transaction` page under the commission subpage in an `_extensions` section
- **AND** the field node has its old type converted to the new variant

#### Scenario: Third-party section becomes a subpage
- **WHEN** a third-party plugin adds a new section `dokan_my_module` via `dokan_settings_sections` filter
- **THEN** it appears as a new subpage under a designated page
- **AND** all its fields are converted to new schema format

#### Scenario: Third-party field values persisted correctly
- **WHEN** a third-party field `my_field` in `dokan_selling` is saved via the new UI
- **THEN** the value is stored in `dokan_settings_transaction_commission['_extensions']['my_field']`
- **AND** `dokan_get_option('my_field', 'dokan_selling')` returns the saved value

### Requirement: Old field type to new variant mapping
The system SHALL provide a `FieldTypeMapper` that converts old field type strings to new variant strings and transforms field properties accordingly.

#### Scenario: Switcher to switch conversion
- **WHEN** an old field definition has `type: 'switcher'` with `default: 'on'`
- **THEN** the mapper produces `variant: 'switch'` with `enable_state: { value: 'on', title: 'Enabled' }` and `disable_state: { value: 'off', title: 'Disabled' }`

#### Scenario: show_if to dependencies conversion
- **WHEN** an old field has `show_if: { commission_type: { equal: 'fixed' } }`
- **THEN** the mapper produces `dependencies: [{ key: '{resolved_dependency_key}', value: 'fixed', comparison: '==' }]`

#### Scenario: radio_image to customize_radio conversion
- **WHEN** an old field has `type: 'radio_image'` with options mapping values to image URLs
- **THEN** the mapper produces `variant: 'customize_radio'` with options containing `{ value, label, image }` objects

#### Scenario: commission_fixed to combine_input conversion
- **WHEN** an old field has `type: 'commission_fixed'` with nested `fields` for percent_fee and fixed_fee
- **THEN** the mapper produces `variant: 'combine_input'` with appropriate value structure

#### Scenario: All known old types have mappings
- **WHEN** the FieldTypeMapper is inspected
- **THEN** it handles: `switcher`→`switch`, `radio_image`→`customize_radio`, `commission_fixed`→`combine_input`, `wpeditor`→`textarea`, `sub_section`→(section element), `text`→`text`, `number`→`number`, `select`→`select`, `radio`→`radio_capsule`, `file`→`file`, `category_based_commission`→`category_based_commission`
