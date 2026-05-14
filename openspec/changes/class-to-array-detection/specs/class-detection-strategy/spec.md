## ADDED Requirements

### Requirement: Field type detection via Field::$field_map registry
The system SHALL use `Field::$field_map` (includes/Admin/Settings/Elements/Field.php lines 69-101) as the canonical source for detecting all 31 field types. Additionally, it SHALL invoke the `dokan_admin_settings_field_map` filter (line 158) and `dokan_admin_settings_field_mapper` filter (line 176) to capture Pro-registered types.

#### Scenario: All 31 base field types are detected
- **WHEN** the detection process reads `Field::$field_map` from the current branch
- **THEN** exactly 31 field type entries SHALL be identified: text, number, checkbox, select, refresh_select, radio, tel, password, radio_box, switch, multicheck, currency, combine_input, category_based_commission, radio_capsule, info, double_input, base_field_label, customize_radio, html, notice, repeater, rich_text, show_hide, select_color_picker, copy_field, file_upload, vendor_info_preview, single_product_preview, textarea, withdraw_schedule

#### Scenario: Pro-registered field types are captured via filter
- **WHEN** Pro code adds types via `add_filter('dokan_admin_settings_field_map', ...)`
- **THEN** those additional types SHALL be included in the detection output alongside the base 31 types

### Requirement: Structural element detection (6 types + AbstractPage)
The system SHALL detect 6 structural element types plus AbstractPage by scanning classes that extend `SettingsElement` and are NOT in `Field::$field_map`. Each structural type maps to a fixed `type` string and has a deterministic parent pointer key.

#### Scenario: All structural types with parent pointers are identified
- **WHEN** the detection process scans `includes/Admin/Settings/Elements/`
- **THEN** the following types SHALL be identified:
  - AbstractPage → `type: 'page'`, no parent pointer (root)
  - SubPage → `type: 'subpage'`, parent pointer: `page_id`
  - Tab → `type: 'tab'`, parent pointer: `subpage_id`
  - Section → `type: 'section'`, parent pointer: `subpage_id` OR `tab_id`
  - SubSection → `type: 'subsection'`, parent pointer: `section_id`
  - FieldGroup → `type: 'fieldgroup'`, parent pointer: `section_id` OR `subsection_id`

### Requirement: Page class detection with storage key mapping
The system SHALL detect all page classes extending `AbstractPage` and extract their `$id`, `$priority`, and `$storage_key` properties. Each page's `describe_settings()` method defines its complete element tree.

#### Scenario: All Lite page classes detected with storage keys
- **WHEN** the detection process scans `includes/Admin/Settings/Pages/`
- **THEN** 8 page classes SHALL be identified:
  - GeneralPage (id: general, storage_key: dokan_settings_general)
  - TransactionPage (id: transaction, storage_key: dokan_settings_transaction)
  - VendorPage (id: vendor)
  - AppearancePage (id: appearance)
  - CompliancePage (id: compliance)
  - AIAssistPage (id: ai_assist)
  - ModerationPage (id: moderation)
  - ProductPage (id: product)

#### Scenario: Pro page classes detected
- **WHEN** the detection process scans Pro's `includes/Admin/Settings/Pages/`
- **THEN** additional page classes SHALL be identified: ShipmentPage (id: shipment, priority: 800), EmailVerificationPage (id: verification, priority: 500)

### Requirement: Hybrid page detection (ElementTransformer usage)
The system SHALL detect pages that use `ElementTransformer` to convert legacy field definitions, distinguishing them from pages that use pure `ElementFactory` composition. Hybrid pages require extracting fields from BOTH legacy `get_settings_fields()` output AND the ElementFactory overrides.

#### Scenario: GeneralPage detected as hybrid
- **WHEN** the detection process analyzes GeneralPage's `describe_settings()` method
- **THEN** it SHALL be classified as a hybrid page (uses `new ElementTransformer()`)
- **AND** detection SHALL extract fields from both the legacy transformer input AND the ElementFactory tree

#### Scenario: TransactionPage detected as pure ElementFactory
- **WHEN** the detection process analyzes TransactionPage's `describe_settings()` method
- **THEN** it SHALL be classified as a pure ElementFactory page (no ElementTransformer usage)
- **AND** detection SHALL extract fields only from the ElementFactory tree

### Requirement: Inheritance chain tracking for complete property collection
The system SHALL track the full inheritance chain for each field class, walking from the concrete class up to `Field` → `SettingsElement`. All inherited properties MUST be collected — child class properties override parent class properties.

#### Scenario: Select field collects properties from Checkbox and Text
- **WHEN** detecting the `select` field type
- **THEN** the inheritance chain SHALL be: Select → Checkbox → Text → Field → SettingsElement
- **AND** properties from ALL classes SHALL be marked as applicable: `options` (Checkbox), `placeholder`/`default`/`size` (Text), `variant` (Field), `id`/`title`/`dependencies` (SettingsElement)

#### Scenario: Switcher collects enable/disable states plus options and text properties
- **WHEN** detecting the `switch` (Switcher) field type
- **THEN** the chain SHALL be: Switcher → Radio → Checkbox → Text → Field → SettingsElement
- **AND** `enable_state`/`disable_state` (Switcher), `options` (Checkbox), `placeholder` (Text) SHALL all be applicable

