

// const SERVER_URL = process.env.BASE_URL
// const SERVER_URL = process.env.SERVER_URL
const SERVER_URL = 'http://dokan1.test'
let storeId: String = ''
let vendorId: String = ''

export const endPoints = {


    // Stores
    getAllStores: `${SERVER_URL}/wp-json/dokan/v1/stores`,
    getSingleStoreInfo: (seller_id: string) => `${SERVER_URL}/wp-json/dokan/v1/stores/${seller_id}`,
    getSingleStoreProducts: (seller_id: string) => `${SERVER_URL}/wp-json/dokan/v1/stores/${seller_id}/products`,
    getSingleStoreReviews: (seller_id: string) => `${SERVER_URL}/wp-json/dokan/v1/stores/${seller_id}/reviews`,

    // getAllStoresWithPagination: `${SERVER_URL}/wp-json/dokan/v1/stores?page=1&per_page=100`, //TODO:
    // getFeaturedVendors: `${SERVER_URL}/wp-json/dokan/v1/stores?featured=yes`, //TODO:
    // postStoreContact: `${SERVER_URL}/wp-json/dokan/v1/stores?featured=yes`, //TODO:

    // Products
    getAllProducts: `${SERVER_URL}/wp-json/dokan/v1/products/`,
    getSingleProduct: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}`,
    // getProducts: `${SERVER_URL}/wp-json/dokan/v1/stores?featured=yes`, //TODO: it's for get featured stores

    // getProductsWithPagination: `${SERVER_URL}/wp-json/dokan/v1/products?page=1&per_page=100`,//TODO: 
    getProductsSummary: `${SERVER_URL}/wp-json/dokan/v1/products/summary`,
    // getTopRatedProducts: `${SERVER_URL}/wp-json/dokan/v1/products/top_rated`,//TODO: 
    // getBestSellingProducts: `${SERVER_URL}/wp-json/dokan/v1/products/best_selling`,//TODO: 
    // getLatestProducts: `${SERVER_URL}/wp-json/dokan/v1/products/latest?number=10`,//TODO: 
    // getRelatedProducts: `${SERVER_URL}/wp-json/dokan/v1/products/latest?number=10`,//TODO: 
    // getFeaturedProducts: `${SERVER_URL}/wp-json/dokan/v1/products/featured`,//TODO: 
    postCreateProduct: `${SERVER_URL}/wp-json/dokan/v1/products/`,
    putUpdateProduct: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}`,
    delDeleteProduct: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}`,

    // Product Variations
    getAllProductVariations: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations`,
    getSingleProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations/${variationId}`,
    postCreateProductVariation: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations`,
    putUpdateProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations/${variationId}`,
    delDeleteProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations/${variationId}`,

    // Filter products
    getFilterParam: `${SERVER_URL}/wp-json/dokan/v1/products/best-selling/filter-types`,
    postFilterProduct: `${SERVER_URL}/wp-json/dokan/v1/products/best-selling/filter`,

    // Variation
    getProductVariations: `${SERVER_URL}/wp-json/dokan/v1/products/573/variations`,
    getProductSingleVariations: `${SERVER_URL}/wp-json/dokan/v1/products/573/variations/575`,
    putUpdateProductSingleVariations: `${SERVER_URL}/wp-json/dokan/v1/products/573/variations/575`,
    postCreateProductSingleVariations: `${SERVER_URL}/wp-json/dokan/v1/products/573/variations/575`,
    delDeleteProductSingleVariations: `${SERVER_URL}/wp-json/dokan/v1/products/573/variations/575`,

    // Orders
    getAllOrders: `${SERVER_URL}/wp-json/dokan/v1/orders/`,
    // getAllOrdersWithPagination: `${SERVER_URL}/wp-json/dokan/v1/orders/?per_page=2&page=2`, //TODO:
    getOrdersSummary: `${SERVER_URL}/wp-json/dokan/v1/orders/summary`,
    getNotesForSingleOrder: `${SERVER_URL}/wp-json/dokan/v1/orders/223/notes/`,
    getSingleNotesForSingleOrder: `${SERVER_URL}/wp-json/dokan/v1/orders/223/notes/115`,
    getSingleOrder: (orderId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}`,
    getMyOrdersCustomer: `${SERVER_URL}`,
    postCreateNoteForSingleOrder: `${SERVER_URL}/wp-json/dokan/v1/orders/474/notes`,
    putUpdateOrder: (orderId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}`,
    putUpdateOrderStatus: `${SERVER_URL}/wp-json/dokan/v1/orders/578/?status=wc-pending`,
    delDeleteSingleNotesForSingleOrder: `${SERVER_URL}/wp-json/dokan/v1/orders/223/notes/115`,

    // Withdraw
    getAllWithdraws: `${SERVER_URL}/wp-json/dokan/v1/withdraw/`,
    getAllWithdrawsbyStatus: (status: String) => `${SERVER_URL}/wp-json/dokan/v1/withdraw/?status=${status}`,
    getGetBalanceDetails: `${SERVER_URL}/wp-json/dokan/v1/withdraw/balance`,
    postCreateWithdraw: `${SERVER_URL}/wp-json/dokan/v1/withdraw/`,
    putCancelAWithdraw: (withdrawId: String) => `${SERVER_URL}/wp-json/dokan/v1/withdraw/${withdrawId}`,

    // Coupons
    getGetAllCoupons: `${SERVER_URL}/wp-json/dokan/v1/coupons/`,
    getGetSingleCoupon: (couponId: String) => `${SERVER_URL}/wp-json/dokan/v1/coupons/${couponId}`,
    postCreateCoupon: `${SERVER_URL}/wp-json/dokan/v1/coupons/?code=REST`,
    putUpdateCoupon: (couponId: String) => `${SERVER_URL}/wp-json/dokan/v1/coupons/${couponId}`,
    delDeleteCoupon: (couponId: String) => `${SERVER_URL}/wp-json/dokan/v1/coupons/${couponId}`,


    // Reviews
    getGetAllReviews: `${SERVER_URL}/wp-json/dokan/v1/reviews/`,
    getGetReviewSummary: `${SERVER_URL}/wp-json/dokan/v1/reviews/summary`,

    // putupdateAReview: `${SERVER_URL}/wp-json/dokan/v1/reviews/`,  //TODO:

    // Settings
    getGetSettings: `${SERVER_URL}/wp-json/dokan/v1/settings`,
    putUpdateSettings: `${SERVER_URL}/wp-json/dokan/v1/settings`,

    // Reports
    getReportSummary: `${SERVER_URL}/wp-json/dokan/v1/reports/summary`,
    getReportsOverview: `${SERVER_URL}/wp-json/dokan/v1/reports/sales_overview`,
    getReportsTopEarners: `${SERVER_URL}/wp-json/dokan/v1/reports/top_earners`,
    getReportsTopSellingProducts: `${SERVER_URL}/wp-json/dokan/v1/reports/top_selling`,

    // getReportsDashboard: (vendorId: String) => `${SERVER_URL}/wp-json/dokan/v1/${vendorId}/reports`, //TODO:
    // getReportsDashboardOverview: (vendorId: String) => `${SERVER_URL}/wp-json/dokan/v1/${vendorId}/reports?type=dashboard_overview`,//TODO:
    // getReportsDashboardOrders: (vendorId: String) => `${SERVER_URL}/wp-json/dokan/v1/${vendorId}/reports?type=dashboard_orders`,//TODO:
    // getReportsDashboardProducts: (vendorId: String) => `${SERVER_URL}/wp-json/dokan/v1/${vendorId}/reports?type=dashboard_orders`,//TODO:
    // getReportsDashboardReviews: (vendorId: String) => `${SERVER_URL}/wp-json/dokan/v1/${vendorId}/reports?type=dashboard_reviews`,//TODO:

    // Attributes
    getGetAllProductAttributes: `${SERVER_URL}/wp-json/dokan/v1/products/attributes`,
    getGetSingleAttribute: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/1`,
    postCreateANewAttribute: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/`,
    putUpdateAnAttribute: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/2`,
    delDeleteAnAttribute: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/2`,

    // Attribute Terms
    getGetAllTermsInAttribute: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/1/terms`,
    getGetSingleTermsInAttribute: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/1/terms/25`,
    postCreateANewTermForanAttribute: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/1/terms`,
    putUpdateTermForAnAttribute: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/1/terms/95`,
    delDeleteTermForAnAttribute: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/1/terms/95`,

    // Refund
    getGetAllRefund: `${SERVER_URL}/wp-json/dokan/v1/refund/`,
    getGetAllRefundDependingOnStatus: `${SERVER_URL}/wp-json/dokan/v1/refund/?status=pending`,
    postMakeARefundRequest: `${SERVER_URL}/wp-json/dokan/v1/refund/`,
    putChangeStatusOfARefundRequest: `${SERVER_URL}/wp-json/dokan/v1/refund/5`,
    putchangeBulkStatusOfRefundRequests: `${SERVER_URL}/wp-json/dokan/v1/refund/5`,
    delDeleteARefundRequest: `${SERVER_URL}/wp-json/dokan/v1/refund/4`,

    // User
    postUserRegitration: `${SERVER_URL}/wp-json/dokan/v1/user/register`,
    postPasswordRecovery: `${SERVER_URL}/wp-json/dokan/v1/user/lostpassword`,

    // Cart
    getGetCartItems: `${SERVER_URL}/wp-json/dokan/v1/cart/items`,
    postPostCartProduct: `${SERVER_URL}/wp-json/dokan/v1/cart/items`,
    postPostBatchCartItem: `${SERVER_URL}/wp-json/dokan/v1/cart/items/batch`,
    delDeleteCart: `${SERVER_URL}`,
    delDeleteSingleProduct: `${SERVER_URL}`,
    putRestoreCart: `${SERVER_URL}/wp-json/dokan/v1/cart/items/{key}/restore`,
    getGetCartShipping: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/`,
    postAddCouponsToCart: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/`,
    getCartCoupons: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/`,
    delDeleteCartCoupon: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/212`,

    // Modules

}