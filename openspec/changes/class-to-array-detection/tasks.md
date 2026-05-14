## 1. Extract Lite Field Type Registry

- [x] 1.1 Read `Field::$field_map` (includes/Admin/Settings/Elements/Field.php lines 69-101) — document all 31 entries with variant string, PHP class, file path, and inheritance chain
- [x] 1.2 Read each of the 31 Lite field class files — extract declared properties (not inherited) with their types and defaults

## 2. Extract Pro Custom Field Types & Extensions

- [x] 2.1 Read Pro's 4 custom field type classes and document their properties:
  - `MenuManagerField` (`includes/MenuManager/Admin/Settings/Elements/Fields/`)
  - `VerificationMethodsField` (`modules/vendor-verification/includes/Admin/Settings/Elements/Fields/`)
  - `DeliveryDaysField` (`modules/delivery-time/includes/Admin/Settings/Elements/Fields/`)
  - `ColorCustomizerField` (`modules/color-scheme-customizer/includes/Admin/Settings/Elements/Fields/`)
- [x] 2.2 Document how each custom type is registered via `dokan_admin_settings_field_map` — file path, line number, registration code
- [x] 2.3 Read Pro's 4 settings element classes (GeneralSettings, SocialSettings, VendorSettings, WithdrawSettings in `includes/Admin/Settings/Elements/`) — document which `dokan_settings_*_children` hooks each uses and what fields/subpages they inject
- [x] 2.4 Catalog all 20+ `dokan_settings_*_children` hooks used in Pro — map each hook name to the Lite element tree position it injects into (e.g., `dokan_settings_general_marketplace_marketplace_settings_children` → General page > marketplace subpage > marketplace_settings section)
- [x] 2.5 Read Pro's 7 modules with settings (delivery-time, vendor-verification, color-scheme-customizer, germanized, printful, product-adv, request-for-quotation) — document which hooks each module uses and what fields it adds
- [x] 2.6 Document Pro's page registration via `dokan_pro_admin_settings_pages` filter in `AdminSettings.php`

## 3. Extract Structural Elements & Page Classes

- [x] 3.1 Document the 6 structural classes (SubPage, Section, Tab, SubSection, FieldGroup + AbstractPage) with `type` strings, parent pointer keys, and unique properties
- [x] 3.2 Read all 8 Lite page classes' `describe_settings()` methods — classify each as Hybrid (uses ElementTransformer) or Pure ElementFactory
- [x] 3.3 Read Pro's 2 page classes (ShipmentPage, EmailVerificationPage) — extract their element trees
- [x] 3.4 Extract `$id`, `$priority`, `$storage_key` from each page class (8 Lite + 2 Pro)

## 4. Build Complete Property-to-Array Mapping Table

- [x] 4.1 Extract SettingsElement base properties — map to array keys: id, type, title, description, icon, tooltip, hook_key, dependency_key, doc_link, dependencies, validations
- [x] 4.2 Extract Text class properties — map `$default`, `$placeholder`, `$is_readonly` → `readonly`, `$disabled`, `$size`, `$helper_text`, `$postfix`, `$prefix`, `$image_url`
- [x] 4.3 Extract Number properties — map `$minimum` → `min_value`, `$maximum` → `max_value`, `$step`
- [x] 4.4 Extract Checkbox/options-based properties — document `$options` format `[{value, title}]` and `add_option()` method
- [x] 4.5 Extract Switcher properties — document `set_enable_state(label, value)` / `set_disable_state(label, value)` flattening to `enable_state` / `disable_state` with `{label, value}` structure
- [x] 4.6 Extract MultiCheck, Repeater, FileUpload, Currency, InfoField, NoticeField properties
- [x] 4.7 Extract CombineInput / CategoryBasedCommission internal `$fields` / `$items` structure
- [x] 4.8 Extract Pro custom field properties — document MenuManagerField, VerificationMethodsField, DeliveryDaysField, ColorCustomizerField specific properties and how they differ from standard variants
- [x] 4.9 Document `add_dependency(path, value, to_self, attribute, effect, comparison)` → `dependencies` array mapping
- [x] 4.10 Document `add_validation()` / `set_validation_func()` → `validations` / `validation_func` mapping

## 5. Map SettingsMapper Paths to Element Tree (Lite-only)

- [x] 5.1 Read SettingsMapper::$map (200+ entries) — group by page ID to understand the full path structure per page
- [x] 5.2 For each page, verify that mapper paths match the element tree structure from `describe_settings()` — flag any mismatches
- [x] 5.3 Document how `dependency_key` (SubPageId.SectionId.FieldId) relates to mapper new-key (PageId.SubPageId.SectionId.FieldId)
- [x] 5.4 Identify mapper entries that traverse FieldGroups (5+ segment paths) — verify FieldGroup elements exist in the tree
- [x] 5.5 Confirm that Pro does NOT use SettingsMapper — document this as Lite-only infrastructure

## 6. Analyze SettingsMapperCallbacks Value Transforms (Lite-only)

- [x] 6.1 Read SettingsMapperCallbacks.php — catalog all 38+ transform handlers with their trigger conditions
- [x] 6.2 Classify transforms by type: inversions (on↔off), enum changes, array restructuring, complex post-processing
- [x] 6.3 Document which transforms are field-ID-dependent (will break if IDs change during conversion) vs generic

## 7. Convert Page Element Trees to Flat Arrays

- [x] 7.1 Convert GeneralPage (HYBRID) — extract fields from both ElementTransformer legacy source AND ElementFactory tree, merge, flatten
- [x] 7.2 Convert TransactionPage (Pure ElementFactory) — flatten commission, fees, withdraw_charge, reverse_withdrawal subtrees
- [x] 7.3 Convert VendorPage — flatten onboarding, capabilities, subscription, etc.
- [x] 7.4 Convert AppearancePage — flatten store, dashboard colors, social onboarding
- [x] 7.5 Convert CompliancePage — flatten privacy, EU compliance
- [x] 7.6 Convert AIAssistPage, ModerationPage, ProductPage
- [x] 7.7 Convert Pro: ShipmentPage — flatten shipment settings, providers (15+), status repeater
- [x] 7.8 Convert Pro: EmailVerificationPage — flatten verification, notices
- [x] 7.9 Convert Pro element classes' `_children` hook injections — for each of the 4 Pro element classes and 7 modules, determine the flat array elements they would produce and their correct parent pointers

## 8. Validate Conversion Completeness

- [x] 8.1 Verify all 35 field type variants (31 Lite + 4 Pro) have at least one element in the output
- [x] 8.2 Verify all 10 page classes (8 Lite + 2 Pro) are fully converted — element counts match OOP originals
- [x] 8.3 Verify every `SettingsMapper::$map` new-key resolves to a valid element ID path
- [x] 8.4 Verify every `add_dependency()` path resolves to a real field element
- [x] 8.5 Verify no dangling parent pointers — every `*_id` references an existing element
- [x] 8.6 Cross-check with `SettingsMapperCallbacks` — confirm no field IDs changed that would break value transforms
- [x] 8.7 Verify Pro `_children` hook injections are fully accounted for — every field that Pro injects into Lite pages has a corresponding flat array element with correct parent pointer
- [x] 8.8 Verify Pro custom field types have a migration path — document whether each needs a plugin-ui custom renderer or can map to an existing variant
