import { faker } from '@faker-js/faker'
import { data } from './testData'


export const payloads = {

  createProduct: () => {
    return {
      name: faker.commerce.productName() + (' (Simple)'),
      type: data.product.type.simple,
      regular_price: faker.finance.amount(100, 200, faker.helpers.arrayElement([0, 2])),
      categories: [
        {
          id: 48
        }
      ],
    }
  },

  createProductVariation: {
    // id: '47',
    regular_price: data.product.price.price_random(),
    categories: [{ id: 48 }],
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

  createWithdraw: {
    amount: "12",
    notes: "Withdraw notes",
    method: "paypal"
  },

  updateSettings: {
    store_name: 'vendorstore1',
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
        ac_name: '',
        ac_type: '',
        ac_number: '',
        bank_name: '',
        bank_addr: '',
        routing_number: '',
        iban: '',
        swift: ''
      },
      paypal: { email: '' }
    },
    phone: '1234',
    show_email: 'no',
    address: {
      street_1: 'bcd street',
      street_2: 'xyz street',
      city: 'New York',
      zip: '10003',
      state: 'NY',
      country: 'US'
      // country: 'AF'
    },
    location: '',
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
    dokan_store_open_notice: '',
    dokan_store_close_notice: '',
    dokan_store_time: [],
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
    setting_order_percentage: ''
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



  createUser: {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    roles: '',
    password: '',
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

  account:
  {
    // id: 'woocommerce_registration_generate_password',
    // description: 'When creating an account, send the new user a link to set their password',
    value: 'no',
    // value: 'yes',
  },



  createCustomer: {
    email: 'customer1@yopmail.com',
    first_name: 'customer1',
    last_name: 'c1',
    role: 'customer',
    username: 'customer1',
    password: 'password',
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
    },
  }
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