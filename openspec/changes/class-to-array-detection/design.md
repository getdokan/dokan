## Context

The `enhance/map-all-the-settings-storage-key-based-on-settings-mapper` branch has a mature OOP settings system:

**Backend classes:**
- `SettingsElement` abstract base (properties: id, title, description, icon, value, children, dependencies, validations, type, hook_key, dependency_key, doc_link, tooltip)
- `Field` extends SettingsElement — `$field_map` with 31 entries, `$input_type`, uses `ReflectionClass` to instantiate concrete types
- 31 concrete field classes under `Elements/Fields/` — each with type-specific properties
- 6 structural elements: SubPage, Section, Tab, SubSection, FieldGroup (all extend SettingsElement), plus AbstractPage (extends Settings)
- `ElementFactory` — static factory for all element types
- `SettingsMapper` — 200+ bidirectional key mappings (`dokan_general.custom_store_url` → `general.marketplace.marketplace_settings.vendor_store_url`)
- `SettingsMapperCallbacks` — 38+ value transform handlers (inversions, enum changes, array restructuring)
- `LegacyTransformer` — bridges old↔new storage with hooks
- `ElementTransformer` — converts legacy array-based settings to OOP elements

**Page classes (Lite):** GeneralPage, TransactionPage, VendorPage, AppearancePage, CompliancePage, AIAssistPage, ModerationPage, ProductPage
**Page classes (Pro):** ShipmentPage (priority 800, storage: `dokan_settings_shipment`), EmailVerificationPage (priority 500, storage: `dokan_verification`)

**Pro settings element classes** (inject fields into Lite pages via `_children` hooks):
- `GeneralSettings` — adds marketplace fields via `dokan_settings_general_marketplace_marketplace_settings_children`
- `SocialSettings` — adds social onboarding via `dokan_settings_appearance_children`
- `VendorSettings` — adds onboarding/capabilities via `dokan_settings_vendor_*_children`
- `WithdrawSettings` — adds withdraw methods via `dokan_settings_transaction_withdraw_charge_*_children`

**Pro custom field types** (registered via `dokan_admin_settings_field_map`):
- `menu_manager` → `MenuManagerField` (MenuManager module)
- `verification_methods` → `VerificationMethodsField` (vendor-verification module)
- `delivery_days` → `DeliveryDaysField` (delivery-time module)
- `color_customizer` → `ColorCustomizerField` (color-scheme-customizer module)

**Pro modules with settings** (inject via `dokan_settings_*_children` hooks):
- delivery-time, vendor-verification, color-scheme-customizer, germanized, printful, product-adv, request-for-quotation

**Key Pro architecture note:** Pro does NOT use `SettingsMapper` or `SettingsMapperCallbacks` — those are Lite-only. Pro registers pages via `dokan_pro_admin_settings_pages` filter and injects fields via `dokan_settings_*_children` hooks.

**Two page composition patterns exist:**
1. **Hybrid** (GeneralPage): Uses `ElementTransformer` to load legacy `get_settings_fields()`, then overrides with `ElementFactory`
2. **Pure ElementFactory** (TransactionPage, etc.): Builds entire tree with `ElementFactory::field()`, `::sub_page()`, `::section()`, etc.

## Goals / Non-Goals

**Goals:**
- Define a deterministic detection algorithm that finds every settings element class (31 field types + 6 structural types)
- Produce a complete property-to-array-key mapping table for all classes, respecting inheritance
- Document how the existing `SettingsMapper` key-path format (`PageId.SubPageId.SectionId.FieldId`) maps to the flat array's `dependency_key`
- Account for the two page composition patterns (hybrid vs pure ElementFactory)
- Define how `SettingsMapperCallbacks` value transforms fit into the array-based approach
- Provide completeness verification method

