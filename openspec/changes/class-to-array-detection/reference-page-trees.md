# Page Element Trees → Flat Array Conversion

> **Convention**: All user-facing strings (`title`, `description`, `placeholder`, `tooltip`, `helper_text`, option `title`, enable/disable state `label`, confirm_modal texts) MUST use `__( 'string', 'dokan-lite' )` for Lite or `__( 'string', 'dokan' )` for Pro. Internal keys (`id`, `value`, `variant`, `default` when it's a key like `'on'`/`'off'`) are NOT translated.

## GeneralPage (HYBRID, priority: 100, storage: dokan_settings_general)

```php
// Page
['id' => 'general', 'type' => 'page', 'title' => __( 'General', 'dokan-lite' ), 'priority' => 100, 'storage_key' => 'dokan_settings_general'],

// SubPage: marketplace
['id' => 'marketplace', 'type' => 'subpage', 'page_id' => 'general', 'title' => __( 'Marketplace', 'dokan-lite' ), 'priority' => 100,
 'description' => __( 'Configure core marketplace functionalities and customer shopping experience.', 'dokan-lite' ),
 'doc_link' => 'https://wedevs.com/docs/dokan/developers/marketplace/'],

// Section: marketplace_settings
['id' => 'marketplace_settings', 'type' => 'section', 'subpage_id' => 'marketplace'],

// Field: vendor_store_url
['id' => 'vendor_store_url', 'type' => 'field', 'variant' => 'text', 'section_id' => 'marketplace_settings',
 'title' => __( 'Vendor Store URL', 'dokan-lite' ),
 'description' => __( 'Define the vendor store URL ({site_url}/[this-text]/[vendor-name])', 'dokan-lite' ),
 'default' => 'store', 'placeholder' => __( 'Store', 'dokan-lite' ),
 'validations' => [['not_in' => /* reserved slugs */]], 'validation_func' => /* callable */],

// Note: Fields below injected by Pro GeneralSettings via dokan_settings_general_marketplace_marketplace_settings_children
// enable_single_seller_mode (switch), store_category_mode (radio_capsule),
// show_customer_details_to_vendors (switch), guest_product_enquiry (switch),
// add_to_cart_button_visibility (switch)

// Note: live_search section injected by Pro GeneralSettings via dokan_settings_general_marketplace_children

// SubPage: dokan_pages
['id' => 'dokan_pages', 'type' => 'subpage', 'page_id' => 'general', 'title' => __( 'Page Setup', 'dokan-lite' ), 'priority' => 200,
 'description' => __( 'Link your WordPress pages to essential Dokan marketplace functions and features.', 'dokan-lite' ),
 'doc_link' => 'https://wedevs.com/docs/dokan/settings/page-settings-2/'],

['id' => 'dashboard_section', 'type' => 'section', 'subpage_id' => 'dokan_pages'],
['id' => 'dashboard', 'type' => 'field', 'variant' => 'select', 'section_id' => 'dashboard_section',
 'title' => __( 'Dashboard', 'dokan-lite' ), 'description' => __( 'Select a page to show vendor dashboard.', 'dokan-lite' ),
 'placeholder' => __( 'Select page', 'dokan-lite' ), 'options' => /* dynamic pages list */],

['id' => 'my_orders_section', 'type' => 'section', 'subpage_id' => 'dokan_pages'],
['id' => 'my_orders', 'type' => 'field', 'variant' => 'select', 'section_id' => 'my_orders_section',
 'title' => __( 'My Orders', 'dokan-lite' ), 'placeholder' => __( 'Select page', 'dokan-lite' )],

['id' => 'store_listing_section', 'type' => 'section', 'subpage_id' => 'dokan_pages'],
['id' => 'store_listing', 'type' => 'field', 'variant' => 'select', 'section_id' => 'store_listing_section',
 'title' => __( 'Store Listing', 'dokan-lite' ), 'placeholder' => __( 'Select page', 'dokan-lite' )],

['id' => 'reg_tc_page_section', 'type' => 'section', 'subpage_id' => 'dokan_pages'],
['id' => 'reg_tc_page', 'type' => 'field', 'variant' => 'select', 'section_id' => 'reg_tc_page_section',
 'title' => __( 'Terms and Conditions Page', 'dokan-lite' ), 'placeholder' => __( 'Select page', 'dokan-lite' ),
 'tooltip' => __( 'Select a page to display the Terms and Conditions of your store for Vendors.', 'dokan-lite' )],

// SubPage: location
['id' => 'location', 'type' => 'subpage', 'page_id' => 'general', 'title' => __( 'Location', 'dokan-lite' ), 'priority' => 300,
 'description' => __( 'Configure how map locations are displayed throughout your marketplace.', 'dokan-lite' )],

['id' => 'map_api_configuration', 'type' => 'section', 'subpage_id' => 'location'],
['id' => 'map_api_source', 'type' => 'field', 'variant' => 'radio_capsule', 'section_id' => 'map_api_configuration',
 'title' => __( 'Map API Source', 'dokan-lite' ),
 'description' => __( 'Which map API source you want to use in your site?', 'dokan-lite' ),
 'default' => 'google_maps',
 'options' => [
     ['title' => __( 'Google Maps', 'dokan-lite' ), 'value' => 'google_maps'],
     ['title' => __( 'Mapbox', 'dokan-lite' ), 'value' => 'mapbox'],
 ]],

['id' => 'google_map_api_key', 'type' => 'fieldgroup', 'section_id' => 'map_api_configuration',
 'dependencies' => [['key' => 'location.map_api_configuration.map_api_source', 'value' => 'google_maps', 'comparison' => '===', 'effect' => 'show']]],
['id' => 'google_map_base', 'type' => 'field', 'variant' => 'base_field_label', 'field_group_id' => 'google_map_api_key',
 'title' => __( 'Google Map API Key', 'dokan-lite' ),
 'tooltip' => __( 'Insert Google API Key to display store map.', 'dokan-lite' )],
['id' => 'google_map_api_key', 'type' => 'field', 'variant' => 'show_hide', 'field_group_id' => 'google_map_api_key',
 'placeholder' => __( 'Enter your Google Maps API key', 'dokan-lite' )],

['id' => 'mapbox_api_key', 'type' => 'fieldgroup', 'section_id' => 'map_api_configuration',
 'dependencies' => [['key' => 'location.map_api_configuration.map_api_source', 'value' => 'mapbox', 'comparison' => '===', 'effect' => 'show']]],
['id' => 'mapbox_map_base', 'type' => 'field', 'variant' => 'base_field_label', 'field_group_id' => 'mapbox_api_key',
 'title' => __( 'Mapbox API Key', 'dokan-lite' )],
['id' => 'mapbox_api_key', 'type' => 'field', 'variant' => 'show_hide', 'field_group_id' => 'mapbox_api_key',
 'placeholder' => __( 'Enter your Mapbox API key', 'dokan-lite' )],
```

**Element count: ~20 Lite elements** (+ Pro injections add ~10-15 more)

---

## TransactionPage (Pure ElementFactory, priority: 600, storage: dokan_settings_transaction)

```php
['id' => 'transaction', 'type' => 'page', 'title' => __( 'Transaction', 'dokan-lite' ), 'priority' => 600, 'icon' => 'ArrowRightLeft', 'storage_key' => 'dokan_settings_transaction'],

// SubPage: fees (priority: 100)
['id' => 'fees', 'type' => 'subpage', 'page_id' => 'transaction', 'priority' => 100, 'icon' => 'FileSpreadsheet',
 'title' => __( 'Fees', 'dokan-lite' ), 'description' => __( 'Configure how different types of fees are distributed between vendors and admin', 'dokan-lite' )],
['id' => 'fees', 'type' => 'section', 'subpage_id' => 'fees'],
['id' => 'shipping_fee', 'type' => 'field', 'variant' => 'radio_capsule', 'section_id' => 'fees',
 'title' => __( 'Shipping Fee', 'dokan-lite' ), 'default' => 'seller',
 'options' => [['title' => __( 'Vendor', 'dokan-lite' ), 'value' => 'seller'], ['title' => __( 'Admin', 'dokan-lite' ), 'value' => 'admin']]],
['id' => 'product_tax_fee', 'type' => 'field', 'variant' => 'radio_capsule', 'section_id' => 'fees',
 'title' => __( 'Product Tax Fee', 'dokan-lite' ), 'default' => 'seller',
 'options' => [['title' => __( 'Vendor', 'dokan-lite' ), 'value' => 'seller'], ['title' => __( 'Admin', 'dokan-lite' ), 'value' => 'admin']]],
['id' => 'shipping_tax_fee', 'type' => 'field', 'variant' => 'radio_capsule', 'section_id' => 'fees',
 'title' => __( 'Shipping Tax Fee', 'dokan-lite' ), 'default' => 'seller',
 'options' => [['title' => __( 'Vendor', 'dokan-lite' ), 'value' => 'seller'], ['title' => __( 'Admin', 'dokan-lite' ), 'value' => 'admin']]],

// SubPage: commission (priority: 200)
['id' => 'commission', 'type' => 'subpage', 'page_id' => 'transaction', 'priority' => 200,
 'title' => __( 'Commissions', 'dokan-lite' ), 'description' => __( 'Set up marketplace commission structure and earnings from vendor sales.', 'dokan-lite' )],
['id' => 'commission', 'type' => 'section', 'subpage_id' => 'commission'],
['id' => 'commission_type', 'type' => 'field', 'variant' => 'radio_capsule', 'section_id' => 'commission',
 'title' => __( 'Commission Type', 'dokan-lite' ), 'default' => 'fixed',
 'options' => [['title' => __( 'Fixed', 'dokan-lite' ), 'value' => 'fixed'], ['title' => __( 'Category Based', 'dokan-lite' ), 'value' => 'category_based']]],
['id' => 'admin_commission', 'type' => 'field', 'variant' => 'combine_input', 'section_id' => 'commission',
 'title' => __( 'Admin Commission', 'dokan-lite' ),
 'description' => __( 'Amount you will get from sales in both percentage and fixed fee', 'dokan-lite' ),
 'admin_percentage' => '10', 'additional_fee' => '10',
 'dependencies' => [['key' => 'commission.commission.commission_type', 'value' => 'fixed', 'comparison' => '===', 'effect' => 'show']]],
['id' => 'reset_sub_category_when_edit_all_category', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'commission',
 'title' => __( 'Apply Parent Category Commission to All Subcategories', 'dokan-lite' ),
 'default' => 'on',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off'],
 'dependencies' => [['key' => 'commission.commission.commission_type', 'value' => 'category_based', 'comparison' => '===', 'effect' => 'show']]],
['id' => 'commission_category_based_values', 'type' => 'field', 'variant' => 'category_based_commission', 'section_id' => 'commission',
 'title' => __( 'Admin Commission', 'dokan-lite' ),
 'dependencies' => [['key' => 'commission.commission.commission_type', 'value' => 'category_based', 'comparison' => '===', 'effect' => 'show']]],

// SubPage: withdraw_charge (priority: 300)
['id' => 'withdraw_charge', 'type' => 'subpage', 'page_id' => 'transaction', 'priority' => 300,
 'title' => __( 'Withdraw', 'dokan-lite' ), 'description' => __( 'Set up available withdrawal methods and transaction conditions for vendors.', 'dokan-lite' ),
 'doc_link' => 'https://dokan.co/docs/wordpress/withdraw/'],
['id' => 'section_withdraw_charge', 'type' => 'section', 'subpage_id' => 'withdraw_charge',
 'title' => __( 'Withdraw Methods and Charges', 'dokan-lite' )],

// PayPal group
['id' => 'withdraw_methods_group_paypal', 'type' => 'fieldgroup', 'section_id' => 'section_withdraw_charge'],
['id' => 'paypal_withdraw', 'type' => 'field', 'variant' => 'switch', 'field_group_id' => 'withdraw_methods_group_paypal',
 'title' => __( 'PayPal', 'dokan-lite' ), 'default' => 'on',
 'image_url' => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/transaction/paypal.svg',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off']],
['id' => 'paypal_withdraw_charges', 'type' => 'field', 'variant' => 'combine_input', 'field_group_id' => 'withdraw_methods_group_paypal',
 'title' => __( 'Withdraw charges', 'dokan-lite' ),
 'admin_percentage' => '0.00', 'additional_fee' => '0.00',
 'dependencies' => [['key' => 'withdraw_charge.section_withdraw_charge.withdraw_methods_group_paypal.paypal_withdraw', 'value' => 'on', 'comparison' => '===', 'effect' => 'show']]],

// Bank group
['id' => 'withdraw_methods_group_bank', 'type' => 'fieldgroup', 'section_id' => 'section_withdraw_charge'],
['id' => 'bank_transfer_withdraw', 'type' => 'field', 'variant' => 'switch', 'field_group_id' => 'withdraw_methods_group_bank',
 'title' => __( 'Bank Transfer', 'dokan-lite' ), 'default' => 'off',
 'image_url' => DOKAN_PLUGIN_ASSEST . '/images/admin-settings-icons/transaction/bank-transfer.svg',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off']],
['id' => 'bank_transfer_withdraw_charges', 'type' => 'field', 'variant' => 'combine_input', 'field_group_id' => 'withdraw_methods_group_bank',
 'title' => __( 'Withdraw charges', 'dokan-lite' ),
 'admin_percentage' => '0.00', 'additional_fee' => '0.00'],

// Skrill group (similar pattern — Pro adds more via _children hooks)

['id' => 'minimum_withdraw_limit_section', 'type' => 'section', 'subpage_id' => 'withdraw_charge'],
['id' => 'minimum_withdraw_limit', 'type' => 'field', 'variant' => 'number', 'section_id' => 'minimum_withdraw_limit_section',
 'title' => __( 'Minimum Withdraw Limit', 'dokan-lite' ), 'default' => 50],

['id' => 'cod_payments_section', 'type' => 'section', 'subpage_id' => 'withdraw_charge'],
['id' => 'cod_payments', 'type' => 'field', 'variant' => 'radio_capsule', 'section_id' => 'cod_payments_section',
 'title' => __( 'COD Payments', 'dokan-lite' ), 'default' => 'include',
 'options' => [['title' => __( 'Include', 'dokan-lite' ), 'value' => 'include'], ['title' => __( 'Exclude', 'dokan-lite' ), 'value' => 'exclude']]],

// SubPage: reverse_withdrawal (priority: 400)
['id' => 'reverse_withdrawal', 'type' => 'subpage', 'page_id' => 'transaction', 'priority' => 400,
 'title' => __( 'Reverse Withdrawal', 'dokan-lite' ),
 'description' => __( 'Set up commission collection from vendors on Cash on Delivery orders.', 'dokan-lite' ),
 'doc_link' => 'https://wedevs.com/docs/dokan/withdraw/dokan-reverse-withdrawal/'],
['id' => 'reverse_withdrawal_section', 'type' => 'section', 'subpage_id' => 'reverse_withdrawal'],
['id' => 'enabled', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'reverse_withdrawal_section',
 'title' => __( 'Activate Reverse Withdrawal (Cash On Delivery)', 'dokan-lite' ), 'default' => 'off',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off']],
['id' => 'billing_type', 'type' => 'field', 'variant' => 'radio_capsule', 'section_id' => 'reverse_withdrawal_section',
 'title' => __( 'Billing Type', 'dokan-lite' ), 'default' => 'by_amount',
 'options' => [['title' => __( 'By Amount Limit', 'dokan-lite' ), 'value' => 'by_amount'], ['title' => __( 'Monthly', 'dokan-lite' ), 'value' => 'by_month']]],
['id' => 'reverse_balance_threshold', 'type' => 'field', 'variant' => 'number', 'section_id' => 'reverse_withdrawal_section',
 'title' => __( 'Reverse Balance Threshold', 'dokan-lite' ), 'default' => 150, 'min_value' => 0, 'step' => 0.5,
 'dependencies' => [['key' => 'reverse_withdrawal.reverse_withdrawal_section.billing_type', 'value' => 'by_amount', 'comparison' => '===', 'effect' => 'show']]],
['id' => 'monthly_billing_day', 'type' => 'field', 'variant' => 'number', 'section_id' => 'reverse_withdrawal_section',
 'title' => __( 'Monthly Billing Date', 'dokan-lite' ), 'default' => 1, 'min_value' => 1, 'max_value' => 28,
 'dependencies' => [['key' => 'reverse_withdrawal.reverse_withdrawal_section.billing_type', 'value' => 'by_month', 'comparison' => '===', 'effect' => 'show']]],
['id' => 'due_period', 'type' => 'field', 'variant' => 'number', 'section_id' => 'reverse_withdrawal_section',
 'title' => __( 'Grace Period', 'dokan-lite' ), 'default' => 7, 'min_value' => 0, 'max_value' => 28, 'step' => 1,
 'postfix' => __( 'Days', 'dokan-lite' )],
['id' => 'failed_actions', 'type' => 'field', 'variant' => 'multicheck', 'section_id' => 'reverse_withdrawal_section',
 'title' => __( 'Penalty Actions After Grace Period', 'dokan-lite' ), 'default' => ['enable_catalog_mode'],
 'options' => [
     ['title' => __( 'Disable Add to Cart Button', 'dokan-lite' ), 'value' => 'enable_catalog_mode'],
     ['title' => __( 'Hide Withdraw Menu', 'dokan-lite' ), 'value' => 'hide_withdraw_menu'],
     ['title' => __( 'Make Vendor Status Inactive', 'dokan-lite' ), 'value' => 'status_inactive'],
 ]],
['id' => 'display_notice', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'reverse_withdrawal_section',
 'title' => __( 'Display Notice During Grace Period', 'dokan-lite' ), 'default' => 'on',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off']],
```

**Element count: ~35 Lite elements** (+ Pro WithdrawSettings adds ~20 more)

---

## VendorPage (Pure ElementFactory, priority: 400, storage: dokan_settings_vendor)

```php
['id' => 'vendor', 'type' => 'page', 'title' => __( 'Vendors', 'dokan-lite' ), 'priority' => 400, 'icon' => 'Users', 'storage_key' => 'dokan_settings_vendor'],

// SubPage: vendor_onboarding
['id' => 'vendor_onboarding', 'type' => 'subpage', 'page_id' => 'vendor', 'priority' => 100,
 'title' => __( 'Vendor Onboarding', 'dokan-lite' ),
 'description' => __( 'Control the onboarding experience for vendors joining your marketplace.', 'dokan-lite' )],
['id' => 'enable_selling', 'type' => 'field', 'variant' => 'radio_capsule', 'subpage_id' => 'vendor_onboarding',
 'title' => __( 'Enable Selling', 'dokan-lite' ), 'default' => 'automatically'],
['id' => 'address_fields', 'type' => 'field', 'variant' => 'switch', 'subpage_id' => 'vendor_onboarding',
 'title' => __( 'Address Fields', 'dokan-lite' ), 'default' => 'on',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off']],
// Note: Pro VendorSettings injects 4 more fields via _children hook

// SubPage: vendor_capabilities
['id' => 'vendor_capabilities', 'type' => 'subpage', 'page_id' => 'vendor', 'priority' => 300,
 'title' => __( 'Vendor Capabilities', 'dokan-lite' )],
['id' => 'vendor_capabilities', 'type' => 'section', 'subpage_id' => 'vendor_capabilities'],
['id' => 'one_page_creation', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'vendor_capabilities',
 'title' => __( 'One Page Product Creation', 'dokan-lite' ), 'default' => 'off',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off']],
['id' => 'product_popup', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'vendor_capabilities',
 'title' => __( 'Product Popup', 'dokan-lite' ), 'default' => 'on',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off'],
 'dependencies' => [['key' => 'vendor_capabilities.vendor_capabilities.one_page_creation', 'value' => 'on', 'comparison' => '!==', 'effect' => 'show']]],
['id' => 'order_status_change', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'vendor_capabilities',
 'title' => __( 'Order Status Change', 'dokan-lite' ), 'default' => 'on',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off']],
['id' => 'select_any_category', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'vendor_capabilities',
 'title' => __( 'Select any category', 'dokan-lite' ), 'default' => 'off',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off']],
// Note: Pro VendorSettings injects 11 more fields via _children hook
```

**Element count: ~10 Lite elements** (+ Pro adds ~15 more)

---

## AppearancePage (Pure ElementFactory, priority: 700, storage: dokan_settings_appearance)

```php
['id' => 'appearance', 'type' => 'page', 'title' => __( 'Appearance', 'dokan-lite' ), 'priority' => 700, 'icon' => 'PanelsRightBottom', 'storage_key' => 'dokan_settings_appearance'],

['id' => 'store', 'type' => 'subpage', 'page_id' => 'appearance', 'priority' => 100,
 'title' => __( 'Store Page', 'dokan-lite' )],

['id' => 'products_page', 'type' => 'section', 'subpage_id' => 'store'],
['id' => 'store_product_per_page', 'type' => 'field', 'variant' => 'number', 'section_id' => 'products_page',
 'title' => __( 'Store Products Per Page', 'dokan-lite' ), 'default' => 12, 'min_value' => 1, 'step' => 1],

['id' => 'google_recaptcha', 'type' => 'section', 'subpage_id' => 'store'],
['id' => 'google_recaptcha_settings', 'type' => 'fieldgroup', 'section_id' => 'google_recaptcha'],
['id' => 'recaptcha', 'type' => 'field', 'variant' => 'switch', 'field_group_id' => 'google_recaptcha_settings',
 'title' => __( 'Google reCaptcha Validation', 'dokan-lite' ), 'default' => 'off',
 'enable_state' => ['label' => __( 'Enable', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disable', 'dokan-lite' ), 'value' => 'off']],
['id' => 'recaptcha_info', 'type' => 'field', 'variant' => 'info', 'field_group_id' => 'google_recaptcha_settings',
 'title' => __( 'Need Help?', 'dokan-lite' ),
 'dependencies' => [['key' => 'store.google_recaptcha.google_recaptcha_settings.recaptcha', 'value' => 'on', 'comparison' => '===', 'effect' => 'show']]],
['id' => 'recaptcha_site_key', 'type' => 'field', 'variant' => 'show_hide', 'field_group_id' => 'google_recaptcha_settings',
 'title' => __( 'Site Key', 'dokan-lite' ), 'placeholder' => __( 'Site Key', 'dokan-lite' ),
 'tooltip' => __( 'Insert Google reCAPTCHA v3 site key.', 'dokan-lite' ),
 'dependencies' => [['key' => 'store.google_recaptcha.google_recaptcha_settings.recaptcha', 'value' => 'on', 'comparison' => '===', 'effect' => 'show']]],
['id' => 'recaptcha_secret_key', 'type' => 'field', 'variant' => 'show_hide', 'field_group_id' => 'google_recaptcha_settings',
 'title' => __( 'Secret Key', 'dokan-lite' ), 'placeholder' => __( 'Secret Key', 'dokan-lite' ),
 'tooltip' => __( 'Insert Google reCAPTCHA v3 secret key.', 'dokan-lite' ),
 'dependencies' => [['key' => 'store.google_recaptcha.google_recaptcha_settings.recaptcha', 'value' => 'on', 'comparison' => '===', 'effect' => 'show']]],

['id' => 'store_contact_form_section', 'type' => 'section', 'subpage_id' => 'store'],
['id' => 'store_clossing_time_widget', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'store_contact_form_section',
 'title' => __( 'Show Contact Form on Store Page', 'dokan-lite' ), 'default' => 'on',
 'enable_state' => ['label' => __( 'Enable', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disable', 'dokan-lite' ), 'value' => 'off']],

['id' => 'store_banner_dimension_section', 'type' => 'section', 'subpage_id' => 'store'],
['id' => 'store_banner_dimension', 'type' => 'field', 'variant' => 'double_input', 'section_id' => 'store_banner_dimension_section',
 'title' => __( 'Store Banner Dimension', 'dokan-lite' ),
 'first_prefix' => __( 'Width', 'dokan-lite' ), 'second_prefix' => __( 'Height', 'dokan-lite' ),
 'default' => ['first' => 625, 'second' => 300]],

['id' => 'store_template', 'type' => 'section', 'subpage_id' => 'store'],
['id' => 'store_template', 'type' => 'field', 'variant' => 'customize_radio', 'section_id' => 'store_template',
 'title' => __( 'Store Header Template', 'dokan-lite' ), 'customize_variant' => 'template', 'default' => 'default',
 'options' => [
     ['title' => __( 'Template 1', 'dokan-lite' ), 'value' => 'default'],
     ['title' => __( 'Template 2', 'dokan-lite' ), 'value' => 'layout1'],
     ['title' => __( 'Template 3', 'dokan-lite' ), 'value' => 'layout2'],
     ['title' => __( 'Template 4', 'dokan-lite' ), 'value' => 'layout3'],
 ]],

['id' => 'store_time_widget_section', 'type' => 'section', 'subpage_id' => 'store'],
['id' => 'store_time_widget', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'store_time_widget_section',
 'title' => __( 'Store Opening Closing Time Widget', 'dokan-lite' ), 'default' => 'on'],

['id' => 'store_sidebar_section', 'type' => 'section', 'subpage_id' => 'store'],
['id' => 'store_opening_time', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'store_sidebar_section',
 'title' => __( 'Store Sidebar From Theme', 'dokan-lite' ), 'default' => 'off'],

['id' => 'vendor_info_visibility_section', 'type' => 'section', 'subpage_id' => 'store'],
['id' => 'vendor_info_visibility', 'type' => 'field', 'variant' => 'vendor_info_preview', 'section_id' => 'vendor_info_visibility_section',
 'title' => __( 'Vendor Info Visibility', 'dokan-lite' )],

['id' => 'dokan_font_section', 'type' => 'section', 'subpage_id' => 'store'],
['id' => 'dokan_font', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'dokan_font_section',
 'title' => __( 'Dokan font-awesome Functionality', 'dokan-lite' ), 'default' => 'off'],

['id' => 'single_product_preview_section', 'type' => 'section', 'subpage_id' => 'store'],
['id' => 'single_product_preview', 'type' => 'field', 'variant' => 'single_product_preview', 'section_id' => 'single_product_preview_section',
 'title' => __( 'Single Product Page Appearance', 'dokan-lite' )],
```

**Element count: ~25 Lite elements** (+ Pro adds social onboarding, color customizer, menu manager subpages)

---

## CompliancePage (Pure ElementFactory, priority: 1000)

```php
['id' => 'compliance', 'type' => 'page', 'title' => __( 'Compliance', 'dokan-lite' ), 'priority' => 1000],

['id' => 'privacy', 'type' => 'subpage', 'page_id' => 'compliance', 'priority' => 100],
['id' => 'privacy_settings', 'type' => 'section', 'subpage_id' => 'privacy'],
['id' => 'privacy_policy_display', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'privacy_settings',
 'title' => __( 'Privacy Policy', 'dokan-lite' ), 'default' => 'on',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off']],
['id' => 'privacy_policy_page', 'type' => 'field', 'variant' => 'select', 'section_id' => 'privacy_settings',
 'title' => __( 'Privacy Policy Page', 'dokan-lite' )],

['id' => 'privacy_policy_content', 'type' => 'section', 'subpage_id' => 'privacy'],
['id' => 'privacy_policy_content', 'type' => 'field', 'variant' => 'rich_text', 'section_id' => 'privacy_policy_content',
 'title' => __( 'Privacy Policy Content', 'dokan-lite' )],

['id' => 'admin_access_section', 'type' => 'section', 'subpage_id' => 'privacy'],
['id' => 'admin_access', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'admin_access_section',
 'title' => __( 'Admin Area Access', 'dokan-lite' ), 'default' => 'on',
 'enable_state' => ['label' => __( 'Enabled', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off']],

['id' => 'data_clear_section', 'type' => 'section', 'subpage_id' => 'privacy'],
['id' => 'data_clear_on_uninstall', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'data_clear_section',
 'title' => __( 'Clear Data on Uninstall', 'dokan-lite' ), 'default' => 'off',
 'switcher_type' => 'error', 'should_confirm' => true,
 'enable_state' => ['label' => __( 'Clear Data', 'dokan-lite' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan-lite' ), 'value' => 'off'],
 'confirm_modal' => [
     'title' => __( 'Are you sure to delete all data?', 'dokan-lite' ),
     'description' => __( 'All data and tables related to Dokan and Dokan Pro will be deleted permanently.', 'dokan-lite' ),
     'confirmText' => __( 'Yes, Delete', 'dokan-lite' ),
     'cancelText' => __( 'Cancel', 'dokan-lite' ),
     'checkboxLabel' => __( 'Yes, I understand.', 'dokan-lite' ),
 ]],
```

**Element count: ~11 Lite elements** (+ Pro Germanized adds eu_compliance subpage)

---

## AIAssistPage (Pure ElementFactory, priority: 300)

```php
['id' => 'ai_assist', 'type' => 'page', 'title' => __( 'AI Assist', 'dokan-lite' ), 'priority' => 300],

['id' => 'product_generation', 'type' => 'subpage', 'page_id' => 'ai_assist', 'priority' => 100,
 'title' => __( 'Product Generation', 'dokan-lite' )],
['id' => 'product_image_section', 'type' => 'section', 'subpage_id' => 'product_generation'],
['id' => 'product_info_generate', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'product_image_section',
 'title' => __( 'Product Info Generation', 'dokan-lite' ), 'default' => 'off'],
['id' => 'product_info_engine', 'type' => 'field', 'variant' => 'select', 'section_id' => 'product_image_section',
 'title' => __( 'AI Engine', 'dokan-lite' ), 'default' => 'openai',
 'dependencies' => [['key' => 'product_generation.product_image_section.product_info_generate', 'value' => 'on', 'comparison' => '===', 'effect' => 'show']]],
// Dynamic FieldGroups per AI provider: {provider}_api_info_group
// Each with: base_field_label, info, show_hide (api_key), select (model)
// Similar pattern for product_description_section (image enhancement)
```

**Element count: ~15+ Lite elements** (dynamic based on registered AI providers)

---

## ModerationPage (Shell page, priority: 900)

```php
['id' => 'moderation', 'type' => 'page', 'title' => __( 'Moderation', 'dokan-lite' ), 'priority' => 900, 'icon' => 'Settings2',
 'description' => __( 'Configure moderation settings, return policies, and customer request management.', 'dokan-lite' )],
// Shell page — Pro modules inject via dokan_settings_moderation_children
```

---

## ProductPage (Shell page, priority: 200)

```php
['id' => 'product', 'type' => 'page', 'title' => __( 'Product', 'dokan-lite' ), 'priority' => 200, 'icon' => 'Box',
 'description' => __( 'Configure product-related settings for your marketplace.', 'dokan-lite' )],
// Shell page — Pro modules inject via dokan_settings_product_children
```

---

## Pro: ShipmentPage (priority: 800, storage: dokan_settings_shipment)

```php
['id' => 'shipment', 'type' => 'page', 'title' => __( 'Shipment', 'dokan' ), 'priority' => 800, 'icon' => 'Truck', 'storage_key' => 'dokan_settings_shipment'],

['id' => 'shipment-setting-page', 'type' => 'subpage', 'page_id' => 'shipment', 'priority' => 100,
 'title' => __( 'Shipment Setting', 'dokan' )],

['id' => 'shipment-settings', 'type' => 'section', 'subpage_id' => 'shipment-setting-page'],
['id' => 'allows_shipment_tracking', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'shipment-settings',
 'title' => __( 'Allow Shipment Tracking', 'dokan' ), 'default' => 'off'],
['id' => 'enable_shipstation_logging', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'shipment-settings',
 'title' => __( 'Enable ShipStation Logging', 'dokan' ), 'default' => 'off'],
['id' => 'allow_mark_received', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'shipment-settings',
 'title' => __( 'Allow Mark as Received', 'dokan' ), 'default' => 'off',
 'dependencies' => [['key' => 'shipment-setting-page.shipment-settings.allows_shipment_tracking', 'value' => 'on', 'comparison' => '===', 'effect' => 'show']]],

['id' => 'shipment-provider', 'type' => 'section', 'subpage_id' => 'shipment-setting-page',
 'title' => __( 'Shipment Providers', 'dokan' )],
// 18 provider switches: sp-australia-post, sp-dhl, sp-fedex, sp-ups, sp-usps, sp-other, etc.
// Each uses __( 'Provider Name', 'dokan' ) and enable_state/disable_state with provider ID

['id' => 'shipment-status', 'type' => 'section', 'subpage_id' => 'shipment-setting-page',
 'title' => __( 'Shipment Status', 'dokan' )],
['id' => 'shipping_status_list', 'type' => 'field', 'variant' => 'repeater', 'section_id' => 'shipment-status',
 'default' => [
     ['id' => 'ss_delivered', 'title' => __( 'Delivered', 'dokan' ), 'required' => 1],
     ['id' => 'ss_cancelled', 'title' => __( 'Cancelled', 'dokan' ), 'required' => 1],
     ['id' => 'ss_procressing', 'title' => __( 'Processing', 'dokan' )],
     ['id' => 'ss_ready_for_pickup', 'title' => __( 'Ready for Pickup', 'dokan' )],
     ['id' => 'ss_pickedup', 'title' => __( 'Picked Up', 'dokan' )],
     ['id' => 'ss_on_the_way', 'title' => __( 'On the way', 'dokan' )],
 ]],
```

**Element count: ~25 elements**

---

## Pro: EmailVerificationPage (priority: 500, storage: dokan_verification)

```php
['id' => 'verification', 'type' => 'page', 'title' => __( 'Vendor Verification', 'dokan' ), 'priority' => 500, 'icon' => 'Shield', 'storage_key' => 'dokan_verification'],

['id' => 'email-verification-page', 'type' => 'subpage', 'page_id' => 'verification', 'priority' => 200,
 'title' => __( 'Email Verification', 'dokan' )],

['id' => 'email-verification', 'type' => 'section', 'subpage_id' => 'email-verification-page'],
['id' => 'enabled', 'type' => 'field', 'variant' => 'switch', 'section_id' => 'email-verification',
 'title' => __( 'Email Verification', 'dokan' ), 'default' => 'off',
 'enable_state' => ['label' => __( 'Enabled', 'dokan' ), 'value' => 'on'],
 'disable_state' => ['label' => __( 'Disabled', 'dokan' ), 'value' => 'off']],

['id' => 'registration-notice', 'type' => 'section', 'subpage_id' => 'email-verification-page'],
['id' => 'registration_notice', 'type' => 'field', 'variant' => 'textarea', 'section_id' => 'registration-notice',
 'title' => __( 'Registration Notice', 'dokan' ),
 'default' => __( 'Please check your email and complete email verification to login.', 'dokan' )],

['id' => 'login-notice', 'type' => 'section', 'subpage_id' => 'email-verification-page'],
['id' => 'login_notice', 'type' => 'field', 'variant' => 'textarea', 'section_id' => 'login-notice',
 'title' => __( 'Login Notice', 'dokan' ),
 'default' => __( 'Please check your email and complete email verification to login.', 'dokan' )],
```

**Element count: ~8 elements**
