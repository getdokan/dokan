# Field Type Registry & Property Mapping Reference

## 0. SettingsMapper Analysis (242 entries, Lite-only)

### Entries per page
| Page | Count |
|------|-------|
| vendor | 54 |
| transaction | 30 |
| product | 30 |
| appearance | 25 |
| general | 23 |
| shipment | 23 |
| moderation | 19 |
| verification | 17 |
| ai_assist | 11 |
| compliance | 10 |
| **Total** | **242** |

### Path segment depths
| Segments | Count | Meaning |
|----------|-------|---------|
| 3 | 24 | `page.subpage.field` (no section, some vendor onboarding) |
| 4 | 149 | `page.subpage.section.field` (standard) |
| 5 | 69 | `page.subpage.section.fieldgroup.field` (FieldGroup nesting) |

### dependency_key = mapper path minus page prefix
- Mapper: `general.marketplace.marketplace_settings.vendor_store_url`
- dependency_key: `marketplace.marketplace_settings.vendor_store_url`
- Pattern: `{subpage}.{section}.{field}` or `{subpage}.{section}.{fieldgroup}.{field}`

### All 69 FieldGroup paths (5-segment)
These confirm FieldGroups exist in the element tree:
- `google_map_api_key`, `mapbox_api_key` (General > Location)
- `store_banner_dimension` (Appearance > Store)
- `google_recaptcha_settings` (Appearance > Store)
- `facebook_api_group`, `x_api_group`, `google_api_group`, `linkedin_api_group`, `apple_api_group` (Appearance & Vendor social)
- `admin_commission` (Transaction > Commission)
- `withdraw_methods_group_custom` (Transaction > Withdraw)
- `analytics_authenticated_group` (Vendor > Store Stats)
- `twilio_api_group`, `vonage_api_group` (Verification > SMS)
- `printful_api_settings_group` (Product > Printful)
- `openai_api_info_group`, `gemini_api_info_group`, `bria-ai_api_info_group` (AI Assist)
- `delivery_days_schedule` (Shipment > Delivery Days)
- `shipment-status` (Shipment > Status)

### Pro does NOT use SettingsMapper
Confirmed: No `dokan_settings_mapper_map` filter usage in Pro. SettingsMapper is Lite-only infrastructure.

## 0b. SettingsMapperCallbacks Analysis (37 methods, ALL field-ID-dependent)

### By Category

| Category | Count | Examples |
|----------|-------|---------|
| Inversions (on↔off) | 3 | customer_details_visibility, withdraw_options_visibility, welcome_wizard |
| Enum changes | 2 | cod_payments (on→exclude), abuse_reported_by (on→logged_in_users) |
| Array restructuring | 14 | abuse_reasons ({id,value}→{id,title,order}), vendor_extra_fields (assoc→indexed), failed_actions, discount_edit, disbursement |
| Complex post-processing | 16 | location_placement (2→1 merge), single_product_preview (3→1 merge), withdraw_methods (8 payment methods), disbursement_schedule (4 schedule types), reverse_withdrawal (enabled+gateways merge) |
| Unused (not registered) | 2 | schedule_day_old_to_new, schedule_day_new_to_old |

### Critical Finding: ALL 37 callbacks are field-ID-dependent
Every callback uses hardcoded field key strings. If field IDs change during array conversion, ALL of these will break. The array conversion MUST preserve the same field IDs used in SettingsMapper paths.

### Most Complex Callbacks (risk areas)
1. **map_withdraw_methods_old_to_new/new_to_old** — maps 8 payment methods (paypal, skrill, bank, custom, paypal-marketplace, paystack, stripe, razorpay) with charges structure conversion (`{fixed,percentage}` ↔ `{additional_fee,admin_percentage}`)
2. **map_disbursement_schedule_old_to_new/new_to_old** — maps 4 schedule types (quarterly, monthly, biweekly, weekly) with nested day/month fields
3. **map_location_placement_old_to_new/new_to_old** — merges 2 old settings (radio + switch) into 1 new multi-select
4. **map_single_product_preview_old_to_new/new_to_old** — merges 3 old on/off settings into 1 object with booleans
5. **map_reverse_withdrawal_enabled** — merges enabled + payment_gateways[cod] into single toggle

