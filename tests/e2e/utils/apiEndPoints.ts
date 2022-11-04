

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

    getAllStoresWithPagination: `${SERVER_URL}/wp-json/dokan/v1/stores?page=1&per_page=100`, //TODO:
    getFeaturedVendors: `${SERVER_URL}/wp-json/dokan/v1/stores?featured=yes`, //TODO:
    postStoreContact: `${SERVER_URL}/wp-json/dokan/v1/stores?featured=yes`, //TODO:

    // Products
    getAllProducts: `${SERVER_URL}/wp-json/dokan/v1/products/`,
    getSingleProduct: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}`,
    getProducts: `${SERVER_URL}/wp-json/dokan/v1/stores?featured=yes`, //TODO: it's for get featured stores

    getProductsWithPagination: `${SERVER_URL}/wp-json/dokan/v1/products?page=1&per_page=100`,//TODO: 
    getProductsSummary: `${SERVER_URL}/wp-json/dokan/v1/products/summary`,
    getTopRatedProducts: `${SERVER_URL}/wp-json/dokan/v1/products/top_rated`,//TODO: 
    getBestSellingProducts: `${SERVER_URL}/wp-json/dokan/v1/products/best_selling`,//TODO: 
    getLatestProducts: `${SERVER_URL}/wp-json/dokan/v1/products/latest?number=10`,//TODO: 
    getRelatedProducts: `${SERVER_URL}/wp-json/dokan/v1/products/latest?number=10`,//TODO: 
    getFeaturedProducts: `${SERVER_URL}/wp-json/dokan/v1/products/featured`,//TODO: 
    postCreateProduct: `${SERVER_URL}/wp-json/dokan/v1/products/`,
    putUpdateProduct: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}`,
    delDeleteProduct: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}`,

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
    getAllOrdersWithPagination: `${SERVER_URL}/wp-json/dokan/v1/orders/?per_page=2&page=2`,
    getNotesForSingleOrder: `${SERVER_URL}/wp-json/dokan/v1/orders/223/notes/`,
    getSingleNotesForSingleOrder: `${SERVER_URL}/wp-json/dokan/v1/orders/223/notes/115`,
    getSingleOrder: `${SERVER_URL}/wp-json/dokan/v1/orders/223/notes/115`,
    getOrdersSummaryReport: `${SERVER_URL}/wp-json/dokan/v1/orders/summary`,
    getMyOrdersCustomer: `${SERVER_URL}`,
    postCreateNoteForSingleOrder: `${SERVER_URL}/wp-json/dokan/v1/orders/474/notes`,
    putUpdateOrderStatus: `${SERVER_URL}/wp-json/dokan/v1/orders/578/?status=wc-pending`,
    delDeleteSingleNotesForSingleOrder: `${SERVER_URL}/wp-json/dokan/v1/orders/223/notes/115`,

    // Withdraw
    getAllWithdraws: `${SERVER_URL}/wp-json/dokan/v1/withdraw/`,
    getAllWithdrawsDependingOnStatus: `${SERVER_URL}/wp-json/dokan/v1/withdraw/?status=pending`,
    getGetTotalBalanceWithWithdrawLimitAndThreshold: `${SERVER_URL}/wp-json/dokan/v1/withdraw/balance`,
    postMakeAWithdrawRequest: `${SERVER_URL}/wp-json/dokan/v1/withdraw/?status=pending`,
    putCancelAWithdrawRequest: `${SERVER_URL}/wp-json/dokan/v1/withdraw/?status=pending`,

    // Coupons
    getGetAllCoupons: `${SERVER_URL}/wp-json/dokan/v1/coupons/`,
    getGetASingleCoupons: `${SERVER_URL}/wp-json/dokan/v1/coupons/586`,
    postCreateACoupons: `${SERVER_URL}/wp-json/dokan/v1/coupons/?code=REST`,
    putUpdateACoupon: `${SERVER_URL}/wp-json/dokan/v1/coupons/313`,


    // Reviews
    getGetAllReviews: `${SERVER_URL}/wp-json/dokan/v1/reviews/`,
    getGetReviewSummary: `${SERVER_URL}/wp-json/dokan/v1/reviews/summary`,

    putupdateAReview: `${SERVER_URL}/wp-json/dokan/v1/reviews/`,  //TODO:

    // Settings
    getGetSettings: `${SERVER_URL}/wp-json/dokan/v1/settings`,
    putUpdateSettings: `${SERVER_URL}/wp-json/dokan/v1/settings`,

    // Reports
    getReportSummary: `${SERVER_URL}/wp-json/dokan/v1/settings`,
    getReportsOverview: `${SERVER_URL}/wp-json/dokan/v1/reports/sales_overview`,
    getReportsTopEarners: `${SERVER_URL}/wp-json/dokan/v1/reports/top_earners`,
    getReportsTopSellingProducts: `${SERVER_URL}/wp-json/dokan/v1/reports/top_selling`,
    getReportsDashboard: `${SERVER_URL}/wp-json/dokan/v1/${vendorId}/reports?type=dashboard`,
    getReportsDashboardOverview: `${SERVER_URL}/wp-json/dokan/v1/${vendorId}/reports?type=dashboard_overview`,
    getReportsDashboardOrders: `${SERVER_URL}/wp-json/dokan/v1/${vendorId}/reports?type=dashboard_orders`,
    getReportsDashboardProducts: `${SERVER_URL}/wp-json/dokan/v1/${vendorId}/reports?type=dashboard_orders`,
    getReportsDashboardReviews: `${SERVER_URL}/wp-json/dokan/v1/${vendorId}/reports?type=dashboard_reviews`,

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