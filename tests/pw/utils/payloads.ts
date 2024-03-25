import { faker } from '@faker-js/faker';
import { helpers } from '@utils/helpers';
import { dbData } from '@utils/dbData';

const basicAuth = (username: string, password: string) => 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

export const payloads = {
    // wp
    createPost: {
        title: 'Hello rk',
        content: 'My Post Content.',
        status: 'publish',
    },

    createMedia: {
        title: 'avatar',
        alt_text: 'avatar_img',
        status: 'publish',
        post: '1',
    },

    createPage: () => ({
        title: 'test-page_' + faker.string.nanoid(10),
        status: 'publish',
    }),

    privacyPolicyPage: {
        title: 'Privacy Policy',
        content: 'This Privacy Policy describes how we collect, use, and disclose your personal information in connection with your use of our product.',
        status: 'publish',
    },

    tocPage: {
        title: 'Terms And Conditions',
        status: 'publish',
    },

    mediaAttributes: {
        title: 'avatar',
        caption: 'avatar_img',
        description: 'avatar_img',
        alt_text: 'avatar_img',
    },

    mimeTypes: {
        csv: 'text/csv',
        png: 'image/png',
        jpeg: 'image/jpeg',
        pdf: 'application/pdf',
        txt: 'text/plain',
        json: 'application/json',
        xml: 'application/xml',
        zip: 'application/zip',
    },

    // user auth

    adminAuth: {
        Authorization: basicAuth(process.env.ADMIN, process.env.ADMIN_PASSWORD),
    },

    vendorAuth: {
        Authorization: basicAuth(process.env.VENDOR, process.env.USER_PASSWORD),
    },

    vendor2Auth: {
        Authorization: basicAuth(process.env.VENDOR2, process.env.USER_PASSWORD),
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

    createProduct: () => ({
        name: faker.commerce.productName() + ' (Simple)',
        type: 'simple',
        regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
        // regular_price: '114.15' , // failed for this price & 5% tax & 10% commission dokan .1 issue
        status: 'publish',
        categories: [
            {
                // id: 48
                name: 'Uncategorized',
                slug: 'uncategorized',
            },
        ],
        featured: true,
        description: '<p>test description</p>',
        short_description: '<p>test short description</p>',
        meta_data: [
            {
                key: '_dokan_geolocation_use_store_settings',
                value: 'yes',
            },
            {
                key: 'dokan_geo_latitude',
                value: '40.7127753',
            },
            {
                key: 'dokan_geo_longitude',
                value: '-74.0059728',
            },
            {
                key: 'dokan_geo_public',
                value: '1',
            },
            {
                key: 'dokan_geo_address',
                value: 'New York, NY, USA',
            },
            {
                key: '_dokan_rma_override_product',
                value: 'yes',
            },
            {
                key: '_dokan_rma_settings',
                value: {
                    label: 'Warranty',
                    type: 'included_warranty',
                    policy: 'test refund policy',
                    reasons: ['defective'],
                    length: 'lifetime',
                    length_value: '',
                    length_duration: '',
                    addon_settings: [],
                },
            },
            // {
            // 	key  : '_dokan_min_max_meta',
            // 	value: {
            // 		product_wise_activation: 'yes',
            // 		min_quantity           : 0,
            // 		max_quantity           : 0,
            // 		min_amount             : 0,
            // 		max_amount             : 0,
            // 		_donot_count           : 'no',
            // 		ignore_from_cat        : 'no'
            // 	}
            // },
            // {
            // 	key  : '_product_addons',
            // 	value: []
            // },
            // {
            // 	key  : '_product_addons_exclude_global',
            // 	value: '0'
            // },
            // {
            // 	key  : '_per_product_admin_commission_type',
            // 	value: 'flat'
            // },
            // {
            // 	key  : '_per_product_admin_commission',
            // 	value: ''
            // },
            // {
            // 	key  : '_per_product_admin_additional_fee',
            // 	value: ''
            // },
            // {
            // 	key  : '_has_multi_vendor',
            // 	value: '18'
            // },
            // {
            // 	key  : '_dokan_catalog_mode',
            // 	value: {
            // 		hide_add_to_cart_button: 'off',
            // 		hide_product_price     : 'off'
            // 	}
            // },
            // {
            // 	key  : '_disable_shipping',
            // 	value: 'no'
            // },
            // {
            // 	key  : '_overwrite_shipping',
            // 	value: 'no'
            // },
        ],
    }),

    // wholesale product
    createWholesaleProduct: () => ({
        name: faker.commerce.productName() + ' (wholesale)',
        type: 'simple',
        regular_price: { min: 100, max: 110, dec: faker.helpers.arrayElement([0, 2]) },
        // regular_price: '114.15' , // failed for this price & 5% tax & 10% commission dokan .1 issue
        status: 'publish',
        categories: [
            {
                // id: 48
                name: 'Uncategorized',
                slug: 'uncategorized',
            },
        ],
        featured: true,
        description: '<p>test description</p>',
        short_description: '<p>test short description</p>',
        meta_data: [
            {
                key: '_dokan_wholesale_meta',
                value: {
                    enable_wholesale: 'yes',
                    regular_price: { min: 90, max: 99, dec: faker.helpers.arrayElement([0, 2]) },
                    // price: '100',
                    quantity: '10',
                },
            },
        ],
    }),

    createVariableProduct: () => ({
        name: faker.commerce.productName() + ' (Variable)',
        type: 'variable',
        regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
        status: 'publish',
        categories: [
            {
                // id: 48
                name: 'Uncategorized',
                slug: 'uncategorized',
            },
        ],
        // attributes: [
        // 	{
        // 		'id'       : 28,
        // 		'visible'  : true,
        // 		'variation': true,
        // 		'options'  : [
        // 			'l',
        // 			'm',
        // 			's'
        // 		]
        // 	}
        // ],
    }),

    createProductVariation: {
        // id: '47',
        regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
        status: 'publish',
        categories: [
            {
                //  id: 48
                name: 'Uncategorized',
                slug: 'uncategorized',
            },
        ],
        attributes: [
            {
                id: 18,
                // name: 'size',
                option: 'l',
            },
        ],
    },

    batchProductVariation: {
        id: '',
        regular_price: '99.00',
    },

    createDownloadableProduct: () => ({
        name: faker.commerce.productName() + ' (Downloadable)',
        type: 'simple',
        downloadable: true,
        regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
        downloads: [],
        // download_limit: 100,
        // download_expiry: 100,
        categories: [
            {
                // id: 48
            },
        ],
    }),

    createSimpleSubscriptionProduct: () => ({
        name: faker.commerce.productName() + ' (Subscription)',
        type: 'subscription',
        status: 'publish',
        featured: true,
        description: '<p>test description</p>\n',
        short_description: '<p>test short description</p>\n',
        price: '100',
        regular_price: '100',
        categories: [{}],
        meta_data: [
            {
                key: '_subscription_price',
                value: '100',
            },
            {
                key: '_subscription_period_interval', // every 1st, 2nd, .. month
                value: '1',
            },
            {
                key: '_subscription_period',
                value: 'month',
            },
            {
                key: '_subscription_length', // expire after
                value: '0',
            },
            // {
            //     "key": "_subscription_trial_length",
            //     "value": "5"
            // },
            // {
            //     "key": "_subscription_sign_up_fee",
            //     "value": "10"
            // },
            // {
            //     "key": "_subscription_trial_period",
            //     "value": "day"
            // },
            // {
            //     "key": "_subscription_one_time_shipping",
            //     "value": "no"
            // },
            // {
            //     "key": "_subscription_payment_sync_date",
            //     "value": "0"
            // }
        ],
    }),

    createBookableProduct: () => ({
        name: faker.commerce.productName() + ' (Bookable)',
        status: 'publish',
        featured: true,
        description: '<p>test description</p>',
        short_description: '<p>test short description</p>',
        categories: [{}],
        duration_type: 'customer',
        duration_unit: 'day',
        duration: 1,
        min_duration: 1,
        max_duration: 10,
        calendar_display_mode: 'always_visible',
        enable_range_picker: true,
        requires_confirmations: false,
        can_be_cancelled: false,
        default_date_availability: 'available',
        block_cost: 5,
        cost: 10,
        has_persons: false,
        has_resources: false,
        qty: 100,
        // min_date_value           : 10,
        // min_date_unit            : 'day',
        // max_date_value           : 11,
        // max_date_unit            : 'month'
    }),

    createBookingResource: () => ({
        name: 'resource_' + faker.string.nanoid(10),
        qty: '1',
        availability: [
            {
                type: 'months',
                bookable: 'yes',
                priority: 1,
                from: '1',
                to: '12',
            },
        ],
        base_cost: 5,
        block_cost: 6,
    }),

    createBookingResourceByDb: () => ({
        author: 1,
        title: 'resource_' + faker.string.nanoid(10),
        status: 'publish',
        comment_status: 'closed',
        ping_status: 'closed',
    }),

    createAuctionProduct: () => ({
        name: faker.commerce.productName() + ' (Auction)',
        type: 'auction',
        status: 'publish',
        featured: true,
        description: 'test description',
        short_description: 'test short description',
        price: '2000',
        regular_price: '2000',
        purchasable: true,
        virtual: false,
        downloadable: false,
        categories: [{}],
        meta_data: [
            {
                key: '_auction_item_condition',
                value: 'new',
            },
            {
                key: '_auction_type',
                value: 'normal',
            },

            {
                key: '_auction_start_price',
                value: '10', // faker.finance.amount({min:10, max:20, dec:2}),
            },
            {
                key: '_auction_bid_increment',
                value: '20',
            },
            {
                key: '_auction_reserved_price',
                value: '30',
            },
            {
                key: '_auction_dates_from',
                value: helpers.currentDateTime,
            },
            {
                key: '_auction_dates_to',
                value: helpers.addDays(helpers.currentDateTime, 20, 'full'),
            },
            {
                key: '_auction_has_started',
                value: '1',
            },

            // {
            // 	key  : '_auction_bid_count',
            // 	value: '0'
            // },
            // {
            // 	key  : '_auction_proxy',
            // 	value: '0'
            // },
            // {
            // 	key  : '_auction_sealed',
            // 	value: 'no'
            // },
            // {
            // 	key  : '_auction_automatic_relist',
            // 	value: 'no'
            // },
            // {
            // 	key  : '_auction_relist_fail_time',
            // 	value: ''
            // },
            // {
            // 	key  : '_auction_relist_not_paid_time',
            // 	value: ''
            // },
            // {
            // 	key  : '_auction_relist_duration',
            // 	value: ''
            // },
            // {
            // 	key  : '_auction_extend_enable',
            // 	value: 'no'
            // },
            // {
            // 	key  : '_auction_last_activity',
            // 	value: '1693755727'
            // },
        ],
    }),

    createProductAddons: () => ({
        name: 'Test Addons Group_' + faker.string.nanoid(10),
        priority: 10,
        restrict_to_categories: [],
        fields: [
            {
                name: 'Test Add-on Title_' + faker.string.nanoid(10),
                title_format: 'label',
                description_enable: 1,
                description: 'Test Add-on description',
                type: 'multiple_choice',
                display: 'select',
                position: 0,
                required: 0,
                restrictions: 0,
                restrictions_type: 'any_text',
                adjust_price: 0,
                price_type: 'flat_fee',
                price: '',
                min: 0,
                max: 0,
                options: [
                    {
                        label: 'Option 1',
                        price: '10',
                        image: '',
                        price_type: 'flat_fee',
                    },
                    {
                        label: 'Option 2',
                        price: '20',
                        image: '',
                        price_type: 'flat_fee',
                    },
                ],
            },
        ],
    }),

    updateProduct: () => ({ regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }) }),

    updateProductVariation: () => ({ regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }) }),

    createProductReview: () => ({
        product_id: '',
        // review        : 'Test_review' + faker.string.nanoid(10),
        review: 'Test_review_' + faker.string.nanoid(10),
        reviewer: faker.person.fullName(),
        reviewer_email: faker.internet.email(),
        rating: faker.number.int({ min: 1, max: 5 }),
        status: 'approved', // approved, hold, spam, unspam, trash, untrash
    }),

    // product review

    updateReview: {
        review: () => 'review_message_' + faker.string.nanoid(10),
        rating: faker.number.int({ min: 1, max: 5 }),
        name: 'customer1',
        email: 'customer1@g.com',
        verified: true,
    },

    // product category

    createCategoryRandom: () => ({
        name: faker.string.nanoid(10),
    }),

    createCategory: {
        name: 'Clothing',
    },

    updateCategory: {
        name: 'Clothing',
    },

    // attribute

    updateBatchAttributesTemplate: () => ({
        id: '',
        description: 'updated description (batch req)',
    }),

    updateBatchAttributeTermsTemplate: () => ({
        id: '',
        order_by: 'menu_order',
    }),

    // coupon

    createCoupon: () => ({
        code: 'VC_' + faker.string.nanoid(10),
        discount_type: faker.helpers.arrayElement(['percent', 'fixed_product']),
        amount: faker.number.int({ min: 1, max: 10 }).toString(),
        product_ids: [15],
        individual_use: false,
        meta_data: [
            {
                key: 'apply_before_tax',
                value: 'no',
            },
            {
                key: 'apply_new_products',
                value: 'yes',
            },
            {
                key: 'show_on_store',
                value: 'yes',
            },
        ],
    }),

    createCoupon1: {
        code: 'c1_v1',
        discount_type: 'percent',
        amount: '10',
        product_ids: [],
        individual_use: false,
        meta_data: [
            {
                key: 'apply_before_tax',
                value: 'no',
            },
            {
                key: 'apply_new_products',
                value: 'yes',
            },
            {
                key: 'show_on_store',
                value: 'yes',
            },
        ],
    },

    createMarketPlaceCoupon: () => ({
        code: 'AC_' + faker.string.nanoid(10),
        discount_type: faker.helpers.arrayElement(['percent', 'fixed_product', 'fixed_cart']),
        amount: faker.number.int({ min: 1, max: 10 }).toString(),
        individual_use: false,
        meta_data: [
            {
                key: 'admin_coupons_enabled_for_vendor',
                value: 'yes',
            },
            {
                key: 'coupon_commissions_type',
                value: 'default', // 'default', 'from_vendor', 'from_admin', 'shared_coupon'
            },
            {
                key: 'admin_coupons_show_on_stores',
                value: 'yes',
            },
            {
                key: 'admin_coupons_send_notify_to_vendors', // todo:  doesn't work
                value: 'yes',
            },
        ],
    }),

    updateCoupon: () => ({ amount: faker.number.int({ min: 1, max: 10 }).toString() }),

    // order

    updateOrder: {
        status: 'wc-pending',
    },

    createOrder: {
        payment_method: 'bacs',
        payment_method_title: 'Direct Bank Transfer',
        set_paid: true,
        customer_id: 0,
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
            // {
            //     product_id: '',
            //     quantity: 1,
            // },
        ],

        shipping_lines: [
            {
                method_id: 'flat_rate',
                method_title: 'Flat Rate',
                total: '10.00',
            },
        ],

        coupon_lines: [],
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

    createOrderNoteForCustomer: {
        status: 'processing',
        note: 'test order note' + faker.string.nanoid(10),
        customer_note: 'true',
    },

    // refund

    createRefund: {
        api_refund: false,
        amount: '25',
        reason: 'testing refund',
        refunded_by: 3,
        // line_items : [{ refund_total: 1 }],
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
        minimum: dbData.dokan.withdrawSettings.withdraw_limit, // should be equal to minimum limit
        reserve: 0,
        method: 'paypal',
    },

    withdrawCharge: {
        method: 'paypal',
        amount: '100',
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
        enabled: true,
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
        location: '40.7127753,-74.0059728', // NY
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
        vendor_store_location_pickup: {
            multiple_store_location: 'no',
            default_location_name: 'Default',
        },
        store_locations: [],
    },

    // attribute

    createAttribute: () => ({
        name: 'Test_attribute_' + faker.string.alpha(8),
        // slug        : `pa_${payloads.createAttribute.name}`,
        // type        : 'select',
        // order_by    : 'menu_order',
        // has_archives: false
    }),

    updateAttribute: () => ({ name: 'Updated_Test_attribute_' + faker.string.alpha(5) }),

    createAttributeTerm: () => ({ name: 'Test_attributeTerm_' + faker.string.alpha(8) }),

    updateAttributeTerm: () => ({ name: 'Updated_Test_attributeTerm_' + faker.string.alpha(5) }),

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
        // title        : 'dokan',
        // description  : 'Just another WordPress site',
        // url          : 'http://dokan.test',
        // email        : 'shashwata@wedevs.com',
        timezone: 'Asia/Dhaka',
        date_format: 'F j, Y',
        time_format: 'g:i a',
        start_of_week: 1,
        language: '',
        // use_smilies           : true,
        // default_category      : 1,
        // default_post_format   : '0',
        // posts_per_page        : 10,
        // show_on_front         : 'posts',
        // page_on_front         : 0,
        // page_for_posts        : 0,
        // default_ping_status   : 'open',
        // default_comment_status: 'open',
        // site_logo             : 0,
        // site_icon             : 0
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

    addShippingMethodFlatRate: {
        method_id: 'flat_rate',
    },

    addShippingMethodFreeShipping: {
        method_id: 'free_shipping',
    },

    addShippingMethodLocalPickup: {
        method_id: 'local_pickup',
    },

    addShippingMethodDokanTableRateShipping: {
        method_id: 'dokan_table_rate_shipping',
    },

    addShippingMethodDokanDistanceRateShipping: {
        method_id: 'dokan_distance_rate_shipping',
    },

    addShippingMethodDokanVendorShipping: {
        method_id: 'dokan_vendor_shipping',
    },

    // woocommerce settings: general , products, tax, shipping, checkout, account

    // general

    general: {
        update: [
            // store address
            {
                id: 'woocommerce_store_address',
                // label: 'Address line 1',
                value: 'abc street',
            },
            {
                id: 'woocommerce_store_address_2',
                // label: 'Address line 2',
                value: 'xyz street',
            },
            {
                id: 'woocommerce_store_city',
                // label: 'City',
                value: 'New York',
            },
            {
                id: 'woocommerce_default_country',
                // label: 'Country / State',
                value: 'US:NY',
            },
            {
                id: 'woocommerce_store_postcode',
                // label: 'Postcode / ZIP',
                value: '10006',
            },

            // general options
            {
                id: 'woocommerce_allowed_countries',
                // label: 'Selling location(s)',
                value: 'all', // 'all', 'all_except', 'specific'
            },
            {
                id: 'woocommerce_ship_to_countries',
                // label: 'Shipping location(s)',
                value: '', // '', 'specific', 'disabled'
            },
            {
                id: 'woocommerce_default_customer_address',
                // label: 'Default customer location',
                value: 'base', // '', 'base', 'geolocation', 'geolocation_ajax'
            },
            {
                id: 'woocommerce_calc_taxes',
                // label: 'Enable taxes',
                value: 'yes',
                // value: 'no',
            },
            {
                id: 'woocommerce_enable_coupons',
                // label: 'Enable coupons',
                value: 'yes',
            },

            // currency options
            {
                id: 'woocommerce_currency',
                // label: 'Currency',
                value: 'USD',
            },
            {
                id: 'woocommerce_currency_pos',
                // label: 'Currency position',
                value: 'left', // 'left', 'right', 'left_space', 'right_space'
            },
            {
                id: 'woocommerce_price_thousand_sep',
                // label: 'Thousand separator',
                value: '.',
                // value: '.',
            },

            {
                id: 'woocommerce_price_decimal_sep',
                // label: 'Decimal separator',
                value: ',',
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

    // enable tax rate
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

    // create tax rate
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

    // account

    account: {
        update: [
            // Guest checkout
            {
                id: 'woocommerce_enable_guest_checkout',
                // description: "Allow customers to place orders without an account",
                value: 'yes',
            },
            {
                id: 'woocommerce_enable_checkout_login_reminder',
                // description: "Allow customers to log into an existing account during checkout",
                value: 'yes',
            },

            // Account creation
            {
                id: 'woocommerce_enable_signup_and_login_from_checkout',
                // description: "Allow customers to create an account during checkout",
                value: 'yes',
            },
            // {
            // 	id: 'woocommerce_enable_signup_from_checkout_for_subscriptions',
            // description: "Allow subscription customers to create an account during checkout",
            // 	value: 'yes',
            // },
            {
                id: 'woocommerce_enable_myaccount_registration',
                // description: "Allow customers to create an account on the \"My account\" page",
                value: 'yes',
            },
            {
                id: 'woocommerce_registration_generate_username',
                // description: "When creating an account, automatically generate an account username for the customer based on their name, surname or email",
                value: 'yes',
            },
            {
                id: 'woocommerce_registration_generate_password',
                // description: 'When creating an account, send the new user a link to set their password',
                value: 'no',
                // value: 'yes',
            },
        ],
    },

    // enable HPOS
    advanced: {
        update: [
            // High performance order storage (HPOS)
            {
                id: 'woocommerce_custom_orders_table_enabled',
                // label: "Data storage for orders",
                type: 'radio',
                // "options": {
                //     "no": "WordPress post tables",
                //     "yes": "High performance order storage (new)"
                // },
                value: 'yes',
            },
            {
                id: 'woocommerce_custom_orders_table_data_sync_enabled',
                // description: "Keep the posts and orders tables in sync (compatibility mode).",
                value: 'yes',
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

    stripeConnect: {
        id: 'dokan-stripe-connect',
        title: 'Dokan Credit card (Stripe)',
        // description: 'Pay with your credit card via Stripe.',
        enabled: true,
        settings: [
            {
                id: 'title',
                // label: "Title",
                // description: "This controls the title which the user sees during checkout.",
                value: 'Dokan Credit card (Stripe)',
            },
            {
                id: 'allow_non_connected_sellers',
                // label: "Allow ordering products from non-connected sellers",
                // description: "If this is enable, customers can order products from non-connected sellers. The payment will send to admin Stripe account.",
                value: 'yes',
            },
            {
                id: 'display_notice_to_non_connected_sellers',
                // label: "If checked, non-connected sellers will receive announcement notice to connect their Stripe account. ",
                // description: "If checked, non-connected sellers will receive announcement notice to connect their Stripe account once in a week.",
                value: 'yes',
            },
            {
                id: 'display_notice_interval',
                // label: "If Display Notice to Connect Seller",
                // description: "If this is enabled and Dokan Stripe Connect is the only gateway available, non-connected sellers will receive announcement notice to connect their Stripe account once in a week.",
                value: '7',
            },
            {
                id: 'enable_3d_secure',
                // label: "Enable 3D Secure and Strong Customer Authentication",
                // description: "Note: 3D Secure and SCA ready transaction is only supported when both your platform and the connected account (Vendor) are in the same region: both in Europe or both in the U.S.",
                value: 'yes',
            },
            {
                id: 'seller_pays_the_processing_fee',
                // label: "If activated, Sellers will pay the Stripe processing fee instead of Admin/Site Owner in 3DS mode.",
                // description: "By default Admin/Site Owner pays the Stripe processing fee.",
                value: 'yes',
            },
            {
                id: 'testmode',
                // label: "Enable Test Mode",
                // description: "Place the payment gateway in test mode using test API keys.",
                value: 'yes',
            },
            {
                id: 'stripe_checkout',
                // label: "Enable Stripe Checkout",
                // description: "(This only works when 3D Secure and SCA is disabled) If enabled, this option shows a \"pay\" button and modal credit card form on the checkout, instead of credit card fields directly on the page.",
                value: 'yes',
            },
            {
                id: 'stripe_checkout_locale',
                // label: "Stripe Checkout locale",
                // description: "Language to display in Stripe Checkout modal. Specify Auto to display Checkout in the user's preferred language, if available. English will be used by default.",
                value: 'en',
                // 'options': {
                //     'auto': 'Auto',
                //     'zh': 'Simplified Chinese',
                //     'da': 'Danish',
                //     'nl': 'Dutch',
                //     'en': 'English',
                //     'fi': 'Finnish',
                //     'fr': 'French',
                //     'de': 'German',
                //     'it': 'Italian',
                //     'ja': 'Japanese',
                //     'no': 'Norwegian',
                //     'es': 'Spanish',
                //     'sv': 'Swedish'
                // }
            },
            {
                id: 'stripe_checkout_image',
                // label: "Checkout Image",
                // description: "Optionally enter the URL to a 128x128px image of your brand or product. e.g. <code>https://yoursite.com/wp-content/uploads/2013/09/yourimage.jpg</code>",
                value: '',
            },
            {
                id: 'stripe_checkout_label',
                // label: "Checkout Button Label",
                // description: "Optionally enter a Label for PAY button",
                value: '',
            },
            {
                id: 'saved_cards',
                // label: "Enable saved cards",
                // description: "If enabled, users will be able to pay with a saved card during checkout. Card details are saved on Stripe servers, not on your store.",
                value: 'yes',
            },
            {
                id: 'live-credentials-title',
                // label: "Live credentials",
                // description: "",
                value: '',
            },
            {
                id: 'publishable_key',
                // label: "Publishable Key",
                // description: "Get your API keys from your stripe account.",
                value: '',
            },
            {
                id: 'secret_key',
                // label: "Secret Key",
                // description: "Get your API keys from your stripe account.",
                value: '',
            },
            {
                id: 'client_id',
                // label: "Client ID",
                // description: "Get your client ID from your stripe account, the Apps menu.",
                value: '',
            },
            {
                id: 'test-credentials-title',
                // label: "Test credentials",
                // description: "",
                type: 'title',
                value: '',
            },
            {
                id: 'test_publishable_key',
                // label: "Test Publishable Key",
                // description: "Get your API keys from your stripe account.",
                value: process.env.TEST_PUBLISH_KEY_STRIPE,
            },
            {
                id: 'test_secret_key',
                // label: "Test Secret Key",
                // description: "Get your API keys from your stripe account.",
                value: process.env.TEST_SECRET_KEY_STRIPE,
            },
            {
                id: 'test_client_id',
                // label: "Test Client ID",
                // description: "Get your client ID from your stripe account, the Apps menu.",
                value: process.env.CLIENT_ID_STRIPE,
            },
        ],
    },

    payPal: {
        id: 'dokan_paypal_marketplace',
        title: 'PayPal Marketplace',
        // description: null,
        enabled: false,
        settings: [
            {
                id: 'shipping_tax_fee_recipient_notice',
                // label: "Note",
                // description: "For this payment gateway, <strong>Shipping Fee Recipient</strong> and <strong>Tax Fee Recipient</strong> will be set to <strong>Seller</strong>. Otherwise, in case of partial refund, you will not be able to refund shipping or tax fee from admin commission.",
                value: '',
            },
            {
                id: 'title',
                // label: "Title",
                // description: "This controls the title which the user sees during checkout.",
                value: 'PayPal Marketplace',
            },
            {
                id: 'partner_id',
                // label: "PayPal Merchant ID/Partner ID",
                // description: "To get Merchant ID goto Paypal Dashboard --> Account Settings --> Business Information section.",
                value: '',
            },
            {
                id: 'api_details',
                // label: "API credentials",
                // description: "Your API credentials are a client ID and secret, which authenticate API requests from your account. You get these credentials from a REST API app in the Developer Dashboard. Visit <a href=\"https://developer.paypal.com/docs/platforms/get-started/\">this link</a> for more information about getting your api details.",
                value: '',
            },
            {
                id: 'test_mode',
                // label: "Enable PayPal sandbox",
                // description: "PayPal sandbox can be used to test payments. Sign up for a developer account <a href=\"https://developer.paypal.com/\">here</a>.",
                value: 'no',
            },
            {
                id: 'app_user',
                // label: "Client ID",
                // description: "For this payment method your need an application credential",
                value: '',
            },
            {
                id: 'app_pass',
                // label: "Client Secret",
                // description: "For this payment method your need an application credential",
                value: '',
            },
            {
                id: 'test_app_user',
                // label: "Sandbox Client ID",
                // description: "For this system please sign up in developer account and get your  application credential",
                value: '',
            },
            {
                id: 'test_app_pass',
                // label: "Sandbox Client Secret",
                // description: "For this system please sign up in developer account and get your  application credential",
                value: '',
            },
            {
                id: 'bn_code',
                // label: "PayPal Partner Attribution Id",
                // description: "PayPal Partner Attribution ID will be given to you after you setup your PayPal Marketplace account. If you do not have any, default one will be used.",
                value: 'weDevs_SP_Dokan',
            },
            {
                id: 'disbursement_mode',
                // label: "Disbursement Mode",
                // description: "Choose whether you wish to disburse funds to the vendors immediately or hold the funds. Holding funds gives you time to conduct additional vetting or enforce other platform-specific business logic.",
                value: 'INSTANT',
                // "options": {
                //     "INSTANT": "Immediate",
                //     "ON_ORDER_COMPLETE": "On Order Complete",
                //     "DELAYED": "Delayed"
                // }
            },
            {
                id: 'disbursement_delay_period',
                // label: "Disbursement Delay Period",
                // description: "Specify after how many days funds will be disburse to corresponding vendor. Maximum holding period is 29 days. After 29 days, fund will be automatically disbursed to corresponding vendor.",
                value: '7',
            },
            {
                id: 'button_type',
                // label: "Payment Button Type",
                // description: "Smart Payment Buttons type is recommended.",
                value: 'smart',
                // "options": {
                //     "smart": "Smart Payment Buttons",
                //     "standard": "Standard Button"
                // }
            },
            {
                id: 'ucc_mode_notice',
                // label: "Set up advanced credit and debit card payments",
                // description: "Set up advanced payment options on your checkout page so your buyers can pay with debit and credit cards, PayPal, and alternative payment methods. <strong>Supported Countries:</strong> Australia, Canada, France, Italy, Spain, United States, United Kingdom",
                value: '',
            },
            {
                id: 'ucc_mode',
                // label: "Allow advanced credit and debit card payments",
                // description: "",
                value: 'no',
            },
            {
                id: 'marketplace_logo',
                // label: "Marketplace Logo",
                // description: "When vendors connect their PayPal account, they will see this logo upper right corner of the PayPal connect window",
                value: 'http://dokan1.test/wp-content/plugins/dokan/assets/images/dokan-logo.png',
            },
            {
                id: 'display_notice_on_vendor_dashboard',
                // label: "If checked, non-connected sellers will see a notice to connect their PayPal account on their vendor dashboard.",
                // description: "If this is enabled, non-connected sellers will see a notice to connect their Paypal account on their vendor dashboard.",
                value: 'no',
            },
            {
                id: 'display_notice_to_non_connected_sellers',
                // label: "If checked, non-connected sellers will receive announcement notice to connect their PayPal account. ",
                // description: "If this is enabled non-connected sellers will receive announcement notice to connect their Paypal account once in a week by default.",
                value: 'no',
            },
            {
                id: 'display_notice_interval',
                // label: "Send Announcement Interval",
                // description: "If Send Announcement to Connect Seller setting is enabled, non-connected sellers will receive announcement notice to connect their PayPal account once in a week by default. You can control notice display interval from here.",
                value: '7',
            },
            {
                id: 'webhook_message',
                // label: "Webhook URL",
                // description: "Webhook URL will be set <strong>automatically</strong> in your application settings with required events after you provide <strong>correct API information</strong>. You don't have to setup webhook url manually. Only make sure webhook url is available to <code>https://dokan1.test/wc-api/dokan-paypal</code> in your PayPal <a href=\"https://developer.paypal.com/developer/applications/\" target=\"_blank\">application settings</a>.",
                value: '',
            },
        ],
    },

    mangoPay: {
        id: 'dokan_mangopay',
        title: 'MangoPay',
        // description: null,
        enabled: false,
        settings: [
            {
                id: 'title',
                // label: 'title',
                // description: 'This controls the title which the user sees during checkout.',
                value: 'MangoPay',
            },
            {
                id: 'api_details',
                // label: 'API Credentials',
                // description: 'Your API credentials are a client ID and API key, which authenticate API requests from your account. You can collect these credentials from a REST API app in the Developer Dashboard. Visit <a href="https://mangopay.com/start" target="_blank">this link</a> for more information about getting your api details.',
                value: '',
            },
            {
                id: 'sandbox_mode',
                // label: 'Enable MangoPay sandbox',
                // description: 'MangoPay sandbox can be used to test payments.',
                value: 'yes',
            },
            {
                id: 'client_id',
                // label: 'Client ID',
                // description: 'Credential for the main MangoPay account',
                value: '',
            },
            {
                id: 'api_key',
                // label: 'API Key',
                // description: 'Credential for the main MangoPay account',
                value: '',
            },
            {
                id: 'sandbox_client_id',
                // label: 'Sandbox Client ID',
                // description: 'Credential for the MangoPay sandbox account',
                value: process.env.SANDBOX_CLIENT_ID_MANGOPAY,
            },
            {
                id: 'sandbox_api_key',
                // label: 'Sandbox API Key',
                // description: 'Credential for the MangoPay sandbox account',
                value: process.env.SANDBOX_API_KEY,
            },
            {
                id: 'payment_options',
                // label: 'Payment Options',
                // description: 'Configure the environment for payment to control how the customers will be able to pay.',
                value: '',
            },
            {
                id: 'cards',
                // label: 'Choose Available Credit Cards',
                // description: 'Payment types marked with asterisk(*) needs to be activated for your account. Please contact <a href="https://support.mangopay.com/s/contactsupport" target="_blank">MangoPay</a>.',
                value: ['CB_VISA_MASTERCARD', 'MAESTRO', 'BCMC', 'P24', 'DINERS', 'PAYLIB', 'IDEAL', 'MASTERPASS', 'BANK_WIRE'],
                // "options": {
                //     "CB_VISA_MASTERCARD": "CB/Visa/Mastercard",
                //     "MAESTRO": "Maestro*",
                //     "BCMC": "Bancontact/Mister Cash",
                //     "P24": "Przelewy24*",
                //     "DINERS": "Diners*",
                //     "PAYLIB": "PayLib",
                //     "IDEAL": "iDeal*",
                //     "MASTERPASS": "MasterPass*",
                //     "BANK_WIRE": "Bankwire Direct*"
                // }
            },
            {
                id: 'direct_pay',
                // label: 'Choose Available Direct Payment Services',
                // description: 'Payment types marked with asterisk(*) needs to be activated for your account. Please contact <a href="https://support.mangopay.com/s/contactsupport" target="_blank">MangoPay</a>.',
                value: '',
                // "options": {
                //     "SOFORT": "Sofort*",
                //     "GIROPAY": "Giropay*"
                // }
            },
            {
                id: 'saved_cards',
                // label: 'Enable saved cards',
                // description: 'If enabled, customers will be able to save cards during checkout. Card data will be saved on MangoPay server, not on the store.',
                value: 'yes',
            },
            {
                id: 'platform_fees',
                // label: 'Platform Fees',
                // description: 'MangoPay collects platform fees from the marketplace owner. That means, all platform fees will be collected from your commission. If you need information about the amount charged as platform fees, please see the <a href="https://www.mangopay.com/pricing/" target="_blank">pricing plan</a> here. Also, if you want to know how the platform fees are collected, please read their <a href="https://docs.mangopay.com/guide/collecting-platform-fees" target="_blank">documentation</a>.',
                value: '',
            },
            {
                id: 'fund_transfers',
                // label: 'Fund Transfers and Payouts',
                // description: 'Configure how and when you want to transfer/payout funds to the vendors.',
                value: '',
            },
            {
                id: 'disburse_mode',
                // label: 'Choose when you want to disburse funds to the vendors',
                // description: 'You can choose when whether you want to transfer funds to vendors after the order is completed, or immediately after the payment is completed, or delay the transfer even if the order is processing or completed.',
                value: 'ON_ORDER_PROCESSING',
                // "options": {
                //     "ON_ORDER_PROCESSING": "On payment completed",
                //     "ON_ORDER_COMPLETED": "On order completed",
                //     "DELAYED": "Delayed"
                // }
            },
            {
                id: 'disbursement_delay_period',
                // label: 'Delay Period (Days)',
                // description: 'Specify after how many days funds will be disburse to corresponding vendor. The funcds will be transferred to vendors after this period automatically',
                value: '14',
            },
            {
                id: 'instant_payout',
                // label: 'Enable instant payout mode',
                // description: 'Enable instant payout so that the payout can be processed within 25 seconds, whereas, the standard payouts get processed within 48 hours. This feature is limited and requires some prerequisites to be fulfiled. Please check out the requirements <a href="https://docs.mangopay.com/guide/instant-payment-payout" target="_blank">here</a>.',
                value: 'yes',
            },
            {
                id: 'user_types',
                // label: 'Types and Requirements of Vendors',
                // description: 'Configure the types of vendors. It will define the types of vendors who are going to use the gateway. This way you can bound the types of vendors, according to which the verification process will be applied.',
                value: '',
            },
            {
                id: 'default_vendor_status',
                // label: 'Type of Vendors',
                // description: 'All the vendors are bound to this type and they will be verified according to this. Choose \'Either\' if no restriction is needed.',
                value: 'NATURAL',
                // "options": {
                //     "NATURAL": "Individuals",
                //     "LEGAL": "Business",
                //     "EITHER": "Either"
                // }
            },
            {
                id: 'default_business_type',
                // label: 'Business Requirement',
                // description: 'All the business are bound to this type and the verification process will be applied accordingly. Choose \'Any\' if no restriction is needed.',
                value: 'ORGANIZATION',
                // "options": {
                //     "ORGANIZATION": "Organizations",
                //     "SOLETRADER": "Soletraders",
                //     "BUSINESS": "Businesses",
                //     "EITHER": "Any"
                // }
            },
            {
                id: 'advanced',
                // label: 'Advanced Settings',
                // description: 'Set up advanced settings to manage some extra options.',
                value: '',
            },
            {
                id: 'notice_on_vendor_dashboard',
                // label: 'If checked, non-connected sellers will see a notice to connect their MangoPay account on their vendor dashboard.',
                // description: 'If this is enabled, non-connected sellers will see a notice to connect their MangoPay account on their vendor dashboard.',
                value: 'yes',
            },
            {
                id: 'announcement_to_sellers',
                // label: 'If checked, non-connected sellers will receive announcement notice to connect their MangoPay account. ',
                // description: 'If this is enabled non-connected sellers will receive announcement notice to connect their MangoPay account.',
                value: 'yes',
            },
            {
                id: 'notice_interval',
                // label: 'Announcement Interval',
                // description: 'If Send Announcement to Connect Seller setting is enabled, non-connected sellers will receive announcement notice to connect their MangoPay account once in a week by default. You can control notice display interval from here. The interval value will be considered in days.',
                value: '7',
            },
        ],
    },

    razorpay: {
        id: 'dokan_razorpay',
        title: 'Razorpay',
        enabled: false,
        settings: [
            {
                id: 'title',
                // label: title,
                // description: 'This controls the title which the user sees during checkout.',
                value: 'Razorpay',
            },
            {
                id: 'api_details',
                // label: 'API credentials',
                // description: 'Your API credentials are a API Key and secret, which authenticate API requests from your account. You get these credentials from a REST API app in the Developer Dashboard. Visit <a href="https://dashboard.razorpay.com/app/keys">this link</a> for more information about getting your api details.',
                value: '',
            },
            {
                id: 'test_mode',
                // label: 'Enable Razorpay sandbox',
                // description: 'Razorpay sandbox can be used to test payments. Sign up for a developer account <a href="https://dashboard.razorpay.com/">here</a>.',
                value: 'yes',
            },
            {
                id: 'key_id',
                // label: 'Key ID',
                // description: 'The key Id can be generated from Razorpay Dashboard --&gt; Settings <a href="https://dashboard.razorpay.com/app/keys" target="_blank">here</a>.',
                value: '',
            },
            {
                id: 'key_secret',
                // label: 'Key Secret',
                // description: 'The key secret can be generated from Razorpay Dashboard --&gt; Settings <a href="https://dashboard.razorpay.com/app/keys" target="_blank">here</a>.',
                value: '',
            },
            {
                id: 'test_key_id',
                // label: 'Test Key ID',
                // description: 'The Test key Id can be generated from Razorpay Dashboard --&gt; Settings <a href="https://dashboard.razorpay.com/app/keys" target="_blank">here</a>.',
                value: process.env.TEST_KEY_ID_RAZORPAY,
            },
            {
                id: 'test_key_secret',
                // label: 'Test Key Secret',
                // description: 'The Test key secret can be generated from Razorpay Dashboard --&gt; Settings <a href="https://dashboard.razorpay.com/app/keys" target="_blank">here</a>.',
                value: process.env.TEST_KEY_SECRET_RAZORPAY,
            },
            {
                id: 'enable_route_transfer',
                // label: 'Enable Route Transfer',
                // description: 'To make split payment enabled, you must <strong>Activate Route Transfer</strong> from Razorpay Dashboard <a href="https://dashboard.razorpay.com/app/route/payments" target="_blank">here</a>.',
                value: '',
            },
            {
                id: 'disbursement_mode',
                // label: 'Disbursement Mode',
                // description: 'Choose whether you wish to disburse funds to the vendors immediately or hold the funds. Holding funds gives you time to conduct additional vetting or enforce other platform-specific business logic.',
                value: 'INSTANT',
                // "options": {
                //     "INSTANT": "Immediate",
                //     "ON_ORDER_COMPLETE": "On Order Complete",
                //     "DELAYED": "Delayed"
                // }
            },
            {
                id: 'razorpay_disbursement_delay_period',
                // label: 'Disbursement Delay Period',
                // description: 'Specify after how many days funds will be disbursed to the corresponding vendor. No Maximum holding days. After given days, fund will be disbursed to corresponding vendor.',
                value: '7',
            },
            {
                id: 'seller_pays_the_processing_fee',
                // label: 'If unchecked, Admin/Site Owner will pay the Razorpay processing fee instead of Seller.',
                // description: 'By default Seller pays the Razorpay processing fee.',
                value: 'yes',
            },
            {
                id: 'display_notice_on_vendor_dashboard',
                // label: 'If checked, non-connected sellers will see a notice to connect their Razorpay account on their vendor dashboard.',
                // description: 'If this is enabled, non-connected sellers will see a notice to connect their Razorpay account on their vendor dashboard.',
                value: 'no',
            },
            {
                id: 'display_notice_to_non_connected_sellers',
                // label: 'If checked, non-connected sellers will receive announcement notice to connect their Razorpay account. ',
                // description: 'If this is enabled non-connected sellers will receive announcement notice to connect their Razorpay account once in a week by default.',
                value: 'no',
            },
            {
                id: 'display_notice_interval',
                // label: 'Send Announcement Interval',
                // description: 'If Send Announcement to Connect Seller setting is enabled, non-connected sellers will receive announcement notice to connect their Razorpay account once in a week by default. You can control notice display interval from here.',
                value: '7',
            },
        ],
    },

    stripeExpress: {
        id: 'dokan_stripe_express',
        title: 'Credit/Debit Card',
        // description: 'Pay with credit/debit card',
        enabled: false,
        settings: [
            {
                id: 'title',
                // label: title,
                // description: 'This controls the title which the user sees during checkout. This title will be shown only when multiple payment methods are enabled for Stripe Express',
                value: 'Stripe Express',
            },
            {
                id: 'api_details',
                // label: 'API Credentials',
                // description: 'Your API credentials are a publishable key and a secret key, which authenticate API requests from your account. You can collect these credentials from a REST API app in the Developer Dashboard. Visit <a href="https://dashboard.stripe.com/apikeys" target="_blank">this link</a> for more information about getting your api details.<br><span style="font-style: italic">Note: Even if you enable test mode, please provide your live API keys as well. For some extra configurations for payment methods like Apple Pay and payment request buttons, live API keys are required even in test mode.</span>',
                value: '',
            },
            {
                id: 'testmode',
                // label: 'Enable Stripe Test Mode',
                // description: 'Stripe test mode can be used to test payments.',
                value: 'yes',
            },
            {
                id: 'publishable_key',
                // label: 'Publishable Key',
                // description: 'Publishable key for Stripe',
                value: '',
            },
            {
                id: 'secret_key',
                // label: 'Secret Key',
                // description: 'Secret key for Stripe',
                value: '',
            },
            {
                id: 'test_publishable_key',
                // label: 'Test Publishable Key',
                // description: 'Test Publishable key for Stripe',
                value: process.env.TEST_PUBLISH_KEY_STRIPE_EXPRESS,
            },
            {
                id: 'test_secret_key',
                // label: 'Test Secret Key',
                // description: 'Test Secret key for Stripe',
                value: process.env.TEST_SECRET_KEY_STRIPE_EXPRESS,
            },
            {
                id: 'webhook',
                // label: 'Webhook Endpoints',
                // description: 'You must add the following webhook endpoint <strong style="background-color:#ddd">&nbsp;https://dokan1.test/wc-api/dokan-stripe-express&nbsp;</strong> to your <a href="https://dashboard.stripe.com/account/webhooks" target="_blank">Stripe account settings</a> (if there isn\'t one already enabled). This will enable you to receive notifications on the charge statuses. The webhook endpoint will be attempted to be configured automatically on saving these admin settings. If it is not configured automatically, please register it manually.<br><br><code>Warning: The most recent test webhook, received at 1970-01-01 06:00:00 +06:00, could not be processed. Reason: No error. (No test webhooks have been processed successfully since monitoring began at 2023-07-22 19:01:23 +06:00.)</code>',
                value: '',
            },
            {
                id: 'webhook_key',
                // label: 'Webhook Secret',
                // description: 'Get your webhook signing secret from the webhooks section in your stripe account.',
                value: '',
            },
            {
                id: 'test_webhook_key',
                // label: 'Test Webhook Secret',
                // description: 'Get your webhook signing secret from the webhooks section in your stripe account.',
                value: '',
            },
            {
                id: 'payment_options',
                // label: 'Payment and Disbursement',
                // description: 'Manage the payment and fund disbursements.',
                value: '',
            },
            {
                id: 'enabled_payment_methods',
                // label: 'Choose Payment Methods',
                // description: 'Selected payment methods will be appeared on checkout if requiorements are fulfilled.',
                value: ['card'],
                // "options": {
                //     "card": "Credit/Debit Card",
                //     "ideal": "iDEAL"
                // }
            },
            {
                id: 'sellers_pay_processing_fee',
                // label: 'If activated, Sellers will pay the Stripe processing fee instead of Admin/Site Owner.',
                // description: 'By default Admin/Site Owner pays the Stripe processing fee.',
                value: 'yes',
            },
            {
                id: 'saved_cards',
                // label: 'Enable payment via saved cards',
                // description: 'If enabled, customers will be able to save cards during checkout. Card data will be saved on Stripe server, not on the store.',
                value: 'yes',
            },
            {
                id: 'capture',
                // label: 'Issue an authorization on checkout, and capture later',
                // description: 'Only cards support manual capture. When enabled, all other payment methods will be hidden from checkout. Charge must be captured on the order details screen within 7 days of authorization, otherwise the authorization and order will be canceled.',
                value: 'no',
            },
            {
                id: 'disburse_mode',
                // label: 'Choose when you want to disburse funds to the vendors',
                // description: 'You can choose when whether you want to transfer funds to vendors after the order is completed, or immediately after the payment is completed, or delay the transfer even if the order is processing or completed.',
                value: 'ON_ORDER_PROCESSING',
                // "options": {
                //     "ON_ORDER_PROCESSING": "On payment completed",
                //     "ON_ORDER_COMPLETED": "On order completed",
                //     "DELAYED": "Delayed"
                // }
            },
            {
                id: 'disbursement_delay_period',
                // label: 'Delay Period (Days)',
                // description: 'Specify after how many days funds will be disburse to corresponding vendor. The funcds will be transferred to vendors after this period automatically',
                value: '14',
            },
            {
                id: 'statement_descriptor',
                // label: 'Customer Bank Statement',
                // description: 'Enter the name your customers will see on their transactions. Use a recognizable name – e.g. the legal entity name or website address–to avoid potential disputes and chargebacks.',
                value: '',
            },
            {
                id: 'appearance',
                // label: 'Payment Element Appearance',
                // description: 'Customize theme and appearance of Payment Element',
                value: '',
            },
            {
                id: 'element_theme',
                // label: 'Theme',
                // description: 'Select the theme you would like to choose for Stripe element.',
                value: 'stripe',
                // "options": {
                //     "stripe": "Light",
                //     "flat": "Flat",
                //     "night": "Dark",
                //     "dark_blue": "Dark Blue",
                //     "none": "None"
                // }
            },
            {
                id: 'payment_request_options',
                // label: 'Payment Request Options (Apple Pay / Google Pay)',
                // description: 'Enable payment via Apple Pay and Google Pay. <br />By using Apple Pay, you agree to <a href="https://stripe.com/apple-pay/legal" target="_blank">Stripe</a> and <a href="https://developer.apple.com/apple-pay/acceptable-use-guidelines-for-websites/" target="_blank">Apple</a>\'s terms of service. (Apple Pay domain verification is performed automatically in live mode; configuration can be found on the <a href="https://dashboard.stripe.com/settings/payments/apple_pay" target="_blank">Stripe dashboard</a>.)',
                value: '',
            },
            {
                id: 'payment_request',
                // label: 'Enable Payment Request Buttons. (Apple Pay/Google Pay)',
                // description: 'If enabled, users will be able to pay using Apple Pay or Chrome Payment Request if supported by the browser. Depending on the web browser and wallet configurations, your customers will see either Apple Pay or Google Pay, but not both.',
                value: 'yes',
            },
            {
                id: 'payment_request_button_type',
                // label: 'Button Type',
                // description: 'Select the button type you would like to show.',
                value: 'default',
                // "options": {
                //     "default": "Only Icon",
                //     "buy": "Buy",
                //     "donate": "Donate",
                //     "book": "Book"
                // }
            },
            {
                id: 'payment_request_button_theme',
                // label: 'Button Theme',
                // description: 'Select the button theme you would like to show.',
                value: 'dark',
                // "options": {
                //     "dark": "Dark",
                //     "light": "Light",
                //     "light-outline": "Light-Outline"
                // }
            },
            {
                id: 'payment_request_button_locations',
                // label: 'Button Locations',
                // description: 'Select where you would like Payment Request Buttons to be displayed',
                value: ['product', 'cart'],
                // "options": {
                //     "product": "Product",
                //     "cart": "Cart"
                // }
            },
            {
                id: 'payment_request_button_size',
                // label: 'Button Size',
                // description: 'Select the size of the button.',
                value: 'default',
                // "options": {
                //     "default": "Default (40px)",
                //     "medium": "Medium (48px)",
                //     "large": "Large (56px)"
                // }
            },
            {
                id: 'cross_border_transfer_options',
                // label: 'Cross-border Transfers and Onboarding',
                // description: 'Transfer options outside the marketplace\'s country under European Union or SEPA.',
                value: '',
            },
            {
                id: 'cross_border_transfer',
                // label: 'Enable onboarding for vendors outside the country/region of the marketplace inside EU and SEPA.',
                // description: 'If enabled and if the marketplace is inside European Union or SEPA, vendors will be able to choose their country among the transfer supported countries during signing up. The available countries will be determined by Stripe based on the country of the marketplace.',
                value: 'yes',
            },
            {
                id: 'restricted_countries',
                // label: 'Restrict Countries/Regions',
                // description: 'Select countries from where vendors will not be able to onboard.',
                value: '',
            },
            {
                id: 'advanced',
                // label: 'Advanced Settings',
                // description: 'Set up advanced settings to manage some extra options.',
                value: '',
            },
            {
                id: 'notice_on_vendor_dashboard',
                // label: 'If checked, non-connected sellers will see a notice to sign up for a Stripe Express account on their vendor dashboard.',
                // description: 'If this is enabled, non-connected sellers will see a notice to sign up for a Stripe Express account on their vendor dashboard.',
                value: 'yes',
            },
            {
                id: 'announcement_to_sellers',
                // label: 'If checked, non-connected sellers will receive announcement notice to sign up for a Stripe Express account. ',
                // description: 'If this is enabled non-connected sellers will receive announcement notice to sign up for a Stripe Express account.',
                value: 'yes',
            },
            {
                id: 'notice_interval',
                // label: 'Announcement Interval',
                // description: 'If Send Announcement to Connect Seller setting is enabled, non-connected sellers will receive announcement notice to sign up for a Stripe Express account once in a week by default. You can control notice display interval from here. The interval value will be considered in days.',
                value: '7',
            },
            {
                id: 'debug',
                // label: 'Enable logging',
                // description: 'Log gateway events such as Webhook requests, Payment oprations etc. inside <code>/Users/rk/Sites/dokan1/wp-content/uploads/wc-logs/dokan-2023-09-03-1a1ff23f40df3a5c66b67fcd8d3942ef.log</code>. Note: this may log personal information. We recommend using this for debugging purposes only and deleting the logs when finished.',
                value: 'yes',
            },
        ],
    },

    // customer

    createCustomer: () => ({
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        role: 'customer',
        username: faker.person.firstName() + faker.string.nanoid(10),
        password: String(process.env.USER_PASSWORD),
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
    }),

    updateCustomer: () => ({
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        role: 'customer',
        password: String(process.env.USER_PASSWORD),
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
    }),

    updateBatchCustomersTemplate: () => ({
        id: '',
        billing: {
            phone: '0123456789',
        },
    }),

    // wholesale customer

    updateWholesaleCustomer: {
        status: 'activate', // activate, deactivate, delete
    },

    deleteWholesaleCustomer: {
        status: 'delete',
    },

    // create vendor staff

    staff: {
        username: 'staff1',
        first_name: 'staff1',
        last_name: 's1',
        email: 'staff1@email.c',
        phone: '0123456789',
        password: String(process.env.USER_PASSWORD),
    },

    createStaff: () => ({
        username: faker.person.firstName('male') + faker.string.nanoid(10),
        first_name: faker.person.firstName('male'),
        last_name: faker.person.lastName('male'),
        phone: '0123456789',
        email: faker.person.firstName('male') + '@email.com',
        password: String(process.env.USER_PASSWORD),
    }),

    updateStaff: () => ({
        // username: faker.person.firstName('male') + faker.string.nanoid(10),
        first_name: faker.person.firstName('male'),
        last_name: faker.person.lastName('male'),
        phone: '0123456789',
        email: faker.person.firstName('male') + '@email.com',
        // password: String(process.env.USER_PASSWORD), // todo: fatal error exists dokan issue, for updating password
    }),

    updateCapabilities: {
        capabilities: [
            {
                capability: 'dokan_view_sales_overview',
                access: false,
            },
            {
                capability: 'dokan_view_sales_report_chart',
                access: false,
            },
            {
                capability: 'dokan_view_announcement',
                access: false,
            },
            {
                capability: 'dokan_view_order_report',
                access: false,
            },
            {
                capability: 'dokan_view_product_status_report',
                access: false,
            },
            {
                capability: 'dokan_add_product',
                access: false,
            },
        ],
    },

    // support ticket
    createSupportTicket: {
        author: 2,
        title: 'test support ticket',
        content: 'test support ticket message',
        status: 'open',
        comment_status: 'open',
        meta: {
            store_id: 8,
            // order_id: ''
        },
    },

    createSupportTicketComment: {
        replay: 'sp replay...1',
        vendor_id: '1',
        selected_user: 'admin',
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

    moduleIds: {
        booking: 'booking',
        colorSchemeCustomize: 'color_scheme_customizer',
        deliveryTime: 'delivery_time',
        elementor: 'elementor',
        exportImport: 'export_import',
        followStore: 'follow_store',
        geolocation: 'geolocation',
        germanized: 'germanized',
        liveChat: 'live_chat',
        liveSearch: 'live_search',
        moip: 'moip',
        paypalMarketplace: 'paypal_marketplace',
        productAddon: 'product_addon',
        productEnquiry: 'product_enquiry',
        reportAbuse: 'report_abuse',
        rma: 'rma',
        sellerVacation: 'seller_vacation',
        shipstation: 'shipstation',
        auction: 'auction',
        spmv: 'spmv',
        storeReviews: 'store_reviews',
        storeSupport: 'store_support',
        stripe: 'stripe',
        productAdvertising: 'product_advertising',
        productSubscription: 'product_subscription',
        vendorAnalytics: 'vendor_analytics',
        vendorStaff: 'vendor_staff',
        vsp: 'vsp',
        vendorVerification: 'vendor_verification',
        wholesale: 'wholesale',
        rankMath: 'rank_math',
        tableRateShipping: 'table_rate_shipping',
        mangopay: 'mangopay',
        orderMinMax: 'order_min_max',
        sellerBadge: 'seller_badge',
        stripeExpress: 'stripe_express',
        requestForQuotation: 'request_for_quotation',
    },

    deactivateModule: {
        module: ['booking'],
    },

    activateModule: {
        module: ['booking'],
    },

    // announcement

    createAnnouncement: () => ({
        // title: 'test announcement title',
        title: 'test announcement_' + faker.string.nanoid(10),
        content: '<p>This is announcement content</p>',
        status: 'publish',
        sender_type: 'all_seller',
    }),

    updateAnnouncement: {
        title: 'updated test announcement title',
        content: '<p>updated This is announcement content</p>',
        status: 'publish',
        sender_type: 'all_seller',
    },

    updateAnnouncementNotice: {
        read_status: 'read', // read, unread
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

    createStoreCategory: () => ({ name: 'Test_Store_Category' + faker.string.nanoid(10) }),
    updateStoreCategory: () => ({ name: 'Update_Test_Store_Category' + faker.string.nanoid(10) }),

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
            password: String(process.env.USER_PASSWORD),
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

    createStore: () => ({
        user_login: faker.person.firstName() + faker.string.nanoid(10),
        user_pass: String(process.env.USER_PASSWORD),
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
    }),

    updateStore: () => ({
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
        categories: [{}],
        admin_commission: '',
        admin_additional_fee: '0.00',
        admin_commission_type: 'flat',
    }),

    // always revert vendor settings to this after altering in tests
    defaultStoreSettings: {
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
        show_email: 'yes',
        address: {
            street_1: 'abc street',
            street_2: 'xyz street',
            city: 'New York',
            zip: '10003',
            state: 'NY',
            country: 'US',
        },
        location: '40.7127753,-74.0059728',
        banner: 0,
        banner_id: 0,
        gravatar: 0,
        gravatar_id: 0,
        show_more_product_tab: true,
        enable_tnc: 'on',
        store_tnc: 'test Vendor terms and conditions',
        featured: 'yes',
        // rating: {
        //     rating: '4.00', // todo:  doesn't work on lite [might not implemented on lite]
        //     count: 1,
        // },
        enabled: true,
        payment: {
            paypal: {
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
        },
        trusted: true,
        company_name: 'company name',
        vat_number: '123456789',
        company_id_number: '123456789',
        bank_name: 'bank name',
        bank_iban: 'bank iban',
        categories: [{}],
        admin_commission: '',
        admin_additional_fee: '0.00',
        admin_commission_type: 'flat',
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
        last_name: 'v',
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
        show_email: 'yes',
        address: {
            street_1: 'abc street',
            street_2: 'xyz street',
            city: 'New York',
            zip: '10003',
            state: 'NY',
            country: 'US',
        },
        location: '40.7127753,-74.0059728',
        banner: 0,
        banner_id: 0,
        gravatar: 0,
        gravatar_id: 0,
        show_more_product_tab: true,
        enable_tnc: 'on',
        store_tnc: 'test Vendor terms and conditions',
        featured: 'yes',
        // rating: {
        //     rating: '4.00', // todo:  doesn't work on lite [might not implemented on lite]
        //     count: 1,
        // },
        enabled: true,
        payment: {
            paypal: {
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
        },
        trusted: true,
        // store_open_close: {
        // 	enabled: false,
        // 	time: [],
        // 	open_notice: 'Store is open',
        // 	close_notice: 'Store is closed',
        // },
        // store_open_close: {
        //     // todo:  isn't implemented on dokan create store api
        //     enabled: 'yes', // todo:
        //     time: {
        //         monday: {
        //             status: 'open', // 'close'
        //             opening_time: ['12:00 am'], // []
        //             closing_time: ['11:30 pm'], // []
        //         },
        //         tuesday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:30 pm'],
        //         },
        //         wednesday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:30 pm'],
        //         },
        //         thursday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:30 pm'],
        //         },
        //         friday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:30 pm'],
        //         },
        //         saturday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:30 pm'],
        //         },
        //         sunday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:30 pm'],
        //         },
        //     },
        //     open_notice: 'Store is open',
        //     close_notice: 'Store is closed',
        // },
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

    createStore2: {
        user_login: process.env.VENDOR2,
        user_pass: process.env.USER_PASSWORD,
        user_nicename: process.env.VENDOR2 + 'store',
        role: 'seller',
        email: process.env.VENDOR2 + '@yopmail.com',
        store_name: process.env.VENDOR2 + 'store',
        first_name: process.env.VENDOR2,
        last_name: 'v',
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
        show_email: true, // todo:  doesn't work on lite
        address: {
            street_1: 'abc street',
            street_2: 'xyz street',
            city: 'New York',
            zip: '10003',
            state: 'NY',
            country: 'US',
        },
        location: '40.7127753,-74.0059728',
        banner: 0,
        banner_id: 0,
        gravatar: 0,
        gravatar_id: 0,
        show_more_product_tab: true,
        toc_enabled: true, // todo:  doesn't work on lite
        store_toc: 'test Vendor terms and conditions',
        featured: true,
        rating: {
            rating: '4.00', // todo:  doesn't work on lite
            count: 1,
        },
        enabled: true,
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
        // store_open_close: {
        // 	enabled: false,
        // 	time: [],
        // 	open_notice: 'Store is open',
        // 	close_notice: 'Store is closed',
        // },
        store_open_close: {
            // todo:  doesn't work on lite
            enabled: true,
            time: {
                monday: {
                    status: 'open', // 'close'
                    opening_time: ['12:00 am'], // []
                    closing_time: ['11:30 pm'], // []
                },
                tuesday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
                wednesday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
                thursday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
                friday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
                saturday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
                sunday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
            },
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

    createStore3: {
        user_login: process.env.VENDOR3,
        user_pass: process.env.USER_PASSWORD,
        user_nicename: process.env.VENDOR3 + 'store',
        role: 'seller',
        email: process.env.VENDOR3 + '@yopmail.com',
        store_name: process.env.VENDOR3 + 'store',
        first_name: process.env.VENDOR3,
        last_name: 'v',
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
        show_email: true, // todo:  doesn't work on lite
        address: {
            street_1: 'abc street',
            street_2: 'xyz street',
            city: 'New York',
            zip: '10003',
            state: 'NY',
            country: 'US',
        },
        location: '40.7127753,-74.0059728',
        banner: 0,
        banner_id: 0,
        gravatar: 0,
        gravatar_id: 0,
        show_more_product_tab: true,
        toc_enabled: true, // todo:  doesn't work on lite
        store_toc: 'test Vendor terms and conditions',
        featured: true,
        rating: {
            rating: '4.00', // todo:  doesn't work on lite
            count: 1,
        },
        enabled: true,
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
        // store_open_close: {
        // 	enabled: false,
        // 	time: [],
        // 	open_notice: 'Store is open',
        // 	close_notice: 'Store is closed',
        // },
        store_open_close: {
            // todo:  doesn't work on lite
            enabled: true,
            time: {
                monday: {
                    status: 'open', // 'close'
                    opening_time: ['12:00 am'], // []
                    closing_time: ['11:30 pm'], // []
                },
                tuesday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
                wednesday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
                thursday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
                friday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
                saturday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
                sunday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:30 pm'],
                },
            },
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
            last_name: 'c1',
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
    },

    updateAddress: {
        billing: {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            company: '',
            address_1: 'abc street',
            address_2: 'xyz street',
            city: 'New York',
            postcode: '10003',
            country: 'US',
            state: 'NY',
            email: faker.person.firstName() + '@yopmail.com',
            phone: '0123456789',
        },
        shipping: {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
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

    // update password
    updatePassword: {
        password: String(process.env.USER_PASSWORD),
    },

    // quote rule

    createQuoteRule: () => ({
        rule_name: 'QR_' + faker.string.nanoid(10),
        selected_user_role: ['customer', 'guest'],
        category_ids: [],
        product_ids: [],
        hide_price: '1',
        hide_price_text: 'Price is hidden',
        hide_cart_button: 'replace',
        button_text: 'Add to quote',
        apply_on_all_product: '1',
        rule_priority: '0',
        status: 'publish',
    }),

    updateQuoteRule: {
        rule_name: 'updated_QR_' + faker.string.nanoid(10),
        selected_user_role: ['customer'],
        hide_price: '0',
        hide_price_text: 'Price is covered',
        hide_cart_button: 'keep_and_add_new',
        button_text: ' To quote',
        apply_on_all_product: '1',
    },

    // quote request

    createQuoteRequest: () => ({
        quote_title: 'QT_' + faker.string.nanoid(10),
        // user_id: '',
        customer_info: {
            name_field: 'customer1',
            email_field: 'customer1@yopmail.com',
            company_field: 'c1',
            phone_field: '0987654321',
        },
        product_ids: [''],
        offer_price: ['50'],
        offer_product_quantity: ['10'],
        status: 'pending',
    }),

    updateRequestQuote: {
        quote_title: 'updated_QT_' + faker.string.nanoid(10),
        // user_id: '',
        customer_info: {
            name_field: 'customer1',
            email_field: 'customer1@yopmail.com',
            company_field: 'c1',
            phone_field: '0987654321',
        },
        product_ids: [''],
        offer_price: ['30'],
        offer_product_quantity: ['20'],
    },

    convertToOrder: {
        quote_id: '',
        status: 'converted',
    },

    // settings
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

    setDefaultAttribute: {},

    filterParams: {
        product_type: 'simple',
    },

    // seller badge

    createSellerBadgeFeatureProducts: {
        event_type: 'featured_products',
        badge_name: 'Featured Products',
        badge_status: 'published',
        levels: [
            {
                level: 0,
                level_condition: '',
                level_data: '',
            },
        ],
    },

    createSellerBadgeExclusiveToPlatform: {
        event_type: 'exclusive_to_platform',
        badge_name: 'Exclusive to Platform',
        badge_status: 'published',
        levels: [
            {
                level: 0,
                level_condition: '',
                level_data: '',
            },
        ],
    },

    createSellerBadgeProductsPublished: {
        event_type: 'product_published',
        badge_name: 'Products Published',
        badge_status: 'published',
        levels: [
            {
                level_condition: '<',
                level_data: '10',
            },
            {
                level_condition: '<',
                level_data: '20',
            },
            {
                level_condition: '<',
                level_data: '30',
            },
        ],
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
                level_data: '',
            },
        ],
    },

    // product questions answeres

    createProductQuestion: () => ({
        question: 'test question_' + faker.string.nanoid(10),
        product_id: '',
    }),

    updateProductQuestion: () => ({
        question: 'test question updated_' + faker.string.nanoid(10),
        status: 'hidden',
    }),

    createProductQuestionAnswer: () => ({
        answer: '<p>test answer_' + faker.string.nanoid(10) + '</p>',
        question_id: '',
    }),

    updateProductQuestionAnswer: () => ({
        answer: 'test anser updated_' + faker.string.nanoid(10),
    }),

    // reverse withdrawal

    amountToPay: {
        amount: '10',
    },

    // spmv

    spmvSearch: {
        search: '',
    },

    spmvAddToStore: {
        product_id: '',
    },

    paramsReverseWithdrawalTransactions: {
        'trn_date[from]': `${helpers.currentYear}-01-01 00:00:00`,
        'trn_date[to]': `${helpers.currentYear}-12-31 00:00:00`,
        vendor_id: '',
    },

    paramsDeleteStore: {
        reassign: 0,
    },

    paramsGetOrdersWithDateRange: {
        before: `${helpers.currentYear}-01-01`,
        after: `${helpers.currentYear}-12-30`,
    },

    paramsDeleteStoreCategory: {
        force: true,
    },

    paramsForceDelete: {
        force: true,
    },

    paramsGetProductsWithPagination: {
        per_page: '10',
        page: '1',
    },
};