## 1. Lite Field Types (31 entries from Field::$field_map)

| # | variant | PHP Class | Extends | Declared Properties (excluding inherited) |
|---|---------|-----------|---------|-------------------------------------------|
| 1 | `text` | Text | Field | `$default:string=''`, `$placeholder:string=''`, `$is_readonly:bool=false`, `$disabled:bool=false`, `$size:int=20`, `$helper_text:string=''`, `$postfix:mixed=''`, `$prefix:mixed=''`, `$image_url:string=''`, `$validation_func:?callable=null` |
| 2 | `number` | Number | Text | `$minimum:float` (uninit), `$maximum:float` (uninit), `$step:float=0.1`, `$addon_icon:bool=false` |
| 3 | `checkbox` | Checkbox | Text | `$options:array=[]` |
| 4 | `select` | Select | Checkbox | _(no new properties)_ |
| 5 | `refresh_select` | RefreshSelectField | Select | `$api_endpoint:string=''` |
| 6 | `radio` | Radio | Checkbox | _(no new properties)_ |
| 7 | `tel` | Tel | Text | _(no new properties)_ |
| 8 | `password` | Password | Text | _(no new properties)_ |
| 9 | `radio_box` | RadioBox | Radio | `$option_icons:array=[]` |
| 10 | `switch` | Switcher | Radio | `$states:array=[]`, `$switcher_type:?string=null`, `$should_confirm:bool=false`, `$confirm_modal:array=[]` |
| 11 | `multicheck` | MultiCheck | Field | `$default:array=[]`, `$helper_text:string=''`, `$options:array=[]` |
| 12 | `currency` | Currency | Text | `$currency_symbol:string` (uninit) |
| 13 | `combine_input` | CombineInput | Field | `$additional_fee:string=''`, `$admin_percentage:string=''`, `$is_automated:bool=false` |
| 14 | `category_based_commission` | CategoryBasedCommission | Field | `$reset_subcategory` (uninit) |
| 15 | `radio_capsule` | RadioCapsule | Radio | _(no new properties, overrides add_option)_ |
| 16 | `info` | InfoField | Text | `$link_url:string=''`, `$link_text:string=''`, `$show_icon:bool=true` |
| 17 | `double_input` | DoubleInput | Field | `$first_value_type`, `$second_value_type`, `$label`, `$first_label`, `$first_value`, `$first_placeholder`, `$second_label`, `$second_value`, `$second_placeholder`, `$first_prefix`, `$first_suffix`, `$second_prefix`, `$second_suffix`, `$first_required:bool=false`, `$second_required:bool=false` |
| 18 | `base_field_label` | BaseFieldLabel | Text | `$suffix:string=''` (also re-declares $icon, $image_url, $description) |
| 19 | `customize_radio` | CustomizeRadio | Radio | `$variant:string='simple'`, `$css_class:string=''`, `$disabled:bool=false`, `$grid_config:array=[]` |
| 20 | `html` | HtmlField | Field | `$html_content:string=''`, `$css_classes:string=''`, `$escape_html:bool=false`, `$tooltip:string=''`, `$icon:string=''`, `$allow_shortcodes:bool=false` |
| 21 | `notice` | NoticeField | Field | `$notice_type:string='info'`, `$notice_icon:string='info'`, `$notice_title:string=''`, `$notice_description:string=''`, `$link_title:string=''`, `$link_url:string=''`, `$link_icon:string=''`, `$active_tab:string=''` |
| 22 | `repeater` | Repeater | Field | `$default:array=[]`, `$items:array=[]`, `$new_title:string=''` |
| 23 | `rich_text` | RichText | Text | _(no new properties)_ |
| 24 | `show_hide` | ShowHide | Password | _(no new properties)_ |
| 25 | `select_color_picker` | SelectColorPicker | Select | _(no new properties)_ |
| 26 | `copy_field` | CopyField | Text | _(no new properties)_ |
| 27 | `file_upload` | FileUpload | Text | `$allowed_types:array=[]`, `$max_file_size:int=0`, `$multiple:bool=false` |
| 28 | `vendor_info_preview` | VendorInfoPreview | MultiCheck | `$default:array=['store_address'=>true,'store_phone'=>true,'store_email'=>true]` |
| 29 | `single_product_preview` | SingleProductPreview | MultiCheck | `$default:array=['vendor_info'=>true,'more_products_tab'=>true,'shipping_tab'=>true]` |
| 30 | `textarea` | TextArea | Text | _(no new properties)_ |
| 31 | `withdraw_schedule` | WithdrawSchedule | Text | _(no new properties)_ |