**Non-Goals:**
- Actually performing the conversion (that's `simplify-settings-schema` implementation)
- Rewriting `SettingsMapper` or `SettingsMapperCallbacks` (those are separate concerns)
- Converting Pro-only pages (Pro follows same detection rules)
- Automated AST-based code generation

## Decisions

### 1. Detection Source: `Field::$field_map` (31 entries) is the canonical registry

**Decision:** The `$field_map` in `includes/Admin/Settings/Elements/Field.php` (lines 69-101) enumerates all field types:

| # | variant (input_type) | PHP Class | Inheritance Chain |
|---|---|---|---|
| 1 | `text` | Text | Field |
| 2 | `number` | Number | Text → Field |
| 3 | `checkbox` | Checkbox | Text → Field |
| 4 | `select` | Select | Checkbox → Text → Field |
| 5 | `refresh_select` | RefreshSelectField | Select → Checkbox → Text → Field |
| 6 | `radio` | Radio | Checkbox → Text → Field |
| 7 | `tel` | Tel | Text → Field |
| 8 | `password` | Password | Text → Field |
| 9 | `radio_box` | RadioBox | Radio → Checkbox → Text → Field |
| 10 | `switch` | Switcher | Radio → Checkbox → Text → Field |
| 11 | `multicheck` | MultiCheck | Field |
| 12 | `currency` | Currency | Text → Field |
| 13 | `combine_input` | CombineInput | Field |
| 14 | `category_based_commission` | CategoryBasedCommission | Field |
| 15 | `radio_capsule` | RadioCapsule | Radio → Checkbox → Text → Field |
| 16 | `info` | InfoField | Text → Field |
| 17 | `double_input` | DoubleInput | Field |
| 18 | `base_field_label` | BaseFieldLabel | Field |
| 19 | `customize_radio` | CustomizeRadio | Radio → Checkbox → Text → Field |
| 20 | `html` | HtmlField | Text → Field |
| 21 | `notice` | NoticeField | Field |
| 22 | `repeater` | Repeater | Field |
| 23 | `rich_text` | RichText | Text → Field |
| 24 | `show_hide` | ShowHide | Password → Text → Field |
| 25 | `select_color_picker` | SelectColorPicker | Select → Checkbox → Text → Field |
| 26 | `copy_field` | CopyField | Text → Field |
| 27 | `file_upload` | FileUpload | Text → Field |
| 28 | `vendor_info_preview` | VendorInfoPreview | Field |
| 29 | `single_product_preview` | SingleProductPreview | Field |
| 30 | `textarea` | TextArea | Text → Field |
| 31 | `withdraw_schedule` | WithdrawSchedule | Field |

**Also detect via filter:** `dokan_admin_settings_field_map` (Field.php line 158) and `dokan_admin_settings_field_mapper` (line 176) add/replace types at runtime.

**Pro-registered types (4 additional):**

| # | variant | PHP Class | Module | Registration File |
|---|---|---|---|---|
| 32 | `menu_manager` | MenuManagerField | MenuManager | `includes/MenuManager/Admin/Settings.php:27` |
| 33 | `verification_methods` | VerificationMethodsField | vendor-verification | `modules/vendor-verification/includes/Admin/Hooks.php:26` |
| 34 | `delivery_days` | DeliveryDaysField | delivery-time | `modules/delivery-time/includes/Settings.php:31` |
| 35 | `color_customizer` | ColorCustomizerField | color-scheme-customizer | `modules/color-scheme-customizer/includes/Admin/Settings/SettingsManager.php:12` |

**Total field types: 35** (31 Lite + 4 Pro)

### 2. Structural elements: 6 fixed types + AbstractPage

| Class | `type` string | Parent Pointer Key | Created Via |
|---|---|---|---|
| AbstractPage | `page` | _(root)_ | `extends AbstractPage` |
| SubPage | `subpage` | `page_id` | `ElementFactory::sub_page($id)` |
| Tab | `tab` | `subpage_id` | `ElementFactory::tab($id)` |
| Section | `section` | `subpage_id` OR `tab_id` | `ElementFactory::section($id)` |
| SubSection | `subsection` | `section_id` | `ElementFactory::sub_section($id)` |
| FieldGroup | `fieldgroup` | `section_id` / `subsection_id` | `ElementFactory::field_group($id)` |

**Page detection:** Scan `includes/Admin/Settings/Pages/` for classes extending `AbstractPage`. Each has:
- `$id` — page identifier
- `$priority` — sort order
- `$storage_key` — `wp_options` key (e.g., `dokan_settings_general`)
- `describe_settings()` — builds the element tree

### 3. Two page composition patterns require different detection approaches

**Pattern A — Hybrid (GeneralPage):**
```php
$transformer = new ElementTransformer();
$legacy_settings = dokan_get_container()->get(Settings::class);
$transformer->set_settings([
    'sections' => $legacy_settings->get_settings_sections(),
    'fields'   => $legacy_settings->get_settings_fields(),
]);
// Then uses ElementFactory to build new tree, cherry-picking from transformer
```
**Detection rule:** If `describe_settings()` instantiates `ElementTransformer`, the page mixes legacy and new fields. Detect by checking for `new ElementTransformer()` usage.

**Pattern B — Pure ElementFactory (TransactionPage, ShipmentPage, etc.):**
```php
$this->set_title('Transaction')
    ->add(ElementFactory::sub_page('commission')->add(...));
```
**Detection rule:** If `describe_settings()` only uses `ElementFactory::*` calls, the page is fully OOP. This is the simpler case.

**Implication for array conversion:** Pattern A pages need the legacy field definitions extracted from `get_settings_fields()` AND the ElementFactory overrides merged. Pattern B pages only need the ElementFactory tree flattened.

### 4. Property-to-array mapping (complete table)

#### Base properties (SettingsElement — all elements):

| OOP Property | Array Key | Type | Source |
|---|---|---|---|
| `$id` | `id` | string | SettingsElement:17 |
| `$type` | `type` | string | SettingsElement:80 |
| `$title` | `title` | string | SettingsElement:24 |
| `$description` | `description` | string | SettingsElement:31 |
| `$icon` | `icon` | string | SettingsElement:38 |
| `$tooltip` | `tooltip` | string | SettingsElement:116 |
| `$hook_key` | `hook_key` | string | SettingsElement:87 |
| `$dependency_key` | `dependency_key` | string | SettingsElement:94 |
| `$doc_link` | `doc_link` | ?string | SettingsElement:99 |
| `$dependencies` | `dependencies` | array | SettingsElement:66 |
| `$validations` | `validations` | array | SettingsElement:73 |
| `$support_children` | _(omit)_ | bool | Internal only |
| `$children` | _(flatten to separate elements)_ | array | Tree → flat conversion |
| `$value` | `value` | mixed | Populated at runtime, not in schema |

#### Field-specific (Field class):

| OOP Property | Array Key |
|---|---|
| `$input_type` | `variant` |

#### Text-family properties (inherited by 20+ variants):

| OOP Property | Array Key | Variants |
|---|---|---|
| `$default` | `default` | All text-based |
| `$placeholder` | `placeholder` | All text-based |
| `$is_readonly` | `readonly` | All text-based |
| `$disabled` | `disabled` | All text-based |
| `$size` | `size` | All text-based |
| `$helper_text` | `helper_text` | All text-based |
| `$postfix` | `postfix` | All text-based |
| `$prefix` | `prefix` | All text-based |
| `$image_url` | `image_url` | All text-based |

#### Number-specific:

| OOP Property | Array Key |
|---|---|
| `$minimum` | `min_value` |
| `$maximum` | `max_value` |
| `$step` | `step` |

#### Options-based (Checkbox → Radio, Select, RadioBox, RadioCapsule, CustomizeRadio, SelectColorPicker, RefreshSelectField):

| OOP Property | Array Key | Format |
|---|---|---|
| `$options` | `options` | `[{value: string, title: string}]` |

#### Switcher-specific:

| OOP Property | Array Key | Notes |
|---|---|---|
| `$states['enable']` | `enable_state` | Flattened from nested array |
| `$states['disable']` | `disable_state` | Flattened from nested array |

**Actual usage in code** (e.g., ShipmentPage):
```php
->set_enable_state('Enabled', 'sp-australia-post')
->set_disable_state('Disabled', '')
```
Each state has a `label` and `value`. Array format: `{label: string, value: string}`.

#### MultiCheck-specific:

| OOP Property | Array Key |
|---|---|
| `$default` | `default` (array) |
| `$options` | `options` |
| `$helper_text` | `helper_text` |

#### Repeater-specific:

| OOP Property | Array Key |
|---|---|
| `$default` | `default` (array) |
| `$items` | `items` |
| `$new_title` | `new_title` |

Repeater fields have children added via `->add()` — these become the `items` definition. See ShipmentPage's `shipment_status_list` repeater.

#### FileUpload-specific:

| OOP Property | Array Key |
|---|---|
| `$allowed_types` | `allowed_types` |
| `$max_file_size` | `max_file_size` |
| `$multiple` | `multiple` |

#### Currency-specific:

| OOP Property | Array Key |
|---|---|
| `$currency_symbol` | `currency_symbol` |

#### InfoField-specific:

| OOP Property | Array Key |
|---|---|
| `$link_url` | `link_url` |
| `$link_text` | `link_text` |
| `$show_icon` | `show_icon` |

#### NoticeField: No additional properties beyond base (display-only element)

### 5. Pro injects fields via `dokan_settings_*_children` hooks — these become array elements with parent pointers

**Decision:** Pro's `_children` hooks fire at specific tree positions (e.g., `dokan_settings_general_marketplace_marketplace_settings_children`). The hook name encodes the parent path: `dokan_settings_{page}_{subpage}_{section}_children`. Pro callbacks return additional elements to add at that position.

**Complete list of Pro `_children` hooks used:**

| Hook | Pro Source | Injects Into |
|---|---|---|
| `dokan_settings_general_marketplace_marketplace_settings_children` | GeneralSettings | General > Marketplace > Settings section |
| `dokan_settings_general_marketplace_children` | GeneralSettings | General > Marketplace subpage |
| `dokan_settings_general_location_children` | (modules) | General > Location subpage |
| `dokan_settings_vendor_vendor_onboarding_children` | VendorSettings | Vendor > Onboarding subpage |
| `dokan_settings_vendor_children` | VendorSettings | Vendor page |
| `dokan_settings_vendor_vendor_capabilities_vendor_capabilities_children` | VendorSettings | Vendor > Capabilities > Capabilities section |
| `dokan_settings_appearance_children` | SocialSettings, MenuManager, ColorSchemeCustomizer | Appearance page |
| `dokan_settings_transaction_withdraw_charge_children` | WithdrawSettings | Transaction > Withdraw subpage |
| `dokan_settings_transaction_withdraw_charge_section_withdraw_charge_children` | WithdrawSettings | Transaction > Withdraw > Charges section |
| `dokan_settings_compliance_children` | Germanized module | Compliance page |
| `dokan_settings_moderation_children` | ReportAbuse module | Moderation page |
| `dokan_settings_product_children` | Printful, ProductAdv, RFQ modules | Product page |
| `dokan_settings_shipment_children` | DeliveryTime module | Shipment page |

**Detection rule for array conversion:** In the flat array approach, Pro will no longer use `_children` hooks. Instead, Pro will append elements directly to the `dokan_get_admin_settings_schema` filter array with the correct `page_id`/`section_id` parent pointers. The `_children` hook names encode the parent path — use this to determine the correct parent pointer for each Pro-injected element.

### 6. SettingsMapper key-path IS the dependency_key (Lite-only)

**Key finding:** The `SettingsMapper` new-key format `PageId.SubPageId.SectionId.FieldId` is the SAME format as `dependency_key` in the element tree. For example:

```
SettingsMapper: 'dokan_selling.commission_type' => 'transaction.commission.commission.commission_type'
Element tree:   commission_type field has dependency_key = 'commission.commission.commission_type'
                (prefixed with page id 'transaction' in SettingsMapper)
```

**Decision:** When converting to flat array, the `dependency_key` can be derived from the element's position in the tree: `{subpage_id}.{section_id}.{field_id}` (3 segments). The SettingsMapper adds the page prefix for cross-page lookups.

### 6. SettingsMapperCallbacks: value transforms remain separate from detection

**Decision:** The 38+ value transform callbacks in `SettingsMapperCallbacks` handle **value conversion** (e.g., `hide_customer_info: on` → `show_customer_details_to_vendors: off`), NOT field detection. These transforms are orthogonal to the class-to-array conversion:

- **Class-to-array** answers: "What fields exist and what are their properties?"
- **SettingsMapperCallbacks** answers: "How do old values map to new values?"

The callbacks will continue to work regardless of whether fields are defined as classes or arrays. They hook into `dokan_settings_mapper_transform_value` filters, not into the element definition system.

### 7. Storage key per page, not per subpage

**Actual implementation:** Each page class has `$storage_key`:
- GeneralPage: `dokan_settings_general`
- TransactionPage: `dokan_settings_transaction`
- AppearancePage: `dokan_settings_appearance`
- etc.

This differs from the `simplify-settings-schema` plan which proposed per-subpage keys. The current code stores the entire page's nested data in one option:

```php
// dokan_settings_transaction stores:
[
    'commission' => [
        'commission' => [
            'commission_type' => 'fixed',
            'admin_commission' => [...],
        ]
    ],
    'fees' => [...],
    'withdraw_charge' => [...],
]
```

**Decision for array conversion:** The storage key mapping should be preserved as-is (per-page) since the existing `SettingsMapper` and `LegacyTransformer` already depend on this structure.

### 8. Completeness verification

After conversion, verify:

1. **Field map coverage**: All 31 entries in `Field::$field_map` have at least one field in the output
2. **Page coverage**: All 8 Lite page classes fully converted (count elements per page)
3. **SettingsMapper coverage**: Every new-key in `SettingsMapper::$map` resolves to a valid element in the flat array
4. **Property coverage**: For each field, compare `populate()` output keys against flat array keys
5. **Parent pointer integrity**: Every `*_id` reference points to an existing element
6. **Dependency path validity**: Every `add_dependency()` path resolves to a real field

## Risks / Trade-offs

**[Risk] Hybrid pages (GeneralPage) are harder to convert** — They mix legacy `get_settings_fields()` data with ElementFactory overrides. Missing a legacy field means silent data loss.
→ Mitigation: For hybrid pages, extract the full `get_settings_fields()` output AND the ElementFactory tree, then diff to ensure 100% coverage.

**[Risk] SettingsMapper paths may not match element tree paths exactly** — Some mapper entries have 5+ segments (e.g., `appearance.storefont_social_onboarding.storefont_social_onboarding_section.facebook_api_group.facebook_enabled`) which implies FieldGroup nesting.
→ Mitigation: The dependency_key path includes FieldGroup IDs. Validate every mapper path against the element tree.

**[Risk] Pro-registered field types via filter** — Types registered via `dokan_admin_settings_field_map` won't be visible in static analysis of Lite code.
→ Mitigation: Also scan Pro's codebase for `add_filter('dokan_admin_settings_field_map', ...)` calls.

**[Risk] Value transforms in SettingsMapperCallbacks may need updating** — If field IDs change during array conversion, the 38+ callbacks that match on specific key strings will break.
→ Mitigation: Array conversion MUST preserve the same element IDs used in SettingsMapper. The mapper is the contract — don't change IDs without updating both sides.

**[Risk] Pro `_children` hooks encode tree positions that may change** — Hook names like `dokan_settings_general_marketplace_marketplace_settings_children` encode element IDs. If Lite changes a section ID, Pro's hooks silently stop firing.
→ Mitigation: The flat array approach eliminates `_children` hooks entirely — Pro appends to the schema filter with explicit parent pointers. But both Lite and Pro must be updated in lockstep.

**[Risk] 4 Pro custom field types need React components in plugin-ui** — `menu_manager`, `verification_methods`, `delivery_days`, `color_customizer` are custom React components not in `@wedevs/plugin-ui`. They can't be replaced by standard variants.
→ Mitigation: These must either be registered as custom field renderers via plugin-ui's `applyFilters` prop, or converted to `variant: 'html'` with custom rendering. Audit each to determine the right approach.

**[Risk] 7 Pro modules use legacy `dokan_settings_sections`/`dokan_settings_fields` hooks** — Some modules hook into BOTH old and new systems. During migration, ensure the extension adapter handles these correctly.
→ Mitigation: The `ExtensionAdapter` from the `simplify-settings-schema` plan fires both old and new hooks, converting results via `FieldTypeMapper`.

**[Trade-off] Manual conversion over automated tooling** — 8 Lite page classes + 2 Pro page classes + 4 Pro element classes + 7 modules is manageable manually with the mapping tables. Building AST tools would take longer than doing the conversion.
→ Acceptable: The mapping tables + completeness verification catch errors.
