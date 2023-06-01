import { faker } from '@faker-js/faker';

const basicAuth = (username: string, password: string) => 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

export const payloads = {

	// wp 
	createPost: {
		title: 'Hello World',
		content: 'My Post Content.',
		status: 'publish'
	},

	createMedia: {
		title: 'avatar',
		alt_text: 'avatar_img',
		status: 'publish',
		post: '1'

	},
	mediaAttributes: {
		title: 'avatar',
		caption: 'avatar_img',
		description: 'avatar_img',
		alt_text: 'avatar_img',

	},

	// user auth

	aAuth: basicAuth(process.env.ADMIN, process.env.ADMIN_PASSWORD),

	adminAuth: {
		Authorization: basicAuth(process.env.ADMIN, process.env.ADMIN_PASSWORD),
	},

	vendorAuth: {
		Authorization: basicAuth(process.env.VENDOR, process.env.USER_PASSWORD),
	},

	customerAuth: {
		Authorization: basicAuth(process.env.CUSTOMER, process.env.USER_PASSWORD),
	},

	admin: {
		username: process.env.ADMIN,
		password: process.env.ADMIN_PASSWORD,
	},

	vendor: {
		username: process.env.VENDOR,
		password: process.env.USER_PASSWORD,
	},

	customer: {
		username: process.env.CUSTOMER,
		password: process.env.USER_PASSWORD,
	},

	setupStore: {
		store_name: 'admin_store',
		trusted: true,
		enabled: true,
		payment: {
			paypal: {
				0: 'email',
				email: 'paypal@g.c',
			},
		},
	},

	// product

	createProduct: () => {
		return {
			name: faker.commerce.productName() + ' (Simple)',
			type: 'simple',
			regular_price: faker.finance.amount(100, 200, faker.helpers.arrayElement([0, 2])),
			// regular_price: '114.15' , // failed for this price & 5% tax & 10% commission dokan .1 issue
			categories: [
				{
					// id: 48
				},
			],
		};
	},

	createVariableProduct: () => {
		return {
			name: faker.commerce.productName() + ' (Variable)',
			type: 'variable',
			regular_price: faker.finance.amount(100, 200, faker.helpers.arrayElement([0, 2])),
			categories: [
				{
					// id: 48
				},
			],
		};
	},

	createDownloadableProduct: () => {
		return {
			name: faker.commerce.productName() + ' (Downloadable)',
			type: 'simple',
			downloadable: true,
			regular_price: faker.finance.amount(100, 200, faker.helpers.arrayElement([0, 2])),
			downloads: [],
			// download_limit: 100,
			// download_expiry: 100,
			categories: [
				{
					// id: 48
				},
			],
		};
	},

	createProductVariation: {
		// id: '47',
		regular_price: faker.finance.amount(100, 200, faker.helpers.arrayElement([0, 2])),
		categories: [{
			//  id: 48
		}],
		attributes: [{
			id: 18,
			// name: 'size',
			option: 'l',
		}],
	},

	updateProduct: () => {
		return { regular_price: faker.finance.amount(100, 200, faker.helpers.arrayElement([0, 2])) };
	},

	updateProductVariation: () => {
		return { regular_price: faker.finance.amount(100, 200, faker.helpers.arrayElement([0, 2])) };
	},

	createProductReview: () => {
		return {
			product_id: '',
			review: 'Test_review' + faker.string.uuid(),
			reviewer: faker.person.fullName(),
			reviewer_email: faker.internet.email(),
			rating: faker.number.int({ min: 1, max: 5 }),
		};
	},

	// product review

	updateReview: {
		review: () => 'review_message_' + faker.string.uuid(),
		rating: faker.number.int({ min: 1, max: 5 }),
		name: 'customer1',
		email: 'customer1@g.com',
		verified: true,
	},

	// product category

	createCategory: {
		name: 'Clothing',
	},

	updateCategory: {
		name: 'Clothing',
	},

	// attribute

	updateBatchAttributesTemplate: () => {
		return {
			id: '',
			description: 'updated description (batch req)',
		};
	},

	updateBatchAttributeTermsTemplate: () => {
		return {
			id: '',
			order_by: 'menu_order',
		};
	},

	// coupon

	createCoupon: () => {
		return {
			code: 'VC_' + faker.string.uuid(),
			amount: faker.number.int({ min: 1, max: 10 },).toString(),
			discount_type: faker.helpers.arrayElement(['percent', 'fixed_product']),
			product_ids: [15],
			individual_use: false,
			meta_data: [
				{
					key: 'apply_before_tax',
					value: 'no'
				},
				{
					key: 'apply_new_products',
					value: 'yes'
				},
				{
					key: 'show_on_store',
					value: 'no'
				}
			]
		};
	},

	updateCoupon: () => {
		return { amount: faker.number.int({ min: 1, max: 10 },).toString() };
	},

	// order

	updateOrder: {
		status: 'wc-pending',
	},

	createOrder: {
		payment_method: 'bacs',
		payment_method_title: 'Direct Bank Transfer',
		set_paid: true,
		billing: {
			first_name: 'customer1',
			last_name: 'c1',
			address_1: 'abc street',
			address_2: 'xyz street',
			city: 'New York',
			state: 'NY',
			postcode: '10003',
			country: 'US',
			email: 'customer1@yopmail.com',
			phone: '(555) 555-5555',
		},

		shipping: {
			first_name: 'customer1',
			last_name: 'c1',
			address_1: 'abc street',
			address_2: 'xyz street',
			city: 'New York',
			state: 'NY',
			postcode: '10003',
			country: 'US',
		},

		line_items: [
			{
				product_id: '',
				quantity: 1,
			},
		],

		shipping_lines: [
			{
				method_id: 'flat_rate',
				method_title: 'Flat Rate',
				total: '10.00',
			},
		],
	},

	createOrderCod: {
		payment_method: 'cod',
		payment_method_title: 'Cash on delivery',
		set_paid: true,
		billing: {
			first_name: 'customer1',
			last_name: 'c1',
			address_1: 'abc street',
			address_2: 'xyz street',
			city: 'New York',
			state: 'NY',
			postcode: '10003',
			country: 'US',
			email: 'customer1@yopmail.com',
			phone: '(555) 555-5555',
		},

		shipping: {
			first_name: 'customer1',
			last_name: 'c1',
			address_1: 'abc street',
			address_2: 'xyz street',
			city: 'New York',
			state: 'NY',
			postcode: '10003',
			country: 'US',
		},
		line_items: [
			{
				product_id: '',
				quantity: 10,
			},
		],
		shipping_lines: [
			{
				method_id: 'flat_rate',
				method_title: 'Flat Rate',
				total: '10.00',
			},
		],
	},

	createOrderNote: {
		status: 'processing',
		note: 'test order note',
	},

	// refund

	createRefund:
	{
		api_refund: false,
		reason: 'testing refund',
		line_items: [
			{
				refund_total: 1,
			},
		],
	},

	// withdraw

	createWithdraw: {
		amount: '50',
		notes: 'Withdraw notes',
		method: 'paypal',
	},

	updateWithdraw: {
		amount: '10',
		notes: 'Withdraw notes',
		method: 'paypal',
	},

	updateWithdrawDisbursementSettings: {
		schedule: 'quarterly',
		minimum: 50,
		reserve: 0,
		method: 'paypal'
	},

	// settings

	updateSettings: {
		// store_name: 'vendorStore',
		social: {
			fb: 'http://dokan.test',
			youtube: 'http://dokan.test',
			twitter: 'http://dokan.test',
			linkedin: 'http://dokan.test',
			pinterest: 'http://dokan.test',
			instagram: 'http://dokan.test',
			flickr: 'http://dokan.test',
		},
		payment: {
			bank: {
				ac_name: 'account name',
				ac_type: 'personal',
				ac_number: '1234567890',
				bank_name: 'bank name',
				bank_addr: 'bank address',
				routing_number: '1234567890',
				iban: '1234567890',
				swift: '1234567890',
			},
			paypal: { email: 'pay9pal@g.c' },
		},
		featured: true,
		trusted: true,
		// enabled: true,
		phone: '0123456789',
		show_email: 'no',
		address: {
			street_1: 'abc street',
			street_2: 'xyz street',
			city: 'New York',
			zip: '10003',
			state: 'NY',
			country: 'US',
			location_name: 'Default',
		},
		location: '40.7127753,-74.0059728', //NY
		// location: '23.709921,90.407143', //dhaka
		banner: '',
		icon: '',
		gravatar: '',
		show_more_ptab: 'yes',
		store_ppp: 12,
		enable_tnc: 'off',
		store_tnc: '',
		show_min_order_discount: '',
		store_seo: [],
		dokan_store_time_enabled: 'no',
		dokan_store_open_notice: 'Store is open',
		dokan_store_close_notice: 'Store is closed',
		dokan_store_time: {
			monday: { status: 'close', opening_time: [], closing_time: [] },
			tuesday: { status: 'close', opening_time: [], closing_time: [] },
			wednesday: { status: 'close', opening_time: [], closing_time: [] },
			thursday: { status: 'close', opening_time: [], closing_time: [] },
			friday: { status: 'close', opening_time: [], closing_time: [] },
			saturday: { status: 'close', opening_time: [], closing_time: [] },
			sunday: { status: 'close', opening_time: [], closing_time: [] },
		},
		company_name: '',
		vat_number: '',
		company_id_number: '',
		bank_name: '',
		bank_iban: '',
		profile_completion: {
			closed_by_user: false,
			phone: 10,
			store_name: 10,
			address: 10,
			progress: 30,
			next_todo: 'banner_val',
			progress_vals: {
				banner_val: 15,
				profile_picture_val: 15,
				store_name_val: 10,
				address_val: 10,
				phone_val: 10,
				map_val: 15,
				payment_method_val: 15,
				social_val: [{}],
			},
		},
		setting_minimum_order_amount: '',
		setting_order_percentage: '',
		find_address: 'Dhaka',
		product_sections: {
			advertised: 'no',
			featured: 'no',
			latest: 'no',
			best_selling: 'no',
			top_rated: 'no',
		},
		order_min_max: {
			enable_vendor_min_max_quantity: 'no',
			min_quantity_to_order: '',
			max_quantity_to_order: '',
			vendor_min_max_products: [],
			vendor_min_max_product_cat: [],
			enable_vendor_min_max_amount: 'no',
			min_amount_to_order: '',
			max_amount_to_order: '',
		},
		vendor_biography: '',
		show_support_btn_product: 'yes',
		support_btn_name: '',
		show_support_btn: 'yes',
		setting_go_vacation: 'no',
		settings_closing_style: 'instantly',
		setting_vacation_message: '',
		seller_vacation_schedules: [],
		vendor_store_location_pickup: { multiple_store_location: 'no', default_location_name: 'Default' },
		store_locations: [],
	},

	//attribute

	createAttribute: () => {
		return {
			name: 'Test_attribute_' + faker.string.alpha(8),
			// slug: `pa_${payloads.createAttribute.name}`,
			// type: 'select',
			// order_by: 'menu_order',
			// has_archives: false
		};
	},

	updateAttribute: () => {
		return { name: 'Updated_Test_attribute_' + faker.string.alpha(5) };
	},

	createAttributeTerm: () => {
		return { name: 'Test_attributeTerm_' + faker.string.alpha(8) };
	},

	updateAttributeTerm: () => {
		return { name: 'Updated_Test_attributeTerm_' + faker.string.alpha(5) };
	},

	// user

	createUser: {
		username: '',
		first_name: '',
		last_name: '',
		email: '',
		roles: '',
		password: '',
	},

	// vendor

	createVendor: {
		username: 'vendor2',
		first_name: 'vendor2',
		last_name: 'v2',
		email: 'vendor2@yopmail.com',
		roles: 'seller',
		password: 'password',
	},

	// plugin

	updatePlugin: {
		plugin: 'dokan/dokan',
		status: 'active',
		// status: 'inactive',
	},

	// site settings

	siteSettings: {
		// title: 'dokan',
		// description: 'Just another WordPress site',
		// url: 'http://dokan.test',
		// email: 'shashwata@wedevs.com',
		timezone: 'Asia/Dhaka',
		date_format: 'F j, Y',
		time_format: 'g:i a',
		start_of_week: 1,
		language: '',
		// use_smilies: true,
		// default_category: 1,
		// default_post_format: '0',
		// posts_per_page: 10,
		// show_on_front: 'posts',
		// page_on_front: 0,
		// page_for_posts: 0,
		// default_ping_status: 'open',
		// default_comment_status: 'open',
		// site_logo: 0,
		// site_icon: 0
	},

	// shipping

	createShippingZone: {
		name: 'US',
		order: 0,
	},

	addShippingZoneLocation: [
		{
			code: 'US',
			type: 'country',
		},
	],

	addShippingZoneMethodFlatRate: {
		method_id: 'flat_rate',
	},

	addShippingZoneMethodFreeShipping: {
		method_id: 'free_shipping',
	},

	addShippingZoneMethodLocalPickup: {
		method_id: 'local_pickup',
	},

	addShippingZoneMethodDokanTableRateShipping: {
		method_id: 'dokan_table_rate_shipping',
	},

	addShippingZoneMethodDokanDistanceRateShipping: {
		method_id: 'dokan_distance_rate_shipping',
	},

	addShippingZoneMethodDokanVendorShipping: {
		method_id: 'dokan_vendor_shipping',
	},

	createTaxRate: {
		country: '',
		state: '',
		postcode: '',
		city: '',
		rate: '5',
		name: 'Tax',
		priority: 1,
		compound: false,
		shipping: true,
		order: 0,
		class: 'standard',
		postcodes: [],
		cities: [],
	},

	// woocommerce settings: general , products, tax, shipping, checkout, account

	// general

	general: {
		update: [
			{
				id: 'woocommerce_calc_taxes',
				// label: 'Enable taxes',
				value: 'yes',
				// value: 'no',
			},
			{
				id: 'woocommerce_currency',
				// label: 'Currency',
				value: 'USD',
				// value: 'BTC',
			},
			{
				id: 'woocommerce_price_thousand_sep',
				// label: 'Thousand separator',
				value: ',',
				// value: '.',
			},

			{
				id: 'woocommerce_price_decimal_sep',
				// label: 'Decimal separator',
				value: '.',
				// value: ',',

			},
			{
				id: 'woocommerce_price_num_decimals',
				// label: 'Number of decimals',
				value: '2',
				// value: '4',
			},
		],
	},

	enableTaxRate: {
		update: [
			{
				id: 'woocommerce_calc_taxes',
				// label: 'Enable taxes',
				value: 'yes',
				// value: 'no',
			},
		],
	},


	// account

	account: {
		update: [
			{
				id: 'woocommerce_registration_generate_password',
				// description: 'When creating an account, send the new user a link to set their password',
				value: 'no',
				// value: 'yes',
			},
		],
	},

	bcs: {
		id: 'bacs',
		// title: 'Direct bank transfer',
		enabled: true,
		// method_title: 'Direct bank transfer',
	},

	cheque: {
		id: 'cheque',
		// title: 'Check payments',
		enabled: true,
		// method_title: 'Check payments',
	},
	cod: {
		id: 'cod',
		// title: 'Cash on delivery',
		enabled: true,
		// method_title: 'Cash on delivery',
	},

	payPal: {
		id: 'dokan_paypal_marketplace',
		title: 'PayPal Marketplace',
		enabled: false,
		method_title: 'Dokan PayPal Marketplace',
		settings: {
			shipping_tax_fee_recipient_notice: [{}],
			title: [{}],
			partner_id: [{}],
			api_details: [{}],
			test_mode: [{}],
			app_user: [{}],
			app_pass: [{}],
			test_app_user: [{}],
			test_app_pass: [{}],
			bn_code: [{}],
			disbursement_mode: [{}],
			disbursement_delay_period: [{}],
			button_type: [{}],
			ucc_mode_notice: [{}],
			ucc_mode: [{}],
			marketplace_logo: [{}],
			display_notice_on_vendor_dashboard: [{}],
			display_notice_to_non_connected_sellers: [{}],
			display_notice_interval: [{}],
			webhook_message: [{}],
		},
	},

	stripeConnect: {
		id: 'dokan-stripe-connect',
		title: 'Dokan Credit card (Stripe)',
		enabled: false,
		method_title: 'Dokan Stripe Connect',
		settings: {
			title: [{}],
			allow_non_connected_sellers: [{}],
			display_notice_to_non_connected_sellers: [{}],
			display_notice_interval: [{}],
			enable_3d_secure: [{}],
			seller_pays_the_processing_fee: [{}],
			testmode: [{}],
			stripe_checkout: [{}],
			stripe_checkout_locale: [{}],
			stripe_checkout_image: [{}],
			stripe_checkout_label: [{}],
			saved_cards: [{}],
			'live-credentials-title': [{}],
			publishable_key: [{}],
			secret_key: [{}],
			client_id: [{}],
			'test-credentials-title': [{}],
			test_publishable_key: [{}],
			test_secret_key: [{}],
			test_client_id: [{}],
		},
	},

	mangoPay: {
		id: 'dokan_mangopay',
		title: 'MangoPay',
		enabled: false,
		method_title: 'Dokan MangoPay',
		settings: {
			title: [{}],
			api_details: [{}],
			sandbox_mode: [{}],
			client_id: [{}],
			api_key: [{}],
			sandbox_client_id: [{}],
			sandbox_api_key: [{}],
			payment_options: [{}],
			cards: [{}],
			direct_pay: [{}],
			saved_cards: [{}],
			platform_fees: [{}],
			fund_transfers: [{}],
			disburse_mode: [{}],
			disbursement_delay_period: [{}],
			instant_payout: [{}],
			user_types: [{}],
			default_vendor_status: [{}],
			default_business_type: [{}],
			advanced: [{}],
			notice_on_vendor_dashboard: [{}],
			announcement_to_sellers: [{}],
			notice_interval: [{}],
		},
	},

	razorpay: {
		id: 'dokan_razorpay',
		title: 'Razorpay',
		description: null,
		enabled: false,
		method_title: 'Dokan Razorpay',
		settings: {
			title: [{}],
			api_details: [{}],
			test_mode: [{}],
			key_id: [{}],
			key_secret: [{}],
			test_key_id: [{}],
			test_key_secret: [{}],
			enable_route_transfer: [{}],
			disbursement_mode: [{}],
			razorpay_disbursement_delay_period: [{}],
			seller_pays_the_processing_fee: [{}],
			display_notice_on_vendor_dashboard: [{}],
			display_notice_to_non_connected_sellers: [{}],
			display_notice_interval: [{}],
		},
	},

	stripeExpress: {
		id: 'dokan_stripe_express',
		title: 'Credit/Debit Card',
		enabled: false,
		settings: {
			title: [{}],
			api_details: [{}],
			testmode: [{}],
			publishable_key: [{}],
			secret_key: [{}],
			test_publishable_key: [{}],
			test_secret_key: [{}],
			webhook: [{}],
			webhook_key: [{}],
			test_webhook_key: [{}],
			payment_options: [{}],
			enabled_payment_methods: [{}],
			sellers_pay_processing_fee: [{}],
			saved_cards: [{}],
			capture: [{}],
			disburse_mode: [{}],
			disbursement_delay_period: [{}],
			statement_descriptor: [{}],
			appearance: [{}],
			element_theme: [{}],
			payment_request_options: [{}],
			payment_request: [{}],
			payment_request_button_type: [{}],
			payment_request_button_theme: [{}],
			payment_request_button_locations: [{}],
			payment_request_button_size: [{}],
			advanced: [{}],
			notice_on_vendor_dashboard: [{}],
			announcement_to_sellers: [{}],
			notice_interval: [{}],
			debug: [{}],
		},
	},

	// customer

	createCustomer: () => {
		return {
			email: faker.internet.email(),
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
			role: 'customer',
			username: faker.person.firstName() + faker.string.uuid(),
			password: '01dokan01',
			billing: {
				first_name: 'customer1',
				last_name: 'c1',
				company: '',
				address_1: 'abc street',
				address_2: 'xyz street',
				city: 'New York',
				postcode: '10003',
				country: 'US',
				state: 'NY',
				email: 'customer1@yopmail.com',
				phone: '0123456789',
			},
			shipping: {
				first_name: 'customer1',
				last_name: 'c1',
				company: '',
				address_1: 'abc street',
				address_2: 'xyz street',
				city: 'New York',
				postcode: '10003',
				country: 'US',
				state: 'NY',
				phone: '0123456789',
			},
		};
	},

	updateCustomer: () => {
		return {
			email: faker.internet.email(),
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
			role: 'customer',
			password: '01dokan01',
			billing: {
				first_name: 'customer1',
				last_name: 'c1',
				company: '',
				address_1: 'abc street',
				address_2: 'xyz street',
				city: 'New York',
				postcode: '10003',
				country: 'US',
				state: 'NY',
				email: 'customer1@yopmail.com',
				phone: '0123456789',
			},
			shipping: {
				first_name: 'customer1',
				last_name: 'c1',
				company: '',
				address_1: 'abc street',
				address_2: 'xyz street',
				city: 'New York',
				postcode: '10003',
				country: 'US',
				state: 'NY',
				phone: '0123456789',
			},
		};
	},

	updateBatchCustomersTemplate: () => {
		return {
			id: '',
			billing: {
				phone: '0123456789',
			},
		};
	},

	// wholesale customer

	updateWholesaleCustomer: {
		status: 'activate', // activate, deactivate, delete
	},

	deleteWholesaleCustomer: {
		status: 'delete',
	},

	// support ticket

	createSupportTicketComment: {
		replay: 'sp replay...1',
		vendor_id: '1',
		selected_user: 'vendor',
	},

	updateSupportTicketStatus: {
		status: 'close',
	},

	updateSupportTicketEmailNotification: {
		notification: true,
	},

	updateBatchSupportTickets: {
		close: [247, 248],
	},

	// module

	deactivateModule: {
		module: ['booking'],
	},

	activateModule: {
		module: ['booking'],
	},

	// announcement

	createAnnouncement: {
		title: 'test announcement title',
		content: '<p>This is announcement content</p>',
		status: 'publish',
		sender_type: 'all_seller',
	},

	updateAnnouncement: {
		title: 'updated test announcement title',
		content: '<p>updated This is announcement content</p>',
		status: 'publish',
		sender_type: 'all_seller',
	},

	// product review

	updateProductReview: {
		status: 'approved',
	},

	// store review

	updateStoreReview: {
		title: 'Updated Test review title',
		content: 'Updated Test review content',
		status: 'publish',
	},

	// store category

	createStoreCategory: () => {
		return { name: 'Test_Store_Category' + faker.string.uuid() };
	},
	updateStoreCategory: () => {
		return { name: 'Update_Test_Store_Category' + faker.string.uuid() };
	},

	// dummy data

	dummyData: {
		vendor_products: [
			{
				name: 'p1_d1',
				type: 'simple',
				status: 'publish',
				regular_price: '10',
			},
			{
				name: 'p2_d1',
				type: 'simple',
				status: 'publish',
				regular_price: '20',
			},
		],
		vendor_data: {
			email: 'dummystore1@yopmail.com',
			password: '01dokan01',
			store_name: 'dummyStore1',
			social: [],
			payment: [],
			phone: '0123456789',
			show_email: 'no',
			address: [],
			location: '',
			banner: '',
			icon: '',
			gravatar: '',
			show_more_tpab: 'yes',
			show_ppp: 12,
			enable_tnc: 'off',
			store_seo: [],
			dokan_store_time: [],
			enabled: 'yes',
			trusted: 'yes',
		},
	},

	// store

	createStore: () => {
		return {
			user_login: faker.person.firstName() + faker.string.uuid(),
			user_pass: '01dokan01',
			role: 'seller',
			email: faker.internet.email(),
			store_name: faker.person.firstName() + '_store',
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
			social: {
				fb: 'http://dokan.test',
				youtube: 'http://dokan.test',
				twitter: 'http://dokan.test',
				linkedin: 'http://dokan.test',
				pinterest: 'http://dokan.test',
				instagram: 'http://dokan.test',
				flickr: 'http://dokan.test',
			},
			phone: '0123456789',
			show_email: false,
			address: {
				street_1: 'abc street',
				street_2: 'xyz street',
				city: 'New York',
				zip: '10003',
				state: 'NY',
				country: 'US',
			},
			location: '',
			banner: '',
			banner_id: 0,
			gravatar: '',
			gravatar_id: 0,
			shop_url: '',
			products_per_page: 12,
			show_more_product_tab: true,
			toc_enabled: false,
			store_toc: '',
			featured: true,
			rating: {
				rating: '0.00',
				count: 1,
			},
			enabled: true,
			registered: '',
			payment: {
				paypal: {
					0: 'email',
					email: 'paypal@g.c',
				},
				bank: {
					ac_name: 'account name',
					ac_type: 'personal',
					ac_number: '1234567',
					bank_name: 'bank name',
					bank_addr: 'bank address',
					routing_number: '123456',
					iban: '123456',
					swift: '12345',
				},
				stripe: false,
			},
			trusted: true,
			store_open_close: {
				enabled: false,
				time: [],
				open_notice: 'Store is open',
				close_notice: 'Store is closed',
			},
			company_name: '',
			vat_number: '',
			company_id_number: '',
			bank_name: '',
			bank_iban: '',
			categories: [
				{
					id: 74,
					name: 'Uncategorized',
					slug: 'uncategorized',
				},
			],
			admin_commission: '',
			admin_additional_fee: '0.00',
			admin_commission_type: 'flat',
		};
	},

	updateStore: () => {
		return {
			// email: faker.internet.email(),
			// store_name: faker.person.firstName(),
			// first_name: faker.person.firstName(),
			// last_name: faker.person.lastName(),
			social: {
				fb: 'http://dokan.test',
				youtube: 'http://dokan.test',
				twitter: 'http://dokan.test',
				linkedin: 'http://dokan.test',
				pinterest: 'http://dokan.test',
				instagram: 'http://dokan.test',
				flickr: 'http://dokan.test',
			},
			phone: '0123456789',
			show_email: false,
			address: {
				street_1: 'abc street',
				street_2: 'xyz street',
				city: 'New York',
				zip: '10003',
				state: 'NY',
				country: 'US',
			},
			location: '',
			banner: '',
			banner_id: 0,
			gravatar: '',
			gravatar_id: 0,
			shop_url: '',
			products_per_page: 12,
			show_more_product_tab: true,
			toc_enabled: false,
			store_toc: '',
			featured: true,
			rating: {
				rating: '0.00',
				count: 1,
			},
			trusted: true,
			enabled: true,
			registered: '',
			payment: {
				paypal: {
					0: 'email',
					email: 'paypal@g.c',
				},
				bank: {
					ac_name: 'account name',
					ac_type: 'personal',
					ac_number: '1234567',
					bank_name: 'bank name',
					bank_addr: 'bank address',
					routing_number: '123456',
					iban: '123456',
					swift: '12345',
				},
				stripe: false,
			},
			store_open_close: {
				enabled: false,
				time: [],
				open_notice: 'Store is open',
				close_notice: 'Store is closed',
			},
			company_name: '',
			vat_number: '',
			company_id_number: '',
			bank_name: '',
			bank_iban: '',
			categories: [
				{
				},
			],
			admin_commission: '',
			admin_additional_fee: '0.00',
			admin_commission_type: 'flat',
		};
	},

	createStoreReview: {
		title: 'Test store review',
		content: 'Test store review content',
		rating: 2,
		// approved: true
	},

	updateStoreStatus: {
		status: 'active',
	},

	clientContactStore: {
		name: 'admin',
		email: 'admin@g.c',
		message: 'Test admin connect with vendor message',
	},

	adminEmailStore: {
		subject: 'Test email sub',
		body: 'Test email body',
	},

	createStore1: {
		user_login: process.env.VENDOR,
		user_pass: process.env.USER_PASSWORD,
		user_nicename: process.env.VENDOR + 'store',
		role: 'seller',
		email: process.env.VENDOR + '@yopmail.com',
		store_name: process.env.VENDOR + 'store',
		first_name: process.env.VENDOR,
		last_name: 'ven',
		social: {
			fb: 'http://dokan.test',
			youtube: 'http://dokan.test',
			twitter: 'http://dokan.test',
			linkedin: 'http://dokan.test',
			pinterest: 'http://dokan.test',
			instagram: 'http://dokan.test',
			flickr: 'http://dokan.test',
		},
		phone: '0123456789',
		show_email: false,
		address: {
			street_1: 'abc street',
			street_2: 'xyz street',
			city: 'New York',
			zip: '10003',
			state: 'NY',
			country: 'US',
		},
		location: '40.7127753,-74.0059728',
		banner: '',
		banner_id: 0,
		gravatar: '',
		gravatar_id: 0,
		shop_url: '',
		products_per_page: 12,
		show_more_product_tab: true,
		toc_enabled: false,
		store_toc: '',
		featured: true,
		rating: {
			rating: '0.00',
			count: 1,
		},
		enabled: true,
		registered: '',
		payment: {
			paypal: {
				0: 'email',
				email: 'paypal@g.c',
			},
			bank: {
				ac_name: 'account name',
				ac_type: 'personal',
				ac_number: '1234567',
				bank_name: 'bank name',
				bank_addr: 'bank address',
				routing_number: '123456',
				iban: '123456',
				swift: '12345',
			},
			stripe: false,
		},
		trusted: true,
		store_open_close: {
			enabled: false,
			time: [],
			open_notice: 'Store is open',
			close_notice: 'Store is closed',
		},
		company_name: '',
		vat_number: '',
		company_id_number: '',
		bank_name: '',
		bank_iban: '',
		categories: [
			{
				// id: 74,
				// name: 'Uncategorized',
				// slug: 'uncategorized'
			},
		],
		admin_commission: '',
		admin_additional_fee: '',
		admin_commission_type: '',
	},

	createCustomer1: {
		email: process.env.CUSTOMER + '@yopmail.com',
		first_name: 'customer1',
		last_name: 'c1',
		role: 'customer',
		username: process.env.CUSTOMER,
		password: process.env.USER_PASSWORD,
		billing: {
			first_name: process.env.CUSTOMER,
			last_name: 'cus',
			company: '',
			address_1: 'abc street',
			address_2: 'xyz street',
			city: 'New York',
			postcode: '10003',
			country: 'US',
			state: 'NY',
			email: process.env.CUSTOMER + '@yopmail.com',
			phone: '0123456789',
		},
		shipping: {
			first_name: process.env.CUSTOMER,
			last_name: 'cus',
			company: '',
			address_1: 'abc street',
			address_2: 'xyz street',
			city: 'New York',
			postcode: '10003',
			country: 'US',
			state: 'NY',
			phone: '0123456789',
		},
	},

	// quote rule

	createQuoteRule: () => {
		return {
			rule_name: 'QR_' + faker.string.alphanumeric(5),
			selected_user_role: ['customer'],
			category_ids: [],
			product_ids: [],
			hide_price: '1',
			hide_price_text: 'Price is hidden',
			hide_cart_button: 'replace',
			button_text: 'Add to quote',
			apply_on_all_product: '1',
			rule_priority: '0',
			status: 'publish',
		};
	},

	updateQuoteRule: {
		rule_name: 'updated_QR_' + faker.string.alphanumeric(5),
		selected_user_role: ['customer'],
		hide_price: '0',
		hide_price_text: 'Price is covered',
		hide_cart_button: 'keep_and_add_new',
		button_text: ' To quote',
		apply_on_all_product: '1',

	},

	// request quote

	createRequestQuote: () => {
		return {
			quote_title: 'QT_' + faker.string.alphanumeric(5),
			customer_info: {
				name_field: 'customer1',
				email_field: 'customer1@yopmail.com',
				company_field: 'c1',
				phone_field: '0987654321',
			},
			product_ids: [''],
			offer_price: ['50'],
			offer_product_quantity: ['10'],
		};
	},

	updateRequestQuote: {
		quote_title: 'updated_QT_' + faker.string.alphanumeric(5),
		customer_info: {
			name_field: 'customer1',
			email_field: 'customer1@yopmail.com',
			company_field: 'c1',
			phone_field: '0987654321',
		},
		user_id: '2',
		product_ids: [''],
		offer_price: ['30'],
		offer_product_quantity: ['20'],

	},

	convertToOrder: {
		quote_id: '10',
		status: 'converted',
	},

	//settings
	updateSettingsGroup: {
		items: [
			{
				id: 'store_name',
				value: 'adminStore1',
			},
			{
				id: 'phone',
				value: '164877665544433',
			},
		],
	},

	updateSubSettingFromSingleSettingGroup: {
		value: 'adminStore1',
	},

	updateSubSubSettingFromSingleSettingGroup: {
		value: 'zzz street',
	},

	setDefaultAttribute: {

	},

	filterParams: {
		product_type: 'simple',
	},


	// seller badge

	createSellerBadge: {
		event_type: 'exclusive_to_platform',
		badge_name: 'Exclusive to Platform',
		badge_logo: 'http://dokan16.test/wp-content/plugins/dokan-pro/modules/seller-badge/assets/images/badges/sale-only-here.svg',
		badge_status: 'published',
		levels: [
			{
				level: 0,
				level_condition: '',
				level_data: ''
			}
		]
	},

	createSellerBadge1: {
		event_type: 'product_published',
		badge_name: 'Product Published',
		badge_logo: 'http://dokan16.test/wp-content/plugins/dokan-pro/modules/seller-badge/assets/images/badges/sale-only-here.svg',
		badge_status: 'published',
		levels: [
			{
				level_condition: '<',
				level_data: '10'
			},
			{
				level_condition: '<',
				level_data: '20'
			},
			{
				level_condition: '<',
				level_data: '30'
			}
		]
	},

	updateSellerBadge: {
		event_type: 'exclusive_to_platform',
		badge_name: 'Exclusive to Platform',
		badge_logo: 'http://dokan16.test/wp-content/plugins/dokan-pro/modules/seller-badge/assets/images/badges/sale-only-here.svg',
		badge_status: 'draft',
		levels: [
			{
				level: 0,
				level_condition: '',
				level_data: ''
			}
		]
	},

	// reverse withdrawal

	amountToPay: {
		amount: '10'
	},


};