## 2. Pro Custom Field Types (4 entries via dokan_admin_settings_field_map filter)

| # | variant | PHP Class | Extends | Module | Registration File | Declared Properties |
|---|---------|-----------|---------|--------|-------------------|---------------------|
| 32 | `menu_manager` | MenuManagerField | Field | MenuManager | `includes/MenuManager/Admin/Settings.php:27` | `$api_endpoint:string=''` |
| 33 | `verification_methods` | VerificationMethodsField | Field | vendor-verification | `modules/vendor-verification/includes/Admin/Hooks.php:26` | `$api_endpoint:string='dokan/v1/verification-methods'` |
| 34 | `delivery_days` | DeliveryDaysField | Field | delivery-time | `modules/delivery-time/includes/Settings.php:31` | _(dynamic default with day structure)_ |
| 35 | `color_customizer` | ColorCustomizerField | Field | color-scheme-customizer | `modules/color-scheme-customizer/includes/Admin/Settings/SettingsManager.php:12` | _(dynamic default from module)_ |

## 3. Structural Elements

| Class | type string | Parent Pointer Key | Unique Properties |
|-------|------------|-------------------|-------------------|
| AbstractPage | `page` | _(root)_ | `$id`, `$priority:int=100`, `$storage_key`, `$storage_type='options'` |
| SubPage | `subpage` | `page_id` | `$priority:int=100` |
| Section | `section` | `subpage_id` or `tab_id` | _(none beyond base)_ |
| Tab | `tab` | `subpage_id` | _(none beyond base)_ |
| SubSection | `subsection` | `section_id` | _(none beyond base)_ |
| FieldGroup | `fieldgroup` | `section_id` or `subsection_id` | `$content_class:string=''` |

## 4. Page Classes

| Page | id | priority | storage_key | Composition Pattern | Plugin |
|------|----|----------|-------------|-------------------|--------|
| GeneralPage | `general` | 100 | `dokan_settings_general` | HYBRID (ElementTransformer + ElementFactory) | Lite |
| TransactionPage | `transaction` | 600 | `dokan_settings_transaction` | Pure ElementFactory | Lite |
| VendorPage | `vendor` | — | — | Pure ElementFactory | Lite |
| AppearancePage | `appearance` | — | — | Pure ElementFactory | Lite |
| CompliancePage | `compliance` | — | — | Pure ElementFactory | Lite |
| AIAssistPage | `ai_assist` | — | — | Pure ElementFactory | Lite |
| ModerationPage | `moderation` | — | — | Pure ElementFactory | Lite |
| ProductPage | `product` | — | — | Pure ElementFactory | Lite |
| ShipmentPage | `shipment` | 800 | `dokan_settings_shipment` | Pure ElementFactory | Pro |
| EmailVerificationPage | `verification` | 500 | `dokan_verification` | Pure ElementFactory | Pro |

## 5. Pro Settings Element Classes & Their _children Hook Injections

### GeneralSettings
- `dokan_settings_general_marketplace_marketplace_settings_children` → 5 fields: enable_single_seller_mode (switch), store_category_mode (radio_capsule), show_customer_details_to_vendors (switch), guest_product_enquiry (switch), add_to_cart_button_visibility (switch)
- `dokan_settings_general_marketplace_children` → 1 section: live_search with live_search_base (base_field_label) + search_box_radio (customize_radio)

### SocialSettings
- `dokan_settings_appearance_children` → 1 subpage: storefont_social_onboarding (priority 400) with section containing social_login (switch) + 5 field groups (facebook, x, google, linkedin, apple) each with enabled/id/secret/redirect fields

