## Why

The `enhance/map-all-the-settings-storage-key-based-on-settings-mapper` branch defines admin settings using 31 Lite OOP field-type classes + **4 Pro-registered custom field types** (`menu_manager`, `verification_methods`, `delivery_days`, `color_customizer`), composed via `ElementFactory` inside 8 Lite page classes + 2 Pro page classes. Pro also injects fields into Lite pages via **20+ `dokan_settings_*_children` hook filters** from 4 settings element classes (GeneralSettings, SocialSettings, VendorSettings, WithdrawSettings) and **7 modules** (delivery-time, vendor-verification, color-scheme-customizer, germanized, printful, product-adv, request-for-quotation). The `simplify-settings-schema` plan calls for replacing OOP classes with plain PHP arrays — but the **detection and extraction strategy** must account for both Lite's core classes AND Pro's dynamic extensions. This change defines the complete detection-to-array pipeline.

## What Changes

- **Class detection rules**: Define how each OOP class type is identified — 6 structural types + 31 Lite field types from `Field::$field_map` + 4 Pro custom field types via `dokan_admin_settings_field_map` filter
- **Pro extension detection**: Catalog Pro's 4 settings element classes (GeneralSettings, SocialSettings, VendorSettings, WithdrawSettings), 2 page classes (ShipmentPage, EmailVerificationPage), 4 custom field types, 7 modules with settings, and 20+ `dokan_settings_*_children` hooks
- **Property-to-array mapping**: Exact mapping from each class's getters/properties to flat array keys, including Pro's custom field properties
- **Hierarchy flattening rules**: How the fluent `->add()` tree composition AND Pro's `_children` hook injection become parent-pointer references in the flat array
- **SettingsMapper integration**: How the existing 200+ `old_key → new_key` mappings relate to `dependency_key` paths (note: SettingsMapper is Lite-only, Pro does NOT use it)
- **Hybrid page detection**: Some pages (GeneralPage) use `ElementTransformer` — these need different handling
- **Storage key mapping**: Each page has a `$storage_key` — how this maps to the flat array's storage model
- **Completeness validation**: Verify every field type (31 Lite + 4 Pro), every page class (8 Lite + 2 Pro), and every `_children` hook injection is covered

## Capabilities

### New Capabilities

- `class-detection-strategy`: Rules for identifying all OOP settings element classes — 6 structural types + 31 Lite field types + 4 Pro custom field types + 2 Pro page classes + 4 Pro settings element classes + 7 Pro modules with settings — including `_children` hook injection points
- `property-array-mapping`: Complete mapping from every OOP property/getter to flat array key, covering inheritance chains, Pro custom field properties, the `SettingsMapper` key-path format, and value transform callbacks

### Modified Capabilities

_(none)_

## Impact

- **Affected code (Lite)**: 53 PHP files under `includes/Admin/Settings/` — Elements/, Pages/, transformers, mapper
- **Affected code (Pro)**: 2 page classes (ShipmentPage, EmailVerificationPage), 4 settings element classes (GeneralSettings, SocialSettings, VendorSettings, WithdrawSettings), 4 custom field classes (MenuManagerField, VerificationMethodsField, DeliveryDaysField, ColorCustomizerField), 7 modules with settings hooks
- **Pro extension hooks**: 20+ `dokan_settings_*_children` filters that inject fields/subpages into Lite pages at specific tree positions
- **Pro page registration**: `dokan_pro_admin_settings_pages` filter (separate from Lite's `dokan_admin_settings_pages`)
- **Existing infrastructure**: `SettingsMapper` (200+ key maps, Lite-only), `SettingsMapperCallbacks` (38+ transforms, Lite-only), `LegacyTransformer`, `ElementTransformer`
- **Output**: Detection registry + property mapping tables for both Lite and Pro
- **Risk**: Missing a Pro custom field type, `_children` hook, or module settings means incomplete settings in the converted array schema
