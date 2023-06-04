import { faker } from '@faker-js/faker';
import { helpers } from './helpers';

interface user {
	username: string;
	password: string;
}

interface admin {
	username: string;
	password: string;
}


export { admin, user };

export const data = {

	// Generated  test data
	auth: {
		adminAuthFile: 'playwright/.auth/adminStorageState.json',
		vendorAuthFile: 'playwright/.auth/vendorStorageState.json',
		customerAuthFile:'playwright/.auth/customerStorageState.json'
	},

	//User
	user: {
		username: () => faker.person.firstName('male'),
		userDetails: {
			firstName: () => faker.person.firstName('male'),
			lastName: () => faker.person.lastName('male'),
			role: 'customer',
		},
	},

	//Product
	product: {
		publishSuccessMessage: 'Product published. ',
		draftUpdateSuccessMessage: 'Product draft updated. ',
		pendingProductUpdateSuccessMessage: 'Product updated. ',
		createUpdateSaveSuccessMessage: 'Success! The product has been saved successfully. View Product →',

		status: {
			publish: 'publish',
			draft: 'draft',
			pending: 'pending',
		},

		stockStatus: {
			outOfStock: 'outofstock',
		},

		tax:{
			status: 'taxable',   //'taxable', 'shipping', 'none'
			taxClass: 'taxable'  //'taxable', 'reduced-rate', 'zero-rate'
		},

		type: {
			simple: 'simple',
			variable: 'variable',
			simpleSubscription: 'subscription',
			variableSubscription: 'variable-subscription',
			external: 'external',
			vendorSubscription: 'product_pack',
			booking: 'booking',
			auction: 'auction'
		},

		name: {
			simple: () => faker.commerce.productName() + (' (Simple)'),
			variable: () => faker.commerce.productName() + (' (Variable)'),
			external: () => faker.commerce.productName() + (' (External)'),
			grouped: () => faker.commerce.productName() + (' (Grouped)'),
			simpleSubscription: () => faker.commerce.productName() + (' (Simple Subscription)'),
			variableSubscription: () => faker.commerce.productName() + (' (Variable Subscription)'),
			dokanSubscription: {
				nonRecurring: () => 'Dokan Subscription ' + faker.helpers.arrayElement(['Gold', 'Silver', 'Platinum', 'Premium'],) + ' ' + faker.string.alpha({
					length: 5,
					casing: 'upper',
				},) + (' (Product Pack)'),
			},
			booking: () => faker.commerce.productName() + (' (Booking)'),
			auction: () => faker.commerce.productName() + (' (Auction)'),
		},

		price: {
			// price: faker.commerce.price(100, 200, 2),
			// price: faker.number.int({min:1, max:200, precision: 0.01}),
			// price: faker.finance.amount(1, 200, 2),
			price_int: () => faker.finance.amount(100, 200, 0),
			price_random: () => faker.finance.amount(100, 200, faker.helpers.arrayElement([0, 2])), // 0 = no decimals, 2 = 2 decimals
			price_frac: () => faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2])),
			price_frac_comma: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			auctionPrice: () => faker.commerce.price({ min: 10, max: 100, dec: 0 }),
			price: () => data.product.price.price_frac_comma(),
		},

		category: {
			unCategorized: 'Uncategorized',
			clothings: 'Clothings',
			randomCategory1: () => faker.commerce.productAdjective(),
			randomCategory: () => 'category_' + faker.string.alpha(5),
			categories: faker.helpers.arrayElement(['Electronic Devices', 'Electronic Accessories', 'Men"s Fashion', 'Clothings', 'Women"s Fashion']),
		},

		store: {
			adminStore: String(process.env.ADMIN) + 'store',
			vendorStore1: String(process.env.VENDOR) + 'store',
		},

		attribute: {
			size: {
				attributeName: 'size',
				attributeTerms: ['s', 'l', 'm'],
			},

			color: {
				attributeName: 'color',
				attributeTerms: ['red', 'blue', 'black', 'yellow', 'white'],
			},

			randomAttribute: () => ({
				attributeName: 'attribute_' + faker.string.alpha(5),
				attributeTerms: ['attributeTerm_' + faker.string.alpha(5)],
			}),
		},

		simple: {
			productType: 'simple',
			productName: () => faker.commerce.productName() + (' (Simple)'),
			category: 'Uncategorized',
			regularPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			storeName: String(process.env.VENDOR) + 'store',
			status: 'publish',
			stockStatus: false,
		},

		variable: {
			productType: 'variable',
			productName: () => faker.commerce.productName() + (' (Variable)'),
			category: 'Uncategorized',
			regularPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			storeName: String(process.env.VENDOR) + 'store',
			status: 'publish',
			stockStatus: false,
			attribute: 'sizes',
			attributeTerms: ['s', 'l', 'm'],
			variations: {
				linkAllVariation: 'link_all_variations',
				variableRegularPrice: 'variable_regular_price',
			},
			saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
		},

		external: {
			productType: 'external',
			productName: () => faker.commerce.productName() + (' (External)'),
			productUrl: '/product/p1_v1/',
			buttonText: 'Buy product',
			category: 'Uncategorized',
			regularPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			storeName: String(process.env.VENDOR) + 'store',
			status: 'publish',
			saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
		},

		simpleSubscription: {
			productType: 'subscription',
			productName: () => faker.commerce.productName() + (' (Simple Subscription)'),
			category: 'Uncategorized',
			regularPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			subscriptionPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			subscriptionPeriodInterval: '1',  // '0', '1', '2', '3', '4', '5', '6'
			subscriptionPeriod: 'month',  // 'day', 'week', 'month', 'year'
			expireAfter: '0',  // '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'
			subscriptionTrialLength: '0',
			subscriptionTrialPeriod: 'day',  // 'day', 'week', 'month', 'year'
			storeName: String(process.env.VENDOR) + 'store',
			status: 'publish',
			saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
		},

		variableSubscription: {
			productType: 'variable-subscription',
			productName: () => faker.commerce.productName() + (' (Variable Subscription)'),
			category: 'Uncategorized',
			subscriptionPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			subscriptionPeriodInterval: '1',
			subscriptionPeriod: 'month',
			expireAfter: '0',
			subscriptionTrialLength: '0',
			subscriptionTrialPeriod: 'day',
			storeName: String(process.env.VENDOR) + 'store',
			status: 'publish',
			attribute: 'size',
			attributeTerms: ['s', 'l', 'm'],
			variations: {
				linkAllVariation: 'link_all_variations',
				variableRegularPrice: 'variable_regular_price',
			},
			saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
		},

		vendorSubscription: {
			productType: 'product_pack',
			productName: () => 'Dokan Subscription ' + faker.helpers.arrayElement(['Gold', 'Silver', 'Platinum', 'Premium'],) + ' ' + faker.string.alpha({
				length: 5,
				casing: 'upper',
			},) + (' (Product Pack)'),
			category: 'Uncategorized',
			regularPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			numberOfProducts: '-1',
			packValidity: '0',
			advertisementSlot: '-1',
			expireAfterDays: '-1',
			storeName: String(process.env.VENDOR) + 'store',
			status: 'publish',
		},

		booking: {
			productName: () => faker.commerce.productName() + (' (Booking)'),
			productType: 'booking',
			category: 'Uncategorized',
			bookingDurationType: 'customer',  // 'fixed', 'customer'
			bookingDuration: '2',
			bookingDurationMax: '2',
			bookingDurationUnit: 'day',  // 'month', 'day', 'hour', 'minute'
			calendarDisplayMode: 'always_visible',  // '', 'always_visible'
			maxBookingsPerBlock: '5',
			minimumBookingWindowIntoTheFutureDate: '0',
			minimumBookingWindowIntoTheFutureDateUnit: 'month',
			maximumBookingWindowIntoTheFutureDate: '5',
			maximumBookingWindowIntoTheFutureDateUnit: 'month',
			baseCost: '20',
			blockCost: '10',
			storeName: String(process.env.VENDOR) + 'store',
		},

		// Auction
		auction: {

			productName: () => faker.commerce.productName() + (' (Auction)'),
			productType: 'auction',
			category: 'Uncategorized',
			itemCondition: 'new',  // 'new', 'used'
			auctionType: 'normal',  // 'normal', 'reverse'
			regularPrice: () => (faker.finance.amount(10, 100, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			bidIncrement: () => (faker.finance.amount(40, 50, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			reservedPrice: () => (faker.finance.amount(400, 500, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			buyItNowPrice: () => (faker.finance.amount(900, 1000, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
			startDate: helpers.currentDateTime.replace(/,/g, ''),
			endDate: helpers.addDays(helpers.currentDateTime, 1).replace(/,/g, ''),
			storeName: String(process.env.VENDOR) + 'store',
			saveSuccessMessage: '× Success! The product has been updated successfully. View Product →',
		},

		// Review
		review: {
			rating: faker.number.int({
				min: 1, max: 5
			}),
			reviewMessage: () => faker.string.uuid(),
		},

		// Report
		report: {
			reportReason: faker.helpers.arrayElement(['This content is spam', 'This content should marked as adult', 'This content is abusive', 'This content is violent', 'This content suggests the author might be risk of hurting themselves', 'This content infringes upon my copyright', 'This content contains my private information', 'Other']),
			reportReasonDescription: 'report reason description',
			reportSubmitSuccessMessage: 'Your report has been submitted. Thank you for your response.',
		},

		// Enquiry
		enquiry: {
			enquiryDetails: 'enquiry details',
			enquirySubmitSuccessMessage: 'Email sent successfully!',
		},
	},

	store: {
		rating: faker.helpers.arrayElement(['width: 20%', 'width: 40%', 'width: 60%', 'width: 80%', 'width: 100%']),
		reviewTitle: 'store review title',
		reviewMessage: () => faker.string.uuid(),
	},

	order: {
		orderStatus: {
			pending: 'wc-pending',
			processing: 'wc-processing',
			onhold: 'wc-on-hold',
			completed: 'wc-completed',
			cancelled: 'wc-cancelled',
			refunded: 'wc-refunded',
			failed: 'wc-failed',
		},

		// Refund
		refund: {
			itemQuantity: '1',
			refundRequestType: 'refund',
			refundRequestReasons: 'defective',
			refundRequestDetails: 'I would like to return this product',
			refundSubmitSuccessMessage: 'Request has been successfully submitted',
		},
	},

	card: {
		strip: {
			striptNon3D: '4242424242424242',
			stript3D: '4000002500003155',
			expiryMonth: '12',
			expiryYear: '50',
			number: '4000002500003155',
			expiryDate: '1250',
			cvc: '111',
		},

		mangopay: {
			creditCard: '4972485830400049',
			expiryMonth: '12',
			expiryYear: '50',
			cvc: '111',
		},
	},

	paymentDetails: {
		stripExpress: {
			paymentMethod: 'card',
			cardInfo: {
				cardNumber: '4242424242424242',
				expiryMonth: '12',
				expiryYear: '50',
				expiryDate: '1250', //MMYY
				cvc: '111',
			},
		},
	},

	coupon: {
		// title: () => 'VC_' + faker.string.alpha({count: 5, casing: 'upper'},),
		title: () => 'VC_' + faker.string.uuid(),
		amount: () => faker.number.int({
			min: 1, max: 10
		},).toString(),
		discount_type: () => faker.helpers.arrayElement(['percent', 'fixed_product']),
		existingCouponErrorMessage: 'Coupon title already exists',
	},


	wpSettings: {
		saveSuccessMessage: 'Your settings have been saved.',
		general: {
			timezone: 'UTC+6',
			saveSuccessMessage: 'Settings saved.',
		},

		permalink: {
			customBaseInput: '/product/',
			saveSuccessMessage: 'Permalink structure updated.',
		},
	},

	tax: {
		taxRate: '5',
		enableTax: true,
		saveSuccessMessage: 'Your settings have been saved.',
	},

	shipping: {
		enableShipping: 'Ship to all countries you sell to',
		disableShipping: 'Disable shipping & shipping calculations',
		shippingZone: 'US',

		shippingMethods: {
			methods: faker.helpers.arrayElement(['flat_rate', 'free_shipping', 'local_pickup', 'dokan_table_rate_shipping', 'dokan_distance_rate_shipping', 'dokan_vendor_shipping']),
			flatRate: {
				shippingZone: 'US',
				shippingCountry: 'United States (US)',
				selectShippingMethod: 'flat_rate',
				shippingMethod: 'Flat rate',
				taxStatus: 'taxable', // 'none
				shippingCost: '20',
			},

			freeShipping: {
				shippingZone: 'US',
				shippingCountry: 'United States (US)',
				selectShippingMethod: 'free_shipping',
				shippingMethod: 'Free shipping',
				freeShippingRequires: 'min_amount',  // 'coupon', 'min_amount', 'either', 'both'
				freeShippingMinimumOrderAmount: '200',
			},

			localPickup: {
				shippingZone: 'US',
				shippingCountry: 'United States (US)',
				selectShippingMethod: 'local_pickup',
				shippingMethod: 'Local pickup',
				taxStatus: 'taxable', // 'none
				shippingCost: '20',
			},

			tableRateShipping: {
				shippingZone: 'US',
				shippingCountry: 'United States (US)',
				selectShippingMethod: 'dokan_table_rate_shipping',
				shippingMethod: 'Vendor Table Rate',
			},

			distanceRateShipping: {
				shippingZone: 'US',
				shippingCountry: 'United States (US)',
				selectShippingMethod: 'dokan_distance_rate_shipping',
				shippingMethod: 'Vendor Distance Rate',
			},

			vendorShipping: {
				shippingZone: 'US',
				shippingCountry: 'United States (US)',
				selectShippingMethod: 'dokan_vendor_shipping',
				shippingMethod: 'Vendor Shipping',
				taxStatus: 'taxable', // 'none
			},
		},

		shippingTaxStatus: 'taxable',
		saveSuccessMessage: 'Your settings have been saved.',
	},

	payment: {
		saveSuccessMessage: 'Your settings have been saved.',
		currency: {
			dollar: 'United States (US) dollar ($)',
			euro: 'Euro (€)',
			rupee: 'Indian rupee (₹)',
			currencyOptions: {
				thousandSeparator: ',',
				decimalSeparator: ',',
				numberOfDecimals: '2',
			},
			saveSuccessMessage: 'Your settings have been saved.',
		},

		basicPayment: {
			toggleEanbledClass: 'woocommerce-input-toggle--enabled',
			toggleDisabledClass: 'woocommerce-input-toggle--disabled',
		},

		stripeConnect: {
			title: 'Dokan Credit card (Stripe)',
			description: 'Pay with your credit card via Stripe.',
			displayNoticeInterval: '7',
			stripeCheckoutLocale: 'English',
			testPublishableKey: 'pk_test_',
			testSecretKey: 'sk_test_',
			testClientId: 'ca_',
		},

		paypalMarketPlace: {
			title: 'PayPal Marketplace',
			description: 'Pay via PayPal Marketplace you can pay with your credit card if you don\'t have a PayPal account',
			payPalMerchantId: 'partner_',
			sandboxClientId: 'client_',
			sandBoxClientSecret: 'secret_',
			payPalPartnerAttributionId: 'weDevs_SP_Dokan',
			disbursementMode: 'Delayed', // 'Immediate', 'On Order Complete', 'Delayed'
			paymentButtonType: 'Smart Payment Buttons', // 'Smart Payment Buttons', 'Standard Button'
			marketplaceLogoPath: '/wp-content/plugins/dokan/assets/images/dokan-logo.png',
			announcementInterval: '7',

		},

		mangoPay: {
			title: 'MangoPay',
			description: 'Pay via MangoPay',
			sandboxClientId: 'client_',
			sandBoxApiKey: 'secret_',
			availableCreditCards: 'CB/Visa/Mastercard', // 'CB/Visa/Mastercard', 'Maestro*', 'Bancontact/Mister Cash', 'Przelewy24*', 'Diners*', 'PayLib', 'iDeal*', 'MasterPass*', 'Bankwire Direct*'
			availableDirectPaymentServices: 'Sofort*', // 'Sofort*', 'Giropay*'],
			transferFunds: 'On payment completed', // 'On payment completed', 'On order completed', 'Delayed'
			typeOfVendors: 'Either', // 'Individuals', 'Business', 'Either'
			businessRequirement: 'Any',  // 'Organizations', 'Soletraders', 'Businesses', 'Any'
			announcementInterval: '7',

		},

		razorPay: {
			title: 'Razorpay',
			description: 'Pay securely by Credit or Debit card or Internet Banking through Razorpay.',
			testKeyId: 'rzp_test',
			testKeySecret: 'rzp_test',
			disbursementMode: 'Delayed',  // 'Immediate', 'On Order Complete', 'Delayed'
			announcementInterval: '7',

		},

		stripeExpress: {
			title: 'Dokan Express Payment Methods',
			description: 'Pay with your credit card via Stripe.',
			testPublishableKey: 'pk_test_',
			testSecretKey: 'sk_test_',
			testWebhookSecret: 'webHook_test_',
			paymentMethods: {
				card: 'Credit/Debit Card',
				ideal: 'iDEAL',
			},
			iDealBanks: ['abn_amro', 'asn_bank', 'bunq', 'handelsbanken', 'ing', 'knab', 'rabobank', 'regiobank', 'revolut', 'sns_bank', 'triodos_bank', 'van_lanschot'],
			disbursementMode: 'Delayed', // 'On payment completed', 'On order completed', 'Delayed'
			customerBankStatement: 'Dokan',
			paymentRequestButtonType: 'default',  // 'default', 'buy', 'donate', 'book'
			paymentRequestButtonTheme: 'dark',  // 'dark', 'light', 'light-outline'
			paymentRequestButtonLocation: {
				product: 'Product',
				cart: 'Cart',
			},
			announcementInterval: '7,',

		},
	},

	dokanSettings: {

		// General Settings
		general: {
			vendorStoreUrl: 'store',
			sellingProductTypes: 'sell_both', // 'sell_both', 'sell_physical', 'sell_digital'
			storeProductPerPage: '12',
			storCategory: 'none',  // 'none', 'Single', 'Multiple'
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		// Selling Options Settings
		selling: {
			commissionType: 'percentage', //'flat', 'percentage', 'combine'
			adminCommission: '10',
			shippingFeeRecipient: 'seller', //'seller', 'admin'
			taxFeeRecipient: 'seller', //'seller', 'admin'
			newProductStatus: 'publish', //'publish', 'pending'
			productCategorySelection: 'single', //'single', 'multiple'
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		// Withdraw
		withdraw: {
			customMethodName: 'Bksh',
			customMethodType: 'Phone',
			minimumWithdrawAmount: '5',
			withdrawThreshold: '0',
			quarterlyScheduleMonth: 'march', // 'january', 'february', 'march'
			quarterlyScheduleWeek: '1', //'1', '2', '3', 'L'
			quarterlyScheduleDay: 'monday', //'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
			monthlyScheduleWeek: '1', //'1', '2', '3', 'L'
			monthlyScheduleDay: 'monday', // 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
			biweeklyScheduleWeek: '1', //'1', '2'
			biweeklyScheduleDay: 'monday', //'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
			weeklyScheduleDay: 'monday', // 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		reverseWithdraw: {
			billingType: 'by_amount', // 'by_month'
			reverseBalanceThreshold: '21',
			gracePeriod: '7',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		page: {
			termsAndConditionsPage: 'Sample Page',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		appearance: {
			googleMapApiKey: String(process.env.GMAP),
			mapBoxApiKey: String(process.env.MAPBOX_API_KEY),
			storeBannerWidth: '625',
			storeBannerHeight: '300',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		privacyPolicy: {
			privacyPage: '2', // '2', '3', '4', '5', '6', '7', '8', '9', '10'
			privacyPolicyHtmlBody: 'Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [dokan_privacy_policy]',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		storeSupport: {
			displayOnSingleProductPage: 'above_tab', // 'above_tab', 'inside_tab', 'dont_show'
			supportButtonLabel: 'Get Support',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		// Rma Settings
		rma: {
			orderStatus: 'wc-processing', // 'wc-pending', 'wc-processing', 'wc-on-hold', 'wc-completed', 'wc-cancelled', 'wc-refunded', 'wc-failed'
			rmaReasons: ['Defective', 'Wrong Product', 'Other'],
			refundPolicyHtmlBody: 'Refund Policy',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		wholesale: {
			whoCanSeeWholesalePrice: 'all_user',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		euCompliance: {
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		deliveryTime: {
			deliveryDateLabel: 'Delivery Date',
			deliveryBlockedBuffer: '0',
			deliveryBoxInfo: 'This store needs %DAY% day(s) to process your delivery request',
			days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
			openingTime: '6:00 am',
			closingTime: '11:30 pm',
			timeSlot: '30',
			orderPerSlot: '90',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		productAdvertising: {
			noOfAvailableSlot: '100',
			expireAfterDays: '10',
			advertisementCost: '15',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		// Geolocation Settings
		geolocation: {
			locationMapPosition: 'top', // 'top', 'left', 'right'
			showMap: 'all', // 'all', 'store_listing', 'shop'
			radiusSearchUnit: 'km', // 'km', 'miles'
			radiusSearchMinimumDistance: '0',
			radiusSearchMaximumDistance: '10',
			mapZoomLevel: '11',
			defaultLocation: 'New York',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		productReportAbuse: {
			reasonsForAbuseReport: 'This product is fake',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		// Spmv Settings
		spmv: {
			sellItemButtonText: 'Sell This Item',
			availableVendorDisplayAreaTitle: 'Other Available Vendor',
			availableVendorSectionDisplayPosition: 'below_tabs', // 'below_tabs', 'inside_tabs', 'after_tabs'
			showSpmvProducts: 'show_all', // 'show_all', 'min_price', 'max_price', 'top_rated_vendor'
			saveSuccessMessage: 'Setting has been saved successfully.',
		},

		// Vendor Subscription Settings
		vendorSubscription: {
			displayPage: '2', // '2', '4', '5', '6', '8', '9', '10', '11', '15', '-1'
			noOfDays: '2',
			productStatus: 'draft', // 'publish', 'pending', 'draft'
			cancellingEmailSubject: 'Subscription Package Cancel notification',
			cancellingEmailBody: 'Dear subscriber, Your subscription has expired. Please renew your package to continue using it.',
			alertEmailSubject: 'Subscription Ending Soon',
			alertEmailBody: 'Dear subscriber, Your subscription will be ending soon. Please renew your package in a timely',
			saveSuccessMessage: 'Setting has been saved successfully.',
		},
	},

	module: {
		noModuleMessage: 'No modules found.',
		modules: [
			'booking', 'color_scheme_customizer', 'delivery_time', 'elementor', 'export_import', 'follow_store', 'geolocation', 'germanized', 'live_chat', 'live_search',
			'moip', 'dokan_paypal_ap', 'paypal_marketplace', 'product_addon', 'product_enquiry', 'report_abuse', 'rma', 'seller_vacation', 'shipstation', 'auction', 'spmv',
			'store_reviews', 'stripe', 'product_advertising', 'product_subscription', 'vendor_analytics', 'vendor_staff', 'vsp', 'vendor_verification', 'wholesale',
			'rank_math', 'table_rate_shipping', 'mangopay', 'order_min_max', 'razorpay', 'seller_badge', 'stripe_express', 'request_for_quotation' ]
	},

	// Dokan Setup Wizard
	dokanSetupWizard: {

		vendorStoreURL: 'store',
		shippingFeeRecipient: 'seller', //'seller', 'admin'
		taxFeeRecipient: 'seller',  // 'seller', 'admin'
		mapApiSource: 'google_maps', // 'google_maps', 'mapbox'
		googleMapApiKey: String(process.env.GMAP),
		sellingProductTypes: 'sell_both',  //'physical', 'digital', 'sell_both',
		commissionType: 'percentage',  // 'flat','percentage' 'combine',
		adminCommission: '10',
		minimumWithdrawLimit: '5',
	},

	vendorSetupWizard: {
		choice: false,
		storeProductsPerPage: '12',
		street1: 'abc street',
		street2: 'xyz street',
		country: 'United States (US)',
		city: 'New York',
		zipCode: '10006',
		state: 'New York',
		paypal: () => faker.internet.email(),
		bankAccountName: 'accountName',
		bankAccountType: faker.helpers.arrayElement(['personal', 'business']),
		bankAccountNumber: faker.string.alphanumeric(10),
		bankName: 'bankName',
		bankAddress: 'bankAddress',
		bankRoutingNumber: faker.string.alphanumeric(10),
		bankIban: faker.string.alphanumeric(10),
		bankSwiftCode: faker.string.alphanumeric(10),
		customPayment: '1234567890',
		skrill: faker.internet.email(),
	},

	subUrls: {
		backend: {
			setupWP: '/wp-admin/install.php',
			login: 'wp-login.php',
			adminLogin: 'wp-admin',
			adminLogout: 'wp-login.php?action=logout',
			adminDashboard: 'wp-admin',
			dokanWholeSaleCustomer: 'wp-admin/admin.php?page=dokan#/wholesale-customer',
			dokanSettings: 'wp-admin/admin.php?page=dokan#/settings',
			dokanVendors: 'wp-admin/admin.php?page=dokan#/vendors',
			dokanSetupWizard: 'wp-admin/admin.php?page=dokan-setup',
			woocommerceSettings: 'wp-admin/admin.php?page=wc-settings',
			wcAddNewProducts: 'wp-admin/post-new.php?post_type=product',
			wcAddNewCategories: 'wp-admin/edit-tags.php?taxonomy=product_cat&post_type=product',
			wcAddNewAttributes: 'wp-admin/edit.php?post_type=product&page=product_attributes',
			permalinks: 'wp-admin/options-permalink.php',
			general: 'wp-admin/options-general.php',
			plugins: 'wp-admin/plugins.php',
		},

		frontend: {
		// customer
			myAccount: 'my-account',
			customerLogout: 'my-account/customer-logout',
			productCustomerPage: 'product',
			ordersCustomerPage: 'orders',
			shop: 'shop',
			storeListing: 'store-listing',
			cart: 'cart',
			checkout: 'checkout',
			addToCart: '?wc-ajax=add_to_cart',
			applyCoupon: '?wc-ajax=apply_coupon',
			placeOrder: '?wc-ajax=checkout',
			billingAddress: 'my-account/edit-address/billing',
			shippingAddress: 'my-account/edit-address/shipping',
			shippingAddressCheckout: '?wc-ajax=update_order_review',
			editAccountCustomer: 'my-account/edit-account',
			becomeVendor: 'my-account/account-migration',
			supportTickets: 'my-account/support-tickets',
			productDetails: (productName: string) => `product/${productName}`,
			vendorDetails: (storeName: string) => `store/${storeName}`,
			productReview: 'wp-comments-post.php',
			submitSupport: 'wp-comments-post.php',

			//vendor dashboard
			vendorSetupWizard: '?page=dokan-seller-setup',
			dashboard: 'dashboard',
			product: 'dashboard/products',
			productAuction: 'dashboard/new-auction-product',
			productBooking: 'dashboard/booking/new-product',
			order: 'dashboard/orders',
			coupon: 'dashboard/coupons',
			reviews: 'dashboard/reviews/',
			withdraw: 'dashboard/withdraw/',
			withdrawRequests: 'dashboard/withdraw-requests',
			auction: 'dashboard/auction',
			booking: 'dashboard/booking',
			settingsStore: 'dashboard/settings/store',
			settingsAddon: 'dashboard/settings/product-addon',
			settingsPayment: 'dashboard/settings/payment',
			settingsVerification: 'dashboard/settings/verification',
			settingsDeliveryTime: 'dashboard/settings/delivery-time',
			settingsShipping: 'dashboard/settings/shipping',
			settingsSocialProfile: 'dashboard/settings/social',
			settingsRma: 'dashboard/settings/rma',
			settingsSeo: 'dashboard/settings/seo',
			editAccountVendor: 'dashboard/edit-account',
			paypal: 'dashboard/settings/payment-manage-paypal',
			bankTransfer: 'dashboard/settings/payment-manage-bank',
			customPayment: 'dashboard/settings/payment-manage-dokan_custom',
			skrill: 'dashboard/settings/payment-manage-skrill',
		},

		ajax: '/admin-ajax.php',
		post: '/post.php',
		gmap: '/maps/api',
	},

	admin: {
		username: String(process.env.ADMIN),
		password: String(process.env.ADMIN_PASSWORD),
	},

	vendor: {
		username: String(process.env.VENDOR),
		password: String(process.env.USER_PASSWORD),

		vendorInfo: {
			email: () => faker.internet.email(),
			// emailDomain: '_' + faker.string.alphanumeric(5) + '@email.com',
			emailDomain: '@email.com',
			password: String(process.env.USER_PASSWORD),
			password1: String(process.env.USER_PASSWORD) + '1',
			firstName: () => faker.person.firstName('male'),
			lastName: () => faker.person.lastName('male'),
			userName: faker.person.firstName('male'),
			shopName: faker.company.name(),
			shopUrl: faker.company.name(),
			companyName: faker.company.name(),
			companyId: faker.string.alphanumeric(5),
			vatNumber: faker.string.alphanumeric(10),
			bankIban: faker.finance.iban(),
			phoneNumber: faker.phone.number('(###) ###-####'),
			street1: 'abc street',
			street2: 'xyz street',
			country: 'United States (US)',
			countrySelectValue: 'US',
			stateSelectValue: 'NY',
			city: 'New York',
			zipCode: '10006',
			state: 'New York',
			accountName: 'accountName',
			accountNumber: faker.string.alphanumeric(10),
			bankName: 'bankName',
			bankAddress: 'bankAddress',
			routingNumber: faker.string.alphanumeric(10),
			swiftCode: faker.string.alphanumeric(10),
			iban: faker.string.alphanumeric(10),

			//shop details
			banner: 'tests/e2e/utils/sampleData/banner.png',
			profilePicture: 'tests/e2e/utils/sampleData/avatar.png',
			storeName: String(process.env.VENDOR) + 'store',
			productsPerPage: '12',
			mapLocation: 'New York',
			termsAndConditions: 'Vendor Terms and Conditions',
			biography: 'Vendor biography',
			supportButtonText: 'Get Support',

			openingClosingTime: {
				days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
				openingTime: '06:00 am',
				closingTime: '12:00 pm',
				storeOpenNotice: 'Store is open',
				storeCloseNotice: 'Store is closed',
			},

			vacation: {
				instantly: {
					closingStyle: 'instantly',
					vacationMessage: 'We are currently out of order',
				},

				datewise: {
					vacationDayFrom: () => helpers.addDays(helpers.currentDate, helpers.getRandomArbitraryInteger(31, 100)),
					vacationDayTo: (from: string) => helpers.addDays(from, 31),
					closingStyle: 'datewise',
					vacationMessage: 'We are currently out of order',
				}
			},

			discount: {
				minimumOrderAmount: '200',
				minimumOrderAmountPercentage: '10',
			},

			minMax: {
				minimumProductQuantity: '1',
				maximumProductQuantity: '20',
				minimumAmount: '10',
				maximumAmount: '1000000',
				category: 'Uncategorized',
			},
			storeSettingsSaveSuccessMessage: 'Your information has been saved successfully',
		},

		shipping: {
			shippingPolicy: {
				processingTime: '3', // '1', '2', '3', '4', '5', '6', '7', '8', '9'
				shippingPolicy: 'shipping policy',
				refundPolicy: 'refund policy',
				saveSuccessMessage: 'Settings save successfully',
			},

			shippingZone: 'US',
			shippingCountry: 'United States (US)',
			methods: faker.helpers.arrayElement(['flat_rate', 'free_shipping', 'local_pickup', 'dokan_table_rate_shipping', 'dokan_distance_rate_shipping']),
			shippingMethods: {
				flatRate: {
					shippingZone: 'US',
					shippingCountry: 'United States (US)',
					selectShippingMethod: 'flat_rate',
					shippingMethod: 'Flat Rate',
					taxStatus: 'taxable',
					shippingCost: '20',
					description: 'Flat rate',
					calculationType: 'class', // 'item', 'line', 'class', 'order'
					shippingMethodSaveSuccessMessage: 'Shipping method added successfully',
					zoneSaveSuccessMessage: 'Zone settings save successfully',
					saveSuccessMessage: 'Zone settings save successfully',
				},

				freeShipping: {
					shippingZone: 'US',
					shippingCountry: 'United States (US)',
					selectShippingMethod: 'free_shipping',
					shippingMethod: 'Free Shipping',
					freeShippingRequires: 'min_amount',
					freeShippingMinimumOrderAmount: '200',
					shippingMethodSaveSuccessMessage: 'Shipping method added successfully',
					zoneSaveSuccessMessage: 'Zone settings save successfully',
					saveSuccessMessage: 'Zone settings save successfully',
				},

				localPickup: {
					shippingZone: 'US',
					shippingCountry: 'United States (US)',
					selectShippingMethod: 'local_pickup',
					shippingMethod: 'Local Pickup',
					taxStatus: 'taxable',
					shippingCost: '20',
					description: 'Local Pickup',
					shippingMethodSaveSuccessMessage: 'Shipping method added successfully',
					zoneSaveSuccessMessage: 'Zone settings save successfully',
					saveSuccessMessage: 'Zone settings save successfully',
				},

				tableRateShipping: {
					shippingZone: 'US',
					shippingCountry: 'United States (US)',
					selectShippingMethod: 'dokan_table_rate_shipping',
					shippingMethod: 'Table Rate',
					taxStatus: 'taxable',
					taxIncludedInShippingCosts: 'no', // 'yes', 'no'
					handlingFee: '10',
					maximumShippingCost: '200',
					calculationType: 'item',
					handlingFeePerOrder: '10',
					minimumCostPerOrder: '10',
					maximumCostPerOrder: '200',
					shippingMethodSaveSuccessMessage: 'Shipping method added successfully',
					zoneSaveSuccessMessage: 'Zone settings save successfully',
					saveSuccessMessage: 'Zone settings save successfully',
					tableRateSaveSuccessMessage: 'Table rates has been saved successfully!',
				},

				distanceRateShipping: {
					shippingZone: 'US',
					shippingCountry: 'United States (US)',
					selectShippingMethod: 'dokan_distance_rate_shipping',
					shippingMethod: 'Distance Rate',
					taxStatus: 'taxable',
					transportationMode: 'driving', // 'driving', 'walking', 'Bicycling'
					avoid: 'none', // 'none', 'tolls', 'highways', 'ferries'
					distanceUnit: 'metric', // 'metric', 'imperial'
					street1: 'abc street',
					street2: 'xyz street',
					city: 'New York',
					zipCode: '10006',
					state: 'New York',
					country: 'United States (US)',
					shippingMethodSaveSuccessMessage: 'Shipping method added successfully',
					zoneSaveSuccessMessage: 'Zone settings save successfully',
					saveSuccessMessage: 'Zone settings save successfully',
					distanceRateSaveSuccessMessage: 'Distance rates has been saved successfully!',
				},

				vendorShipping: {
					shippingZone: 'US',
					shippingCountry: 'United States (US)',
					selectShippingMethod: 'dokan_vendor_shipping',
					shippingMethod: 'Vendor Shipping',
					taxStatus: 'taxable',
				},
			},

			shippingTaxStatus: 'taxable',
			saveSuccessMessage: 'Zone settings save successfully',
		},

		payment: {
			email: () => faker.internet.email(),
			bankAccountName: 'accountName',
			bankAccountType: faker.helpers.arrayElement(['personal', 'business']),
			bankAccountNumber: faker.string.alphanumeric(10),
			bankName: 'bankName',
			bankAddress: 'bankAddress',
			bankRoutingNumber: faker.string.alphanumeric(10),
			bankIban: faker.string.alphanumeric(10),
			bankSwiftCode: faker.string.alphanumeric(10),
			saveSuccessMessage: 'Your information has been saved successfully',
		},

		verification: {
			// file: '../utils/sampleData/avatar.png',
			// file2: './tests/e2e/utils/sampleData/avatar.png',
			file: 'tests/avatar.png', //TODO : image path need to fixed
			street1: 'abc street',
			street2: 'xyz street',
			city: 'New York',
			zipCode: '10006',
			country: 'US',
			state: 'NY',
			idRequestSubmitSuccessMessage: 'Your ID verification request is Sent and pending approval',
			idRequestSubmitCancel: 'Your ID Verification request is cancelled',
			addressRequestSubmitSuccessMessage: 'Your Address verification request is Sent and Pending approval',
			addressRequestSubmitCancel: 'Your Address Verification request is cancelled',
			companyRequestSubmitSuccessMessage: 'Your company verification request is sent and pending approval',
			companyRequestSubmitCancel: 'Your company verification request is cancelled',
		},

		deliveryTime: {
			deliveryBlockedBuffer: '0',
			days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
			openingTime: '06:00 am',
			closingTime: '11:30 pm',
			fullDay: 'Full day',
			timeSlot: '30',
			orderPerSlot: '100',
			saveSuccessMessage: 'Delivery settings has been saved successfully!',
		},

		socialProfileUrls: {
			facebook: 'https://www.facebook.com/',
			twitter: 'https://www.twitter.com/',
			pinterest: 'https://www.pinterest.com/',
			linkedin: 'https://www.linkedin.com/',
			youtube: 'https://www.youtube.com/',
			instagram: 'https://www.instagram.com/',
			flickr: 'https://www.flickr.com/',
			saveSuccessMessage: 'Your information has been saved successfully',
		},

		// Rma Settings
		rma: {
			label: 'Warranty',
			type: 'included_warranty', // 'no_warranty', 'included_warranty', 'addon_warranty'
			rmaLength: 'limited', // 'limited', 'lifetime'
			lengthValue: '1',
			lengthDuration: 'weeks', // 'days', 'weeks', 'months', 'years'
			refundPolicyHtmlBody: 'Refund Policy Vendor',
			saveSuccessMessage: 'Settings saved successfully',
		},

		withdraw: {

			withdrawMethod: {
				default: 'paypal',
				paypal: 'Paypal',
				skrill: 'Skrill',
				custom: 'dokan_custom'
			},

			defaultWithdrawMethod: {
				paypal: 'PayPal',
				skrill: 'Skrill',
				bankTransfer: 'Bank Transfer',
			},
			preferredPaymentMethod: 'paypal',
			preferredSchedule: 'weekly', // monthly,quarterly, biweekly,weekly
			minimumWithdrawAmount: '5', // '0', '5', '10', '15', '50', '100', '200', '300', '500', '1000', '2000', '3000', '5000', '10000'
			reservedBalance: '15',
			scheduleMessageInitial: 'Please update your withdraw schedule selection to get payment automatically.'
		},

		//addon
		addon: {
			name: () => 'Add-ons Group #' + helpers.randomNumber(),
			priority: '10',
			category: 'Uncategorized',
			type: 'multiple_choice',  // 'multiple_choice', 'checkbox', 'custom_text', 'custom_textarea', 'file_upload', 'custom_price', 'input_multiplier', 'heading'
			displayAs: 'select',  // 'select', 'radiobutton', 'images'
			titleRequired: 'Add-on Title',
			formatTitle: 'label',  // 'label', 'heading', 'hide'
			addDescription: 'Add-on description',
			enterAnOption: 'Option 1',
			optionPriceType: 'flat_fee', // 'flat_fee', 'quantity_based', 'percentage_based'
			optionPriceInput: '30',
			saveSuccessMessage: 'Add-on saved successfully',

		},

		registrationErrorMessage: 'Error: An account is already registered with your email address. Please log in.',
	},

	customer: {
		username: String(process.env.CUSTOMER),
		password: String(process.env.USER_PASSWORD),

		customerInfo: {
			// emailDomain: '_' + faker.string.alphanumeric(5) + '@email.com',
			emailDomain: '@email.com',
			email: () => faker.internet.email(),
			password: String(process.env.USER_PASSWORD),
			password1: String(process.env.USER_PASSWORD) + '1',
			firstName: () => faker.person.firstName('male'),
			lastName: () => faker.person.lastName('male'),
			// username: () => this.customer.customerInfo.firstName, //TODO: handel callback  & not works
			// storename: () => this.customer.customerInfo.firstName + 'store',
			username: () => faker.person.firstName('male'),
			storename: () => faker.person.firstName('male') + 'store',
			companyName: faker.company.name(),
			companyId: faker.string.alphanumeric(5),
			vatNumber: faker.string.alphanumeric(10),
			bankIban: faker.finance.iban(),
			phone: faker.phone.number('(###) ###-####'),
			street1: 'abc street', //TODO: address should be global or not
			street2: 'xyz street',
			country: 'United States (US)',
			countrySelectValue: 'US',
			stateSelectValue: 'NY',
			city: 'New York',
			zipCode: '10006',
			state: 'New York',
			accountName: 'accountName',
			accountNumber: faker.string.alphanumeric(10),
			bankName: 'bankName',
			bankAddress: 'bankAddress',
			routingNumber: faker.string.alphanumeric(10),
			swiftCode: faker.string.alphanumeric(10),
			iban: faker.string.alphanumeric(10),
			addressChangeSuccessMessage: 'Address changed successfully.',
			getSupport: {
				subject: 'get Support Subject',
				message: 'get Support Message',
				supportSubmitSuccessMessage: 'Thank you. Your ticket has been submitted!',
			},
		},

		rma: {
			sendMessage: 'Message send successfully',
		},

		account: {
			updateSuccessMessage: 'Account details changed successfully.',
		},

		follow: {
			following: 'Following',
		},

		supportTicket: {
			message: () => faker.string.uuid(),
		},
		registrationErrorMessage: 'Error: An account is already registered with your email address. Please log in.',
	},

	key: {
		arrowDown: 'ArrowDown',
		enter: 'Enter',
	},

	plugin: {
		// PluginSlugList: ['dokan-lite', 'dokan-pro', 'woocommerce', 'woocommerce-bookings', 'woocommerce-product-add-ons', 'woocommerce-simple-auction', 'woocommerce-subscriptions', 'elementor', 'elementor-pro'],
		plugins:['basic-auth', 'dokan', 'dokan-pro', 'woocommerce', 'woocommerce-bookings', 'woocommerce-product-addons', 'woocommerce-simple-auctions', 'woocommerce-subscriptions'],
		// plugins: ['dokan/dokan', 'dokan-pro/dokan-pro', 'woocommerce/woocommerce'],
		activeClass: 'active',
	},

	woocommerce: {
		saveSuccessMessage: 'Your settings have been saved.',
	},

	wholesale: {
		wholesaleRequestSendMessage: 'Your wholesale customer request send to the admin. Please wait for approval',
		becomeWholesaleCustomerSuccessMessage: 'You are succefully converted as a wholesale customer',
		wholesaleCapabilityActivate: 'Wholesale capability activate',
	},

	address: {
		street1: 'abc street',
		street2: 'xyz street',
		country: 'United States (US)',
		countrySelectValue: 'US',
		stateSelectValue: 'NY',
		city: 'New York',
		zipCode: '10006',
		state: 'New York',
	},

	// install wordpress
	installWp: {
		// db info
		dbName: 'dokan5',
		dbUserName: 'root',
		dbPassword: '01dokan01',
		dbHost: 'localhost',
		dbTablePrefix: 'dok_',
		// site info
		siteTitle: 'dokan5',
		adminUserName: process.env.ADMIN,
		adminPassword: process.env.USER_PASSWORD,
		adminEmail: 'shashwata@wedevs.com',

	},


	// predefined  test data
	predefined: {
		simpleProduct: {
			product1: {
				name: 'p1_v1 (simple)',
				productName: () => 'p1_v1 (simple)',
			},
			product2: 'p2_v1 (simple)',
			productFrac1: 'p1_F1_v1 (simple)',
			productFrac2: 'p2_F2_v1 (simple)',
		},

		variableProduct: {
			product1: 'p1_v1 (variable)',
		},

		simpleSubscription: {
			product1: 'p1_v1 (simple subscription)',
		},

		variableSubscription: {
			product1: 'p1_v1 (variable subscription)',
		},

		externalProduct: {
			product1: 'p1_v1 (external/affiliate)',
		},

		auctionProduct: {
			product1: 'p1_v1 (auction)',
		},

		bookingProduct: {
			product1: 'p1_v1 (booking)',
		},

		saleProduct: {
			product1: 'p1_v1 (sale)',
		},

		vendorSubscription: {
			nonRecurring: 'Dokan_Subscription_Non_recurring',
		},

		coupon: {
			couponCode: 'c1_v1',
		},

		vendorInfo: {
			firstName: () => 'vendor1',
			lastName: () => 'v1',
			username: 'vendor1',
			shopName: String(process.env.VENDOR) + 'store',
		},

		vendorStores: {
			followFromShopPage: 'shopPage',
			followFromStorePage: 'storePage',
			vendor1: String(process.env.VENDOR) + 'store',
			shopUrl: String(process.env.VENDOR) + 'store',
		},

		customerInfo: {
			firstName: () => 'customer1',
			lastName: () => 'c1',
			username: () => 'customer1',
		},
	},
};
