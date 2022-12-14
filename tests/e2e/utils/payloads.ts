import { faker } from '@faker-js/faker'
import { data } from './testData'

let basicAuth = (username: string, password: string) => 'Basic ' + Buffer.from(username + ':' + password).toString('base64');


export const payloads = {

  aAuth: basicAuth(process.env.ADMIN, process.env.ADMIN_PASSWORD),

  adminAuth: {
    Authorization: basicAuth(process.env.ADMIN, process.env.ADMIN_PASSWORD)
  },
  vendorAuth: {
    Authorization: basicAuth(process.env.VENDOR, process.env.VENDOR_PASSWORD)
  },
  customerAuth: {
    Authorization: basicAuth(process.env.CUSTOMER, process.env.CUSTOMER_PASSWORD)
  },

  admin: {
    username: process.env.ADMIN,
    password: process.env.ADMIN_PASSWORD,
  },

  vendor: {
    username: process.env.VENDOR,
    password: process.env.VENDOR_PASSWORD,
  },

  customer: {
    username: process.env.CUSTOMER,
    password: process.env.CUSTOMER_PASSWORD,
  },


  createProduct: () => {
    return {
      name: faker.commerce.productName() + (' Simple'),
      type: data.product.type.simple,
      regular_price: faker.finance.amount(100, 200, faker.helpers.arrayElement([0, 2])),
      categories: [
        {
          // id: 48
        }
      ],
    }
  },

  createVariableProduct: () => {
    return {
      name: faker.commerce.productName() + (' (Variable)'),
      type: data.product.type.variable,
      regular_price: faker.finance.amount(100, 200, faker.helpers.arrayElement([0, 2])),
      categories: [
        {
          // id: 48
        }
      ],
    }
  },

  createProductVariation: {
    // id: '47',
    regular_price: data.product.price.price_random(),
    categories: [{
      //  id: 48
    }],
    attributes: [{
      id: 18,
      // name: 'size',
      option: 'l'
    }],
  },

  updateProduct: () => {
    return { regular_price: data.product.price.price_random(), }
  },

  updateProductVariation: () => {
    return { regular_price: data.product.price.price_random(), }
  },

  createProductReview: () => {
    return {
      product_id: '',
      review: 'Test_review' + faker.datatype.uuid(),
      reviewer: faker.name.fullName(),
      reviewer_email: faker.internet.email(),
      rating: faker.datatype.number({ min: 1, max: 5 }),
    }
  },

  createCoupon: () => {
    return {
      code: 'VC_' + faker.datatype.uuid(),
      amount: faker.datatype.number({ min: 1, max: 10 },).toString(),
      discount_type: faker.helpers.arrayElement(['percent', 'fixed_product']),
      product_ids: [15]
    }
  },

  updateCoupon: () => {
    return { amount: faker.datatype.number({ min: 1, max: 10 },).toString(), }
  },


  updateOrder: {
    status: 'wc-pending'
  },



  createOrder: {
    payment_method: "bacs",
    payment_method_title: "Direct Bank Transfer",
    set_paid: true,
    billing: {
      first_name: "John",
      last_name: "Doe",
      address_1: "969 Market",
      address_2: "",
      city: "San Francisco",
      state: "CA",
      postcode: "94103",
      country: "US",
      email: "john.doe@example.com",
      phone: "(555) 555-5555"
    },

    shipping: {
      first_name: "John",
      last_name: "Doe",
      address_1: "969 Market",
      address_2: "",
      city: "San Francisco",
      state: "CA",
      postcode: "94103",
      country: "US"
    },
    line_items: [
      {
        product_id: '',
        quantity: 1
      },
    ],
    shipping_lines: [
      {
        method_id: "flat_rate",
        method_title: "Flat Rate",
        total: "10.00"
      }
    ]
  },

  createOrderCod: {
    payment_method: "cod",
    payment_method_title: "Cash on delivery",
    set_paid: true,
    billing: {
      first_name: "John",
      last_name: "Doe",
      address_1: "969 Market",
      address_2: "",
      city: "San Francisco",
      state: "CA",
      postcode: "94103",
      country: "US",
      email: "john.doe@example.com",
      phone: "(555) 555-5555"
    },

    shipping: {
      first_name: "John",
      last_name: "Doe",
      address_1: "969 Market",
      address_2: "",
      city: "San Francisco",
      state: "CA",
      postcode: "94103",
      country: "US"
    },
    line_items: [
      {
        product_id: '',
        quantity: 1
      },
    ],
    shipping_lines: [
      {
        method_id: "flat_rate",
        method_title: "Flat Rate",
        total: "10.00"
      }
    ]
  },

  createRefund:
  {
    api_refund: false,
    reason: 'testing refund',
    line_items: [
      {
        refund_total: 1
      }
    ]
  },

  createWithdraw: {
    amount: "50",
    notes: "Withdraw notes",
    method: "paypal"
  },

  updateWithdraw: {
    amount: "10",
    notes: "Withdraw notes",
    method: "paypal"
  },

  updateSettings: {
    // store_name: 'vendorstore2',
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
        swift: '1234567890'
      },
      paypal: { email: 'pay9pal@g.c' }
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
      // country: 'AF'
      location_name: 'Default'
    },
    location: '40.7127753,-74.0059728',
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
      sunday: { status: 'close', opening_time: [], closing_time: [] }
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
        social_val: [Object]
      }
    },
    setting_minimum_order_amount: '',
    setting_order_percentage: '',
    find_address: 'Dhaka',
    product_sections: {
      advertised: 'no',
      featured: 'no',
      latest: 'no',
      best_selling: 'no',
      top_rated: 'no'
    },
    order_min_max: {
      enable_vendor_min_max_quantity: 'no',
      min_quantity_to_order: '',
      max_quantity_to_order: '',
      vendor_min_max_products: [],
      vendor_min_max_product_cat: [],
      enable_vendor_min_max_amount: 'no',
      min_amount_to_order: '',
      max_amount_to_order: ''
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
    store_locations: []
  },

  createAttribute: () => {
    return {
      name: 'Test_attribute_' + faker.random.alpha(8),
      // slug: `pa_${payloads.createAttribute.name}`,
      // type: "select",
      // order_by: "menu_order",
      // has_archives: false
    }
  },

  updateAttribute: () => {
    return { name: 'Updated_Test_attribute_' + faker.random.alpha(5), }
  },

  createAttributeTerm: () => {
    return { name: 'Test_attributeTerm_' + faker.random.alpha(8), }
  },

  updateAttributeTerm: () => {
    return { name: 'Updated_Test_attributeTerm_' + faker.random.alpha(5), }

  },


  createOrderNote: {
    status: "processing",
    note: "test order note"
  },


  updateReview: {
    review: data.product.review.reviewMessage(),
    rating: data.product.review.rating,
    name: 'customer1',
    email: 'customer1@g.com',
    verified: true
  },

  createCategory: {
    name: "Clothing",
  },

  updateCategory: {
    name: "Clothing",
  },


  createUser: {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    roles: '',
    password: '',
  },

  createVendor: {
    username: 'vendor2',
    first_name: 'vendor2',
    last_name: 'v2',
    email: 'vendor2@yopmail.com',
    roles: 'seller',
    password: 'password',
  },

  updatePlugin: {
    plugin: 'dokan/dokan',
    // plugin: 'dokan-pro/dokan-pro',
    status: 'active',
    // status: 'inactive',
  },

  siteSettings: {
    // title: 'dokan1',
    // description: 'Just another WordPress site',
    // url: 'http://dokan1.test',
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


  createShippingZone: {
    name: "US",
    order: 0,
  },

  addShippingZoneLocation: [
    {
      code: 'US',
      type: 'country',
    }
  ],
  // flat_rate, free_shipping, local_pickup, dokan_table_rate_shipping, dokan_distance_rate_shipping, dokan_product_shipping, dokan_vendor_shipping
  addShippingZoneMethodFlatRate: {
    method_id: "flat_rate"
  },
  addShippingZoneMethodFreeShipping: {
    method_id: "free_shipping"
  },
  addShippingZoneMethodLocalPickup: {
    method_id: "local_pickup"
  },
  addShippingZoneMethodDokanTableRateShipping: {
    method_id: "dokan_table_rate_shipping"
  },
  addShippingZoneMethodDokanistanceRateShipping: {
    method_id: "dokan_distance_rate_shipping"
  },
  addShippingZoneMethodDokanVendorShipping: {
    method_id: "dokan_vendor_shipping"
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


  // general , products, tax, shipping, checkout, account
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
      }
    ]
  },

  account: {
    update: [
      {
        id: 'woocommerce_registration_generate_password',
        // description: 'When creating an account, send the new user a link to set their password',
        value: 'no',
        // value: 'yes',
      }
    ]
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
  // payPal: {
  //   id: 'dokan_paypal_marketplace',
  //   title: 'PayPal Marketplace',
  //   enabled: false,
  //   method_title: 'Dokan PayPal Marketplace',
  //   settings: {
  //     shipping_tax_fee_recipient_notice: [Object],
  //     title: [Object],
  //     partner_id: [Object],
  //     api_details: [Object],
  //     test_mode: [Object],
  //     app_user: [Object],
  //     app_pass: [Object],
  //     test_app_user: [Object],
  //     test_app_pass: [Object],
  //     bn_code: [Object],
  //     disbursement_mode: [Object],
  //     disbursement_delay_period: [Object],
  //     button_type: [Object],
  //     ucc_mode_notice: [Object],
  //     ucc_mode: [Object],
  //     marketplace_logo: [Object],
  //     display_notice_on_vendor_dashboard: [Object],
  //     display_notice_to_non_connected_sellers: [Object],
  //     display_notice_interval: [Object],
  //     webhook_message: [Object]
  //   },
  // },
  // stripeConnect: {
  //   id: 'dokan-stripe-connect',
  //   title: 'Dokan Credit card (Stripe)',
  //   enabled: false,
  //   method_title: 'Dokan Stripe Connect',
  //   settings: {
  //     title: [Object],
  //     allow_non_connected_sellers: [Object],
  //     display_notice_to_non_connected_sellers: [Object],
  //     display_notice_interval: [Object],
  //     enable_3d_secure: [Object],
  //     seller_pays_the_processing_fee: [Object],
  //     testmode: [Object],
  //     stripe_checkout: [Object],
  //     stripe_checkout_locale: [Object],
  //     stripe_checkout_image: [Object],
  //     stripe_checkout_label: [Object],
  //     saved_cards: [Object],
  //     'live-credentials-title': [Object],
  //     publishable_key: [Object],
  //     secret_key: [Object],
  //     client_id: [Object],
  //     'test-credentials-title': [Object],
  //     test_publishable_key: [Object],
  //     test_secret_key: [Object],
  //     test_client_id: [Object]
  //   },
  // },
  // mangopay: {
  //   id: 'dokan_mangopay',
  //   title: 'MangoPay',
  //   enabled: false,
  //   method_title: 'Dokan MangoPay',
  //   settings: {
  //     title: [Object],
  //     api_details: [Object],
  //     sandbox_mode: [Object],
  //     client_id: [Object],
  //     api_key: [Object],
  //     sandbox_client_id: [Object],
  //     sandbox_api_key: [Object],
  //     payment_options: [Object],
  //     cards: [Object],
  //     direct_pay: [Object],
  //     saved_cards: [Object],
  //     platform_fees: [Object],
  //     fund_transfers: [Object],
  //     disburse_mode: [Object],
  //     disbursement_delay_period: [Object],
  //     instant_payout: [Object],
  //     user_types: [Object],
  //     default_vendor_status: [Object],
  //     default_business_type: [Object],
  //     advanced: [Object],
  //     notice_on_vendor_dashboard: [Object],
  //     announcement_to_sellers: [Object],
  //     notice_interval: [Object]
  //   },
  // },
  //razorpay: {
  //   id: 'dokan_razorpay',
  //   title: 'Razorpay',
  //   description: null,
  //   enabled: false,
  //   method_title: 'Dokan Razorpay',
  //   settings: {
  //     title: [Object],
  //     api_details: [Object],
  //     test_mode: [Object],
  //     key_id: [Object],
  //     key_secret: [Object],
  //     test_key_id: [Object],
  //     test_key_secret: [Object],
  //     enable_route_transfer: [Object],
  //     disbursement_mode: [Object],
  //     razorpay_disbursement_delay_period: [Object],
  //     seller_pays_the_processing_fee: [Object],
  //     display_notice_on_vendor_dashboard: [Object],
  //     display_notice_to_non_connected_sellers: [Object],
  //     display_notice_interval: [Object]
  //   },
  // },
  //stripteExpress {
  //   id: 'dokan_stripe_express',
  //   title: 'Credit/Debit Card',
  //   enabled: false,
  //   settings: {
  //     title: [Object],
  //     api_details: [Object],
  //     testmode: [Object],
  //     publishable_key: [Object],
  //     secret_key: [Object],
  //     test_publishable_key: [Object],
  //     test_secret_key: [Object],
  //     webhook: [Object],
  //     webhook_key: [Object],
  //     test_webhook_key: [Object],
  //     payment_options: [Object],
  //     enabled_payment_methods: [Object],
  //     sellers_pay_processing_fee: [Object],
  //     saved_cards: [Object],
  //     capture: [Object],
  //     disburse_mode: [Object],
  //     disbursement_delay_period: [Object],
  //     statement_descriptor: [Object],
  //     appearance: [Object],
  //     element_theme: [Object],
  //     payment_request_options: [Object],
  //     payment_request: [Object],
  //     payment_request_button_type: [Object],
  //     payment_request_button_theme: [Object],
  //     payment_request_button_locations: [Object],
  //     payment_request_button_size: [Object],
  //     advanced: [Object],
  //     notice_on_vendor_dashboard: [Object],
  //     announcement_to_sellers: [Object],
  //     notice_interval: [Object],
  //     debug: [Object]
  //   },
  // }


  createCustomer: () => {
    return {
      email: faker.internet.email(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      role: 'customer',
      username: faker.name.firstName() + faker.datatype.uuid(),
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
        phone: '0123456789'
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
        phone: '0123456789'
      }
    }
  },
  updateCustomer: () => {
    return {
      email: faker.internet.email(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
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
        phone: '0123456789'
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
        phone: '0123456789'
      }
    }
  },

  updateBatchCustomersTemplate: () => {
    return {
      id: '',
      billing: {
        phone: '0123456789'
      },
    }
  },

  updateBatchAttributesTemplate: () => {
    return {
      id: '',
      description: 'updated description (batch req)'
    }
  },

  updateBatchAttributeTermsTemplate: () => {
    return {
      id: '',
      order_by: 'menu_order'
    }
  },

  updateWholesaleCustomer: {
    status: "activate"  // activate, deacticate, delete
  },

  deleteWholesaleCustomer: {
    status: "delete"
  },

  createSupportTicketComment: {
    replay: "sp replay...1",
    vendor_id: "1",
    selected_user: "vendor"
  },

  updateSuppotTicketStatus: {
    status: "close"
  },

  updateSuppotTicketEmailNotification: {
    notification: true
  },

  updateBatchSuppotTickets: {
    close: [247, 248]
  },

  deactivateModule: {
    module: ["booking"]
  },

  activateModule: {
    module: ["booking"]
  },

  createAnnouncemnt: {
    title: "test announcement title",
    content: "<p>This is announcement content</p>",
    status: "publish",
    sender_type: "all_seller"
  },

  updateAnnouncement: {
    title: "updated test announcement title",
    content: "<p>updated This is announcement content</p>",
    status: "publish",
    sender_type: "all_seller"
  },

  updateProductReview: {
    status: "approved"
  },

  updateStoreReview: {
    title: "Updated Test review title",
    content: "Updated Test review content",
    status: "publish"
  },

  createStoreCategory: () => { return { name: 'Test_Store_Category' + faker.datatype.uuid() } },
  updateStoreCategory: () => { return { name: 'Update_Test_Store_Category' + faker.datatype.uuid() } },


  dummydata: {
    vendor_products: [
      {
        name: 'p1_d1',
        type: 'simple',
        status: 'publish',
        regular_price: '10'
      },
      {
        name: 'p2_d1',
        type: 'simple',
        status: 'publish',
        regular_price: '20'
      }
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
      enabled: true,
      trusted: true
    }
  },

  createStore: () => {
    return {
      user_login: faker.name.firstName() + faker.datatype.uuid(),
      user_pass: "01dokan01",
      role: "seller",
      email: faker.internet.email(),
      store_name: faker.name.firstName() + '_store',
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      social: {
        fb: "http://dokan.test",
        youtube: "http://dokan.test",
        twitter: "http://dokan.test",
        linkedin: "http://dokan.test",
        pinterest: "http://dokan.test",
        instagram: "http://dokan.test",
        flickr: "http://dokan.test"
      },
      phone: "0123456789",
      show_email: false,
      address: {
        street_1: "abc street",
        street_2: "xyz street",
        city: "New York",
        zip: "10003",
        state: "NY",
        country: "US"
      },
      location: "",
      banner: "",
      banner_id: 0,
      gravatar: "",
      gravatar_id: 0,
      shop_url: "",
      products_per_page: 12,
      show_more_product_tab: true,
      toc_enabled: false,
      store_toc: "",
      featured: true,
      rating: {
        rating: "0.00",
        count: 1
      },
      enabled: true,
      registered: "",
      payment: {
        paypal: {
          0: "email",
          email: "paypal@g.c"
        },
        bank: {
          ac_name: "account name",
          ac_type: "personal",
          ac_number: "1234567",
          bank_name: "bank name",
          bank_addr: "bank address",
          routing_number: "123456",
          iban: "123456",
          swift: "12345"
        },
        stripe: false
      },
      trusted: true,
      store_open_close: {
        enabled: false,
        time: [],
        open_notice: "Store is open",
        close_notice: "Store is closed"
      },
      company_name: "",
      vat_number: "",
      company_id_number: "",
      bank_name: "",
      bank_iban: "",
      categories: [
        {
          id: 74,
          name: "Uncategorized",
          slug: "uncategorized"
        }
      ],
      admin_commission: "",
      admin_additional_fee: "0.00",
      admin_commission_type: "flat"
    }
  },

  updateStore: () => {
    return {
      // email: faker.internet.email(),
      // store_name: faker.name.firstName(),
      // first_name: faker.name.firstName(),
      // last_name: faker.name.lastName(),
      social: {
        fb: "http://dokan.test",
        youtube: "http://dokan.test",
        twitter: "http://dokan.test",
        linkedin: "http://dokan.test",
        pinterest: "http://dokan.test",
        instagram: "http://dokan.test",
        flickr: "http://dokan.test"
      },
      phone: "0123456789",
      show_email: false,
      address: {
        street_1: "abc street",
        street_2: "xyz street",
        city: "New York",
        zip: "10003",
        state: "NY",
        country: "US"
      },
      location: "",
      banner: "",
      banner_id: 0,
      gravatar: "",
      gravatar_id: 0,
      shop_url: "",
      products_per_page: 12,
      show_more_product_tab: true,
      toc_enabled: false,
      store_toc: "",
      featured: true,
      rating: {
        rating: "0.00",
        count: 1
      },
      trusted: true,
      enabled: true,
      registered: "",
      payment: {
        paypal: {
          0: "email",
          email: "paypal@g.c"
        },
        bank: {
          ac_name: "account name",
          ac_type: "personal",
          ac_number: "1234567",
          bank_name: "bank name",
          bank_addr: "bank address",
          routing_number: "123456",
          iban: "123456",
          swift: "12345"
        },
        stripe: false
      },
      store_open_close: {
        enabled: false,
        time: [],
        open_notice: "Store is open",
        close_notice: "Store is closed"
      },
      company_name: "",
      vat_number: "",
      company_id_number: "",
      bank_name: "",
      bank_iban: "",
      categories: [
        {
        }
      ],
      admin_commission: "",
      admin_additional_fee: "0.00",
      admin_commission_type: "flat"
    }
  },

  createStoreReview: {
    title: "Test store review",
    content: "Test store review contant",
    rating: 2,
    // approved: true
  },

  updateStoreStatus: {
    status: "active"
  },

  adminContactStore: {
    "name": "admin",
    "email": "admin@g.c",
    "message": "Test admin connect with vendor message"
  },

  adminEnailStore: {
    "subject": "Test email sub",
    "body": "Test email body"
  },

  createStore1: {
    user_login: process.env.VENDOR,
    user_pass: process.env.VENDOR_PASSWORD,
    role: "seller",
    email: process.env.VENDOR + '@yopmail.com',
    store_name: process.env.VENDOR + 'store',
    first_name: process.env.VENDOR,
    last_name: 'ven',
    social: {
      fb: "http://dokan.test",
      youtube: "http://dokan.test",
      twitter: "http://dokan.test",
      linkedin: "http://dokan.test",
      pinterest: "http://dokan.test",
      instagram: "http://dokan.test",
      flickr: "http://dokan.test"
    },
    phone: "0123456789",
    show_email: false,
    address: {
      street_1: "abc street",
      street_2: "xyz street",
      city: "New York",
      zip: "10003",
      state: "NY",
      country: "US"
    },
    location: '40.7127753,-74.0059728',
    banner: "",
    banner_id: 0,
    gravatar: "",
    gravatar_id: 0,
    shop_url: "",
    products_per_page: 12,
    show_more_product_tab: true,
    toc_enabled: false,
    store_toc: "",
    featured: true,
    rating: {
      rating: "0.00",
      count: 1
    },
    enabled: true,
    registered: "",
    payment: {
      paypal: {
        0: "email",
        email: "paypal@g.c"
      },
      bank: {
        ac_name: "account name",
        ac_type: "personal",
        ac_number: "1234567",
        bank_name: "bank name",
        bank_addr: "bank address",
        routing_number: "123456",
        iban: "123456",
        swift: "12345"
      },
      stripe: false
    },
    trusted: true,
    store_open_close: {
      enabled: false,
      time: [],
      open_notice: "Store is open",
      close_notice: "Store is closed"
    },
    company_name: "",
    vat_number: "",
    company_id_number: "",
    bank_name: "",
    bank_iban: "",
    categories: [
      {
        // id: 74,
        // name: "Uncategorized",
        // slug: "uncategorized"
      }
    ],
    admin_commission: "",
    admin_additional_fee: "",
    admin_commission_type: ""
  },

  createCustomer1: {
    email: process.env.CUSTOMER + '@yopmail.com',
    first_name: 'customer1',
    last_name: 'c1',
    role: 'customer',
    username: process.env.CUSTOMER,
    password: process.env.CUSTOMER_PASSWORD,
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
      phone: '0123456789'
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
      phone: '0123456789'
    },
  },

  createQuoteRule: () => {
    return {
      rule_name: "QR_" + faker.random.alphaNumeric(5),
      selected_user_role: ["customer"],
      category_ids: [],
      product_ids: [],
      hide_price: "1",
      hide_price_text: "Price is hidden",
      hide_cart_button: "replace",
      button_text: "Add to quote",
      apply_on_all_product: "1",
      rule_priority: "0",
      status: "publish"
    }
  },

  updateQuoteRule: {
    rule_name: "updated_QR_" + faker.random.alphaNumeric(5),
    selected_user_role: ["customer"],
    hide_price: "0",
    hide_price_text: "Price is covered",
    hide_cart_button: "keep_and_add_new",
    button_text: " To quote",
    apply_on_all_product: "1",

  },

  createRequestQuote: () => {
    return {
      quote_title: "QT_" + faker.random.alphaNumeric(5),
      customer_info: {
        name_field: 'customer1',
        email_field: 'customer1@yopmail.com',
        company_field: 'c1',
        phone_field: '0987654321',
      },
      product_ids: [''],
      offer_price: ['50'],
      offer_product_quantity: ['10'],
    }
  },

  updateRequestQuote: {
    quote_title: "updated_QT_" + faker.random.alphaNumeric(5),
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

  convetToOrder: {
    quote_id: "10",
    status: "converted"
  },






}














