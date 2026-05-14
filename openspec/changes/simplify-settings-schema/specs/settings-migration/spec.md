## ADDED Requirements

### Requirement: MigrationMap covers all known Lite fields
The system SHALL provide a `MigrationMap` class with a static mapping of every Lite settings field from `(old_section, old_field_name)` to `(new_option_key, new_section, new_field_id)`, including transforms for renamed, merged, and split fields. The map SHALL be derived from the existing `SettingsMapper::$map` on `feat/admin-settings` (~130 entries).

#### Scenario: Simple move lookup
- **WHEN** `MigrationMap::resolve('admin_access', 'dokan_general')` is called
- **THEN** it returns `['option' => 'dokan_settings_vendor_vendor_onboarding', 'section' => 'vendor_onboarding_settings', 'field' => 'admin_access']`

#### Scenario: Renamed field lookup
- **WHEN** `MigrationMap::resolve('custom_store_url', 'dokan_general')` is called
- **THEN** it returns the mapping with `'field' => 'vendor_store_url'` pointing to `dokan_settings_general_marketplace`

#### Scenario: Merged field lookup
- **WHEN** `MigrationMap::resolve('admin_percentage', 'dokan_selling')` is called
- **THEN** it returns a mapping that includes `'transform' => 'merge_commission'` and `'merge_key' => 'admin_percentage'`

#### Scenario: Unknown field returns null
- **WHEN** `MigrationMap::resolve('unknown_field', 'dokan_general')` is called
- **THEN** it returns `null`

### Requirement: Section fallback maps old sections to default subpages
The system SHALL maintain a `SECTION_FALLBACK` array mapping each of the 7 old section IDs to a default new subpage option key. This fallback is used for third-party fields not in the migration map.

#### Scenario: Third-party field fallback
- **WHEN** a third-party field `my_custom_field` was registered in `dokan_selling` and is not in the migration map
- **THEN** `MigrationMap::get_section_fallback('dokan_selling')` returns `'dokan_settings_transaction_commission'`
- **AND** the field value is read from `dokan_settings_transaction_commission['_extensions']['my_custom_field']`

#### Scenario: All 7 old sections have fallbacks
- **WHEN** the SECTION_FALLBACK array is inspected
- **THEN** it contains entries for: `dokan_general`, `dokan_selling`, `dokan_withdraw`, `dokan_reverse_withdrawal`, `dokan_pages`, `dokan_appearance`, `dokan_privacy`

### Requirement: One-time data migration on plugin update
The system SHALL run a one-time migration when the plugin is updated. The migration SHALL read all old option keys, apply the migration map transforms, and write new per-subpage option keys. It SHALL be guarded by a `dokan_settings_schema_version` flag and use a transient lock to prevent concurrent execution.

#### Scenario: Successful migration
- **WHEN** the plugin updates and `dokan_settings_schema_version` is not `2.0`
- **THEN** the migrator reads `dokan_general`, `dokan_selling`, `dokan_withdraw`, `dokan_reverse_withdrawal`, `dokan_pages`, `dokan_appearance`, `dokan_privacy`
- **AND** writes per-subpage options with correctly mapped values
- **AND** sets `dokan_settings_schema_version` to `2.0`

#### Scenario: Migration is idempotent
- **WHEN** the migration runs and `dokan_settings_schema_version` is already `2.0`
- **THEN** no data is written and the migration exits immediately

#### Scenario: Merged fields are combined during migration
- **WHEN** old data has `dokan_selling['admin_percentage'] = '10'` and `dokan_selling['additional_fee'] = '5'`
- **THEN** the new option contains a combined `admin_commission` field with both values: `['admin_percentage' => '10', 'additional_fee' => '5']`

#### Scenario: Unknown fields migrate to _extensions namespace
- **WHEN** old `dokan_selling` contains a field `my_plugin_field` that is not in the migration map
- **THEN** the value is stored in `dokan_settings_transaction_commission['_extensions']['my_plugin_field']`

#### Scenario: Old option keys preserved after migration
- **WHEN** migration completes
- **THEN** old option keys (`dokan_general`, `dokan_selling`, etc.) are NOT deleted from the database

#### Scenario: Concurrent migration prevented
- **WHEN** two requests trigger migration simultaneously
- **THEN** only the first executes; the second detects the transient lock and skips

### Requirement: dokan_get_option() reads from new storage via 4-step resolution
The `dokan_get_option()` function SHALL be rewritten to read from the new storage format while maintaining its existing function signature `dokan_get_option($option, $section, $default)`. The resolution order SHALL be: (1) migration map lookup, (2) section fallback for third-party fields, (3) legacy fallback if migration hasn't run, (4) return default.

#### Scenario: Known field resolved via migration map
- **WHEN** `dokan_get_option('custom_store_url', 'dokan_general')` is called
- **THEN** the function reads from `get_option('dokan_settings_general_marketplace')['marketplace_settings']['vendor_store_url']`

#### Scenario: Third-party field resolved via section fallback
- **WHEN** `dokan_get_option('my_custom_field', 'dokan_selling')` is called and the field is not in the migration map
- **THEN** the function checks `get_option('dokan_settings_transaction_commission')['_extensions']['my_custom_field']`

#### Scenario: Pre-migration fallback
- **WHEN** `dokan_get_option('admin_access', 'dokan_general')` is called and `dokan_settings_schema_version` is not `2.0`
- **THEN** the function falls back to `get_option('dokan_general')['admin_access']`

#### Scenario: Default returned when not found anywhere
- **WHEN** a field is not found in migration map, section fallback, or legacy storage
- **THEN** the provided default value is returned

#### Scenario: Static caching within a request
- **WHEN** `dokan_get_option()` is called multiple times for fields in the same option key within one request
- **THEN** `get_option()` is called only once per unique option key; subsequent calls use cached values

### Requirement: Reverse transforms for merged fields
For fields that were merged during migration (e.g., `admin_percentage` + `additional_fee` → `admin_commission`), the `dokan_get_option()` shim SHALL apply a reverse transform to extract the individual old value from the merged new value.

#### Scenario: Read individual value from merged field
- **WHEN** `dokan_get_option('admin_percentage', 'dokan_selling')` is called
- **AND** new storage has `admin_commission: {'admin_percentage': '10', 'additional_fee': '5'}`
- **THEN** the function returns `'10'`

#### Scenario: Read other part of merged field
- **WHEN** `dokan_get_option('additional_fee', 'dokan_selling')` is called
- **AND** new storage has `admin_commission: {'admin_percentage': '10', 'additional_fee': '5'}`
- **THEN** the function returns `'5'`

### Requirement: dokan_admin_settings_rearrange_map removed
The `dokan_admin_settings_rearrange_map()` function SHALL be removed from `includes/functions.php`. Its logic is fully subsumed by the MigrationMap.

#### Scenario: Function no longer exists
- **WHEN** the codebase is searched for `dokan_admin_settings_rearrange_map`
- **THEN** no function definition is found (call sites have been removed or updated)