### VendorSettings
- `dokan_settings_vendor_vendor_onboarding_children` → 4 fields: terms_conditions (switch), welcome_wizard (switch), vendor_setup_wizard_logo (file_upload), vendor_setup_wizard_message (rich_text)
- `dokan_settings_vendor_children` → 1 subpage: social_onboarding (priority 200) with 5 API groups (same pattern as SocialSettings)
- `dokan_settings_vendor_vendor_capabilities_vendor_capabilities_children` → 11 fields: selling_product_type (radio_capsule), product_status (radio_capsule), duplicate_product (switch), allow_vendor_create_manual_order (switch), category_selection (radio_capsule), vendors_create_tags (switch), add_new_attribute_values (switch), product_review_management (switch), auction_functions (switch), discount_order_settings (switch), discount_settings (multicheck)

### WithdrawSettings
- `dokan_settings_transaction_withdraw_charge_children` → multiple sections: withdraw_threshold (number), withdraw_option_visibility (switch), manual_withdraw (multicheck), auto_withdraw (multicheck), weekly/monthly/biweekly/quarterly withdraw groups with schedule selects
- `dokan_settings_transaction_withdraw_charge_section_withdraw_charge_children` → razorpay_withdraw (switch), withdraw_methods_group_custom field group

## 6. Pro Modules with Settings

| Module | Hook Type | Injection Target | Elements Added |
|--------|-----------|-----------------|----------------|
| delivery-time | `dokan_settings_shipment_children` + legacy hooks | Shipment page | subpage `dashboard-delivery-days-page` with delivery time settings + delivery_days_schedule field |
| vendor-verification | `dokan_admin_settings_field_map` only | Field registry | verification_methods field type (no page injection) |
| color-scheme-customizer | `dokan_settings_appearance_children` | Appearance page | subpage `dashboard-color-customizer-page` with color_customizer field |
| germanized | `dokan_settings_compliance_children` + legacy | Compliance page | subpage `eu_compliance` with compliance settings + multicheck fields |
| printful | `dokan_settings_product_children` + legacy | Product page | subpage `printful_integration` with API settings + size guide settings |
| product-adv | `dokan_settings_product_children` + legacy | Product page | subpage `product_advertisement` with 8 settings fields |
| request-for-quotation | `dokan_settings_product_children` + legacy | Product page | subpage `request_for_quote` with 6 settings fields |

## 7. Property-to-Array Key Mapping (Complete)

### Base (SettingsElement) → All elements
| OOP Property | Array Key | Notes |
|---|---|---|
| `$id` | `id` | Required |
| `$type` | `type` | page/subpage/section/tab/subsection/fieldgroup/field |
| `$title` | `title` | Required |
| `$description` | `description` | Omit if empty |
| `$icon` | `icon` | Omit if empty |
| `$tooltip` | `tooltip` | Omit if empty |
| `$hook_key` | `hook_key` | Auto-generated if omitted |
| `$dependency_key` | `dependency_key` | 3+ segment dot-path |
| `$doc_link` | `doc_link` | Omit if null |
| `$dependencies` | `dependencies` | Array of `{key, value, to_self, attribute, effect, comparison}` |
| `$validations` | `validations` | Array of validation rules |
| `$children` | _(flatten)_ | Each child becomes separate element with parent pointer |
| `$value` | `value` | Populated at runtime, not in schema |
| `$support_children` | _(omit)_ | Internal |

### Field → All field elements
| OOP | Array Key |
|---|---|
| `$input_type` | `variant` |

### Text family (inherited by 20+ variants)
| OOP | Array Key |
|---|---|
| `$default` | `default` |
| `$placeholder` | `placeholder` |
| `$is_readonly` | `readonly` |
| `$disabled` | `disabled` |
| `$size` | `size` |
| `$helper_text` | `helper_text` |
| `$postfix` | `postfix` |
| `$prefix` | `prefix` |
| `$image_url` | `image_url` |
| `$validation_func` | `validation_func` |

### Number (extends Text)
| OOP | Array Key |
|---|---|
| `$minimum` | `min_value` |
| `$maximum` | `max_value` |
| `$step` | `step` |
| `$addon_icon` | `addon_icon` |

### Checkbox/options-based
| OOP | Array Key | Format |
|---|---|---|
| `$options` | `options` | `[{title:string, value:string, icon?:string}]` |

### Switcher (extends Radio)
| OOP | Array Key | Format |
|---|---|---|
| `$states.enable` | `enable_state` | `{label:string, value:string}` |
| `$states.disable` | `disable_state` | `{label:string, value:string}` |
| `$switcher_type` | `switcher_type` | Omit if null |
| `$should_confirm` | `should_confirm` | Default false |
| `$confirm_modal` | `confirm_modal` | Modal settings array |

