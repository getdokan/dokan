export const dbData = {

	dokan: {

		optionName: {
			general           : 'dokan_general',
			selling           : 'dokan_selling',
			withdraw          : 'dokan_withdraw',
			reverseWithdraw   : 'dokan_reverse_withdrawal',
			page              : 'dokan_pages',
			appearance        : 'dokan_appearance',
			privacyPolicy     : 'dokan_privacy',
			colors            : 'dokan_colors',
			// liveSearch: 'dokan_live_search_setting',
			storeSupport      : 'dokan_store_support_setting',
			// sellerVerification: 'dokan_verification',
			// verificationSMSGateways: 'dokan_verification_sms_gateways',
			emailVerification : 'dokan_email_verification',
			// socialApi: 'dokan_social_api',
			shippingStatus    : 'dokan_shipping_status_setting',
			quote             : 'dokan_quote_settings',
			// liveChat: 'dokan_live_chat',
			rma               : 'dokan_rma',
			wholesale         : 'dokan_wholesale',
			euCompliance      : 'dokan_germanized',
			deliveryTime      : 'dokan_delivery_time',
			productAdvertising: 'dokan_product_advertisement',
			geolocation       : 'dokan_geolocation',
			productReportAbuse: 'dokan_report_abuse',
			spmv              : 'dokan_spmv',
			vendorSubscription: 'dokan_product_subscription',
			// vendorAnalytics:
			dokanActiveModules: 'dokan_pro_active_modules',
		},

		generalSettings: {

			// site settings
			site_options              : '',
			admin_access              : 'on', // vendor edit product test needs it to disable
			custom_store_url          : 'store',
			setup_wizard_logo_url     : '',
			setup_wizard_message      : '<p>Thank you for choosing The Marketplace to power your online store! This quick setup wizard will help you configure the basic settings. <strong>It&rsquo;s completely optional and shouldn&rsquo;t take longer than two minutes.<strong></p>',
			disable_welcome_wizard    : 'off',
			global_digital_mode       : 'sell_both',
			enable_shipstation_logging: 'off',
			data_clear_on_uninstall   : 'off',

			// vendor store settings
			vendor_store_options              : '',
			seller_enable_terms_and_conditions: 'on',
			store_products_per_page           : '12',
			enabled_address_on_reg            : 'off',
			enable_tc_on_reg                  : 'on',
			enable_single_seller_mode         : 'off',
			store_category_type               : 'multiple' // none, multiple
		},

		sellingSettings: {

			// commission
			selling_capabilities        : '',
			commission_type             : 'percentage',
			admin_percentage            : '10',
			shipping_fee_recipient      : 'seller',
			tax_fee_recipient           : 'seller',
			shipping_tax_fee_recipient  : 'seller',
			automatic_process_api_refund: 'off',

			// vendor capabilities
			additional_fee                 : '',
			new_seller_enable_selling      : 'on',
			one_step_product_create        : 'off',
			disable_product_popup          : 'off',
			order_status_change            : 'on',
			dokan_any_category_selection   : 'off',
			product_status                 : 'publish',
			vendor_duplicate_product       : 'on',
			edited_product_status          : 'off',
			product_add_mail               : 'on',
			product_category_style         : 'single',
			product_vendors_can_create_tags: 'on',
			add_new_attribute              : 'on',
			discount_edit                  : {
				'order-discount'  : 'order-discount',
				'product-discount': 'product-discount'
			},
			hide_customer_info       : 'off',
			seller_review_manage     : 'on',
			new_seller_enable_auction: 'on',
			enable_guest_user_enquiry: 'on',
			enable_min_max_quantity  : 'on',
			enable_min_max_amount    : 'on',
			disable_shipping_tab     : 'off',

			// catalog mode
			catalog_mode_settings               : '',
			catalog_mode_hide_add_to_cart_button: 'on',
			catalog_mode_hide_product_price     : 'on',
		},

		withdrawSettings: {

			// withdraw settings
			withdraw_methods: {
				paypal      : 'paypal',
				bank        : 'bank',
				dokan_custom: 'dokan_custom',
				skrill      : 'skrill'
			},
			withdraw_method_name : 'Bksh',
			withdraw_method_type : 'Phone',
			withdraw_limit       : '5',
			withdraw_order_status: {
				'wc-completed' : 'wc-completed',
				'wc-processing': 'wc-processing'
			},
			exclude_cod_payment : 'off',
			withdraw_date_limit : '0',
			hide_withdraw_option: 'off',

			// disbursement settings
			disbursement_schedule_settings: '',
			disbursement                  : {
				manual  : 'manual',
				schedule: 'schedule'
			},
			disbursement_schedule: {
				quarterly: 'quarterly',
				monthly  : 'monthly',
				biweekly : 'biweekly',
				weekly   : 'weekly'
			},
			quarterly_schedule: {
				month: 'march',
				week : '1',
				days : 'monday'
			},
			monthly_schedule: {
				week: '1',
				days: 'monday'
			},
			biweekly_schedule: {
				week: '1',
				days: 'monday'
			},
			weekly_schedule                                   : 'monday',
			send_announcement_for_payment_change              : 'false',
			send_announcement_for_disbursement_schedule_change: 'false'
		},

		reverseWithdrawSettings: {
			enabled         : 'on',
			payment_gateways: {
				cod: 'cod'
			},
			billing_type             : 'by_amount',
			reverse_balance_threshold: '10',
			monthly_billing_day      : '1',
			due_period               : '0',
			failed_actions           : {
				enable_catalog_mode: 'enable_catalog_mode',
				hide_withdraw_menu : 'hide_withdraw_menu',
				status_inactive    : 'status_inactive'
			},
			display_notice   : 'on',
			send_announcement: 'on'
		},

		pageSettings: {
			dashboard    : '4',
			store_listing: '5',
			my_orders    : '6',
			reg_tc_page  : '2'
		},

		appearanceSettings: {
			appearance_options        : '',
			store_map                 : 'on',
			map_api_source            : 'google_maps',
			gmap_api_key              : process.env.GMAP,
			mapbox_access_token       : '',
			recaptcha_validation_label: '',
			contact_seller            : 'on',
			store_header_template     : 'default',
			store_banner_width        : '625',
			store_banner_height       : '300',
			store_open_close          : 'on',
			enable_theme_store_sidebar: 'off',
			show_vendor_info          : 'on',
			hide_vendor_info          : {
				email  : '',
				phone  : '',
				address: ''
			}
		},

		privacyPolicySettings: {
			enable_privacy: 'on',
			privacy_page  : '2',
			privacy_policy: '<p>Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [dokan_privacy_policy]</p>'
		},

		colorsSettings: {
			store_color_pallete: {
				value               : 'default',
				btn_text            : '#FFFFFF',
				btn_hover           : '#DD3B0F',
				btn_primary         : '#F05025',
				dash_nav_bg         : '#1B233B',
				dash_nav_text       : '#CFCFCF',
				pallete_status      : 'template',
				btn_hover_text      : '#FFFFFF',
				dash_active_link    : '#F05025',
				btn_hover_border    : '#C83811',
				btn_primary_border  : '#DA502B',
				dash_nav_active_text: '#FFFFFF',
				color_options       : {
					'color-1': '#1B233B',
					'color-2': '#F05025',
					'color-3': '#CFCFCF',
					'color-4': '#DD3B0F'
				}
			}
		},

		liveSearchSettings: {
			live_search_option: 'suggestion_box'
		},

		storeSupportSettings: {
			enabled_for_customer_order    : 'on',
			store_support_product_page    : 'above_tab',
			support_button_label          : 'Get Support',
			dokan_admin_email_notification: 'on'
		},

		sellerVerificationSettings: {
			facebook_app_details: '',
			twitter_app_details : '',
			google_details      : '',
			linkedin_details    : '',
			fb_app_id           : '',
			fb_app_secret       : '',
			twitter_app_id      : '',
			twitter_app_secret  : '',
			google_app_id       : '',
			google_app_secret   : ''
		},

		verificationSMSGatewaysSettings: {
			sender_name   : 'weDevs Team',
			sms_text      : 'Your verification code is: %CODE%',
			sms_sent_msg  : 'SMS sent. Please enter your verification code',
			sms_sent_error: 'Unable to send sms. Contact admin',
			active_gateway: '',

			// nexmo details
			nexmo_details : '',
			nexmo_username: '',
			nexmo_pass    : '',

			// twilio details
			twilio_details: '',
		},

		emailVerificationSettings: {
			enabled            : 'off',
			registration_notice: 'Please check your email and complete email verification to login.',
			login_notice       : 'Please check your email and complete email verification to login.'
		},

		socialAPISettings: {
			section_title     : '',
			enabled           : 'on',
			facebook_details  : '',
			twitter_details   : '',
			google_details    : '',
			linkedin_details  : '',
			apple_details     : '',
			fb_app_id         : '',
			fb_app_secret     : '',
			twitter_app_id    : '',
			twitter_app_secret: ''
		},

		shippingStatusSettings: {
			enabled                 : 'on',
			shipping_status_provider: {
				'sp-dhl'                      : 'sp-dhl',
				'sp-dpd'                      : 'sp-dpd',
				'sp-fedex'                    : 'sp-fedex',
				'sp-polish-shipping-providers': 'sp-polish-shipping-providers',
				'sp-ups'                      : 'sp-ups',
				'sp-usps'                     : 'sp-usps',
				'sp-other'                    : 'sp-other'
			},
			shipping_status_list: [
				{
					id      : 'ss_delivered',
					value   : 'Delivered',
					must_use: 'true',
					desc    : '(This is must use item)'
				},
				{
					id      : 'ss_cancelled',
					value   : 'Cancelled',
					must_use: 'true',
					desc    : '(This is must use item)'
				},
				{
					id   : 'ss_proceccing',
					value: 'Processing'
				},
				{
					id   : 'ss_ready_for_pickup',
					value: 'Ready for pickup'
				},
				{
					id   : 'ss_pickedup',
					value: 'Pickedup'
				},
				{
					id   : 'ss_on_the_way',
					value: 'On the way'
				}
			]
		},

		quoteSettings: {

			// quote settings
			dokan_quote_settings    : '',
			enable_out_of_stock     : 'on',
			enable_ajax_add_to_quote: 'on',
			redirect_to_quote_page  : 'off',

			// quote attributes settings
			quote_attributes_settings     : '',
			decrease_offered_price        : '0',
			enable_convert_to_order       : 'off',
			enable_quote_converter_display: 'off'
		},

		liveChatSettings: {
			enable                  : 'off',
			provider                : 'messenger',
			theme_color             : '#0084FF',
			app_id                  : '',
			app_secret              : '',
			wa_opening_method       : 'in_app',
			wa_pre_filled_message   : 'Hello {store_name}, I have an enquiry regarding your store at {store_url}',
			chat_button_seller_page : 'on',
			chat_button_product_page: 'above_tab'
		},

		rmaSettings: {
			rma_order_status         : 'wc-processing',
			rma_enable_refund_request: 'on',
			rma_enable_coupon_request: 'on',
			rma_reasons              : [
				{
					id   : 'defective',
					value: 'Defective'
				},
				{
					id   : 'wrong_product',
					value: 'Wrong Product'
				},
				{
					id   : 'other',
					value: 'Other'
				}
			],
			rma_policy: '<p>Refund Policy</p>'
		},

		wholesaleSettings: {
			wholesale_price_display             : 'all_user',
			display_price_in_shop_archieve      : 'on',
			need_approval_for_wholesale_customer: 'off'
		},

		euComplianceSettings: {
			vendor_fields: {
				dokan_company_name     : 'dokan_company_name',
				dokan_company_id_number: 'dokan_company_id_number',
				dokan_vat_number       : 'dokan_vat_number',
				dokan_bank_name        : 'dokan_bank_name',
				dokan_bank_iban        : 'dokan_bank_iban'
			},
			vendor_registration: 'on',
			customer_fields    : {
				billing_dokan_company_id_number: 'billing_dokan_company_id_number',
				billing_dokan_vat_number       : 'billing_dokan_vat_number',
				billing_dokan_bank_name        : 'billing_dokan_bank_name',
				billing_dokan_bank_iban        : 'billing_dokan_bank_iban'
			},
			enabled_germanized     : 'on',
			override_invoice_number: 'on'
		},


		deliveryTimeSettings: {
			allow_vendor_override_settings: 'on',
			delivery_support              : {
				'delivery'    : 'delivery',
				'store-pickup': 'store-pickup'
			},
			delivery_date_label: 'Delivery Date',
			preorder_date      : 0,
			time_slot_minutes  : 30,
			order_per_slot     : 0,
			delivery_box_info  : 'This store needs %DAY% day(s) to process your delivery request',
			selection_required : 'off',
			delivery_day       : '',
			delivery_day_monday: {
				delivery_status: 'monday',
				opening_time   : '12:00 am',
				closing_time   : '11:59 pm'
			},
			delivery_day_tuesday: {
				delivery_status: 'tuesday',
				opening_time   : '12:00 am',
				closing_time   : '11:59 pm'
			},
			delivery_day_wednesday: {
				delivery_status: 'wednesday',
				opening_time   : '12:00 am',
				closing_time   : '11:59 pm'
			},
			delivery_day_thursday: {
				delivery_status: 'thursday',
				opening_time   : '12:00 am',
				closing_time   : '11:59 pm'
			},
			delivery_day_friday: {
				delivery_status: 'friday',
				opening_time   : '12:00 am',
				closing_time   : '11:59 pm'
			},
			delivery_day_saturday: {
				delivery_status: 'saturday',
				opening_time   : '12:00 am',
				closing_time   : '11:59 pm'
			},
			delivery_day_sunday: {
				delivery_status: 'sunday',
				opening_time   : '12:00 am',
				closing_time   : '11:59 pm'
			}
		},

		productAdvertisingSettings: {
			total_available_slot       : '100',
			expire_after_days          : '10',
			per_product_enabled        : 'on',
			cost                       : '20',
			vendor_subscription_enabled: 'on',
			featured                   : 'on',
			catalog_priority           : 'on',
			hide_out_of_stock_items    : 'on'
		},

		geolocationSettings: {
			show_locations_map               : 'top',
			show_location_map_pages          : 'all',
			show_filters_before_locations_map: 'on',
			show_product_location_in_wc_tab  : 'on',
			distance_unit                    : 'km',
			distance_min                     : '0',
			distance_max                     : '10',
			map_zoom                         : '11',
			location                         : {
				latitude : '40.7127753',
				longitude: '-74.0059728',
				address  : 'New York, NY, USA',
				zoom     : '10'
			}
		},

		productReportAbuseSettings: {
			reported_by_logged_in_users_only: 'off',
			abuse_reasons                   : [
				{
					id   : 'report_as_spam',
					value: 'This content is spam'
				},
				{
					id   : 'report_as_adult',
					value: 'This content should marked as adult'
				},
				{
					id   : 'report_as_abusive',
					value: 'This content is abusive'
				},
				{
					id   : 'report_as_violent',
					value: 'This content is violent'
				},
				{
					id   : 'report_as_risk_of_hurting',
					value: 'This content suggests the author might be risk of hurting themselves'
				},
				{
					id   : 'report_as_infringes_copyright',
					value: 'This content infringes upon my copyright'
				},
				{
					id   : 'report_as_contains_private_info',
					value: 'This content contains my private information'
				},
				{
					id   : 'other',
					value: 'Other'
				},
				{
					id   : 'this_product_is_fake',
					value: 'This product is fake'
				}
			],
		},

		spmvSettings: {
			enable_pricing                : 'on',
			sell_item_btn                 : 'Sell This Item',
			available_vendor_list_title   : 'Other Available Vendor',
			available_vendor_list_position: 'below_tabs',
			show_order                    : 'show_all'
		},

		vendorSubscriptionSettings: {
			subscription_pack              : '2',
			enable_pricing                 : 'off',
			enable_subscription_pack_in_reg: 'off',
			notify_by_email                : 'on',
			no_of_days_before_mail         : '1',
			product_status_after_end       : 'draft',
			cancelling_email_subject       : 'Subscription Package Cancel notification',
			cancelling_email_body          : 'Dear subscriber, Your subscription has expired. Please renew your package to continue using it.',
			alert_email_subject            : 'Subscription Ending Soon',
			alert_email_body               : 'Dear subscriber, Your subscription will be ending soon. Please renew your package in a timely'
		},

		// modules
		modules: ['booking', 'color_scheme_customizer', 'delivery_time', 'elementor', 'export_import', 'follow_store', 'geolocation', 'germanized', 'live_chat', 'live_search', 'moip', 'dokan_paypal_ap', 'paypal_marketplace', 'product_addon', 'product_enquiry', 'report_abuse', 'rma', 'seller_vacation', 'shipstation', 'auction', 'spmv', 'store_reviews', 'store_support', 'stripe', 'product_advertising', 'product_subscription', 'vendor_analytics', 'vendor_staff', 'vsp', 'vendor_verification', 'wholesale', 'rank_math', 'table_rate_shipping', 'mangopay', 'order_min_max', 'razorpay', 'seller_badge', 'stripe_express', 'request_for_quotation'],

		// abuse report
		createAbuseReport: {
			reason     : 'This content is spam',
			description: 'spam product'
		},

	},

	// wp

	optionName: {
		activePlugins: 'active_plugins',
	},

	plugins: {
		'0': 'Basic-Auth-master/basic-auth.php',
		// '1':'woocommerce/woocommerce.php',
		// '2':'dokan/dokan.php',
		// '3':'dokan-pro/dokan-pro.php',
		// '4':'woocommerce-bookings/woocommerce-bookings.php',
		// '5':'woocommerce-product-addons/woocommerce-product-addons.php',
		// '6':'woocommerce-simple-auctions/woocommerce-simple-auctions.php',
		// '7':'woocommerce-subscriptions/woocommerce-subscriptions.php'
		// curl --user admin:01dokan01 http://dokan5.test/wp-json
		// curl --user admin:01dokan01 http://dokan5.test/wp-json/wp/v2/plugins
	},


	siteSettings: {
		users_can_register : 1,
		start_of_week      : 1,
		date_format        : 'F j, Y',
		time_format        : 'g:i a',
		permalink_structure: '/%postname%/',
		default_role       : 'subscriber',
		timezone_string    : 'Asia/Dhaka',

	},

	// woocommerce

	woocommerceSettings: {
		woocommerce_enable_myaccount_registration:	'yes'

	}

};
