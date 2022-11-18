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
    createProduct: `${SERVER_URL}/wp-json/dokan/v1/products/`,
    updateProduct: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}`,
    deleteProduct: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}`,

    // product variations
    getAllProductVariations: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations`,
    getSingleProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations/${variationId}`,
    createProductVariation: (productId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations`,
    updateProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations/${variationId}`,
    deleteProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/${productId}/variations/${variationId}`,

    // orders
    getAllOrders: `${SERVER_URL}/wp-json/dokan/v1/orders/`,
    getAllOrdersWithPagination: (perPage: String, pageNo: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/?per_page=${perPage}&page=${pageNo}`,
    getOrdersSummary: `${SERVER_URL}/wp-json/dokan/v1/orders/summary`,
    getSingleOrder: (orderId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}`,
    getOrdersBeforAfter: (before: String, after: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/?after=${after}&before=${before}`,
    updateOrder: (orderId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}`,

    // order notes
    getAllOrderNotes: (orderId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}/notes/`,
    getSingleOrderNote: (orderId: String, noteId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}/notes/${noteId}`,
    createOrderNote: (orderId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}/notes`,
    deleteOrderNote: (orderId: String, noteId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}/notes/${noteId}`,

    // withdraw
    getAllWithdraws: `${SERVER_URL}/wp-json/dokan/v1/withdraw/`,
    getAllWithdrawsbyStatus: (status: String) => `${SERVER_URL}/wp-json/dokan/v1/withdraw/?status=${status}`,
    getBalanceDetails: `${SERVER_URL}/wp-json/dokan/v1/withdraw/balance`,
    createWithdraw: `${SERVER_URL}/wp-json/dokan/v1/withdraw/`,
    cancelAWithdraw: (withdrawId: String) => `${SERVER_URL}/wp-json/dokan/v1/withdraw/${withdrawId}`,

    // coupons
    getAllCoupons: `${SERVER_URL}/wp-json/dokan/v1/coupons/`,
    getSingleCoupon: (couponId: String) => `${SERVER_URL}/wp-json/dokan/v1/coupons/${couponId}`,
    createCoupon: `${SERVER_URL}/wp-json/dokan/v1/coupons/?code=REST`,
    updateCoupon: (couponId: String) => `${SERVER_URL}/wp-json/dokan/v1/coupons/${couponId}`,
    deleteCoupon: (couponId: String) => `${SERVER_URL}/wp-json/dokan/v1/coupons/${couponId}`,


    // reviews
    getAllReviews: `${SERVER_URL}/wp-json/dokan/v1/reviews/`,
    getReviewSummary: `${SERVER_URL}/wp-json/dokan/v1/reviews/summary`,

    // settings
    getSettings: `${SERVER_URL}/wp-json/dokan/v1/settings`,
    updateSettings: `${SERVER_URL}/wp-json/dokan/v1/settings`,

    // reports
    getReportSummary: `${SERVER_URL}/wp-json/dokan/v1/reports/summary`,
    getReportsOverview: `${SERVER_URL}/wp-json/dokan/v1/reports/sales_overview`,
    getReportsTopEarners: (date: String) => `${SERVER_URL}/wp-json/dokan/v1/reports/top_earners?start_date=${date}`,
    getReportsTopSellingProducts: (date: String) => `${SERVER_URL}/wp-json/dokan/v1/reports/top_selling?start_date=${date}`,

    // attributes
    getAllAttributes: `${SERVER_URL}/wp-json/dokan/v1/products/attributes`,
    getSingleAttribute: (attributeId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}`,
    createAttribute: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/`,
    updateAttribute: (attributeId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}`,
    deleteAttribute: (attributeId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}`,

    // attribute terms
    getAllAttributeTerms: (attributeId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}/terms`,
    getSingleAttributeTerm: (attributeId: String, attributeTermId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`,
    createAttributeTerm: (attributeId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}/terms`,
    updateAttributeTerm: (attributeId: String, attributeTermId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`,
    deleteAttributeTerm: (attributeId: String, attributeTermId: String) => `${SERVER_URL}/wp-json/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`,

    // refund
    getAllRefund: `${SERVER_URL}/wp-json/dokan/v1/refund/`, //TODO:
    getAllRefundDependingOnStatus: `${SERVER_URL}/wp-json/dokan/v1/refund/?status=pending`, //TODO:
    makeARefundRequest: `${SERVER_URL}/wp-json/dokan/v1/refund/`, //TODO:
    changeStatusOfARefundRequest: `${SERVER_URL}/wp-json/dokan/v1/refund/5`, //TODO:
    changeBulkStatusOfRefundRequests: `${SERVER_URL}/wp-json/dokan/v1/refund/5`, //TODO:
    deleteARefundRequest: `${SERVER_URL}/wp-json/dokan/v1/refund/4`, //TODO:

    // user
    userRegitration: `${SERVER_URL}/wp-json/dokan/v1/user/register`, //TODO:
    passwordRecovery: `${SERVER_URL}/wp-json/dokan/v1/user/lostpassword`, //TODO:

    // cart
    getCartItems: `${SERVER_URL}/wp-json/dokan/v1/cart/items`, //TODO:
    postCartProduct: `${SERVER_URL}/wp-json/dokan/v1/cart/items`, //TODO:
    postBatchCartItem: `${SERVER_URL}/wp-json/dokan/v1/cart/items/batch`, //TODO:
    deleteCart: `${SERVER_URL}`, //TODO:
    deleteSingleProduct: `${SERVER_URL}`, //TODO:
    restoreCart: `${SERVER_URL}/wp-json/dokan/v1/cart/items/{key}/restore`, //TODO:
    getCartShipping: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/`, //TODO:
    addCouponsToCart: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/`, //TODO:
    getCartCoupons: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/`, //TODO:
    deleteCartCoupon: `${SERVER_URL}/wp-json/dokan/v1/cart/coupons/212`, //TODO:



    wc: {

        // customers
        getAllCustomers: `${SERVER_URL}/wp-json/wc/v3/customers`,
        getSingleCustomer: (customerId: String) => `${SERVER_URL}/wp-json/wc/v3/customers/${customerId}`,
        createCustomer: `${SERVER_URL}/wp-json/wc/v3/customers/`,
        updateCustomer: (customerId: String) => `${SERVER_URL}/wp-json/wc/v3/customers/${customerId}`,
        deleteCustomer: (customerId: String) => `${SERVER_URL}/wp-json/wc/v3/customers/${customerId}`,
        getCustomerDownloads: (customerId: String) => `${SERVER_URL}/wp-json/wc/v3/customers/${customerId}/downloads`,
        updateBatchCustomers: `${SERVER_URL}/wp-json/wc/v3/customers/batch`,

        //settings
        getAllSettingsGroups: `${SERVER_URL}/wp-json/wc/v3/settings`,
        getAllSettingOptions: (groupId: String) => `${SERVER_URL}/wp-json/wc/v3/settings/${groupId}`,
        getSingleSettingOption: (groupId: String, optionId: String) => `${SERVER_URL}/wp-json/wc/v3/settings/${groupId}/${optionId}`,
        updateSettingOption: (groupId: String, optionId: String) => `${SERVER_URL}/wp-json/wc/v3/settings/${groupId}/${optionId}`,
        updateBatchSettingOptions: (groupId: String) =>  `${SERVER_URL}/wp-json/wc/v3/settings/${groupId}/batch`,

        // tax rates
        getAllTaxRates: `${SERVER_URL}/wp-json/wc/v3/taxes`,
        getSingleTaxRate: (taxId: String) => `${SERVER_URL}/wp-json/wc/v3/taxes/${taxId}`,
        createTaxRate: `${SERVER_URL}/wp-json/wc/v3/taxes/`,
        updateTaxRate: (taxId: String) => `${SERVER_URL}/wp-json/wc/v3/taxes/${taxId}`,
        deleteTaxRate: (taxId: String) => `${SERVER_URL}/wp-json/wc/v3/taxes/${taxId}`,
        updateBatchTaxRates: `${SERVER_URL}/wp-json/wc/v3/taxes/batch`,

        // shipping zones
        getAllShippingZones: `${SERVER_URL}/wp-json/wc/v3/shipping/zones`,
        getSingleShippingZone: (zoneId: String) => `${SERVER_URL}/wp-json/wc/v3/shipping/zones/${zoneId}`,
        createShippingZone: `${SERVER_URL}/wp-json/wc/v3/shipping/zones/`,
        updateShippingZone: (zoneId: String) => `${SERVER_URL}/wp-json/wc/v3/shipping/zones/${zoneId}`,
        deleteShippingZone: (zoneId: String) => `${SERVER_URL}/wp-json/wc/v3/shipping/zones/${zoneId}`,
        // shipping zone locations   
        getAllShippingZoneLocations: (zoneId: String) => `${SERVER_URL}/wp-json/wc/v3/shipping/zones/${zoneId}/locations`,
        addShippingZoneLocation: (zoneId: String) => `${SERVER_URL}/wp-json/wc/v3/shipping/zones/${zoneId}/locations`,
        // shipping zone methods
        getAllShippingZoneMethods: (zoneId: String) => `${SERVER_URL}/wp-json/wc/v3/shipping/zones/${zoneId}/methods`,
        getSingleShippingZoneMethod: (zoneId: String, methodId: String) => `${SERVER_URL}/wp-json/wc/v3/shipping/zones/${zoneId}/methods/${methodId}`,
        addShippingZoneMethod: (zoneId: String) => `${SERVER_URL}/wp-json/wc/v3/shipping/zones/${zoneId}/methods`,
        updateShippingZoneMethod: (zoneId: String, methodId: String) => `${SERVER_URL}/wp-json/wc/v3/shipping/zones/${zoneId}/methods/${methodId}`,
        deleteShippingZoneMethod: (zoneId: String, methodId: String) => `${SERVER_URL}/wp-json/wc/v3/shipping/zones/${zoneId}/methods/${methodId}`,
        // shipping methods
        getAllShippingMethods: `${SERVER_URL}/wp-json/wc/v3/shipping_methods`,
        getSingleShippingMethod: (shippingId: String) => `${SERVER_URL}/wp-json/wc/v3/shipping_methods/${shippingId}`,

        // payment gateways 
        getAllPaymentGatways: `${SERVER_URL}/wp-json/wc/v3/payment_gateways`,
        getSinglePaymentGatway: (paymentGatewayId: String) => `${SERVER_URL}/wp-json/wc/v3/payment_gateways/${paymentGatewayId}`,
        updatePaymentGatway: (paymentGatewayId: String) => `${SERVER_URL}/wp-json/wc/v3/payment_gateways/${paymentGatewayId}`,



    },

    wp: {

        // users
        getAllUsers: `${SERVER_URL}/wp-json/wp/v2/users`,
        getAllUsersByRole: (role: String) => `${SERVER_URL}/wp-json/wp/v2/users?roles=${role}`,
        getcurrentUser: `${SERVER_URL}/wp-json/wp/v2/users/me`,
        getUserById: (userId: String) => `${SERVER_URL}/wp-json/wp/v2/users/${userId}`,
        createUser: `${SERVER_URL}/wp-json/wp/v2/users`,
        updateUser: `${SERVER_URL}/wp-json/wp/v2/users`,
        deleteUser: (userId: String) => `${SERVER_URL}/wp-json/wp/v2/users/${userId}`,

        //plugins
        getAllPlugins: `${SERVER_URL}/wp-json/wp/v2/plugins`,
        getAllPluginsByStatus: (status: String) => `${SERVER_URL}/wp-json/wp/v2/plugins?status=${status}`, 
        getSinglePlugin: (plugin: String) => `${SERVER_URL}/wp-json/wp/v2/plugins/${plugin}`,
        updatePlugin: (plugin: String) => `${SERVER_URL}/wp-json/wp/v2/plugins/${plugin}`,
        deletePlugin: (plugin: String) => `${SERVER_URL}/wp-json/wp/v2/plugins/${plugin}`,

        //settings
        getSiteSettings: `${SERVER_URL}/wp-json/wp/v2/settings`,
        setSiteSetiings: `${SERVER_URL}/wp-json/wp/v2/settings`,
    }



}