### RadioBox (extends Radio)
| OOP | Array Key |
|---|---|
| `$option_icons` | `option_icons` |

### CustomizeRadio (extends Radio)
| OOP | Array Key |
|---|---|
| `$variant` | `customize_variant` (NOT the same as field variant) |
| `$css_class` | `css_class` |
| `$disabled` | `disabled` |
| `$grid_config` | `grid_config` |

### RefreshSelectField (extends Select)
| OOP | Array Key |
|---|---|
| `$api_endpoint` | `api_endpoint` |

### MultiCheck (extends Field directly)
| OOP | Array Key |
|---|---|
| `$default` | `default` (array) |
| `$options` | `options` |
| `$helper_text` | `helper_text` |

### Repeater
| OOP | Array Key |
|---|---|
| `$default` | `default` (array) |
| `$items` | `items` |
| `$new_title` | `new_title` |

### FileUpload (extends Text)
| OOP | Array Key |
|---|---|
| `$allowed_types` | `allowed_types` |
| `$max_file_size` | `max_file_size` |
| `$multiple` | `multiple` |

### Currency (extends Text)
| OOP | Array Key |
|---|---|
| `$currency_symbol` | `currency_symbol` |

### InfoField (extends Text)
| OOP | Array Key |
|---|---|
| `$link_url` | `link_url` |
| `$link_text` | `link_text` |
| `$show_icon` | `show_icon` |

### HtmlField (extends Field directly)
| OOP | Array Key |
|---|---|
| `$html_content` | `html_content` |
| `$css_classes` | `css_classes` |
| `$escape_html` | `escape_html` |
| `$allow_shortcodes` | `allow_shortcodes` |

### NoticeField (extends Field directly)
| OOP | Array Key |
|---|---|
| `$notice_type` | `notice_type` |
| `$notice_icon` | `notice_icon` |
| `$notice_title` | `notice_title` (via set_title) |
| `$notice_description` | `notice_description` (via set_description) |
| `$link_title` | `link_title` |
| `$link_url` | `link_url` |
| `$link_icon` | `link_icon` |
| `$active_tab` | `active_tab` |

### DoubleInput (extends Field directly)
| OOP | Array Key |
|---|---|
| `$label` | `label` |
| `$first_label` | `first_label` |
| `$first_value` | `first_value` |
| `$first_placeholder` | `first_placeholder` |
| `$first_prefix` | `first_prefix` |
| `$first_suffix` | `first_suffix` |
| `$first_required` | `first_required` |
| `$first_value_type` | `first_value_type` |
| `$second_label` | `second_label` |
| `$second_value` | `second_value` |
| `$second_placeholder` | `second_placeholder` |
| `$second_prefix` | `second_prefix` |
| `$second_suffix` | `second_suffix` |
| `$second_required` | `second_required` |
| `$second_value_type` | `second_value_type` |

### CombineInput (extends Field directly)
| OOP | Array Key |
|---|---|
| `$additional_fee` | `additional_fee` |
| `$admin_percentage` | `admin_percentage` |
| `$is_automated` | `is_automated` |

### CategoryBasedCommission (extends Field directly)
| OOP | Array Key |
|---|---|
| `$reset_subcategory` | `reset_subcategory` |

### BaseFieldLabel (extends Text)
| OOP | Array Key |
|---|---|
| `$suffix` | `suffix` |

### FieldGroup
| OOP | Array Key |
|---|---|
| `$content_class` | `content_class` |

### Pro Custom Field Properties

#### MenuManagerField
| OOP | Array Key |
|---|---|
| `$api_endpoint` | `api_endpoint` |
| default | Dynamic from `Settings::get_processed_menu_data()` |

#### VerificationMethodsField
| OOP | Array Key |
|---|---|
| `$api_endpoint` | `api_endpoint` |

#### DeliveryDaysField
| Populate Output | Array Key |
|---|---|
| days array | `days` |
| is12Hour | `is_12_hour` |
| default | `default` (7-day structure) |

#### ColorCustomizerField
| Populate Output | Array Key |
|---|---|
| default | `default` (color palette) |
| options | `options` (palette options) |
