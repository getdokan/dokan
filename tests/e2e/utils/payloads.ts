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
  }




}