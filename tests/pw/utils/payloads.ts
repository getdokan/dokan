import { faker } from '@faker-js/faker';
import { helpers } from '@utils/helpers';
import { dbData } from '@utils/dbData';

const basicAuth = (username: string, password: string) => 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

const { ADMIN, VENDOR, VENDOR2, CUSTOMER, CUSTOMER2, ADMIN_PASSWORD, USER_PASSWORD, CUSTOMER_ID, VENDOR_ID, VENDOR2_ID, PRODUCT_ID, PRODUCT_ID_V2, TAG_ID, ATTRIBUTE_ID } = process.env;

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
        title: `test-page_${faker.string.nanoid(10)}`,
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

    // headers
    authHeader: (username: string, password: string = USER_PASSWORD) => {
        return { extraHTTPHeaders: { Authorization: basicAuth(username, password) } };
    },

    // user auth

    userAuth: (username: string, password: string = USER_PASSWORD) => {
        return { Authorization: basicAuth(username, password) };
    },

    adminAuth: { Authorization: basicAuth(ADMIN, ADMIN_PASSWORD) },
    vendorAuth: { Authorization: basicAuth(VENDOR, USER_PASSWORD) },
    vendor2Auth: { Authorization: basicAuth(VENDOR2, USER_PASSWORD) },
    customerAuth: { Authorization: basicAuth(CUSTOMER, USER_PASSWORD) },

    admin: {
        username: ADMIN,
        password: ADMIN_PASSWORD,
    },

    vendor: {
        username: VENDOR,
        password: USER_PASSWORD,
    },

    customer: {
        username: CUSTOMER,
        password: USER_PASSWORD,
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

    // product meta data

    // catalog mode
    catalogMode: {
        meta_data: [
            {
                key: '_dokan_catalog_mode',
                value: {
                    hide_add_to_cart_button: 'on',
                    hide_product_price: 'on',
                },
            },
        ],
    },

    // product

    createProductRequiredFields: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple)`,
        type: 'simple',
        status: 'publish',
        categories: [{}],
        description: '<p>test description</p>',
    }),

    createProductAllFields: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple)`,
        type: 'simple', // simple, variable, grouped, external
        featured: true,
        virtual: false,
        regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
        // discount
        sale_price: faker.finance.amount({ min: 50, max: 100, dec: faker.helpers.arrayElement([0, 2]) }),
        date_on_sale_from: helpers.currentDateTime,
        date_on_sale_to: helpers.addDays(helpers.currentDateTime, 10),
        // categories
        categories: [
            {},
            // {
            //     id: CATEGORY_ID,
            // },
        ],
        // tags
        tags: [{ id: TAG_ID }],
        attributes: [
            {
                id: ATTRIBUTE_ID,
                name: 'sizes',
                position: 0,
                visible: true,
                variation: true,
                options: ['s', 'l', 'm'],
            },
        ],
        // images
        // images: [
        //     // cover
        //     {
        //         // id: 78,
        //         name: 'coverImage',
        //         alt: 'coverImage',
        //         src: '',
        //     },
        //     // gallery
        //     {
        //         // id: 78,
        //         name: 'galleryImage',
        //         alt: 'galleryImage',
        //         src: '',
        //     },
        // ],

        short_description: '<p>test short product description.</p>',
        description: '<p>test product description</p>',
        // downloadable
        downloadable: true,
        // downloads: [
        //     {
        //         name: 'File 1',
        //         file: '',
        //     },
        // ],
        download_limit: 50,
        download_expiry: 100,
        // inventory
        sku: faker.string.nanoid(10),
        stock_status: 'instock', // instock, outofstock, onbackorder
        manage_stock: true,
        stock_quantity: 50,
        low_stock_amount: 5,
        backorders: 'yes', // no, notify, yes
        sold_individually: true,
        // shipping
        weight: '15',
        dimensions: {
            length: '25',
            width: '35',
            height: '45',
        },
        shipping_taxable: true,
        shipping_class: 'heavy',
        //tax
        tax_status: 'taxable', // taxable, shipping, none
        tax_class: 'reduced-rate', // standard, reduced-rate, zero-rate
        // linked products
        upsell_ids: [PRODUCT_ID],
        cross_sell_ids: [PRODUCT_ID],
        grouped_products: [PRODUCT_ID, PRODUCT_ID_V2],
        // other options
        status: 'publish', // publish, draft, pending, private
        catalog_visibility: 'visible', // visible, catalog, search, hidden
        purchase_note: 'test purchase note',
        reviews_allowed: true,
        meta_data: [
            {
                key: '_dokan_geolocation_use_store_settings',
                value: 'no',
            },
            {
                key: 'dokan_geo_latitude',
                value: '23.8041',
            },
            {
                key: 'dokan_geo_longitude',
                value: '90.4152',
            },
            {
                key: 'dokan_geo_public',
                value: '1',
            },
            {
                key: 'dokan_geo_address',
                value: 'Dhaka, Bangladesh',
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
            {
                key: '_product_addons',
                value: [
                    {
                        name: `Add-on Title_${faker.string.nanoid(5)}`,
                        title_format: 'label',
                        description_enable: 1,
                        description: 'Add-on description',
                        type: 'multiple_choice',
                        display: 'select',
                        position: 0,
                        required: 1,
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
                                price: '30',
                                image: '',
                                price_type: 'flat_fee',
                            },
                        ],
                        wc_booking_person_qty_multiplier: 0,
                        wc_booking_block_qty_multiplier: 0,
                    },
                ],
            },
            {
                key: '_product_addons_exclude_global',
                value: '1',
            },
            {
                key: '_dokan_wholesale_meta',
                value: {
                    enable_wholesale: 'yes',
                    price: '80',
                    quantity: '100',
                },
            },
            {
                key: '_dokan_min_max_meta',
                value: {
                    min_quantity: '5',
                    max_quantity: '100',
                },
            },
            {
                key: '_dokan_catalog_mode',
                value: {
                    hide_add_to_cart_button: 'on',
                    hide_product_price: 'on',
                },
            },

            // bulk discount
            {
                key: '_is_lot_discount',
                value: 'yes',
            },
            {
                key: '_lot_discount_quantity',
                value: '50',
            },
            {
                key: '_lot_discount_amount',
                value: '5.00',
            },
            // commission
            {
                key: '_per_product_admin_commission_type',
                value: 'flat',
            },
            {
                key: '_per_product_admin_commission',
                value: '',
            },
            {
                key: '_per_product_admin_additional_fee',
                value: '',
            },
            {
                key: '_has_multi_vendor',
                value: '18',
            },
            {
                key: '_disable_shipping',
                value: 'no',
            },
            {
                key: '_overwrite_shipping',
                value: 'no',
            },

            // eu compliance
            {
                key: '_sale_price_label',
                value: 'old-price',
            },
            {
                key: '_sale_price_regular_label',
                value: 'new-price',
            },
            {
                key: '_unit',
                value: 'kg',
            },
            {
                key: '_min_age',
                value: 18,
            },
            {
                key: '_unit_product',
                value: '1',
            },
            {
                key: '_unit_base',
                value: '80',
            },
            {
                key: '_default_delivery_time',
                value: 1,
            },
            {
                key: '_delivery_time_countries',
                value: [],
            },
            {
                key: '_free_shipping',
                value: 'yes',
            },
            {
                key: '_unit_price_regular',
                value: '50',
            },
            {
                key: '_unit_price_sale',
                value: '20',
            },
            {
                key: '_mini_desc',
                value: 'test mini description',
            },
        ],
    }),

    createProduct: () => ({
        // post_author: '',
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple)`,
        type: 'simple',
        regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
        // sale_price: faker.finance.amount({ min: 50, max: 100, dec: faker.helpers.arrayElement([0, 2]) }),
        // date_on_sale_from: helpers.currentDateTime,
        // date_on_sale_to: helpers.addDays(helpers.currentDateTime, 10),
        status: 'publish',
        categories: [{}],
        tags: [{}],
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
            //     key: '_product_addons',
            //     value: [
            //         {
            //             name: 'Test Add-on Title_YwqzyffaKI',
            //             title_format: 'label',
            //             description_enable: 1,
            //             description: 'Add-on description',
            //             type: 'multiple_choice',
            //             display: 'select',
            //             position: 0,
            //             required: 1,
            //             restrictions: 0,
            //             restrictions_type: 'any_text',
            //             adjust_price: 0,
            //             price_type: 'flat_fee',
            //             price: '',
            //             min: 0,
            //             max: 0,
            //             options: [
            //                 {
            //                     label: 'Option 1',
            //                     price: '30',
            //                     image: '',
            //                     price_type: 'flat_fee',
            //                 },
            //             ],
            //             wc_booking_person_qty_multiplier: 0,
            //             wc_booking_block_qty_multiplier: 0,
            //         },
            //     ],
            // },
            // {
            //     key: '_dokan_min_max_meta',
            //     value: {
            //         min_quantity: 5,
            //         max_quantity: 10,
            //     },
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

    createDiscountProduct: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple)`,
        type: 'simple',
        regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
        sale_price: faker.finance.amount({ min: 50, max: 100, dec: faker.helpers.arrayElement([0, 2]) }),
        date_on_sale_from: helpers.currentDateTime,
        date_on_sale_to: helpers.addDays(helpers.currentDateTime, 10),
        status: 'publish',
        categories: [{}],
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
            // key: '_dokan_min_max_meta',
            // value: {
            //     min_quantity: 4,
            //     max_quantity: 5,
            // },
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
            // {
            //     key: '_per_product_admin_commission_type',
            //     value: 'fixed',
            // },
            // {
            //     key: '_per_product_admin_commission',
            //     value: '50',
            // },
            // {
            //     key: '_per_product_admin_additional_fee',
            //     value: '5',
            // },
        ],
    }),

    createProductInteger: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple)`,
        type: 'simple',
        regular_price: faker.finance.amount({ min: 100, max: 200, dec: 0 }),
        // regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),

        status: 'publish',
        categories: [{}],
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
            // key: '_dokan_min_max_meta',
            // value: {
            //     min_quantity: 4,
            //     max_quantity: 5,
            // },
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

    createProductEuCompliance: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple)`,
        type: 'simple',
        regular_price: '100',
        status: 'publish',
        categories: [{}],
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
            {
                key: '_sale_price_label',
                value: 'old-price',
            },
            {
                key: '_sale_price_regular_label',
                value: 'new-price',
            },
            {
                key: '_unit',
                value: 'kg',
            },
            {
                key: '_min_age',
                value: 18,
            },
            {
                key: '_unit_product',
                value: '1',
            },
            {
                key: '_unit_base',
                value: '80',
            },
            {
                key: '_default_delivery_time',
                value: 1,
            },
            {
                key: '_delivery_time_countries',
                value: [],
            },
            {
                key: '_free_shipping',
                value: 'yes',
            },
            {
                key: '_unit_price_regular',
                value: '50',
            },
            {
                key: '_unit_price_sale',
                value: '20',
            },
            {
                key: '_mini_desc',
                value: 'test mini description',
            },
        ],
    }),

    // wholesale product
    createWholesaleProduct: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (wholesale)`,
        type: 'simple',
        regular_price: faker.finance.amount({ min: 100, max: 110, dec: faker.helpers.arrayElement([0, 2]) }),
        // regular_price: '100',
        status: 'publish',
        categories: [{}],
        featured: true,
        description: '<p>test description</p>',
        short_description: '<p>test short description</p>',
        meta_data: [
            {
                key: '_dokan_wholesale_meta',
                value: {
                    enable_wholesale: 'yes',
                    price: faker.finance.amount({ min: 90, max: 99, dec: faker.helpers.arrayElement([0, 2]) }),
                    quantity: '10',
                },
            },
        ],
    }),

    createVariableProduct: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Variable)`,
        type: 'variable',
        regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
        status: 'publish',
        categories: [{}],
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

    createProductVariation: () => ({
        regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
        categories: [
            {
                //  id: 48
            },
        ],
        attributes: [
            {
                // id: 18,
                option: 'l',
            },
        ],
    }),

    batchProductVariation: {
        id: '',
        regular_price: '99.00',
    },

    createDownloadableProduct: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Downloadable)`,
        type: 'simple',
        downloadable: true,
        regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
        downloads: [],
        download_limit: 100,
        download_expiry: 365,
        categories: [{}],
    }),

    createSimpleSubscriptionProduct: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Subscription)`,
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

    createBookableProductRequiredFields: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Bookable)`,
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
        requires_confirmation: false,
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

    createBookableProduct: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Bookable)`,
        status: 'publish',
        featured: true,
        description: '<p>test description</p>',
        short_description: '<p>test short description</p>',
        // categories
        categories: [
            {},
            // {
            //     id: CATEGORY_ID,
            // },
        ],
        // tags
        tags: [{ id: TAG_ID }],
        // attributes
        attributes: [
            {
                id: ATTRIBUTE_ID,
                name: 'sizes',
                position: 0,
                visible: true,
                variation: true,
                options: ['s', 'l', 'm'],
            },
        ],
        duration_type: 'customer',
        duration_unit: 'day',
        duration: 1,
        min_duration: 1,
        max_duration: 10,
        calendar_display_mode: 'always_visible',
        enable_range_picker: true,
        requires_confirmation: false,
        can_be_cancelled: false,
        default_date_availability: 'available',
        block_cost: 5,
        cost: 10,
        display_cost: '15',
        has_persons: false,
        has_resources: false,
        qty: 100,
        // min_date_value           : 10,
        // min_date_unit            : 'day',
        // max_date_value           : 11,
        // max_date_unit            : 'month'
    }),

    createBookableProductWithAccommodation: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Bookable)`,
        status: 'publish',
        featured: true,
        description: '<p>test description</p>',
        short_description: '<p>test short description</p>',
        // categories
        categories: [
            {},
            // {
            //     id: CATEGORY_ID,
            // },
        ],
        // tags
        tags: [{ id: TAG_ID }],
        // attributes
        attributes: [
            {
                id: ATTRIBUTE_ID,
                name: 'sizes',
                position: 0,
                visible: true,
                variation: true,
                options: ['s', 'l', 'm'],
            },
        ],
        duration_type: 'customer',
        duration_unit: 'day',
        duration: 1,
        min_duration: 1,
        max_duration: 10,
        // min_duration: 88,
        // max_duration: 89,
        calendar_display_mode: 'always_visible',
        enable_range_picker: true,
        requires_confirmation: false,
        can_be_cancelled: false,
        default_date_availability: 'available',
        block_cost: 5,
        cost: 10,
        display_cost: '15',
        has_persons: false,
        has_resources: false,
        qty: 100,
        // min_date_value           : 10,
        // min_date_unit            : 'day',
        // max_date_value           : 11,
        // max_date_unit            : 'month'
        meta_data: [
            {
                key: '_dokan_is_accommodation_booking',
                value: 'yes',
            },
            {
                key: '_dokan_accommodation_checkin_time',
                value: '12:00 am',
            },
            {
                key: '_dokan_accommodation_checkout_time',
                value: '12:00 am',
            },
        ],
    }),

    createBookingResource: () => ({
        name: `resource_${faker.string.nanoid(10)}`,
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
        title: `resource_${faker.string.nanoid(10)}`,
        status: 'publish',
        comment_status: 'closed',
        ping_status: 'closed',
    }),

    createAuctionProduct: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Auction)`,
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
        // categories
        categories: [
            {},
            // {
            //     id: CATEGORY_ID,
            // },
        ],
        // tags
        tags: [{ id: TAG_ID }],
        // attributes
        attributes: [
            {
                id: ATTRIBUTE_ID,
                name: 'sizes',
                position: 0,
                visible: true,
                variation: true,
                options: ['s', 'l', 'm'],
            },
        ],
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
            {
                key: '_auction_proxy',
                value: 'yes',
            },
            // {
            // 	key  : '_auction_sealed',
            // 	value: 'no'
            // },
            {
                key: '_auction_automatic_relist',
                value: 'yes',
            },
            {
                key: '_auction_relist_fail_time',
                value: '4',
            },
            {
                key: '_auction_relist_not_paid_time',
                value: '5',
            },
            {
                key: '_auction_relist_duration',
                value: '6',
            },
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

    createAuctionProductRequiredFields: () => ({
        name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Auction)`,
        type: 'auction',
        status: 'publish',
        // featured: true,
        // description: 'test description',
        // short_description: 'test short description',
        // price: '2000',
        // regular_price: '2000',
        purchasable: true,
        // virtual: false,
        // downloadable: false,
        categories: [{}],
        tags: [{}],
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

    createGlobalProductAddons: () => ({
        name: `Test Addons Group_${faker.string.nanoid(10)}`,
        priority: 10,
        restrict_to_categories: [],
        fields: [
            {
                name: `Test Add-on Title_${faker.string.nanoid(10)}`,
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
                        label: 'option 1',
                        price: '10',
                        image: '',
                        price_type: 'flat_fee',
                    },
                ],
            },
        ],
    }),

    createDokanSubscriptionProduct: () => ({
        name: `dokan_sub_${faker.string.nanoid(5)}`,
        post_author: '1',
        // type: 'product_pack',
        type: 'simple',
        status: 'publish',
        featured: false,
        catalog_visibility: 'hidden',
        description: 'dokan subscription',
        short_description: 'dokan subscription',
        regular_price: '100',
        purchasable: false,
        virtual: true,
        tax_status: 'taxable',
        tax_class: '',
        sold_individually: true,
        shipping_required: false,
        shipping_taxable: false,
        categories: [
            {
                name: 'Uncategorized',
            },
        ],
        meta_data: [
            // number of products
            {
                key: '_no_of_product',
                value: '-1',
            },

            // pack validity
            {
                key: '_pack_validity',
                value: '1000',
            },

            //product advertisement
            {
                key: '_dokan_advertisement_slot_count',
                value: '',
            },
            {
                key: '_dokan_advertisement_validity',
                value: '',
            },

            // Allowed product types
            {
                key: 'dokan_subscription_allowed_product_types',
                value: [], // 'simple', 'variable'
            },

            // Allowed product categories
            {
                key: '_vendor_allowed_categories',
                value: [], // category ids
            },

            // Restrict gallery image upload
            {
                key: '_enable_gallery_restriction',
                value: 'no',
            },
            // if above is yes then below will be used
            // {
            //     key: '_gallery_image_restriction_count',
            //     value: '-1',
            // },

            // recurring subscription

            {
                key: '_enable_recurring_payment',
                value: 'no',
            },
            {
                key: '_dokan_subscription_period_interval',
                value: '1',
            },
            {
                key: '_dokan_subscription_period',
                value: 'day',
            },
            {
                key: '_dokan_subscription_length',
                value: '0',
            },

            // Trial period
            {
                key: 'dokan_subscription_enable_trial',
                value: 'no',
            },
            {
                key: 'dokan_subscription_trail_range',
                value: '1',
            },
            {
                key: 'dokan_subscription_trial_period_types',
                value: 'day',
            },

            {
                key: '_dokan_min_max_meta',
                value: [],
            },
            {
                key: 'chosen_product_cat',
                value: [],
            },
            {
                key: '_product_addons',
                value: [],
            },
            {
                key: '_product_addons_exclude_global',
                value: '0',
            },
            {
                key: 'dokan_geo_latitude',
                value: '',
            },
            {
                key: 'dokan_geo_longitude',
                value: '',
            },
            {
                key: 'dokan_geo_address',
                value: '',
            },
            {
                key: 'dokan_geo_public',
                value: '',
            },
            {
                key: '_dokan_wholesale_meta',
                value: {
                    enable_wholesale: 'no',
                    price: '',
                    quantity: '',
                },
            },
        ],
    }),

    createDokanSubscriptionProductRecurring: () => ({
        name: `dokan_sub_${faker.string.nanoid(5)}`,
        post_author: '1',
        // type: 'product_pack',
        type: 'simple',
        status: 'publish',
        featured: false,
        catalog_visibility: 'hidden',
        description: 'dokan subscription',
        short_description: 'dokan subscription',
        regular_price: '100',
        purchasable: false,
        virtual: true,
        tax_status: 'taxable',
        tax_class: '',
        sold_individually: true,
        shipping_required: false,
        shipping_taxable: false,
        categories: [
            {
                name: 'Uncategorized',
            },
        ],
        meta_data: [
            // number of products
            {
                key: '_no_of_product',
                value: '-1',
            },

            // pack validity
            {
                key: '_pack_validity',
                value: '1000',
            },

            //product advertisement
            {
                key: '_dokan_advertisement_slot_count',
                value: '',
            },
            {
                key: '_dokan_advertisement_validity',
                value: '',
            },

            // Allowed product types
            {
                key: 'dokan_subscription_allowed_product_types',
                value: [], // 'simple', 'variable'
            },

            // Allowed product categories
            {
                key: '_vendor_allowed_categories',
                value: [], // category ids
            },

            // Restrict gallery image upload
            {
                key: '_enable_gallery_restriction',
                value: 'no',
            },
            // if above is yes then below will be used
            // {
            //     key: '_gallery_image_restriction_count',
            //     value: '-1',
            // },

            // recurring subscription

            {
                key: '_enable_recurring_payment',
                value: 'yes',
            },
            {
                key: '_dokan_subscription_period_interval',
                value: '1',
            },
            {
                key: '_dokan_subscription_period',
                value: 'day',
            },
            {
                key: '_dokan_subscription_length',
                value: '1000',
            },

            // Trial period
            {
                key: 'dokan_subscription_enable_trial',
                value: 'no',
            },
            {
                key: 'dokan_subscription_trail_range',
                value: '1',
            },
            {
                key: 'dokan_subscription_trial_period_types',
                value: 'day',
            },

            {
                key: '_dokan_min_max_meta',
                value: [],
            },
            {
                key: 'chosen_product_cat',
                value: [],
            },
            {
                key: '_product_addons',
                value: [],
            },
            {
                key: '_product_addons_exclude_global',
                value: '0',
            },
            {
                key: 'dokan_geo_latitude',
                value: '',
            },
            {
                key: 'dokan_geo_longitude',
                value: '',
            },
            {
                key: 'dokan_geo_address',
                value: '',
            },
            {
                key: 'dokan_geo_public',
                value: '',
            },
            {
                key: '_dokan_wholesale_meta',
                value: {
                    enable_wholesale: 'no',
                    price: '',
                    quantity: '',
                },
            },
        ],
    }),

    reverseWithdrawalPaymentProduct: {
        name: 'Reverse Withdrawal Payment',
        post_author: '1',
        type: 'simple',
        status: 'publish',
        featured: false,
        catalog_visibility: 'hidden',
        description: '<p>This is Dokan reverse withdrawal payment product, do not delete.</p>\n',
        regular_price: '0',
        categories: [{}],
        virtual: true,
        tax_status: 'none',
        sold_individually: true,
        shipping_required: false,
        shipping_taxable: false,
        meta_data: [{}],
    },

    productAdvertisementPaymentProduct: {
        name: 'Product Advertisement Payment',
        post_author: '1',
        type: 'simple',
        status: 'publish',
        featured: false,
        catalog_visibility: 'hidden',
        description: '<p>This is Dokan advertisement payment product, do not delete.</p>\n',
        regular_price: '0',
        categories: [{}],
        virtual: true,
        tax_status: 'taxable',
        sold_individually: true,
        shipping_required: false,
        shipping_taxable: false,
        meta_data: [
            {
                key: 'chosen_product_cat',
                value: [false],
            },
        ],
    },

    updateProduct: () => ({ regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }) }),

    updateProductVariation: () => ({ regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }) }),

    // product metadata

    createProductAddon: () => ({
        name: `Add-on Title_${faker.string.nanoid(5)}`,
        title_format: 'label',
        description_enable: 1,
        description: 'Add-on description',
        type: 'multiple_choice',
        display: 'select',
        position: 0,
        required: 1,
        restrictions: 0,
        restrictions_type: 'any_text',
        adjust_price: 0,
        price_type: 'flat_fee',
        price: '',
        min: 0,
        max: 0,
        options: [
            {
                label: 'option 1',
                price: '30',
                image: '',
                price_type: 'flat_fee',
            },
        ],
        wc_booking_person_qty_multiplier: 0,
        wc_booking_block_qty_multiplier: 0,
    }),

    createProductReview: () => ({
        product_id: '',
        // review        : `Test_review${faker.string.nanoid(10)}`,
        review: `Test_review_${faker.string.nanoid(10)}`,
        reviewer: faker.person.fullName(),
        reviewer_email: faker.internet.email(),
        rating: faker.number.int({ min: 1, max: 5 }),
        status: 'approved', // approved, hold, spam, unspam, trash, untrash
    }),

    // product review

    updateReview: {
        review: () => `review_message_${faker.string.nanoid(10)}`,
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
        name: 'clothings',
    },

    createCategoryElectronics: {
        name: 'electronics',
    },

    updateCategory: {
        name: 'clothings',
    },

    createMultiStepCategory: ['gadgets', 'wearables', 'smartwatches', 'fitness-trackers'],

    // attribute

    updateBatchAttributesTemplate: () => ({
        id: '',
        description: 'updated description (batch req)',
    }),

    updateBatchAttributeTermsTemplate: () => ({
        id: '',
        order_by: 'menu_order',
    }),

    // tags

    createTag: {
        name: 'accessories',
    },

    createTagsRandom: () => ({
        name: faker.string.nanoid(5),
    }),

    // coupon

    createCoupon: () => ({
        code: `VC_${faker.string.nanoid(10)}`,
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
        code: `AC_${faker.string.nanoid(10)}`,
        // discount_type: faker.helpers.arrayElement(['percent', 'fixed_product', 'fixed_cart']),
        discount_type: 'percent',
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
        customer_id: CUSTOMER_ID ?? 0,
        billing: {
            first_name: 'customer1',
            last_name: 'c1',
            address_1: 'abc street',
            address_2: 'xyz street',
            city: 'New York',
            state: 'NY',
            postcode: '10003',
            country: 'US',
            email: 'customer1@email.com',
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
                product_id: PRODUCT_ID ?? '',
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
            email: 'customer1@email.com',
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

    createMultiVendorOrder: {
        payment_method: 'bacs',
        payment_method_title: 'Direct Bank Transfer',
        set_paid: true,
        customer_id: CUSTOMER_ID ?? 0,
        billing: {
            first_name: 'customer1',
            last_name: 'c1',
            address_1: 'abc street',
            address_2: 'xyz street',
            city: 'New York',
            state: 'NY',
            postcode: '10003',
            country: 'US',
            email: 'customer1@email.com',
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
                product_id: PRODUCT_ID ?? '',
                quantity: 1,
            },
            {
                product_id: PRODUCT_ID_V2 ?? '',
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

        coupon_lines: [],
    },

    multivendorLineItems: [
        {
            author: VENDOR_ID,
            products: '3', // product Ids
            quantities: '1',
        },
        {
            author: VENDOR2_ID,
            products: '3', // product Ids
            quantities: '1',
        },
    ],

    createOrderNote: {
        status: 'processing',
        note: 'test order note',
    },

    createOrderNoteForCustomer: {
        status: 'processing',
        note: `test order note${faker.string.nanoid(10)}`,
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
        status: 'pending',
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
            fb: 'https://www.facebook.com/',
            twitter: 'https://www.twitter.com/',
            pinterest: 'https://www.pinterest.com/',
            linkedin: 'https://www.linkedin.com/',
            youtube: 'https://www.youtube.com/',
            instagram: 'https://www.instagram.com/',
            flickr: 'https://www.flickr.com/',
            threads: 'https://www.threads.net/',
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
        enable_tnc: false,
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
        catalog_mode: {
            hide_add_to_cart_button: 'off',
            hide_product_price: 'off',
            request_a_quote_enabled: 'off',
        },
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

    // catalog mode settings
    catalogModeSetting: {
        hide_add_to_cart_button: 'on',
        hide_product_price: 'on',
        request_a_quote_enabled: 'on',
    },

    // attribute

    createAttribute: () => ({
        name: `Test_attribute_${faker.string.alpha(8)}`,
        // slug        : `pa_${payloads.createAttribute.name}`,
        // type        : 'select',
        // order_by    : 'menu_order',
        // has_archives: false
    }),

    updateAttribute: () => ({ name: `Updated_Test_attribute_${faker.string.alpha(5)}` }),

    createAttributeTerm: () => ({ name: `Test_attributeTerm_${faker.string.alpha(5)}` }),

    updateAttributeTerm: () => ({ name: `Updated_Test_attributeTerm_${faker.string.alpha(5)}` }),

    // user

    createUser: () => ({
        username: faker.person.firstName(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        roles: 'customer',
        password: USER_PASSWORD,
    }),

    // vendor

    createVendor: {
        username: 'vendor2',
        first_name: 'vendor2',
        last_name: 'v2',
        email: 'vendor2@email.com',
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
        email: 'shashwata@wedevs.com',
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

    createRandomShippingZone: () => ({
        name: faker.string.alpha(3).toUpperCase(),
        // order: 0,
    }),

    addShippingZoneLocation: [
        {
            code: 'US',
            type: 'country',
        },
    ],

    addShippingMethodFlatRate: {
        method_id: 'flat_rate',
    },

    addShippingMethodFlatRateCost: {
        settings: {
            cost: '10.00',
        },
    },

    addShippingMethodFreeShipping: {
        method_id: 'free_shipping',
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

    createShippingClass: {
        name: 'heavy',
        description: 'Shipping class for heavy products',
    },

    createRandomShippingClass: () => ({
        name: faker.string.alpha(5).toUpperCase(),
        description: 'Shipping class description',
    }),

    // wooCommerce settings: general , products, tax, shipping, checkout, account

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

    // currency
    currency: {
        update: [
            {
                id: 'woocommerce_currency',
                // label: 'Currency',
                value: 'USD', // 'USD', 'EUR', 'INR'
            },
        ],
    },

    // enable tax
    enableTax: {
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

    // create tax class
    createTaxClass: {
        slug: 'zero-rate',
        name: 'Zero Rate',
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

    tax: {
        exclusive: {
            update: [
                {
                    id: 'woocommerce_prices_include_tax',
                    // label: 'Prices entered with tax',
                    value: 'no', // 'no', 'yes'
                },
                {
                    id: 'woocommerce_tax_round_at_subtotal',
                    label: 'Rounding',
                    value: 'no', // 'no', 'yes'
                },
                {
                    id: 'woocommerce_tax_display_shop',
                    // label: 'Display prices in the shop',
                    value: 'excl', // 'excl', 'incl
                },
                {
                    id: 'woocommerce_tax_display_cart',
                    // label: 'Display prices during cart and checkout',
                    value: 'excl', // 'excl', 'incl
                },
            ],
        },

        inclusive: {
            update: [
                {
                    id: 'woocommerce_prices_include_tax',
                    // label: 'Prices entered with tax',
                    value: 'yes', // 'no', 'yes'
                },
                {
                    id: 'woocommerce_tax_round_at_subtotal',
                    label: 'Rounding',
                    value: 'no', // 'no', 'yes'
                },
                {
                    id: 'woocommerce_tax_display_shop',
                    // label: 'Display prices in the shop',
                    value: 'incl', // 'excl', 'incl'
                },
                {
                    id: 'woocommerce_tax_display_cart',
                    // label: 'Display prices during cart and checkout',
                    value: 'incl', // 'excl', 'incl
                },
            ],
        },
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

    // germanized
    germanized: {
        update: [
            // Emails

            {
                id: 'woocommerce_gzd_mail_attach_terms',
                // label: 'Attach Terms & Conditions',
                // description: 'Attach Terms & Conditions to the following email templates',
                // default: ['customer_processing_order', 'customer_new_account', 'customer_new_account_activation'],
                value: [],
            },
            {
                id: 'woocommerce_gzd_mail_attach_revocation',
                // label: 'Attach Cancellation Policy',
                // description: 'Attach Cancellation Policy to the following email templates',
                // default: ['customer_processing_order'],
                value: [],
            },
            {
                id: 'woocommerce_gzd_mail_attach_data_security',
                // label: 'Attach Privacy Policy',
                // description: 'Attach Privacy Policy to the following email templates',
                // default: ['customer_processing_order', 'customer_new_account', 'customer_new_account_activation'],
                value: [],
            },
            {
                id: 'woocommerce_gzd_mail_attach_imprint',
                // label: 'Attach Imprint',
                // description: 'Attach Imprint to the following email templates',
                // default: [],
                value: [],
            },
            {
                id: 'woocommerce_gzd_mail_attach_warranties',
                // label: 'Attach Product Warranties',
                // description: 'Attach Product Warranties to the following email templates',
                // default: ['customer_completed_order'],
                value: [],
            },
            {
                id: 'woocommerce_gzd_mail_attach_review_authenticity',
                // label: 'Attach ',
                // description: 'Attach  to the following email templates',
                // default: []
                value: [],
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
                // description: 'Specify after how many days funds will be disburse to corresponding vendor. The funds will be transferred to vendors after this period automatically',
                value: '14',
            },
            {
                id: 'instant_payout',
                // label: 'Enable instant payout mode',
                // description: 'Enable instant payout so that the payout can be processed within 25 seconds, whereas, the standard payouts get processed within 48 hours. This feature is limited and requires some prerequisites to be fulfilled. Please check out the requirements <a href="https://docs.mangopay.com/guide/instant-payment-payout" target="_blank">here</a>.',
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
                // description: 'Selected payment methods will be appeared on checkout if requirements are fulfilled.',
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
                // description: 'Specify after how many days funds will be disburse to corresponding vendor. The funds will be transferred to vendors after this period automatically',
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
                // description: 'Log gateway events such as Webhook requests, Payment operations etc. inside <code>/Users/rk/Sites/dokan1/wp-content/uploads/wc-logs/dokan-2023-09-03-1a1ff23f40df3a5c66b67fcd8d3942ef.log</code>. Note: this may log personal information. We recommend using this for debugging purposes only and deleting the logs when finished.',
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
        username: `${faker.person.firstName()}_${faker.string.nanoid(5)}`,
        password: String(USER_PASSWORD),
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
            email: 'customer1@email.com',
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
        password: String(USER_PASSWORD),
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
            email: 'customer1@email.com',
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

    customerMeta: {
        meta_data: [
            {
                key: 'billing_dokan_company_id_number',
                value: faker.string.alphanumeric(5),
            },
            {
                key: 'billing_dokan_vat_number',
                value: faker.string.alphanumeric(10),
            },
            {
                key: 'billing_dokan_bank_name',
                value: faker.string.alphanumeric(7),
            },
            {
                key: 'billing_dokan_bank_iban',
                value: faker.finance.iban(),
            },
        ],
    },

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
        password: String(USER_PASSWORD),
    },

    createStaff: () => ({
        username: `${faker.person.firstName('male')}_${faker.string.nanoid(10)}`,
        first_name: faker.person.firstName('male'),
        last_name: faker.person.lastName('male'),
        phone: '0123456789',
        email: `${faker.person.firstName('male')}_${faker.string.nanoid(5)}@email.com`,
        password: String(USER_PASSWORD),
    }),

    updateStaff: () => ({
        // username: `${faker.person.firstName('male')}_${faker.string.nanoid(10)}`,
        first_name: faker.person.firstName('male'),
        last_name: faker.person.lastName('male'),
        phone: '0123456789',
        email: `${faker.person.firstName('male')}_${faker.string.nanoid(5)}@email.com`,
        password: String(USER_PASSWORD),
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
        auction: 'auction',
        booking: 'booking',
        colorSchemeCustomizer: 'color_scheme_customizer',
        deliveryTime: 'delivery_time',
        elementor: 'elementor',
        euCompliance: 'germanized',
        followStore: 'follow_store',
        geolocation: 'geolocation',
        liveChat: 'live_chat',
        liveSearch: 'live_search',
        mangopay: 'mangopay',
        moip: 'moip',
        minMaxQuantities: 'order_min_max',
        paypalMarketplace: 'paypal_marketplace',
        printful: 'printful',
        productAddon: 'product_addon',
        productAdvertising: 'product_advertising',
        productEnquiry: 'product_enquiry',
        productFormManager: 'product_form_customization',
        productSubscription: 'vsp',
        productQa: 'product_qa',
        rankMath: 'rank_math',
        razorpay: 'razorpay',
        reportAbuse: 'report_abuse',
        requestForQuotation: 'request_for_quotation',
        rma: 'rma',
        sellerBadge: 'seller_badge',
        sellerVacation: 'seller_vacation',
        shipStation: 'shipstation',
        spmv: 'spmv',
        storeReviews: 'store_reviews',
        storeSupport: 'store_support',
        stripe: 'stripe',
        stripeExpress: 'stripe_express',
        tableRateShipping: 'table_rate_shipping',
        vendorAnalytics: 'vendor_analytics',
        vendorImportExport: 'export_import',
        vendorStaff: 'vendor_staff',
        vendorVerification: 'vendor_verification',
        vendorSubscription: 'product_subscription',
        wholesale: 'wholesale',
    },

    deactivateModule: {
        module: 'booking',
    },

    activateModule: {
        module: 'booking',
    },

    // announcement

    createAnnouncement: () => ({
        // title: 'test announcement title',
        title: `test announcement_${faker.string.nanoid(10)}`,
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

    createStoreCategory: () => ({ name: `Store_Category_${faker.string.nanoid(5)}` }),
    updateStoreCategory: () => ({ name: `Update_Store_Category_${faker.string.nanoid(5)}` }),

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
            email: 'dummystore1@email.com',
            password: String(USER_PASSWORD),
            store_name: 'dummyStore1',
            social: [],
            payment: [],
            phone: '0123456789',
            show_email: 'yes',
            address: [],
            location: '',
            banner: '',
            icon: '',
            gravatar: '',
            show_more_tpab: 'yes',
            show_ppp: 12,
            enable_tnc: 'on',
            store_seo: [],
            dokan_store_time: [],
            enabled: 'yes',
            trusted: 'yes',
        },
    },

    // store

    createStore: () => ({
        user_login: `${faker.person.firstName()}_${faker.string.nanoid(5)}`,
        user_pass: String(USER_PASSWORD),
        email: faker.internet.email(),
        store_name: `${faker.person.firstName()}_store`,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        role: 'seller',
        notify_vendor: 'yes',
        social: {
            fb: 'https://www.facebook.com/',
            twitter: 'https://www.twitter.com/',
            pinterest: 'https://www.pinterest.com/',
            linkedin: 'https://www.linkedin.com/',
            youtube: 'https://www.youtube.com/',
            instagram: 'https://www.instagram.com/',
            flickr: 'https://www.flickr.com/',
            threads: 'https://www.threads.net/',
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
        banner_id: 0,
        gravatar_id: 0,
        enable_tnc: true,
        store_tnc: 'test Vendor terms and conditions',
        featured: true,
        enabled: true,
        trusted: true, // publish product directly
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
            skrill: {
                email: 'skrill@g.c',
            },
            dokan_custom: {
                withdraw_method_name: 'Bksh',
                withdraw_method_type: 'Phone',
                value: '0123456789',
            },
            // "stripe": false,
            // stripe_express: false,
            // 'dokan-moip-connect': true,
            // dokan_razorpay: false,
        },
        // store_open_close: {
        //     enabled: 'yes',
        //     time: {
        //         monday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         tuesday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         wednesday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         thursday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         friday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         saturday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         sunday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //     },
        //     open_notice: 'Store is open',
        //     close_notice: 'Store is closed',
        // },
        sale_only_here: 'yes',
        company_name: faker.company.name(),
        company_id_number: faker.string.alphanumeric(5),
        vat_number: faker.string.alphanumeric(10),
        bank_name: faker.string.alphanumeric(7),
        bank_iban: faker.finance.iban(),
        categories: [
            {
                // id: 74,
                // name: 'Uncategorized',
                // slug: 'uncategorized',
            },
        ],

        // vendorwise commission
        admin_commission_type: '', // fixed, category_based
        admin_commission: '5',
        admin_additional_fee: '5',
        admin_category_commission: {
            all: {
                flat: '7',
                percentage: '7',
            },
            items: {
                '27': {
                    flat: '7',
                    percentage: '7',
                },
            },
        },
        // store_seo: {
        //     'dokan-seo-meta-title': 'meta title',
        //     'dokan-seo-meta-desc': 'meta description',
        //     'dokan-seo-meta-keywords': 'meta keywords',
        //     'dokan-seo-og-title': 'facebook title',
        //     'dokan-seo-og-desc': 'facebook description',
        //     'dokan-seo-og-image': '0',
        //     'dokan-seo-twitter-title': 'twitter title',
        //     'dokan-seo-twitter-desc': 'twitter description',
        //     'dokan-seo-twitter-image': '0',
        // },
    }),

    updateStore: () => ({
        social: {
            fb: 'https://www.facebook.com/',
            twitter: 'https://www.twitter.com/',
            pinterest: 'https://www.pinterest.com/',
            linkedin: 'https://www.linkedin.com/',
            youtube: 'https://www.youtube.com/',
            instagram: 'https://www.instagram.com/',
            flickr: 'https://www.flickr.com/',
            threads: 'https://www.threads.net/',
        },
        phone: '0123456789',
        show_email: true,
        address: {
            street_1: 'abc street',
            street_2: 'xyz street',
            city: 'New York',
            zip: '10003',
            state: 'NY',
            country: 'US',
        },
        location: '40.7127753,-74.0059728',
        banner_id: 0,
        gravatar_id: 0,
        enable_tnc: true,
        store_tnc: 'test Vendor terms and conditions',
        featured: true,
        enabled: true,
        trusted: true, // publish product directly
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
            skrill: {
                email: 'skrill@g.c',
            },
            dokan_custom: {
                withdraw_method_name: 'Bksh',
                withdraw_method_type: 'Phone',
                value: '0123456789',
            },
            // "stripe": false,
            // stripe_express: false,
            // 'dokan-moip-connect': true,
            // dokan_razorpay: false,
        },
        // store_open_close: {
        //     enabled: 'yes',
        //     time: {
        //         monday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         tuesday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         wednesday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         thursday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         friday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         saturday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         sunday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //     },
        //     open_notice: 'Store is open',
        //     close_notice: 'Store is closed',
        // },
        sale_only_here: 'yes',
        company_name: faker.company.name(),
        company_id_number: faker.string.alphanumeric(5),
        vat_number: faker.string.alphanumeric(10),
        bank_name: faker.string.alphanumeric(7),
        bank_iban: faker.finance.iban(),
        categories: [
            {
                // id: 74,
                // name: 'Uncategorized',
                // slug: 'uncategorized',
            },
        ],

        // vendorwise commission
        admin_commission_type: '', // fixed, category_based
        admin_commission: '5',
        admin_additional_fee: '5',
        admin_category_commission: {
            all: {
                flat: '7',
                percentage: '7',
            },
            items: {
                '27': {
                    flat: '7',
                    percentage: '7',
                },
            },
        },
        // store_seo: {
        //     'dokan-seo-meta-title': 'meta title',
        //     'dokan-seo-meta-desc': 'meta description',
        //     'dokan-seo-meta-keywords': 'meta keywords',
        //     'dokan-seo-og-title': 'facebook title',
        //     'dokan-seo-og-desc': 'facebook description',
        //     'dokan-seo-og-image': '0',
        //     'dokan-seo-twitter-title': 'twitter title',
        //     'dokan-seo-twitter-desc': 'twitter description',
        //     'dokan-seo-twitter-image': '0',
        // },
    }),

    // always revert vendor settings to this after altering in tests
    defaultStoreSettings: {
        social: {
            fb: 'https://www.facebook.com/',
            twitter: 'https://www.twitter.com/',
            pinterest: 'https://www.pinterest.com/',
            linkedin: 'https://www.linkedin.com/',
            youtube: 'https://www.youtube.com/',
            instagram: 'https://www.instagram.com/',
            flickr: 'https://www.flickr.com/',
            threads: 'https://www.threads.net/',
        },
        phone: '0123456789',
        show_email: true,
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

        enable_tnc: true,
        store_tnc: 'test Vendor terms and conditions',
        featured: 'yes',
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
        trusted: 'yes',
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

    vendorEuCompliance: {
        company_name: faker.company.name(),
        company_id_number: faker.string.alphanumeric(5),
        vat_number: faker.string.alphanumeric(10),
        bank_name: faker.string.alphanumeric(7),
        bank_iban: faker.finance.iban(),
    },

    storeResetFields: {
        featured: true,
        enabled: true,
        trusted: true,
        enable_tnc: true,
        show_email: true,
        sale_only_here: true,
        store_open_close: {
            enabled: 'yes',
        },
        company_name: faker.company.name(),
        company_id_number: faker.string.alphanumeric(5),
        vat_number: faker.string.alphanumeric(10),
        bank_name: faker.string.alphanumeric(7),
        bank_iban: faker.finance.iban(),
    },

    storeOpenClose: {
        store_open_close: {
            enabled: 'yes',
            time: {
                monday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:59 pm'],
                },
                tuesday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:59 pm'],
                },
                wednesday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:59 pm'],
                },
                thursday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:59 pm'],
                },
                friday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:59 pm'],
                },
                saturday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:59 pm'],
                },
                sunday: {
                    status: 'open',
                    opening_time: ['12:00 am'],
                    closing_time: ['11:59 pm'],
                },
            },
            open_notice: 'Store is open',
            close_notice: 'Store is closed',
        },
    },

    createStore1: {
        user_login: VENDOR ,
        user_pass: USER_PASSWORD,
        user_nicename: `${VENDOR}store`, // store url
        email: `${VENDOR}@email.com`,
        store_name: `${VENDOR}store`,
        first_name: VENDOR,
        last_name: 'v',
        role: 'seller',
        notify_vendor: 'yes',
        social: {
            fb: 'https://www.facebook.com/',
            twitter: 'https://www.twitter.com/',
            pinterest: 'https://www.pinterest.com/',
            linkedin: 'https://www.linkedin.com/',
            youtube: 'https://www.youtube.com/',
            instagram: 'https://www.instagram.com/',
            flickr: 'https://www.flickr.com/',
            threads: 'https://www.threads.net/',
        },
        phone: '0123456789',
        show_email: true,
        address: {
            street_1: 'abc street',
            street_2: 'xyz street',
            city: 'New York',
            zip: '10003',
            state: 'NY',
            country: 'US',
        },
        location: '40.7127753,-74.0059728',
        banner_id: 0,
        gravatar_id: 0,
        enable_tnc: true,
        store_tnc: 'test Vendor terms and conditions',
        featured: true,
        enabled: true,
        trusted: true, // publish product directly
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
            skrill: {
                email: 'skrill@g.c',
            },
            dokan_custom: {
                withdraw_method_name: 'Bksh',
                withdraw_method_type: 'Phone',
                value: '0123456789',
            },
            // "stripe": false,
            // stripe_express: false,
            // 'dokan-moip-connect': true,
            // dokan_razorpay: false,
        },
        // store_open_close: {
        //     enabled: 'yes',
        //     time: {
        //         monday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         tuesday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         wednesday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         thursday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         friday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         saturday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         sunday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //     },
        //     open_notice: 'Store is open',
        //     close_notice: 'Store is closed',
        // },
        sale_only_here: 'yes',
        company_name: faker.company.name(),
        company_id_number: faker.string.alphanumeric(5),
        vat_number: faker.string.alphanumeric(10),
        bank_name: faker.string.alphanumeric(7),
        bank_iban: faker.finance.iban(),
        vendor_biography: 'test vendor biography',
        categories: [
            {
                // id: 74,
                // name: 'Uncategorized',
                // slug: 'uncategorized',
            },
        ],

        // vendorwise commission
        admin_commission_type: '', // fixed, category_based
        admin_commission: '5',
        admin_additional_fee: '5',
        admin_category_commission: {
            all: {
                flat: '7',
                percentage: '7',
            },
            items: {
                '27': {
                    flat: '7',
                    percentage: '7',
                },
            },
        },
        // store_seo: {
        //     'dokan-seo-meta-title': 'meta title',
        //     'dokan-seo-meta-desc': 'meta description',
        //     'dokan-seo-meta-keywords': 'meta keywords',
        //     'dokan-seo-og-title': 'facebook title',
        //     'dokan-seo-og-desc': 'facebook description',
        //     'dokan-seo-og-image': '0',
        //     'dokan-seo-twitter-title': 'twitter title',
        //     'dokan-seo-twitter-desc': 'twitter description',
        //     'dokan-seo-twitter-image': '0',
        // },
    },

    createStore2: {
        user_login: VENDOR2,
        user_pass: USER_PASSWORD,
        user_nicename: `${VENDOR2}store`,
        email: `${VENDOR2}@email.com`,
        store_name: `${VENDOR2}store`,
        first_name: VENDOR2,
        last_name: 'v',
        role: 'seller',
        notify_vendor: 'yes',
        social: {
            fb: 'https://www.facebook.com/',
            twitter: 'https://www.twitter.com/',
            pinterest: 'https://www.pinterest.com/',
            linkedin: 'https://www.linkedin.com/',
            youtube: 'https://www.youtube.com/',
            instagram: 'https://www.instagram.com/',
            flickr: 'https://www.flickr.com/',
            threads: 'https://www.threads.net/',
        },
        phone: '0123456789',
        show_email: true,
        address: {
            street_1: 'abc street',
            street_2: 'xyz street',
            city: 'New York',
            zip: '10003',
            state: 'NY',
            country: 'US',
        },
        location: '40.7127753,-74.0059728',
        banner_id: 0,
        gravatar_id: 0,
        enable_tnc: true,
        store_tnc: 'test Vendor terms and conditions',
        featured: true,
        enabled: true,
        trusted: true, // publish product directly
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
            skrill: {
                email: 'skrill@g.c',
            },
            dokan_custom: {
                withdraw_method_name: 'Bksh',
                withdraw_method_type: 'Phone',
                value: '0123456789',
            },
            // "stripe": false,
            // stripe_express: false,
            // 'dokan-moip-connect': true,
            // dokan_razorpay: false,
        },
        // store_open_close: {
        //     enabled: 'yes',
        //     time: {
        //         monday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         tuesday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         wednesday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         thursday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         friday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         saturday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //         sunday: {
        //             status: 'open',
        //             opening_time: ['12:00 am'],
        //             closing_time: ['11:59 pm'],
        //         },
        //     },
        //     open_notice: 'Store is open',
        //     close_notice: 'Store is closed',
        // },
        sale_only_here: 'yes',
        company_name: faker.company.name(),
        company_id_number: faker.string.alphanumeric(5),
        vat_number: faker.string.alphanumeric(10),
        bank_name: faker.string.alphanumeric(7),
        bank_iban: faker.finance.iban(),
        categories: [
            {
                // id: 74,
                // name: 'Uncategorized',
                // slug: 'uncategorized',
            },
        ],

        // vendorwise commission
        admin_commission_type: '', // fixed, category_based
        admin_commission: '5',
        admin_additional_fee: '5',
        admin_category_commission: {
            all: {
                flat: '7',
                percentage: '7',
            },
            items: {
                '27': {
                    flat: '7',
                    percentage: '7',
                },
            },
        },
        // store_seo: {
        //     'dokan-seo-meta-title': 'meta title',
        //     'dokan-seo-meta-desc': 'meta description',
        //     'dokan-seo-meta-keywords': 'meta keywords',
        //     'dokan-seo-og-title': 'facebook title',
        //     'dokan-seo-og-desc': 'facebook description',
        //     'dokan-seo-og-image': '0',
        //     'dokan-seo-twitter-title': 'twitter title',
        //     'dokan-seo-twitter-desc': 'twitter description',
        //     'dokan-seo-twitter-image': '0',
        // },
    },

    createCustomer1: {
        email: `${CUSTOMER}@email.com`,
        first_name: CUSTOMER,
        last_name: 'c1',
        role: 'customer',
        username: CUSTOMER,
        password: USER_PASSWORD,
        billing: {
            first_name: CUSTOMER,
            last_name: 'c1',
            company: '',
            address_1: 'abc street',
            address_2: 'xyz street',
            city: 'New York',
            postcode: '10003',
            country: 'US',
            state: 'NY',
            email: `${CUSTOMER}@email.com`,
            phone: '0123456789',
        },
        shipping: {
            first_name: CUSTOMER,
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

    createCustomer2: {
        email: `${CUSTOMER2}@email.com`,
        first_name: CUSTOMER2,
        last_name: 'c2',
        role: 'customer',
        username: CUSTOMER2,
        password: USER_PASSWORD,
        billing: {
            first_name: CUSTOMER2,
            last_name: 'c2',
            company: '',
            address_1: 'abc street',
            address_2: 'xyz street',
            city: 'New York',
            postcode: '10003',
            country: 'US',
            state: 'NY',
            email: `${CUSTOMER2}@email.com`,
            phone: '0123456789',
        },
        shipping: {
            first_name: CUSTOMER2,
            last_name: 'c2',
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
            company: faker.company.name(),
            address_1: 'abc street',
            address_2: 'xyz street',
            city: 'New York',
            postcode: '10003',
            country: 'US',
            state: 'NY',
            email: `${faker.person.firstName()}@email.com`,
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
        password: String(USER_PASSWORD),
    },

    // quote rule

    createQuoteRule: () => ({
        rule_name: `QR_${faker.string.nanoid(10)}`,
        selected_user_role: ['customer', 'guest'],
        category_ids: [],
        product_ids: [],
        expire_limit: '20',
        hide_price: '1',
        hide_price_text: 'Price is hidden',
        hide_cart_button: 'replace', // keep_and_add_new
        button_text: 'Add to quote',
        apply_on_all_product: '0',
        rule_priority: '0',
        status: 'publish',
    }),

    updateQuoteRule: {
        rule_name: `updated_QR_${faker.string.nanoid(10)}`,
        selected_user_role: ['customer'],
        hide_price: '0',
        hide_price_text: 'Price is covered',
        hide_cart_button: 'keep_and_add_new',
        button_text: ' To quote',
        apply_on_all_product: '1',
    },

    // quote request

    createQuoteRequest: () => ({
        quote_title: `QT_${faker.string.nanoid(10)}`,
        // user_id: '',
        customer_info: {
            name_field: 'customer1',
            email_field: 'customer1@email.com',
            company_field: 'c1',
            phone_field: '0987654321',
        },
        store_info: {
            store_id: VENDOR_ID,
        },
        product_ids: [''],
        offer_price: ['50'],
        offer_product_quantity: ['10'],
        status: 'pending',
    }),

    updateRequestQuote: {
        quote_title: `updated_QT_${faker.string.nanoid(10)}`,
        // user_id: '',
        customer_info: {
            name_field: 'customer1',
            email_field: 'customer1@email.com',
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

    // product questions answers

    createProductQuestion: () => ({
        question: `test question_${faker.string.nanoid(10)}`,
        product_id: '',
        status: 'visible',
    }),

    updateProductQuestion: () => ({
        question: `test question updated_${faker.string.nanoid(10)}`,
        status: 'hidden',
    }),

    createProductQuestionAnswer: () => ({
        answer: `<p>test answer_${faker.string.nanoid(10)}</p>`,
        question_id: '',
    }),

    updateProductQuestionAnswer: () => ({
        answer: `test answer updated_${faker.string.nanoid(10)}`,
    }),

    // vendor verification

    createVerificationMethod: () => ({
        title: `test verification method_${faker.string.nanoid(10)}`,
        help_text: 'test help-text',
        status: true,
        required: true,
        kind: 'custom', // custom, address
    }),

    updateVerificationMethod: () => ({
        title: `test verification method updated_${faker.string.nanoid(10)}`,
        help_text: 'test help-text updated',
        status: false,
        required: false,
        kind: 'custom', // custom, address
    }),

    createVerificationRequest: () => ({
        vendor_id: 0,
        method_id: 0,
        status: 'pending',
        note: 'test-note',
        documents: [],
    }),

    updateVerificationRequest: () => ({
        vendor_id: 0,
        method_id: 0,
        status: 'approved',
        note: 'test-note updated',
        documents: [],
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

    randomNumber: faker.number.int({ min: 2, max: 100 }),

    createReverseWithdrawal: {
        trn_type: 'other', // "opening_balance", "order_commission", "failed_transfer_reversal", "product_advertisement", "manual_order_commission", "vendor_payment", "order_refund", "manual_product", "manual_order", "other"
        vendor_id: '',
        note: 'test reverse withdrawal note',
        credit: '100',
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

    paramsStoreSlug: {
        store_slug: faker.string.nanoid(10),
    },

    //commission
    commission: {
        product_id: 0,
        amount: 0,
        vendor_id: 0,
        category_ids: 0,
        context: 'admin',
    },
    // subscription

    updateVendorSubscription: {
        action: 'cancel', // 'activate', 'cancel'
        immediately: false,
    },

    batchUpdateVendorSubscription: {
        action: 'cancel', // 'activate', 'cancel'
        user_ids: [],
    },

    saveVendorSubscriptionProductCommission: {
        product_id: '',
        commission_type: 'fixed',
        commission: {
            fixed: {
                percentage: '5',
                flat: '5',
            },
            category_based: {
                all: {
                    percentage: '5',
                    flat: '5',
                },
                // items: {
                //     'category-id1': {  // replace with actual category id
                //         percentage: '5',
                //         flat: '5',
                //     },
                //     'category-id2': {
                //         percentage: '5',
                //         flat: '5',
                //     },
                // },
            },
        },
    },

    // shipping status

    createShipment: {
        shipped_status: 'ss_proceccing',
        shipping_provider: 'sp-dhl',
        shipped_date: new Date().toISOString(),
        shipping_number: '#001',
        shipment_comments: 'test shipment comment',
        is_notify: 'on',
        item_id: ['lineitemid'], // replace with actual line item id
        item_qty: {
            lineitemid: 1, // replace with actual line item id
        },
    },

    updateShipment: {
        shipping_provider: 'sp-fedex', // sp-dhl, sp-dpd, sp-fedex, sp-ups, sp-usps (has more options)
        shipping_number: '#002',
        shipped_status: 'ss_pickedup', // ss_delivered, ss_cancelled, ss_proceccing, ss_ready_for_pickup, ss_pickedup (has more options)
        shipped_date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        shipment_comments: 'updated shipment comment',
    },

    vendorwiseCommission: {
        admin_commission_type: 'fixed', // fixed, category_based
        admin_commission: '5',
        admin_additional_fee: '5',
        admin_category_commission: {
            all: {
                flat: '7',
                percentage: '7',
            },
            items: {
                '27': {
                    flat: '7',
                    percentage: '7',
                },
            },
        },
    },

    productCommissionOnlyPercent: [
        {
            key: '_per_product_admin_commission_type',
            value: 'fixed',
        },
        {
            key: '_per_product_admin_commission',
            value: '10',
        },
        {
            key: '_per_product_admin_additional_fee',
            value: '0',
        },
    ],

    productCommissionOnlyFixed: [
        {
            key: '_per_product_admin_commission_type',
            value: 'fixed',
        },
        {
            key: '_per_product_admin_commission',
            value: '0',
        },
        {
            key: '_per_product_admin_additional_fee',
            value: '10',
        },
    ],

    productCommissionBothPercentageAndFixed: [
        {
            key: '_per_product_admin_commission_type',
            value: 'fixed',
        },
        {
            key: '_per_product_admin_commission',
            value: '10',
        },
        {
            key: '_per_product_admin_additional_fee',
            value: '10',
        },
    ],

    // ShipStation

    createCredential: {
        vendor_id: '',
    },

    shipStationOrderStatusSettings: {
        vendor_id: '',
        export_statuses: ['wc-pending', 'wc-processing', 'wc-on-hold', 'wc-completed', 'wc-cancelled'],
        shipped_status: 'wc-completed',
    },

    // shortcodes

    // dokan dashboard shortcode
    dashboardShortcode: {
        title: 'Dashboard-shortcode',
        content: '[dokan-dashboard]',
        status: 'publish',
    },

    // dokan subscription pack shortcode
    dokanSubscriptionPackShortcode: {
        title: 'Dokan_subscription_pack',
        content: '[dps_product_pack]',
        status: 'publish',
    },

    // vendor registration  shortcode
    vendorRegistrationShortcode: {
        title: 'Vendor-registration',
        content: '[dokan-vendor-registration]',
        status: 'publish',
    },

    // best selling product shortcode
    bestSellingProductShortcode: {
        title: 'Best-selling-product',
        content: '[dokan-best-selling-product]',
        status: 'publish',
    },

    // top rated product shortcode
    topRatedProductShortcode: {
        title: 'Top-rated-product',
        content: '[dokan-top-rated-product]',
        status: 'publish',
    },

    // customer migration shortcode
    customerMigrationShortcode: {
        title: 'Customer-migration',
        content: '[dokan-customer-migration]',
        status: 'publish',
    },

    // geolocation filter form shortcode
    geolocationFilterFormShortcode: {
        title: 'geolocation-filter-form',
        content: '[dokan-geolocation-filter-form]',
        status: 'publish',
    },

    // stores shortcode
    storesShortcode: {
        title: 'Stores-shortcode',
        content: '[dokan-stores]',
        status: 'publish',
    },

    // my orders shortcode
    myOrdersShortcode: {
        title: 'My-orders-shortcode',
        content: '[dokan-my-orders]',
        status: 'publish',
    },

    // request quote shortcode
    requestQuoteShortcode: {
        title: 'Request-quote',
        content: '[dokan-request-quote]',
        status: 'publish',
    },

    // product advertisement  shortcode
    productAdvertisementShortcode: {
        title: 'Advertised-products',
        content: '[dokan_product_advertisement]',
        status: 'publish',
    },
};
