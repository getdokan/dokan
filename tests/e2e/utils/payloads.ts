


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
    name: 'l',
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

  }











}