// {
//   id: 'flat_rate',
//   title: 'Flat rate',
//   description: 'Lets you charge a fixed rate for shipping.',
//   _links: { self: [Array], collection: [Array] }
// },
// {
//   id: 'free_shipping',
//   title: 'Free shipping',
//   description: 'Free shipping is a special method which can be triggered with coupons and minimum spends.',
//   _links: { self: [Array], collection: [Array] }
// },
// {
//   id: 'local_pickup',
//   title: 'Local pickup',
//   description: 'Allow customers to pick up orders themselves. By default, when using local pickup store base taxes will apply regardless of customer address.',
//   _links: { self: [Array], collection: [Array] }
// },
// {
//   id: 'dokan_table_rate_shipping',
//   title: 'Vendor Table Rate Shipping',
//   description: 'Charge varying rates based on user defined conditions',
//   _links: { self: [Array], collection: [Array] }
// },
// {
//   id: 'dokan_distance_rate_shipping',
//   title: 'Vendor Distance Rate Shipping',
//   description: 'Charge varying rates based on user defined conditions',
//   _links: { self: [Array], collection: [Array] }
// },
// {
//   id: 'dokan_product_shipping',
//   title: 'Dokan Shipping',
//   description: 'Enable vendors to set shipping cost per product and per country',
//   _links: { self: [Array], collection: [Array] }
// },
// {
//   id: 'dokan_vendor_shipping',
//   title: 'Vendor Shipping',
//   description: 'Charge varying rates based on user defined conditions',
//   _links: { self: [Array], collection: [Array] }
// }
// ]