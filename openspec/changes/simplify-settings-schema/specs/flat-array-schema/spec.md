## ADDED Requirements

### Requirement: Settings defined as plain PHP arrays via a single filter
All admin settings SHALL be collected through one WordPress filter: `dokan_get_admin_settings_schema`. Lite defines its base settings array and passes it through the filter. Pro and third-party extensions append their elements to the same array. No classes, interfaces, abstract bases, or factory patterns SHALL be used to define settings items.

#### Scenario: Lite defines base schema
- **WHEN** the settings schema is built
- **THEN** Lite creates a flat array of all its settings elements and passes it through `apply_filters('dokan_get_admin_settings_schema', $elements)`
- **AND** every element is a plain associative array with at minimum `id` and `type` keys

#### Scenario: Pro extends via the same filter
- **WHEN** Pro hooks into `add_filter('dokan_get_admin_settings_schema', $callback)`
- **THEN** the callback receives the Lite elements array and appends Pro's elements (pages, subpages, sections, fields) to it
- **AND** the returned array contains both Lite and Pro elements

#### Scenario: Adding a new field requires only array knowledge
- **WHEN** a developer adds a new text field
- **THEN** they append `['id' => 'my_field', 'type' => 'field', 'variant' => 'text', 'section_id' => 'my_section', 'label' => 'My Field']` to the array in the filter callback
- **AND** they do NOT need to create a class, extend an abstract, or use a factory

### Requirement: New OOP settings classes from PR #3003 removed
The entire `includes/Admin/Settings/` directory introduced by PR #3003 SHALL be deleted. This includes all classes under `Elements/` (35 field-type classes, ElementFactory, structural classes), all classes under `Pages/` (AbstractPage, PageInterface, all page classes), transformers (ElementTransformer, LegacyTransformer, TransformerInterface), mapper (SettingsMapper, SettingsMapperCallbacks), and `Settings.php` orchestrator. Pre-existing files on `develop` SHALL NOT be deleted: `includes/Admin/Settings.php`, `includes/Abstracts/SettingsElement.php`, and `includes/Admin/OnboardingSetup/`.

#### Scenario: No new element classes exist
- **WHEN** the codebase is searched for files matching `includes/Admin/Settings/Elements/**/*.php`
- **THEN** no files are found

#### Scenario: No new page classes exist
- **WHEN** the codebase is searched for files matching `includes/Admin/Settings/Pages/*.php`
- **THEN** no page class files are found

#### Scenario: Pre-existing files preserved
- **WHEN** the codebase is inspected
- **THEN** `includes/Admin/Settings.php` (the old god class) still exists and is functional
- **AND** `includes/Abstracts/SettingsElement.php` still exists

### Requirement: Custom frontend field components removed
All custom settings field renderer files under `src/admin/dashboard/pages/settings/Elements/` SHALL be deleted. This includes DokanNumber, DokanSelect, DokanSwitcher, CustomizeRadio/, FieldParser, FieldGroup, Section, Tab, Menu, and all other component files (~61 total).

#### Scenario: No custom field component files exist
- **WHEN** the codebase is searched for files under `src/admin/dashboard/pages/settings/Elements/`
- **THEN** no files are found

### Requirement: Flat array format matches plugin-ui SettingsElement type
Each element in the schema array SHALL match the `SettingsElement` type from `@wedevs/plugin-ui`. Structural elements use `type` values: `page`, `subpage`, `tab`, `section`, `subsection`, `fieldgroup`. Field elements use `type: 'field'` with a `variant` property. Parent pointers (`page_id`, `subpage_id`, `tab_id`, `section_id`, `subsection_id`, `field_group_id`) link elements to their parents. The frontend builds the tree from the flat array.

#### Scenario: Page element structure
- **WHEN** a page element is defined
- **THEN** it has at minimum `id`, `type: 'page'`, and `label`

#### Scenario: Field element structure
- **WHEN** a field element is defined
- **THEN** it has `id`, `type: 'field'`, `variant` (e.g., `text`, `switch`, `select`), at least one parent pointer (e.g., `section_id`), and optionally `label`, `description`, `default`, `dependency_key`

#### Scenario: Parent pointer references valid element
- **WHEN** a field has `section_id: 'marketplace_settings'`
- **THEN** an element with `id: 'marketplace_settings'` and `type: 'section'` exists in the array

