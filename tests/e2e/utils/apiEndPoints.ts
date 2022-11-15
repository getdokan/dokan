require('dotenv').config();

// const SERVER_URL = process.env.BASE_URL
// const SERVER_URL = process.env.SERVER_URL
const SERVER_URL = 'http://dokan1.test'


export const endPoints = {

    // stores
    getAllStores: `${SERVER_URL}/wp-json/dokan/v1/stores`,
    getSingleStoreInfo: (seller_id: string) => `${SERVER_URL}/wp-json/dokan/v1/stores/${seller_id}`,
    getSingleStoreProducts: (seller_id: string) => `${SERVER_URL}/wp-json/dokan/v1/stores/${seller_id}/products`,
    getSingleStoreReviews: (seller_id: string) => `${SERVER_URL}/wp-json/dokan/v1/stores/${seller_id}/reviews`,
    getAllStoresWithPagination: (perPage: String, pageNo: String) => `${SERVER_URL}/wp-json/dokan/v1/stores/?per_page=${perPage}&page=${pageNo}`,
    getFeaturedStores: `${SERVER_URL}/wp-json/dokan/v1/stores?featured=yes`,

    // products
    getAllProducts: `${SERVER_URL}/wp-json/dokan/v1/products/`,
    getSingleProduct: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}`,
    getProductsWithPagination: (perPage: String, pageNo: String) => `${SERVER_URL}/wp-json/dokan/v1/products/?per_page=${perPage}&page=${pageNo}`,
    getProductsSummary: `${SERVER_URL}/wp-json/dokan/v1/products/summary`,
    getTopRatedProducts: `${SERVER_URL}/wp-json/dokan/v1/products/top_rated`,
    getBestSellingProducts: `${SERVER_URL}/wp-json/dokan/v1/products/best_selling`, 
    getLatestProducts: `${SERVER_URL}/wp-json/dokan/v1/products/latest`, 
    getFeaturedProducts: `${SERVER_URL}/wp-json/dokan/v1/products/featured`, 
    postCreateProduct: `${SERVER_URL}/wp-json/dokan/v1/products/`,
    putUpdateProduct: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}`,
    delDeleteProduct: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}`,

    // product variations
    getAllProductVariations: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations`,
    getSingleProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations/${variationId}`,
    postCreateProductVariation: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations`,
    putUpdateProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations/${variationId}`,
    delDeleteProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations/${variationId}`,

    // orders
    getAllOrders: `${SERVER_URL}/wp-json/dokan/v1/orders/`,
    getAllOrdersWithPagination: (perPage: String, pageNo: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/?per_page=${perPage}&page=${pageNo}`,
    getOrdersSummary: `${SERVER_URL}/wp-json/dokan/v1/orders/summary`,
    getSingleOrder: (orderId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}`,
    getOrdersBeforAfter: (before: String, after: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/?after=${after}&before=${before}`,
    putUpdateOrder: (orderId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}`,

    // order notes
    getAllOrderNotes: (orderId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}/notes/`,
    getSingleOrderNote: (orderId: String, noteId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}/notes/${noteId}`,
    postCreateOrderNote: (orderId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}/notes`,
    delDeleteOrderNote: (orderId: String, noteId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}/notes/${noteId}`,

    // withdraw
    getAllWithdraws: `${SERVER_URL}/wp-json/dokan/v1/withdraw/`,
    getAllWithdrawsbyStatus: (status: String) => `${SERVER_URL}/wp-json/dokan/v1/withdraw/?status=${status}`,
    getGetBalanceDetails: `${SERVER_URL}/wp-json/dokan/v1/withdraw/balance`,
    postCreateWithdraw: `${SERVER_URL}/wp-json/dokan/v1/withdraw/`,
    putCancelAWithdraw: (withdrawId: String) => `${SERVER_URL}/wp-json/dokan/v1/withdraw/${withdrawId}`,

    // coupons
    getGetAllCoupons: `${SERVER_URL}/wp-json/dokan/v1/coupons/`,
    getGetSingleCoupon: (couponId: String) => `${SERVER_URL}/wp-json/dokan/v1/coupons/${couponId}`,
    postCreateCoupon: `${SERVER_URL}/wp-json/dokan/v1/coupons/?code=REST`,
    putUpdateCoupon: (couponId: String) => `${SERVER_URL}/wp-json/dokan/v1/coupons/${couponId}`,
    delDeleteCoupon: (couponId: String) => `${SERVER_URL}/wp-json/dokan/v1/coupons/${couponId}`,


    // reviews
    getGetAllReviews: `${SERVER_URL}/wp-json/dokan/v1/reviews/`,
    getGetReviewSummary: `${SERVER_URL}/wp-json/dokan/v1/reviews/summary`,

    // settings
    getGetSettings: `${SERVER_URL}/wp-json/dokan/v1/settings`,
    putUpdateSettings: `${SERVER_URL}/wp-json/dokan/v1/settings`,

    // reports
    getReportSummary: `${SERVER_URL}/wp-json/dokan/v1/reports/summary`,
    getReportsOverview: `${SERVER_URL}/wp-json/dokan/v1/reports/sales_overview`,
    getReportsTopEarners: (date: String) => `${SERVER_URL}/wp-json/dokan/v1/reports/top_earners?start_date=${date}`,
    getReportsTopSellingProducts: (date: String) => `${SERVER_URL}/wp-json/dokan/v1/reports/top_selling?start_date=${date}`,

    // attributes
    getGetAllAttributes: `${SERVER_URL}/wp-json/dokan/v1/products/attributes`,
    getGetSingleAttribute: (attributeId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}`,
    postCreateAttribute: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/`,
    putUpdateAttribute: (attributeId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}`,
    delDeleteAttribute: (attributeId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}`,

    // attribute terms
    getGetAllAttributeTerms: (attributeId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}/terms`,
    getGetSingleAttributeTerm: (attributeId: String, attributeTermId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`,
    postCreateAttributeTerm: (attributeId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}/terms`,
    putUpdateAttributeTerm: (attributeId: String, attributeTermId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`,
    delDeleteAttributeTerm: (attributeId: String, attributeTermId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`,

    // refund
    getGetAllRefund: `${SERVER_URL}/wp-json/dokan/v1/refund/`, //TODO:
    getGetAllRefundDependingOnStatus: `${SERVER_URL}/wp-json/dokan/v1/refund/?status=pending`, //TODO:
    postMakeARefundRequest: `${SERVER_URL}/wp-json/dokan/v1/refund/`, //TODO:
    putChangeStatusOfARefundRequest: `${SERVER_URL}/wp-json/dokan/v1/refund/5`, //TODO:
    putchangeBulkStatusOfRefundRequests: `${SERVER_URL}/wp-json/dokan/v1/refund/5`, //TODO:
    delDeleteARefundRequest: `${SERVER_URL}/wp-json/dokan/v1/refund/4`, //TODO:

    // user
    postUserRegitration: `${SERVER_URL}/wp-json/dokan/v1/user/register`, //TODO:
    postPasswordRecovery: `${SERVER_URL}/wp-json/dokan/v1/user/lostpassword`, //TODO:

    // cart
    getGetCartItems: `${SERVER_URL}/wp-json/dokan/v1/cart/items`, //TODO:
    postPostCartProduct: `${SERVER_URL}/wp-json/dokan/v1/cart/items`, //TODO:
    postPostBatchCartItem: `${SERVER_URL}/wp-json/dokan/v1/cart/items/batch`, //TODO:
    delDeleteCart: `${SERVER_URL}`, //TODO:
    delDeleteSingleProduct: `${SERVER_URL}`, //TODO:
    putRestoreCart: `${SERVER_URL}/wp-json/dokan/v1/cart/items/{key}/restore`, //TODO:
    getGetCartShipping: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/`, //TODO:
    postAddCouponsToCart: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/`, //TODO:
    getCartCoupons: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/`, //TODO:
    delDeleteCartCoupon: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/212`, //TODO:
}