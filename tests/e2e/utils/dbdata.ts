export const dbData = {

	dokan: {

		optionName: {
			general: 'dokan_general',
			selling: 'dokan_selling',
			withdraw: 'dokan_withdraw',
			reverseWithdraw: 'dokan_reverse_withdrawal',
			page: 'dokan_pages',
			appearance: 'dokan_appearance',
			privacyPolicy: 'dokan_privacy',
			colors:  'dokan_colors',
			// liveSearch:
			storeSupport: 'dokan_store_support_setting',
			// sellerVerification:
			// verificationSMSGateways:
			// emailVerification:
			// socialAPI:
			// shippingStatus:
			// quoteSettings:
			// liveChat:
			rma: 'dokan_rma',
			wholesale: 'dokan_wholesale',
			// euCompliance:
			deliveryTime: 'dokan_delivery_time',
			productAdvertising: 'dokan_product_advertisement',
			geolocation: 'dokan_geolocation',
			productReportAbuse: 'dokan_report_abuse',
			singleProductMultiVendor: 'dokan_spmv',
			vendorSubscription: 'dokan_product_subscription',
		// vendorAnalytics:
		},

		generalSettings: {
			site_options: '',
			admin_access: 'off',
			custom_store_url: 'store',
			setup_wizard_logo_url: '',
			setup_wizard_message: '<p>Thank you for choosing The Marketplace to power your online store! This quick setup wizard will help you configure the basic settings. <strong>It&rsquo;s completely optional and shouldn&rsquo;t take longer than two minutes.</strong></p>',
			disable_welcome_wizard: 'off',
			global_digital_mode: 'sell_both',
			enable_shipstation_logging: 'off',
			data_clear_on_uninstall: 'off',
			vendor_store_options: '',
			seller_enable_terms_and_conditions: 'on',
			store_products_per_page: '12',
			enabled_address_on_reg: 'off',
			enable_tc_on_reg: 'on',
			enable_single_seller_mode: 'off',
			store_category_type: 'none'
		},

		sellingSettings:  {
			admin_percentage: '10',
			shipping_fee_recipient: 'seller',
			tax_fee_recipient: 'seller',
			automatic_process_api_refund: 'off',
			selling_capabilities: '',
			new_seller_enable_selling: 'on',
			disable_product_popup: 'off',
			order_status_change: 'on',
			dokan_any_category_selection: 'off',
			product_status: 'publish',
			vendor_duplicate_product: 'on',
			edited_product_status: 'off',
			product_add_mail: 'on',
			product_category_style: 'single',
			product_vendors_can_create_tags: 'on',
			add_new_attribute: 'off',
			discount_edit: {
				'order-discount': 'order-discount',
				'product-discount': 'product-discount'
			},
			hide_customer_info: 'off',
			seller_review_manage: 'on',
			new_seller_enable_auction: 'on',
			enable_guest_user_enquiry: 'on',
			enable_min_max_quantity: 'on',
			enable_min_max_amount: 'on',
			disable_shipping_tab: 'off',
			catalog_mode_settings: '',
			catalog_mode_hide_add_to_cart_button: 'off',
			catalog_mode_hide_product_price: 'off',
			commission_type: 'percentage',
			additional_fee: ''
		},

		withdrawSettings: {
			'withdraw_methods': {
				'paypal': 'paypal',
				'bank': 'bank',
				'dokan_custom': 'dokan_custom',
				'skrill': 'skrill'
			},
			'withdraw_method_name': 'Bksh',
			'withdraw_method_type': 'Phone',
			'withdraw_limit': '5',
			'withdraw_order_status': {
				'wc-completed': 'wc-completed',
				'wc-processing': 'wc-processing'
			},
			'exclude_cod_payment': 'off',
			'withdraw_date_limit': '0',
			'hide_withdraw_option': 'off',
			'disbursement_schedule_settings': '',
			'disbursement': {
				'manual': 'manual',
				'schedule': 'schedule'
			},
			'disbursement_schedule': {
				'quarterly': 'quarterly',
				'monthly': 'monthly',
				'biweekly': 'biweekly',
				'weekly': 'weekly'
			},
			'quarterly_schedule': {
				'month': 'march',
				'week': '1',
				'days': 'monday'
			},
			'monthly_schedule': {
				'week': '1',
				'days': 'monday'
			},
			'biweekly_schedule': {
				'week': '1',
				'days': 'monday'
			},
			'weekly_schedule': 'monday',
			'send_announcement_for_payment_change': 'false',
			'send_announcement_for_disbursement_schedule_change': 'false'
		},

		reverseWithdrawSettings: {
			'enabled': 'on',
			'payment_gateways': {
				'cod': 'cod'
			},
			'billing_type': 'by_amount',
			'reverse_balance_threshold': '21',
			'monthly_billing_day': '1',
			'due_period': '7',
			'failed_actions': {
				'enable_catalog_mode': 'enable_catalog_mode',
				'hide_withdraw_menu': 'hide_withdraw_menu',
				'status_inactive': 'status_inactive'
			},
			'display_notice': 'on',
			'send_announcement': 'on'
		},

		pageSettings: {
			'dashboard': '4',
			'store_listing': '5',
			'my_orders': '6',
			'reg_tc_page': '2'
		},

		appearanceSettings: {
			'appearance_options': '',
			'store_map': 'on',
			'map_api_source': 'google_maps',
			'gmap_api_key': 'AIzaSyCiSPh9A7SYaO2sbZQ4qQo11AWyYB3UFvY',
			'mapbox_access_token': '',
			'recaptcha_validation_label': '',
			'contact_seller': 'on',
			'store_header_template': 'default',
			'store_banner_width': '625',
			'store_banner_height': '300',
			'store_open_close': 'on',
			'enable_theme_store_sidebar': 'off',
			'show_vendor_info': 'on',
			'hide_vendor_info': {
				'email': '',
				'phone': '',
				'address': ''
			}
		},

		privacyPolicySettings: {
			'enable_privacy': 'on',
			'privacy_page': '2',
		// 'privacy_policy': '<p>Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [dokan_privacy_policy]<\/p>'
		},

		colorsSettings:  {
			'store_color_pallete': {
				'value': 'default',
				'btn_text': '#FFFFFF',
				'btn_hover': '#DD3B0F',
				'btn_primary': '#F05025',
				'dash_nav_bg': '#1B233B',
				'dash_nav_text': '#CFCFCF',
				'pallete_status': 'template',
				'btn_hover_text': '#FFFFFF',
				'dash_active_link': '#F05025',
				'btn_hover_border': '#C83811',
				'btn_primary_border': '#DA502B',
				'dash_nav_active_text': '#FFFFFF',
				'color_options': {
					'color-1': '#1B233B',
					'color-2': '#F05025',
					'color-3': '#CFCFCF',
					'color-4': '#DD3B0F'
				}
			}
		},

		//TODO:  liveSearchSettings:

		storeSupportSettings: {
			'enabled_for_customer_order': 'on',
			'store_support_product_page': 'above_tab',
			'support_button_label': 'Get Support',
			'dokan_admin_email_notification': 'on'
		},

		//TODO:
		// sellerVerificationSettings:
		// verificationSMSGatewaysSettings:
		// emailVerificationSettings:
		// socialAPISettings:
		// shippingStatusSettings:
		// quoteSettingsSettings:
		// liveChatSettings:

		rmaSettings: {
			'rma_order_status': 'wc-processing',
			'rma_enable_refund_request': 'on',
			'rma_enable_coupon_request': 'on',
			'rma_reasons': [
				{
					'id': 'defective',
					'value': 'Defective'
				},
				{
					'id': 'wrong_product',
					'value': 'Wrong Product'
				},
				{
					'id': 'other',
					'value': 'Other'
				}
			],
		// 'rma_policy': '<p>Refund Policy<\/p>'
		},

		wholesaleSettings: {
			'wholesale_price_display': 'all_user',
			'display_price_in_shop_archieve': 'on',
			'need_approval_for_wholesale_customer': 'off'
		},

		//TODO: euComplianceSettings:


		deliveryTimeSettings: {
			'allow_vendor_override_settings': 'off',
			'delivery_support': {
				'delivery': 'delivery',
				'store-pickup': 'store-pickup'
			},
			'delivery_date_label': 'Delivery Date',
			'preorder_date': 0,
			'time_slot_minutes': 30,
			'order_per_slot': 0,
			'delivery_box_info': 'This store needs %DAY% day(s) to process your delivery request',
			'selection_required': 'on',
			'delivery_day': '',
			'delivery_day_monday': {
				'delivery_status': 'monday',
				'opening_time': '12:00 am',
				'closing_time': '11:59 pm'
			},
			'delivery_day_tuesday': {
				'delivery_status': 'tuesday',
				'opening_time': '1:00 pm',
				'closing_time': '2:00 pm'
			},
			'delivery_day_wednesday': {
				'delivery_status': '',
				'opening_time': '',
				'closing_time': ''
			},
			'delivery_day_thursday': {
				'delivery_status': '',
				'opening_time': '',
				'closing_time': ''
			},
			'delivery_day_friday': {
				'delivery_status': '',
				'opening_time': '',
				'closing_time': ''
			},
			'delivery_day_saturday': {
				'delivery_status': '',
				'opening_time': '',
				'closing_time': ''
			},
			'delivery_day_sunday': {
				'delivery_status': '',
				'opening_time': '',
				'closing_time': ''
			}
		},

		productAdvertisingSettings: {
			'total_available_slot': '100',
			'expire_after_days': '10',
			'per_product_enabled': 'on',
			'cost': '15',
			'vendor_subscription_enabled': 'on',
			'featured': 'on',
			'catalog_priority': 'on',
			'hide_out_of_stock_items': 'on'
		},

		geolocationSettings: {
			'show_locations_map': 'top',
			'show_location_map_pages': 'all',
			'show_filters_before_locations_map': 'on',
			'show_product_location_in_wc_tab': 'on',
			'distance_unit': 'km',
			'distance_min': '0',
			'distance_max': '10',
			'map_zoom': '11',
			'location': {
				'latitude': '23.709921',
				'longitude': '90.40714300000002',
				'address': 'Dhaka',
				'zoom': '10'
			}
		},

		productReportAbuseSettings: {
			'abuse_reasons': [
				{
					'id': 'report_as_spam',
					'value': 'This content is spam'
				},
				{
					'id': 'report_as_adult',
					'value': 'This content should marked as adult'
				},
				{
					'id': 'report_as_abusive',
					'value': 'This content is abusive'
				},
				{
					'id': 'report_as_violent',
					'value': 'This content is violent'
				},
				{
					'id': 'report_as_risk_of_hurting',
					'value': 'This content suggests the author might be risk of hurting themselves'
				},
				{
					'id': 'report_as_infringes_copyright',
					'value': 'This content infringes upon my copyright'
				},
				{
					'id': 'report_as_contains_private_info',
					'value': 'This content contains my private information'
				},
				{
					'id': 'other',
					'value': 'Other'
				},
				{
					'id': 'this_product_is_fake',
					'value': 'This product is fake'
				}
			],
			'reported_by_logged_in_users_only': 'on'
		},

		spmvSettings: {
			'enable_pricing': 'on',
			'sell_item_btn': 'Sell This Item',
			'available_vendor_list_title': 'Other Available Vendor',
			'available_vendor_list_position': 'below_tabs',
			'show_order': 'show_all'
		},

		//TODO:  vendorAnalyticsSettings:

		vendorSubscriptionSettings: {
			'subscription_pack': '2',
			'enable_pricing': 'off',
			'enable_subscription_pack_in_reg': 'on',
			'notify_by_email': 'on',
			'no_of_days_before_mail': '2',
			'product_status_after_end': 'draft',
			'cancelling_email_subject': 'Subscription Package Cancel notification',
			'cancelling_email_body': 'Dear subscriber, Your subscription has expired. Please renew your package to continue using it.',
			'alert_email_subject': 'Subscription Ending Soon',
			'alert_email_body': 'Dear subscriber, Your subscription will be ending soon. Please renew your package in a timely'
		},

	}

	// activePlugins:    [
	// 	'Basic-Auth-master\/basic-auth.php',
	// 	'admin-bar-user-switching\/admin-bar-user-switching.php',
	// 	'dokan-pro\/dokan-pro.php',
	// 	'dokan\/dokan.php',
	// 	'elementor\/elementor.php',
	// 	'email-log\/email-log.php',
	// 	'flush-opcache\/flush-opcache.php',
	// 	'user-switching\/user-switching.php',
	// 	'woocommerce-bookings\/woocommerce-bookings.php',
	// 	'woocommerce-product-addons\/woocommerce-product-addons.php',
	// 	'woocommerce-simple-auctions\/woocommerce-simple-auctions.php',
	// 	'woocommerce-subscriptions\/woocommerce-subscriptions.php',
	// 	'woocommerce\/woocommerce.php',
	// 	'wp-reset\/wp-reset.php'
	// ]

	// siteSettings : {
	//     users_can_register: 1
	//     start_of_week:1
	//     date_format	F j, Y
	//     time_format	g:i a	yes
	//     permalink_structure	/%postname%/
	//     default_role	subscriber
	//     timezone_string	Asia/Dhaka
	// }


};