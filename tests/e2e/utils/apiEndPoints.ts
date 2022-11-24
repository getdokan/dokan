require('dotenv').config();

// const SERVER_URL = process.env.BASE_URL
// const SERVER_URL = process.env.SERVER_URL
const SERVER_URL = 'http://dokan1.test'
// const SERVER_URL = 'http://localhost:8889'


export const endPoints = {

    // stores
    getAllStores: `${SERVER_URL}/wp-json/dokan/v1/stores`,
    getSingleStoreInfo: (sellerId: string) => `${SERVER_URL}/wp-json/dokan/v1/stores/${sellerId}`,
    getSingleStoreProducts: (sellerId: string) => `${SERVER_URL}/wp-json/dokan/v1/stores/${sellerId}/products`,
    getSingleStoreReviews: (sellerId: string) => `${SERVER_URL}/wp-json/dokan/v1/stores/${sellerId}/reviews`,
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
    // settings
    getSettings: `${SERVER_URL}/wp-json/dokan/v1/settings`,
    updateSettings: `${SERVER_URL}/wp-json/dokan/v1/settings`,
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
    // reports
    getReportSummary: `${SERVER_URL}/wp-json/dokan/v1/reports/summary`,
    getReportsOverview: `${SERVER_URL}/wp-json/dokan/v1/reports/sales_overview`,
    getReportsTopEarners: (date: String) => `${SERVER_URL}/wp-json/dokan/v1/reports/top_earners?start_date=${date}`,
    getReportsTopSellingProducts: (date: String) => `${SERVER_URL}/wp-json/dokan/v1/reports/top_selling?start_date=${date}`,
    // reports
    // get: `${SERVER_URL}/wp-json/dokan/v1/reports/sales_overview`,    // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/reports/top_selling`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/reports/top_earners`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/reports/summary`,       // get
    // reviews
    getAllReviews: `${SERVER_URL}/wp-json/dokan/v1/reviews/`,
    getReviewSummary: `${SERVER_URL}/wp-json/dokan/v1/reviews/summary`,
    // reviews
    // getAllRevierws: `${SERVER_URL}/wp-json/dokan/v1/reviews`,       // get
    // getReviewsSummary: `${SERVER_URL}/wp-json/dokan/v1/reviews/summary`,       // get
    // updateReview: `${SERVER_URL}/wp-json/dokan/v1/reviews/${reviewId}`,       // post put patch 
    // store reviews
    // getAllStoreReviews: `${SERVER_URL}/wp-json/dokan/v1/store-reviews`,     // get
    // getSingleStoreReview: (reviewId: String) => `${SERVER_URL}/wp-json/dokan/v1/store-reviews/${reviewId}`,        // get 
    // updateStoreReview: (reviewId: String) => `${SERVER_URL}/wp-json/dokan/v1/store-reviews/${reviewId}`, // post put patch
    // deleteStoreReview: (reviewId: String) => `${SERVER_URL}/wp-json/dokan/v1/store-reviews/${reviewId}`, // delete
    // restoreDeletedStoreReview:(reviewId: String) =>  `${SERVER_URL}/wp-json/dokan/v1/store-reviews/${reviewId}/restore`,     //  post put patch 
    // updateBatchStoreReview: `${SERVER_URL}/wp-json/dokan/v1/store-reviews/batch`,       //  post put patch  // method: 
    // announcements
    getAllAnnouncements: `${SERVER_URL}/wp-json/dokan/v1/announcement`,      // get
    getSingleAnnouncement: (announcementId: String) => `${SERVER_URL}/wp-json/dokan/v1/announcement/${announcementId}`,        // get 
    createAnnouncement: `${SERVER_URL}/wp-json/dokan/v1/announcement`,      // post
    updateAnnouncement: (announcementId: String) => `${SERVER_URL}/wp-json/dokan/v1/announcement/${announcementId}`,        // post put patch 
    deleteAnnouncement: (announcementId: String) => `${SERVER_URL}/wp-json/dokan/v1/announcement/${announcementId}`,        // delete
    restoredeletedAnnouncement: (announcementId: String) => `${SERVER_URL}/wp-json/dokan/v1/announcement/${announcementId}/restore`,        //  post put patch 
    // updateBatchAnnouncement: `${SERVER_URL}/wp-json/dokan/v1/announcement/batch`,        // post put patch  // method: 
    // refunds
    // get: `${SERVER_URL}/wp-json/dokan/v1refunds`,        // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/refunds/<refund_id>`,       // delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/refunds/<refund_id>/approve`,       // post put patch 
    // get: `${SERVER_URL}/wp-json/dokan/v1/refunds/<refund_id>/cancel`,        // post put patch 
    // get: `${SERVER_URL}/wp-json/dokan/v1/refunds/batch`,     // post put patch  // method: 
    // follow store
    getStoreFollowStatus: (sellerId: String) => `${SERVER_URL}/wp-json/dokan/v1/follow-store?vendor_id=${sellerId}`,      // get 
    followUnfollowStore: `${SERVER_URL}/wp-json/dokan/v1/follow-store`,      // post
    // abuse reports
    getAllAbuseReportReasons: `${SERVER_URL}/wp-json/dokan/v1/abuse-reports/abuse-reasons`,       // get 
    getAllAbuseReports: `${SERVER_URL}/wp-json/dokan/v1/abuse-reports`,     // get 
    deleteAbuseReport: (abuseReportId: String) => `${SERVER_URL}/wp-json/dokan/v1/abuse-reports/${abuseReportId}`,       // delete 
    // deleteBatchAbuseReports: `${SERVER_URL}/wp-json/dokan/v1/abuse-reports/batch`,       //  delete  // method: 
    // product advertisements
    getAllProductAdvertisementStores: `${SERVER_URL}/wp-json/dokan/v1/product_adv/stores`,  // get
    getAllProductAdvertisements: `${SERVER_URL}/wp-json/dokan/v1/product_adv`,  //  get 
    createProductAdvertisement: `${SERVER_URL}/wp-json/dokan/v1/product_adv/create`,  // post
    expireProductAdvertisement: (productAdvertisementId: String) => `${SERVER_URL}/wp-json/dokan/v1/product_adv/${productAdvertisementId}/expire`,  //  post put patch  
    deleteProductAdvertisement: (productAdvertisementId: String) => `${SERVER_URL}/wp-json/dokan/v1/product_adv/${productAdvertisementId}`,  //  delete
    updateBatchProductAdvertisements: `${SERVER_URL}/wp-json/dokan/v1/product_adv/batch`,  // post put patch  // method: 
    // wholesale customers 
    getAllWholesaleCustomers: `${SERVER_URL}/wp-json/dokan/v1/wholesale/customers`,     // get
    createWholesaleCustomer: `${SERVER_URL}/wp-json/dokan/v1/wholesale/register/`,  // post
    updateWholesaleCustomer: (wholesaleCustomerId: String) => `${SERVER_URL}/wp-json/dokan/v1/wholesale/customer/${wholesaleCustomerId}`,       // post put patch
    // updateBatchWholesaleCustomer: `${SERVER_URL}/wp-json/dokan/v1/wholesale/customers/batch`,        // post put patch   // method: 
    // customers
    getAllCustomers: `${SERVER_URL}/wp-json/dokan/v1/customers`, // get
    getSingleCustomer: (customerId: String) => `${SERVER_URL}/wp-json/dokan/v1/customers/${customerId}`, // get
    createCustomer: `${SERVER_URL}/wp-json/dokan/v1/customers/`, // post
    updateCustomer: (customerId: String) => `${SERVER_URL}/wp-json/dokan/v1/customers/${customerId}`,   // post put patch
    deleteCustomer: (customerId: String) => `${SERVER_URL}/wp-json/dokan/v1/customers/${customerId}?force=true`, //delete
    // updateBatchCustomers: `${SERVER_URL}/wp-json/dokan/v1/customers/batch`, // post put patch  // method: 
    // // request quotes
    // getAllQuoteRules: `${SERVER_URL}/wp-json/dokan/v1/dokan-quote-rule/`,
    // getSingleQuoteRule: (quoteId: String) => `${SERVER_URL}/wp-json/dokan/v1/dokan-quote-rule/${quoteId}`,
    // createlQuoteRules: `${SERVER_URL}/wp-json/dokan/v1/dokan-quote-rule/`,
    // updateQuoteRule: (quoteId: String) => `${SERVER_URL}/wp-json/dokan/v1/dokan-quote-rule/${quoteId}`,
    // deleteQuoteRule: (quoteId: String) => `${SERVER_URL}/wp-json/dokan/v1/dokan-quote-rule/${quoteId}`,
    // restoreQuoteRule: (quoteId: String) => `${SERVER_URL}/wp-json/dokan/v1/dokan-quote-rule/${quoteId}/restore`,
    // updateBatchQuoteRules: `${SERVER_URL}/wp-json/dokan/v1/dokan-quote-rule/batch`, // method: 
    // getAllRequestQuotes: `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote`,
    // getSingleRequestQuote: (quoteRequestId: String) => `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote/${quoteRequestId}`,
    // createRequestQuote: `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote/`,
    // updateRequestQuote: (quoteRequestId: String) => `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote/${quoteRequestId}`,
    // deleteRequestQuote: (quoteRequestId: String) => `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote/${quoteRequestId}`,
    // restoreRequestQuote: (quoteRequestId: String) => `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote/(${quoteRequestId}/restore`,
    // updateBatchRequestQuotes: `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote/batch`,  // method: 
    // convertRequestQuoteToOrder: `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote/convert-to-order`,
    // roles
    getAllUserRoles: `${SERVER_URL}/wp-json/dokan/v1/roles`,    // get
    // reverse withdrawal
    getReverseWithdrawalTransactionTypes: `${SERVER_URL}/wp-json/dokan/v1/reverse-withdrawal/transaction-types`,       // get
    getAllReverseWithdrawalStores: `${SERVER_URL}/wp-json/dokan/v1/reverse-withdrawal/stores`,     // get
    getAllReverseWithdrawalStoreBalance: `${SERVER_URL}/wp-json/dokan/v1/reverse-withdrawal/stores-balance`,     // get
    getAllReverseWithdrawalTransactions: (sellerId: String, dateFrom: String, dateTo: String) => `${SERVER_URL}/wp-json/dokan/v1/reverse-withdrawal/transactions/${sellerId}?trn_date[from]=${dateFrom}&trn_date[to]=${dateTo}&vendor_id=${sellerId}`,       // get
    // modules
    getAllModules: `${SERVER_URL}/wp-json/dokan/v1/admin/modules`,       //get
    activateModule: `${SERVER_URL}/wp-json/dokan/v1/admin/modules/activate`,         // post put patch 
    deactivateModule: `${SERVER_URL}/wp-json/dokan/v1/admin/modules/deactivate`,        //  post put patch 
    // support tickets 
    getAllSupportTicketCustomers: `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/customers`,      // get
    getAllSupportTickets: `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket`,        // get
    getSingleSupportTicket: (supportTicketId: String, vendorId: String) => `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/${supportTicketId}?vendor_id=${vendorId}`,        // get 
    createSupportTicketComment: (supportTicketId: String) => `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/${supportTicketId}`,        // post
    updateSupportTicketStatus: (supportTicketId: String) => `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/${supportTicketId}/status`,        // post
    updateSupportTicketEmailNotification: (supportTicketId: String) => `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/${supportTicketId}/email-notification`,         // post
    deleteSupportTicketComment: (supportTicketId: String) => `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/${supportTicketId}/comment`,        // delete
    updateBatchSupportTickets: `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/batch`,      // post put patch   // method: close
    //admin
    getAdminReportSummary: `${SERVER_URL}/wp-json/dokan/v1/admin/report/summary`,    //get
    getAdminReportOverview: `${SERVER_URL}/wp-json/dokan/v1/admin/report/overview`,     //get


















    // refund
    getAllRefunds: `${SERVER_URL}/wp-json/dokan/v1/refunds/`,
    getAllRefundsByStatus: (status: String) => `${SERVER_URL}/wp-json/dokan/v1/refunds/?status=${status}`,
    // getSingleRefund:  (refundId: String) => `${SERVER_URL}/wp-json/dokan/v1/refunds/${refundId}`,
    makeARefundRequest: `${SERVER_URL}/wp-json/dokan/v1/refunds/`, //TODO:
    changeStatusOfARefundRequest: (refundId: String) => `${SERVER_URL}/wp-json/dokan/v1/refunds/${refundId}`, //TODO:
    changeBulkStatusOfRefundRequests: (refundId: String) => `${SERVER_URL}/wp-json/dokan/v1/refunds/${refundId}`, //TODO:
    deleteRefundRequest: (refundId: String) => `${SERVER_URL}/wp-json/dokan/v1/refunds/${refundId}`, //TODO:

    // getSingleRefund: (orderId: String, refundId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}/refunds/${refundId}`,
    // createRefund: (orderId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}/refunds`,
    // deleteRefund: (orderId: String, refundId: String) => `${SERVER_URL}/wp-json/dokan/v1/orders/${orderId}/refunds/${refundId}`,

    // user
    users: `${SERVER_URL}/wp-json/dokan/v1/user/`, //TODO:
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

        // coupons
        getAllCoupons: `${SERVER_URL}/wp-json/wc/v3/coupons`,
        getSingleCoupon: (couponId: String) => `${SERVER_URL}/wp-json/wc/v3/coupons/${couponId}`,
        createCoupon: `${SERVER_URL}/wp-json/wc/v3/customers/`,
        updateCoupon: (couponId: String) => `${SERVER_URL}/wp-json/wc/v3/coupons/${couponId}`,
        deleteCoupon: (couponId: String) => `${SERVER_URL}/wp-json/wc/v3/coupons/${couponId}`,
        updateBatchCoupons: `${SERVER_URL}/wp-json/wc/v3/coupons/batch`,

        // customers
        getAllCustomers: `${SERVER_URL}/wp-json/wc/v3/customers`,
        getSingleCustomer: (customerId: String) => `${SERVER_URL}/wp-json/wc/v3/customers/${customerId}`,
        createCustomer: `${SERVER_URL}/wp-json/wc/v3/customers/`,
        updateCustomer: (customerId: String) => `${SERVER_URL}/wp-json/wc/v3/customers/${customerId}`,
        deleteCustomer: (customerId: String) => `${SERVER_URL}/wp-json/wc/v3/customers/${customerId}`,
        getCustomerDownloads: (customerId: String) => `${SERVER_URL}/wp-json/wc/v3/customers/${customerId}/downloads`,
        updateBatchCustomers: `${SERVER_URL}/wp-json/wc/v3/customers/batch`,

        // orders
        getAllOrders: `${SERVER_URL}/wp-json/wc/v3/orders`,
        getSingleOrder: (orderId: String) => `${SERVER_URL}/wp-json/wc/v3/orders/${orderId}`,
        createOrder: `${SERVER_URL}/wp-json/wc/v3/customers/`,
        updateOrder: (orderId: String) => `${SERVER_URL}/wp-json/wc/v3/orders/${orderId}`,
        deleteOrder: (orderId: String) => `${SERVER_URL}/wp-json/wc/v3/orders/${orderId}`,
        updateBatchOrders: `${SERVER_URL}/wp-json/wc/v3/orders/batch`,

        // order notes
        getAllOrderNotes: (orderId: String) => `${SERVER_URL}/wp-json/wc/v3/orders/${orderId}/notes/`,
        getSingleOrderNote: (orderId: String, noteId: String) => `${SERVER_URL}/wp-json/wc/v3/orders/${orderId}/notes/${noteId}`,
        createOrderNote: (orderId: String) => `${SERVER_URL}/wp-json/wc/v3/orders/${orderId}/notes`,
        deleteOrderNote: (orderId: String, noteId: String) => `${SERVER_URL}/wp-json/wc/v3/orders/${orderId}/notes/${noteId}`,

        // refunds
        getAllRefunds: (orderId: String) => `${SERVER_URL}/wp-json/wc/v3/orders/${orderId}/refunds/`,
        getSingleRefund: (orderId: String, refundId: String) => `${SERVER_URL}/wp-json/wc/v3/orders/${orderId}/refunds/${refundId}`,
        createRefund: (orderId: String) => `${SERVER_URL}/wp-json/wc/v3/orders/${orderId}/refunds`,
        deleteRefund: (orderId: String, refundId: String) => `${SERVER_URL}/wp-json/wc/v3/orders/${orderId}/refunds/${refundId}`,

        // products
        getAllProducts: `${SERVER_URL}/wp-json/wc/v3/products/`,
        getSingleProduct: (productId: String) => `${SERVER_URL}/wp-json/wc/v3/products/${productId}`,
        getProductsWithPagination: (perPage: String, pageNo: String) => `${SERVER_URL}/wp-json/wc/v3/products/?per_page=${perPage}&page=${pageNo}`,
        createProduct: `${SERVER_URL}/wp-json/wc/v3/products/`,
        updateProduct: (productId: String) => `${SERVER_URL}/wp-json/wc/v3/products/${productId}`,
        deleteProduct: (productId: String) => `${SERVER_URL}/wp-json/wc/v3/products/${productId}`,
        updateBatchProducts: `${SERVER_URL}/wp-json/wc/v3/products/batch`,

        // product variations
        getAllProductVariations: (productId: String) => `${SERVER_URL}/wp-json/wc/v3/products/${productId}/variations`,
        getSingleProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
        createProductVariation: (productId: String) => `${SERVER_URL}/wp-json/wc/v3/products/${productId}/variations`,
        updateProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
        deleteProductVariation: (productId: String, variationId: String) => `${SERVER_URL}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
        updateBatchProductVariations: (productId: String) => `${SERVER_URL}/wp-json/wc/v3/products/${productId}/variations/batch`,

        // product attributes
        getAllAttributes: `${SERVER_URL}/wp-json/wc/v3/products/attributes`,
        getSingleAttribute: (attributeId: String) => `${SERVER_URL}/wp-json/wc/v3/products/attributes/${attributeId}`,
        createAttribute: `${SERVER_URL}/wp-json/wc/v3/products/attributes/`,
        updateAttribute: (attributeId: String) => `${SERVER_URL}/wp-json/wc/v3/products/attributes/${attributeId}`,
        deleteAttribute: (attributeId: String) => `${SERVER_URL}/wp-json/wc/v3/products/attributes/${attributeId}`,
        updateBatchAttributes: `${SERVER_URL}/wp-json/wc/v3/products/attributes/batch`,

        // product attribute terms
        getAllAttributeTerms: (attributeId: String) => `${SERVER_URL}/wp-json/wc/v3/products/attributes/${attributeId}/terms`,
        getSingleAttributeTerm: (attributeId: String, attributeTermId: String) => `${SERVER_URL}/wp-json/wc/v3/products/attributes/${attributeId}/terms/${attributeTermId}`,
        createAttributeTerm: (attributeId: String) => `${SERVER_URL}/wp-json/wc/v3/products/attributes/${attributeId}/terms`,
        updateAttributeTerm: (attributeId: String, attributeTermId: String) => `${SERVER_URL}/wp-json/wc/v3/products/attributes/${attributeId}/terms/${attributeTermId}`,
        deleteAttributeTerm: (attributeId: String, attributeTermId: String) => `${SERVER_URL}/wp-json/wc/v3/products/attributes/${attributeId}/terms/${attributeTermId}`,
        updateBatchAttributeTerms: (attributeId: String) => `${SERVER_URL}/wp-json/wc/v3/products/attributes/${attributeId}/terms/batch`,

        // product categories
        getAllCategories: `${SERVER_URL}/wp-json/wc/v3/products/categories`,
        getSingleCategory: (categoryId: String) => `${SERVER_URL}/wp-json/wc/v3/products/categories/${categoryId}`,
        createCategory: `${SERVER_URL}/wp-json/wc/v3/products/categories/`,
        updateCategory: (categoryId: String) => `${SERVER_URL}/wp-json/wc/v3/products/categories/${categoryId}`,
        deleteCategory: (categoryId: String) => `${SERVER_URL}/wp-json/wc/v3/products/categories/${categoryId}`,
        updateBatchCategories: `${SERVER_URL}/wp-json/wc/v3/products/categories/batch`,

        // product shippping class
        getAllShippingClasses: `${SERVER_URL}/wp-json/wc/v3/products/shipping_classes`,
        getSingleShippingClass: (shippingClassId: String) => `${SERVER_URL}/wp-json/wc/v3/products/shipping_classes/${shippingClassId}`,
        createShippingClass: `${SERVER_URL}/wp-json/wc/v3/products/shipping_classes/`,
        updateShippingClass: (shippingClassId: String) => `${SERVER_URL}/wp-json/wc/v3/products/shipping_classes/${shippingClassId}`,
        deleteShippingClass: (shippingClassId: String) => `${SERVER_URL}/wp-json/wc/v3/products/shipping_classes/${shippingClassId}`,
        updateBatchShippingClasse: `${SERVER_URL}/wp-json/wc/v3/products/shipping_classes/batch`,

        // product tags
        getAllTags: `${SERVER_URL}/wp-json/wc/v3/products/tags`,
        getSingleTag: (tagId: String) => `${SERVER_URL}/wp-json/wc/v3/products/tags/${tagId}`,
        createTag: `${SERVER_URL}/wp-json/wc/v3/products/tags/`,
        updateTag: (tagId: String) => `${SERVER_URL}/wp-json/wc/v3/products/tags/${tagId}`,
        deleteTag: (tagId: String) => `${SERVER_URL}/wp-json/wc/v3/products/tags/${tagId}`,
        updateBatchTag: `${SERVER_URL}/wp-json/wc/v3/products/tags/batch`,

        // product reviews
        getAllReviews: `${SERVER_URL}/wp-json/wc/v3/products/reviews`,
        getSingleReview: (reviewId: String) => `${SERVER_URL}/wp-json/wc/v3/products/reviews/${reviewId}`,
        createReview: `${SERVER_URL}/wp-json/wc/v3/products/reviews/`,
        updateReview: (reviewId: String) => `${SERVER_URL}/wp-json/wc/v3/products/reviews/${reviewId}`,
        deleteReview: (reviewId: String) => `${SERVER_URL}/wp-json/wc/v3/products/reviews/${reviewId}`,
        updateBatchReview: `${SERVER_URL}/wp-json/wc/v3/products/reviews/batch`,

        // reports
        getAllReports: `${SERVER_URL}/wp-json/wc/v3/reports/`,
        getSalesReport: `${SERVER_URL}/wp-json/wc/v3/reports/sales`,
        getTopSellersReport: `${SERVER_URL}/wp-json/wc/v3/reports/top_sellers`,
        getCouponstotalsReport: `${SERVER_URL}/wp-json/wc/v3/reports/coupons/totals`,
        getCustomerstotalsReport: `${SERVER_URL}/wp-json/wc/v3/reports/customers/totals`,
        getOrderstotalsReport: `${SERVER_URL}/wp-json/wc/v3/reports/orders/totals`,
        getProductstotalsReport: `${SERVER_URL}/wp-json/wc/v3/reports/products/totals`,
        getReviewstotalsReport: `${SERVER_URL}/wp-json/wc/v3/reports/reviews/totals`,

        // tax rates
        getAllTaxRates: `${SERVER_URL}/wp-json/wc/v3/taxes`,
        getSingleTaxRate: (taxId: String) => `${SERVER_URL}/wp-json/wc/v3/taxes/${taxId}`,
        createTaxRate: `${SERVER_URL}/wp-json/wc/v3/taxes/`,
        updateTaxRate: (taxId: String) => `${SERVER_URL}/wp-json/wc/v3/taxes/${taxId}`,
        deleteTaxRate: (taxId: String) => `${SERVER_URL}/wp-json/wc/v3/taxes/${taxId}`,
        updateBatchTaxRates: `${SERVER_URL}/wp-json/wc/v3/taxes/batch`,

        // tax classes
        getAllTaxClasses: `${SERVER_URL}/wp-json/wc/v3/taxes/classes`,
        createTaxClass: `${SERVER_URL}/wp-json/wc/v3/taxes/classes`,
        deleteTaxClass: (slug: String) => `${SERVER_URL}/wp-json/wc/v3/taxes/classes/${slug}`,

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

        //settings
        getAllSettingsGroups: `${SERVER_URL}/wp-json/wc/v3/settings`,
        getAllSettingOptions: (groupId: String) => `${SERVER_URL}/wp-json/wc/v3/settings/${groupId}`,
        getSingleSettingOption: (groupId: String, optionId: String) => `${SERVER_URL}/wp-json/wc/v3/settings/${groupId}/${optionId}`,
        updateSettingOption: (groupId: String, optionId: String) => `${SERVER_URL}/wp-json/wc/v3/settings/${groupId}/${optionId}`,
        updateBatchSettingOptions: (groupId: String) => `${SERVER_URL}/wp-json/wc/v3/settings/${groupId}/batch`,

        // systerm status
        getAllSystemStatus: `${SERVER_URL}/wp-json/wc/v3/system_status`

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

        //media
        getAllMediaItmes: `${SERVER_URL}/wp-json/wp/v2/media`,
        getSingleMediaItem: (mediaId: String) => `${SERVER_URL}/wp-json/wp/v2/media/${mediaId}`,
        createMediaItem: `${SERVER_URL}/wp-json/wp/v2/media`,
        updateMediaItem: (mediaId: String) => `${SERVER_URL}/wp-json/wp/v2/media/${mediaId}`,
        deleteMediaItem: (mediaId: String) => `${SERVER_URL}/wp-json/wp/v2/media/${mediaId}`,

        //settings
        getSiteSettings: `${SERVER_URL}/wp-json/wp/v2/settings`,
        setSiteSetiings: `${SERVER_URL}/wp-json/wp/v2/settings`,
    }



}