### Requirement: Registry fires hook_key filters for granular extension
After collecting elements via the main filter, the registry SHALL iterate structural nodes (pages, subpages, sections) that have a `hook_key` property. For each, it SHALL fire `apply_filters($hook_key, $children, $node)` where `$children` are the elements whose parent pointer references that node. Extensions can add, modify, or remove children via these filters.

#### Scenario: hook_key filter adds fields to a section
- **WHEN** a section element has `hook_key: 'dokan_settings_transaction_commission'`
- **AND** an extension adds `add_filter('dokan_settings_transaction_commission', $callback)` that appends 3 field elements
- **THEN** those 3 elements appear in the final schema under that section

#### Scenario: Auto-generated hook_key
- **WHEN** a structural element omits `hook_key`
- **THEN** the registry auto-generates one in the format `dokan_settings_{page}_{subpage}` (or similar convention)

### Requirement: Field values populated from per-subpage options
The registry SHALL populate each field's `value` from stored `wp_options` using per-subpage option keys. The `dependency_key` path determines the lookup: first segment = subpage (maps to option key `dokan_settings_{page}_{subpage}`), remaining segments = nested path. Missing values SHALL fall back to the field's `default`.

#### Scenario: Stored value populated
- **WHEN** `get_option('dokan_settings_general_marketplace')` returns `['marketplace_settings' => ['vendor_store_url' => 'shop']]`
- **THEN** the field with `dependency_key: 'marketplace.marketplace_settings.vendor_store_url'` has `value: 'shop'`

#### Scenario: Default used when no stored value
- **WHEN** no option value exists for a field
- **THEN** the field's `value` equals its `default` property

### Requirement: SchemaValidator validates the flat array
A `SchemaValidator` class SHALL validate the schema array with: (1) required properties per element type, (2) parent reference existence, (3) no duplicate IDs, (4) known variant validation (warning for unknown), (5) dependency_key format check. Validation SHALL return structured results with errors and warnings.

#### Scenario: Missing required property
- **WHEN** a field element lacks `variant`
- **THEN** validation returns an error identifying the field ID and the missing property

#### Scenario: Orphan parent reference
- **WHEN** a field references `section_id: 'nonexistent'`
- **THEN** validation returns an error identifying the broken reference

#### Scenario: Duplicate ID
- **WHEN** two elements share the same `id`
- **THEN** validation returns a duplicate ID error listing both elements

#### Scenario: Valid schema passes
- **WHEN** all elements have correct types, valid references, unique IDs, and known variants
- **THEN** validation returns `is_valid: true` with no errors

#### Scenario: Validation disabled in production
- **WHEN** the `DOKAN_DISABLE_SCHEMA_VALIDATION` constant is defined and true
- **THEN** validation is skipped entirely and returns an always-valid result

### Requirement: REST endpoint serves flat array and handles saves
The `AdminSettingsController` SHALL serve the flat schema array via `GET /dokan/v1/admin/settings` and handle saves via `PUT /dokan/v1/admin/settings/{scope_id}` by parsing `flatValues`, applying sanitization, and writing to per-subpage option keys.

#### Scenario: GET returns flat array with values
- **WHEN** an admin fetches `GET /dokan/v1/admin/settings`
- **THEN** the response is a flat JSON array of settings elements with `value` populated on each field

#### Scenario: PUT saves and sanitizes
- **WHEN** an admin sends `PUT /dokan/v1/admin/settings/marketplace` with flat key-value pairs
- **THEN** values are sanitized per field variant (text→sanitize_text_field, number→absint, switch→on/off) and written to `dokan_settings_general_marketplace`
- **AND** `dokan_before_saving_settings` and `dokan_after_saving_settings` hooks fire

#### Scenario: Custom sanitize_callback used
- **WHEN** a field has `sanitize_callback: 'wc_format_decimal'`
- **THEN** that callback is used instead of the variant-default sanitizer

#### Scenario: Validation errors returned on save
- **WHEN** a field value fails its `validations` rules
- **THEN** the response is HTTP 400 with structured error details listing the failing field and rule

#### Scenario: Permission check
- **WHEN** a non-admin user attempts GET or PUT
- **THEN** the response is HTTP 403 Forbidden