### Requirement: Pro custom field types detected via dokan_admin_settings_field_map filter
The system SHALL detect 4 Pro-registered custom field types by scanning Pro's codebase for `add_filter('dokan_admin_settings_field_map', ...)` calls. Each custom type has a dedicated React component not available in plugin-ui.

#### Scenario: All 4 Pro custom field types detected
- **WHEN** the detection process scans Pro's codebase for `dokan_admin_settings_field_map` registrations
- **THEN** 4 custom field types SHALL be identified:
  - `menu_manager` → MenuManagerField (MenuManager module, `includes/MenuManager/Admin/Settings.php`)
  - `verification_methods` → VerificationMethodsField (vendor-verification, `modules/vendor-verification/includes/Admin/Hooks.php`)
  - `delivery_days` → DeliveryDaysField (delivery-time, `modules/delivery-time/includes/Settings.php`)
  - `color_customizer` → ColorCustomizerField (color-scheme-customizer, `modules/color-scheme-customizer/includes/Admin/Settings/SettingsManager.php`)

### Requirement: Pro settings element classes detected with their _children hooks
The system SHALL detect Pro's 4 settings element classes (GeneralSettings, SocialSettings, VendorSettings, WithdrawSettings) and catalog which `dokan_settings_*_children` hooks each uses to inject fields into Lite pages.

#### Scenario: Pro element classes and their injection targets identified
- **WHEN** the detection process scans Pro's `includes/Admin/Settings/Elements/`
- **THEN** 4 settings element classes SHALL be identified with their hook targets:
  - GeneralSettings → injects into `general.marketplace.marketplace_settings`
  - SocialSettings → injects into `appearance` page
  - VendorSettings → injects into `vendor.vendor_onboarding` and `vendor.vendor_capabilities`
  - WithdrawSettings → injects into `transaction.withdraw_charge.section_withdraw_charge`

### Requirement: Pro modules with settings hooks detected
The system SHALL detect all Pro modules that register settings via `dokan_settings_*_children` hooks, `dokan_settings_sections`, or `dokan_settings_fields` filters.

#### Scenario: All 7 settings modules identified
- **WHEN** the detection process scans Pro's `modules/` directory
- **THEN** 7 modules with settings hooks SHALL be identified: delivery-time, vendor-verification, color-scheme-customizer, germanized, printful, product-adv, request-for-quotation
- **AND** each module's injection target page SHALL be documented (e.g., delivery-time → shipment page, germanized → compliance page)

### Requirement: Pro page registration via dokan_pro_admin_settings_pages filter
The system SHALL detect that Pro uses `dokan_pro_admin_settings_pages` filter (in `includes/Admin/Settings/AdminSettings.php`) to register page classes, separate from Lite's `dokan_admin_settings_pages` filter.

#### Scenario: Both page registration filters documented
- **WHEN** the detection process scans for page registration
- **THEN** two registration paths SHALL be identified:
  - Lite: `dokan_admin_settings_pages` filter
  - Pro: `dokan_pro_admin_settings_pages` filter (in `AdminSettings::load_admin_pages()`)

### Requirement: SettingsMapper paths validate against element tree
The system SHALL verify that every new-key path in `SettingsMapper::$map` (200+ entries) resolves to a valid element in the detected element tree. The path format `PageId.SubPageId.SectionId.FieldId` (with optional FieldGroup segments) MUST match the element hierarchy.

#### Scenario: Commission field path resolves correctly
- **WHEN** the mapper contains `'dokan_selling.commission_type' => 'transaction.commission.commission.commission_type'`
- **THEN** the element tree SHALL contain: page `transaction` → subpage `commission` → section `commission` → field `commission_type`

#### Scenario: FieldGroup path resolves with extra segment
- **WHEN** the mapper contains a 5-segment path like `'dokan_verification.fb_app_id' => 'appearance.storefont_social_onboarding.storefont_social_onboarding_section.facebook_api_group.facebook_app_id'`
- **THEN** the element tree SHALL contain a FieldGroup `facebook_api_group` inside section `storefont_social_onboarding_section` containing field `facebook_app_id`

### Requirement: Completeness verification after conversion
After conversion, the system SHALL verify: (1) every `Field::$field_map` variant has at least one element, (2) every page class is fully converted, (3) every `SettingsMapper` new-key resolves to a valid element, (4) no dangling parent pointers, (5) every `add_dependency()` path resolves to a real field.

#### Scenario: Missing field type flagged
- **WHEN** a variant from `Field::$field_map` has no corresponding element in the output
- **THEN** a completeness error SHALL be reported

#### Scenario: SettingsMapper path without matching element flagged
- **WHEN** a new-key from `SettingsMapper::$map` does not resolve to any element
- **THEN** a mapper integrity error SHALL be reported

#### Scenario: Dependency path resolution verified
- **WHEN** a field uses `add_dependency('commission.commission.commission_type', 'fixed', ...)`
- **THEN** the path `commission.commission.commission_type` SHALL resolve to an existing field element
