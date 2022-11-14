


export const payloads = {

  createProduct: {
    name: 'p1_v3',
    type: 'simple',
    regular_price: '150',
    categories: [
      {
        id: 48
      }
    ],
  },

  creatrProductvariation: {
    // id: '47',
    regular_price: '16.00',
    categories: [{ id: 48 }],
    attributes: [{
      id: 18,
      // name: 'size',
      option: 'l'
    }],
  },

  updateProduct: {
    regular_price: '300'
  },

  updateProductVariation: {
    regular_price: '220'
  },
  createCoupon: {
    code: 'c1_v0',
    amount: '10',
    discount_type: 'percent',
    product_ids: [15],
  },

  updateCoupon: {
    amount: '25'
  },


  updateOrder: {
    status: 'pending'

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
      street_1: 'abc street',
      street_2: 'xyz street',
      city: 'New York',
      zip: '10006',
      state: 'NY',
      country: 'US'
    },
    location: '',
    banner: 0,
    icon: '',
    gravatar: 0,
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

  createAttribute:{
    name: "color",
    slug: "pa_color",
    type: "select",
    order_by: "menu_order",
    has_archives: false
  },

  updateAttribute:{
    name: "color1",
    slug: "pa_color1",
    type: "select",
    order_by: "menu_order",
    has_archives: false

  },

  createAttributeTerm:{
    name: "xl",
  },

  updateAttributeTerm:{
    name: "xxl",

  },









}