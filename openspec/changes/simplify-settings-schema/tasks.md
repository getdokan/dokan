## 1. Delete New OOP Classes from PR #3003

- [x] 1.1 Delete the entire `includes/Admin/Settings/` directory (all ~53 files added by PR #3003): Elements/, Pages/, transformers, mapper, Settings.php orchestrator
- [x] 1.2 Verify pre-existing files are NOT deleted: `includes/Admin/Settings.php` (old god class), `includes/Abstracts/SettingsElement.php` (used by OnboardingSetup), `includes/Admin/OnboardingSetup/`
- [x] 1.3 Remove any autoloader entries or composer classmap references for deleted files

## 2. Delete Custom Frontend Field Components

- [x] 2.1 Delete all files under `src/admin/dashboard/pages/settings/Elements/Fields/` (~30 custom field components)
- [x] 2.2 Delete structural element components: `src/admin/dashboard/pages/settings/Elements/FieldGroup.tsx`, Section.tsx, Tab.tsx, SubSection.tsx, Menu.tsx, PageHeading.tsx, SettingsParser.tsx
- [x] 2.3 Delete the `CustomizeRadio/` subdirectory (7 files)
- [x] 2.4 Delete `src/admin/dashboard/pages/settings/Elements/Fields/FieldParser.tsx` and `src/admin/dashboard/pages/settings/types.ts`
- [x] 2.5 Delete `src/admin/dashboard/pages/settings/components/` (SearchBar, icons/)
- [x] 2.6 Delete `src/admin/dashboard/pages/settings/index.tsx` (old React settings page entry)
- [x] 2.7 Remove old webpack entries for deleted settings field components, update webpack-entries.js

## 3. Define Lite Settings as Flat Array

- [x] 3.1 Create the base Lite settings schema function — convert all field definitions from `feat/admin-settings` branch's page classes (GeneralPage, TransactionPage, VendorPage, AppearancePage, CompliancePage) into a single flat array of plain associative arrays matching plugin-ui's `SettingsElement` type
- [x] 3.2 Include all structural elements: pages (general, transaction, vendor, appearance, compliance), subpages, sections, field groups with correct parent pointers (page_id, section_id, etc.)
- [x] 3.3 Include all field elements with: id, type:'field', variant, label, description, default, dependency_key, and field-specific props (options, enable_state/disable_state for switches, min/max for numbers, etc.)
- [x] 3.4 Pass the base array through `apply_filters('dokan_get_admin_settings_schema', $elements)`
- [x] 3.5 Create stub page elements for Pro-managed pages (product, ai_assist, verification, shipment, moderation) — Pro adds subpages/fields via the filter

## 4. Create SchemaValidator

- [x] 4.1 Create `includes/Admin/Settings/SchemaValidator.php` with `validate(array $elements): array` method
- [x] 4.2 Implement required property checks per element type (page: id/type/label; subpage: +page_id; field: +variant+parent pointer)
- [x] 4.3 Implement parent reference existence validation (page_id, section_id, tab_id, subpage_id, subsection_id, field_group_id all reference existing elements)
- [x] 4.4 Implement duplicate ID detection
- [x] 4.5 Implement variant validation (known variants pass, unknown warn) and dependency_key format check
- [x] 4.6 Add `DOKAN_DISABLE_SCHEMA_VALIDATION` constant check to bypass in production

## 5. Simplify Registry (Settings Builder)

- [x] 5.1 Create the registry class — build base Lite elements, apply `dokan_get_admin_settings_schema` filter, then process the result
- [x] 5.2 Implement hook_key filter firing: iterate structural nodes, gather children by parent pointer, fire `apply_filters($hook_key, $children, $node)`, merge results back
- [x] 5.3 Implement value population: parse dependency_key to determine option key and path, read from wp_options, set field `value` (fall back to `default`)
- [x] 5.4 Implement auto-generation of hook_key and dependency_key for elements that omit them
- [x] 5.5 Integrate SchemaValidator — run in debug/dev mode after full collection
- [x] 5.6 Implement default property filling (display:true, dependencies:[], validations:[], readonly:false, disabled:false)

## 6. Simplify REST Controller

- [x] 6.1 Create or simplify `AdminSettingsController` GET handler — call registry, return flat array directly (no tree transformation)
- [x] 6.2 Implement PUT handler — parse flatValues from request body, group by subpage using dependency_key first segment
- [x] 6.3 Apply variant-based sanitization (text→sanitize_text_field, number→absint, switch→on/off, select→in_array check) with sanitize_callback override
- [x] 6.4 Implement validation rules evaluation on save (required, not_empty, min_value, max_value, not_in) — return 400 with structured errors
- [x] 6.5 Ensure `dokan_before_saving_settings` / `dokan_after_saving_settings` hooks fire on save
- [x] 6.6 Add proper permission checks (`manage_woocommerce` capability)

## 7. Frontend: Integrate plugin-ui Settings

- [x] 7.1 Install/verify `@wedevs/plugin-ui` as dependency in package.json
- [x] 7.2 Create simplified settings page component: `<Settings schema={schema} onSave={handleSave} loading={loading} />`
- [x] 7.3 Implement schema fetch from `GET /dokan/v1/admin/settings` on page mount with loading state
- [x] 7.4 Implement save handler: on `onSave(scopeId, treeValues, flatValues)`, send `PUT /dokan/v1/admin/settings/{scopeId}` with flatValues, show success/error feedback
- [x] 7.5 Register Dokan-specific custom field types (category_based_commission, vendor_info_preview, single_product_preview) via plugin-ui's `applyFilters` prop
- [x] 7.6 Wire up the new settings component as the admin settings page entry point

## 8. MigrationMap

- [ ] 8.1 Create `MigrationMap.php` with static `MAP` array — convert the `SettingsMapper::$map` from `feat/admin-settings` (~130 entries) to the new format: each entry maps `'old_section.old_field'` → `['option' => 'dokan_settings_...', 'section' => '...', 'field' => '...', 'transform' => null|'merge_commission'|'split_banner'|...]`
- [ ] 8.2 Add `SECTION_FALLBACK` array mapping all 7 old section IDs to default new subpage option keys
- [ ] 8.3 Implement `MigrationMap::resolve($field, $section): ?array` for forward lookup
- [ ] 8.4 Implement `MigrationMap::get_section_fallback($section): ?string` for third-party fields
- [ ] 8.5 Implement `MigrationMap::reverse_resolve($option, $section, $field): ?array` for reverse lookup (new→old)

## 9. Data Migrator

- [ ] 9.1 Create `Migrator.php` — `migrate()` method: check `dokan_settings_schema_version`, acquire transient lock, read all old option keys, iterate migration map, apply forward transforms, write new per-subpage option keys
- [ ] 9.2 Implement merge transforms (e.g., `admin_percentage` + `additional_fee` → `admin_commission` composite value)
- [ ] 9.3 Implement split transforms (e.g., `store_banner_width` + `store_banner_height` → `store_banner_dimension` double_input)
- [ ] 9.4 Implement `_extensions` migration: fields in old options not in migration map → stored in `_extensions` namespace of the fallback subpage option
- [ ] 9.5 Set `dokan_settings_schema_version = 2.0` on successful migration
- [ ] 9.6 Hook migrator into plugin activation/upgrade, guarded by version check
- [ ] 9.7 Preserve old option keys after migration (do NOT delete)

## 10. Backward Compatibility Shim

- [ ] 10.1 Rewrite `dokan_get_option()` in `includes/functions.php` — 4-step resolution: migration map → section fallback (_extensions) → legacy fallback → default
- [ ] 10.2 Implement reverse transforms for merged fields (extract `admin_percentage` from `admin_commission` composite)
- [ ] 10.3 Add static caching in `dokan_get_option()` — cache `get_option()` results per option key within a request
- [ ] 10.4 Remove `dokan_admin_settings_rearrange_map()` function and its call in `dokan_get_option()`

## 11. Legacy UI Adapter

- [ ] 11.1 Create `LegacyAdapter.php` — `get_old_format_values()`: reads from new storage, applies reverse migration map (un-rename, un-merge, un-split), returns old-style `{ dokan_general: {...}, dokan_selling: {...} }` arrays
- [ ] 11.2 Implement `save_from_old_format($section, $values)`: receives old-format payload, applies forward migration map, writes to new per-subpage option keys
- [ ] 11.3 Implement `get_old_field_definitions()`: converts new schema back to old field definition format for Vue UI (switch→switcher, customize_radio→radio_image, dependencies→show_if)
- [ ] 11.4 Hook adapter into existing AJAX handlers: `get_settings_value()` and `save_settings_value()` delegate to adapter while keeping AJAX action names and response format

## 12. Extension Adapter & Field Type Mapper

- [ ] 12.1 Create `FieldTypeMapper.php` — old type → new variant mapping (`switcher`→`switch`, `radio_image`→`customize_radio`, `commission_fixed`→`combine_input`, `wpeditor`→`textarea`, etc.) plus property transforms (`show_if`→`dependencies`, `default`→`enable_state`/`disable_state` for switches)
- [ ] 12.2 Create `ExtensionAdapter.php` — `collect_legacy_extensions()`: fires `dokan_settings_fields` and `dokan_settings_sections` filters, diffs against known Lite/Pro fields to identify third-party additions
- [ ] 12.3 Implement `convert_to_schema_nodes($old_fields, $old_section)`: converts old field definitions to new flat schema elements using FieldTypeMapper, assigns to correct subpage via SECTION_FALLBACK
- [ ] 12.4 Inject converted extension nodes into the schema during registry build (after main filter, before value population)

## 13. Update DI Container & Wiring

- [ ] 13.1 Create or update `AdminSettingsServiceProvider` — register SchemaValidator, MigrationMap, Migrator, LegacyAdapter, ExtensionAdapter, FieldTypeMapper, and the registry class
- [ ] 13.2 Remove registrations for all deleted OOP classes from the service provider
- [ ] 13.3 Verify REST controller registration in `REST/Manager.php` still works
- [ ] 13.4 Add migrator hook registration to service provider boot method

## 14. Testing

- [ ] 14.1 Unit test SchemaValidator — required properties, parent refs, duplicate IDs, variants, dependency_key format, production disable
- [ ] 14.2 Unit test the full Lite schema — verify output of `dokan_get_admin_settings_schema` filter passes SchemaValidator with zero errors
- [ ] 14.3 Unit test MigrationMap::resolve() — simple moves, renames, merges, splits, unknown fields, section fallback
- [ ] 14.4 Unit test Migrator — one-time migration transforms old data correctly, is idempotent, handles missing old options, unknown fields go to _extensions
- [ ] 14.5 Unit test `dokan_get_option()` compatibility — all 4 resolution steps return correct values, reverse transforms for merged fields
- [ ] 14.6 Integration test REST controller — GET returns flat array, PUT saves correctly, validation errors, permission checks
- [ ] 14.7 Integration test: every old field from `get_settings_fields()` has a corresponding MigrationMap entry
- [ ] 14.8 Verify existing PHPUnit tests still pass (update any that reference deleted OOP classes)
- [ ] 14.9 Verify webpack build succeeds with no errors after frontend changes
